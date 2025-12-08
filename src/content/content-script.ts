/**
 * PRISM Content Script
 * Phase 1: Basic Page Injection and Communication
 * Phase 3: Fingerprint Protection
 * Phase 5: ML-Powered Phishing Detection (Non-blocking)
 */

import { getMLDetector } from '../utils/ml-phishing-detector';

console.log('🔍 PRISM Content Script Loaded - Phase 5');
console.log('📍 Page:', window.location.href);

// Inject fingerprint protection script into page context
(function injectFingerprintProtection() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('content/fingerprint-protection.js');
  script.onload = () => {
    console.log('🛡️ Fingerprint protection injected');
    script.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();

// Listen for fingerprint detection messages
let fingerprintDetections = 0;
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  
  if (event.data.type === 'PRISM_FINGERPRINT_DETECTED') {
    fingerprintDetections++;
    
    // Report to background script
    chrome.runtime.sendMessage({
      type: 'FINGERPRINT_DETECTED',
      method: event.data.method,
      domain: window.location.hostname,
      url: window.location.href
    }).catch(() => {
      // Ignore if background script is not ready
    });
  }
});

// Run ML phishing detection (non-blocking)
const currentUrl = window.location.href;
let mlPrediction: any = null;

(async () => {
  try {
    const detector = await getMLDetector();
    mlPrediction = detector.classify(currentUrl);
    console.log('🧠 ML Phishing Detection Result:', mlPrediction);
    console.log(`📊 Confidence: ${(mlPrediction.confidence * 100).toFixed(1)}%`);
    
    // Report phishing detection to background (no page blocking)
    if (mlPrediction.isPhishing) {
      console.log(`⚠️ [PRISM] Phishing detected (${(mlPrediction.confidence * 100).toFixed(1)}% confidence) - Reporting only`);
      
      chrome.runtime.sendMessage({
        type: 'ML_PHISHING_DETECTED',
        url: currentUrl,
        prediction: mlPrediction
      }).catch(() => {});
    } else {
      console.log('✅ [PRISM] URL appears safe');
      
      chrome.runtime.sendMessage({
        type: 'ML_URL_SAFE',
        url: currentUrl,
        prediction: mlPrediction
      }).catch(() => {});
    }
  } catch (error) {
    console.error('❌ [PRISM] ML detection error:', error);
  }
})();

// Test communication with background service worker
chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('❌ Connection error:', chrome.runtime.lastError.message);
  } else {
    console.log('✅ Background connection established:', response);
  }
});

// Store PRISM object in window for debugging
interface PrismDebug {
  version: string;
  active: boolean;
  phase: number;
  url: string;
  injectedAt: string;
  fingerprintDetections: number;
  mlPrediction?: any;
}

(window as any).PRISM = {
  version: '1.0.0',
  active: true,
  phase: 5,
  url: window.location.href,
  injectedAt: new Date().toISOString(),
  get fingerprintDetections() {
    return fingerprintDetections;
  },
  get mlPrediction() {
    return mlPrediction;
  }
} as PrismDebug;

// Warning overlay creation with detailed threat information
function createWarningOverlay(reason: string, details: any): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = 'prism-warning-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(220, 38, 38, 0.95);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    overflow-y: auto;
  `;
  
  const harmLevelColors = {
    'Critical': '#dc2626',
    'High': '#ea580c',
    'Medium': '#f59e0b'
  };
  
  const harmLevelColor = details?.harmLevel ? harmLevelColors[details.harmLevel] : '#dc2626';
  
  // Build threats list HTML
  let threatsHTML = '';
  if (details?.threats && details.threats.length > 0) {
    threatsHTML = `
      <div id="threat-details" style="
        display: none;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
        text-align: left;
        max-height: 300px;
        overflow-y: auto;
      ">
        <h3 style="font-size: 18px; margin-bottom: 15px; text-align: center;">Detected Threats</h3>
        ${details.threats.map((threat: any, index: number) => `
          <div style="
            background: rgba(255, 255, 255, 0.1);
            border-left: 3px solid ${harmLevelColor};
            padding: 12px;
            margin-bottom: 12px;
            border-radius: 6px;
          ">
            <div style="font-weight: bold; font-size: 16px; margin-bottom: 6px;">🚨 ${threat.name}</div>
            <div style="font-size: 14px; margin-bottom: 4px; opacity: 0.9;">
              <strong>Purpose:</strong> ${threat.purpose}
            </div>
            <div style="font-size: 14px; opacity: 0.9;">
              <strong>Target:</strong> ${threat.target}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  overlay.innerHTML = `
    <div style="text-align: center; max-width: 700px; padding: 40px; margin: 20px;">
      <div style="font-size: 72px; margin-bottom: 20px;">⚠️</div>
      <h1 style="font-size: 32px; margin-bottom: 10px; font-weight: bold;">Security Warning</h1>
      ${details ? `
        <div style="
          display: inline-block;
          background: ${harmLevelColor};
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 20px;
        ">
          ${details.harmLevel} Risk - ${details.type}
        </div>
      ` : ''}
      <p style="font-size: 18px; margin-bottom: 20px; line-height: 1.5;">${reason}</p>
      ${details?.count ? `
        <div style="font-size: 16px; opacity: 0.9; margin-bottom: 20px;">
          ${details.count} threat${details.count > 1 ? 's' : ''} detected on this page
        </div>
      ` : ''}
      ${threatsHTML}
      ${details?.threats && details.threats.length > 0 ? `
        <button id="show-more-btn" style="
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid white;
          padding: 10px 20px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: all 0.3s;
        ">Show More Details</button>
      ` : ''}
      <div style="display: flex; gap: 20px; justify-content: center; margin-top: 10px;">
        <button id="prism-proceed" style="
          background: white;
          color: #dc2626;
          border: none;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        ">Proceed Anyway</button>
        <button id="prism-goback" style="
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        ">Go Back (Recommended)</button>
      </div>
    </div>
  `;
  
  return overlay;
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Content script received message:', message);
  
  switch (message.type) {
    case 'GET_PAGE_INFO':
      // Return page information
      sendResponse({
        status: 'OK',
        data: {
          url: window.location.href,
          title: document.title,
          domain: window.location.hostname,
          protocol: window.location.protocol,
          readyState: document.readyState,
          fingerprintDetections,
          mlPrediction
        }
      });
      break;

    case 'SHOW_WARNING':
      // Show harmful activity warning
      if (message.payload?.reason) {
        // Remove existing overlay if present
        const existing = document.getElementById('prism-warning-overlay');
        if (existing) existing.remove();
        
        // Create and show warning overlay with details
        const overlay = createWarningOverlay(message.payload.reason, message.payload.details);
        document.body.appendChild(overlay);
        
        // Show More button handler
        const showMoreBtn = document.getElementById('show-more-btn');
        const threatDetails = document.getElementById('threat-details');
        if (showMoreBtn && threatDetails) {
          showMoreBtn.addEventListener('click', () => {
            if (threatDetails.style.display === 'none') {
              threatDetails.style.display = 'block';
              showMoreBtn.textContent = 'Show Less';
            } else {
              threatDetails.style.display = 'none';
              showMoreBtn.textContent = 'Show More Details';
            }
          });
        }
        
        // Button handlers
        document.getElementById('prism-proceed')?.addEventListener('click', () => {
          overlay.remove();
        });
        
        document.getElementById('prism-goback')?.addEventListener('click', () => {
          window.history.back();
        });
        
        console.warn('⚠️ PRISM Warning displayed:', message.payload.reason);
        sendResponse({ status: 'OK', shown: true });
      }
      break;

    default:
      sendResponse({ 
        status: 'ERROR', 
        message: 'Unknown message type' 
      });
  }

  return true;
});

// Detect privacy policy on page with comprehensive search
function detectPrivacyPolicy(): boolean {
  const privacyKeywords = [
    'privacy policy',
    'privacy-policy',
    'privacy_policy',
    'privacypolicy',
    'privacy notice',
    'privacy statement',
    'data protection',
    'data privacy',
    'datenschutz',
    'politique de confidentialité',
    'política de privacidad',
    'informativa sulla privacy'
  ];
  
  const commonPaths = [
    '/privacy',
    '/privacy-policy',
    '/legal/privacy',
    '/privacy.html',
    '/pages/privacy',
    '/policy/privacy'
  ];
  
  // 1. Check for links containing privacy keywords
  const links = Array.from(document.querySelectorAll('a'));
  for (const link of links) {
    const href = link.getAttribute('href')?.toLowerCase() || '';
    const text = link.textContent?.toLowerCase().trim() || '';
    
    // Check keywords in href or text
    for (const keyword of privacyKeywords) {
      if (href.includes(keyword) || text.includes(keyword)) {
        console.log(`✅ Privacy policy link found: "${text}" -> ${href}`);
        return true;
      }
    }
    
    // Check common paths
    for (const path of commonPaths) {
      if (href.includes(path)) {
        console.log(`✅ Privacy policy found at common path: ${href}`);
        return true;
      }
    }
  }
  
  // 2. Check meta tags
  const metaTags = Array.from(document.querySelectorAll('meta'));
  for (const meta of metaTags) {
    const content = meta.getAttribute('content')?.toLowerCase() || '';
    const name = meta.getAttribute('name')?.toLowerCase() || '';
    
    for (const keyword of privacyKeywords) {
      if (content.includes(keyword) || name.includes(keyword)) {
        console.log(`✅ Privacy policy found in meta tag: ${name}`);
        return true;
      }
    }
  }
  
  // 3. Check footer content (common location for privacy links)
  const footer = document.querySelector('footer');
  if (footer) {
    const footerText = footer.textContent?.toLowerCase() || '';
    for (const keyword of privacyKeywords) {
      if (footerText.includes(keyword)) {
        console.log(`✅ Privacy policy found in footer`);
        return true;
      }
    }
  }
  
  // 4. Check for common privacy-related elements
  const privacyElements = document.querySelectorAll('[href*="privacy"], [id*="privacy"], [class*="privacy"]');
  if (privacyElements.length > 0) {
    console.log(`✅ Privacy policy found via element attributes (${privacyElements.length} matches)`);
    return true;
  }
  
  console.log('❌ No privacy policy found on page');
  return false;
}

// Send privacy policy detection to background
window.addEventListener('load', () => {
  const domain = window.location.hostname;
  const hasPrivacyPolicy = detectPrivacyPolicy();
  
  chrome.runtime.sendMessage({
    type: 'PRIVACY_POLICY_DETECTED',
    domain,
    found: hasPrivacyPolicy
  }).catch(() => {});
  
  console.log(`🔍 Privacy policy ${hasPrivacyPolicy ? 'found' : 'not found'} on ${domain}`);
});

// Log successful injection
console.log('✅ PRISM Content Script Ready - Phase 5');
console.log('🛡️ Fingerprint protection active');
console.log('🧠 ML phishing detection active');
console.log('🧪 Test: window.PRISM.mlPrediction');
console.log('🧪 Test: window.PRISM.fingerprintDetections');

