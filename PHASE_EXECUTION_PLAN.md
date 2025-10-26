# 🚀 PRISM Extension - Phase-wise Execution Plan

> **Critical Rule**: Each phase must achieve 100% completion and pass all tests before moving to the next phase.

---

## 📋 Phase Overview

| Phase | Duration | Status | Success Criteria |
|-------|----------|--------|------------------|
| **Phase 0** | 1 day | ⏳ Pending | Git setup, environment ready, dependencies installed |
| **Phase 1** | 3 days | ⏳ Pending | Basic extension loads, popup works, no errors |
| **Phase 2** | 5 days | ⏳ Pending | Trackers blocked (90%+), cookies managed, tests pass |
| **Phase 3** | 5 days | ⏳ Pending | Privacy scores accurate, dashboard functional, charts work |
| **Phase 4** | 4 days | ⏳ Pending | Form detection works, fake data generates correctly |
| **Phase 5** | 5 days | ⏳ Pending | Basic phishing detection (80%+ accuracy), warnings work |
| **Phase 6** | 7 days | ⏳ Pending | ML model trained (95%+ accuracy), API deployed, tests pass |
| **Phase 7** | 5 days | ⏳ Pending | ML integrated, hybrid detection works, <100ms inference |
| **Phase 8** | 4 days | ⏳ Pending | UI polished, settings complete, UX smooth |
| **Phase 9** | 5 days | ⏳ Pending | All tests pass, performance optimal, security audit clear |
| **Phase 10** | 3 days | ⏳ Pending | Deployed, documented, ready for Chrome Web Store |

**Total Duration**: ~45 days (6.5 weeks)

---

## 🎯 PHASE 0: Environment Setup & Git Configuration
**Duration**: 1 day  
**Status**: ⏳ In Progress

### Objectives
✅ Clean up project structure  
✅ Configure Git properly  
✅ Install all dependencies  
✅ Verify development environment

### Tasks

#### 1. Git Repository Setup
```bash
# Initialize clean git state
git add .gitignore
git commit -m "chore: update gitignore"

# Create branch structure
git checkout -b develop
git push -u origin develop

# Create main branch protection (on GitHub)
# Settings → Branches → Add rule for 'main'
# - Require pull request reviews
# - Require status checks to pass
```

#### 2. Install Dependencies
```bash
# Root project
npm install

# Backend
cd backend
npm install
cd ..

# Python ML environment
cd ml
python -m venv venv
.\venv\Scripts\Activate.ps1  # On Windows
pip install --upgrade pip
pip install -r requirements.txt
cd ..
```

#### 3. Verify Installation
```bash
# Check Node/npm
node --version  # Should be v18+
npm --version

# Check Python
python --version  # Should be 3.9+
pip --version

# Check TypeScript
npx tsc --version

# Build test
npm run build:dev
```

### Success Criteria
- ✅ All dependencies installed without errors
- ✅ Git repository properly configured
- ✅ Project builds successfully (`npm run build:dev`)
- ✅ No errors in terminal

### Git Workflow
```bash
# After completion
git add .
git commit -m "phase-0: complete environment setup"
git push origin develop
```

---

## 🔧 PHASE 1: Extension Foundation
**Duration**: 3 days  
**Status**: ⏳ Pending  
**Branch**: `feature/phase-1-foundation`

### Objectives
- Create working Chrome extension skeleton
- Implement basic popup UI
- Setup inter-script communication
- Verify extension loads correctly

### Day 1: Extension Structure

#### Tasks
1. **Verify/Update manifest.json**
```json
{
  "manifest_version": 3,
  "name": "PRISM - Privacy & Security",
  "version": "1.0.0",
  "description": "Advanced privacy protection and phishing detection",
  "permissions": [
    "storage",
    "tabs",
    "cookies",
    "webRequest",
    "declarativeNetRequest",
    "activeTab"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content/content-script.js"],
      "run_at": "document_start"
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "assets/icon16.png",
      "48": "assets/icon48.png",
      "128": "assets/icon128.png"
    }
  }
}
```

2. **Create Basic Service Worker** (`src/background/service-worker.ts`)
```typescript
chrome.runtime.onInstalled.addListener(() => {
  console.log('✅ PRISM Extension Installed');
  chrome.storage.local.set({ 
    extensionActive: true,
    installDate: new Date().toISOString()
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message);
  
  if (message.type === 'PING') {
    sendResponse({ status: 'OK', message: 'PRISM is active' });
  }
  
  return true;
});
```

3. **Create Basic Content Script** (`src/content/content-script.ts`)
```typescript
console.log('🔍 PRISM Content Script Loaded');

// Test communication with background
chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
  console.log('✅ Background connection:', response);
});

// Store in window for debugging
(window as any).PRISM = {
  version: '1.0.0',
  active: true
};
```

### Day 2: Popup Interface

#### Tasks
1. **Create Popup HTML** (`src/popup/popup.html`)
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PRISM</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div id="root"></div>
  <script src="index.js"></script>
</body>
</html>
```

2. **Create Basic React App** (`src/popup/App.tsx`)
```typescript
import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    // Test background communication
    chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
      setStatus(response?.status === 'OK' ? '✅ PRISM Active' : '❌ Error');
    });
  }, []);

  return (
    <div className="w-80 p-4">
      <h1 className="text-2xl font-bold mb-4">🛡️ PRISM</h1>
      <div className="bg-blue-100 p-3 rounded">
        <p className="text-sm font-semibold">{status}</p>
        <p className="text-xs mt-2">Phase 1: Foundation</p>
      </div>
    </div>
  );
};

export default App;
```

3. **Update Webpack Config** (verify it builds popup correctly)

### Day 3: Testing & Validation

#### Tasks
1. **Build Extension**
```bash
npm run clean
npm run build:dev
```

2. **Load in Chrome**
- Navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `dist` folder
- Verify no errors

3. **Manual Testing Checklist**
- [ ] Extension icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] Popup shows "✅ PRISM Active"
- [ ] No console errors in popup
- [ ] No console errors in background service worker
- [ ] No console errors in content script (check any webpage)

4. **Create Automated Tests** (`tests/phase1.test.ts`)
```typescript
describe('Phase 1: Extension Foundation', () => {
  test('manifest.json is valid', () => {
    const manifest = require('../public/manifest.json');
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toContain('PRISM');
  });

  test('background service worker initializes', async () => {
    // Test implementation
  });

  test('popup component renders', () => {
    // Test implementation
  });
});
```

### Success Criteria (Must Pass 100%)
- ✅ Extension loads without errors
- ✅ Popup displays correctly
- ✅ Background script running
- ✅ Content script injected on all pages
- ✅ Inter-script messaging works
- ✅ All automated tests pass
- ✅ No console errors anywhere

### Git Workflow
```bash
git checkout develop
git pull origin develop
git checkout -b feature/phase-1-foundation

# After completion
git add .
git commit -m "feat(phase-1): complete extension foundation

- Setup manifest v3 configuration
- Implement basic service worker
- Create content script injection
- Build React popup interface
- Add inter-script communication
- All tests passing

Tests: ✅ All passed
Status: Ready for Phase 2"

git push origin feature/phase-1-foundation

# Create Pull Request to develop
# After review and approval, merge to develop
git checkout develop
git merge feature/phase-1-foundation
git tag -a v1.0-phase1 -m "Phase 1 Complete"
git push origin develop --tags
```

---

## 🛡️ PHASE 2: Privacy Guardian Core
**Duration**: 5 days  
**Status**: ⏳ Pending  
**Branch**: `feature/phase-2-privacy-guardian`

### Objectives
- Implement tracker detection and blocking
- Create cookie management system
- Build tracker database
- Display blocking statistics

### Day 1-2: Tracker Database & Detection

#### Tasks
1. **Create Tracker Database** (`src/data/tracker-domains.json`)
```json
{
  "trackers": [
    {
      "domain": "google-analytics.com",
      "category": "analytics",
      "company": "Google",
      "description": "Web analytics service"
    },
    {
      "domain": "doubleclick.net",
      "category": "advertising",
      "company": "Google",
      "description": "Ad serving platform"
    },
    {
      "domain": "facebook.net",
      "category": "social",
      "company": "Facebook",
      "description": "Social media tracking"
    }
    // Add 100+ more trackers
  ]
}
```

2. **Implement Blocking Rules** (`src/background/tracker-blocker.ts`)
```typescript
const TRACKER_DOMAINS = require('../data/tracker-domains.json');

export function setupTrackerBlocking() {
  const rules = TRACKER_DOMAINS.trackers.map((tracker, index) => ({
    id: index + 1,
    priority: 1,
    action: { type: "block" as const },
    condition: {
      urlFilter: `*${tracker.domain}*`,
      resourceTypes: ["script", "xmlhttprequest", "image"] as chrome.declarativeNetRequest.ResourceType[]
    }
  }));

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(r => r.id),
    addRules: rules
  });
}
```

3. **Track Blocked Requests**
```typescript
interface BlockedRequest {
  url: string;
  domain: string;
  category: string;
  timestamp: number;
}

let blockedRequests: Map<string, BlockedRequest[]> = new Map();

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = new URL(details.url);
    const domain = extractDomain(details.initiator || '');
    
    if (!blockedRequests.has(domain)) {
      blockedRequests.set(domain, []);
    }
    
    blockedRequests.get(domain)!.push({
      url: details.url,
      domain: url.hostname,
      category: getTrackerCategory(url.hostname),
      timestamp: Date.now()
    });
  },
  { urls: ["<all_urls>"] }
);
```

### Day 3: Cookie Management

#### Tasks
1. **Implement Cookie Scanner** (`src/utils/cookieManager.ts`)
```typescript
export async function scanCookies(domain: string) {
  const cookies = await chrome.cookies.getAll({ domain });
  
  const categorized = {
    essential: [] as chrome.cookies.Cookie[],
    tracking: [] as chrome.cookies.Cookie[],
    analytics: [] as chrome.cookies.Cookie[],
    advertising: [] as chrome.cookies.Cookie[]
  };

  cookies.forEach(cookie => {
    const category = categorizeCookie(cookie);
    categorized[category].push(cookie);
  });

  return categorized;
}

function categorizeCookie(cookie: chrome.cookies.Cookie): string {
  // Check against known tracking cookie patterns
  const trackingPatterns = ['_ga', '_gid', '_fbp', '__utm'];
  
  for (const pattern of trackingPatterns) {
    if (cookie.name.includes(pattern)) {
      return 'tracking';
    }
  }
  
  return 'essential';
}
```

2. **Add Cookie Blocking**
```typescript
export async function blockTrackingCookies(domain: string) {
  const cookies = await scanCookies(domain);
  
  for (const cookie of cookies.tracking) {
    await chrome.cookies.remove({
      url: `https://${cookie.domain}${cookie.path}`,
      name: cookie.name
    });
  }
}
```

### Day 4: Statistics & UI Integration

#### Tasks
1. **Update Background Script** to track stats
```typescript
interface PrivacyStats {
  domain: string;
  trackersBlocked: number;
  cookiesBlocked: number;
  requestsAnalyzed: number;
  lastUpdated: number;
}

const privacyStats = new Map<string, PrivacyStats>();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PRIVACY_STATS') {
    const stats = privacyStats.get(message.domain) || {
      domain: message.domain,
      trackersBlocked: 0,
      cookiesBlocked: 0,
      requestsAnalyzed: 0,
      lastUpdated: Date.now()
    };
    sendResponse({ stats });
  }
});
```

2. **Update Popup UI** (`src/popup/App.tsx`)
```typescript
const [stats, setStats] = useState<PrivacyStats | null>(null);

useEffect(() => {
  const loadStats = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url) {
      const domain = new URL(tab.url).hostname;
      const response = await chrome.runtime.sendMessage({
        type: 'GET_PRIVACY_STATS',
        domain
      });
      setStats(response.stats);
    }
  };
  
  loadStats();
  const interval = setInterval(loadStats, 1000);
  return () => clearInterval(interval);
}, []);

return (
  <div className="w-96 p-6">
    <h1 className="text-2xl font-bold mb-4">🛡️ PRISM</h1>
    
    <div className="bg-green-100 p-4 rounded-lg mb-4">
      <h2 className="font-semibold text-lg">Trackers Blocked</h2>
      <p className="text-3xl font-bold text-green-600">
        {stats?.trackersBlocked || 0}
      </p>
    </div>
    
    <div className="bg-blue-100 p-4 rounded-lg">
      <h2 className="font-semibold text-lg">Cookies Managed</h2>
      <p className="text-3xl font-bold text-blue-600">
        {stats?.cookiesBlocked || 0}
      </p>
    </div>
  </div>
);
```

### Day 5: Testing & Validation

#### Testing Checklist
1. **Automated Tests** (`tests/phase2.test.ts`)
```typescript
describe('Phase 2: Privacy Guardian', () => {
  test('blocks known tracking domains', async () => {
    // Test tracker blocking
  });

  test('categorizes cookies correctly', () => {
    // Test cookie categorization
  });

  test('updates statistics in real-time', () => {
    // Test stats updates
  });
});
```

2. **Manual Testing**
- [ ] Visit facebook.com - verify trackers blocked
- [ ] Visit google.com - verify analytics blocked
- [ ] Check popup - stats update in real-time
- [ ] Whitelist a domain - verify blocking disabled
- [ ] Test on 10+ different websites

3. **Performance Testing**
```bash
# Measure performance impact
# Page load time increase should be <5%
```

### Success Criteria (Must Pass 100%)
- ✅ Blocks 90%+ of known trackers
- ✅ Correctly categorizes cookies
- ✅ Statistics update in real-time
- ✅ Popup displays accurate data
- ✅ Page load impact <5%
- ✅ All automated tests pass (100%)
- ✅ Manual tests pass on 10+ websites

### Git Workflow
```bash
git checkout develop
git checkout -b feature/phase-2-privacy-guardian

# After completion
git add .
git commit -m "feat(phase-2): implement privacy guardian core

- Add tracker database (100+ domains)
- Implement declarativeNetRequest blocking
- Create cookie management system
- Build real-time statistics tracking
- Update popup UI with blocking stats
- All tests passing (100%)

Performance: <5% impact on page load
Tests: ✅ 100% passed
Status: Ready for Phase 3"

git push origin feature/phase-2-privacy-guardian
# Create PR, review, merge to develop
git checkout develop
git merge feature/phase-2-privacy-guardian
git tag -a v1.0-phase2 -m "Phase 2 Complete: Privacy Guardian"
git push origin develop --tags
```

---

## 📊 PHASE 3: Privacy Scoring System
**Duration**: 5 days  
**Status**: ⏳ Pending  
**Branch**: `feature/phase-3-privacy-scoring`

### Objectives
- Develop privacy score algorithm (0-100)
- Implement Chart.js visualizations
- Create historical tracking
- Build comprehensive dashboard

### Day 1-2: Scoring Algorithm

#### Tasks
1. **Create Scoring Engine** (`src/utils/privacy-scorer.ts`)
```typescript
interface PrivacyFactors {
  trackerCount: number;
  cookieCount: number;
  isHTTPS: boolean;
  hasDataForms: boolean;
  thirdPartyRequests: number;
  knownThreats: number;
}

export function calculatePrivacyScore(factors: PrivacyFactors): number {
  // Tracker score (40% weight)
  const trackerScore = Math.max(0, 100 - (factors.trackerCount * 3));
  
  // Cookie score (30% weight)
  const cookieScore = Math.max(0, 100 - (factors.cookieCount * 2));
  
  // HTTPS score (20% weight)
  const httpsScore = factors.isHTTPS ? 100 : 0;
  
  // Form/data collection score (10% weight)
  const formScore = factors.hasDataForms ? 70 : 100;
  
  const finalScore = Math.round(
    trackerScore * 0.4 +
    cookieScore * 0.3 +
    httpsScore * 0.2 +
    formScore * 0.1
  );
  
  return Math.max(0, Math.min(100, finalScore));
}

export function getScoreGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
}
```

2. **Integrate with Background Script**
```typescript
// Update service-worker.ts
import { calculatePrivacyScore } from '../utils/privacy-scorer';

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    analyzePagePrivacy(tab.url, tabId);
  }
});

async function analyzePagePrivacy(url: string, tabId: number) {
  const domain = new URL(url).hostname;
  
  const factors: PrivacyFactors = {
    trackerCount: getTrackerCount(domain),
    cookieCount: await getCookieCount(domain),
    isHTTPS: url.startsWith('https'),
    hasDataForms: await checkForForms(tabId),
    thirdPartyRequests: getThirdPartyCount(domain),
    knownThreats: 0
  };
  
  const score = calculatePrivacyScore(factors);
  
  // Store score
  await chrome.storage.local.set({
    [`score_${domain}`]: {
      score,
      factors,
      timestamp: Date.now()
    }
  });
  
  // Update badge
  chrome.action.setBadgeText({ 
    text: score.toString(),
    tabId 
  });
  
  chrome.action.setBadgeBackgroundColor({ 
    color: getScoreColor(score) === 'green' ? '#10B981' : 
           getScoreColor(score) === 'yellow' ? '#F59E0B' : '#EF4444',
    tabId
  });
}
```

### Day 3: Chart.js Integration

#### Tasks
1. **Install and Setup Chart.js**
```typescript
// src/popup/components/PrivacyScoreChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  score: number;
}

export const PrivacyScoreChart: React.FC<Props> = ({ score }) => {
  const data = {
    labels: ['Privacy Score', 'Risk'],
    datasets: [{
      data: [score, 100 - score],
      backgroundColor: [
        score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444',
        '#E5E7EB'
      ],
      borderWidth: 0
    }]
  };

  const options = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  };

  return (
    <div className="relative w-40 h-40">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl font-bold">{score}</p>
          <p className="text-sm text-gray-600">Score</p>
        </div>
      </div>
    </div>
  );
};
```

2. **Create Breakdown Chart**
```typescript
// src/popup/components/PrivacyBreakdown.tsx
import { Bar } from 'react-chartjs-2';

export const PrivacyBreakdown: React.FC<Props> = ({ factors }) => {
  const data = {
    labels: ['Trackers', 'Cookies', 'HTTPS', 'Forms'],
    datasets: [{
      label: 'Privacy Factors',
      data: [
        Math.max(0, 100 - factors.trackerCount * 3),
        Math.max(0, 100 - factors.cookieCount * 2),
        factors.isHTTPS ? 100 : 0,
        factors.hasDataForms ? 70 : 100
      ],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
    }]
  };

  return <Bar data={data} options={...} />;
};
```

### Day 4: Historical Tracking

#### Tasks
1. **Implement History Storage**
```typescript
interface HistoryEntry {
  domain: string;
  score: number;
  timestamp: number;
  factors: PrivacyFactors;
}

export async function saveHistoryEntry(entry: HistoryEntry) {
  const { history = [] } = await chrome.storage.local.get('history');
  history.push(entry);
  
  // Keep only last 1000 entries
  const trimmed = history.slice(-1000);
  await chrome.storage.local.set({ history: trimmed });
}

export async function getHistoryForDomain(domain: string, days = 7) {
  const { history = [] } = await chrome.storage.local.get('history');
  const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  return history.filter((entry: HistoryEntry) => 
    entry.domain === domain && entry.timestamp > cutoff
  );
}
```

2. **Create History Chart**
```typescript
// Line chart showing score over time
import { Line } from 'react-chartjs-2';

export const HistoryChart: React.FC<Props> = ({ domain }) => {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    getHistoryForDomain(domain).then(setHistory);
  }, [domain]);
  
  const data = {
    labels: history.map(h => new Date(h.timestamp).toLocaleDateString()),
    datasets: [{
      label: 'Privacy Score',
      data: history.map(h => h.score),
      borderColor: '#3B82F6',
      tension: 0.4
    }]
  };
  
  return <Line data={data} />;
};
```

### Day 5: Testing

#### Tests
```typescript
describe('Phase 3: Privacy Scoring', () => {
  test('calculates score correctly', () => {
    const score = calculatePrivacyScore({
      trackerCount: 5,
      cookieCount: 10,
      isHTTPS: true,
      hasDataForms: false,
      thirdPartyRequests: 15,
      knownThreats: 0
    });
    expect(score).toBeGreaterThan(60);
    expect(score).toBeLessThan(100);
  });

  test('stores history entries', async () => {
    await saveHistoryEntry({...});
    const history = await getHistoryForDomain('example.com');
    expect(history.length).toBeGreaterThan(0);
  });

  test('renders charts correctly', () => {
    // Chart rendering tests
  });
});
```

### Success Criteria (100%)
- ✅ Privacy scores calculate accurately
- ✅ Badge shows score on toolbar
- ✅ Charts render correctly
- ✅ History tracked and displayed
- ✅ All tests pass (100%)
- ✅ Performance <500ms dashboard load

### Git Workflow
```bash
git checkout develop
git checkout -b feature/phase-3-privacy-scoring

# After completion
git commit -m "feat(phase-3): implement privacy scoring system

- Create privacy score algorithm (0-100)
- Add Chart.js visualizations
- Implement historical tracking
- Build comprehensive dashboard
- All tests passing (100%)

Tests: ✅ 100% passed
Performance: Dashboard loads <500ms
Status: Ready for Phase 4"

git push origin feature/phase-3-privacy-scoring
# Merge to develop after review
```

---

## 🎭 PHASE 4-10: [Continues similarly...]

Each phase follows the same pattern:
1. **Clear objectives and deliverables**
2. **Day-by-day task breakdown**
3. **Code examples and implementation details**
4. **Comprehensive testing (automated + manual)**
5. **Success criteria (must achieve 100%)**
6. **Git workflow with proper commits and tags**

---

## 🧪 Phase 6: ML Training (CRITICAL)

### Python ML Setup (DETAILED)

```bash
# Create virtual environment
cd ml
python -m venv venv

# Activate (Windows)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import sklearn; import tensorflow; print('✅ ML packages installed')"
```

### Training Process (Step-by-step)

#### Step 1: Data Collection
```python
# ml/scripts/collect_data.py
import pandas as pd
from datasets import load_dataset

# Load PhishTank dataset
phishing_urls = pd.read_csv('data/raw/phishing_urls.csv')

# Load legitimate URLs from Alexa top 1M
legitimate_urls = pd.read_csv('data/raw/legitimate_urls.csv')

# Combine and label
data = pd.concat([
    phishing_urls.assign(label=1),
    legitimate_urls.assign(label=0)
])

print(f"✅ Collected {len(data)} URLs")
print(f"   Phishing: {sum(data.label == 1)}")
print(f"   Legitimate: {sum(data.label == 0)}")
```

#### Step 2: Feature Extraction
```python
# ml/feature_extraction.py
def extract_features(url):
    features = {}
    
    # URL-based features (25+ features)
    features['url_length'] = len(url)
    features['num_dots'] = url.count('.')
    features['num_hyphens'] = url.count('-')
    features['num_underscores'] = url.count('_')
    features['num_slashes'] = url.count('/')
    features['num_digits'] = sum(c.isdigit() for c in url)
    features['has_ip'] = 1 if re.match(r'\d+\.\d+\.\d+\.\d+', url) else 0
    features['has_https'] = 1 if url.startswith('https') else 0
    # ... 17+ more features
    
    return features
```

#### Step 3: Model Training
```python
# ml/train.py
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score

# Load and prepare data
X, y = load_features_and_labels()
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)

print(f"✅ Model Training Complete")
print(f"   Accuracy: {accuracy:.2%}")
print(f"   Precision: {precision:.2%}")
print(f"   Recall: {recall:.2%}")

# Save model
import joblib
joblib.dump(model, 'models/threat_detector/model.pkl')
```

#### Step 4: Model Testing (CRITICAL)
```python
# ml/tests/test_model.py
import pytest

def test_model_accuracy():
    """Model must achieve 95%+ accuracy"""
    accuracy = evaluate_model_accuracy()
    assert accuracy >= 0.95, f"Accuracy {accuracy:.2%} below 95% threshold"

def test_false_positive_rate():
    """False positive rate must be <2%"""
    fpr = calculate_false_positive_rate()
    assert fpr < 0.02, f"False positive rate {fpr:.2%} exceeds 2%"

def test_inference_speed():
    """Inference must be <100ms"""
    import time
    start = time.time()
    predict_url("https://example.com")
    duration = time.time() - start
    assert duration < 0.1, f"Inference took {duration:.3f}s (max 0.1s)"

# Run tests
pytest tests/ -v
```

#### Step 5: Model Conversion to TensorFlow.js
```python
# Convert to TensorFlow.js format
import tensorflowjs as tfjs

# Convert and save
tfjs.converters.save_keras_model(model, 'models/tfjs/')

print("✅ Model converted to TensorFlow.js")
print("   Ready for browser deployment")
```

### ML Phase Success Criteria (100% MANDATORY)
- ✅ Model accuracy ≥95%
- ✅ False positive rate <2%
- ✅ Inference time <100ms
- ✅ All unit tests pass
- ✅ Model exported to TensorFlow.js
- ✅ Integration tests with extension pass

---

## 📝 Git Workflow Summary

### Branch Strategy
```
main (production-ready only)
  └── develop (integration branch)
       ├── feature/phase-1-foundation
       ├── feature/phase-2-privacy-guardian
       ├── feature/phase-3-privacy-scoring
       ├── feature/phase-4-fake-data
       ├── feature/phase-5-phishing-detection
       ├── feature/phase-6-ml-training
       ├── feature/phase-7-ml-integration
       ├── feature/phase-8-ui-enhancement
       ├── feature/phase-9-testing
       └── feature/phase-10-deployment
```

### Commit Message Format
```
<type>(phase-X): <subject>

<body with details>

Tests: ✅ All passed / ⚠️ Some pending / ❌ Failed
Performance: <metrics>
Status: Ready for next phase / In progress / Blocked
```

### Phase Completion Checklist
Before moving to next phase:
- [ ] All features implemented
- [ ] All automated tests pass (100%)
- [ ] Manual testing complete
- [ ] Performance benchmarks met
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Committed with proper message
- [ ] Merged to develop branch
- [ ] Tagged with version
- [ ] Demo prepared

---

## 🎯 Final Success Metrics

### Extension Must:
- ✅ Block 95%+ of trackers
- ✅ Detect 95%+ of phishing sites
- ✅ Privacy scores accurate within ±5 points
- ✅ Page load impact <2%
- ✅ Memory usage <50MB
- ✅ All tests pass (100%)
- ✅ Work on top 100 websites
- ✅ Zero critical security vulnerabilities

### Deployment Ready When:
- ✅ All 10 phases complete (100%)
- ✅ Full test suite passing
- ✅ Security audit passed
- ✅ Performance optimized
- ✅ Documentation complete
- ✅ Chrome Web Store guidelines met

---

**Remember**: NO phase advance until current phase is 100% complete and tested!
