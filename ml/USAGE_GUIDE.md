# PRISM ML - Complete Usage Guide

**Step-by-Step Guide for Training and Using the Phishing Detection Model**

---

## 📋 Table of Contents

1. [First Time Setup](#first-time-setup)
2. [Quick Start](#quick-start)
3. [Training the Model](#training-the-model)
4. [Testing Predictions](#testing-predictions)
5. [Using with Your Own Data](#using-with-your-own-data)
6. [Advanced Usage](#advanced-usage)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 First Time Setup

### Step 1: Navigate to ML Directory

```powershell
# Open PowerShell and go to the ml folder
cd C:\Users\msi\Downloads\PRISM\ml
```

### Step 2: Run Setup Script

```powershell
# This will create virtual environment and install all dependencies
.\setup.ps1
```

**What this does:**
- ✅ Creates Python virtual environment
- ✅ Installs all required packages (scikit-learn, pandas, etc.)
- ✅ Creates `.env` configuration file
- ✅ Sets up directory structure

**Expected output:**
```
========================================
PRISM ML Environment Setup
========================================

Checking Python version...
Found: Python 3.x.x

Creating virtual environment...
Virtual environment created

Installing dependencies...
This may take a few minutes...

Setup Complete!
```

### Step 3: Activate Virtual Environment (if needed)

```powershell
# Activate the environment
.\venv\Scripts\Activate

# You should see (venv) in your terminal
```

---

## ⚡ Quick Start

### Run Complete Training (Easiest Way)

```powershell
# Train model with auto-generated sample data
python train.py
```

**What happens:**
1. 🔄 Generates 2,000 sample URLs (1,000 legitimate, 1,000 phishing)
2. 🔍 Extracts 28 features from each URL
3. 🧠 Trains ensemble model (Random Forest + Logistic Regression)
4. 📊 Evaluates performance
5. 💾 Saves model to `models/phishing_detector.joblib`
6. 📄 Creates training report in `models/`

**Expected output:**
```
========================================
PRISM ML Pipeline - Phishing Detection Training
========================================

Loading data from C:\...\ml\data\raw\phishing_urls.csv
Loaded 2000 rows from CSV
Extracting features from 2000 URLs...
Processing batch 1/2
Processing batch 2/2
Feature extraction complete. Shape: (2000, 28)

Training ensemble model...
Training complete! Training accuracy: 0.9856

Evaluating model...
Accuracy:  0.9550
Precision: 0.9432
Recall:    0.9680
F1 Score:  0.9555
AUC-ROC:   0.9889

✅ TRAINING SUCCESSFUL!

📊 Model Performance:
   Accuracy:  0.9550
   Precision: 0.9432
   Recall:    0.9680
   F1 Score:  0.9555

💾 Model saved to: models\phishing_detector.joblib
📄 Report saved to: models\training_report_20251104_143022.json
⏱️  Training time: 12.34 seconds
```

---

## 🧪 Testing Predictions

### Test the Trained Model

```powershell
# Run prediction tests
python test_predictions.py
```

**What happens:**
- Loads the trained model
- Tests on 6 sample URLs (3 legitimate, 3 phishing)
- Shows predictions with confidence scores

**Expected output:**
```
========================================
PRISM ML - Phishing Detection Test
========================================

Loading trained model...
✅ Model loaded successfully

Testing model predictions:

URL: https://www.google.com
Expected: Legitimate (Expected)
Prediction: ✅ Legitimate (94.2% confidence)
Probabilities: [Legitimate: 0.942, Phishing: 0.058]
------------------------------------------------------------

URL: http://secure-paypal-login.suspicious.tk
Expected: Phishing (Expected)
Prediction: 🚨 Phishing (97.8% confidence)
Probabilities: [Legitimate: 0.022, Phishing: 0.978]
------------------------------------------------------------
```

---

## 📊 Training the Model

### Option 1: Train with Sample Data (Recommended for Testing)

```powershell
# Auto-generate and train
python train.py
```

### Option 2: Train with Your Own Data

#### Step 1: Prepare Your Data File

Create a CSV file with these columns:
- `url`: The URL to analyze
- `label`: 0 for legitimate, 1 for phishing

**Example CSV (`data/raw/my_phishing_data.csv`):**
```csv
url,label
https://www.google.com,0
https://github.com/login,0
http://g00gle.com/verify,1
http://paypal-secure.tk/login,1
```

#### Step 2: Train with Your Data

```powershell
# Method 1: Edit train.py and change the path
# Open train.py and modify the pipeline.run() call

# Method 2: Use Python directly
python -c "from src.training.train_pipeline import TrainingPipeline; pipeline = TrainingPipeline(); pipeline.run('data/raw/my_phishing_data.csv')"
```

#### Step 3: Custom Training Script

Create a file `my_training.py`:

```python
from src.training.train_pipeline import TrainingPipeline

# Initialize pipeline
pipeline = TrainingPipeline(
    model_type="ensemble",  # Options: ensemble, random_forest, logistic_regression
    use_sample_data=False   # Set to False to use your own data
)

# Run training
results = pipeline.run(
    data_path="data/raw/my_phishing_data.csv",
    save_model=True,
    generate_report=True
)

# Print results
if results["success"]:
    print(f"\n✅ Training successful!")
    print(f"Accuracy: {results['test_metrics']['accuracy']:.4f}")
    print(f"Model saved to: {results['model_path']}")
else:
    print(f"❌ Training failed: {results['error']}")
```

Run it:
```powershell
python my_training.py
```

---

## 🔍 Using with Your Own Data

### Generate More Sample Data

```python
# generate_data.py
from src.utils.sample_data_generator import SampleDataGenerator

generator = SampleDataGenerator()

# Generate 5000 URLs (50% phishing)
df = generator.generate_dataset(n_samples=5000, phishing_ratio=0.5)

# Save to CSV
df.to_csv("data/raw/phishing_5000.csv", index=False)
print("✅ Generated 5000 sample URLs")
```

Run it:
```powershell
python generate_data.py
```

### Analyze a Single URL

```python
# analyze_url.py
from src.models.phishing_detector import PhishingDetector
from src.features.url_features import URLFeatureExtractor

# Load model
detector = PhishingDetector.load("phishing_detector")
extractor = URLFeatureExtractor()

# Test URL
url = "http://secure-account-verify.suspicious.tk"

# Extract features
features = extractor.extract(url)

if features:
    # Make prediction
    X = [features.to_list()]
    prediction = detector.predict(X)[0]
    probabilities = detector.predict_proba(X)[0]
    
    # Show results
    print(f"\nURL: {url}")
    if prediction == 1:
        print(f"🚨 PHISHING DETECTED!")
        print(f"Confidence: {probabilities[1]:.1%}")
    else:
        print(f"✅ Legitimate")
        print(f"Confidence: {probabilities[0]:.1%}")
    
    # Show key features
    print(f"\nKey Features:")
    print(f"  URL Length: {features.url_length}")
    print(f"  Has HTTPS: {features.has_https}")
    print(f"  URL Entropy: {features.url_entropy}")
    print(f"  Suspicious TLD: {features.is_suspicious_tld}")
    print(f"  Sensitive Words: {features.num_sensitive_words}")
```

Run it:
```powershell
python analyze_url.py
```

### Batch Analysis

```python
# analyze_batch.py
from src.models.phishing_detector import PhishingDetector
from src.features.url_features import URLFeatureExtractor
import pandas as pd

# Load model
detector = PhishingDetector.load("phishing_detector")
extractor = URLFeatureExtractor()

# List of URLs to analyze
urls = [
    "https://www.google.com",
    "https://github.com",
    "http://g00gle.com",
    "http://paypal-verify.tk",
    "http://192.168.1.1/login",
]

# Extract features for all URLs
print("Extracting features...")
features_list = extractor.extract_batch(urls)

# Prepare data
X = [f.to_list() for f in features_list if f is not None]

# Predict
print("Making predictions...")
predictions = detector.predict(X)
probabilities = detector.predict_proba(X)

# Create results DataFrame
results = pd.DataFrame({
    'URL': urls,
    'Prediction': ['Phishing' if p == 1 else 'Legitimate' for p in predictions],
    'Phishing_Probability': [prob[1] for prob in probabilities],
    'Confidence': [max(prob) for prob in probabilities]
})

# Display results
print("\nResults:")
print(results.to_string(index=False))

# Save to CSV
results.to_csv("analysis_results.csv", index=False)
print("\n✅ Results saved to analysis_results.csv")
```

Run it:
```powershell
python analyze_batch.py
```

---

## 🎯 Advanced Usage

### Configure Model Parameters

Edit `.env` file:

```bash
# Model Configuration
MODEL_TYPE=ensemble          # Options: ensemble, random_forest, logistic_regression
N_ESTIMATORS=200            # More trees = better accuracy but slower (default: 100)
MAX_DEPTH=30                # Deeper trees = more complex patterns (default: 20)
CLASS_WEIGHT=balanced       # Handle imbalanced datasets

# Training
TEST_SIZE=0.2               # 20% for testing, 80% for training
RANDOM_STATE=42             # Seed for reproducibility

# Performance
N_JOBS=-1                   # Use all CPU cores
```

### Train Different Model Types

```python
# train_rf_only.py
from src.training.train_pipeline import TrainingPipeline

# Random Forest only
pipeline = TrainingPipeline(model_type="random_forest")
results = pipeline.run()
```

```python
# train_lr_only.py
from src.training.train_pipeline import TrainingPipeline

# Logistic Regression only
pipeline = TrainingPipeline(model_type="logistic_regression")
results = pipeline.run()
```

### Get Feature Importance

```python
# feature_importance.py
from src.models.phishing_detector import PhishingDetector

# Load model
detector = PhishingDetector.load("phishing_detector")

# Get top features
importance = detector.get_feature_importance(top_n=10)

print("\nTop 10 Most Important Features:")
for i, (feature, score) in enumerate(importance.items(), 1):
    print(f"{i:2d}. {feature:25s} {score:.4f}")
```

Run it:
```powershell
python feature_importance.py
```

**Expected output:**
```
Top 10 Most Important Features:
 1. url_entropy               0.1245
 2. domain_length             0.0987
 3. has_https                 0.0876
 4. num_sensitive_words       0.0765
 5. is_suspicious_tld         0.0654
 6. url_length                0.0543
 7. has_ip_address            0.0432
 8. domain_entropy            0.0321
 9. num_subdomains            0.0298
10. special_char_ratio        0.0287
```

### Extract Features Only

```python
# extract_features.py
from src.features.url_features import URLFeatureExtractor
import pandas as pd

extractor = URLFeatureExtractor()

url = "https://www.example.com/login?redirect=/account"
features = extractor.extract(url)

if features:
    # Convert to dictionary
    feature_dict = features.to_dict()
    
    # Display
    print("\nExtracted Features:")
    for name, value in feature_dict.items():
        print(f"  {name:25s} = {value}")
    
    # Save to CSV
    df = pd.DataFrame([feature_dict])
    df.to_csv("features.csv", index=False)
    print("\n✅ Features saved to features.csv")
```

### Load Cached Data

```python
# use_cache.py
from src.data.data_loader import DataLoader

loader = DataLoader()

# Try to load cached data
cached = loader.load_cached_data()

if cached:
    X_train, X_test, y_train, y_test = cached
    print(f"✅ Loaded cached data:")
    print(f"   Train: {X_train.shape}")
    print(f"   Test: {X_test.shape}")
else:
    print("❌ No cached data found. Run training first.")
```

---

## 🛠️ Common Commands Cheat Sheet

```powershell
# Setup (first time only)
.\setup.ps1

# Activate environment
.\venv\Scripts\Activate

# Train model with sample data
python train.py

# Test predictions
python test_predictions.py

# Generate sample data
python -c "from src.utils.sample_data_generator import SampleDataGenerator; SampleDataGenerator().save_sample_data(5000)"

# Train with your data
python -c "from src.training.train_pipeline import TrainingPipeline; TrainingPipeline().run('data/raw/yourfile.csv')"

# Get feature importance
python -c "from src.models.phishing_detector import PhishingDetector; d = PhishingDetector.load('phishing_detector'); print(d.get_feature_importance())"

# Check model info
python -c "from src.models.phishing_detector import PhishingDetector; import json; d = PhishingDetector.load('phishing_detector'); print(json.dumps(d.get_model_info(), indent=2))"

# Deactivate environment
deactivate
```

---

## 🐛 Troubleshooting

### Issue 1: "Model file not found"

**Error:**
```
FileNotFoundError: Model file not found: models\phishing_detector.joblib
```

**Solution:**
```powershell
# You need to train the model first
python train.py
```

---

### Issue 2: "ModuleNotFoundError"

**Error:**
```
ModuleNotFoundError: No module named 'src'
```

**Solution:**
```powershell
# Make sure you're in the ml directory
cd C:\Users\msi\Downloads\PRISM\ml

# Activate virtual environment
.\venv\Scripts\Activate

# Run the script
python train.py
```

---

### Issue 3: Virtual Environment Not Activated

**Problem:** Commands fail with import errors

**Solution:**
```powershell
# Activate environment (you should see (venv) in terminal)
.\venv\Scripts\Activate

# If activation script doesn't work, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

### Issue 4: "Data file not found"

**Error:**
```
FileNotFoundError: Data file not found
```

**Solution:**

**Option 1:** Use sample data (easiest)
```python
# train.py is already configured for this
python train.py
```

**Option 2:** Create your own data file
```csv
# Create data/raw/phishing_urls.csv with:
url,label
https://www.google.com,0
http://phishing-site.tk,1
```

---

### Issue 5: Low Accuracy

**Problem:** Model accuracy < 80%

**Solutions:**

1. **More training data** (recommended: >1000 samples)
```python
generator = SampleDataGenerator()
generator.save_sample_data(n_samples=5000)
```

2. **Balance your dataset** (equal phishing and legitimate)
```python
generator.generate_dataset(n_samples=2000, phishing_ratio=0.5)
```

3. **Tune hyperparameters** (edit `.env`)
```bash
N_ESTIMATORS=200
MAX_DEPTH=30
```

---

### Issue 6: Slow Training

**Problem:** Training takes too long

**Solutions:**

1. **Use all CPU cores** (edit `.env`)
```bash
N_JOBS=-1
```

2. **Reduce estimators** (edit `.env`)
```bash
N_ESTIMATORS=50
```

3. **Use simpler model**
```python
pipeline = TrainingPipeline(model_type="logistic_regression")
```

---

## 📚 Example Workflows

### Workflow 1: First Time User

```powershell
# 1. Setup
cd C:\Users\msi\Downloads\PRISM\ml
.\setup.ps1

# 2. Train
python train.py

# 3. Test
python test_predictions.py

# Done! Model is ready to use
```

---

### Workflow 2: Using Your Own Data

```powershell
# 1. Prepare your CSV file
# Create data/raw/my_data.csv with url and label columns

# 2. Activate environment
.\venv\Scripts\Activate

# 3. Train with your data
python

>>> from src.training.train_pipeline import TrainingPipeline
>>> pipeline = TrainingPipeline()
>>> results = pipeline.run("data/raw/my_data.csv")
>>> print(f"Accuracy: {results['test_metrics']['accuracy']:.4f}")
>>> exit()

# 4. Test
python test_predictions.py
```

---

### Workflow 3: Analyze URLs in Production

```powershell
# 1. Create analysis script
# Save as analyze_urls.py

from src.models.phishing_detector import PhishingDetector
from src.features.url_features import URLFeatureExtractor

detector = PhishingDetector.load("phishing_detector")
extractor = URLFeatureExtractor()

def check_url(url):
    features = extractor.extract(url)
    if features:
        X = [features.to_list()]
        pred = detector.predict(X)[0]
        prob = detector.predict_proba(X)[0]
        return "Phishing" if pred == 1 else "Safe", prob[pred]
    return "Error", 0.0

# Test
url = input("Enter URL: ")
result, confidence = check_url(url)
print(f"{result} ({confidence:.1%} confidence)")

# 2. Run it
python analyze_urls.py
```

---

## 💡 Tips & Best Practices

### 1. Always Use Virtual Environment
```powershell
# Before running any Python command:
.\venv\Scripts\Activate
```

### 2. Check Logs
```powershell
# View training logs
cat logs\ml_pipeline_*.log
```

### 3. Save Your Models
```python
# Use descriptive names
detector.save("phishing_detector_v1_20251104")
```

### 4. Validate Your Data
```python
# Check your CSV before training
import pandas as pd
df = pd.read_csv("data/raw/my_data.csv")
print(df.head())
print(df['label'].value_counts())  # Should be balanced
```

### 5. Monitor Performance
```python
# Check all metrics, not just accuracy
print(f"Precision: {results['test_metrics']['precision']:.4f}")  # Low false positives
print(f"Recall: {results['test_metrics']['recall']:.4f}")       # Catch phishing
print(f"F1 Score: {results['test_metrics']['f1_score']:.4f}")   # Overall balance
```

---

## 🎓 Next Steps

1. ✅ **Complete setup** - Run `setup.ps1`
2. ✅ **Train your first model** - Run `python train.py`
3. ✅ **Test predictions** - Run `python test_predictions.py`
4. 📋 **Use with real data** - Prepare your CSV and train
5. 📋 **Integrate with extension** - Phase 5 (coming next)

---

**Questions? Check the main README.md or IMPLEMENTATION_SUMMARY.md for more details.**

Happy phishing detection! 🎣🚫
