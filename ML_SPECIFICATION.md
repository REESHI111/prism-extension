# 🎯 ML PHISHING DETECTOR - SPECIFICATION & REQUIREMENTS

## 📋 OBJECTIVE

Build a highly accurate, production-ready machine learning model that detects phishing URLs with **≥95% confidence** for obvious phishing attempts and **≤15% confidence** for legitimate sites.

---

## 🎯 SUCCESS CRITERIA

### Performance Metrics
- **Minimum Accuracy**: 95% on test set
- **Minimum Precision**: 95% (minimize false positives)
- **Minimum Recall**: 95% (minimize false negatives)
- **F1 Score**: ≥0.95
- **Cross-Validation**: ≥95% with <5% standard deviation

### Real-World Behavior

#### Phishing URLs (Expected: 85-100% confidence)
```
✅ g00gle-verify.tk/login              → 95-100% (typosquatting + suspicious TLD)
✅ faceb00k-security.com/verify        → 90-100% (brand mimic + digits)
✅ paypal.secure-account.xyz/update    → 90-100% (subdomain trick + .xyz)
✅ 192.168.1.1/admin/login.php         → 95-100% (IP address + suspicious path)
✅ verify-account-urgent.tk/login      → 85-100% (keywords + suspicious TLD)
```

#### Legitimate URLs (Expected: 0-15% confidence)
```
✅ https://www.google.com/search        → 0-10% (major tech company)
✅ https://www.paypal.com/signin        → 5-15% (legitimate financial)
✅ https://www.amazon.com/products      → 0-10% (major e-commerce)
✅ https://github.com/repositories      → 0-10% (developer platform)
✅ https://stackoverflow.com/questions  → 0-10% (legitimate community)
```

---

## 📊 TRAINING DATA REQUIREMENTS

### Dataset Size
- **Minimum Total URLs**: 300+
- **Phishing Examples**: 150+ (50%)
- **Legitimate Examples**: 150+ (50%)
- **Train/Test Split**: 80/20
- **Cross-Validation**: 5-fold

### Phishing URL Categories (Must Include)

1. **Typosquatting** (20+ examples)
   - Digit substitution: `g00gle.com`, `faceb00k.com`, `paypa1.com`
   - Character substitution: `micr0soft.com`, `app1e.com`
   - Missing/extra characters: `gooogle.com`, `amazom.com`

2. **Suspicious TLDs** (25+ examples)
   - Free TLDs: `.tk`, `.ml`, `.ga`, `.cf`, `.gq`
   - Uncommon TLDs: `.xyz`, `.top`, `.work`, `.click`, `.link`
   - Combined with brands: `paypal-verify.xyz`, `google-accounts.tk`

3. **IP Addresses** (20+ examples)
   - Private IPs: `192.168.x.x`, `10.0.0.x`, `172.16.x.x`
   - Public IPs: `203.0.113.x`, `198.51.100.x`
   - With suspicious paths: `/admin/login`, `/banking/signin`

4. **Subdomain Tricks** (25+ examples)
   - Brand in subdomain: `paypal.evil-site.tk`, `google.phishing.com`
   - Multiple subdomains: `secure.login.paypal.fake.xyz`
   - Legitimate-looking: `accounts.google.phishing-site.com`

5. **Suspicious Keywords** (30+ examples)
   - Security terms: `verify`, `confirm`, `secure`, `urgent`
   - Account terms: `account`, `login`, `signin`, `suspended`
   - Payment terms: `billing`, `payment`, `update`, `expired`
   - Combined: `verify-account-urgent.tk`, `secure-login-billing.xyz`

6. **Gibberish Domains** (15+ examples)
   - Random characters: `asdfghjkl.tk`, `qwerty123.xyz`
   - Long random: `kjhgfdsaqwerty456.ml`

7. **Long/Complex URLs** (10+ examples)
   - Multiple redirects: `secure-login-verify-account-billing.tk`
   - Deep paths: `/account/verify/confirm/update/billing`

8. **HTTP (No SSL)** (10+ examples)
   - Banking sites without HTTPS
   - Payment pages without SSL

### Legitimate URL Categories (Must Include)

1. **Major Tech Companies** (25+ examples)
   - Google ecosystem: `google.com`, `youtube.com`, `gmail.com`
   - Microsoft: `microsoft.com`, `outlook.com`, `office.com`
   - Apple: `apple.com`, `icloud.com`
   - Meta: `facebook.com`, `instagram.com`

2. **E-commerce** (25+ examples)
   - Amazon, eBay, Walmart, Target, Etsy, Shopify
   - With common paths: `/products`, `/cart`, `/checkout`

3. **Financial Services** (20+ examples)
   - PayPal, Chase, Bank of America, Wells Fargo
   - Credit cards: American Express, Visa, Mastercard
   - With login paths: `/signin`, `/login`, `/account`

4. **Developer Platforms** (15+ examples)
   - GitHub, Stack Overflow, npm, PyPI
   - Documentation: MDN, W3Schools

5. **Cloud & SaaS** (15+ examples)
   - AWS, Azure, Google Cloud, Heroku
   - Dropbox, Box, OneDrive

6. **Social Media** (15+ examples)
   - LinkedIn, Twitter, Reddit, Pinterest, TikTok

7. **Education** (10+ examples)
   - Wikipedia, Coursera, Udemy, Khan Academy

8. **News & Media** (10+ examples)
   - NYTimes, CNN, BBC, Reuters

9. **Streaming** (10+ examples)
   - Netflix, Spotify, Hulu, YouTube Premium

10. **Email Services** (5+ examples)
    - Gmail, Yahoo Mail, Outlook, ProtonMail

---

## 🔧 FEATURE ENGINEERING REQUIREMENTS

### Must Extract 50+ Features

#### 1. Basic URL Structure (10 features)
- URL length (normalized)
- Number of dots, hyphens, underscores
- Number of slashes, question marks, ampersands
- Number of @ symbols
- Number of digits in URL
- Special character count

#### 2. Domain Analysis (15 features)
- Domain length
- Subdomain length
- Number of subdomains
- Domain contains digits (boolean)
- Subdomain contains digits (boolean)
- Is IP address (boolean)
- Has port number (boolean)
- TLD type (suspicious/legitimate/neutral)
- Domain entropy (randomness measure)
- Subdomain entropy
- Hostname length

#### 3. Path & Query Analysis (10 features)
- Path length
- Number of path segments
- Query string length
- Number of query parameters
- Path contains digits
- Path entropy
- Has URL fragment
- Path contains suspicious characters
- File extension length
- Number of dots in path

#### 4. Security Indicators (5 features)
- Has HTTPS (boolean)
- Has HTTP (boolean)
- Scheme length
- Is URL shortening service (boolean)
- Has double slash redirect

#### 5. Keyword Detection (5 features)
- Number of suspicious keywords
- Has login/signin keyword
- Has verify/confirm keyword
- Has urgent/suspended keyword
- Has billing/payment keyword

#### 6. Brand Mimicry Detection (5 features)
- Brand name in domain (boolean)
- Brand name in subdomain (boolean)
- Levenshtein distance to known brands
- Has digit substitution in brand names
- Brand keyword ratio

#### 7. Advanced Statistical Features (5 features)
- Vowel/consonant ratio
- Maximum consecutive digits
- Maximum consecutive consonants
- Special character ratio
- Digit to letter ratio

---

## 🤖 MODEL REQUIREMENTS

### Algorithm Selection
- **Primary**: Logistic Regression (interpretable, fast, lightweight)
- **Alternative**: Random Forest (if better performance)
- **Backup**: Gradient Boosting

### Hyperparameters to Tune
- Regularization strength (C parameter)
- Class weights (balanced vs manual)
- Solver algorithm
- Maximum iterations

### Training Process
1. Load and validate dataset (300+ URLs)
2. Extract features for all URLs
3. Split data (80% train, 20% test)
4. Standardize features (zero mean, unit variance)
5. Grid search for optimal hyperparameters
6. Train final model with best parameters
7. Evaluate on test set
8. Cross-validate (5-fold)
9. Test on known phishing URLs
10. Export model to JSON

### Model Export Format
```json
{
  "model_type": "Logistic Regression",
  "version": "3.0",
  "trained_at": "ISO timestamp",
  "num_features": 55,
  "features": ["feature1", "feature2", ...],
  "coefficients": [0.123, -0.456, ...],
  "intercept": 0.789,
  "scaler_mean": [1.23, 4.56, ...],
  "scaler_std": [0.12, 0.34, ...],
  "metrics": {
    "accuracy": 0.99,
    "precision": 0.98,
    "recall": 0.99,
    "f1_score": 0.985,
    "roc_auc": 0.995
  }
}
```

---

## 💻 BROWSER IMPLEMENTATION REQUIREMENTS

### TypeScript Feature Extractor
- Must extract **EXACT same features** as Python
- Same normalization formulas
- Same feature ordering
- Same calculation methods
- Handle edge cases (empty strings, missing data)

### Prediction Logic
- Load model from JSON
- Extract features from URL
- Standardize using scaler_mean and scaler_std
- Calculate logit: `intercept + sum(feature[i] * coefficient[i])`
- Apply sigmoid: `1 / (1 + exp(-logit))`
- Return confidence percentage

### Risk Level Mapping
```
90-100% → CRITICAL (🔴 Block immediately)
75-89%  → HIGH     (🟠 Strong warning)
50-74%  → MEDIUM   (🟡 Caution)
25-49%  → LOW      (🟢 Minor alert)
0-24%   → SAFE     (✅ Allow)
```

---

## ✅ VALIDATION REQUIREMENTS

### Automated Tests
- [ ] All 300+ training URLs classified correctly
- [ ] Test set accuracy ≥95%
- [ ] Cross-validation accuracy ≥95%
- [ ] Known phishing URLs (10+) scored ≥85%
- [ ] Known legitimate URLs (10+) scored ≤15%

### Manual Test Cases
Must pass all these:

**Phishing URLs**:
- `http://g00gle-verify.tk/login` → ≥90%
- `http://faceb00k-security.com/verify` → ≥85%
- `http://paypal.secure-account.xyz/update` → ≥85%
- `http://192.168.1.1/admin/login.php` → ≥90%
- `https://verify-account-urgent.tk/login` → ≥75%

**Legitimate URLs**:
- `https://www.google.com/search` → ≤15%
- `https://www.paypal.com/signin` → ≤20%
- `https://www.amazon.com/products` → ≤15%
- `https://github.com/repositories` → ≤15%
- `https://stackoverflow.com/questions` → ≤15%

### Browser Testing
- [ ] Extension loads model successfully
- [ ] Console shows correct version and metrics
- [ ] TypeScript predictions match Python predictions (±2%)
- [ ] Real URLs display correct confidence scores
- [ ] Risk levels display correctly

---

## 🚫 FAILURE CONDITIONS

The model is considered FAILED if:
- ❌ Test accuracy < 95%
- ❌ Phishing URL confidence < 80%
- ❌ Legitimate URL confidence > 20%
- ❌ Cross-validation std > 5%
- ❌ TypeScript predictions differ from Python by >5%
- ❌ Model file size > 10 KB
- ❌ Prediction time > 100ms

---

## 📁 FILE STRUCTURE

```
ml/
├── config/
│   └── ml_config.py              # Configuration constants
├── data/
│   └── training_data.py          # 300+ URLs with labels
├── src/
│   └── features/
│       └── feature_extractor.py  # Production feature extraction
├── models/
│   ├── trained_model.json        # Trained model (for backup)
│   └── model_metrics.json        # Detailed metrics
├── train_model.py                # Main training script
├── test_predictions.py           # Validation script
└── README.md                     # ML documentation

src/utils/
└── ml-phishing-detector.ts       # Browser-side ML

public/ml/
└── enhanced_model.json           # Model for extension (source)

dist/ml/
└── enhanced_model.json           # Model for extension (deployed)
```

---

## 🔄 DEVELOPMENT WORKFLOW

1. **Design Phase** ✅
   - Define requirements (this document)
   - Specify success criteria
   - Plan architecture

2. **Data Collection**
   - Gather 300+ diverse URLs
   - Categorize and label
   - Validate quality

3. **Feature Engineering**
   - Implement 55+ feature extractors
   - Test on sample URLs
   - Validate feature values

4. **Model Training**
   - Train with grid search
   - Evaluate metrics
   - Cross-validate

5. **Validation**
   - Test on known URLs
   - Verify confidence scores
   - Check edge cases

6. **Browser Integration**
   - Implement TypeScript extractor
   - Verify predictions match
   - Test in extension

7. **Deployment**
   - Build extension
   - Test in browser
   - Verify real-world performance

---

## 📊 EXPECTED OUTCOMES

After following this specification:

✅ **Model Accuracy**: 95-100%
✅ **Phishing Detection**: 85-100% confidence
✅ **Legitimate Detection**: 0-15% confidence
✅ **False Positives**: <5%
✅ **False Negatives**: <5%
✅ **Browser Performance**: <100ms per prediction
✅ **Model Size**: 5-8 KB
✅ **User Experience**: Clear, accurate warnings

---

## 🎯 SUMMARY

**Goal**: Build a production-ready phishing detector that:
- Accurately identifies phishing URLs (≥85% confidence)
- Rarely flags legitimate sites (<15% confidence)
- Works perfectly in browser environment
- Provides clear, actionable warnings to users

**Key Metrics**:
- Accuracy: ≥95%
- Precision: ≥95%
- Recall: ≥95%
- F1 Score: ≥0.95

**Non-Negotiables**:
- Must have 300+ training URLs
- Must extract 50+ features
- Must hyperparameter tune
- Must cross-validate
- Must test in browser
- TypeScript must match Python exactly

This specification ensures we build a **high-quality, production-ready ML model** that solves the phishing detection problem effectively. 🎯
