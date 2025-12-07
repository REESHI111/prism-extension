"""
Perfect Feature Extractor
Implements all 30 features exactly as documented in ML_MODEL_DOCUMENTATION.md
"""

import re
import math
import tldextract
import Levenshtein
from urllib.parse import urlparse
from typing import Dict, List
from collections import Counter
from config import (
    FEATURE_NAMES, KNOWN_BRANDS, SUSPICIOUS_TLDS, LEGITIMATE_TLDS,
    PHISHING_KEYWORDS, DIGIT_SUBSTITUTIONS
)


class FeatureExtractor:
    """Extract all 30 features from URLs as per documentation"""
    
    def __init__(self):
        self.feature_names = FEATURE_NAMES
        self.known_brands = KNOWN_BRANDS
        self.suspicious_tlds = SUSPICIOUS_TLDS
        self.legitimate_tlds = LEGITIMATE_TLDS
        self.phishing_keywords = PHISHING_KEYWORDS
        self.digit_substitutions = DIGIT_SUBSTITUTIONS
    
    def extract_features(self, url: str) -> Dict[str, float]:
        """
        Extract all 30 features from a URL
        
        Returns:
            Dictionary with feature names and values
        """
        try:
            parsed = urlparse(url)
            extracted = tldextract.extract(url)
            
            domain = extracted.domain.lower()
            subdomain = extracted.subdomain.lower()
            tld = extracted.suffix.lower()
            full_domain = f"{domain}.{tld}" if tld else domain
            
            features = {}
            
            # ================================================================
            # URL STRUCTURE FEATURES (10)
            # ================================================================
            
            features['urlLength'] = len(url)
            features['domainLength'] = len(full_domain)
            features['pathLength'] = len(parsed.path)
            features['numDots'] = url.count('.')
            features['numHyphens'] = url.count('-')
            features['numUnderscores'] = url.count('_')
            features['numPercent'] = url.count('%')
            features['numAmpersand'] = url.count('&')
            features['numEquals'] = url.count('=')
            features['numQuestion'] = url.count('?')
            
            # ================================================================
            # SECURITY FEATURES (5)
            # ================================================================
            
            features['hasHTTPS'] = 1 if parsed.scheme == 'https' else 0
            features['hasAt'] = 1 if '@' in url else 0
            features['hasIP'] = 1 if self._has_ip_address(parsed.netloc) else 0
            features['hasPort'] = 1 if parsed.port is not None else 0
            features['hasSuspiciousTLD'] = self._has_suspicious_tld(tld)
            
            # ================================================================
            # DOMAIN FEATURES (7)
            # ================================================================
            
            subdomains = subdomain.split('.') if subdomain else []
            features['numSubdomains'] = len(subdomains)
            features['maxSubdomainLength'] = max([len(s) for s in subdomains]) if subdomains else 0
            
            features['typosquattingScore'] = self._calculate_typosquatting_score(domain)
            features['missingCharScore'] = self._calculate_missing_char_score(domain)
            features['hasBrandName'] = 1 if self._contains_brand_name(domain) else 0
            features['digitRatio'] = self._calculate_digit_ratio(domain)
            
            # ENHANCED ENTROPY: Combine base entropy with advanced randomness detection
            base_entropy = self._calculate_entropy(domain)
            repeated_char_score = self._detect_repeated_characters(domain)
            consonant_cluster_score = self._detect_consonant_clusters(domain)
            vowel_ratio_score = self._calculate_vowel_ratio_anomaly(domain)
            random_score = self._calculate_randomness_score(domain)
            
            # Amplify entropy when randomness indicators are present
            features['entropy'] = base_entropy * (1 + repeated_char_score + consonant_cluster_score + vowel_ratio_score + random_score)
            
            # ================================================================
            # KEYWORD FEATURES (8)
            # ================================================================
            
            url_lower = url.lower()
            features['hasLoginKeyword'] = self._has_keywords(url_lower, 'login')
            features['hasVerifyKeyword'] = self._has_keywords(url_lower, 'verify')
            features['hasSecureKeyword'] = self._has_keywords(url_lower, 'secure')
            features['hasAccountKeyword'] = self._has_keywords(url_lower, 'account')
            features['hasUpdateKeyword'] = self._has_keywords(url_lower, 'update')
            features['hasUrgencyKeyword'] = self._has_keywords(url_lower, 'urgency')
            
            # Count total suspicious patterns (ENHANCED with new detectors)
            features['suspiciousPatternCount'] = self._count_suspicious_patterns(
                features, repeated_char_score, consonant_cluster_score, 
                vowel_ratio_score, random_score
            )
            
            # Combined typo + brand similarity score
            features['combinedSuspicious'] = features['typosquattingScore'] + features['missingCharScore']
            
            return features
            
        except Exception as e:
            print(f"⚠️  Error extracting features from {url}: {e}")
            return self._get_default_features()
    
    def _has_ip_address(self, netloc: str) -> bool:
        """Check if URL contains IP address instead of domain"""
        # IPv4 pattern
        ipv4_pattern = r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}'
        # IPv6 pattern (simplified)
        ipv6_pattern = r'^\[?[0-9a-fA-F:]+\]?'
        
        return bool(re.match(ipv4_pattern, netloc) or re.match(ipv6_pattern, netloc))
    
    def _has_suspicious_tld(self, tld: str) -> int:
        """
        Check if TLD is suspicious
        Returns 1 if suspicious, 0 if legitimate or neutral
        """
        if not tld:
            return 0
        
        # If it's a known legitimate TLD, return 0
        if tld in self.legitimate_tlds:
            return 0
        
        # If it's a known suspicious TLD, return 1
        if tld in self.suspicious_tlds:
            return 1
        
        # Unknown TLDs are neutral (0)
        return 0
    
    def _calculate_typosquatting_score(self, domain: str) -> float:
        """
        Calculate typosquatting score based on digit substitutions
        
        Examples:
            g00gle → score = 2/6 = 0.33 (two 0s instead of o)
            paypa1 → score = 1/6 = 0.16 (one 1 instead of l)
        """
        if not domain:
            return 0.0
        
        substitution_count = 0
        
        # Check each digit in domain
        for char in domain:
            if char in self.digit_substitutions:
                substitution_count += 1
        
        # Normalize by domain length
        return substitution_count / len(domain) if len(domain) > 0 else 0.0
    
    def _calculate_missing_char_score(self, domain: str) -> float:
        """
        Calculate score for missing/extra characters (typos)
        Uses Levenshtein distance to known brands
        
        Examples:
            gogle → distance to google = 1 → score = 0.2
            googgle → distance to google = 1 → score = 0.333 (amplified)
            facbook → distance to facebook = 1 → score = 0.125
        """
        if not domain:
            return 0.0
        
        # Find closest brand
        min_distance = float('inf')
        closest_brand = None
        
        for brand in self.known_brands:
            distance = Levenshtein.distance(domain, brand)
            
            # Only consider if relatively close (within 3 edits) AND different
            if distance < min_distance and distance <= 3 and distance > 0:
                min_distance = distance
                closest_brand = brand
        
        # If no close brand found, return 0
        if closest_brand is None:
            return 0.0
        
        # Calculate base score
        base_score = min_distance / len(closest_brand)
        
        # ENHANCED: Amplify score for 1-2 char differences (likely intentional typosquatting)
        if min_distance == 1:
            base_score *= 2.0  # googgle → 0.167 * 2 = 0.333
        elif min_distance == 2:
            base_score *= 1.5
        
        # Normalize
        return min(base_score, 1.0)
    
    def _contains_brand_name(self, domain: str) -> bool:
        """Check if domain contains a known brand name"""
        for brand in self.known_brands:
            if brand in domain:
                return True
        return False
    
    def _calculate_digit_ratio(self, domain: str) -> float:
        """Calculate percentage of digits in domain"""
        if not domain:
            return 0.0
        
        digit_count = sum(1 for char in domain if char.isdigit())
        return digit_count / len(domain)
    
    def _calculate_entropy(self, domain: str) -> float:
        """
        Calculate Shannon entropy (randomness measure)
        
        Higher entropy = more random = more suspicious
        
        Examples:
            google → low entropy (repeated letters)
            kjh234lkjsdf → high entropy (random)
        """
        if not domain:
            return 0.0
        
        # Count character frequencies
        char_counts = {}
        for char in domain:
            char_counts[char] = char_counts.get(char, 0) + 1
        
        # Calculate entropy
        entropy = 0.0
        domain_len = len(domain)
        
        for count in char_counts.values():
            probability = count / domain_len
            if probability > 0:
                entropy -= probability * math.log2(probability)
        
        return entropy
    
    def _detect_repeated_characters(self, domain: str) -> float:
        """
        Detect suspicious repeated characters (googgle, paypaal, amazoon)
        Legitimate sites rarely have 3+ repeated consecutive chars
        """
        if not domain or len(domain) < 3:
            return 0.0
        
        # Find sequences of 3+ identical characters
        repeated_pattern = r'(.)\1{2,}'
        matches = re.findall(repeated_pattern, domain.lower())
        
        if not matches:
            return 0.0
        
        # Score based on number of repetitions
        total_repetitions = len(matches)
        
        # Normalize: 1+ repetitions = high score
        return min(total_repetitions * 0.5, 1.0)
    
    def _detect_consonant_clusters(self, domain: str) -> float:
        """
        Detect unnatural consonant clusters (dcsdvsdvsdwvv, kjhgfdsa)
        Real words have vowels; random strings have long consonant runs
        """
        if not domain or len(domain) < 4:
            return 0.0
        
        domain_lower = domain.lower()
        vowels = set('aeiou')
        
        # Find consecutive consonants
        max_consonant_run = 0
        current_run = 0
        
        for char in domain_lower:
            if char.isalpha() and char not in vowels:
                current_run += 1
                max_consonant_run = max(max_consonant_run, current_run)
            else:
                current_run = 0
        
        # 5+ consonants in a row is highly suspicious
        # Examples: "dcsdvsdv" has runs of 4-5
        if max_consonant_run >= 5:
            return min((max_consonant_run - 4) * 0.3, 1.0)
        elif max_consonant_run >= 4:
            return 0.4
        
        return 0.0
    
    def _calculate_vowel_ratio_anomaly(self, domain: str) -> float:
        """
        Check if vowel ratio is abnormal
        English words: ~40% vowels
        Random strings: often <20% or >60%
        """
        if not domain:
            return 0.0
        
        alpha_chars = [c for c in domain.lower() if c.isalpha()]
        if len(alpha_chars) < 3:
            return 0.0
        
        vowels = set('aeiou')
        vowel_count = sum(1 for c in alpha_chars if c in vowels)
        vowel_ratio = vowel_count / len(alpha_chars)
        
        # Normal range: 0.25 - 0.55
        if vowel_ratio < 0.15:  # Too few vowels (dcsdvsdv = 0.125)
            return min((0.15 - vowel_ratio) * 3, 1.0)
        elif vowel_ratio > 0.65:  # Too many vowels
            return min((vowel_ratio - 0.65) * 3, 1.0)
        
        return 0.0
    
    def _calculate_randomness_score(self, domain: str) -> float:
        """
        Advanced randomness detection using character frequency analysis
        Real words have patterns; random strings are more uniform
        """
        if not domain or len(domain) < 4:
            return 0.0
        
        alpha_chars = [c for c in domain.lower() if c.isalpha()]
        if len(alpha_chars) < 4:
            return 0.0
        
        # Calculate character frequency distribution
        char_counts = Counter(alpha_chars)
        frequencies = list(char_counts.values())
        
        # Random strings have more uniform distribution
        # Real words have some chars repeated, others single
        avg_frequency = sum(frequencies) / len(frequencies)
        variance = sum((f - avg_frequency) ** 2 for f in frequencies) / len(frequencies)
        std_dev = math.sqrt(variance)
        
        # Low variance = uniform = random
        # High variance = some chars dominate = real word
        if len(alpha_chars) >= 8:
            # For longer domains, low std dev (<1.2) suggests randomness
            if std_dev < 1.2:
                return min((1.2 - std_dev) * 0.5, 0.8)
        
        return 0.0
    
    def _has_keywords(self, url: str, category: str) -> int:
        """Check if URL contains keywords from a category"""
        keywords = self.phishing_keywords.get(category, [])
        
        for keyword in keywords:
            if keyword in url:
                return 1
        
        return 0
    
    def _count_suspicious_patterns(self, features: Dict[str, float], 
                                   repeated_char_score: float = 0.0,
                                   consonant_cluster_score: float = 0.0,
                                   vowel_ratio_score: float = 0.0,
                                   random_score: float = 0.0) -> int:
        """Count total number of suspicious patterns detected (ENHANCED)"""
        suspicious_count = 0
        
        # Security red flags
        if features['hasAt'] == 1:
            suspicious_count += 1
        if features['hasIP'] == 1:
            suspicious_count += 1
        if features['hasSuspiciousTLD'] == 1:
            suspicious_count += 1
        if features['hasHTTPS'] == 0:  # No HTTPS
            suspicious_count += 1
        
        # Typosquatting indicators
        if features['typosquattingScore'] > 0.1:
            suspicious_count += 1
        if features['missingCharScore'] > 0.1:
            suspicious_count += 1
        
        # Keyword red flags
        if features['hasLoginKeyword'] == 1:
            suspicious_count += 1
        if features['hasVerifyKeyword'] == 1:
            suspicious_count += 1
        if features['hasUrgencyKeyword'] == 1:
            suspicious_count += 1
        
        # Structural anomalies
        if features['numHyphens'] >= 3:
            suspicious_count += 1
        if features['digitRatio'] > 0.3:
            suspicious_count += 1
        if features['entropy'] > 3.5:
            suspicious_count += 1
        
        # ENHANCED: New randomness detectors
        if repeated_char_score > 0.3:  # googgle, paypaal
            suspicious_count += 1
        if consonant_cluster_score > 0.3:  # dcsdvsdv, kjhgfds
            suspicious_count += 1
        if vowel_ratio_score > 0.3:  # abnormal vowel distribution
            suspicious_count += 1
        if random_score > 0.3:  # uniform character frequency
            suspicious_count += 1
        
        return suspicious_count
    
    def _get_default_features(self) -> Dict[str, float]:
        """Return default features (all zeros) for error cases"""
        return {name: 0.0 for name in self.feature_names}
    
    def extract_features_batch(self, urls: List[str]) -> List[Dict[str, float]]:
        """Extract features from multiple URLs"""
        return [self.extract_features(url) for url in urls]


if __name__ == '__main__':
    # Test feature extraction
    extractor = FeatureExtractor()
    
    test_urls = [
        'http://g00gle-verify.tk/login',  # Obvious phishing
        'https://www.amazon.com/products',  # Legitimate
        'https://secure-login-bank.xyz/account',  # Borderline
    ]
    
    print("\n🧪 Testing Feature Extraction\n")
    
    for url in test_urls:
        print(f"URL: {url}")
        features = extractor.extract_features(url)
        
        # Show key features
        print(f"  typosquattingScore: {features['typosquattingScore']:.3f}")
        print(f"  hasSuspiciousTLD: {features['hasSuspiciousTLD']}")
        print(f"  hasLoginKeyword: {features['hasLoginKeyword']}")
        print(f"  hasVerifyKeyword: {features['hasVerifyKeyword']}")
        print(f"  hasHTTPS: {features['hasHTTPS']}")
        print(f"  suspiciousPatternCount: {features['suspiciousPatternCount']}")
        print()
