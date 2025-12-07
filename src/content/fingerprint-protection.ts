/**
 * Fingerprint Protection Script
 * Injected into page context to override fingerprinting APIs
 */

// Canvas fingerprinting protection
(function() {
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  
  const addNoise = (data: ImageData): ImageData => {
    if (!data || !data.data) return data;
    for (let i = 0; i < data.data.length; i += 4) {
      data.data[i] += Math.floor(Math.random() * 3) - 1;
      data.data[i + 1] += Math.floor(Math.random() * 3) - 1;
      data.data[i + 2] += Math.floor(Math.random() * 3) - 1;
    }
    return data;
  };

  HTMLCanvasElement.prototype.toDataURL = function(...args: any[]) {
    console.log('🛡️ PRISM: Blocked canvas fingerprinting');
    window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'canvas' }, '*');
    
    const context = this.getContext('2d');
    if (context) {
      const imageData = context.getImageData(0, 0, this.width, this.height);
      addNoise(imageData);
      context.putImageData(imageData, 0, 0);
    }
    return originalToDataURL.apply(this, args);
  };

  CanvasRenderingContext2D.prototype.getImageData = function(...args: any[]) {
    window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'canvas' }, '*');
    const imageData = originalGetImageData.apply(this, args);
    return addNoise(imageData);
  };
})();

// WebGL fingerprinting protection
(function() {
  const getParameter = WebGLRenderingContext.prototype.getParameter;
  
  WebGLRenderingContext.prototype.getParameter = function(param: number) {
    if (param === 37445 || param === 37446) {
      console.log('🛡️ PRISM: Blocked WebGL fingerprinting');
      window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'webgl' }, '*');
      if (param === 37445) return 'Intel Inc.';
      if (param === 37446) return 'Intel Iris OpenGL Engine';
    }
    return getParameter.call(this, param);
  };
})();

// Audio fingerprinting protection
(function() {
  const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const originalCreateOscillator = AudioContext.prototype.createOscillator;
  
  AudioContext.prototype.createOscillator = function() {
    console.log('🛡️ PRISM: Detected audio fingerprinting');
    window.postMessage({ type: 'PRISM_FINGERPRINT_DETECTED', method: 'audio' }, '*');
    return originalCreateOscillator.call(this);
  };
})();
