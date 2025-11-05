"""
PRISM ML - Phishing Model Prediction Tester
--------------------------------------------
Use this script to verify the performance of a trained phishing detection model.

Usage:
    python train_predictions.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from src.models.phishing_detector import PhishingDetector
from src.features.url_features import URLFeatureExtractor
from src.utils.logger import get_logger

logger = get_logger(__name__)


def main():
    print("\n" + "=" * 60)
    print("🧠 PRISM ML - Model Prediction Test")
    print("=" * 60 + "\n")

    try:
        print("Loading trained model...")
        detector = PhishingDetector.load("phishing_detector")
        extractor = URLFeatureExtractor()
        print("✅ Model loaded successfully.\n")

        # Comprehensive test URLs covering all attack patterns
        test_urls = [
            # === LEGITIMATE URLs ===
            ("https://www.google.com", "Legitimate", "Top search engine"),
            ("https://github.com/microsoft/vscode", "Legitimate", "Official GitHub repository"),
            ("https://www.amazon.com/products", "Legitimate", "Amazon products page"),
            ("https://stackoverflow.com/questions/tagged/python", "Legitimate", "StackOverflow Python tag"),
            ("https://www.wikipedia.org/wiki/Machine_Learning", "Legitimate", "Wikipedia article"),
            
            # === PHISHING PATTERNS ===
            # Pattern 1: Subdomain Spoofing
            ("http://secure-paypal-login.suspicious.tk", "Phishing", "Subdomain spoofing - PayPal imitation"),
            ("http://verify-amazon-account.malicious.com", "Phishing", "Subdomain spoofing - Amazon imitation"),
            
            # Pattern 2: Typosquatting with character substitution
            ("http://g00gle.com/verify-account", "Phishing", "Typosquatting - g00gle instead of google"),
            ("http://micr0soft.com/update", "Phishing", "Typosquatting - micr0soft"),
            ("http://fac3book.com/login", "Phishing", "Typosquatting - fac3book"),
            
            # Pattern 3: IP Address URLs
            ("http://192.168.1.100/login", "Phishing", "IP address instead of domain"),
            ("http://45.123.67.89/secure/account", "Phishing", "Public IP with suspicious path"),
            
            # Pattern 4: Suspicious TLD
            ("http://paypal-verify.tk/login", "Phishing", "Suspicious TLD - .tk"),
            ("http://bank-secure.ml/verify", "Phishing", "Suspicious TLD - .ml"),
            
            # Pattern 5: Long suspicious URL
            ("http://secure-verify-account-update.suspicious-domain.xyz/validate/user/confirm", "Phishing", "Long URL with multiple suspicious keywords"),
            
            # Pattern 6: URL shortener mimic
            ("http://bit-ly.tk/abc123", "Phishing", "Fake URL shortener"),
            
            # Pattern 7: Homograph attack
            ("http://www.payρal.com/login", "Phishing", "Unicode homograph - Greek rho"),
            
            # Pattern 8: Brand impersonation
            ("http://apple-security.verify-account.xyz/update", "Phishing", "Apple brand impersonation"),
        ]

        print("🔍 Testing model predictions on diverse phishing patterns:\n")
        print("=" * 80)
        
        correct_predictions = 0
        total_tests = len(test_urls)

        for url, expected, description in test_urls:
            features = extractor.extract(url)
            if not features:
                print(f"❌ Feature extraction failed for: {url}")
                print("-" * 80)
                continue

            X = [features.to_list()]
            prediction = detector.predict(X)[0]
            probabilities = detector.predict_proba(X)[0]

            predicted_label = "Phishing" if prediction == 1 else "Legitimate"
            is_correct = predicted_label == expected
            
            if is_correct:
                correct_predictions += 1
                result_icon = "✅"
            else:
                result_icon = "❌"
            
            confidence = probabilities[prediction] * 100
            
            # Color-coded output
            if predicted_label == "Phishing":
                pred_display = f"🚨 {predicted_label}"
            else:
                pred_display = f"✅ {predicted_label}"

            print(f"{result_icon} URL: {url}")
            print(f"   Description: {description}")
            print(f"   Expected: {expected}")
            print(f"   Prediction: {pred_display} ({confidence:.1f}% confidence)")
            print(
                f"   Probabilities → Legitimate: {probabilities[0]:.3f}, Phishing: {probabilities[1]:.3f}"
            )
            
            # Show key features for phishing URLs
            if prediction == 1:
                print(f"   Key Indicators:")
                if features.has_ip_address:
                    print(f"      • IP address detected")
                if features.is_suspicious_tld:
                    print(f"      • Suspicious TLD")
                if features.num_sensitive_words > 0:
                    print(f"      • Contains {features.num_sensitive_words} sensitive keyword(s)")
                if features.url_entropy > 4.5:
                    print(f"      • High URL entropy: {features.url_entropy:.2f}")
                if features.url_length > 75:
                    print(f"      • Long URL: {features.url_length} characters")
            
            print("-" * 80)
        
        # Summary statistics
        accuracy = (correct_predictions / total_tests) * 100
        print("\n" + "=" * 80)
        print(f"📊 TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total_tests}")
        print(f"Correct Predictions: {correct_predictions}")
        print(f"Accuracy: {accuracy:.1f}%")
        print("=" * 80)

        print("\n✅ Testing complete!\n")

    except FileNotFoundError:
        print("❌ Model not found. Please run train.py before testing.\n")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Prediction test failed: {e}", exc_info=True)
        print(f"❌ Unexpected error: {e}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()
