import React, { useState, useEffect } from 'react';

interface PrivacyScore {
  domain: string;
  score: number;
  trackers: number;
  cookies: number;
  isHTTPS: boolean;
  timestamp: Date;
  blockedRequests: number;
  trackerCategories: string[];
}

interface BlockedTrackersData {
  trackers: string[];
  count: number;
  stats?: any;
}

interface CookieData {
  total: number;
  tracking: number;
  categories: { [key: string]: number };
}

const App: React.FC = () => {
  const [privacyScore, setPrivacyScore] = useState<PrivacyScore | null>(null);
  const [blockedTrackers, setBlockedTrackers] = useState<BlockedTrackersData>({ trackers: [], count: 0 });
  const [cookieData, setCookieData] = useState<CookieData>({ total: 0, tracking: 0, categories: {} });
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentTabData();
  }, []);

  const loadCurrentTabData = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab.url) {
          const domain = new URL(tab.url).hostname;
          setCurrentDomain(domain);

          // Get privacy score from background script
          const scoreResponse = await chrome.runtime.sendMessage({
            type: 'GET_PRIVACY_SCORE',
            domain: domain
          });

          if (scoreResponse.score) {
            setPrivacyScore(scoreResponse.score);
          }

          // Get blocked trackers
          const trackersResponse = await chrome.runtime.sendMessage({
            type: 'GET_BLOCKED_TRACKERS'
          });

          if (trackersResponse) {
            setBlockedTrackers(trackersResponse);
          }

          // Get cookie analysis
          const cookieResponse = await chrome.runtime.sendMessage({
            type: 'GET_COOKIE_ANALYSIS',
            domain: domain
          });

          if (cookieResponse) {
            setCookieData(cookieResponse);
          }
        }
      } else {
        // Fallback for development
        setCurrentDomain('example.com');
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  // Domain management functions
  const handleWhitelistDomain = async (domain: string) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        await chrome.runtime.sendMessage({
          type: 'WHITELIST_DOMAIN',
          domain: domain
        });
        // Show success message or update UI
        console.log(`✅ Domain ${domain} added to whitelist`);
      }
    } catch (error) {
      console.error('Error whitelisting domain:', error);
    }
  };

  const handleBlockDomain = async (domain: string) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        await chrome.runtime.sendMessage({
          type: 'BLOCK_DOMAIN',
          domain: domain
        });
        console.log(`🚫 Domain ${domain} added to blocklist`);
      }
    } catch (error) {
      console.error('Error blocking domain:', error);
    }
  };

  // Navigation functions
  const openFullDashboard = () => {
    // In a real extension, this would open a full dashboard page
    console.log('📊 Opening full dashboard...');
    // For now, just log the action
  };

  const showPrivacyTips = () => {
    console.log('💡 Showing privacy tips...');
    // Could open an education modal or new tab
  };

  const openSettings = () => {
    console.log('⚙️ Opening settings...');
    // Could open a settings page or modal
  };

  if (loading) {
    return (
      <div className="min-h-[600px] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="glass-card p-8 text-center animate-pulse-glow">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white font-medium">Analyzing privacy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-4 animate-slide-up">
      {/* Modern Header with Glassmorphism */}
      <div className="glass mb-6 p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 glass-card flex items-center justify-center animate-float">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="font-bold text-xl gradient-text">PRISM</h1>
              <p className="text-white/80 text-sm">Privacy Guardian</p>
            </div>
          </div>
          <div className="status-indicator">
            <span className="px-3 py-1 glass-button text-white text-xs font-medium">
              ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Current Site Info with Modern Design */}
      <div className="glass-card mb-6 p-4 relative">
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></div>
          <span className="text-sm font-medium text-white/90">Analyzing</span>
        </div>
        <p className="text-xl font-bold gradient-text truncate">{currentDomain}</p>
        <p className="text-white/70 text-sm mt-1">Real-time protection active</p>
      </div>

      {/* Privacy Score with Modern Ring Design */}
      {privacyScore ? (
        <div className="glass-card mb-6 p-6 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-12"></div>
          <div className="relative">
            <h2 className="text-lg font-semibold text-white mb-4">Privacy Score</h2>
            
            {/* Animated Score Ring */}
            <div className="score-ring w-24 h-24 mx-auto mb-4 relative">
              <div className="w-full h-full glass-card rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold gradient-text">
                  {privacyScore.score}
                </span>
              </div>
            </div>
            
            {/* Score Details */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="glass-button p-3 rounded-lg">
                <div className="text-xl font-bold text-white">{privacyScore.trackers}</div>
                <div className="text-xs text-white/70">Trackers</div>
              </div>
              <div className="glass-button p-3 rounded-lg">
                <div className="text-xl font-bold text-white">{privacyScore.cookies}</div>
                <div className="text-xs text-white/70">Cookies</div>
              </div>
              <div className="glass-button p-3 rounded-lg">
                <div className={`text-xl font-bold ${privacyScore.isHTTPS ? 'text-green-300' : 'text-red-300'}`}>
                  {privacyScore.isHTTPS ? '🔒' : '🔓'}
                </div>
                <div className="text-xs text-white/70">Security</div>
              </div>
            </div>
            
            <p className="text-white/80 text-sm mt-3">
              {privacyScore.score >= 80 ? '🛡️ Excellent Protection' : 
               privacyScore.score >= 60 ? '⚠️ Good Protection' : '🚨 Needs Attention'}
            </p>
          </div>
        </div>
      ) : (
        <div className="glass-card mb-6 p-8 text-center">
          <div className="w-16 h-16 glass-card rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse-glow">
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-white/80">Analyzing privacy score...</p>
        </div>
      )}

      {/* Modern Statistics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="glass-card p-4 text-center group hover:scale-105 transition-transform">
          <div className="text-3xl font-bold gradient-primary mb-2">{blockedTrackers.count}</div>
          <div className="text-white/90 text-sm font-medium">Trackers</div>
          <div className="text-white/60 text-xs">Blocked</div>
          <div className="w-full bg-white/20 rounded-full h-1 mt-2">
            <div className="bg-red-400 h-1 rounded-full" style={{width: `${Math.min((blockedTrackers.count / 50) * 100, 100)}%`}}></div>
          </div>
        </div>
        
        <div className="glass-card p-4 text-center group hover:scale-105 transition-transform">
          <div className="text-3xl font-bold gradient-primary mb-2">{cookieData.tracking}</div>
          <div className="text-white/90 text-sm font-medium">Tracking</div>
          <div className="text-white/60 text-xs">Cookies</div>
          <div className="w-full bg-white/20 rounded-full h-1 mt-2">
            <div className="bg-orange-400 h-1 rounded-full" style={{width: `${Math.min((cookieData.tracking / 20) * 100, 100)}%`}}></div>
          </div>
        </div>
        
        <div className="glass-card p-4 text-center group hover:scale-105 transition-transform">
          <div className="text-3xl font-bold gradient-primary mb-2">{cookieData.total}</div>
          <div className="text-white/90 text-sm font-medium">Total</div>
          <div className="text-white/60 text-xs">Cookies</div>
          <div className="w-full bg-white/20 rounded-full h-1 mt-2">
            <div className="bg-yellow-400 h-1 rounded-full" style={{width: `${Math.min((cookieData.total / 50) * 100, 100)}%`}}></div>
          </div>
        </div>
        
        <div className="glass-card p-4 text-center group hover:scale-105 transition-transform">
          <div className="text-3xl font-bold gradient-primary mb-2">{cookieData.total - cookieData.tracking}</div>
          <div className="text-white/90 text-sm font-medium">Safe</div>
          <div className="text-white/60 text-xs">Cookies</div>
          <div className="w-full bg-white/20 rounded-full h-1 mt-2">
            <div className="bg-green-400 h-1 rounded-full" style={{width: `${Math.min(((cookieData.total - cookieData.tracking) / 30) * 100, 100)}%`}}></div>
          </div>
        </div>
      </div>

      {/* Domain Actions with Modern Design */}
      <div className="glass-card mb-6 p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Domain Actions
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleWhitelistDomain(currentDomain)}
            className="glass-button p-3 text-white hover:bg-green-500/20 transition-all duration-200 rounded-lg flex items-center justify-center space-x-2 group"
          >
            <span className="text-green-300 group-hover:scale-110 transition-transform">✅</span>
            <span className="text-sm font-medium">Trust Site</span>
          </button>
          <button 
            onClick={() => handleBlockDomain(currentDomain)}
            className="glass-button p-3 text-white hover:bg-red-500/20 transition-all duration-200 rounded-lg flex items-center justify-center space-x-2 group"
          >
            <span className="text-red-300 group-hover:scale-110 transition-transform">🚫</span>
            <span className="text-sm font-medium">Block Site</span>
          </button>
        </div>
      </div>

      {/* Privacy Insights with Modern Cards */}
      {privacyScore && (
        <div className="glass-card mb-6 p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
            <span className="mr-2">💡</span>
            Privacy Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 glass-button rounded-lg">
              <span className="text-white/80 text-sm">Privacy Level</span>
              <span className="font-medium text-white flex items-center">
                {privacyScore.score >= 80 ? (
                  <>
                    <span className="mr-1">🛡️</span>
                    <span className="text-green-300">Excellent</span>
                  </>
                ) : privacyScore.score >= 60 ? (
                  <>
                    <span className="mr-1">⚠️</span>
                    <span className="text-yellow-300">Good</span>
                  </>
                ) : (
                  <>
                    <span className="mr-1">🚨</span>
                    <span className="text-red-300">Needs Work</span>
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 glass-button rounded-lg">
              <span className="text-white/80 text-sm">Threat Categories</span>
              <span className="font-medium text-white bg-purple-500/30 px-2 py-1 rounded-full text-xs">
                {privacyScore.trackerCategories.length}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 glass-button rounded-lg">
              <span className="text-white/80 text-sm">Protection Status</span>
              <span className="font-medium text-green-300 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions with Modern Design */}
      <div className="glass-card mb-6 p-4">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Actions
        </h3>
        <div className="space-y-3">
          <button 
            onClick={() => openFullDashboard()}
            className="w-full text-left p-3 bg-white rounded-lg border hover:bg-gray-50 flex items-center space-x-3"
          >
            <span className="text-purple-600">📊</span>
            <span className="text-sm">Detailed Statistics</span>
          </button>
          <button 
            onClick={() => showPrivacyTips()}
            className="w-full text-left p-3 bg-white rounded-lg border hover:bg-gray-50 flex items-center space-x-3"
          >
            <span className="text-green-600">�</span>
            <span className="text-sm">Privacy Tips</span>
          </button>
          <button 
            onClick={() => openSettings()}
            className="w-full text-left p-3 bg-white rounded-lg border hover:bg-gray-50 flex items-center space-x-3"
          >
            <span className="text-blue-600">⚙️</span>
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>

      {/* Modern Footer */}
      <div className="glass-card p-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <p className="text-white/90 text-sm font-medium">PRISM v2.0.0</p>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
        <p className="text-white/60 text-xs">🛡️ Privacy First • 🚀 Always Protected</p>
      </div>
    </div>
  );
};

export default App;