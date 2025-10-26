/**
 * PRISM Background Service Worker
 * Phase 2: Real Tracker Blocking & Statistics
 * Phase 3: Fingerprint Detection Tracking
 */

import { StatsManager } from '../utils/stats-manager';
import { isTrackerDomain, getTrackerCategory } from '../utils/enhanced-tracker-database';

console.log('🛡️ PRISM Service Worker Loaded - Phase 3');

const stats = StatsManager.getInstance();

// Track fingerprint attempts per domain
const fingerprintAttempts = new Map<string, Map<string, number>>();

// Track blocked requests per tab
const tabBlockedRequests = new Map<number, Set<string>>();
const tabCookieCounts = new Map<number, number>();
const tabThirdPartyDomains = new Map<number, Set<string>>();

// Real-time tracking variables
const cookieCheckInterval = 2000; // Check cookies every 2 seconds
let currentTabId: number | null = null;
let currentDomain: string | null = null;

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ PRISM Extension Installed - Phase 3');
  
  chrome.storage.local.set({
    extensionActive: true,
    version: '1.0.0',
    phase: 3,
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

// Block tracking requests
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const { url, tabId, type } = details;
    
    // Analyze all requests
    if (tabId > 0) {
      chrome.tabs.get(tabId, (tab) => {
        if (tab?.url) {
          try {
            const domain = new URL(tab.url).hostname;
            stats.incrementRequestAnalyzed(domain);
          } catch (e) {}
        }
      });
    }
    
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

// Monitor ALL requests for real-time analysis
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
              
              // Increment requests analyzed
              stats.incrementRequestAnalyzed(tabDomain);
              
              // Track third-party domains
              if (requestDomain !== tabDomain && !requestDomain.includes(tabDomain)) {
                if (!tabThirdPartyDomains.has(tabId)) {
                  tabThirdPartyDomains.set(tabId, new Set());
                }
                tabThirdPartyDomains.get(tabId)!.add(requestDomain);
                
                // Update third-party script count
                if (type === 'script') {
                  stats.updateThirdPartyScripts(tabDomain, tabThirdPartyDomains.get(tabId)!.size);
                }
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
      
      // Update stats with actual cookie count
      stats.updateCookieCount(currentDomain!, cookieCount);
      
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
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    try {
      const url = new URL(changeInfo.url);
      currentTabId = tabId;
      currentDomain = url.hostname;
      
      // Update protocol info
      stats.updateSiteProtocol(currentDomain, url.protocol, url.protocol === 'https:');
      
      // Reset third-party tracking for new page
      tabThirdPartyDomains.delete(tabId);
      
      // Count cookies immediately
      updateCookieCount();
    } catch (e) {}
  }
});

// Clean up tab data when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabBlockedRequests.delete(tabId);
  tabCookieCounts.delete(tabId);
  tabThirdPartyDomains.delete(tabId);
  
  if (currentTabId === tabId) {
    currentTabId = null;
    currentDomain = null;
  }
});

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message.type);

  switch (message.type) {
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
      // Track fingerprint detection attempts
      const { domain, method } = message;
      if (!fingerprintAttempts.has(domain)) {
        fingerprintAttempts.set(domain, new Map());
      }
      const domainAttempts = fingerprintAttempts.get(domain)!;
      domainAttempts.set(method, (domainAttempts.get(method) || 0) + 1);
      
      console.log(`🛡️ Fingerprint blocked: ${method} on ${domain}`);
      
      // Increment both threat and fingerprint counters
      stats.incrementThreatDetected(domain);
      stats.incrementFingerprintAttempt(domain);
      
      sendResponse({ status: 'OK' });
      break;

    case 'GET_SITE_STATS':
      const { domain: siteDomain } = message;
      
      // Get fresh cookie count for current tab
      if (siteDomain === currentDomain && currentTabId) {
        chrome.cookies.getAll({ domain: siteDomain }, (cookies) => {
          const actualCookieCount = cookies.length;
          
          // Update stats with real cookie count
          stats.updateCookieCount(siteDomain, actualCookieCount);
          
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
          
          // If we have stored stats, use them; otherwise return defaults
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
            // No stats yet for this site - return clean slate with real cookie count
            sendResponse({
              status: 'OK',
              data: {
                domain: siteDomain,
                trackersBlocked: 0,
                cookiesBlocked: actualCookieCount,
                requestsAnalyzed: 0,
                threatsDetected: 0,
                securityScore: 100,
                timestamp: Date.now(),
                fingerprintAttempts: totalFingerprints
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

    case 'RESET_SITE_STATS':
      stats.resetSiteStats(message.domain);
      if (sender.tab?.id) {
        tabBlockedRequests.delete(sender.tab.id);
        tabCookieCounts.delete(sender.tab.id);
      }
      fingerprintAttempts.delete(message.domain);
      sendResponse({ status: 'OK' });
      break;

    default:
      sendResponse({ status: 'ERROR', message: 'Unknown message type' });
  }

  return true;
});
