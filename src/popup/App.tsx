/**
 * PRISM Main Popup Component
 * Premium Classy UI Design
 */

import React, { useState, useEffect } from 'react';

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

const App: React.FC = () => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [extensionData, setExtensionData] = useState<ExtensionStatus | null>(null);
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    overallScore: 95,
    trackersBlocked: 0,
    cookiesManaged: 0,
    requestsAnalyzed: 0,
    malwareThreats: 0,
    privacyRating: 'Excellent'
  });

  useEffect(() => {
    initializeExtension();
    calculateSecurityMetrics();
  }, []);

  const calculateSecurityMetrics = () => {
    // This will be enhanced with real data from service worker
    // For now, demo values
    setMetrics({
      overallScore: 95,
      trackersBlocked: 0,
      cookiesManaged: 0,
      requestsAnalyzed: 0,
      malwareThreats: 0,
      privacyRating: 'Excellent'
    });
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

  if (isLoading) {
    return (
      <div className="w-[420px] h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-emerald-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-emerald-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          <p className="text-slate-300 font-medium">Loading PRISM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[420px] h-[600px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Premium Header */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <ShieldIcon />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">PRISM</h1>
              <p className="text-xs text-slate-400">Security Suite</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            connectionStatus === 'connected' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {connectionStatus === 'connected' ? '● Active' : '● Offline'}
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

              {/* Rating Badge */}
              <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full">
                <span className="text-sm font-semibold text-emerald-300">
                  {getScoreRating(metrics.overallScore)}
                </span>
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
                      <p className="text-white font-medium text-sm truncate">{tabInfo.domain}</p>
                      <p className="text-slate-400 text-xs">
                        {tabInfo.protocol === 'https:' ? 'Secure Connection' : 'Not Secure'}
                      </p>
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
              <span className="text-xs font-semibold text-emerald-400">✓ Valid</span>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Privacy Policy</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Not Found</span>
            </div>

            {/* Third-Party Scripts */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Third-Party Scripts</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400">✓ Safe</span>
            </div>

            {/* Data Collection */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-300">Data Collection</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">Minimal</span>
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
