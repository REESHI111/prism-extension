/**
 * PRISM Storage Utilities
 * Phase 1: Helper functions for Chrome storage
 */

/**
 * Get item from Chrome local storage
 */
export async function getStorageItem<T = any>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || null);
    });
  });
}

/**
 * Get multiple items from Chrome local storage
 */
export async function getStorageItems<T = any>(keys: string[]): Promise<Partial<T>> {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (result) => {
      resolve(result as Partial<T>);
    });
  });
}

/**
 * Set item in Chrome local storage
 */
export async function setStorageItem(key: string, value: any): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}

/**
 * Set multiple items in Chrome local storage
 */
export async function setStorageItems(items: Record<string, any>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, () => {
      resolve();
    });
  });
}

/**
 * Remove item from Chrome local storage
 */
export async function removeStorageItem(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(key, () => {
      resolve();
    });
  });
}

/**
 * Clear all Chrome local storage
 */
export async function clearStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
}
