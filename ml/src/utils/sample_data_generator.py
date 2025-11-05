"""
Sample data generator for testing and development.
Generates synthetic phishing and legitimate URLs.
"""

import random
import pandas as pd
from pathlib import Path
from typing import List, Tuple, Optional
from src.config.config import get_config
from src.utils.logger import get_logger


logger = get_logger(__name__)


class SampleDataGenerator:
    """
    Generates synthetic URL datasets for testing.
    
    Creates realistic phishing and legitimate URLs for
    development and testing purposes.
    
    Example:
        >>> generator = SampleDataGenerator()
        >>> df = generator.generate_dataset(n_samples=1000)
        >>> df.to_csv("sample_data.csv", index=False)
    """
    
    # Legitimate domains (expanded with real top websites)
    LEGITIMATE_DOMAINS = [
        "google.com", "facebook.com", "amazon.com", "microsoft.com",
        "apple.com", "twitter.com", "linkedin.com", "github.com",
        "stackoverflow.com", "wikipedia.org", "youtube.com", "reddit.com",
        "netflix.com", "instagram.com", "paypal.com", "ebay.com",
        "spotify.com", "dropbox.com", "salesforce.com", "adobe.com",
        "github.com", "npmjs.com", "python.org", "nodejs.org",
        "yahoo.com", "bing.com", "cnn.com", "bbc.com", "nytimes.com",
        "guardian.com", "forbes.com", "bloomberg.com", "reuters.com",
        "walmart.com", "target.com", "bestbuy.com", "homedepot.com"
    ]
    
    # Phishing patterns (expanded with realistic attack keywords)
    PHISHING_KEYWORDS = [
        "verify", "account", "secure", "update", "login", "signin",
        "confirm", "suspended", "locked", "urgent", "validate",
        "security", "billing", "payment", "restore", "activate",
        "alert", "warning", "action", "required", "expired",
        "reset", "unlock", "blocked", "limited", "unusual"
    ]
    
    # Target brands commonly spoofed in phishing
    TARGET_BRANDS = [
        "paypal", "amazon", "microsoft", "apple", "google", "facebook",
        "netflix", "ebay", "linkedin", "dropbox", "instagram", "twitter",
        "bank", "chase", "wellsfargo", "bankofamerica", "citibank",
        "irs", "usps", "fedex", "ups", "dhl"
    ]
    
    # Character substitutions for homograph/typosquatting attacks
    CHAR_SUBSTITUTIONS = {
        'o': ['0', 'ο'],  # zero, greek omicron
        'a': ['@', '4', 'α'],  # at sign, four, greek alpha
        'e': ['3', 'ε'],  # three, greek epsilon
        'i': ['1', 'l', 'ι'],  # one, lowercase L, greek iota
        's': ['5', '$'],  # five, dollar
        'g': ['9', 'q'],
        'l': ['1', 'i'],
        't': ['7'],
        'b': ['8']
    }
    
    SUSPICIOUS_TLDS = [
        ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work",
        ".click", ".link", ".download", ".icu", ".cc"
    ]
    
    LEGITIMATE_PATHS = [
        "/about", "/contact", "/products", "/services", "/support",
        "/blog", "/news", "/help", "/faq", "/privacy", "/terms"
    ]
    
    def __init__(self):
        """Initialize sample data generator."""
        self.config = get_config()
        logger.info("SampleDataGenerator initialized")
    
    def generate_legitimate_url(self) -> str:
        """
        Generate a legitimate-looking URL.
        
        Returns:
            Legitimate URL string
        """
        # Choose domain
        domain = random.choice(self.LEGITIMATE_DOMAINS)
        
        # Randomly add www
        if random.random() < 0.3:
            domain = f"www.{domain}"
        
        # Use HTTPS most of the time
        protocol = "https" if random.random() < 0.9 else "http"
        
        # Add path sometimes
        if random.random() < 0.6:
            path = random.choice(self.LEGITIMATE_PATHS)
            
            # Add query params sometimes
            if random.random() < 0.3:
                param_key = random.choice(["id", "page", "category", "q"])
                param_value = random.randint(1, 100)
                path += f"?{param_key}={param_value}"
        else:
            path = ""
        
        return f"{protocol}://{domain}{path}"
    
    def _apply_typosquatting(self, word: str) -> str:
        """
        Apply character substitutions for typosquatting/homograph attacks.
        
        Args:
            word: Original word to modify
            
        Returns:
            Modified word with character substitutions
        """
        result = list(word)
        # Substitute 1-3 characters randomly
        num_subs = min(random.randint(1, 3), len(result))
        
        for _ in range(num_subs):
            idx = random.randint(0, len(result) - 1)
            char = result[idx].lower()
            
            if char in self.CHAR_SUBSTITUTIONS:
                substitutes = self.CHAR_SUBSTITUTIONS[char]
                result[idx] = random.choice(substitutes)
        
        return ''.join(result)
    
    def generate_phishing_url(self) -> str:
        """
        Generate a phishing-looking URL with realistic attack patterns.
        
        Returns:
            Phishing URL string
        """
        technique = random.choice([
            "subdomain_spoofing",
            "typosquatting",
            "suspicious_tld",
            "long_url",
            "ip_address",
            "url_shortener_mimic",
            "homograph_attack",
            "brand_impersonation"
        ])
        
        if technique == "subdomain_spoofing":
            # Example: secure-paypal.phishing-site.com
            brand = random.choice(self.TARGET_BRANDS)
            keyword = random.choice(self.PHISHING_KEYWORDS)
            fake_domain = f"{''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=6))}.com"
            path = random.choice(["/login", "/verify", "/account", "/signin", "/update"])
            return f"http://{keyword}-{brand}.{fake_domain}{path}"
        
        elif technique == "typosquatting":
            # Example: amaz0n.com, g00gle.com, fac3book.com
            legit = random.choice(self.LEGITIMATE_DOMAINS).split(".")[0]
            typo = self._apply_typosquatting(legit)
            tld = random.choice([".com", ".net", ".org"])
            path = random.choice(["/account/verify", "/login", "/secure", "/update"])
            return f"http://{typo}{tld}{path}"
        
        elif technique == "suspicious_tld":
            # Example: secure-login.tk, paypal-verify.ml
            keyword = random.choice(self.PHISHING_KEYWORDS)
            brand = random.choice(self.TARGET_BRANDS[:10])  # Popular brands
            tld = random.choice(self.SUSPICIOUS_TLDS)
            return f"http://{keyword}-{brand}{tld}/login"
        
        elif technique == "long_url":
            # Long URL with multiple subdomains and path segments
            parts = [random.choice(self.PHISHING_KEYWORDS) for _ in range(random.randint(2, 4))]
            brand = random.choice(self.TARGET_BRANDS)
            fake_tld = random.choice(self.SUSPICIOUS_TLDS)
            path_parts = random.choices(self.PHISHING_KEYWORDS, k=random.randint(2, 5))
            query = f"?id={random.randint(1000, 99999)}&token={''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=16))}"
            return f"http://{'-'.join(parts)}.{brand}{fake_tld}/{'/'.join(path_parts)}{query}"
        
        elif technique == "ip_address":
            # IP address instead of domain (common in phishing)
            ip = f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"
            path = random.choice(["/login", "/admin", "/secure", "/verify", "/account"])
            return f"http://{ip}{path}"
        
        elif technique == "url_shortener_mimic":
            # Mimic URL shortener with suspicious domain
            short_code = ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', k=7))
            fake_shortener = random.choice(["bit-ly", "tinyurl", "goo-gl", "ow-ly"])
            tld = random.choice([".tk", ".ml", ".com", ".co"])
            return f"http://{fake_shortener}{tld}/{short_code}"
        
        elif technique == "homograph_attack":
            # Use similar-looking characters (advanced typosquatting)
            brand = random.choice(["paypal", "amazon", "google", "microsoft", "apple"])
            modified = self._apply_typosquatting(brand)
            return f"http://www.{modified}.com/login"
        
        else:  # brand_impersonation
            # Subdomain that looks like the real brand
            brand = random.choice(self.TARGET_BRANDS)
            keyword = random.choice(self.PHISHING_KEYWORDS)
            fake_domain = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=8))
            path = random.choice(["/verify", "/update", "/confirm", "/security"])
            return f"http://{brand}-{keyword}.{fake_domain}.com{path}"
    
    def generate_dataset(
        self,
        n_samples: int = 1000,
        phishing_ratio: float = 0.5
    ) -> pd.DataFrame:
        """
        Generate a balanced dataset of URLs with diverse patterns.
        
        Args:
            n_samples: Total number of URLs to generate
            phishing_ratio: Proportion of phishing URLs (0.0 to 1.0)
            
        Returns:
            DataFrame with 'url' and 'label' columns
        """
        logger.info(f"Generating {n_samples} sample URLs ({phishing_ratio*100:.0f}% phishing)")
        
        n_phishing = int(n_samples * phishing_ratio)
        n_legitimate = n_samples - n_phishing
        
        # Generate URLs
        logger.info(f"  Generating {n_legitimate} legitimate URLs...")
        legitimate_urls = [self.generate_legitimate_url() for _ in range(n_legitimate)]
        
        logger.info(f"  Generating {n_phishing} phishing URLs with diverse attack patterns...")
        phishing_urls = [self.generate_phishing_url() for _ in range(n_phishing)]
        
        # Create DataFrame
        df = pd.DataFrame({
            "url": legitimate_urls + phishing_urls,
            "label": [0] * n_legitimate + [1] * n_phishing
        })
        
        # Remove any duplicates
        initial_len = len(df)
        df = df.drop_duplicates(subset=['url']).reset_index(drop=True)
        if len(df) < initial_len:
            logger.warning(f"  Removed {initial_len - len(df)} duplicate URLs")
        
        # Shuffle
        df = df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        logger.info(f"Generated {len(df)} unique URLs: {(df['label']==0).sum()} legitimate, {(df['label']==1).sum()} phishing")
        
        return df
    
    def save_sample_data(
        self,
        n_samples: int = 1000,
        output_path: Optional[Path] = None
    ) -> Path:
        """
        Generate and save sample dataset to CSV.
        
        Args:
            n_samples: Number of samples to generate
            output_path: Path to save CSV (uses config default if None)
            
        Returns:
            Path to saved CSV file
        """
        if output_path is None:
            output_path = self.config.paths.raw_data_path
        
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Generate data
        df = self.generate_dataset(n_samples)
        
        # Save to CSV
        df.to_csv(output_path, index=False)
        
        logger.info(f"Sample data saved to {output_path}")
        
        return output_path


if __name__ == "__main__":
    # Generate sample data when run directly
    generator = SampleDataGenerator()
    output_path = generator.save_sample_data(n_samples=2000)
    print(f"Sample data generated: {output_path}")
