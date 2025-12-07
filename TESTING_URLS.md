# 🧪 PRISM Extension - Safe Testing URLs

## 📋 Overview
This document provides **safe, legitimate testing URLs** to verify PRISM's threat detection capabilities without visiting real malicious websites.

---

## 🔴 CRITICAL Threats (Should Show Warning Overlay)

### 1. HTTP Sites (No HTTPS Encryption)
**Threat:** Unencrypted connection, data exposed  
**PRISM Behavior:** ⚠️ CRITICAL warning overlay

- **http://neverssl.com** - Intentionally HTTP-only site for testing
- **http://example.com** - Standard HTTP test site
- **http://info.cern.ch** - CERN's first website (HTTP)
- **http://motherfuckingwebsite.com** - Minimalist HTTP site
- **http://httpforever.com** - Testing HTTP connections

### 2. SSL/TLS Certificate Issues
**Threat:** Invalid, expired, or self-signed certificates  
**PRISM Behavior:** ⚠️ CRITICAL warning overlay

- **https://expired.badssl.com/** - Expired SSL certificate
- **https://wrong.host.badssl.com/** - Wrong hostname
- **https://self-signed.badssl.com/** - Self-signed certificate
- **https://untrusted-root.badssl.com/** - Untrusted root
- **https://revoked.badssl.com/** - Revoked certificate
- **https://pinning-test.badssl.com/** - Certificate pinning test
- **https://no-common-name.badssl.com/** - Missing common name
- **https://incomplete-chain.badssl.com/** - Incomplete certificate chain

### 3. Mixed Content (HTTPS + HTTP)
**Threat:** HTTPS page loading HTTP resources  
**PRISM Behavior:** Score penalty, potential warning

- **https://mixed-script.badssl.com/** - Mixed content scripts
- **https://mixed.badssl.com/** - General mixed content

---

## 🟠 HIGH Threats (Silent Tracking - No Overlay)

### 4. Heavy Tracker Sites (50+ Trackers)
**Threat:** Excessive tracking and data collection  
**PRISM Behavior:** Silent tracking, high tracker count in popup

- **https://www.cnn.com** - 50-80+ trackers (news site)
- **https://www.forbes.com** - 60+ trackers (business news)
- **https://www.dailymail.co.uk** - 70+ trackers (tabloid)
- **https://www.huffpost.com** - 50+ trackers (news)
- **https://www.buzzfeed.com** - 40-60 trackers (media)
- **https://www.weather.com** - 50+ trackers (weather)
- **https://www.msn.com** - 60+ trackers (portal)

### 5. Fingerprinting Detection
**Threat:** Browser fingerprinting attempts  
**PRISM Behavior:** Silent tracking, fingerprint count in popup

- **https://amiunique.org** - Browser fingerprinting test
- **https://browserleaks.com/canvas** - Canvas fingerprinting test
- **https://fingerprintjs.com/demo** - FingerprintJS demo
- **https://coveryourtracks.eff.org** - EFF fingerprinting test
- **https://panopticlick.eff.org** - Browser uniqueness test
- **https://www.deviceinfo.me** - Device fingerprinting
- **https://browserleaks.com/webgl** - WebGL fingerprinting
- **https://audiofingerprint.openwpm.com** - Audio fingerprinting

### 6. Aggressive Cookie Sites
**Threat:** Excessive cookie usage  
**PRISM Behavior:** High cookie count, tracking stats

- **https://www.amazon.com** - 30-80 cookies
- **https://www.facebook.com** - 50+ cookies
- **https://www.google.com** - 20-40 cookies
- **https://www.youtube.com** - 30+ cookies
- **https://www.reddit.com** - 40+ cookies

---

## 🟡 MEDIUM Threats (Silent Tracking)

### 7. PII Collection Forms
**Threat:** Personal information collection  
**PRISM Behavior:** Score penalty, visible in breakdown

- **https://www.gravatar.com** - Email collection
- **https://mailchimp.com** - Email marketing forms
- **https://www.surveymonkey.com** - Survey forms

---

## 🟢 Clean/Safe Sites (Control Tests)

### 8. Privacy-Focused Sites (Should Score 90-100)
**Expected:** Excellent privacy score, minimal tracking

- **https://duckduckgo.com** - Privacy-focused search
- **https://signal.org** - Secure messaging
- **https://www.eff.org** - Electronic Frontier Foundation
- **https://mullvad.net** - VPN provider
- **https://protonmail.com** - Encrypted email
- **https://www.torproject.org** - Tor Project
- **https://privacytools.io** - Privacy guides
- **https://example.com** - Clean test site (HTTPS)

### 9. Well-Secured Sites (Should Score 85-95)
**Expected:** Good privacy score, minimal issues

- **https://github.com** - Code hosting
- **https://stackoverflow.com** - Developer Q&A
- **https://www.wikipedia.org** - Knowledge base
- **https://archiveofourown.org** - Fan fiction archive

---

## 🧪 Phishing Simulation Sites (SAFE - Educational)

### 10. Phishing Awareness Training
**Purpose:** Test phishing detection (when ML is active)  
**Safety:** These are educational, not real phishing

- **https://phishingquiz.withgoogle.com** - Google's phishing quiz
- **https://www.phishingbox.com/phishing-iq-test** - Phishing IQ test
- **https://www.sonicwall.com/en-us/phishing-iq-test** - SonicWall test
- **https://www.opendns.com/phishing-quiz/** - OpenDNS quiz

### 11. URL Obfuscation Examples
**Purpose:** Test URL analysis features  
**Note:** These are EXAMPLES only, not real sites

```
Typosquatting Examples (DO NOT VISIT - EXAMPLES ONLY):
- gooogle.com (extra 'o')
- faceboook.com (extra 'o')
- paypa1.com ('l' → '1')
- arnaz0n.com ('o' → '0')
- micr0soft.com ('o' → '0')

IP-Based URLs (suspicious):
- http://192.168.1.1
- http://216.58.214.206

URL Shortener Risks:
- bit.ly/[random] (can hide destination)
- tinyurl.com/[random]
- goo.gl/[random]
```

---

## 🔬 Security Testing Sites (SAFE - Legitimate)

### 12. Browser Security Tests
**Purpose:** Test browser security features  
**Safety:** Legitimate security testing tools

- **https://browseraudit.com** - Browser security audit
- **https://www.ssllabs.com/ssltest/viewMyClient.html** - SSL client test
- **https://www.hardenize.com** - Security configuration test
- **https://securityheaders.com** - HTTP security headers
- **https://observatory.mozilla.org** - Mozilla Observatory

### 13. Malware Testing (SAFE - Not Real Malware)
**Purpose:** Test antivirus/security detection  
**Safety:** EICAR test file (harmless test signature)

- **https://www.eicar.org/?page_id=3950** - EICAR test file info
- **https://secure.eicar.org/eicar.com.txt** - EICAR test file (safe)

**Note:** EICAR is a standard antivirus test file recognized by all AV software but completely harmless.

---

## 📊 Testing Scenarios

### Scenario 1: CRITICAL Warning Test
**Objective:** Verify warning overlay appears  
**Steps:**
1. Visit http://neverssl.com
2. **Expected:** Full-screen CRITICAL warning overlay
3. Options: "Go Back" or "Proceed Anyway"
4. Popup shows: Threats Detected > 0

### Scenario 2: Fingerprinting Test
**Objective:** Verify silent fingerprint tracking  
**Steps:**
1. Visit https://amiunique.org
2. **Expected:** NO warning overlay (silent tracking)
3. Popup shows: Fingerprint Attempts > 0
4. No "Threats Detected" card (fingerprinting is HIGH, not CRITICAL)

### Scenario 3: Heavy Tracking Test
**Objective:** Verify tracker blocking  
**Steps:**
1. Visit https://www.cnn.com
2. **Expected:** NO warning overlay (silent)
3. Popup shows: 50+ Trackers Blocked
4. Privacy score decreases
5. Analytics shows tracker timeline

### Scenario 4: Clean Site Test
**Objective:** Verify accurate scoring  
**Steps:**
1. Visit https://duckduckgo.com
2. **Expected:** NO warnings
3. Privacy Score: 90-100 (Excellent)
4. Minimal trackers (0-5)
5. No threats detected

### Scenario 5: SSL Certificate Test
**Objective:** Verify SSL validation  
**Steps:**
1. Visit https://expired.badssl.com
2. **Expected:** CRITICAL warning overlay
3. Warning mentions: "Expired SSL Certificate"
4. Popup shows: Threats Detected

### Scenario 6: Auto-Launch Test
**Objective:** Verify 3-second auto-open/close  
**Steps:**
1. Navigate to any HTTPS site (e.g., https://github.com)
2. **Expected:** Popup auto-opens for 3 seconds
3. Popup auto-closes after 3 seconds
4. Manual open: Click extension icon
5. **Expected:** Popup stays open indefinitely (no auto-close)

---

## 🎯 Testing Checklist

### Extension Features
- [ ] Auto-launch on page load (3-second display)
- [ ] Manual open stays open (no auto-close)
- [ ] CRITICAL warnings show overlay (HTTP, expired SSL, malware)
- [ ] HIGH threats silent (fingerprinting, heavy tracking)
- [ ] MEDIUM threats silent (PII collection)
- [ ] Tracker blocking (real-time)
- [ ] Cookie management
- [ ] Fingerprint protection
- [ ] Privacy scoring (8 categories)
- [ ] Trust levels (Trusted/Unknown/Suspicious/Blocked)
- [ ] Analytics dashboard
- [ ] Score breakdown modal

### Privacy Metrics
- [ ] Privacy score: 0-100 scale
- [ ] Risk levels: Excellent/Good/Fair/Poor/Critical
- [ ] Trackers blocked count
- [ ] Cookies managed count
- [ ] Threats detected count
- [ ] Fingerprint attempts count
- [ ] Requests analyzed count

### UI/UX
- [ ] No "Threats 0 Detected" on safe sites
- [ ] Minimal UI on new tab pages
- [ ] All cards display correctly
- [ ] No console errors
- [ ] Smooth animations
- [ ] Responsive design

---

## ⚠️ Important Safety Notes

### DO NOT Visit:
- ❌ Real phishing websites
- ❌ Actual malware distribution sites
- ❌ Compromised websites
- ❌ Dark web markets
- ❌ Illegal content sites

### Safe Testing Principles:
1. ✅ Use ONLY the URLs listed in this document
2. ✅ Educational/testing sites are legitimate
3. ✅ badssl.com sites are safe (owned by Google)
4. ✅ EICAR test files are harmless
5. ✅ Browser fingerprinting tests are educational
6. ✅ All listed sites are legal and ethical

### If You Want to Test Real Threats:
- Use isolated virtual machines (VMs)
- Use sandbox environments
- Consult with security professionals
- Follow responsible disclosure practices
- Never visit real malware sites on your main system

---

## 📈 Expected Results Summary

| Site Type | Warning Overlay | Popup Display | Score Impact |
|-----------|----------------|---------------|--------------|
| HTTP Sites | ✅ Yes (CRITICAL) | Threats Detected | 60-70 |
| Expired SSL | ✅ Yes (CRITICAL) | Threats Detected | 50-60 |
| Heavy Trackers | ❌ No (HIGH) | Trackers Blocked | 70-85 |
| Fingerprinting | ❌ No (HIGH) | Fingerprint Attempts | 75-85 |
| PII Collection | ❌ No (MEDIUM) | Score Breakdown | 80-90 |
| Clean Sites | ❌ No | All Green | 90-100 |

---

## 🔗 Additional Resources

### Security Testing Tools
- **Qualys SSL Labs:** https://www.ssllabs.com/ssltest/
- **Security Headers:** https://securityheaders.com
- **Mozilla Observatory:** https://observatory.mozilla.org
- **OWASP Testing Guide:** https://owasp.org/www-project-web-security-testing-guide/

### Privacy Testing
- **Privacy Badger:** https://privacybadger.org
- **Cover Your Tracks:** https://coveryourtracks.eff.org
- **Am I Unique:** https://amiunique.org

### Educational Resources
- **Google Phishing Quiz:** https://phishingquiz.withgoogle.com
- **PhishTank:** https://phishtank.org (database, not to visit)
- **OpenPhish:** https://openphish.com (feed, not to visit)

---

## 📝 Testing Log Template

```markdown
### Test Session: [Date]

**Tester:** [Your Name]  
**Extension Version:** 1.0.0  
**Browser:** Chrome [Version]  
**OS:** Windows/Mac/Linux

#### Test 1: HTTP Warning
- URL: http://neverssl.com
- Warning Shown: ✅/❌
- Warning Type: CRITICAL
- Popup Threats: [Count]
- Notes: 

#### Test 2: Fingerprinting
- URL: https://amiunique.org
- Warning Shown: ✅/❌ (should be ❌)
- Fingerprint Count: [Count]
- Notes:

#### Test 3: Heavy Tracking
- URL: https://www.cnn.com
- Trackers Blocked: [Count]
- Privacy Score: [0-100]
- Notes:

#### Test 4: Auto-Launch
- URL: https://github.com
- Auto-opened: ✅/❌
- Auto-closed after 3s: ✅/❌
- Manual open stayed: ✅/❌
- Notes:

#### Bugs Found:
1. [Bug description]
2. [Bug description]

#### Overall Assessment:
- Extension Status: Working/Issues Found
- Recommendation: Ready/Needs Fixes
```

---

**Last Updated:** December 7, 2025  
**Document Version:** 1.0  
**Maintained By:** PRISM Development Team

**Note:** This document will be updated as new testing URLs and scenarios are discovered. Always verify URLs are safe before visiting.
