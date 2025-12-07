# 🤖 Machine Learning System - Complete Implementation Plan

**Project:** PRISM Privacy Extension  
**Phase:** 4-5 (ML Foundation & Integration)  
**Created:** December 7, 2025  
**Status:** Planning Phase

---

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [ML Model Selection](#ml-model-selection)
3. [Architecture Overview](#architecture-overview)
4. [Data Pipeline](#data-pipeline)
5. [Feature Engineering](#feature-engineering)
6. [Model Training](#model-training)
7. [Browser Integration](#browser-integration)
8. [Performance Optimization](#performance-optimization)
9. [Quality Metrics](#quality-metrics)
10. [Timeline & Milestones](#timeline--milestones)

---

## 📊 Executive Summary

### Objective
Build a lightweight, accurate, browser-based phishing detection system using machine learning that:
- Detects phishing URLs with >95% accuracy
- Runs entirely in-browser (no API calls)
- Infers in <10ms per URL
- Has model size <100 KB
- Works offline
- Is explainable to users

### Approach
**Ensemble Learning** combining multiple lightweight models:
- **Random Forest** (primary classifier - high accuracy)
- **Logistic Regression** (fast, interpretable backup)
- **XGBoost** (gradient boosting for edge cases)
- **Voting Ensemble** (combines all three)

### Key Innovation
Convert Python-trained models to **JavaScript-compatible JSON format** for direct browser execution without TensorFlow.js overhead.

---

## 🎯 ML Model Selection

### Selected Models & Rationale

#### 1. **Random Forest (Primary Model)**
```python
Model: RandomForestClassifier
Library: scikit-learn
```

**Why Random Forest:**
- ✅ **High Accuracy:** Consistently achieves 95-98% on URL classification
- ✅ **Feature Importance:** Easily explainable (which features detected threat)
- ✅ **Robust:** Handles overfitting well with ensemble of trees
- ✅ **No Hyperparameter Sensitivity:** Works well with default params
- ✅ **Browser Compatible:** Tree structure easily serialized to JSON

**Configuration:**
```python
RandomForestClassifier(
    n_estimators=100,        # 100 decision trees
    max_depth=15,            # Limit depth to prevent overfitting
    min_samples_split=10,    # Require 10 samples to split
    min_samples_leaf=5,      # Minimum 5 samples per leaf
    max_features='sqrt',     # Square root of features at each split
    random_state=42,         # Reproducible results
    n_jobs=-1                # Use all CPU cores
)
```

**Expected Performance:**
- Accuracy: 96-98%
- Precision: 94-96%
- Recall: 95-97%
- F1 Score: 95-97%
- Inference Time: ~5ms (100 trees)
- Model Size: ~80 KB (JSON)

---

#### 2. **Logistic Regression (Fast Backup)**
```python
Model: LogisticRegression
Library: scikit-learn
```

**Why Logistic Regression:**
- ✅ **Ultra-Fast:** <1ms inference time
- ✅ **Lightweight:** ~5 KB model size
- ✅ **Interpretable:** Clear coefficient weights
- ✅ **Linear Baseline:** Good for simple patterns
- ✅ **Fallback Model:** If Random Forest too slow

**Configuration:**
```python
LogisticRegression(
    penalty='l2',            # L2 regularization
    C=1.0,                   # Regularization strength
    solver='lbfgs',          # Optimization algorithm
    max_iter=1000,           # Convergence iterations
    random_state=42
)
```

**Expected Performance:**
- Accuracy: 88-92%
- Precision: 85-90%
- Recall: 90-93%
- F1 Score: 88-91%
- Inference Time: <1ms
- Model Size: ~5 KB

---

#### 3. **XGBoost (Gradient Boosting)**
```python
Model: XGBClassifier
Library: xgboost
```

**Why XGBoost:**
- ✅ **State-of-the-Art:** Often highest accuracy
- ✅ **Handles Imbalance:** Good with imbalanced datasets
- ✅ **Feature Engineering:** Automatically finds interactions
- ✅ **Regularization:** Built-in L1/L2 regularization
- ✅ **Ensemble Alternative:** Different approach than Random Forest

**Configuration:**
```python
XGBClassifier(
    n_estimators=100,        # 100 boosting rounds
    max_depth=8,             # Shallower trees than RF
    learning_rate=0.1,       # Step size shrinkage
    subsample=0.8,           # 80% sample per tree
    colsample_bytree=0.8,    # 80% features per tree
    gamma=0.1,               # Minimum loss reduction
    reg_alpha=0.1,           # L1 regularization
    reg_lambda=1.0,          # L2 regularization
    random_state=42
)
```

**Expected Performance:**
- Accuracy: 96-98%
- Precision: 95-97%
- Recall: 94-96%
- F1 Score: 95-97%
- Inference Time: ~8ms
- Model Size: ~70 KB

---

#### 4. **Voting Ensemble (Final Model)**
```python
Model: VotingClassifier
Strategy: Soft voting (probability averaging)
```

**Why Ensemble:**
- ✅ **Best of All Worlds:** Combines strengths of all models
- ✅ **Higher Accuracy:** Typically 1-2% better than single models
- ✅ **Reduced Overfitting:** Different models compensate for each other
- ✅ **Confidence Scores:** Averaged probabilities more reliable

**Configuration:**
```python
VotingClassifier(
    estimators=[
        ('rf', random_forest),      # Weight: 0.5 (primary)
        ('xgb', xgboost),          # Weight: 0.3 (secondary)
        ('lr', logistic_regression) # Weight: 0.2 (backup)
    ],
    voting='soft',    # Average probabilities
    weights=[0.5, 0.3, 0.2]
)
```

**Expected Performance:**
- Accuracy: **97-99%** ⭐
- Precision: **96-98%**
- Recall: **95-97%**
- F1 Score: **96-98%**
- Inference Time: ~15ms (all models)
- Model Size: ~150 KB (all models)

---

### ❌ Models NOT Used & Why

#### Deep Learning (Neural Networks)
**Why NOT:**
- ❌ Model size too large (>1 MB)
- ❌ Requires TensorFlow.js (adds 500 KB)
- ❌ Slower inference (>50ms)
- ❌ Harder to explain to users
- ❌ Overkill for URL classification

#### Naive Bayes
**Why NOT:**
- ❌ Lower accuracy (75-85%)
- ❌ Assumes feature independence (not true for URLs)
- ❌ Poor performance on complex patterns

#### Support Vector Machines (SVM)
**Why NOT:**
- ❌ Slow inference with large datasets
- ❌ Difficult to serialize for browser
- ❌ Memory intensive
- ❌ Not interpretable

---

## 🏗️ Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     PRISM Extension                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Content Script (Page Level)                 │  │
│  │  • URL capture                                        │  │
│  │  • Page metadata extraction                           │  │
│  │  • Send to background worker                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Background Service Worker (ML Engine)           │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Feature Extraction (TypeScript)               │  │  │
│  │  │  • URL parsing (30+ features)                  │  │  │
│  │  │  • Domain analysis                              │  │  │
│  │  │  • Pattern detection                            │  │  │
│  │  │  • Brand matching                               │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                          ↓                             │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  ML Inference Engine (TypeScript)              │  │  │
│  │  │  • Random Forest inference                     │  │  │
│  │  │  • XGBoost inference                           │  │  │
│  │  │  • Logistic Regression inference               │  │  │
│  │  │  • Ensemble voting                             │  │  │
│  │  │  • Confidence scoring                          │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                          ↓                             │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Threat Detection & Response                   │  │  │
│  │  │  • Risk classification                         │  │  │
│  │  │  • Warning trigger (if phishing)               │  │  │
│  │  │  • Stats tracking                              │  │  │
│  │  │  • User notification                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Warning Overlay (Critical Only)             │  │
│  │  • Full-screen warning if phishing detected           │  │
│  │  • Show ML confidence score                           │  │
│  │  • Display detection reasons                          │  │
│  │  • User can proceed or go back                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Python Training Pipeline                    │
│                     (Offline, One-Time)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Data Collection → Feature Engineering → Model Training     │
│                                                              │
│  • PhishTank API    • 30+ URL features  • Random Forest     │
│  • OpenPhish feed   • Domain features   • XGBoost           │
│  • Tranco top 1M    • Lexical features  • Logistic Reg      │
│  • Manual labels    • Brand database    • Ensemble          │
│                                                              │
│  Model Export → JSON Format → Load in Extension             │
│                                                              │
│  • Tree structures  • Model weights     • Feature scaler    │
│  • Brand list       • Thresholds        • Metadata          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Pipeline

### Phase 1: Data Collection

#### Phishing URLs (Malicious Class)
**Target:** 10,000+ verified phishing URLs

**Sources:**
1. **PhishTank API** (Primary Source)
   ```python
   # 5,000+ verified phishing URLs
   URL: https://www.phishtank.com/developer_info.php
   Format: CSV/JSON
   Update: Daily
   Quality: Community verified
   ```

2. **OpenPhish Feed** (Secondary Source)
   ```python
   # 3,000+ active phishing URLs
   URL: https://openphish.com/feed.txt
   Format: Text file
   Update: Hourly
   Quality: Automated detection
   ```

3. **Manual Collection** (Supplementary)
   ```python
   # 2,000+ URLs from:
   - Anti-Phishing Working Group (APWG)
   - Google Safe Browsing reports
   - Security research papers
   - Bug bounty reports
   ```

**Verification Process:**
- ✅ Cross-reference with multiple sources
- ✅ Manual inspection of suspicious entries
- ✅ Remove dead/taken-down URLs
- ✅ Check for duplicates
- ✅ Verify still accessible (for feature extraction)

---

#### Legitimate URLs (Benign Class)
**Target:** 10,000+ verified legitimate URLs

**Sources:**
1. **Tranco Top 1M** (Primary Source)
   ```python
   # 8,000+ popular legitimate sites
   URL: https://tranco-list.eu/
   Selection: Top 10,000 domains
   Quality: Research-backed ranking
   Categories: News, e-commerce, social, banking, education
   ```

2. **Alexa/Umbrella Rankings** (Secondary)
   ```python
   # 2,000+ additional legitimate sites
   - Fortune 500 company websites
   - Government websites (.gov, .edu)
   - Established e-commerce platforms
   - Major social media platforms
   ```

**Verification Process:**
- ✅ Active for >5 years
- ✅ Valid SSL certificate
- ✅ High domain authority
- ✅ No security warnings
- ✅ Balanced category distribution

---

### Phase 2: Data Preprocessing

#### Data Cleaning
```python
def clean_dataset(urls_df):
    """
    Clean and validate URL dataset
    """
    # 1. Remove duplicates
    urls_df = urls_df.drop_duplicates(subset=['url'])
    
    # 2. Remove invalid URLs
    urls_df = urls_df[urls_df['url'].str.contains('http')]
    
    # 3. Remove dead links (optional - can be time-consuming)
    # urls_df = remove_dead_links(urls_df)
    
    # 4. Normalize URLs
    urls_df['url'] = urls_df['url'].str.lower()
    urls_df['url'] = urls_df['url'].str.strip()
    
    # 5. Remove URLs with missing labels
    urls_df = urls_df.dropna(subset=['label'])
    
    # 6. Balance classes
    urls_df = balance_classes(urls_df, method='undersample')
    
    return urls_df
```

#### Class Balancing
**Strategy:** Ensure 50/50 split (10,000 phishing, 10,000 legitimate)

```python
def balance_classes(df, method='undersample'):
    """
    Balance dataset to prevent model bias
    """
    phishing = df[df['label'] == 1]
    legitimate = df[df['label'] == 0]
    
    if method == 'undersample':
        # Reduce majority class
        min_size = min(len(phishing), len(legitimate))
        phishing = phishing.sample(n=min_size, random_state=42)
        legitimate = legitimate.sample(n=min_size, random_state=42)
    
    balanced_df = pd.concat([phishing, legitimate])
    return balanced_df.sample(frac=1, random_state=42)  # Shuffle
```

#### Train/Test Split
```python
# 80/20 split with stratification
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    stratify=y,
    random_state=42
)

# Result:
# Training: 16,000 URLs (8,000 phishing, 8,000 legit)
# Testing:   4,000 URLs (2,000 phishing, 2,000 legit)
```

---

## 🔧 Feature Engineering

### Feature Categories (30+ Features Total)

#### 1. **URL Structure Features** (10 features)
```python
def extract_url_features(url):
    """
    Extract structural features from URL
    """
    parsed = urlparse(url)
    
    return {
        # Length-based
        'url_length': len(url),                    # Total URL length
        'hostname_length': len(parsed.netloc),     # Domain length
        'path_length': len(parsed.path),           # Path length
        'query_length': len(parsed.query),         # Query string length
        
        # Component counts
        'num_dots': url.count('.'),                # Number of dots
        'num_hyphens': url.count('-'),             # Number of hyphens
        'num_underscores': url.count('_'),         # Number of underscores
        'num_slashes': url.count('/'),             # Number of slashes
        'num_digits': sum(c.isdigit() for c in url),  # Digit count
        'num_params': parsed.query.count('&') + 1 if parsed.query else 0
    }
```

**Rationale:**
- Phishing URLs often abnormally long (e.g., `http://paypal-verify-account-security-update-now-12345.malicious.com`)
- Excessive dots suggest subdomain tricks
- Many digits suggest randomly generated domains

---

#### 2. **Domain Features** (8 features)
```python
def extract_domain_features(hostname):
    """
    Extract domain-specific features
    """
    parts = hostname.split('.')
    tld = parts[-1] if len(parts) > 0 else ''
    domain = parts[-2] if len(parts) > 1 else ''
    
    return {
        # TLD features
        'tld_length': len(tld),
        'is_suspicious_tld': int(tld in ['tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top']),
        
        # Domain features
        'domain_entropy': calculate_entropy(domain),  # Randomness
        'has_ip_address': int(bool(re.match(r'\d+\.\d+\.\d+\.\d+', hostname))),
        
        # Subdomain features
        'num_subdomains': len(parts) - 2 if len(parts) > 2 else 0,
        'subdomain_length': sum(len(p) for p in parts[:-2]),
        
        # Special characters in domain
        'has_special_chars': int(bool(re.search(r'[@$%^&*()!]', hostname))),
        'consecutive_consonants': max_consecutive_consonants(domain)
    }
```

**Rationale:**
- Suspicious TLDs (`.tk`, `.ml`) often free, used by attackers
- High entropy suggests random character generation
- IP-based URLs (e.g., `http://192.168.1.1/paypal`) are red flags
- Excessive subdomains mimic legitimate brands (e.g., `secure-login.paypal.malicious.com`)

---

#### 3. **Lexical Features** (6 features)
```python
def extract_lexical_features(url):
    """
    Extract language/pattern features
    """
    return {
        # Character diversity
        'char_diversity': len(set(url)) / len(url),
        
        # Entropy (randomness)
        'url_entropy': calculate_entropy(url),
        
        # Keyword presence
        'has_login_keyword': int(any(kw in url.lower() for kw in ['login', 'signin', 'account'])),
        'has_secure_keyword': int(any(kw in url.lower() for kw in ['secure', 'verify', 'update'])),
        'has_urgent_keyword': int(any(kw in url.lower() for kw in ['urgent', 'suspended', 'limited'])),
        
        # Suspicious patterns
        'has_at_symbol': int('@' in url),  # Credential phishing
    }
```

**Rationale:**
- Low character diversity suggests repetitive patterns
- High entropy indicates randomness
- Phishing uses urgency keywords ("account suspended!")
- `@` symbol can hide real domain (e.g., `http://paypal.com@malicious.com`)

---

#### 4. **Brand Protection Features** (4 features)
```python
# Brand database (150+ major brands)
BRANDS = [
    'paypal', 'amazon', 'google', 'facebook', 'microsoft',
    'apple', 'netflix', 'instagram', 'twitter', 'linkedin',
    'ebay', 'alibaba', 'chase', 'wellsfargo', 'bankofamerica',
    # ... 135 more brands
]

def extract_brand_features(url, hostname):
    """
    Detect brand impersonation (typosquatting)
    """
    domain = '.'.join(hostname.split('.')[-2:])
    
    brand_mentions = sum(brand in url.lower() for brand in BRANDS)
    
    # Typosquatting detection
    closest_brand, min_distance = find_closest_brand(domain, BRANDS)
    is_typosquatting = (1 <= min_distance <= 2)  # 1-2 char difference
    
    return {
        'brand_mention_count': brand_mentions,
        'brand_in_subdomain': int(any(brand in hostname.split('.')[:-2] for brand in BRANDS)),
        'typosquatting_distance': min_distance,
        'is_typosquatting': int(is_typosquatting)
    }

def find_closest_brand(domain, brands):
    """
    Find closest brand using Levenshtein distance
    """
    from Levenshtein import distance
    
    min_dist = float('inf')
    closest = None
    
    for brand in brands:
        dist = distance(domain.lower(), brand.lower())
        if dist < min_dist:
            min_dist = dist
            closest = brand
    
    return closest, min_dist
```

**Rationale:**
- Typosquatting (e.g., `paypai.com`, `gooogle.com`) very common
- Brand names in subdomains (e.g., `paypal.malicious.com`) trick users
- Multiple brand mentions suggests phishing page

---

#### 5. **Protocol & Security Features** (2 features)
```python
def extract_protocol_features(url):
    """
    Check protocol and security indicators
    """
    parsed = urlparse(url)
    
    return {
        'is_https': int(parsed.scheme == 'https'),
        'port_is_abnormal': int(parsed.port not in [None, 80, 443])
    }
```

**Rationale:**
- HTTP (not HTTPS) suggests no SSL certificate
- Abnormal ports (e.g., `:8080`) often used by attackers

---

### Feature Importance Analysis
**(After training, we'll rank features by importance)**

**Expected Top 10 Features:**
1. `typosquatting_distance` - Brand similarity
2. `url_entropy` - Randomness
3. `is_suspicious_tld` - TLD reputation
4. `has_ip_address` - IP-based URLs
5. `url_length` - Abnormal length
6. `brand_in_subdomain` - Brand impersonation
7. `num_subdomains` - Subdomain abuse
8. `has_urgent_keyword` - Social engineering
9. `domain_entropy` - Random domains
10. `is_https` - Security protocol

---

## 🎓 Model Training

### Training Pipeline

```python
# ml/src/training/train_models.py

import pandas as pd
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
import joblib

def train_all_models(X_train, y_train, X_test, y_test):
    """
    Train all models and save best performers
    """
    
    # 1. Feature Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 2. Train Random Forest
    print("Training Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=10,
        min_samples_leaf=5,
        max_features='sqrt',
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train_scaled, y_train)
    rf_score = rf.score(X_test_scaled, y_test)
    print(f"Random Forest Accuracy: {rf_score:.4f}")
    
    # 3. Train Logistic Regression
    print("Training Logistic Regression...")
    lr = LogisticRegression(
        penalty='l2',
        C=1.0,
        solver='lbfgs',
        max_iter=1000,
        random_state=42
    )
    lr.fit(X_train_scaled, y_train)
    lr_score = lr.score(X_test_scaled, y_test)
    print(f"Logistic Regression Accuracy: {lr_score:.4f}")
    
    # 4. Train XGBoost
    print("Training XGBoost...")
    xgb = XGBClassifier(
        n_estimators=100,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42
    )
    xgb.fit(X_train_scaled, y_train)
    xgb_score = xgb.score(X_test_scaled, y_test)
    print(f"XGBoost Accuracy: {xgb_score:.4f}")
    
    # 5. Train Ensemble
    print("Training Ensemble...")
    ensemble = VotingClassifier(
        estimators=[
            ('rf', rf),
            ('xgb', xgb),
            ('lr', lr)
        ],
        voting='soft',
        weights=[0.5, 0.3, 0.2]
    )
    ensemble.fit(X_train_scaled, y_train)
    ensemble_score = ensemble.score(X_test_scaled, y_test)
    print(f"Ensemble Accuracy: {ensemble_score:.4f}")
    
    # 6. Cross-validation
    print("Running 5-fold cross-validation...")
    cv_scores = cross_val_score(ensemble, X_train_scaled, y_train, cv=5)
    print(f"CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
    
    # 7. Save models
    joblib.dump(scaler, 'ml/models/scaler.pkl')
    joblib.dump(rf, 'ml/models/random_forest.pkl')
    joblib.dump(lr, 'ml/models/logistic_regression.pkl')
    joblib.dump(xgb, 'ml/models/xgboost.pkl')
    joblib.dump(ensemble, 'ml/models/ensemble.pkl')
    
    return {
        'random_forest': (rf, rf_score),
        'logistic_regression': (lr, lr_score),
        'xgboost': (xgb, xgb_score),
        'ensemble': (ensemble, ensemble_score)
    }
```

---

### Evaluation Metrics

```python
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_auc_score, roc_curve
)

def evaluate_model(model, X_test, y_test, model_name):
    """
    Comprehensive model evaluation
    """
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print(f"\n{'='*50}")
    print(f"  {model_name} Evaluation")
    print(f"{'='*50}")
    
    # 1. Basic Metrics
    print(f"\nAccuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
    print(f"F1 Score:  {f1_score(y_test, y_pred):.4f}")
    print(f"ROC AUC:   {roc_auc_score(y_test, y_prob):.4f}")
    
    # 2. Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print(f"\nConfusion Matrix:")
    print(f"  TN: {cm[0][0]}  FP: {cm[0][1]}")
    print(f"  FN: {cm[1][0]}  TP: {cm[1][1]}")
    
    # 3. False Positive Rate (Critical for phishing detection!)
    fp_rate = cm[0][1] / (cm[0][0] + cm[0][1])
    print(f"\nFalse Positive Rate: {fp_rate:.4f} ({fp_rate*100:.2f}%)")
    
    # 4. Classification Report
    print(f"\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing']))
    
    return {
        'accuracy': accuracy_score(y_test, y_pred),
        'precision': precision_score(y_test, y_pred),
        'recall': recall_score(y_test, y_pred),
        'f1': f1_score(y_test, y_pred),
        'roc_auc': roc_auc_score(y_test, y_prob),
        'fp_rate': fp_rate
    }
```

---

## 🌐 Browser Integration

### Model Export to JSON

```python
# ml/src/export/export_to_json.py

import json
import numpy as np
from sklearn.tree import _tree

def export_random_forest_to_json(rf_model, scaler, feature_names):
    """
    Convert scikit-learn Random Forest to JSON for browser
    """
    model_json = {
        'type': 'RandomForest',
        'n_estimators': rf_model.n_estimators,
        'classes': rf_model.classes_.tolist(),
        'trees': [],
        'scaler': {
            'mean': scaler.mean_.tolist(),
            'scale': scaler.scale_.tolist()
        },
        'feature_names': feature_names
    }
    
    # Export each tree
    for i, tree in enumerate(rf_model.estimators_):
        tree_dict = export_tree_to_dict(tree.tree_, feature_names)
        model_json['trees'].append(tree_dict)
    
    return model_json

def export_tree_to_dict(tree, feature_names):
    """
    Recursively export tree structure
    """
    def recurse(node_id):
        if tree.feature[node_id] != _tree.TREE_UNDEFINED:
            # Internal node
            feature_name = feature_names[tree.feature[node_id]]
            threshold = float(tree.threshold[node_id])
            
            return {
                'type': 'split',
                'feature': feature_name,
                'threshold': threshold,
                'left': recurse(tree.children_left[node_id]),
                'right': recurse(tree.children_right[node_id])
            }
        else:
            # Leaf node
            value = tree.value[node_id].tolist()[0]
            return {
                'type': 'leaf',
                'value': value,
                'prediction': int(np.argmax(value))
            }
    
    return recurse(0)

# Export all models
def export_all_models(models, scaler, feature_names):
    """
    Export all trained models to JSON
    """
    # Random Forest
    rf_json = export_random_forest_to_json(
        models['random_forest'], scaler, feature_names
    )
    with open('src/data/random_forest.json', 'w') as f:
        json.dump(rf_json, f, indent=2)
    
    # Logistic Regression
    lr_json = {
        'type': 'LogisticRegression',
        'coefficients': models['logistic_regression'].coef_.tolist(),
        'intercept': models['logistic_regression'].intercept_.tolist(),
        'classes': models['logistic_regression'].classes_.tolist(),
        'scaler': {
            'mean': scaler.mean_.tolist(),
            'scale': scaler.scale_.tolist()
        },
        'feature_names': feature_names
    }
    with open('src/data/logistic_regression.json', 'w') as f:
        json.dump(lr_json, f, indent=2)
    
    print("Models exported to JSON successfully!")
```

---

### TypeScript Inference Engine

```typescript
// src/utils/ml-phishing-detector.ts

interface TreeNode {
  type: 'split' | 'leaf';
  feature?: string;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  value?: number[];
  prediction?: number;
}

interface RandomForestModel {
  type: 'RandomForest';
  n_estimators: number;
  classes: number[];
  trees: TreeNode[];
  scaler: {
    mean: number[];
    scale: number[];
  };
  feature_names: string[];
}

class MLPhishingDetector {
  private rfModel: RandomForestModel | null = null;
  private brandDatabase: string[] = [];
  
  async initialize(): Promise<void> {
    // Load Random Forest model
    const rfResponse = await fetch(chrome.runtime.getURL('data/random_forest.json'));
    this.rfModel = await rfResponse.json();
    
    // Load brand database
    const brandResponse = await fetch(chrome.runtime.getURL('data/brands.json'));
    this.brandDatabase = await brandResponse.json();
    
    console.log('✅ ML models loaded successfully');
  }
  
  /**
   * Predict if URL is phishing
   */
  async predictPhishing(url: string): Promise<{
    isPhishing: boolean;
    confidence: number;
    riskLevel: 'Low' | 'Medium' | 'High';
    reasons: string[];
  }> {
    if (!this.rfModel) {
      throw new Error('ML model not initialized');
    }
    
    // 1. Extract features
    const features = this.extractFeatures(url);
    
    // 2. Scale features
    const scaledFeatures = this.scaleFeatures(features);
    
    // 3. Run inference (Random Forest)
    const predictions = this.runRandomForest(scaledFeatures);
    
    // 4. Calculate confidence
    const phishingVotes = predictions.filter(p => p === 1).length;
    const confidence = phishingVotes / predictions.length;
    
    // 5. Determine risk level
    const riskLevel = this.getRiskLevel(confidence);
    
    // 6. Generate reasons
    const reasons = this.generateReasons(features, confidence);
    
    return {
      isPhishing: confidence > 0.5,
      confidence,
      riskLevel,
      reasons
    };
  }
  
  private extractFeatures(url: string): Record<string, number> {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const domain = hostname.split('.').slice(-2).join('.');
    
    // Extract all 30+ features
    return {
      // URL structure (10 features)
      url_length: url.length,
      hostname_length: hostname.length,
      path_length: parsed.pathname.length,
      query_length: parsed.search.length,
      num_dots: (url.match(/\./g) || []).length,
      num_hyphens: (url.match(/-/g) || []).length,
      num_underscores: (url.match(/_/g) || []).length,
      num_slashes: (url.match(/\//g) || []).length,
      num_digits: (url.match(/\d/g) || []).length,
      num_params: parsed.searchParams.toString().split('&').length - 1,
      
      // Domain features (8 features)
      tld_length: parsed.hostname.split('.').pop()?.length || 0,
      is_suspicious_tld: this.isSuspiciousTLD(parsed.hostname) ? 1 : 0,
      domain_entropy: this.calculateEntropy(domain),
      has_ip_address: /\d+\.\d+\.\d+\.\d+/.test(hostname) ? 1 : 0,
      num_subdomains: Math.max(0, hostname.split('.').length - 2),
      subdomain_length: hostname.split('.').slice(0, -2).join('').length,
      has_special_chars: /[@$%^&*()!]/.test(hostname) ? 1 : 0,
      consecutive_consonants: this.maxConsecutiveConsonants(domain),
      
      // Lexical features (6 features)
      char_diversity: new Set(url).size / url.length,
      url_entropy: this.calculateEntropy(url),
      has_login_keyword: /login|signin|account/i.test(url) ? 1 : 0,
      has_secure_keyword: /secure|verify|update/i.test(url) ? 1 : 0,
      has_urgent_keyword: /urgent|suspended|limited/i.test(url) ? 1 : 0,
      has_at_symbol: url.includes('@') ? 1 : 0,
      
      // Brand features (4 features)
      brand_mention_count: this.countBrandMentions(url),
      brand_in_subdomain: this.hasBrandInSubdomain(hostname) ? 1 : 0,
      typosquatting_distance: this.getTyposquattingDistance(domain),
      is_typosquatting: this.isTyposquatting(domain) ? 1 : 0,
      
      // Protocol features (2 features)
      is_https: parsed.protocol === 'https:' ? 1 : 0,
      port_is_abnormal: (parsed.port && !['80', '443'].includes(parsed.port)) ? 1 : 0
    };
  }
  
  private scaleFeatures(features: Record<string, number>): number[] {
    if (!this.rfModel) return [];
    
    const featureArray = this.rfModel.feature_names.map(name => features[name] || 0);
    const { mean, scale } = this.rfModel.scaler;
    
    return featureArray.map((value, i) => (value - mean[i]) / scale[i]);
  }
  
  private runRandomForest(features: number[]): number[] {
    if (!this.rfModel) return [];
    
    // Run prediction through each tree
    return this.rfModel.trees.map(tree => this.predictTree(tree, features));
  }
  
  private predictTree(node: TreeNode, features: number[]): number {
    if (node.type === 'leaf') {
      return node.prediction || 0;
    }
    
    const featureIndex = this.rfModel!.feature_names.indexOf(node.feature!);
    const featureValue = features[featureIndex];
    
    if (featureValue <= node.threshold!) {
      return this.predictTree(node.left!, features);
    } else {
      return this.predictTree(node.right!, features);
    }
  }
  
  private getRiskLevel(confidence: number): 'Low' | 'Medium' | 'High' {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  }
  
  private generateReasons(features: Record<string, number>, confidence: number): string[] {
    const reasons: string[] = [];
    
    if (features.is_typosquatting) {
      reasons.push('Domain appears to impersonate a known brand');
    }
    if (features.has_ip_address) {
      reasons.push('URL uses IP address instead of domain name');
    }
    if (features.is_suspicious_tld) {
      reasons.push('Suspicious top-level domain detected');
    }
    if (features.url_length > 75) {
      reasons.push('Abnormally long URL');
    }
    if (features.has_urgent_keyword) {
      reasons.push('Contains urgency keywords (common in phishing)');
    }
    if (!features.is_https) {
      reasons.push('Not using HTTPS encryption');
    }
    if (features.num_subdomains > 3) {
      reasons.push('Excessive subdomain nesting');
    }
    
    return reasons.slice(0, 5); // Top 5 reasons
  }
  
  // Helper methods...
  private calculateEntropy(str: string): number {
    const freq: Record<string, number> = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const len = str.length;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }
  
  private isSuspiciousTLD(hostname: string): boolean {
    const suspiciousTLDs = ['tk', 'ml', 'ga', 'cf', 'gq', 'xyz', 'top', 'work', 'click'];
    const tld = hostname.split('.').pop() || '';
    return suspiciousTLDs.includes(tld);
  }
  
  // ... more helper methods
}

export default MLPhishingDetector;
```

---

## ⚡ Performance Optimization

### Optimization Strategies

#### 1. **Model Size Reduction**
```python
# Reduce tree depth
max_depth=15  # Instead of 25

# Reduce number of estimators
n_estimators=100  # Instead of 200

# Limit leaf samples
min_samples_leaf=5  # Prune small branches
```

**Result:** Model size ~80 KB (from ~200 KB)

---

#### 2. **Inference Speed Optimization**
```typescript
// Cache feature extraction results
private featureCache = new Map<string, Record<string, number>>();

async predictPhishing(url: string) {
  // Check cache first
  if (this.featureCache.has(url)) {
    return this.predict(this.featureCache.get(url)!);
  }
  
  // Extract and cache
  const features = this.extractFeatures(url);
  this.featureCache.set(url, features);
  
  // Limit cache size
  if (this.featureCache.size > 1000) {
    const firstKey = this.featureCache.keys().next().value;
    this.featureCache.delete(firstKey);
  }
  
  return this.predict(features);
}
```

**Result:** Inference time <10ms (cached: <1ms)

---

#### 3. **Lazy Loading**
```typescript
// Load model only when first needed
private async ensureModelLoaded() {
  if (!this.rfModel) {
    await this.initialize();
  }
}

// Use Web Workers for heavy computations
private worker: Worker | null = null;

private async runInferenceInWorker(features: number[]) {
  if (!this.worker) {
    this.worker = new Worker('ml-worker.js');
  }
  
  return new Promise((resolve) => {
    this.worker!.postMessage({ features });
    this.worker!.onmessage = (e) => resolve(e.data);
  });
}
```

---

## 📏 Quality Metrics

### Success Criteria

| Metric | Target | Acceptable | Excellent |
|--------|--------|------------|-----------|
| **Accuracy** | >95% | 95-96% | >97% |
| **Precision** | >90% | 90-93% | >95% |
| **Recall** | >90% | 90-93% | >95% |
| **F1 Score** | >90% | 90-93% | >95% |
| **False Positive Rate** | <5% | 5-3% | <2% |
| **Model Size** | <100 KB | 100-150 KB | <80 KB |
| **Inference Time** | <10ms | 10-20ms | <5ms |
| **Load Time** | <100ms | 100-200ms | <50ms |

### Validation Process

```python
# 5-fold cross-validation
from sklearn.model_selection import cross_validate

scoring = {
    'accuracy': 'accuracy',
    'precision': 'precision',
    'recall': 'recall',
    'f1': 'f1',
    'roc_auc': 'roc_auc'
}

cv_results = cross_validate(
    ensemble,
    X_train,
    y_train,
    cv=5,
    scoring=scoring,
    return_train_score=True
)

print("Cross-Validation Results (5-fold):")
for metric, scores in cv_results.items():
    if 'test_' in metric:
        print(f"{metric.replace('test_', '')}: {scores.mean():.4f} (+/- {scores.std() * 2:.4f})")
```

---

## 📅 Timeline & Milestones

### Phase 4: ML Foundation (3-5 days)

#### Day 1: Data Collection
- [ ] Setup PhishTank API access
- [ ] Download 10,000 phishing URLs
- [ ] Download Tranco top 10,000 domains
- [ ] Clean and label dataset
- [ ] Balance classes (50/50)

**Deliverable:** 20,000 labeled URLs (CSV)

---

#### Day 2: Feature Engineering
- [ ] Implement 30+ feature extraction functions
- [ ] Build brand database (150+ brands)
- [ ] Extract features from all URLs
- [ ] Validate feature quality
- [ ] Save processed dataset

**Deliverable:** Feature matrix (20,000 x 30)

---

#### Day 3: Model Training
- [ ] Split train/test (80/20)
- [ ] Train Random Forest
- [ ] Train XGBoost
- [ ] Train Logistic Regression
- [ ] Train Ensemble
- [ ] Evaluate all models
- [ ] Select best model

**Deliverable:** Trained models (>95% accuracy)

---

#### Day 4: Model Export
- [ ] Export Random Forest to JSON
- [ ] Export Logistic Regression to JSON
- [ ] Export brand database
- [ ] Export feature scaler
- [ ] Optimize model size (<100 KB)
- [ ] Test JSON loading

**Deliverable:** Browser-ready JSON models

---

#### Day 5: Documentation & Testing
- [ ] Document training process
- [ ] Create model card
- [ ] Write usage guide
- [ ] Test models on new data
- [ ] Generate evaluation report

**Deliverable:** Complete ML documentation

---

### Phase 5: Browser Integration (2-3 days)

#### Day 1: TypeScript Inference Engine
- [ ] Create MLPhishingDetector class
- [ ] Implement feature extraction (TypeScript)
- [ ] Implement Random Forest inference
- [ ] Implement result caching
- [ ] Unit tests

**Deliverable:** Inference engine (TypeScript)

---

#### Day 2: Extension Integration
- [ ] Load models in background worker
- [ ] Hook into navigation events
- [ ] Real-time URL analysis
- [ ] Trigger warnings on phishing
- [ ] Update popup statistics

**Deliverable:** Working ML-powered warnings

---

#### Day 3: Performance & Polish
- [ ] Optimize inference speed
- [ ] Reduce memory usage
- [ ] Add confidence scores to UI
- [ ] Show detection reasons
- [ ] User feedback system
- [ ] Final testing

**Deliverable:** Production-ready ML system

---

## 📖 Documentation Deliverables

1. **ML_MODEL_GUIDE.md** (This document)
2. **MODEL_CARD.md** - Model specifications, performance, limitations
3. **TRAINING_GUIDE.md** - Step-by-step training instructions
4. **FEATURE_DOCUMENTATION.md** - Complete feature descriptions
5. **INFERENCE_API.md** - TypeScript API documentation
6. **EVALUATION_REPORT.md** - Performance metrics and analysis

---

## ✅ Success Checklist

- [ ] Collected 20,000+ labeled URLs
- [ ] Balanced dataset (50/50 split)
- [ ] Extracted 30+ features per URL
- [ ] Trained Random Forest (>95% accuracy)
- [ ] Trained XGBoost (>95% accuracy)
- [ ] Trained Ensemble (>96% accuracy)
- [ ] Exported to JSON (<100 KB)
- [ ] Created TypeScript inference engine
- [ ] Inference time <10ms
- [ ] Integrated with extension
- [ ] Tested on 1000+ real URLs
- [ ] False positive rate <5%
- [ ] User-friendly explanations
- [ ] Complete documentation

---

**Status:** Ready for Implementation  
**Next Step:** Begin Phase 4 - Data Collection  
**Quality Goal:** ⭐⭐⭐⭐⭐ Production-Grade ML System

Primary Model: Random Forest (96-98% accuracy, 80 KB)
Backup Model: Logistic Regression (88-92% accuracy, 5 KB)
Boost Model: XGBoost (96-98% accuracy, 70 KB)
Final: Voting Ensemble (97-99% accuracy, 150 KB)

Features: 30+ (URL structure, domain, lexical, brand, protocol)
Dataset: 20,000 URLs (10K phishing + 10K legitimate)
Training: scikit-learn + xgboost
Export: JSON format (no TensorFlow.js overhead)
Inference: Pure TypeScript (<10ms)
