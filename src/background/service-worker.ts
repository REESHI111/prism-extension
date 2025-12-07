/**
 * PRISM Background Service Worker
 * Phase 2: Real Tracker Blocking & Statistics
 * Phase 3: Fingerprint Detection Tracking
 * Phase 5: ML Phishing Detection
 */

import { StatsManager } from '../utils/stats-manager';
import { HistoryTracker } from '../utils/history-tracker';
import { TrustManager } from '../utils/trust-manager';
import { isTrackerDomain, getTrackerCategory } from '../utils/enhanced-tracker-database';
import { getMLDetector } from '../utils/ml-phishing-detector';

console.log('🛡️ PRISM Service Worker Loaded - Phase 5 - Live ML Integration');

const stats = StatsManager.getInstance();
const history = HistoryTracker.getInstance();
const trust = TrustManager.getInstance();

// Track fingerprint attempts per domain
const fingerprintAttempts = new Map<string, Map<string, number>>();

// Track ML phishing detections per domain
const mlPhishingDetections = new Map<string, {
  url: string;
  confidence: number;
  riskLevel: string;
  timestamp: number;
  count: number;
}>();

// Track blocked requests per tab
const tabBlockedRequests = new Map<number, Set<string>>();
const tabCookieCounts = new Map<number, number>();
const tabThirdPartyDomains = new Map<number, Set<string>>();
const tabRequestCounts = new Map<number, { total: number; thirdParty: number }>();
const tabUniqueRequests = new Map<number, Set<string>>(); // Deduplicate requests

// Real-time tracking variables
const cookieCheckInterval = 2000; // Check cookies every 2 seconds
let currentTabId: number | null = null;
let currentDomain: string | null = null;

// Settings cache for synchronous access
let extensionEnabled = true;
let blockingEnabled = true;

// Load settings on startup
chrome.storage.local.get(['extensionEnabled', 'blockingEnabled'], (result) => {
  extensionEnabled = result.extensionEnabled !== false;
  blockingEnabled = result.blockingEnabled !== false;
});

// Listen for settings changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local') {
    if (changes.extensionEnabled) {
      extensionEnabled = changes.extensionEnabled.newValue !== false;
    }
    if (changes.blockingEnabled) {
      blockingEnabled = changes.blockingEnabled.newValue !== false;
    }
  }
});

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ PRISM Extension Installed - Phase 5');
  
  chrome.storage.local.set({
    extensionActive: true,
    version: '1.0.0',
    phase: 5, // Phase 5: ML-Powered Threat Detection
    installDate: new Date().toISOString()
  });
  
  // Initialize current tab tracking
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      try {
        const url = new URL(tabs[0].url);
        currentTabId = tabs[0].id || null;
        currentDomain = url.hostname;
      } catch (e) {}
    }
  });
});

// Temporary bypass for manually allowed blocked sites
const bypassedSites = new Set<string>();

// Block tracking requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const { url, tabId, type } = details;
    
    // Check if blocking is enabled (use cached settings for synchronous access)
    if (!blockingEnabled || !extensionEnabled) {
      return { cancel: false }; // Don't block if disabled
    }
    
    // Check if site is temporarily bypassed
    try {
      const urlObj = new URL(url);
      if (bypassedSites.has(urlObj.hostname)) {
        return { cancel: false }; // Allow bypassed sites
      }
    } catch (e) {}
    
    // Check if URL is a tracker
    if (isTrackerDomain(url)) {
      console.log(`🚫 Blocked tracker: ${url}`);
      
      // Track blocked request
      if (tabId > 0) {
        if (!tabBlockedRequests.has(tabId)) {
          tabBlockedRequests.set(tabId, new Set());
        }
        tabBlockedRequests.get(tabId)?.add(url);
        
        // Update stats
        chrome.tabs.get(tabId, (tab) => {
          if (tab?.url) {
            try {
              const domain = new URL(tab.url).hostname;
              stats.incrementTrackerBlocked(domain);
              
              // Record tracker block in history
              history.recordTrackerBlock();
              
              // Notify popup of update
              chrome.runtime.sendMessage({
                type: 'STATS_UPDATED',
                domain,
                stats: stats.getSiteStats(domain)
              }).catch(() => {});
            } catch (e) {}
          }
        });
      }
      
      return { cancel: true };
    }
    
    return { cancel: false };
  },
  { urls: ['<all_urls>'] },
  ['blocking']
);

// Warning overlay injection function
function showWarningOverlay(tabId: number, reason: string) {
  chrome.tabs.sendMessage(tabId, {
    type: 'SHOW_WARNING',
    payload: { reason }
  }).catch(() => {
    // Content script not ready yet, will check on tab load
  });
}

// Monitor IMPORTANT requests for real-time analysis (not every pixel/icon)
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const { tabId, url, type } = details;
    
    if (tabId > 0) {
      try {
        const requestUrl = new URL(url);
        const requestDomain = requestUrl.hostname;
        
        // Get current tab to compare domains
        chrome.tabs.get(tabId, (tab) => {
          if (tab?.url) {
            try {
              const tabUrl = new URL(tab.url);
              const tabDomain = tabUrl.hostname;
              
              // Only count meaningful requests (not images, fonts, icons, media)
              const meaningfulTypes = ['main_frame', 'sub_frame', 'script', 'xmlhttprequest', 'fetch'];
              if (meaningfulTypes.includes(type)) {
                // Initialize unique request tracker for this tab
                if (!tabUniqueRequests.has(tabId)) {
                  tabUniqueRequests.set(tabId, new Set());
                }
                
                // Normalize URL to prevent query param duplicates (keep base URL + path)
                const normalizedUrl = `${requestUrl.origin}${requestUrl.pathname}`;
                const uniqueRequests = tabUniqueRequests.get(tabId)!;
                
                // Only count if this is a NEW unique request
                if (!uniqueRequests.has(normalizedUrl)) {
                  uniqueRequests.add(normalizedUrl);
                  
                  // Initialize request counts
                  if (!tabRequestCounts.has(tabId)) {
                    tabRequestCounts.set(tabId, { total: 0, thirdParty: 0 });
                  }
                  const counts = tabRequestCounts.get(tabId)!;
                  
                  // Cap at 500 unique requests per session (prevent inflation from infinite scroll)
                  if (counts.total < 500) {
                    counts.total++;
                    
                    // Count third-party requests
                    if (requestDomain !== tabDomain && !requestDomain.includes(tabDomain)) {
                      counts.thirdParty++;
                    }
                    
                    // Update stats with request metrics
                    stats.updateRequestMetrics(tabDomain, counts.total, counts.thirdParty);
                  }
                }
                
                // Still track for informational purposes (no cap on this)
                stats.incrementRequestAnalyzed(tabDomain);
              }
              
              // Track third-party domains
              if (requestDomain !== tabDomain && !requestDomain.includes(tabDomain)) {
                if (!tabThirdPartyDomains.has(tabId)) {
                  tabThirdPartyDomains.set(tabId, new Set());
                }
                tabThirdPartyDomains.get(tabId)!.add(requestDomain);
              }
              
              // Update third-party script count ONLY for scripts (REAL count)
              if (type === 'script' && requestDomain !== tabDomain && !requestDomain.includes(tabDomain)) {
                const thirdPartyCount = Array.from(tabThirdPartyDomains.get(tabId) || []).filter(domain => {
                  // Count unique third-party domains
                  return domain !== tabDomain && !domain.includes(tabDomain);
                }).length;
                stats.updateThirdPartyScripts(tabDomain, thirdPartyCount);
              }
              
              // Check for mixed content
              if (tabUrl.protocol === 'https:' && requestUrl.protocol === 'http:') {
                stats.updateMixedContent(tabDomain, true);
              }
            } catch (e) {}
          }
        });
      } catch (e) {}
    }
  },
  { urls: ['<all_urls>'] }
);

// Real-time cookie counting for current tab
function updateCookieCount() {
  if (!currentDomain || !currentTabId) return;
  
  // Query actual cookies for current domain
  chrome.cookies.getAll({ domain: currentDomain }, (cookies) => {
    const cookieCount = cookies.length;
    const previousCount = tabCookieCounts.get(currentTabId!) || 0;
    
    if (cookieCount !== previousCount) {
      tabCookieCounts.set(currentTabId!, cookieCount);
      
      // Analyze cookie security attributes
      const secureCookies = cookies.filter(c => c.secure).length;
      const httpOnlyCookies = cookies.filter(c => c.httpOnly).length;
      const sameSiteCookies = cookies.filter(c => c.sameSite && c.sameSite !== 'no_restriction').length;
      
      // Detect third-party cookies (domain doesn't match current domain)
      const thirdPartyCookies = cookies.filter(c => {
        const cookieDomain = c.domain.replace(/^\./, ''); // Remove leading dot
        return !currentDomain!.includes(cookieDomain) && !cookieDomain.includes(currentDomain!);
      }).length;
      
      // Update stats with enhanced cookie metrics
      stats.updateEnhancedCookieMetrics(currentDomain!, {
        total: cookieCount,
        secure: secureCookies,
        httpOnly: httpOnlyCookies,
        sameSite: sameSiteCookies,
        thirdParty: thirdPartyCookies
      });
      
      // Notify popup of change
      chrome.runtime.sendMessage({
        type: 'STATS_UPDATED',
        domain: currentDomain,
        stats: stats.getSiteStats(currentDomain!)
      }).catch(() => {});
    }
  });
}

// Start cookie monitoring interval
setInterval(updateCookieCount, cookieCheckInterval);

// Record daily average score
let lastScoreRecordDate = new Date().toDateString();
setInterval(() => {
  const today = new Date().toDateString();
  if (today !== lastScoreRecordDate) {
    // New day - record yesterday's average score
    const avgScore = stats.getAveragePrivacyScore();
    if (avgScore > 0) {
      history.recordDailyScore(avgScore);
    }
    lastScoreRecordDate = today;
  }
}, 3600000); // Check every hour

// Track active tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  currentTabId = activeInfo.tabId;
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab?.url) {
      try {
        const url = new URL(tab.url);
        currentDomain = url.hostname;
        
        // Update protocol info
        stats.updateSiteProtocol(currentDomain, url.protocol, url.protocol === 'https:');
        
        // Immediately count cookies for this domain
        updateCookieCount();
      } catch (e) {}
    }
  });
});

// Track when tab URL changes
// Track last auto-launched domain to prevent repeated launches on same domain
let lastAutoLaunchedDomain: string | null = null;

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    try {
      const url = new URL(changeInfo.url);
      currentTabId = tabId;
      currentDomain = url.hostname;
      
      // Update protocol info
      stats.updateSiteProtocol(currentDomain, url.protocol, url.protocol === 'https:');
      
      // Reset third-party tracking for new page
      tabThirdPartyDomains.delete(tabId);
      tabRequestCounts.delete(tabId);
      tabUniqueRequests.delete(tabId); // Reset unique request tracking on navigation
      
      // Count cookies immediately
      updateCookieCount();
      
      // ===== LIVE ML PHISHING DETECTION =====
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        console.log(`🧠 Analyzing URL with live ML: ${changeInfo.url}`);
        
        // Analyze with ML model
        const detector = await getMLDetector();
        const prediction = detector.classify(changeInfo.url);
        const mlResult = {
          url: changeInfo.url,
          is_phishing: prediction.isPhishing,
          confidence: prediction.confidence,
          risk_score: Math.round(prediction.confidence * 100),
          risk_level: prediction.confidence >= 0.90 ? 'CRITICAL' :
                     prediction.confidence >= 0.75 ? 'HIGH' :
                     prediction.confidence >= 0.50 ? 'MEDIUM' :
                     prediction.confidence >= 0.25 ? 'LOW' : 'SAFE',
          ssl_validation: {
            valid: changeInfo.url.startsWith('https://'),
            issuer: null,
            days_until_expiry: null,
            error: null
          },
          reasons: [],
          timestamp: new Date().toISOString()
        };
        
        if (mlResult) {
          console.log(`   ML Result: ${mlResult.is_phishing ? '⚠️ PHISHING' : '✅ SAFE'} (${mlResult.risk_score}/100)`);
          console.log(`   Risk Level: ${mlResult.risk_level}`);
          console.log(`   SSL Valid: ${mlResult.ssl_validation.valid ? '✅' : '❌'}`);
          
          // Store ML result for this domain
          mlPhishingDetections.set(currentDomain, {
            url: changeInfo.url,
            confidence: mlResult.confidence,
            riskLevel: mlResult.risk_level,
            timestamp: Date.now(),
            count: 1
          });
          
          // Update stats with ML analysis
          if (mlResult.is_phishing) {
            stats.addThreatDetail(currentDomain, {
              id: `ml-phishing-${Date.now()}`,
              type: 'Phishing',
              name: `ML Detected Phishing (${mlResult.risk_level})`,
              description: `ML confidence: ${(mlResult.confidence * 100).toFixed(1)}%, Risk: ${mlResult.risk_score}/100, SSL: ${mlResult.ssl_validation.valid ? 'Valid' : 'Invalid'}, Reasons: ${mlResult.reasons.join(', ')}`
            });
          }
          
          // Store ML result in storage for popup access
          chrome.storage.local.set({
            [`ml_result_${currentDomain}`]: {
              ...mlResult,
              analyzed_at: Date.now()
            }
          });
        }
      }
      
      // Auto-launch popup for 3 seconds on page load (only for regular websites and domain changes)
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        // Only auto-launch if domain has changed (prevent repeated launches on internal navigation)
        if (lastAutoLaunchedDomain !== currentDomain) {
          lastAutoLaunchedDomain = currentDomain;
          
          // Mark as auto-opened so popup knows to auto-close
          chrome.storage.local.set({ autoOpened: true, autoOpenTime: Date.now() }, () => {
            // Open popup using action API
            chrome.action.openPopup().catch(() => {
              // Silently fail if popup can't be opened (e.g., user is interacting with page)
              console.log('Could not auto-open popup (user may be busy)');
            });
          });
        } else {
          console.log('Skipping auto-launch: same domain navigation');
        }
      }
    } catch (e) {
      console.error('Error in tab update handler:', e);
    }
  }
});

// Clean up tab data when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabBlockedRequests.delete(tabId);
  tabCookieCounts.delete(tabId);
  tabThirdPartyDomains.delete(tabId);
  tabRequestCounts.delete(tabId);
  tabUniqueRequests.delete(tabId); // Clean up unique request tracking
  
  if (currentTabId === tabId) {
    currentTabId = null;
    currentDomain = null;
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message.type);

  switch (message.type) {
    case 'ML_PHISHING_DETECTED':
      // Track ML phishing detection
      {
        const { url, prediction, severity } = message;
        try {
          const domain = new URL(url).hostname;
          
          // Store detection
          const existing = mlPhishingDetections.get(domain);
          mlPhishingDetections.set(domain, {
            url,
            confidence: prediction.confidence,
            riskLevel: prediction.riskLevel,
            timestamp: Date.now(),
            count: existing ? existing.count + 1 : 1
          });
          
          console.log(`🧠 ML Phishing detected: ${domain} (${(prediction.confidence * 100).toFixed(1)}%)`);
          console.log(`   Risk Level: ${prediction.riskLevel}`);
          console.log(`   Reason: ${prediction.blockedReason || 'Multiple suspicious patterns'}`);
          
          // Add detailed threat information (prevents duplicates)
          stats.addThreatDetail(domain, {
            id: `ml-phishing-${domain}`,
            type: 'Phishing',
            name: `Potential Phishing Site (${prediction.riskLevel} Risk)`,
            description: prediction.blockedReason || 'Multiple suspicious URL patterns detected'
          });
          
          // Store in chrome storage for persistence
          chrome.storage.local.get(['mlDetections'], (result) => {
            const detections = result.mlDetections || {};
            detections[domain] = {
              url,
              confidence: prediction.confidence,
              riskLevel: prediction.riskLevel,
              timestamp: Date.now(),
              features: prediction.features
            };
            
            chrome.storage.local.set({ mlDetections: detections });
          });
          
          sendResponse({ status: 'OK', message: 'Phishing detection recorded' });
        } catch (error) {
          console.error('Error processing ML detection:', error);
          sendResponse({ status: 'ERROR', message: 'Invalid URL' });
        }
      }
      break;

    case 'ML_URL_SAFE':
      // Track safe URL
      {
        const { url, prediction } = message;
        try {
          const domain = new URL(url).hostname;
          console.log(`✅ ML: ${domain} appears safe (${(prediction.confidence * 100).toFixed(1)}% phishing probability)`);
          sendResponse({ status: 'OK' });
        } catch (error) {
          sendResponse({ status: 'ERROR', message: 'Invalid URL' });
        }
      }
      break;

    case 'GET_ML_DETECTIONS':
      // Get ML phishing detections for a domain
      {
        const { domain } = message;
        const detection = mlPhishingDetections.get(domain);
        
        if (detection) {
          sendResponse({
            status: 'OK',
            data: detection
          });
        } else {
          sendResponse({
            status: 'OK',
            data: null
          });
        }
      }
      break;

    case 'PING':
      sendResponse({ status: 'OK', message: 'Service worker active' });
      break;

    case 'GET_STATUS':
      chrome.storage.local.get(['extensionActive', 'version', 'phase', 'installDate'], (result) => {
        sendResponse({
          status: 'OK',
          data: {
            active: result.extensionActive ?? true,
            version: result.version ?? '1.0.0',
            phase: result.phase ?? 3,
            installDate: result.installDate
          }
        });
      });
      return true;

    case 'GET_TAB_INFO':
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (tab?.url) {
          try {
            const url = new URL(tab.url);
            sendResponse({
              status: 'OK',
              data: {
                url: tab.url,
                domain: url.hostname,
                protocol: url.protocol,
                title: tab.title
              }
            });
          } catch (error) {
            sendResponse({ status: 'ERROR', message: 'Invalid URL' });
          }
        } else {
          sendResponse({ status: 'ERROR', message: 'No active tab' });
        }
      });
      return true;

    case 'FINGERPRINT_DETECTED':
      // Track fingerprint detection attempts (HIGH severity - no warning overlay)
      const { domain, method } = message;
      if (!fingerprintAttempts.has(domain)) {
        fingerprintAttempts.set(domain, new Map());
      }
      const domainAttempts = fingerprintAttempts.get(domain)!;
      domainAttempts.set(method, (domainAttempts.get(method) || 0) + 1);
      
      console.log(`🛡️ Fingerprint blocked: ${method} on ${domain}`);
      
      // Only increment fingerprint counter (NOT threatsDetected)
      // Fingerprinting is HIGH severity - tracked silently, no overlay
      stats.incrementFingerprintAttempt(domain);
      
      sendResponse({ status: 'OK' });
      break;

    case 'PRIVACY_POLICY_DETECTED':
      // Track privacy policy detection
      const { domain: ppDomain, found } = message;
      stats.updatePrivacyPolicy(ppDomain, found);
      console.log(`🔍 Privacy policy ${found ? 'found' : 'not found'} on ${ppDomain}`);
      sendResponse({ status: 'OK' });
      break;

    case 'GET_SITE_STATS':
      const { domain: siteDomain } = message;
      
      // Get fresh cookie count for current tab
      if (siteDomain === currentDomain && currentTabId) {
        chrome.cookies.getAll({ domain: siteDomain }, (cookies) => {
          const actualCookieCount = cookies.length;
          
          // Analyze cookie security attributes
          const secureCookies = cookies.filter(c => c.secure).length;
          const httpOnlyCookies = cookies.filter(c => c.httpOnly).length;
          const sameSiteCookies = cookies.filter(c => c.sameSite && c.sameSite !== 'no_restriction').length;
          const thirdPartyCookies = cookies.filter(c => {
            const cookieDomain = c.domain.replace(/^\./, '');
            return !siteDomain.includes(cookieDomain) && !cookieDomain.includes(siteDomain);
          }).length;
          
          // Update stats with enhanced cookie metrics
          stats.updateEnhancedCookieMetrics(siteDomain, {
            total: actualCookieCount,
            secure: secureCookies,
            httpOnly: httpOnlyCookies,
            sameSite: sameSiteCookies,
            thirdParty: thirdPartyCookies
          });
          
          // Get updated stats
          const siteStats = stats.getSiteStats(siteDomain);
          
          // Add fingerprint attempts to stats
          const fingerprints = fingerprintAttempts.get(siteDomain);
          let totalFingerprints = 0;
          if (fingerprints) {
            for (const count of fingerprints.values()) {
              totalFingerprints += count;
            }
          }
          
          // If we have stored stats, use them; otherwise create new stats with calculated score
          if (siteStats) {
            sendResponse({
              status: 'OK',
              data: {
                ...siteStats,
                fingerprintAttempts: totalFingerprints,
                cookiesBlocked: actualCookieCount
              }
            });
          } else {
            // No stats yet for this site - initialize with real-time data
            // Calculate proper security score based on available data instead of defaulting to 100
            const initialData = {
              domain: siteDomain,
              trackersBlocked: 0,
              cookiesBlocked: actualCookieCount,
              fingerprintAttempts: totalFingerprints,
              requestsAnalyzed: 0,
              threatsDetected: 0,
              hasSSL: true, // Will be updated from tab info
              privacyPolicyFound: false,
              thirdPartyScripts: 0,
              mixedContent: false,
              protocol: 'https:'
            };
            
            // Calculate proper security score based on cookies, fingerprints, etc.
            const calculatedScore = stats.calculateScoreForSite(initialData);
            
            sendResponse({
              status: 'OK',
              data: {
                ...initialData,
                securityScore: calculatedScore,
                timestamp: Date.now()
              }
            });
          }
        });
        return true; // Async response
      } else {
        // Not current tab, use cached stats
        const siteStats = stats.getSiteStats(siteDomain);
        const fingerprints = fingerprintAttempts.get(siteDomain);
        let totalFingerprints = 0;
        if (fingerprints) {
          for (const count of fingerprints.values()) {
            totalFingerprints += count;
          }
        }
        
        if (siteStats) {
          sendResponse({
            status: 'OK',
            data: {
              ...siteStats,
              fingerprintAttempts: totalFingerprints
            }
          });
        } else {
          sendResponse({
            status: 'OK',
            data: {
              domain: siteDomain,
              trackersBlocked: 0,
              cookiesBlocked: 0,
              requestsAnalyzed: 0,
              threatsDetected: 0,
              securityScore: 100,
              timestamp: Date.now(),
              fingerprintAttempts: totalFingerprints
            }
          });
        }
      }
      break;

    case 'GET_GLOBAL_STATS':
      sendResponse({
        status: 'OK',
        data: stats.getGlobalStats()
      });
      break;

    case 'GET_ALL_SITE_STATS':
      sendResponse({
        status: 'OK',
        data: stats.getAllSiteStats()
      });
      break;

    case 'GET_TOP_BLOCKED_DOMAINS':
      sendResponse({
        status: 'OK',
        data: stats.getTopBlockedDomains(message.limit || 5)
      });
      break;

    case 'GET_AVERAGE_SCORE':
      sendResponse({
        status: 'OK',
        data: stats.getAveragePrivacyScore()
      });
      break;

    case 'GET_SCORE_HISTORY':
      history.getScoreHistory().then(data => {
        sendResponse({
          status: 'OK',
          data
        });
      });
      return true; // Async response

    case 'GET_TRACKER_TIMELINE':
      history.getTrackerTimeline().then(data => {
        sendResponse({
          status: 'OK',
          data
        });
      });
      return true; // Async response

    case 'RECORD_DAILY_SCORE':
      history.recordDailyScore(message.score).then(() => {
        sendResponse({ status: 'OK' });
      });
      return true; // Async response

    case 'GET_TRUST_LEVEL':
      sendResponse({
        status: 'OK',
        data: trust.getTrustLevel(message.domain)
      });
      break;

    case 'ADD_TRUSTED_SITE':
      trust.addTrustedSite(message.domain, message.reason);
      sendResponse({ status: 'OK' });
      break;

    case 'BYPASS_BLOCKED_SITE':
      // Temporarily allow access to a blocked site
      if (message.domain) {
        bypassedSites.add(message.domain);
        console.log(`✅ Temporarily bypassed: ${message.domain}`);
        sendResponse({ status: 'OK', message: 'Site access granted' });
      } else {
        sendResponse({ status: 'ERROR', message: 'No domain provided' });
      }
      break;

    case 'REMOVE_BYPASS':
      // Remove bypass for a site
      if (message.domain) {
        bypassedSites.delete(message.domain);
        console.log(`🚫 Removed bypass for: ${message.domain}`);
        sendResponse({ status: 'OK', message: 'Bypass removed' });
      }
      break;

    case 'ADD_BLOCKED_SITE':
      trust.addBlockedSite(message.domain, message.reason);
      sendResponse({ status: 'OK' });
      break;

    case 'REMOVE_TRUSTED_SITE':
      trust.removeTrustedSite(message.domain);
      sendResponse({ status: 'OK' });
      break;

    case 'REMOVE_BLOCKED_SITE':
      trust.removeBlockedSite(message.domain);
      sendResponse({ status: 'OK' });
      break;

    case 'GET_ALL_TRUSTED_SITES':
      sendResponse({
        status: 'OK',
        data: trust.getAllTrustedSites()
      });
      break;

    case 'GET_ALL_BLOCKED_SITES':
      sendResponse({
        status: 'OK',
        data: trust.getAllBlockedSites()
      });
      break;

    case 'RESET_SITE_STATS':
      stats.resetSiteStats(message.domain);
      if (sender.tab?.id) {
        tabBlockedRequests.delete(sender.tab.id);
        tabCookieCounts.delete(sender.tab.id);
      }
      fingerprintAttempts.delete(message.domain);
      sendResponse({ status: 'OK' });
      break;

    case 'CHECK_FEATURE_HEALTH':
      // Run comprehensive feature health check
      (async () => {
        try {
          const { FeatureHealthChecker } = await import('../utils/feature-health-checker');
          const checker = FeatureHealthChecker.getInstance();
          const report = await checker.checkAllFeatures();
          sendResponse({ status: 'OK', data: report });
        } catch (error) {
          console.error('Feature health check failed:', error);
          sendResponse({ 
            status: 'ERROR', 
            data: { 
              allHealthy: false, 
              issueCount: 1, 
              features: [], 
              timestamp: Date.now() 
            } 
          });
        }
      })();
      return true;  // Async response

    case 'GET_SCORE_BREAKDOWN':
      // Get detailed score breakdown for a domain
      (async () => {
        try {
          const domain = message.domain;
          if (!domain) {
            sendResponse({ status: 'ERROR', message: 'No domain provided' });
            return;
          }

          const siteStats = stats.getSiteStats(domain);
          if (!siteStats) {
            sendResponse({ status: 'ERROR', message: 'No stats found for domain' });
            return;
          }

          // Get current tab URL for context
          const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
          const url = tabs[0]?.url || `https://${domain}`;

          // Get ML analysis result from storage
          const mlData = await chrome.storage.local.get([`ml_result_${domain}`]);
          const mlResult = mlData[`ml_result_${domain}`];

          // Calculate score breakdown using enhanced privacy scorer
          const { EnhancedPrivacyScorer } = await import('../utils/enhanced-privacy-scorer');
          const scorer = EnhancedPrivacyScorer.getInstance();

          const factors = {
            // Trackers
            trackersBlocked: siteStats.trackersBlocked || 0,
            trackerVendors: siteStats.trackerVendors || [],
            fingerprintAttempts: siteStats.fingerprintAttempts || 0,
            
            // Cookies (use SAME mapping as stats-manager)
            cookiesManaged: siteStats.cookiesBlocked || 0,
            secureCookies: siteStats.secureCookies || 0,
            httpOnlyCookies: siteStats.httpOnlyCookies || 0,
            sameSiteCookies: siteStats.sameSiteCookies || 0,
            thirdPartyCookies: siteStats.thirdPartyCookies || 0,
            
            // Requests
            totalRequests: siteStats.totalRequests || siteStats.requestsAnalyzed || 0,
            thirdPartyRequests: siteStats.thirdPartyRequests || 0,
            mixedContent: siteStats.mixedContent || false,
            
            // ML Check (include live ML data if available)
            domain: domain,
            threatsDetected: siteStats.threatsDetected || 0,
            threatDetails: siteStats.threatDetails || [],
            domainAge: siteStats.domainAge || 365,
            // Add ML data to factors (for scoreMLCheck to use)
            mlRiskScore: mlResult?.risk_score,
            mlIsPhishing: mlResult?.is_phishing,
            mlRiskLevel: mlResult?.risk_level,
            mlConfidence: mlResult?.confidence,
            mlSslValid: mlResult?.ssl_validation?.valid,
            
            // SSL (default: assume HTTPS with strong TLS)
            hasSSL: siteStats.hasSSL ?? true,
            sslStrength: siteStats.sslStrength || 'strong' as const,
            sslExpired: siteStats.sslExpiry ? siteStats.sslExpiry < Date.now() : false,
            
            // Privacy Policy
            hasPrivacyPolicy: siteStats.privacyPolicyFound || false,
            privacyPolicyAccessible: siteStats.privacyPolicyFound || false,
            
            // Third-party Scripts
            thirdPartyScripts: siteStats.thirdPartyScripts || 0,
            inlineScripts: 0,
            
            // Data Collection
            formsDetected: siteStats.formsWithPII || 0,
            autofillDisabled: false,
            piiCollected: siteStats.piiInQueryParams || siteStats.insecureFormSubmit || false
          };

          const privacyScore = scorer.calculateScore(factors, url);

          // Check for harmful activity and trigger warning
          const warningCheck = scorer.shouldShowWarning(factors);
          if (warningCheck.show && tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'SHOW_WARNING',
              payload: { 
                reason: warningCheck.reason,
                details: warningCheck.details
              }
            }).catch(() => {
              console.warn('Could not send warning - content script may not be loaded yet');
            });
            console.warn(`⚠️ HARMFUL ACTIVITY on ${domain}: ${warningCheck.reason}`);
          }

          sendResponse({
            status: 'OK',
            data: {
              ...privacyScore,
              warning: warningCheck
            }
          });
        } catch (error) {
          console.error('Failed to get score breakdown:', error);
          sendResponse({ status: 'ERROR', message: 'Failed to calculate breakdown' });
        }
      })();
      return true;  // Async response

    case 'REQUEST_ML_ANALYSIS':
      // Popup is requesting ML analysis for current URL
      (async () => {
        try {
          const { url } = message;
          if (!url) {
            sendResponse({ status: 'ERROR', message: 'No URL provided' });
            return;
          }

          const domain = new URL(url).hostname;
          console.log('🔍 Manual ML analysis requested for:', domain);

          // Perform ML analysis with real model
          const detector = await getMLDetector();
          const prediction = detector.classify(url);
          const mlResult = {
            url,
            is_phishing: prediction.isPhishing,
            confidence: prediction.confidence,
            risk_score: Math.round(prediction.confidence * 100),
            risk_level: prediction.confidence >= 0.90 ? 'CRITICAL' :
                       prediction.confidence >= 0.75 ? 'HIGH' :
                       prediction.confidence >= 0.50 ? 'MEDIUM' :
                       prediction.confidence >= 0.25 ? 'LOW' : 'SAFE',
            ssl_validation: {
              valid: url.startsWith('https://'),
              issuer: null,
              days_until_expiry: null,
              error: null
            },
            reasons: [],
            timestamp: new Date().toISOString()
          };
          
          if (mlResult) {
            // Store result
            chrome.storage.local.set({
              [`ml_result_${domain}`]: {
                ...mlResult,
                analyzed_at: Date.now()
              }
            });

            // Track if phishing detected
            if (mlResult.is_phishing) {
              stats.addThreatDetail(domain, {
                id: `ml-${domain}-${Date.now()}`,
                type: 'Phishing',
                name: `ML Detected Phishing (${mlResult.risk_level})`,
                description: `Risk Score: ${mlResult.risk_score}/100`
              });
            }

            console.log('✅ ML analysis complete:', mlResult);
            sendResponse({ status: 'OK', data: mlResult });
          } else {
            console.warn('⚠️ ML analysis returned no result');
            sendResponse({ status: 'ERROR', message: 'ML analysis failed' });
          }
        } catch (error) {
          console.error('❌ ML analysis error:', error);
          sendResponse({ status: 'ERROR', message: error.message });
        }
      })();
      return true;  // Async response

    default:
      sendResponse({ status: 'ERROR', message: 'Unknown message type' });
  }

  return true;
});
