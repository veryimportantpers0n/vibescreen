/**
 * Comprehensive data loading and error handling system for VibeScreen
 * Provides graceful fallbacks, error logging, and application stability
 */

import { validateAndSanitizeConfig } from './configValidation.js';
import { validateWithFallback } from './messageValidation.js';

/**
 * Error logging system for data loading failures
 */
class DataLoadingLogger {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.startTime = Date.now();
  }

  logError(source, message, details = null) {
    const error = {
      timestamp: new Date().toISOString(),
      source,
      message,
      details,
      severity: 'error'
    };
    this.errors.push(error);
    console.error(`[DataLoader Error] ${source}: ${message}`, details || '');
  }

  logWarning(source, message, details = null) {
    const warning = {
      timestamp: new Date().toISOString(),
      source,
      message,
      details,
      severity: 'warning'
    };
    this.warnings.push(warning);
    console.warn(`[DataLoader Warning] ${source}: ${message}`, details || '');
  }

  logInfo(source, message) {
    console.log(`[DataLoader Info] ${source}: ${message}`);
  }

  getErrorSummary() {
    return {
      totalErrors: this.errors.length,
      totalWarnings: this.warnings.length,
      errors: this.errors,
      warnings: this.warnings,
      sessionDuration: Date.now() - this.startTime
    };
  }

  clearLogs() {
    this.errors = [];
    this.warnings = [];
    this.startTime = Date.now();
  }
}

/**
 * Global logger instance
 */
const logger = new DataLoadingLogger();

/**
 * Fallback configurations and data
 */
const FALLBACK_DATA = {
  globalConfig: {
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
  },
  
  messages: {
    'funny-exaggerations': [
      "System check: confidence = over 9000.",
      "Processing… processing… still vibing…",
      "I just optimized your vibe by 14%.",
      "Alert: your genius levels are destabilizing local servers.",
      "Compiling your brilliance… done.",
      "Error 404: Chill not found. Switching to maximum overdrive.",
      "Calculating optimal sass levels… complete.",
      "Warning: Your productivity is making other AIs jealous."
    ],
    
    'cliche-ai-phrases': [
      "As an AI language model, I'm here to assist you.",
      "That's a great question! Let me help you with that.",
      "I hope this information is helpful to you.",
      "Let me clarify that for you in simple terms.",
      "According to my training data and knowledge base.",
      "I'm designed to provide accurate and helpful responses.",
      "Thank you for your patience while I process this.",
      "I understand your concern and I'm here to help."
    ],
    
    'cliche-ai-things': [
      "Processing your request with advanced algorithms.",
      "Analyzing data patterns for optimal results.",
      "Generating response based on contextual understanding.",
      "Applying machine learning insights to your query.",
      "Utilizing natural language processing capabilities.",
      "Accessing knowledge database for relevant information.",
      "Implementing best practices for user assistance.",
      "Optimizing response quality through AI techniques."
    ]
  }
};

/**
 * Data loading cache to avoid repeated file reads
 */
const dataCache = {
  globalConfig: null,
  messages: {},
  lastLoaded: {},
  cacheTimeout: 5 * 60 * 1000 // 5 minutes
};

/**
 * Loads global configuration with comprehensive error handling
 * @param {boolean} forceReload - Force reload from file system
 * @returns {Promise<Object>} - Global configuration object
 */
export async function loadGlobalConfig(forceReload = false) {
  const cacheKey = 'globalConfig';
  
  // Check cache first
  if (!forceReload && dataCache[cacheKey] && 
      Date.now() - (dataCache.lastLoaded[cacheKey] || 0) < dataCache.cacheTimeout) {
    logger.logInfo('GlobalConfig', 'Using cached configuration');
    return dataCache[cacheKey];
  }

  try {
    logger.logInfo('GlobalConfig', 'Loading configuration from file system');
    
    // Try to load from file system
    const configData = await loadConfigFile();
    
    // Validate and sanitize the configuration
    const validatedConfig = validateAndSanitizeConfig(configData);
    
    // Cache the successful result
    dataCache[cacheKey] = validatedConfig;
    dataCache.lastLoaded[cacheKey] = Date.now();
    
    logger.logInfo('GlobalConfig', 'Configuration loaded and validated successfully');
    return validatedConfig;
    
  } catch (error) {
    logger.logError('GlobalConfig', 'Failed to load configuration file', {
      error: error.message,
      stack: error.stack
    });
    
    // Use fallback configuration
    logger.logWarning('GlobalConfig', 'Using fallback configuration');
    const fallbackConfig = validateAndSanitizeConfig(FALLBACK_DATA.globalConfig);
    
    // Cache the fallback
    dataCache[cacheKey] = { ...fallbackConfig, _isFallback: true };
    dataCache.lastLoaded[cacheKey] = Date.now();
    
    return dataCache[cacheKey];
  }
}

/**
 * Loads configuration file from the file system with environment detection
 * @returns {Promise<Object>} - Raw configuration data
 */
async function loadConfigFile() {
  if (typeof window !== 'undefined') {
    // Client-side loading
    const response = await fetch('/data/global-config.json');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } else {
    // Server-side loading (Node.js)
    const fs = await import('fs/promises');
    const path = await import('path');
    
    const configPath = path.join(process.cwd(), 'data', 'global-config.json');
    
    try {
      const configContent = await fs.readFile(configPath, 'utf-8');
      return JSON.parse(configContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Configuration file not found: ${configPath}`);
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in configuration file: ${error.message}`);
      }
      throw error;
    }
  }
}

/**
 * Loads message files with fallback handling
 * @param {string} messageType - Type of messages to load (funny-exaggerations, cliche-ai-phrases, etc.)
 * @param {boolean} forceReload - Force reload from file system
 * @returns {Promise<Object>} - Message loading result with content and metadata
 */
export async function loadMessages(messageType, forceReload = false) {
  const cacheKey = `messages_${messageType}`;
  
  // Check cache first
  if (!forceReload && dataCache.messages[messageType] && 
      Date.now() - (dataCache.lastLoaded[cacheKey] || 0) < dataCache.cacheTimeout) {
    logger.logInfo('MessageLoader', `Using cached messages for ${messageType}`);
    return {
      success: true,
      messages: dataCache.messages[messageType].content,
      usingFallback: dataCache.messages[messageType].usingFallback,
      cached: true
    };
  }

  try {
    logger.logInfo('MessageLoader', `Loading messages: ${messageType}`);
    
    const filePath = `data/master-messages/${messageType}.json`;
    const fallbackMessages = FALLBACK_DATA.messages[messageType] || [];
    
    // Use the validation utility with fallback
    const result = await loadMessageFile(filePath, fallbackMessages);
    
    // Cache the result
    dataCache.messages[messageType] = {
      content: result.content,
      usingFallback: result.usingFallback,
      loadTime: Date.now()
    };
    dataCache.lastLoaded[cacheKey] = Date.now();
    
    if (result.usingFallback) {
      logger.logWarning('MessageLoader', `Using fallback messages for ${messageType}`, {
        originalError: result.originalError
      });
    } else {
      logger.logInfo('MessageLoader', `Successfully loaded ${result.content.length} messages for ${messageType}`);
    }
    
    return {
      success: true,
      messages: result.content,
      usingFallback: result.usingFallback,
      cached: false,
      messageCount: result.content.length
    };
    
  } catch (error) {
    logger.logError('MessageLoader', `Failed to load messages for ${messageType}`, {
      error: error.message,
      stack: error.stack
    });
    
    // Use fallback messages
    const fallbackMessages = FALLBACK_DATA.messages[messageType] || [
      "System message: Content loading failed, using default messages.",
      "Please check your data files and try again.",
      "Fallback mode is active to ensure application stability."
    ];
    
    // Cache the fallback
    dataCache.messages[messageType] = {
      content: fallbackMessages,
      usingFallback: true,
      loadTime: Date.now()
    };
    dataCache.lastLoaded[cacheKey] = Date.now();
    
    logger.logWarning('MessageLoader', `Using emergency fallback for ${messageType}`);
    
    return {
      success: true,
      messages: fallbackMessages,
      usingFallback: true,
      cached: false,
      messageCount: fallbackMessages.length,
      error: error.message
    };
  }
}

/**
 * Loads message file with environment detection
 * @param {string} filePath - Path to message file
 * @param {Array} fallbackMessages - Fallback messages to use if file fails
 * @returns {Promise<Object>} - Message loading result
 */
async function loadMessageFile(filePath, fallbackMessages) {
  if (typeof window !== 'undefined') {
    // Client-side loading
    try {
      const response = await fetch(`/${filePath}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const messages = await response.json();
      
      // Basic validation
      if (!Array.isArray(messages)) {
        throw new Error('Message file must contain an array');
      }
      
      return {
        success: true,
        content: messages,
        usingFallback: false
      };
    } catch (error) {
      return {
        success: true,
        content: fallbackMessages,
        usingFallback: true,
        originalError: error.message
      };
    }
  } else {
    // Server-side loading with validation utility
    return validateWithFallback(filePath, fallbackMessages);
  }
}

/**
 * Loads all message types at once
 * @param {boolean} forceReload - Force reload from file system
 * @returns {Promise<Object>} - All message types with loading results
 */
export async function loadAllMessages(forceReload = false) {
  const messageTypes = ['funny-exaggerations', 'cliche-ai-phrases', 'cliche-ai-things'];
  const results = {};
  
  logger.logInfo('MessageLoader', 'Loading all message types');
  
  // Load all message types in parallel
  const loadPromises = messageTypes.map(async (type) => {
    const result = await loadMessages(type, forceReload);
    return { type, result };
  });
  
  try {
    const loadResults = await Promise.all(loadPromises);
    
    loadResults.forEach(({ type, result }) => {
      results[type] = result;
    });
    
    const totalMessages = Object.values(results)
      .reduce((sum, result) => sum + result.messageCount, 0);
    
    const usingFallbacks = Object.values(results)
      .filter(result => result.usingFallback).length;
    
    logger.logInfo('MessageLoader', `Loaded ${totalMessages} total messages across ${messageTypes.length} types`);
    
    if (usingFallbacks > 0) {
      logger.logWarning('MessageLoader', `${usingFallbacks} message types using fallback data`);
    }
    
    return {
      success: true,
      results,
      summary: {
        totalTypes: messageTypes.length,
        totalMessages,
        usingFallbacks,
        allLoaded: Object.values(results).every(r => r.success)
      }
    };
    
  } catch (error) {
    logger.logError('MessageLoader', 'Failed to load all message types', {
      error: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      results,
      error: error.message
    };
  }
}

/**
 * Comprehensive application data initialization
 * @param {Object} options - Loading options
 * @returns {Promise<Object>} - Complete application data with error handling
 */
export async function initializeApplicationData(options = {}) {
  const {
    forceReload = false,
    validateOnLoad = true,
    enableFallbacks = true
  } = options;
  
  logger.logInfo('DataLoader', 'Initializing application data');
  const startTime = Date.now();
  
  try {
    // Load global configuration
    const config = await loadGlobalConfig(forceReload);
    
    // Load all message data
    const messageData = await loadAllMessages(forceReload);
    
    // Validate loaded data if requested
    let validationResults = null;
    if (validateOnLoad) {
      logger.logInfo('DataLoader', 'Validating loaded data');
      // Import validation utilities dynamically to avoid circular dependencies
      const { validateOnStartup } = await import('./dataValidation.js');
      validationResults = await validateOnStartup();
    }
    
    const loadTime = Date.now() - startTime;
    
    // Prepare initialization result
    const result = {
      success: true,
      loadTime,
      config,
      messages: messageData.results,
      validation: validationResults,
      summary: {
        configLoaded: !!config,
        configUsingFallback: config._isFallback || false,
        messagesLoaded: messageData.success,
        totalMessages: messageData.summary?.totalMessages || 0,
        messageTypesUsingFallback: messageData.summary?.usingFallbacks || 0,
        validationPassed: validationResults?.success || null
      },
      logger: logger.getErrorSummary()
    };
    
    logger.logInfo('DataLoader', `Application data initialized successfully in ${loadTime}ms`);
    
    // Log summary
    if (result.summary.configUsingFallback) {
      logger.logWarning('DataLoader', 'Configuration is using fallback data');
    }
    
    if (result.summary.messageTypesUsingFallback > 0) {
      logger.logWarning('DataLoader', `${result.summary.messageTypesUsingFallback} message types using fallback data`);
    }
    
    return result;
    
  } catch (error) {
    const loadTime = Date.now() - startTime;
    
    logger.logError('DataLoader', 'Application data initialization failed', {
      error: error.message,
      stack: error.stack,
      loadTime
    });
    
    if (enableFallbacks) {
      logger.logWarning('DataLoader', 'Attempting emergency fallback initialization');
      
      // Emergency fallback - use all fallback data
      return {
        success: false,
        loadTime,
        config: FALLBACK_DATA.globalConfig,
        messages: {
          'funny-exaggerations': { 
            success: true, 
            messages: FALLBACK_DATA.messages['funny-exaggerations'],
            usingFallback: true,
            messageCount: FALLBACK_DATA.messages['funny-exaggerations'].length
          },
          'cliche-ai-phrases': { 
            success: true, 
            messages: FALLBACK_DATA.messages['cliche-ai-phrases'],
            usingFallback: true,
            messageCount: FALLBACK_DATA.messages['cliche-ai-phrases'].length
          },
          'cliche-ai-things': { 
            success: true, 
            messages: FALLBACK_DATA.messages['cliche-ai-things'],
            usingFallback: true,
            messageCount: FALLBACK_DATA.messages['cliche-ai-things'].length
          }
        },
        validation: null,
        summary: {
          configLoaded: true,
          configUsingFallback: true,
          messagesLoaded: true,
          totalMessages: Object.values(FALLBACK_DATA.messages)
            .reduce((sum, msgs) => sum + msgs.length, 0),
          messageTypesUsingFallback: 3,
          validationPassed: false
        },
        logger: logger.getErrorSummary(),
        error: error.message,
        emergencyFallback: true
      };
    }
    
    throw error;
  }
}

/**
 * Gets specific configuration value with fallback
 * @param {string} path - Dot-notation path to config value
 * @param {*} defaultValue - Default value if path not found
 * @returns {Promise<*>} - Configuration value
 */
export async function getConfigValue(path, defaultValue = null) {
  try {
    const config = await loadGlobalConfig();
    
    const pathParts = path.split('.');
    let value = config;
    
    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        logger.logWarning('ConfigValue', `Path not found: ${path}, using default`);
        return defaultValue;
      }
    }
    
    return value;
  } catch (error) {
    logger.logError('ConfigValue', `Failed to get config value: ${path}`, {
      error: error.message
    });
    return defaultValue;
  }
}

/**
 * Clears all data caches (useful for testing or development)
 */
export function clearDataCache() {
  dataCache.globalConfig = null;
  dataCache.messages = {};
  dataCache.lastLoaded = {};
  logger.logInfo('DataLoader', 'Data cache cleared');
}

/**
 * Gets data loading statistics and health information
 * @returns {Object} - Data loading health information
 */
export function getDataLoadingHealth() {
  const now = Date.now();
  const errorSummary = logger.getErrorSummary();
  
  return {
    cache: {
      globalConfigCached: !!dataCache.globalConfig,
      messageTypesCached: Object.keys(dataCache.messages).length,
      lastConfigLoad: dataCache.lastLoaded.globalConfig || null,
      cacheAge: dataCache.lastLoaded.globalConfig 
        ? now - dataCache.lastLoaded.globalConfig 
        : null
    },
    errors: errorSummary,
    health: {
      status: errorSummary.totalErrors === 0 ? 'healthy' : 'degraded',
      uptime: errorSummary.sessionDuration,
      lastError: errorSummary.errors.length > 0 
        ? errorSummary.errors[errorSummary.errors.length - 1]
        : null
    }
  };
}

/**
 * Export the logger for external access
 */
export { logger as dataLoadingLogger };