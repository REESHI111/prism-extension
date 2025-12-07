/**
 * Tracker Database
 * Common tracking domains and patterns
 */

// Whitelisted domains - NEVER block these legitimate services
export const WHITELISTED_DOMAINS = [
  'google.com',
  'youtube.com',
  'googleapis.com',
  'gstatic.com',
  'googleusercontent.com',
  'microsoft.com',
  'live.com',
  'office.com',
  'apple.com',
  'icloud.com',
  'amazon.com',
  'cloudfront.net',
  'github.com',
  'githubusercontent.com'
];

export const TRACKER_DOMAINS = [
  // Analytics & Tracking (but NOT core services)
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'googlesyndication.com',
  'facebook.com/tr',
  'facebook.net',
  'connect.facebook.net',
  'analytics.twitter.com',
  'static.ads-twitter.com',
  'pixel.reddit.com',
  'linkedin.com/px',
  'snap.licdn.com',
  'analytics.tiktok.com',
  'bat.bing.com',
  'clarity.ms',
  
  // Ad Networks
  'adnxs.com',
  'adsrvr.org',
  'advertising.com',
  'admob.com',
  'adcolony.com',
  'pubmatic.com',
  'rubiconproject.com',
  'contextweb.com',
  'openx.net',
  'criteo.com',
  'outbrain.com',
  'taboola.com',
  'amazon-adsystem.com',
  
  // Data Brokers
  'scorecardresearch.com',
  'quantserve.com',
  'blueconic.net',
  'segment.com',
  'segment.io',
  'mparticle.com',
  'mixpanel.com',
  'amplitude.com',
  'heap.io',
  
  // Social Media Widgets
  'platform.twitter.com',
  'staticxx.facebook.com',
  'instagram.com/embed',
  'youtube.com/subscribe_embed',
  'linkedin.com/embed',
  
  // Heatmaps & Session Recording
  'hotjar.com',
  'mouseflow.com',
  'crazyegg.com',
  'fullstory.com',
  'logrocket.com',
  'smartlook.com',
  
  // CDNs (tracking variants)
  'cdn.segment.com',
  'cdn.mxpnl.com',
  'cdn.heapanalytics.com'
];

export const TRACKER_PATTERNS = [
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /doubleclick\.net/i,
  /facebook\.com\/tr/i,
  /connect\.facebook/i,
  /analytics\./i,
  /tracking\./i,
  /tracker\./i,
  /pixel\./i,
  /stats\./i,
  /collect\./i,
  /beacon\./i,
  /rum\./i,
  /telemetry\./i
];

/**
 * Extract main domain from hostname (e.g., www.google.com -> google.com)
 */
function getMainDomain(hostname: string): string {
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts.slice(-2).join('.');
  }
  return hostname;
}

export function isTrackerDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const mainDomain = getMainDomain(hostname);
    
    // CRITICAL: Check if it's a whitelisted domain - NEVER block these
    // Check both full hostname and main domain
    for (const whitelist of WHITELISTED_DOMAINS) {
      if (hostname === whitelist || 
          hostname.endsWith('.' + whitelist) || 
          mainDomain === whitelist) {
        // console.log(`✅ Whitelisted (allowed): ${url}`);
        return false; // Explicitly allow
      }
    }
    
    // Check exact domain matches for trackers
    if (TRACKER_DOMAINS.some(domain => hostname.includes(domain))) {
      return true;
    }
    
    // Check pattern matches for trackers
    if (TRACKER_PATTERNS.some(pattern => pattern.test(hostname))) {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

export function getTrackerCategory(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('google') || hostname.includes('analytics')) {
    return 'Analytics';
  }
  if (hostname.includes('facebook') || hostname.includes('twitter') || hostname.includes('linkedin')) {
    return 'Social Media';
  }
  if (hostname.includes('ad')) {
    return 'Advertising';
  }
  if (hostname.includes('hotjar') || hostname.includes('mouseflow') || hostname.includes('crazyegg')) {
    return 'Heatmap';
  }
  
  return 'Tracking';
}
