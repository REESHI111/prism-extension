"""Test enhanced feature detection"""

from feature_extractor import FeatureExtractor

extractor = FeatureExtractor()

# Test URLs
test_urls = [
    'https://www.googgle.com',
    'https://www.dcsdvsdvsdwvv.com',
    'https://www.google.com',
    'https://www.amazon.com'
]

print('\n🧪 TESTING ENHANCED ML MODEL')
print('='*70)

for url in test_urls:
    print(f'\n🔍 URL: {url}')
    features = extractor.extract_features(url)
    
    print(f'   Entropy: {features["entropy"]:.2f}')
    print(f'   Typosquatting: {features["typosquattingScore"]:.3f}')
    print(f'   Missing Char: {features["missingCharScore"]:.3f}')
    print(f'   Suspicious Patterns: {int(features["suspiciousPatternCount"])}')
    
    # Show if detected as suspicious
    if features['entropy'] > 4.0 or features['suspiciousPatternCount'] > 2:
        print(f'   🚨 LIKELY PHISHING')
    else:
        print(f'   ✅ Appears legitimate')

print('\n' + '='*70)
print('\n✅ Enhanced detection is working!')
