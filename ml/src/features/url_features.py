"""
URL Feature Extraction for Phishing Detection.
Extracts 28 comprehensive features from URLs for ML model training.
"""

import re
import math
from dataclasses import dataclass, asdict
from typing import Optional, Dict, Any
from urllib.parse import urlparse, parse_qs
import tldextract
import validators
from src.utils.logger import get_logger


logger = get_logger(__name__)


@dataclass
class URLFeatures:
    """
    Data class containing all extracted URL features.
    
    Features are organized into categories:
    - Basic URL structure (10 features)
    - Domain analysis (6 features)
    - Content patterns (6 features)
    - Statistical features (6 features)
    """
    
    # Basic URL structure
    url_length: int
    domain_length: int
    path_length: int
    has_https: int  # Binary: 1 if HTTPS, 0 otherwise
    has_ip_address: int  # Binary: 1 if domain is IP, 0 otherwise
    num_dots: int
    num_hyphens: int
    num_underscores: int
    num_slashes: int
    num_digits: int
    
    # Domain analysis
    num_subdomains: int
    tld_length: int
    is_suspicious_tld: int  # Binary: 1 if .tk, .ml, .ga, etc.
    has_www: int  # Binary
    domain_has_digits: int  # Binary
    subdomain_count: int
    
    # Content patterns
    num_query_params: int
    query_length: int
    has_at_symbol: int  # Binary: @ in URL (phishing indicator)
    has_double_slash_redirect: int  # Binary: // after domain
    num_sensitive_words: int  # Count of words like 'secure', 'account', 'update'
    num_external_links: int  # For future enhancement
    
    # Statistical features
    url_entropy: float  # Shannon entropy
    domain_entropy: float
    path_entropy: float
    special_char_ratio: float
    digit_ratio: float
    vowel_ratio: float
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert features to dictionary."""
        return asdict(self)
    
    def to_list(self) -> list:
        """Convert features to list (for model input)."""
        return list(asdict(self).values())
    
    @classmethod
    def feature_names(cls) -> list:
        """Get list of feature names."""
        return list(cls.__annotations__.keys())


class URLFeatureExtractor:
    """
    Extracts comprehensive features from URLs for phishing detection.
    
    This class implements feature engineering techniques specifically
    designed to identify phishing URLs based on structural and
    statistical properties.
    
    Example:
        >>> extractor = URLFeatureExtractor()
        >>> features = extractor.extract("https://example.com/login")
        >>> print(features.url_length)
        >>> feature_vector = features.to_list()
    """
    
    # Suspicious TLDs commonly used in phishing
    SUSPICIOUS_TLDS = {
        'tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'work',
        'click', 'link', 'download', 'icu', 'cc'
    }
    
    # Sensitive words often used in phishing URLs
    SENSITIVE_WORDS = {
        'account', 'secure', 'update', 'verify', 'login', 'signin',
        'confirm', 'password', 'banking', 'paypal', 'ebay', 'amazon',
        'suspended', 'locked', 'urgent', 'verify', 'validate'
    }
    
    def __init__(self):
        """Initialize feature extractor."""
        logger.debug("Initializing URLFeatureExtractor")
        self.feature_count = 28
    
    def extract(self, url: str) -> Optional[URLFeatures]:
        """
        Extract all features from a URL.
        
        Args:
            url: URL string to analyze
            
        Returns:
            URLFeatures object containing all extracted features,
            or None if URL is invalid
            
        Example:
            >>> extractor = URLFeatureExtractor()
            >>> features = extractor.extract("https://example.com")
        """
        if not self._validate_url(url):
            logger.warning(f"Invalid URL: {url}")
            return None
        
        try:
            # Parse URL components
            parsed = urlparse(url)
            extracted = tldextract.extract(url)
            
            # Extract all feature categories
            basic_features = self._extract_basic_features(url, parsed)
            domain_features = self._extract_domain_features(url, extracted, parsed)
            content_features = self._extract_content_features(url, parsed)
            statistical_features = self._extract_statistical_features(url, parsed)
            
            # Combine all features
            all_features = {
                **basic_features,
                **domain_features,
                **content_features,
                **statistical_features
            }
            
            return URLFeatures(**all_features)
            
        except Exception as e:
            logger.error(f"Error extracting features from {url}: {str(e)}")
            return None
    
    def extract_batch(self, urls: list) -> list:
        """
        Extract features from multiple URLs.
        
        Args:
            urls: List of URL strings
            
        Returns:
            List of URLFeatures objects (None for invalid URLs)
        """
        logger.info(f"Extracting features from {len(urls)} URLs")
        features_list = []
        
        for i, url in enumerate(urls):
            if (i + 1) % 1000 == 0:
                logger.info(f"Processed {i + 1}/{len(urls)} URLs")
            
            features = self.extract(url)
            features_list.append(features)
        
        logger.info(f"Feature extraction complete. {sum(1 for f in features_list if f)} valid URLs")
        return features_list
    
    def _validate_url(self, url: str) -> bool:
        """
        Validate URL format.
        
        Args:
            url: URL string to validate
            
        Returns:
            True if URL is valid, False otherwise
        """
        if not url or not isinstance(url, str):
            return False
        
        # Basic validation
        if len(url) < 4 or len(url) > 2000:
            return False
        
        # Use validators library for comprehensive check
        return validators.url(url) or validators.domain(url)
    
    def _extract_basic_features(self, url: str, parsed) -> dict:
        """Extract basic URL structure features."""
        path = parsed.path or ""
        domain = parsed.netloc or ""
        
        return {
            "url_length": len(url),
            "domain_length": len(domain),
            "path_length": len(path),
            "has_https": 1 if parsed.scheme == "https" else 0,
            "has_ip_address": 1 if self._is_ip_address(domain) else 0,
            "num_dots": url.count('.'),
            "num_hyphens": url.count('-'),
            "num_underscores": url.count('_'),
            "num_slashes": url.count('/'),
            "num_digits": sum(c.isdigit() for c in url),
        }
    
    def _extract_domain_features(self, url: str, extracted, parsed) -> dict:
        """Extract domain-specific features."""
        domain = extracted.domain
        subdomain = extracted.subdomain or ""
        tld = extracted.suffix or ""
        
        # Count subdomains
        subdomain_parts = [p for p in subdomain.split('.') if p]
        
        return {
            "num_subdomains": len(subdomain_parts),
            "tld_length": len(tld),
            "is_suspicious_tld": 1 if tld.lower() in self.SUSPICIOUS_TLDS else 0,
            "has_www": 1 if subdomain.startswith('www') else 0,
            "domain_has_digits": 1 if any(c.isdigit() for c in domain) else 0,
            "subdomain_count": len(subdomain_parts),
        }
    
    def _extract_content_features(self, url: str, parsed) -> dict:
        """Extract content and pattern features."""
        query = parsed.query or ""
        path = parsed.path or ""
        
        # Parse query parameters
        query_params = parse_qs(query)
        
        # Check for double slash redirect (e.g., http://example.com//redirect)
        has_double_slash = 1 if '//' in path else 0
        
        # Count sensitive words in URL
        url_lower = url.lower()
        sensitive_count = sum(1 for word in self.SENSITIVE_WORDS if word in url_lower)
        
        return {
            "num_query_params": len(query_params),
            "query_length": len(query),
            "has_at_symbol": 1 if '@' in url else 0,
            "has_double_slash_redirect": has_double_slash,
            "num_sensitive_words": sensitive_count,
            "num_external_links": 0,  # Placeholder for future enhancement
        }
    
    def _extract_statistical_features(self, url: str, parsed) -> dict:
        """Extract statistical and entropy features."""
        domain = parsed.netloc or ""
        path = parsed.path or ""
        
        # Calculate Shannon entropy
        url_entropy = self._calculate_entropy(url)
        domain_entropy = self._calculate_entropy(domain)
        path_entropy = self._calculate_entropy(path) if path else 0.0
        
        # Calculate ratios
        special_chars = sum(1 for c in url if not c.isalnum())
        special_char_ratio = special_chars / len(url) if url else 0.0
        
        digits = sum(1 for c in url if c.isdigit())
        digit_ratio = digits / len(url) if url else 0.0
        
        vowels = sum(1 for c in url.lower() if c in 'aeiou')
        vowel_ratio = vowels / len(url) if url else 0.0
        
        return {
            "url_entropy": round(url_entropy, 4),
            "domain_entropy": round(domain_entropy, 4),
            "path_entropy": round(path_entropy, 4),
            "special_char_ratio": round(special_char_ratio, 4),
            "digit_ratio": round(digit_ratio, 4),
            "vowel_ratio": round(vowel_ratio, 4),
        }
    
    def _calculate_entropy(self, text: str) -> float:
        """
        Calculate Shannon entropy of a string.
        Higher entropy suggests more randomness (potential phishing).
        
        Args:
            text: String to analyze
            
        Returns:
            Shannon entropy value
        """
        if not text:
            return 0.0
        
        # Count character frequencies
        char_freq = {}
        for char in text:
            char_freq[char] = char_freq.get(char, 0) + 1
        
        # Calculate entropy
        entropy = 0.0
        text_len = len(text)
        
        for count in char_freq.values():
            probability = count / text_len
            if probability > 0:
                entropy -= probability * math.log2(probability)
        
        return entropy
    
    def _is_ip_address(self, domain: str) -> bool:
        """
        Check if domain is an IP address.
        
        Args:
            domain: Domain string to check
            
        Returns:
            True if domain is an IP address
        """
        # Simple IPv4 pattern
        ipv4_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        if re.match(ipv4_pattern, domain):
            return True
        
        # Check for IPv6 or hex IP
        if '[' in domain or ':' in domain:
            return True
        
        return False
    
    def get_feature_importance_description(self) -> Dict[str, str]:
        """
        Get human-readable descriptions of all features.
        
        Returns:
            Dictionary mapping feature names to descriptions
        """
        return {
            "url_length": "Total character count in URL",
            "domain_length": "Length of domain name",
            "path_length": "Length of URL path",
            "has_https": "Whether URL uses HTTPS protocol",
            "has_ip_address": "Whether domain is an IP address",
            "num_dots": "Count of dots in URL",
            "num_hyphens": "Count of hyphens in URL",
            "num_underscores": "Count of underscores in URL",
            "num_slashes": "Count of slashes in URL",
            "num_digits": "Total digit count in URL",
            "num_subdomains": "Number of subdomains",
            "tld_length": "Length of top-level domain",
            "is_suspicious_tld": "Whether TLD is commonly used in phishing",
            "has_www": "Whether URL starts with www",
            "domain_has_digits": "Whether domain contains digits",
            "subdomain_count": "Count of subdomain parts",
            "num_query_params": "Number of query parameters",
            "query_length": "Total length of query string",
            "has_at_symbol": "Presence of @ symbol (phishing indicator)",
            "has_double_slash_redirect": "Double slash in path (redirect indicator)",
            "num_sensitive_words": "Count of sensitive keywords",
            "num_external_links": "Count of external links (future)",
            "url_entropy": "Shannon entropy of URL (randomness measure)",
            "domain_entropy": "Shannon entropy of domain",
            "path_entropy": "Shannon entropy of path",
            "special_char_ratio": "Ratio of special characters to total length",
            "digit_ratio": "Ratio of digits to total length",
            "vowel_ratio": "Ratio of vowels to total length",
        }
