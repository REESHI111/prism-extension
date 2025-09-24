/**
 * PRISM Background Service Worker - Phase 2: Privacy Guardian Core
 * Handles tracker blocking, privacy scoring, and cookie management
 */

// Import cookie manager
// Note: Import will be handled differently in production build

// Enhanced types for Phase 2
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

interface ThreatAnalysis {
  url: string;
  isPhishing: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  reasons: string[];
}

interface TrackerDomains {
  analytics: string[];
  advertising: string[];
  social: string[];
  heatmaps: string[];
  fingerprinting: string[];
  marketing: string[];
}

interface BlockingStats {
  totalBlocked: number;
  sessionsBlocked: number;
  categoriesBlocked: { [key: string]: number };
  domainsBlocked: Set<string>;
}

class PrismBackgroundService {
  private privacyScores = new Map<string, PrivacyScore>();
  private blockedTrackers = new Set<string>();
  private blockingStats: BlockingStats;
  private trackerDomains: TrackerDomains | null = null;
  private cookieManager: any = null; // Will be initialized properly
  
  constructor() {
    this.blockingStats = {
      totalBlocked: 0,
      sessionsBlocked: 0,
      categoriesBlocked: {},
      domainsBlocked: new Set()
    };
    this.initializeCookieManager();
    this.initializeExtension();
  }
  
  private initializeCookieManager(): void {
    // Initialize cookie manager with inline implementation
    this.cookieManager = {
      cookiePatterns: {},
      cookieStats: new Map(),
      blockedCookies: new Set(),
      
      async loadCookiePatterns() {
        try {
          const response = await fetch(chrome.runtime.getURL('data/cookie-patterns.json'));
          this.cookiePatterns = await response.json();
          console.log('🍪 Cookie patterns loaded');
        } catch (error) {
          console.error('Failed to load cookie patterns:', error);
        }
      },
      
      classifyCookie(cookieName: string, domain: string) {
        const name = cookieName.toLowerCase();
        for (const [category, patterns] of Object.entries(this.cookiePatterns)) {
          const patternArray = Array.isArray(patterns) ? patterns : [];
          for (const pattern of patternArray) {
            if (name.includes(pattern.toLowerCase()) || 
                domain.includes(pattern.toLowerCase())) {
              return category;
            }
          }
        }
        return 'unknown';
      },
      
      async analyzeDomainCookies(domain: string) {
        try {
          const cookies = await chrome.cookies.getAll({ domain });
          return cookies.map(cookie => ({
            name: cookie.name,
            domain: cookie.domain,
            category: this.classifyCookie(cookie.name, cookie.domain),
            isTracking: this.isTrackingCookie(cookie.name)
          }));
        } catch (error) {
          console.error('Error analyzing cookies:', error);
          return [];
        }
      },
      
      isTrackingCookie(cookieName: string) {
        const trackingPatterns = ['_ga', '_gid', '_fbp', '_fbc', '__utm', '_hjid'];
        return trackingPatterns.some(pattern => cookieName.includes(pattern));
      }
    };
    
    // Load cookie patterns
    this.cookieManager.loadCookiePatterns();
  }

  private async initializeExtension(): Promise<void> {
    console.log('🛡️ PRISM Extension Initialized - Phase 2: Privacy Guardian Core');
    
    // Load tracker domains database
    await this.loadTrackerDomains();
    
    // Setup declarative net request rules for tracker blocking
    await this.setupTrackerBlocking();
    
    // Setup tab updates for privacy scoring
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    
    // Setup declarative net request event listener
    chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(this.handleBlockedRequest.bind(this));
    
    console.log('🚫 Tracker blocking active with', this.getTrackerCount(), 'known trackers');
    console.log('🍪 Cookie management system initialized');
  }
  
  // Will be implemented in Phase 2 with declarativeNetRequest
  
  private async handleTabUpdate(
    tabId: number, 
    changeInfo: chrome.tabs.TabChangeInfo, 
    tab: chrome.tabs.Tab
  ): Promise<void> {
    if (changeInfo.status === 'complete' && tab.url) {
      try {
        const url = new URL(tab.url);
        const domain = url.hostname;
        
        // Calculate initial privacy score
        const score = await this.calculatePrivacyScore(domain, tab.url);
        this.privacyScores.set(domain, score);
        
        // Update extension badge
        chrome.action.setBadgeText({
          tabId: tabId,
          text: score.score.toString()
        });
        
        chrome.action.setBadgeBackgroundColor({
          tabId: tabId,
          color: this.getScoreColor(score.score)
        });
        
      } catch (error) {
        console.error('Error handling tab update:', error);
      }
    }
  }
  
  private async calculatePrivacyScore(domain: string, url: string): Promise<PrivacyScore> {
    const trackerCount = Array.from(this.blockedTrackers)
      .filter(tracker => tracker.includes(domain)).length;
    
    const isHTTPS = url.startsWith('https://');
    const cookieData = await this.analyzeCookiesForDomain(domain);
    const cookieCount = cookieData.total;
    const trackingCookieCount = cookieData.tracking;
    
    // Enhanced privacy score calculation (0-100)
    let score = 100;
    score -= Math.min(trackerCount * 5, 40);           // Max 40 points for trackers
    score -= Math.min(trackingCookieCount * 3, 30);    // Max 30 points for tracking cookies
    score -= Math.min(cookieCount * 1, 20);            // Max 20 points for total cookies
    score -= isHTTPS ? 0 : 10;                         // 10 points deduction for HTTP
    
    score = Math.max(0, Math.round(score));
    
    const blockedCount = this.blockingStats.domainsBlocked.size;
    const categories = this.getTrackerCategoriesForDomain(domain);
    
    return {
      domain,
      score,
      trackers: trackerCount,
      cookies: cookieCount,
      isHTTPS,
      timestamp: new Date(),
      blockedRequests: blockedCount,
      trackerCategories: categories
    };
  }
  
  private async analyzeCookiesForDomain(domain: string): Promise<{total: number, tracking: number, categories: any}> {
    try {
      if (this.cookieManager) {
        const cookies = await this.cookieManager.analyzeDomainCookies(domain);
        const tracking = cookies.filter((c: any) => c.isTracking || c.category === 'tracking').length;
        const categories = cookies.reduce((acc: any, cookie: any) => {
          acc[cookie.category] = (acc[cookie.category] || 0) + 1;
          return acc;
        }, {});
        
        return {
          total: cookies.length,
          tracking,
          categories
        };
      }
      
      // Fallback to basic cookie count
      const cookieCount = await this.getCookieCount(domain);
      return { total: cookieCount, tracking: 0, categories: {} };
      
    } catch (error) {
      console.error('Error analyzing cookies for domain:', domain, error);
      return { total: 0, tracking: 0, categories: {} };
    }
  }
  
  private async getCookieCount(domain: string): Promise<number> {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      return cookies.length;
    } catch (error) {
      console.error('Error getting cookies:', error);
      return 0;
    }
  }
  
  private getScoreColor(score: number): string {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  }
  
  private isTracker(domain: string): boolean {
    // Basic tracker detection - will be enhanced in Phase 2
    const commonTrackers = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com',
      'doubleclick.net',
      'googlesyndication.com',
      'amazon-adsystem.com'
    ];
    
    return commonTrackers.some(tracker => domain.includes(tracker));
  }
  
  private async loadTrackerDomains(): Promise<void> {
    try {
      const response = await fetch(chrome.runtime.getURL('data/tracker-domains.json'));
      this.trackerDomains = await response.json();
      console.log('📋 Loaded tracker domains database');
    } catch (error) {
      console.error('Failed to load tracker domains:', error);
    }
  }
  
  private async setupTrackerBlocking(): Promise<void> {
    try {
      // The rules are loaded automatically from manifest.json
      // We just need to enable them
      console.log('🚫 Tracker blocking rules activated');
    } catch (error) {
      console.error('Failed to setup tracker blocking:', error);
    }
  }
  
  private handleBlockedRequest(details: any): void {
    const domain = new URL(details.request.url).hostname;
    this.blockedTrackers.add(domain);
    this.blockingStats.totalBlocked++;
    this.blockingStats.domainsBlocked.add(domain);
    
    // Update category statistics
    const category = this.getTrackerCategory(domain);
    if (category) {
      this.blockingStats.categoriesBlocked[category] = 
        (this.blockingStats.categoriesBlocked[category] || 0) + 1;
    }
    
    console.log(`� Blocked tracker: ${domain} (${category || 'unknown'})`);
  }
  
  private getTrackerCount(): number {
    if (!this.trackerDomains) return 0;
    return Object.values(this.trackerDomains).flat().length;
  }
  
  private getTrackerCategory(domain: string): string | null {
    if (!this.trackerDomains) return null;
    
    for (const [category, domains] of Object.entries(this.trackerDomains)) {
      if (domains.some(trackerDomain => domain.includes(trackerDomain))) {
        return category;
      }
    }
    return null;
  }
  
  private getTrackerCategoriesForDomain(domain: string): string[] {
    if (!this.trackerDomains) return [];
    
    const categories: string[] = [];
    for (const [category, domains] of Object.entries(this.trackerDomains)) {
      if (domains.some(trackerDomain => domain.includes(trackerDomain))) {
        categories.push(category);
      }
    }
    return categories;
  }
  
  // Enhanced message handler for Phase 2 features
  public handleMessage(
    message: any, 
    sender: chrome.runtime.MessageSender, 
    sendResponse: (response: any) => void
  ): void {
    switch (message.type) {
      case 'GET_PRIVACY_SCORE':
        const score = this.privacyScores.get(message.domain);
        sendResponse({ score: score || null });
        break;
        
      case 'GET_BLOCKED_TRACKERS':
        sendResponse({ 
          trackers: Array.from(this.blockedTrackers),
          count: this.blockedTrackers.size,
          stats: this.blockingStats
        });
        break;
        
      case 'GET_BLOCKING_STATS':
        sendResponse({
          totalBlocked: this.blockingStats.totalBlocked,
          sessionsBlocked: this.blockingStats.sessionsBlocked,
          categories: this.blockingStats.categoriesBlocked,
          domains: Array.from(this.blockingStats.domainsBlocked)
        });
        break;
        
      case 'WHITELIST_DOMAIN':
        // TODO: Implement domain whitelisting
        sendResponse({ success: true, message: 'Domain whitelisting coming soon' });
        break;
        
      case 'GET_TRACKER_CATEGORIES':
        sendResponse({ categories: this.trackerDomains });
        break;
        
      case 'GET_COOKIE_ANALYSIS':
        this.analyzeCookiesForDomain(message.domain).then(cookieData => {
          sendResponse(cookieData);
        }).catch(error => {
          console.error('Cookie analysis error:', error);
          sendResponse({ total: 0, tracking: 0, categories: {} });
        });
        break;
        
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  }
}

// Initialize the background service
const prismService = new PrismBackgroundService();

// Setup message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const result = prismService.handleMessage(message, sender, sendResponse);
  // Keep message channel open for async responses
  if (message.type === 'GET_COOKIE_ANALYSIS') {
    return true;
  }
  return result;
});

// Log extension startup
console.log('🚀 PRISM Background Service Worker Started');