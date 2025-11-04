/**
 * Retry mechanism utilities for mode loading with exponential backoff
 * Provides robust retry logic for network and loading failures
 */

/**
 * Retry configuration options
 */
export const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  jitter: true, // Add random jitter to prevent thundering herd
  retryableErrors: [
    'NetworkError',
    'TimeoutError',
    'Loading chunk',
    'Failed to fetch',
    'ERR_NETWORK',
    'ERR_INTERNET_DISCONNECTED',
    'ChunkLoadError'
  ]
};

/**
 * Enhanced retry mechanism with exponential backoff and jitter
 */
export class RetryMechanism {
  constructor(config = {}) {
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config };
    this.retryAttempts = new Map(); // Track retry attempts per operation
    this.activeRetries = new Set(); // Track active retry operations
  }

  /**
   * Check if an error is retryable based on error message or type
   */
  isRetryableError(error) {
    if (!error) return false;
    
    const errorMessage = (error.message || error.toString()).toLowerCase();
    const errorName = (error.name || '').toLowerCase();
    
    return this.config.retryableErrors.some(retryableError => 
      errorMessage.includes(retryableError.toLowerCase()) || 
      errorName.includes(retryableError.toLowerCase())
    );
  }

  /**
   * Calculate delay with exponential backoff and optional jitter
   */
  calculateDelay(attempt) {
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);
    const cappedDelay = Math.min(exponentialDelay, this.config.maxDelay);
    
    if (this.config.jitter) {
      // Add ±25% jitter to prevent thundering herd
      const jitterRange = cappedDelay * 0.25;
      const jitter = (Math.random() - 0.5) * 2 * jitterRange;
      return Math.max(0, cappedDelay + jitter);
    }
    
    return cappedDelay;
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry(operationId, operation, config = {}) {
    const mergedConfig = { ...this.config, ...config };
    const startTime = Date.now();
    
    // Check if this operation is already being retried
    if (this.activeRetries.has(operationId)) {
      throw new Error(`Operation ${operationId} is already being retried`);
    }

    this.activeRetries.add(operationId);
    
    try {
      // Get current retry count for this operation
      const currentAttempt = (this.retryAttempts.get(operationId) || 0) + 1;
      this.retryAttempts.set(operationId, currentAttempt);

      console.log(`🔄 Executing operation: ${operationId} (attempt ${currentAttempt}/${mergedConfig.maxRetries + 1})`);

      try {
        const result = await operation();
        
        // Success - reset retry count and cleanup
        this.retryAttempts.delete(operationId);
        this.activeRetries.delete(operationId);
        
        const duration = Date.now() - startTime;
        console.log(`✅ Operation ${operationId} succeeded after ${currentAttempt} attempt(s) in ${duration}ms`);
        
        return result;
        
      } catch (error) {
        console.error(`❌ Operation ${operationId} failed on attempt ${currentAttempt}:`, error);

        // Check if we should retry
        if (currentAttempt <= mergedConfig.maxRetries && this.isRetryableError(error)) {
          const delay = this.calculateDelay(currentAttempt);
          
          console.log(`⏳ Retrying operation ${operationId} in ${Math.round(delay)}ms (attempt ${currentAttempt + 1}/${mergedConfig.maxRetries + 1})`);
          
          // Wait for delay then retry
          await this.delay(delay);
          
          // Remove from active retries temporarily to allow recursive call
          this.activeRetries.delete(operationId);
          
          // Recursive retry
          return this.executeWithRetry(operationId, operation, config);
          
        } else {
          // Max retries reached or non-retryable error
          this.retryAttempts.delete(operationId);
          this.activeRetries.delete(operationId);
          
          const duration = Date.now() - startTime;
          const reason = currentAttempt > mergedConfig.maxRetries ? 'max retries exceeded' : 'non-retryable error';
          
          console.error(`💥 Operation ${operationId} failed permanently after ${currentAttempt} attempt(s) in ${duration}ms (${reason})`);
          
          // Enhance error with retry information
          const enhancedError = new Error(`${error.message} (failed after ${currentAttempt} attempts)`);
          enhancedError.originalError = error;
          enhancedError.retryAttempts = currentAttempt;
          enhancedError.totalDuration = duration;
          enhancedError.reason = reason;
          
          throw enhancedError;
        }
      }
    } catch (error) {
      this.activeRetries.delete(operationId);
      throw error;
    }
  }

  /**
   * Promise-based delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get retry statistics for an operation
   */
  getRetryStats(operationId) {
    return {
      currentAttempts: this.retryAttempts.get(operationId) || 0,
      maxRetries: this.config.maxRetries,
      isActive: this.activeRetries.has(operationId)
    };
  }

  /**
   * Cancel all active retries
   */
  cancelAllRetries() {
    console.log(`🛑 Cancelling ${this.activeRetries.size} active retry operations`);
    this.activeRetries.clear();
    this.retryAttempts.clear();
  }

  /**
   * Cancel specific retry operation
   */
  cancelRetry(operationId) {
    if (this.activeRetries.has(operationId)) {
      console.log(`🛑 Cancelling retry operation: ${operationId}`);
      this.activeRetries.delete(operationId);
      this.retryAttempts.delete(operationId);
      return true;
    }
    return false;
  }

  /**
   * Get all active retry operations
   */
  getActiveRetries() {
    return Array.from(this.activeRetries);
  }
}

/**
 * Global retry mechanism instance for mode loading
 */
export const modeLoadingRetry = new RetryMechanism({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  retryableErrors: [
    ...DEFAULT_RETRY_CONFIG.retryableErrors,
    'Module not found',
    'Loading CSS chunk',
    'Loading chunk',
    'ChunkLoadError',
    'timeout'
  ]
});

/**
 * Specialized retry wrapper for dynamic imports
 */
export async function retryDynamicImport(importPath, operationId = null) {
  const id = operationId || `import-${importPath}`;
  
  return modeLoadingRetry.executeWithRetry(id, async () => {
    try {
      const module = await import(importPath);
      return module;
    } catch (error) {
      // Enhance import errors with more context
      const enhancedError = new Error(`Failed to import ${importPath}: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.importPath = importPath;
      throw enhancedError;
    }
  });
}

/**
 * Retry wrapper for fetch operations
 */
export async function retryFetch(url, options = {}, operationId = null) {
  const id = operationId || `fetch-${url}`;
  
  return modeLoadingRetry.executeWithRetry(id, async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  });
}

/**
 * Utility to create operation-specific retry mechanisms
 */
export function createRetryMechanism(config) {
  return new RetryMechanism(config);
}

/**
 * Cleanup function for retry mechanisms
 */
export function cleanupRetryMechanisms() {
  modeLoadingRetry.cancelAllRetries();
}

// Export default instance
export default modeLoadingRetry;