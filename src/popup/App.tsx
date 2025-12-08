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

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/>
    <line x1="12" y1="8" x2="12.01" y2="8"/>
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
  threatsDetected: number;
  cookiesManaged: number;
  requestsAnalyzed: number;
  malwareThreats: number;
  phishingDetected: number;
  privacyRating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  mlRiskScore?: number;  // Live ML risk score (0-100)
  mlRiskLevel?: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mlConfidence?: number; // ML confidence (0-1)
  sslValid?: boolean;    // SSL certificate validation
  sslError?: string | null;
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
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [trustLevel, setTrustLevel] = useState<'trusted' | 'blocked' | 'unknown'>('unknown');
  const [extensionEnabled, setExtensionEnabled] = useState(true);
  const [blockingEnabled, setBlockingEnabled] = useState(true);
  const [featureHealth, setFeatureHealth] = useState<any>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null);
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
    threatsDetected: 0,
    cookiesManaged: 0,
    requestsAnalyzed: 0,
    malwareThreats: 0,
    phishingDetected: 0,
    privacyRating: 'Excellent',
    mlRiskScore: 0,
    mlRiskLevel: 'SAFE',
    mlConfidence: 0,
    sslValid: true,
    sslError: null
  });
  const [mlAnalysis, setMlAnalysis] = useState<any>(null);
  
  // Detail modal states
  const [showThreatsDetail, setShowThreatsDetail] = useState(false);
  const [showCookiesDetail, setShowCookiesDetail] = useState(false);
  const [showRequestsDetail, setShowRequestsDetail] = useState(false);
  const [threatsDetailData, setThreatsDetailData] = useState<any>(null);
  const [cookiesDetailData, setCookiesDetailData] = useState<any>(null);
  const [requestsDetailData, setRequestsDetailData] = useState<any>(null);
  
  // Score breakdown expandable categories state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  useEffect(() => {
    initializeExtension();
    calculateSecurityMetrics();
    loadToggleStates();
    checkFeatureHealth();
    
    // Check if popup was auto-opened and set auto-close timer
    chrome.storage.local.get(['autoOpened', 'autoOpenTime'], (result) => {
      if (result.autoOpened && result.autoOpenTime) {
        const timeSinceOpen = Date.now() - result.autoOpenTime;
        
        // Only auto-close if opened within last 500ms (confirms it's auto-open, not manual)
        if (timeSinceOpen < 500) {
          console.log('🔔 Auto-opened popup - will close in 3 seconds');
          
          // Set 3-second timer to close popup
          const autoCloseTimer = setTimeout(() => {
            console.log('⏰ Auto-closing popup');
            window.close();
          }, 3000);
          
          // Clear the auto-open flag so next manual open doesn't auto-close
          chrome.storage.local.remove(['autoOpened', 'autoOpenTime']);
          
          // Clean up timer on unmount
          return () => clearTimeout(autoCloseTimer);
        } else {
          // Old auto-open flag, clear it
          chrome.storage.local.remove(['autoOpened', 'autoOpenTime']);
        }
      }
    });
    
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

  // Load score breakdown when tab info changes
  useEffect(() => {
    if (tabInfo?.domain) {
      loadScoreBreakdown();
    }
  }, [tabInfo]);

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
        setTabInfo(tabResponse.data);
        
        // === LOAD LIVE ML ANALYSIS ===
        let mlResult = null;
        try {
          const mlData = await chrome.storage.local.get([`ml_result_${domain}`]);
          mlResult = mlData[`ml_result_${domain}`];
          
          if (mlResult && mlResult.analyzed_at) {
            console.log('🧠 ML Analysis loaded:', mlResult);
            setMlAnalysis(mlResult);
          } else {
            console.log('⏳ ML Analysis not yet available for:', domain);
            // Trigger ML analysis by sending message to service worker
            chrome.runtime.sendMessage({ 
              type: 'REQUEST_ML_ANALYSIS', 
              url: `${tabResponse.data.protocol}//${domain}` 
            }).catch(err => console.log('ML analysis request sent:', err));
          }
        } catch (error) {
          console.error('Failed to load ML analysis:', error);
        }
        
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
          const trackers = siteData?.trackersBlocked ?? 0;
          // Use cookiesBlocked for display (total cookies on site)
          const cookies = siteData?.cookiesBlocked ?? 0;
          // Use totalRequests for display (all network requests)
          const requests = siteData?.totalRequests ?? siteData?.requestsAnalyzed ?? 0;
          const threats = siteData?.threatsDetected ?? 0;
          // thirdPartyScripts = <script> tags from external domains (used in Security Report)
          const thirdPartyScripts = siteData?.thirdPartyScripts ?? 0;
          // thirdPartyRequests = network requests to external domains (different from scripts!)
          const thirdPartyRequests = siteData?.thirdPartyRequests ?? 0;
          const hasSSL = tabResponse.data.protocol === 'https:';
          
          // Get the REAL score from score breakdown (same calculation)
          const breakdownResponse = await chrome.runtime.sendMessage({ type: 'GET_SCORE_BREAKDOWN', domain });
          const score = breakdownResponse?.status === 'OK' ? breakdownResponse.data.score : (siteData?.securityScore ?? 100);
          const privacyPolicy = siteData?.privacyPolicyFound ?? false;
          const mixedContent = siteData?.mixedContent ?? false;
          
          // Get ML phishing detection count for current site
          let phishingCount = 0;
          try {
            const detectionResponse = await chrome.runtime.sendMessage({ 
              type: 'GET_ML_DETECTIONS', 
              domain: tabInfo.domain 
            });
            if (detectionResponse?.status === 'OK' && detectionResponse.data) {
              phishingCount = detectionResponse.data.count || 0;
              console.log(`🧠 ML Phishing detections for ${tabInfo.domain}:`, phishingCount);
            }
          } catch (error) {
            console.error('Failed to get ML detections:', error);
          }
          
          // Calculate data collection level based on trackers + cookies + third-party scripts
          const dataScore = trackers + cookies + Math.floor(thirdPartyScripts / 2);
          let dataLevel: 'Minimal' | 'Moderate' | 'High' | 'Excessive' = 'Minimal';
          if (dataScore > 100) dataLevel = 'Excessive';
          else if (dataScore > 50) dataLevel = 'High';
          else if (dataScore > 20) dataLevel = 'Moderate';
          
          console.log('📊 Stats loaded:', { 
            domain, score, trackers, cookies, requests, threats, 
            thirdPartyScripts, // <script> tags from external domains
            thirdPartyRequests, // Network requests to external domains (different!)
            hasSSL, privacyPolicy, mixedContent, phishingCount 
          });
          
          // Use ML data from the loaded result directly (not from state due to async updates)
          const mlRiskScore = mlResult?.risk_score ?? 0;
          const mlRiskLevel = mlResult?.risk_level ?? 'SAFE';
          const mlConfidence = mlResult?.confidence ?? 0;
          const sslValid = mlResult?.ssl_validation?.valid ?? true;
          const sslError = mlResult?.ssl_validation?.error ?? null;
          
          setMetrics({
            overallScore: score,
            trackersBlocked: trackers,
            threatsDetected: threats,
            cookiesManaged: cookies,
            requestsAnalyzed: requests,
            malwareThreats: threats,
            phishingDetected: phishingCount,
            privacyRating: getScoreRating(score) as any,
            mlRiskScore,
            mlRiskLevel,
            mlConfidence,
            sslValid,
            sslError
          });
          
          setSecurityReport({
            hasSSL,
            protocol: tabResponse.data.protocol,
            privacyPolicyFound: privacyPolicy,
            thirdPartyScripts: thirdPartyScripts, // <script> tags from external domains
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

  // Helper to detect special URLs (new tab, chrome pages, etc.)
  const isSpecialUrl = (url: string | undefined): boolean => {
    if (!url) return true;
    return (
      url.startsWith('chrome://') ||
      url.startsWith('edge://') ||
      url.startsWith('about:') ||
      url.startsWith('chrome-extension://') ||
      url === 'newtab' ||
      url === ''
    );
  };

  const checkFeatureHealth = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'CHECK_FEATURE_HEALTH' });
      if (response?.status === 'OK') {
        setFeatureHealth(response.data);
      }
    } catch (error) {
      console.error('Failed to check feature health:', error);
    }
  };

  const loadScoreBreakdown = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SCORE_BREAKDOWN', domain: tabInfo?.domain });
      if (response?.status === 'OK') {
        setScoreBreakdown(response.data);
      }
    } catch (error) {
      console.error('Failed to load score breakdown:', error);
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

  // Detail modal data loading functions
  const loadThreatsDetail = async () => {
    if (!tabInfo?.domain) return;
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_THREAT_DETAILS',
        domain: tabInfo.domain
      });
      
      if (response.status === 'OK') {
        setThreatsDetailData(response.data);
        setShowThreatsDetail(true);
      }
    } catch (error) {
      console.error('Failed to load threat details:', error);
    }
  };

  const loadCookiesDetail = async () => {
    if (!tabInfo?.domain) return;
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_COOKIE_DETAILS',
        domain: tabInfo.domain
      });
      
      if (response.status === 'OK') {
        setCookiesDetailData(response.data);
        setShowCookiesDetail(true);
      }
    } catch (error) {
      console.error('Failed to load cookie details:', error);
    }
  };

  const loadRequestsDetail = async () => {
    if (!tabInfo?.domain) return;
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'GET_REQUEST_DETAILS',
        domain: tabInfo.domain
      });
      
      if (response.status === 'OK') {
        setRequestsDetailData(response.data);
        setShowRequestsDetail(true);
      }
    } catch (error) {
      console.error('Failed to load request details:', error);
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

  // Minimal UI for special URLs (new tab, chrome pages, etc.)
  if (isSpecialUrl(tabInfo?.url)) {
    return (
      <div className="w-[420px] h-[250px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white font-sans relative overflow-hidden flex flex-col items-center justify-center">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
        
        {/* Logo */}
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
            <img src="/icon48.png" alt="PRISM" className="w-14 h-14" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">PRISM</h1>
            <p className="text-sm text-slate-400">v1.1.1 • Phase 7</p>
          </div>
        </div>
        
        {/* Status */}
        <div className="text-center relative z-10 bg-slate-800/40 backdrop-blur-sm border border-emerald-500/30 rounded-xl px-6 py-3 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center justify-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <span className="text-sm font-medium text-emerald-300">Extension Active</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Navigate to a website to view security metrics</p>
        </div>

        {/* Test Sites Button */}
        <div className="relative z-10 mt-4">
          <button
            onClick={async () => {
              const testUrls = [
                'https://www.amazon.com/products',
                'https://stackoverflow.com/questions',
                'http://g00gle-verify.tk/login',
                'http://faceb00k-security.com/verify',
                'http://paypal.secure-account.xyz/update',
                'http://192.168.1.1/admin/login.php',
                'http://paypal.evil-site.xyz/login',
                'https://verify-account-urgent.tk/login',
                'https://dcsdvsdvsdwvv.com/path'
              ];
              
              // Open all URLs with delay to avoid popup blocking
              for (let i = 0; i < testUrls.length; i++) {
                await new Promise(resolve => setTimeout(resolve, i === 0 ? 0 : 300));
                chrome.tabs.create({ url: testUrls[i], active: false });
              }
            }}
            className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-400/50 rounded-xl px-4 py-3 text-sm font-medium text-purple-200 hover:text-purple-100 transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20"
          >
            🧪 Launch Test Sites (9 URLs)
          </button>
          <p className="text-xs text-slate-500 text-center mt-2">
            Opens legitimate & phishing test URLs for demo
          </p>
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

              {/* Info Button */}
              <button
                onClick={async () => {
                  await loadScoreBreakdown();
                  setShowBreakdown(true);
                }}
                className="absolute top-4 right-4 w-7 h-7 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 transition-all"
                title="View Score Breakdown"
              >
                <InfoIcon />
              </button>

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
                        {/* Access Blocked Site Button - Shows when site is blocked */}
                        {trustLevel === 'blocked' && (
                          <button
                            onClick={async () => {
                              if (tabInfo?.domain) {
                                try {
                                  await chrome.runtime.sendMessage({
                                    type: 'BYPASS_BLOCKED_SITE',
                                    domain: tabInfo.domain
                                  });
                                  // Reload the current tab to apply bypass
                                  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                                  if (tabs[0]?.id) {
                                    chrome.tabs.reload(tabs[0].id);
                                  }
                                } catch (error) {
                                  console.error('Failed to bypass site:', error);
                                }
                              }
                            }}
                            className="px-2 py-0.5 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded text-xs font-medium text-orange-300 transition-all"
                            title="Temporarily allow access to this blocked site"
                          >
                            Access Blocked Site
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ML-Powered Phishing Detection - Always Visible */}
        {true && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-6 shadow-2xl shadow-emerald-500/5">{/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-sm">AI Phishing Analysis</h3>
                  <p className="text-xs text-slate-400">Real-time ML-powered detection</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  (mlAnalysis?.risk_level === 'CRITICAL') ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                  (mlAnalysis?.risk_level === 'HIGH') ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                  (mlAnalysis?.risk_level === 'MEDIUM') ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                  (mlAnalysis?.risk_level === 'LOW') ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                }`}>
                  {mlAnalysis?.risk_level || 'ANALYZING'}
                </div>
              </div>

              {/* Risk Score Display */}
              <div className="flex items-center gap-4 mb-4">
                {/* Circular Risk Gauge */}
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke="rgba(148, 163, 184, 0.1)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="42"
                      stroke={
                        (mlAnalysis?.risk_score ?? 0) >= 80 ? '#ef4444' :
                        (mlAnalysis?.risk_score ?? 0) >= 60 ? '#f59e0b' :
                        (mlAnalysis?.risk_score ?? 0) >= 40 ? '#eab308' :
                        (mlAnalysis?.risk_score ?? 0) >= 20 ? '#3b82f6' : '#10b981'
                      }
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - (mlAnalysis?.risk_score ?? 0) / 100)}`}
                      className="transition-all duration-1000 ease-out"
                      style={{
                        filter: `drop-shadow(0 0 6px ${
                          (mlAnalysis?.risk_score ?? 0) >= 80 ? '#ef4444' :
                          (mlAnalysis?.risk_score ?? 0) >= 60 ? '#f59e0b' :
                          (mlAnalysis?.risk_score ?? 0) >= 40 ? '#eab308' :
                          (mlAnalysis?.risk_score ?? 0) >= 20 ? '#3b82f6' : '#10b981'
                        })`
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-2xl font-bold text-white">{mlAnalysis?.risk_score ?? 0}</div>
                    <div className="text-xs text-slate-400">RISK</div>
                  </div>
                </div>

                {/* Risk Details */}
                <div className="flex-1 space-y-2">
                  {/* Confidence */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">Confidence</span>
                      <span className="text-xs font-semibold text-white">{((mlAnalysis?.confidence ?? 0) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-600/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(mlAnalysis?.confidence ?? 0) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* SSL Status */}
                  <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg px-3 py-2">
                    {mlAnalysis?.ssl_validation?.valid ? (
                      <>
                        <span className="text-emerald-400">🔒</span>
                        <span className="text-xs text-emerald-300 font-medium">SSL Certificate Valid</span>
                      </>
                    ) : (
                      <>
                        <span className="text-red-400">⚠️</span>
                        <span className="text-xs text-red-300 font-medium">{mlAnalysis?.ssl_validation?.error ? 'SSL Certificate Invalid' : 'Checking SSL...'}</span>
                      </>
                    )}
                  </div>

                  {/* Verdict */}
                  <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                    mlAnalysis?.is_phishing 
                      ? 'bg-red-500/10 border border-red-500/30' 
                      : 'bg-emerald-500/10 border border-emerald-500/30'
                  }`}>
                    <span className="text-lg">{mlAnalysis?.is_phishing ? '🎣' : '✓'}</span>
                    <span className={`text-xs font-semibold ${
                      mlAnalysis?.is_phishing ? 'text-red-300' : 'text-emerald-300'
                    }`}>
                      {mlAnalysis?.is_phishing ? 'Phishing Detected' : (mlAnalysis ? 'Site Appears Safe' : 'Analyzing...')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed Reasons */}
              {mlAnalysis?.reasons && mlAnalysis.reasons.length > 0 && (
                <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-slate-300">🔍 Detection Details</span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {mlAnalysis.reasons.map((reason: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span className="text-slate-300 flex-1">{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SSL Error Details */}
              {mlAnalysis?.ssl_validation && !mlAnalysis.ssl_validation.valid && mlAnalysis.ssl_validation.error && (
                <div className="mt-3 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 text-xs">⚠️</span>
                    <div className="flex-1">
                      <div className="text-xs font-semibold text-red-300 mb-1">SSL Certificate Error</div>
                      <div className="text-xs text-red-200/80">{mlAnalysis.ssl_validation.error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Timestamp */}
              <div className="mt-4 pt-3 border-t border-slate-600/30 flex items-center justify-between">
                <span className="text-xs text-slate-500">Last analyzed</span>
                <span className="text-xs text-slate-400">
                  {mlAnalysis?.analyzed_at ? new Date(mlAnalysis.analyzed_at).toLocaleTimeString() : 'Pending...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Security Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Threats Detected - Only show when threats exist */}
          {metrics.threatsDetected > 0 && (
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-red-500/20 rounded-2xl p-4 hover:border-red-500/40 transition-all duration-300 shadow-lg shadow-red-500/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-400">
                    <span className="text-lg">⚠️</span>
                  </div>
                  <span className="text-slate-400 text-xs font-medium">Threats</span>
                </div>
                <button
                  onClick={loadThreatsDetail}
                  className="w-5 h-5 bg-slate-700/50 hover:bg-slate-600/50 rounded-md flex items-center justify-center text-slate-400 hover:text-red-400 transition-all"
                  title="View Threat Details"
                >
                  <InfoIcon />
                </button>
              </div>
              <p className="text-2xl font-bold text-white">{metrics.threatsDetected}</p>
              <p className="text-xs text-slate-500 mt-1">Detected</p>
            </div>
          )}

          {/* Cookies Managed */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4 hover:border-emerald-500/40 transition-all duration-300 shadow-lg shadow-emerald-500/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                  <CookieIcon />
                </div>
                <span className="text-slate-400 text-xs font-medium">Cookies</span>
              </div>
              <button
                onClick={loadCookiesDetail}
                className="w-5 h-5 bg-slate-700/50 hover:bg-slate-600/50 rounded-md flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
                title="View Cookie Details"
              >
                <InfoIcon />
              </button>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.cookiesManaged}</p>
            <p className="text-xs text-slate-500 mt-1">Managed</p>
          </div>

          {/* Requests Analyzed */}
          <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4 hover:border-emerald-500/40 transition-all duration-300 shadow-lg shadow-emerald-500/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400">
                  <BarChartIcon />
                </div>
                <span className="text-slate-400 text-xs font-medium">Requests</span>
              </div>
              <button
                onClick={loadRequestsDetail}
                className="w-5 h-5 bg-slate-700/50 hover:bg-slate-600/50 rounded-md flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"
                title="View Request Details"
              >
                <InfoIcon />
              </button>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.requestsAnalyzed}</p>
            <p className="text-xs text-slate-500 mt-1">Analyzed</p>
          </div>
        </div>

        {/* Website Security Report */}
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-5 shadow-lg shadow-emerald-500/5">
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
              <div className="flex items-center gap-3">
                <span className="text-slate-400">PRISM v1.1.1</span>
                <span className="text-slate-500">Phase 7</span>
              </div>
              {featureHealth && (
                <button
                  onClick={() => checkFeatureHealth()}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    featureHealth.allHealthy
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                  }`}
                  title="Feature Health Check"
                >
                  {featureHealth.allHealthy ? '✓ All Systems OK' : `⚠ ${featureHealth.issueCount} Issues`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Score Breakdown Modal */}
      {showBreakdown && scoreBreakdown && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Score Breakdown</h3>
                <button
                  onClick={() => setShowBreakdown(false)}
                  className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              {/* Overall Score */}
              <div className="bg-slate-700/30 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 font-medium">Overall Score</span>
                  <span className="text-2xl font-bold" style={{ color: getScoreColor(scoreBreakdown.score) }}>
                    {scoreBreakdown.score}/100
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {scoreBreakdown.riskLevel.charAt(0).toUpperCase() + scoreBreakdown.riskLevel.slice(1)} Security
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="space-y-3 mb-4">
                {Object.entries(scoreBreakdown.breakdown).map(([category, data]: [string, any]) => {
                  const isExpanded = expandedCategories.has(category);
                  return (
                    <div key={category} className="bg-slate-700/20 rounded-lg overflow-hidden">
                      <div 
                        className="p-3 cursor-pointer hover:bg-slate-700/30 transition-all"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <button className="w-5 h-5 bg-slate-700/50 hover:bg-slate-600/50 rounded-md flex items-center justify-center text-slate-400 transition-all">
                              <InfoIcon />
                            </button>
                            <span className="text-sm font-medium text-white capitalize">
                              {category.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">×{data.weight}%</span>
                            <span className="text-sm font-bold text-emerald-400">
                              {data.weightedScore.toFixed(1)}
                            </span>
                            <span className={`text-xs text-slate-500 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-slate-600/50 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-500"
                              style={{ width: `${data.score}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400 w-10 text-right">{data.score}/100</span>
                        </div>
                        {!isExpanded && data.issues.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-orange-400 flex items-start gap-1">
                              <span>•</span>
                              <span>{data.issues[0]}</span>
                            </div>
                            {data.issues.length > 1 && (
                              <div className="text-xs text-slate-500 mt-1">
                                +{data.issues.length - 1} more issue{data.issues.length > 2 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-3 border-t border-slate-600/30 pt-3">
                          {/* Score Details */}
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <div className="text-xs font-semibold text-slate-300 mb-2">Score Calculation</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-slate-400">Base Score:</div>
                              <div className="text-white text-right">{data.score}/100</div>
                              <div className="text-slate-400">Weight:</div>
                              <div className="text-white text-right">{data.weight}%</div>
                              <div className="text-slate-400 font-semibold">Contribution:</div>
                              <div className="text-emerald-400 text-right font-semibold">{data.weightedScore.toFixed(2)} pts</div>
                            </div>
                          </div>
                          
                          {/* Issues */}
                          {data.issues.length > 0 && (
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                              <div className="text-xs font-semibold text-orange-400 mb-2">⚠ Issues Detected</div>
                              <div className="space-y-1">
                                {data.issues.map((issue: string, idx: number) => (
                                  <div key={idx} className="text-xs text-orange-300 flex items-start gap-1">
                                    <span>•</span>
                                    <span>{issue}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Recommendations */}
                          {data.recommendations && data.recommendations.length > 0 && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                              <div className="text-xs font-semibold text-blue-400 mb-2">💡 Recommendations</div>
                              <div className="space-y-1">
                                {data.recommendations.map((rec: string, idx: number) => (
                                  <div key={idx} className="text-xs text-blue-300 flex items-start gap-1">
                                    <span>•</span>
                                    <span>{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* No issues - positive feedback */}
                          {data.issues.length === 0 && (!data.recommendations || data.recommendations.length === 0) && (
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                              <div className="text-2xl mb-1">✓</div>
                              <div className="text-xs text-emerald-300">No issues detected in this category</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Global Penalties */}
              {scoreBreakdown.globalPenalties && scoreBreakdown.globalPenalties.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                  <div className="text-xs font-semibold text-red-400 mb-2">⚠ Critical Issues</div>
                  <div className="space-y-1">
                    {scoreBreakdown.globalPenalties.map((penalty: string, idx: number) => (
                      <div key={idx} className="text-xs text-red-300">• {penalty}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Recommendations */}
              {scoreBreakdown.recommendations && scoreBreakdown.recommendations.length > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-xs font-semibold text-blue-400 mb-2">💡 Recommendations</div>
                  <div className="space-y-1">
                    {scoreBreakdown.recommendations.slice(0, 3).map((rec: string, idx: number) => (
                      <div key={idx} className="text-xs text-blue-300">• {rec}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Threats Detail Modal */}
      {showThreatsDetail && threatsDetailData && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Threat Details</h3>
                <button
                  onClick={() => setShowThreatsDetail(false)}
                  className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-400">Total Threats</span>
                    <span className="text-lg font-bold text-red-400">{threatsDetailData.count}</span>
                  </div>
                  <div className="text-xs text-slate-500">Domain: {threatsDetailData.domain}</div>
                </div>

                {threatsDetailData.threats.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <div className="text-4xl mb-2">✓</div>
                    <div className="text-sm">No threats detected</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {threatsDetailData.threats.map((threat: any, idx: number) => (
                      <div key={idx} className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-red-400 text-lg mt-0.5">⚠️</span>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-red-300 mb-1">{threat.name || threat.type}</div>
                            <div className="text-xs text-slate-400 mb-1">Type: {threat.type}</div>
                            {threat.description && (
                              <div className="text-xs text-slate-300">{threat.description}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cookies Detail Modal */}
      {showCookiesDetail && cookiesDetailData && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Cookie Details</h3>
                <button
                  onClick={() => setShowCookiesDetail(false)}
                  className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1">Total</div>
                    <div className="text-lg font-bold text-white">{cookiesDetailData.total}</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-emerald-400 mb-1">First-Party</div>
                    <div className="text-lg font-bold text-emerald-300">{cookiesDetailData.firstParty.length}</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-yellow-400 mb-1">Third-Party</div>
                    <div className="text-lg font-bold text-yellow-300">{cookiesDetailData.thirdParty.length}</div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500">Domain: {cookiesDetailData.domain}</div>
                </div>

                {/* First-Party Cookies */}
                {cookiesDetailData.firstParty.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-emerald-400">First-Party Cookies</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cookiesDetailData.firstParty.slice(0, 10).map((cookie: any, idx: number) => (
                        <div key={idx} className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                          <div className="text-xs font-semibold text-emerald-300 mb-1">{cookie.name}</div>
                          <div className="text-xs text-slate-400">Domain: {cookie.domain}</div>
                          <div className="flex gap-2 mt-1">
                            {cookie.secure && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">🔒 Secure</span>}
                            {cookie.httpOnly && <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">HTTP Only</span>}
                          </div>
                        </div>
                      ))}
                      {cookiesDetailData.firstParty.length > 10 && (
                        <div className="text-xs text-slate-500 text-center py-2">
                          ... and {cookiesDetailData.firstParty.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Third-Party Cookies */}
                {cookiesDetailData.thirdParty.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-yellow-400">Third-Party Cookies</div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {cookiesDetailData.thirdParty.slice(0, 10).map((cookie: any, idx: number) => (
                        <div key={idx} className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                          <div className="text-xs font-semibold text-yellow-300 mb-1">{cookie.name}</div>
                          <div className="text-xs text-slate-400">Domain: {cookie.domain}</div>
                          <div className="flex gap-2 mt-1">
                            {cookie.secure && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">🔒 Secure</span>}
                            {cookie.httpOnly && <span className="text-xs bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">HTTP Only</span>}
                          </div>
                        </div>
                      ))}
                      {cookiesDetailData.thirdParty.length > 10 && (
                        <div className="text-xs text-slate-500 text-center py-2">
                          ... and {cookiesDetailData.thirdParty.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests Detail Modal */}
      {showRequestsDetail && requestsDetailData && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Request Details</h3>
                <button
                  onClick={() => setShowRequestsDetail(false)}
                  className="w-8 h-8 bg-slate-700/50 hover:bg-slate-600 rounded-lg flex items-center justify-center text-slate-400 hover:text-white transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1">Total</div>
                    <div className="text-lg font-bold text-white">{requestsDetailData.total}</div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-emerald-400 mb-1">First-Party</div>
                    <div className="text-lg font-bold text-emerald-300">{requestsDetailData.firstParty}</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-center">
                    <div className="text-xs text-yellow-400 mb-1">Third-Party</div>
                    <div className="text-lg font-bold text-yellow-300">{requestsDetailData.thirdParty}</div>
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                  <div className="text-xs text-slate-500 mb-2">Domain: {requestsDetailData.domain}</div>
                  <div className="text-xs text-slate-400">
                    Third-Party Ratio: {requestsDetailData.total > 0 
                      ? ((requestsDetailData.thirdParty / requestsDetailData.total) * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>

                {/* Third-Party Domains */}
                {requestsDetailData.thirdPartyDomains && requestsDetailData.thirdPartyDomains.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-yellow-400">Third-Party Domains</div>
                    <div className="space-y-1 max-h-64 overflow-y-auto bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                      {requestsDetailData.thirdPartyDomains.slice(0, 20).map((domain: string, idx: number) => (
                        <div key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-yellow-400">•</span>
                          <span className="break-all">{domain}</span>
                        </div>
                      ))}
                      {requestsDetailData.thirdPartyDomains.length > 20 && (
                        <div className="text-xs text-slate-500 text-center py-2 border-t border-slate-700/50 mt-2">
                          ... and {requestsDetailData.thirdPartyDomains.length - 20} more domains
                        </div>
                      )}
                      {requestsDetailData.thirdPartyDomains.length === 0 && (
                        <div className="text-xs text-slate-500 text-center py-4">
                          No third-party domains detected
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
