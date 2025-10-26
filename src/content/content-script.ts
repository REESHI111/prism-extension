/**
 * PRISM Content Script
 * Phase 1: Basic Page Injection and Communication
 */

console.log('🔍 PRISM Content Script Loaded');
console.log('📍 Page:', window.location.href);

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
}

(window as any).PRISM = {
  version: '1.0.0',
  active: true,
  phase: 1,
  url: window.location.href,
  injectedAt: new Date().toISOString()
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
