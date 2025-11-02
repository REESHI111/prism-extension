/**
 * PRISM Content Script
 * Phase 1: Basic Page Injection and Communication
 * Phase 3: Fingerprint Protection
 * Enhanced: Warning overlay system for unsafe websites
 */

import { createWarningOverlay, shouldShowWarning } from './warning-overlay';

console.log('🔍 PRISM Content Script Loaded - Phase 3');
console.log('📍 Page:', window.location.href);

// Inject fingerprint protection BEFORE page scripts load
(function injectFingerprintProtection() {
  const script = document.createElement('script');
  script.textContent = `
    // Canvas fingerprinting protection
    (function() {
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      
      const addNoise = (data) => {
        if (!data || !data.data) return data;
        for (let i = 0; i < data.data.length; i += 4) {
          data.data[i] += Math.floor(Math.random() * 3) - 1;
          data.data[i + 1] += Math.floor(Math.random() * 3) - 1;
          data.data[i + 2] += Math.floor(Math.random() * 3) - 1;
        }
        return data;
      };

      HTMLCanvasElement.prototype.toDataURL = function(...args) {
        console.log('🛡️ PRISM: Blocked canvas fingerprinting');
        window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'canvas' }, '*');
        
        const context = this.getContext('2d');
        if (context) {
          const imageData = context.getImageData(0, 0, this.width, this.height);
          addNoise(imageData);
          context.putImageData(imageData, 0, 0);
        }
        return originalToDataURL.apply(this, args);
      };

      CanvasRenderingContext2D.prototype.getImageData = function(...args) {
        window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'canvas' }, '*');
        const imageData = originalGetImageData.apply(this, args);
        return addNoise(imageData);
      };
    })();

    // WebGL fingerprinting protection
    (function() {
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      
      WebGLRenderingContext.prototype.getParameter = function(param) {
        if (param === 37445 || param === 37446) {
          console.log('🛡️ PRISM: Blocked WebGL fingerprinting');
          window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'webgl' }, '*');
          if (param === 37445) return 'Intel Inc.';
          if (param === 37446) return 'Intel Iris OpenGL Engine';
        }
        return getParameter.call(this, param);
      };
    })();

    // Audio fingerprinting protection
    (function() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      const originalCreateOscillator = AudioContext.prototype.createOscillator;
      
      AudioContext.prototype.createOscillator = function() {
        console.log('🛡️ PRISM: Detected audio fingerprinting');
        window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'audio' }, '*');
        return originalCreateOscillator.call(this);
      };
    })();
  `;
  
  (document.head || document.documentElement).appendChild(script);
  script.remove();
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

// Check if we should show warning overlay
const currentUrl = window.location.href;
const warningConfig = shouldShowWarning(currentUrl);

if (warningConfig) {
  console.log('⚠️ [PRISM] Warning overlay triggered for:', currentUrl);
  createWarningOverlay(warningConfig);
}

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
  showWarning?: (config?: any) => void;
}

(window as any).PRISM = {
  version: '1.0.0',
  active: true,
  phase: 3,
  url: window.location.href,
  injectedAt: new Date().toISOString(),
  get fingerprintDetections() {
    return fingerprintDetections;
  },
  // Allow manual triggering of warning overlay for testing
  showWarning: (config?: any) => {
    const testConfig = config || {
      type: 'phishing',
      severity: 'high',
      domain: window.location.hostname,
      reasons: [
        'This is a test warning',
        'Triggered manually for demonstration',
        'Real detection will be implemented in Phase 5'
      ],
      canProceed: true
    };
    console.log('🧪 [PRISM] Manually showing warning overlay');
    createWarningOverlay(testConfig);
  }
} as PrismDebug;

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
          fingerprintDetections
        }
      });
      break;

    case 'SHOW_WARNING':
      // Show warning overlay on demand
      if (message.config) {
        createWarningOverlay(message.config);
        sendResponse({ status: 'OK', message: 'Warning displayed' });
      } else {
        sendResponse({ status: 'ERROR', message: 'No config provided' });
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

// Detect privacy policy on page
function detectPrivacyPolicy(): boolean {
  const privacyKeywords = [
    'privacy policy',
    'privacy-policy',
    'privacy_policy',
    'privacypolicy',
    'datenschutz',
    'politique de confidentialité'
  ];
  
  // Check for links containing privacy keywords
  const links = Array.from(document.querySelectorAll('a'));
  for (const link of links) {
    const href = link.getAttribute('href')?.toLowerCase() || '';
    const text = link.textContent?.toLowerCase() || '';
    
    for (const keyword of privacyKeywords) {
      if (href.includes(keyword) || text.includes(keyword)) {
        return true;
      }
    }
  }
  
  // Check meta tags
  const metaTags = Array.from(document.querySelectorAll('meta'));
  for (const meta of metaTags) {
    const content = meta.getAttribute('content')?.toLowerCase() || '';
    for (const keyword of privacyKeywords) {
      if (content.includes(keyword)) {
        return true;
      }
    }
  }
  
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
console.log('✅ PRISM Content Script Ready - Phase 3');
console.log('🛡️ Fingerprint protection active');
console.log('🧪 Test: window.PRISM.fingerprintDetections');

