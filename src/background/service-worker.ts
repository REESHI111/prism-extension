/**
 * PRISM Background Service Worker
 * Handles core privacy protection and threat detection
 */

// Types for better type safety
interface PrivacyScore {
  domain: string;
  score: number;
  trackers: number;
  cookies: number;
  isHTTPS: boolean;
  timestamp: Date;
}

interface ThreatAnalysis {
  url: string;
  isPhishing: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  reasons: string[];
}

class PrismBackgroundService {
  private privacyScores = new Map<string, PrivacyScore>();
  private blockedTrackers = new Set<string>();
  
  constructor() {
    this.initializeExtension();
  }
  
  private async initializeExtension(): Promise<void> {
    console.log('🛡️ PRISM Extension Initialized');
    
    // Setup request monitoring
    chrome.webRequest?.onBeforeRequest.addListener(
      this.handleWebRequest.bind(this),
      { urls: ['<all_urls>'] },
      ['requestBody']
    );
    
    // Setup tab updates for privacy scoring
    chrome.tabs.onUpdated.addListener(this.handleTabUpdate.bind(this));
    
    // Load tracker blocking rules
    await this.loadTrackerRules();
  }
  
  private handleWebRequest(details: chrome.webRequest.WebRequestBodyDetails): void {
    try {
      const url = new URL(details.url);
      const domain = url.hostname;
      
      // Check if this is a known tracker
      if (this.isTracker(domain)) {
        this.blockedTrackers.add(domain);
        console.log(`🚫 Blocked tracker: ${domain}`);
      }
      
      // Update privacy score for the tab
      this.updatePrivacyScore(details.tabId, domain);
      
    } catch (error) {
      console.error('Error handling web request:', error);
    }
  }
  
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
    const cookieCount = await this.getCookieCount(domain);
    
    // Privacy score calculation (0-100)
    let score = 100;
    score -= Math.min(trackerCount * 5, 50); // Max 50 points deduction for trackers
    score -= Math.min(cookieCount * 2, 30);   // Max 30 points for cookies
    score -= isHTTPS ? 0 : 20;               // 20 points deduction for HTTP
    
    score = Math.max(0, Math.round(score));
    
    return {
      domain,
      score,
      trackers: trackerCount,
      cookies: cookieCount,
      isHTTPS,
      timestamp: new Date()
    };
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
  
  private async loadTrackerRules(): Promise<void> {
    // Placeholder for loading tracker blocking rules
    // Will be implemented in Phase 2
    console.log('📋 Loading tracker blocking rules...');
  }
  
  // Message handler for popup communication
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
          count: this.blockedTrackers.size 
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
  prismService.handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async responses
});

// Log extension startup
console.log('🚀 PRISM Background Service Worker Started');