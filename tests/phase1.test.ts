/**
 * Phase 1 Tests
 * Testing basic extension functionality
 */

describe('Phase 1: Extension Foundation', () => {
  describe('Manifest', () => {
    test('manifest.json should be valid', () => {
      const manifest = require('../public/manifest.json');
      expect(manifest.manifest_version).toBe(3);
      expect(manifest.name).toContain('PRISM');
      expect(manifest.version).toBe('1.0.0');
    });

    test('manifest should have required permissions', () => {
      const manifest = require('../public/manifest.json');
      expect(manifest.permissions).toContain('storage');
      expect(manifest.permissions).toContain('tabs');
    });

    test('manifest should define service worker', () => {
      const manifest = require('../public/manifest.json');
      expect(manifest.background.service_worker).toBe('background/service-worker.js');
    });
  });

  describe('Constants', () => {
    test('should export version constant', () => {
      const { EXTENSION_VERSION } = require('../src/utils/constants.ts');
      expect(EXTENSION_VERSION).toBe('1.0.0');
    });

    test('should export current phase', () => {
      const { CURRENT_PHASE } = require('../src/utils/constants.ts');
      expect(CURRENT_PHASE).toBe(1);
    });
  });
});
