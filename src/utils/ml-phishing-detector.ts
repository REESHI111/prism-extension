/**
 * ML Phishing Detector - TypeScript Implementation
 * Exactly matches Python feature extractor (55 features)
 * Model v4.0
 */

// Suspicious TLDs
const SUSPICIOUS_TLDS = new Set([
  '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click',
  '.link', '.racing', '.party', '.review', '.trade', '.webcam', '.win',
  '.bid', '.loan', '.download', '.stream', '.science', '.date', '.faith'
]);

// Brand names for mimicry detection
const BRAND_NAMES = new Set([
  'google', 'facebook', 'paypal', 'amazon', 'apple', 'microsoft',
  'netflix', 'instagram', 'twitter', 'linkedin', 'ebay', 'wells',
  'chase', 'bank', 'citi', 'hsbc', 'yahoo', 'adobe', 'dropbox'
]);

// Phishing keywords
const PHISHING_KEYWORDS = new Set([
  'verify', 'account', 'update', 'confirm', 'login', 'signin', 'secure',
  'banking', 'suspend', 'urgent', 'alert', 'security', 'password',
  'identity', 'billing', 'payment', 'wallet', 'restore', 'locked'
]);

interface ModelData {
  version: string;
  coefficients: number[];
  intercept: number;
  scaler_mean: number[];
  scaler_scale: number[];
  feature_names: string[];
  num_features: number;
}

class URLFeatureExtractor {
  /**
   * Extract all 55 features from a URL
   * MUST match Python implementation exactly
   */
  extractFeatures(url: string): number[] {
    const urlLower = url.toLowerCase();
    const parsed = this.parseURL(urlLower);
    
    const features: number[] = [];
    
    // CATEGORY 1: Basic URL Structure (10 features)
    features.push(...this.basicURLFeatures(url, urlLower, parsed));
    
    // CATEGORY 2: Domain Analysis (15 features)
    features.push(...this.domainFeatures(parsed));
    
    // CATEGORY 3: Path & Query Analysis (10 features)
    features.push(...this.pathQueryFeatures(parsed));
    
    // CATEGORY 4: Security Indicators (5 features)
    features.push(...this.securityFeatures(parsed, urlLower));
    
    // CATEGORY 5: Keyword Detection (5 features)
    features.push(...this.keywordFeatures(urlLower, parsed));
    
    // CATEGORY 6: Brand Mimicry Detection (5 features)
    features.push(...this.brandMimicryFeatures(parsed));
    
    // CATEGORY 7: Advanced Statistics (5 features)
    features.push(...this.advancedFeatures(urlLower, parsed));
    
    return features;
  }
  
  private parseURL(url: string): { protocol: string; hostname: string; pathname: string; search: string } {
    try {
      const urlObj = new URL(url);
      return {
        protocol: urlObj.protocol.replace(':', ''),
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        search: urlObj.search.substring(1) // Remove leading '?'
      };
    } catch {
      // Fallback parsing for invalid URLs
      const match = url.match(/^([a-z]+):\/\/([^\/\?]+)(\/[^\?]*)?\??(.*)$/);
      if (match) {
        return {
          protocol: match[1] || '',
          hostname: match[2] || '',
          pathname: match[3] || '',
          search: match[4] || ''
        };
      }
      return { protocol: '', hostname: '', pathname: '', search: '' };
    }
  }
  
  private basicURLFeatures(url: string, urlLower: string, parsed: any): number[] {
    return [
      url.length,                                    // 1. URL length
      this.countChar(url, '.'),                      // 2. Number of dots
      this.countChar(url, '-'),                      // 3. Number of hyphens
      this.countChar(url, '_'),                      // 4. Number of underscores
      this.countChar(url, '/'),                      // 5. Number of slashes
      this.countChar(url, '?'),                      // 6. Number of question marks
      this.countChar(url, '&'),                      // 7. Number of ampersands
      this.countChar(url, '='),                      // 8. Number of equals signs
      this.countChar(url, '@'),                      // 9. Number of @ symbols
      this.countDigits(url)                          // 10. Number of digits
    ];
  }
  
  private domainFeatures(parsed: any): number[] {
    const domain = parsed.hostname;
    const parts = domain.split('.');
    const numSubdomains = Math.max(0, parts.length - 2);
    const domainPart = parts.length >= 2 ? parts[parts.length - 2] : domain;
    
    // Subdomain length
    let subdomainLength = 0;
    if (numSubdomains > 0) {
      subdomainLength = parts.slice(0, -2).join('.').length;
    }
    
    return [
      domain.length,                                                    // 1. Domain length
      this.countChar(domain, '.'),                                     // 2. Number of dots
      this.countChar(domain, '-'),                                     // 3. Number of hyphens
      this.countDigits(domain),                                        // 4. Number of digits
      this.hasSuspiciousTLD(domain) ? 1 : 0,                          // 5. Has suspicious TLD
      this.isIPAddress(domain) ? 1 : 0,                               // 6. Is IP address
      numSubdomains,                                                   // 7. Number of subdomains
      subdomainLength,                                                 // 8. Subdomain length
      (/\d/.test(domain) && /[a-z]/.test(domain)) ? 1 : 0,           // 9. Has digit-letter substitution
      /[bcdfghjklmnpqrstvwxyz]{4,}/.test(domain) ? 1 : 0,             // 10. Consecutive consonants
      this.calculateEntropy(domain),                                   // 11. Domain entropy
      (domain.includes(':') && !domain.startsWith('[')) ? 1 : 0,      // 12. Has port number
      (this.countChar(domain, '-') >= 2) ? 1 : 0,                     // 13. Multiple hyphens
      (domainPart.length <= 5) ? 1 : 0,                               // 14. Domain very short
      (domainPart.length >= 20) ? 1 : 0                               // 15. Domain very long
    ];
  }
  
  private pathQueryFeatures(parsed: any): number[] {
    const path = parsed.pathname;
    const query = parsed.search;
    
    // Path depth
    const pathParts = path.split('/').filter((p: string) => p);
    const pathDepth = pathParts.length;
    
    // Number of parameters
    const numParams = query ? query.split('&').length : 0;
    
    return [
      path.length,                                                     // 1. Path length
      this.countChar(path, '/'),                                      // 2. Slashes in path
      this.countChar(path, '.'),                                      // 3. Dots in path
      pathDepth,                                                       // 4. Path depth
      query.length,                                                    // 5. Query length
      numParams,                                                       // 6. Number of parameters
      /\.(php|exe|zip|html?)$/i.test(path) ? 1 : 0,                  // 7. Suspicious extensions
      /(login|signin)/.test(path.toLowerCase()) ? 1 : 0,              // 8. Has login/signin
      path.toLowerCase().includes('admin') ? 1 : 0,                   // 9. Has admin
      this.hasSensitiveParams(query) ? 1 : 0                          // 10. Sensitive params
    ];
  }
  
  private securityFeatures(parsed: any, urlLower: string): number[] {
    const isHTTPS = parsed.protocol === 'https';
    const hasFinancialKeywords = ['bank', 'pay', 'secure', 'account'].some(word => urlLower.includes(word));
    
    return [
      isHTTPS ? 1 : 0,                                                // 1. Uses HTTPS
      (!isHTTPS && hasFinancialKeywords) ? 1 : 0,                    // 2. HTTP with financial keywords
      parsed.hostname.includes('https') ? 1 : 0,                      // 3. 'https' in domain
      this.hasFakeWWW(parsed.hostname) ? 1 : 0,                      // 4. Fake www
      (urlLower.includes('https') && urlLower.includes('http://')) ? 1 : 0  // 5. Mixed protocols
    ];
  }
  
  private keywordFeatures(urlLower: string, parsed: any): number[] {
    const keywordCount = Array.from(PHISHING_KEYWORDS).filter(keyword => 
      urlLower.includes(keyword)
    ).length;
    
    return [
      keywordCount,                                                   // 1. Phishing keyword count
      urlLower.includes('verify') ? 1 : 0,                           // 2. Has 'verify'
      urlLower.includes('secure') ? 1 : 0,                           // 3. Has 'secure'
      (urlLower.includes('update') || urlLower.includes('confirm')) ? 1 : 0,  // 4. Has update/confirm
      (keywordCount >= 2) ? 1 : 0                                    // 5. Multiple keywords
    ];
  }
  
  private brandMimicryFeatures(parsed: any): number[] {
    const domain = parsed.hostname;
    const parts = domain.split('.');
    
    // Brand in subdomain
    let brandInSubdomain = 0;
    if (parts.length > 2) {
      const subdomain = parts.slice(0, -2).join('.');
      brandInSubdomain = Array.from(BRAND_NAMES).some(brand => subdomain.includes(brand)) ? 1 : 0;
    }
    
    // Brand count
    const brandCount = Array.from(BRAND_NAMES).filter(brand => domain.includes(brand)).length;
    
    return [
      Array.from(BRAND_NAMES).some(brand => domain.includes(brand)) ? 1 : 0,  // 1. Contains brand
      this.hasBrandWithDigit(domain) ? 1 : 0,                        // 2. Brand with digit substitution
      brandInSubdomain,                                               // 3. Brand in subdomain
      Array.from(BRAND_NAMES).some(brand => domain.includes(brand.replace('', '-'))) ? 1 : 0,  // 4. Brand with hyphen
      (brandCount >= 2) ? 1 : 0                                      // 5. Multiple brands
    ];
  }
  
  private advancedFeatures(urlLower: string, parsed: any): number[] {
    const domain = parsed.hostname;
    
    // Vowel-to-consonant ratio
    const vowels = (urlLower.match(/[aeiou]/g) || []).length;
    const consonants = (urlLower.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
    const vowelConsonantRatio = consonants > 0 ? vowels / consonants : 0;
    
    // Character diversity
    const uniqueChars = new Set(urlLower).size;
    const charDiversity = urlLower.length > 0 ? uniqueChars / urlLower.length : 0;
    
    // Domain-to-URL ratio
    const domainURLRatio = urlLower.length > 0 ? domain.length / urlLower.length : 0;
    
    // Special character ratio
    const specialChars = (urlLower.match(/[^a-z0-9.]/g) || []).length;
    const specialCharRatio = urlLower.length > 0 ? specialChars / urlLower.length : 0;
    
    // Digit ratio in domain
    const domainDigits = (domain.match(/\d/g) || []).length;
    const domainDigitRatio = domain.length > 0 ? domainDigits / domain.length : 0;
    
    return [
      vowelConsonantRatio,
      charDiversity,
      domainURLRatio,
      specialCharRatio,
      domainDigitRatio
    ];
  }
  
  // Helper methods
  private countChar(str: string, char: string): number {
    return (str.match(new RegExp('\\' + char, 'g')) || []).length;
  }
  
  private countDigits(str: string): number {
    return (str.match(/\d/g) || []).length;
  }
  
  private hasSuspiciousTLD(domain: string): boolean {
    return Array.from(SUSPICIOUS_TLDS).some(tld => domain.endsWith(tld));
  }
  
  private isIPAddress(domain: string): boolean {
    return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domain);
  }
  
  private hasSensitiveParams(query: string): boolean {
    const queryLower = query.toLowerCase();
    return ['password', 'token', 'key', 'session'].some(param => queryLower.includes(param));
  }
  
  private hasFakeWWW(domain: string): boolean {
    const parts = domain.split('.');
    return parts.some(part => part.includes('www') && part !== 'www');
  }
  
  private hasBrandWithDigit(domain: string): boolean {
    return Array.from(BRAND_NAMES).some(brand => {
      const pattern = brand.replace(/o/g, '[o0]').replace(/l/g, '[l1]').replace(/i/g, '[i1]');
      return new RegExp(pattern).test(domain);
    });
  }
  
  private calculateEntropy(text: string): number {
    if (!text) return 0;
    
    const freq: { [key: string]: number } = {};
    for (const char of text) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const len = text.length;
    for (const count of Object.values(freq)) {
      const probability = count / len;
      entropy -= probability * Math.log2(probability);
    }
    
    return entropy;
  }
}

class MLPhishingDetector {
  private modelData: ModelData | null = null;
  private featureExtractor: URLFeatureExtractor;
  
  constructor() {
    this.featureExtractor = new URLFeatureExtractor();
  }
  
  async loadModel(): Promise<void> {
    try {
      const response = await fetch(chrome.runtime.getURL('ml/enhanced_model.json'));
      this.modelData = await response.json();
      console.log(`[ML Detector] Model v${this.modelData?.version} loaded with ${this.modelData?.num_features} features`);
    } catch (error) {
      console.error('[ML Detector] Failed to load model:', error);
      throw error;
    }
  }
  
  /**
   * Predict phishing probability for a URL
   * Returns confidence between 0 (safe) and 1 (phishing)
   */
  predict(url: string): number {
    if (!this.modelData) {
      throw new Error('Model not loaded');
    }
    
    // Extract features (55 features)
    const features = this.featureExtractor.extractFeatures(url);
    
    // Standardize features using saved scaler parameters
    const standardizedFeatures = features.map((value, i) => {
      const mean = this.modelData!.scaler_mean[i];
      const scale = this.modelData!.scaler_scale[i];
      return (value - mean) / scale;
    });
    
    // Calculate logistic regression prediction
    // y = 1 / (1 + exp(-(intercept + sum(coef * feature))))
    let logit = this.modelData.intercept;
    for (let i = 0; i < standardizedFeatures.length; i++) {
      logit += this.modelData.coefficients[i] * standardizedFeatures[i];
    }
    
    // Sigmoid function to get probability
    const probability = 1 / (1 + Math.exp(-logit));
    
    return probability;
  }
  
  /**
   * Classify URL as phishing or safe
   */
  classify(url: string): { isPhishing: boolean; confidence: number } {
    const confidence = this.predict(url);
    return {
      isPhishing: confidence >= 0.5,
      confidence: confidence
    };
  }
}

// Singleton instance for browser use
let detectorInstance: MLPhishingDetector | null = null;

/**
 * Get or create the ML detector instance
 */
export async function getMLDetector(): Promise<MLPhishingDetector> {
  if (!detectorInstance) {
    detectorInstance = new MLPhishingDetector();
    await detectorInstance.loadModel();
  }
  return detectorInstance;
}

// Export for use in content script and background
export { MLPhishingDetector, URLFeatureExtractor };
