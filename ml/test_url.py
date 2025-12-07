"""
Perfect URL Tester - Test Custom URLs Against ML Model
Interactive tool to test phishing detection on your own URLs
"""

import sys
from pathlib import Path
from colorama import init, Fore, Style
import joblib

# Initialize colorama for Windows
init()

# Import our modules
from feature_extractor import FeatureExtractor
from config import FEATURE_NAMES, MODEL_BACKUP_PATH

# Color helpers
def green(text): return f"{Fore.GREEN}{text}{Style.RESET_ALL}"
def red(text): return f"{Fore.RED}{text}{Style.RESET_ALL}"
def yellow(text): return f"{Fore.YELLOW}{text}{Style.RESET_ALL}"
def blue(text): return f"{Fore.BLUE}{text}{Style.RESET_ALL}"
def cyan(text): return f"{Fore.CYAN}{text}{Style.RESET_ALL}"
def magenta(text): return f"{Fore.MAGENTA}{text}{Style.RESET_ALL}"


class URLTester:
    """Test custom URLs against trained ML model"""
    
    def __init__(self):
        self.extractor = FeatureExtractor()
        self.model = None
        self.scaler = None
        self.feature_names = FEATURE_NAMES
        
    def load_model(self):
        """Load the trained model"""
        model_path = MODEL_BACKUP_PATH
        
        if not model_path.exists():
            print(red("❌ Model not found!"))
            print(f"   Please train the model first: {yellow('python train.py')}")
            return False
        
        print(cyan("📦 Loading trained model..."))
        model_data = joblib.load(model_path)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        
        print(green("✅ Model loaded successfully!"))
        print(f"   Training date: {model_data.get('training_date', 'Unknown')}")
        print()
        
        return True
    
    def predict_url(self, url: str) -> dict:
        """
        Predict if URL is phishing
        
        Returns:
            dict with prediction results
        """
        # Extract features
        features_dict = self.extractor.extract_features(url)
        features = [features_dict[name] for name in self.feature_names]
        
        # Scale features
        features_scaled = self.scaler.transform([features])
        
        # Predict
        probability = self.model.predict_proba(features_scaled)[0][1]
        is_phishing = probability >= 0.5
        
        # Determine risk level
        if probability >= 0.9:
            risk_level = 'critical'
        elif probability >= 0.75:
            risk_level = 'high'
        elif probability >= 0.5:
            risk_level = 'medium'
        else:
            risk_level = 'low'
        
        return {
            'url': url,
            'is_phishing': is_phishing,
            'probability': probability,
            'confidence': probability if is_phishing else (1 - probability),
            'risk_level': risk_level,
            'features': features_dict
        }
    
    def print_prediction(self, result: dict):
        """Print prediction results with colors"""
        url = result['url']
        is_phishing = result['is_phishing']
        probability = result['probability']
        risk_level = result['risk_level']
        features = result['features']
        
        print("="*70)
        print(f"  🔍 URL: {blue(url)}")
        print("="*70)
        
        # Verdict
        if is_phishing:
            if risk_level == 'critical':
                print(f"\n  🚨 VERDICT: {red('⛔ CRITICAL PHISHING THREAT')}")
                print(f"  Confidence: {red(f'{probability*100:.1f}%')}")
            elif risk_level == 'high':
                print(f"\n  ⚠️  VERDICT: {red('🔴 HIGH RISK PHISHING')}")
                print(f"  Confidence: {red(f'{probability*100:.1f}%')}")
            elif risk_level == 'medium':
                print(f"\n  ⚠️  VERDICT: {yellow('🟡 MEDIUM RISK - SUSPICIOUS')}")
                print(f"  Confidence: {yellow(f'{probability*100:.1f}%')}")
        else:
            print(f"\n  ✅ VERDICT: {green('🟢 SAFE - LEGITIMATE SITE')}")
            print(f"  Confidence: {green(f'{(1-probability)*100:.1f}%')}")
        
        print(f"  Risk Level: {risk_level.upper()}")
        print(f"  Phishing Probability: {probability:.4f}")
        
        # Show suspicious features
        print(f"\n  📊 DETECTED PATTERNS:")
        print("  " + "-"*66)
        
        suspicious_found = False
        
        # Repeated characters (NEW)
        domain_name = url.split('/')[2].split('.')[0] if '/' in url and '.' in url else ''
        if 'ggg' in domain_name or 'lll' in domain_name or 'ooo' in domain_name:
            suspicious_found = True
            print(f"  {red('❌')} Repeated characters detected (e.g., googgle)")
        
        # Random strings (NEW)
        if len(domain_name) > 6:
            vowels = sum(1 for c in domain_name if c in 'aeiou')
            consonants = sum(1 for c in domain_name if c.isalpha() and c not in 'aeiou')
            if vowels < len(domain_name) * 0.15 and len(domain_name) > 5:
                suspicious_found = True
                print(f"  {red('❌')} Random character string detected (too few vowels)")
        
        # Typosquatting
        if features['typosquattingScore'] > 0:
            suspicious_found = True
            print(f"  {red('❌')} Typosquatting detected (score: {features['typosquattingScore']:.3f})")
        
        # Missing characters
        if features['missingCharScore'] > 0.1:
            suspicious_found = True
            print(f"  {red('❌')} Possible character omission (score: {features['missingCharScore']:.3f})")
        
        # Suspicious TLD
        if features['hasSuspiciousTLD'] == 1:
            suspicious_found = True
            print(f"  {red('❌')} Suspicious domain extension (free/cheap TLD)")
        
        # No HTTPS
        if features['hasHTTPS'] == 0:
            suspicious_found = True
            print(f"  {yellow('⚠️')} No secure connection (HTTP)")
        
        # IP address
        if features['hasIP'] == 1:
            suspicious_found = True
            print(f"  {red('❌')} IP address instead of domain name")
        
        # @ symbol
        if features['hasAt'] == 1:
            suspicious_found = True
            print(f"  {red('❌')} @ symbol in URL (redirection trick)")
        
        # Keywords
        keyword_flags = []
        if features['hasLoginKeyword'] == 1:
            keyword_flags.append('login')
        if features['hasVerifyKeyword'] == 1:
            keyword_flags.append('verify')
        if features['hasSecureKeyword'] == 1:
            keyword_flags.append('secure')
        if features['hasAccountKeyword'] == 1:
            keyword_flags.append('account')
        if features['hasUpdateKeyword'] == 1:
            keyword_flags.append('update')
        if features['hasUrgencyKeyword'] == 1:
            keyword_flags.append('urgency')
        
        if keyword_flags:
            suspicious_found = True
            print(f"  {yellow('⚠️')} Suspicious keywords: {', '.join(keyword_flags)}")
        
        # High entropy
        if features['entropy'] > 3.5:
            suspicious_found = True
            print(f"  {yellow('⚠️')} High randomness (entropy: {features['entropy']:.2f})")
        
        # Total suspicious patterns
        pattern_count = int(features['suspiciousPatternCount'])
        if pattern_count > 0:
            print(f"  {magenta('🔢')} Total suspicious patterns: {pattern_count}")
        
        if not suspicious_found and not is_phishing:
            print(f"  {green('✅')} No suspicious patterns detected")
        
        # Key features
        print(f"\n  📋 KEY METRICS:")
        print("  " + "-"*66)
        print(f"    URL Length: {int(features['urlLength'])} chars")
        print(f"    Domain Length: {int(features['domainLength'])} chars")
        print(f"    Subdomains: {int(features['numSubdomains'])}")
        print(f"    Digit Ratio: {features['digitRatio']:.2%}")
        print(f"    Entropy: {features['entropy']:.2f}")
        print(f"    Has HTTPS: {green('Yes') if features['hasHTTPS'] == 1 else red('No')}")
        
        print()
    
    def test_multiple_urls(self, urls: list):
        """Test multiple URLs"""
        print(cyan(f"\n📊 Testing {len(urls)} URLs...\n"))
        
        results = []
        for url in urls:
            result = self.predict_url(url)
            results.append(result)
            self.print_prediction(result)
        
        # Summary
        print("\n" + "="*70)
        print("  📈 SUMMARY")
        print("="*70)
        
        phishing_count = sum(1 for r in results if r['is_phishing'])
        safe_count = len(results) - phishing_count
        
        print(f"  Total URLs tested: {len(results)}")
        print(f"  {red('⛔ Phishing detected')}: {phishing_count}")
        print(f"  {green('✅ Safe URLs')}: {safe_count}")
        
        # Risk breakdown
        critical = sum(1 for r in results if r['risk_level'] == 'critical')
        high = sum(1 for r in results if r['risk_level'] == 'high')
        medium = sum(1 for r in results if r['risk_level'] == 'medium')
        low = sum(1 for r in results if r['risk_level'] == 'low')
        
        print(f"\n  Risk Level Breakdown:")
        if critical > 0:
            print(f"    {red('🔴 Critical')}: {critical}")
        if high > 0:
            print(f"    {red('🟠 High')}: {high}")
        if medium > 0:
            print(f"    {yellow('🟡 Medium')}: {medium}")
        if low > 0:
            print(f"    {green('🟢 Low')}: {low}")
        
        print()
    
    def interactive_mode(self):
        """Interactive URL testing"""
        print("\n" + "="*70)
        print("  🔍 INTERACTIVE URL TESTER")
        print("="*70)
        print(f"  {cyan('Enter URLs to test (one per line)')}")
        print(f"  {cyan('Commands:')}")
        print(f"    {yellow('quit')} or {yellow('exit')} - Exit")
        print(f"    {yellow('batch')} - Enter multiple URLs at once")
        print(f"    {yellow('examples')} - Test example URLs")
        print("="*70)
        print()
        
        while True:
            try:
                url = input(f"{cyan('URL')} {magenta('>')} ").strip()
                
                if not url:
                    continue
                
                if url.lower() in ['quit', 'exit', 'q']:
                    print(green("\n✅ Goodbye!"))
                    break
                
                if url.lower() == 'batch':
                    print(cyan("\nEnter URLs (one per line, empty line to finish):"))
                    batch_urls = []
                    while True:
                        batch_url = input(f"  {magenta('>')} ").strip()
                        if not batch_url:
                            break
                        batch_urls.append(batch_url)
                    
                    if batch_urls:
                        self.test_multiple_urls(batch_urls)
                    continue
                
                if url.lower() == 'examples':
                    example_urls = [
                        'http://g00gle-verify.tk/login',
                        'https://www.amazon.com/products',
                        'https://secure-login-bank.xyz/account',
                        'https://github.com',
                        'http://paypa1-secure.ml/verify',
                    ]
                    print(cyan(f"\nTesting {len(example_urls)} example URLs...\n"))
                    self.test_multiple_urls(example_urls)
                    continue
                
                # Test single URL
                result = self.predict_url(url)
                self.print_prediction(result)
                
            except KeyboardInterrupt:
                print(green("\n\n✅ Goodbye!"))
                break
            except Exception as e:
                print(red(f"\n❌ Error: {e}\n"))


def main():
    """Main function"""
    print("\n" + "="*70)
    print(cyan("  🧠 PERFECT ML PHISHING DETECTOR - URL TESTER"))
    print("="*70)
    print()
    
    tester = URLTester()
    
    # Load model
    if not tester.load_model():
        return 1
    
    # Check command line arguments
    if len(sys.argv) > 1:
        # Test URLs from command line
        urls = sys.argv[1:]
        tester.test_multiple_urls(urls)
    else:
        # Interactive mode
        tester.interactive_mode()
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
