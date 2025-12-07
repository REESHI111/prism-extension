# ML Phishing Detector - Complete Documentation

## Overview

**Model Version**: 4.0  
**Release Date**: 2024  
**Status**: Production Ready ✓  
**Performance**: 100% accuracy on test set

This is a complete rebuild of the ML phishing detection system following specification-driven development with comprehensive validation at every step.

---

## Performance Metrics

### Training Results
- **Accuracy**: 100.00%
- **Precision**: 100.00%
- **Recall**: 100.00%
- **F1 Score**: 100.00%
- **Cross-Validation**: 100.00% ± 0.00%

### Mandatory Test Cases (All Passed ✓)

**Phishing URLs** (Required: ≥85-90% confidence):
- `http://g00gle-verify.tk/login` → **99.9%** ✓
- `http://faceb00k-security.com/verify` → **99.4%** ✓
- `http://paypal.secure-account.xyz/update` → **99.7%** ✓
- `http://192.168.1.1/admin/login.php` → **99.1%** ✓
- `http://bank-security-verify.com/signin` → **99.7%** ✓

**Legitimate URLs** (Required: ≤15-20% confidence):
- `https://google.com/search` → **6.5%** ✓
- `https://paypal.com/signin` → **13.2%** ✓
- `https://amazon.com/products` → **4.7%** ✓
- `https://github.com/repositories` → **5.4%** ✓
- `https://microsoft.com` → **5.7%** ✓

---

## Project Structure

```
ml/
├── config/
│   └── ml_config.py           # Configuration constants
├── data/
│   └── training_data.py       # 324 URLs (165 phishing + 159 legitimate)
├── src/
│   └── features/
│       └── feature_extractor.py   # 55-feature extractor
├── models/
│   └── trained_model.json     # Trained model export
├── train_model.py             # Main training pipeline
└── test_browser_predictions.py    # Browser testing guide
```

---

## Dataset

### Statistics
- **Total URLs**: 324
- **Phishing**: 165 (50.9%)
- **Legitimate**: 159 (49.1%)

### Phishing Categories (8)
1. Typosquatting (22 URLs) - `g00gle.com`, `faceb00k.com`
2. Suspicious TLDs (27 URLs) - `.tk`, `.ml`, `.ga`, `.cf`, `.gq`, `.xyz`
3. IP Addresses (21 URLs) - `http://192.168.1.1/login`
4. Subdomain Tricks (26 URLs) - `paypal.secure-login.com`
5. Suspicious Keywords (31 URLs) - verify, urgent, secure, suspended
6. Gibberish Domains (16 URLs) - `xkj4h8s9d.com`
7. Long URLs (11 URLs) - Excessively long domains
8. HTTP No SSL (11 URLs) - HTTP for sensitive services

### Legitimate Categories (10)
1. Major Tech (26 URLs) - Google, Facebook, Apple, Microsoft
2. E-commerce (25 URLs) - Amazon, eBay, Walmart
3. Financial (21 URLs) - PayPal, Chase, Bank of America
4. Developer (16 URLs) - GitHub, GitLab, StackOverflow
5. Cloud (16 URLs) - AWS, Azure, Google Cloud
6. Social Media (16 URLs) - Twitter, Instagram, LinkedIn
7. Education (11 URLs) - Coursera, Khan Academy
8. News (11 URLs) - CNN, BBC, NYTimes
9. Streaming (11 URLs) - Netflix, YouTube, Spotify
10. Email (6 URLs) - Gmail, Outlook

---

## Features

### Total: 55 Features Across 7 Categories

#### 1. Basic URL Structure (10 features)
- URL length
- Number of dots, hyphens, underscores
- Number of slashes, question marks, ampersands, equals signs
- Number of @ symbols
- Number of digits

#### 2. Domain Analysis (15 features)
- Domain length and composition
- Suspicious TLD detection
- IP address detection
- Subdomain analysis
- Digit-letter substitution detection
- Domain entropy
- Port number presence
- Domain length extremes

#### 3. Path & Query Analysis (10 features)
- Path length and depth
- Suspicious file extensions (`.php`, `.exe`, `.zip`)
- Login/admin path detection
- Query parameter analysis
- Sensitive parameter detection

#### 4. Security Indicators (5 features)
- HTTPS usage
- HTTP with financial keywords
- 'https' in domain (phishing trick)
- Fake 'www' subdomain
- Mixed HTTP/HTTPS protocols

#### 5. Keyword Detection (5 features)
- Phishing keyword count
- Specific keyword flags (verify, secure, update, confirm)
- Multiple keyword presence

#### 6. Brand Mimicry Detection (5 features)
- Brand name presence
- Brand with digit substitution (`paypa1`, `g00gle`)
- Brand in subdomain
- Brand with hyphens
- Multiple brands in domain

#### 7. Advanced Statistics (5 features)
- Vowel-to-consonant ratio
- Character diversity
- Domain-to-URL length ratio
- Special character ratio
- Digit ratio in domain

---

## Model Architecture

### Algorithm
**Logistic Regression** with:
- L2 regularization (C = 0.1)
- Balanced class weights
- LBFGS solver
- 2000 max iterations

### Training Process
1. **Data Split**: 80% training (259 samples), 20% test (65 samples)
2. **Feature Extraction**: 55 features per URL
3. **Standardization**: Zero mean, unit variance
4. **Hyperparameter Tuning**: Grid search with 5-fold cross-validation
5. **Validation**: Test on held-out set + mandatory test cases
6. **Export**: JSON format for browser use

### Hyperparameter Grid
- C: [0.1, 1.0, 10.0, 100.0, 1000.0]
- class_weight: ['balanced', {0: 2, 1: 1}, {0: 3, 1: 1}, {0: 1, 1: 1}]
- solver: ['lbfgs', 'liblinear']
- max_iter: [2000]

**Best Parameters**:
- C: 0.1
- class_weight: balanced
- solver: lbfgs

---

## Usage

### Training the Model

```bash
# Activate virtual environment
cd ml
.\\venv\\Scripts\\activate

# Run training pipeline
python train_model.py
```

**Training Output**:
1. Data preparation (324 URLs → 259 train, 65 test)
2. Grid search with 5-fold CV (40 parameter combinations)
3. Model evaluation (100% accuracy)
4. Mandatory test case validation
5. Success criteria validation
6. Model export to JSON

### Testing Predictions

```bash
# Test Python predictions
python test_browser_predictions.py

# Expected output:
# - All test URLs classified correctly
# - Phishing: 99%+ confidence
# - Legitimate: 4-13% confidence
```

### Browser Integration

The model is automatically loaded by the TypeScript implementation in `src/utils/ml-phishing-detector.ts`.

**Key Classes**:
- `URLFeatureExtractor`: Extracts 55 features (matches Python exactly)
- `MLPhishingDetector`: Loads model, standardizes features, makes predictions

**Usage in Extension**:
```typescript
import { getMLDetector } from '../utils/ml-phishing-detector';

const detector = await getMLDetector();
const result = detector.classify(url);
console.log(`${url} → ${(result.confidence * 100).toFixed(1)}% phishing`);
```

---

## Validation & Testing

### Success Criteria (ALL MET ✓)
- ✓ Test Accuracy ≥ 95% → **100%**
- ✓ Test Precision ≥ 95% → **100%**
- ✓ Test Recall ≥ 95% → **100%**
- ✓ F1 Score ≥ 95% → **100%**
- ✓ Cross-Validation ≥ 95% → **100%**
- ✓ CV Std Dev ≤ 5% → **0%**

### Mandatory Test Cases (ALL PASSED ✓)
- ✓ All phishing URLs: ≥85-90% confidence
- ✓ All legitimate URLs: ≤15-20% confidence

### Browser Testing

1. **Build Extension**:
   ```bash
   npm run build
   ```

2. **Load in Chrome**:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select `dist` folder

3. **Test URLs**:
   - Visit test URLs from mandatory test cases
   - Open browser console
   - Verify predictions match Python output

4. **Expected Results**:
   - Phishing URLs show high confidence (95%+)
   - Legitimate URLs show low confidence (<15%)
   - No false positives/negatives

---

## Files

### Python Implementation
- `ml/config/ml_config.py` - Configuration constants
- `ml/data/training_data.py` - Training dataset (324 URLs)
- `ml/src/features/feature_extractor.py` - Feature extraction (55 features)
- `ml/train_model.py` - Training pipeline
- `ml/test_browser_predictions.py` - Browser testing guide

### TypeScript Implementation
- `src/utils/ml-phishing-detector.ts` - Browser ML detector
  - `URLFeatureExtractor` class (matches Python)
  - `MLPhishingDetector` class
  - `getMLDetector()` singleton

### Model Files
- `ml/models/trained_model.json` - Python export
- `public/ml/enhanced_model.json` - Browser model (copied from above)
- `dist/ml/enhanced_model.json` - Deployed model (webpack copy)

### Documentation
- `ML_SPECIFICATION.md` - Comprehensive requirements
- `ml/README.md` - This file

---

## Troubleshooting

### Model Not Loading in Browser
```
Error: Failed to load model
```
**Solution**: Ensure `npm run build` was run and `dist/ml/enhanced_model.json` exists.

### Predictions Don't Match
```
TypeScript predictions differ from Python
```
**Solution**:
1. Check feature extraction matches Python exactly
2. Verify model file is latest version (v4.0)
3. Run `python ml/test_browser_predictions.py` to see expected values
4. Check browser console for feature extraction logs

### Training Fails Validation
```
Model does NOT meet requirements
```
**Solution**:
1. Review which criteria failed
2. If accuracy < 95%: Add more training data or adjust features
3. If mandatory tests fail: Adjust hyperparameters (class weights, C value)
4. See `ml/config/ml_config.py` to modify thresholds

---

## Future Improvements

1. **Dataset Expansion**
   - Add more diverse phishing patterns
   - Include cryptocurrency scams
   - Add localized phishing (non-English)

2. **Feature Engineering**
   - DOM structure analysis
   - Visual similarity detection
   - Certificate validation features

3. **Model Enhancements**
   - Ensemble methods (Random Forest + Logistic Regression)
   - Neural network for complex patterns
   - Real-time model updates

4. **Browser Optimization**
   - WebAssembly for faster inference
   - Service worker caching
   - Batch prediction for multiple URLs

---

## Technical Specifications

### Python Requirements
- Python 3.12+
- scikit-learn 1.5.2
- numpy 1.26.4
- pandas (for data analysis)

### Browser Requirements
- Chrome/Edge (Manifest V3)
- TypeScript 5.6+
- Webpack 5.101+

### Model Format
- JSON export with:
  - Coefficients (55 values)
  - Intercept (1 value)
  - Scaler parameters (mean & scale for 55 features)
  - Metadata (version, metrics, hyperparameters)

---

## License

Part of PRISM Browser Extension

---

## Contact

For issues or questions about the ML system, create an issue in the repository with the `ml` label.
