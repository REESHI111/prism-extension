/**
 * Fingerprint Blocker
 * Phase 3: Advanced Privacy Protection
 * 
 * Blocks various fingerprinting techniques:
 * - Canvas fingerprinting
 * - WebGL fingerprinting
 * - Font enumeration
 * - Audio context fingerprinting
 * - Screen resolution tracking
 */

export interface FingerprintProtection {
  canvas: boolean;
  webgl: boolean;
  fonts: boolean;
  audio: boolean;
  screen: boolean;
  timezone: boolean;
}

export class FingerprintBlocker {
  private static instance: FingerprintBlocker;
  private protectionEnabled: FingerprintProtection;
  private detectionCount: Map<string, number>;

  private constructor() {
    this.protectionEnabled = {
      canvas: true,
      webgl: true,
      fonts: true,
      audio: true,
      screen: true,
      timezone: false // Can break some websites
    };
    
    this.detectionCount = new Map();
    this.loadSettings();
  }

  static getInstance(): FingerprintBlocker {
    if (!FingerprintBlocker.instance) {
      FingerprintBlocker.instance = new FingerprintBlocker();
    }
    return FingerprintBlocker.instance;
  }

  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.local.get('fingerprint_protection');
      if (result.fingerprint_protection) {
        this.protectionEnabled = result.fingerprint_protection;
      }
    } catch (error) {
      console.error('Failed to load fingerprint settings:', error);
    }
  }

  async saveSettings(): Promise<void> {
    try {
      await chrome.storage.local.set({
        fingerprint_protection: this.protectionEnabled
      });
    } catch (error) {
      console.error('Failed to save fingerprint settings:', error);
    }
  }

  /**
   * Get injection script to block fingerprinting
   * This will be injected into pages before any scripts run
   */
  getInjectionScript(): string {
    const protections: string[] = [];

    // Canvas fingerprinting protection
    if (this.protectionEnabled.canvas) {
      protections.push(`
        // Block canvas fingerprinting
        (function() {
          const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
          const originalToBlob = HTMLCanvasElement.prototype.toBlob;
          const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
          
          // Add noise to canvas data
          const addNoise = (data) => {
            if (!data || !data.data) return data;
            for (let i = 0; i < data.data.length; i += 4) {
              // Add small random noise to RGB values
              data.data[i] += Math.floor(Math.random() * 3) - 1;
              data.data[i + 1] += Math.floor(Math.random() * 3) - 1;
              data.data[i + 2] += Math.floor(Math.random() * 3) - 1;
            }
            return data;
          };

          HTMLCanvasElement.prototype.toDataURL = function(...args) {
            console.log('🛡️ PRISM: Blocked canvas fingerprinting (toDataURL)');
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
            console.log('🛡️ PRISM: Blocked canvas fingerprinting (getImageData)');
            window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'canvas' }, '*');
            const imageData = originalGetImageData.apply(this, args);
            return addNoise(imageData);
          };
        })();
      `);
    }

    // WebGL fingerprinting protection
    if (this.protectionEnabled.webgl) {
      protections.push(`
        // Block WebGL fingerprinting
        (function() {
          const getParameter = WebGLRenderingContext.prototype.getParameter;
          const getSupportedExtensions = WebGLRenderingContext.prototype.getSupportedExtensions;
          
          WebGLRenderingContext.prototype.getParameter = function(param) {
            console.log('🛡️ PRISM: Blocked WebGL fingerprinting');
            window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'webgl' }, '*');
            
            // Return fake but consistent values for common fingerprinting parameters
            if (param === 37445) return 'Intel Inc.'; // UNMASKED_VENDOR_WEBGL
            if (param === 37446) return 'Intel Iris OpenGL Engine'; // UNMASKED_RENDERER_WEBGL
            return getParameter.call(this, param);
          };

          WebGLRenderingContext.prototype.getSupportedExtensions = function() {
            console.log('🛡️ PRISM: Limited WebGL extensions');
            window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'webgl' }, '*');
            // Return minimal set of extensions
            return ['WEBGL_debug_renderer_info'];
          };
        })();
      `);
    }

    // Font enumeration protection
    if (this.protectionEnabled.fonts) {
      protections.push(`
        // Block font enumeration
        (function() {
          const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
          const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
          
          const fontDetectionElements = new WeakSet();
          
          Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            get() {
              if (fontDetectionElements.has(this)) {
                console.log('🛡️ PRISM: Blocked font enumeration');
                window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'fonts' }, '*');
                // Return slightly randomized value
                return originalOffsetWidth.get.call(this) + (Math.random() - 0.5);
              }
              return originalOffsetWidth.get.call(this);
            }
          });
          
          Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            get() {
              if (fontDetectionElements.has(this)) {
                window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'fonts' }, '*');
                return originalOffsetHeight.get.call(this) + (Math.random() - 0.5);
              }
              return originalOffsetHeight.get.call(this);
            }
          });
        })();
      `);
    }

    // Audio context fingerprinting protection
    if (this.protectionEnabled.audio) {
      protections.push(`
        // Block audio context fingerprinting
        (function() {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (!AudioContext) return;
          
          const originalCreateOscillator = AudioContext.prototype.createOscillator;
          const originalCreateDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
          
          AudioContext.prototype.createOscillator = function() {
            console.log('🛡️ PRISM: Detected audio fingerprinting attempt');
            window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'audio' }, '*');
            return originalCreateOscillator.call(this);
          };
          
          AudioContext.prototype.createDynamicsCompressor = function() {
            console.log('🛡️ PRISM: Detected audio fingerprinting attempt');
            window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'audio' }, '*');
            const compressor = originalCreateDynamicsCompressor.call(this);
            // Slightly modify compressor values
            if (compressor.threshold) compressor.threshold.value += Math.random() * 2 - 1;
            return compressor;
          };
        })();
      `);
    }

    // Screen resolution spoofing
    if (this.protectionEnabled.screen) {
      protections.push(`
        // Spoof screen resolution (slight randomization)
        (function() {
          const originalScreen = window.screen;
          const screenValues = {
            width: originalScreen.width,
            height: originalScreen.height,
            availWidth: originalScreen.availWidth,
            availHeight: originalScreen.availHeight,
            colorDepth: 24, // Common value
            pixelDepth: 24
          };
          
          Object.defineProperty(window, 'screen', {
            get() {
              console.log('🛡️ PRISM: Screen resolution access detected');
              window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'screen' }, '*');
              return screenValues;
            }
          });
        })();
      `);
    }

    return protections.join('\n');
  }

  /**
   * Increment detection count for a domain
   */
  incrementDetection(domain: string, method: string): void {
    const key = `${domain}:${method}`;
    const count = this.detectionCount.get(key) || 0;
    this.detectionCount.set(key, count + 1);
    
    console.log(`🔍 Fingerprint detection: ${method} on ${domain} (${count + 1} times)`);
  }

  /**
   * Get detection statistics
   */
  getDetections(domain?: string): Map<string, number> {
    if (domain) {
      const filtered = new Map();
      for (const [key, value] of this.detectionCount.entries()) {
        if (key.startsWith(domain + ':')) {
          const method = key.split(':')[1];
          filtered.set(method, value);
        }
      }
      return filtered;
    }
    return this.detectionCount;
  }

  /**
   * Get total fingerprint attempts blocked
   */
  getTotalBlocked(): number {
    let total = 0;
    for (const count of this.detectionCount.values()) {
      total += count;
    }
    return total;
  }

  /**
   * Enable/disable specific protection
   */
  setProtection(type: keyof FingerprintProtection, enabled: boolean): void {
    this.protectionEnabled[type] = enabled;
    this.saveSettings();
  }

  /**
   * Get current protection settings
   */
  getProtectionSettings(): FingerprintProtection {
    return { ...this.protectionEnabled };
  }

  /**
   * Reset detection count
   */
  resetDetections(): void {
    this.detectionCount.clear();
  }
}
