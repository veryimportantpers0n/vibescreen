/**
 * Error boundary components and utilities for VibeScreen application stability
 * Provides comprehensive error handling for data loading and component failures
 */

import { dataLoadingLogger } from './dataLoader.js';

// Check if React is available
const isReactAvailable = typeof window !== 'undefined' && typeof window.React !== 'undefined';

/**
 * Main application error boundary for data loading failures
 * Note: Only works in React environment
 */
export class DataLoadingErrorBoundary {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      maxRetries: 3
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Log to our data loading logger
    dataLoadingLogger.logError('ErrorBoundary', 'Component error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount
    });

    // Optional: Report to external error tracking service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.state.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));

      dataLoadingLogger.logInfo('ErrorBoundary', `Retry attempt ${this.state.retryCount + 1}`);
    }
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h2>⚠️ Data Loading Error</h2>
            <p>Something went wrong while loading application data.</p>
            
            {this.props.showDetails && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre className="error-message">
                  {this.state.error && this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="error-stack">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}

            <div className="error-actions">
              {this.state.retryCount < this.state.maxRetries ? (
                <button 
                  onClick={this.handleRetry}
                  className="retry-button"
                >
                  Retry ({this.state.maxRetries - this.state.retryCount} attempts left)
                </button>
              ) : (
                <p className="max-retries-message">
                  Maximum retry attempts reached. Please refresh the page.
                </p>
              )}
              
              <button 
                onClick={() => window.location.reload()}
                className="refresh-button"
              >
                Refresh Page
              </button>
            </div>

            <div className="fallback-notice">
              <p>The application will continue with fallback data where possible.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Specialized error boundary for Three.js components
 */
export class ThreeJSErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    
    dataLoadingLogger.logError('ThreeJSErrorBoundary', 'Three.js component error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="threejs-error-fallback">
          <div className="fallback-scene">
            <div className="fallback-message">
              <h3>🎮 Scene Loading Error</h3>
              <p>Unable to load 3D scene. Using fallback display.</p>
              <div className="fallback-animation">
                <div className="matrix-rain">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="matrix-column" style={{ 
                      left: `${i * 5}%`,
                      animationDelay: `${i * 0.1}s`
                    }}>
                      {Array.from({ length: 10 }, (_, j) => (
                        <span key={j} className="matrix-char">
                          {String.fromCharCode(0x30A0 + Math.random() * 96)}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error boundary for message system components
 */
export class MessageSystemErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    
    dataLoadingLogger.logError('MessageSystemErrorBoundary', 'Message system error', {
      error: error.message,
      stack: error.stack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="message-error-fallback">
          <div className="fallback-message-popup">
            <p>⚠️ Message system temporarily unavailable</p>
            <small>Using fallback display mode</small>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary(Component, boundaryType = 'default') {
  const BoundaryComponent = {
    'data': DataLoadingErrorBoundary,
    'threejs': ThreeJSErrorBoundary,
    'message': MessageSystemErrorBoundary,
    'default': DataLoadingErrorBoundary
  }[boundaryType];

  return function WrappedComponent(props) {
    return (
      <BoundaryComponent>
        <Component {...props} />
      </BoundaryComponent>
    );
  };
}

/**
 * Hook for handling async errors in functional components
 */
export function useErrorHandler() {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error) => {
    dataLoadingLogger.logError('AsyncErrorHandler', 'Async operation failed', {
      error: error.message,
      stack: error.stack
    });
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
}

/**
 * Global error handler for unhandled promise rejections
 */
export function setupGlobalErrorHandling() {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      dataLoadingLogger.logError('GlobalErrorHandler', 'Unhandled promise rejection', {
        reason: event.reason?.message || event.reason,
        stack: event.reason?.stack
      });
      
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      dataLoadingLogger.logError('GlobalErrorHandler', 'JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
  }

  // Node.js environment
  if (typeof process !== 'undefined') {
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
}

/**
 * Error recovery utilities
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
 * CSS styles for error boundary components (to be included in global CSS)
 */
export const errorBoundaryStyles = `
.error-boundary-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 20px;
}

.error-boundary-content {
  max-width: 600px;
  text-align: center;
  border: 2px solid #00ff00;
  padding: 30px;
  background: rgba(0, 255, 0, 0.05);
  border-radius: 4px;
}

.error-boundary-content h2 {
  margin-bottom: 20px;
  color: #ff4444;
}

.error-details {
  margin: 20px 0;
  text-align: left;
}

.error-details summary {
  cursor: pointer;
  color: #ffaa00;
  margin-bottom: 10px;
}

.error-message, .error-stack {
  background: rgba(255, 255, 255, 0.1);
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  margin: 10px 0;
}

.error-actions {
  margin: 20px 0;
}

.retry-button, .refresh-button {
  background: #00ff00;
  color: #000;
  border: none;
  padding: 10px 20px;
  margin: 0 10px;
  cursor: pointer;
  font-family: inherit;
  border-radius: 4px;
}

.retry-button:hover, .refresh-button:hover {
  background: #00cc00;
}

.max-retries-message {
  color: #ffaa00;
  margin: 10px 0;
}

.fallback-notice {
  margin-top: 20px;
  padding: 10px;
  background: rgba(255, 170, 0, 0.1);
  border-radius: 4px;
  color: #ffaa00;
}

.threejs-error-fallback {
  width: 100%;
  height: 100vh;
  background: #000;
  position: relative;
  overflow: hidden;
}

.fallback-scene {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  z-index: 2;
}

.fallback-message {
  text-align: center;
  color: #00ff00;
  font-family: 'Courier New', monospace;
}

.matrix-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.matrix-column {
  position: absolute;
  top: -100px;
  width: 20px;
  animation: matrix-fall 3s linear infinite;
}

.matrix-char {
  display: block;
  color: #00ff00;
  font-size: 14px;
  line-height: 1.2;
  opacity: 0.8;
}

@keyframes matrix-fall {
  to {
    transform: translateY(100vh);
  }
}

.message-error-fallback {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.fallback-message-popup {
  background: rgba(0, 0, 0, 0.9);
  color: #ff4444;
  padding: 10px 15px;
  border: 1px solid #ff4444;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}
`;