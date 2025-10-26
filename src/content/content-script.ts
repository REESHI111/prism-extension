/**
 * PRISM Content Script
 * Phase 1: Basic Page Injection and Communication
 * Enhanced: Warning overlay system for unsafe websites
 */

import { createWarningOverlay, shouldShowWarning } from './warning-overlay';

console.log('🔍 PRISM Content Script Loaded');
console.log('📍 Page:', window.location.href);

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
  showWarning?: (config?: any) => void;
}

(window as any).PRISM = {
  version: '1.0.0',
  active: true,
  phase: 1,
  url: window.location.href,
  injectedAt: new Date().toISOString(),
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
          readyState: document.readyState
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

// Log successful injection
console.log('✅ PRISM Content Script Ready');
console.log('🧪 Test warning: window.PRISM.showWarning()');
