# 🎯 Quick Testing Guide - PRISM Extension

## 🚀 Auto-Launch Feature

### How It Works
- Navigate to any website → Popup auto-opens for **3 seconds** → Auto-closes
- Click extension icon → Popup opens → Stays open **indefinitely**

### Quick Test
1. Go to: **https://github.com**
   - ✅ Popup auto-opens
   - ✅ Auto-closes after 3 seconds
   
2. Click extension icon manually
   - ✅ Popup opens
   - ✅ Stays open (no auto-close)

---

## 🧪 Quick Testing URLs

### ⚠️ CRITICAL Warnings (Should Show Overlay)
```
http://neverssl.com              → No HTTPS warning
https://expired.badssl.com       → Expired SSL warning
```

### 🔕 Silent Tracking (NO Overlay)
```
https://amiunique.org            → Fingerprinting test (HIGH)
https://www.cnn.com              → 50+ trackers (HIGH)
```

### ✅ Clean Sites (Control)
```
https://duckduckgo.com           → Privacy score: 90-100
https://signal.org               → Excellent rating
```

---

## 📋 Quick Verification Checklist

- [ ] Auto-launch works on regular websites
- [ ] Auto-close after 3 seconds
- [ ] Manual open stays open
- [ ] HTTP sites show CRITICAL warning
- [ ] Fingerprinting sites tracked silently
- [ ] Clean sites score 90+
- [ ] No "Threats 0 Detected" on safe sites
- [ ] New tab shows minimal UI

---

## 🐛 If Issues Found

**Check Console Logs:**
- "🔔 Auto-opened popup - will close in 3 seconds" → Working
- "⏰ Auto-closing popup" → Timer working
- "Could not auto-open popup" → Browser blocked (OK)

**Common Issues:**
- Popup not opening? → Check if user is clicking during load
- Not auto-closing? → Check if manually opened
- Auto-closing manual opens? → Bug - report immediately

---

**Full Details:** See [AUTO_LAUNCH_FEATURE.md](AUTO_LAUNCH_FEATURE.md)  
**Testing URLs:** See [TESTING_URLS.md](TESTING_URLS.md)
