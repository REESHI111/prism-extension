# PRISM ML Module - Phishing Detection with Machine Learning

**Phase 4: Machine Learning Foundation**  
High-quality, production-ready ML pipeline for phishing URL detection.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Guide](#usage-guide)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The PRISM ML module implements a robust machine learning pipeline for detecting phishing URLs. It uses an ensemble approach combining Random Forest and Logistic Regression classifiers to achieve high accuracy with low false positives.

### Key Capabilities

- **28 engineered features** extracted from URLs
- **Ensemble learning** (Random Forest + Logistic Regression)
- **SMOTE balancing** for handling class imbalance
- **Feature normalization** with StandardScaler
- **Comprehensive evaluation** metrics and reporting
- **Model persistence** with joblib
- **TensorFlow.js export** for browser deployment (planned)

### Performance Targets

- **Accuracy**: >95%
- **Precision**: >93% (minimize false positives)
- **Recall**: >90% (catch most phishing URLs)
- **F1 Score**: >92%
- **Inference Time**: <100ms per URL

---

## ✨ Features

### 1. Feature Extraction (28 Features)

#### Basic URL Structure (10 features)
- `url_length`: Total character count
- `domain_length`: Domain name length
- `path_length`: URL path length
- `has_https`: HTTPS protocol indicator
- `has_ip_address`: IP address instead of domain
- `num_dots`, `num_hyphens`, `num_underscores`: Special character counts
- `num_slashes`: Path depth indicator
- `num_digits`: Digit count in URL

#### Domain Analysis (6 features)
- `num_subdomains`: Subdomain count
- `tld_length`: Top-level domain length
- `is_suspicious_tld`: Suspicious TLD detector (.tk, .ml, etc.)
- `has_www`: WWW prefix indicator
- `domain_has_digits`: Numbers in domain
- `subdomain_count`: Subdomain parts

#### Content Patterns (6 features)
- `num_query_params`: Query parameter count
- `query_length`: Query string length
- `has_at_symbol`: @ symbol presence (phishing indicator)
- `has_double_slash_redirect`: // redirect pattern
- `num_sensitive_words`: Sensitive keywords count
- `num_external_links`: External link count (future)

#### Statistical Features (6 features)
- `url_entropy`: Shannon entropy (randomness measure)
- `domain_entropy`: Domain randomness
- `path_entropy`: Path randomness
- `special_char_ratio`: Special character ratio
- `digit_ratio`: Digit to character ratio
- `vowel_ratio`: Vowel distribution

### 2. Model Architecture

**Ensemble Voting Classifier**
```
Ensemble
├── Random Forest (n_estimators=100, max_depth=20)
│   ├── High accuracy on complex patterns
│   └── Feature importance extraction
└── Logistic Regression (max_iter=1000)
    ├── Fast inference
    └── Probabilistic predictions
```

### 3. Data Pipeline

1. **Loading**: CSV/JSON support with validation
2. **Cleaning**: Duplicate removal, null handling, format validation
3. **Feature Extraction**: Batch processing with progress tracking
4. **Balancing**: SMOTE for class balance
5. **Splitting**: Stratified train/test split (80/20)
6. **Caching**: NPZ format for faster subsequent loads

### 4. Training Pipeline

Automated 6-step workflow:
1. Data preparation and validation
2. Model training with progress logging
3. Comprehensive evaluation
4. Feature importance analysis
5. Model persistence (joblib)
6. JSON report generation

---

## 🏗️ Architecture

```
ml/
├── src/
│   ├── config/
│   │   └── config.py          # Configuration management
│   ├── data/
│   │   └── data_loader.py     # Data loading and preprocessing
│   ├── features/
│   │   └── url_features.py    # Feature extraction (28 features)
│   ├── models/
│   │   └── phishing_detector.py # Ensemble model implementation
│   ├── training/
│   │   └── train_pipeline.py  # Training orchestration
│   ├── export/
│   │   └── tfjs_exporter.py   # TensorFlow.js export (planned)
│   ├── evaluation/
│   │   └── metrics.py         # Evaluation metrics (planned)
│   └── utils/
│       ├── logger.py          # Logging system
│       └── sample_data_generator.py # Test data generation
├── data/
│   ├── raw/                   # Raw datasets
│   └── processed/             # Processed/cached data
├── models/                    # Trained models (.joblib)
├── logs/                      # Training logs
├── requirements.txt           # Python dependencies
├── .env.example               # Configuration template
└── README.md                  # This file
```

---

## 📦 Installation

### Prerequisites

- Python 3.8+
- pip package manager
- Virtual environment (recommended)

### Step 1: Create Virtual Environment

```powershell
# Navigate to ml directory
Set-Location ml

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Upgrade pip
python -m pip install --upgrade pip
```

### Step 2: Install Dependencies

```powershell
# Install all required packages
pip install -r requirements.txt
```

### Step 3: Configure Environment

```powershell
# Copy environment template
Copy-Item .env.example .env

# Edit .env file with your settings (optional)
# Default settings work for most use cases
```

---

## 🚀 Quick Start

### Generate Sample Data and Train Model

```python
# train_quick.py
from src.training.train_pipeline import TrainingPipeline

# Initialize pipeline
pipeline = TrainingPipeline(
    model_type="ensemble",
    use_sample_data=True  # Auto-generate sample data
)

# Run training
results = pipeline.run()

# Print results
print(f"Accuracy: {results['test_metrics']['accuracy']:.4f}")
print(f"Model saved to: {results['model_path']}")
```

Run it:
```powershell
python train_quick.py
```

### Test Trained Model

```python
# test_model.py
from src.models.phishing_detector import PhishingDetector
from src.features.url_features import URLFeatureExtractor

# Load trained model
detector = PhishingDetector.load("phishing_detector")

# Extract features from URL
extractor = URLFeatureExtractor()
features = extractor.extract("http://secure-paypal-login.suspicious.tk")

# Make prediction
if features:
    X = [features.to_list()]
    prediction = detector.predict(X)[0]
    probability = detector.predict_proba(X)[0]
    
    print(f"Prediction: {'Phishing' if prediction == 1 else 'Legitimate'}")
    print(f"Confidence: {probability[prediction]:.2%}")
```

---

## 📖 Usage Guide

### 1. Training with Custom Data

```python
from src.training.train_pipeline import TrainingPipeline

# Your CSV must have 'url' and 'label' columns
# label: 0 = legitimate, 1 = phishing

pipeline = TrainingPipeline(model_type="ensemble")
results = pipeline.run(
    data_path="data/raw/my_phishing_dataset.csv",
    save_model=True,
    generate_report=True
)
```

### 2. Manual Training Steps

```python
from src.data.data_loader import DataLoader
from src.models.phishing_detector import PhishingDetector

# Load and prepare data
loader = DataLoader()
X_train, X_test, y_train, y_test = loader.load_and_split(
    "data/raw/phishing_urls.csv",
    balance=True
)

# Train model
detector = PhishingDetector(model_type="ensemble")
detector.train(X_train, y_train, feature_names=loader.get_feature_names())

# Evaluate
metrics = detector.evaluate(X_test, y_test)
print(f"Test Accuracy: {metrics['accuracy']:.4f}")

# Save model
detector.save("my_phishing_model")
```

### 3. Feature Extraction Only

```python
from src.features.url_features import URLFeatureExtractor

extractor = URLFeatureExtractor()

# Single URL
url = "https://www.example.com/login?redirect=/account"
features = extractor.extract(url)

print(f"URL Length: {features.url_length}")
print(f"Has HTTPS: {features.has_https}")
print(f"URL Entropy: {features.url_entropy}")

# Batch processing
urls = ["url1", "url2", "url3", ...]
features_list = extractor.extract_batch(urls)
```

### 4. Load and Use Trained Model

```python
from src.models.phishing_detector import PhishingDetector
from src.features.url_features import URLFeatureExtractor

# Load model
detector = PhishingDetector.load("phishing_detector")

# Prepare URL
extractor = URLFeatureExtractor()
url = "http://paypal-secure.suspicious-domain.com"
features = extractor.extract(url)

# Predict
X = [features.to_list()]
prediction = detector.predict(X)[0]
probabilities = detector.predict_proba(X)[0]

print(f"Phishing Probability: {probabilities[1]:.2%}")
```

---

## 🔧 Configuration

### Environment Variables (.env)

```bash
# Data Paths
RAW_DATA_PATH=./data/raw/phishing_urls.csv
PROCESSED_DATA_PATH=./data/processed/processed_data.npz

# Model Configuration
MODEL_TYPE=ensemble  # Options: ensemble, random_forest, logistic_regression
RANDOM_STATE=42
TEST_SIZE=0.2

# Training Configuration
N_ESTIMATORS=100     # Number of trees in Random Forest
MAX_DEPTH=20         # Maximum tree depth
CLASS_WEIGHT=balanced # Handle class imbalance

# Feature Extraction
MAX_URL_LENGTH=200
USE_CACHE=true

# Logging
LOG_LEVEL=INFO       # DEBUG, INFO, WARNING, ERROR, CRITICAL

# Performance
N_JOBS=-1            # -1 = use all CPU cores
```

### Programmatic Configuration

```python
from src.config.config import get_config

config = get_config()

# Access configuration
print(config.model.n_estimators)
print(config.paths.models_dir)
print(config.features.max_url_length)

# Modify configuration
config.model.n_estimators = 200
config.model.max_depth = 30
```

---

## 🛠️ Development

### Running Tests

```powershell
# Install testing dependencies
pip install pytest pytest-cov

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html
```

### Code Quality

```powershell
# Format code
black src/

# Lint code
flake8 src/

# Type checking
mypy src/
```

### Generate Sample Data

```python
from src.utils.sample_data_generator import SampleDataGenerator

generator = SampleDataGenerator()
df = generator.generate_dataset(n_samples=5000, phishing_ratio=0.5)
df.to_csv("data/raw/sample_phishing_5000.csv", index=False)
```

---

## 🚀 Deployment

### Export Model for Browser (TensorFlow.js)

```python
# Planned feature
from src.export.tfjs_exporter import TFJSExporter

exporter = TFJSExporter()
exporter.export_model(
    model_path="models/phishing_detector.joblib",
    output_dir="models/tfjs"
)
```

### Integration with Extension

```typescript
// In browser extension
import * as tf from '@tensorflow/tfjs';

// Load model
const model = await tf.loadLayersModel('models/tfjs/model.json');

// Extract features (implement feature extraction in TypeScript)
const features = extractFeatures(url);

// Predict
const prediction = model.predict(features);
const isPhishing = prediction.dataSync()[1] > 0.5;
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Import Errors

**Problem**: `ModuleNotFoundError: No module named 'src'`

**Solution**: Run scripts from the `ml/` directory and ensure virtual environment is activated.

```powershell
Set-Location ml
.\venv\Scripts\Activate
python -m src.training.train_pipeline
```

#### 2. Data File Not Found

**Problem**: `FileNotFoundError: Data file not found`

**Solution**: Use sample data generator or provide valid data path.

```python
pipeline = TrainingPipeline(use_sample_data=True)
results = pipeline.run()
```

#### 3. Memory Issues with Large Datasets

**Problem**: `MemoryError` during training

**Solution**: Use batch processing and reduce dataset size.

```python
config.features.batch_size = 500  # Smaller batches
```

#### 4. Low Model Accuracy

**Problem**: Model accuracy <80%

**Solutions**:
- Ensure data quality (balanced classes, clean URLs)
- Increase training data size (>1000 samples)
- Tune hyperparameters (n_estimators, max_depth)
- Check feature extraction (valid URLs)

---

## 📊 Performance Benchmarks

### Training Performance

- **2000 samples**: ~10-15 seconds
- **10000 samples**: ~30-45 seconds
- **50000 samples**: ~2-3 minutes

### Inference Performance

- **Single URL**: <10ms
- **Batch (100 URLs)**: <100ms
- **Batch (1000 URLs)**: <500ms

### Model Size

- **Joblib file**: ~2-5 MB
- **TensorFlow.js**: ~1-3 MB (planned)

---

## 📝 License

Part of PRISM Privacy Extension - Academic Project

---

## 🤝 Contributing

This is an academic project. For contributions or suggestions:

1. Document all changes thoroughly
2. Follow existing code style (Black, flake8)
3. Add comprehensive docstrings
4. Include unit tests
5. Update README with new features

---

## 📞 Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review code documentation (docstrings)
- Check logs in `logs/` directory

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Phase**: 4 - ML Foundation
