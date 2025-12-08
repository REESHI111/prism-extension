# Security Scoring System

## Overview

PRISM uses a **9-category weighted scoring system** to calculate a website's security and privacy score (0-100). Each category evaluates different privacy/security aspects and contributes to the final score based on its weight.

**Final Score** = Σ(CategoryScore × CategoryWeight) - GlobalPenalties

---

## Table of Contents

1. [Scoring Architecture](#scoring-architecture)
2. [Category 1: Trackers (20%)](#category-1-trackers-20)
3. [Category 2: Cookies (18%)](#category-2-cookies-18)
4. [Category 3: Total Requests (5%)](#category-3-total-requests-5)
5. [Category 4: Third-Party Requests (5%)](#category-4-third-party-requests-5)
6. [Category 5: ML Phishing Check (15%)](#category-5-ml-phishing-check-15)
7. [Category 6: SSL/TLS Encryption (15%)](#category-6-ssltls-encryption-15)
8. [Category 7: Privacy Policy (7%)](#category-7-privacy-policy-7)
9. [Category 8: Third-Party Scripts (10%)](#category-8-third-party-scripts-10)
10. [Category 9: Data Collection (5%)](#category-9-data-collection-5)
11. [Global Penalties](#global-penalties)
12. [Risk Levels](#risk-levels)
13. [Score Calculation Flow](#score-calculation-flow)
14. [Real-World Examples](#real-world-examples)

---

## Scoring Architecture

### Category Weights

```typescript
const CATEGORY_WEIGHTS = {
  trackers:           20%,  // Highest priority (tracking prevention)
  cookies:            18%,  // Second priority (third-party cookies)
  mlCheck:            15%,  // Phishing detection
  ssl:                15%,  // Encryption security
  thirdPartyScripts:  10%,  // External script risks
  privacyPolicy:      7%,   // Transparency
  totalRequests:      5%,   // Total network requests
  thirdPartyRequests: 5%,   // Third-party request ratio
  dataCollection:     5%    // Form/PII collection
};
// Total: 100%
```

### Why These Weights?

| Category | Weight | Reasoning |
|----------|--------|-----------|
| Trackers | 20% | **Most critical** - direct privacy invasion |
| Cookies | 18% | **Nearly as critical** - persistent tracking |
| ML Check | 15% | **High priority** - safety (phishing/malware) |
| SSL | 15% | **High priority** - connection security |
| Scripts | 10% | **Moderate** - supply chain risks |
| Privacy Policy | 7% | **Moderate** - transparency indicator |
| Total Requests | 5% | **Low** - informational only |
| Third-Party Requests | 5% | **Low** - context matters (CDNs) |
| Data Collection | 5% | **Low** - site functionality may require forms |

### Scoring Formula

```typescript
// 1. Calculate raw score for each category (0-100)
const categoryScores = {
  trackers: 85,
  cookies: 92,
  mlCheck: 100,
  // ... etc
};

// 2. Apply weights
let weightedScore = 0;
for (const [category, rawScore] of categoryScores) {
  const weight = CATEGORY_WEIGHTS[category];
  weightedScore += (rawScore * weight / 100);
}

// 3. Subtract global penalties
weightedScore -= globalPenalties;

// 4. Clamp to 0-100
const finalScore = Math.max(0, Math.min(100, weightedScore));
```

**Example Calculation**:
```
Trackers:           85 × 20% = 17.0
Cookies:            92 × 18% = 16.56
ML Check:          100 × 15% = 15.0
SSL:               100 × 15% = 15.0
Scripts:            95 × 10% = 9.5
Privacy Policy:    100 × 7%  = 7.0
Total Requests:    100 × 5%  = 5.0
Third-Party Req:    95 × 5%  = 4.75
Data Collection:   100 × 5%  = 5.0
                   ──────────
Subtotal:                   94.81
Global Penalties:           -0.0
                   ──────────
Final Score:                95
```

---

## Category 1: Trackers (20%)

### What We Measure

- **Trackers Blocked**: Number of tracking domains blocked
- **Fingerprint Attempts**: Canvas/WebGL/Audio fingerprinting attempts

### Scoring Formula

```typescript
let score = 100;

// Tracker count penalty
if (trackersBlocked === 0) {
  score = 100;  // Perfect
} else if (trackersBlocked <= 3) {
  score = 95;   // Very good
} else if (trackersBlocked <= 10) {
  score = 80;   // Good
} else if (trackersBlocked <= 20) {
  score = 60;   // Fair
} else {
  score = 30;   // Poor (20+ trackers)
}

// Fingerprinting penalty
if (fingerprintAttempts > 0) {
  score -= Math.min(fingerprintAttempts * 10, 30);
  // Max -30 points for fingerprinting
}

score = Math.max(0, score);
```

### Scoring Breakdown

| Trackers Blocked | Base Score | Risk Level |
|------------------|------------|------------|
| 0 | 100 | ✅ Excellent |
| 1-3 | 95 | ✅ Very Good |
| 4-10 | 80 | 👍 Good |
| 11-20 | 60 | ⚠️ Fair |
| 21+ | 30 | ❌ Poor |

**Fingerprinting Penalty**:
- 1 attempt: -10 points
- 2 attempts: -20 points
- 3+ attempts: -30 points (capped)

### Example

```typescript
// Example 1: Clean site
trackersBlocked: 0
fingerprintAttempts: 0
Score: 100 ✅

// Example 2: Few trackers
trackersBlocked: 5
fingerprintAttempts: 0
Score: 80 👍

// Example 3: Heavy tracking + fingerprinting
trackersBlocked: 25
fingerprintAttempts: 3
Score: 30 - 30 = 0 ❌
```

### Issues & Recommendations

**Issues Reported**:
- `15 trackers blocked`
- `2 fingerprinting attempts`

**Recommendations**:
- `Continue using tracker blocking`
- `Enable fingerprint protection`

---

## Category 2: Cookies (18%)

### What We Measure

- **Total Cookies**: All cookies (first-party + third-party)
- **Third-Party Cookies**: Tracking cookies from external domains
- **First-Party Cookies**: Necessary cookies from same domain

### Scoring Formula

**Key Principle**: Only penalize third-party cookies!

```typescript
const total = cookiesManaged || 0;
const thirdParty = thirdPartyCookies || 0;
const firstParty = total - thirdParty;

if (total === 0) {
  return 100;  // No cookies = perfect
}

// Formula: -1.8 points per 10 third-party cookies
let score = 100;
const deduction = (thirdParty / 10) * 1.8;
score = Math.max(0, score - deduction);
```

### Why -1.8 per 10 cookies?

**Linear scaling**:
- 10 third-party cookies → -1.8 points (98.2 score)
- 20 third-party cookies → -3.6 points (96.4 score)
- 50 third-party cookies → -9.0 points (91.0 score)
- 100 third-party cookies → -18.0 points (82.0 score)
- 200 third-party cookies → -36.0 points (64.0 score)
- 500 third-party cookies → -90.0 points (10.0 score)
- 556+ third-party cookies → -100+ points (0 score)

### First-Party vs Third-Party

**First-Party** (NO penalty):
```
Site: www.amazon.com
Cookie Domain: .amazon.com
→ Same base domain = First-party ✅
```

**Third-Party** (Penalized):
```
Site: www.amazon.com
Cookie Domain: .google-analytics.com
→ Different base domain = Third-party ❌
```

### Example Calculations

```typescript
// Example 1: Only necessary cookies
total: 10
thirdParty: 0
firstParty: 10
Deduction: 0 / 10 * 1.8 = 0
Score: 100 ✅

// Example 2: Some tracking
total: 30
thirdParty: 15
firstParty: 15
Deduction: 15 / 10 * 1.8 = 2.7
Score: 100 - 2.7 = 97.3 ✅

// Example 3: Heavy tracking
total: 80
thirdParty: 60
firstParty: 20
Deduction: 60 / 10 * 1.8 = 10.8
Score: 100 - 10.8 = 89.2 👍

// Example 4: Excessive tracking
total: 150
thirdParty: 120
firstParty: 30
Deduction: 120 / 10 * 1.8 = 21.6
Score: 100 - 21.6 = 78.4 ⚠️
```

### Issues & Recommendations

**Issues Reported**:
- `45 third-party cookies (-8.1 pts)`
- `12 first-party cookies (no penalty)`

**Recommendations**:
- `Block third-party tracking cookies` (if thirdParty > 20)

---

## Category 3: Total Requests (5%)

### What We Measure

- **Total Requests**: All network requests (scripts, images, CSS, fonts, etc.)
- **First-Party Requests**: Requests to same domain

### Scoring Formula

```typescript
const total = totalRequests || 0;
const firstParty = total - thirdPartyRequests;

if (total === 0) {
  return 100;  // No data yet
}

// Only penalize EXCESSIVE requests (500+)
let score = 100;
if (total > 500) {
  score = 70;  // Very high
} else if (total > 200) {
  score = 95;  // High but acceptable
} else {
  score = 100; // Normal
}
```

### Scoring Breakdown

| Total Requests | Score | Meaning |
|----------------|-------|---------|
| 0-200 | 100 | ✅ Normal |
| 201-500 | 95 | 👍 High but acceptable |
| 501+ | 70 | ⚠️ Excessive |

### Why Low Weight (5%)?

Request count is **informational only**. Modern websites need many requests:
- Images: 20-50
- Scripts: 10-30
- CSS/Fonts: 5-10
- API calls: 10-50
- CDN assets: Variable

**Total**: 50-200 requests is normal for modern apps!

### Example

```typescript
// Example 1: Simple site
totalRequests: 45
Score: 100 ✅

// Example 2: Modern app
totalRequests: 180
Score: 100 ✅ (acceptable)

// Example 3: Heavy site
totalRequests: 350
Score: 95 👍 (still okay)

// Example 4: Excessive
totalRequests: 620
Score: 70 ⚠️
```

### Issues & Recommendations

**Issues Reported**:
- `180 total requests (98 first-party)`
- `620 total requests (very high)`

**Recommendations**:
- `Site may be resource-heavy` (if > 500)

---

## Category 4: Third-Party Requests (5%)

### What We Measure

- **Third-Party Requests**: Requests to external domains
- **Third-Party Ratio**: Percentage of external requests

### Scoring Formula

```typescript
const total = totalRequests || 0;
const thirdParty = thirdPartyRequests || 0;
const ratio = total > 0 ? thirdParty / total : 0;
const ratioPercent = Math.round(ratio * 100);

let score = 100;

if (ratio <= 0.30) {
  score = 100;  // 0-30% = Excellent
} else if (ratio <= 0.50) {
  score = 95;   // 31-50% = Very Good
} else if (ratio <= 0.70) {
  score = 85;   // 51-70% = Good (CDN/media)
} else if (ratio <= 0.85) {
  score = 70;   // 71-85% = Fair
} else {
  score = 50;   // 86%+ = Poor
}
```

### Scoring Breakdown

| Ratio | Score | Risk Level | Meaning |
|-------|-------|------------|---------|
| 0-30% | 100 | ✅ Excellent | Mostly self-hosted |
| 31-50% | 95 | ✅ Very Good | Some external assets |
| 51-70% | 85 | 👍 Good | Acceptable (CDN/media) |
| 71-85% | 70 | ⚠️ Fair | High external dependency |
| 86%+ | 50 | ❌ Poor | Excessive third-party |

### Why Ratio Instead of Count?

**Context matters!**

```typescript
// Example 1: High count, low ratio (GOOD)
total: 500
thirdParty: 100
ratio: 20%
→ Heavy site, but mostly first-party ✅

// Example 2: Low count, high ratio (BAD)
total: 50
thirdParty: 45
ratio: 90%
→ Small site, almost all external ❌
```

### Example Calculations

```typescript
// Example 1: Self-hosted site
total: 120
thirdParty: 25
ratio: 25 / 120 = 20.8%
Score: 100 ✅

// Example 2: CDN for images
total: 200
thirdParty: 90
ratio: 90 / 200 = 45%
Score: 95 ✅

// Example 3: Video platform
total: 350
thirdParty: 220
ratio: 220 / 350 = 62.8%
Score: 85 👍 (acceptable for video)

// Example 4: Excessive dependencies
total: 100
thirdParty: 88
ratio: 88 / 100 = 88%
Score: 50 ❌
```

### Issues & Recommendations

**Issues Reported**:
- `✓ Low third-party ratio (25%)`
- `62% third-party (acceptable for CDN)`
- `88% third-party requests (very high)`

**Recommendations**:
- `Consider reducing third-party dependencies` (if ratio > 70%)
- `Excessive third-party dependencies detected` (if ratio > 85%)

---

## Category 5: ML Phishing Check (15%)

### What We Measure

- **ML Risk Score**: 0-100 phishing probability (from logistic regression model)
- **Is Phishing**: Binary classification (> 50% confidence)
- **Risk Level**: Low, Medium, High, Critical
- **SSL Validity**: Certificate check

### Scoring Formula

```typescript
if (mlRiskScore !== undefined) {
  // Invert: 0 risk = 100 score, 100 risk = 0 score
  const score = Math.max(0, 100 - mlRiskScore);
  
  return score;
}

// Fallback if ML not run yet
return 100;  // Pending
```

### Scoring Breakdown

| ML Risk Score | Score | Risk Level | Meaning |
|---------------|-------|------------|---------|
| 0-10 | 90-100 | ✅ Low | Legitimate site |
| 11-30 | 70-89 | 👍 Low-Medium | Likely safe |
| 31-50 | 50-69 | ⚠️ Medium | Suspicious patterns |
| 51-70 | 30-49 | ❌ High | Likely phishing |
| 71-100 | 0-29 | 🚨 Critical | Definite phishing |

### ML Model Output

The ML model (Logistic Regression with 55 features) returns:

```typescript
interface MLPrediction {
  risk_score: number;      // 0-100 (phishing probability)
  risk_level: string;      // 'Low', 'Medium', 'High', 'Critical'
  confidence: number;      // 0-1 (model confidence)
  is_phishing: boolean;    // true if risk_score > 50
  ssl_valid: boolean;      // SSL certificate status
}
```

### Example

```typescript
// Example 1: Legitimate site
mlRiskScore: 5
mlIsPhishing: false
mlConfidence: 0.98
Score: 100 - 5 = 95 ✅

// Example 2: Suspicious URL
mlRiskScore: 45
mlIsPhishing: false
mlConfidence: 0.67
Score: 100 - 45 = 55 ⚠️

// Example 3: Phishing detected
mlRiskScore: 85
mlIsPhishing: true
mlConfidence: 0.92
Score: 100 - 85 = 15 🚨
```

### Issues & Recommendations

**Issues Reported**:
- `✓ ML verified safe (98.0% confidence)`
- `✓ Valid SSL certificate`
- `⚠️ ML detected phishing (High)`
- `Risk score: 85/100`
- `SSL certificate invalid`

**Recommendations**:
- `Exercise extreme caution on this site` (if is_phishing)

---

## Category 6: SSL/TLS Encryption (15%)

### What We Measure

- **Has SSL**: HTTPS protocol used
- **SSL Strength**: Strong/Medium/Weak cipher
- **SSL Expired**: Certificate expiration

### Scoring Formula

```typescript
const hasSSL = hasSSL ?? true;
const strength = sslStrength || 'strong';
const expired = sslExpired || false;

let score = 100;

if (!hasSSL) {
  score = 0;   // No HTTPS = 0 score
} else if (expired) {
  score = 20;  // Expired certificate
} else if (strength === 'weak') {
  score = 60;  // Weak SSL config
} else if (strength === 'medium') {
  score = 85;  // Medium SSL config
} else {
  score = 100; // Strong HTTPS
}
```

### Scoring Breakdown

| SSL Status | Score | Risk Level |
|------------|-------|------------|
| Strong HTTPS | 100 | ✅ Excellent |
| Medium HTTPS | 85 | 👍 Good |
| Weak HTTPS | 60 | ⚠️ Fair |
| Expired Cert | 20 | ❌ Poor |
| No HTTPS | 0 | 🚨 Dangerous |

### Why So Important (15%)?

**SSL protects**:
- Login credentials
- Payment information
- Personal data
- Session cookies
- All transmitted data

**No SSL = All data visible to attackers!**

### Example

```typescript
// Example 1: Strong HTTPS
hasSSL: true
strength: 'strong'
expired: false
Score: 100 ✅

// Example 2: Weak config
hasSSL: true
strength: 'weak'
expired: false
Score: 60 ⚠️

// Example 3: No encryption
hasSSL: false
Score: 0 🚨
```

### Issues & Recommendations

**Issues Reported**:
- `✓ Strong HTTPS encryption`
- `Weak SSL configuration`
- `⚠️ SSL certificate expired`
- `🚨 No HTTPS encryption`

**Recommendations**:
- `Use HTTPS for security` (if no SSL)
- `Update SSL certificate` (if expired)

---

## Category 7: Privacy Policy (7%)

### What We Measure

- **Has Privacy Policy**: Link/page found
- **Privacy Policy Accessible**: Link works, page loads

### Scoring Formula

```typescript
const hasPolicy = hasPrivacyPolicy || false;
const accessible = privacyPolicyAccessible ?? hasPolicy;

let score = 100;

if (!hasPolicy) {
  score = 0;   // No policy found
} else if (!accessible) {
  score = 85;  // Found but not accessible
} else {
  score = 100; // Found and accessible
}
```

### Scoring Breakdown

| Status | Score | Meaning |
|--------|-------|---------|
| Found & Accessible | 100 | ✅ Excellent |
| Found (not verified) | 85 | 👍 Good |
| Not Found | 0 | ❌ Poor |

### Why Lower Weight (7%)?

**Privacy policy is**:
- ✅ Important for transparency
- ✅ Legal requirement in many jurisdictions
- ❌ NOT a guarantee of good practices
- ❌ Can exist but be misleading

**Having a policy ≠ Being private!**

### Detection Method

Content script scans for:
- Footer links containing "privacy"
- Link text: "Privacy Policy", "Privacy Notice", "Data Protection"
- URLs: `/privacy`, `/privacy-policy`, `/legal/privacy`

### Example

```typescript
// Example 1: Policy found
hasPolicy: true
accessible: true
Score: 100 ✅

// Example 2: No policy
hasPolicy: false
Score: 0 ❌
```

### Issues & Recommendations

**Issues Reported**:
- `✓ Privacy policy available`
- `No privacy policy found`

**Recommendations**:
- `Look for privacy policy` (if not found)

---

## Category 8: Third-Party Scripts (10%)

### What We Measure

- **Third-Party Scripts**: Number of `<script src="...">` tags from external domains

### Scoring Formula

```typescript
const count = thirdPartyScripts || 0;

let score = 100;

if (count === 0) {
  score = 100;  // No external scripts
} else if (count <= 10) {
  score = 95;   // Few scripts
} else if (count <= 25) {
  score = 85;   // Moderate (modern apps)
} else if (count <= 50) {
  score = 70;   // Many (video platforms)
} else {
  score = 50;   // Excessive (50+)
}
```

### Scoring Breakdown

| Script Count | Score | Risk Level | Meaning |
|--------------|-------|------------|---------|
| 0 | 100 | ✅ Excellent | Fully self-hosted |
| 1-10 | 95 | ✅ Very Good | Minimal dependencies |
| 11-25 | 85 | 👍 Good | Acceptable for modern apps |
| 26-50 | 70 | ⚠️ Fair | Heavy (video/complex apps) |
| 51+ | 50 | ❌ Poor | Excessive dependencies |

### Why Monitor Scripts?

**Third-party scripts can**:
- Execute arbitrary code
- Access page data (XSS)
- Modify page content
- Send data to external servers
- Introduce vulnerabilities

**Supply chain risk**: Compromised script → Site compromised!

### Script vs Request Difference

**Scripts** (this category):
- Only `<script src="...">` tags
- Security risk focus

**Requests** (Category 4):
- All resources (images, CSS, fonts, etc.)
- Privacy risk focus

### Example

```typescript
// Example 1: Self-hosted
thirdPartyScripts: 0
Score: 100 ✅

// Example 2: Analytics + CDN
thirdPartyScripts: 8
Score: 95 ✅

// Example 3: Modern web app
thirdPartyScripts: 18
Score: 85 👍

// Example 4: Video platform (YouTube)
thirdPartyScripts: 42
Score: 70 ⚠️

// Example 5: Excessive
thirdPartyScripts: 65
Score: 50 ❌
```

### Issues & Recommendations

**Issues Reported**:
- `8 third-party scripts`
- `42 third-party scripts (acceptable for complex apps)`
- `65 third-party scripts (very high)`

**Recommendations**:
- `Review script necessity` (if > 50)

---

## Category 9: Data Collection (5%)

### What We Measure

- **Forms Detected**: Number of `<form>` elements
- **PII Collected**: Personally Identifiable Information detected

### Scoring Formula

```typescript
const forms = formsDetected || 0;
const pii = piiCollected || false;

let score = 100;

if (pii) {
  score -= 50;  // PII collection penalty
}

if (forms > 5) {
  score -= 20;  // Many forms penalty
}

score = Math.max(0, score);
```

### Scoring Breakdown

| Forms | PII | Score | Meaning |
|-------|-----|-------|---------|
| 0 | No | 100 | ✅ No data collection |
| 1-5 | No | 100 | ✅ Normal |
| 6+ | No | 80 | 👍 Many forms |
| 0-5 | Yes | 50 | ⚠️ PII detected |
| 6+ | Yes | 30 | ❌ Excessive collection |

### Why Low Weight (5%)?

**Forms are often necessary**:
- Login: username + password
- Checkout: shipping + payment
- Contact: name + email + message
- Search: query input

**Not all data collection is bad!**

### PII Detection

**Scans for**:
- Social Security Numbers
- Credit card numbers
- Phone numbers (formatted)
- Email addresses
- Date of birth fields

### Example

```typescript
// Example 1: No forms
forms: 0
pii: false
Score: 100 ✅

// Example 2: Login form
forms: 1
pii: false
Score: 100 ✅

// Example 3: Many forms
forms: 8
pii: false
Score: 100 - 20 = 80 👍

// Example 4: PII collected
forms: 3
pii: true
Score: 100 - 50 = 50 ⚠️

// Example 5: Excessive
forms: 10
pii: true
Score: 100 - 50 - 20 = 30 ❌
```

### Issues & Recommendations

**Issues Reported**:
- `8 forms detected`
- `PII collection detected`

**Recommendations**:
- `Review data collection necessity` (if PII)

---

## Global Penalties

### Applied After Weighted Sum

Global penalties deduct points **after** all category scores are calculated.

```typescript
let totalPenalty = 0;
const messages = [];

// HTTP-only penalty
if (!hasSSL) {
  totalPenalty += 10;
  messages.push('HTTP only (-10 points)');
}

// Threat penalty (capped at 15)
const threats = threatsDetected || 0;
if (threats > 0) {
  const threatPenalty = Math.min(15, threats * 2);
  totalPenalty += threatPenalty;
  messages.push(`${threats} threats (-${threatPenalty} points)`);
}

// SSL expired
if (sslExpired) {
  totalPenalty += 15;
  messages.push('SSL expired (-15 points)');
}

// PII leak
if (piiCollected) {
  totalPenalty += 10;
  messages.push('PII collected (-10 points)');
}

finalScore -= totalPenalty;
```

### Penalty Summary

| Penalty | Points | Trigger |
|---------|--------|---------|
| HTTP only | -10 | No HTTPS |
| SSL expired | -15 | Expired certificate |
| Threats | -2 to -15 | Security threats (capped) |
| PII collection | -10 | Personal data collected |

### Why Global Penalties?

**Critical issues deserve immediate impact**:
- No HTTPS → Already scored 0 in SSL category (15%), but -10 more emphasizes severity
- Expired SSL → Scored 20 in SSL category, -15 more = total impact
- Threats → May not fit one category, global penalty applies across all

---

## Risk Levels

### Risk Level Thresholds

```typescript
function getRiskLevel(score: number): RiskLevel {
  if (score >= 90) return 'Excellent';
  if (score >= 75) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 25) return 'Poor';
  return 'Dangerous';
}
```

| Score Range | Risk Level | Color | Icon | Meaning |
|-------------|------------|-------|------|---------|
| 90-100 | Excellent | 🟢 Green | ✅ | Very safe to use |
| 75-89 | Good | 🔵 Blue | 👍 | Generally safe |
| 50-74 | Fair | 🟡 Yellow | ⚠️ | Use with caution |
| 25-49 | Poor | 🟠 Orange | ⛔ | Significant risks |
| 0-24 | Dangerous | 🔴 Red | 🚨 | Do not use |

### Warning Overlay Triggers

**Only CRITICAL threats show warning**:

```typescript
// CRITICAL: Show warning overlay
1. No HTTPS encryption
2. SSL certificate expired
3. Security threats detected (malware, phishing)

// HIGH: Track but no overlay
4. Excessive fingerprinting (10+ attempts)
5. Excessive tracking (50+ trackers)

// MEDIUM: Track but no overlay
6. PII collection detected
```

---

## Score Calculation Flow

### Step-by-Step Process

```
User Visits Website
       │
       ▼
┌────────────────────────────────────────┐
│ Collect Privacy Factors                │
│ • Trackers blocked                     │
│ • Cookies (first/third-party)          │
│ • Requests (total/third-party)         │
│ • ML phishing check                    │
│ • SSL status                           │
│ • Privacy policy                       │
│ • Third-party scripts                  │
│ • Forms/PII                            │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ Calculate Category Scores (0-100)      │
│                                        │
│ Category 1: Trackers       → 85        │
│ Category 2: Cookies        → 92        │
│ Category 3: Total Requests → 100       │
│ Category 4: Third-Party    → 95        │
│ Category 5: ML Check       → 100       │
│ Category 6: SSL            → 100       │
│ Category 7: Privacy Policy → 100       │
│ Category 8: Scripts        → 95        │
│ Category 9: Data Collection→ 100       │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ Apply Category Weights                 │
│                                        │
│ 85 × 20% = 17.0   (Trackers)          │
│ 92 × 18% = 16.56  (Cookies)           │
│ 100 × 5% = 5.0    (Total Requests)    │
│ 95 × 5%  = 4.75   (Third-Party Req)   │
│ 100 × 15%= 15.0   (ML Check)          │
│ 100 × 15%= 15.0   (SSL)               │
│ 100 × 7% = 7.0    (Privacy Policy)    │
│ 95 × 10% = 9.5    (Scripts)           │
│ 100 × 5% = 5.0    (Data Collection)   │
│ ─────────────────                     │
│ Subtotal: 94.81                       │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ Apply Global Penalties                 │
│                                        │
│ HTTP only:      -0 (has HTTPS)        │
│ SSL expired:    -0 (valid)            │
│ Threats:        -0 (none)             │
│ PII collected:  -0 (none)             │
│ ─────────────────                     │
│ Total Penalty: 0                      │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ Calculate Final Score                  │
│                                        │
│ 94.81 - 0 = 94.81                     │
│ Round: 95                             │
│ Clamp: max(0, min(100, 95)) = 95      │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ Determine Risk Level                   │
│                                        │
│ Score: 95                             │
│ Risk Level: Excellent (90-100)        │
│ Color: Green                          │
│ Icon: ✅                              │
└──────────────┬─────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│ Display to User                        │
│                                        │
│ Security Score: 95                    │
│ Risk Level: Excellent ✅              │
│ [View Score Breakdown]                │
└────────────────────────────────────────┘
```

---

## Real-World Examples

### Example 1: Google.com

**Privacy Factors**:
```typescript
{
  trackersBlocked: 0,
  fingerprintAttempts: 0,
  cookiesManaged: 15,
  thirdPartyCookies: 0,   // All Google's own cookies
  totalRequests: 85,
  thirdPartyRequests: 12,
  hasSSL: true,
  sslStrength: 'strong',
  hasPrivacyPolicy: true,
  privacyPolicyAccessible: true,
  thirdPartyScripts: 0,
  formsDetected: 1,
  piiCollected: false,
  mlRiskScore: 2,
  mlIsPhishing: false
}
```

**Category Scores**:
```
Trackers:           100 × 20% = 20.0
Cookies:            100 × 18% = 18.0  (all first-party)
Total Requests:     100 × 5%  = 5.0
Third-Party Req:    100 × 5%  = 5.0   (14% ratio)
ML Check:           98 × 15%  = 14.7
SSL:                100 × 15% = 15.0
Privacy Policy:     100 × 7%  = 7.0
Third-Party Scripts: 100 × 10% = 10.0
Data Collection:    100 × 5%  = 5.0
                    ─────────
Subtotal:                    99.7
Global Penalties:            -0.0
                    ─────────
Final Score:                 100
```

**Result**: 100 - Excellent ✅

---

### Example 2: YouTube.com

**Privacy Factors**:
```typescript
{
  trackersBlocked: 8,      // Google Analytics, DoubleClick
  fingerprintAttempts: 1,
  cookiesManaged: 45,
  thirdPartyCookies: 18,   // Ad trackers
  totalRequests: 280,
  thirdPartyRequests: 170,
  hasSSL: true,
  sslStrength: 'strong',
  hasPrivacyPolicy: true,
  privacyPolicyAccessible: true,
  thirdPartyScripts: 35,   // Video player, ads, analytics
  formsDetected: 2,
  piiCollected: false,
  mlRiskScore: 5,
  mlIsPhishing: false
}
```

**Category Scores**:
```
Trackers:           80 × 20% = 16.0   (8 trackers, -10 for fingerprint)
Cookies:            96.8 × 18% = 17.4 (18 third-party: -3.2)
Total Requests:     95 × 5%  = 4.75   (280 requests, high)
Third-Party Req:    85 × 5%  = 4.25   (60% ratio)
ML Check:           95 × 15% = 14.25
SSL:                100 × 15% = 15.0
Privacy Policy:     100 × 7%  = 7.0
Third-Party Scripts: 70 × 10% = 7.0   (35 scripts)
Data Collection:    100 × 5%  = 5.0
                    ─────────
Subtotal:                    90.65
Global Penalties:            -0.0
                    ─────────
Final Score:                 91
```

**Result**: 91 - Excellent ✅

---

### Example 3: News Site (Heavy Ads)

**Privacy Factors**:
```typescript
{
  trackersBlocked: 32,     // Many ad trackers
  fingerprintAttempts: 4,
  cookiesManaged: 85,
  thirdPartyCookies: 68,   // Lots of ad cookies
  totalRequests: 420,
  thirdPartyRequests: 310,
  hasSSL: true,
  sslStrength: 'strong',
  hasPrivacyPolicy: true,
  privacyPolicyAccessible: true,
  thirdPartyScripts: 48,   // Many ad scripts
  formsDetected: 3,
  piiCollected: false,
  mlRiskScore: 12,
  mlIsPhishing: false
}
```

**Category Scores**:
```
Trackers:           30 × 20% = 6.0    (32 trackers, -30 for fingerprints)
Cookies:            87.8 × 18% = 15.8 (68 third-party: -12.2)
Total Requests:     95 × 5%  = 4.75   (420 requests)
Third-Party Req:    70 × 5%  = 3.5    (74% ratio)
ML Check:           88 × 15% = 13.2
SSL:                100 × 15% = 15.0
Privacy Policy:     100 × 7%  = 7.0
Third-Party Scripts: 70 × 10% = 7.0   (48 scripts)
Data Collection:    100 × 5%  = 5.0
                    ─────────
Subtotal:                    77.25
Global Penalties:            -0.0
                    ─────────
Final Score:                 77
```

**Result**: 77 - Good 👍

---

### Example 4: Phishing Site

**Privacy Factors**:
```typescript
{
  trackersBlocked: 0,
  fingerprintAttempts: 0,
  cookiesManaged: 2,
  thirdPartyCookies: 0,
  totalRequests: 15,
  thirdPartyRequests: 3,
  hasSSL: false,          // ⚠️ No HTTPS!
  sslStrength: 'weak',
  hasPrivacyPolicy: false,
  privacyPolicyAccessible: false,
  thirdPartyScripts: 1,
  formsDetected: 1,       // Login form
  piiCollected: true,     // ⚠️ Collecting credentials
  mlRiskScore: 92,        // ⚠️ ML detected phishing!
  mlIsPhishing: true,
  threatsDetected: 1
}
```

**Category Scores**:
```
Trackers:           100 × 20% = 20.0
Cookies:            100 × 18% = 18.0
Total Requests:     100 × 5%  = 5.0
Third-Party Req:    100 × 5%  = 5.0   (20% ratio)
ML Check:           8 × 15%   = 1.2   (92 risk score!)
SSL:                0 × 15%   = 0.0   (No HTTPS!)
Privacy Policy:     0 × 7%    = 0.0
Third-Party Scripts: 95 × 10% = 9.5
Data Collection:    50 × 5%   = 2.5   (PII collected)
                    ─────────
Subtotal:                    61.2
Global Penalties:
  - HTTP only:               -10
  - Threats (1):             -2
  - PII collected:           -10
                    ─────────
Total Penalties:             -22
                    ─────────
Final Score:                 39.2 → 39
```

**Result**: 39 - Poor ⛔

**Warning Overlay**: YES (No HTTPS + Threat detected)

---

### Example 5: Banking Site

**Privacy Factors**:
```typescript
{
  trackersBlocked: 1,      // Minimal tracking
  fingerprintAttempts: 0,
  cookiesManaged: 8,
  thirdPartyCookies: 1,    // Session management
  totalRequests: 45,
  thirdPartyRequests: 5,
  hasSSL: true,
  sslStrength: 'strong',
  hasPrivacyPolicy: true,
  privacyPolicyAccessible: true,
  thirdPartyScripts: 2,    // Security vendor
  formsDetected: 2,        // Login + transfer
  piiCollected: false,     // Secure handling
  mlRiskScore: 3,
  mlIsPhishing: false
}
```

**Category Scores**:
```
Trackers:           95 × 20% = 19.0   (1 tracker)
Cookies:            99.8 × 18% = 18.0 (1 third-party: -0.2)
Total Requests:     100 × 5%  = 5.0
Third-Party Req:    100 × 5%  = 5.0   (11% ratio)
ML Check:           97 × 15%  = 14.55
SSL:                100 × 15% = 15.0
Privacy Policy:     100 × 7%  = 7.0
Third-Party Scripts: 95 × 10% = 9.5   (2 scripts)
Data Collection:    100 × 5%  = 5.0
                    ─────────
Subtotal:                    98.05
Global Penalties:            -0.0
                    ─────────
Final Score:                 98
```

**Result**: 98 - Excellent ✅

---

## Conclusion

PRISM's 9-category scoring system provides:

✅ **Comprehensive Analysis**: 9 different privacy/security aspects  
✅ **Weighted Importance**: Critical issues (trackers, SSL) get higher weight  
✅ **Fair Scoring**: Only penalizes harmful behavior (third-party cookies, not first-party)  
✅ **Transparent**: Full breakdown shown to user  
✅ **Actionable**: Specific issues + recommendations  
✅ **Real-Time**: Updates every 2 seconds  
✅ **Accurate**: ML model + multi-factor analysis  

**Score Ranges**:
- **90-100**: Excellent ✅ - Use freely
- **75-89**: Good 👍 - Generally safe
- **50-74**: Fair ⚠️ - Use with caution
- **25-49**: Poor ⛔ - Significant risks
- **0-24**: Dangerous 🚨 - Avoid!

**All calculations happen locally in your browser - no data ever sent to external servers!** 🔒
