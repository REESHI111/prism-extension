/**
 * Trust Manager
 * Manages whitelisted and blacklisted sites
 */

export interface TrustedSite {
  domain: string;
  trustLevel: 'trusted' | 'blocked';
  addedDate: number;
  reason?: string;
}

const TRUSTED_SITES_KEY = 'prism_trusted_sites';
const BLOCKED_SITES_KEY = 'prism_blocked_sites';

export class TrustManager {
  private static instance: TrustManager;
  private trustedSites: Map<string, TrustedSite>;
  private blockedSites: Map<string, TrustedSite>;

  private constructor() {
    this.trustedSites = new Map();
    this.blockedSites = new Map();
    this.loadTrustLists();
  }

  static getInstance(): TrustManager {
    if (!TrustManager.instance) {
      TrustManager.instance = new TrustManager();
    }
    return TrustManager.instance;
  }

  async loadTrustLists(): Promise<void> {
    try {
      const result = await chrome.storage.local.get([TRUSTED_SITES_KEY, BLOCKED_SITES_KEY]);
      
      if (result[TRUSTED_SITES_KEY]) {
        this.trustedSites = new Map(Object.entries(result[TRUSTED_SITES_KEY]));
      }
      
      if (result[BLOCKED_SITES_KEY]) {
        this.blockedSites = new Map(Object.entries(result[BLOCKED_SITES_KEY]));
      }
    } catch (error) {
      console.error('Failed to load trust lists:', error);
    }
  }

  async saveTrustLists(): Promise<void> {
    try {
      const trustedObj = Object.fromEntries(this.trustedSites);
      const blockedObj = Object.fromEntries(this.blockedSites);
      
      await chrome.storage.local.set({
        [TRUSTED_SITES_KEY]: trustedObj,
        [BLOCKED_SITES_KEY]: blockedObj
      });
    } catch (error) {
      console.error('Failed to save trust lists:', error);
    }
  }

  addTrustedSite(domain: string, reason?: string): void {
    // Remove from blocked if exists
    this.blockedSites.delete(domain);
    
    this.trustedSites.set(domain, {
      domain,
      trustLevel: 'trusted',
      addedDate: Date.now(),
      reason
    });
    
    this.saveTrustLists();
  }

  addBlockedSite(domain: string, reason?: string): void {
    // Remove from trusted if exists
    this.trustedSites.delete(domain);
    
    this.blockedSites.set(domain, {
      domain,
      trustLevel: 'blocked',
      addedDate: Date.now(),
      reason
    });
    
    this.saveTrustLists();
  }

  removeTrustedSite(domain: string): void {
    this.trustedSites.delete(domain);
    this.saveTrustLists();
  }

  removeBlockedSite(domain: string): void {
    this.blockedSites.delete(domain);
    this.saveTrustLists();
  }

  isTrusted(domain: string): boolean {
    return this.trustedSites.has(domain);
  }

  isBlocked(domain: string): boolean {
    return this.blockedSites.has(domain);
  }

  getTrustLevel(domain: string): 'trusted' | 'blocked' | 'unknown' {
    if (this.trustedSites.has(domain)) return 'trusted';
    if (this.blockedSites.has(domain)) return 'blocked';
    return 'unknown';
  }

  getAllTrustedSites(): TrustedSite[] {
    return Array.from(this.trustedSites.values());
  }

  getAllBlockedSites(): TrustedSite[] {
    return Array.from(this.blockedSites.values());
  }

  clearAllTrust(): void {
    this.trustedSites.clear();
    this.blockedSites.clear();
    this.saveTrustLists();
  }
}
