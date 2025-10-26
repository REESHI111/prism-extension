# Quick Test: Real-Time Data Verification

## Before You Start
1. Build the extension: `npm run build:dev` ✅ (Already done)
2. Load in Chrome: `chrome://extensions/` → Load unpacked → `PRISM/dist`

## 5-Minute Test Plan

### Test 1: Verify Cookie Counting (2 minutes)

**Step 1**: Visit https://www.cnn.com
- Wait for page to fully load (~10 seconds)
- Click PRISM extension icon
- **Expected**: Cookies should show **30-80** (not 0!)

**Step 2**: Compare with DevTools
- Press F12 → Application tab → Cookies → https://www.cnn.com
- Count the cookies manually
- **Expected**: PRISM count ≈ DevTools count (±5)

**Step 3**: Watch Real-Time Updates
- Keep PRISM popup open
- Reload the page (Ctrl+R)
- **Expected**: Cookie count should increase as page loads

✅ **PASS if**: Cookies show non-zero and match DevTools  
❌ **FAIL if**: Shows 0 or doesn't update

---

### Test 2: Verify Different Scores Per Site (2 minutes)

**Visit these sites and record scores**:

| Site | Expected Score | Expected Cookies | Expected Trackers |
|------|----------------|------------------|-------------------|
| https://www.google.com | 90-100 | 5-15 | 0-5 |
| https://www.cnn.com | 50-70 | 30-80 | 20-50 |
| https://www.wikipedia.org | 85-95 | 0-10 | 0-5 |

**Steps for each site**:
1. Open site in new tab
2. Wait 5 seconds
3. Click PRISM icon
4. Note: Score, Cookies, Trackers
5. Close tab

✅ **PASS if**: All 3 sites show DIFFERENT scores  
❌ **FAIL if**: All show same score (e.g., all 95 or all 100)

---

### Test 3: Verify Request Analysis (1 minute)

**Step 1**: Open https://www.cnn.com
- Click PRISM icon
- Note "Requests Analyzed" counter
- **Expected**: Should be **100-500** (not 0!)

**Step 2**: Reload page
- Keep popup open
- Press Ctrl+R
- Watch "Requests Analyzed" counter
- **Expected**: Should increase rapidly (50+ requests/second)

✅ **PASS if**: Counter shows non-zero and increases on reload  
❌ **FAIL if**: Always shows 0 or doesn't change

---

## Debugging Checklist

If ANY test fails:

### 1. Check Service Worker
```
chrome://extensions/ → PRISM → "service worker"
```
**Console should show**:
```
🛡️ PRISM Service Worker Loaded - Phase 3
```

### 2. Check for Errors
```
chrome://extensions/ → PRISM → "Errors" button
```
**Should show**: 0 errors

If errors present, copy and report them.

### 3. Check Permissions
```
chrome://extensions/ → PRISM → Details
```
**Permissions should include**:
- ✅ Read and change all your data on all websites
- ✅ Read your browsing history
- ✅ Manage your cookies

### 4. Check Messages
Open PRISM popup → Right-click → Inspect → Console

**Should show every 2 seconds**:
```
📊 Stats loaded: { domain: "cnn.com", score: 62, trackers: 47, cookies: 82, ... }
```

## Expected Console Output

### Service Worker Console
```javascript
🛡️ PRISM Service Worker Loaded - Phase 3
✅ PRISM Extension Installed - Phase 3
📨 Message received: GET_TAB_INFO
📨 Message received: GET_SITE_STATS
🚫 Blocked tracker: https://www.google-analytics.com/analytics.js
🚫 Blocked tracker: https://securepubads.g.doubleclick.net/...
📨 Message received: GET_SITE_STATS
```

### Popup Console (Inspect popup)
```javascript
📊 Stats loaded: { 
  domain: "cnn.com", 
  score: 62, 
  trackers: 47, 
  cookies: 82, 
  requests: 324, 
  threats: 2 
}
```

## Success Criteria

✅ **ALL GOOD** if:
- Cookies show actual count (not 0)
- Different sites have different scores
- Requests Analyzed counter increases
- Trackers Blocked increases on tracker-heavy sites
- Console shows periodic updates

❌ **NEEDS FIX** if:
- Any metric always shows 0
- All sites show same score
- No console output
- Extension errors present

## Performance Check

### Memory Usage
```
chrome://extensions/ → PRISM → "Inspect views: service worker"
→ Performance Monitor (Shift+Cmd+P → "Show Performance Monitor")
```
**Expected**: 15-30 MB (acceptable)  
**Warning**: >100 MB (memory leak)

### CPU Usage
```
Task Manager (Shift+Esc in Chrome)
→ Find "Extension: PRISM"
```
**Expected**: 0-2% CPU (idle)  
**Warning**: >10% CPU (inefficient polling)

## Quick Fix Guide

### Problem: "Cookies always 0"
**Fix**:
1. Check if site actually has cookies (F12 → Application → Cookies)
2. Try a different site (CNN, Amazon, Facebook)
3. Check service worker console for errors

### Problem: "All scores are 100"
**Fix**:
1. Visit a tracking-heavy site (CNN.com, Daily Mail)
2. Wait 10 seconds for page to load
3. Reload extension (`chrome://extensions/` → Reload button)

### Problem: "Nothing updates"
**Fix**:
1. Check service worker is running (click "service worker" link)
2. Reload extension
3. Close all tabs and open new one
4. Check for JavaScript errors

## Report Results

After testing, document:

```
Test 1 (Cookies): ✅ PASS / ❌ FAIL
- CNN cookies: ___ (expected 30-80)
- Matches DevTools: ✅ YES / ❌ NO

Test 2 (Scores): ✅ PASS / ❌ FAIL
- Google: ___ (expected 90-100)
- CNN: ___ (expected 50-70)
- Wikipedia: ___ (expected 85-95)

Test 3 (Requests): ✅ PASS / ❌ FAIL
- CNN requests: ___ (expected 100-500)
- Increases on reload: ✅ YES / ❌ NO

Overall: ✅ ALL TESTS PASS / ❌ SOME FAILURES
```

## Next Steps After Testing

If **ALL PASS** ✅:
- Continue to Phase 3.4 (Enhanced UI)
- Document results in TESTING.md
- Proceed with confidence

If **ANY FAIL** ❌:
- Report specific failures
- Check browser console for errors
- Provide screenshots if possible
- Debug using guide above
