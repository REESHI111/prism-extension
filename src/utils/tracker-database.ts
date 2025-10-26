/**
 * Tracker Database
 * Common tracking domains and patterns
 */

export const TRACKER_DOMAINS = [
  // Analytics & Tracking
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

export function isTrackerDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check exact domain matches
    if (TRACKER_DOMAINS.some(domain => hostname.includes(domain))) {
      return true;
    }
    
    // Check pattern matches
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
