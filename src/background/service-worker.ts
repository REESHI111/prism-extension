/**
 * PRISM Background Service Worker
 * Phase 1: Basic Extension Foundation
 */

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🛡️ PRISM Extension Installed');
  
  // Initialize storage with default values
  chrome.storage.local.set({
    extensionActive: true,
    installDate: new Date().toISOString(),
    version: '1.0.0',
    phase: 1
  });

  // Show welcome notification
  if (details.reason === 'install') {
    console.log('✅ First time installation');
  } else if (details.reason === 'update') {
    console.log('🔄 Extension updated');
  }
});

// Message handling from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Message received:', message.type, message);
  
  switch (message.type) {
    case 'PING':
      // Basic connectivity check
      sendResponse({ 
        status: 'OK', 
        message: 'PRISM is active',
        timestamp: Date.now()
      });
      break;

    case 'GET_STATUS':
      // Return extension status
      chrome.storage.local.get(['extensionActive', 'version', 'installDate'], (data) => {
        sendResponse({
          status: 'OK',
          data: {
            active: data.extensionActive || true,
            version: data.version || '1.0.0',
            installDate: data.installDate,
            phase: 1
          }
        });
      });
      return true; // Keep channel open for async response

    case 'GET_TAB_INFO':
      // Get current tab information
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          const url = tabs[0].url || '';
          try {
            const urlObj = new URL(url);
            sendResponse({
              status: 'OK',
              data: {
                url: url,
                domain: urlObj.hostname,
                protocol: urlObj.protocol,
                title: tabs[0].title
              }
            });
          } catch (e) {
            sendResponse({
              status: 'ERROR',
              message: 'Invalid URL'
            });
          }
        } else {
          sendResponse({
            status: 'ERROR',
            message: 'No active tab'
          });
        }
      });
      return true; // Keep channel open for async response

    default:
      console.warn('⚠️ Unknown message type:', message.type);
      sendResponse({ 
        status: 'ERROR', 
        message: 'Unknown message type' 
      });
  }

  return true; // Keep message channel open
});

// Log when service worker starts
console.log('🚀 PRISM Service Worker Started - Phase 1');
console.log('📅 Timestamp:', new Date().toISOString());
