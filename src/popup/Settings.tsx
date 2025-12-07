/**
 * PRISM Settings Panel
 * Phase 3.4: Enhanced UI - Settings Component
 */

import React, { useState, useEffect } from 'react';

interface SettingsData {
  extensionEnabled: boolean;
  blockTrackers: boolean;
  blockFingerprinting: boolean;
  manageCookies: boolean;
  showNotifications: boolean;
  strictMode: boolean;
  autoBlock: boolean;
  privacyLevel: 'standard' | 'balanced' | 'strict';
}

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<SettingsData>({
    extensionEnabled: true,
    blockTrackers: true,
    blockFingerprinting: true,
    manageCookies: true,
    showNotifications: true,
    strictMode: false,
    autoBlock: true,
    privacyLevel: 'balanced'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [allowedWebsites, setAllowedWebsites] = useState<string[]>([]);

  // Load settings from storage
  useEffect(() => {
    loadSettings();
    loadAllowedWebsites();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.local.get('prism_settings');
      if (result.prism_settings) {
        setSettings(result.prism_settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };
  
  const loadAllowedWebsites = async () => {
    try {
      const result = await chrome.storage.local.get(['userWhitelist']);
      setAllowedWebsites(result.userWhitelist || []);
    } catch (error) {
      console.error('Failed to load allowed websites:', error);
    }
  };
  
  const removeAllowedWebsite = async (domain: string) => {
    try {
      const newWhitelist = allowedWebsites.filter(d => d !== domain);
      await chrome.storage.local.set({ userWhitelist: newWhitelist });
      setAllowedWebsites(newWhitelist);
    } catch (error) {
      console.error('Failed to remove website:', error);
    }
  };
  
  const clearAllAllowedWebsites = async () => {
    if (confirm('Are you sure you want to clear all allowed websites?')) {
      try {
        await chrome.storage.local.set({ userWhitelist: [] });
        setAllowedWebsites([]);
      } catch (error) {
        console.error('Failed to clear allowed websites:', error);
      }
    }
  };

  const saveSettings = async (newSettings: SettingsData) => {
    setIsSaving(true);
    try {
      await chrome.storage.local.set({ prism_settings: newSettings });
      setSettings(newSettings);
      
      // Notify background worker of settings change
      chrome.runtime.sendMessage({
        type: 'SETTINGS_UPDATED',
        settings: newSettings
      }).catch(() => {});
      
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof SettingsData) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handlePrivacyLevelChange = (level: 'standard' | 'balanced' | 'strict') => {
    const newSettings = { ...settings, privacyLevel: level };
    
    // Adjust other settings based on privacy level
    if (level === 'standard') {
      newSettings.strictMode = false;
      newSettings.blockFingerprinting = false;
    } else if (level === 'balanced') {
      newSettings.strictMode = false;
      newSettings.blockFingerprinting = true;
    } else if (level === 'strict') {
      newSettings.strictMode = true;
      newSettings.blockFingerprinting = true;
      newSettings.blockTrackers = true;
      newSettings.manageCookies = true;
    }
    
    saveSettings(newSettings);
  };

  const resetToDefaults = () => {
    const defaultSettings: SettingsData = {
      extensionEnabled: true,
      blockTrackers: true,
      blockFingerprinting: true,
      manageCookies: true,
      showNotifications: true,
      strictMode: false,
      autoBlock: true,
      privacyLevel: 'balanced'
    };
    saveSettings(defaultSettings);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Settings</h1>
                  <p className="text-xs text-slate-400">Customize your privacy protection</p>
                </div>
              </div>
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

          {/* Privacy Level Selector */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 mb-4">
            <h2 className="text-sm font-semibold text-white mb-4">Privacy Level</h2>
            <div className="grid grid-cols-3 gap-3">
              {(['standard', 'balanced', 'strict'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handlePrivacyLevelChange(level)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    settings.privacyLevel === level
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-400 hover:border-slate-500/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold capitalize">{level}</div>
                    <div className="text-xs mt-1 opacity-70">
                      {level === 'standard' && 'Basic protection'}
                      {level === 'balanced' && 'Recommended'}
                      {level === 'strict' && 'Maximum privacy'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Protection Settings */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 mb-4">
            <h2 className="text-sm font-semibold text-white mb-4">Protection Features</h2>
            <div className="space-y-4">
              {/* Extension Enabled */}
              <SettingToggle
                label="Extension Enabled"
                description="Turn PRISM protection on or off"
                enabled={settings.extensionEnabled}
                onToggle={() => handleToggle('extensionEnabled')}
                icon="shield"
              />

              {/* Block Trackers */}
              <SettingToggle
                label="Block Trackers"
                description="Block 200+ tracking domains automatically"
                enabled={settings.blockTrackers}
                onToggle={() => handleToggle('blockTrackers')}
                icon="block"
              />

              {/* Block Fingerprinting */}
              <SettingToggle
                label="Fingerprint Protection"
                description="Prevent Canvas, WebGL, and Audio fingerprinting"
                enabled={settings.blockFingerprinting}
                onToggle={() => handleToggle('blockFingerprinting')}
                icon="fingerprint"
              />

              {/* Manage Cookies */}
              <SettingToggle
                label="Cookie Management"
                description="Monitor and analyze cookie usage"
                enabled={settings.manageCookies}
                onToggle={() => handleToggle('manageCookies')}
                icon="cookie"
              />

              {/* Auto Block */}
              <SettingToggle
                label="Auto-block Threats"
                description="Automatically block detected security threats"
                enabled={settings.autoBlock}
                onToggle={() => handleToggle('autoBlock')}
                icon="auto"
              />

              {/* Strict Mode */}
              <SettingToggle
                label="Strict Mode"
                description="Maximum protection, may break some sites"
                enabled={settings.strictMode}
                onToggle={() => handleToggle('strictMode')}
                icon="strict"
              />

              {/* Notifications */}
              <SettingToggle
                label="Show Notifications"
                description="Get notified about blocked threats"
                enabled={settings.showNotifications}
                onToggle={() => handleToggle('showNotifications')}
                icon="bell"
              />
            </div>
          </div>

          {/* Allowed Websites */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-white">Allowed Websites</h2>
                <p className="text-xs text-slate-400 mt-1">Sites you've manually allowed</p>
              </div>
              {allowedWebsites.length > 0 && (
                <button
                  onClick={clearAllAllowedWebsites}
                  className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs font-medium text-red-300 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {allowedWebsites.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-500">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <p className="text-sm text-slate-400">No allowed websites yet</p>
                <p className="text-xs text-slate-500 mt-1">Websites you allow will appear here</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allowedWebsites.map((domain) => (
                  <div key={domain} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-600/20 hover:border-slate-500/30 transition-all">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          <path d="m9 12 2 2 4-4"/>
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{domain}</p>
                        <p className="text-xs text-slate-400">Always allowed</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeAllowedWebsite(domain)}
                      className="ml-2 p-1.5 bg-slate-600/30 hover:bg-red-500/20 rounded-lg transition-all flex-shrink-0"
                      title="Remove"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 hover:text-red-400">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Reset Settings</p>
                <p className="text-xs text-slate-400 mt-1">Restore default configuration</p>
              </div>
              <button
                onClick={resetToDefaults}
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm font-medium text-white transition-all"
              >
                Reset to Defaults
              </button>
            </div>
          </div>

          {/* Save Indicator */}
          {isSaving && (
            <div className="fixed bottom-4 right-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg px-4 py-2 text-emerald-300 text-sm font-medium">
              ✓ Settings saved
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Toggle Component
interface SettingToggleProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  icon: string;
}

const SettingToggle: React.FC<SettingToggleProps> = ({ label, description, enabled, onToggle, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'shield':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        );
      case 'block':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      case 'fingerprint':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
            <path d="M14 13.12c0 2.38 0 6.38-1 8.88"/>
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/>
            <path d="M2 12a10 10 0 0 1 18-6"/>
            <path d="M2 16h.01"/>
            <path d="M21.8 16c.2-2 .131-5.354 0-6"/>
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/>
            <path d="M8.65 22c.21-.66.45-1.32.57-2"/>
            <path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>
          </svg>
        );
      case 'cookie':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
            <circle cx="8.5" cy="8.5" r="0.5" fill="currentColor"/>
          </svg>
        );
      case 'auto':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
          </svg>
        );
      case 'strict':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        );
      case 'bell':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-slate-700/20 rounded-xl border border-slate-600/20 hover:border-slate-500/30 transition-all">
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-600/20 text-slate-500'
        }`}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-all ${
          enabled ? 'bg-emerald-500' : 'bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};

export default Settings;
