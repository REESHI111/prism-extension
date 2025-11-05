"""
PRISM ML - Enhanced Phishing Training Dataset Generator
--------------------------------------------------------
Generates a realistic, diverse training dataset for phishing detection
with proper feature engineering and real-world patterns.

Usage:
    python generate_training_data.py
"""

import pandas as pd
import numpy as np
from typing import List, Tuple
import random
from datetime import datetime

class EnhancedPhishingDataset:
    """Generate comprehensive training data for phishing detection."""
    
    def __init__(self, seed: int = 42):
        random.seed(seed)
        np.random.seed(seed)
        
        # Legitimate domains (top websites)
        self.legitimate_domains = [
            "google.com", "youtube.com", "facebook.com", "amazon.com",
            "wikipedia.org", "twitter.com", "instagram.com", "linkedin.com",
            "reddit.com", "netflix.com", "microsoft.com", "apple.com",
            "github.com", "stackoverflow.com", "medium.com", "ebay.com",
            "paypal.com", "dropbox.com", "adobe.com", "spotify.com",
            "zoom.us", "twitch.tv", "whatsapp.com", "telegram.org",
            "discord.com", "slack.com", "office.com", "gmail.com",
            "drive.google.com", "docs.google.com", "news.google.com",
            "maps.google.com", "cloudflare.com", "wordpress.com",
            "bing.com", "yahoo.com", "cnn.com", "bbc.com", "nytimes.com",
            "guardian.com", "forbes.com", "bloomberg.com", "reuters.com"
        ]
        
        # Legitimate paths and patterns
        self.legit_paths = [
            "/", "/login", "/signin", "/signup", "/register", "/account",
            "/dashboard", "/profile", "/settings", "/help", "/support",
            "/about", "/contact", "/products", "/services", "/pricing",
            "/blog", "/news", "/docs", "/api", "/search", "/cart",
            "/checkout", "/orders", "/downloads", "/privacy", "/terms"
        ]
        
        # Suspicious TLDs commonly used in phishing
        self.suspicious_tlds = [
            ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".work",
            ".click", ".link", ".live", ".online", ".site", ".website",
            ".space", ".tech", ".info", ".biz", ".pro"
        ]
        
        # Trusted TLDs
        self.trusted_tlds = [
            ".com", ".org", ".net", ".edu", ".gov", ".mil"
        ]
        
        # Common brand names to spoof
        self.target_brands = [
            "paypal", "amazon", "microsoft", "apple", "google", "facebook",
            "instagram", "netflix", "ebay", "bank", "chase", "wellsfargo",
            "citibank", "bankofamerica", "usbank", "dhl", "fedex", "ups",
            "irs", "ssa", "usps", "dropbox", "adobe", "linkedin"
        ]
        
        # Phishing keywords
        self.phishing_keywords = [
            "verify", "secure", "account", "update", "confirm", "validate",
            "suspend", "limited", "unusual", "activity", "urgent", "alert",
            "billing", "payment", "refund", "prize", "winner", "claim",
            "reset", "restore", "unlock", "blocked", "suspended"
        ]
        
        # Character substitutions for homograph attacks
        self.char_substitutions = {
            'o': ['0', 'ο', 'о'],  # zero, greek omicron, cyrillic o
            'a': ['@', 'а'],  # cyrillic a
            'e': ['3', 'е'],  # cyrillic e
            'i': ['1', 'l', '!'],
            'l': ['1', 'I'],
            's': ['5', '$'],
            't': ['7'],
            'g': ['9', 'q']
        }
    
    def generate_legitimate_urls(self, n: int) -> List[str]:
        """Generate realistic legitimate URLs."""
        urls = []
        
        for _ in range(n):
            domain = random.choice(self.legitimate_domains)
            protocol = "https" if random.random() > 0.1 else "http"
            
            # Add subdomain sometimes
            if random.random() > 0.7:
                subdomains = ["www", "m", "mobile", "api", "cdn", "static", "blog", "shop", "mail"]
                domain = f"{random.choice(subdomains)}.{domain}"
            
            # Add path
            if random.random() > 0.3:
                path = random.choice(self.legit_paths)
                
                # Add query parameters sometimes
                if random.random() > 0.5:
                    params = []
                    for _ in range(random.randint(1, 3)):
                        key = random.choice(["id", "page", "q", "search", "category", "product", "user"])
                        value = random.randint(1, 9999)
                        params.append(f"{key}={value}")
                    path += "?" + "&".join(params)
            else:
                path = "/"
            
            url = f"{protocol}://{domain}{path}"
            urls.append(url)
        
        return urls
    
    def generate_phishing_urls(self, n: int) -> List[str]:
        """Generate realistic phishing URLs with various attack patterns."""
        urls = []
        
        for _ in range(n // 6):
            # Pattern 1: Typosquatting with character substitution
            brand = random.choice(self.target_brands)
            spoofed = self._apply_typosquatting(brand)
            tld = random.choice(self.suspicious_tlds)
            keyword = random.choice(self.phishing_keywords)
            url = f"http://{spoofed}{tld}/{keyword}"
            urls.append(url)
        
        for _ in range(n // 6):
            # Pattern 2: Subdomain impersonation
            brand = random.choice(self.target_brands)
            fake_domain = f"{''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=8))}"
            tld = random.choice(self.suspicious_tlds)
            keyword = random.choice(self.phishing_keywords)
            url = f"http://{brand}-{keyword}.{fake_domain}{tld}"
            urls.append(url)
        
        for _ in range(n // 6):
            # Pattern 3: IP address URLs
            ip = f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(1, 255)}"
            path = random.choice(["admin", "login", "secure", "verify", "account"])
            url = f"http://{ip}/{path}"
            urls.append(url)
        
        for _ in range(n // 6):
            # Pattern 4: Suspicious keyword combinations
            brand = random.choice(self.target_brands)
            keyword1 = random.choice(self.phishing_keywords)
            keyword2 = random.choice(self.phishing_keywords)
            tld = random.choice(self.suspicious_tlds)
            url = f"http://{brand}-{keyword1}-{keyword2}{tld}"
            urls.append(url)
        
        for _ in range(n // 6):
            # Pattern 5: Long subdomain chains
            brand = random.choice(self.target_brands)
            legit_domain = random.choice(self.legitimate_domains)
            fake_base = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=10))
            tld = random.choice(self.suspicious_tlds)
            url = f"http://{brand}.{legit_domain}.{random.choice(self.phishing_keywords)}.{fake_base}{tld}"
            urls.append(url)
        
        for _ in range(n // 6):
            # Pattern 6: URL with excessive hyphens and numbers
            brand = random.choice(self.target_brands)
            noise = f"{random.randint(100, 999)}-{random.randint(100, 999)}"
            keyword = random.choice(self.phishing_keywords)
            tld = random.choice(self.suspicious_tlds)
            url = f"http://{brand}-{noise}-{keyword}{tld}/verify?id={random.randint(10000, 99999)}"
            urls.append(url)
        
        return urls
    
    def _apply_typosquatting(self, word: str) -> str:
        """Apply character substitutions for typosquatting."""
        result = list(word)
        # Substitute 1-2 characters
        for _ in range(random.randint(1, 2)):
            idx = random.randint(0, len(result) - 1)
            char = result[idx].lower()
            if char in self.char_substitutions:
                result[idx] = random.choice(self.char_substitutions[char])
        return ''.join(result)
    
    def generate_dataset(self, n_samples: int = 10000) -> pd.DataFrame:
        """Generate complete balanced dataset."""
        n_per_class = n_samples // 2
        
        print(f"Generating {n_per_class} legitimate URLs...")
        legitimate_urls = self.generate_legitimate_urls(n_per_class)
        
        print(f"Generating {n_per_class} phishing URLs...")
        phishing_urls = self.generate_phishing_urls(n_per_class)
        
        # Combine and create dataframe
        all_urls = legitimate_urls + phishing_urls
        labels = [0] * len(legitimate_urls) + [1] * len(phishing_urls)
        
        df = pd.DataFrame({
            'url': all_urls,
            'label': labels
        })
        
        # Shuffle
        df = df.sample(frac=1, random_state=42).reset_index(drop=True)
        
        return df
    
    def save_dataset(self, df: pd.DataFrame, filepath: str = "data/phishing_dataset.csv"):
        """Save dataset to CSV file."""
        from pathlib import Path
        Path(filepath).parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(filepath, index=False)
        print(f"\n✅ Dataset saved to: {filepath}")
        print(f"   Total samples: {len(df)}")
        print(f"   Legitimate: {(df['label'] == 0).sum()}")
        print(f"   Phishing: {(df['label'] == 1).sum()}")


def main():
    """Generate and save training dataset."""
    print("\n" + "=" * 70)
    print("🔧 PRISM ML - Enhanced Training Dataset Generator")
    print("=" * 70 + "\n")
    
    generator = EnhancedPhishingDataset()
    
    # Generate dataset with 10,000 samples (5000 legitimate, 5000 phishing)
    df = generator.generate_dataset(n_samples=10000)
    
    # Display statistics
    print("\n" + "=" * 70)
    print("📊 Dataset Statistics")
    print("=" * 70)
    print(f"\nTotal URLs: {len(df)}")
    print(f"Legitimate URLs: {(df['label'] == 0).sum()} ({(df['label'] == 0).sum() / len(df) * 100:.1f}%)")
    print(f"Phishing URLs: {(df['label'] == 1).sum()} ({(df['label'] == 1).sum() / len(df) * 100:.1f}%)")
    
    print("\n📋 Sample URLs:")
    print("\n✅ Legitimate Examples:")
    for url in df[df['label'] == 0]['url'].head(5):
        print(f"   {url}")
    
    print("\n🚨 Phishing Examples:")
    for url in df[df['label'] == 1]['url'].head(5):
        print(f"   {url}")
    
    # Save dataset
    generator.save_dataset(df)
    
    print("\n" + "=" * 70)
    print("✨ Next Steps:")
    print("=" * 70)
    print("1. Review the generated dataset: data/phishing_dataset.csv")
    print("2. Run training: python train.py")
    print("3. Test predictions: python test_predictions.py")
    print("4. Analyze URLs interactively: python analyze_urls.py")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    main()


    __________________________________________________________________________________


    """
PRISM ML - Improved Phishing Detection Training Pipeline
--------------------------------------------------------
Enhanced training with proper dataset handling, validation, and evaluation.

Usage:
    python train_improved.py
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)
import joblib
from datetime import datetime
import json

sys.path.insert(0, str(Path(__file__).parent))

from src.features.url_features import URLFeatureExtractor
from src.utils.logger import get_logger

logger = get_logger(__name__)


class ImprovedTrainingPipeline:
    """Enhanced training pipeline with better validation and reporting."""
    
    def __init__(self, dataset_path: str = "data/phishing_dataset.csv"):
        self.dataset_path = dataset_path
        self.extractor = URLFeatureExtractor()
        self.model = None
        self.feature_names = None
        
    def load_and_prepare_data(self):
        """Load dataset and extract features."""
        print("📂 Loading dataset...")
        
        if not Path(self.dataset_path).exists():
            raise FileNotFoundError(
                f"Dataset not found at {self.dataset_path}\n"
                f"Please run 'python generate_training_data.py' first!"
            )
        
        df = pd.read_csv(self.dataset_path)
        print(f"   Loaded {len(df)} URLs")
        print(f"   Legitimate: {(df['label'] == 0).sum()}")
        print(f"   Phishing: {(df['label'] == 1).sum()}")
        
        print("\n🔧 Extracting features from URLs...")
        features_list = []
        labels = []
        failed = 0
        
        for idx, row in df.iterrows():
            if idx % 1000 == 0 and idx > 0:
                print(f"   Processed {idx}/{len(df)} URLs...")
            
            features = self.extractor.extract(row['url'])
            if features:
                features_list.append(features.to_list())
                labels.append(row['label'])
            else:
                failed += 1
        
        if failed > 0:
            print(f"   ⚠️  Failed to extract features from {failed} URLs")
        
        X = np.array(features_list)
        y = np.array(labels)
        
        # Get feature names
        sample_features = self.extractor.extract(df['url'].iloc[0])
        self.feature_names = list(sample_features.__dict__.keys())
        
        print(f"✅ Feature extraction complete: {X.shape[0]} samples, {X.shape[1]} features\n")
        
        return X, y
    
    def train_and_evaluate(self, X, y):
        """Train model with comprehensive evaluation."""
        print("=" * 70)
        print("🚀 Training Phishing Detection Model")
        print("=" * 70 + "\n")
        
        # Split data: 70% train, 15% validation, 15% test
        X_temp, X_test, y_temp, y_test = train_test_split(
            X, y, test_size=0.15, random_state=42, stratify=y
        )
        X_train, X_val, y_train, y_val = train_test_split(
            X_temp, y_temp, test_size=0.176, random_state=42, stratify=y_temp
        )
        
        print(f"📊 Data Split:")
        print(f"   Training:   {len(X_train)} samples")
        print(f"   Validation: {len(X_val)} samples")
        print(f"   Test:       {len(X_test)} samples\n")
        
        # Train ensemble model
        print("🔬 Training Random Forest model...")
        rf_model = RandomForestClassifier(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            random_state=42,
            n_jobs=-1,
            class_weight='balanced'
        )
        rf_model.fit(X_train, y_train)
        
        # Cross-validation
        print("🔄 Performing 5-fold cross-validation...")
        cv_scores = cross_val_score(
            rf_model, X_train, y_train, 
            cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42),
            scoring='f1',
            n_jobs=-1
        )
        print(f"   CV F1 Scores: {cv_scores}")
        print(f"   Mean CV F1: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})\n")
        
        # Validation set evaluation
        print("📈 Validation Set Performance:")
        y_val_pred = rf_model.predict(X_val)
        y_val_proba = rf_model.predict_proba(X_val)[:, 1]
        
        self._print_metrics(y_val, y_val_pred, y_val_proba, "Validation")
        
        # Test set evaluation
        print("\n📊 Test Set Performance (Final Evaluation):")
        y_test_pred = rf_model.predict(X_test)
        y_test_proba = rf_model.predict_proba(X_test)[:, 1]
        
        test_metrics = self._print_metrics(y_test, y_test_pred, y_test_proba, "Test")
        
        # Feature importance
        print("\n🔍 Top 10 Most Important Features:")
        feature_importance = dict(zip(self.feature_names, rf_model.feature_importances_))
        sorted_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        
        for i, (feature, importance) in enumerate(sorted_features[:10], 1):
            print(f"   {i:2d}. {feature:25s}: {importance:.4f}")
        
        self.model = rf_model
        
        return {
            'model': rf_model,
            'test_metrics': test_metrics,
            'cv_scores': cv_scores,
            'feature_importance': dict(sorted_features),
            'confusion_matrix': confusion_matrix(y_test, y_test_pred).tolist()
        }
    
    def _print_metrics(self, y_true, y_pred, y_proba, dataset_name):
        """Print comprehensive evaluation metrics."""
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred)
        recall = recall_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred)
        roc_auc = roc_auc_score(y_true, y_proba)
        
        print(f"   Accuracy:  {accuracy:.4f}")
        print(f"   Precision: {precision:.4f}  (of URLs flagged as phishing, {precision*100:.1f}% are actually phishing)")
        print(f"   Recall:    {recall:.4f}  (detects {recall*100:.1f}% of all phishing URLs)")
        print(f"   F1-Score:  {f1:.4f}")
        print(f"   ROC-AUC:   {roc_auc:.4f}")
        
        print(f"\n   Confusion Matrix ({dataset_name}):")
        cm = confusion_matrix(y_true, y_pred)
        print(f"                Predicted")
        print(f"                Legit  Phish")
        print(f"   Actual Legit  {cm[0][0]:5d}  {cm[0][1]:5d}")
        print(f"          Phish  {cm[1][0]:5d}  {cm[1][1]:5d}")
        
        # Calculate false positive and false negative rates
        tn, fp, fn, tp = cm.ravel()
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0
        fnr = fn / (fn + tp) if (fn + tp) > 0 else 0
        
        print(f"\n   False Positive Rate: {fpr:.4f} ({fpr*100:.2f}% of legitimate URLs incorrectly flagged)")
        print(f"   False Negative Rate: {fnr:.4f} ({fnr*100:.2f}% of phishing URLs missed)")
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'roc_auc': roc_auc,
            'fpr': fpr,
            'fnr': fnr
        }
    
    def save_model(self, output_dir: str = "models"):
        """Save trained model and metadata."""
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        model_path = Path(output_dir) / "phishing_detector.pkl"
        metadata_path = Path(output_dir) / "model_metadata.json"
        
        # Save model
        joblib.dump(self.model, model_path)
        print(f"\n💾 Model saved to: {model_path}")
        
        # Save metadata
        metadata = {
            'trained_at': datetime.now().isoformat(),
            'model_type': 'RandomForestClassifier',
            'n_features': len(self.feature_names),
            'feature_names': self.feature_names,
            'dataset_path': self.dataset_path
        }
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"📝 Metadata saved to: {metadata_path}")
        
        return str(model_path)
    
    def run(self):
        """Execute complete training pipeline."""
        start_time = datetime.now()
        
        try:
            # Load and prepare data
            X, y = self.load_and_prepare_data()
            
            # Train and evaluate
            results = self.train_and_evaluate(X, y)
            
            # Save model
            model_path = self.save_model()
            
            elapsed = (datetime.now() - start_time).total_seconds()
            
            print("\n" + "=" * 70)
            print("✅ TRAINING COMPLETE!")
            print("=" * 70)
            print(f"⏱️  Total time: {elapsed:.2f} seconds")
            print(f"🎯 Test F1-Score: {results['test_metrics']['f1_score']:.4f}")
            print(f"🎯 Test Accuracy: {results['test_metrics']['accuracy']:.4f}")
            print("=" * 70 + "\n")
            
            return results
            
        except Exception as e:
            logger.error(f"Training failed: {e}", exc_info=True)
            raise


def main():
    """Main entry point."""
    print("\n" + "=" * 70)
    print("🧠 PRISM ML - Improved Training Pipeline")
    print("=" * 70 + "\n")
    
    pipeline = ImprovedTrainingPipeline()
    
    try:
        results = pipeline.run()
        sys.exit(0)
    except FileNotFoundError as e:
        print(f"\n❌ {e}")
        print("\n💡 Run this first: python generate_training_data.py\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Training failed: {e}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()



    ______________________________________________________________________


    """
PRISM ML - Improved Model Testing with Real-World Examples
----------------------------------------------------------
Comprehensive testing with diverse phishing attack patterns.

Usage:
    python test_improved.py
"""

import sys
from pathlib import Path
import joblib

sys.path.insert(0, str(Path(__file__).parent))

from src.features.url_features import URLFeatureExtractor
from src.utils.logger import get_logger

logger = get_logger(__name__)


class PhishingTester:
    """Test phishing detection model with diverse real-world scenarios."""
    
    def __init__(self, model_path: str = "models/phishing_detector.pkl"):
        self.model = joblib.load(model_path)
        self.extractor = URLFeatureExtractor()
    
    def analyze_url(self, url: str, expected_label: str) -> dict:
        """Analyze a URL and return prediction results."""
        features = self.extractor.extract(url)
        if not features:
            return {'error': 'Feature extraction failed'}
        
        X = [features.to_list()]
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        
        return {
            'url': url,
            'expected': expected_label,
            'prediction': 'Phishing' if prediction == 1 else 'Legitimate',
            'confidence': probabilities[prediction],
            'phishing_prob': probabilities[1],
            'legitimate_prob': probabilities[0],
            'correct': (prediction == 1 and 'Phishing' in expected_label) or 
                      (prediction == 0 and 'Legitimate' in expected_label)
        }
    
    def run_comprehensive_test(self):
        """Run comprehensive test suite with various phishing patterns."""
        
        test_cases = [
            # ========== LEGITIMATE URLs (Should be classified as safe) ==========
            ("https://www.google.com", "Legitimate - Search Engine"),
            ("https://github.com/microsoft/vscode", "Legitimate - Code Repository"),
            ("https://www.amazon.com/dp/B08N5WRWNW", "Legitimate - E-commerce Product"),
            ("https://en.wikipedia.org/wiki/Machine_learning", "Legitimate - Educational"),
            ("https://stackoverflow.com/questions/tagged/python", "Legitimate - Developer Community"),
            ("https://www.paypal.com/signin", "Legitimate - Real PayPal"),
            ("https://login.live.com", "Legitimate - Microsoft Login"),
            ("https://accounts.google.com/signin", "Legitimate - Google Login"),
            ("https://www.linkedin.com/login", "Legitimate - LinkedIn"),
            ("https://mail.google.com", "Legitimate - Gmail"),
            ("https://docs.google.com/document", "Legitimate - Google Docs"),
            ("https://www.netflix.com/browse", "Legitimate - Streaming Service"),
            
            # ========== TYPOSQUATTING (Character substitution) ==========
            ("http://g00gle.com/signin", "Phishing - Typosquatting (0 for o)"),
            ("http://paypa1.com/verify", "Phishing - Typosquatting (1 for l)"),
            ("http://amaz0n.com/account", "Phishing - Typosquatting (0 for o)"),
            ("http://faceb00k.com/login", "Phishing - Typosquatting (00 for oo)"),
            ("http://micros0ft.com/update", "Phishing - Typosquatting (0 for o)"),
            ("http://app1e.com/icloud", "Phishing - Typosquatting (1 for l)"),
            
            # ========== SUSPICIOUS TLDs ==========
            ("http://paypal-verify.tk/login", "Phishing - Suspicious TLD (.tk)"),
            ("http://secure-account.ml/verify", "Phishing - Suspicious TLD (.ml)"),
            ("http://amazon-update.ga/confirm", "Phishing - Suspicious TLD (.ga)"),
            ("http://bank-security.cf/alert", "Phishing - Suspicious TLD (.cf)"),
            ("http://netflix-billing.xyz/payment", "Phishing - Suspicious TLD (.xyz)"),
            
            # ========== IP ADDRESS URLs ==========
            ("http://192.168.1.1/admin/login", "Phishing - IP Address"),
            ("http://203.0.113.50/secure/verify", "Phishing - IP Address"),
            ("http://198.51.100.10/account/update", "Phishing - IP Address"),
            
            # ========== SUBDOMAIN IMPERSONATION ==========
            ("http://paypal.verify-account.tk", "Phishing - Subdomain Spoofing"),
            ("http://amazon.secure-login.ml", "Phishing - Subdomain Spoofing"),
            ("http://accounts.google.verify-user.xyz", "Phishing - Subdomain Chain"),
            ("http://login.microsoft.secure.tk", "Phishing - Subdomain Chain"),
            
            # ========== SUSPICIOUS KEYWORDS ==========
            ("http://secure-paypal-verify-account.com", "Phishing - Multiple Keywords"),
            ("http://urgent-account-suspended-verify.tk", "Phishing - Urgency Keywords"),
            ("http://confirm-billing-update-required.ml", "Phishing - Action Keywords"),
            ("http://winner-prize-claim-now.xyz", "Phishing - Scam Keywords"),
            
            # ========== EXCESSIVE HYPHENS ==========
            ("http://paypal-security-alert-verify.tk", "Phishing - Excessive Hyphens"),
            ("http://amazon-billing-update-confirm-now.ml", "Phishing - Excessive Hyphens"),
            
            # ========== LONG URLS WITH RANDOM STRINGS ==========
            ("http://secure-login.xyz/verify?token=a8f7d9e2b4c1f6g3h5j8k9", "Phishing - Suspicious Query"),
            ("http://account-verify.tk/secure/auth/login.php?redirect=malicious", "Phishing - Complex Path"),
            
            # ========== HOMOGRAPH ATTACKS (Look-alike characters) ==========
            ("http://gοοgle.com", "Phishing - Homograph (Greek omicron)"),
            ("http://аpple.com", "Phishing - Homograph (Cyrillic a)"),
            
            # ========== LEGITIMATE BUT POTENTIALLY CONFUSING ==========
            ("https://www.paypal.com/myaccount/settings", "Legitimate - PayPal Settings"),
            ("https://amazon.co.uk/gp/product/B07XYZ", "Legitimate - Amazon UK"),
            ("https://support.google.com/accounts/answer/1234", "Legitimate - Google Support"),
        ]
        
        print("\n" + "=" * 80)
        print("🔬 COMPREHENSIVE PHISHING DETECTION TEST")
        print("=" * 80 + "\n")
        
        results = []
        for url, expected in test_cases:
            result = self.analyze_url(url, expected)
            results.append(result)
        
        # Display results by category
        self._display_results_by_category(results)
        
        # Summary statistics
        self._display_summary(results)
        
        return results
    
    def _display_results_by_category(self, results: list):
        """Display test results organized by category."""
        
        for result in results:
            if 'error' in result:
                print(f"❌ ERROR: {result['url']}")
                continue
            
            # Determine icon and color
            if result['correct']:
                icon = "✅"
                status = "CORRECT"
            else:
                icon = "❌"
                status = "INCORRECT"
            
            # Display result
            print(f"{icon} {status}")
            print(f"   URL: {result['url']}")
            print(f"   Expected: {result['expected']}")
            print(f"   Predicted: {result['prediction']} ({result['confidence']:.1%} confidence)")
            print(f"   Probabilities → Legitimate: {result['legitimate_prob']:.3f}, Phishing: {result['phishing_prob']:.3f}")
            print("-" * 80)
    
    def _display_summary(self, results: list):
        """Display summary statistics."""
        valid_results = [r for r in results if 'error' not in r]
        
        total = len(valid_results)
        correct = sum(1 for r in valid_results if r['correct'])
        incorrect = total - correct
        accuracy = correct / total if total > 0 else 0
        
        # Separate by expected label
        legitimate = [r for r in valid_results if 'Legitimate' in r['expected']]
        phishing = [r for r in valid_results if 'Phishing' in r['expected']]
        
        legitimate_correct = sum(1 for r in legitimate if r['correct'])
        phishing_correct = sum(1 for r in phishing if r['correct'])
        
        legitimate_accuracy = legitimate_correct / len(legitimate) if legitimate else 0
        phishing_accuracy = phishing_correct / len(phishing) if phishing else 0
        
        # Calculate false positives and false negatives
        false_positives = sum(1 for r in legitimate if not r['correct'])
        false_negatives = sum(1 for r in phishing if not r['correct'])
        
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY")
        print("=" * 80)
        print(f"\n🎯 Overall Results:")
        print(f"   Total Tests: {total}")
        print(f"   Correct: {correct} ({accuracy:.1%})")
        print(f"   Incorrect: {incorrect} ({(1-accuracy):.1%})")
        
        print(f"\n✅ Legitimate URL Detection:")
        print(f"   Tested: {len(legitimate)}")
        print(f"   Correctly Identified: {legitimate_correct} ({legitimate_accuracy:.1%})")
        print(f"   False Positives: {false_positives} (legitimate URLs incorrectly flagged as phishing)")
        
        print(f"\n🚨 Phishing URL Detection:")
        print(f"   Tested: {len(phishing)}")
        print(f"   Correctly Identified: {phishing_correct} ({phishing_accuracy:.1%})")
        print(f"   False Negatives: {false_negatives} (phishing URLs that slipped through)")
        
        print("\n" + "=" * 80)
        
        if accuracy >= 0.95:
            print("🎉 EXCELLENT! Model performance is outstanding!")
        elif accuracy >= 0.90:
            print("👍 GOOD! Model performance is strong!")
        elif accuracy >= 0.80:
            print("⚠️  ACCEPTABLE! Model needs improvement.")
        else:
            print("❌ POOR! Model requires retraining with better data.")
        
        print("=" * 80 + "\n")


def main():
    """Main entry point."""
    print("\n" + "=" * 80)
    print("🧪 PRISM ML - Comprehensive Model Testing")
    print("=" * 80 + "\n")
    
    try:
        model_path = "models/phishing_detector.pkl"
        
        if not Path(model_path).exists():
            print(f"❌ Model not found at: {model_path}")
            print("\n💡 Please train the model first:")
            print("   1. python generate_training_data.py")
            print("   2. python train_improved.py\n")
            sys.exit(1)
        
        print(f"📂 Loading model from: {model_path}")
        tester = PhishingTester(model_path)
        print("✅ Model loaded successfully!\n")
        
        results = tester.run_comprehensive_test()
        
        sys.exit(0)
        
    except Exception as e:
        logger.error(f"Testing failed: {e}", exc_info=True)
        print(f"\n❌ Testing failed: {e}\n")
        sys.exit(1)


if __name__ == "__main__":
    main()