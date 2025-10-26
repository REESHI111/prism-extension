# 🎯 PRISM Extension - Complete Development Guide

## 📚 Quick Navigation

1. **[Phase Execution Plan](PHASE_EXECUTION_PLAN.md)** - Detailed phase-by-phase development plan
2. **[Git Setup Guide](GIT_SETUP_GUIDE.md)** - Version control workflow and best practices
3. **[Architecture](ARCHITECTURE.md)** - System architecture and technical design
4. **[Development Roadmap](DEVELOPMENT_ROADMAP.md)** - Overall timeline and milestones
5. **[Testing Guide](TESTING.md)** - Testing strategies and procedures
6. **[ML Training Guide](ML_MODEL_TRAINING_GUIDE.md)** - Machine learning model training

---

## 🚀 Getting Started (Phase 0)

### Step 1: Verify Environment
```bash
# Check versions
node --version    # Should be v18+
python --version  # Should be 3.9+
git --version

# Navigate to project
cd C:\Users\msi\Downloads\PRISM
```

### Step 2: Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Setup Python environment
cd ml
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

### Step 3: Verify Build
```bash
# Build the extension
npm run build:dev

# Should see output in dist/ folder
ls dist
```

### Step 4: Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `dist` folder
5. Verify extension loads without errors

### Step 5: Setup Git
```bash
# Configure Git (first time only)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Check current branch
git branch

# See what's changed
git status
```

---

## 📋 Development Workflow

### For Each Phase:

#### 1️⃣ **Start Phase**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/phase-X-name
```

#### 2️⃣ **Develop**
- Follow the detailed tasks in [PHASE_EXECUTION_PLAN.md](PHASE_EXECUTION_PLAN.md)
- Write tests as you code
- Commit frequently with clear messages

```bash
git add .
git commit -m "feat(phase-X): what you implemented

Details about the implementation

Tests: ✅ Status
Status: In progress"
git push origin feature/phase-X-name
```

#### 3️⃣ **Test**
```bash
# Run automated tests
npm test

# Check code quality
npm run lint

# Type checking
npm run type-check

# Build
npm run build
```

#### 4️⃣ **Complete Phase**
```bash
# Final commit
git add .
git commit -m "feat(phase-X): complete phase X

- Feature 1 implemented ✅
- Feature 2 implemented ✅
- All tests passing ✅
- Performance benchmarks met ✅

Tests: ✅ 100% passed
Status: Ready for next phase"

git push origin feature/phase-X-name

# Create Pull Request on GitHub
# After review and merge:
git checkout develop
git pull origin develop
git tag -a v1.0-phaseX -m "Phase X Complete"
git push origin --tags
```

---

## 🎯 Phase Overview & Status

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| **0** | 1 day | Environment Setup | ⏳ In Progress |
| **1** | 3 days | Extension Foundation | ⏳ Pending |
| **2** | 5 days | Privacy Guardian | ⏳ Pending |
| **3** | 5 days | Privacy Scoring | ⏳ Pending |
| **4** | 4 days | Fake Data Generation | ⏳ Pending |
| **5** | 5 days | Phishing Detection | ⏳ Pending |
| **6** | 7 days | ML Training | ⏳ Pending |
| **7** | 5 days | ML Integration | ⏳ Pending |
| **8** | 4 days | UI Enhancement | ⏳ Pending |
| **9** | 5 days | Testing & QA | ⏳ Pending |
| **10** | 3 days | Deployment | ⏳ Pending |

**Total**: ~45 days (6.5 weeks)

---

## 📁 Project Structure

```
PRISM/
├── 📄 README.md                        # Project overview
├── 📄 GETTING_STARTED.md              # This file
├── 📄 PHASE_EXECUTION_PLAN.md         # Detailed phase plan
├── 📄 GIT_SETUP_GUIDE.md              # Git workflow guide
├── 📄 ARCHITECTURE.md                  # System architecture
├── 📄 DEVELOPMENT_ROADMAP.md           # Timeline & milestones
├── 📄 package.json                     # Root dependencies
├── 📄 tsconfig.json                    # TypeScript config
├── 📄 webpack.config.js                # Build configuration
├── 📄 .gitignore                       # Git ignore rules
│
├── 📁 src/                             # Source code
│   ├── 📁 background/                  # Service worker
│   │   └── service-worker.ts
│   ├── 📁 content/                     # Content scripts
│   │   └── content-script.ts
│   ├── 📁 popup/                       # Extension popup
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── popup.html
│   ├── 📁 utils/                       # Shared utilities
│   │   ├── cookieManager.ts
│   │   ├── ml-engine.ts
│   │   └── ...
│   └── 📁 data/                        # Static data
│       ├── tracker-domains.json
│       └── cookie-patterns.json
│
├── 📁 backend/                         # Backend API
│   ├── package.json
│   ├── .env.example
│   └── 📁 src/
│       ├── app.js
│       └── 📁 routes/
│
├── 📁 ml/                              # Machine Learning
│   ├── requirements.txt
│   ├── train.py
│   ├── config.py
│   ├── feature_extraction.py
│   ├── 📁 data/
│   │   ├── raw/
│   │   └── processed/
│   ├── 📁 models/
│   │   ├── threat_detector/
│   │   └── privacy_scorer/
│   └── 📁 logs/
│
├── 📁 public/                          # Extension assets
│   └── manifest.json
│
├── 📁 tests/                           # Test files
│   ├── phase1.test.ts
│   ├── phase2.test.ts
│   └── ...
│
└── 📁 dist/                            # Build output (gitignored)
    └── (Generated files)
```

---

## 🧪 Testing Strategy

### Automated Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/phase1.test.ts

# Run with coverage
npm run test:coverage

# Watch mode (during development)
npm run test:watch
```

### Manual Testing Checklist
For each phase, test on these websites:
- ✅ google.com
- ✅ facebook.com
- ✅ amazon.com
- ✅ twitter.com
- ✅ youtube.com
- ✅ Known phishing sites (from PhishTank)

### Performance Testing
```bash
# Build production version
npm run build

# Load in Chrome and check:
# - Extension memory usage (<50MB)
# - Page load time impact (<2%)
# - CPU usage (minimal)
```

---

## 🔧 Troubleshooting

### Build Errors
```bash
# Clean and rebuild
npm run clean
npm install
npm run build:dev
```

### Extension Not Loading
1. Check Chrome DevTools console for errors
2. Verify `manifest.json` is valid
3. Ensure all permissions are correct
4. Try disabling/re-enabling extension

### Python Environment Issues
```bash
# Recreate virtual environment
cd ml
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
```

### Git Issues
```bash
# Reset to last commit (careful!)
git reset --hard HEAD

# Discard unstaged changes
git restore .

# View what changed
git diff
```

---

## 📊 Success Metrics

### Extension Must Achieve:
- ✅ **Tracker Blocking**: 95%+ of known trackers blocked
- ✅ **Phishing Detection**: 95%+ accuracy
- ✅ **Performance**: <2% page load impact
- ✅ **Memory**: <50MB usage
- ✅ **Test Coverage**: 90%+ code coverage
- ✅ **Security**: Zero critical vulnerabilities

---

## 🎓 Learning Resources

### Chrome Extension Development
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome API Reference](https://developer.chrome.com/docs/extensions/reference/)

### React & TypeScript
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Machine Learning
- [Scikit-learn Documentation](https://scikit-learn.org/)
- [TensorFlow.js Guide](https://www.tensorflow.org/js)
- [ML for Phishing Detection](https://arxiv.org/abs/2009.02176)

### Git & Version Control
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🤝 Team Collaboration

### Daily Workflow
1. **Morning**: Check Slack/Discord for updates
2. **Start Work**: Pull latest develop, create/continue feature branch
3. **During Day**: Commit often, push regularly
4. **End of Day**: Push all commits, update team on progress
5. **Weekly**: Phase review meeting, demo progress

### Communication Channels
- **Slack/Discord**: Daily updates, quick questions
- **GitHub Issues**: Bug reports, feature requests
- **Pull Requests**: Code reviews, discussions
- **Wiki**: Documentation, guides
- **Meetings**: Weekly progress reviews

---

## 📝 Important Commands Reference

### Development
```bash
npm run dev          # Development build with watch
npm run build        # Production build
npm run build:dev    # Development build
npm test             # Run tests
npm run lint         # Check code quality
npm run type-check   # TypeScript validation
```

### Backend
```bash
cd backend
npm run dev          # Start with nodemon
npm start            # Production start
npm test             # Run API tests
```

### Machine Learning
```bash
cd ml
.\venv\Scripts\Activate.ps1  # Activate environment
python train.py              # Train models
pytest tests/                # Run ML tests
```

### Git
```bash
git status           # Check what changed
git add .            # Stage all changes
git commit -m "..."  # Commit with message
git push             # Push to remote
git pull             # Pull updates
git checkout -b ...  # Create new branch
```

---

## 🎯 Next Steps

### Right Now (Phase 0):
1. ✅ Verify all dependencies installed
2. ✅ Build extension successfully
3. ✅ Load in Chrome without errors
4. ✅ Setup Git properly
5. ✅ Read Phase 1 plan in detail

### Tomorrow (Phase 1 Start):
1. Create `feature/phase-1-foundation` branch
2. Verify manifest.json configuration
3. Implement basic service worker
4. Create basic popup interface
5. Test inter-script communication

### This Week:
- Complete Phase 1 (3 days)
- Start Phase 2 (2 days)

---

## 💡 Tips for Success

### Do's ✅
- **Commit frequently** with clear messages
- **Test as you code**, don't wait until the end
- **Read documentation** before implementing
- **Ask questions** when stuck
- **Review code** before committing
- **Keep branches small** and focused
- **Update docs** as you develop

### Don'ts ❌
- **Don't skip tests** - they save time later
- **Don't commit without testing** - always test first
- **Don't work on multiple phases** at once
- **Don't push to main directly** - use develop
- **Don't ignore errors** - fix them immediately
- **Don't copy-paste** without understanding
- **Don't rush** - quality over speed

---

## 📞 Getting Help

### Stuck on Something?
1. **Check documentation** in this repo
2. **Search for similar issues** on GitHub
3. **Ask in team chat** (Slack/Discord)
4. **Create GitHub issue** with details
5. **Request code review** from team member

### Reporting Issues
Use this template:
```markdown
## Issue Description
Brief description of the problem

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows 11
- Node: v18.x
- Chrome: v120.x

## Screenshots
(if applicable)

## Additional Context
Any other relevant information
```

---

## 🎉 Ready to Start!

You now have everything you need to begin development:
- ✅ Clean project structure
- ✅ Proper Git setup
- ✅ Comprehensive documentation
- ✅ Phase-wise execution plan
- ✅ Testing strategy
- ✅ Development workflow

**Next Action**: Complete Phase 0 setup and commit your first changes!

```bash
# Commit the cleanup
git add .
git commit -m "chore: complete phase 0 setup

- Clean up deprecated files
- Setup comprehensive .gitignore
- Fix package.json configurations
- Create development documentation
- Setup ML environment structure
- Prepare for Phase 1 development

Status: ✅ Phase 0 Complete - Ready for Phase 1"

git push origin phase-2-privacy-guardian
```

---

**Good luck with your development! Remember: One phase at a time, 100% completion before moving forward! 🚀**
