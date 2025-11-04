/**
 * File-based error logging system for VibeScreen
 * Writes detailed error logs to files for debugging and diagnosis
 */

import { writeFileSync, existsSync, mkdirSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';

/**
 * File-based error logger that writes to the logs directory
 */
export class FileErrorLogger {
  constructor(config = {}) {
    this.config = {
      logsDir: 'logs',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 10,
      enableFileLogging: true,
      ...config
    };
    
    this.ensureLogsDirectory();
  }

  /**
   * Ensure logs directory exists
   */
  ensureLogsDirectory() {
    try {
      if (!existsSync(this.config.logsDir)) {
        mkdirSync(this.config.logsDir, { recursive: true });
      }
      
      // Create subdirectories
      const subdirs = ['crash-reports', 'mode-errors', 'performance'];
      subdirs.forEach(subdir => {
        const path = join(this.config.logsDir, subdir);
        if (!existsSync(path)) {
          mkdirSync(path, { recursive: true });
        }
      });
    } catch (error) {
      console.warn('Failed to create logs directory:', error);
    }
  }

  /**
   * Get current date string for file naming
   */
  getDateString() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Get timestamp string
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Write error to daily log file
   */
  writeDailyError(error, context = {}) {
    if (!this.config.enableFileLogging) return;

    try {
      const filename = `error-${this.getDateString()}.json`;
      const filepath = join(this.config.logsDir, filename);
      
      const errorEntry = {
        timestamp: this.getTimestamp(),
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        },
        context,
        systemInfo: this.getSystemInfo()
      };

      // Read existing file or create new array
      let errors = [];
      if (existsSync(filepath)) {
        try {
          const content = readFileSync(filepath, 'utf8');
          errors = JSON.parse(content);
        } catch (parseError) {
          console.warn('Failed to parse existing error log:', parseError);
        }
      }

      // Add new error
      errors.push(errorEntry);

      // Write back to file
      writeFileSync(filepath, JSON.stringify(errors, null, 2));
      
      console.log(`📝 Error logged to: ${filepath}`);
      
    } catch (fileError) {
      console.warn('Failed to write error to file:', fileError);
    }
  }

  /**
   * Write mode-specific error
   */
  writeModeError(modeName, error, context = {}) {
    if (!this.config.enableFileLogging) return;

    try {
      const filename = 'mode-loading-errors.json';
      const filepath = join(this.config.logsDir, 'mode-errors', filename);
      
      const errorEntry = {
        timestamp: this.getTimestamp(),
        mode: modeName,
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        },
        context,
        retryCount: context.retryCount || 0,
        systemInfo: this.getSystemInfo()
      };

      // Read existing file or create new object
      let modeErrors = {};
      if (existsSync(filepath)) {
        try {
          const content = readFileSync(filepath, 'utf8');
          modeErrors = JSON.parse(content);
        } catch (parseError) {
          console.warn('Failed to parse existing mode error log:', parseError);
        }
      }

      // Initialize mode array if it doesn't exist
      if (!modeErrors[modeName]) {
        modeErrors[modeName] = [];
      }

      // Add new error
      modeErrors[modeName].push(errorEntry);

      // Keep only last 20 errors per mode
      if (modeErrors[modeName].length > 20) {
        modeErrors[modeName] = modeErrors[modeName].slice(-20);
      }

      // Write back to file
      writeFileSync(filepath, JSON.stringify(modeErrors, null, 2));
      
      console.log(`📝 Mode error logged: ${modeName} → ${filepath}`);
      
    } catch (fileError) {
      console.warn('Failed to write mode error to file:', fileError);
    }
  }

  /**
   * Write performance issue
   */
  writePerformanceIssue(issue, metrics = {}) {
    if (!this.config.enableFileLogging) return;

    try {
      const filename = 'performance-issues.json';
      const filepath = join(this.config.logsDir, 'performance', filename);
      
      const performanceEntry = {
        timestamp: this.getTimestamp(),
        issue,
        metrics,
        systemInfo: this.getSystemInfo()
      };

      // Read existing file or create new array
      let issues = [];
      if (existsSync(filepath)) {
        try {
          const content = readFileSync(filepath, 'utf8');
          issues = JSON.parse(content);
        } catch (parseError) {
          console.warn('Failed to parse existing performance log:', parseError);
        }
      }

      // Add new issue
      issues.push(performanceEntry);

      // Keep only last 50 performance issues
      if (issues.length > 50) {
        issues = issues.slice(-50);
      }

      // Write back to file
      writeFileSync(filepath, JSON.stringify(issues, null, 2));
      
      console.log(`📝 Performance issue logged: ${filepath}`);
      
    } catch (fileError) {
      console.warn('Failed to write performance issue to file:', fileError);
    }
  }

  /**
   * Write crash report for critical errors
   */
  writeCrashReport(error, context = {}) {
    if (!this.config.enableFileLogging) return;

    try {
      const timestamp = this.getTimestamp().replace(/[:.]/g, '-');
      const filename = `crash-${timestamp}.json`;
      const filepath = join(this.config.logsDir, 'crash-reports', filename);
      
      const crashReport = {
        timestamp: this.getTimestamp(),
        error: {
          message: error.message,
          name: error.name,
          stack: error.stack
        },
        context,
        systemInfo: this.getSystemInfo(),
        browserInfo: this.getBrowserInfo(),
        memoryInfo: this.getMemoryInfo(),
        webglInfo: this.getWebGLInfo()
      };

      // Write crash report
      writeFileSync(filepath, JSON.stringify(crashReport, null, 2));
      
      console.error(`💥 CRASH REPORT WRITTEN: ${filepath}`);
      
    } catch (fileError) {
      console.warn('Failed to write crash report:', fileError);
    }
  }

  /**
   * Write summary report
   */
  writeSummaryReport() {
    if (!this.config.enableFileLogging) return;

    try {
      const filename = `summary-${this.getDateString()}.json`;
      const filepath = join(this.config.logsDir, filename);
      
      const summary = {
        timestamp: this.getTimestamp(),
        date: this.getDateString(),
        errorCounts: this.getErrorCounts(),
        modeStatus: this.getModeStatus(),
        systemHealth: this.getSystemHealth(),
        recommendations: this.getRecommendations()
      };

      writeFileSync(filepath, JSON.stringify(summary, null, 2));
      
      console.log(`📊 Summary report written: ${filepath}`);
      
    } catch (fileError) {
      console.warn('Failed to write summary report:', fileError);
    }
  }

  /**
   * Get system information
   */
  getSystemInfo() {
    const info = {
      timestamp: this.getTimestamp(),
      platform: typeof process !== 'undefined' ? process.platform : 'browser',
      nodeVersion: typeof process !== 'undefined' ? process.version : null,
      arch: typeof process !== 'undefined' ? process.arch : null
    };

    // Browser-specific info
    if (typeof window !== 'undefined') {
      info.userAgent = navigator.userAgent;
      info.url = window.location.href;
      info.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
    }

    return info;
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    if (typeof window === 'undefined') return null;

    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      }
    };
  }

  /**
   * Get memory information
   */
  getMemoryInfo() {
    if (typeof performance === 'undefined' || !performance.memory) return null;

    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
    };
  }

  /**
   * Get WebGL information
   */
  getWebGLInfo() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return { supported: false };

      return {
        supported: true,
        version: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
      };
    } catch (error) {
      return { supported: false, error: error.message };
    }
  }

  /**
   * Get error counts from daily logs
   */
  getErrorCounts() {
    try {
      const filename = `error-${this.getDateString()}.json`;
      const filepath = join(this.config.logsDir, filename);
      
      if (!existsSync(filepath)) return { total: 0, byType: {} };

      const content = readFileSync(filepath, 'utf8');
      const errors = JSON.parse(content);
      
      const counts = { total: errors.length, byType: {} };
      
      errors.forEach(error => {
        const type = error.context.category || 'UNKNOWN';
        counts.byType[type] = (counts.byType[type] || 0) + 1;
      });

      return counts;
    } catch (error) {
      return { total: 0, byType: {}, error: error.message };
    }
  }

  /**
   * Get mode status from mode error logs
   */
  getModeStatus() {
    try {
      const filepath = join(this.config.logsDir, 'mode-errors', 'mode-loading-errors.json');
      
      if (!existsSync(filepath)) return { healthy: [], problematic: [] };

      const content = readFileSync(filepath, 'utf8');
      const modeErrors = JSON.parse(content);
      
      const status = { healthy: [], problematic: [] };
      
      Object.keys(modeErrors).forEach(mode => {
        const recentErrors = modeErrors[mode].filter(error => {
          const errorTime = new Date(error.timestamp);
          const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
          return errorTime > hourAgo;
        });

        if (recentErrors.length > 0) {
          status.problematic.push({
            mode,
            errorCount: recentErrors.length,
            lastError: recentErrors[recentErrors.length - 1].timestamp
          });
        } else {
          status.healthy.push(mode);
        }
      });

      return status;
    } catch (error) {
      return { healthy: [], problematic: [], error: error.message };
    }
  }

  /**
   * Get system health assessment
   */
  getSystemHealth() {
    const memory = this.getMemoryInfo();
    const webgl = this.getWebGLInfo();
    
    const health = {
      memory: memory ? (memory.used / memory.limit < 0.8 ? 'good' : 'warning') : 'unknown',
      webgl: webgl ? (webgl.supported ? 'good' : 'error') : 'unknown',
      overall: 'good'
    };

    if (health.memory === 'warning' || health.webgl === 'error') {
      health.overall = 'warning';
    }

    return health;
  }

  /**
   * Get recommendations based on error patterns
   */
  getRecommendations() {
    const recommendations = [];
    
    const errorCounts = this.getErrorCounts();
    const modeStatus = this.getModeStatus();
    
    if (errorCounts.total > 10) {
      recommendations.push('High error count detected. Consider investigating common failure patterns.');
    }
    
    if (modeStatus.problematic.length > 0) {
      recommendations.push(`Problematic modes detected: ${modeStatus.problematic.map(m => m.mode).join(', ')}`);
    }
    
    const memory = this.getMemoryInfo();
    if (memory && memory.used / memory.limit > 0.8) {
      recommendations.push('High memory usage detected. Consider optimizing Three.js scenes or clearing unused resources.');
    }

    return recommendations;
  }

  /**
   * Clean old log files
   */
  cleanOldLogs(daysToKeep = 7) {
    // Implementation for cleaning old log files
    console.log(`🧹 Cleaning logs older than ${daysToKeep} days`);
  }
}

/**
 * Global file error logger instance
 */
export const fileErrorLogger = new FileErrorLogger();

/**
 * Convenience functions for logging different types of errors
 */
export function logErrorToFile(error, context = {}) {
  fileErrorLogger.writeDailyError(error, context);
}

export function logModeErrorToFile(modeName, error, context = {}) {
  fileErrorLogger.writeModeError(modeName, error, context);
}

export function logPerformanceIssueToFile(issue, metrics = {}) {
  fileErrorLogger.writePerformanceIssue(issue, metrics);
}

export function logCrashReportToFile(error, context = {}) {
  fileErrorLogger.writeCrashReport(error, context);
}

export function generateSummaryReport() {
  fileErrorLogger.writeSummaryReport();
}

// Export default logger
export default fileErrorLogger;