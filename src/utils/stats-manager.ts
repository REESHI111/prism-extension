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
  requestsAnalyzed: number; // Real per-site request count
  threatsDetected: number;
  threatDetails?: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
    timestamp: number;
  }>;
  fingerprintAttempts: number;
  thirdPartyScripts: number; // Real third-party script count
  mixedContent: boolean;
  privacyPolicyFound: boolean;
  timestamp: number;
  securityScore: number;
  protocol: string;
  hasSSL: boolean;
  sslValid?: boolean;  // Whether SSL certificate is valid
  sslExpired?: boolean; // Whether SSL certificate is expired
  
  // Enhanced metrics for weighted scoring
  trackerVendors?: string[];
  secureCookies?: number;
  httpOnlyCookies?: number;
  sameSiteCookies?: number;
  thirdPartyCookies?: number;
  totalRequests?: number;
  thirdPartyRequests?: number;
  phishingScore?: number;
  domainAge?: number;
  sslExpiry?: number;
  sslStrength?: 'strong' | 'medium' | 'weak';
  hasHSTS?: boolean;
  privacyPolicyQuality?: 'good' | 'medium' | 'poor';
  scriptVendors?: string[];
  hasObfuscatedScripts?: boolean;
  formsWithPII?: number;
  insecureFormSubmit?: boolean;
  piiInQueryParams?: boolean;
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
        const siteStatsObj = result[SITE_STATS_KEY];
        this.currentSiteStats = new Map(Object.entries(siteStatsObj));
        
        // CRITICAL FIX: Clean up old fingerprinting threats from threatDetails
        // Fingerprinting should NOT be in threatDetails (it's HIGH severity, not CRITICAL)
        let needsSave = false;
        for (const [domain, stats] of this.currentSiteStats.entries()) {
          if (stats.threatDetails && stats.threatDetails.length > 0) {
            const beforeCount = stats.threatDetails.length;
            
            // Remove any fingerprinting threats (they should use fingerprintAttempts instead)
            stats.threatDetails = stats.threatDetails.filter(
              t => t.type !== 'Fingerprinting'
            );
            
            const afterCount = stats.threatDetails.length;
            
            if (beforeCount !== afterCount) {
              // Update threat count to match cleaned threatDetails
              stats.threatsDetected = stats.threatDetails.length;
              needsSave = true;
              console.log(`🧹 Cleaned ${beforeCount - afterCount} fingerprinting threats from ${domain}`);
            }
          }
        }
        
        // Save if we cleaned anything
        if (needsSave) {
          await this.saveStats();
          console.log('✅ Cleaned up old fingerprinting threat data');
        }
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

  addThreatDetail(domain: string, threat: {
    id: string;
    type: string;
    name: string;
    description: string;
  }): void {
    let stats = this.ensureSiteStats(domain);
    
    if (!stats.threatDetails) {
      stats.threatDetails = [];
    }
    
    // Check if threat already exists (prevent duplicates)
    const existingThreat = stats.threatDetails.find(t => t.id === threat.id);
    if (existingThreat) {
      // Update timestamp of existing threat
      existingThreat.timestamp = Date.now();
    } else {
      // Add new unique threat
      stats.threatDetails.push({
        ...threat,
        timestamp: Date.now()
      });
    }
    
    // Update threat count to match unique threats
    stats.threatsDetected = stats.threatDetails.length;
    this.globalStats.totalThreatsDetected = Array.from(this.currentSiteStats.values())
      .reduce((sum, s) => sum + (s.threatsDetected || 0), 0);
    
    this.currentSiteStats.set(domain, stats);
    this.saveStats();
  }

  incrementThreatDetected(domain: string): void {
    // Deprecated: Use addThreatDetail instead
    // Keeping for backward compatibility
    this.addThreatDetail(domain, {
      id: `generic-${Date.now()}`,
      type: 'Generic',
      name: 'Potential Security Risk',
      description: 'Generic security threat detected'
    });
  }

  private ensureSiteStats(domain: string): SiteStats {
    let stats = this.currentSiteStats.get(domain);
    
    if (!stats) {
      stats = {
        url: '',
        domain,
        trackersBlocked: 0,
        cookiesBlocked: 0,
        requestsAnalyzed: 0,
        threatsDetected: 0,
        threatDetails: [],
        fingerprintAttempts: 0,
        thirdPartyScripts: 0,
        mixedContent: false,
        privacyPolicyFound: false,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true
      };
      this.currentSiteStats.set(domain, stats);
      this.globalStats.sitesVisited++;
    }
    
    return stats;
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
        thirdPartyScripts: 0,
        mixedContent: false,
        privacyPolicyFound: false,
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
  }

  updateEnhancedCookieMetrics(domain: string, metrics: {
    total: number;
    secure: number;
    httpOnly: number;
    sameSite: number;
    thirdParty: number;
  }): void {
    let stats = this.currentSiteStats.get(domain);
    
    if (!stats) {
      stats = {
        url: '',
        domain,
        trackersBlocked: 0,
        cookiesBlocked: metrics.total,
        requestsAnalyzed: 0,
        threatsDetected: 0,
        fingerprintAttempts: 0,
        thirdPartyScripts: 0,
        mixedContent: false,
        privacyPolicyFound: false,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true,
        // Enhanced cookie metrics
        secureCookies: metrics.secure,
        httpOnlyCookies: metrics.httpOnly,
        sameSiteCookies: metrics.sameSite,
        thirdPartyCookies: metrics.thirdParty
      };
      this.globalStats.sitesVisited++;
    } else {
      stats.cookiesBlocked = metrics.total;
      stats.secureCookies = metrics.secure;
      stats.httpOnlyCookies = metrics.httpOnly;
      stats.sameSiteCookies = metrics.sameSite;
      stats.thirdPartyCookies = metrics.thirdParty;
    }
    
    stats.timestamp = Date.now();
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    
    this.currentSiteStats.set(domain, stats);
    this.globalStats.lastUpdated = Date.now();
    this.globalStats.totalCookiesManaged = metrics.total;
    this.saveStats();
  }

  updateRequestMetrics(domain: string, totalRequests: number, thirdPartyRequests: number): void {
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
        thirdPartyScripts: 0,
        mixedContent: false,
        privacyPolicyFound: false,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true,
        totalRequests,
        thirdPartyRequests
      };
      this.globalStats.sitesVisited++;
    } else {
      stats.totalRequests = totalRequests;
      stats.thirdPartyRequests = thirdPartyRequests;
    }
    
    stats.timestamp = Date.now();
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    
    this.currentSiteStats.set(domain, stats);
    this.globalStats.lastUpdated = Date.now();
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
        thirdPartyScripts: count,
        mixedContent: false,
        privacyPolicyFound: false,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true
      };
      this.globalStats.sitesVisited++;
    } else {
      stats.thirdPartyScripts = count;
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
        thirdPartyScripts: 0,
        mixedContent: hasMixedContent,
        privacyPolicyFound: false,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true
      };
      this.globalStats.sitesVisited++;
    } else {
      stats.mixedContent = hasMixedContent;
    }
    
    stats.timestamp = Date.now();
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    
    this.currentSiteStats.set(domain, stats);
    this.globalStats.lastUpdated = Date.now();
    this.saveStats();
  }

  updatePrivacyPolicy(domain: string, found: boolean): void {
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
        thirdPartyScripts: 0,
        mixedContent: false,
        privacyPolicyFound: found,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: 'https:',
        hasSSL: true
      };
      this.globalStats.sitesVisited++;
    } else {
      stats.privacyPolicyFound = found;
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
        thirdPartyScripts: 0,
        mixedContent: false,
        privacyPolicyFound: false,
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
    // Map SiteStats to PrivacyFactors with SENSIBLE DEFAULTS
    // Missing data = assume safe/normal values (prevents 0/100 bug)
    const factors: PrivacyFactors = {
      // Trackers (0 = perfect score)
      trackersBlocked: stats.trackersBlocked || 0,
      trackerVendors: stats.trackerVendors || [],
      fingerprintAttempts: stats.fingerprintAttempts || 0,
      
      // Cookies (0 = perfect, only third-party penalized)
      cookiesManaged: stats.cookiesBlocked || 0,
      secureCookies: stats.secureCookies || 0,
      httpOnlyCookies: stats.httpOnlyCookies || 0,
      sameSiteCookies: stats.sameSiteCookies || 0,
      thirdPartyCookies: stats.thirdPartyCookies || 0,
      
      // Requests (total doesn't matter, only ratio)
      totalRequests: stats.totalRequests || stats.requestsAnalyzed || 0,
      thirdPartyRequests: stats.thirdPartyRequests || 0,
      mixedContent: stats.mixedContent || false,
      
      // ML Check (defaults assume safe)
      threatsDetected: stats.threatsDetected || 0,
      domainAge: stats.domainAge || 365, // Default: 1 year old = trusted
      
      // SSL (accurate detection, don't default to true)
      hasSSL: stats.hasSSL ?? false,
      sslStrength: stats.sslStrength || (stats.hasSSL && stats.sslValid ? 'strong' : 'weak'),
      sslExpired: stats.sslExpired ?? false,
      
      // Privacy Policy
      hasPrivacyPolicy: stats.privacyPolicyFound || false,
      privacyPolicyAccessible: stats.privacyPolicyFound || false,
      
      // Third-party Scripts
      thirdPartyScripts: stats.thirdPartyScripts || 0,
      inlineScripts: 0,
      
      // Data Collection
      formsDetected: stats.formsWithPII || 0,
      autofillDisabled: false,
      piiCollected: stats.piiInQueryParams || stats.insecureFormSubmit || false
    };

    const url = stats.url || `https://${stats.domain}`;
    const result = this.scorer.calculateScore(factors, url);
    
    console.log(`📊 Score for ${stats.domain}: ${result.score}/100`, {
      trackers: stats.trackersBlocked || 0,
      cookies: stats.cookiesBlocked || 0,
      thirdPartyCookies: stats.thirdPartyCookies || 0,
      requests: stats.totalRequests || 0,
      ssl: stats.hasSSL ?? true
    });
    
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
        thirdPartyScripts: 0,
        mixedContent: false,
        privacyPolicyFound: false,
        timestamp: Date.now(),
        securityScore: 100,
        protocol,
        hasSSL,
        sslValid: hasSSL, // Default to true if HTTPS
        sslExpired: false
      };
    } else {
      stats.protocol = protocol;
      stats.hasSSL = hasSSL;
      if (!hasSSL) {
        stats.sslValid = false;
        stats.sslExpired = false;
      }
    }
    
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    this.currentSiteStats.set(domain, stats);
    this.saveStats();
  }

  /**
   * Update SSL certificate validation status
   */
  updateSSLStatus(domain: string, valid: boolean, expired: boolean): void {
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
        thirdPartyScripts: 0,
        mixedContent: false,
        privacyPolicyFound: false,
        timestamp: Date.now(),
        securityScore: 100,
        protocol: valid ? 'https:' : 'http:',
        hasSSL: valid,
        sslValid: valid,
        sslExpired: expired
      };
    } else {
      stats.sslValid = valid;
      stats.sslExpired = expired;
      
      // Update hasSSL based on validity
      if (!valid && !expired) {
        stats.hasSSL = false; // No HTTPS at all
      }
    }
    
    stats.securityScore = this.calculateEnhancedSecurityScore(stats);
    this.currentSiteStats.set(domain, stats);
    this.saveStats();
  }

  getSiteStats(domain: string): SiteStats | null {
    return this.currentSiteStats.get(domain) || null;
  }

  /**
   * Calculate security score for any site data without storing it
   * Useful for calculating scores for sites we haven't tracked yet
   */
  calculateScoreForSite(partialStats: Partial<SiteStats>): number {
    const fullStats: SiteStats = {
      url: partialStats.url || `https://${partialStats.domain || 'unknown'}`,
      domain: partialStats.domain || 'unknown',
      trackersBlocked: partialStats.trackersBlocked || 0,
      cookiesBlocked: partialStats.cookiesBlocked || 0,
      fingerprintAttempts: partialStats.fingerprintAttempts || 0,
      requestsAnalyzed: partialStats.requestsAnalyzed || 0,
      threatsDetected: partialStats.threatsDetected || 0,
      hasSSL: partialStats.hasSSL ?? true,
      privacyPolicyFound: partialStats.privacyPolicyFound ?? false,
      thirdPartyScripts: partialStats.thirdPartyScripts || 0,
      mixedContent: partialStats.mixedContent ?? false,
      protocol: partialStats.protocol || 'https:',
      securityScore: 0, // Will be calculated
      timestamp: Date.now()
    };
    return this.calculateEnhancedSecurityScore(fullStats);
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

  getAllSiteStats(): SiteStats[] {
    return Array.from(this.currentSiteStats.values());
  }

  getTopBlockedDomains(limit: number = 5): Array<{ domain: string; count: number }> {
    const siteStats = Array.from(this.currentSiteStats.values());
    
    // Sort by trackers blocked (descending)
    const sorted = siteStats
      .filter(stats => stats.trackersBlocked > 0)
      .sort((a, b) => b.trackersBlocked - a.trackersBlocked)
      .slice(0, limit)
      .map(stats => ({
        domain: stats.domain,
        count: stats.trackersBlocked
      }));

    return sorted;
  }

  getAveragePrivacyScore(): number {
    const scores = Array.from(this.currentSiteStats.values()).map(s => s.securityScore);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return Math.round(sum / scores.length);
  }
}
