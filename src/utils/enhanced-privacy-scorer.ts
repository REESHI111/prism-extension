/**
 * Enhanced Privacy Scoring System
 * Phase 3.2: Multi-factor algorithm with SSL, privacy policy, scripts analysis
 */

export interface PrivacyFactors {
  trackersBlocked: number;
  cookiesManaged: number;
  fingerprintAttempts: number;
  threatsDetected: number;
  sslCertificate: boolean;
  privacyPolicyFound: boolean;
  thirdPartyScripts: number;
  mixedContent: boolean;
  httpOnly: boolean;
}

export interface ScoringWeights {
  tracker: number;
  cookie: number;
  fingerprint: number;
  threat: number;
  noSSL: number;
  noPrivacyPolicy: number;
  thirdPartyScript: number;
  mixedContent: number;
  httpOnly: number;
}

export type RiskLevel = 'excellent' | 'good' | 'moderate' | 'poor' | 'critical';

export interface PrivacyScore {
  score: number;
  riskLevel: RiskLevel;
  factors: PrivacyFactors;
  recommendations: string[];
}

export class EnhancedPrivacyScorer {
  private static instance: EnhancedPrivacyScorer;
  
  // Scoring weights (how much each factor affects score)
  private weights: ScoringWeights = {
    tracker: 2,           // -2 points per tracker
    cookie: 1,            // -1 point per cookie
    fingerprint: 5,       // -5 points per fingerprint attempt (serious threat)
    threat: 10,           // -10 points per detected threat
    noSSL: 15,           // -15 points for no HTTPS
    noPrivacyPolicy: 5,  // -5 points for no privacy policy
    thirdPartyScript: 0.5, // -0.5 per third-party script
    mixedContent: 10,     // -10 for mixed content (HTTP + HTTPS)
    httpOnly: 20         // -20 for HTTP only (very insecure)
  };

  private constructor() {}

  static getInstance(): EnhancedPrivacyScorer {
    if (!EnhancedPrivacyScorer.instance) {
      EnhancedPrivacyScorer.instance = new EnhancedPrivacyScorer();
    }
    return EnhancedPrivacyScorer.instance;
  }

  /**
   * Calculate comprehensive privacy score
   */
  calculateScore(factors: PrivacyFactors): PrivacyScore {
    let score = 100; // Start at perfect score
    const recommendations: string[] = [];

    // Deduct for trackers
    const trackerPenalty = Math.min(factors.trackersBlocked * this.weights.tracker, 30);
    score -= trackerPenalty;
    if (factors.trackersBlocked > 0) {
      recommendations.push(`${factors.trackersBlocked} tracker(s) detected and blocked`);
    }

    // Deduct for cookies
    const cookiePenalty = Math.min(factors.cookiesManaged * this.weights.cookie, 20);
    score -= cookiePenalty;
    if (factors.cookiesManaged > 5) {
      recommendations.push(`High cookie usage (${factors.cookiesManaged} cookies)`);
    }

    // Deduct for fingerprinting (serious privacy invasion)
    const fingerprintPenalty = Math.min(factors.fingerprintAttempts * this.weights.fingerprint, 25);
    score -= fingerprintPenalty;
    if (factors.fingerprintAttempts > 0) {
      recommendations.push(`⚠️ Fingerprinting detected (${factors.fingerprintAttempts} attempts)`);
    }

    // Deduct for threats
    const threatPenalty = Math.min(factors.threatsDetected * this.weights.threat, 40);
    score -= threatPenalty;
    if (factors.threatsDetected > 0) {
      recommendations.push(`🚨 ${factors.threatsDetected} security threat(s) detected`);
    }

    // SSL Certificate
    if (!factors.sslCertificate && !factors.httpOnly) {
      score -= this.weights.noSSL;
      recommendations.push('⚠️ No valid SSL certificate');
    }

    // HTTP Only (very insecure)
    if (factors.httpOnly) {
      score -= this.weights.httpOnly;
      recommendations.push('🚨 Using insecure HTTP protocol');
    }

    // Mixed Content
    if (factors.mixedContent) {
      score -= this.weights.mixedContent;
      recommendations.push('⚠️ Mixed content (HTTP + HTTPS)');
    }

    // Privacy Policy
    if (!factors.privacyPolicyFound) {
      score -= this.weights.noPrivacyPolicy;
      recommendations.push('No privacy policy detected');
    }

    // Third-party scripts
    const scriptPenalty = Math.min(factors.thirdPartyScripts * this.weights.thirdPartyScript, 15);
    score -= scriptPenalty;
    if (factors.thirdPartyScripts > 10) {
      recommendations.push(`Many third-party scripts (${factors.thirdPartyScripts})`);
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, Math.round(score)));

    // Determine risk level
    const riskLevel = this.getRiskLevel(score);

    // Add positive recommendations
    if (score >= 90) {
      recommendations.unshift('✅ Excellent privacy protection');
    } else if (score >= 70) {
      recommendations.unshift('✅ Good privacy level');
    }

    return {
      score,
      riskLevel,
      factors,
      recommendations
    };
  }

  /**
   * Get risk level based on score
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'moderate';
    if (score >= 30) return 'poor';
    return 'critical';
  }

  /**
   * Get color for risk level
   */
  getRiskColor(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'excellent': return '#10b981'; // Green
      case 'good': return '#3b82f6';      // Blue
      case 'moderate': return '#f59e0b';  // Amber
      case 'poor': return '#ef4444';      // Red
      case 'critical': return '#dc2626';  // Dark Red
    }
  }

  /**
   * Get icon for risk level
   */
  getRiskIcon(riskLevel: RiskLevel): string {
    switch (riskLevel) {
      case 'excellent': return '✅';
      case 'good': return '👍';
      case 'moderate': return '⚠️';
      case 'poor': return '⛔';
      case 'critical': return '🚨';
    }
  }

  /**
   * Update weights (for future customization)
   */
  updateWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  /**
   * Get current weights
   */
  getWeights(): ScoringWeights {
    return { ...this.weights };
  }
}
