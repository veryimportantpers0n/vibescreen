/**
 * Advanced Commands Test Suite
 * Tests the extended terminal command functionality
 */

import { CommandParser } from '../../components/CommandParser.jsx';

describe('Advanced Commands', () => {
  let parser;
  let mockContext;

  beforeEach(() => {
    parser = new CommandParser();
    mockContext = {
      currentCharacter: 'Corporate AI',
      messageStatus: 'Active',
      onSettingChanged: jest.fn(),
      onAudioSettingChanged: jest.fn(),
      onSettingsImported: jest.fn(),
      onSettingsReset: jest.fn()
    };
  });

  describe('Speed Command', () => {
    test('should set valid animation speed', () => {
      const result = parser.parseAndExecute('!speed 1.5', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Animation speed set to 1.5x');
      expect(result.action).toBe('setting-changed');
      expect(mockContext.onSettingChanged).toHaveBeenCalledWith('visual.animationSpeed', 1.5);
    });

    test('should reject invalid speed values', () => {
      const result = parser.parseAndExecute('!speed 10', mockContext);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid speed value');
      expect(result.suggestion).toContain('between 0.1 and 5.0');
    });

    test('should reject non-numeric speed values', () => {
      const result = parser.parseAndExecute('!speed fast', mockContext);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid speed value');
    });
  });

  describe('Frequency Command', () => {
    test('should set valid message frequency', () => {
      const result = parser.parseAndExecute('!frequency 30', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Message frequency set to 30 seconds');
      expect(result.action).toBe('setting-changed');
      expect(mockContext.onSettingChanged).toHaveBeenCalledWith('messages.frequency', 30);
    });

    test('should reject frequency values outside valid range', () => {
      const result = parser.parseAndExecute('!frequency 500', mockContext);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid frequency value');
      expect(result.suggestion).toContain('between 5 and 300');
    });
  });

  describe('Effects Command', () => {
    test('should set valid effects level', () => {
      const result = parser.parseAndExecute('!effects high', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Effects set to high');
      expect(result.action).toBe('setting-changed');
      expect(mockContext.onSettingChanged).toHaveBeenCalledWith('visual.effectsIntensity', 'high');
    });

    test('should handle all valid effects levels', () => {
      const levels = ['high', 'medium', 'low', 'off'];
      
      levels.forEach(level => {
        const result = parser.parseAndExecute(`!effects ${level}`, mockContext);
        expect(result.success).toBe(true);
        expect(result.message).toContain(`Effects set to ${level}`);
      });
    });

    test('should reject invalid effects level', () => {
      const result = parser.parseAndExecute('!effects maximum', mockContext);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid effects level');
      expect(result.suggestion).toContain('high, medium, low, off');
    });
  });

  describe('Volume Commands', () => {
    test('should set valid volume level', () => {
      const result = parser.parseAndExecute('!volume 0.7', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Audio volume set to 70%');
      expect(result.action).toBe('audio-setting-changed');
      expect(mockContext.onAudioSettingChanged).toHaveBeenCalledWith('volume', 0.7);
    });

    test('should handle mute command', () => {
      const result = parser.parseAndExecute('!volume mute', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Audio muted');
      expect(mockContext.onAudioSettingChanged).toHaveBeenCalledWith('muted', true);
    });

    test('should handle unmute command', () => {
      const result = parser.parseAndExecute('!volume unmute', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Audio unmuted');
      expect(mockContext.onAudioSettingChanged).toHaveBeenCalledWith('muted', false);
    });

    test('should handle dedicated mute/unmute commands', () => {
      let result = parser.parseAndExecute('!mute', mockContext);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Audio muted');

      result = parser.parseAndExecute('!unmute', mockContext);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Audio unmuted');
    });

    test('should reject invalid volume values', () => {
      const result = parser.parseAndExecute('!volume 1.5', mockContext);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid volume value');
      expect(result.suggestion).toContain('between 0.0 and 1.0');
    });
  });

  describe('Performance Command', () => {
    test('should display performance metrics', () => {
      const result = parser.parseAndExecute('!performance', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Performance Metrics');
      expect(result.message).toContain('FPS:');
      expect(result.message).toContain('Memory Usage:');
      expect(result.action).toBe('show-performance');
    });
  });

  describe('Export/Import Commands', () => {
    test('should export configuration', () => {
      const result = parser.parseAndExecute('!export', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Configuration exported');
      expect(result.message).toContain('!import');
      expect(result.action).toBe('export-config');
      expect(result.data.configString).toBeDefined();
    });

    test('should import valid configuration', () => {
      // First export to get a valid config string
      const exportResult = parser.parseAndExecute('!export', mockContext);
      const configString = exportResult.data.configString;
      
      // Then import it
      const importResult = parser.parseAndExecute(`!import ${configString}`, mockContext);
      
      expect(importResult.success).toBe(true);
      expect(importResult.message).toContain('Configuration imported successfully');
      expect(importResult.action).toBe('import-config');
      expect(mockContext.onSettingsImported).toHaveBeenCalled();
    });

    test('should reject invalid configuration string', () => {
      const result = parser.parseAndExecute('!import invalid-config', mockContext);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Import failed');
    });
  });

  describe('Reset Command', () => {
    test('should reset settings to defaults', () => {
      const result = parser.parseAndExecute('!reset', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('All settings reset to defaults');
      expect(result.action).toBe('reset-settings');
      expect(mockContext.onSettingsReset).toHaveBeenCalled();
    });
  });

  describe('Enhanced Config Command', () => {
    test('should display comprehensive configuration', () => {
      const result = parser.parseAndExecute('!config', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Current Configuration');
      expect(result.message).toContain('Visual Settings');
      expect(result.message).toContain('Audio Settings');
      expect(result.message).toContain('Accessibility');
      expect(result.message).toContain('Advanced');
      expect(result.action).toBe('show-config');
    });
  });

  describe('Enhanced Debug Command', () => {
    test('should display enhanced debug information', () => {
      const result = parser.parseAndExecute('!debug', mockContext);
      
      expect(result.success).toBe(true);
      expect(result.message).toContain('Debug Information');
      expect(result.message).toContain('CommandParser v2.0');
      expect(result.message).toContain('System Info');
      expect(result.message).toContain('Performance:');
      expect(result.action).toBe('show-debug');
    });
  });

  describe('Command Validation', () => {
    test('should validate advanced command parameters', () => {
      // Test missing parameters
      let result = parser.parseAndExecute('!speed', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('requires 1 speed multiplier');

      result = parser.parseAndExecute('!frequency', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('requires 1 frequency in seconds');

      result = parser.parseAndExecute('!effects', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('requires 1 effects level');
    });

    test('should provide helpful suggestions for advanced commands', () => {
      const result = parser.parseAndExecute('!spd', mockContext);
      
      expect(result.success).toBe(false);
      expect(result.suggestion).toBeDefined();
    });
  });

  describe('Settings Manager Integration', () => {
    test('should persist settings changes', () => {
      // Set a value
      parser.parseAndExecute('!speed 2.0', mockContext);
      
      // Verify it's stored in settings manager
      const speed = parser.settingsManager.getSetting('visual.animationSpeed');
      expect(speed).toBe(2.0);
    });

    test('should maintain settings across parser instances', () => {
      // Set a value with first parser
      parser.parseAndExecute('!frequency 45', mockContext);
      
      // Create new parser and check if setting persists
      const newParser = new CommandParser();
      const frequency = newParser.settingsManager.getSetting('messages.frequency');
      expect(frequency).toBe(45);
    });
  });
});