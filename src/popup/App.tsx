/**
 * PRISM Main Popup Component
 * Premium Classy UI Design
 */

import React, { useState, useEffect } from 'react';
import Settings from './Settings';
import Analytics from './Analytics';

// Icon Components
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

const CookieIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
    <circle cx="8.5" cy="8.5" r="0.5" fill="currentColor"/>
    <circle cx="12" cy="12" r="0.5" fill="currentColor"/>
    <circle cx="8" cy="14" r="0.5" fill="currentColor"/>
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

// Risk Level Icons
const ExcellentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const GoodIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const ModerateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

const PoorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
  </svg>
);

const CriticalIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
  </svg>
);

interface ExtensionStatus {
  active: boolean;
  version: string;
  installDate?: string;
  phase: number;
}

interface TabInfo {
  url: string;
  domain: string;
  protocol: string;
  title?: string;
}

interface SecurityMetrics {
  overallScore: number;
  trackersBlocked: number;
  cookiesManaged: number;
  requestsAnalyzed: number;
  malwareThreats: number;
  privacyRating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
}

interface SecurityReport {
  hasSSL: boolean;
  protocol: string;
  privacyPolicyFound: boolean;
  thirdPartyScripts: number;
  mixedContent: boolean;
  dataCollectionLevel: 'Minimal' | 'Moderate' | 'High' | 'Excessive';
}

const App: React.FC = () => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [extensionData, setExtensionData] = useState<ExtensionStatus | null>(null);
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [trustLevel, setTrustLevel] = useState<'trusted' | 'blocked' | 'unknown'>('unknown');
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [blockingEnabled, setBlockingEnabled] = useState(true);
  const [securityReport, setSecurityReport] = useState<SecurityReport>({
    hasSSL: true,
    protocol: 'https:',
    privacyPolicyFound: false,
    thirdPartyScripts: 0,
    mixedContent: false,
    dataCollectionLevel: 'Minimal'
  });
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    overallScore: 100,
    trackersBlocked: 0,
    cookiesManaged: 0,
    requestsAnalyzed: 0,
    malwareThreats: 0,
    privacyRating: 'Excellent'
  });

  useEffect(() => {
    initializeExtension();
    calculateSecurityMetrics();
    loadToggleStates();
    
    // Listen for stats updates
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'STATS_UPDATED') {
        loadRealTimeStats();
      }
    });

    // Poll for stats every 2 seconds to ensure real-time updates
    const statsInterval = setInterval(() => {
      loadRealTimeStats();
    }, 2000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(statsInterval);
    };
  }, []);

  const loadToggleStates = async () => {
    try {
      const result = await chrome.storage.local.get(['extensionEnabled', 'blockingEnabled']);
      setExtensionEnabled(result.extensionEnabled !== false); // Default true
      setBlockingEnabled(result.blockingEnabled !== false); // Default true
    } catch (error) {
      console.error('Failed to load toggle states:', error);
    }
  };

  const loadRealTimeStats = async () => {
    try {
      // Get current tab info
      const tabResponse = await chrome.runtime.sendMessage({ type: 'GET_TAB_INFO' });
      if (tabResponse?.status === 'OK' && tabResponse.data) {
        const domain = tabResponse.data.domain;
        
        // Get trust level for current domain
        const trustResponse = await chrome.runtime.sendMessage({ 
          type: 'GET_TRUST_LEVEL',
          domain 
        });
        if (trustResponse?.status === 'OK') {
          setTrustLevel(trustResponse.data);
        }
        
        // Get site-specific stats
        const statsResponse = await chrome.runtime.sendMessage({ 
          type: 'GET_SITE_STATS',
          domain 
        });
        
        if (statsResponse?.status === 'OK') {
          const siteData = statsResponse.data;
          // If no stats exist for this site, it will be null - that's OK, show zeros
          const score = siteData?.securityScore ?? 100;
          const trackers = siteData?.trackersBlocked ?? 0;
          const cookies = siteData?.cookiesBlocked ?? 0;
          const requests = siteData?.requestsAnalyzed ?? 0;
          const threats = siteData?.threatsDetected ?? 0;
          const thirdParty = siteData?.thirdPartyScripts ?? 0;
          const hasSSL = tabResponse.data.protocol === 'https:';
          const privacyPolicy = siteData?.privacyPolicyFound ?? false;
          const mixedContent = siteData?.mixedContent ?? false;
          
          // Calculate data collection level based on trackers + cookies + third-party
          const dataScore = trackers + cookies + Math.floor(thirdParty / 2);
          let dataLevel: 'Minimal' | 'Moderate' | 'High' | 'Excessive' = 'Minimal';
          if (dataScore > 100) dataLevel = 'Excessive';
          else if (dataScore > 50) dataLevel = 'High';
          else if (dataScore > 20) dataLevel = 'Moderate';
          
          console.log('📊 Stats loaded:', { domain, score, trackers, cookies, requests, threats, thirdParty, hasSSL, privacyPolicy, mixedContent });
          
          setMetrics({
            overallScore: score,
            trackersBlocked: trackers,
            cookiesManaged: cookies,
            requestsAnalyzed: requests,
            malwareThreats: threats,
            privacyRating: getScoreRating(score) as any
          });
          
          setSecurityReport({
            hasSSL,
            protocol: tabResponse.data.protocol,
            privacyPolicyFound: privacyPolicy,
            thirdPartyScripts: thirdParty,
            mixedContent,
            dataCollectionLevel: dataLevel
          });
        }
      }
    } catch (error) {
      console.error('Failed to load real-time stats:', error);
    }
  };

  const calculateSecurityMetrics = () => {
    loadRealTimeStats();
  };

  const initializeExtension = async () => {
    setIsLoading(true);
    await Promise.all([
      testConnection(),
      loadExtensionData(),
      loadTabInfo()
    ]);
    setIsLoading(false);
  };

  const testConnection = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'PING' });
      if (response?.status === 'OK') {
        setConnectionStatus('connected');
        setStatus('Active & Protected');
      } else {
        setConnectionStatus('error');
        setStatus('Connection Error');
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatus('Extension Error');
      console.error('Connection test failed:', error);
    }
  };

  const loadExtensionData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });
      if (response?.status === 'OK') {
        setExtensionData(response.data);
      }
    } catch (error) {
      console.error('Failed to load extension data:', error);
    }
  };

  const loadTabInfo = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_TAB_INFO' });
      if (response?.status === 'OK') {
        setTabInfo(response.data);
      }
    } catch (error) {
      console.error('Failed to load tab info:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Excellent - Green
    if (score >= 70) return '#3b82f6'; // Good - Blue
    if (score >= 50) return '#f59e0b'; // Fair - Amber
    return '#ef4444'; // Poor - Red
  };

  const getScoreRating = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Critical';
  };

  const getRiskLevelDetails = (score: number) => {
    if (score >= 90) {
      return {
        level: 'Excellent',
        icon: <ExcellentIcon />,
        bgColor: 'from-emerald-500/20 to-green-500/20',
        borderColor: 'border-emerald-500/40',
        textColor: 'text-emerald-300',
        description: 'Outstanding security'
      };
    }
    if (score >= 70) {
      return {
        level: 'Good',
        icon: <GoodIcon />,
        bgColor: 'from-blue-500/20 to-cyan-500/20',
        borderColor: 'border-blue-500/40',
        textColor: 'text-blue-300',
        description: 'Strong protection'
      };
    }
    if (score >= 50) {
      return {
        level: 'Moderate',
        icon: <ModerateIcon />,
        bgColor: 'from-yellow-500/20 to-amber-500/20',
        borderColor: 'border-yellow-500/40',
        textColor: 'text-yellow-300',
        description: 'Adequate security'
      };
    }
    if (score >= 30) {
      return {
        level: 'Poor',
        icon: <PoorIcon />,
        bgColor: 'from-orange-500/20 to-red-500/20',
        borderColor: 'border-orange-500/40',
        textColor: 'text-orange-300',
        description: 'Weak protection'
      };
    }
    return {
      level: 'Critical',
      icon: <CriticalIcon />,
      bgColor: 'from-red-500/20 to-rose-500/20',
      borderColor: 'border-red-500/40',
      textColor: 'text-red-300',
      description: 'High risk detected'
    };
  };

  const toggleTrust = async () => {
    if (!tabInfo?.domain) return;

    try {
      if (trustLevel === 'trusted') {
        // Remove from trusted
        await chrome.runtime.sendMessage({
          type: 'REMOVE_TRUSTED_SITE',
          domain: tabInfo.domain
        });
        setTrustLevel('unknown');
      } else if (trustLevel === 'blocked') {
        // Remove from blocked and add to trusted
        await chrome.runtime.sendMessage({
          type: 'REMOVE_BLOCKED_SITE',
          domain: tabInfo.domain
        });
        await chrome.runtime.sendMessage({
          type: 'ADD_TRUSTED_SITE',
          domain: tabInfo.domain,
          reason: 'User marked as trusted'
        });
        setTrustLevel('trusted');
      } else {
        // Add to trusted
        await chrome.runtime.sendMessage({
          type: 'ADD_TRUSTED_SITE',
          domain: tabInfo.domain,
          reason: 'User marked as trusted'
        });
        setTrustLevel('trusted');
      }
    } catch (error) {
      console.error('Failed to toggle trust:', error);
    }
  };

  const blockSite = async () => {
    if (!tabInfo?.domain) return;

    try {
      await chrome.runtime.sendMessage({
        type: 'ADD_BLOCKED_SITE',
        domain: tabInfo.domain,
        reason: 'User blocked site'
      });
      setTrustLevel('blocked');
    } catch (error) {
      console.error('Failed to block site:', error);
    }
  };

  const toggleExtension = async () => {
    try {
      const newState = !extensionEnabled;
      await chrome.storage.local.set({ extensionEnabled: newState });
      setExtensionEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle extension:', error);
    }
  };

  const toggleBlocking = async () => {
    try {
      const newState = !blockingEnabled;
      await chrome.storage.local.set({ blockingEnabled: newState });
      setBlockingEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle blocking:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-[420px] h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-emerald-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <img src="/icon128.png" alt="PRISM" className="w-12 h-12" />
            </div>
          </div>
          <p className="text-slate-300 font-medium">Loading PRISM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[420px] h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Settings Panel */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      
      {/* Analytics Panel */}
      {showAnalytics && <Analytics onClose={() => setShowAnalytics(false)} currentDomain={tabInfo?.domain} />}
      
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img src="/icon48.png" alt="PRISM" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">PRISM</h1>
              <p className="text-xs text-slate-400">Security Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAnalytics(true)}
              className="w-9 h-9 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
              title="Analytics Dashboard"
            >
              <BarChartIcon />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="w-9 h-9 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
              title="Settings"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6M1 12h6m6 0h6M4.2 4.2l4.3 4.3m5.8 5.8l4.3 4.3M4.2 19.8l4.3-4.3m5.8-5.8l4.3-4.3"/>
              </svg>
            </button>
            {/* Quick Toggle: Extension On/Off */}
            <button
              onClick={toggleExtension}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                extensionEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                  : 'bg-slate-700/50 text-slate-500 hover:bg-slate-600/50'
              }`}
              title={extensionEnabled ? 'Extension Enabled' : 'Extension Disabled'}
            >
              <ShieldIcon />
            </button>
            {/* Quick Toggle: Tracker Blocking On/Off */}
            <button
              onClick={toggleBlocking}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                blockingEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                  : 'bg-slate-700/50 text-slate-500 hover:bg-slate-600/50'
              }`}
              title={blockingEnabled ? 'Blocking Enabled' : 'Blocking Disabled'}
            >
              <XIcon />
            </button>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              connectionStatus === 'connected' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {connectionStatus === 'connected' ? '● Active' : '● Offline'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6 overflow-y-auto h-[calc(600px-72px)]">
        
        {/* Central Security Score */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col items-center">
              {/* Circular Score */}
              <div className="relative w-40 h-40 mb-4">
                {/* Outer ring */}
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="rgba(148, 163, 184, 0.1)"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke={getScoreColor(metrics.overallScore)}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - metrics.overallScore / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: `drop-shadow(0 0 8px ${getScoreColor(metrics.overallScore)})`
                    }}
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-5xl font-bold text-white counter-animate">
                    {metrics.overallScore}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-1">SECURITY SCORE</div>
                </div>
              </div>

              {/* Risk Level Badge */}
              <div className={`px-5 py-2.5 bg-gradient-to-r ${getRiskLevelDetails(metrics.overallScore).bgColor} border ${getRiskLevelDetails(metrics.overallScore).borderColor} rounded-full transition-all duration-500 hover:scale-105 group`}>
                <div className="flex items-center gap-2.5">
                  <div className={`${getRiskLevelDetails(metrics.overallScore).textColor} transition-transform group-hover:rotate-12 duration-300`}>
                    {getRiskLevelDetails(metrics.overallScore).icon}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className={`text-sm font-bold ${getRiskLevelDetails(metrics.overallScore).textColor}`}>
                      {getRiskLevelDetails(metrics.overallScore).level}
                    </span>
                    <span className="text-xs text-slate-400">
                      {getRiskLevelDetails(metrics.overallScore).description}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Site Info */}
              {tabInfo && (
                <div className="mt-6 w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Current Site</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700/50">
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center text-emerald-400">
                      {tabInfo.protocol === 'https:' ? <LockIcon /> : <AlertIcon />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm truncate">{tabInfo.domain}</p>
                        {trustLevel === 'trusted' && (
                          <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded">
                            ✓
                          </span>
                        )}
                        {trustLevel === 'blocked' && (
                          <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-xs font-semibold rounded">
                            🚫
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-slate-400 text-xs">
                          {tabInfo.protocol === 'https:' ? 'Secure Connection' : 'Not Secure'}
                        </p>
                        <button
                          onClick={toggleTrust}
                          className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                            trustLevel === 'trusted'
                              ? 'bg-slate-600/50 hover:bg-slate-500/50 text-slate-300'
                              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300'
                          }`}
                          title={trustLevel === 'trusted' ? 'Remove from trusted' : 'Mark as trusted'}
                        >
                          {trustLevel === 'trusted' ? 'Untrust' : 'Trust'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Trackers Blocked */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                <XIcon />
              </div>
              <span className="text-slate-400 text-xs font-medium">Trackers</span>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.trackersBlocked}</p>
            <p className="text-xs text-slate-500 mt-1">Blocked</p>
          </div>

          {/* Cookies Managed */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                <CookieIcon />
              </div>
              <span className="text-slate-400 text-xs font-medium">Cookies</span>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.cookiesManaged}</p>
            <p className="text-xs text-slate-500 mt-1">Managed</p>
          </div>

          {/* Requests Analyzed */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                <BarChartIcon />
              </div>
              <span className="text-slate-400 text-xs font-medium">Requests</span>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.requestsAnalyzed}</p>
            <p className="text-xs text-slate-500 mt-1">Analyzed</p>
          </div>

          {/* Malware Threats */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <span className="text-slate-400 text-xs font-medium">Threats</span>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.malwareThreats}</p>
            <p className="text-xs text-slate-500 mt-1">Blocked</p>
          </div>
        </div>

        {/* Website Security Report */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-semibold text-white">Security Report</span>
          </div>
          
          <div className="space-y-3">
            {/* SSL Certificate */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">SSL Certificate</span>
              </div>
              <span className={`text-xs font-semibold ${
                securityReport.hasSSL
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}>
                {securityReport.hasSSL ? '✓ Valid' : '✗ Invalid'}
              </span>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Privacy Policy</span>
              </div>
              <span className={`text-xs font-semibold ${
                securityReport.privacyPolicyFound
                  ? 'text-emerald-400'
                  : 'text-slate-400'
              }`}>
                {securityReport.privacyPolicyFound ? '✓ Found' : 'Not Found'}
              </span>
            </div>

            {/* Third-Party Scripts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Third-Party Scripts</span>
              </div>
              <span className={`text-xs font-semibold ${
                securityReport.thirdPartyScripts < 10
                  ? 'text-emerald-400'
                  : securityReport.thirdPartyScripts < 30
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {securityReport.thirdPartyScripts === 0
                  ? '✓ Safe'
                  : `${securityReport.thirdPartyScripts} detected`}
              </span>
            </div>

            {/* Data Collection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Data Collection</span>
              </div>
              <span className={`text-xs font-semibold ${
                securityReport.dataCollectionLevel === 'Minimal'
                  ? 'text-emerald-400'
                  : securityReport.dataCollectionLevel === 'Moderate'
                  ? 'text-blue-400'
                  : securityReport.dataCollectionLevel === 'High'
                  ? 'text-yellow-400'
                  : 'text-red-400'
              }`}>
                {securityReport.dataCollectionLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Extension Info - Compact */}
        {extensionData && (
          <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">PRISM v{extensionData.version}</span>
              <span className="text-slate-500">Phase {extensionData.phase}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
