import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Canvas } from '@react-three/fiber';
import { threeJSResourceManager } from '../utils/resourceCleanup';

/**
 * CharacterHost - Manages and positions animated characters in bottom-right corner
 * Handles character loading, speak animations, and proper cleanup
 */
const CharacterHost = ({ 
  currentMode = 'corporate-ai',
  characterComponent: CharacterComponent,
  config = {},
  onSpeak = null,
  isVisible = true,
  className = '',
  style = {},
  onError
}) => {
  const [speakTrigger, setSpeakTrigger] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [characterError, setCharacterError] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 200, height: 200 });
  
  // Refs for cleanup and animation management
  const mountedRef = useRef(true);
  const animationTimeoutRef = useRef(null);
  const canvasRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  /**
   * Trigger speak animation
   */
  const triggerSpeakAnimation = useCallback(() => {
    if (!mountedRef.current || !CharacterComponent) return;

    console.log(`🗣️ Triggering speak animation for ${currentMode}`);
    
    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    // Trigger animation
    setSpeakTrigger(prev => prev + 1);
    setIsAnimating(true);

    // Reset animation state after duration
    animationTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsAnimating(false);
        console.log(`✅ Speak animation completed for ${currentMode}`);
      }
    }, 2000); // 2 second animation duration

  }, [CharacterComponent, currentMode]);

  /**
   * Handle speak trigger from parent
   */
  useEffect(() => {
    if (onSpeak) {
      triggerSpeakAnimation();
    }
  }, [onSpeak, triggerSpeakAnimation]);

  /**
   * Enhanced responsive canvas sizing with breakpoint awareness
   */
  const updateCanvasSize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const isLandscape = viewportWidth > viewportHeight;
      
      let size;
      
      // Enhanced responsive sizing based on breakpoints
      if (viewportWidth <= 360) {
        // Extra small mobile
        size = Math.max(60, Math.min(80, viewportWidth * 0.12));
      } else if (viewportWidth <= 480) {
        // Small mobile
        size = Math.max(70, Math.min(90, viewportWidth * 0.14));
      } else if (viewportWidth <= 768) {
        // Mobile
        size = isLandscape 
          ? Math.max(80, Math.min(100, viewportWidth * 0.12))
          : Math.max(80, Math.min(120, viewportWidth * 0.15));
      } else if (viewportWidth <= 1024) {
        // Tablet
        size = Math.max(140, Math.min(180, viewportWidth * 0.16));
      } else if (viewportWidth <= 1440) {
        // Desktop
        size = Math.max(160, Math.min(200, viewportWidth * 0.12));
      } else {
        // Large desktop
        size = Math.max(200, Math.min(240, viewportWidth * 0.10));
      }
      
      // Ensure character doesn't take up too much screen real estate
      const maxSize = Math.min(
        viewportWidth * 0.25,
        viewportHeight * 0.30
      );
      
      size = Math.min(size, maxSize);
      
      setCanvasSize({ width: size, height: size });
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📐 Character canvas resized: ${size}x${size} (viewport: ${viewportWidth}x${viewportHeight})`);
      }
    }, 100);
  }, []);

  /**
   * Initialize canvas size and setup resize listener
   */
  useEffect(() => {
    updateCanvasSize();
    
    window.addEventListener('resize', updateCanvasSize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [updateCanvasSize]);

  /**
   * Enhanced cleanup on unmount with resource management
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      
      console.log('🧹 Starting CharacterHost cleanup...');
      
      // Clear animation timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Clear resize timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Cleanup Three.js resources for this character
      if (currentMode) {
        threeJSResourceManager.disposeModeResources(`character-${currentMode}`);
      }
      
      // Cleanup WebGL context if needed
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        
        // Force lose WebGL context for proper cleanup
        threeJSResourceManager.loseWebGLContext(canvas);
      }
      
      console.log('✅ CharacterHost cleanup completed');
    };
  }, [currentMode]);

  /**
   * Error boundary for character rendering
   */
  const handleCharacterError = useCallback((error) => {
    console.error(`❌ Character rendering error for ${currentMode}:`, error);
    setCharacterError(error);
    
    if (onError) {
      onError(error, { mode: currentMode, component: 'character' });
    }
  }, [currentMode, onError]);

  /**
   * Canvas configuration optimized for character rendering
   */
  const canvasConfig = {
    camera: { 
      position: [0, 0, 3],
      fov: 50,
      near: 0.1,
      far: 100
    },
    gl: { 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false,
      depth: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    },
    dpr: Math.min(window.devicePixelRatio || 1, 2),
    frameloop: "always",
    resize: { scroll: false, debounce: { scroll: 50, resize: 100 } },
    onCreated: ({ gl, camera }) => {
      // Configure renderer for character display
      gl.setClearColor('#000000', 0); // Transparent background
      gl.shadowMap.enabled = false; // Disable shadows for better performance
      
      // Optimize camera for character viewing
      camera.position.set(0, 0, 3);
      camera.lookAt(0, 0, 0);
      
      // Register WebGL context for tracking
      const contextId = `character-${currentMode}-${Date.now()}`;
      threeJSResourceManager.registerWebGLContext(gl.domElement, contextId);
      
      // Track renderer resource
      threeJSResourceManager.trackResource(
        `character-renderer-${currentMode}`,
        gl,
        'renderer'
      );
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🎭 Character renderer initialized for ${currentMode} (context: ${contextId})`);
      }
    },
    onError: handleCharacterError
  };

  // Loading state
  if (!CharacterComponent) {
    return (
      <div 
        className={`character-host loading ${className}`}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          zIndex: 100,
          ...style
        }}
        role="status"
        aria-live="polite"
      >
        <div className="character-loading">
          <div className="loading-placeholder">
            <div className="placeholder-icon terminal-text" aria-hidden="true">
              👾
            </div>
            <div className="loading-text terminal-text">
              &gt; LOADING_CHARACTER
              <span className="loading-dots" aria-hidden="true"></span>
            </div>
          </div>
        </div>
        <div className="sr-only">Loading character for {currentMode} mode</div>
      </div>
    );
  }

  // Error state
  if (characterError) {
    return (
      <div 
        className={`character-host error ${className}`}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: `${canvasSize.width}px`,
          height: `${canvasSize.height}px`,
          zIndex: 100,
          ...style
        }}
        role="alert"
      >
        <div className="character-error">
          <div className="error-content">
            <div className="error-icon terminal-text" aria-hidden="true">
              ⚠️
            </div>
            <div className="error-text terminal-text">
              &gt; CHARACTER_ERROR
            </div>
            <button 
              className="retry-button terminal-text"
              onClick={() => setCharacterError(null)}
              aria-label={`Retry loading character for ${currentMode}`}
            >
              &gt; RETRY
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Hidden state
  if (!isVisible) {
    return null;
  }

  // Main character display
  return (
    <div 
      className={`character-host active ${isAnimating ? 'speaking' : ''} ${className}`}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: `${canvasSize.width}px`,
        height: `${canvasSize.height}px`,
        zIndex: 100,
        borderRadius: '8px',
        overflow: 'hidden',
        border: isAnimating ? `2px solid ${config.colors?.primary || '#00ff00'}` : '2px solid transparent',
        boxShadow: isAnimating ? `0 0 20px ${config.colors?.primary || '#00ff00'}40` : 'none',
        transition: 'all 0.3s ease',
        ...style
      }}
      role="img"
      aria-label={`${currentMode} character ${isAnimating ? 'speaking' : 'idle'}`}
      aria-live="polite"
    >
      {/* Character Canvas */}
      <Canvas 
        ref={canvasRef}
        {...canvasConfig}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        {/* Lighting setup optimized for character display */}
        <ambientLight intensity={0.6} />
        <pointLight 
          position={[2, 2, 2]} 
          intensity={0.8}
          color={config.colors?.primary || '#ffffff'}
        />
        <pointLight 
          position={[-2, -2, 2]} 
          intensity={0.4}
          color={config.colors?.secondary || '#ffffff'}
        />
        
        {/* Character Component with speak animation trigger */}
        <CharacterComponent 
          onSpeak={speakTrigger}
          config={config}
          isAnimating={isAnimating}
          mode={currentMode}
        />
      </Canvas>

      {/* Character Status Indicator */}
      <div 
        className="character-status"
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '4px',
          right: '4px',
          height: '2px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '1px',
          overflow: 'hidden'
        }}
        aria-hidden="true"
      >
        <div 
          className="status-bar"
          style={{
            height: '100%',
            backgroundColor: config.colors?.primary || '#00ff00',
            width: isAnimating ? '100%' : '20%',
            transition: 'width 0.3s ease',
            borderRadius: '1px'
          }}
        />
      </div>

      {/* Accessibility announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {isAnimating && `${currentMode} character is speaking`}
      </div>

      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="character-debug"
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            fontSize: '10px',
            color: config.colors?.primary || '#00ff00',
            fontFamily: 'monospace',
            textShadow: '0 0 4px rgba(0, 0, 0, 0.8)',
            pointerEvents: 'none'
          }}
        >
          {currentMode}
          {isAnimating && ' [SPEAK]'}
        </div>
      )}
    </div>
  );
};

CharacterHost.propTypes = {
  currentMode: PropTypes.string,
  characterComponent: PropTypes.elementType,
  config: PropTypes.shape({
    colors: PropTypes.shape({
      primary: PropTypes.string,
      secondary: PropTypes.string
    }),
    animations: PropTypes.shape({
      speed: PropTypes.number,
      intensity: PropTypes.string
    })
  }),
  onSpeak: PropTypes.number,
  isVisible: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  onError: PropTypes.func
};

export default CharacterHost;