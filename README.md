# PRISM - Privacy Resilience & Intelligent Security Module

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-green.svg)](https://developer.chrome.com/docs/extensions/)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

> A comprehensive Chrome extension that combines advanced privacy protection with intelligent phishing detection to safeguard users' online experience.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- Chrome Browser (v88 or higher)
- Git

### Installation for Development
```bash
# Clone the repository
git clone https://github.com/your-team/prism-extension.git
cd prism-extension

# Install dependencies
npm install

# Build the extension
npm run build

# Load extension in Chrome
# 1. Open Chrome and navigate to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select the /dist folder
```

### Quick Test
1. Visit any website (e.g., facebook.com, google.com)
2. Click the PRISM icon in the toolbar
3. View your privacy score and blocked trackers

## ✨ Features

### 🛡️ Privacy Guardian
- **Tracker Blocking**: Automatically blocks tracking scripts and cookies
- **Privacy Scoring**: Real-time privacy score for each website (0-100)
- **Data Collection Insights**: Shows what data websites are trying to collect
- **Fake Data Generation**: Protects your real information in forms

### 🎣 Phishing Detector  
- **ML-Based Detection**: Uses machine learning to identify suspicious websites
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