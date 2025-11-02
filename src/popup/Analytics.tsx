/**
 * PRISM Analytics Dashboard
 * Phase 3.4: Enhanced UI - Analytics & Trends
 */

import React, { useState, useEffect } from 'react';

interface AnalyticsData {
  trackerTimeline: { timestamp: number; count: number }[];
  scoreHistory: { date: string; score: number }[];
  topTrackers: { domain: string; count: number }[];
  privacyTrends: {
    trackers: number;
    cookies: number;
    threats: number;
    improvement: number;
  };
  siteStats: {
    sitesVisited: number;
    averageScore: number;
    totalBlocked: number;
  };
}

interface AnalyticsProps {
  onClose: () => void;
  currentDomain?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ onClose, currentDomain }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    trackerTimeline: [],
    scoreHistory: [],
    topTrackers: [],
    privacyTrends: {
      trackers: 0,
      cookies: 0,
      threats: 0,
      improvement: 0
    },
    siteStats: {
      sitesVisited: 0,
      averageScore: 0,
      totalBlocked: 0
    }
  });

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      // Get global stats
      const statsResponse = await chrome.runtime.sendMessage({ type: 'GET_GLOBAL_STATS' });
      
      // Get score history
      const scoreHistoryResponse = await chrome.runtime.sendMessage({ type: 'GET_SCORE_HISTORY' });
      
      // Get tracker timeline
      const trackerTimelineResponse = await chrome.runtime.sendMessage({ type: 'GET_TRACKER_TIMELINE' });
      
      // Get top blocked domains
      const topBlockedResponse = await chrome.runtime.sendMessage({ type: 'GET_TOP_BLOCKED_DOMAINS', limit: 5 });
      
      // Get average score
      const avgScoreResponse = await chrome.runtime.sendMessage({ type: 'GET_AVERAGE_SCORE' });
      
      if (statsResponse?.status === 'OK') {
        const globalStats = statsResponse.data;
        const scoreHistory = scoreHistoryResponse?.data || [];
        const trackerTimeline = trackerTimelineResponse?.data || [];
        const topTrackers = topBlockedResponse?.data || [];
        const averageScore = avgScoreResponse?.data || 0;
        
        // Calculate improvement from score history
        const improvement = scoreHistory.length > 1
          ? scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score
          : 0;

        // Format score history for display
        const formattedScoreHistory = scoreHistory.map((entry: any) => ({
          date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score: entry.score
        }));

        setAnalytics({
          trackerTimeline,
          scoreHistory: formattedScoreHistory,
          topTrackers: topTrackers.length > 0 ? topTrackers : [
            { domain: 'No trackers blocked yet', count: 0 }
          ],
          privacyTrends: {
            trackers: globalStats.totalTrackersBlocked,
            cookies: globalStats.totalCookiesManaged,
            threats: globalStats.totalThreatsDetected,
            improvement
          },
          siteStats: {
            sitesVisited: globalStats.sitesVisited,
            averageScore: averageScore || 0,
            totalBlocked: globalStats.totalTrackersBlocked
          }
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const exportData = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    
    try {
      // Get all stats
      const statsResponse = await chrome.runtime.sendMessage({ type: 'GET_GLOBAL_STATS' });
      const siteStatsResponse = await chrome.storage.local.get('prism_site_stats');
      
      const exportData = {
        timestamp: new Date().toISOString(),
        globalStats: statsResponse.data,
        siteStats: siteStatsResponse.prism_site_stats || {},
        analytics: analytics
      };

      let content: string;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        content = JSON.stringify(exportData, null, 2);
        filename = `prism-report-${Date.now()}.json`;
        mimeType = 'application/json';
      } else {
        // CSV format
        content = generateCSV(exportData);
        filename = `prism-report-${Date.now()}.csv`;
        mimeType = 'text/csv';
      }

      // Create download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => setIsExporting(false), 1000);
    } catch (error) {
      console.error('Export failed:', error);
      setIsExporting(false);
    }
  };

  const generateCSV = (data: any): string => {
    const lines = [
      'PRISM Privacy Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Global Statistics',
      'Metric,Value',
      `Total Trackers Blocked,${data.globalStats.totalTrackersBlocked}`,
      `Total Cookies Managed,${data.globalStats.totalCookiesManaged}`,
      `Total Threats Detected,${data.globalStats.totalThreatsDetected}`,
      `Sites Visited,${data.globalStats.sitesVisited}`,
      '',
      'Top Blocked Trackers',
      'Domain,Count',
      ...analytics.topTrackers.map(t => `${t.domain},${t.count}`),
      ''
    ];
    
    return lines.join('\n');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="20" x2="12" y2="10"/>
                    <line x1="18" y1="20" x2="18" y2="4"/>
                    <line x1="6" y1="20" x2="6" y2="16"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Analytics Dashboard</h1>
                  <p className="text-xs text-slate-400">Privacy insights and trends</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportData('json')}
                  disabled={isExporting}
                  className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-300 transition-all disabled:opacity-50"
                >
                  {isExporting ? 'Exporting...' : 'Export JSON'}
                </button>
                <button
                  onClick={() => exportData('csv')}
                  disabled={isExporting}
                  className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-xs font-medium text-emerald-300 transition-all disabled:opacity-50"
                >
                  Export CSV
                </button>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2">
              {(['24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-700/30 text-slate-400 hover:bg-slate-600/30'
                  }`}
                >
                  {range === '24h' && 'Last 24 Hours'}
                  {range === '7d' && 'Last 7 Days'}
                  {range === '30d' && 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <StatCard
              label="Sites Visited"
              value={analytics.siteStats.sitesVisited}
              icon="globe"
              color="blue"
            />
            <StatCard
              label="Average Score"
              value={analytics.siteStats.averageScore}
              icon="star"
              color="emerald"
            />
            <StatCard
              label="Total Blocked"
              value={analytics.siteStats.totalBlocked}
              icon="shield"
              color="red"
            />
          </div>

          {/* Privacy Trends */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 mb-4">
            <h2 className="text-sm font-semibold text-white mb-4">Privacy Trends</h2>
            <div className="grid grid-cols-2 gap-4">
              <TrendCard
                label="Trackers Blocked"
                value={analytics.privacyTrends.trackers}
                trend={15}
                icon="block"
              />
              <TrendCard
                label="Cookies Managed"
                value={analytics.privacyTrends.cookies}
                trend={8}
                icon="cookie"
              />
              <TrendCard
                label="Threats Detected"
                value={analytics.privacyTrends.threats}
                trend={-12}
                icon="alert"
              />
              <TrendCard
                label="Score Improvement"
                value={Math.round(analytics.privacyTrends.improvement)}
                trend={analytics.privacyTrends.improvement}
                icon="trend"
              />
            </div>
          </div>

          {/* Score History Graph */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 mb-4">
            <h2 className="text-sm font-semibold text-white mb-4">Privacy Score Trend</h2>
            <div className="h-48 flex items-end justify-between gap-2">
              {analytics.scoreHistory.length > 0 ? (
                analytics.scoreHistory.map((entry, index) => {
                  const height = (entry.score / 100) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-700/30 rounded-t relative" style={{ height: '192px' }}>
                        <div
                          className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t transition-all"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{entry.date}</span>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                  No data available yet. Use PRISM for a few days to see trends.
                </div>
              )}
            </div>
          </div>

          {/* Top Blocked Trackers */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white mb-4">Most Blocked Trackers</h2>
            <div className="space-y-3">
              {analytics.topTrackers.map((tracker, index) => (
                <div key={tracker.domain} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{tracker.domain}</p>
                    <div className="w-full h-1.5 bg-slate-700/50 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                        style={{ width: `${(tracker.count / analytics.topTrackers[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-red-400">{tracker.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-red-500/10 text-red-400'
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4">
      <div className={`w-10 h-10 ${colorClasses[color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-3`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
};

// Trend Card Component
interface TrendCardProps {
  label: string;
  value: number;
  trend: number;
  icon: string;
}

const TrendCard: React.FC<TrendCardProps> = ({ label, value, trend, icon }) => {
  const isPositive = trend > 0;
  
  return (
    <div className="bg-slate-700/20 border border-slate-600/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{label}</span>
        <span className={`text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      </div>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  );
};

export default Analytics;
