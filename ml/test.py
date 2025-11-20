"""
Quick test script for PRISM phishing detector.
Demonstrates basic usage and testing.
"""

from phishing_detector import PhishingDetector

print("=" * 70)
print("PRISM Phishing Detector - Quick Test")
print("=" * 70)

# Load pre-trained model
print("\nLoading model...")
try:
    detector = PhishingDetector.load("model.pkl")
    print("[OK] Model loaded successfully\n")
except FileNotFoundError:
    print("[INFO] No model found. Training new model...")
    detector = PhishingDetector()
    detector.train(n_samples=5000, save_path="model.pkl")
    print("\n[OK] Training complete\n")

# Test cases
test_cases = [
    # Legitimate
    ("https://www.google.com", False, "Legit - Google"),
    ("https://www.paypal.com", False, "Legit - PayPal"),
    ("https://github.com", False, "Legit - GitHub"),
    
    # Typosquatting (0→o, 1→i, 3→e, 4→a)
    ("http://g00gle.com/login", True, "Typo - g00gle (0→o)"),
    ("http://m1crosoft.com", True, "Typo - m1crosoft (1→i)"),
    ("http://fac3book.com", True, "Typo - fac3book (3→e)"),
    ("http://am4zon.com", True, "Typo - am4zon (4→a)"),
    
    # Missing character typos
    ("http://goggle.com/verify", True, "Typo - goggle (extra g)"),
    ("http://facbook.com/login", True, "Typo - facbook (missing e)"),
    ("http://amazn.com/secure", True, "Typo - amazn (missing o)"),
    
    # Other phishing patterns
    ("http://192.168.1.1/login", True, "Phish - IP address"),
    ("http://paypal-verify.tk", True, "Phish - Suspicious TLD"),
    ("http://secure-paypal.xyz/urgent", True, "Phish - Subdomain + urgency"),
]

print("Running tests...")
print("-" * 70)

correct = 0
total = len(test_cases)

for url, expected_phishing, description in test_cases:
    result = detector.predict(url)
    is_phishing = result['is_phishing']
    confidence = result['confidence']
    
    # Check if prediction matches expected
    is_correct = is_phishing == expected_phishing
    if is_correct:
        correct += 1
        status = "[PASS]"
    else:
        status = "[FAIL]"
    
    # Format output
    pred_label = "PHISH" if is_phishing else "SAFE"
    print(f"{status} {description:30s} -> {pred_label:5s} ({confidence:5.1%})")

print("-" * 70)
print(f"\nResults: {correct}/{total} correct ({correct/total*100:.1f}%)")
print("=" * 70)
