# 🚀 Quick Testing Guide

## Install Extension (30 seconds)

1. Open Chrome/Edge
2. Go to `chrome://extensions/`
3. Toggle "Developer mode" ON (top right)
4. Click "Load unpacked"
5. Select the **PRISM** folder
6. Extension loaded! ✅

---

## Quick Test (2 minutes)

### ✅ Test 1: Legitimate Site (Should be GREEN)
```
https://www.google.com/search?q=test
```
**Expected:**
- Privacy Score: 85-100
- Risk Level: Excellent
- ML: SAFE
- Icon: Green

---

### 🚨 Test 2: Obvious Phishing (Should be RED + WARNING)
```
http://g00gle-verify.tk/login
```
**Expected:**
- Privacy Score: 0-25
- Risk Level: Dangerous
- ML: PHISHING DETECTED
- Icon: Red
- Warning overlay shown
- Reason: "Typosquatting detected"

---

### ⚠️ Test 3: Subdomain Trick (Should be YELLOW)
```
http://paypal.evil-site.xyz/login
```
**Expected:**
- Privacy Score: 30-60
- Risk Level: Fair/Poor
- ML: HIGH RISK
- Icon: Yellow
- Warning message shown

---

### ✅ Test 4: Legitimate (Not Whitelisted)
```
https://stackoverflow.com/questions/12345
```
**Expected:**
- Privacy Score: 75-90
- Risk Level: Good
- ML: SAFE
- Icon: Green

---

## Check ML Features (F12 Console)

Open DevTools and look for:

```
🧠 Enhanced ML Phishing Detector loaded (55 features, v2.0)
   Accuracy: 100% | Features: 55
```

Click extension icon to see full breakdown.

---

## Full Test Suite

See **EXTENSION_TEST_URLS.md** for:
- 60+ test URLs
- 9 categories
- Complete testing instructions

---

## Common Issues

### Extension not loading?
- Make sure you built first: `npm run build`
- Check for build errors in terminal

### ML not working?
- Check console for "ML model loaded" message
- Verify `dist/ml/enhanced_model.json` exists

### Scores seem wrong?
- Clear cache: Right-click extension → Manage → Clear storage
- Reload extension

---

## Success Checklist

- [ ] Extension icon appears in toolbar
- [ ] google.com shows GREEN (Excellent)
- [ ] g00gle-verify.tk shows RED (Dangerous)
- [ ] paypal.evil-site.xyz shows YELLOW (Fair/Poor)
- [ ] Console shows "ML model loaded"
- [ ] No errors in console

---

**All ✅? You're ready to go! 🎉**
