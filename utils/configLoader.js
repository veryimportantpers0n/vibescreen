/**
 * Configuration loading utilities with error handling and fallbacks
 * Provides reliable access to global configuration data
 */

import { validateAndSanitizeConfig, loadConfigFromJSON } from './configValidation.js';

/**
 * Default fallback configuration used when files are missing or corrupted
 */
const FALLBACK_CONFIG = {
  defaultMinDelaySeconds: 15,
  defaultMaxDelaySeconds: 45,
  defaultPopupStyle: "overlay",
  animationSpeedMultiplier: 1.0,
  messageCategories: {
    cliche: { weight: 0.6, description: "Standard AI responses" },
    exaggeration: { weight: 0.2, description: "Humorous AI lines" },
    other: { weight: 0.2, description: "Neutral variations" }
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    messageLifespanMultiplier: 1.0
  },
  userPreferences: {
    enableSounds: true,
    enableAnimations: true,
    preferredTheme: "matrix-green",
    autoHideTerminal: true,
    terminalAutoHideDelay: 2000
  }
};

/**
 * Cached configuration to avoid repeated file reads
 */
let cachedConfig = null;
let configLoadTime = null;

/**
 * Loads global configuration with error handling and caching
 * @param {boolean} forceReload - Force reload from file system
 * @returns {Promise<Object>} - Global configuration object
 */
export async function loadGlobalConfig(forceReload = false) {
  // Return cached config if available and not forcing reload
  if (cachedConfig && !forceReload) {
    return cachedConfig;
  }

  try {
    // Try to load from file system
    const configData = await loadConfigFile();
    const validatedConfig = validateAndSanitizeConfig(configData);
    
    // Cache the successful result
    cachedConfig = validatedConfig;
    configLoadTime = Date.now();
    
    console.log('Global configuration loaded successfully');
    return validatedConfig;
    
  } catch (error) {
    console.error('Failed to load global configuration:', error.message);
    console.warn('Using fallback configuration');
    
    // Use fallback configuration
    cachedConfig = validateAndSanitizeConfig(FALLBACK_CONFIG);
    configLoadTime = Date.now();
    
    return cachedConfig;
  }
}

/**
 * Loads configuration file from the file system
 * @returns {Promise<Object>} - Raw configuration data
 */
async function loadConfigFile() {
  if (typeof window !== 'undefined') {
    // Client-side loading
    const response = await fetch('/data/global-config.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } else {
    // Server-side loading (Node.js)
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const configPath = path.join(process.cwd(), 'data', 'global-config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configContent);
  }
}

/**
 * Gets a specific configuration value with fallback
 * @param {string} path - Dot-notation path to config value (e.g., 'accessibility.reducedMotion')
 * @param {*} defaultValue - Default value if path not found
 * @returns {Promise<*>} - Configuration value
 */
export async function getConfigValue(path, defaultValue = null) {
  const config = await loadGlobalConfig();
  
  const pathParts = path.split('.');
  let value = config;
  
  for (const part of pathParts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return defaultValue;
    }
  }
  
  return value;
}

/**
 * Updates a configuration value in memory (does not persist to file)
 * @param {string} path - Dot-notation path to config value
 * @param {*} newValue - New value to set
 * @returns {Promise<boolean>} - Success flag
 */
export async function updateConfigValue(path, newValue) {
  try {
    const config = await loadGlobalConfig();
    const pathParts = path.split('.');
    const lastPart = pathParts.pop();
    
    let target = config;
    for (const part of pathParts) {
      if (!target[part] || typeof target[part] !== 'object') {
        target[part] = {};
      }
      target = target[part];
    }
    
    target[lastPart] = newValue;
    
    // Re-validate the entire configuration
    cachedConfig = validateAndSanitizeConfig(config);
    
    return true;
  } catch (error) {
    console.error('Failed to update config value:', error.message);
    return false;
  }
}

/**
 * Gets configuration metadata for debugging and validation
 * @returns {Promise<Object>} - Configuration metadata
 */
export async function getConfigMetadata() {
  const config = await loadGlobalConfig();
  
  return {
    loadTime: configLoadTime,
    isFallback: !configLoadTime || cachedConfig === FALLBACK_CONFIG,
    configSize: JSON.stringify(config).length,
    categories: Object.keys(config.messageCategories || {}),
    validationSchema: config.validation || null
  };
}

/**
 * Validates current configuration and returns any issues
 * @returns {Promise<Object>} - Validation results
 */
export async function validateCurrentConfig() {
  try {
    const config = await loadGlobalConfig();
    
    const issues = [];
    const warnings = [];
    
    // Check timing configuration
    if (config.defaultMaxDelaySeconds <= config.defaultMinDelaySeconds) {
      issues.push('Maximum delay must be greater than minimum delay');
    }
    
    // Check message category weights
    const totalWeight = Object.values(config.messageCategories || {})
      .reduce((sum, cat) => sum + (cat.weight || 0), 0);
    
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      warnings.push(`Message category weights sum to ${totalWeight.toFixed(3)}, expected 1.0`);
    }
    
    // Check accessibility settings
    if (config.accessibility?.messageLifespanMultiplier < 0.5) {
      warnings.push('Message lifespan multiplier is very low, may affect accessibility');
    }
    
    return {
      valid: issues.length === 0,
      issues,
      warnings,
      config
    };
    
  } catch (error) {
    return {
      valid: false,
      issues: [`Configuration validation failed: ${error.message}`],
      warnings: [],
      config: null
    };
  }
}

/**
 * Resets configuration cache (useful for testing or development)
 */
export function clearConfigCache() {
  cachedConfig = null;
  configLoadTime = null;
}