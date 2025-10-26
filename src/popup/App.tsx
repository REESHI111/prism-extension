/**
 * PRISM Main Popup Component
 * Modern UI with Card-based Design
 */

import React, { useState, useEffect } from 'react';

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

const App: React.FC = () => {
  const [status, setStatus] = useState<string>('Initializing...');
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [extensionData, setExtensionData] = useState<ExtensionStatus | null>(null);
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeExtension();
  }, []);

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

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'from-emerald-500 to-teal-600';
      case 'error': return 'from-red-500 to-rose-600';
      default: return 'from-amber-500 to-orange-600';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '✓';
      case 'error': return '✕';
      default: return '⟳';
    }
  };

  if (isLoading) {
    return (
      <div className="w-[420px] h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🛡️</div>
          <p className="text-slate-600 font-medium">Loading PRISM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[420px] h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden flex flex-col">
      {/* Modern Header with Gradient */}
      <div className={`bg-gradient-to-r ${getStatusColor()} p-6 shadow-lg relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🛡️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">PRISM</h1>
                <p className="text-white/80 text-xs font-medium">Privacy & Security Shield</p>
              </div>
            </div>
            <div className={`w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl transition-all duration-300 ${connectionStatus === 'connected' ? 'animate-pulse' : ''}`}>
              {getStatusIcon()}
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 mt-4">
            <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-1">Status</p>
            <p className="text-white text-lg font-bold">{status}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Current Site Card */}
        {tabInfo && (
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">🌐</span>
                Current Website
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{tabInfo.protocol === 'https:' ? '🔒' : '⚠️'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 font-medium mb-1">Domain</p>
                  <p className="text-sm font-bold text-slate-800 break-all">{tabInfo.domain}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                  tabInfo.protocol === 'https:' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {tabInfo.protocol === 'https:' ? '✓ Secure Connection' : '⚠ Not Secure'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Protection Stats Card */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-3">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <span className="text-lg">📊</span>
              Protection Stats
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-red-50 to-rose-50 hover:scale-105 transition-transform duration-200">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-xs text-slate-600 mt-1">Trackers Blocked</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 hover:scale-105 transition-transform duration-200">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-xs text-slate-600 mt-1">Cookies Managed</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:scale-105 transition-transform duration-200">
                <div className="text-2xl font-bold text-green-600">100</div>
                <div className="text-xs text-slate-600 mt-1">Privacy Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Extension Info Card */}
        {extensionData && (
          <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-3">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                <span className="text-lg">⚙️</span>
                Extension Info
              </h2>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-xs text-slate-600 font-medium">Version</span>
                <span className="text-sm font-bold text-slate-800">{extensionData.version}</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-xs text-slate-600 font-medium">Development Phase</span>
                <span className="text-sm font-bold text-slate-800 bg-purple-100 px-2 py-1 rounded-md">Phase {extensionData.phase}</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-xs text-slate-600 font-medium">Protection Status</span>
                <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                  extensionData.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {extensionData.active ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>
              {extensionData.installDate && (
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <span className="text-xs text-slate-600 font-medium">Installed</span>
                  <span className="text-xs font-semibold text-slate-700">
                    {new Date(extensionData.installDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Progress Card */}
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3">
            <h2 className="text-white font-semibold text-sm flex items-center gap-2">
              <span className="text-lg">🚀</span>
              Development Progress
            </h2>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center gap-3 group">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-sm text-slate-700">Extension Foundation</span>
            </div>
            <div className="flex items-center gap-3 group opacity-50">
              <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <span className="text-sm text-slate-500">Tracker Blocking</span>
            </div>
            <div className="flex items-center gap-3 group opacity-50">
              <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <span className="text-sm text-slate-500">Privacy Scoring</span>
            </div>
            <div className="flex items-center gap-3 group opacity-50">
              <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">4</span>
              </div>
              <span className="text-sm text-slate-500">ML Phishing Detection</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 p-3">
        <p className="text-center text-xs text-slate-500">
          Made with <span className="text-red-500">❤</span> by Team PRISM • Protecting your privacy
        </p>
      </div>
    </div>
  );
};

export default App;
