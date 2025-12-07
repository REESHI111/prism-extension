/**
 * Enhanced Privacy Scoring Engine V2
 * 
 * ACCURACY-FOCUSED: Does NOT penalize necessary cookies/requests
 * 8-Category Weighted System with realistic scoring
 */

export interface PrivacyFactors {
  // Trackers
  trackersBlocked?: number;
  trackerVendors?: string[];
  fingerprintAttempts?: number;
  
  // Cookies
  cookiesManaged?: number;
  thirdPartyCookies?: number;
  secureCookies?: number;
  httpOnlyCookies?: number;
  sameSiteCookies?: number;
  
  // Requests
  totalRequests?: number;
  thirdPartyRequests?: number;
  mixedContent?: boolean;
  
  // ML Check (placeholder)
  domainAge?: number;
  threatsDetected?: number;
  
  // SSL
  hasSSL?: boolean;
  sslStrength?: 'strong' | 'medium' | 'weak';
  sslExpired?: boolean;
  
  // Privacy Policy
  hasPrivacyPolicy?: boolean;
  privacyPolicyAccessible?: boolean;
  
  // Scripts
  thirdPartyScripts?: number;
  inlineScripts?: number;
  
  // Data Collection
  formsDetected?: number;
  autofillDisabled?: boolean;
  piiCollected?: boolean;
}

export interface CategoryScore {
  score: number;
  weight: number;
  weightedScore: number;
  issues: string[];
  recommendations: string[];
}

export interface ScoreBreakdown {
  trackers: CategoryScore;
  cookies: CategoryScore;
  requests: CategoryScore;
  mlCheck: CategoryScore;
  ssl: CategoryScore;
  privacyPolicy: CategoryScore;
  thirdPartyScripts: CategoryScore;
  dataCollection: CategoryScore;
}

export type RiskLevel = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Dangerous';

export interface PrivacyScore {
  score: number;
  riskLevel: RiskLevel;
  factors: PrivacyFactors;
  breakdown: ScoreBreakdown;
  globalPenalties: string[];
  topIssues: string[];
  recommendations: string[];
}

// Category weights (must sum to 100)
const CATEGORY_WEIGHTS = {
  trackers: 20,
  cookies: 18,
  requests: 10,
  mlCheck: 15,
  ssl: 15,
  privacyPolicy: 7,
  thirdPartyScripts: 10,
  dataCollection: 5
};

export class EnhancedPrivacyScorer {
  private static instance: EnhancedPrivacyScorer;
  private scoreCache: Map<string, { score: number, timestamp: number, factors: PrivacyFactors }> = new Map();
  private readonly SCORE_UPDATE_THRESHOLD = 5; // Only update if score changes by 5+ points
  private readonly CACHE_DURATION = 30000; // 30 seconds cache

  private constructor() {}

  static getInstance(): EnhancedPrivacyScorer {
    if (!EnhancedPrivacyScorer.instance) {
      EnhancedPrivacyScorer.instance = new EnhancedPrivacyScorer();
    }
    return EnhancedPrivacyScorer.instance;
  }

  /**
   * Main scoring function with stabilization
   */
  calculateScore(factors: PrivacyFactors, url?: string): PrivacyScore {
    const domain = url ? new URL(url).hostname : 'unknown';
    
    // Check cache for recent score
    const cached = this.scoreCache.get(domain);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      // Calculate new score to check if update is needed
      const newScore = this.calculateRawScore(factors, url);
      const scoreDiff = Math.abs(newScore.score - cached.score);
      
      // Only update if significant change (5+ points) OR harmful activity detected
      const hasHarmfulActivity = this.detectHarmfulActivity(factors);
      if (scoreDiff < this.SCORE_UPDATE_THRESHOLD && !hasHarmfulActivity) {
        // Return cached score with updated factors
        return { ...newScore, score: cached.score };
      }
    }
    
    // Calculate fresh score
    const result = this.calculateRawScore(factors, url);
    
    // Cache the result
    this.scoreCache.set(domain, {
      score: result.score,
      timestamp: Date.now(),
      factors
    });
    
    return result;
  }

  /**
   * Detect harmful activity that requires immediate warning
   */
  private detectHarmfulActivity(factors: PrivacyFactors): boolean {
    // Trigger if any of these conditions are met:
    return (
      !factors.hasSSL ||                              // No HTTPS
      factors.sslExpired === true ||                  // Expired SSL
      (factors.threatsDetected || 0) > 0 ||           // Threats detected
      (factors.fingerprintAttempts || 0) > 5 ||       // Excessive fingerprinting
      (factors.trackersBlocked || 0) > 30 ||          // Excessive trackers (30+)
      (factors.thirdPartyCookies || 0) > 50 ||        // Excessive tracking cookies (50+)
      factors.piiCollected === true                   // PII collection detected
    );
  }

  /**
   * Raw scoring calculation without caching
   */
  private calculateRawScore(factors: PrivacyFactors, url?: string): PrivacyScore {
    const globalPenalties: string[] = [];

    // Calculate each category (0-100 scores)
    const breakdown: ScoreBreakdown = {
      trackers: this.scoreTrackers(factors),
      cookies: this.scoreCookies(factors, url),
      requests: this.scoreRequests(factors, url),
      mlCheck: this.scoreMLCheck(factors),
      ssl: this.scoreSSL(factors),
      privacyPolicy: this.scorePrivacyPolicy(factors),
      thirdPartyScripts: this.scoreThirdPartyScripts(factors),
      dataCollection: this.scoreDataCollection(factors)
    };

    // Apply weights and sum up
    let finalScore = 0;
    for (const [category, data] of Object.entries(breakdown)) {
      const weight = CATEGORY_WEIGHTS[category as keyof typeof CATEGORY_WEIGHTS];
      data.weight = weight;
      data.weightedScore = (data.score * weight) / 100;
      finalScore += data.weightedScore;
    }

    // Apply global penalties
    const penalties = this.calculateGlobalPenalties(factors);
    finalScore -= penalties.totalPenalty;
    globalPenalties.push(...penalties.messages);

    // Clamp to 0-100
    finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));

    // Get risk level
    const riskLevel = this.getRiskLevel(finalScore);

    // Collect top issues and recommendations
    const { topIssues, recommendations } = this.getTopIssuesAndRecommendations(breakdown, globalPenalties);

    return {
      score: finalScore,
      riskLevel,
      factors,
      breakdown,
      globalPenalties,
      topIssues,
      recommendations
    };
  }

  /**
   * 1) Trackers - weight 20%
   */
  private scoreTrackers(factors: PrivacyFactors): CategoryScore {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const count = factors.trackersBlocked || 0;
    const fingerprints = factors.fingerprintAttempts || 0;

    // Start at 100, deduct for trackers found
    let score = 100;
    
    if (count === 0) {
      score = 100;  // Perfect
    } else if (count <= 3) {
      score = 95;   // Very good
    } else if (count <= 10) {
      score = 80;   // Good
    } else if (count <= 20) {
      score = 60;   // Fair
    } else {
      score = 30;   // Poor
    }

    // Fingerprinting penalty
    if (fingerprints > 0) {
      score -= Math.min(fingerprints * 10, 30);
      issues.push(`${fingerprints} fingerprinting attempts`);
    }

    score = Math.max(0, score);

    if (count > 0) {
      issues.push(`${count} trackers blocked`);
      recommendations.push('Continue using tracker blocking');
    }

    return { score, weight: 0, weightedScore: 0, issues, recommendations };
  }

  /**
   * 2) Cookies - weight 18%
   * ONLY penalize tracking cookies, NOT necessary ones
   */
  private scoreCookies(factors: PrivacyFactors, url?: string): CategoryScore {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const total = factors.cookiesManaged || 0;
    const thirdParty = factors.thirdPartyCookies || 0;

    // No cookies = perfect
    if (total === 0) {
      return { 
        score: 100, 
        weight: 0, 
        weightedScore: 0, 
        issues: ['✓ No cookies'], 
        recommendations: [] 
      };
    }

    // Estimate tracking vs necessary
    // Conservative: Only penalize third-party cookies (usually tracking)
    const estimatedTracking = thirdParty;
    
    let score = 100;
    
    if (estimatedTracking === 0) {
      score = 100;  // All first-party (likely necessary)
    } else if (estimatedTracking <= 5) {
      score = 95;   // Minimal tracking
    } else if (estimatedTracking <= 15) {
      score = 80;   // Some tracking
    } else if (estimatedTracking <= 30) {
      score = 60;   // Moderate tracking
    } else {
      score = 30;   // Heavy tracking
    }

    if (estimatedTracking > 10) {
      issues.push(`${estimatedTracking} third-party cookies`);
      recommendations.push('Block third-party tracking cookies');
    } else if (total > 0) {
      issues.push(`✓ Mostly necessary cookies (${total} total)`);
    }

    return { score, weight: 0, weightedScore: 0, issues, recommendations };
  }

  /**
   * 3) Requests - weight 10%
   * ONLY penalize high third-party ratio, NOT total count
   */
  private scoreRequests(factors: PrivacyFactors, url?: string): CategoryScore {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const total = factors.totalRequests || 0;
    const thirdParty = factors.thirdPartyRequests || 0;
    
    if (total === 0) {
      return {
        score: 100,
        weight: 0,
        weightedScore: 0,
        issues: [],
        recommendations: []
      };
    }
    
    const thirdPartyRatio = total > 0 ? thirdParty / total : 0;

    // Score based ONLY on ratio (LIGHTER - CDN/video platforms need requests)
    let score = 100;
    
    if (thirdPartyRatio <= 0.30) {
      score = 100;  // 0-30% = Excellent (increased from 20%)
    } else if (thirdPartyRatio <= 0.50) {
      score = 95;   // 31-50% = Very Good (increased from 40%)
    } else if (thirdPartyRatio <= 0.70) {
      score = 85;   // 51-70% = Good (more lenient for CDN/video)
    } else if (thirdPartyRatio <= 0.85) {
      score = 70;   // 71-85% = Fair
    } else {
      score = 50;   // 86%+ = Poor (only extreme cases)
    }

    const ratioPercent = Math.round(thirdPartyRatio * 100);
    if (thirdPartyRatio > 0.70) {
      issues.push(`${ratioPercent}% third-party requests`);
      recommendations.push('Consider reducing third-party dependencies');
    } else if (thirdPartyRatio > 0.50) {
      issues.push(`${ratioPercent}% third-party (acceptable for CDN/media)`);
    } else {
      issues.push(`✓ Good third-party ratio (${ratioPercent}%)`);
    }

    return { score, weight: 0, weightedScore: 0, issues, recommendations };
  }

  /**
   * 4) ML Check - weight 15%
   * ⚠️ HARDCODED PLACEHOLDER - ML model NOT trained yet
   * Returns 100/100 until real ML model is implemented
   * Threats are handled separately in global penalties
   */
  private scoreMLCheck(factors: PrivacyFactors): CategoryScore {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    // HARDCODED: Always return 100/100 since ML is not ready
    // Do NOT penalize based on heuristics - unfair to sites
    const score = 100;

    issues.push('✓ ML check: model not trained (default safe)');

    return { score, weight: 0, weightedScore: 0, issues, recommendations };
  }

  /**
   * 5) SSL - weight 15%
   */
  private scoreSSL(factors: PrivacyFactors): CategoryScore {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const hasSSL = factors.hasSSL ?? true;
    const strength = factors.sslStrength || 'strong';
    const expired = factors.sslExpired || false;

    let score = 100;

    if (!hasSSL) {
      score = 0;
      issues.push('🚨 No HTTPS encryption');
      recommendations.push('Use HTTPS for security');
    } else if (expired) {
      score = 20;
      issues.push('⚠️ SSL certificate expired');
    } else if (strength === 'weak') {
      score = 60;
      issues.push('Weak SSL configuration');
    } else if (strength === 'medium') {
      score = 85;
    } else {
      score = 100;
      issues.push('✓ Strong HTTPS encryption');
    }

    return { score, weight: 0, weightedScore: 0, issues, recommendations };
  }

  /**
   * 6) Privacy Policy - weight 7%
   */
  private scorePrivacyPolicy(factors: PrivacyFactors): CategoryScore {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const hasPolicy = factors.hasPrivacyPolicy || false;
    const accessible = factors.privacyPolicyAccessible ?? hasPolicy; // Default to hasPolicy

    let score = 100;

    if (!hasPolicy) {
      score = 50;  // Increased from 30 (less harsh)
      issues.push('No privacy policy found');
      recommendations.push('Look for privacy policy');
    } else if (!accessible) {
      score = 85;  // Increased from 60 (if found, likely accessible)
      issues.push('Privacy policy found');
    } else {
      score = 100;
      issues.push('✓ Privacy policy available');
    }

    return { score, weight: 0, weightedScore: 0, issues, recommendations };
  }

  /**
   * 7) Third-Party Scripts - weight 10%
   */
  private scoreThirdPartyScripts(factors: PrivacyFactors): CategoryScore {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const count = factors.thirdPartyScripts || 0;

    let score = 100;

    if (count === 0) {
      score = 100;
    } else if (count <= 10) {
      score = 95;   // Increased threshold and score
    } else if (count <= 25) {
      score = 85;   // More lenient for modern apps
    } else if (count <= 50) {
      score = 70;   // Video platforms need many scripts
    } else {
      score = 50;   // Only extremely heavy sites penalized
    }

    if (count > 50) {
      issues.push(`${count} third-party scripts (very high)`);
      recommendations.push('Review script necessity');
    } else if (count > 25) {
      issues.push(`${count} third-party scripts (acceptable for complex apps)`);
    } else if (count > 0) {
      issues.push(`${count} third-party scripts`);
    }

    return { score, weight: 0, weightedScore: 0, issues, recommendations };
  }

  /**
   * 8) Data Collection - weight 5%
   */
  private scoreDataCollection(factors: PrivacyFactors): CategoryScore {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const forms = factors.formsDetected || 0;
    const pii = factors.piiCollected || false;

    let score = 100;

    if (pii) {
      score -= 50;
      issues.push('PII collection detected');
    }

    if (forms > 5) {
      score -= 20;
      issues.push(`${forms} forms detected`);
    }

    score = Math.max(0, score);

    return { score, weight: 0, weightedScore: 0, issues, recommendations };
  }

  /**
   * Global penalties (applied after weighted sum)
   */
  private calculateGlobalPenalties(factors: PrivacyFactors): { totalPenalty: number; messages: string[] } {
    let totalPenalty = 0;
    const messages: string[] = [];

    // HTTP-only penalty
    if (!factors.hasSSL) {
      totalPenalty += 10;
      messages.push('HTTP only (-10 points)');
    }

    // Threat penalty (capped)
    const threats = factors.threatsDetected || 0;
    if (threats > 0) {
      const threatPenalty = Math.min(15, threats * 2);
      totalPenalty += threatPenalty;
      messages.push(`${threats} threats (-${threatPenalty} points)`);
    }

    // SSL expired
    if (factors.sslExpired) {
      totalPenalty += 15;
      messages.push('SSL expired (-15 points)');
    }

    // PII leak
    if (factors.piiCollected) {
      totalPenalty += 10;
      messages.push('PII collected (-10 points)');
    }

    return { totalPenalty, messages };
  }

  /**
   * Get risk level
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 25) return 'Poor';
    return 'Dangerous';
  }

  /**
   * Collect top issues and recommendations
   */
  private getTopIssuesAndRecommendations(breakdown: ScoreBreakdown, globalPenalties: string[]): { topIssues: string[]; recommendations: string[] } {
    const allIssues: Array<{ issue: string; score: number }> = [];
    const allRecommendations: string[] = [];

    for (const [category, data] of Object.entries(breakdown)) {
      for (const issue of data.issues) {
        if (!issue.startsWith('✓')) {
          allIssues.push({ issue, score: data.score });
        }
      }
      allRecommendations.push(...data.recommendations);
    }

    // Sort by severity (lowest score = highest priority)
    allIssues.sort((a, b) => a.score - b.score);

    const topIssues = [
      ...globalPenalties,
      ...allIssues.slice(0, 5).map(x => x.issue)
    ];

    return { topIssues, recommendations: allRecommendations.slice(0, 5) };
  }

  /**
   * Get color for risk level
   */
  getRiskColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'Excellent': return '#10b981';
      case 'Good': return '#3b82f6';
      case 'Fair': return '#f59e0b';
      case 'Poor': return '#ef4444';
      case 'Dangerous': return '#dc2626';
    }
  }

  /**
   * Get icon for risk level
   */
  getRiskIcon(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'Excellent': return '✅';
      case 'Good': return '👍';
      case 'Fair': return '⚠️';
      case 'Poor': return '⛔';
      case 'Dangerous': return '🚨';
    }
  }

  /**
   * Clear score cache (useful for testing or reset)
   */
  clearCache(domain?: string): void {
    if (domain) {
      this.scoreCache.delete(domain);
    } else {
      this.scoreCache.clear();
    }
  }

  /**
   * Check if site has harmful activity requiring immediate alert
   * Only shows warning overlay for CRITICAL threats (No HTTPS, Expired SSL, Security Threats/Malware)
   * High/Medium threats are tracked but don't trigger overlay
   */
  shouldShowWarning(factors: PrivacyFactors): { 
    show: boolean; 
    reason: string;
    details: {
      type: string;
      harmLevel: 'Critical' | 'High' | 'Medium';
      threats: Array<{ name: string; purpose: string; target: string; }>;
      count: number;
    } | null;
  } {
    // CRITICAL: No HTTPS encryption
    if (!factors.hasSSL) {
      return { 
        show: true, 
        reason: 'No HTTPS encryption - your data may not be secure',
        details: {
          type: 'No Encryption',
          harmLevel: 'Critical',
          threats: [{
            name: 'Unencrypted Connection',
            purpose: 'Data transmitted without encryption',
            target: 'Passwords, personal information, and browsing activity may be exposed'
          }],
          count: 1
        }
      };
    }
    
    // CRITICAL: SSL certificate expired
    if (factors.sslExpired) {
      return { 
        show: true, 
        reason: 'SSL certificate expired - connection may be compromised',
        details: {
          type: 'Expired Certificate',
          harmLevel: 'Critical',
          threats: [{
            name: 'Invalid SSL Certificate',
            purpose: 'Could potentially impersonate legitimate website',
            target: 'Login credentials, payment information, and personal data may be at risk'
          }],
          count: 1
        }
      };
    }
    
    // CRITICAL: Security threats (malware, phishing, etc.)
    // IMPORTANT: Fingerprinting is HIGH (not CRITICAL), so filter it out!
    if ((factors.threatsDetected || 0) > 0) {
      // Get actual threat details if available
      const threatDetails = (factors as any).threatDetails || [];
      
      // CRITICAL FIX: Filter OUT fingerprinting threats (they're HIGH severity, not CRITICAL)
      const criticalThreats = threatDetails.filter((t: any) => 
        t.type !== 'Fingerprinting'  // Exclude fingerprinting from critical threats
      );
      
      // Only show warning if we have CRITICAL threats (not fingerprinting)
      if (criticalThreats.length === 0) {
        // All threats are fingerprinting (HIGH severity) - no overlay needed
        // Let it fall through to fingerprinting check below
        return { show: false, reason: '', details: null };
      }
      
      const count = criticalThreats.length;
      const threats = criticalThreats.map((t: any) => ({
        name: t.name,
        purpose: t.description,
        target: this.getThreatTarget(t.type)
      }));
      
      return { 
        show: true, 
        reason: `${count} potential security ${count === 1 ? 'threat' : 'threats'} detected`,
        details: {
          type: 'Security Threats',
          harmLevel: 'Critical',
          threats,
          count
        }
      };
    }
    
    // HIGH: Fingerprinting (tracked but no warning overlay)
    if ((factors.fingerprintAttempts || 0) > 10) {
      const count = factors.fingerprintAttempts || 0;
      return { 
        show: false, // Don't show overlay for High-level threats
        reason: `${count} potential fingerprinting attempts detected`,
        details: {
          type: 'Fingerprinting',
          harmLevel: 'High',
          threats: [
            {
              name: 'Canvas Fingerprinting Attempt',
              purpose: 'May create unique browser signature',
              target: 'Could enable tracking across websites without cookies'
            },
            {
              name: 'WebGL Fingerprinting Attempt',
              purpose: 'May identify your device hardware',
              target: 'Could link your activities across different sessions'
            },
            {
              name: 'Audio Context Fingerprinting Attempt',
              purpose: 'May analyze audio processing',
              target: 'Could build persistent tracking profile'
            },
            {
              name: 'Font Enumeration Attempt',
              purpose: 'May detect installed fonts',
              target: 'Could create unique identifier for your device'
            }
          ],
          count
        }
      };
    }
    
    // HIGH: Excessive tracking (tracked but no warning overlay)
    if ((factors.trackersBlocked || 0) > 50) {
      const count = factors.trackersBlocked || 0;
      const vendors = factors.trackerVendors || [];
      const threats = vendors.slice(0, 5).map(vendor => ({
        name: vendor,
        purpose: 'May track browsing behavior and build profile',
        target: 'Browsing history, interests, demographics, and location data may be collected'
      }));
      
      if (threats.length === 0) {
        threats.push({
          name: 'Multiple Tracking Domains',
          purpose: 'May monitor and record activities',
          target: 'Complete browsing profile and behavioral data may be collected'
        });
      }
      
      return { 
        show: false, // Don't show overlay for High-level threats
        reason: `${count} potential trackers detected - site may be heavily monitored`,
        details: {
          type: 'Excessive Tracking',
          harmLevel: 'High',
          threats,
          count
        }
      };
    }
    
    // MEDIUM: PII collection (tracked but no warning overlay)
    if (factors.piiCollected) {
      return { 
        show: false, // Don't show overlay for Medium-level threats
        reason: 'Potential unauthorized personal information collection detected',
        details: {
          type: 'PII Collection',
          harmLevel: 'Medium',
          threats: [{
            name: 'Possible Unauthorized Data Collection',
            purpose: 'May collect personally identifiable information',
            target: 'Name, email, phone number, address, and financial details may be at risk'
          }],
          count: 1
        }
      };
    }
    
    return { show: false, reason: '', details: null };
  }

  /**
   * Get threat target description based on threat type
   */
  private getThreatTarget(threatType: string): string {
    const targets: Record<string, string> = {
      'Phishing': 'Login credentials, payment information, and personal data may be at risk',
      'Fingerprinting': 'Device identification and cross-site tracking may occur',
      'Tracking': 'Browsing history and behavioral data may be collected',
      'Malware': 'System security and personal files may be compromised',
      'Generic': 'Various types of data may be at risk'
    };
    return targets[threatType] || 'Personal information and privacy may be at risk';
  }
}
