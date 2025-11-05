/**
 * React Hook for SettingsManager
 * 
 * Provides easy access to settings management functionality in React components
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import SettingsManager from './SettingsManager.js';

// Global settings manager instance
let globalSettingsManager = null;

/**
 * Get or create the global settings manager instance
 * @returns {SettingsManager} Settings manager instance
 */
function getSettingsManager() {
  if (!globalSettingsManager) {
    globalSettingsManager = new SettingsManager();
    globalSettingsManager.initialize();
  }
  return globalSettingsManager;
}

/**
 * React hook for settings management
 * @param {Object} options - Hook options
 * @returns {Object} Settings management interface
 */
export function useSettingsManager(options = {}) {
  const {
    autoSync = true,
    watchPaths = [],
    debounceMs = 100
  } = options;

  const settingsManager = useRef(null);
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const debounceTimeout = useRef(null);

  // Initialize settings manager
  useEffect(() => {
    try {
      settingsManager.current = getSettingsManager();
      setSettings(settingsManager.current.settings);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  // Set up change listeners
  useEffect(() => {
    if (!settingsManager.current || !autoSync) return;

    const handleSettingsChange = (event, data) => {
      // Debounce updates to prevent excessive re-renders
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(() => {
        if (event === 'setting-changed' || event === 'settings-bulk-updated') {
          // Check if we should update based on watchPaths
          if (watchPaths.length === 0 || 
              (data.path && watchPaths.some(path => data.path.startsWith(path)))) {
            setSettings({ ...settingsManager.current.settings });
          }
        } else if (event === 'settings-imported' || event === 'settings-reset') {
          setSettings({ ...settingsManager.current.settings });
        }
      }, debounceMs);
    };

    settingsManager.current.addListener(handleSettingsChange);

    return () => {
      if (settingsManager.current) {
        settingsManager.current.removeListener(handleSettingsChange);
      }
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [autoSync, watchPaths, debounceMs]);

  // Get setting value
  const getSetting = useCallback((path) => {
    return settingsManager.current?.getSetting(path);
  }, []);

  // Set setting value
  const setSetting = useCallback((path, value) => {
    if (!settingsManager.current) return false;
    return settingsManager.current.setSetting(path, value);
  }, []);

  // Update multiple settings
  const updateSettings = useCallback((updates) => {
    if (!settingsManager.current) return false;
    return settingsManager.current.updateSettings(updates);
  }, []);

  // Get accessibility settings
  const getAccessibilitySettings = useCallback(() => {
    return settingsManager.current?.getAccessibilitySettings();
  }, []);

  // Update accessibility settings
  const updateAccessibilitySettings = useCallback((updates) => {
    if (!settingsManager.current) return false;
    return settingsManager.current.updateAccessibilitySettings(updates);
  }, []);

  // Get customization settings
  const getCustomizationSettings = useCallback(() => {
    return settingsManager.current?.getCustomizationSettings();
  }, []);

  // Update customization settings
  const updateCustomizationSettings = useCallback((updates) => {
    if (!settingsManager.current) return false;
    return settingsManager.current.updateCustomizationSettings(updates);
  }, []);

  // Export configuration
  const exportConfig = useCallback(() => {
    return settingsManager.current?.exportConfig();
  }, []);

  // Import configuration
  const importConfig = useCallback((configString) => {
    return settingsManager.current?.importConfig(configString);
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    return settingsManager.current?.resetToDefaults();
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    return settingsManager.current?.getPerformanceMetrics();
  }, []);

  // Get system info
  const getSystemInfo = useCallback(() => {
    return settingsManager.current?.getSystemInfo();
  }, []);

  // Get settings summary
  const getSettingsSummary = useCallback(() => {
    return settingsManager.current?.getSettingsSummary();
  }, []);

  // Save settings manually
  const saveSettings = useCallback(() => {
    return settingsManager.current?.saveSettings();
  }, []);

  return {
    // State
    settings,
    isLoading,
    error,
    
    // Basic operations
    getSetting,
    setSetting,
    updateSettings,
    saveSettings,
    
    // Specialized operations
    getAccessibilitySettings,
    updateAccessibilitySettings,
    getCustomizationSettings,
    updateCustomizationSettings,
    
    // Import/Export
    exportConfig,
    importConfig,
    resetToDefaults,
    
    // System information
    getPerformanceMetrics,
    getSystemInfo,
    getSettingsSummary,
    
    // Direct access to manager (use sparingly)
    settingsManager: settingsManager.current
  };
}

/**
 * Hook for specific setting path with automatic updates
 * @param {string} path - Setting path to watch
 * @param {*} defaultValue - Default value if setting doesn't exist
 * @returns {Array} [value, setValue] tuple
 */
export function useSetting(path, defaultValue = undefined) {
  const { getSetting, setSetting } = useSettingsManager({
    watchPaths: [path],
    debounceMs: 50
  });

  const [value, setValue] = useState(() => {
    const currentValue = getSetting(path);
    return currentValue !== undefined ? currentValue : defaultValue;
  });

  // Update local state when setting changes
  useEffect(() => {
    const currentValue = getSetting(path);
    if (currentValue !== undefined) {
      setValue(currentValue);
    }
  }, [getSetting, path]);

  // Setter function
  const setSettingValue = useCallback((newValue) => {
    const success = setSetting(path, newValue);
    if (success) {
      setValue(newValue);
    }
    return success;
  }, [setSetting, path]);

  return [value, setSettingValue];
}

/**
 * Hook for accessibility settings with automatic browser preference detection
 * @returns {Object} Accessibility settings and controls
 */
export function useAccessibilitySettings() {
  const {
    getAccessibilitySettings,
    updateAccessibilitySettings,
    settings
  } = useSettingsManager({
    watchPaths: ['accessibility', 'visual.reducedMotion'],
    debounceMs: 100
  });

  const [accessibilitySettings, setAccessibilitySettings] = useState(() => 
    getAccessibilitySettings()
  );

  // Update local state when accessibility settings change
  useEffect(() => {
    if (settings) {
      setAccessibilitySettings(getAccessibilitySettings());
    }
  }, [settings, getAccessibilitySettings]);

  // Toggle functions for common accessibility settings
  const toggleHighContrast = useCallback(() => {
    const current = accessibilitySettings?.highContrast || false;
    return updateAccessibilitySettings({ highContrast: !current });
  }, [accessibilitySettings, updateAccessibilitySettings]);

  const toggleReducedMotion = useCallback(() => {
    const current = accessibilitySettings?.reducedMotion || false;
    return updateAccessibilitySettings({ reducedMotion: !current });
  }, [accessibilitySettings, updateAccessibilitySettings]);

  const toggleLargerText = useCallback(() => {
    const current = accessibilitySettings?.largerText || false;
    return updateAccessibilitySettings({ largerText: !current });
  }, [accessibilitySettings, updateAccessibilitySettings]);

  return {
    accessibilitySettings,
    updateAccessibilitySettings,
    toggleHighContrast,
    toggleReducedMotion,
    toggleLargerText
  };
}

/**
 * Hook for customization settings
 * @returns {Object} Customization settings and controls
 */
export function useCustomizationSettings() {
  const {
    getCustomizationSettings,
    updateCustomizationSettings,
    settings
  } = useSettingsManager({
    watchPaths: ['visual', 'audio', 'messages'],
    debounceMs: 100
  });

  const [customizationSettings, setCustomizationSettings] = useState(() => 
    getCustomizationSettings()
  );

  // Update local state when customization settings change
  useEffect(() => {
    if (settings) {
      setCustomizationSettings(getCustomizationSettings());
    }
  }, [settings, getCustomizationSettings]);

  // Specific setter functions
  const setAnimationSpeed = useCallback((speed) => {
    return updateCustomizationSettings({ animationSpeed: speed });
  }, [updateCustomizationSettings]);

  const setEffectsIntensity = useCallback((intensity) => {
    return updateCustomizationSettings({ effectsIntensity: intensity });
  }, [updateCustomizationSettings]);

  const setMessageFrequency = useCallback((frequency) => {
    return updateCustomizationSettings({ messageFrequency: frequency });
  }, [updateCustomizationSettings]);

  const setAudioVolume = useCallback((volume) => {
    return updateCustomizationSettings({ audioVolume: volume });
  }, [updateCustomizationSettings]);

  const toggleAudio = useCallback(() => {
    const current = customizationSettings?.audioEnabled || false;
    return updateCustomizationSettings({ audioEnabled: !current });
  }, [customizationSettings, updateCustomizationSettings]);

  return {
    customizationSettings,
    updateCustomizationSettings,
    setAnimationSpeed,
    setEffectsIntensity,
    setMessageFrequency,
    setAudioVolume,
    toggleAudio
  };
}

/**
 * Hook for performance monitoring
 * @returns {Object} Performance metrics and monitoring controls
 */
export function usePerformanceMonitoring() {
  const { getPerformanceMetrics, getSetting } = useSettingsManager();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = getPerformanceMetrics();
      setMetrics(currentMetrics);
    };

    // Update metrics immediately
    updateMetrics();

    // Set up interval for regular updates
    const interval = setInterval(updateMetrics, 1000);

    return () => clearInterval(interval);
  }, [getPerformanceMetrics]);

  const isMonitoringEnabled = getSetting('advanced.showPerformanceMetrics');

  return {
    metrics,
    isMonitoringEnabled
  };
}

export default useSettingsManager;