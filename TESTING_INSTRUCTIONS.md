# Phase 2 Testing Instructions

## ✅ What We Built

Phase 2 implements **real tracker blocking** with live statistics:

- **60+ tracker domains** in database (Google Analytics, DoubleClick, Facebook trackers, etc.)
- **Real-time blocking** via Chrome webRequest API
- **Live statistics** tracking per-site and globally
- **Security score calculation** based on actual threats (100 - trackers*2 - cookies*1 - threats*10)
- **Persistent storage** that survives browser restarts

## 🧪 How to Test

### Step 1: Load Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Remove** on any old PRISM extension
4. Click **Load unpacked**
5. Navigate to `C:\Users\msi\Downloads\PRISM\dist`
6. Click **Select Folder**

✅ **Expected:** Extension loads with PRISM icon in toolbar

### Step 2: Check Console Logs

1. On the extensions page, click **service worker** under PRISM
2. This opens the service worker console

✅ **Expected:** You should see:
```
🛡️ PRISM Service Worker Loaded - Phase 2
✅ PRISM Extension Installed
```

### Step 3: Test on Tracker-Heavy Site

1. Visit a site with known trackers (try these):
   - https://www.cnn.com
   - https://www.forbes.com
   - https://www.theverge.com
   - https://www.nytimes.com

2. Watch the **service worker console**

✅ **Expected:** You should see messages like:
```
🚫 Blocked tracker: https://www.google-analytics.com/analytics.js
🚫 Blocked tracker: https://doubleclick.net/...
📨 Message received: GET_SITE_STATS
```

### Step 4: Check Popup Statistics

1. Click the PRISM extension icon in toolbar
2. The popup should show **real numbers** that increase

✅ **Expected Data:**
- **Trackers Blocked:** Should be > 0 on sites with trackers
- **Cookies Managed:** May show cookie activity
- **Requests Analyzed:** Should increase as you browse
- **Security Score:** Should be < 100 on tracker-heavy sites

### Step 5: Verify Real-Time Updates

1. Keep popup open
2. Refresh the page
3. Watch numbers increase in real-time

✅ **Expected:** 
- Numbers increment immediately when page loads
- No delay or manual refresh needed
- Stats persist even after closing popup

### Step 6: Test Multiple Sites

1. Visit different sites
2. Check that each site has separate stats
3. Global stats should sum all sites

✅ **Expected:**
- Each domain gets its own tracking
- Global stats show totals across all sites

### Step 7: Verify Persistence

1. Close and reopen popup
2. Restart Chrome
3. Stats should still be there

✅ **Expected:**
- Stats saved to Chrome local storage
- Survive browser restart
- Per-site history maintained

## 🔍 What to Look For

### ✅ Success Indicators:

- Console shows "🚫 Blocked tracker" messages
- Popup displays non-zero tracker counts
- Security score decreases on tracker-heavy sites
- Stats persist across browser restarts
- Each site has independent statistics

### ❌ Potential Issues:

**Problem:** No blockers showing in console
- **Solution:** Check that webRequest permission is in manifest.json
- **Solution:** Make sure you loaded from dist/ folder (not src/)

**Problem:** Popup shows all zeros
- **Solution:** Visit sites with actual trackers (news sites work best)
- **Solution:** Check service worker console for errors

**Problem:** "Service worker (Inactive)"
- **Solution:** Click on any website to activate it
- **Solution:** Reload extension if needed

## 📊 Expected Results by Site Type

| Site Type | Trackers | Score | Notes |
|-----------|----------|-------|-------|
| News sites (CNN, Forbes) | 10-30+ | 40-80 | Heavy tracking |
| Social media | 5-15 | 70-90 | Moderate tracking |
| Google.com | 0-5 | 90-100 | Minimal tracking |
| Local files (file:///) | 0 | 100 | No tracking |

## 🎯 Phase 2 Completion Criteria

- [x] Tracker database with 60+ domains
- [x] webRequest API integration
- [x] Real-time statistics collection
- [x] Security score calculation
- [x] Persistent storage
- [ ] **Verified tracker blocking in console** ← TEST THIS
- [ ] **Popup shows real statistics** ← TEST THIS
- [ ] **Stats persist across restarts** ← TEST THIS

## 🐛 Debugging Tips

1. **Always check service worker console** - Most important debugging tool
2. **Try incognito mode** - Isolates extension from other factors
3. **Clear extension storage** - `chrome.storage.local.clear()` in console
4. **Reload extension** - Click refresh icon on chrome://extensions/

## 📝 Report Back

After testing, report:
1. ✅ or ❌ for each test step
2. Console output screenshot
3. Popup screenshot showing real numbers
4. Any error messages

This will confirm Phase 2 is working before moving to Phase 3!
