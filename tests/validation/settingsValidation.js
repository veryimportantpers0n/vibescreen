/**
 * Settings System Validation Test
 * 
 * Validates the comprehensive settings and customization system functionality
 * without requiring Jest - runs directly with Node.js
 */

import SettingsManager from '../../utils/SettingsManager.js';

// Mock browser APIs for Node.js environment
global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {}
};

global.performance = {
  now: () => Date.now(),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10 // 10MB
  }
};

global.matchMedia = () => ({
  matches: false,
  addEventListener: () => {},
  removeEventListener: () => {}
});

global.requestAnimationFrame = (cb) => setTimeout(cb, 16);

global.document = {
  documentElement: {
    setAttribute: () => {},
    style: {
      setProperty: () => {},
      removeProperty: () => {}
    }
  }
};

global.window = {
  matchMedia: global.matchMedia,
  innerWidth: 1920,
  innerHeight: 1080
};

global.screen = {
  width: 1920,
  height: 1080,
  colorDepth: 24
};

// Mock navigator if it doesn't exist
if (typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'Node.js Test Environment',
    platform: 'test',
    language: 'en-US',
    cookieEnabled: true,
    onLine: true
  };
}

class SettingsValidationTest {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running Settings System Validation Tests...\n');

    for (const { name, testFn } of this.tests) {
      try {
        await testFn();
        console.log(`✅ ${name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${name}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Test Results: ${this.passed} passed, ${this.failed} failed`);
    
    if (this.failed > 0) {
      process.exit(1);
    }
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertNotEqual(actual, unexpected, message) {
    if (actual === unexpected) {
      throw new Error(message || `Expected not ${unexpected}, got ${actual}`);
    }
  }

  assertContains(container, item, message) {
    if (!container.includes(item)) {
      throw new Error(message || `Expected container to include ${item}`);
    }
  }
}

const test = new SettingsValidationTest();

// Test SettingsManager initialization
test.test('SettingsManager should initialize with default settings', () => {
  const settingsManager = new SettingsManager();
  const defaults = settingsManager.getDefaults();
  
  test.assert(defaults.audio, 'Should have audio settings');
  test.assert(defaults.visual, 'Should have visual settings');
  test.assert(defaults.messages, 'Should have message settings');
  test.assert(defaults.accessibility, 'Should have accessibility settings');
  test.assert(defaults.advanced, 'Should have advanced settings');
  test.assert(defaults.system, 'Should have system settings');
  
  test.assertEqual(defaults.audio.enabled, false, 'Audio should be disabled by default');
  test.assertEqual(defaults.visual.animationSpeed, 1.0, 'Animation speed should be 1.0 by default');
  test.assertEqual(defaults.messages.frequency, 30, 'Message frequency should be 30 seconds by default');
  test.assertEqual(defaults.accessibility.highContrast, false, 'High contrast should be disabled by default');
  test.assertEqual(defaults.advanced.autoSave, true, 'Auto-save should be enabled by default');
  
  settingsManager.destroy();
});

// Test setting values with dot notation
test.test('Should get and set setting values using dot notation', () => {
  const settingsManager = new SettingsManager();
  
  // Test getting default values
  test.assertEqual(settingsManager.getSetting('audio.volume'), 0.3, 'Should get default audio volume');
  test.assertEqual(settingsManager.getSetting('visual.animationSpeed'), 1.0, 'Should get default animation speed');
  
  // Test setting values
  const success1 = settingsManager.setSetting('audio.volume', 0.8);
  const success2 = settingsManager.setSetting('visual.animationSpeed', 1.5);
  
  test.assert(success1, 'Should successfully set audio volume');
  test.assert(success2, 'Should successfully set animation speed');
  
  test.assertEqual(settingsManager.getSetting('audio.volume'), 0.8, 'Should get updated audio volume');
  test.assertEqual(settingsManager.getSetting('visual.animationSpeed'), 1.5, 'Should get updated animation speed');
  
  settingsManager.destroy();
});

// Test numeric validation
test.test('Should validate numeric settings within ranges', () => {
  const settingsManager = new SettingsManager();
  
  // Test valid range
  settingsManager.setSetting('audio.volume', 0.5);
  test.assertEqual(settingsManager.getSetting('audio.volume'), 0.5, 'Should accept valid volume');
  
  // Test out of range values (should be clamped)
  settingsManager.setSetting('audio.volume', 1.5);
  test.assertEqual(settingsManager.getSetting('audio.volume'), 1.0, 'Should clamp volume to maximum');
  
  settingsManager.setSetting('audio.volume', -0.5);
  test.assertEqual(settingsManager.getSetting('audio.volume'), 0.0, 'Should clamp volume to minimum');
  
  // Test animation speed range
  settingsManager.setSetting('visual.animationSpeed', 0.05);
  test.assertEqual(settingsManager.getSetting('visual.animationSpeed'), 0.1, 'Should clamp speed to minimum');
  
  settingsManager.setSetting('visual.animationSpeed', 10.0);
  test.assertEqual(settingsManager.getSetting('visual.animationSpeed'), 5.0, 'Should clamp speed to maximum');
  
  settingsManager.destroy();
});

// Test string validation
test.test('Should validate string settings against allowed values', () => {
  const settingsManager = new SettingsManager();
  
  // Test valid values
  settingsManager.setSetting('visual.effectsIntensity', 'high');
  test.assertEqual(settingsManager.getSetting('visual.effectsIntensity'), 'high', 'Should accept valid effects intensity');
  
  settingsManager.setSetting('visual.effectsIntensity', 'low');
  test.assertEqual(settingsManager.getSetting('visual.effectsIntensity'), 'low', 'Should accept valid effects intensity');
  
  // Test invalid value (should use default)
  settingsManager.setSetting('visual.effectsIntensity', 'invalid');
  test.assertEqual(settingsManager.getSetting('visual.effectsIntensity'), 'medium', 'Should use default for invalid value');
  
  settingsManager.destroy();
});

// Test bulk updates
test.test('Should update multiple settings at once', () => {
  const settingsManager = new SettingsManager();
  
  const updates = {
    'audio.volume': 0.7,
    'visual.animationSpeed': 2.0,
    'messages.frequency': 45,
    'visual.effectsIntensity': 'high'
  };
  
  const success = settingsManager.updateSettings(updates);
  test.assert(success, 'Should successfully update multiple settings');
  
  test.assertEqual(settingsManager.getSetting('audio.volume'), 0.7, 'Should update audio volume');
  test.assertEqual(settingsManager.getSetting('visual.animationSpeed'), 2.0, 'Should update animation speed');
  test.assertEqual(settingsManager.getSetting('messages.frequency'), 45, 'Should update message frequency');
  test.assertEqual(settingsManager.getSetting('visual.effectsIntensity'), 'high', 'Should update effects intensity');
  
  settingsManager.destroy();
});

// Test accessibility settings
test.test('Should handle accessibility settings correctly', () => {
  const settingsManager = new SettingsManager();
  
  const accessibilitySettings = settingsManager.getAccessibilitySettings();
  test.assert(accessibilitySettings.hasOwnProperty('highContrast'), 'Should have highContrast setting');
  test.assert(accessibilitySettings.hasOwnProperty('reducedMotion'), 'Should have reducedMotion setting');
  test.assert(accessibilitySettings.hasOwnProperty('largerText'), 'Should have largerText setting');
  
  const updates = {
    highContrast: true,
    reducedMotion: true,
    largerText: true
  };
  
  const success = settingsManager.updateAccessibilitySettings(updates);
  test.assert(success, 'Should successfully update accessibility settings');
  
  test.assertEqual(settingsManager.getSetting('accessibility.highContrast'), true, 'Should update high contrast');
  test.assertEqual(settingsManager.getSetting('accessibility.reducedMotion'), true, 'Should update reduced motion');
  test.assertEqual(settingsManager.getSetting('accessibility.largerText'), true, 'Should update larger text');
  
  settingsManager.destroy();
});

// Test customization settings
test.test('Should handle customization settings correctly', () => {
  const settingsManager = new SettingsManager();
  
  const customizationSettings = settingsManager.getCustomizationSettings();
  test.assert(customizationSettings.hasOwnProperty('animationSpeed'), 'Should have animationSpeed setting');
  test.assert(customizationSettings.hasOwnProperty('effectsIntensity'), 'Should have effectsIntensity setting');
  test.assert(customizationSettings.hasOwnProperty('messageFrequency'), 'Should have messageFrequency setting');
  test.assert(customizationSettings.hasOwnProperty('audioVolume'), 'Should have audioVolume setting');
  test.assert(customizationSettings.hasOwnProperty('audioEnabled'), 'Should have audioEnabled setting');
  
  const updates = {
    animationSpeed: 1.5,
    effectsIntensity: 'high',
    messageFrequency: 60,
    audioVolume: 0.8,
    audioEnabled: true
  };
  
  const success = settingsManager.updateCustomizationSettings(updates);
  test.assert(success, 'Should successfully update customization settings');
  
  test.assertEqual(settingsManager.getSetting('visual.animationSpeed'), 1.5, 'Should update animation speed');
  test.assertEqual(settingsManager.getSetting('visual.effectsIntensity'), 'high', 'Should update effects intensity');
  test.assertEqual(settingsManager.getSetting('messages.frequency'), 60, 'Should update message frequency');
  test.assertEqual(settingsManager.getSetting('audio.volume'), 0.8, 'Should update audio volume');
  test.assertEqual(settingsManager.getSetting('audio.enabled'), true, 'Should update audio enabled');
  
  settingsManager.destroy();
});

// Test export/import functionality
test.test('Should export and import configuration correctly', () => {
  const settingsManager = new SettingsManager();
  
  // Set some custom settings
  settingsManager.setSetting('audio.volume', 0.8);
  settingsManager.setSetting('visual.animationSpeed', 1.5);
  settingsManager.setSetting('accessibility.highContrast', true);
  
  // Export configuration
  const exportResult = settingsManager.exportConfig();
  test.assert(exportResult.success, 'Should successfully export configuration');
  test.assert(exportResult.configString, 'Should provide config string');
  test.assertContains(exportResult.message, 'Configuration exported', 'Should have success message');
  
  // Reset to defaults
  const resetResult = settingsManager.resetToDefaults();
  test.assert(resetResult.success, 'Should successfully reset to defaults');
  test.assertEqual(settingsManager.getSetting('audio.volume'), 0.3, 'Should reset audio volume');
  test.assertEqual(settingsManager.getSetting('visual.animationSpeed'), 1.0, 'Should reset animation speed');
  test.assertEqual(settingsManager.getSetting('accessibility.highContrast'), false, 'Should reset high contrast');
  
  // Import configuration
  const importResult = settingsManager.importConfig(exportResult.configString);
  test.assert(importResult.success, 'Should successfully import configuration');
  test.assertEqual(settingsManager.getSetting('audio.volume'), 0.8, 'Should restore audio volume');
  test.assertEqual(settingsManager.getSetting('visual.animationSpeed'), 1.5, 'Should restore animation speed');
  test.assertEqual(settingsManager.getSetting('accessibility.highContrast'), true, 'Should restore high contrast');
  
  settingsManager.destroy();
});

// Test invalid import
test.test('Should handle invalid import configuration gracefully', () => {
  const settingsManager = new SettingsManager();
  
  const result = settingsManager.importConfig('invalid-config-string');
  test.assert(!result.success, 'Should fail with invalid config');
  test.assertContains(result.message, 'Import failed', 'Should have error message');
  
  settingsManager.destroy();
});

// Test performance metrics
test.test('Should provide performance metrics', () => {
  const settingsManager = new SettingsManager();
  
  const metrics = settingsManager.getPerformanceMetrics();
  test.assert(metrics.hasOwnProperty('fps'), 'Should have fps metric');
  test.assert(metrics.hasOwnProperty('frameTime'), 'Should have frameTime metric');
  test.assert(metrics.hasOwnProperty('memoryUsage'), 'Should have memoryUsage metric');
  test.assert(metrics.hasOwnProperty('lastUpdate'), 'Should have lastUpdate metric');
  
  test.assert(typeof metrics.fps === 'number', 'FPS should be a number');
  test.assert(typeof metrics.frameTime === 'number', 'Frame time should be a number');
  test.assert(typeof metrics.memoryUsage === 'number', 'Memory usage should be a number');
  test.assert(typeof metrics.lastUpdate === 'number', 'Last update should be a number');
  
  settingsManager.destroy();
});

// Test system info
test.test('Should provide system information', () => {
  const settingsManager = new SettingsManager();
  
  const systemInfo = settingsManager.getSystemInfo();
  test.assert(systemInfo.hasOwnProperty('version'), 'Should have version info');
  test.assert(systemInfo.hasOwnProperty('performance'), 'Should have performance info');
  test.assert(systemInfo.hasOwnProperty('settings'), 'Should have settings info');
  
  test.assertEqual(systemInfo.version, '1.0.0', 'Should have correct version');
  test.assert(systemInfo.settings.totalSize > 0, 'Should have settings size info');
  
  settingsManager.destroy();
});

// Test event listeners
test.test('Should notify listeners of setting changes', () => {
  const settingsManager = new SettingsManager();
  
  let notificationReceived = false;
  let notificationData = null;
  
  const listener = (event, data) => {
    notificationReceived = true;
    notificationData = { event, data };
  };
  
  settingsManager.addListener(listener);
  settingsManager.setSetting('audio.volume', 0.5);
  
  test.assert(notificationReceived, 'Should notify listener of setting change');
  test.assertEqual(notificationData.event, 'setting-changed', 'Should have correct event type');
  test.assertEqual(notificationData.data.path, 'audio.volume', 'Should have correct setting path');
  test.assertEqual(notificationData.data.value, 0.5, 'Should have correct setting value');
  
  // Test listener removal
  settingsManager.removeListener(listener);
  notificationReceived = false;
  settingsManager.setSetting('audio.volume', 0.7);
  
  test.assert(!notificationReceived, 'Should not notify removed listener');
  
  settingsManager.destroy();
});

// Test settings summary
test.test('Should provide settings summary', () => {
  const settingsManager = new SettingsManager();
  
  const summary = settingsManager.getSettingsSummary();
  test.assert(summary.hasOwnProperty('accessibility'), 'Should have accessibility summary');
  test.assert(summary.hasOwnProperty('customization'), 'Should have customization summary');
  test.assert(summary.hasOwnProperty('system'), 'Should have system summary');
  
  test.assert(summary.accessibility.hasOwnProperty('highContrast'), 'Should have high contrast in summary');
  test.assert(summary.customization.hasOwnProperty('animationSpeed'), 'Should have animation speed in summary');
  test.assert(summary.system.hasOwnProperty('autoSave'), 'Should have auto-save in summary');
  
  settingsManager.destroy();
});

// Run all tests
test.run().catch(console.error);