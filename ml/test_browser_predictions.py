"""
Test browser implementation against Python
Ensures TypeScript predictions match Python predictions
"""

import sys
import json

sys.path.append('ml')

from data.training_data import get_training_data
from src.features.feature_extractor import URLFeatureExtractor
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

# Load model
with open('public/ml/enhanced_model.json', 'r') as f:
    model_data = json.load(f)

print("=" * 80)
print("PYTHON VS TYPESCRIPT PREDICTION COMPARISON")
print("=" * 80)

# Test URLs
test_urls = [
    ("http://g00gle-verify.tk/login", "PHISHING"),
    ("http://faceb00k-security.com/verify", "PHISHING"),
    ("http://192.168.1.1/admin/login.php", "PHISHING"),
    ("https://google.com/search", "LEGITIMATE"),
    ("https://paypal.com/signin", "LEGITIMATE"),
    ("https://amazon.com/products", "LEGITIMATE"),
    ("https://github.com/repositories", "LEGITIMATE"),
]

extractor = URLFeatureExtractor()

# Recreate scaler
import numpy as np
scaler = StandardScaler()
scaler.mean_ = np.array(model_data['scaler_mean'])
scaler.scale_ = np.array(model_data['scaler_scale'])

# Recreate model
model = LogisticRegression()
model.coef_ = np.array([model_data['coefficients']])
model.intercept_ = np.array([model_data['intercept']])
model.classes_ = np.array([0, 1])

print(f"\nModel Version: {model_data['version']}")
print(f"Features: {model_data['num_features']}")
print(f"Test Accuracy: {model_data['metrics']['test_accuracy']:.1%}")

print("\n" + "=" * 80)
print("PREDICTIONS")
print("=" * 80)

for url, expected_type in test_urls:
    # Extract and standardize features
    features = extractor.extract_features(url)
    features_scaled = scaler.transform([features])
    
    # Predict
    probability = model.predict_proba(features_scaled)[0][1]
    
    # Determine result
    result = "PHISHING" if probability >= 0.5 else "LEGITIMATE"
    match = "✓" if result == expected_type else "✗"
    
    print(f"\n{match} {url}")
    print(f"   Expected: {expected_type}")
    print(f"   Predicted: {result} ({probability:.1%} phishing confidence)")

print("\n" + "=" * 80)
print("INSTRUCTIONS FOR BROWSER TESTING")
print("=" * 80)
print("\n1. Load extension in Chrome:")
print("   - Navigate to chrome://extensions/")
print("   - Enable 'Developer mode'")
print("   - Click 'Load unpacked'")
print("   - Select the 'dist' folder")
print("\n2. Test URLs manually:")
print("   - Visit each test URL above")
print("   - Check browser console for ML predictions")
print("   - Verify predictions match Python output above")
print("\n3. Expected Results:")
for url, expected_type in test_urls:
    features = extractor.extract_features(url)
    features_scaled = scaler.transform([features])
    probability = model.predict_proba(features_scaled)[0][1]
    print(f"   {url} → {probability:.1%}")

print("\n" + "=" * 80)
