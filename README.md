# PRISM - Privacy Resilience & Intelligent Security Module

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-green.svg)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Progress](https://img.shields.io/badge/progress-50%25-brightgreen.svg)](PHASE_PROGRESS.md)

> A comprehensive Chrome extension combining advanced privacy protection with intelligent security monitoring.

## 🚀 Quick Start

### Installation for Development
```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Load in Chrome
# 1. Navigate to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" → select /dist folder
```

## ✨ Current Features (Phase 3 Complete - 50%)

### 🛡️ Privacy Protection
- **Tracker Blocking**: 200+ tracker domains across 7 categories
- **Fingerprint Protection**: Canvas, WebGL, Audio, Screen fingerprinting
- **Cookie Management**: Smart third-party cookie blocking
- **Privacy Scoring**: 9-factor algorithm (0-100 score)
- **Trust Management**: Site whitelist/blacklist system

### 🎨 User Interface
- **Settings Panel**: 3 privacy levels (Standard, Balanced, Strict)
- **Analytics Dashboard**: 7-day trends, export to JSON/CSV
- **Quick Toggles**: Extension & blocking enable/disable
- **Risk Badges**: 5-level visual indicators
- **Premium Dark Theme**: Glass morphism design

### � Real-Time Monitoring
- Live tracker blocking statistics
- Per-site privacy analysis
- Request monitoring
- Cookie tracking
- Threat detection

## 📁 Project Structure

```
PRISM/
├── src/
│   ├── background/         # Service worker
│   ├── content/           # Page injection scripts
│   ├── popup/             # React UI (App, Settings, Analytics)
│   └── utils/             # Core libraries
├── public/                # Manifest & icons
└── dist/                  # Build output
```

## 🗓️ Development Progress

- ✅ **Phase 0-2**: Foundation & Tracker Blocking (100%)
- ✅ **Phase 3**: Advanced Privacy Features (100%)
- ⏳ **Phase 4**: Machine Learning Foundation (0%)
- 📋 See [PHASE_PROGRESS.md](PHASE_PROGRESS.md) for details

## 📚 Documentation

- **[PHASE_PROGRESS.md](PHASE_PROGRESS.md)** - Current status & completed features
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture & design
- **[DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md)** - Full timeline & milestones
- **[PHASE_3_COMPLETE.md](PHASE_3_COMPLETE.md)** - Latest completion report

## 🔧 Build Commands

```bash
npm run build          # Production build
npm run build:dev      # Development build
```

## � Next Steps (Phase 4)

- Python ML environment setup
- Feature extraction pipeline
- Model training infrastructure
- TensorFlow.js integration

---

**Status:** Production-ready for user testing  
**Last Updated:** November 2, 2025  
*Protecting privacy, one click at a time* 🛡️
- **Real-time Warnings**: Instant alerts before entering credentials
- **Educational Tooltips**: Learn about phishing techniques
- **Pattern Recognition**: Maintains database of known phishing indicators

### 📊 Dashboard & Analytics
- **Privacy Statistics**: Track your privacy protection over time
- **Threat Analysis**: Detailed breakdown of blocked threats
- **Educational Content**: Tips and guides for online safety
- **Customizable Settings**: Tailor protection to your needs

## 🏗️ Project Structure

```
prism-extension/
├── 📁 src/
│   ├── 📁 background/           # Background service worker
│   ├── 📁 content/              # Content scripts for web pages
│   ├── 📁 popup/                # Extension popup UI (React)
│   ├── 📁 dashboard/            # Full dashboard page
│   ├── 📁 utils/                # Shared utilities
│   └── 📁 ml/                   # Machine learning models
├── 📁 backend/                  # Node.js API server
├── 📁 docs/                     # Project documentation
├── 📁 tests/                    # Test files
└── 📄 manifest.json             # Extension manifest
```

## 🛠️ Tech Stack

### Frontend (Extension)
- **Framework**: Chrome Extension Manifest V3
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js for data visualization
- **Build Tool**: Webpack 5

### Backend (API)
- **Runtime**: Node.js with Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **API Documentation**: Swagger/OpenAPI

### Machine Learning
- **Training**: Python with scikit-learn/TensorFlow
- **Deployment**: TensorFlow.js for client-side inference
- **Datasets**: PhishTank, OpenPhish, custom datasets

### External Services
- **Google Safe Browsing API**: Malicious URL detection
- **PhishTank API**: Phishing verification
- **VirusTotal API**: Additional security checks

## 📈 Current Status

- ✅ **Phase 1**: Foundation Setup (Complete)
- ✅ **Phase 2**: Privacy Guardian Core (Complete)
- 🔄 **Phase 3**: Privacy Scoring System (In Progress)
- ⏳ **Phase 4**: Fake Data Generation (Planned)
- ⏳ **Phase 5**: Basic Phishing Detection (Planned)
- ⏳ **Phase 6**: ML Integration (Planned)

## 🧪 Development Commands

```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check

# Start backend server
npm run server

# Train ML models
npm run train-models
```

## 📚 Documentation

- [Project Overview](docs/PROJECT_OVERVIEW.md) - Detailed project description and goals
- [Development Roadmap](docs/DEVELOPMENT_ROADMAP.md) - Complete development timeline
- [Architecture](docs/ARCHITECTURE.md) - System architecture and technical design
- [API Documentation](docs/API.md) - Backend API reference
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute to the project
- [Deployment Guide](docs/DEPLOYMENT.md) - How to deploy the extension

## 🤝 Team

- **Team Lead**: [Your Name]
- **Frontend Developer**: [Team Member 2]
- **Backend Developer**: [Team Member 3]
- **ML Engineer**: [Team Member 4]
- **UI/UX Designer**: [Team Member 5]

## 📝 Academic Context

**Course**: Semester 7 Project  
**Institution**: [Your Institution Name]  
**Supervisor**: [Supervisor Name]  
**Duration**: 20 weeks (September 2025 - January 2026)

## 🔒 Privacy & Security

PRISM is built with privacy-first principles:
- **No Data Collection**: We don't collect or store your personal browsing data
- **Local Processing**: Most analysis happens locally in your browser
- **Encrypted Communication**: All API calls use HTTPS encryption
- **Open Source**: Code is available for security audits

## 🐛 Issues & Support

Found a bug or have a feature request?
- 📧 Email: [your-team-email@university.edu]
- 🐛 Issues: [GitHub Issues](https://github.com/your-team/prism-extension/issues)
- 📖 Wiki: [Project Wiki](https://github.com/your-team/prism-extension/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chrome Extension Developer Community
- Open source security research community  
- Academic supervisors and mentors
- Beta testers and early adopters

---

**Made with ❤️ by Team PRISM**  
*Protecting privacy, one click at a time* 🛡️