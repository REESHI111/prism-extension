# PRISM Extension Testing Guide

## Test the Extension Locally

### 1. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `dist` folder from your project
5. The PRISM extension should now appear in your extensions

### 2. Test Basic Functionality
1. Visit any website (e.g., facebook.com, google.com)
2. Click the PRISM icon in the Chrome toolbar
3. You should see:
   - Privacy score (basic calculation)
   - Blocked trackers count
   - Current website domain
   - Extension interface

### 3. Check Console Logs
1. Right-click on PRISM extension icon → "Inspect popup"
2. Go to Console tab to see React app logs
3. Check background script: `chrome://extensions/` → PRISM → "Inspect views: service worker"
4. Check content script: F12 on any webpage → Console tab

### Expected Results
- ✅ Extension loads without errors
- ✅ Popup displays with basic interface
- ✅ Privacy score shows (even if placeholder)
- ✅ Console shows PRISM initialization logs
- ✅ No critical JavaScript errors

## Development Testing

### Hot Reload During Development
```bash
# Start development build with watch mode
npm run dev
```

### Backend API Testing
```bash
# Start backend server
npm run server:dev

# Test API endpoints
curl http://localhost:3000/health
```

## Next Phase Testing
Each phase will have specific testing requirements documented in the development roadmap.