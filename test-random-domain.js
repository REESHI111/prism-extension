// Test random domain detection in ML model

// Simulate the isRandomDomain function
function isRandomDomain(url) {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : 'http://' + url);
    const domain = urlObj.hostname;
    const domainParts = domain.split('.');
    const mainDomain = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : domain;
    
    // Check for 7+ consecutive consonants (random gibberish)
    if (/[bcdfghjklmnpqrstvwxyz]{7,}/i.test(mainDomain)) {
      console.log(`✓ ${url} - Random (7+ consonants): ${mainDomain}`);
      return true;
    }
    
    // Check for very low vowel ratio (< 20%) in domains longer than 7 chars
    if (mainDomain.length >= 7) {
      const vowels = (mainDomain.match(/[aeiou]/gi) || []).length;
      const vowelRatio = vowels / mainDomain.length;
      if (vowelRatio < 0.2) {
        console.log(`✓ ${url} - Random (low vowels ${(vowelRatio*100).toFixed(1)}%): ${mainDomain}`);
        return true;
      }
    }
    
    console.log(`✗ ${url} - NOT random: ${mainDomain}`);
    return false;
  } catch (e) {
    console.log(`✗ ${url} - Invalid URL`);
    return false;
  }
}

// Test cases
console.log('\n=== Testing Random Domain Detection ===\n');

console.log('Random domains (should return 50% risk):');
isRandomDomain('https://dcsdvsdvsdwvv.com');
isRandomDomain('http://qwrtypsdfg.com');
isRandomDomain('https://kjhgfdswqerty.net');
isRandomDomain('http://asdfghjkl.tk');
isRandomDomain('https://zxcvbnmqw.xyz');

console.log('\nLegitimate domains (should use normal ML):');
isRandomDomain('https://google.com');
isRandomDomain('https://facebook.com');
isRandomDomain('https://amazon.com');
isRandomDomain('https://microsoft.com');

console.log('\nTyposquatting (should use normal ML):');
isRandomDomain('http://faceb00k.com');
isRandomDomain('http://g00gle.com');
isRandomDomain('http://paypa1.com');

console.log('\n=== Test Complete ===\n');
