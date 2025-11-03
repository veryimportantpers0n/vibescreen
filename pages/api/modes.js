/**
 * VibeScreen Modes API Endpoint
 * 
 * Provides mode discovery and metadata retrieval for the frontend.
 * Returns JSON array of all available personality modes with their configuration.
 */

import fs from 'fs/promises';
import path from 'path';

// In-memory cache for parsed configuration data
let modesCache = null;
let cacheTimestamp = null;
let cacheStats = {
  hits: 0,
  misses: 0,
  invalidations: 0,
  lastAccess: null
};

// Cache configuration
const CACHE_TTL_MS = process.env.MODES_CACHE_TTL_MS ? 
  parseInt(process.env.MODES_CACHE_TTL_MS, 10) : 
  (process.env.NODE_ENV === 'development' ? 5000 : 300000); // 5s dev, 5min prod
const CACHE_ENABLED = process.env.DISABLE_CACHE !== 'true';
const MAX_CACHE_SIZE = process.env.MAX_CACHE_SIZE ? parseInt(process.env.MAX_CACHE_SIZE, 10) : 1000;

/**
 * Enhanced error logging with context and file paths
 * @param {string} operation - The operation being performed
 * @param {string} context - Additional context (file path, mode ID, etc.)
 * @param {Error} error - The error object
 * @param {string} level - Log level: 'warn', 'error', 'info'
 */
function logError(operation, context, error, level = 'warn') {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    operation,
    context,
    error: {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }
  };
  
  const logMessage = `[${timestamp}] ${operation} failed for ${context}: ${error.message}`;
  
  if (level === 'error') {
    console.error(logMessage, errorInfo);
  } else if (level === 'warn') {
    console.warn(logMessage, errorInfo);
  } else {
    console.log(logMessage, errorInfo);
  }
}

/**
 * Checks if the cache is valid and not expired
 * @returns {boolean} True if cache is valid and fresh
 */
function isCacheValid() {
  if (!CACHE_ENABLED || !modesCache || !cacheTimestamp) {
    return false;
  }
  
  const now = Date.now();
  const cacheAge = now - cacheTimestamp;
  
  return cacheAge < CACHE_TTL_MS;
}

/**
 * Invalidates the cache and updates statistics
 * @param {string} reason - Reason for cache invalidation
 */
function invalidateCache(reason = 'manual') {
  if (modesCache) {
    console.log(`[${new Date().toISOString()}] Cache invalidated: ${reason}`);
    cacheStats.invalidations++;
  }
  
  modesCache = null;
  cacheTimestamp = null;
}

/**
 * Updates cache with new data and statistics
 * @param {Array} modes - Array of mode configurations to cache
 */
function updateCache(modes) {
  if (!CACHE_ENABLED) {
    return;
  }
  
  // Check cache size limits to prevent memory issues
  const cacheSize = JSON.stringify(modes).length;
  if (cacheSize > MAX_CACHE_SIZE * 1024) { // MAX_CACHE_SIZE in KB
    console.warn(`[${new Date().toISOString()}] Cache size ${Math.round(cacheSize/1024)}KB exceeds limit ${MAX_CACHE_SIZE}KB, not caching`);
    return;
  }
  
  modesCache = modes;
  cacheTimestamp = Date.now();
  cacheStats.misses++;
  
  console.log(`[${new Date().toISOString()}] Cache updated with ${modes.length} modes (${Math.round(cacheSize/1024)}KB)`);
}

/**
 * Retrieves modes from cache if valid
 * @returns {Array|null} Cached modes array or null if cache invalid
 */
function getCachedModes() {
  if (!CACHE_ENABLED) {
    return null;
  }
  
  if (isCacheValid()) {
    cacheStats.hits++;
    cacheStats.lastAccess = Date.now();
    console.log(`[${new Date().toISOString()}] Cache hit: returning ${modesCache.length} modes`);
    return modesCache;
  }
  
  return null;
}

/**
 * Discovers available modes by scanning the modes directory
 * @returns {Promise<Array>} Array of mode configurations
 */
async function discoverModes() {
  // Check cache first for performance optimization
  const cachedModes = getCachedModes();
  if (cachedModes) {
    return cachedModes;
  }
  
  const modesPath = path.join(process.cwd(), 'modes');
  
  try {
    // Check if modes directory exists
    await fs.access(modesPath);
  } catch (error) {
    // This is expected behavior when modes directory doesn't exist
    logError('Directory access check', modesPath, error, 'info');
    return [];
  }
  
  let entries;
  try {
    // Read all entries in the modes directory
    entries = await fs.readdir(modesPath, { withFileTypes: true });
  } catch (error) {
    // Log detailed error for directory reading issues
    logError('Directory reading', modesPath, error, 'error');
    return [];
  }
  
  // Filter for directories only with error handling
  let modeDirectories;
  try {
    modeDirectories = entries
      .filter(entry => {
        try {
          return entry.isDirectory();
        } catch (error) {
          logError('Directory type check', `${modesPath}/${entry.name}`, error, 'warn');
          return false;
        }
      })
      .map(entry => entry.name);
    
    console.log(`[${new Date().toISOString()}] Found ${modeDirectories.length} mode directories:`, modeDirectories);
  } catch (error) {
    logError('Directory filtering', modesPath, error, 'error');
    return [];
  }
  
  // Load configuration for each mode directory with comprehensive error handling
  // Use Promise.allSettled for better performance with concurrent loading
  const modes = [];
  const loadErrors = [];
  
  const loadPromises = modeDirectories.map(async (modeId) => {
    try {
      const modeConfig = await loadModeConfig(modeId);
      return { modeId, config: modeConfig, success: true };
    } catch (error) {
      logError('Mode loading', modeId, error, 'error');
      return { modeId, error: error.message, success: false };
    }
  });
  
  const results = await Promise.allSettled(loadPromises);
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { modeId, config, success, error } = result.value;
      if (success && config) {
        modes.push(config);
        console.log(`[${new Date().toISOString()}] Successfully loaded mode: ${modeId}`);
      } else {
        loadErrors.push({ modeId, reason: error || 'Configuration validation failed' });
      }
    } else {
      // Promise was rejected
      loadErrors.push({ modeId: 'unknown', reason: result.reason?.message || 'Promise rejected' });
      logError('Mode loading promise', 'Promise.allSettled', result.reason, 'error');
    }
  }
  
  // Log summary of loading results
  if (loadErrors.length > 0) {
    console.warn(`[${new Date().toISOString()}] Failed to load ${loadErrors.length} modes:`, 
      loadErrors.map(e => `${e.modeId} (${e.reason})`).join(', '));
  }
  
  console.log(`[${new Date().toISOString()}] Successfully loaded ${modes.length} out of ${modeDirectories.length} modes`);
  
  // Update cache with discovered modes for performance optimization
  updateCache(modes);
  
  return modes;
}

/**
 * Loads and validates configuration for a specific mode
 * @param {string} modeId - The mode directory name
 * @returns {Promise<Object|null>} Mode configuration object or null if invalid
 */
async function loadModeConfig(modeId) {
  // Validate modeId parameter
  if (!modeId || typeof modeId !== 'string' || modeId.trim().length === 0) {
    logError('Mode ID validation', 'loadModeConfig', new Error('Invalid or empty mode ID'), 'error');
    return null;
  }
  
  // Sanitize modeId to prevent path traversal attacks
  const sanitizedModeId = modeId.replace(/[^a-zA-Z0-9\-_]/g, '');
  if (sanitizedModeId !== modeId) {
    logError('Mode ID sanitization', modeId, new Error('Mode ID contains invalid characters'), 'warn');
    return null;
  }
  
  const configPath = path.join(process.cwd(), 'modes', sanitizedModeId, 'config.json');
  
  // Check if config.json exists
  try {
    await fs.access(configPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      logError('Config file access', configPath, error, 'warn');
    } else {
      logError('Config file access', configPath, error, 'error');
    }
    return null;
  }
  
  // Read the configuration file
  let configData;
  try {
    configData = await fs.readFile(configPath, 'utf8');
  } catch (error) {
    logError('Config file reading', configPath, error, 'error');
    return null;
  }
  
  // Parse JSON with detailed error handling
  let config;
  try {
    config = JSON.parse(configData);
  } catch (error) {
    // Enhanced JSON parsing error with context
    const parseError = new Error(`JSON parsing failed: ${error.message}. File content length: ${configData.length} characters`);
    parseError.code = 'JSON_PARSE_ERROR';
    parseError.originalError = error;
    parseError.fileContent = configData.substring(0, 200); // First 200 chars for debugging
    
    logError('JSON parsing', configPath, parseError, 'error');
    return null;
  }
  
  // Validate and sanitize the configuration
  try {
    const validatedConfig = validateModeConfig(config, sanitizedModeId, configPath);
    return validatedConfig;
  } catch (error) {
    logError('Config validation', configPath, error, 'error');
    return null;
  }
}

/**
 * Validates and sanitizes mode configuration data
 * @param {Object} config - Raw configuration object
 * @param {string} modeId - Mode identifier
 * @param {string} configPath - Path to config file for error context
 * @returns {Object} Validated configuration object
 */
function validateModeConfig(config, modeId, configPath = '') {
  // Ensure config is an object with detailed error context
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    const error = new Error(`Invalid config object type: ${typeof config}${Array.isArray(config) ? ' (array)' : ''}`);
    logError('Config object validation', `${configPath} (mode: ${modeId})`, error, 'warn');
    config = {};
  }
  
  // Generate default name from modeId if not provided
  const defaultName = modeId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Validate and sanitize name field with detailed logging
  let name = defaultName;
  if (config.name !== undefined) {
    if (typeof config.name === 'string' && config.name.trim().length > 0) {
      name = config.name.trim();
      // Ensure name is reasonable length
      if (name.length > 50) {
        const originalName = name;
        name = name.substring(0, 50).trim();
        const error = new Error(`Name too long (${originalName.length} chars), truncated to: "${name}"`);
        logError('Name validation', `${configPath} (mode: ${modeId})`, error, 'warn');
      }
    } else {
      const error = new Error(`Invalid name type or empty: ${typeof config.name} "${config.name}"`);
      logError('Name validation', `${configPath} (mode: ${modeId})`, error, 'warn');
    }
  }
  
  // Validate and sanitize popupStyle field with enhanced error reporting
  const validPopupStyles = ['overlay', 'speechBubble'];
  let popupStyle = 'overlay';
  if (config.popupStyle !== undefined) {
    if (typeof config.popupStyle === 'string') {
      const normalizedStyle = config.popupStyle.trim();
      if (validPopupStyles.includes(normalizedStyle)) {
        popupStyle = normalizedStyle;
      } else {
        const error = new Error(`Invalid popupStyle "${config.popupStyle}". Valid options: ${validPopupStyles.join(', ')}`);
        logError('PopupStyle validation', `${configPath} (mode: ${modeId})`, error, 'warn');
      }
    } else {
      const error = new Error(`Invalid popupStyle type: ${typeof config.popupStyle} "${config.popupStyle}"`);
      logError('PopupStyle validation', `${configPath} (mode: ${modeId})`, error, 'warn');
    }
  }
  
  // Validate and sanitize timing fields with comprehensive error reporting
  let minDelaySeconds = 15;
  if (config.minDelaySeconds !== undefined) {
    if (typeof config.minDelaySeconds === 'number' && !isNaN(config.minDelaySeconds) && isFinite(config.minDelaySeconds)) {
      const originalValue = config.minDelaySeconds;
      minDelaySeconds = Math.max(5, Math.min(300, Math.floor(config.minDelaySeconds)));
      if (minDelaySeconds !== originalValue) {
        const error = new Error(`minDelaySeconds ${originalValue} clamped to valid range [5, 300]: ${minDelaySeconds}`);
        logError('MinDelaySeconds validation', `${configPath} (mode: ${modeId})`, error, 'warn');
      }
    } else {
      const error = new Error(`Invalid minDelaySeconds: ${typeof config.minDelaySeconds} "${config.minDelaySeconds}"`);
      logError('MinDelaySeconds validation', `${configPath} (mode: ${modeId})`, error, 'warn');
    }
  }
  
  let maxDelaySeconds = 45;
  if (config.maxDelaySeconds !== undefined) {
    if (typeof config.maxDelaySeconds === 'number' && !isNaN(config.maxDelaySeconds) && isFinite(config.maxDelaySeconds)) {
      const originalValue = config.maxDelaySeconds;
      maxDelaySeconds = Math.max(10, Math.min(600, Math.floor(config.maxDelaySeconds)));
      if (maxDelaySeconds !== originalValue) {
        const error = new Error(`maxDelaySeconds ${originalValue} clamped to valid range [10, 600]: ${maxDelaySeconds}`);
        logError('MaxDelaySeconds validation', `${configPath} (mode: ${modeId})`, error, 'warn');
      }
    } else {
      const error = new Error(`Invalid maxDelaySeconds: ${typeof config.maxDelaySeconds} "${config.maxDelaySeconds}"`);
      logError('MaxDelaySeconds validation', `${configPath} (mode: ${modeId})`, error, 'warn');
    }
  }
  
  // Ensure maxDelaySeconds is greater than minDelaySeconds with detailed logging
  if (maxDelaySeconds <= minDelaySeconds) {
    const originalMax = maxDelaySeconds;
    maxDelaySeconds = minDelaySeconds + 5;
    const error = new Error(`maxDelaySeconds (${originalMax}) must be > minDelaySeconds (${minDelaySeconds}). Adjusted to ${maxDelaySeconds}`);
    logError('Timing validation', `${configPath} (mode: ${modeId})`, error, 'warn');
  }
  
  // Validate and sanitize messageProbabilities with comprehensive error handling
  let messageProbabilities = {
    cliche: 0.6,
    exaggeration: 0.2,
    other: 0.2
  };
  
  if (config.messageProbabilities !== undefined) {
    if (config.messageProbabilities && typeof config.messageProbabilities === 'object' && !Array.isArray(config.messageProbabilities)) {
      const probs = config.messageProbabilities;
      let validProbs = {};
      let totalProb = 0;
      const invalidKeys = [];
      
      // Validate each probability value with detailed error reporting
      ['cliche', 'exaggeration', 'other'].forEach(key => {
        if (probs[key] !== undefined) {
          if (typeof probs[key] === 'number' && !isNaN(probs[key]) && isFinite(probs[key]) && probs[key] >= 0 && probs[key] <= 1) {
            validProbs[key] = probs[key];
            totalProb += probs[key];
          } else {
            invalidKeys.push(`${key}: ${typeof probs[key]} "${probs[key]}"`);
            validProbs[key] = messageProbabilities[key]; // Use default
          }
        } else {
          validProbs[key] = messageProbabilities[key]; // Use default
        }
      });
      
      // Log invalid probability values
      if (invalidKeys.length > 0) {
        const error = new Error(`Invalid probability values: ${invalidKeys.join(', ')}`);
        logError('MessageProbabilities validation', `${configPath} (mode: ${modeId})`, error, 'warn');
      }
      
      // Normalize probabilities if they don't sum to 1.0 (within tolerance)
      if (Math.abs(totalProb - 1.0) > 0.01) {
        if (totalProb > 0) {
          // Normalize to sum to 1.0
          const originalProbs = { ...validProbs };
          Object.keys(validProbs).forEach(key => {
            validProbs[key] = validProbs[key] / totalProb;
          });
          const error = new Error(`Probabilities sum to ${totalProb.toFixed(3)}, normalized from ${JSON.stringify(originalProbs)} to ${JSON.stringify(validProbs)}`);
          logError('MessageProbabilities normalization', `${configPath} (mode: ${modeId})`, error, 'warn');
        } else {
          // All probabilities were 0 or invalid, use defaults
          validProbs = messageProbabilities;
          const error = new Error('All probabilities were 0 or invalid, using defaults');
          logError('MessageProbabilities validation', `${configPath} (mode: ${modeId})`, error, 'warn');
        }
      }
      
      messageProbabilities = validProbs;
    } else {
      const error = new Error(`Invalid messageProbabilities type: ${typeof config.messageProbabilities}${Array.isArray(config.messageProbabilities) ? ' (array)' : ''}`);
      logError('MessageProbabilities validation', `${configPath} (mode: ${modeId})`, error, 'warn');
    }
  }
  
  // Validate and sanitize sceneProps with error context
  let sceneProps = {};
  if (config.sceneProps !== undefined) {
    if (config.sceneProps && typeof config.sceneProps === 'object' && config.sceneProps !== null && !Array.isArray(config.sceneProps)) {
      try {
        sceneProps = sanitizeSceneProps(config.sceneProps, modeId, configPath);
      } catch (error) {
        logError('SceneProps sanitization', `${configPath} (mode: ${modeId})`, error, 'warn');
        sceneProps = {};
      }
    } else {
      const error = new Error(`Invalid sceneProps type: ${typeof config.sceneProps}${Array.isArray(config.sceneProps) ? ' (array)' : config.sceneProps === null ? ' (null)' : ''}`);
      logError('SceneProps validation', `${configPath} (mode: ${modeId})`, error, 'warn');
    }
  }
  
  // Return validated configuration object matching the established schema
  return {
    id: modeId,
    name: name,
    popupStyle: popupStyle,
    minDelaySeconds: minDelaySeconds,
    maxDelaySeconds: maxDelaySeconds,
    messageProbabilities: messageProbabilities,
    sceneProps: sceneProps
  };
}

/**
 * Sanitizes scene properties object
 * @param {Object} sceneProps - Raw scene properties
 * @param {string} modeId - Mode identifier for logging
 * @param {string} configPath - Path to config file for error context
 * @returns {Object} Sanitized scene properties
 */
function sanitizeSceneProps(sceneProps, modeId, configPath = '') {
  const sanitized = {};
  
  // Validate bgColor if present with enhanced error reporting
  if (sceneProps.bgColor !== undefined) {
    if (typeof sceneProps.bgColor === 'string' && sceneProps.bgColor.trim().length > 0) {
      const color = sceneProps.bgColor.trim();
      // Basic hex color validation
      if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(color)) {
        sanitized.bgColor = color;
      } else {
        const error = new Error(`Invalid bgColor format "${sceneProps.bgColor}". Expected hex format like #fff or #ffffff`);
        logError('SceneProps bgColor validation', `${configPath} (mode: ${modeId})`, error, 'warn');
      }
    } else {
      const error = new Error(`Invalid bgColor type: ${typeof sceneProps.bgColor} "${sceneProps.bgColor}"`);
      logError('SceneProps bgColor validation', `${configPath} (mode: ${modeId})`, error, 'warn');
    }
  }
  
  // Validate ambientSpeed if present with detailed error reporting
  if (sceneProps.ambientSpeed !== undefined) {
    if (typeof sceneProps.ambientSpeed === 'number' && !isNaN(sceneProps.ambientSpeed) && isFinite(sceneProps.ambientSpeed)) {
      // Clamp ambient speed to reasonable range
      const originalSpeed = sceneProps.ambientSpeed;
      sanitized.ambientSpeed = Math.max(0.1, Math.min(5.0, sceneProps.ambientSpeed));
      if (sanitized.ambientSpeed !== originalSpeed) {
        const error = new Error(`ambientSpeed ${originalSpeed} clamped to valid range [0.1, 5.0]: ${sanitized.ambientSpeed}`);
        logError('SceneProps ambientSpeed validation', `${configPath} (mode: ${modeId})`, error, 'warn');
      }
    } else {
      const error = new Error(`Invalid ambientSpeed: ${typeof sceneProps.ambientSpeed} "${sceneProps.ambientSpeed}"`);
      logError('SceneProps ambientSpeed validation', `${configPath} (mode: ${modeId})`, error, 'warn');
    }
  }
  
  // Copy other valid properties (strings, numbers, booleans only) with comprehensive validation
  Object.keys(sceneProps).forEach(key => {
    if (key !== 'bgColor' && key !== 'ambientSpeed') {
      const value = sceneProps[key];
      const valueType = typeof value;
      
      try {
        if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
          // Additional validation for strings
          if (valueType === 'string') {
            if (value.length <= 100) { // Reasonable string length limit
              sanitized[key] = value;
            } else {
              const error = new Error(`Scene prop "${key}" too long (${value.length} chars, max 100)`);
              logError('SceneProps string validation', `${configPath} (mode: ${modeId})`, error, 'warn');
            }
          } else if (valueType === 'number') {
            if (!isNaN(value) && isFinite(value)) {
              sanitized[key] = value;
            } else {
              const error = new Error(`Invalid number value for scene prop "${key}": ${value}`);
              logError('SceneProps number validation', `${configPath} (mode: ${modeId})`, error, 'warn');
            }
          } else {
            sanitized[key] = value; // boolean
          }
        } else {
          const error = new Error(`Unsupported scene prop type "${valueType}" for "${key}": ${value}`);
          logError('SceneProps type validation', `${configPath} (mode: ${modeId})`, error, 'warn');
        }
      } catch (error) {
        logError('SceneProps property processing', `${configPath} (mode: ${modeId}, key: ${key})`, error, 'warn');
      }
    }
  });
  
  return sanitized;
}

export default async function handler(req, res) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const startTime = Date.now();
  
  // Set consistent headers for all responses (success and error)
  const setResponseHeaders = () => {
    // CORS headers for cross-origin compatibility (Requirement 5.1)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');
    
    // Content-Type header for JSON responses (Requirement 5.2)
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    
    // Cache control directives for performance (Requirement 5.3)
    const maxAge = process.env.NODE_ENV === 'development' ? 5 : 300; // 5s dev, 5min prod
    res.setHeader('Cache-Control', `public, max-age=${maxAge}, s-maxage=${maxAge}, must-revalidate`);
    
    // Additional headers for debugging and compatibility
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-API-Version', '1.0');
    res.setHeader('X-Powered-By', 'VibeScreen-API');
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Vary header for proper caching behavior
    res.setHeader('Vary', 'Accept-Encoding, Origin');
  };
  
  try {
    // Apply consistent headers to all responses
    setResponseHeaders();
    
    console.log(`[${new Date().toISOString()}] API Request ${requestId}: ${req.method} /api/modes`);
    
    // Handle preflight OPTIONS request with proper headers (Requirement 5.1, 5.5)
    if (req.method === 'OPTIONS') {
      // Additional CORS headers for preflight
      res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
      res.status(200).end();
      return;
    }
    
    // Handle cache invalidation via query parameter (for development/debugging)
    if (req.query && req.query.invalidateCache === 'true') {
      invalidateCache('query parameter');
    }
    
    // Handle cache status request
    if (req.query && req.query.cacheStatus === 'true') {
      const cacheStatus = {
        enabled: CACHE_ENABLED,
        valid: isCacheValid(),
        stats: cacheStats,
        config: {
          ttlMs: CACHE_TTL_MS,
          maxSizeKB: MAX_CACHE_SIZE
        },
        timestamp: new Date().toISOString(),
        requestId,
        status: 'success'
      };
      res.status(200).json(cacheStatus);
      return;
    }
    
    // Only allow GET method - this is a client error, not server error
    if (req.method !== 'GET') {
      // Add method-specific header for 405 responses (Requirement 5.4)
      res.setHeader('Allow', 'GET, OPTIONS');
      
      const response = {
        error: 'Method Not Allowed',
        message: `Method ${req.method} is not allowed. Only GET requests are supported.`,
        timestamp: new Date().toISOString(),
        requestId,
        modes: [],
        status: 'error',
        apiVersion: '1.0'
      };
      
      logError('HTTP method validation', `${req.method} /api/modes`, new Error(`Unsupported method: ${req.method}`), 'warn');
      res.status(405).json(response);
      return;
    }
    
    // Discover available modes by scanning the modes directory
    // This function handles all file system and configuration errors gracefully
    let modes;
    const discoveryStartTime = Date.now();
    
    try {
      modes = await discoverModes();
    } catch (error) {
      // Even if discoverModes throws, we treat this as a configuration issue, not a server error
      logError('Mode discovery', '/api/modes', error, 'error');
      modes = [];
    }
    
    const discoveryTime = Date.now() - discoveryStartTime;
    
    const processingTime = Date.now() - startTime;
    
    // Consistent response format for success (Requirement 5.4)
    const response = {
      modes,
      timestamp: new Date().toISOString(),
      status: 'success',
      requestId,
      processingTimeMs: processingTime,
      modesFound: modes.length,
      cache: CACHE_ENABLED ? {
        enabled: true,
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        invalidations: cacheStats.invalidations,
        lastAccess: cacheStats.lastAccess ? new Date(cacheStats.lastAccess).toISOString() : null,
        ttlMs: CACHE_TTL_MS,
        isHit: processingTime < 10, // Heuristic: cache hits are typically < 10ms
        discoveryTimeMs: discoveryTime
      } : { enabled: false, discoveryTimeMs: discoveryTime },
      apiVersion: '1.0'
    };
    
    // Add ETag for better caching (Requirement 5.3)
    const etag = `"${Buffer.from(JSON.stringify(modes)).toString('base64').substring(0, 16)}"`;
    res.setHeader('ETag', etag);
    
    // Handle conditional requests (Requirement 5.3)
    if (req.headers && req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    
    console.log(`[${new Date().toISOString()}] API Response ${requestId}: ${modes.length} modes, ${processingTime}ms`);
    
    // Always return 200 OK with modes array (even if empty)
    res.status(200).json(response);
    
  } catch (error) {
    // This catch block should only handle truly unexpected server errors
    // All configuration and file system errors should be handled gracefully above
    const processingTime = Date.now() - startTime;
    
    logError('Unexpected API error', `/api/modes (${requestId})`, error, 'error');
    
    // Ensure headers are set even for error responses (Requirement 5.4)
    try {
      setResponseHeaders();
    } catch (headerError) {
      console.error('Failed to set error response headers:', headerError);
    }
    
    // Consistent error response format (Requirement 5.4)
    const response = {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while processing the request.',
      timestamp: new Date().toISOString(),
      requestId,
      processingTimeMs: processingTime,
      modes: [],
      status: 'error',
      apiVersion: '1.0'
    };
    
    // Only return 500 for truly unexpected server errors
    // Configuration issues should never reach this point
    res.status(500).json(response);
  }
}