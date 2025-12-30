# PRISM - Privacy & Security Monitor

**Version 1.1.1 (Phase 8 Complete)**

PRISM is a comprehensive browser extension that provides real-time privacy and security analysis for websites. It uses machine learning to detect phishing attempts, blocks trackers, analyzes cookies, and provides a detailed security score for every website you visit.

---

## 🌟 Features

### Core Functionality
- **🤖 ML-Powered Phishing Detection**: 100% accuracy using logistic regression with 55 URL features
- **🛡️ Tracker Blocking**: Blocks 500+ known tracking domains automatically
- **🍪 Cookie Analysis**: Monitors first-party and third-party cookies in real-time
- **📊 Security Scoring**: 9-category weighted system (0-100 score)
- **🔒 SSL/TLS Validation**: Verifies HTTPS certificates and encryption strength
- **👁️ Fingerprint Detection**: Identifies canvas, WebGL, and audio fingerprinting attempts
- **📝 Privacy Policy Detection**: Automatically finds privacy policies on websites
- **⚡ Real-Time Monitoring**: Updates every 2 seconds with live data

### Security Categories (Weighted Scoring)
1. **Trackers** (20%) - Blocked tracking domains and fingerprinting
2. **Cookies** (18%) - Third-party cookie analysis
3. **ML Phishing Check** (15%) - AI-powered phishing detection
4. **SSL/TLS** (15%) - Encryption and certificate validation
5. **Third-Party Scripts** (10%) - External JavaScript security
6. **Privacy Policy** (7%) - Transparency indicator
7. **Total Requests** (5%) - Network request analysis
8. **Third-Party Requests** (5%) - External domain dependencies
9. **Data Collection** (5%) - Form and PII detection

---

### Development Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/PRISM.git
   cd PRISM
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

---

## 🚀 Quick Start

See [Doc/QUICK_START.md](Doc/QUICK_START.md) for detailed getting started guide.

**Basic Usage:**
1. Install the extension
2. Visit any website
3. Click the PRISM icon
4. View security score and detailed breakdown
5. Click category (i) buttons for more information

**Test the Extension:**
```bash
npm test
---

<details>
<summary><strong>📁 Project Structure</strong></summary>

```text
PRISM/
├── src/
│   ├── background/
│   ├── content/
│   ├── popup/
│   └── utils/
├── ml/
│   ├── src/
│   ├── data/
│   ├── models/
│   └── notebooks/
├── public/
├── tests/
├── Doc/
└── dist/
</details> ```
---

## 🔧 Development

### Prerequisites
- Node.js 16+
- Python 3.8+ (for ML model training)
- Chrome/Chromium browser

### Build Commands
```bash
# Install dependencies
npm install

# Development build (watch mode)
npm run watch

# Production build
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Python ML Environment
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install ML dependencies
pip install -r ml/requirements.txt

# Train model
python ml/train_model.py
```

---

## 🎯 Key Technologies

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chrome Extension APIs** - Browser integration

### Backend (ML)
- **Python 3.8+** - ML runtime
- **scikit-learn** - Machine learning
- **NumPy** - Numerical computing
- **Pandas** - Data manipulation

### Build Tools
- **Webpack 5** - Module bundler
- **Babel** - JavaScript transpiler
- **PostCSS** - CSS processing

---

## 📊 ML Model Performance

- **Algorithm**: Logistic Regression
- **Features**: 55 URL characteristics
- **Training Data**: 200+ URLs (100+ phishing, 100+ legitimate)
- **Accuracy**: 100% on test set
- **Precision**: 100%
- **Recall**: 100%
- **F1 Score**: 100%
- **Model Size**: < 10 KB
- **Inference Time**: < 2ms per prediction

See [Doc/ML_TRAINING_DOCUMENTATION.md](Doc/ML_TRAINING_DOCUMENTATION.md) for complete details.

---

## 🔒 Privacy Policy

**PRISM is privacy-first:**
- ✅ All analysis happens locally in your browser
- ✅ No data ever sent to external servers
- ✅ No user tracking or analytics
- ✅ No personal information collected
- ✅ Open source and transparent
- ✅ All data stored locally only

**Permissions Explained:**
- `cookies` - Read cookies to analyze tracking
- `webRequest` - Intercept requests to block trackers
- `storage` - Store settings and statistics locally
- `tabs` - Access current tab URL for analysis
- `activeTab` - Analyze currently viewed website

---

## 📈 Roadmap

See [Doc/DEVELOPMENT_ROADMAP.md](Doc/DEVELOPMENT_ROADMAP.md) for detailed future plans.

**Upcoming Features:**
- [ ] Firefox support
- [ ] Advanced cookie management
- [ ] Custom blocking rules
- [ ] Export privacy reports
- [ ] Domain whitelist/blacklist
- [ ] Privacy score history tracking

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Development Guidelines:**
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

---

##  Acknowledgments

- Chrome Extension API documentation
- scikit-learn community
- React community
- Open source tracker lists
- Privacy-focused browser extension community
- 
---

## 🔖 Version History

- **v1.1.1 (Phase 8)** - Cookie scoring fix, request categories split, detail modals
- **v1.1.0 (Phase 7)** - Chrome Web Store assets, UI improvements
- **v1.0.0 (Phase 6)** - ML model v4.0 (100% accuracy), complete integration
- **v0.9.0 (Phase 5)** - Enhanced privacy scoring, fingerprint detection
- **v0.8.0 (Phase 4)** - Real-time monitoring, tracker blocking
- **v0.7.0 (Phase 3)** - Cookie analysis, SSL validation
- **v0.6.0 (Phase 2)** - ML phishing detection
- **v0.5.0 (Phase 1)** - Basic security analysis

---
