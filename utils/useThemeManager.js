/**
 * useThemeManager - React hook for dynamic theming
 * Provides easy integration with the ThemeManager class
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import ThemeManager from './ThemeManager.js';

/**
 * Custom hook for theme management
 */
export const useThemeManager = (options = {}) => {
  const {
    initialTheme = 'corporate-ai',
    transitionDuration = 600,
    onThemeChange,
    onTransitionStart,
    onTransitionEnd
  } = options;

  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [themeConfig, setThemeConfig] = useState(null);
  const themeManagerRef = useRef(null);

  // Initialize ThemeManager
  useEffect(() => {
    if (!themeManagerRef.current) {
      themeManagerRef.current = new ThemeManager({
        initialTheme,
        transitionDuration,
        onThemeChange: (themeId, config) => {
          setCurrentTheme(themeId);
          setThemeConfig(config);
          if (onThemeChange) {
            onThemeChange(themeId, config);
          }
        },
        onTransitionStart: (fromTheme, toTheme) => {
          setIsTransitioning(true);
          if (onTransitionStart) {
            onTransitionStart(fromTheme, toTheme);
          }
        },
        onTransitionEnd: (fromTheme, toTheme) => {
          setIsTransitioning(false);
          if (onTransitionEnd) {
            onTransitionEnd(fromTheme, toTheme);
          }
        }
      });

      // Initialize with the initial theme
      themeManagerRef.current.initialize(initialTheme);
      setThemeConfig(themeManagerRef.current.getThemeConfig(initialTheme));
    }
  }, [initialTheme, transitionDuration, onThemeChange, onTransitionStart, onTransitionEnd]);

  // Switch theme function
  const switchTheme = useCallback(async (themeId, options = {}) => {
    if (themeManagerRef.current) {
      return await themeManagerRef.current.switchTheme(themeId, options);
    }
    return false;
  }, []);

  // Apply theme function (without transition)
  const applyTheme = useCallback((themeId, options = {}) => {
    if (themeManagerRef.current) {
      themeManagerRef.current.applyTheme(themeId, options);
      setCurrentTheme(themeId);
      setThemeConfig(themeManagerRef.current.getThemeConfig(themeId));
    }
  }, []);

  // Get theme configuration
  const getThemeConfig = useCallback((themeId) => {
    if (themeManagerRef.current) {
      return themeManagerRef.current.getThemeConfig(themeId);
    }
    return null;
  }, []);

  // Get available themes
  const getAvailableThemes = useCallback(() => {
    if (themeManagerRef.current) {
      return themeManagerRef.current.getAvailableThemes();
    }
    return [];
  }, []);

  // Validate theme
  const validateTheme = useCallback((themeId) => {
    if (themeManagerRef.current) {
      return themeManagerRef.current.validateTheme(themeId);
    }
    return { valid: false, errors: ['ThemeManager not initialized'] };
  }, []);

  // Get status
  const getStatus = useCallback(() => {
    if (themeManagerRef.current) {
      return themeManagerRef.current.getStatus();
    }
    return null;
  }, []);

  // Reset to default theme
  const resetTheme = useCallback(() => {
    if (themeManagerRef.current) {
      return themeManagerRef.current.reset();
    }
    return false;
  }, []);

  return {
    // State
    currentTheme,
    isTransitioning,
    themeConfig,
    
    // Methods
    switchTheme,
    applyTheme,
    getThemeConfig,
    getAvailableThemes,
    validateTheme,
    getStatus,
    resetTheme,
    
    // Direct access to ThemeManager instance
    themeManager: themeManagerRef.current
  };
};

/**
 * Higher-order component for theme management
 */
export const withThemeManager = (WrappedComponent, themeOptions = {}) => {
  return function ThemeManagerWrapper(props) {
    const themeManager = useThemeManager(themeOptions);
    
    return (
      <WrappedComponent
        {...props}
        themeManager={themeManager}
      />
    );
  };
};

/**
 * Theme context for React Context API integration
 */
import { createContext, useContext } from 'react';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children, ...themeOptions }) => {
  const themeManager = useThemeManager(themeOptions);
  
  return (
    <ThemeContext.Provider value={themeManager}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default useThemeManager;