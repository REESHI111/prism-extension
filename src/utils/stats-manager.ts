/**
 * Statistics Manager
 * Tracks and stores extension statistics
 * Phase 3: Enhanced with privacy scoring
 */

import { EnhancedPrivacyScorer, type PrivacyFactors } from './enhanced-privacy-scorer';

export interface SiteStats {
  url: string;
  domain: string;
  trackersBlocked: number;
  cookiesBlocked: number;
  requestsAnalyzed: number;
  threatsDetected: number;
  fingerprintAttempts: number;
  timestamp: number;
  securityScore: number;
  protocol: string;
  hasSSL: boolean;
}

export interface GlobalStats {
  totalTrackersBlocked: number;
  totalCookiesManaged: number;
  totalRequestsAnalyzed: number;
  totalThreatsDetected: number;
  totalFingerprintAttempts: number;
  sitesVisited: number;
  lastUpdated: number;
}

const STATS_KEY = 'prism_global_stats';
const SITE_STATS_KEY = 'prism_site_stats';

export class StatsManager {
  private static instance: StatsManager;
  private globalStats: GlobalStats;
  private currentSiteStats: Map<string, SiteStats>;
  private scorer: EnhancedPrivacyScorer;

  private constructor() {
    this.globalStats = {
      totalTrackersBlocked: 0,
      totalCookiesManaged: 0,
      totalRequestsAnalyzed: 0,
      totalThreatsDetected: 0,
      totalFingerprintAttempts: 0,
      sitesVisited: 0,
      lastUpdated: Date.now()
    };
    this.currentSiteStats = new Map();
    this.scorer = EnhancedPrivacyScorer.getInstance();
    this.loadStats();
  }

  static getInstance(): StatsManager {
    if (!StatsManager.instance) {
      StatsManager.instance = new StatsManager();
    }
    return StatsManager.instance;
  }

  async loadStats(): Promise<void> {
    try {
      const result = await chrome.storage.local.get([STATS_KEY, SITE_STATS_KEY]);
      
      if (result[STATS_KEY]) {
        this.globalStats = result[STATS_KEY];
      }
      
      if (result[SITE_STATS_KEY]) {
        this.currentSiteStats = new Map(Object.entries(result[SITE_STATS_KEY]));
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  async saveStats(): Promise<void> {
    try {
      const siteStatsObj = Object.fromEntries(this.currentSiteStats);
      await chrome.storage.local.set({
        [STATS_KEY]: this.globalStats,
        [SITE_STATS_KEY]: siteStatsObj
      });
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  incrementTrackerBlocked(domain: string): void {
    this.globalStats.totalTrackersBlocked++;
    this.globalStats.totalRequestsAnalyzed++;
    this.updateSiteStats(domain, 'trackersBlocked');
    this.saveStats();
  }

  incrementCookieManaged(domain: string): void {
    this.globalStats.totalCookiesManaged++;
    this.updateSiteStats(domain, 'cookiesBlocked');
    this.saveStats();
  }

  incrementRequestAnalyzed(domain: string): void {
    this.globalStats.totalRequestsAnalyzed++;
    this.updateSiteStats(domain, 'requestsAnalyzed');
    this.saveStats();
  }

  incrementThreatDetected(domain: string): void {
    this.globalStats.totalThreatsDetected++;
    this.updateSiteStats(domain, 'threatsDetected');
    this.saveStats();
  }

  incrementFingerprintAttempt(domain: string): void {
    this.globalStats.totalFingerprintAttempts++;
    this.updateSiteStats(domain, 'fingerprintAttempts');
    this.saveStats();
  }

  updateCookieCount(domain: string, count: number): void {
    let stats = this.currentSiteStats.get(domain);
    
    if (!stats) {
      stats = {
        url: '',
        domain,
        trackersBlocked: 0,
        cookiesBlocked: count,
        requestsAnalyzed: 0,
        threatsDetected: 0,
        fingerprintAttempts: 0,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true
      };
      this.globalStats.sitesVisited++;
    } else {
      stats.cookiesBlocked = count;
    }
    
    stats.timestamp = Date.now();
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    
    this.currentSiteStats.set(domain, stats);
    this.globalStats.lastUpdated = Date.now();
    this.globalStats.totalCookiesManaged = count;
    this.saveStats();
  }

  updateThirdPartyScripts(domain: string, count: number): void {
    let stats = this.currentSiteStats.get(domain);
    
    if (!stats) {
      stats = {
        url: '',
        domain,
        trackersBlocked: 0,
        cookiesBlocked: 0,
        requestsAnalyzed: 0,
        threatsDetected: 0,
        fingerprintAttempts: 0,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true
      };
      this.globalStats.sitesVisited++;
    }
    
    stats.timestamp = Date.now();
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    
    this.currentSiteStats.set(domain, stats);
    this.globalStats.lastUpdated = Date.now();
    this.saveStats();
  }

  updateMixedContent(domain: string, hasMixedContent: boolean): void {
    let stats = this.currentSiteStats.get(domain);
    
    if (!stats) {
      stats = {
        url: '',
        domain,
        trackersBlocked: 0,
        cookiesBlocked: 0,
        requestsAnalyzed: 0,
        threatsDetected: 0,
        fingerprintAttempts: 0,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true
      };
      this.globalStats.sitesVisited++;
    }
    
    stats.timestamp = Date.now();
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    
    this.currentSiteStats.set(domain, stats);
    this.globalStats.lastUpdated = Date.now();
    this.saveStats();
  }

  private updateSiteStats(domain: string, field: keyof SiteStats): void {
    let stats = this.currentSiteStats.get(domain);
    
    if (!stats) {
      stats = {
        url: '',
        domain,
        trackersBlocked: 0,
        cookiesBlocked: 0,
        requestsAnalyzed: 0,
        threatsDetected: 0,
        fingerprintAttempts: 0,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true
      };
      this.globalStats.sitesVisited++;
    }

    if (typeof field === 'string' && field in stats && typeof stats[field] === 'number') {
      (stats[field] as number)++;
    }
    
    stats.timestamp = Date.now();
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    
    this.currentSiteStats.set(domain, stats);
    this.globalStats.lastUpdated = Date.now();
  }

  private calculateEnhancedSecurityScore(stats: SiteStats): number {
    const factors: PrivacyFactors = {
      trackersBlocked: stats.trackersBlocked,
      cookiesManaged: stats.cookiesBlocked,
      fingerprintAttempts: stats.fingerprintAttempts,
      threatsDetected: stats.threatsDetected,
      sslCertificate: stats.hasSSL,
      privacyPolicyFound: false, // Will be detected in future
      thirdPartyScripts: Math.floor(stats.requestsAnalyzed / 5), // Estimate
      mixedContent: false,
      httpOnly: stats.protocol === 'http:'
    };

    const result = this.scorer.calculateScore(factors);
    return result.score;
  }

  updateSiteProtocol(domain: string, protocol: string, hasSSL: boolean): void {
    let stats = this.currentSiteStats.get(domain);
    if (!stats) {
      stats = {
        url: '',
        domain,
        trackersBlocked: 0,
        cookiesBlocked: 0,
        requestsAnalyzed: 0,
        threatsDetected: 0,
        fingerprintAttempts: 0,
        timestamp: Date.now(),
        securityScore: 100,
        protocol,
        hasSSL
      };
    } else {
      stats.protocol = protocol;
      stats.hasSSL = hasSSL;
    }
    
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    this.currentSiteStats.set(domain, stats);
    this.saveStats();
  }

  getSiteStats(domain: string): SiteStats | null {
    return this.currentSiteStats.get(domain) || null;
  }

  getGlobalStats(): GlobalStats {
    return { ...this.globalStats };
  }

  resetSiteStats(domain: string): void {
    this.currentSiteStats.delete(domain);
    this.saveStats();
  }

  resetAllStats(): void {
    this.globalStats = {
      totalTrackersBlocked: 0,
      totalCookiesManaged: 0,
      totalRequestsAnalyzed: 0,
      totalThreatsDetected: 0,
      totalFingerprintAttempts: 0,
      sitesVisited: 0,
      lastUpdated: Date.now()
    };
    this.currentSiteStats.clear();
    this.saveStats();
  }
}
