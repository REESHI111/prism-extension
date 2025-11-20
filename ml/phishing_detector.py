"""
PRISM Phishing Detector - Complete ML System
============================================
Production-ready phishing detection with 30 features including typosquatting
and missing character detection.

Usage:
    from phishing_detector import PhishingDetector
    
    # Train
    detector = PhishingDetector()
    detector.train(n_samples=5000)
    
    # Predict
    result = detector.predict("http://g00gle.com/login")
    print(f"Phishing: {result['is_phishing']} ({result['confidence']:.1%})")
"""

import re
import logging
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from urllib.parse import urlparse
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from datetime import datetime

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from imblearn.over_sampling import SMOTE

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============================================================================
# FEATURE EXTRACTION
# ============================================================================

@dataclass
class URLFeatures:
    """30 features extracted from URL for phishing detection."""
    
    # Basic features (6)
    url_length: int
    domain_length: int
    path_length: int
    num_dots: int
    num_hyphens: int
    num_underscores: int
    
    # Protocol & security (3)
    has_https: int
    has_http: int
    num_at_symbols: int
    
    # Suspicious patterns (8)
    has_ip_address: int
    has_port: int
    is_suspicious_tld: int
    num_subdomains: int
    num_digits: int
    num_sensitive_words: int
    has_suspicious_keywords: int
    domain_has_digits: int
    
    # Entropy & randomness (4)
    url_entropy: float
    domain_entropy: float
    path_entropy: float
    consonant_ratio: float
    
    # Advanced detection (9)
    typosquatting_score: float
    missing_char_typo_score: float
    num_special_chars: int
    max_subdomain_length: int
    has_brand_name: int
    url_depth: int
    has_login_keywords: int
    has_urgency_keywords: int
    subdomain_entropy: float
    
    def to_array(self) -> np.ndarray:
        """Convert to numpy array for model prediction."""
        return np.array(list(asdict(self).values()))
    
    def to_dict(self) -> Dict:
        """Convert to dictionary."""
        return asdict(self)


class FeatureExtractor:
    """Extract 30 phishing detection features from URLs."""
    
    # Suspicious TLDs
    SUSPICIOUS_TLDS = {
        'tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'work', 'click', 'link',
        'zip', 'review', 'country', 'kim', 'cricket', 'science', 'racing',
        'party', 'gdn', 'bid', 'trade', 'accountant', 'stream', 'download'
    }
    
    # Sensitive keywords
    SENSITIVE_WORDS = {
        'login', 'signin', 'account', 'update', 'secure', 'banking', 'confirm',
        'verify', 'password', 'username', 'suspend', 'restrict', 'unusual',
        'unauthorized', 'activity', 'alert', 'expire', 'locked', 'security',
        'authentication', 'credential', 'validation', 'customer', 'service',
        'support', 'billing', 'payment', 'wallet', 'transactions', 'restore',
        'recover', 'urgent', 'action', 'required'
    }
    
    # Legitimate brands (50+)
    LEGITIMATE_BRANDS = {
        'google', 'facebook', 'amazon', 'microsoft', 'apple', 'twitter',
        'linkedin', 'instagram', 'youtube', 'netflix', 'paypal', 'ebay',
        'reddit', 'github', 'stackoverflow', 'yahoo', 'gmail', 'outlook',
        'office', 'dropbox', 'spotify', 'twitch', 'tiktok', 'snapchat',
        'whatsapp', 'telegram', 'zoom', 'slack', 'discord', 'adobe',
        'salesforce', 'nvidia', 'intel', 'amd', 'samsung', 'sony', 'dell',
        'hp', 'lenovo', 'chase', 'bankofamerica', 'wellsfargo', 'citibank',
        'usbank', 'capitalone', 'americanexpress', 'walmart', 'target',
        'bestbuy', 'shopify'
    }
    
    def extract(self, url: str) -> Optional[URLFeatures]:
        """Extract all 30 features from URL."""
        try:
            if not url or not isinstance(url, str):
                return None
            
            # Add protocol if missing
            if not url.startswith(('http://', 'https://')):
                url = 'http://' + url
            
            parsed = urlparse(url)
            domain = parsed.netloc.lower()
            path = parsed.path.lower()
            
            # Basic features
            url_length = len(url)
            domain_length = len(domain)
            path_length = len(path)
            num_dots = url.count('.')
            num_hyphens = url.count('-')
            num_underscores = url.count('_')
            
            # Protocol
            has_https = 1 if parsed.scheme == 'https' else 0
            has_http = 1 if parsed.scheme == 'http' else 0
            num_at_symbols = url.count('@')
            
            # IP address detection
            has_ip = 1 if self._is_ip_address(domain) else 0
            
            # Port detection
            has_port = 1 if ':' in domain and domain.split(':')[-1].isdigit() else 0
            
            # TLD check
            tld = domain.split('.')[-1] if '.' in domain else ''
            is_suspicious_tld = 1 if tld in self.SUSPICIOUS_TLDS else 0
            
            # Subdomains
            domain_parts = domain.split('.')
            num_subdomains = max(0, len(domain_parts) - 2)
            
            # Digits
            num_digits = sum(c.isdigit() for c in url)
            domain_has_digits = 1 if any(c.isdigit() for c in domain) else 0
            
            # Sensitive words
            url_lower = url.lower()
            num_sensitive_words = sum(1 for word in self.SENSITIVE_WORDS if word in url_lower)
            has_suspicious_keywords = 1 if num_sensitive_words > 0 else 0
            
            # Entropy calculations
            url_entropy = self._calculate_entropy(url)
            domain_entropy = self._calculate_entropy(domain)
            path_entropy = self._calculate_entropy(path) if path else 0.0
            
            # Consonant ratio
            consonant_ratio = self._consonant_ratio(domain)
            
            # Typosquatting score (0→o, 1→i, etc.)
            typosquatting_score = self._typosquatting_score(domain)
            
            # Missing character typo score
            missing_char_typo_score = self._missing_char_typo_score(domain)
            
            # Special characters
            num_special_chars = sum(1 for c in url if not c.isalnum() and c not in ':/.-_?&=')
            
            # Max subdomain length
            max_subdomain_length = max([len(part) for part in domain_parts[:-2]], default=0)
            
            # Brand name detection
            has_brand_name = 1 if any(brand in domain for brand in self.LEGITIMATE_BRANDS) else 0
            
            # URL depth (number of path segments)
            url_depth = len([p for p in path.split('/') if p])
            
            # Login keywords
            login_keywords = {'login', 'signin', 'auth', 'account'}
            has_login_keywords = 1 if any(kw in url_lower for kw in login_keywords) else 0
            
            # Urgency keywords
            urgency_keywords = {'urgent', 'expire', 'suspend', 'verify', 'alert', 'action'}
            has_urgency_keywords = 1 if any(kw in url_lower for kw in urgency_keywords) else 0
            
            # Subdomain entropy
            subdomain_entropy = self._calculate_entropy('.'.join(domain_parts[:-2])) if num_subdomains > 0 else 0.0
            
            return URLFeatures(
                url_length=url_length,
                domain_length=domain_length,
                path_length=path_length,
                num_dots=num_dots,
                num_hyphens=num_hyphens,
                num_underscores=num_underscores,
                has_https=has_https,
                has_http=has_http,
                num_at_symbols=num_at_symbols,
                has_ip_address=has_ip,
                has_port=has_port,
                is_suspicious_tld=is_suspicious_tld,
                num_subdomains=num_subdomains,
                num_digits=num_digits,
                num_sensitive_words=num_sensitive_words,
                has_suspicious_keywords=has_suspicious_keywords,
                domain_has_digits=domain_has_digits,
                url_entropy=url_entropy,
                domain_entropy=domain_entropy,
                path_entropy=path_entropy,
                consonant_ratio=consonant_ratio,
                typosquatting_score=typosquatting_score,
                missing_char_typo_score=missing_char_typo_score,
                num_special_chars=num_special_chars,
                max_subdomain_length=max_subdomain_length,
                has_brand_name=has_brand_name,
                url_depth=url_depth,
                has_login_keywords=has_login_keywords,
                has_urgency_keywords=has_urgency_keywords,
                subdomain_entropy=subdomain_entropy
            )
            
        except Exception as e:
            logger.error(f"Feature extraction failed for {url}: {e}")
            return None
    
    def _is_ip_address(self, domain: str) -> bool:
        """Check if domain is an IP address."""
        ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$'
        return bool(re.match(ip_pattern, domain.split(':')[0]))
    
    def _calculate_entropy(self, text: str) -> float:
        """Calculate Shannon entropy of text."""
        if not text:
            return 0.0
        probs = [text.count(c) / len(text) for c in set(text)]
        return -sum(p * np.log2(p) for p in probs if p > 0)
    
    def _consonant_ratio(self, text: str) -> float:
        """Calculate ratio of consonants to total letters."""
        letters = [c for c in text.lower() if c.isalpha()]
        if not letters:
            return 0.0
        consonants = [c for c in letters if c not in 'aeiou']
        return len(consonants) / len(letters)
    
    def _typosquatting_score(self, domain: str) -> float:
        """Detect character substitution (0→o, 1→i, 3→e, 4→a, 5→s, 7→t, 8→b)."""
        substitutions = {'0': 'o', '1': 'il', '3': 'e', '4': 'a', '5': 's', '7': 't', '8': 'b'}
        score = 0.0
        
        for digit, letters in substitutions.items():
            if digit in domain:
                # Check if surrounded by letters
                for i, c in enumerate(domain):
                    if c == digit:
                        if (i > 0 and domain[i-1].isalpha()) or (i < len(domain)-1 and domain[i+1].isalpha()):
                            score += 0.3
        
        return min(score, 1.0)
    
    def _missing_char_typo_score(self, domain: str) -> float:
        """Detect missing/extra characters using Levenshtein distance."""
        # Clean domain
        domain_clean = re.sub(r'^www\.', '', domain)
        domain_clean = domain_clean.split('.')[0]  # Get main part before TLD
        domain_clean = re.sub(r'[^a-z]', '', domain_clean.lower())
        
        if len(domain_clean) < 3:
            return 0.0
        
        max_score = 0.0
        
        for brand in self.LEGITIMATE_BRANDS:
            if domain_clean == brand:
                continue
            
            distance = self._levenshtein_distance(domain_clean, brand)
            
            # Score based on edit distance
            if distance == 1:
                score = 0.9
            elif distance == 2:
                score = 0.7
            elif distance == 3:
                score = 0.5
            else:
                continue
            
            # Boost if similar length
            if abs(len(domain_clean) - len(brand)) <= 1:
                score = min(score + 0.1, 1.0)
            
            max_score = max(max_score, score)
        
        return max_score
    
    def _levenshtein_distance(self, s1: str, s2: str) -> int:
        """Calculate Levenshtein distance between two strings."""
        if len(s1) < len(s2):
            return self._levenshtein_distance(s2, s1)
        
        if len(s2) == 0:
            return len(s1)
        
        previous_row = range(len(s2) + 1)
        for i, c1 in enumerate(s1):
            current_row = [i + 1]
            for j, c2 in enumerate(s2):
                insertions = previous_row[j + 1] + 1
                deletions = current_row[j] + 1
                substitutions = previous_row[j] + (c1 != c2)
                current_row.append(min(insertions, deletions, substitutions))
            previous_row = current_row
        
        return previous_row[-1]


# ============================================================================
# DATA GENERATION
# ============================================================================

class DataGenerator:
    """Generate synthetic phishing training data."""
    
    LEGITIMATE_DOMAINS = [
        'google.com', 'facebook.com', 'amazon.com', 'microsoft.com', 'apple.com',
        'twitter.com', 'linkedin.com', 'github.com', 'stackoverflow.com', 'reddit.com',
        'netflix.com', 'spotify.com', 'youtube.com', 'instagram.com', 'paypal.com',
        'ebay.com', 'walmart.com', 'target.com', 'bestbuy.com', 'chase.com',
        'bankofamerica.com', 'wellsfargo.com', 'citibank.com', 'usbank.com',
        'zoom.us', 'slack.com', 'dropbox.com', 'adobe.com', 'salesforce.com',
        'office.com', 'outlook.com', 'gmail.com', 'yahoo.com', 'bing.com'
    ]
    
    PHISHING_TECHNIQUES = [
        'subdomain_spoofing',
        'suspicious_tld',
        'typosquatting',
        'missing_char_typo',
        'ip_address',
        'port_number',
        'long_subdomain',
        'brand_impersonation',
        'urgency_keywords'
    ]
    
    SUSPICIOUS_TLDS = ['tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'click', 'link', 'zip']
    SUSPICIOUS_PATHS = ['/login', '/signin', '/verify', '/confirm', '/update', '/secure', '/account']
    
    def generate(self, n_samples: int = 5000) -> Tuple[List[str], List[int]]:
        """Generate balanced dataset of URLs and labels."""
        urls = []
        labels = []
        
        n_legitimate = n_samples // 2
        n_phishing = n_samples - n_legitimate
        
        # Generate legitimate URLs
        for _ in range(n_legitimate):
            domain = np.random.choice(self.LEGITIMATE_DOMAINS)
            protocol = 'https://' if np.random.random() > 0.1 else 'http://'
            path = np.random.choice(['', '/products', '/about', '/contact', '/store', '/help'])
            urls.append(f"{protocol}www.{domain}{path}")
            labels.append(0)
        
        # Generate phishing URLs
        for _ in range(n_phishing):
            technique = np.random.choice(self.PHISHING_TECHNIQUES)
            url = self._generate_phishing_url(technique)
            urls.append(url)
            labels.append(1)
        
        return urls, labels
    
    def _generate_phishing_url(self, technique: str) -> str:
        """Generate phishing URL using specific technique."""
        base_domain = np.random.choice(self.LEGITIMATE_DOMAINS).split('.')[0]
        
        if technique == 'subdomain_spoofing':
            subdomain = np.random.choice(['secure', 'login', 'verify', 'account', 'support'])
            tld = np.random.choice(self.SUSPICIOUS_TLDS)
            return f"http://{base_domain}-{subdomain}.{tld}/login"
        
        elif technique == 'suspicious_tld':
            tld = np.random.choice(self.SUSPICIOUS_TLDS)
            path = np.random.choice(self.SUSPICIOUS_PATHS)
            return f"http://{base_domain}.{tld}{path}"
        
        elif technique == 'typosquatting':
            # 0→o, 1→i, etc.
            typo = base_domain.replace('o', '0').replace('i', '1').replace('e', '3').replace('a', '4')
            return f"http://{typo}.com/login"
        
        elif technique == 'missing_char_typo':
            # Remove, add, or swap character
            if len(base_domain) > 4:
                pos = np.random.randint(1, len(base_domain) - 1)
                if np.random.random() < 0.33:
                    typo = base_domain[:pos] + base_domain[pos+1:]  # Remove
                elif np.random.random() < 0.5:
                    typo = base_domain[:pos] + base_domain[pos] * 2 + base_domain[pos+1:]  # Duplicate
                else:
                    typo = base_domain[:pos] + base_domain[pos+1] + base_domain[pos] + base_domain[pos+2:]  # Swap
                path = np.random.choice(self.SUSPICIOUS_PATHS) if np.random.random() < 0.7 else ''
                return f"http://{typo}.com{path}"
        
        elif technique == 'ip_address':
            ip = f"{np.random.randint(1, 255)}.{np.random.randint(0, 255)}.{np.random.randint(0, 255)}.{np.random.randint(1, 255)}"
            return f"http://{ip}/login"
        
        elif technique == 'port_number':
            port = np.random.choice([8080, 8443, 3000, 5000, 8000])
            return f"http://{base_domain}.com:{port}/secure"
        
        elif technique == 'long_subdomain':
            subdomain = 'secure-' + base_domain + '-login-verify'
            tld = np.random.choice(self.SUSPICIOUS_TLDS)
            return f"http://{subdomain}.{tld}/account"
        
        elif technique == 'brand_impersonation':
            prefix = np.random.choice(['secure', 'verify', 'update', 'confirm'])
            tld = np.random.choice(self.SUSPICIOUS_TLDS)
            return f"http://{prefix}-{base_domain}.{tld}/urgent"
        
        else:  # urgency_keywords
            return f"http://{base_domain}-urgent-action.com/verify-now"


# ============================================================================
# ML MODEL
# ============================================================================

class PhishingDetector:
    """Complete phishing detection system with training and prediction."""
    
    def __init__(self):
        """Initialize detector."""
        self.feature_extractor = FeatureExtractor()
        self.scaler = StandardScaler()
        self.rf_model = None
        self.lr_model = None
        self.is_trained = False
        
    def train(self, n_samples: int = 5000, save_path: str = "model.pkl") -> Dict:
        """
        Train phishing detection model.
        
        Args:
            n_samples: Number of training samples to generate
            save_path: Path to save trained model
            
        Returns:
            Dictionary with training metrics
        """
        logger.info(f"Generating {n_samples} training samples...")
        
        # Generate data
        generator = DataGenerator()
        urls, labels = generator.generate(n_samples)
        
        # Extract features
        logger.info("Extracting features...")
        features_list = []
        valid_labels = []
        
        for url, label in zip(urls, labels):
            features = self.feature_extractor.extract(url)
            if features:
                features_list.append(features.to_array())
                valid_labels.append(label)
        
        X = np.array(features_list)
        y = np.array(valid_labels)
        
        logger.info(f"Dataset shape: {X.shape}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Handle class imbalance with SMOTE
        smote = SMOTE(random_state=42)
        X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train_balanced)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train ensemble model
        logger.info("Training ensemble model...")
        
        # Random Forest
        self.rf_model = RandomForestClassifier(
            n_estimators=150,
            max_depth=25,
            min_samples_split=10,
            min_samples_leaf=4,
            max_features='sqrt',
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        self.rf_model.fit(X_train_scaled, y_train_balanced)
        
        # Logistic Regression
        self.lr_model = LogisticRegression(
            max_iter=1000,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        self.lr_model.fit(X_train_scaled, y_train_balanced)
        
        self.is_trained = True
        
        # Evaluate
        metrics = self._evaluate(X_test_scaled, y_test)
        
        # Save model
        if save_path:
            self.save(save_path)
            logger.info(f"Model saved to {save_path}")
        
        return metrics
    
    def predict(self, url: str) -> Dict:
        """
        Predict if URL is phishing.
        
        Args:
            url: URL to analyze
            
        Returns:
            Dictionary with prediction results
        """
        if not self.is_trained:
            raise RuntimeError("Model not trained. Call train() first or load a trained model.")
        
        # Extract features
        features = self.feature_extractor.extract(url)
        if not features:
            return {
                'url': url,
                'is_phishing': None,
                'confidence': 0.0,
                'error': 'Failed to extract features'
            }
        
        # Prepare for prediction
        X = features.to_array().reshape(1, -1)
        X_scaled = self.scaler.transform(X)
        
        # Ensemble prediction (average of RF and LR probabilities)
        rf_proba = self.rf_model.predict_proba(X_scaled)[0]
        lr_proba = self.lr_model.predict_proba(X_scaled)[0]
        ensemble_proba = (rf_proba + lr_proba) / 2
        
        is_phishing = ensemble_proba[1] > 0.5
        confidence = ensemble_proba[1] if is_phishing else ensemble_proba[0]
        
        return {
            'url': url,
            'is_phishing': bool(is_phishing),
            'confidence': float(confidence),
            'features': features.to_dict(),
            'typosquatting_score': features.typosquatting_score,
            'missing_char_typo_score': features.missing_char_typo_score
        }
    
    def predict_batch(self, urls: List[str]) -> List[Dict]:
        """Predict multiple URLs efficiently."""
        return [self.predict(url) for url in urls]
    
    def _evaluate(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict:
        """Evaluate model performance."""
        # Ensemble predictions
        rf_proba = self.rf_model.predict_proba(X_test)
        lr_proba = self.lr_model.predict_proba(X_test)
        ensemble_proba = (rf_proba + lr_proba) / 2
        y_pred = (ensemble_proba[:, 1] > 0.5).astype(int)
        
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1_score': f1_score(y_test, y_pred),
            'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
        }
        
        logger.info(f"Test Accuracy: {metrics['accuracy']:.4f}")
        logger.info(f"Precision: {metrics['precision']:.4f}")
        logger.info(f"Recall: {metrics['recall']:.4f}")
        logger.info(f"F1 Score: {metrics['f1_score']:.4f}")
        
        return metrics
    
    def save(self, path: str):
        """Save trained model to disk."""
        if not self.is_trained:
            raise RuntimeError("Cannot save untrained model")
        
        model_data = {
            'rf_model': self.rf_model,
            'lr_model': self.lr_model,
            'scaler': self.scaler,
            'is_trained': self.is_trained,
            'timestamp': datetime.now().isoformat()
        }
        
        joblib.dump(model_data, path)
        logger.info(f"Model saved to {path}")
    
    @classmethod
    def load(cls, path: str) -> 'PhishingDetector':
        """Load trained model from disk."""
        detector = cls()
        
        model_data = joblib.load(path)
        detector.rf_model = model_data['rf_model']
        detector.lr_model = model_data['lr_model']
        detector.scaler = model_data['scaler']
        detector.is_trained = model_data['is_trained']
        
        logger.info(f"Model loaded from {path}")
        return detector


# ============================================================================
# MAIN INTERFACE
# ============================================================================

def main():
    """Main entry point for training and testing."""
    print("\n" + "=" * 70)
    print("PRISM Phishing Detector")
    print("=" * 70 + "\n")
    
    # Train model
    print("Training model...")
    detector = PhishingDetector()
    metrics = detector.train(n_samples=5000, save_path="model.pkl")
    
    print(f"\n[OK] Training complete!")
    print(f"   Accuracy:  {metrics['accuracy']:.4f}")
    print(f"   Precision: {metrics['precision']:.4f}")
    print(f"   Recall:    {metrics['recall']:.4f}")
    print(f"   F1 Score:  {metrics['f1_score']:.4f}")
    
    # Test predictions
    print("\n" + "-" * 70)
    print("Testing predictions...")
    print("-" * 70 + "\n")
    
    test_urls = [
        "https://www.google.com",
        "http://g00gle.com/login",
        "http://facbook.com/verify",
        "https://www.paypal.com",
        "http://paypal-verify.tk/urgent"
    ]
    
    for url in test_urls:
        result = detector.predict(url)
        status = "[PHISHING]" if result['is_phishing'] else "[SAFE]"
        print(f"{status} ({result['confidence']:.1%}) - {url}")
    
    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    main()
