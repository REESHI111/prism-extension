/**
 * Cookie Management System for PRISM
 * Handles cookie detection, classification, and management
 */

interface CookieInfo {
  name: string;
  domain: string;
  value: string;
  category: 'tracking' | 'functional' | 'advertising' | 'social' | 'performance' | 'unknown';
  isBlocked: boolean;
  isEssential: boolean;
  expirationDate?: number;
  hostOnly: boolean;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
}

interface CookieStats {
  total: number;
  byCategory: { [key: string]: number };
  blocked: number;
  allowed: number;
}

class CookieManager {
  private cookiePatterns: { [key: string]: string[] } = {};
  private cookieStats: Map<string, CookieStats> = new Map();
  private blockedCookies: Set<string> = new Set();
  
  constructor() {
    this.loadCookiePatterns();
  }
  
  private async loadCookiePatterns(): Promise<void> {
    try {
      const response = await fetch(chrome.runtime.getURL('data/cookie-patterns.json'));
      this.cookiePatterns = await response.json();
      console.log('🍪 Cookie patterns loaded');
    } catch (error) {
      console.error('Failed to load cookie patterns:', error);
    }
  }
  
  public async analyzeDomainCookies(domain: string): Promise<CookieInfo[]> {
    try {
      const cookies = await chrome.cookies.getAll({ domain });
      const analyzedCookies: CookieInfo[] = [];
      
      for (const cookie of cookies) {
        const category = this.classifyCookie(cookie.name, cookie.domain);
        const isEssential = this.isEssentialCookie(cookie.name, category);
        const isBlocked = this.shouldBlockCookie(cookie.name, category);
        
        analyzedCookies.push({
          name: cookie.name,
          domain: cookie.domain,
          value: cookie.value,
          category,
          isBlocked,
          isEssential,
          expirationDate: cookie.expirationDate,
          hostOnly: cookie.hostOnly,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite as string
        });
      }
      
      this.updateCookieStats(domain, analyzedCookies);
      return analyzedCookies;
      
    } catch (error) {
      console.error('Error analyzing cookies for domain:', domain, error);
      return [];
    }
  }
  
  private classifyCookie(cookieName: string, domain: string): CookieInfo['category'] {
    const name = cookieName.toLowerCase();
    
    // Check each category
    for (const [category, patterns] of Object.entries(this.cookiePatterns)) {
      for (const pattern of patterns) {
        if (name.includes(pattern.toLowerCase()) || 
            domain.includes(pattern.toLowerCase())) {
          return category as CookieInfo['category'];
        }
      }
    }
    
    return 'unknown';
  }
  
  private isEssentialCookie(cookieName: string, category: CookieInfo['category']): boolean {
    // Essential cookies that should never be blocked
    const essentialPatterns = [
      'session', 'csrf', 'xsrf', 'auth', 'login',
      'cart', 'checkout', 'payment', 'security'
    ];
    
    const name = cookieName.toLowerCase();
    return category === 'functional' || 
           essentialPatterns.some(pattern => name.includes(pattern));
  }
  
  private shouldBlockCookie(cookieName: string, category: CookieInfo['category']): boolean {
    // Don't block essential/functional cookies
    if (this.isEssentialCookie(cookieName, category)) {
      return false;
    }
    
    // Block tracking, advertising, and social cookies by default
    const blockCategories: CookieInfo['category'][] = ['tracking', 'advertising', 'social'];
    return blockCategories.includes(category);
  }
  
  private updateCookieStats(domain: string, cookies: CookieInfo[]): void {
    const stats: CookieStats = {
      total: cookies.length,
      byCategory: {},
      blocked: 0,
      allowed: 0
    };
    
    cookies.forEach(cookie => {
      // Count by category
      stats.byCategory[cookie.category] = (stats.byCategory[cookie.category] || 0) + 1;
      
      // Count blocked/allowed
      if (cookie.isBlocked) {
        stats.blocked++;
        this.blockedCookies.add(`${domain}:${cookie.name}`);
      } else {
        stats.allowed++;
      }
    });
    
    this.cookieStats.set(domain, stats);
  }
  
  public getCookieStats(domain: string): CookieStats | null {
    return this.cookieStats.get(domain) || null;
  }
  
  public getAllCookieStats(): { [domain: string]: CookieStats } {
    const allStats: { [domain: string]: CookieStats } = {};
    this.cookieStats.forEach((stats, domain) => {
      allStats[domain] = stats;
    });
    return allStats;
  }
  
  public async blockCookiesByCategory(domain: string, categories: string[]): Promise<void> {
    try {
      const cookies = await this.analyzeDomainCookies(domain);
      
      for (const cookie of cookies) {
        if (categories.includes(cookie.category) && !cookie.isEssential) {
          await chrome.cookies.remove({
            url: `http${cookie.secure ? 's' : ''}://${cookie.domain}`,
            name: cookie.name
          });
          
          this.blockedCookies.add(`${domain}:${cookie.name}`);
          console.log(`🍪🚫 Blocked ${cookie.category} cookie: ${cookie.name}`);
        }
      }
    } catch (error) {
      console.error('Error blocking cookies:', error);
    }
  }
  
  public getBlockedCookiesCount(): number {
    return this.blockedCookies.size;
  }
  
  public getBlockedCookies(): string[] {
    return Array.from(this.blockedCookies);
  }
}

export default CookieManager;