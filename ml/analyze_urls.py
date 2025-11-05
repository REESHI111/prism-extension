"""
PRISM ML - Interactive URL Phishing Analyzer
---------------------------------------------
A quick interactive script to analyze URLs using a trained phishing detection model.

Usage:
    python analyze_urls.py
"""

from src.models.phishing_detector import PhishingDetector
from src.features.url_features import URLFeatureExtractor


def analyze_url(detector, extractor, url: str) -> None:
    """Analyze a single URL and display detection results."""
    print(f"\n{'=' * 70}")
    print(f"🔎 Analyzing URL: {url}")
    print(f"{'=' * 70}")

    # Extract features
    features = extractor.extract(url)
    if not features:
        print("❌ Failed to extract features from this URL.")
        return

    # Prepare feature vector
    X = [features.to_list()]

    # Model predictions
    prediction = detector.predict(X)[0]
    probabilities = detector.predict_proba(X)[0]

    # Display prediction results
    if prediction == 1:
        print(f"🚨 PHISHING DETECTED!")
        print(f"   Confidence: {probabilities[1]:.2%}")
    else:
        print(f"✅ LEGITIMATE")
        print(f"   Confidence: {probabilities[0]:.2%}")

    # Display extracted feature summary
    print("\n📊 Extracted Features:")
    print(f"   URL Length:        {features.url_length}")
    print(f"   Domain Length:     {features.domain_length}")
    print(f"   HTTPS Present:     {'Yes' if features.has_https else 'No'}")
    print(f"   Contains IP:       {'Yes' if features.has_ip_address else 'No'}")
    print(f"   Suspicious TLD:    {'Yes' if features.is_suspicious_tld else 'No'}")
    print(f"   URL Entropy:       {features.url_entropy:.4f}")
    print(f"   Domain Entropy:    {features.domain_entropy:.4f}")
    print(f"   Sensitive Words:   {features.num_sensitive_words}")
    print(f"   Hyphens:           {features.num_hyphens}")
    print(f"   Digits:            {features.num_digits}")
    print(f"   Subdomains:        {features.num_subdomains}")


def main():
    """Main entry point for interactive URL analysis."""
    print(f"\n{'=' * 70}")
    print("🚀 PRISM ML - URL Phishing Analyzer")
    print(f"{'=' * 70}")

    print("\nLoading trained phishing detection model...")
    detector = PhishingDetector.load("phishing_detector")
    extractor = URLFeatureExtractor()
    print("✅ Model successfully loaded.\n")

    # Predefined test URLs organized by category
    print("\n" + "=" * 70)
    print("📋 Testing on Categorized URL Samples")
    print("=" * 70 + "\n")
    
    test_categories = {
        "✅ Legitimate URLs": [
            "https://www.google.com",
            "https://github.com/microsoft/vscode",
            "https://www.wikipedia.org/wiki/Python",
            "https://stackoverflow.com/questions/tagged/python",
            "https://www.amazon.com/dp/B08N5WRWNW",
        ],
        "🚨 Subdomain Spoofing": [
            "http://secure-paypal.malicious-site.tk/login",
            "http://verify-amazon-account.fake.com",
        ],
        "🚨 Typosquatting": [
            "http://g00gle.com/signin",
            "http://faceb00k.com/secure-login",
            "http://micros0ft-update.xyz/download",
        ],
        "🚨 IP-Based URLs": [
            "http://192.168.1.1/admin/login",
            "http://45.123.67.89/secure/verify",
        ],
        "🚨 Suspicious TLDs": [
            "http://paypal-verify.tk/login",
            "http://amaz0n-prime.ga/renew",
        ],
        "🚨 Brand Impersonation": [
            "http://apple-security.verify-account.ml",
            "http://secure-paypal.login-verify.tk",
        ]
    }
    
    for category, urls in test_categories.items():
        print(f"\n{category}")
        print("-" * 70)
        for url in urls:
            analyze_url(detector, extractor, url)

    # Interactive input mode
    print(f"\n{'=' * 70}")
    print("🧭 Interactive Mode (type 'quit' to exit)")
    print(f"{'=' * 70}")

    while True:
        try:
            url = input("\nEnter a URL: ").strip()
            if url.lower() in {"quit", "exit", "q"}:
                print("\n👋 Exiting analyzer. Goodbye!")
                break
            if url:
                analyze_url(detector, extractor, url)
        except KeyboardInterrupt:
            print("\n\n👋 Interrupted. Exiting analyzer.")
            break
        except Exception as e:
            print(f"❌ Error analyzing URL: {e}")


if __name__ == "__main__":
    main()
