/**
 * PRISM Content Script
 * Runs on all web pages to detect forms, analyze content, and provide warnings
 */

interface FormField {
  element: HTMLInputElement;
  type: 'email' | 'password' | 'text' | 'tel' | 'unknown';
  isPersonalData: boolean;
}

class PrismContentScript {
  private forms: FormField[] = [];
  private observer: MutationObserver | null = null;
  
  constructor() {
    this.initialize();
  }
  
  private initialize(): void {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }
  }
  
  private onDOMReady(): void {
    console.log('🔍 PRISM Content Script Active on:', window.location.hostname);
    
    // Scan for forms
    this.scanForForms();
    
    // Setup mutation observer for dynamic content
    this.setupMutationObserver();
    
    // Analyze page for phishing indicators
    this.analyzePageForThreats();
    
    // Send page data to background script
    this.reportPageData();
  }
  
  private scanForForms(): void {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="tel"]');
    
    this.forms = Array.from(inputs).map(input => ({
      element: input as HTMLInputElement,
      type: this.classifyInputType(input as HTMLInputElement),
      isPersonalData: this.isPersonalDataField(input as HTMLInputElement)
    }));
    
    console.log(`📝 Found ${this.forms.length} form fields`);
    
    // Add event listeners for form submissions
    this.forms.forEach(field => {
      field.element.addEventListener('focus', () => this.onFieldFocus(field));
    });
  }
  
  private classifyInputType(input: HTMLInputElement): FormField['type'] {
    const type = input.type.toLowerCase();
    const name = input.name.toLowerCase();
    const placeholder = input.placeholder?.toLowerCase() || '';
    const id = input.id.toLowerCase();
    
    // Check for email
    if (type === 'email' || 
        name.includes('email') || 
        placeholder.includes('email') ||
        id.includes('email')) {
      return 'email';
    }
    
    // Check for password
    if (type === 'password') {
      return 'password';
    }
    
    // Check for phone
    if (type === 'tel' || 
        name.includes('phone') || 
        name.includes('tel') ||
        placeholder.includes('phone')) {
      return 'tel';
    }
    
    // Check for personal data fields
    if (name.includes('name') || 
        name.includes('address') ||
        placeholder.includes('name') ||
        placeholder.includes('address')) {
      return 'text';
    }
    
    return 'unknown';
  }
  
  private isPersonalDataField(input: HTMLInputElement): boolean {
    const identifiers = ['name', 'email', 'phone', 'address', 'ssn', 'credit', 'card'];
    const fieldText = [
      input.name,
      input.placeholder,
      input.id,
      input.className
    ].join(' ').toLowerCase();
    
    return identifiers.some(identifier => fieldText.includes(identifier));
  }
  
  private onFieldFocus(field: FormField): void {
    if (field.isPersonalData) {
      console.log('⚠️ Personal data field focused:', field.type);
      this.showPrivacyTooltip(field.element);
    }
  }
  
  private showPrivacyTooltip(element: HTMLElement): void {
    // Create tooltip (will be enhanced in later phases)
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: absolute;
      background: #1f2937;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      z-index: 10000;
      max-width: 250px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    tooltip.textContent = '🛡️ PRISM: Consider using fake data to protect your privacy';
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;
    
    document.body.appendChild(tooltip);
    
    // Remove tooltip after 3 seconds
    setTimeout(() => {
      if (tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
      }
    }, 3000);
  }
  
  private setupMutationObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      let shouldRescan = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'FORM' || element.querySelector('input')) {
                shouldRescan = true;
              }
            }
          });
        }
      });
      
      if (shouldRescan) {
        console.log('🔄 Rescanning for forms due to DOM changes');
        this.scanForForms();
      }
    });
    
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  private analyzePageForThreats(): void {
    const threats = [];
    
    // Check for suspicious URL patterns
    if (this.hasSuspiciousURL()) {
      threats.push('suspicious_url');
    }
    
    // Check for login forms on non-HTTPS pages
    if (!window.location.protocol.includes('https') && this.hasPasswordFields()) {
      threats.push('insecure_login');
    }
    
    // Check for excessive form fields (data collection)
    if (this.forms.filter(f => f.isPersonalData).length > 5) {
      threats.push('excessive_data_collection');
    }
    
    if (threats.length > 0) {
      console.log('⚠️ Potential threats detected:', threats);
      this.reportThreats(threats);
    }
  }
  
  private hasSuspiciousURL(): boolean {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // Basic suspicious patterns
    const suspiciousPatterns = [
      /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/, // IP address
      /[a-z0-9-]+\.(tk|ml|ga|cf)$/i, // Suspicious TLDs
      /-[a-z]+\.(com|org|net)/i, // Hyphenated domains
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(hostname));
  }
  
  private hasPasswordFields(): boolean {
    return this.forms.some(field => field.type === 'password');
  }
  
  private reportPageData(): void {
    const pageData = {
      url: window.location.href,
      domain: window.location.hostname,
      forms: this.forms.length,
      personalDataFields: this.forms.filter(f => f.isPersonalData).length,
      hasHTTPS: window.location.protocol === 'https:',
      timestamp: new Date().toISOString()
    };
    
    // Send to background script
    chrome.runtime.sendMessage({
      type: 'PAGE_ANALYZED',
      data: pageData
    }).catch(error => {
      console.error('Error sending page data:', error);
    });
  }
  
  private reportThreats(threats: string[]): void {
    chrome.runtime.sendMessage({
      type: 'THREATS_DETECTED',
      data: {
        url: window.location.href,
        threats,
        timestamp: new Date().toISOString()
      }
    }).catch(error => {
      console.error('Error reporting threats:', error);
    });
  }
}

// Initialize content script
new PrismContentScript();

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  console.log('🏁 PRISM Content Script Cleanup');
});