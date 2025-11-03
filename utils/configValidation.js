/**
 * Configuration validation and sanitization utilities
 * Ensures all configuration values are within acceptable ranges and types
 */

/**
 * Validates and sanitizes global configuration object
 * @param {Object} config - Raw configuration object
 * @returns {Object} - Sanitized and validated configuration
 */
export function validateAndSanitizeConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Configuration must be a valid object');
  }

  const sanitized = {
    defaultMinDelaySeconds: sanitizeNumber(
      config.defaultMinDelaySeconds,
      15,
      5,
      300
    ),
    defaultMaxDelaySeconds: sanitizeNumber(
      config.defaultMaxDelaySeconds,
      45,
      10,
      600
    ),
    defaultPopupStyle: sanitizePopupStyle(config.defaultPopupStyle),
    animationSpeedMultiplier: sanitizeNumber(
      config.animationSpeedMultiplier,
      1.0,
      0.1,
      5.0
    ),
    messageCategories: sanitizeMessageCategories(config.messageCategories),
    accessibility: sanitizeAccessibility(config.accessibility),
    userPreferences: sanitizeUserPreferences(config.userPreferences),
    validation: config.validation || {}
  };

  // Ensure max delay is greater than min delay
  if (sanitized.defaultMaxDelaySeconds <= sanitized.defaultMinDelaySeconds) {
    sanitized.defaultMaxDelaySeconds = sanitized.defaultMinDelaySeconds + 10;
  }

  return sanitized;
}

/**
 * Sanitizes numeric values within specified range
 * @param {*} value - Value to sanitize
 * @param {number} defaultValue - Default if invalid
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number} - Sanitized number
 */
function sanitizeNumber(value, defaultValue, min, max) {
  const num = parseFloat(value);
  if (isNaN(num)) return defaultValue;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validates popup style setting
 * @param {*} style - Style to validate
 * @returns {string} - Valid popup style
 */
function sanitizePopupStyle(style) {
  const allowedStyles = ['overlay', 'speechBubble'];
  return allowedStyles.includes(style) ? style : 'overlay';
}

/**
 * Sanitizes message categories configuration
 * @param {Object} categories - Categories object to sanitize
 * @returns {Object} - Sanitized categories
 */
function sanitizeMessageCategories(categories) {
  const defaults = {
    cliche: { weight: 0.6, description: "Standard AI responses" },
    exaggeration: { weight: 0.2, description: "Humorous AI lines" },
    other: { weight: 0.2, description: "Neutral variations" }
  };

  if (!categories || typeof categories !== 'object') {
    return defaults;
  }

  const sanitized = {};
  for (const [key, category] of Object.entries(defaults)) {
    sanitized[key] = {
      weight: sanitizeNumber(
        categories[key]?.weight,
        category.weight,
        0,
        1
      ),
      description: typeof categories[key]?.description === 'string'
        ? categories[key].description
        : category.description
    };
  }

  // Normalize weights to sum to 1.0
  const totalWeight = Object.values(sanitized).reduce((sum, cat) => sum + cat.weight, 0);
  if (totalWeight > 0) {
    for (const category of Object.values(sanitized)) {
      category.weight = category.weight / totalWeight;
    }
  }

  return sanitized;
}

/**
 * Sanitizes accessibility configuration
 * @param {Object} accessibility - Accessibility settings to sanitize
 * @returns {Object} - Sanitized accessibility settings
 */
function sanitizeAccessibility(accessibility) {
  const defaults = {
    reducedMotion: false,
    highContrast: false,
    messageLifespanMultiplier: 1.0
  };

  if (!accessibility || typeof accessibility !== 'object') {
    return defaults;
  }

  return {
    reducedMotion: Boolean(accessibility.reducedMotion),
    highContrast: Boolean(accessibility.highContrast),
    messageLifespanMultiplier: sanitizeNumber(
      accessibility.messageLifespanMultiplier,
      1.0,
      0.5,
      3.0
    )
  };
}

/**
 * Sanitizes user preferences configuration
 * @param {Object} preferences - User preferences to sanitize
 * @returns {Object} - Sanitized user preferences
 */
function sanitizeUserPreferences(preferences) {
  const defaults = {
    enableSounds: true,
    enableAnimations: true,
    preferredTheme: "matrix-green",
    autoHideTerminal: true,
    terminalAutoHideDelay: 2000
  };

  if (!preferences || typeof preferences !== 'object') {
    return defaults;
  }

  const allowedThemes = ["matrix-green", "amber", "blue", "red"];

  return {
    enableSounds: Boolean(preferences.enableSounds),
    enableAnimations: Boolean(preferences.enableAnimations),
    preferredTheme: allowedThemes.includes(preferences.preferredTheme)
      ? preferences.preferredTheme
      : defaults.preferredTheme,
    autoHideTerminal: Boolean(preferences.autoHideTerminal),
    terminalAutoHideDelay: sanitizeNumber(
      preferences.terminalAutoHideDelay,
      2000,
      500,
      10000
    )
  };
}

/**
 * Validates configuration file structure and required fields
 * @param {Object} config - Configuration to validate
 * @returns {Object} - Validation result with success flag and errors
 */
export function validateConfigStructure(config) {
  const errors = [];
  const warnings = [];

  if (!config) {
    errors.push('Configuration object is required');
    return { success: false, errors, warnings };
  }

  // Check required fields
  const requiredFields = [
    'defaultMinDelaySeconds',
    'defaultMaxDelaySeconds',
    'defaultPopupStyle',
    'animationSpeedMultiplier'
  ];

  for (const field of requiredFields) {
    if (!(field in config)) {
      warnings.push(`Missing required field: ${field}`);
    }
  }

  // Validate message categories structure
  if (config.messageCategories) {
    const requiredCategories = ['cliche', 'exaggeration', 'other'];
    for (const category of requiredCategories) {
      if (!config.messageCategories[category]) {
        warnings.push(`Missing message category: ${category}`);
      } else {
        const cat = config.messageCategories[category];
        if (typeof cat.weight !== 'number') {
          warnings.push(`Invalid weight for category ${category}`);
        }
        if (typeof cat.description !== 'string') {
          warnings.push(`Missing description for category ${category}`);
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Loads and validates configuration from JSON string
 * @param {string} jsonString - JSON configuration string
 * @returns {Object} - Parsed and validated configuration
 */
export function loadConfigFromJSON(jsonString) {
  try {
    const config = JSON.parse(jsonString);
    const validation = validateConfigStructure(config);
    
    if (!validation.success) {
      throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      console.warn('Configuration warnings:', validation.warnings);
    }

    return validateAndSanitizeConfig(config);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON syntax: ${error.message}`);
    }
    throw error;
  }
}