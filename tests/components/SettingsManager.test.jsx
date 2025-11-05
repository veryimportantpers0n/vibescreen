/**
 * SettingsManager Test Suite
 * 
 * Tests for comprehensive settings and customization system functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsManager from '../../utils/SettingsManager.js';
import { useSettingsManager, useSetting, useAccessibilitySettings, useCustomizationSettings } from '../../utils/useSettingsManager.js';

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

describe('SettingsManager', () => {
  let settingsManager;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Create fresh instance
    settingsManager = new SettingsManager();
  });

  afterEach(() => {
    if (settingsManager) {
      settingsManager.destroy();
    }
  });

  describe('Initialization', () => {
    test('should initialize with default settings', () => {
      const defaults = settingsManager.getDefaults();
      
      expect(defaults).toHaveProperty('audio');
      expect(defaults).toHaveProperty('visual');
      expect(defaults).toHaveProperty('messages');
      expect(defaults).toHaveProperty('accessibility');
      expect(defaults).toHaveProperty('advanced');
      expect(defaults).toHaveProperty('system');
      
      expect(defaults.audio.enabled).toBe(false);
      expect(defaults.visual.animationSpeed).toBe(1.0);
      expect(defaults.messages.frequency).toBe(30);
      expect(defaults.accessibility.highContrast).toBe(false);
      expect(defaults.advanced.autoSave).toBe(true);
    });

    test('should load settings from localStorage if available', () => {
      const storedSettings = {
        version: '1.0.0',
        audio: { enabled: true, volume: 0.5 },
        visual: { animationSpeed: 1.5 }
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedSettings));
      
      const manager = new SettingsManager();
      
      expect(manager.settings.audio.enabled).toBe(true);
      expect(manager.settings.audio.volume).toBe(0.5);
      expect(manager.settings.visual.animationSpeed).toBe(1.5);
    });

    test('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const manager = new SettingsManager();
      const defaults = manager.getDefaults();
      
      expect(manager.settings).toEqual(defaults);
    });
  });

  describe('Setting Management', () => {
    test('should get setting values using dot notation', () => {
      const volume = settingsManager.getSetting('audio.volume');
      const speed = settingsManager.getSetting('visual.animationSpeed');
      
      expect(volume).toBe(0.3);
      expect(speed).toBe(1.0);
    });

    test('should set setting values using dot notation', () => {
      const success = settingsManager.setSetting('audio.volume', 0.8);
      
      expect(success).toBe(true);
      expect(settingsManager.getSetting('audio.volume')).toBe(0.8);
    });

    test('should validate numeric settings within ranges', () => {
      // Valid range
      settingsManager.setSetting('audio.volume', 0.5);
      expect(settingsManager.getSetting('audio.volume')).toBe(0.5);
      
      // Out of range - should be clamped
      settingsManager.setSetting('audio.volume', 1.5);
      expect(settingsManager.getSetting('audio.volume')).toBe(1.0);
      
      settingsManager.setSetting('audio.volume', -0.5);
      expect(settingsManager.getSetting('audio.volume')).toBe(0.0);
    });

    test('should validate string settings against allowed values', () => {
      // Valid value
      settingsManager.setSetting('visual.effectsIntensity', 'high');
      expect(settingsManager.getSetting('visual.effectsIntensity')).toBe('high');
      
      // Invalid value - should use default
      settingsManager.setSetting('visual.effectsIntensity', 'invalid');
      expect(settingsManager.getSetting('visual.effectsIntensity')).toBe('medium');
    });

    test('should update multiple settings at once', () => {
      const updates = {
        'audio.volume': 0.7,
        'visual.animationSpeed': 2.0,
        'messages.frequency': 45
      };
      
      const success = settingsManager.updateSettings(updates);
      
      expect(success).toBe(true);
      expect(settingsManager.getSetting('audio.volume')).toBe(0.7);
      expect(settingsManager.getSetting('visual.animationSpeed')).toBe(2.0);
      expect(settingsManager.getSetting('messages.frequency')).toBe(45);
    });
  });

  describe('Accessibility Settings', () => {
    test('should get accessibility settings', () => {
      const accessibilitySettings = settingsManager.getAccessibilitySettings();
      
      expect(accessibilitySettings).toHaveProperty('highContrast');
      expect(accessibilitySettings).toHaveProperty('reducedMotion');
      expect(accessibilitySettings).toHaveProperty('largerText');
      expect(accessibilitySettings).toHaveProperty('screenReaderSupport');
    });

    test('should update accessibility settings', () => {
      const updates = {
        highContrast: true,
        reducedMotion: true,
        largerText: true
      };
      
      const success = settingsManager.updateAccessibilitySettings(updates);
      
      expect(success).toBe(true);
      expect(settingsManager.getSetting('accessibility.highContrast')).toBe(true);
      expect(settingsManager.getSetting('accessibility.reducedMotion')).toBe(true);
      expect(settingsManager.getSetting('accessibility.largerText')).toBe(true);
    });

    test('should apply accessibility settings to DOM', () => {
      // Mock document.documentElement
      const mockRoot = {
        setAttribute: jest.fn(),
        style: {
          setProperty: jest.fn(),
          removeProperty: jest.fn()
        }
      };
      
      global.document = {
        documentElement: mockRoot
      };
      
      settingsManager.setSetting('accessibility.highContrast', true);
      
      expect(mockRoot.setAttribute).toHaveBeenCalledWith('data-high-contrast', true);
      expect(mockRoot.style.setProperty).toHaveBeenCalledWith('--accessibility-mode', 'high-contrast');
    });
  });

  describe('Customization Settings', () => {
    test('should get customization settings', () => {
      const customizationSettings = settingsManager.getCustomizationSettings();
      
      expect(customizationSettings).toHaveProperty('animationSpeed');
      expect(customizationSettings).toHaveProperty('effectsIntensity');
      expect(customizationSettings).toHaveProperty('messageFrequency');
      expect(customizationSettings).toHaveProperty('audioVolume');
      expect(customizationSettings).toHaveProperty('audioEnabled');
    });

    test('should update customization settings', () => {
      const updates = {
        animationSpeed: 1.5,
        effectsIntensity: 'high',
        messageFrequency: 60,
        audioVolume: 0.8,
        audioEnabled: true
      };
      
      const success = settingsManager.updateCustomizationSettings(updates);
      
      expect(success).toBe(true);
      expect(settingsManager.getSetting('visual.animationSpeed')).toBe(1.5);
      expect(settingsManager.getSetting('visual.effectsIntensity')).toBe('high');
      expect(settingsManager.getSetting('messages.frequency')).toBe(60);
      expect(settingsManager.getSetting('audio.volume')).toBe(0.8);
      expect(settingsManager.getSetting('audio.enabled')).toBe(true);
    });
  });

  describe('Persistence', () => {
    test('should save settings to localStorage', () => {
      settingsManager.setSetting('audio.volume', 0.9);
      settingsManager.saveSettings();
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'vibescreen-settings',
        expect.stringContaining('"volume":0.9')
      );
    });

    test('should auto-save when auto-save is enabled', (done) => {
      settingsManager.setSetting('advanced.autoSave', true);
      settingsManager.setSetting('audio.volume', 0.6);
      
      // Auto-save has a 1 second debounce
      setTimeout(() => {
        expect(localStorageMock.setItem).toHaveBeenCalled();
        done();
      }, 1100);
    });

    test('should not auto-save when auto-save is disabled', (done) => {
      settingsManager.setSetting('advanced.autoSave', false);
      settingsManager.setSetting('audio.volume', 0.6);
      
      setTimeout(() => {
        expect(localStorageMock.setItem).not.toHaveBeenCalled();
        done();
      }, 1100);
    });
  });

  describe('Export/Import', () => {
    test('should export configuration', () => {
      settingsManager.setSetting('audio.volume', 0.7);
      settingsManager.setSetting('visual.animationSpeed', 1.5);
      
      const result = settingsManager.exportConfig();
      
      expect(result.success).toBe(true);
      expect(result.configString).toBeDefined();
      expect(result.message).toContain('Configuration exported');
    });

    test('should import configuration', () => {
      // First export a configuration
      settingsManager.setSetting('audio.volume', 0.8);
      const exportResult = settingsManager.exportConfig();
      
      // Reset to defaults
      settingsManager.resetToDefaults();
      expect(settingsManager.getSetting('audio.volume')).toBe(0.3);
      
      // Import the configuration
      const importResult = settingsManager.importConfig(exportResult.configString);
      
      expect(importResult.success).toBe(true);
      expect(settingsManager.getSetting('audio.volume')).toBe(0.8);
    });

    test('should handle invalid import configuration', () => {
      const result = settingsManager.importConfig('invalid-config');
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Import failed');
    });
  });

  describe('Reset Functionality', () => {
    test('should reset all settings to defaults', () => {
      // Change some settings
      settingsManager.setSetting('audio.volume', 0.9);
      settingsManager.setSetting('visual.animationSpeed', 2.0);
      settingsManager.setSetting('accessibility.highContrast', true);
      
      // Reset
      const result = settingsManager.resetToDefaults();
      
      expect(result.success).toBe(true);
      expect(settingsManager.getSetting('audio.volume')).toBe(0.3);
      expect(settingsManager.getSetting('visual.animationSpeed')).toBe(1.0);
      expect(settingsManager.getSetting('accessibility.highContrast')).toBe(false);
    });
  });

  describe('Performance Monitoring', () => {
    test('should provide performance metrics', () => {
      const metrics = settingsManager.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('fps');
      expect(metrics).toHaveProperty('frameTime');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('lastUpdate');
    });
  });

  describe('Event Listeners', () => {
    test('should notify listeners of setting changes', () => {
      const listener = jest.fn();
      settingsManager.addListener(listener);
      
      settingsManager.setSetting('audio.volume', 0.5);
      
      expect(listener).toHaveBeenCalledWith('setting-changed', {
        path: 'audio.volume',
        value: 0.5
      });
    });

    test('should remove listeners', () => {
      const listener = jest.fn();
      settingsManager.addListener(listener);
      settingsManager.removeListener(listener);
      
      settingsManager.setSetting('audio.volume', 0.5);
      
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

// Test React hooks
describe('Settings React Hooks', () => {
  // Test component for hooks
  const TestComponent = ({ path, defaultValue }) => {
    const [value, setValue] = useSetting(path, defaultValue);
    
    return (
      <div>
        <span data-testid="value">{String(value)}</span>
        <button 
          data-testid="set-button" 
          onClick={() => setValue(0.8)}
        >
          Set Value
        </button>
      </div>
    );
  };

  const AccessibilityTestComponent = () => {
    const { accessibilitySettings, toggleHighContrast } = useAccessibilitySettings();
    
    return (
      <div>
        <span data-testid="high-contrast">{String(accessibilitySettings?.highContrast)}</span>
        <button 
          data-testid="toggle-contrast" 
          onClick={toggleHighContrast}
        >
          Toggle
        </button>
      </div>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  test('useSetting hook should work correctly', async () => {
    render(<TestComponent path="audio.volume" defaultValue={0.5} />);
    
    expect(screen.getByTestId('value')).toHaveTextContent('0.3');
    
    fireEvent.click(screen.getByTestId('set-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('value')).toHaveTextContent('0.8');
    });
  });

  test('useAccessibilitySettings hook should work correctly', async () => {
    render(<AccessibilityTestComponent />);
    
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
    
    fireEvent.click(screen.getByTestId('toggle-contrast'));
    
    await waitFor(() => {
      expect(screen.getByTestId('high-contrast')).toHaveTextContent('true');
    });
  });
});