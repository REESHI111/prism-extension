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

// SVG Icons
const ShieldIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const BlockIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 008.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
  </svg>
);

const CookieIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM7 9a1 1 0 100-2 1 1 0 000 2zm6-2a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 100-2 1 1 0 000 2zm2 3a1 1 0 11-2 0 1 1 0 012 0z" />
  </svg>
);

const LockIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
  </svg>
);

const UnlockIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const CogIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const LightBulbIcon = () => (
  <svg className="icon" fill="currentColor" viewBox="0 0 20 20">
    <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z" />
  </svg>
);

const App: React.FC = () => {
  const [privacyScore, setPrivacyScore] = useState<PrivacyScore | null>(null);
  const [blockedTrackers, setBlockedTrackers] = useState<BlockedTrackersData>({ trackers: [], count: 0 });
  const [cookieData, setCookieData] = useState<CookieData>({ total: 0, tracking: 0, categories: {} });
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadCurrentTabData();
  }, []);

  const loadCurrentTabData = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab.url) {
          const domain = new URL(tab.url).hostname;
          setCurrentDomain(domain);

          const scoreResponse = await chrome.runtime.sendMessage({
            type: 'GET_PRIVACY_SCORE',
            domain: domain
          });

          if (scoreResponse.score) {
            setPrivacyScore(scoreResponse.score);
          }

          const trackersResponse = await chrome.runtime.sendMessage({
            type: 'GET_BLOCKED_TRACKERS'
          });

          if (trackersResponse) {
            setBlockedTrackers(trackersResponse);
          }

          const cookieResponse = await chrome.runtime.sendMessage({
            type: 'GET_COOKIE_ANALYSIS',
            domain: domain
          });

          if (cookieResponse) {
            setCookieData(cookieResponse);
          }
        }
      } else {
        setCurrentDomain('example.com');
        setPrivacyScore({
          domain: 'example.com',
          score: 85,
          trackers: 12,
          cookies: 8,
          isHTTPS: true,
          timestamp: new Date(),
          blockedRequests: 15,
          trackerCategories: ['analytics', 'advertising']
        });
        setBlockedTrackers({ trackers: [], count: 12 });
        setCookieData({ total: 8, tracking: 3, categories: {} });
      }
    } catch (error) {
      console.error('Error loading tab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhitelistDomain = async (domain: string) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        await chrome.runtime.sendMessage({
          type: 'WHITELIST_DOMAIN',
          domain: domain
        });
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
      }
    } catch (error) {
      console.error('Error blocking domain:', error);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <div className={`popup-container ${isDark ? 'dark' : ''}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`popup-container ${isDark ? 'dark' : ''} bg-gray-50 dark:bg-gray-900`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldIcon />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-white">PRISM</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Privacy Guardian</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="status-dot status-active"></div>
            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Active</span>
          </div>
        </div>
      </div>

      {/* Current Site */}
      <div className="p-4">
        <div className="card p-4 fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Current Site</span>
            <div className="status-dot status-active"></div>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{currentDomain}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Real-time protection enabled</p>
        </div>
      </div>

      {/* Privacy Score */}
      {privacyScore && (
        <div className="px-4 pb-4">
          <div className={`card p-4 ${getScoreBg(privacyScore.score)}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Privacy Score</span>
              <div className={`text-2xl font-bold ${getScoreColor(privacyScore.score)}`}>
                {privacyScore.score}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex items-center justify-center mb-1">
                  <BlockIcon />
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{privacyScore.trackers}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Trackers</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  <CookieIcon />
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">{privacyScore.cookies}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Cookies</div>
              </div>
              <div>
                <div className="flex items-center justify-center mb-1">
                  {privacyScore.isHTTPS ? <LockIcon /> : <UnlockIcon />}
                </div>
                <div className={`text-lg font-semibold ${privacyScore.isHTTPS ? 'text-green-600' : 'text-red-600'}`}>
                  {privacyScore.isHTTPS ? 'Secure' : 'Insecure'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">HTTPS</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{blockedTrackers.count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Trackers Blocked</div>
            <div className="progress-bar">
              <div className="progress-fill progress-red" style={{width: `${Math.min((blockedTrackers.count / 50) * 100, 100)}%`}}></div>
            </div>
          </div>
          
          <div className="card p-3 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">{cookieData.tracking}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Tracking Cookies</div>
            <div className="progress-bar">
              <div className="progress-fill progress-orange" style={{width: `${Math.min((cookieData.tracking / 20) * 100, 100)}%`}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Actions */}
      <div className="px-4 pb-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Domain Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleWhitelistDomain(currentDomain)}
              className="btn btn-success p-2 text-sm flex items-center justify-center space-x-2"
            >
              <CheckIcon />
              <span>Trust Site</span>
            </button>
            <button 
              onClick={() => handleBlockDomain(currentDomain)}
              className="btn btn-danger p-2 text-sm flex items-center justify-center space-x-2"
            >
              <XIcon />
              <span>Block Site</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-4">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full btn btn-secondary p-3 flex items-center space-x-3 text-left">
              <ChartIcon />
              <div>
                <div className="text-sm font-medium">Statistics</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">View detailed analytics</div>
              </div>
            </button>
            
            <button className="w-full btn btn-secondary p-3 flex items-center space-x-3 text-left">
              <LightBulbIcon />
              <div>
                <div className="text-sm font-medium">Privacy Tips</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Learn protection strategies</div>
              </div>
            </button>
            
            <button className="w-full btn btn-secondary p-3 flex items-center space-x-3 text-left">
              <CogIcon />
              <div>
                <div className="text-sm font-medium">Settings</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Customize protection</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">PRISM v2.0.0 • Privacy First</p>
        </div>
      </div>
    </div>
  );
};

export default App;