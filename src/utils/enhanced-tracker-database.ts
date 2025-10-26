/**
 * Enhanced Tracker Database
 * Phase 3.3: Expanded to 200+ tracker domains
 */

export const TRACKER_CATEGORIES = {
  ANALYTICS: 'analytics',
  ADVERTISING: 'advertising',
  SOCIAL: 'social',
  TRACKING: 'tracking',
  MARKETING: 'marketing',
  COOKIES: 'cookies',
  FINGERPRINTING: 'fingerprinting'
} as const;

export type TrackerCategory = typeof TRACKER_CATEGORIES[keyof typeof TRACKER_CATEGORIES];

// Expanded tracker database - 200+ domains
export const TRACKER_DOMAINS: string[] = [
  // Analytics (50+)
  'google-analytics.com',
  'googletagmanager.com',
  'ga.js',
  'analytics.js',
  'mixpanel.com',
  'segment.com',
  'segment.io',
  'hotjar.com',
  'fullstory.com',
  'logrocket.com',
  'amplitude.com',
  'heap.io',
  'heapanalytics.com',
  'kissmetrics.com',
  'chartbeat.com',
  'crazyegg.com',
  'mouseflow.com',
  'inspectlet.com',
  'lucky-orange.com',
  'clicky.com',
  'statcounter.com',
  'histats.com',
  'woopra.com',
  'piwik.org',
  'matomo.org',
  'newrelic.com',
  'nr-data.net',
  'appdynamics.com',
  'sentry.io',
  'bugsnag.com',
  'rollbar.com',
  'keen.io',
  'moengage.com',
  'clevertap.com',
  'adobe.com/analytics',
  'omniture.com',
  'sitecatalyst.com',
  'quantserve.com',
  'quantcast.com',
  'comscore.com',
  'scorecardresearch.com',
  'nielsen.com',
  'alexa.com',
  'similarweb.com',
  'yandex.ru/metrika',
  'metrics.com',
  'snowplow.io',
  'snowplowanalytics.com',
  'parsely.com',
  'parse.ly',
  
  // Advertising (80+)
  'doubleclick.net',
  'googlesyndication.com',
  'googleadservices.com',
  'google-analytics.com/collect',
  'adnxs.com',
  'appnexus.com',
  'pubmatic.com',
  'rubiconproject.com',
  'openx.net',
  'casalemedia.com',
  'indexww.com',
  'contextweb.com',
  'advertising.com',
  'adtech.de',
  'adform.net',
  'criteo.com',
  'criteo.net',
  'outbrain.com',
  'taboola.com',
  'revcontent.com',
  'mgid.com',
  'zergnet.com',
  'adsrvr.org',
  'adroll.com',
  'adrollpixel.com',
  'rlcdn.com',
  'bizographics.com',
  'bluekai.com',
  'exelator.com',
  'eyeota.net',
  'krxd.net',
  'adsymptotic.com',
  'adgear.com',
  'adgebra.co',
  'amazon-adsystem.com',
  'media.net',
  'contextweb.com',
  'serving-sys.com',
  'sizmek.com',
  'flashtalking.com',
  'innovid.com',
  'tubemogul.com',
  'turn.com',
  'advertising.yahoo.com',
  'adserver.yahoo.com',
  'yieldmo.com',
  'teads.tv',
  'sovrn.com',
  'lijit.com',
  'sharethrough.com',
  'adsafeprotected.com',
  'doubleverify.com',
  'moatads.com',
  'moatpixel.com',
  'integralads.com',
  'adskeeper.com',
  'advertising.com',
  'amgdgt.com',
  'bidswitch.net',
  'mathtag.com',
  'adition.com',
  'smartadserver.com',
  'indexexchange.com',
  'improvedigital.com',
  'yieldlab.net',
  'stroeer.de',
  'adscale.de',
  'nuggad.net',
  'audienceproject.com',
  'adsrvr.org',
  'bidtellect.com',
  'emxdgt.com',
  'gwallet.com',
  'rhythmone.com',
  'springserve.com',
  'spotxchange.com',
  'tremorhub.com',
  'undertone.com',
  'vidazoo.com',
  'vi.ai',
  'vertamedia.com',
  '33across.com',
  'adkernel.com',
  'adriver.ru',
  
  // Social Media Trackers (30+)
  'facebook.com/tr',
  'connect.facebook.net',
  'facebook.net',
  'fbcdn.net',
  'fb.me',
  'linkedin.com/px',
  'snap.licdn.com',
  'ads.linkedin.com',
  'twitter.com/i/adsct',
  'analytics.twitter.com',
  't.co',
  'ads-twitter.com',
  'pinterest.com/ct',
  'ct.pinterest.com',
  'analytics.pinterest.com',
  'reddit.com/api/v1',
  'redditmedia.com',
  'instagram.com/logging',
  'tiktok.com/i18n/pixel',
  'analytics.tiktok.com',
  'snapchat.com/tr',
  'sc-static.net',
  'tumblr.com/analytics',
  'quora.com/qevents',
  'vk.com/rtrg',
  'mc.yandex.ru',
  'addtoany.com',
  'sharethis.com',
  'addthis.com',
  'po.st',
  
  // Marketing Automation (20+)
  'hubspot.com',
  'hs-analytics.net',
  'hs-scripts.com',
  'marketo.net',
  'mktoresp.com',
  'pardot.com',
  'eloqua.com',
  'salesforce.com/sfdc',
  'mailchimp.com',
  'list-manage.com',
  'constantcontact.com',
  'aweber.com',
  'getresponse.com',
  'activecampaign.com',
  'drip.com',
  'convertkit.com',
  'sendinblue.com',
  'klaviyo.com',
  'customeriomail.com',
  'intercom.io',
  'intercom.com',
  
  // Cookie Consent & Privacy (10+)
  'cookiebot.com',
  'onetrust.com',
  'trustarc.com',
  'cookiepro.com',
  'quantcast.com/choice',
  'didomi.io',
  'consentmanager.net',
  'iubenda.com',
  'termly.io',
  'cookieyes.com',
  
  // Heat Mapping & Session Recording (10+)
  'hotjar.com',
  'mouseflow.com',
  'crazyegg.com',
  'sessioncam.com',
  'clicktale.net',
  'luckyorange.com',
  'smartlook.com',
  'inspectlet.com',
  'fullstory.com',
  'logrocket.com'
];

// Enhanced pattern matching
export const TRACKER_PATTERNS: RegExp[] = [
  /analytics\./i,
  /tracking\./i,
  /tracker\./i,
  /pixel\./i,
  /tag\./i,
  /beacon\./i,
  /collect\./i,
  /metrics\./i,
  /stats\./i,
  /telemetry\./i,
  /insight\./i,
  /events\./i,
  /conversion\./i,
  /impression\./i,
  /click\./i,
  /adserver\./i,
  /adsystem\./i,
  /doubleclick/i,
  /googleads/i,
  /googlesyndication/i,
  /\/ads\//i,
  /\/tracking\//i,
  /\/analytics\//i,
  /\/pixel\//i,
  /\/tag\//i,
  /\/collect\//i,
  /\/beacon\//i
];

/**
 * Check if URL is a tracker domain
 */
export function isTrackerDomain(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    const fullUrl = url.toLowerCase();
    
    // Check exact domain matches
    for (const tracker of TRACKER_DOMAINS) {
      if (hostname.includes(tracker.toLowerCase())) {
        return true;
      }
    }
    
    // Check pattern matches
    for (const pattern of TRACKER_PATTERNS) {
      if (pattern.test(hostname) || pattern.test(pathname) || pattern.test(fullUrl)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Get tracker category
 */
export function getTrackerCategory(url: string): TrackerCategory {
  try {
    const urlLower = url.toLowerCase();
    
    // Analytics
    if (urlLower.includes('analytics') || 
        urlLower.includes('mixpanel') || 
        urlLower.includes('segment') ||
        urlLower.includes('amplitude') ||
        urlLower.includes('heap')) {
      return TRACKER_CATEGORIES.ANALYTICS;
    }
    
    // Social
    if (urlLower.includes('facebook') || 
        urlLower.includes('twitter') || 
        urlLower.includes('linkedin') ||
        urlLower.includes('pinterest') ||
        urlLower.includes('instagram')) {
      return TRACKER_CATEGORIES.SOCIAL;
    }
    
    // Advertising
    if (urlLower.includes('doubleclick') || 
        urlLower.includes('adsystem') || 
        urlLower.includes('adnxs') ||
        urlLower.includes('advertising') ||
        urlLower.includes('/ads/') ||
        urlLower.includes('pubmatic') ||
        urlLower.includes('criteo')) {
      return TRACKER_CATEGORIES.ADVERTISING;
    }
    
    // Marketing
    if (urlLower.includes('hubspot') ||
        urlLower.includes('marketo') ||
        urlLower.includes('mailchimp') ||
        urlLower.includes('pardot')) {
      return TRACKER_CATEGORIES.MARKETING;
    }
    
    // Fingerprinting
    if (urlLower.includes('fingerprint') ||
        urlLower.includes('canvas') ||
        urlLower.includes('webgl')) {
      return TRACKER_CATEGORIES.FINGERPRINTING;
    }
    
    // Default
    return TRACKER_CATEGORIES.TRACKING;
  } catch (error) {
    return TRACKER_CATEGORIES.TRACKING;
  }
}

/**
 * Get tracker statistics
 */
export function getTrackerStats() {
  return {
    totalDomains: TRACKER_DOMAINS.length,
    totalPatterns: TRACKER_PATTERNS.length,
    categories: {
      analytics: TRACKER_DOMAINS.filter(d => 
        d.includes('analytics') || d.includes('metrics') || d.includes('stats')
      ).length,
      advertising: TRACKER_DOMAINS.filter(d => 
        d.includes('ad') || d.includes('doubleclick')
      ).length,
      social: TRACKER_DOMAINS.filter(d => 
        d.includes('facebook') || d.includes('twitter') || d.includes('linkedin')
      ).length,
      marketing: TRACKER_DOMAINS.filter(d => 
        d.includes('hubspot') || d.includes('marketo') || d.includes('mailchimp')
      ).length
    }
  };
}
