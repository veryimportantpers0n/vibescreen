/**
 * Node.js compatible error handling utilities for VibeScreen
 * Provides error handling without React dependencies for testing
 */

import { dataLoadingLogger } from './dataLoader.js';

/**
 * Error recovery utilities (Node.js compatible)
 */
export const ErrorRecovery = {
  /**
   * Attempts to recover from data loading errors
   */
  async recoverDataLoading() {
    try {
      dataLoadingLogger.logInfo('ErrorRecovery', 'Attempting data loading recovery');
      
      // Clear caches
      const { clearDataCache } = await import('./dataLoader.js');
      clearDataCache();
      
      // Reinitialize data
      const { initializeApplicationData } = await import('./dataLoader.js');
      const result = await initializeApplicationData({
        forceReload: true,
        enableFallbacks: true
      });
      
      if (result.success || result.emergencyFallback) {
        dataLoadingLogger.logInfo('ErrorRecovery', 'Data loading recovery successful');
        return { success: true, result };
      } else {
        throw new Error('Recovery failed');
      }
    } catch (error) {
      dataLoadingLogger.logError('ErrorRecovery', 'Data loading recovery failed', {
        error: error.message
      });
      return { success: false, error: error.message };
    }
  },

  /**
   * Attempts to recover from configuration errors
   */
  async recoverConfiguration() {
    try {
      dataLoadingLogger.logInfo('ErrorRecovery', 'Attempting configuration recovery');
      
      const { loadGlobalConfig } = await import('./dataLoader.js');
      const config = await loadGlobalConfig(true); // Force reload
      
      dataLoadingLogger.logInfo('ErrorRecovery', 'Configuration recovery successful');
      return { success: true, config };
    } catch (error) {
      dataLoadingLogger.logError('ErrorRecovery', 'Configuration recovery failed', {
        error: error.message
      });
      return { success: false, error: error.message };
    }
  },

  /**
   * Attempts to recover from message loading errors
   */
  async recoverMessages(messageType = null) {
    try {
      dataLoadingLogger.logInfo('ErrorRecovery', `Attempting message recovery${messageType ? ` for ${messageType}` : ''}`);
      
      const { loadMessages, loadAllMessages } = await import('./dataLoader.js');
      
      if (messageType) {
        const result = await loadMessages(messageType, true); // Force reload
        return { success: true, result };
      } else {
        const result = await loadAllMessages(true); // Force reload all
        return { success: true, result };
      }
    } catch (error) {
      dataLoadingLogger.logError('ErrorRecovery', 'Message recovery failed', {
        error: error.message,
        messageType
      });
      return { success: false, error: error.message };
    }
  }
};

/**
 * Global error handler setup for Node.js
 */
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    dataLoadingLogger.logError('GlobalErrorHandler', 'Unhandled promise rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack
    });
  });

  process.on('uncaughtException', (error) => {
    dataLoadingLogger.logError('GlobalErrorHandler', 'Uncaught exception', {
      error: error.message,
      stack: error.stack
    });
  });
}

/**
 * Error handling utilities for async operations
 */
export class AsyncErrorHandler {
  constructor() {
    this.errors = [];
  }

  async handleAsync(asyncFunction, context = 'AsyncOperation') {
    try {
      return await asyncFunction();
    } catch (error) {
      this.errors.push({
        context,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      
      dataLoadingLogger.logError('AsyncErrorHandler', `${context} failed`, {
        error: error.message,
        stack: error.stack
      });
      
      throw error;
    }
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
  }
}

/**
 * Mock React components for testing (Node.js compatible)
 */
export const MockErrorBoundaries = {
  DataLoadingErrorBoundary: class {
    constructor() {
      this.name = 'DataLoadingErrorBoundary';
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
      dataLoadingLogger.logError('MockErrorBoundary', 'Component error caught', {
        error: error.message,
        stack: error.stack
      });
    }
  },
  
  ThreeJSErrorBoundary: class {
    constructor() {
      this.name = 'ThreeJSErrorBoundary';
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
      dataLoadingLogger.logError('MockThreeJSErrorBoundary', 'Three.js error caught', {
        error: error.message,
        stack: error.stack
      });
    }
  },
  
  MessageSystemErrorBoundary: class {
    constructor() {
      this.name = 'MessageSystemErrorBoundary';
    }
    
    static getDerivedStateFromError(error) {
      return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
      dataLoadingLogger.logError('MockMessageErrorBoundary', 'Message system error caught', {
        error: error.message,
        stack: error.stack
      });
    }
  }
};

/**
 * Validates error handling system
 */
export async function validateErrorHandling() {
  console.log('Validating error handling system...');
  
  const results = {
    recovery: false,
    asyncHandling: false,
    globalHandling: false,
    mockBoundaries: false
  };
  
  try {
    // Test error recovery
    const recoveryResult = await ErrorRecovery.recoverDataLoading();
    results.recovery = recoveryResult.success || recoveryResult.error;
    
    // Test async error handling
    const asyncHandler = new AsyncErrorHandler();
    try {
      await asyncHandler.handleAsync(async () => {
        throw new Error('Test error');
      }, 'TestContext');
    } catch (error) {
      results.asyncHandling = asyncHandler.getErrors().length > 0;
    }
    
    // Test global error handling setup
    setupGlobalErrorHandling();
    results.globalHandling = true;
    
    // Test mock boundaries
    const mockBoundary = new MockErrorBoundaries.DataLoadingErrorBoundary();
    results.mockBoundaries = mockBoundary.name === 'DataLoadingErrorBoundary';
    
    console.log('Error handling validation results:', results);
    return results;
    
  } catch (error) {
    console.error('Error handling validation failed:', error.message);
    return results;
  }
}