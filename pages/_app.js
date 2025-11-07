import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import TerminalEffects from '../components/TerminalEffects';
import { ThemeProvider } from '../utils/useThemeManager.js';
import { initializeAccessibility } from '../utils/accessibilityManager';
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
  const [themeTransitioning, setThemeTransitioning] = useState(false);

  // Load global configuration and initialize accessibility on mount
  useEffect(() => {
    const loadGlobalConfig = async () => {
      try {
        // Initialize accessibility manager first
        const accessibilityManager = initializeAccessibility();
        const accessibilityPrefs = accessibilityManager.getPreferences();
        
        // Default configuration with accessibility preferences
        const defaultConfig = {
          messageFrequency: {
            min: 15000, // 15 seconds
            max: 45000  // 45 seconds
          },
          animationSpeed: accessibilityPrefs.reducedMotion ? 0.1 : 1.0,
          theme: 'matrix-green',
          accessibility: {
            reducedMotion: accessibilityPrefs.reducedMotion,
            highContrast: accessibilityPrefs.highContrast,
            screenReader: accessibilityPrefs.screenReader,
            keyboardOnly: accessibilityPrefs.keyboardOnly
          }
        };
        setGlobalConfig(defaultConfig);
        
        // Announce app initialization for screen readers
        setTimeout(() => {
          accessibilityManager.announce('VibeScreen application loaded. Press F1 for keyboard shortcuts.');
        }, 1000);
        
      } catch (error) {
        console.error('Failed to load global configuration:', error);
        // Use fallback configuration
        setGlobalConfig({
          messageFrequency: { min: 30000, max: 60000 },
          animationSpeed: 1.0,
          theme: 'matrix-green',
          accessibility: {
            reducedMotion: false,
            highContrast: false,
            screenReader: false,
            keyboardOnly: false
          }
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
    setGlobalConfig,
    themeTransitioning,
    setThemeTransitioning
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
        
        {/* Accessibility Meta Tags */}
        <meta name="color-scheme" content="dark" />
        <meta name="supported-color-schemes" content="dark" />
        
        {/* Preload critical fonts - Source Code Pro is loaded via CSS import */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        
        {/* Accessibility Styles */}
        <style jsx>{`
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
          
          @media (prefers-contrast: high) {
            :root {
              --matrix-green: #00FF00 !important;
              --matrix-green-dim: #00CC00 !important;
              --terminal-black: #000000 !important;
            }
          }
        `}</style>
      </Head>
      
      <ErrorBoundary>
        <ThemeProvider
          initialTheme="corporate-ai"
          onThemeChange={(themeId, config) => {
            console.log(`🎨 Global theme changed to: ${config.name}`);
          }}
          onTransitionStart={() => {
            document.body.classList.add('global-theme-transitioning');
          }}
          onTransitionEnd={() => {
            document.body.classList.remove('global-theme-transitioning');
          }}
        >
          <AppProvider>
            <div id="vibescreen-app" role="application" aria-label="VibeScreen - Ambient AI Companion">
              {/* Skip to Content Link */}
              <a href="#main-content" className="skip-to-content">
                Skip to main content
              </a>
              
              {/* Global Terminal Effects */}
              <TerminalEffects enabled={true} intensity="normal" />
              
              {/* Main Application Content */}
              <main id="main-content" role="main" aria-label="Main application interface">
                <Component {...pageProps} />
              </main>
              
              {/* Screen Reader Live Regions */}
              <div aria-live="polite" aria-atomic="true" className="sr-only" id="sr-status-region"></div>
              <div aria-live="assertive" aria-atomic="true" className="sr-only" id="sr-alert-region"></div>
            </div>
          </AppProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </>
  );
}