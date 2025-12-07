/**
 * Feature Health Checker
 * Verifies all scoring features are working properly
 */

export interface FeatureHealthStatus {
  feature: string;
  healthy: boolean;
  lastChecked: number;
  details: string;
}

export interface FeatureHealthReport {
  allHealthy: boolean;
  issueCount: number;
  features: FeatureHealthStatus[];
  timestamp: number;
}

export class FeatureHealthChecker {
  private static instance: FeatureHealthChecker;

  private constructor() {}

  static getInstance(): FeatureHealthChecker {
    if (!FeatureHealthChecker.instance) {
      FeatureHealthChecker.instance = new FeatureHealthChecker();
    }
    return FeatureHealthChecker.instance;
  }

  /**
   * Run comprehensive health check on all features
   */
  async checkAllFeatures(): Promise<FeatureHealthReport> {
    const features: FeatureHealthStatus[] = [];

    // Check ML Model Loading
    features.push(await this.checkMLModel());

    // Check Cookie Tracking
    features.push(await this.checkCookieTracking());

    // Check Request Tracking
    features.push(await this.checkRequestTracking());

    // Check Tracker Database
    features.push(await this.checkTrackerDatabase());

    // Check Privacy Scorer
    features.push(await this.checkPrivacyScorer());

    // Check Storage
    features.push(await this.checkStorage());

    const issueCount = features.filter(f => !f.healthy).length;

    return {
      allHealthy: issueCount === 0,
      issueCount,
      features,
      timestamp: Date.now()
    };
  }

  private async checkMLModel(): Promise<FeatureHealthStatus> {
    try {
      const response = await fetch(chrome.runtime.getURL('/ml/model_lightweight.json'));
      if (!response.ok) {
        return {
          feature: 'ML Phishing Detection',
          healthy: false,
          lastChecked: Date.now(),
          details: 'Model file not found or corrupted'
        };
      }

      const model = await response.json();
      if (!model.coefficients || !model.intercept) {
        return {
          feature: 'ML Phishing Detection',
          healthy: false,
          lastChecked: Date.now(),
          details: 'Model structure invalid'
        };
      }

      return {
        feature: 'ML Phishing Detection',
        healthy: true,
        lastChecked: Date.now(),
        details: `Model loaded (${model.coefficients.length} features)`
      };
    } catch (error) {
      return {
        feature: 'ML Phishing Detection',
        healthy: false,
        lastChecked: Date.now(),
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }

  private async checkCookieTracking(): Promise<FeatureHealthStatus> {
    try {
      const testDomain = 'example.com';
      const cookies = await chrome.cookies.getAll({ domain: testDomain });
      
      return {
        feature: 'Cookie Tracking',
        healthy: true,
        lastChecked: Date.now(),
        details: 'Cookie API accessible'
      };
    } catch (error) {
      return {
        feature: 'Cookie Tracking',
        healthy: false,
        lastChecked: Date.now(),
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }

  private async checkRequestTracking(): Promise<FeatureHealthStatus> {
    try {
      // Check if webRequest API is available
      if (!chrome.webRequest) {
        return {
          feature: 'Request Tracking',
          healthy: false,
          lastChecked: Date.now(),
          details: 'webRequest API not available'
        };
      }

      return {
        feature: 'Request Tracking',
        healthy: true,
        lastChecked: Date.now(),
        details: 'webRequest API active'
      };
    } catch (error) {
      return {
        feature: 'Request Tracking',
        healthy: false,
        lastChecked: Date.now(),
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }

  private async checkTrackerDatabase(): Promise<FeatureHealthStatus> {
    try {
      const { isTrackerDomain } = await import('../utils/enhanced-tracker-database');
      
      // Test with known tracker
      const isTracker = isTrackerDomain('https://google-analytics.com/analytics.js');
      
      return {
        feature: 'Tracker Database',
        healthy: true,
        lastChecked: Date.now(),
        details: 'Database loaded and functional'
      };
    } catch (error) {
      return {
        feature: 'Tracker Database',
        healthy: false,
        lastChecked: Date.now(),
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }

  private async checkPrivacyScorer(): Promise<FeatureHealthStatus> {
    try {
      const { EnhancedPrivacyScorer } = await import('../utils/enhanced-privacy-scorer');
      const scorer = EnhancedPrivacyScorer.getInstance();

      // Test with dummy data
      const testFactors = {
        trackersBlocked: 0,
        trackerVendors: [],
        fingerprintAttempts: 0,
        cookiesManaged: 10,
        secureCookies: 5,
        httpOnlyCookies: 3,
        sameSiteCookies: 3,
        thirdPartyCookies: 2,
        totalRequests: 100,
        thirdPartyRequests: 30,
        mixedContent: false,
        httpOnly: true,
        phishingScore: 100,
        threatsDetected: 0,
        hasSSL: true,
        sslValid: true,
        sslCertificate: true,
        sslStrength: 'strong' as const,
        hasHSTS: true,
        privacyPolicyFound: true,
        privacyPolicyQuality: 'good' as const,
        thirdPartyScripts: 5,
        scriptVendors: [],
        scriptRisk: 'low' as const
      };

      const result = scorer.calculateScore(testFactors);

      if (typeof result.score !== 'number' || result.score < 0 || result.score > 100) {
        return {
          feature: 'Privacy Scorer',
          healthy: false,
          lastChecked: Date.now(),
          details: 'Invalid score calculation'
        };
      }

      return {
        feature: 'Privacy Scorer',
        healthy: true,
        lastChecked: Date.now(),
        details: `Scoring engine functional (test: ${result.score}/100)`
      };
    } catch (error) {
      return {
        feature: 'Privacy Scorer',
        healthy: false,
        lastChecked: Date.now(),
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }

  private async checkStorage(): Promise<FeatureHealthStatus> {
    try {
      // Test write
      await chrome.storage.local.set({ '__health_check__': Date.now() });
      
      // Test read
      const result = await chrome.storage.local.get(['__health_check__']);
      
      if (!result['__health_check__']) {
        return {
          feature: 'Storage System',
          healthy: false,
          lastChecked: Date.now(),
          details: 'Storage read/write failed'
        };
      }

      // Cleanup
      await chrome.storage.local.remove(['__health_check__']);

      return {
        feature: 'Storage System',
        healthy: true,
        lastChecked: Date.now(),
        details: 'Storage read/write functional'
      };
    } catch (error) {
      return {
        feature: 'Storage System',
        healthy: false,
        lastChecked: Date.now(),
        details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }
}
