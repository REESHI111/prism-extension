/**
 * PRISM Messaging Utilities
 * Phase 1: Helper functions for inter-script communication
 */

interface MessageResponse<T = any> {
  status: 'OK' | 'ERROR';
  data?: T;
  message?: string;
}

/**
 * Send message to background script and get response
 */
export async function sendMessageToBackground<T = any>(
  type: string,
  payload?: any
): Promise<MessageResponse<T>> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      { type, ...payload },
      (response: MessageResponse<T>) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Send message to content script in active tab
 */
export async function sendMessageToContentScript<T = any>(
  type: string,
  payload?: any
): Promise<MessageResponse<T>> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab?.id) {
    throw new Error('No active tab found');
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tab.id!,
      { type, ...payload },
      (response: MessageResponse<T>) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      }
    );
  });
}
