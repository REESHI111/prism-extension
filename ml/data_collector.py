"""
Perfect Data Collector
Collects exactly 10,000 phishing + 10,000 legitimate URLs
"""

import requests
import pandas as pd
import validators
from pathlib import Path
from typing import List, Tuple
import time
from tqdm import tqdm
import zipfile
import io
from config import (
    PHISHING_SOURCES, LEGITIMATE_SOURCES, TRUSTED_DOMAINS,
    TARGET_PHISHING_URLS, TARGET_LEGITIMATE_URLS,
    RAW_DATA_DIR, PROCESSED_DATA_DIR,
    MIN_URL_LENGTH, MAX_URL_LENGTH
)


class DataCollector:
    """Collect and prepare phishing and legitimate URL datasets"""
    
    def __init__(self):
        self.phishing_sources = PHISHING_SOURCES
        self.legitimate_sources = LEGITIMATE_SOURCES
        self.trusted_domains = TRUSTED_DOMAINS
        self.target_phishing = TARGET_PHISHING_URLS
        self.target_legitimate = TARGET_LEGITIMATE_URLS
    
    def collect_all_data(self, force_download: bool = False) -> Tuple[List[str], List[str]]:
        """
        Collect both phishing and legitimate URLs
        
        Returns:
            Tuple of (phishing_urls, legitimate_urls)
        """
        print("\n" + "="*70)
        print("📊 DATA COLLECTION")
        print("="*70)
        
        # Check if cached data exists
        phishing_file = RAW_DATA_DIR / 'phishing_urls.txt'
        legitimate_file = RAW_DATA_DIR / 'legitimate_urls.txt'
        
        if not force_download and phishing_file.exists() and legitimate_file.exists():
            print("✅ Using cached data files")
            with open(phishing_file, 'r', encoding='utf-8') as f:
                phishing_urls = [line.strip() for line in f if line.strip()]
            with open(legitimate_file, 'r', encoding='utf-8') as f:
                legitimate_urls = [line.strip() for line in f if line.strip()]
            
            print(f"📁 Loaded {len(phishing_urls):,} phishing URLs")
            print(f"📁 Loaded {len(legitimate_urls):,} legitimate URLs")
            
            return phishing_urls, legitimate_urls
        
        # Collect new data
        print("🌐 Downloading fresh data from sources...")
        
        phishing_urls = self.collect_phishing_urls()
        legitimate_urls = self.collect_legitimate_urls()
        
        # Save to cache
        with open(phishing_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(phishing_urls))
        with open(legitimate_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(legitimate_urls))
        
        print(f"💾 Saved to {RAW_DATA_DIR}")
        
        return phishing_urls, legitimate_urls
    
    def collect_phishing_urls(self) -> List[str]:
        """Collect phishing URLs from PhishTank and OpenPhish"""
        print(f"\n🎣 Collecting {self.target_phishing:,} phishing URLs...")
        
        all_urls = []
        
        # PhishTank
        print("  📥 Downloading from PhishTank...")
        try:
            response = requests.get(self.phishing_sources[0], timeout=30)
            if response.status_code == 200:
                # Parse CSV (skip header)
                lines = response.text.split('\n')[1:]
                for line in lines:
                    if line.strip():
                        # URL is in the second column
                        parts = line.split(',')
                        if len(parts) >= 2:
                            url = parts[1].strip('"')
                            if url:
                                all_urls.append(url)
                
                print(f"    ✅ Got {len(all_urls):,} URLs from PhishTank")
        except Exception as e:
            print(f"    ⚠️  PhishTank failed: {e}")
        
        # OpenPhish
        print("  📥 Downloading from OpenPhish...")
        try:
            response = requests.get(self.phishing_sources[1], timeout=30)
            if response.status_code == 200:
                urls = response.text.strip().split('\n')
                all_urls.extend([url.strip() for url in urls if url.strip()])
                print(f"    ✅ Got {len(urls):,} URLs from OpenPhish")
        except Exception as e:
            print(f"    ⚠️  OpenPhish failed: {e}")
        
        # Clean and limit
        clean_urls = self._clean_urls(all_urls, self.target_phishing)
        
        print(f"  ✅ Final: {len(clean_urls):,} phishing URLs")
        return clean_urls
    
    def collect_legitimate_urls(self) -> List[str]:
        """Collect legitimate URLs from Alexa Top 1M + trusted domains"""
        print(f"\n✅ Collecting {self.target_legitimate:,} legitimate URLs...")
        
        all_urls = []
        
        # Add trusted domains first
        print(f"  📋 Adding {len(self.trusted_domains)} trusted domains...")
        for domain in self.trusted_domains:
            all_urls.append(f"https://{domain}")
            all_urls.append(f"https://www.{domain}")
        
        # Alexa Top 1M
        print("  📥 Downloading Alexa Top 1M...")
        try:
            response = requests.get(self.legitimate_sources[0], timeout=60)
            if response.status_code == 200:
                # Extract ZIP file
                with zipfile.ZipFile(io.BytesIO(response.content)) as z:
                    with z.open('top-1m.csv') as f:
                        content = f.read().decode('utf-8')
                        lines = content.split('\n')
                        
                        # Take top 20,000 domains
                        for line in lines[:20000]:
                            if line.strip():
                                parts = line.split(',')
                                if len(parts) >= 2:
                                    domain = parts[1].strip()
                                    all_urls.append(f"https://{domain}")
                                    all_urls.append(f"https://www.{domain}")
                
                print(f"    ✅ Got domains from Alexa")
        except Exception as e:
            print(f"    ⚠️  Alexa download failed: {e}")
            
            # Fallback: use common legitimate domains
            print("    📋 Using fallback domain list...")
            fallback_domains = [
                'google.com', 'youtube.com', 'facebook.com', 'twitter.com', 'instagram.com',
                'linkedin.com', 'github.com', 'stackoverflow.com', 'reddit.com', 'wikipedia.org',
                'amazon.com', 'ebay.com', 'walmart.com', 'apple.com', 'microsoft.com',
                'netflix.com', 'spotify.com', 'adobe.com', 'dropbox.com', 'slack.com',
                # Add more...
            ]
            
            for domain in fallback_domains:
                all_urls.append(f"https://{domain}")
                all_urls.append(f"https://www.{domain}")
                all_urls.append(f"https://{domain}/products")
                all_urls.append(f"https://{domain}/services")
                all_urls.append(f"https://{domain}/about")
        
        # Clean and limit
        clean_urls = self._clean_urls(all_urls, self.target_legitimate)
        
        print(f"  ✅ Final: {len(clean_urls):,} legitimate URLs")
        return clean_urls
    
    def _clean_urls(self, urls: List[str], target_count: int) -> List[str]:
        """Clean, validate, and deduplicate URLs"""
        clean = []
        seen = set()
        
        for url in urls:
            # Basic validation
            if not url or len(url) < MIN_URL_LENGTH or len(url) > MAX_URL_LENGTH:
                continue
            
            # Validate URL format
            if not validators.url(url):
                continue
            
            # Remove duplicates
            if url in seen:
                continue
            
            seen.add(url)
            clean.append(url)
            
            # Stop when we have enough
            if len(clean) >= target_count:
                break
        
        return clean
    
    def create_dataset(self, phishing_urls: List[str], legitimate_urls: List[str]) -> pd.DataFrame:
        """
        Create labeled dataset
        
        Returns:
            DataFrame with columns: url, label
        """
        print("\n📊 Creating labeled dataset...")
        
        # Create DataFrame
        phishing_df = pd.DataFrame({
            'url': phishing_urls,
            'label': 1  # Phishing = 1
        })
        
        legitimate_df = pd.DataFrame({
            'url': legitimate_urls,
            'label': 0  # Legitimate = 0
        })
        
        # Combine
        df = pd.concat([phishing_df, legitimate_df], ignore_index=True)
        
        # Shuffle
        df = df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        print(f"  ✅ Total samples: {len(df):,}")
        print(f"  🎣 Phishing: {len(phishing_df):,} ({len(phishing_df)/len(df)*100:.1f}%)")
        print(f"  ✅ Legitimate: {len(legitimate_df):,} ({len(legitimate_df)/len(df)*100:.1f}%)")
        
        # Save to processed
        output_file = PROCESSED_DATA_DIR / 'dataset.csv'
        df.to_csv(output_file, index=False)
        print(f"  💾 Saved to {output_file}")
        
        return df


if __name__ == '__main__':
    collector = DataCollector()
    
    # Collect data
    phishing_urls, legitimate_urls = collector.collect_all_data(force_download=False)
    
    # Create dataset
    dataset = collector.create_dataset(phishing_urls, legitimate_urls)
    
    print(f"\n✅ Dataset ready: {len(dataset):,} samples")
