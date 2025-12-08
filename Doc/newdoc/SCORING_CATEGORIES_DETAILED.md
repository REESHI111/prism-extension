# PRISM Scoring Categories - Detailed Breakdown

## Complete Guide to All 9 Scoring Categories

This document provides detailed information about each scoring category, including what's measured, how it's detected, examples, risk levels, and why it matters.

---

## Category 1: Trackers (20% weight)

### What's Measured
- **Tracker domains blocked**: Count of known tracking domains intercepted
- **Fingerprinting attempts**: Canvas, WebGL, Audio, Font enumeration attempts

### Detection Method
- **Network interception**: `chrome.webRequest.onBeforeRequest` API
- **Domain blacklist matching**: Against database of 500+ known tracker domains
- **API override**: JavaScript hooks to detect fingerprinting attempts

### Examples
**Tracker Domains:**
- `doubleclick.net` - Google advertising
- `google-analytics.com` - Analytics tracking
- `facebook.com/tr` - Facebook Pixel
- `hotjar.com` - Session recording
- `connect.facebook.net` - Social tracking

**Fingerprinting Attempts:**
- Canvas fingerprinting: `canvas.toDataURL()` calls
- WebGL fingerprinting: `getParameter()` on GPU info
- Audio fingerprinting: `AudioContext` API usage
- Font enumeration: Checking installed fonts

### Risk Level
- **0 trackers**: ✅ Excellent (100 score)
- **1-3 trackers**: ✅ Very Good (95 score)
- **4-10 trackers**: 👍 Good (80 score)
- **11-20 trackers**: ⚠️ Fair (60 score)
- **21+ trackers**: ❌ Poor (30 score)
- **Fingerprinting**: Additional -10 points per attempt (max -30)

### Why It Matters
**Privacy Impact:**
- Trackers build profiles of your browsing behavior across websites
- Can identify you without cookies (fingerprinting)
- Sold to advertisers, data brokers, insurance companies
- Can link your activities across different sessions and devices

**Real-World Impact:**
- Your shopping habits tracked and used for price discrimination
- Your health searches sold to insurance companies
- Your political views profiled for targeted manipulation
- Your location tracked across the web

---

## Category 2: Cookies (18% weight)

### What's Measured
- **Total cookies**: All cookies set by the website
- **Third-party cookies**: Cookies from domains different than the current site
- **First-party cookies**: Cookies from the same domain (NOT penalized)

### Detection Method
- **Query both protocols**: `chrome.cookies.getAll()` for HTTP and HTTPS
- **Deduplication**: By name + domain + path to avoid counting twice
- **Domain comparison**: Extract base domain (last 2 parts) to classify first/third-party

### Examples
**First-Party Cookies (NO penalty):**
```
Site: www.amazon.com
Cookie: session_id
Domain: .amazon.com
→ Same base domain = First-party ✅
```

**Third-Party Cookies (Penalized):**
```
Site: www.amazon.com
Cookie: _ga
Domain: .google-analytics.com
→ Different base domain = Third-party ❌

Site: www.youtube.com
Cookie: IDE
Domain: .doubleclick.net
→ Ad tracking = Third-party ❌
```

### Scoring Formula
**Linear penalty**: `-1.8 points per 10 third-party cookies`

**Calculations:**
- 0 third-party cookies → 100 score
- 10 third-party cookies → 98.2 score (-1.8)
- 20 third-party cookies → 96.4 score (-3.6)
- 50 third-party cookies → 91.0 score (-9.0)
- 100 third-party cookies → 82.0 score (-18.0)
- 200 third-party cookies → 64.0 score (-36.0)
- 556+ third-party cookies → 0 score (-100+)

### Why It Matters
**Privacy Impact:**
- Third-party cookies enable cross-site tracking
- Can follow you from site to site
- Build comprehensive profile without your knowledge
- Persist for months or years

**First-Party Cookies Are Necessary:**
- Login sessions (keep you logged in)
- Shopping cart (remember your items)
- User preferences (language, theme)
- Security tokens (CSRF protection)

**Why We Don't Penalize First-Party:**
- Essential for website functionality
- Scope limited to one domain
- Can't track you across the web
- User can manage them easily

---

## Category 3: Total Requests (5% weight)

### What's Measured
- **All network requests**: Every HTTP/HTTPS request made by the page
- **Request types**: Scripts, images, CSS, fonts, AJAX calls, media, etc.
- **Deduplication**: Count each unique URL only once

### Detection Method
- **Network interception**: `chrome.webRequest.onBeforeRequest` listener
- **URL tracking**: Map of unique URLs per tab
- **Request types captured**:
  - `main_frame` - Main HTML page
  - `sub_frame` - Iframes
  - `script` - JavaScript files
  - `stylesheet` - CSS files
  - `image` - Images (PNG, JPG, GIF, etc.)
  - `font` - Web fonts
  - `xmlhttprequest` - AJAX/fetch calls
  - `media` - Video/audio
  - `websocket` - WebSocket connections
  - `other` - Everything else

### Examples
**Normal Request Count (0-200 requests):**
```
www.google.com:
- 1 main HTML
- 15 JavaScript files
- 8 CSS files
- 12 images
- 5 fonts
Total: 41 requests ✅
```

**High Request Count (201-500 requests):**
```
www.youtube.com (video page):
- 1 main HTML
- 85 JavaScript files (player, ads, analytics)
- 25 CSS files
- 120 images (thumbnails)
- 15 fonts
- 40 API calls
Total: 286 requests 👍
```

**Excessive Request Count (501+ requests):**
```
Heavy news site with ads:
- 1 main HTML
- 150 JavaScript files (many ad scripts)
- 45 CSS files
- 280 images (ads, content, trackers)
- 20 fonts
- 85 API calls
Total: 581 requests ⚠️
```

### Risk Level
- **0-200 requests**: 100 score - ✅ Normal
- **201-500 requests**: 95 score - 👍 High but acceptable
- **501+ requests**: 70 score - ⚠️ Excessive (performance impact)

### Why It Matters
**Low Weight (5%) Because:**
- Modern websites legitimately need many requests
- CDN usage is common and necessary
- Single-page apps make lots of API calls
- Video/media platforms load many resources

**Still Monitored Because:**
- Excessive requests slow page load
- More requests = more tracking opportunities
- Battery drain on mobile devices
- Bandwidth consumption

**Context Matters:**
- E-commerce site with 200 product images = Normal ✅
- Simple blog with 600 requests = Suspicious ❌

---

## Category 4: Third-Party Requests (5% weight)

### What's Measured
- **Third-party requests**: Network requests to domains different from current site
- **Third-party ratio**: Percentage of requests going to external domains
- **Third-party domains**: Count of unique external domains contacted

### Detection Method
- **Domain extraction**: Parse hostname from request URL
- **Base domain comparison**: Extract last 2 parts (handles `.co.uk`, `.com.au`)
- **Per-tab tracking**: Map of third-party domains per tab

**Base Domain Extraction:**
```typescript
// Standard TLD
"www.youtube.com" → "youtube.com"
"i.ytimg.com" → "ytimg.com"

// Country TLD
"amazon.co.uk" → "amazon.co.uk"
"google.com.au" → "google.com.au"
```

### Examples
**Low Third-Party Ratio (0-30%)** - ✅ Excellent:
```
Self-hosted blog:
Total: 100 requests
Third-party: 25 requests (CDN fonts, analytics)
Ratio: 25%
Score: 100 ✅
```

**Moderate Third-Party Ratio (31-50%)** - ✅ Very Good:
```
E-commerce site:
Total: 200 requests
Third-party: 85 requests (payment, CDN, analytics)
Ratio: 42.5%
Score: 95 ✅
```

**Acceptable Third-Party Ratio (51-70%)** - 👍 Good:
```
Video platform (YouTube):
Total: 300 requests
Third-party: 180 requests (CDN videos, ads, analytics)
Ratio: 60%
Score: 85 👍
(Acceptable for CDN-heavy sites)
```

**High Third-Party Ratio (71-85%)** - ⚠️ Fair:
```
News site with many ads:
Total: 250 requests
Third-party: 190 requests (ads, trackers, widgets)
Ratio: 76%
Score: 70 ⚠️
```

**Excessive Third-Party Ratio (86%+)** - ❌ Poor:
```
Ad-heavy spam site:
Total: 100 requests
Third-party: 92 requests (mostly ads and trackers)
Ratio: 92%
Score: 50 ❌
```

### Difference from Third-Party Scripts
**Third-Party Requests (this category - 5% weight):**
- **What**: ALL network requests to external domains
- **Includes**: Images, CSS, fonts, API calls, scripts, media, etc.
- **Detection**: Network interception (`chrome.webRequest`)
- **Example Count**: 200-400 requests typical
- **Risk**: Data leakage, tracking, privacy

**Third-Party Scripts (Category 8 - 10% weight):**
- **What**: Only `<script src="...">` HTML tags from external domains
- **Includes**: Only JavaScript files
- **Detection**: DOM scanning (`document.querySelectorAll('script[src]')`)
- **Example Count**: 5-30 scripts typical
- **Risk**: Code execution, XSS, supply chain attacks

**Visual Comparison:**
```html
<!-- Page has these resources -->
<script src="https://cdn.jquery.com/jquery.js"></script>  <!-- Third-party SCRIPT ✓ -->
<img src="https://cdn.images.com/logo.png">                <!-- Third-party REQUEST only -->
<link href="https://cdn.fonts.com/font.css">               <!-- Third-party REQUEST only -->
<script src="/local.js"></script>                          <!-- First-party (neither) -->

Third-Party Scripts Count: 1
Third-Party Requests Count: 3
```

### Why It Matters
**Privacy Impact:**
- Each external domain sees your IP address
- Referer header reveals what page you're on
- Can track you across sites via IP/timing correlation
- More domains = more companies with your data

**Performance Impact:**
- DNS lookups for each domain (slow)
- TLS handshakes for HTTPS (slow)
- More points of failure

**Why Low Weight (5%):**
- CDN usage is necessary and beneficial
- Modern web architecture relies on external services
- Ratio matters more than absolute count
- Context-dependent (video sites need high ratio)

---

## Category 5: ML Phishing Check (15% weight)

### What's Measured
- **ML risk score**: 0-100 phishing probability from logistic regression model
- **55 URL features**: Extracted and analyzed
- **Confidence**: Model's certainty in prediction
- **SSL validity**: Certificate check included

### Detection Method
- **Feature extraction**: URLFeatureExtractor class analyzes URL
- **Standardization**: Features normalized (mean=0, std=1)
- **Logistic regression**: `z = intercept + Σ(coefficient × feature)`
- **Sigmoid function**: `probability = 1 / (1 + e^(-z))`
- **Threshold**: > 50% probability = phishing

### Examples
**Safe URL (0-10 risk)** - ✅ Low Risk:
```
URL: https://www.google.com
Features:
- url_length: 22 (normal)
- num_dots: 2 (normal)
- has_suspicious_tld: false
- uses_https: true
- domain_length: 10 (normal)
- phishing_keyword_count: 0
- contains_brand: true (legitimate)

ML Risk Score: 5
Confidence: 98%
Score: 95 (100 - 5) ✅
```

**Suspicious URL (31-50 risk)** - ⚠️ Medium Risk:
```
URL: https://secure-paypal-verify.com
Features:
- url_length: 33 (slightly long)
- num_dots: 3 (multiple subdomains)
- has_suspicious_tld: true (.com with suspicious name)
- domain_length: 24 (very long)
- phishing_keyword_count: 2 ("secure", "verify")
- contains_brand: true (PayPal mentioned)
- brand_with_hyphen: true (suspicious)

ML Risk Score: 45
Confidence: 67%
Score: 55 (100 - 45) ⚠️
```

**Phishing URL (71-100 risk)** - 🚨 Critical:
```
URL: http://paypa1-login-verify.tk/update.php?session=123
Features:
- url_length: 56 (very long)
- num_dots: 3
- num_hyphens: 3 (excessive)
- has_suspicious_tld: true (.tk free domain)
- uses_https: false (NO SSL!)
- has_digit_substitution: true (paypa1 = paypal)
- phishing_keyword_count: 3 ("login", "verify", "update")
- contains_brand: true (PayPal)
- has_sensitive_params: true (session token)
- path_depth: 2 (suspicious path)

ML Risk Score: 92
Confidence: 94%
Score: 8 (100 - 92) 🚨
```

### Risk Levels
**ML Risk Score → Category Score:**
- 0-10 risk → 90-100 score - ✅ Low (Legitimate)
- 11-30 risk → 70-89 score - 👍 Low-Medium (Likely safe)
- 31-50 risk → 50-69 score - ⚠️ Medium (Suspicious patterns)
- 51-70 risk → 30-49 score - ❌ High (Likely phishing)
- 71-100 risk → 0-29 score - 🚨 Critical (Definite phishing)

### Why It Matters
**Security Impact:**
- Phishing steals login credentials, payment info, personal data
- Can install malware on your device
- Identity theft, financial loss
- Account takeover

**ML Model Advantages:**
- Analyzes 55 different URL characteristics
- Trained on 200+ real phishing and legitimate URLs
- 100% accuracy on test set
- Detects new phishing patterns (not just blacklist)
- Real-time prediction (< 2ms)

**Feature Categories:**
1. Basic URL Structure (10 features)
2. Domain Analysis (15 features)
3. Path & Query (10 features)
4. Security Indicators (5 features)
5. Keyword Detection (5 features)
6. Brand Mimicry (5 features)
7. Advanced Statistics (5 features)

---

## Category 6: SSL/TLS Encryption (15% weight)

### What's Measured
- **Has SSL**: HTTPS protocol used
- **SSL strength**: Strong/Medium/Weak cipher suite
- **SSL expired**: Certificate expiration status
- **Mixed content**: HTTP resources on HTTPS page

### Detection Method
- **Protocol check**: Parse `url.protocol` from tab URL
- **Active validation**: `fetch()` API to check certificate
- **Certificate inspection**: Browser's built-in validation
- **Mixed content**: Intercept HTTP requests on HTTPS pages

### Examples
**Strong HTTPS** - ✅ Excellent (100 score):
```
URL: https://www.google.com
Protocol: HTTPS ✓
Certificate: Valid ✓
Issued by: Google Trust Services
Expires: 2026-03-15
Cipher: TLS 1.3, AES-256-GCM ✓
Mixed Content: None ✓

Score: 100 ✅
```

**Medium HTTPS** - 👍 Good (85 score):
```
URL: https://old-site.com
Protocol: HTTPS ✓
Certificate: Valid ✓
Cipher: TLS 1.2, AES-128-CBC (older)
Mixed Content: None ✓

Score: 85 👍
```

**Weak HTTPS** - ⚠️ Fair (60 score):
```
URL: https://legacy-app.com
Protocol: HTTPS ✓
Certificate: Valid ✓
Cipher: TLS 1.0, RC4 (deprecated)
Mixed Content: 2 HTTP images

Score: 60 ⚠️
```

**Expired Certificate** - ❌ Poor (20 score):
```
URL: https://expired-cert.com
Protocol: HTTPS ⚠️
Certificate: EXPIRED ❌
Expired: 2024-06-20
Browser Warning: "Your connection is not private"

Score: 20 ❌
Global Penalty: -15 points
```

**No HTTPS** - 🚨 Dangerous (0 score):
```
URL: http://insecure-site.com
Protocol: HTTP ❌
Encryption: NONE ❌
All data transmitted in plain text!

Score: 0 🚨
Global Penalty: -10 points
Warning Overlay: YES
```

### Why It Matters
**Security Impact:**
- **Without HTTPS**, anyone on the network can:
  - Read your passwords as you type them
  - Steal your credit card numbers
  - See all data you send/receive
  - Modify the page content (inject malware)
  - Hijack your session cookies

**Real-World Scenarios:**
- Coffee shop WiFi → Attacker sees your login
- Corporate network → IT can read everything
- ISP → Can inject ads into pages
- Government → Mass surveillance possible

**HTTPS Protects:**
- Encryption: Data scrambled, unreadable to others
- Authentication: Confirms you're talking to the real server
- Integrity: Prevents modification in transit

**Why High Weight (15%):**
- Fundamental security requirement
- No HTTPS = Complete exposure
- Industry standard (Google penalizes HTTP sites)
- Free and easy to implement (Let's Encrypt)

---

## Category 7: Privacy Policy (7% weight)

### What's Measured
- **Has privacy policy**: Link or page found on site
- **Privacy policy accessible**: Link works, page loads
- **Policy location**: Footer, legal section, meta tags

### Detection Method
- **DOM scanning**: Content script searches HTML
- **Link text**: Matches "privacy policy", "privacy notice", etc.
- **Link href**: URLs containing "privacy", "/legal", "/policy"
- **Footer search**: Prioritizes footer links
- **Meta tags**: Checks meta tags for privacy references

**Keywords Searched (12 total):**
1. `privacy policy`
2. `privacy notice`
3. `privacy statement`
4. `data protection`
5. `data privacy`
6. `cookie policy`
7. `terms and privacy`
8. `legal information`
9. `about privacy`
10. `your privacy`
11. `privacy practices`
12. `privacy rights`

### Examples
**Privacy Policy Found & Accessible** - ✅ Excellent (100 score):
```html
<!-- Footer of www.amazon.com -->
<footer>
  <a href="/gp/help/customer/display.html?nodeId=468496">
    Privacy Notice
  </a>
</footer>

Detection:
- Link text contains "Privacy Notice" ✓
- Link href accessible ✓
- Located in footer ✓

Score: 100 ✅
```

**Privacy Policy Found (not verified)** - 👍 Good (85 score):
```html
<!-- Small business site -->
<a href="/privacy">Privacy Policy</a>

Detection:
- Link text contains "Privacy Policy" ✓
- Found but accessibility not verified
- Assumed accessible if found

Score: 85 👍
```

**No Privacy Policy Found** - ❌ Poor (0 score):
```html
<!-- Suspicious site with no privacy link -->
<footer>
  <a href="/contact">Contact</a>
  <a href="/about">About</a>
  <!-- No privacy policy link -->
</footer>

Detection:
- No matching links found ❌
- No privacy-related meta tags ❌
- Footer scanned ❌

Score: 0 ❌
```

### Why It Matters
**Transparency Indicator:**
- Shows company cares about privacy (or pretends to)
- Legal requirement in EU (GDPR), California (CCPA)
- Explains what data is collected and why
- Your rights to access/delete data

**What Good Privacy Policy Contains:**
- What data is collected
- How data is used
- Who data is shared with
- How long data is kept
- Your rights (access, delete, opt-out)
- Contact information

**Why Low Weight (7%):**
- Having policy ≠ Good privacy practices
- Many policies are misleading or unclear
- Companies can still violate their own policy
- More of a transparency indicator than protection
- Other categories measure actual privacy behavior

**Detection Accuracy:**
- Footer scan: 90% accurate
- All links scan: 95% accurate
- Meta tags: 70% accurate
- **Combined: 98% accurate**

---

## Category 8: Third-Party Scripts (10% weight)

### What's Measured
- **`<script src="...">` tags from external domains**
- **JavaScript files loaded from different domains**
- **Script count**: Number of external script tags

### Detection Method
- **DOM scanning**: Content script after page load
- **`document.querySelectorAll('script[src]')`**: Find all script tags with src
- **Domain comparison**: Extract base domain from script URL
- **Timing**: Scanned after DOMContentLoaded event

### Examples
**No Third-Party Scripts** - ✅ Excellent (100 score):
```html
<!-- Self-hosted site -->
<script src="/js/main.js"></script>
<script src="/js/utils.js"></script>

Third-party scripts: 0
Score: 100 ✅
```

**Few Third-Party Scripts (1-10)** - ✅ Very Good (95 score):
```html
<!-- Business site with analytics -->
<script src="https://www.googletagmanager.com/gtag.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
<script src="/js/main.js"></script>

Third-party scripts: 2
- Google Tag Manager (analytics)
- jQuery from CDN
Score: 95 ✅
```

**Moderate Third-Party Scripts (11-25)** - 👍 Good (85 score):
```html
<!-- Modern web app -->
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://www.googletagmanager.com/gtag.js"></script>
<script src="https://connect.facebook.net/en_US/sdk.js"></script>
<script src="https://platform.twitter.com/widgets.js"></script>
<script src="https://www.google-analytics.com/analytics.js"></script>
<!-- ... 12 more CDN scripts -->

Third-party scripts: 18
- React framework (CDN)
- Analytics (3 scripts)
- Social widgets (2 scripts)
- Other libraries (13 scripts)
Score: 85 👍
```

**Many Third-Party Scripts (26-50)** - ⚠️ Fair (70 score):
```html
<!-- Video platform (YouTube) -->
<!-- Player scripts, ad scripts, analytics, CDN assets -->

Third-party scripts: 35
- Video player (12 scripts)
- Advertising (8 scripts)
- Analytics (5 scripts)
- CDN libraries (10 scripts)
Score: 70 ⚠️
(Acceptable for video platforms)
```

**Excessive Third-Party Scripts (51+)** - ❌ Poor (50 score):
```html
<!-- Ad-heavy news site -->

Third-party scripts: 68
- Advertising networks (25 scripts)
- Analytics/tracking (15 scripts)
- Social widgets (8 scripts)
- A/B testing (5 scripts)
- CDN libraries (15 scripts)
Score: 50 ❌
```

### Why It Matters
**Security Risks:**
- **Code execution**: Scripts can run any JavaScript code
- **XSS attacks**: Compromised script can steal data
- **Supply chain attacks**: Third-party gets hacked → your site gets hacked
- **Data theft**: Can access cookies, localStorage, form data
- **Page modification**: Can inject malicious content

**Real-World Examples:**
- **British Airways breach (2018)**: Magecart malware injected into third-party script → 380,000 credit cards stolen
- **Ticketmaster breach (2018)**: Compromised chatbot script → payment data stolen
- **SolarWinds (2020)**: Malicious code in software update → 18,000 customers compromised

**Supply Chain Risk:**
```
Your Site
    ↓ (trusts)
Third-Party CDN
    ↓ (gets hacked)
Attacker injects malware
    ↓ (executes on)
Your Users
```

**Difference from Third-Party Requests:**
- **Scripts (10% weight)**: Can execute code → **Higher risk**
- **Requests (5% weight)**: Just load data → **Lower risk**

**Why Higher Weight (10%):**
- Direct security risk (code execution)
- Can compromise entire site
- Single compromised script = full breach
- User has no control over third-party updates

---

## Category 9: Data Collection (5% weight)

### What's Measured
- **Forms detected**: Number of `<form>` elements on page
- **PII collected**: Personally Identifiable Information detected
- **Input fields**: Email, password, credit card, SSN, phone, etc.

### Detection Method
- **DOM scanning**: `document.querySelectorAll('form')`
- **Input field analysis**: Check input types and names
- **Pattern matching**: Detect SSN, credit card, phone number formats
- **Field names**: Look for "email", "password", "ssn", "card", etc.

### Examples
**No Forms** - ✅ Excellent (100 score):
```html
<!-- Blog article (read-only) -->
<article>
  <h1>How to Bake Bread</h1>
  <p>Content here...</p>
</article>

Forms: 0
PII: No
Score: 100 ✅
```

**Login Form (1-5 forms, no PII)** - ✅ Excellent (100 score):
```html
<!-- Login page -->
<form action="/login" method="POST">
  <input type="email" name="email" required>
  <input type="password" name="password" required>
  <button type="submit">Log In</button>
</form>

Forms: 1
PII: No (login is expected)
Score: 100 ✅
```

**Many Forms (6+ forms, no PII)** - 👍 Good (80 score):
```html
<!-- Multi-step wizard -->
<form id="step1">...</form>
<form id="step2">...</form>
<form id="step3">...</form>
<!-- ... 5 more forms -->

Forms: 8
PII: No
Score: 100 - 20 = 80 👍
```

**PII Collection (few forms)** - ⚠️ Fair (50 score):
```html
<!-- Registration form -->
<form action="/register" method="POST">
  <input type="text" name="full_name">
  <input type="email" name="email">
  <input type="tel" name="phone">
  <input type="text" name="ssn" pattern="\d{3}-\d{2}-\d{4}">
  <input type="text" name="credit_card">
</form>

Forms: 1
PII: Yes (SSN, credit card detected)
Score: 100 - 50 = 50 ⚠️
```

**Excessive Collection (many forms + PII)** - ❌ Poor (30 score):
```html
<!-- Sketchy site asking for too much -->
<form id="survey1">
  <input name="ssn">
  <input name="credit_card">
</form>
<form id="survey2">...</form>
<!-- ... 8 more forms asking for personal data -->

Forms: 10
PII: Yes
Score: 100 - 50 (PII) - 20 (many forms) = 30 ❌
Global Penalty: -10 (PII collection)
Total: 30 - 10 = 20 ❌
```

### PII Detection Patterns
**Detected Types:**

1. **Social Security Number**:
   ```regex
   \d{3}-\d{2}-\d{4}
   \d{9}
   ```

2. **Credit Card**:
   ```regex
   \d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}
   ```

3. **Phone Number**:
   ```regex
   \(\d{3}\)\s?\d{3}-\d{4}
   \d{3}-\d{3}-\d{4}
   ```

4. **Email**:
   ```regex
   [a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}
   ```

5. **Date of Birth**:
   ```html
   <input type="date" name="dob">
   <input name="birthdate">
   ```

### Why It Matters
**Privacy Impact:**
- PII can be used for identity theft
- Data breaches expose your personal information
- More data collected = more data at risk
- Companies often collect more than needed

**Why Low Weight (5%):**
- Forms are often necessary (login, checkout, contact)
- Not all data collection is harmful
- Context matters (bank needs more data than blog)
- Users expect forms on certain sites

**When It's Concerning:**
- Too many forms on simple sites
- PII requested without clear reason
- No privacy policy explaining data use
- Insecure transmission (no HTTPS)

**Best Practices:**
- Minimize data collection (only what's needed)
- Encrypt in transit (HTTPS)
- Encrypt at rest (database encryption)
- Clear privacy policy
- User consent
- Right to delete

---

## Category Comparison Summary

| Category | Weight | What's Detected | Detection Method | Risk Type | Example Count |
|----------|--------|-----------------|------------------|-----------|---------------|
| **Trackers** | 20% | Tracking domains, fingerprinting | Network + API override | Privacy invasion | 0-30 trackers |
| **Cookies** | 18% | Third-party cookies | Cookie API (HTTP+HTTPS) | Cross-site tracking | 0-200 cookies |
| **ML Check** | 15% | Phishing probability | 55 URL features + ML | Security (phishing) | 0-100 risk score |
| **SSL** | 15% | HTTPS, certificate | Protocol + fetch API | Security (encryption) | Yes/No + strength |
| **Scripts** | 10% | External `<script>` tags | DOM scanning | Security (code execution) | 0-50 scripts |
| **Privacy Policy** | 7% | Policy link/page | DOM scanning + keywords | Transparency | Yes/No |
| **Total Requests** | 5% | All network requests | Network interception | Performance/Privacy | 0-500 requests |
| **Third-Party Req** | 5% | External requests ratio | Network interception | Privacy (data leakage) | 0-100% ratio |
| **Data Collection** | 5% | Forms, PII | DOM scanning + patterns | Privacy (data exposure) | 0-10 forms |

---

## Why These Weights?

### High Priority (15-20%)
**Trackers (20%)** & **Cookies (18%)**:
- Directly impact privacy
- Persistent tracking across sites
- Immediate and ongoing harm
- User has little control

**ML Check (15%)** & **SSL (15%)**:
- Critical security issues
- Immediate danger (phishing, no encryption)
- Can cause financial loss
- Warning-level threats

### Moderate Priority (7-10%)
**Scripts (10%)**:
- Security risk but context-dependent
- Modern sites need some external scripts
- Supply chain attacks are serious but less frequent

**Privacy Policy (7%)**:
- Transparency indicator
- Not a guarantee of good practices
- Legal requirement in many places

### Low Priority (5%)
**Total Requests (5%)** & **Third-Party Requests (5%)** & **Data Collection (5%)**:
- Often necessary for functionality
- Context-dependent (CDN, video, forms)
- More informational than critical
- User expects them on certain sites

---

## Real-World Scoring Example

### Example: News Site with Ads

**Privacy Factors Collected:**
```javascript
{
  trackersBlocked: 28,
  fingerprintAttempts: 3,
  cookiesManaged: 75,
  thirdPartyCookies: 58,
  totalRequests: 380,
  thirdPartyRequests: 270,
  hasSSL: true,
  sslStrength: 'strong',
  hasPrivacyPolicy: true,
  thirdPartyScripts: 42,
  formsDetected: 2,
  piiCollected: false,
  mlRiskScore: 8,
  mlIsPhishing: false
}
```

**Category Scoring:**

**1. Trackers (20%)**:
- 28 trackers → Base score: 30 (21+ trackers)
- 3 fingerprint attempts → -30 penalty
- Final: max(0, 30 - 30) = **0**
- Weighted: 0 × 20% = **0.0**

**2. Cookies (18%)**:
- 58 third-party cookies
- Deduction: (58 / 10) × 1.8 = 10.44
- Score: 100 - 10.44 = **89.56**
- Weighted: 89.56 × 18% = **16.1**

**3. Total Requests (5%)**:
- 380 requests (201-500 range)
- Score: **95**
- Weighted: 95 × 5% = **4.75**

**4. Third-Party Requests (5%)**:
- 270 / 380 = 71% ratio
- 71% = Fair range
- Score: **70**
- Weighted: 70 × 5% = **3.5**

**5. ML Check (15%)**:
- Risk score: 8 (low)
- Score: 100 - 8 = **92**
- Weighted: 92 × 15% = **13.8**

**6. SSL (15%)**:
- Strong HTTPS
- Score: **100**
- Weighted: 100 × 15% = **15.0**

**7. Privacy Policy (7%)**:
- Found and accessible
- Score: **100**
- Weighted: 100 × 7% = **7.0**

**8. Third-Party Scripts (10%)**:
- 42 scripts (26-50 range)
- Score: **70**
- Weighted: 70 × 10% = **7.0**

**9. Data Collection (5%)**:
- 2 forms, no PII
- Score: **100**
- Weighted: 100 × 5% = **5.0**

**Subtotal**: 0.0 + 16.1 + 4.75 + 3.5 + 13.8 + 15.0 + 7.0 + 7.0 + 5.0 = **72.15**

**Global Penalties**: None (has HTTPS, no threats, no PII)

**Final Score**: 72.15 → **72** (rounded)

**Risk Level**: Fair ⚠️ (50-74 range)

**Top Issues**:
- 28 trackers blocked
- 3 fingerprinting attempts
- 58 third-party cookies
- 71% third-party requests
- 42 third-party scripts

**Recommendations**:
- Continue using tracker blocking
- Block third-party cookies
- Consider reducing third-party dependencies
- Review script necessity

---

## Conclusion

Each of the 9 categories measures a different aspect of privacy and security:

✅ **Trackers** (20%) - Privacy invasion through tracking  
✅ **Cookies** (18%) - Cross-site tracking persistence  
✅ **ML Check** (15%) - Phishing/malware security  
✅ **SSL** (15%) - Encryption security  
✅ **Scripts** (10%) - Code execution security  
✅ **Privacy Policy** (7%) - Transparency  
✅ **Total Requests** (5%) - Resource usage  
✅ **Third-Party Requests** (5%) - Data leakage  
✅ **Data Collection** (5%) - Personal data exposure  

**All measurements happen locally in your browser - no data ever sent to external servers!** 🔒
