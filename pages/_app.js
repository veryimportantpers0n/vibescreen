import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import '../styles/globals.css';
import '../styles/modeThemes.css';
import '../styles/animations.css';
import '../styles/terminal-animations.css';

// Error Boundary Component for Development
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.error('VibeScreen Error Boundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h1>Something went wrong in VibeScreen</h1>
            <details className="error-details">
              <summary>Error Details (Development Mode)</summary>
              <pre className="error-stack">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button 
              className="error-retry"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global State Context for Application
const AppContext = React.createContext({
  currentMode: 'corporate-ai',
  setCurrentMode: () => {},
  messagesPaused: false,
  setMessagesPaused: () => {},
  globalConfig: null,
  setGlobalConfig: () => {}
});

// Global State Provider
function AppProvider({ children }) {
  const [currentMode, setCurrentMode] = useState('corporate-ai');
  const [messagesPaused, setMessagesPaused] = useState(false);
  const [globalConfig, setGlobalConfig] = useState(null);

  // Load global configuration on mount
  useEffect(() => {
    const loadGlobalConfig = async () => {
      try {
        // Default configuration - will be replaced when data foundation is implemented
        const defaultConfig = {
          messageFrequency: {
            min: 15000, // 15 seconds
            max: 45000  // 45 seconds
          },
          animationSpeed: 1.0,
          theme: 'matrix-green',
          accessibility: {
            reducedMotion: false,
            highContrast: false
          }
        };
        setGlobalConfig(defaultConfig);
      } catch (error) {
        console.error('Failed to load global configuration:', error);
        // Use fallback configuration
        setGlobalConfig({
          messageFrequency: { min: 30000, max: 60000 },
          animationSpeed: 1.0,
          theme: 'matrix-green'
        });
      }
    };

    loadGlobalConfig();
  }, []);

  const contextValue = {
    currentMode,
    setCurrentMode,
    messagesPaused,
    setMessagesPaused,
    globalConfig,
    setGlobalConfig
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook for using app context
export function useAppContext() {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Main App Component
export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>VibeScreen - Ambient AI Companion</title>
        <meta name="description" content="Ambient AI companion for second monitors - A Kiroween hackathon submission" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Matrix/Terminal Theme Meta Tags */}
        <meta name="theme-color" content="#00FF00" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Preload critical fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      
      <ErrorBoundary>
        <AppProvider>
          <div id="vibescreen-app">
            <Component {...pageProps} />
          </div>
        </AppProvider>
      </ErrorBoundary>
    </>
  );
}