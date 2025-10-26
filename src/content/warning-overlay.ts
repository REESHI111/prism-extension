/**
 * PRISM Warning Overlay Component
 * Displays full-page warning for unsafe/suspicious websites
 */

export interface WarningOverlayConfig {
  type: 'phishing' | 'malware' | 'tracking' | 'unsafe';
  severity: 'low' | 'medium' | 'high' | 'critical';
  domain: string;
  reasons: string[];
  canProceed: boolean;
}

export function createWarningOverlay(config: WarningOverlayConfig): void {
  // Remove existing overlay if present
  const existing = document.getElementById('prism-warning-overlay');
  if (existing) {
    existing.remove();
  }

  const overlay = document.createElement('div');
  overlay.id = 'prism-warning-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.98) 0%, rgba(127, 29, 29, 0.98) 100%);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(10px);
    animation: prismFadeIn 0.3s ease-out;
  `;

  const getSeverityConfig = () => {
    switch (config.severity) {
      case 'critical':
        return { color: '#dc2626', icon: '🚨', label: 'CRITICAL THREAT' };
      case 'high':
        return { color: '#ea580c', icon: '⚠️', label: 'HIGH RISK' };
      case 'medium':
        return { color: '#f59e0b', icon: '⚡', label: 'MEDIUM RISK' };
      default:
        return { color: '#fbbf24', icon: '⚠', label: 'LOW RISK' };
    }
  };

  const severityConfig = getSeverityConfig();

  overlay.innerHTML = `
    <style>
      @keyframes prismFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes prismPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      @keyframes prismShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
      }
      .prism-warning-container {
        background: white;
        border-radius: 24px;
        padding: 48px;
        max-width: 600px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        text-align: center;
        animation: prismShake 0.5s ease-out;
      }
      .prism-warning-icon {
        font-size: 80px;
        margin-bottom: 24px;
        animation: prismPulse 2s ease-in-out infinite;
      }
      .prism-warning-title {
        font-size: 32px;
        font-weight: 800;
        color: #1f2937;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      .prism-warning-severity {
        display: inline-block;
        background: ${severityConfig.color};
        color: white;
        padding: 8px 20px;
        border-radius: 12px;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 24px;
        letter-spacing: 0.5px;
      }
      .prism-warning-domain {
        background: #f3f4f6;
        padding: 16px 24px;
        border-radius: 12px;
        font-family: 'Courier New', monospace;
        font-size: 18px;
        font-weight: 600;
        color: #374151;
        margin: 24px 0;
        word-break: break-all;
        border-left: 4px solid ${severityConfig.color};
      }
      .prism-warning-reasons {
        text-align: left;
        margin: 24px 0;
        background: #fef2f2;
        padding: 20px;
        border-radius: 12px;
        border: 2px solid #fecaca;
      }
      .prism-warning-reason {
        display: flex;
        align-items: start;
        gap: 12px;
        margin-bottom: 12px;
        font-size: 14px;
        color: #991b1b;
      }
      .prism-warning-reason:last-child {
        margin-bottom: 0;
      }
      .prism-warning-buttons {
        display: flex;
        gap: 16px;
        justify-content: center;
        margin-top: 32px;
      }
      .prism-btn {
        padding: 16px 32px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.2s;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .prism-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
      }
      .prism-btn-primary {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
      }
      .prism-btn-danger {
        background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
        color: white;
      }
      .prism-btn-secondary {
        background: #f3f4f6;
        color: #374151;
        border: 2px solid #d1d5db;
      }
      .prism-footer {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 2px solid #e5e7eb;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #6b7280;
        font-size: 13px;
      }
      .prism-shield {
        font-size: 20px;
      }
    </style>
    <div class="prism-warning-container">
      <div class="prism-warning-icon">${severityConfig.icon}</div>
      <h1 class="prism-warning-title">⚠️ Website Blocked</h1>
      <div class="prism-warning-severity">${severityConfig.label}</div>
      <p style="font-size: 16px; color: #6b7280; margin-bottom: 16px;">
        PRISM has detected potential security threats on this website.
      </p>
      
      <div class="prism-warning-domain">${config.domain}</div>
      
      <div class="prism-warning-reasons">
        <div style="font-weight: 700; color: #991b1b; margin-bottom: 12px; font-size: 15px;">
          🛡️ Detected Threats:
        </div>
        ${config.reasons.map(reason => `
          <div class="prism-warning-reason">
            <span style="flex-shrink: 0;">❌</span>
            <span>${reason}</span>
          </div>
        `).join('')}
      </div>
      
      <div class="prism-warning-buttons">
        <button class="prism-btn prism-btn-primary" id="prism-go-back">
          ← Go Back to Safety
        </button>
        ${config.canProceed ? `
          <button class="prism-btn prism-btn-secondary" id="prism-proceed">
            Proceed Anyway (Not Recommended)
          </button>
        ` : `
          <button class="prism-btn prism-btn-danger" disabled style="opacity: 0.5; cursor: not-allowed;">
            🔒 Access Blocked
          </button>
        `}
      </div>
      
      <div class="prism-footer">
        <span class="prism-shield">🛡️</span>
        <span>Protected by <strong>PRISM</strong> Extension</span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add event listeners
  const goBackBtn = document.getElementById('prism-go-back');
  const proceedBtn = document.getElementById('prism-proceed');

  if (goBackBtn) {
    goBackBtn.addEventListener('click', () => {
      window.history.back();
    });
  }

  if (proceedBtn && config.canProceed) {
    proceedBtn.addEventListener('click', () => {
      overlay.remove();
      // Store user decision
      chrome.runtime.sendMessage({
        type: 'USER_PROCEEDED',
        domain: config.domain
      });
    });
  }
}

// Function to check if warning should be shown
export function shouldShowWarning(url: string): WarningOverlayConfig | null {
  // This will be enhanced in Phase 5 with actual phishing detection
  // For now, demo mode for testing
  
  const domain = new URL(url).hostname;
  
  // Demo: Show warning for specific test domains
  const dangerousDomains = [
    'phishing-test.com',
    'malware-test.com',
    'dangerous-site.com'
  ];
  
  if (dangerousDomains.some(d => domain.includes(d))) {
    return {
      type: 'phishing',
      severity: 'high',
      domain: domain,
      reasons: [
        'Domain mimics a legitimate website',
        'SSL certificate is invalid or suspicious',
        'Known phishing patterns detected',
        'Site reported by community as unsafe'
      ],
      canProceed: true
    };
  }
  
  return null;
}
