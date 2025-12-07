"""
Training Data for ML Phishing Detector
Minimum 300 URLs (150 phishing + 150 legitimate) across 18 categories
Per ML_SPECIFICATION.md requirements
"""

# PHISHING URLs (150+) - Label: 1

# 1. Typosquatting (20+) - Common brand misspellings
TYPOSQUATTING_PHISHING = [
    "http://g00gle.com",
    "http://gooogle.com",
    "http://g00gle-verify.tk",
    "http://g00gle-login.com",
    "http://faceb00k.com",
    "http://facebok.com",
    "http://faceb00k-security.com",
    "http://amaz0n.com",
    "http://amazoon.com",
    "http://amazon-verify.com",
    "http://paypa1.com",
    "http://paypal-secure.com",
    "http://paypa1-login.com",
    "http://app1e.com",
    "http://apple-verify.com",
    "http://app1e-support.com",
    "http://micros0ft.com",
    "http://microsof t.com",
    "http://micro-soft.com",
    "http://netfIix.com",
    "http://netfliix.com",
    "http://netflix-billing.com",
]

# 2. Suspicious TLDs (25+) - Known phishing TLDs
SUSPICIOUS_TLD_PHISHING = [
    "http://secure-login.tk",
    "http://bank-verify.ml",
    "http://account-update.ga",
    "http://verify-account.cf",
    "http://security-alert.gq",
    "http://urgent-action.tk",
    "http://banking-secure.ml",
    "http://verify-identity.ga",
    "http://account-suspended.cf",
    "http://confirm-details.gq",
    "http://paypal.com.tk",
    "http://amazon.security.ml",
    "http://facebook.verify.ga",
    "http://apple.support.cf",
    "http://microsoft.account.gq",
    "http://netflix.billing.tk",
    "http://bank.security.ml",
    "http://secure-payment.ga",
    "http://verify-card.cf",
    "http://update-billing.gq",
    "http://account-review.tk",
    "http://security-check.ml",
    "http://confirm-identity.ga",
    "http://urgent-verify.cf",
    "http://action-required.gq",
    "http://login-verify.xyz",
    "http://secure-auth.xyz",
]

# 3. IP Address URLs (20+) - Direct IP access
IP_ADDRESS_PHISHING = [
    "http://192.168.1.1/login",
    "http://192.168.1.1/admin",
    "http://192.168.1.1/admin/login.php",
    "http://10.0.0.1/secure/login",
    "http://172.16.0.1/bank",
    "http://203.0.113.1/verify",
    "http://198.51.100.1/account",
    "http://192.0.2.1/login.php",
    "http://192.168.0.1/admin/panel",
    "http://10.10.10.10/banking",
    "http://172.31.255.255/secure",
    "http://192.168.100.1/verify.php",
    "http://10.0.1.1/account/login",
    "http://172.16.254.1/admin",
    "http://192.168.2.1/secure/verify",
    "http://10.1.1.1/banking/login",
    "http://172.20.0.1/admin/login.php",
    "http://192.168.50.1/verify/account",
    "http://10.5.5.5/secure/banking",
    "http://172.25.0.1/account/verify.php",
    "http://198.18.0.1/login/secure",
]

# 4. Subdomain Tricks (25+) - Legitimate-looking subdomains
SUBDOMAIN_PHISHING = [
    "http://paypal.secure-login.com",
    "http://amazon.account-verify.com",
    "http://facebook.security-check.com",
    "http://google.verify-account.com",
    "http://apple.secure-signin.com",
    "http://microsoft.account-update.com",
    "http://netflix.billing-update.com",
    "http://banking.secure-access.com",
    "http://paypal.confirm-identity.com",
    "http://amazon.verify-payment.com",
    "http://facebook.account-security.com",
    "http://google.signin-verify.com",
    "http://apple.id-verify.com",
    "http://microsoft.security-alert.com",
    "http://netflix.account-suspended.com",
    "http://chase.secure-banking.com",
    "http://wellsfargo.verify-account.com",
    "http://bankofamerica.security-check.com",
    "http://citibank.account-update.com",
    "http://hsbc.secure-login.com",
    "http://paypal.verify-now.com",
    "http://amazon.urgent-action.com",
    "http://facebook.confirm-identity.com",
    "http://google.security-alert.com",
    "http://apple.account-locked.com",
    "http://microsoft.verify-signin.com",
]

# 5. Suspicious Keywords (30+) - Phishing-related keywords
KEYWORD_PHISHING = [
    "http://secure-verify-account.com",
    "http://urgent-action-required.com",
    "http://confirm-your-identity.com",
    "http://account-suspended-verify.com",
    "http://security-alert-action.com",
    "http://verify-payment-now.com",
    "http://update-billing-info.com",
    "http://confirm-card-details.com",
    "http://account-locked-verify.com",
    "http://security-check-required.com",
    "http://verify-identity-now.com",
    "http://urgent-security-alert.com",
    "http://suspended-account-restore.com",
    "http://confirm-login-details.com",
    "http://verify-banking-info.com",
    "http://update-security-settings.com",
    "http://account-review-required.com",
    "http://confirm-payment-method.com",
    "http://verify-card-information.com",
    "http://security-update-required.com",
    "http://account-verification-needed.com",
    "http://urgent-billing-update.com",
    "http://confirm-account-details.com",
    "http://verify-shipping-address.com",
    "http://security-alert-verify.com",
    "http://account-suspended-action.com",
    "http://urgent-verify-payment.com",
    "http://confirm-security-info.com",
    "http://verify-login-activity.com",
    "http://account-locked-confirm.com",
    "http://security-check-verify.com",
]

# 6. Gibberish Domains (15+) - Random character strings
GIBBERISH_PHISHING = [
    "http://xkj4h8s9d.com",
    "http://9s7d2k4l.com",
    "http://h3j8k2n5.com",
    "http://4m9x2p7q.com",
    "http://z8v5n3k1.com",
    "http://q2w8r5t9.com",
    "http://p7l3m6n2.com",
    "http://k4j9h7f3.com",
    "http://s8d6g2h5.com",
    "http://t5y9u3i7.com",
    "http://r6e2w8q4.com",
    "http://a9s5d3f7.com",
    "http://g3h6j2k8.com",
    "http://x7c2v5b9.com",
    "http://m4n8b3v6.com",
    "http://l2k7j5h9.com",
]

# 7. Long URLs (10+) - Excessively long URLs
LONG_URL_PHISHING = [
    "http://secure-banking-verification-system-account-update-required-action-needed.com",
    "http://paypal-secure-login-verify-account-identity-confirmation-required-urgent.com",
    "http://amazon-prime-membership-renewal-payment-update-billing-information-verify.com",
    "http://facebook-security-alert-account-suspicious-activity-verification-needed.com",
    "http://google-account-security-check-verify-login-activity-confirmation-required.com",
    "http://apple-id-verification-system-account-security-update-action-needed.com",
    "http://microsoft-account-security-alert-verify-recent-login-activity-confirm.com",
    "http://netflix-billing-update-payment-method-verification-required-urgent-action.com",
    "http://banking-security-system-account-verification-identity-confirmation-needed.com",
    "http://credit-card-verification-system-payment-security-update-required-action.com",
    "http://online-banking-security-alert-account-access-verification-urgent-confirm.com",
]

# 8. HTTP No SSL (10+) - No HTTPS for sensitive services
HTTP_NO_SSL_PHISHING = [
    "http://paypal-login.com",
    "http://secure-banking.com",
    "http://amazon-signin.com",
    "http://facebook-login.com",
    "http://bank-account.com",
    "http://credit-card-verify.com",
    "http://online-banking.com",
    "http://secure-payment.com",
    "http://account-login.com",
    "http://verify-identity.com",
    "http://banking-secure.com",
]

# Combine all phishing URLs
PHISHING_URLS = (
    TYPOSQUATTING_PHISHING +
    SUSPICIOUS_TLD_PHISHING +
    IP_ADDRESS_PHISHING +
    SUBDOMAIN_PHISHING +
    KEYWORD_PHISHING +
    GIBBERISH_PHISHING +
    LONG_URL_PHISHING +
    HTTP_NO_SSL_PHISHING
)

# LEGITIMATE URLs (150+) - Label: 0

# 1. Major Tech Companies (25+)
MAJOR_TECH_LEGITIMATE = [
    "https://google.com",
    "https://www.google.com/search",
    "https://mail.google.com",
    "https://drive.google.com",
    "https://docs.google.com",
    "https://facebook.com",
    "https://www.facebook.com",
    "https://m.facebook.com",
    "https://apple.com",
    "https://www.apple.com",
    "https://support.apple.com",
    "https://icloud.com",
    "https://microsoft.com",
    "https://www.microsoft.com",
    "https://office.com",
    "https://outlook.com",
    "https://azure.microsoft.com",
    "https://amazon.com",
    "https://www.amazon.com",
    "https://smile.amazon.com",
    "https://netflix.com",
    "https://www.netflix.com",
    "https://twitter.com",
    "https://instagram.com",
    "https://linkedin.com",
    "https://youtube.com",
]

# 2. E-commerce (25+)
ECOMMERCE_LEGITIMATE = [
    "https://amazon.com/products",
    "https://www.amazon.com/gp/cart",
    "https://ebay.com",
    "https://www.ebay.com",
    "https://etsy.com",
    "https://www.etsy.com",
    "https://walmart.com",
    "https://www.walmart.com",
    "https://target.com",
    "https://www.target.com",
    "https://bestbuy.com",
    "https://www.bestbuy.com",
    "https://aliexpress.com",
    "https://www.aliexpress.com",
    "https://shopify.com",
    "https://www.shopify.com",
    "https://wayfair.com",
    "https://www.wayfair.com",
    "https://overstock.com",
    "https://www.overstock.com",
    "https://newegg.com",
    "https://www.newegg.com",
    "https://costco.com",
    "https://www.costco.com",
    "https://samsclub.com",
]

# 3. Financial Services (20+)
FINANCIAL_LEGITIMATE = [
    "https://paypal.com",
    "https://www.paypal.com/signin",
    "https://paypal.com/myaccount",
    "https://chase.com",
    "https://www.chase.com",
    "https://secure.chase.com",
    "https://wellsfargo.com",
    "https://www.wellsfargo.com",
    "https://bankofamerica.com",
    "https://www.bankofamerica.com",
    "https://citibank.com",
    "https://www.citibank.com",
    "https://capitalone.com",
    "https://www.capitalone.com",
    "https://usbank.com",
    "https://www.usbank.com",
    "https://schwab.com",
    "https://www.schwab.com",
    "https://fidelity.com",
    "https://www.fidelity.com",
    "https://vanguard.com",
]

# 4. Developer Platforms (15+)
DEVELOPER_LEGITIMATE = [
    "https://github.com",
    "https://github.com/repositories",
    "https://github.com/settings",
    "https://gitlab.com",
    "https://www.gitlab.com",
    "https://bitbucket.org",
    "https://stackoverflow.com",
    "https://www.stackoverflow.com",
    "https://stackexchange.com",
    "https://npmjs.com",
    "https://www.npmjs.com",
    "https://pypi.org",
    "https://www.pypi.org",
    "https://packagist.org",
    "https://rubygems.org",
    "https://nuget.org",
]

# 5. Cloud Services (15+)
CLOUD_LEGITIMATE = [
    "https://aws.amazon.com",
    "https://console.aws.amazon.com",
    "https://azure.microsoft.com",
    "https://portal.azure.com",
    "https://cloud.google.com",
    "https://console.cloud.google.com",
    "https://digitalocean.com",
    "https://www.digitalocean.com",
    "https://heroku.com",
    "https://www.heroku.com",
    "https://vercel.com",
    "https://www.vercel.com",
    "https://netlify.com",
    "https://www.netlify.com",
    "https://cloudflare.com",
    "https://www.cloudflare.com",
]

# 6. Social Media (15+)
SOCIAL_MEDIA_LEGITIMATE = [
    "https://twitter.com",
    "https://www.twitter.com",
    "https://x.com",
    "https://instagram.com",
    "https://www.instagram.com",
    "https://linkedin.com",
    "https://www.linkedin.com",
    "https://reddit.com",
    "https://www.reddit.com",
    "https://pinterest.com",
    "https://www.pinterest.com",
    "https://tumblr.com",
    "https://www.tumblr.com",
    "https://snapchat.com",
    "https://www.snapchat.com",
    "https://tiktok.com",
]

# 7. Education (10+)
EDUCATION_LEGITIMATE = [
    "https://coursera.org",
    "https://www.coursera.org",
    "https://udemy.com",
    "https://www.udemy.com",
    "https://edx.org",
    "https://www.edx.org",
    "https://khanacademy.org",
    "https://www.khanacademy.org",
    "https://mit.edu",
    "https://www.mit.edu",
    "https://stanford.edu",
]

# 8. News & Media (10+)
NEWS_LEGITIMATE = [
    "https://cnn.com",
    "https://www.cnn.com",
    "https://bbc.com",
    "https://www.bbc.com",
    "https://nytimes.com",
    "https://www.nytimes.com",
    "https://reuters.com",
    "https://www.reuters.com",
    "https://theguardian.com",
    "https://www.theguardian.com",
    "https://washingtonpost.com",
]

# 9. Streaming Services (10+)
STREAMING_LEGITIMATE = [
    "https://netflix.com",
    "https://www.netflix.com/browse",
    "https://youtube.com",
    "https://www.youtube.com",
    "https://twitch.tv",
    "https://www.twitch.tv",
    "https://spotify.com",
    "https://www.spotify.com",
    "https://hulu.com",
    "https://www.hulu.com",
    "https://disneyplus.com",
]

# 10. Email Services (5+)
EMAIL_LEGITIMATE = [
    "https://gmail.com",
    "https://mail.google.com",
    "https://outlook.com",
    "https://outlook.live.com",
    "https://yahoo.com",
    "https://mail.yahoo.com",
]

# Combine all legitimate URLs
LEGITIMATE_URLS = (
    MAJOR_TECH_LEGITIMATE +
    ECOMMERCE_LEGITIMATE +
    FINANCIAL_LEGITIMATE +
    DEVELOPER_LEGITIMATE +
    CLOUD_LEGITIMATE +
    SOCIAL_MEDIA_LEGITIMATE +
    EDUCATION_LEGITIMATE +
    NEWS_LEGITIMATE +
    STREAMING_LEGITIMATE +
    EMAIL_LEGITIMATE
)

# Create labeled dataset
def get_training_data():
    """
    Returns training data as (url, label) pairs
    Label: 0 = legitimate, 1 = phishing
    """
    data = []
    
    # Add phishing URLs (label = 1)
    for url in PHISHING_URLS:
        data.append((url, 1))
    
    # Add legitimate URLs (label = 0)
    for url in LEGITIMATE_URLS:
        data.append((url, 0))
    
    return data

# Dataset statistics
def get_dataset_stats():
    """Returns statistics about the training dataset"""
    return {
        "total_urls": len(PHISHING_URLS) + len(LEGITIMATE_URLS),
        "phishing_urls": len(PHISHING_URLS),
        "legitimate_urls": len(LEGITIMATE_URLS),
        "categories": {
            "phishing": {
                "typosquatting": len(TYPOSQUATTING_PHISHING),
                "suspicious_tlds": len(SUSPICIOUS_TLD_PHISHING),
                "ip_addresses": len(IP_ADDRESS_PHISHING),
                "subdomain_tricks": len(SUBDOMAIN_PHISHING),
                "suspicious_keywords": len(KEYWORD_PHISHING),
                "gibberish": len(GIBBERISH_PHISHING),
                "long_urls": len(LONG_URL_PHISHING),
                "http_no_ssl": len(HTTP_NO_SSL_PHISHING),
            },
            "legitimate": {
                "major_tech": len(MAJOR_TECH_LEGITIMATE),
                "ecommerce": len(ECOMMERCE_LEGITIMATE),
                "financial": len(FINANCIAL_LEGITIMATE),
                "developer": len(DEVELOPER_LEGITIMATE),
                "cloud": len(CLOUD_LEGITIMATE),
                "social_media": len(SOCIAL_MEDIA_LEGITIMATE),
                "education": len(EDUCATION_LEGITIMATE),
                "news": len(NEWS_LEGITIMATE),
                "streaming": len(STREAMING_LEGITIMATE),
                "email": len(EMAIL_LEGITIMATE),
            }
        }
    }

if __name__ == "__main__":
    # Print dataset statistics
    stats = get_dataset_stats()
    print("=" * 60)
    print("TRAINING DATASET STATISTICS")
    print("=" * 60)
    print(f"\nTotal URLs: {stats['total_urls']}")
    print(f"Phishing URLs: {stats['phishing_urls']}")
    print(f"Legitimate URLs: {stats['legitimate_urls']}")
    print(f"\nPhishing Categories:")
    for category, count in stats['categories']['phishing'].items():
        print(f"  - {category}: {count}")
    print(f"\nLegitimate Categories:")
    for category, count in stats['categories']['legitimate'].items():
        print(f"  - {category}: {count}")
    print("=" * 60)
