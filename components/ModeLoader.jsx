import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import SceneWrapper from './SceneWrapper';

/**
 * ModeLoader - Dynamically loads and manages personality mode components
 * Handles real mode imports with error handling and fallback to default mode
 */
const ModeLoader = ({ 
  currentMode = 'corporate-ai', 
  onModeChange, 
  onError,
  className = '',
  style = {} 
}) => {
  const [modeComponents, setModeComponents] = useState({});
  const [modeConfigs, setModeConfigs] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Refs for cleanup tracking
  const mountedRef = useRef(true);
  const loadingTimeoutsRef = useRef({});
  const retryCountsRef = useRef({});

  // Available modes configuration
  const availableModes = [
    'corporate-ai',
    'zen-monk', 
    'chaos'
  ];

  const defaultMode = 'corporate-ai';

  /**
   * Dynamically import mode components with error handling
   */
  const loadModeComponents = useCallback(async (modeName) => {
    if (!mountedRef.current) return null;

    // Check if already loaded
    if (modeComponents[modeName] && modeConfigs[modeName]) {
      return { 
        scene: modeComponents[modeName].scene,
        character: modeComponents[modeName].character,
        config: modeConfigs[modeName]
      };
    }

    // Set loading state
    setLoadingStates(prev => ({ ...prev, [modeName]: true }));
    setErrors(prev => ({ ...prev, [modeName]: null }));

    try {
      // Set loading timeout
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          throw new Error(`Mode loading timeout: ${modeName}`);
        }
      }, 10000); // 10 second timeout

      loadingTimeoutsRef.current[modeName] = timeoutId;

      // Dynamic imports with proper error handling
      const [sceneModule, characterModule, configModule, messagesModule] = await Promise.all([
        import(`../modes/${modeName}/scene.js`).catch(err => {
          console.warn(`Failed to load scene for ${modeName}:`, err);
          return null;
        }),
        import(`../modes/${modeName}/character.js`).catch(err => {
          console.warn(`Failed to load character for ${modeName}:`, err);
          return null;
        }),
        import(`../modes/${modeName}/config.json`).catch(err => {
          console.warn(`Failed to load config for ${modeName}:`, err);
          return null;
        }),
        import(`../modes/${modeName}/messages.json`).catch(err => {
          console.warn(`Failed to load messages for ${modeName}:`, err);
          return null;
        })
      ]);

      // Clear timeout
      clearTimeout(timeoutId);
      delete loadingTimeoutsRef.current[modeName];

      if (!mountedRef.current) return null;

      // Validate required components
      if (!sceneModule || !characterModule || !configModule) {
        throw new Error(`Missing required components for mode: ${modeName}`);
      }

      // Extract components and validate exports
      // Convert mode name to component name (e.g., 'corporate-ai' -> 'CorporateAIScene')
      const componentName = modeName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('');
      
      const SceneComponent = sceneModule[`${componentName}Scene`] || sceneModule.default;
      const CharacterComponent = characterModule[`${componentName}Character`] || characterModule.default;

      if (!SceneComponent || !CharacterComponent) {
        throw new Error(`Invalid component exports for mode: ${modeName}`);
      }

      const config = configModule.default || configModule;
      const messages = messagesModule ? (messagesModule.default || messagesModule) : { messages: [] };

      // Store loaded components
      const modeData = {
        scene: SceneComponent,
        character: CharacterComponent,
        config: { ...config, messages: messages.messages || [] }
      };

      if (mountedRef.current) {
        setModeComponents(prev => ({
          ...prev,
          [modeName]: {
            scene: SceneComponent,
            character: CharacterComponent
          }
        }));

        setModeConfigs(prev => ({
          ...prev,
          [modeName]: modeData.config
        }));

        setLoadingStates(prev => ({ ...prev, [modeName]: false }));
        
        // Reset retry count on successful load
        retryCountsRef.current[modeName] = 0;

        console.log(`✅ Successfully loaded mode: ${modeName}`);
      }

      return modeData;

    } catch (error) {
      // Clear timeout on error
      if (loadingTimeoutsRef.current[modeName]) {
        clearTimeout(loadingTimeoutsRef.current[modeName]);
        delete loadingTimeoutsRef.current[modeName];
      }

      if (!mountedRef.current) return null;

      console.error(`❌ Failed to load mode ${modeName}:`, error);

      // Track retry attempts
      const retryCount = (retryCountsRef.current[modeName] || 0) + 1;
      retryCountsRef.current[modeName] = retryCount;

      setErrors(prev => ({ 
        ...prev, 
        [modeName]: { 
          error, 
          retryCount,
          timestamp: Date.now()
        } 
      }));
      
      setLoadingStates(prev => ({ ...prev, [modeName]: false }));

      // Report error to parent component
      if (onError) {
        onError(error, { mode: modeName, retryCount });
      }

      // Auto-retry for certain error types (max 2 retries)
      if (retryCount < 3 && (
        error.message.includes('timeout') || 
        error.message.includes('network') ||
        error.message.includes('Loading')
      )) {
        console.log(`🔄 Auto-retrying mode load: ${modeName} (attempt ${retryCount})`);
        setTimeout(() => {
          if (mountedRef.current) {
            loadModeComponents(modeName);
          }
        }, 1000 * retryCount); // Exponential backoff
      }

      return null;
    }
  }, [modeComponents, modeConfigs, onError]);

  /**
   * Fallback to default mode with error handling
   */
  const fallbackToDefault = useCallback(async () => {
    if (currentMode === defaultMode) {
      console.error('❌ Default mode failed to load, using emergency fallback');
      return null;
    }

    console.warn(`⚠️ Falling back to default mode: ${defaultMode}`);
    
    try {
      const defaultModeData = await loadModeComponents(defaultMode);
      if (defaultModeData && onModeChange) {
        onModeChange(defaultMode);
      }
      return defaultModeData;
    } catch (error) {
      console.error('❌ Default mode fallback failed:', error);
      return null;
    }
  }, [currentMode, defaultMode, loadModeComponents, onModeChange]);

  /**
   * Cleanup Three.js resources for a specific mode
   */
  const cleanupModeResources = useCallback((modeName) => {
    // Clear any pending timeouts
    if (loadingTimeoutsRef.current[modeName]) {
      clearTimeout(loadingTimeoutsRef.current[modeName]);
      delete loadingTimeoutsRef.current[modeName];
    }

    // Force garbage collection hint
    if (window.gc) {
      window.gc();
    }

    console.log(`🧹 Cleaned up resources for mode: ${modeName}`);
  }, []);

  /**
   * Initialize mode loader and load default mode
   */
  useEffect(() => {
    const initializeModeLoader = async () => {
      try {
        console.log('🚀 Initializing ModeLoader...');
        
        // Load the current mode
        const modeData = await loadModeComponents(currentMode);
        
        if (!modeData) {
          // Fallback to default mode if current mode fails
          await fallbackToDefault();
        }
        
        setIsInitialized(true);
        console.log('✅ ModeLoader initialized successfully');
        
      } catch (error) {
        console.error('❌ ModeLoader initialization failed:', error);
        setIsInitialized(true); // Still mark as initialized to show error state
      }
    };

    initializeModeLoader();
  }, []); // Only run on mount

  /**
   * Handle mode changes with cleanup
   */
  useEffect(() => {
    if (!isInitialized) return;

    const handleModeChange = async () => {
      // Validate mode exists
      if (!availableModes.includes(currentMode)) {
        console.warn(`⚠️ Invalid mode requested: ${currentMode}, falling back to default`);
        await fallbackToDefault();
        return;
      }

      // Load new mode if not already loaded
      if (!modeComponents[currentMode] || !modeConfigs[currentMode]) {
        console.log(`🔄 Loading mode: ${currentMode}`);
        const modeData = await loadModeComponents(currentMode);
        
        if (!modeData) {
          console.warn(`⚠️ Failed to load mode: ${currentMode}, falling back to default`);
          await fallbackToDefault();
        }
      } else {
        console.log(`✅ Mode already loaded: ${currentMode}`);
      }
    };

    handleModeChange();
  }, [currentMode, isInitialized, modeComponents, modeConfigs, availableModes, loadModeComponents, fallbackToDefault]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      // Clear all loading timeouts
      Object.values(loadingTimeoutsRef.current).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      
      // Cleanup resources for all loaded modes
      Object.keys(modeComponents).forEach(modeName => {
        cleanupModeResources(modeName);
      });
      
      console.log('🧹 ModeLoader cleanup completed');
    };
  }, [modeComponents, cleanupModeResources]);

  // Get current mode data
  const currentModeData = {
    scene: modeComponents[currentMode]?.scene,
    character: modeComponents[currentMode]?.character,
    config: modeConfigs[currentMode],
    isLoading: loadingStates[currentMode],
    error: errors[currentMode]
  };

  // Loading state
  if (!isInitialized || currentModeData.isLoading) {
    return (
      <div className={`mode-loader loading ${className}`} style={style}>
        <SceneWrapper mode={currentMode}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#00ff00" wireframe />
          </mesh>
        </SceneWrapper>
        <div className="loading-overlay" role="status" aria-live="polite">
          <div className="loading-content">
            <div className="loading-spinner terminal-text">
              &gt; LOADING_MODE_{currentMode.toUpperCase()}
              <span className="loading-dots" aria-hidden="true"></span>
            </div>
            <div className="sr-only">Loading {currentMode} personality mode</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (currentModeData.error && !currentModeData.scene) {
    const { error, retryCount } = currentModeData.error;
    
    return (
      <div className={`mode-loader error ${className}`} style={style} role="alert">
        <SceneWrapper mode={currentMode}>
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshStandardMaterial color="#ff0000" wireframe />
          </mesh>
        </SceneWrapper>
        <div className="error-overlay">
          <div className="error-content">
            <h3 className="terminal-text error-title">
              &gt; MODE_LOAD_ERROR: {currentMode.toUpperCase()}
            </h3>
            <p className="terminal-text error-message">
              &gt; {error.message}
            </p>
            {retryCount < 3 && (
              <button 
                className="retry-button terminal-text"
                onClick={() => loadModeComponents(currentMode)}
                aria-label={`Retry loading ${currentMode} mode`}
              >
                &gt; RETRY_LOAD [{retryCount}/3]
              </button>
            )}
            <button 
              className="fallback-button terminal-text"
              onClick={fallbackToDefault}
              aria-label="Switch to default mode"
            >
              &gt; FALLBACK_TO_DEFAULT
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render the loaded mode
  if (currentModeData.scene && currentModeData.config) {
    const SceneComponent = currentModeData.scene;
    
    return (
      <div className={`mode-loader loaded ${className}`} style={style}>
        <SceneWrapper 
          mode={currentMode}
          sceneProps={{
            bgColor: currentModeData.config.colors?.primary || '#000000',
            ambientSpeed: currentModeData.config.animations?.speed || 1.0
          }}
        >
          <SceneComponent />
        </SceneWrapper>
      </div>
    );
  }

  // Fallback state
  return (
    <div className={`mode-loader fallback ${className}`} style={style}>
      <SceneWrapper mode="fallback">
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#666666" wireframe />
        </mesh>
      </SceneWrapper>
      <div className="fallback-overlay" role="status">
        <div className="fallback-content">
          <p className="terminal-text">
            &gt; NO_MODE_AVAILABLE
          </p>
          <p className="terminal-text">
            &gt; SYSTEM_RUNNING_MINIMAL_CONFIG
          </p>
        </div>
      </div>
    </div>
  );
};

ModeLoader.propTypes = {
  currentMode: PropTypes.string,
  onModeChange: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

export default ModeLoader;