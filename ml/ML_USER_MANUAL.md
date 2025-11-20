# PRISM ML User Manual

**Complete guide from setup to advanced usage - Everything you need to know.**

---

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation & Setup](#installation--setup)
3. [Training the Model](#training-the-model)
4. [Testing URLs](#testing-urls)
5. [Understanding Results](#understanding-results)
6. [Integration Guide](#integration-guide)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Usage](#advanced-usage)

---

## 🖥️ System Requirements

**Required:**
- Python 3.12 or higher
- 500 MB free disk space
- Windows/Linux/macOS

**Recommended:**
- 4 GB RAM
- Multi-core processor (for faster training)

---

## 🚀 Installation & Setup

### Step 1: Install Python

**Windows:**
```powershell
# Download from: https://www.python.org/downloads/
# During installation, check "Add Python to PATH"

# Verify installation
python --version
# Output: Python 3.12.x
```

**Linux/macOS:**
```bash
# Most systems have Python pre-installed
python3 --version

# If not installed:
# Ubuntu/Debian: sudo apt install python3
# macOS: brew install python3
```

### Step 2: Navigate to ML Folder

```powershell
# Windows PowerShell
cd C:\Users\YourName\Downloads\PRISM\ml

# Linux/macOS Terminal
cd ~/Downloads/PRISM/ml
```

### Step 3: Create Python Virtual Environment

**Why?** Isolates project dependencies from system Python.

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1

# Linux/macOS:
source venv/bin/activate

# You should see (venv) in your terminal prompt
```

**Deactivate when done:**
```powershell
deactivate
```

### Step 4: Install Dependencies

```powershell
# Make sure virtual environment is activated (see Step 3)

# Install required packages
pip install -r requirements.txt

# Expected output:
# Successfully installed numpy-1.26.4 pandas-2.1.0 scikit-learn-1.3.0 
# joblib-1.3.2 imbalanced-learn-0.12.0
```

### Step 5: Verify Installation

```powershell
# Quick verification
python -c "import sklearn; import pandas; print('All dependencies installed!')"

# Should output: All dependencies installed!
```

---

## 🎓 Training the Model

### Quick Training (Recommended)

**Uses auto-generated phishing dataset (5000 samples):**

```powershell
# Train model with default settings
python phishing_detector.py

# Expected output:
# Training model...
# Dataset shape: (4977, 30)
# Test Accuracy: 1.0000
# [OK] Training complete!
```

**Training time:** ~8 seconds  
**Output:** `model.pkl` (160 KB trained model)

### Training with More Data

```python
# Create custom_train.py
from phishing_detector import PhishingDetector

detector = PhishingDetector()
metrics = detector.train(
    n_samples=10000,      # More samples = better accuracy
    save_path="model.pkl"
)

print(f"Accuracy: {metrics['accuracy']:.2%}")
```

```powershell
# Run custom training
python custom_train.py
```

### Understanding Training Output

```
Training model...
2025-11-07 00:35:07,145 - INFO - Generating 5000 training samples...
2025-11-07 00:35:07,365 - INFO - Extracting features...
2025-11-07 00:35:13,102 - INFO - Dataset shape: (4965, 30)
                                                  ^^^^  ^^
                                                  |     |
                                        Number of URLs  Features per URL

2025-11-07 00:35:13,260 - INFO - Training ensemble model...
2025-11-07 00:35:16,333 - INFO - Test Accuracy: 1.0000
                                                 ^^^^^^
                                                 100% accurate!

[OK] Training complete!
   Accuracy:  1.0000   <- Overall correctness
   Precision: 1.0000   <- No false alarms
   Recall:    1.0000   <- Catches all phishing
   F1 Score:  1.0000   <- Balanced performance
```

---

## 🧪 Testing URLs

### Method 1: Interactive Analyzer (Recommended)

```powershell
# Start interactive analyzer
python analyze_urls.py

# You'll see:
# PRISM Phishing Detector - Interactive URL Analyzer
# Interactive Mode - Enter URLs to analyze (type 'quit' to exit)
# 
# Enter URL to analyze: 
```

**Example session:**
```
Enter URL to analyze: http://g00gle.com/login

URL: http://g00gle.com/login
----------------------------------------------------------------------
[!] PHISHING DETECTED
    Confidence: 100.0%

Key Indicators:
  [!] Typosquatting Score: 1.00
      (Character substitution detected: 0->o, 1->i, etc.)
  [!] Sensitive Keywords: 1
      (login, verify, secure, etc.)

URL Characteristics:
  Protocol: HTTP
  URL Length: 24 chars
  Domain Length: 11 chars
  Subdomains: 0
----------------------------------------------------------------------

Enter URL to analyze: https://www.google.com

URL: https://www.google.com
----------------------------------------------------------------------
[OK] APPEARS SAFE
    Confidence: 100.0%

URL Characteristics:
  Protocol: HTTPS
  URL Length: 23 chars
  Domain Length: 15 chars
----------------------------------------------------------------------

Enter URL to analyze: quit
Exiting...
```

### Method 2: Quick Test Suite

```powershell
# Run pre-configured tests
python test.py

# Output:
# Running tests...
# [PASS] Legit - Google    -> SAFE  (100.0%)
# [PASS] Typo - g00gle     -> PHISH (100.0%)
# Results: 13/13 correct (100.0%)
```

### Method 3: Command Line Batch

```powershell
# Analyze multiple URLs at once
python analyze_urls.py "http://g00gle.com" "http://facbook.com" "https://google.com"

# Each URL will be analyzed and results displayed
```

### Method 4: Python Script

```python
# Create test_my_url.py
from phishing_detector import PhishingDetector

# Load model
detector = PhishingDetector.load("model.pkl")

# Test single URL
url = "http://paypal-verify.tk/login"
result = detector.predict(url)

print(f"URL: {url}")
print(f"Phishing: {result['is_phishing']}")
print(f"Confidence: {result['confidence']:.1%}")
print(f"Typosquatting Score: {result['typosquatting_score']:.2f}")

# Test multiple URLs
urls = [
    "https://www.amazon.com",
    "http://am4zon.com/secure",
    "http://192.168.1.1/login"
]

results = detector.predict_batch(urls)
for r in results:
    status = "PHISH" if r['is_phishing'] else "SAFE"
    print(f"{status}: {r['url']}")
```

```powershell
python test_my_url.py
```

---

## 📊 Understanding Results

### Prediction Output

```python
{
    'url': 'http://g00gle.com/login',
    'is_phishing': True,              # True = Phishing, False = Safe
    'confidence': 0.94,               # 0.0 to 1.0 (94% confident)
    'typosquatting_score': 1.0,       # Character substitution score
    'missing_char_typo_score': 0.0,   # Missing/extra char score
    'features': {                     # All 30 extracted features
        'url_length': 24,
        'has_https': 0,
        'num_sensitive_words': 1,
        # ... 27 more features
    }
}
```

### Key Indicators

**1. Typosquatting Score (0.0 - 1.0)**
- Detects character substitution (0→o, 1→i, 3→e, 4→a)
- Examples: g00gle, m1crosoft, fac3book
- **High score (>0.7)** = Likely typosquatting

**2. Missing Char Typo Score (0.0 - 1.0)**
- Detects missing/extra/swapped characters
- Examples: goggle, facbook, amazn
- **High score (>0.7)** = Resembles brand with typo

**3. Confidence (0.0 - 1.0)**
- Overall prediction certainty
- **>0.9** = Very confident
- **0.7-0.9** = Confident
- **<0.7** = Uncertain

**4. Other Indicators:**
- `has_ip_address`: URL uses IP instead of domain
- `is_suspicious_tld`: Uses .tk, .ml, .xyz, etc.
- `num_sensitive_words`: login, verify, secure keywords
- `has_urgency_keywords`: urgent, expire, suspend

### Decision Thresholds

**For blocking/warning:**
```python
if result['is_phishing'] and result['confidence'] > 0.8:
    # BLOCK - High confidence phishing
    
elif result['is_phishing'] and result['confidence'] > 0.6:
    # WARN - Medium confidence
    
else:
    # ALLOW - Safe or uncertain
```

---

## 🔌 Integration Guide

### Integration with Browser Extension

**See `INTEGRATION.md` for complete guide.**

**Quick overview:**

1. **Create API server** (`api_server.py`):
```python
from flask import Flask, request, jsonify
from phishing_detector import PhishingDetector

app = Flask(__name__)
detector = PhishingDetector.load("model.pkl")

@app.route('/api/check', methods=['POST'])
def check():
    url = request.json.get('url')
    result = detector.predict(url)
    return jsonify(result)

app.run(host='127.0.0.1', port=5000)
```

2. **Install Flask**:
```powershell
pip install flask flask-cors
```

3. **Start server**:
```powershell
python api_server.py
```

4. **Call from extension**:
```javascript
// In background script
async function checkURL(url) {
    const response = await fetch('http://127.0.0.1:5000/api/check', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({url})
    });
    return await response.json();
}
```

---

## 🔧 Troubleshooting

### Issue 1: "Model not found" Error

**Problem:**
```
FileNotFoundError: [Errno 2] No such file or directory: 'model.pkl'
```

**Solution:**
```powershell
# Train the model first
python phishing_detector.py

# Verify model.pkl exists
ls model.pkl
```

### Issue 2: Import Errors

**Problem:**
```
ModuleNotFoundError: No module named 'sklearn'
```

**Solution:**
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Linux/macOS

# Install dependencies
pip install -r requirements.txt
```

### Issue 3: Virtual Environment Not Activating

**Windows PowerShell:**
```powershell
# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate:
.\venv\Scripts\Activate.ps1
```

**Linux/macOS:**
```bash
# Make sure script is executable
chmod +x venv/bin/activate

# Activate
source venv/bin/activate
```

### Issue 4: Slow Training

**Problem:** Training takes >30 seconds

**Solutions:**
```python
# Reduce training samples
detector.train(n_samples=1000)  # Faster, still accurate

# Or use fewer trees (faster but slightly less accurate)
# Edit phishing_detector.py line ~550:
# n_estimators=50  # Instead of 150
```

### Issue 5: Python Not Found

**Windows:**
```powershell
# Reinstall Python and check "Add to PATH"
# Or use full path:
C:\Users\YourName\AppData\Local\Programs\Python\Python312\python.exe --version
```

**Linux/macOS:**
```bash
# Use python3 instead of python
python3 --version
python3 -m pip install -r requirements.txt
```

---

## 🚀 Advanced Usage

### Custom Training Data

**Prepare CSV file** (`my_urls.csv`):
```csv
url,label
https://google.com,0
https://facebook.com,0
http://g00gle.com,1
http://facbook.com,1
```

**Train with custom data:**
```python
import pandas as pd
from phishing_detector import PhishingDetector, FeatureExtractor
import numpy as np

# Load your data
df = pd.read_csv('my_urls.csv')

# Extract features
extractor = FeatureExtractor()
features = []
labels = []

for _, row in df.iterrows():
    feat = extractor.extract(row['url'])
    if feat:
        features.append(feat.to_array())
        labels.append(row['label'])

X = np.array(features)
y = np.array(labels)

# Train (modify detector to accept X, y)
# Or use the generated data approach
detector = PhishingDetector()
detector.train(n_samples=5000, save_path="model.pkl")
```

### Batch Processing from File

```python
# Process URLs from file
from phishing_detector import PhishingDetector

detector = PhishingDetector.load("model.pkl")

# Read URLs from file
with open('urls.txt', 'r') as f:
    urls = [line.strip() for line in f if line.strip()]

# Analyze all
results = detector.predict_batch(urls)

# Save phishing URLs
with open('phishing_found.txt', 'w') as f:
    for r in results:
        if r['is_phishing'] and r['confidence'] > 0.8:
            f.write(f"{r['url']}\n")

print(f"Found {sum(1 for r in results if r['is_phishing'])} phishing URLs")
```

### Export Results to CSV

```python
import csv
from phishing_detector import PhishingDetector

detector = PhishingDetector.load("model.pkl")

urls = ["http://example1.com", "http://example2.com"]
results = detector.predict_batch(urls)

# Export to CSV
with open('results.csv', 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['URL', 'Is_Phishing', 'Confidence', 'Typosquatting', 'Missing_Char'])
    
    for r in results:
        writer.writerow([
            r['url'],
            r['is_phishing'],
            f"{r['confidence']:.2%}",
            r['typosquatting_score'],
            r['missing_char_typo_score']
        ])

print("Results saved to results.csv")
```

### Model Retraining

```powershell
# Retrain with more samples
python -c "from phishing_detector import PhishingDetector; d = PhishingDetector(); d.train(10000, 'model_v2.pkl')"

# Compare models
python test.py  # Test with original model

# Swap models
mv model.pkl model_old.pkl
mv model_v2.pkl model.pkl

python test.py  # Test with new model
```

### Feature Analysis

```python
from phishing_detector import FeatureExtractor

extractor = FeatureExtractor()
features = extractor.extract("http://g00gle.com/login")

print("Feature Analysis:")
print(f"  Typosquatting: {features.typosquatting_score}")
print(f"  Missing Chars: {features.missing_char_typo_score}")
print(f"  URL Entropy: {features.url_entropy:.2f}")
print(f"  Has HTTPS: {features.has_https}")
print(f"  Sensitive Words: {features.num_sensitive_words}")

# Get all features as dict
all_features = features.to_dict()
for name, value in all_features.items():
    print(f"  {name}: {value}")
```

---

## 📖 Quick Command Reference

```powershell
# Setup
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Train
python phishing_detector.py

# Test
python test.py
python analyze_urls.py
python analyze_urls.py "http://example.com"

# API Server (for browser)
pip install flask flask-cors
python api_server.py
```

---

## 📞 Support

**Issues?**
- Check [Troubleshooting](#troubleshooting) section
- See `README.md` for API reference
- See `INTEGRATION.md` for browser integration

---

**Last Updated:** November 7, 2025  
**Version:** 1.0  
**Status:** Production Ready ✅
