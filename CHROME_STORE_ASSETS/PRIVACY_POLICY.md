# Privacy Policy for PRISM Extension

**Last Updated**: December 8, 2025  
**Version**: 1.1.1

## Overview

PRISM ("Privacy & Security Extension") is committed to protecting your privacy. This privacy policy explains our data practices for the PRISM browser extension.

## TL;DR - Quick Summary

**We collect ZERO personal data. All analysis happens locally on your device. Nothing is sent to external servers.**

---

## 1. Information Collection

### What We DO NOT Collect

PRISM **does not collect, store, or transmit** any of the following:

- ❌ Browsing history
- ❌ Personal information (name, email, address, etc.)
- ❌ Passwords or credentials
- ❌ Financial information
- ❌ Location data
- ❌ IP addresses
- ❌ Device identifiers
- ❌ Analytics or usage statistics
- ❌ URLs visited
- ❌ Form data
- ❌ Cookies from websites you visit

### What We DO Store (Locally Only)

PRISM stores the following **only on your local device** using Chrome's `chrome.storage.local` API:

- ✅ User preferences (settings you configure)
- ✅ Extension version and phase information
- ✅ Tracker database (pre-packaged list of 4,500+ known trackers)
- ✅ Feature health status (for diagnostics)

**Important**: This local storage is:
- Never transmitted to external servers
- Only accessible by the PRISM extension
- Deleted when you uninstall the extension
- Not shared with any third parties

---

## 2. How PRISM Works

### Client-Side Processing

All PRISM features operate **entirely within your browser**:

1. **ML Phishing Detection**
   - TensorFlow.js model runs locally
   - Analyzes URLs using 55 features
   - No data sent to external ML services
   - Results computed on your device

2. **Privacy Scoring**
   - Analyzes current webpage locally
   - Counts cookies, trackers, security features
   - All calculations happen in your browser
   - No external API calls

3. **Tracker Detection**
   - Uses local database of 4,500+ trackers
   - Matches against current page resources
   - No tracking data sent anywhere

4. **Fingerprint Blocking**
   - Blocks canvas, WebGL, audio fingerprinting
   - Protection happens locally
   - No data transmission

### Network Activity

PRISM **does not make any external network requests** except:
- ❌ No analytics servers
- ❌ No telemetry collection
- ❌ No ad networks
- ❌ No third-party APIs

The extension is **completely offline** in terms of data transmission.

---

## 3. Permissions Explained

PRISM requests the following Chrome permissions. Here's exactly why:

| Permission | Why We Need It | What We Do |
|------------|----------------|------------|
| `tabs` | Access current tab URL | Analyze the URL for phishing patterns |
| `storage` | Save user settings | Store preferences locally (never sent anywhere) |
| `webRequest` | Monitor HTTP requests | Detect trackers loading on pages |
| `webNavigation` | Detect page loads | Trigger security analysis when you navigate |
| `activeTab` | Access active tab content | Read page elements for privacy scoring |
| `scripting` | Inject content scripts | Block fingerprinting attempts |

**All permissions are used exclusively for local analysis. No data leaves your browser.**

---

## 4. Third-Party Services

PRISM **does not use any third-party services**, including:

- ❌ No Google Analytics
- ❌ No error tracking (Sentry, Rollbar, etc.)
- ❌ No advertising networks
- ❌ No CDNs for code delivery
- ❌ No external APIs
- ❌ No cloud storage

The extension is **100% self-contained**.

---

## 5. Data Sharing

**PRISM does not share any data** because we don't collect any data to share.

- ❌ No data sold to third parties
- ❌ No data shared with partners
- ❌ No data provided to advertisers
- ❌ No data sent to developers
- ❌ No government data requests (because we have no data)

---

## 6. Children's Privacy

PRISM does not knowingly collect information from anyone, including children under 13. Since we collect zero data, PRISM is safe for users of all ages.

---

## 7. Data Security

While PRISM doesn't collect data, we still implement security best practices:

- ✅ All code runs locally
- ✅ No external connections
- ✅ Minimal permissions requested
- ✅ Open development process (code review possible)
- ✅ Regular security updates

---

## 8. Your Rights

Since PRISM doesn't collect personal data, traditional data rights (access, deletion, portability) don't apply. However:

- **Local Data Control**: You can clear extension data anytime via Chrome settings
- **Uninstall**: Removes all local storage immediately
- **Settings Reset**: Available within the extension

---

## 9. Updates to This Policy

We may update this privacy policy to:
- Reflect changes in the extension
- Comply with legal requirements
- Improve clarity

**How you'll know**: 
- Updated "Last Updated" date at the top
- Version number change
- Notification in extension updates (if significant changes)

---

## 10. Open Source & Transparency

PRISM is developed with transparency in mind:

- ✅ Code available for review
- ✅ No obfuscation or hidden functionality
- ✅ Clear documentation of all features
- ✅ Community feedback encouraged

---

## 11. Contact Information

If you have questions about this privacy policy or PRISM's data practices:

**Developer Contact**: [Your Email Address]  
**Extension Support**: Available through Chrome Web Store listing  
**Issues/Feedback**: [Your GitHub Repository URL if applicable]

---

## 12. Legal Compliance

PRISM complies with:

- ✅ GDPR (European Union)
- ✅ CCPA (California)
- ✅ Chrome Web Store Policies
- ✅ General privacy best practices

**Since we collect zero personal data, most privacy regulations don't apply, but we adhere to their principles regardless.**

---

## 13. Consent

By installing PRISM, you agree to:

- This privacy policy
- Local storage of preferences on your device
- PRISM analyzing websites you visit (locally only)

**You can withdraw consent anytime by uninstalling the extension.**

---

## Summary

**PRISM's Privacy Guarantee:**

1. ✅ **Zero data collection** - We don't collect anything
2. ✅ **Local processing** - All analysis happens on your device
3. ✅ **No tracking** - We don't track your browsing
4. ✅ **No servers** - No external data transmission
5. ✅ **Transparent** - Open about what we do and don't do

**Your privacy is our priority. We built PRISM to protect you, not surveil you.**

---

**Questions?** Contact us at [Your Contact Email]

**Effective Date**: December 8, 2025  
**Version**: 1.1.1 - Phase 7

---

*This privacy policy is written in plain English to ensure transparency and understanding. If you have questions or need clarification on any point, please contact us.*
