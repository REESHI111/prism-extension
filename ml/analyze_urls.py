"""
Interactive URL analyzer for PRISM phishing detector.
Test custom URLs and see detailed analysis.
"""

from phishing_detector import PhishingDetector, FeatureExtractor
import sys

def print_header():
    print("\n" + "=" * 70)
    print("PRISM Phishing Detector - Interactive URL Analyzer")
    print("=" * 70 + "\n")

def print_result(url: str, result: dict, features: dict):
    """Display detailed analysis results."""
    
    print(f"\nURL: {url}")
    print("-" * 70)
    
    # Prediction
    if result['is_phishing']:
        print(f"[!] PHISHING DETECTED")
        print(f"    Confidence: {result['confidence']:.1%}")
    else:
        print(f"[OK] APPEARS SAFE")
        print(f"    Confidence: {result['confidence']:.1%}")
    
    # Key indicators
    print("\nKey Indicators:")
    if features['typosquatting_score'] > 0:
        print(f"  [!] Typosquatting Score: {features['typosquatting_score']:.2f}")
        print(f"      (Character substitution detected: 0->o, 1->i, etc.)")
    
    if features['missing_char_typo_score'] > 0:
        print(f"  [!] Missing Char Typo: {features['missing_char_typo_score']:.2f}")
        print(f"      (Resembles legitimate brand with typo)")
    
    if features['has_ip_address']:
        print(f"  [!] IP Address URL (suspicious)")
    
    if features['is_suspicious_tld']:
        print(f"  [!] Suspicious TLD (tk, ml, xyz, etc.)")
    
    if features['num_sensitive_words'] > 0:
        print(f"  [!] Sensitive Keywords: {features['num_sensitive_words']}")
        print(f"      (login, verify, secure, etc.)")
    
    if features['has_urgency_keywords']:
        print(f"  [!] Urgency Keywords Detected")
        print(f"      (urgent, expire, suspend, etc.)")
    
    # URL characteristics
    print("\nURL Characteristics:")
    print(f"  Protocol: {'HTTPS' if features['has_https'] else 'HTTP'}")
    print(f"  URL Length: {features['url_length']} chars")
    print(f"  Domain Length: {features['domain_length']} chars")
    print(f"  Subdomains: {features['num_subdomains']}")
    print(f"  Digits in URL: {features['num_digits']}")
    print(f"  Hyphens: {features['num_hyphens']}")
    
    # Entropy (randomness)
    print(f"\nRandomness Analysis:")
    print(f"  URL Entropy: {features['url_entropy']:.2f}")
    print(f"  Domain Entropy: {features['domain_entropy']:.2f}")
    
    print("-" * 70)

def analyze_url(detector: PhishingDetector, url: str):
    """Analyze a single URL and display results."""
    try:
        result = detector.predict(url)
        
        if result.get('error'):
            print(f"\n[ERROR] {result['error']}")
            return
        
        print_result(url, result, result['features'])
        
    except Exception as e:
        print(f"\n[ERROR] Failed to analyze URL: {e}")

def interactive_mode(detector: PhishingDetector):
    """Interactive mode - analyze URLs one by one."""
    print("Interactive Mode - Enter URLs to analyze (type 'quit' to exit)")
    print("-" * 70)
    
    while True:
        try:
            url = input("\nEnter URL to analyze: ").strip()
            
            if not url:
                continue
            
            if url.lower() in ['quit', 'exit', 'q']:
                print("\nExiting...")
                break
            
            analyze_url(detector, url)
            
        except KeyboardInterrupt:
            print("\n\nExiting...")
            break
        except EOFError:
            break

def batch_mode(detector: PhishingDetector, urls: list):
    """Batch mode - analyze multiple URLs."""
    print(f"Batch Mode - Analyzing {len(urls)} URLs")
    print("-" * 70)
    
    for i, url in enumerate(urls, 1):
        print(f"\n[{i}/{len(urls)}] Analyzing: {url}")
        analyze_url(detector, url)

def main():
    print_header()
    
    # Load model
    print("Loading trained model...")
    try:
        detector = PhishingDetector.load("model.pkl")
        print("[OK] Model loaded successfully\n")
    except FileNotFoundError:
        print("[ERROR] Model not found!")
        print("Please train the model first:")
        print("  python phishing_detector.py")
        sys.exit(1)
    
    # Check for command-line arguments
    if len(sys.argv) > 1:
        # Batch mode - URLs provided as arguments
        urls = sys.argv[1:]
        batch_mode(detector, urls)
    else:
        # Interactive mode
        interactive_mode(detector)
    
    print("\n" + "=" * 70 + "\n")

if __name__ == "__main__":
    main()
