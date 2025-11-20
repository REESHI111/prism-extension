# Browser Extension Integration Guide

**Complete guide for integrating the PRISM phishing detector with your browser extension.**

---

## 📋 Integration Options

### Option 1: Python Backend (Recommended)

Run the ML model as a local HTTP API that the extension can query.

#### Step 1: Create API Server

Create `api_server.py` in the `ml/` folder:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from phishing_detector import PhishingDetector

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from extension

# Load model at startup
detector = PhishingDetector.load("model.pkl")

@app.route('/api/check', methods=['POST'])
def check_url():
    """Check if URL is phishing."""
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({'error': 'URL required'}), 400
    
    result = detector.predict(url)
    return jsonify(result)

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'model_loaded': detector.is_trained})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
```

#### Step 2: Install Flask

```bash
pip install flask flask-cors
```

#### Step 3: Start Server

```bash
python api_server.py
```

Server runs at `http://127.0.0.1:5000`

#### Step 4: Update Extension Background Script

In your extension's `src/background/service-worker.ts`:

```typescript
// Phishing detection via local API
async function checkURLPhishing(url: string): Promise<PhishingResult> {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/check', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({url})
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        return {
            isPhishing: result.is_phishing,
            confidence: result.confidence,
            typosquattingScore: result.typosquatting_score,
            missingCharScore: result.missing_char_typo_score
        };
    } catch (error) {
        console.error('ML API error:', error);
        return {isPhishing: false, confidence: 0, error: error.message};
    }
}

// Use in navigation listener
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    if (details.frameId !== 0) return; // Main frame only
    
    const result = await checkURLPhishing(details.url);
    
    if (result.isPhishing && result.confidence > 0.8) {
        // High confidence phishing - block
        chrome.tabs.update(details.tabId, {
            url: chrome.runtime.getURL('src/content/warning-overlay.html')
        });
    }
});
```

---

### Option 2: Native Messaging (Advanced)

For users who want the ML model bundled with the extension.

#### Step 1: Create Native Host

Create `native_host.py`:

```python
#!/usr/bin/env python3
import sys
import json
import struct
from phishing_detector import PhishingDetector

# Load model
detector = PhishingDetector.load("model.pkl")

def send_message(message):
    """Send message to extension."""
    encoded = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('I', len(encoded)))
    sys.stdout.buffer.write(encoded)
    sys.stdout.buffer.flush()

def read_message():
    """Read message from extension."""
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        return None
    message_length = struct.unpack('I', raw_length)[0]
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

# Main loop
while True:
    try:
        message = read_message()
        if not message:
            break
        
        url = message.get('url')
        result = detector.predict(url)
        send_message(result)
        
    except Exception as e:
        send_message({'error': str(e)})
```

#### Step 2: Register Native Host

Create `prism_ml_host.json` (Windows: `%USERPROFILE%\.config\chrome\NativeMessagingHosts\`):

```json
{
    "name": "com.prism.ml_detector",
    "description": "PRISM ML Phishing Detector",
    "path": "C:\\path\\to\\native_host.exe",
    "type": "stdio",
    "allowed_origins": [
        "chrome-extension://YOUR_EXTENSION_ID/"
    ]
}
```

#### Step 3: Use in Extension

```typescript
// In service-worker.ts
const port = chrome.runtime.connectNative('com.prism.ml_detector');

port.onMessage.addListener((message) => {
    console.log('ML result:', message);
});

function checkURL(url: string) {
    port.postMessage({url});
}
```

---

## 🔌 Integration Patterns

### Pattern 1: Real-time URL Checking

Check every URL as user navigates:

```typescript
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    const result = await checkURLPhishing(details.url);
    
    if (result.isPhishing) {
        if (result.confidence > 0.9) {
            // Very high confidence - block immediately
            blockPage(details.tabId);
        } else if (result.confidence > 0.7) {
            // Medium confidence - show warning
            showWarningBadge(details.tabId);
        }
    }
});
```

### Pattern 2: On-demand Checking

Check URL when user clicks extension icon:

```typescript
chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.url) return;
    
    const result = await checkURLPhishing(tab.url);
    
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: result.isPhishing ? '⚠️ Phishing Detected' : '✅ Safe',
        message: `Confidence: ${(result.confidence * 100).toFixed(1)}%`
    });
});
```

### Pattern 3: Batch URL Analysis

Analyze user's browsing history:

```typescript
async function analyzeHistory() {
    const history = await chrome.history.search({text: '', maxResults: 100});
    const urls = history.map(item => item.url);
    
    const response = await fetch('http://127.0.0.1:5000/api/batch', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({urls})
    });
    
    const results = await response.json();
    const phishing = results.filter(r => r.is_phishing);
    
    console.log(`Found ${phishing.length} phishing URLs in history`);
}
```

---

## 📊 Response Format

### Success Response

```json
{
    "url": "http://g00gle.com/login",
    "is_phishing": true,
    "confidence": 0.942,
    "features": {
        "url_length": 24,
        "has_https": 0,
        "typosquatting_score": 1.0,
        "missing_char_typo_score": 0.0,
        "num_sensitive_words": 1,
        "has_ip_address": 0,
        "is_suspicious_tld": 0
    },
    "typosquatting_score": 1.0,
    "missing_char_typo_score": 0.0
}
```

### Error Response

```json
{
    "url": "invalid-url",
    "is_phishing": null,
    "confidence": 0.0,
    "error": "Failed to extract features"
}
```

---

## 🎨 UI Integration Examples

### Display Warning Overlay

```typescript
// When phishing detected
function showPhishingWarning(tabId: number, result: any) {
    chrome.scripting.executeScript({
        target: {tabId},
        func: (data) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255,0,0,0.95); z-index: 999999;
                display: flex; align-items: center; justify-content: center;
                color: white; font-family: Arial; text-align: center;
            `;
            overlay.innerHTML = `
                <div>
                    <h1>⚠️ PHISHING WARNING</h1>
                    <p>This website may be trying to steal your information.</p>
                    <p>Confidence: ${(data.confidence * 100).toFixed(1)}%</p>
                    <p>Typosquatting Score: ${data.typosquatting_score.toFixed(2)}</p>
                    <button onclick="history.back()">Go Back</button>
                </div>
            `;
            document.body.appendChild(overlay);
        },
        args: [result]
    });
}
```

### Badge Notification

```typescript
function updateBadge(tabId: number, isPhishing: boolean) {
    chrome.action.setBadgeText({
        text: isPhishing ? '⚠' : '✓',
        tabId
    });
    
    chrome.action.setBadgeBackgroundColor({
        color: isPhishing ? '#ff0000' : '#00ff00',
        tabId
    });
}
```

---

## 🚀 Performance Optimization

### Caching Results

```typescript
const urlCache = new Map<string, PhishingResult>();
const CACHE_TTL = 3600000; // 1 hour

async function checkURLWithCache(url: string): Promise<PhishingResult> {
    const cached = urlCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached;
    }
    
    const result = await checkURLPhishing(url);
    result.timestamp = Date.now();
    urlCache.set(url, result);
    
    return result;
}
```

### Debouncing

```typescript
let checkTimeout: NodeJS.Timeout;

function debouncedCheck(url: string, delay: number = 500) {
    clearTimeout(checkTimeout);
    checkTimeout = setTimeout(() => {
        checkURLPhishing(url);
    }, delay);
}
```

---

## 🧪 Testing Integration

### Test API Connection

```typescript
async function testMLAPI() {
    try {
        const response = await fetch('http://127.0.0.1:5000/health');
        const data = await response.json();
        console.log('ML API status:', data);
        return data.status === 'ok';
    } catch (error) {
        console.error('ML API not available:', error);
        return false;
    }
}
```

### Test Predictions

```typescript
async function runTests() {
    const tests = [
        {url: 'https://google.com', expected: false},
        {url: 'http://g00gle.com', expected: true},
        {url: 'http://facbook.com/login', expected: true}
    ];
    
    for (const test of tests) {
        const result = await checkURLPhishing(test.url);
        const pass = result.isPhishing === test.expected;
        console.log(`${pass ? '✅' : '❌'} ${test.url}`);
    }
}
```

---

## 📦 Deployment

### Package ML Model with Extension

1. Train and save model: `python phishing_detector.py`
2. Copy `model.pkl` to extension folder
3. Include `api_server.py` in extension package
4. Create installer that:
   - Installs Python dependencies
   - Starts API server on system boot
   - Registers with extension

### Auto-start API Server (Windows)

Create `start_ml_api.bat`:

```batch
@echo off
cd /d "%~dp0"
python api_server.py
```

Add to Windows startup folder or create scheduled task.

---

## 🔒 Security Considerations

1. **Local API Only**: Bind to `127.0.0.1` (localhost only)
2. **CORS**: Only allow your extension's origin
3. **Input Validation**: Sanitize URLs before processing
4. **Rate Limiting**: Prevent abuse of API endpoint
5. **HTTPS**: Use HTTPS for production deployments

---

## 📝 Complete Example

See `ml/examples/extension_integration.ts` for a complete working example.

---

## 🤝 Support

For issues or questions about integration, check:
- README.md for basic setup
- This file for integration patterns
- Create GitHub issue for specific problems
