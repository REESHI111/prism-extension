"""
Feature Extractor for ML Phishing Detector
Extracts 50+ features from URLs per ML_SPECIFICATION.md

Feature Categories:
1. Basic URL Structure (10 features)
2. Domain Analysis (15 features)
3. Path & Query Analysis (10 features)
4. Security Indicators (5 features)
5. Keyword Detection (5 features)
6. Brand Mimicry Detection (5 features)
7. Advanced Statistics (5+ features)

Total: 55 features
"""

import re
from urllib.parse import urlparse, parse_qs
import math

# Suspicious TLDs commonly used in phishing
SUSPICIOUS_TLDS = {
    '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click',
    '.link', '.racing', '.party', '.review', '.trade', '.webcam', '.win',
    '.bid', '.loan', '.download', '.stream', '.science', '.date', '.faith'
}

# Common brand names for mimicry detection
BRAND_NAMES = {
    'google', 'facebook', 'paypal', 'amazon', 'apple', 'microsoft',
    'netflix', 'instagram', 'twitter', 'linkedin', 'ebay', 'wells',
    'chase', 'bank', 'citi', 'hsbc', 'yahoo', 'adobe', 'dropbox'
}

# Phishing keywords
PHISHING_KEYWORDS = {
    'verify', 'account', 'update', 'confirm', 'login', 'signin', 'secure',
    'banking', 'suspend', 'urgent', 'alert', 'security', 'password',
    'identity', 'billing', 'payment', 'wallet', 'restore', 'locked'
}

class URLFeatureExtractor:
    """Extracts 55 features from a URL"""
    
    def extract_features(self, url):
        """
        Extract all features from a URL
        Returns: list of 55 feature values
        """
        parsed = urlparse(url.lower())
        
        features = []
        
        # CATEGORY 1: Basic URL Structure (10 features)
        features.extend(self._basic_url_features(url, parsed))
        
        # CATEGORY 2: Domain Analysis (15 features)
        features.extend(self._domain_features(parsed))
        
        # CATEGORY 3: Path & Query Analysis (10 features)
        features.extend(self._path_query_features(parsed))
        
        # CATEGORY 4: Security Indicators (5 features)
        features.extend(self._security_features(parsed, url))
        
        # CATEGORY 5: Keyword Detection (5 features)
        features.extend(self._keyword_features(url, parsed))
        
        # CATEGORY 6: Brand Mimicry Detection (5 features)
        features.extend(self._brand_mimicry_features(parsed))
        
        # CATEGORY 7: Advanced Statistics (5 features)
        features.extend(self._advanced_features(url, parsed))
        
        return features
    
    def _basic_url_features(self, url, parsed):
        """Extract 10 basic URL structure features"""
        features = []
        
        # 1. URL length
        features.append(len(url))
        
        # 2. Number of dots in full URL
        features.append(url.count('.'))
        
        # 3. Number of hyphens in full URL
        features.append(url.count('-'))
        
        # 4. Number of underscores
        features.append(url.count('_'))
        
        # 5. Number of slashes
        features.append(url.count('/'))
        
        # 6. Number of question marks
        features.append(url.count('?'))
        
        # 7. Number of ampersands
        features.append(url.count('&'))
        
        # 8. Number of equals signs
        features.append(url.count('='))
        
        # 9. Number of @ symbols (often used in phishing)
        features.append(url.count('@'))
        
        # 10. Number of digits in URL
        features.append(sum(c.isdigit() for c in url))
        
        return features
    
    def _domain_features(self, parsed):
        """Extract 15 domain analysis features"""
        features = []
        domain = parsed.netloc
        
        # 1. Domain length
        features.append(len(domain))
        
        # 2. Number of dots in domain
        features.append(domain.count('.'))
        
        # 3. Number of hyphens in domain
        features.append(domain.count('-'))
        
        # 4. Number of digits in domain
        features.append(sum(c.isdigit() for c in domain))
        
        # 5. Has suspicious TLD (binary)
        has_suspicious_tld = any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)
        features.append(1 if has_suspicious_tld else 0)
        
        # 6. Is IP address (binary)
        is_ip = bool(re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}', domain))
        features.append(1 if is_ip else 0)
        
        # 7. Number of subdomains
        parts = domain.split('.')
        num_subdomains = max(0, len(parts) - 2)  # Exclude domain and TLD
        features.append(num_subdomains)
        
        # 8. Subdomain length (0 if no subdomain)
        if num_subdomains > 0:
            subdomain = '.'.join(parts[:-2])
            features.append(len(subdomain))
        else:
            features.append(0)
        
        # 9. Domain has digit-letter substitution (e.g., g00gle, faceb00k)
        has_substitution = bool(re.search(r'\d', domain) and re.search(r'[a-z]', domain))
        features.append(1 if has_substitution else 0)
        
        # 10. Domain has consecutive consonants (>3)
        consonants = re.findall(r'[bcdfghjklmnpqrstvwxyz]{4,}', domain)
        features.append(1 if consonants else 0)
        
        # 11. Domain entropy (randomness)
        entropy = self._calculate_entropy(domain)
        features.append(entropy)
        
        # 12. Has port number (binary)
        features.append(1 if ':' in parsed.netloc and not parsed.netloc.startswith('[') else 0)
        
        # 13. Domain has multiple hyphens (>= 2)
        features.append(1 if domain.count('-') >= 2 else 0)
        
        # 14. Domain is very short (<= 5 chars before TLD)
        domain_part = parts[-2] if len(parts) >= 2 else domain
        features.append(1 if len(domain_part) <= 5 else 0)
        
        # 15. Domain is very long (>= 20 chars before TLD)
        features.append(1 if len(domain_part) >= 20 else 0)
        
        return features
    
    def _path_query_features(self, parsed):
        """Extract 10 path and query string features"""
        features = []
        path = parsed.path
        query = parsed.query
        
        # 1. Path length
        features.append(len(path))
        
        # 2. Number of slashes in path
        features.append(path.count('/'))
        
        # 3. Number of dots in path
        features.append(path.count('.'))
        
        # 4. Path depth (number of directory levels)
        path_depth = len([p for p in path.split('/') if p])
        features.append(path_depth)
        
        # 5. Query string length
        features.append(len(query))
        
        # 6. Number of parameters in query
        params = parse_qs(query)
        features.append(len(params))
        
        # 7. Has suspicious extensions (.php, .exe, .zip)
        suspicious_ext = bool(re.search(r'\.(php|exe|zip|html?)$', path.lower()))
        features.append(1 if suspicious_ext else 0)
        
        # 8. Path has 'login' or 'signin'
        has_login_path = bool(re.search(r'(login|signin)', path.lower()))
        features.append(1 if has_login_path else 0)
        
        # 9. Path has 'admin'
        has_admin_path = 'admin' in path.lower()
        features.append(1 if has_admin_path else 0)
        
        # 10. Query has sensitive params ('password', 'token', 'key')
        sensitive_params = any(p in query.lower() for p in ['password', 'token', 'key', 'session'])
        features.append(1 if sensitive_params else 0)
        
        return features
    
    def _security_features(self, parsed, url):
        """Extract 5 security indicator features"""
        features = []
        
        # 1. Uses HTTPS (binary)
        features.append(1 if parsed.scheme == 'https' else 0)
        
        # 2. HTTP with banking/payment keywords (suspicious)
        is_http_financial = (parsed.scheme == 'http' and 
                           any(word in url.lower() for word in ['bank', 'pay', 'secure', 'account']))
        features.append(1 if is_http_financial else 0)
        
        # 3. Has 'https' in domain (phishing trick)
        has_https_in_domain = 'https' in parsed.netloc
        features.append(1 if has_https_in_domain else 0)
        
        # 4. Has 'www' not as subdomain (e.g., www-paypal.com)
        domain_parts = parsed.netloc.split('.')
        has_fake_www = any('www' in part and part != 'www' for part in domain_parts)
        features.append(1 if has_fake_www else 0)
        
        # 5. Mixed HTTPS/HTTP in URL (very suspicious)
        mixed_protocol = 'https' in url.lower() and 'http://' in url.lower()
        features.append(1 if mixed_protocol else 0)
        
        return features
    
    def _keyword_features(self, url, parsed):
        """Extract 5 keyword detection features"""
        features = []
        url_lower = url.lower()
        domain_lower = parsed.netloc.lower()
        
        # 1. Number of phishing keywords in full URL
        keyword_count = sum(1 for keyword in PHISHING_KEYWORDS if keyword in url_lower)
        features.append(keyword_count)
        
        # 2. Has 'verify' keyword
        features.append(1 if 'verify' in url_lower else 0)
        
        # 3. Has 'secure' keyword
        features.append(1 if 'secure' in url_lower else 0)
        
        # 4. Has 'update' or 'confirm' keyword
        features.append(1 if ('update' in url_lower or 'confirm' in url_lower) else 0)
        
        # 5. Has multiple phishing keywords (>= 2)
        features.append(1 if keyword_count >= 2 else 0)
        
        return features
    
    def _brand_mimicry_features(self, parsed):
        """Extract 5 brand mimicry detection features"""
        features = []
        domain = parsed.netloc.lower()
        
        # 1. Contains brand name
        contains_brand = any(brand in domain for brand in BRAND_NAMES)
        features.append(1 if contains_brand else 0)
        
        # 2. Brand name with digit substitution (e.g., paypa1, g00gle)
        brand_with_digit = any(
            re.search(re.escape(brand).replace('o', '[o0]').replace('l', '[l1]').replace('i', '[i1]'), domain)
            for brand in BRAND_NAMES
        )
        features.append(1 if brand_with_digit else 0)
        
        # 3. Brand name in subdomain (e.g., paypal.scam.com)
        parts = domain.split('.')
        if len(parts) > 2:
            subdomain = '.'.join(parts[:-2])
            brand_in_subdomain = any(brand in subdomain for brand in BRAND_NAMES)
            features.append(1 if brand_in_subdomain else 0)
        else:
            features.append(0)
        
        # 4. Brand name with hyphen (e.g., pay-pal, face-book)
        brand_with_hyphen = any(brand.replace('', '-') in domain for brand in BRAND_NAMES)
        features.append(1 if brand_with_hyphen else 0)
        
        # 5. Multiple brands in domain (very suspicious)
        brand_count = sum(1 for brand in BRAND_NAMES if brand in domain)
        features.append(1 if brand_count >= 2 else 0)
        
        return features
    
    def _advanced_features(self, url, parsed):
        """Extract 5 advanced statistical features"""
        features = []
        
        # 1. URL vowel-to-consonant ratio
        vowels = sum(1 for c in url.lower() if c in 'aeiou')
        consonants = sum(1 for c in url.lower() if c.isalpha() and c not in 'aeiou')
        ratio = vowels / consonants if consonants > 0 else 0
        features.append(ratio)
        
        # 2. URL character diversity (unique chars / total chars)
        diversity = len(set(url.lower())) / len(url) if len(url) > 0 else 0
        features.append(diversity)
        
        # 3. Domain-to-URL length ratio
        ratio = len(parsed.netloc) / len(url) if len(url) > 0 else 0
        features.append(ratio)
        
        # 4. Special character ratio
        special_chars = sum(1 for c in url if not c.isalnum() and c != '.')
        special_ratio = special_chars / len(url) if len(url) > 0 else 0
        features.append(special_ratio)
        
        # 5. Digit ratio in domain
        domain = parsed.netloc
        digit_ratio = sum(c.isdigit() for c in domain) / len(domain) if len(domain) > 0 else 0
        features.append(digit_ratio)
        
        return features
    
    def _calculate_entropy(self, text):
        """Calculate Shannon entropy of text"""
        if not text:
            return 0
        
        # Count frequency of each character
        freq = {}
        for char in text:
            freq[char] = freq.get(char, 0) + 1
        
        # Calculate entropy
        entropy = 0
        text_len = len(text)
        for count in freq.values():
            probability = count / text_len
            entropy -= probability * math.log2(probability)
        
        return entropy
    
    def get_feature_names(self):
        """Returns names of all 55 features in order"""
        return [
            # Basic URL Structure (10)
            'url_length', 'num_dots', 'num_hyphens', 'num_underscores',
            'num_slashes', 'num_question_marks', 'num_ampersands', 'num_equals',
            'num_at_symbols', 'num_digits_url',
            
            # Domain Analysis (15)
            'domain_length', 'domain_dots', 'domain_hyphens', 'domain_digits',
            'has_suspicious_tld', 'is_ip_address', 'num_subdomains', 'subdomain_length',
            'has_digit_substitution', 'has_consonant_sequence', 'domain_entropy',
            'has_port', 'has_multiple_hyphens', 'domain_very_short', 'domain_very_long',
            
            # Path & Query (10)
            'path_length', 'path_slashes', 'path_dots', 'path_depth',
            'query_length', 'num_params', 'has_suspicious_extension',
            'has_login_path', 'has_admin_path', 'has_sensitive_params',
            
            # Security Indicators (5)
            'uses_https', 'http_with_financial', 'https_in_domain',
            'fake_www', 'mixed_protocols',
            
            # Keyword Detection (5)
            'phishing_keyword_count', 'has_verify', 'has_secure',
            'has_update_confirm', 'has_multiple_keywords',
            
            # Brand Mimicry (5)
            'contains_brand', 'brand_with_digit', 'brand_in_subdomain',
            'brand_with_hyphen', 'multiple_brands',
            
            # Advanced Statistics (5)
            'vowel_consonant_ratio', 'char_diversity', 'domain_url_ratio',
            'special_char_ratio', 'domain_digit_ratio'
        ]

# Standalone function for easy import
def extract_features(url):
    """
    Extract features from a URL
    Returns: list of 55 feature values
    """
    extractor = URLFeatureExtractor()
    return extractor.extract_features(url)

def get_feature_names():
    """Get list of all feature names"""
    extractor = URLFeatureExtractor()
    return extractor.get_feature_names()

if __name__ == "__main__":
    # Test feature extraction
    test_urls = [
        "http://g00gle-verify.tk/login",
        "https://google.com/search",
        "http://192.168.1.1/admin/login.php",
        "https://paypal.com/signin"
    ]
    
    extractor = URLFeatureExtractor()
    feature_names = extractor.get_feature_names()
    
    print("=" * 80)
    print("FEATURE EXTRACTOR TEST")
    print("=" * 80)
    print(f"\nTotal features: {len(feature_names)}")
    print(f"\nFeature names:")
    for i, name in enumerate(feature_names, 1):
        print(f"  {i}. {name}")
    
    print("\n" + "=" * 80)
    print("SAMPLE FEATURE EXTRACTION")
    print("=" * 80)
    
    for url in test_urls:
        features = extractor.extract_features(url)
        print(f"\nURL: {url}")
        print(f"Features extracted: {len(features)}")
        print(f"Sample features: {features[:10]}...")
