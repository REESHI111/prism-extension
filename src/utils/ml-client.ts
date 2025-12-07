/**
 * ML Phishing Detection Client
 * Communicates with local ML API server for real-time threat detection
 */

export interface MLAnalysisResult {
  url: string;
  is_phishing: boolean;
  confidence: number;
  risk_level: 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  ml_prediction: {
    is_phishing: boolean;
    phishing_probability: number;
    legitimate_probability: number;
  };
  ssl_validation: {
    valid: boolean;
    issuer: string | null;
    days_until_expiry: number | null;
    error: string | null;
  };
  reasons: string[];
  features: Record<string, number>;
  timestamp: string;
}

export interface MLBatchResult {
  url: string;
  is_phishing: boolean;
  confidence: number;
  risk_score: number;
  error?: string;
}

export class MLClient {
  private static instance: MLClient;
  private apiBaseUrl = 'http://localhost:5000/api';
  private cache = new Map<string, { result: MLAnalysisResult; timestamp: number }>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes
  private serverAvailable = false;
  private lastHealthCheck = 0;
  private healthCheckInterval = 30000; // Check every 30 seconds

  private constructor() {
    this.checkServerHealth();
  }

  static getInstance(): MLClient {
    if (!MLClient.instance) {
      MLClient.instance = new MLClient();
    }
    return MLClient.instance;
  }

  /**
   * Check if ML API server is running
   */
  async checkServerHealth(): Promise<boolean> {
    const now = Date.now();
    
    // Use cached result if recent
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.serverAvailable;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000) // 2 second timeout
      });

      if (response.ok) {
        const data = await response.json();
        this.serverAvailable = data.model_loaded === true;
        this.lastHealthCheck = now;
        return this.serverAvailable;
      }
      
      this.serverAvailable = false;
      this.lastHealthCheck = now;
      return false;
    } catch (error) {
      this.serverAvailable = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  /**
   * Analyze a single URL with ML model
   */
  async analyzeURL(url: string, useCache = true): Promise<MLAnalysisResult | null> {
    // Check cache first
    if (useCache) {
      const cached = this.cache.get(url);
      if (cached && (Date.now() - cached.timestamp) < this.cacheTTL) {
        return cached.result;
      }
    }

    // Check if server is available
    const serverHealthy = await this.checkServerHealth();
    if (!serverHealthy) {
      console.warn('ML API server not available, using fallback detection');
      return this.fallbackDetection(url);
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result: MLAnalysisResult = await response.json();
      
      // Cache result
      this.cache.set(url, { result, timestamp: Date.now() });
      
      // Cleanup old cache entries (keep last 1000)
      if (this.cache.size > 1000) {
        const entries = Array.from(this.cache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        for (let i = 0; i < 100; i++) {
          this.cache.delete(entries[i][0]);
        }
      }

      return result;
    } catch (error) {
      console.error('ML analysis failed:', error);
      return this.fallbackDetection(url);
    }
  }

  /**
   * Analyze multiple URLs in batch
   */
  async analyzeBatch(urls: string[]): Promise<MLBatchResult[]> {
    const serverHealthy = await this.checkServerHealth();
    if (!serverHealthy) {
      return urls.map(url => this.fallbackDetectionBatch(url));
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
        signal: AbortSignal.timeout(30000) // 30 second timeout for batch
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Batch analysis failed:', error);
      return urls.map(url => this.fallbackDetectionBatch(url));
    }
  }

  /**
   * Fallback detection when ML server is unavailable
   * Uses simple heuristics
   */
  private fallbackDetection(url: string): MLAnalysisResult {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();
      
      let risk_score = 0;
      const reasons: string[] = [];

      // Check HTTPS
      if (parsed.protocol !== 'https:') {
        risk_score += 20;
        reasons.push('No HTTPS encryption');
      }

      // Check for IP address
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
        risk_score += 30;
        reasons.push('Uses IP address instead of domain');
      }

      // Check for suspicious TLDs
      const suspiciousTLDs = ['tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'work', 'click'];
      const tld = hostname.split('.').pop() || '';
      if (suspiciousTLDs.includes(tld)) {
        risk_score += 25;
        reasons.push('Suspicious domain extension');
      }

      // Check for many hyphens
      const hyphenCount = (hostname.match(/-/g) || []).length;
      if (hyphenCount >= 3) {
        risk_score += 15;
        reasons.push(`Multiple hyphens (${hyphenCount})`);
      }

      // Check URL length
      if (url.length > 80) {
        risk_score += 10;
        reasons.push('Very long URL');
      }

      const is_phishing = risk_score >= 50;
      const risk_level = risk_score >= 80 ? 'CRITICAL' : 
                        risk_score >= 60 ? 'HIGH' :
                        risk_score >= 40 ? 'MEDIUM' :
                        risk_score >= 20 ? 'LOW' : 'SAFE';

      return {
        url,
        is_phishing,
        confidence: risk_score / 100,
        risk_level,
        risk_score,
        ml_prediction: {
          is_phishing,
          phishing_probability: risk_score / 100,
          legitimate_probability: 1 - (risk_score / 100)
        },
        ssl_validation: {
          valid: parsed.protocol === 'https:',
          issuer: null,
          days_until_expiry: null,
          error: 'ML server unavailable - using fallback'
        },
        reasons,
        features: {},
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        url,
        is_phishing: false,
        confidence: 0,
        risk_level: 'SAFE',
        risk_score: 0,
        ml_prediction: {
          is_phishing: false,
          phishing_probability: 0,
          legitimate_probability: 1
        },
        ssl_validation: {
          valid: false,
          issuer: null,
          days_until_expiry: null,
          error: 'Invalid URL'
        },
        reasons: ['Invalid URL'],
        features: {},
        timestamp: new Date().toISOString()
      };
    }
  }

  private fallbackDetectionBatch(url: string): MLBatchResult {
    const result = this.fallbackDetection(url);
    return {
      url,
      is_phishing: result.is_phishing,
      confidence: result.confidence,
      risk_score: result.risk_score
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }

  /**
   * Is server available
   */
  isServerAvailable(): boolean {
    return this.serverAvailable;
  }
}

// Export singleton instance
export const mlClient = MLClient.getInstance();
