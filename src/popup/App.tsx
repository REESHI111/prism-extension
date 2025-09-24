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
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">🛡️</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">PRISM</h1>
            <p className="text-xs opacity-90">Privacy Guardian</p>
          </div>
        </div>
      </div>

      {/* Current Site Info */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium text-gray-700">Current Site</span>
        </div>
        <p className="text-lg font-semibold text-gray-900 truncate">{currentDomain}</p>
      </div>

      {/* Privacy Score */}
      {privacyScore ? (
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Privacy Score</h2>
            <div className={`px-3 py-1 rounded-full ${getScoreBgColor(privacyScore.score)}`}>
              <span className={`font-bold text-xl ${getScoreColor(privacyScore.score)}`}>
                {privacyScore.score}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Trackers Blocked</span>
              <span className="font-medium">{privacyScore.trackers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Cookies</span>
              <span className="font-medium">{privacyScore.cookies}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">HTTPS</span>
              <span className={`font-medium ${privacyScore.isHTTPS ? 'text-green-600' : 'text-red-600'}`}>
                {privacyScore.isHTTPS ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <span className="text-gray-400 text-2xl">📊</span>
            </div>
            <p className="text-gray-500">Analyzing privacy score...</p>
          </div>
        </div>
      )}

      {/* Blocked Trackers */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Protection Status</h2>
          <div className="px-2 py-1 bg-green-100 rounded-full">
            <span className="text-green-600 font-medium text-sm">Active</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{blockedTrackers.count}</div>
            <div className="text-xs text-red-600">Trackers Blocked</div>
            <div className="text-xs text-gray-500 mt-1">This Session</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{cookieData.tracking}</div>
            <div className="text-xs text-orange-600">Tracking Cookies</div>
            <div className="text-xs text-gray-500 mt-1">Detected</div>
          </div>
        </div>
        
        {/* Cookie Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{cookieData.total}</div>
            <div className="text-xs text-yellow-600">Total Cookies</div>
            <div className="text-xs text-gray-500 mt-1">All Types</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">{cookieData.total - cookieData.tracking}</div>
            <div className="text-xs text-green-600">Safe Cookies</div>
            <div className="text-xs text-gray-500 mt-1">Functional</div>
          </div>
        </div>
      </div>

      {/* Domain Actions */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Domain Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => handleWhitelistDomain(currentDomain)}
            className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-200 hover:bg-green-100 text-xs font-medium"
          >
            ✅ Trust Site
          </button>
          <button 
            onClick={() => handleBlockDomain(currentDomain)}
            className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 text-xs font-medium"
          >
            🚫 Block Site
          </button>
        </div>
      </div>

      {/* Privacy Insights */}
      {privacyScore && (
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Privacy Insights</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Privacy Level</span>
              <span className={`font-medium ${getScoreColor(privacyScore.score)}`}>
                {privacyScore.score >= 80 ? 'Excellent' : 
                 privacyScore.score >= 60 ? 'Good' : 'Poor'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Tracker Categories</span>
              <span className="font-medium">{privacyScore.trackerCategories.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Protection Active</span>
              <span className="font-medium text-green-600">Yes</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
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

      {/* Footer */}
      <div className="p-4 text-center border-t bg-white">
        <p className="text-xs text-gray-500">PRISM v1.0.0 - Privacy First</p>
      </div>
    </div>
  );
};

export default App;