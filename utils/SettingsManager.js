/**
 * SettingsManager - Comprehensive settings management system for VibeScreen
 * Handles user preferences, persistence, export/import, and validation
 */
class SettingsManager {
  constructor() {
    this.storageKey = 'vibescreen-settings';
    this.version = '1.0.0';
    this.settings = this.loadSettings();
    this.listeners = new Set();
    
    // Performance monitoring
    this.performanceMetrics = {
      fps: 0,
      frameTime: 0,
      memoryUsage: 0,
      activeComponents: 0,
      lastUpdate: Date.now()
    };
    
    this.startPerformanceMonitoring();
  }

  /**
   * Get default settings configuration
   * @returns {Object} Default settings object
   */
  getDefaults() {
    return {
      version: this.version,
      audio: {
        enabled: false,
        volume: 0.3,
        ambientEnabled: false,
        muted: false
      },
      visual: {
        effectsIntensity: 'medium', // 'high', 'medium', 'low', 'off'
        animationSpeed: 1.0,
        scanLinesEnabled: true,
        phosphorGlowEnabled: true,
        reducedMotion: false
      },
      messages: {
        frequency: 30, // seconds
        pauseOnInactivity: false,
        showTimestamps: false,
        paused: false
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largerText: false,
        screenReaderSupport: true
      },
      advanced: {
        performanceMode: 'full', // 'full', 'optimized', 'minimal'
        debugMode: false,
        autoSave: true,
        showPerformanceMetrics: false
      },
      system: {
        currentCharacter: 'corporate-ai',
        lastActive: Date.now(),
        sessionCount: 0
      }
    };
  }

  /**
   * Load settings from localStorage with validation and migration
   * @returns {Object} Loaded and validated settings
   */
  loadSettings() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.getDefaults();
      }

      const parsed = JSON.parse(stored);
      
      // Validate and migrate settings if needed
      const migrated = this.migrateSettings(parsed);
      const validated = this.validateSettings(migrated);
      
      return { ...this.getDefaults(), ...validated };
    } catch (error) {
      console.warn('Failed to load settings, using defaults:', error);
      return this.getDefaults();
    }
  }

  /**
   * Migrate settings from older versions
   * @param {Object} settings - Settings to migrate
   * @returns {Object} Migrated settings
   */
  migrateSettings(settings) {
    if (!settings.version) {
      // Migrate from pre-versioned settings
      settings.version = '1.0.0';
      
      // Add any missing sections with defaults
      const defaults = this.getDefaults();
      Object.keys(defaults).forEach(key => {
        if (!settings[key]) {
          settings[key] = defaults[key];
        }
      });
    }
    
    return settings;
  }

  /**
   * Validate settings structure and values
   * @param {Object} settings - Settings to validate
   * @returns {Object} Validated settings
   */
  validateSettings(settings) {
    const defaults = this.getDefaults();
    const validated = {};

    // Validate each section
    Object.keys(defaults).forEach(section => {
      validated[section] = {};
      
      if (settings[section] && typeof settings[section] === 'object') {
        Object.keys(defaults[section]).forEach(key => {
          const defaultValue = defaults[section][key];
          const userValue = settings[section][key];
          
          // Type validation
          if (typeof userValue === typeof defaultValue) {
            // Range validation for numeric values
            if (typeof defaultValue === 'number') {
              validated[section][key] = this.validateNumericSetting(key, userValue, defaultValue);
            } else if (typeof defaultValue === 'string') {
              validated[section][key] = this.validateStringSetting(key, userValue, defaultValue);
            } else {
              validated[section][key] = userValue;
            }
          } else {
            validated[section][key] = defaultValue;
          }
        });
      } else {
        validated[section] = defaults[section];
      }
    });

    return validated;
  }

  /**
   * Validate numeric settings with appropriate ranges
   * @param {string} key - Setting key
   * @param {number} value - Value to validate
   * @param {number} defaultValue - Default fallback value
   * @returns {number} Validated value
   */
  validateNumericSetting(key, value, defaultValue) {
    const ranges = {
      volume: { min: 0, max: 1 },
      animationSpeed: { min: 0.1, max: 5.0 },
      frequency: { min: 5, max: 300 }
    };

    const range = ranges[key];
    if (range) {
      return Math.max(range.min, Math.min(range.max, value));
    }
    
    return value;
  }

  /**
   * Validate string settings with allowed values
   * @param {string} key - Setting key
   * @param {string} value - Value to validate
   * @param {string} defaultValue - Default fallback value
   * @returns {string} Validated value
   */
  validateStringSetting(key, value, defaultValue) {
    const allowedValues = {
      effectsIntensity: ['high', 'medium', 'low', 'off'],
      performanceMode: ['full', 'optimized', 'minimal']
    };

    const allowed = allowedValues[key];
    if (allowed && !allowed.includes(value)) {
      return defaultValue;
    }
    
    return value;
  }

  /**
   * Save settings to localStorage
   * @returns {boolean} Success status
   */
  saveSettings() {
    try {
      this.settings.system.lastActive = Date.now();
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      this.notifyListeners('settings-saved', this.settings);
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  /**
   * Get a specific setting value
   * @param {string} path - Dot-notation path to setting (e.g., 'audio.volume')
   * @returns {*} Setting value or undefined
   */
  getSetting(path) {
    const parts = path.split('.');
    let current = this.settings;
    
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  /**
   * Set a specific setting value
   * @param {string} path - Dot-notation path to setting
   * @param {*} value - Value to set
   * @returns {boolean} Success status
   */
  setSetting(path, value) {
    const parts = path.split('.');
    const lastPart = parts.pop();
    let current = this.settings;
    
    // Navigate to parent object
    for (const part of parts) {
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Validate the value before setting
    const validated = this.validateSettingValue(path, value);
    
    // Set the validated value
    current[lastPart] = validated;
    
    // Apply setting immediately if it affects accessibility or visual preferences
    this.applySettingChange(path, validated);
    
    // Auto-save if enabled
    if (this.settings.advanced.autoSave) {
      this.scheduleAutoSave();
    }
    
    this.notifyListeners('setting-changed', { path, value: validated });
    return true;
  }

  /**
   * Validate a setting value before applying it
   * @param {string} path - Setting path
   * @param {*} value - Value to validate
   * @returns {*} Validated value
   */
  validateSettingValue(path, value) {
    const parts = path.split('.');
    const section = parts[0];
    const key = parts[1];
    
    // Get default value for comparison
    const defaults = this.getDefaults();
    const defaultValue = defaults[section]?.[key];
    
    if (typeof defaultValue === 'number') {
      return this.validateNumericSetting(key, value, defaultValue);
    } else if (typeof defaultValue === 'string') {
      return this.validateStringSetting(key, value, defaultValue);
    } else if (typeof defaultValue === 'boolean') {
      return Boolean(value);
    }
    
    return value;
  }

  /**
   * Apply setting change immediately for visual/accessibility settings
   * @param {string} path - Setting path
   * @param {*} value - New value
   */
  applySettingChange(path, value) {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    switch (path) {
      case 'accessibility.highContrast':
        root.setAttribute('data-high-contrast', value);
        if (value) {
          root.style.setProperty('--accessibility-mode', 'high-contrast');
        } else {
          root.style.removeProperty('--accessibility-mode');
        }
        break;
        
      case 'accessibility.reducedMotion':
        root.setAttribute('data-reduced-motion', value);
        if (value) {
          root.style.setProperty('--animation-duration', '0.01ms');
          root.style.setProperty('--transition-duration', '0.01ms');
        } else {
          root.style.removeProperty('--animation-duration');
          root.style.removeProperty('--transition-duration');
        }
        break;
        
      case 'accessibility.largerText':
        root.setAttribute('data-larger-text', value);
        if (value) {
          root.style.setProperty('--font-size-multiplier', '1.2');
        } else {
          root.style.removeProperty('--font-size-multiplier');
        }
        break;
        
      case 'visual.effectsIntensity':
        root.setAttribute('data-effects-intensity', value);
        root.style.setProperty('--effects-intensity', value);
        break;
        
      case 'visual.animationSpeed':
        root.style.setProperty('--animation-speed-multiplier', value);
        break;
        
      case 'audio.volume':
        // Notify audio system of volume change
        this.notifyListeners('audio-volume-changed', value);
        break;
        
      case 'audio.enabled':
        // Notify audio system of enable/disable
        this.notifyListeners('audio-enabled-changed', value);
        break;
    }
  }

  /**
   * Schedule auto-save with debouncing
   */
  scheduleAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }
    
    this.autoSaveTimeout = setTimeout(() => {
      this.saveSettings();
      this.autoSaveTimeout = null;
    }, 1000); // 1 second debounce
  }

  /**
   * Export current configuration as base64 string
   * @returns {Object} Export result with success status and data
   */
  exportConfig() {
    try {
      const exportData = {
        version: this.version,
        timestamp: Date.now(),
        settings: this.settings
      };
      
      const configString = btoa(JSON.stringify(exportData));
      const message = `Configuration exported successfully!\n\nUse this command to import:\n!import ${configString}`;
      
      return { 
        success: true, 
        message,
        configString,
        size: configString.length
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Export failed: ${error.message}` 
      };
    }
  }

  /**
   * Import configuration from base64 string
   * @param {string} configString - Base64 encoded configuration
   * @returns {Object} Import result with success status and message
   */
  importConfig(configString) {
    try {
      if (!configString || typeof configString !== 'string') {
        return { 
          success: false, 
          message: 'Invalid configuration string provided' 
        };
      }

      const decoded = JSON.parse(atob(configString));
      
      // Validate import data structure
      if (!decoded.settings || !decoded.version) {
        return { 
          success: false, 
          message: 'Invalid configuration format' 
        };
      }

      // Version compatibility check
      if (decoded.version !== this.version) {
        console.warn(`Importing from different version: ${decoded.version} -> ${this.version}`);
      }

      // Validate and merge settings
      const validated = this.validateSettings(decoded.settings);
      this.settings = { ...this.getDefaults(), ...validated };
      
      // Save imported settings
      const saved = this.saveSettings();
      if (!saved) {
        return { 
          success: false, 
          message: 'Failed to save imported configuration' 
        };
      }

      this.notifyListeners('settings-imported', this.settings);
      
      return { 
        success: true, 
        message: 'Configuration imported successfully!' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `Import failed: ${error.message}` 
      };
    }
  }

  /**
   * Reset all settings to defaults
   * @returns {Object} Reset result
   */
  resetToDefaults() {
    try {
      this.settings = this.getDefaults();
      const saved = this.saveSettings();
      
      if (saved) {
        this.notifyListeners('settings-reset', this.settings);
        return { 
          success: true, 
          message: 'All settings reset to defaults' 
        };
      } else {
        return { 
          success: false, 
          message: 'Failed to save reset settings' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `Reset failed: ${error.message}` 
      };
    }
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    if (typeof window === 'undefined') return;

    let lastTime = performance.now();
    let frameCount = 0;
    
    const updateMetrics = () => {
      const now = performance.now();
      const deltaTime = now - lastTime;
      frameCount++;
      
      // Update FPS every second
      if (deltaTime >= 1000) {
        this.performanceMetrics.fps = Math.round((frameCount * 1000) / deltaTime);
        this.performanceMetrics.frameTime = deltaTime / frameCount;
        this.performanceMetrics.lastUpdate = Date.now();
        
        // Memory usage (if available)
        if (performance.memory) {
          this.performanceMetrics.memoryUsage = Math.round(
            performance.memory.usedJSHeapSize / 1024 / 1024
          );
        }
        
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(updateMetrics);
    };
    
    requestAnimationFrame(updateMetrics);
  }

  /**
   * Get current performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * Add settings change listener
   * @param {Function} listener - Callback function
   */
  addListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * Remove settings change listener
   * @param {Function} listener - Callback function
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   * @param {string} event - Event type
   * @param {*} data - Event data
   */
  notifyListeners(event, data) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Settings listener error:', error);
      }
    });
  }

  /**
   * Get comprehensive system information
   * @returns {Object} System information
   */
  getSystemInfo() {
    const info = {
      version: this.version,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      performance: this.getPerformanceMetrics(),
      storage: {
        localStorage: this.getStorageInfo('localStorage'),
        sessionStorage: this.getStorageInfo('sessionStorage')
      },
      settings: {
        totalSize: JSON.stringify(this.settings).length,
        sections: Object.keys(this.settings).length,
        lastSaved: new Date(this.settings.system.lastActive).toLocaleString()
      }
    };

    return info;
  }

  /**
   * Get storage information
   * @param {string} storageType - Type of storage to check
   * @returns {Object} Storage information
   */
  getStorageInfo(storageType) {
    try {
      const storage = window[storageType];
      let totalSize = 0;
      
      for (let key in storage) {
        if (storage.hasOwnProperty(key)) {
          totalSize += storage[key].length + key.length;
        }
      }
      
      return {
        available: true,
        itemCount: storage.length,
        estimatedSize: totalSize,
        quota: this.getStorageQuota(storageType)
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  /**
   * Get storage quota information
   * @param {string} storageType - Type of storage
   * @returns {string} Quota information
   */
  getStorageQuota(storageType) {
    // Most browsers have 5-10MB limit for localStorage
    return storageType === 'localStorage' ? '~5-10MB' : '~Session-based';
  }

  /**
   * Update multiple settings at once
   * @param {Object} updates - Object with setting paths as keys and values
   * @returns {boolean} Success status
   */
  updateSettings(updates) {
    try {
      const oldAutoSave = this.settings.advanced.autoSave;
      
      // Temporarily disable auto-save to batch updates
      this.settings.advanced.autoSave = false;
      
      // Apply all updates
      Object.entries(updates).forEach(([path, value]) => {
        this.setSetting(path, value);
      });
      
      // Restore auto-save setting
      this.settings.advanced.autoSave = oldAutoSave;
      
      // Save once after all updates
      if (oldAutoSave) {
        this.saveSettings();
      }
      
      this.notifyListeners('settings-bulk-updated', updates);
      return true;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  }

  /**
   * Get accessibility-specific settings
   * @returns {Object} Accessibility settings
   */
  getAccessibilitySettings() {
    return {
      ...this.settings.accessibility,
      reducedMotionFromVisual: this.settings.visual.reducedMotion
    };
  }

  /**
   * Update accessibility settings and apply them immediately
   * @param {Object} accessibilityUpdates - Accessibility setting updates
   * @returns {boolean} Success status
   */
  updateAccessibilitySettings(accessibilityUpdates) {
    const updates = {};
    
    // Map accessibility updates to setting paths
    Object.entries(accessibilityUpdates).forEach(([key, value]) => {
      if (key === 'reducedMotionFromVisual') {
        updates['visual.reducedMotion'] = value;
      } else {
        updates[`accessibility.${key}`] = value;
      }
    });
    
    return this.updateSettings(updates);
  }

  /**
   * Get customization settings for UI controls
   * @returns {Object} Customization settings
   */
  getCustomizationSettings() {
    return {
      animationSpeed: this.settings.visual.animationSpeed,
      effectsIntensity: this.settings.visual.effectsIntensity,
      messageFrequency: this.settings.messages.frequency,
      audioVolume: this.settings.audio.volume,
      audioEnabled: this.settings.audio.enabled,
      scanLinesEnabled: this.settings.visual.scanLinesEnabled,
      phosphorGlowEnabled: this.settings.visual.phosphorGlowEnabled
    };
  }

  /**
   * Update customization settings
   * @param {Object} customizationUpdates - Customization setting updates
   * @returns {boolean} Success status
   */
  updateCustomizationSettings(customizationUpdates) {
    const updates = {};
    
    // Map customization updates to setting paths
    Object.entries(customizationUpdates).forEach(([key, value]) => {
      switch (key) {
        case 'animationSpeed':
          updates['visual.animationSpeed'] = value;
          break;
        case 'effectsIntensity':
          updates['visual.effectsIntensity'] = value;
          break;
        case 'messageFrequency':
          updates['messages.frequency'] = value;
          break;
        case 'audioVolume':
          updates['audio.volume'] = value;
          break;
        case 'audioEnabled':
          updates['audio.enabled'] = value;
          break;
        case 'scanLinesEnabled':
          updates['visual.scanLinesEnabled'] = value;
          break;
        case 'phosphorGlowEnabled':
          updates['visual.phosphorGlowEnabled'] = value;
          break;
      }
    });
    
    return this.updateSettings(updates);
  }

  /**
   * Initialize settings on application startup
   * @returns {Object} Initialization result
   */
  initialize() {
    try {
      // Apply all current settings to the DOM
      this.applyAllSettings();
      
      // Start performance monitoring
      this.startPerformanceMonitoring();
      
      // Set up browser event listeners for preference changes
      this.setupBrowserPreferenceListeners();
      
      // Increment session count
      this.setSetting('system.sessionCount', this.settings.system.sessionCount + 1);
      
      return {
        success: true,
        message: 'Settings initialized successfully',
        settings: this.settings
      };
    } catch (error) {
      return {
        success: false,
        message: `Settings initialization failed: ${error.message}`
      };
    }
  }

  /**
   * Apply all current settings to the DOM
   */
  applyAllSettings() {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    // Apply accessibility settings
    root.setAttribute('data-high-contrast', this.settings.accessibility.highContrast);
    root.setAttribute('data-reduced-motion', this.settings.accessibility.reducedMotion || this.settings.visual.reducedMotion);
    root.setAttribute('data-larger-text', this.settings.accessibility.largerText);
    
    // Apply visual settings
    root.setAttribute('data-effects-intensity', this.settings.visual.effectsIntensity);
    root.style.setProperty('--animation-speed-multiplier', this.settings.visual.animationSpeed);
    root.style.setProperty('--effects-intensity', this.settings.visual.effectsIntensity);
    
    // Apply accessibility CSS properties
    if (this.settings.accessibility.highContrast) {
      root.style.setProperty('--accessibility-mode', 'high-contrast');
    }
    
    if (this.settings.accessibility.reducedMotion || this.settings.visual.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    }
    
    if (this.settings.accessibility.largerText) {
      root.style.setProperty('--font-size-multiplier', '1.2');
    }
  }

  /**
   * Set up browser preference change listeners
   */
  setupBrowserPreferenceListeners() {
    if (typeof window === 'undefined') return;
    
    // High contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = (e) => {
      if (!this.settings.accessibility.highContrast) {
        // Only auto-apply if user hasn't manually set high contrast
        this.setSetting('accessibility.highContrast', e.matches);
      }
    };
    contrastQuery.addEventListener('change', handleContrastChange);
    
    // Reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e) => {
      if (!this.settings.accessibility.reducedMotion) {
        // Only auto-apply if user hasn't manually set reduced motion
        this.setSetting('accessibility.reducedMotion', e.matches);
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);
    
    // Store listeners for cleanup
    this.browserListeners = {
      contrast: { query: contrastQuery, handler: handleContrastChange },
      motion: { query: motionQuery, handler: handleMotionChange }
    };
  }

  /**
   * Clean up browser preference listeners
   */
  cleanupBrowserListeners() {
    if (this.browserListeners) {
      Object.values(this.browserListeners).forEach(({ query, handler }) => {
        query.removeEventListener('change', handler);
      });
      this.browserListeners = null;
    }
  }

  /**
   * Get settings summary for display
   * @returns {Object} Settings summary
   */
  getSettingsSummary() {
    return {
      accessibility: {
        highContrast: this.settings.accessibility.highContrast,
        reducedMotion: this.settings.accessibility.reducedMotion || this.settings.visual.reducedMotion,
        largerText: this.settings.accessibility.largerText,
        screenReaderSupport: this.settings.accessibility.screenReaderSupport
      },
      customization: {
        animationSpeed: this.settings.visual.animationSpeed,
        effectsIntensity: this.settings.visual.effectsIntensity,
        messageFrequency: this.settings.messages.frequency,
        audioEnabled: this.settings.audio.enabled,
        audioVolume: this.settings.audio.volume
      },
      system: {
        currentCharacter: this.settings.system.currentCharacter,
        autoSave: this.settings.advanced.autoSave,
        performanceMode: this.settings.advanced.performanceMode,
        sessionCount: this.settings.system.sessionCount
      }
    };
  }

  /**
   * Cleanup and destroy settings manager
   */
  destroy() {
    // Clear auto-save timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
    
    // Clean up browser listeners
    this.cleanupBrowserListeners();
    
    // Clear all listeners
    this.listeners.clear();
    
    // Final save if auto-save is enabled
    if (this.settings.advanced.autoSave) {
      this.saveSettings();
    }
  }
}

export default SettingsManager;