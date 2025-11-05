/**
 * Settings Integration Test
 * 
 * Tests the integration between SettingsManager, CommandParser, and CommandExecutor
 * for comprehensive settings and customization functionality
 */

import SettingsManager from '../../utils/SettingsManager.js';
import { CommandParser } from '../../components/CommandParser.jsx';
import { CommandExecutor } from '../../components/CommandExecutor.jsx';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 1024 * 1024 * 10, // 10MB
  },
};

// Mock matchMedia
global.matchMedia = jest.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));

// Mock document
global.document = {
  documentElement: {
    setAttribute: jest.fn(),
    style: {
      setProperty: jest.fn(),
      removeProperty: jest.fn()
    }
  }
};

describe('Settings Integration Tests', () => {
  let settingsManager;
  let commandParser;
  let commandExecutor;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    settingsManager = new SettingsManager();
    commandParser = new CommandParser();
    commandExecutor = new CommandExecutor({
      settingsManager,
      onCharacterSwitch: jest.fn(),
      onMessageControl: jest.fn(),
      getCurrentState: jest.fn(() => ({ currentCharacter: 'Corporate AI' })),
      onError: jest.fn()
    });
  });

  afterEach(() => {
    if (settingsManager) {
      settingsManager.destroy();
    }
    if (commandExecutor) {
      commandExecutor.destroy();
    }
  });

  describe('Animation Speed Commands', () => {
    test('should handle !speed command correctly', async () => {
      const parseResult = commandParser.parseAndExecute('!speed 1.5');
      expect(parseResult.success).toBe(true);
      expect(parseResult.action).toBe('set-speed');
      
      const execResult = await commandExecutor.execute(parseResult);
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('Animation speed set to 1.5x');
      expect(settingsManager.getSetting('visual.animationSpeed')).toBe(1.5);
    });

    test('should reject invalid speed values', async () => {
      const parseResult = commandParser.parseAndExecute('!speed 10');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(false);
      expect(execResult.message).toContain('Invalid speed value');
    });

    test('should apply speed changes to DOM', async () => {
      const parseResult = commandParser.parseAndExecute('!speed 2.0');
      await commandExecutor.execute(parseResult);
      
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--animation-speed-multiplier', 
        2.0
      );
    });
  });

  describe('Message Frequency Commands', () => {
    test('should handle !frequency command correctly', async () => {
      const parseResult = commandParser.parseAndExecute('!frequency 60');
      expect(parseResult.success).toBe(true);
      
      const execResult = await commandExecutor.execute(parseResult);
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('Message frequency set to 60 seconds');
      expect(settingsManager.getSetting('messages.frequency')).toBe(60);
    });

    test('should reject invalid frequency values', async () => {
      const parseResult = commandParser.parseAndExecute('!frequency 500');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(false);
      expect(execResult.message).toContain('Invalid frequency value');
    });
  });

  describe('Effects Intensity Commands', () => {
    test('should handle !effects command correctly', async () => {
      const parseResult = commandParser.parseAndExecute('!effects high');
      expect(parseResult.success).toBe(true);
      
      const execResult = await commandExecutor.execute(parseResult);
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('Effects intensity set to high');
      expect(settingsManager.getSetting('visual.effectsIntensity')).toBe('high');
    });

    test('should reject invalid effects values', async () => {
      const parseResult = commandParser.parseAndExecute('!effects invalid');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(false);
      expect(execResult.message).toContain('Invalid effects intensity');
    });

    test('should apply effects changes to DOM', async () => {
      const parseResult = commandParser.parseAndExecute('!effects low');
      await commandExecutor.execute(parseResult);
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-effects-intensity', 
        'low'
      );
    });
  });

  describe('Volume Commands', () => {
    test('should handle !volume with numeric value', async () => {
      const parseResult = commandParser.parseAndExecute('!volume 0.7');
      expect(parseResult.success).toBe(true);
      
      const execResult = await commandExecutor.execute(parseResult);
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('Volume set to 70%');
      expect(settingsManager.getSetting('audio.volume')).toBe(0.7);
    });

    test('should handle !volume mute', async () => {
      const parseResult = commandParser.parseAndExecute('!volume mute');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('Audio muted');
      expect(settingsManager.getSetting('audio.muted')).toBe(true);
    });

    test('should handle !volume unmute', async () => {
      const parseResult = commandParser.parseAndExecute('!volume unmute');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('Audio unmuted');
      expect(settingsManager.getSetting('audio.muted')).toBe(false);
    });

    test('should reject invalid volume values', async () => {
      const parseResult = commandParser.parseAndExecute('!volume 2.0');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(false);
      expect(execResult.message).toContain('Invalid volume level');
    });
  });

  describe('Export/Import Commands', () => {
    test('should handle !export command', async () => {
      // Set some custom settings first
      settingsManager.setSetting('audio.volume', 0.8);
      settingsManager.setSetting('visual.animationSpeed', 1.5);
      
      const parseResult = commandParser.parseAndExecute('!export');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('Configuration exported');
      expect(execResult.data.configString).toBeDefined();
    });

    test('should handle !import command', async () => {
      // First export a configuration
      settingsManager.setSetting('audio.volume', 0.9);
      const exportResult = settingsManager.exportConfig();
      
      // Reset settings
      settingsManager.resetToDefaults();
      expect(settingsManager.getSetting('audio.volume')).toBe(0.3);
      
      // Import via command
      const parseResult = commandParser.parseAndExecute(`!import ${exportResult.configString}`);
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('Configuration imported successfully');
      expect(settingsManager.getSetting('audio.volume')).toBe(0.9);
    });

    test('should handle invalid !import command', async () => {
      const parseResult = commandParser.parseAndExecute('!import invalid-config');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(false);
      expect(execResult.message).toContain('Import failed');
    });
  });

  describe('Reset Commands', () => {
    test('should handle !reset command', async () => {
      // Change some settings
      settingsManager.setSetting('audio.volume', 0.8);
      settingsManager.setSetting('visual.animationSpeed', 2.0);
      
      const parseResult = commandParser.parseAndExecute('!reset');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('All settings reset to defaults');
      expect(settingsManager.getSetting('audio.volume')).toBe(0.3);
      expect(settingsManager.getSetting('visual.animationSpeed')).toBe(1.0);
    });
  });

  describe('System Status Integration', () => {
    test('should include settings in !config output', async () => {
      settingsManager.setSetting('audio.volume', 0.6);
      settingsManager.setSetting('visual.effectsIntensity', 'high');
      
      const parseResult = commandParser.parseAndExecute('!config');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('60%'); // Volume
      expect(execResult.message).toContain('high'); // Effects
    });

    test('should include performance metrics in !debug output', async () => {
      const parseResult = commandParser.parseAndExecute('!debug');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(true);
      expect(execResult.message).toContain('Performance:');
      expect(execResult.message).toContain('FPS');
      expect(execResult.message).toContain('MB');
    });
  });

  describe('Auto-save Integration', () => {
    test('should auto-save settings when enabled', (done) => {
      settingsManager.setSetting('advanced.autoSave', true);
      
      const parseResult = commandParser.parseAndExecute('!speed 1.8');
      commandExecutor.execute(parseResult);
      
      // Auto-save has a 1 second debounce
      setTimeout(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'vibescreen-settings',
          expect.stringContaining('"animationSpeed":1.8')
        );
        done();
      }, 1100);
    });

    test('should not auto-save when disabled', (done) => {
      settingsManager.setSetting('advanced.autoSave', false);
      
      const parseResult = commandParser.parseAndExecute('!speed 1.8');
      commandExecutor.execute(parseResult);
      
      setTimeout(() => {
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
        done();
      }, 1100);
    });
  });

  describe('Accessibility Integration', () => {
    test('should apply accessibility settings to DOM immediately', async () => {
      // Simulate accessibility setting change
      settingsManager.setSetting('accessibility.highContrast', true);
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-high-contrast', 
        true
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--accessibility-mode', 
        'high-contrast'
      );
    });

    test('should handle reduced motion settings', async () => {
      settingsManager.setSetting('accessibility.reducedMotion', true);
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'data-reduced-motion', 
        true
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--animation-duration', 
        '0.01ms'
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle settings manager errors gracefully', async () => {
      // Mock a settings manager error
      const originalSetSetting = settingsManager.setSetting;
      settingsManager.setSetting = jest.fn(() => false);
      
      const parseResult = commandParser.parseAndExecute('!speed 1.5');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(false);
      expect(execResult.message).toContain('Failed to update');
      
      // Restore original method
      settingsManager.setSetting = originalSetSetting;
    });

    test('should handle command parsing errors', async () => {
      const parseResult = commandParser.parseAndExecute('!speed invalid');
      const execResult = await commandExecutor.execute(parseResult);
      
      expect(execResult.success).toBe(false);
      expect(execResult.message).toContain('Invalid speed value');
    });
  });

  describe('Performance Impact', () => {
    test('should not significantly impact performance with multiple setting changes', async () => {
      const startTime = Date.now();
      
      // Perform multiple setting changes
      for (let i = 0; i < 100; i++) {
        const speed = 1.0 + (i * 0.01);
        settingsManager.setSetting('visual.animationSpeed', speed);
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });

    test('should debounce auto-save correctly', (done) => {
      settingsManager.setSetting('advanced.autoSave', true);
      
      // Rapid setting changes
      settingsManager.setSetting('audio.volume', 0.1);
      settingsManager.setSetting('audio.volume', 0.2);
      settingsManager.setSetting('audio.volume', 0.3);
      settingsManager.setSetting('audio.volume', 0.4);
      settingsManager.setSetting('audio.volume', 0.5);
      
      // Should only save once after debounce period
      setTimeout(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
        done();
      }, 1100);
    });
  });
});