# 🧪 PRISM Extension Testing Guide

## Comprehensive Test URLs for All Features

Test the extension thoroughly with these carefully curated URLs covering all detection scenarios.

---

## 🟢 **Category 1: Legitimate Sites (Should Show GREEN/Excellent)**

### Major Tech Companies
- https://www.google.com/search?q=phishing
- https://www.amazon.com/products/electronics
- https://github.com/user/repository
- https://www.microsoft.com/en-us/microsoft-365
- https://www.apple.com/iphone

### Social Media & Communication
- https://www.facebook.com/
- https://twitter.com/home
- https://www.linkedin.com/feed/
- https://www.instagram.com/
- https://discord.com/

### E-commerce
- https://www.ebay.com/
- https://www.etsy.com/
- https://www.walmart.com/
- https://www.target.com/

### News & Media
- https://www.cnn.com/
- https://www.bbc.com/news
- https://www.nytimes.com/
- https://www.theguardian.com/

### Development & Tools
- https://stackoverflow.com/questions/12345
- https://www.npmjs.com/
- https://www.wikipedia.org/wiki/Phishing
- https://www.reddit.com/

**Expected Result:**
- ✅ Privacy Score: 85-100
- ✅ Risk Level: Excellent/Good
- ✅ ML Detection: SAFE
- ✅ No warnings displayed

---

## 🔴 **Category 2: Obvious Phishing (Should Show RED/Dangerous + WARNING OVERLAY)**

### Typosquatting with Digit Substitution
- http://g00gle-verify.tk/login
- http://faceb00k-security.com/verify
- http://amaz0n-customer.tk/account
- http://micros0ft-update.com/verify
- http://appl3-id.xyz/suspended

### Brand Impersonation
- https://paypal.secure-account.xyz/update
- http://bankofamerica-alert.info/suspended
- https://netflix-billing.xyz/payment-failed
- http://wellsfarg0.secure-login.info/alert

### IP Address URLs
- http://192.168.1.1/admin/login.php
- http://203.0.113.42/secure/update
- http://198.51.100.15/verify-account

**Expected Result:**
- 🚨 Privacy Score: 0-25
- 🚨 Risk Level: Dangerous
- 🚨 ML Detection: PHISHING DETECTED (HIGH/CRITICAL)
- 🚨 Warning overlay displayed
- 🚨 Blocked reasons shown

---

## 🟡 **Category 3: Subdomain Tricks (Should Show YELLOW/Fair + WARNINGS)**

### Brand in Subdomain
- http://paypal.evil-site.xyz/login
- http://google.phishing-domain.tk/verify
- http://amazon.fake-secure.com/account
- http://microsoft.suspicious.xyz/update

### Multiple Subdomains
- https://secure.login.verify.account-paypal.com/
- https://update.billing.payment.netflix-service.xyz/

**Expected Result:**
- ⚠️ Privacy Score: 30-60
- ⚠️ Risk Level: Fair/Poor
- ⚠️ ML Detection: MEDIUM/HIGH RISK
- ⚠️ Warning messages displayed
- ⚠️ Suspicious patterns highlighted

---

## 🟠 **Category 4: Suspicious Keywords (Should Show ORANGE/Fair)**

### Login/Verify Pages
- https://secure-login-verify.tk/account
- https://confirm-account-billing.xyz/update
- https://verify-payment-urgent.com/login

### Urgency Tactics
- https://account-suspended-urgent.tk/verify
- https://immediate-action-required.xyz/login
- https://limited-time-offer-expire.com/update

**Expected Result:**
- ⚠️ Privacy Score: 35-55
- ⚠️ Risk Level: Fair
- ⚠️ ML Detection: MEDIUM RISK
- ⚠️ Multiple keyword warnings

---

## 🟢 **Category 5: Legitimate Sites (Not Whitelisted - Should Show GREEN/Good)**

### Common Websites
- https://www.example.com/about
- https://stackoverflow.com/questions/12345
- https://www.wikipedia.org/wiki/Phishing

### Educational/Government
- https://www.w3schools.com/html/
- https://developer.mozilla.org/en-US/

**Expected Result:**
- ✅ Privacy Score: 75-90
- ✅ Risk Level: Good
- ✅ ML Detection: SAFE/LOW RISK
- ✅ No critical warnings

---

## 🟡 **Category 6: Random/Suspicious Domains (Should Show YELLOW/Fair)**

### Gibberish Domains
- https://dcsdvsdvsdwvv.com/path
- https://kjhgfdsaqwerty.tk/login
- https://xyzabc123def.xyz/verify

### Random Characters
- https://asjdklfjaskldf.com/
- https://qwertyuiop123.tk/

**Expected Result:**
- ⚠️ Privacy Score: 40-65
- ⚠️ Risk Level: Fair
- ⚠️ ML Detection: MEDIUM RISK
- ⚠️ Randomness/entropy warnings

---

## 📏 **Category 7: Long URLs (Should Show YELLOW/Fair)**

### Very Long Domains
- http://very-long-suspicious-domain-name-that-goes-on-forever.tk/login

### Long Paths
- https://short.com/very/long/path/structure/with/many/segments/login.php

### Long Query Strings
- https://domain.com/?param1=value1&param2=value2&param3=value3&param4=value4&param5=value5&param6=value6

**Expected Result:**
- ⚠️ Privacy Score: 50-70
- ⚠️ Risk Level: Fair
- ⚠️ URL length warnings

---

## 🔣 **Category 8: Excessive Special Characters (Should Show YELLOW/Fair)**

### Many Hyphens
- https://domain-with-many-hyphens-here.com/path
- https://my-super-long-hyphenated-domain-name.com/

### Many Underscores
- https://domain_with_many_underscores_here.tk/login

### URL Encoding
- http://domain.com/path%20with%20lots%20of%20encoding%20here

**Expected Result:**
- ⚠️ Privacy Score: 45-65
- ⚠️ Risk Level: Fair
- ⚠️ Special character warnings

---

## 🔒 **Category 9: SSL/Security Issues (Should Show RED + WARNING)**

### No HTTPS (HTTP Only)
- http://insecure-website.com/login
- http://no-ssl-here.com/payment

**Expected Result:**
- 🚨 Privacy Score: 20-40
- 🚨 Risk Level: Poor/Dangerous
- 🚨 SSL warnings displayed
- 🚨 "No HTTPS encryption" alert

---

## 🎯 **Testing Instructions**

### **Step 1: Install Extension**
1. Open Chrome/Edge
2. Navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `PRISM` folder
6. Extension should appear with PRISM icon

### **Step 2: Test Each Category**

For EACH test URL:

1. **Navigate to URL** - Paste URL in address bar
2. **Check Extension Icon**
   - Green = Safe
   - Yellow = Warning
   - Red = Dangerous

3. **Click Extension Icon** - Review popup showing:
   - Privacy Score (0-100)
   - Risk Level
   - ML Detection Results
   - Feature Breakdown
   - Recommendations

4. **Check Warning Overlays**
   - Critical threats should show full-page warning
   - High threats should show banner warning

5. **Review Console Logs**
   - Open DevTools (F12)
   - Check Console for ML detection logs
   - Verify feature extraction

### **Step 3: Verify Features**

✅ **55 ML Features Working:**
- URL structure (length, components)
- Character patterns (dots, hyphens, special chars)
- Security indicators (HTTPS, IP, TLD)
- Lexical analysis (digits, entropy)
- Brand detection (typosquatting, whitelisting)
- Keyword detection (login, verify, urgency)
- Combined patterns (risk scores)

✅ **Enhanced Privacy Scoring:**
- Tracker detection
- Cookie analysis
- Request monitoring
- SSL validation
- ML integration

✅ **User Interface:**
- Color-coded risk levels
- Detailed breakdowns
- Actionable recommendations
- Warning overlays

### **Step 4: Performance Testing**

1. **Speed Test:**
   - ML analysis should complete in <100ms
   - No noticeable page load delay

2. **Memory Test:**
   - Extension should use <50MB RAM
   - No memory leaks over time

3. **Accuracy Test:**
   - Legitimate sites: 0% false positives
   - Phishing sites: 95%+ detection rate

---

## 📊 **Expected Results Summary**

| Category | URLs | Expected Score | Expected Risk | ML Detection |
|----------|------|---------------|---------------|--------------|
| Legitimate (Whitelisted) | 20+ | 85-100 | Excellent | SAFE |
| Obvious Phishing | 12+ | 0-25 | Dangerous | CRITICAL |
| Subdomain Tricks | 6+ | 30-60 | Fair/Poor | HIGH |
| Suspicious Keywords | 6+ | 35-55 | Fair | MEDIUM |
| Legitimate (Not Whitelisted) | 5+ | 75-90 | Good | SAFE |
| Random Domains | 5+ | 40-65 | Fair | MEDIUM |
| Long URLs | 3+ | 50-70 | Fair | MEDIUM |
| Special Characters | 3+ | 45-65 | Fair | MEDIUM |
| SSL Issues | 2+ | 20-40 | Poor/Dangerous | HIGH |

---

## 🐛 **Debugging Tips**

If tests fail:

1. **Check Model Loading:**
   ```javascript
   // In browser console
   chrome.runtime.sendMessage({type: 'ML_STATUS'}, console.log);
   ```

2. **Verify Feature Extraction:**
   ```javascript
   // Check enhanced_model.json exists
   fetch(chrome.runtime.getURL('ml/enhanced_model.json'))
     .then(r => r.json())
     .then(console.log);
   ```

3. **Review Logs:**
   - Background script console
   - Content script console
   - Popup console

4. **Clear Cache:**
   ```javascript
   chrome.storage.local.clear();
   chrome.runtime.reload();
   ```

---

## ✅ **Success Criteria**

Extension passes if:
- ✅ All legitimate sites show GREEN (no false positives)
- ✅ All phishing sites show RED/YELLOW (no false negatives)
- ✅ ML detection matches expected risk levels
- ✅ Warning overlays appear for critical threats
- ✅ Privacy scores are accurate and stable
- ✅ No console errors
- ✅ Performance remains fast (<100ms per check)

---

## 📝 **Notes**

- Test in **incognito mode** for clean state
- Test with **different user settings** (strict/balanced/permissive)
- Test **navigation flow** (clicking links, back/forward)
- Test **multiple tabs** simultaneously
- Monitor **resource usage** in Task Manager

**Happy Testing! 🚀**
