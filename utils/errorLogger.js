/**
 * Enhanced error logging utility for mode loading system
 * Provides detailed error tracking, categorization, and debugging information
 */

// Import file logger for persistent logging (only in Node.js environment)
let fileErrorLogger = null;
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  try {
    const fileLoggerModule = await import('./fileErrorLogger.js');
    fileErrorLogger = fileLoggerModule.fileErrorLogger;
  } catch (error) {
    console.warn('File logging not available:', error.message);
  }
}

/**
 * Error severity levels
 */
export const ERROR_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

/**
 * Error categories for better organization
 */
export const ERROR_CATEGORIES = {
  NETWORK: 'NETWORK',
  MODULE_LOADING: 'MODULE_LOADING',
  VALIDATION: 'VALIDATION',
  WEBGL: 'WEBGL',
  MEMORY: 'MEMORY',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN'
};

/**
 * Enhanced error logger class
 */
export class ErrorLogger {
  constructor(config = {}) {
    this.config = {
      maxLogEntries: 100,
      enableConsoleLogging: true,
      enableSessionStorage: true,
      enablePerformanceTracking: true,
      logLevel: ERROR_LEVELS.LOW,
      ...config
    };
    
    this.errorLog = [];
    this.errorCounts = new Map();
    this.sessionKey = 'modeLoaderErrorLog';
    
    // Initialize from session storage if available
    this.loadFromSessionStorage();
  }

  /**
   * Categorize error based on message and context
   */
  categorizeError(error, context = {}) {
    const message = (error.message || error.toString()).toLowerCase();
    const stack = error.stack || '';
    
    if (message.includes('network') || message.includes('fetch') || message.includes('err_network')) {
      return ERROR_CATEGORIES.NETWORK;
    }
    
    if (message.includes('module') || message.includes('import') || message.includes('chunk')) {
      return ERROR_CATEGORIES.MODULE_LOADING;
    }
    
    if (message.includes('validation') || message.includes('interface') || message.includes('export')) {
      return ERROR_CATEGORIES.VALIDATION;
    }
    
    if (message.includes('webgl') || message.includes('three') || message.includes('canvas')) {
      return ERROR_CATEGORIES.WEBGL;
    }
    
    if (message.includes('memory') || message.includes('heap')) {
      return ERROR_CATEGORIES.MEMORY;
    }
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return ERROR_CATEGORIES.TIMEOUT;
    }
    
    return ERROR_CATEGORIES.UNKNOWN;
  }

  /**
   * Determine error severity
   */
  determineSeverity(error, category, context = {}) {
    // Critical errors that break core functionality
    if (category === ERROR_CATEGORIES.WEBGL && context.isDefaultMode) {
      return ERROR_LEVELS.CRITICAL;
    }
    
    if (category === ERROR_CATEGORIES.MEMORY) {
      return ERROR_LEVELS.HIGH;
    }
    
    // High severity for repeated failures
    const errorKey = `${category}-${error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;
    if (count >= 3) {
      return ERROR_LEVELS.HIGH;
    }
    
    // Medium severity for module loading issues
    if (category === ERROR_CATEGORIES.MODULE_LOADING || category === ERROR_CATEGORIES.VALIDATION) {
      return ERROR_LEVELS.MEDIUM;
    }
    
    // Network and timeout errors are usually temporary
    if (category === ERROR_CATEGORIES.NETWORK || category === ERROR_CATEGORIES.TIMEOUT) {
      return ERROR_LEVELS.LOW;
    }
    
    return ERROR_LEVELS.MEDIUM;
  }

  /**
   * Collect system information for debugging
   */
  collectSystemInfo() {
    const info = {
      timestamp: new Date().toISOString()
    };

    // Browser-specific information
    if (typeof window !== 'undefined') {
      info.userAgent = navigator.userAgent;
      info.url = window.location.href;
      info.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      info.screen = {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      };
    } else {
      // Node.js environment
      info.platform = process.platform;
      info.nodeVersion = process.version;
      info.arch = process.arch;
    }

    // Memory information if available
    if (performance.memory) {
      info.memory = {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }

    // WebGL information (browser only)
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          info.webgl = {
            version: gl.getParameter(gl.VERSION),
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
          };
        } else {
          info.webgl = { supported: false };
        }
      } catch (e) {
        info.webgl = { supported: false, error: e.message };
      }
    }

    // Performance timing if available (browser only)
    if (typeof performance !== 'undefined' && performance.timing) {
      const timing = performance.timing;
      info.performance = {
        pageLoadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        connectTime: timing.connectEnd - timing.connectStart
      };
    }

    return info;
  }

  /**
   * Log error with comprehensive context
   */
  logError(error, context = {}) {
    const category = this.categorizeError(error, context);
    const severity = this.determineSeverity(error, category, context);
    const systemInfo = this.collectSystemInfo();
    
    // Update error count
    const errorKey = `${category}-${error.message}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);
    
    const logEntry = {
      id: this.generateErrorId(),
      timestamp: Date.now(),
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack,
        originalError: error.originalError ? {
          message: error.originalError.message,
          name: error.originalError.name
        } : null
      },
      category,
      severity,
      context: {
        mode: context.mode,
        operation: context.operation,
        retryCount: context.retryCount || 0,
        component: context.component,
        ...context
      },
      systemInfo,
      errorCount: this.errorCounts.get(errorKey)
    };

    // Add to log
    this.errorLog.push(logEntry);
    
    // Maintain log size limit
    if (this.errorLog.length > this.config.maxLogEntries) {
      this.errorLog.shift();
    }

    // Console logging
    if (this.config.enableConsoleLogging) {
      this.logToConsole(logEntry);
    }

    // Session storage
    if (this.config.enableSessionStorage) {
      this.saveToSessionStorage();
    }

    // File logging (if available)
    if (fileErrorLogger && typeof window === 'undefined') {
      try {
        fileErrorLogger.writeDailyError(error, context);
        
        // Write mode-specific error if mode is specified
        if (context.mode) {
          fileErrorLogger.writeModeError(context.mode, error, context);
        }
        
        // Write crash report for critical errors
        if (severity === 'CRITICAL') {
          fileErrorLogger.writeCrashReport(error, context);
        }
      } catch (fileError) {
        console.warn('Failed to write error to file:', fileError);
      }
    }

    return logEntry;
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log to console with appropriate formatting
   */
  logToConsole(logEntry) {
    const { error, category, severity, context } = logEntry;
    
    const severityEmoji = {
      [ERROR_LEVELS.LOW]: '⚠️',
      [ERROR_LEVELS.MEDIUM]: '🚨',
      [ERROR_LEVELS.HIGH]: '💥',
      [ERROR_LEVELS.CRITICAL]: '🔥'
    };

    const categoryColor = {
      [ERROR_CATEGORIES.NETWORK]: '#ff9500',
      [ERROR_CATEGORIES.MODULE_LOADING]: '#ff3b30',
      [ERROR_CATEGORIES.VALIDATION]: '#ffcc00',
      [ERROR_CATEGORIES.WEBGL]: '#5856d6',
      [ERROR_CATEGORIES.MEMORY]: '#ff2d92',
      [ERROR_CATEGORIES.TIMEOUT]: '#ff9500',
      [ERROR_CATEGORIES.UNKNOWN]: '#8e8e93'
    };

    console.group(`${severityEmoji[severity]} ModeLoader Error - ${category} (${severity})`);
    
    console.log(`%c${error.message}`, `color: ${categoryColor[category]}; font-weight: bold;`);
    
    if (context.mode) {
      console.log(`Mode: ${context.mode}`);
    }
    
    if (context.operation) {
      console.log(`Operation: ${context.operation}`);
    }
    
    if (context.retryCount > 0) {
      console.log(`Retry Count: ${context.retryCount}`);
    }
    
    if (logEntry.errorCount > 1) {
      console.warn(`This error has occurred ${logEntry.errorCount} times`);
    }
    
    console.log('Full Error Details:', logEntry);
    
    if (error.stack) {
      console.log('Stack Trace:', error.stack);
    }
    
    console.groupEnd();
  }

  /**
   * Save error log to session storage
   */
  saveToSessionStorage() {
    try {
      // Only use session storage in browser environment
      if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        const logData = {
          errors: this.errorLog.slice(-50), // Keep last 50 errors
          errorCounts: Array.from(this.errorCounts.entries()),
          lastUpdated: Date.now()
        };
        sessionStorage.setItem(this.sessionKey, JSON.stringify(logData));
      }
    } catch (e) {
      console.warn('Failed to save error log to session storage:', e);
    }
  }

  /**
   * Load error log from session storage
   */
  loadFromSessionStorage() {
    try {
      // Only use session storage in browser environment
      if (typeof window !== 'undefined' && typeof sessionStorage !== 'undefined') {
        const stored = sessionStorage.getItem(this.sessionKey);
        if (stored) {
          const logData = JSON.parse(stored);
          this.errorLog = logData.errors || [];
          this.errorCounts = new Map(logData.errorCounts || []);
        }
      }
    } catch (e) {
      console.warn('Failed to load error log from session storage:', e);
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errorLog.length,
      errorsByCategory: {},
      errorsBySeverity: {},
      recentErrors: this.errorLog.slice(-10),
      topErrors: []
    };

    // Count by category and severity
    this.errorLog.forEach(entry => {
      stats.errorsByCategory[entry.category] = (stats.errorsByCategory[entry.category] || 0) + 1;
      stats.errorsBySeverity[entry.severity] = (stats.errorsBySeverity[entry.severity] || 0) + 1;
    });

    // Top recurring errors
    const sortedErrors = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    stats.topErrors = sortedErrors.map(([key, count]) => ({ error: key, count }));

    return stats;
  }

  /**
   * Clear error log
   */
  clearLog() {
    this.errorLog = [];
    this.errorCounts.clear();
    
    if (this.config.enableSessionStorage) {
      sessionStorage.removeItem(this.sessionKey);
    }
    
    console.log('Error log cleared');
  }

  /**
   * Export error log for debugging
   */
  exportLog() {
    return {
      errors: this.errorLog,
      stats: this.getErrorStats(),
      config: this.config,
      exportedAt: new Date().toISOString()
    };
  }
}

/**
 * Global error logger instance
 */
export const modeLoaderErrorLogger = new ErrorLogger({
  maxLogEntries: 100,
  enableConsoleLogging: true,
  enableSessionStorage: true,
  logLevel: ERROR_LEVELS.LOW
});

/**
 * Convenience function for logging mode loading errors
 */
export function logModeError(error, context = {}) {
  return modeLoaderErrorLogger.logError(error, {
    operation: 'mode_loading',
    ...context
  });
}

/**
 * Convenience function for logging component errors
 */
export function logComponentError(error, component, context = {}) {
  return modeLoaderErrorLogger.logError(error, {
    operation: 'component_loading',
    component,
    ...context
  });
}

/**
 * Convenience function for logging validation errors
 */
export function logValidationError(error, context = {}) {
  return modeLoaderErrorLogger.logError(error, {
    operation: 'validation',
    ...context
  });
}

// Export default logger
export default modeLoaderErrorLogger;