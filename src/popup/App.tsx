/**
 * PRISM Main Popup Component
 * Phase 1: Basic UI and Communication Test
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

  useEffect(() => {
    testConnection();
    loadExtensionData();
    loadTabInfo();
  }, []);

  const testConnection = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'PING' });
      if (response?.status === 'OK') {
        setConnectionStatus('connected');
        setStatus('✅ PRISM Active');
      } else {
        setConnectionStatus('error');
        setStatus('❌ Connection Error');
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatus('❌ Extension Error');
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

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-100 border-green-300';
      case 'error': return 'bg-red-100 border-red-300';
      default: return 'bg-yellow-100 border-yellow-300';
    }
  };

  return (
    <div className="w-96 min-h-[400px] bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🛡️ PRISM
        </h1>
        <p className="text-sm opacity-90">Privacy & Security Extension</p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status Card */}
        <div className={`p-4 rounded-lg border-2 ${getConnectionColor()}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">Status</p>
              <p className="text-lg font-bold">{status}</p>
            </div>
            <div className="text-3xl">
              {connectionStatus === 'connected' ? '✅' : connectionStatus === 'error' ? '❌' : '⏳'}
            </div>
          </div>
        </div>

        {/* Extension Info */}
        {extensionData && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Extension Info</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Version:</span>
                <span className="font-semibold">{extensionData.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phase:</span>
                <span className="font-semibold">Phase {extensionData.phase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Active:</span>
                <span className="font-semibold">{extensionData.active ? 'Yes' : 'No'}</span>
              </div>
              {extensionData.installDate && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Installed:</span>
                  <span className="font-semibold text-xs">
                    {new Date(extensionData.installDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Tab Info */}
        {tabInfo && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-600 mb-2">Current Page</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-500 whitespace-nowrap">Domain:</span>
                <span className="font-semibold text-right break-all">{tabInfo.domain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Protocol:</span>
                <span className="font-semibold">
                  {tabInfo.protocol === 'https:' ? '🔒 HTTPS' : '⚠️ HTTP'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Phase 1 Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-sm font-semibold text-blue-900 mb-2">
            📋 Phase 1: Foundation
          </h2>
          <p className="text-xs text-blue-800">
            Basic extension structure with service worker, content script, and popup communication established.
          </p>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Extension loads correctly</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Background service worker active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Content script injection working</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Inter-script messaging functional</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-200">
          <p>Made with ❤️ by Team PRISM</p>
          <p className="mt-1">Protecting privacy, one click at a time 🛡️</p>
        </div>
      </div>
    </div>
  );
};

export default App;
