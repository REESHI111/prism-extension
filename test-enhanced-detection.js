/**
 * Test Enhanced ML Detection
 * Run this in browser console to verify the enhanced detectors are working
 */

console.log('=== ENHANCED ML DETECTION TEST ===\n');

// Test URLs
const testCases = [
  // Legitimate sites (should score HIGH - 80-100)
  { url: 'https://udemy.com', expected: 'HIGH', reason: 'Trusted domain' },
  { url: 'https://google.com', expected: 'HIGH', reason: 'Trusted domain' },
  { url: 'https://amazon.com', expected: 'HIGH', reason: 'Trusted domain' },
  { url: 'https://github.com', expected: 'HIGH', reason: 'Trusted domain' },
  { url: 'https://stackoverflow.com', expected: 'HIGH', reason: 'Trusted domain' },
  
  // Phishing: Repeated characters (googgle pattern)
  { url: 'https://googgle.com', expected: 'LOW', reason: 'Repeated "g" (3x)' },
  { url: 'https://paypaal.com', expected: 'LOW', reason: 'Repeated "a" (2x)' },
  { url: 'https://amazoon.com', expected: 'LOW', reason: 'Repeated "o" (2x)' },
  { url: 'https://faaacebook.com', expected: 'LOW', reason: 'Repeated "a" (3x)' },
  
  // Phishing: Random strings (dcsdvsdvsdwvv pattern)
  { url: 'https://dcsdvsdvsdwvv.com', expected: 'LOW', reason: 'Consonant clusters + random' },
  { url: 'https://kjhgfdsa.com', expected: 'LOW', reason: 'Keyboard mash' },
  { url: 'https://xyzqwrst.com', expected: 'LOW', reason: 'Random consonants' },
  { url: 'https://cvbnmlkj.com', expected: 'LOW', reason: 'Consonant cluster' },
  
  // Phishing: Typosquatting
  { url: 'https://g00gle.com', expected: 'LOW', reason: 'Digit substitution (0->o)' },
  { url: 'https://amaz0n.com', expected: 'LOW', reason: 'Digit substitution (0->o)' },
  { url: 'https://faceb00k.com', expected: 'LOW', reason: 'Digit substitution (0->o)' },
  { url: 'https://paypa1.com', expected: 'LOW', reason: 'Digit substitution (1->l)' },
  
  // Phishing: Missing character typos
  { url: 'https://gogle.com', expected: 'LOW', reason: 'Missing "o"' },
  { url: 'https://fcebook.com', expected: 'LOW', reason: 'Missing "a"' },
  { url: 'https://youube.com', expected: 'LOW', reason: 'Missing "t"' },
];

// Simulate detection (you'll need to check actual scores in extension)
console.log('TEST CASES:');
console.log('Expected HIGH (80-100): Legitimate trusted domains');
console.log('Expected LOW (<30): Phishing patterns detected');
console.log('\nDetection Methods:');
console.log('✓ Repeated Characters Detection (googgle)');
console.log('✓ Consonant Cluster Detection (dcsdvsdvsdwvv)');
console.log('✓ Vowel Ratio Anomaly Detection');
console.log('✓ Randomness Score (character frequency)');
console.log('✓ Enhanced Entropy (amplified by all 4 detectors)');
console.log('\n' + '='.repeat(60));

testCases.forEach((test, i) => {
  console.log(`\n${i + 1}. ${test.url}`);
  console.log(`   Expected: ${test.expected} score`);
  console.log(`   Reason: ${test.reason}`);
});

console.log('\n' + '='.repeat(60));
console.log('\nHOW TO TEST:');
console.log('1. Load extension in chrome://extensions');
console.log('2. Click "Reload" on PRISM extension');
console.log('3. Visit each URL above');
console.log('4. Check browser console for ML detection results');
console.log('5. Verify scores match expectations');
console.log('\nLOOK FOR: "🔍 ML Phishing Detection Result"');
console.log('='.repeat(60));
