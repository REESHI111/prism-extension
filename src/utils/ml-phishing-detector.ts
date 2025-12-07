/**
 * PRISM ML Phishing Detector
 * Browser-based ML inference for phishing URL detection
 * 
 * Uses lightweight logistic regression model exported from Python
 */

// Legitimate TLDs - NEVER flag as suspicious
// Country-Code TLDs (ccTLDs) - Comprehensive list
const LEGITIMATE_COUNTRY_TLDS = [
  'uk', 'us', 'ca', 'au', 'de', 'fr', 'it', 'es', 'nl', 'be', 'ch', 'at', 'se', 'no', 'dk', 'fi',
  'pl', 'cz', 'hu', 'ro', 'gr', 'pt', 'ie', 'nz', 'sg', 'hk', 'jp', 'kr', 'cn', 'in', 'ru', 'ua',
  'br', 'mx', 'ar', 'cl', 'co', 've', 'za', 'eg', 'ng', 'ke', 'il', 'tr', 'sa', 'ae', 'th', 'vn',
  'my', 'id', 'ph', 'pk', 'bd', 'lk', 'np', 'mm', 'kh', 'la', 'af', 'iq', 'ir', 'jo', 'lb', 'sy',
  // Additional important ccTLDs
  'me', 'tv', 'cc', 'to', 'ws', 'la', 'mn', 'gg', 'ag', 'sh', 'ac', 'ai',
  'as', 'ba', 'bb', 'bh', 'bi', 'bm', 'bn', 'bo', 'bs', 'bt', 'bw', 'by', 'bz',
  'cd', 'cf', 'cg', 'ci', 'ck', 'cm', 'cr', 'cu', 'cv', 'cy', 'cz', 'dj', 'dm', 'do', 'dz',
  'ec', 'ee', 'er', 'et', 'eu', 'fj', 'fk', 'fm', 'fo', 'ga', 'gd', 'ge', 'gf', 'gh', 'gi',
  'gl', 'gm', 'gn', 'gp', 'gq', 'gt', 'gu', 'gw', 'gy', 'hn', 'hr', 'ht', 'hu', 'im', 'is',
  'je', 'jm', 'kw', 'ky', 'kz', 'li', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md', 'mg',
  'mk', 'ml', 'mo', 'mq', 'mr', 'ms', 'mt', 'mu', 'mv', 'mw', 'mz', 'na', 'nc', 'ne', 'nf',
  'ni', 'nu', 'om', 'pa', 'pe', 'pf', 'pg', 'pm', 'pn', 'pr', 'ps', 'pw', 'py', 'qa', 're',
  'rs', 'rw', 'sb', 'sc', 'sd', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'st', 'sv', 'sz',
  'tc', 'td', 'tg', 'tj', 'tk', 'tl', 'tm', 'tn', 'tt', 'tz', 'ug', 'uy', 'uz', 've', 'vg',
  'vi', 'vu', 'wf', 'ye', 'yt', 'zm', 'zw'
];

// Popular Generic TLDs (gTLDs)
const LEGITIMATE_GENERIC_TLDS = [
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'info', 'biz', 'name', 'pro', 'museum', 'coop', 'aero', 'xxx', 'jobs', 'mobi', 'travel', 'tel',
  'asia', 'cat', 'post', 'geo'
];

// Sponsored/Specialized TLDs
const LEGITIMATE_SPONSORED_TLDS = [
  'tech', 'io', 'ai', 'dev', 'app', 'cloud', 'online', 'site', 'website', 'space', 'store',
  'blog', 'news', 'media', 'video', 'music', 'art', 'design', 'photo', 'digital', 'software',
  'email', 'chat', 'social', 'network', 'community', 'forum', 'wiki', 'docs', 'web', 'page',
  'academy', 'school', 'university', 'education', 'courses', 'training', 'institute', 'college',
  'business', 'company', 'corporate', 'enterprise', 'solutions', 'services', 'consulting',
  'finance', 'bank', 'insurance', 'legal', 'lawyer', 'agency', 'studio', 'group', 'partners',
  'health', 'medical', 'clinic', 'hospital', 'care', 'dental', 'fitness', 'yoga', 'sports',
  'shop', 'market', 'shopping', 'sale', 'deals', 'bargains', 'buy', 'boutique', 'fashion',
  'food', 'restaurant', 'cafe', 'bar', 'pizza', 'catering', 'delivery', 'kitchen', 'recipes',
  'travel', 'tours', 'vacations', 'hotel', 'flights', 'cruises', 'tickets', 'guide', 'trips',
  'live', 'stream', 'tv', 'radio', 'watch', 'show', 'movie', 'film', 'games', 'play', 'fun',
  'codes', 'tools', 'systems', 'technology', 'solutions', 'host', 'hosting', 'server', 'cloud',
  'me', 'co', 'tv', 'fm', 'am', 'to', 'cc', 'ws', 'la', 'mn', 'gg', 'ag', 'sh', 'ac', 'io',
  // Brand TLDs
  'google', 'microsoft', 'apple', 'amazon', 'facebook', 'youtube'
];

// Combine all legitimate TLDs
const ALL_LEGITIMATE_TLDS = [
  ...LEGITIMATE_COUNTRY_TLDS,
  ...LEGITIMATE_GENERIC_TLDS,
  ...LEGITIMATE_SPONSORED_TLDS
];

// Whitelisted domains - NEVER flag as phishing (trusted major sites)
const TRUSTED_DOMAINS = [
  // Google ecosystem
  'google.com',
  'youtube.com',
  'googleapis.com',
  'gstatic.com',
  'googleusercontent.com',
  'gmail.com',
  'google-analytics.com',
  'googlevideo.com',
  'ytimg.com',
  
  // Microsoft ecosystem
  'microsoft.com',
  'live.com',
  'office.com',
  'outlook.com',
  'bing.com',
  'msn.com',
  'windows.com',
  'office365.com',
  'skype.com',
  
  // Search engines
  'duckduckgo.com',
  'yahoo.com',
  'yandex.com',
  'yandex.ru',
  'yandex.net',
  'baidu.com',
  'search.brave.com',
  'ecosia.org',
  'ask.com',
  'aol.com',
  
  // Major platforms
  'apple.com',
  'icloud.com',
  'amazon.com',
  'aws.amazon.com',
  'cloudfront.net',
  'github.com',
  'githubusercontent.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'reddit.com',
  'wikipedia.org',
  'mozilla.org',
  'stackoverflow.com',
  'stackexchange.com',
  'npmjs.com',
  'cloudflare.com',
  'vercel.app',
  'netlify.app',
  'heroku.com',
  'herokuapp.com',
  
  // E-commerce & Payment
  'netflix.com',
  'spotify.com',
  'adobe.com',
  'paypal.com',
  'ebay.com',
  'etsy.com',
  'shopify.com',
  'stripe.com',
  'square.com',
  'aliexpress.com',
  'alibaba.com',
  'walmart.com',
  'target.com',
  'bestbuy.com',
  
  // Education & Learning
  'udemy.com',
  'coursera.org',
  'edx.org',
  'khanacademy.org',
  'codecademy.com',
  'udacity.com',
  'pluralsight.com',
  'skillshare.com',
  'linkedin.com/learning',
  'duolingo.com',
  'memrise.com',
  'brilliant.org',
  
  // Development & Tools
  'wordpress.com',
  'wordpress.org',
  'medium.com',
  'dropbox.com',
  'zoom.us',
  'slack.com',
  'salesforce.com',
  'atlassian.com',
  'jira.com',
  'trello.com',
  'notion.so',
  'discord.com',
  'telegram.org',
  'whatsapp.com',
  
  // News & Media
  'cnn.com',
  'bbc.com',
  'bbc.co.uk',
  'nytimes.com',
  'theguardian.com',
  'reuters.com',
  'bloomberg.com',
  'forbes.com',
  'techcrunch.com',
  'wired.com',
  'theverge.com',
  'engadget.com',
  
  // Banks & Financial
  'chase.com',
  'bankofamerica.com',
  'wellsfargo.com',
  'citi.com',
  'capitalone.com',
  'discover.com',
  'amex.com',
  'americanexpress.com',
  'usbank.com',
  'pnc.com',
  
  // Cloud & Hosting
  'digitalocean.com',
  'linode.com',
  'vultr.com',
  'godaddy.com',
  'namecheap.com',
  'bluehost.com',
  'hostgator.com',
  'squarespace.com',
  'wix.com',
  'weebly.com',
  
  // Social Media
  'tiktok.com',
  'pinterest.com',
  'tumblr.com',
  'snapchat.com',
  'twitch.tv',
  'vimeo.com',
  'dailymotion.com',
  
  // Gaming
  'steam.com',
  'steampowered.com',
  'epicgames.com',
  'ea.com',
  'ubisoft.com',
  'blizzard.com',
  'roblox.com',
  'minecraft.net',
  'mojang.com',
  
  // Government & Education
  'gov',
  'edu',
  'ac.uk',
  'edu.au',
  'edu.cn',
  
  // Package Managers & Registries
  'pypi.org',
  'rubygems.org',
  'nuget.org',
  'maven.org',
  'packagist.org',
  'crates.io',
  'hub.docker.com',
  'quay.io'
];

/**
 * Check if URL is a search result page (search engines with query parameters)
 */
function isSearchURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    const hasQuery = urlObj.search.length > 0;
    
    // Common search patterns
    const searchPatterns = [
      'search', 'query', 'q=', 's=', 'results', 'find', 'busca', 'recherche'
    ];
    
    // Check if it's a search engine domain with search parameters
    const searchEngines = ['google', 'bing', 'yahoo', 'yandex', 'duckduckgo', 'baidu', 'ask', 'aol', 'ecosia', 'brave'];
    const isSearchEngine = searchEngines.some(engine => hostname.includes(engine));
    
    if (isSearchEngine && hasQuery) {
      return true;
    }
    
    // Check if path or query contains search patterns
    const fullUrl = url.toLowerCase();
    if (hasQuery && searchPatterns.some(pattern => fullUrl.includes(pattern))) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Check if TLD is legitimate (country code, generic, or sponsored)
 */
function hasLegitimaTLD(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const tld = hostname.split('.').pop() || '';
    return ALL_LEGITIMATE_TLDS.includes(tld);
  } catch {
    return false;
  }
}

/**
 * Check if domain is a trusted major site
 * ONLY checks the base domain, completely ignores URL path and query parameters
 * This allows search URLs with long query strings to be trusted
 */
function isTrustedDomain(url: string): boolean {
  try {
    // Parse URL and extract ONLY the hostname (domain)
    const hostname = new URL(url).hostname.toLowerCase();
    
    // Extract main domain (e.g., www.google.com -> google.com, search.yahoo.com -> yahoo.com)
    const parts = hostname.split('.');
    const mainDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    
    // Also check second-level domain for cases like yandex.ru
    const secondLevelDomain = parts.length >= 3 ? parts.slice(-3).join('.') : mainDomain;
    
    // Check if the BASE DOMAIN matches any trusted domain
    // This means google.com/search?q=... is trusted because the domain is google.com
    for (const trusted of TRUSTED_DOMAINS) {
      // Exact match: google.com === google.com
      if (hostname === trusted || mainDomain === trusted) {
        return true;
      }
      
      // Subdomain match: www.google.com ends with .google.com
      if (hostname.endsWith('.' + trusted) || secondLevelDomain === trusted) {
        return true;
      }
      
      // Main domain extraction: mail.google.com -> google.com matches
      if (mainDomain === trusted) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

interface MLModel {
  version: string;
  model_type: string;
  feature_names: string[];
  n_features: number;
  coefficients: number[];
  intercept: number;
  scaler: {
    mean: number[];
    scale: number[];
  };
  brands: {
    legitimate_brands: string[];
    suspicious_tlds: string[];
    sensitive_keywords: string[];
  };
  thresholds: {
    phishing_threshold: number;
    high_risk_threshold: number;
    typosquatting_threshold: number;
    missing_char_threshold: number;
  };
  metadata: {
    accuracy: number;
    description: string;
  };
}

interface PhishingPrediction {
  url: string;
  isPhishing: boolean;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  features: {
    typosquattingScore: number;
    missingCharScore: number;
    hasIP: boolean;
    hasSuspiciousTLD: boolean;
    hasSensitiveKeywords: boolean;
    urlLength: number;
    entropy: number;
  };
  blockedReason?: string;
}

export class MLPhishingDetector {
  private model: MLModel | null = null;
  private isLoaded: boolean = false;

  constructor() {
    this.loadModel();
  }

  /**
   * Load the ML model from JSON file
   */
  private async loadModel(): Promise<void> {
    try {
      const response = await fetch(chrome.runtime.getURL('ml/model_lightweight.json'));
      this.model = await response.json();
      this.isLoaded = true;
      console.log('🧠 ML Phishing Detector loaded:', this.model?.metadata.description);
    } catch (error) {
      console.error('❌ Failed to load ML model:', error);
      this.isLoaded = false;
    }
  }

  /**
   * Get user whitelist from storage
   */
  private async getUserWhitelist(): Promise<string[]> {
    try {
      const result = await chrome.storage.local.get(['userWhitelist']);
      return result.userWhitelist || [];
    } catch {
      return [];
    }
  }
  
  /**
   * Add domain to user whitelist
   */
  public async addToUserWhitelist(url: string): Promise<void> {
    try {
      const hostname = new URL(url).hostname;
      const whitelist = await this.getUserWhitelist();
      if (!whitelist.includes(hostname)) {
        whitelist.push(hostname);
        await chrome.storage.local.set({ userWhitelist: whitelist });
        console.log('✅ [ML] Added to user whitelist:', hostname);
      }
    } catch (error) {
      console.error('❌ Failed to add to whitelist:', error);
    }
  }
  
  /**
   * Remove domain from user whitelist
   */
  public async removeFromUserWhitelist(url: string): Promise<void> {
    try {
      const hostname = new URL(url).hostname;
      const whitelist = await this.getUserWhitelist();
      const filtered = whitelist.filter(domain => domain !== hostname);
      await chrome.storage.local.set({ userWhitelist: filtered });
      console.log('✅ [ML] Removed from user whitelist:', hostname);
    } catch (error) {
      console.error('❌ Failed to remove from whitelist:', error);
    }
  }
  
  /**
   * Check if model is loaded and ready
   */
  public async waitForModel(): Promise<boolean> {
    if (this.isLoaded && this.model) return true;
    
    // Wait up to 5 seconds for model to load
    for (let i = 0; i < 50; i++) {
      if (this.isLoaded && this.model) return true;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }

  /**
   * Extract features from URL (matches Python feature extraction)
   */
  private extractFeatures(url: string): number[] {
    if (!this.model) throw new Error('Model not loaded');

    try {
      const urlLower = url.toLowerCase();
      const parsed = new URL(url);
      const domain = parsed.hostname;
      const path = parsed.pathname;
      const query = parsed.search;
      
      // 1. URL length
      const urlLength = url.length;
      
      // 2. Domain length
      const domainLength = domain.length;
      
      // 3. Path length
      const pathLength = path.length;
      
      // 4-10. Character counts
      const numDots = (url.match(/\./g) || []).length;
      const numHyphens = (url.match(/-/g) || []).length;
      const numUnderscores = (url.match(/_/g) || []).length;
      const numPercent = (url.match(/%/g) || []).length;
      const numAmpersand = (url.match(/&/g) || []).length;
      const numEquals = (url.match(/=/g) || []).length;
      const numQuestion = (url.match(/\?/g) || []).length;
      
      // 11-12. Protocol and special chars
      const hasHTTPS = parsed.protocol === 'https:' ? 1 : 0;
      const hasAt = url.includes('@') ? 1 : 0;
      
      // 13. IP address detection
      const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
      const hasIP = ipPattern.test(domain) ? 1 : 0;
      
      // 14. Port number
      const hasPort = parsed.port ? 1 : 0;
      
      // 15. Suspicious TLD (only flag if NOT in legitimate list AND in suspicious list)
      const tld = domain.split('.').pop() || '';
      const isLegitimate = ALL_LEGITIMATE_TLDS.includes(tld);
      const isSuspicious = this.model.brands.suspicious_tlds.includes(tld);
      const hasSuspiciousTLD = (!isLegitimate && isSuspicious) ? 1 : 0;
      
      // 16-17. Subdomain analysis
      const subdomains = domain.split('.');
      const numSubdomains = Math.max(0, subdomains.length - 2);
      const maxSubdomainLength = subdomains.length > 2 
        ? Math.max(...subdomains.slice(0, -2).map(s => s.length))
        : 0;
      
      // 18-22. Sensitive keywords
      const hasLoginKeyword = /login|signin|log-in|sign-in/i.test(url) ? 1 : 0;
      const hasVerifyKeyword = /verify|verification|confirm/i.test(url) ? 1 : 0;
      const hasSecureKeyword = /secure|security|protection/i.test(url) ? 1 : 0;
      const hasAccountKeyword = /account|billing|payment/i.test(url) ? 1 : 0;
      const hasUpdateKeyword = /update|upgrade|renew/i.test(url) ? 1 : 0;
      
      // 23. ENHANCED Entropy (randomness) - now includes all 4 detectors
      const entropy = this.calculateEntropy(url);
      
      // Extract randomness detector scores for suspicious pattern count
      const domainForAnalysis = domain.replace(/^www\./, '').split('.')[0];
      const repeatedCharScore = this.detectRepeatedCharacters(domainForAnalysis);
      const consonantClusterScore = this.detectConsonantClusters(domainForAnalysis);
      const vowelRatioScore = this.calculateVowelRatioAnomaly(domainForAnalysis);
      const randomScore = this.calculateRandomnessScore(domainForAnalysis);
      
      // 24. Digit ratio
      const digits = (url.match(/\d/g) || []).length;
      const digitRatio = digits / url.length;
      
      // 25. Typosquatting score
      const typosquattingScore = this.calculateTyposquattingScore(domain);
      
      // 26. Missing character typo score
      const missingCharScore = this.calculateMissingCharScore(domain);
      
      // 27. Has brand name
      const domainClean = domain.replace(/^www\./, '').split('.')[0];
      const hasBrandName = this.model.brands.legitimate_brands.some(brand => 
        domainClean.includes(brand)
      ) ? 1 : 0;
      
      // 28. Urgency keywords
      const hasUrgencyKeyword = /urgent|immediate|action|suspend|limited|expire/i.test(url) ? 1 : 0;
      
      // 29. Suspicious pattern count (ENHANCED - matches Python with new detectors)
      let suspiciousPatternCount = 0;
      
      // Security red flags
      if (hasIP) suspiciousPatternCount++;
      if (hasSuspiciousTLD) suspiciousPatternCount++;
      if (hasAt) suspiciousPatternCount++;
      if (!hasHTTPS) suspiciousPatternCount++; // No HTTPS is suspicious
      
      // Typosquatting indicators
      if (typosquattingScore > 0.1) suspiciousPatternCount++;
      if (missingCharScore > 0.1) suspiciousPatternCount++;
      
      // Keyword red flags
      if (hasLoginKeyword) suspiciousPatternCount++;
      if (hasVerifyKeyword) suspiciousPatternCount++;
      if (hasSecureKeyword) suspiciousPatternCount++;
      if (hasAccountKeyword) suspiciousPatternCount++;
      if (hasUpdateKeyword) suspiciousPatternCount++;
      if (hasUrgencyKeyword) suspiciousPatternCount++;
      
      // NEW: Randomness detectors (matches Python enhancement)
      if (repeatedCharScore > 0.3) suspiciousPatternCount++;
      if (consonantClusterScore > 0.3) suspiciousPatternCount++;
      if (vowelRatioScore > 0.3) suspiciousPatternCount++;
      if (randomScore > 0.3) suspiciousPatternCount++;
      
      // 30. Combined suspicious (matches Python logic)
      const combinedSuspicious = (typosquattingScore > 0.5 || missingCharScore > 0.5) ? 1 : 0;
      
      return [
        urlLength, domainLength, pathLength,
        numDots, numHyphens, numUnderscores, numPercent, numAmpersand, numEquals, numQuestion,
        hasHTTPS, hasAt, hasIP, hasPort, hasSuspiciousTLD,
        numSubdomains, maxSubdomainLength,
        hasLoginKeyword, hasVerifyKeyword, hasSecureKeyword, hasAccountKeyword, hasUpdateKeyword,
        entropy, digitRatio,
        typosquattingScore, missingCharScore,
        hasBrandName, hasUrgencyKeyword,
        suspiciousPatternCount, combinedSuspicious
      ];
    } catch (error) {
      console.error('Error extracting features:', error);
      // Return safe default features
      return new Array(30).fill(0);
    }
  }

  /**
   * Detect repeated characters (googgle, paypaal, amazoon)
   * Matches Python: _detect_repeated_characters()
   */
  private detectRepeatedCharacters(domain: string): number {
    if (!domain || domain.length < 3) return 0;
    
    // Find sequences of 3+ identical characters
    const repeatedPattern = /(.)\1{2,}/g;
    const matches = domain.toLowerCase().match(repeatedPattern);
    
    if (!matches) return 0;
    
    // Score based on number of repetitions
    const totalRepetitions = matches.length;
    return Math.min(totalRepetitions * 0.5, 1.0);
  }

  /**
   * Detect unnatural consonant clusters (dcsdvsdvsdwvv, kjhgfdsa)
   * Matches Python: _detect_consonant_clusters()
   */
  private detectConsonantClusters(domain: string): number {
    if (!domain || domain.length < 4) return 0;
    
    const domainLower = domain.toLowerCase();
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    
    let maxConsonantRun = 0;
    let currentRun = 0;
    
    for (const char of domainLower) {
      if (/[a-z]/.test(char) && !vowels.has(char)) {
        currentRun++;
        maxConsonantRun = Math.max(maxConsonantRun, currentRun);
      } else {
        currentRun = 0;
      }
    }
    
    // 5+ consonants in a row is highly suspicious
    if (maxConsonantRun >= 5) {
      return Math.min((maxConsonantRun - 4) * 0.3, 1.0);
    } else if (maxConsonantRun >= 4) {
      return 0.4;
    }
    
    return 0;
  }

  /**
   * Check if vowel ratio is abnormal
   * Matches Python: _calculate_vowel_ratio_anomaly()
   */
  private calculateVowelRatioAnomaly(domain: string): number {
    if (!domain) return 0;
    
    const alphaChars = domain.toLowerCase().split('').filter(c => /[a-z]/.test(c));
    if (alphaChars.length < 3) return 0;
    
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
    const vowelCount = alphaChars.filter(c => vowels.has(c)).length;
    const vowelRatio = vowelCount / alphaChars.length;
    
    // Normal range: 0.25 - 0.55
    if (vowelRatio < 0.15) {  // Too few vowels
      return Math.min((0.15 - vowelRatio) * 3, 1.0);
    } else if (vowelRatio > 0.65) {  // Too many vowels
      return Math.min((vowelRatio - 0.65) * 3, 1.0);
    }
    
    return 0;
  }

  /**
   * Advanced randomness detection using character frequency analysis
   * Matches Python: _calculate_randomness_score()
   */
  private calculateRandomnessScore(domain: string): number {
    if (!domain || domain.length < 4) return 0;
    
    const alphaChars = domain.toLowerCase().split('').filter(c => /[a-z]/.test(c));
    if (alphaChars.length < 4) return 0;
    
    // Calculate character frequency distribution
    const charCounts = new Map<string, number>();
    for (const char of alphaChars) {
      charCounts.set(char, (charCounts.get(char) || 0) + 1);
    }
    
    const frequencies = Array.from(charCounts.values());
    const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
    
    // Calculate variance and standard deviation
    const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - avgFrequency, 2), 0) / frequencies.length;
    const stdDev = Math.sqrt(variance);
    
    // Low variance = uniform = random
    if (alphaChars.length >= 8) {
      if (stdDev < 1.2) {
        return Math.min((1.2 - stdDev) * 0.5, 0.8);
      }
    }
    
    return 0;
  }

  /**
   * Calculate ENHANCED entropy (randomness) of string
   * Matches Python: base_entropy * (1 + repeated + consonant + vowel + random)
   */
  private calculateEntropy(str: string): number {
    const len = str.length;
    const frequencies = new Map<string, number>();
    
    for (const char of str) {
      frequencies.set(char, (frequencies.get(char) || 0) + 1);
    }
    
    let baseEntropy = 0;
    for (const count of frequencies.values()) {
      const p = count / len;
      baseEntropy -= p * Math.log2(p);
    }
    
    // ENHANCED: Amplify entropy with randomness detectors (MATCHES PYTHON)
    const domain = str.replace(/^https?:\/\//i, '').split('/')[0];
    const repeatedCharScore = this.detectRepeatedCharacters(domain);
    const consonantClusterScore = this.detectConsonantClusters(domain);
    const vowelRatioScore = this.calculateVowelRatioAnomaly(domain);
    const randomScore = this.calculateRandomnessScore(domain);
    
    // Amplify base entropy when randomness indicators are present
    const enhancedEntropy = baseEntropy * (1 + repeatedCharScore + consonantClusterScore + vowelRatioScore + randomScore);
    
    return enhancedEntropy;
  }

  /**
   * Calculate typosquatting score (digit substitution)
   * Matches Python logic: 0->o, 1->i, 3->e, 4->a, etc.
   */
  private calculateTyposquattingScore(domain: string): number {
    if (!this.model) return 0;
    
    const domainClean = domain.replace(/^www\./, '').split('.')[0].toLowerCase();
    
    // Check if domain WITH digits is legitimate brand
    if (this.model.brands.legitimate_brands.includes(domainClean)) {
      return 0; // w3schools, mp3, etc. are legitimate
    }
    
    // Count digit substitutions
    const digitMap: { [key: string]: string } = {
      '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b', '9': 'g'
    };
    
    let score = 0;
    const digits = domainClean.match(/\d/g) || [];
    
    for (const digit of digits) {
      if (digit in digitMap) {
        score += 0.35; // Weight per digit substitution
      }
    }
    
    // Check if removing digits reveals known brand
    const withoutDigits = domainClean.replace(/\d/g, match => digitMap[match] || match);
    if (this.model.brands.legitimate_brands.includes(withoutDigits)) {
      score = Math.min(score + 0.55, 1.0); // Brand impersonation boost
    }
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate missing character typo score
   * Detects: goggle vs google, facbook vs facebook
   */
  private calculateMissingCharScore(domain: string): number {
    if (!this.model) return 0;
    
    const domainClean = domain.replace(/^www\./, '').split('.')[0].toLowerCase();
    
    // Check if it's already a legitimate brand
    if (this.model.brands.legitimate_brands.includes(domainClean)) {
      return 0;
    }
    
    // Check against known brands with Levenshtein distance
    for (const brand of this.model.brands.legitimate_brands) {
      const distance = this.levenshteinDistance(domainClean, brand);
      const maxLen = Math.max(domainClean.length, brand.length);
      
      if (distance === 1 && maxLen > 4) {
        return 0.95; // 1 char different
      } else if (distance === 2 && maxLen > 6) {
        return 0.80; // 2 chars different
      } else if (distance === 3 && maxLen > 8) {
        return 0.60; // 3 chars different
      }
    }
    
    return 0;
  }

  /**
   * Levenshtein distance algorithm
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  }

  /**
   * Standardize features using scaler parameters
   */
  private standardizeFeatures(features: number[]): number[] {
    if (!this.model) return features;
    
    return features.map((value, i) => {
      const mean = this.model!.scaler.mean[i];
      const scale = this.model!.scaler.scale[i];
      return (value - mean) / scale;
    });
  }

  /**
   * Predict using logistic regression
   */
  private predictProbability(features: number[]): number {
    if (!this.model) return 0;
    
    // Standardize features
    const scaledFeatures = this.standardizeFeatures(features);
    
    // Calculate logit: intercept + sum(coef[i] * feature[i])
    let logit = this.model.intercept;
    for (let i = 0; i < scaledFeatures.length; i++) {
      logit += this.model.coefficients[i] * scaledFeatures[i];
    }
    
    // Apply sigmoid function: 1 / (1 + e^(-logit))
    const probability = 1 / (1 + Math.exp(-logit));
    
    return probability;
  }

  /**
   * Predict if URL is phishing
   */
  public async predict(url: string): Promise<PhishingPrediction> {
    // CRITICAL: Check if URL is from a trusted domain first
    // Never flag Google, Microsoft, Amazon, etc. as phishing
    if (isTrustedDomain(url)) {
      console.log('✅ [ML] Trusted domain detected, skipping phishing check:', url);
      return {
        url,
        isPhishing: false,
        confidence: 0,
        riskLevel: 'low',
        features: {
          typosquattingScore: 0,
          missingCharScore: 0,
          hasIP: false,
          hasSuspiciousTLD: false,
          hasSensitiveKeywords: false,
          urlLength: url.length,
          entropy: 0
        }
      };
    }
    
    // Check if it's a search URL (e.g., google.com/search?q=...)
    if (isSearchURL(url)) {
      console.log('✅ [ML] Search URL detected, skipping phishing check:', url);
      return {
        url,
        isPhishing: false,
        confidence: 0,
        riskLevel: 'low',
        features: {
          typosquattingScore: 0,
          missingCharScore: 0,
          hasIP: false,
          hasSuspiciousTLD: false,
          hasSensitiveKeywords: false,
          urlLength: url.length,
          entropy: 0
        }
      };
    }
    
    // Check user whitelist (sites manually allowed by user)
    const userWhitelist = await this.getUserWhitelist();
    const hostname = new URL(url).hostname;
    if (userWhitelist.includes(hostname)) {
      console.log('✅ [ML] User whitelisted domain:', hostname);
      return {
        url,
        isPhishing: false,
        confidence: 0,
        riskLevel: 'low',
        features: {
          typosquattingScore: 0,
          missingCharScore: 0,
          hasIP: false,
          hasSuspiciousTLD: false,
          hasSensitiveKeywords: false,
          urlLength: url.length,
          entropy: 0
        }
      };
    }
    
    // Wait for model to load
    const ready = await this.waitForModel();
    if (!ready || !this.model) {
      return {
        url,
        isPhishing: false,
        confidence: 0,
        riskLevel: 'low',
        features: {
          typosquattingScore: 0,
          missingCharScore: 0,
          hasIP: false,
          hasSuspiciousTLD: false,
          hasSensitiveKeywords: false,
          urlLength: 0,
          entropy: 0
        }
      };
    }

    try {
      // Extract features
      const features = this.extractFeatures(url);
      
      // Get prediction probability
      const probability = this.predictProbability(features);
      
      // Determine if phishing
      const isPhishing = probability >= this.model.thresholds.phishing_threshold;
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (probability >= 0.9) riskLevel = 'critical';
      else if (probability >= this.model.thresholds.high_risk_threshold) riskLevel = 'high';
      else if (probability >= this.model.thresholds.phishing_threshold) riskLevel = 'medium';
      else riskLevel = 'low';
      
      // Extract key features for display
      const parsed = new URL(url);
      const domain = parsed.hostname;
      const tld = domain.split('.').pop() || '';
      
      const featureDetails = {
        typosquattingScore: this.calculateTyposquattingScore(domain),
        missingCharScore: this.calculateMissingCharScore(domain),
        hasIP: /\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(domain),
        hasSuspiciousTLD: this.model.brands.suspicious_tlds.includes(tld),
        hasSensitiveKeywords: /login|verify|secure|account|update|urgent/i.test(url),
        urlLength: url.length,
        entropy: this.calculateEntropy(url)
      };
      
      // Determine blocking reason
      let blockedReason: string | undefined;
      if (isPhishing) {
        if (featureDetails.typosquattingScore > this.model.thresholds.typosquatting_threshold) {
          blockedReason = 'Typosquatting detected (character substitution)';
        } else if (featureDetails.missingCharScore > this.model.thresholds.missing_char_threshold) {
          blockedReason = 'Domain resembles legitimate brand with typo';
        } else if (featureDetails.hasIP) {
          blockedReason = 'IP address URL detected';
        } else if (featureDetails.hasSuspiciousTLD) {
          blockedReason = 'Suspicious top-level domain';
        } else {
          blockedReason = 'Multiple suspicious patterns detected';
        }
      }
      
      return {
        url,
        isPhishing,
        confidence: probability,
        riskLevel,
        features: featureDetails,
        blockedReason
      };
      
    } catch (error) {
      console.error('Error predicting URL:', error);
      return {
        url,
        isPhishing: false,
        confidence: 0,
        riskLevel: 'low',
        features: {
          typosquattingScore: 0,
          missingCharScore: 0,
          hasIP: false,
          hasSuspiciousTLD: false,
          hasSensitiveKeywords: false,
          urlLength: 0,
          entropy: 0
        }
      };
    }
  }
}

// Singleton instance
export const mlDetector = new MLPhishingDetector();
