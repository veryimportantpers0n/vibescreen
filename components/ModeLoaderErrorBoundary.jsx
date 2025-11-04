import React from 'react';
import PropTypes from 'prop-types';

/**
 * ModeLoaderErrorBoundary - Specialized error boundary for mode loading failures
 * Provides comprehensive error handling with retry mechanisms and fallback UI
 */
class ModeLoaderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      maxRetries: 3,
      errorType: null,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Determine error type for better handling
    const errorType = this.categorizeError(error);
    
    this.setState({
      error,
      errorInfo,
      errorType,
      hasError: true
    });

    // Log detailed error information
    this.logError(error, errorInfo, errorType);

    // Report to parent component if callback provided
    if (this.props.onError) {
      this.props.onError(error, {
        errorInfo,
        errorType,
        retryCount: this.state.retryCount,
        mode: this.props.mode
      });
    }
  }

  /**
   * Categorize error types for appropriate handling
   */
  categorizeError = (error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('module not found') || message.includes('cannot resolve')) {
      return 'MODULE_NOT_FOUND';
    }
    if (message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('webgl') || message.includes('three')) {
      return 'WEBGL_ERROR';
    }
    if (message.includes('memory') || message.includes('out of memory')) {
      return 'MEMORY_ERROR';
    }
    if (message.includes('validation') || message.includes('interface')) {
      return 'VALIDATION_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  };

  /**
   * Log error with detailed context information
   */
  logError = (error, errorInfo, errorType) => {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      mode: this.props.mode,
      errorType,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
      userAgent: navigator.userAgent,
      url: window.location.href,
      memoryUsage: this.getMemoryUsage(),
      webglSupport: this.checkWebGLSupport()
    };

    console.group(`🚨 ModeLoader Error - ${errorType}`);
    console.error('Error Details:', errorDetails);
    console.error('Original Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();

    // Store error in session storage for debugging
    try {
      const errorLog = JSON.parse(sessionStorage.getItem('modeLoaderErrors') || '[]');
      errorLog.push(errorDetails);
      // Keep only last 10 errors
      if (errorLog.length > 10) {
        errorLog.splice(0, errorLog.length - 10);
      }
      sessionStorage.setItem('modeLoaderErrors', JSON.stringify(errorLog));
    } catch (storageError) {
      console.warn('Failed to store error log:', storageError);
    }
  };

  /**
   * Get memory usage information if available
   */
  getMemoryUsage = () => {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  };

  /**
   * Check WebGL support
   */
  checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return {
        supported: !!gl,
        version: gl ? gl.getParameter(gl.VERSION) : null,
        vendor: gl ? gl.getParameter(gl.VENDOR) : null,
        renderer: gl ? gl.getParameter(gl.RENDERER) : null
      };
    } catch (e) {
      return { supported: false, error: e.message };
    }
  };

  /**
   * Determine if error is retryable
   */
  isRetryableError = (errorType) => {
    const retryableErrors = [
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'MEMORY_ERROR'
    ];
    return retryableErrors.includes(errorType);
  };

  /**
   * Calculate retry delay with exponential backoff
   */
  getRetryDelay = (retryCount) => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 10000; // 10 seconds
    const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
    return delay;
  };

  /**
   * Handle retry attempt
   */
  handleRetry = () => {
    if (this.state.retryCount >= this.state.maxRetries) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    const newRetryCount = this.state.retryCount + 1;
    const delay = this.getRetryDelay(newRetryCount);

    console.log(`🔄 Retrying mode load (attempt ${newRetryCount}/${this.state.maxRetries}) in ${delay}ms`);

    setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorType: null,
        retryCount: newRetryCount
      });
    }, delay);
  };

  /**
   * Handle fallback to default mode
   */
  handleFallback = () => {
    if (this.props.onFallback) {
      this.props.onFallback();
    } else {
      // Reset to clean state and let parent handle fallback
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorType: null,
        retryCount: 0
      });
    }
  };

  /**
   * Clear error state and reset
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: null,
      retryCount: 0
    });
  };

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage = (errorType) => {
    const messages = {
      'NETWORK_ERROR': 'Network connection issue. Check your internet connection.',
      'MODULE_NOT_FOUND': 'Mode files are missing or corrupted.',
      'TIMEOUT_ERROR': 'Mode loading timed out. This may be due to slow network or large files.',
      'WEBGL_ERROR': 'Graphics rendering issue. Your browser may not support WebGL.',
      'MEMORY_ERROR': 'Insufficient memory. Try closing other browser tabs.',
      'VALIDATION_ERROR': 'Mode components have invalid structure or exports.',
      'UNKNOWN_ERROR': 'An unexpected error occurred while loading the mode.'
    };
    
    return messages[errorType] || messages['UNKNOWN_ERROR'];
  };

  render() {
    if (this.state.hasError) {
      const { error, errorType, retryCount, maxRetries } = this.state;
      const canRetry = retryCount < maxRetries && this.isRetryableError(errorType);
      const userMessage = this.getUserFriendlyMessage(errorType);

      return (
        <div className="mode-loader-error-boundary" role="alert">
          <div className="error-content">
            <div className="error-header">
              <h3 className="terminal-text error-title">
                &gt; MODE_LOAD_ERROR: {this.props.mode?.toUpperCase() || 'UNKNOWN'}
              </h3>
              <div className="error-type terminal-text">
                &gt; ERROR_TYPE: {errorType}
              </div>
            </div>

            <div className="error-message">
              <p className="terminal-text user-message">
                &gt; {userMessage}
              </p>
              {this.props.showDetails && (
                <details className="error-details">
                  <summary className="terminal-text">Technical Details</summary>
                  <pre className="error-technical">
                    {error.message}
                    {error.stack && `\n\nStack Trace:\n${error.stack}`}
                  </pre>
                </details>
              )}
            </div>

            <div className="error-actions">
              {canRetry && (
                <button 
                  className="retry-button terminal-text"
                  onClick={this.handleRetry}
                  aria-label={`Retry loading mode (${maxRetries - retryCount} attempts remaining)`}
                >
                  &gt; RETRY_LOAD [{retryCount}/{maxRetries}]
                </button>
              )}
              
              <button 
                className="fallback-button terminal-text"
                onClick={this.handleFallback}
                aria-label="Use fallback mode"
              >
                &gt; USE_FALLBACK_MODE
              </button>

              <button 
                className="reset-button terminal-text"
                onClick={this.handleReset}
                aria-label="Reset error state"
              >
                &gt; RESET_ERROR_STATE
              </button>
            </div>

            <div className="error-info">
              <div className="terminal-text error-timestamp">
                &gt; ERROR_TIME: {new Date(this.state.lastErrorTime).toLocaleTimeString()}
              </div>
              {this.getMemoryUsage() && (
                <div className="terminal-text memory-info">
                  &gt; MEMORY_USAGE: {this.getMemoryUsage().used}MB / {this.getMemoryUsage().total}MB
                </div>
              )}
            </div>
          </div>

          {/* Fallback scene background */}
          <div className="error-background">
            <div className="error-matrix-rain">
              {Array.from({ length: 15 }, (_, i) => (
                <div 
                  key={i} 
                  className="matrix-column" 
                  style={{ 
                    left: `${i * 6.67}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                >
                  {Array.from({ length: 8 }, (_, j) => (
                    <span key={j} className="matrix-char">
                      {String.fromCharCode(0x30A0 + Math.random() * 96)}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ModeLoaderErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  mode: PropTypes.string,
  onError: PropTypes.func,
  onFallback: PropTypes.func,
  showDetails: PropTypes.bool
};

ModeLoaderErrorBoundary.defaultProps = {
  showDetails: false
};

export default ModeLoaderErrorBoundary;