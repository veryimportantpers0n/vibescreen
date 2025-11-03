import React, { Suspense, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import PropTypes from 'prop-types';

/**
 * SceneWrapper - Universal Three.js canvas container for all personality mode backgrounds
 * Provides standardized 3D rendering environment with camera, lighting, and error handling
 */
const SceneWrapper = ({ 
  mode, 
  sceneProps = {}, 
  children, 
  className = '', 
  style = {},
  onError 
}) => {
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [performanceStats, setPerformanceStats] = useState({ fps: 60, frameTime: 16.67 });
  const canvasRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const resizeTimeoutRef = useRef(null);

  // Default scene configuration with standardized camera and lighting
  const defaultConfig = {
    bgColor: "#000000",
    ambientSpeed: 1.0,
    camera: {
      position: [0, 0, 5],
      fov: 75,
      near: 0.1,
      far: 1000
    },
    lighting: {
      ambientIntensity: 0.5,
      pointLightPosition: [10, 10, 10],
      pointLightIntensity: 1.0
    },
    performance: {
      pixelRatio: Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2),
      antialias: true,
      shadowMap: false
    }
  };

  // Merge default config with provided sceneProps, allowing deep overrides
  const config = {
    ...defaultConfig,
    ...sceneProps,
    camera: { ...defaultConfig.camera, ...(sceneProps.camera || {}) },
    lighting: { ...defaultConfig.lighting, ...(sceneProps.lighting || {}) },
    performance: { ...defaultConfig.performance, ...(sceneProps.performance || {}) }
  };

  // Performance monitoring with 60fps target
  const updatePerformanceStats = useCallback(() => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;
    
    frameCountRef.current++;
    
    // Update stats every 60 frames (approximately 1 second at 60fps)
    if (frameCountRef.current >= 60) {
      const fps = Math.round(1000 / (deltaTime / frameCountRef.current));
      const frameTime = deltaTime / frameCountRef.current;
      
      setPerformanceStats({ fps, frameTime });
      
      // Log performance warnings in development
      if (process.env.NODE_ENV === 'development') {
        if (fps < 50) {
          console.warn(`⚠️ Performance Warning: FPS dropped to ${fps} (target: 60fps)`);
        }
        if (frameTime > 20) {
          console.warn(`⚠️ Performance Warning: Frame time ${frameTime.toFixed(2)}ms (target: <16.67ms)`);
        }
      }
      
      frameCountRef.current = 0;
    }
    
    lastTimeRef.current = now;
  }, []);

  // Efficient responsive canvas sizing with debounced resize handling
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      const newSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      setCanvasSize(newSize);
      
      // Log resize events in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`📐 Canvas resized: ${newSize.width}x${newSize.height}`);
      }
    }, 100); // Debounce resize events by 100ms
  }, []);

  // WebGL support detection and initial setup
  useEffect(() => {
    const detectWebGLSupport = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (e) {
        return false;
      }
    };

    setIsWebGLSupported(detectWebGLSupport());
    
    // Initialize canvas size
    setCanvasSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, []);

  // Window resize listener with cleanup
  useEffect(() => {
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  // Resource cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Force garbage collection of Three.js resources
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (gl) {
          // Clear WebGL context
          const loseContext = gl.getExtension('WEBGL_lose_context');
          if (loseContext) {
            loseContext.loseContext();
          }
        }
      }
      
      // Log cleanup in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🧹 SceneWrapper: Cleaning up Three.js resources');
      }
    };
  }, []);

  // Component lifecycle management for dynamic content updates
  useEffect(() => {
    // Log mode changes in development for debugging
    if (process.env.NODE_ENV === 'development' && mode) {
      console.log(`🔄 SceneWrapper: Mode changed to "${mode}"`);
    }
  }, [mode]);

  // Efficient sceneProps change handling
  useEffect(() => {
    // Log sceneProps changes in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('⚙️ SceneWrapper: Scene configuration updated:', config);
    }
  }, [config]);

  // Optimized canvas configuration with performance settings
  const canvasConfig = {
    camera: { 
      position: config.camera.position, 
      fov: config.camera.fov,
      near: config.camera.near,
      far: config.camera.far
    },
    gl: { 
      antialias: config.performance.antialias,
      alpha: true,
      powerPreference: "high-performance",
      stencil: false, // Disable stencil buffer for better performance
      depth: true,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false, // Better performance, disable if screenshots needed
      failIfMajorPerformanceCaveat: false // Allow fallback to software rendering
    },
    dpr: config.performance.pixelRatio, // Already capped at 2 in defaultConfig
    frameloop: "always",
    resize: { scroll: false, debounce: { scroll: 50, resize: 100 } }, // Optimized resize handling
    performance: {
      min: 0.2, // Minimum performance threshold (20% of 60fps = 12fps)
      max: 1.0, // Maximum performance (100% = 60fps)
      debounce: 200 // Debounce performance adjustments
    },
    onCreated: ({ gl }) => {
      // Configure renderer for optimal performance
      gl.setClearColor(config.bgColor || '#000000');
      gl.shadowMap.enabled = config.performance.shadowMap || false;
      gl.shadowMap.type = 1; // BasicShadowMap for better performance
      gl.outputEncoding = 3001; // sRGBEncoding
      gl.toneMapping = 0; // NoToneMapping for better performance
      
      // Set up performance monitoring
      gl.setAnimationLoop(() => {
        updatePerformanceStats();
      });
      
      // Log renderer info in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🎮 Three.js Renderer initialized:', {
          renderer: gl.capabilities.renderer,
          version: gl.capabilities.version,
          maxTextures: gl.capabilities.maxTextures,
          maxTextureSize: gl.capabilities.maxTextureSize,
          precision: gl.capabilities.precision
        });
      }
    }
  };

  // Enhanced loading spinner component with accessibility
  const LoadingSpinner = () => (
    <mesh>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial color="#00FF00" wireframe />
    </mesh>
  );

  // CSS-based loading spinner for fallback UI
  const CSSLoadingSpinner = () => (
    <div className="css-loading-spinner" role="status" aria-label="Loading 3D scene">
      <div className="spinner-container">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <div className="loading-text terminal-text">
        &gt; INITIALIZING_3D_GRAPHICS
        <span className="loading-dots" aria-hidden="true"></span>
      </div>
      <div className="sr-only" aria-live="polite">
        Loading 3D graphics. Please wait.
      </div>
    </div>
  );

  // Memoized children with sceneProps injection for efficient updates
  const enhancedChildren = useMemo(() => {
    if (!children) return null;
    
    return React.Children.map(children, (child) => {
      // Pass sceneProps to child components that can accept them
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ...child.props,
          sceneProps: config,
          mode: mode,
          canvasSize: canvasSize,
          performanceStats: performanceStats
        });
      }
      return child;
    });
  }, [children, config, mode, canvasSize, performanceStats]);

  // Enhanced fallback UI with accessibility and ambient animations
  const FallbackUI = ({ error, errorType, retryCount, onRetry }) => {
    const getErrorMessage = () => {
      switch (errorType) {
        case 'webgl':
          return {
            title: '&gt; WEBGL MODULE OFFLINE',
            message: '&gt; Graphics acceleration not available',
            suggestion: '&gt; Try updating your browser or graphics drivers',
            canRetry: false,
            ariaLabel: 'WebGL not supported error'
          };
        case 'memory':
          return {
            title: '&gt; MEMORY OVERFLOW DETECTED',
            message: '&gt; Insufficient graphics memory',
            suggestion: '&gt; Close other applications and try again',
            canRetry: true,
            ariaLabel: 'Memory overflow error'
          };
        case 'shader':
          return {
            title: '&gt; SHADER COMPILATION FAILED',
            message: '&gt; Graphics pipeline error',
            suggestion: '&gt; Your graphics card may not support required features',
            canRetry: true,
            ariaLabel: 'Shader compilation error'
          };
        case 'resource':
          return {
            title: '&gt; RESOURCE LOADING FAILED',
            message: '&gt; Unable to load 3D assets',
            suggestion: '&gt; Check network connection and try again',
            canRetry: true,
            ariaLabel: 'Resource loading error'
          };
        case 'loading':
          return {
            title: '&gt; MODULE LOADING FAILED',
            message: '&gt; Unable to load 3D rendering components',
            suggestion: '&gt; Refresh the page to retry',
            canRetry: true,
            ariaLabel: 'Module loading error'
          };
        default:
          return {
            title: '&gt; SYSTEM ERROR',
            message: '&gt; 3D graphics module offline',
            suggestion: '&gt; Switching to compatibility mode...',
            canRetry: retryCount < 2,
            ariaLabel: 'System error'
          };
      }
    };

    const errorDetails = getErrorMessage();

    return (
      <div 
        className="scene-fallback" 
        role="alert" 
        aria-labelledby="fallback-title"
        aria-describedby="fallback-description"
      >
        <div className="fallback-content">
          <h3 
            id="fallback-title"
            className="terminal-text error-title"
            aria-label={errorDetails.ariaLabel}
          >
            {errorDetails.title}
          </h3>
          <p 
            id="fallback-description"
            className="terminal-text error-message"
          >
            {errorDetails.message}
          </p>
          <p className="terminal-text error-suggestion">
            {errorDetails.suggestion}
          </p>
          
          {/* Error details for debugging (only in development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="error-details">
              <summary className="terminal-text" tabIndex="0">
                &gt; Debug Information
              </summary>
              <pre className="error-stack" role="log">
                {error.name}: {error.message}
                {error.stack && `\n${error.stack.slice(0, 500)}...`}
              </pre>
            </details>
          )}

          {/* Retry button for recoverable errors */}
          {errorDetails.canRetry && retryCount < 3 && (
            <button 
              className="retry-button terminal-text"
              onClick={onRetry}
              aria-label={`Retry 3D graphics initialization. Attempt ${retryCount + 1} of 3`}
              type="button"
            >
              &gt; RETRY_GRAPHICS_INIT [{retryCount + 1}/3]
            </button>
          )}

          {/* Enhanced ambient fallback animation */}
          <div className="fallback-visual" aria-hidden="true">
            <div className="ambient-animation">
              {/* Matrix-style falling characters */}
              <div className="matrix-rain">
                <span className="rain-char">0</span>
                <span className="rain-char">1</span>
                <span className="rain-char">0</span>
                <span className="rain-char">1</span>
                <span className="rain-char">0</span>
              </div>
              
              {/* Pulsing grid pattern */}
              <div className="grid-pattern">
                <div className="grid-line horizontal"></div>
                <div className="grid-line vertical"></div>
                <div className="grid-line horizontal"></div>
                <div className="grid-line vertical"></div>
              </div>
              
              {/* Terminal cursor and error pattern */}
              <div className="terminal-elements">
                <div className="terminal-cursor">_</div>
                <div className="error-pattern">
                  <span className="error-char">█</span>
                  <span className="error-char">▓</span>
                  <span className="error-char">▒</span>
                  <span className="error-char">░</span>
                </div>
              </div>
              
              {/* Scanning line effect */}
              <div className="scan-line"></div>
            </div>
          </div>

          {/* Enhanced accessibility announcements */}
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            {errorType === 'webgl' 
              ? '3D graphics not supported. Application is running in text mode with ambient animations.'
              : '3D graphics temporarily unavailable. Fallback mode active with visual effects.'
            }
          </div>
          
          {/* Keyboard navigation hint */}
          <div className="sr-only">
            Press Tab to navigate available options. Press Enter to activate buttons.
          </div>
        </div>
      </div>
    );
  };

  // Comprehensive error boundary for Three.js errors
  class SceneErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { 
        hasError: false, 
        error: null, 
        errorInfo: null,
        errorType: 'unknown',
        retryCount: 0
      };
    }

    static getDerivedStateFromError(error) {
      // Analyze error type for better handling
      let errorType = 'unknown';
      
      if (error.message.toLowerCase().includes('webgl') || error.message.toLowerCase().includes('context')) {
        errorType = 'webgl';
      } else if (error.message.toLowerCase().includes('memory') || error.message.includes('CONTEXT_LOST')) {
        errorType = 'memory';
      } else if (error.message.toLowerCase().includes('shader') || error.message.toLowerCase().includes('program')) {
        errorType = 'shader';
      } else if (error.message.toLowerCase().includes('texture') || error.message.toLowerCase().includes('buffer')) {
        errorType = 'resource';
      } else if (error.name === 'ChunkLoadError' || error.message.includes('Loading')) {
        errorType = 'loading';
      }

      return { 
        hasError: true, 
        error, 
        errorType
      };
    }

    componentDidCatch(error, errorInfo) {
      // Detailed error logging with context information
      const errorContext = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        webglSupported: this.detectWebGLCapabilities(),
        memoryInfo: this.getMemoryInfo(),
        canvasInfo: this.getCanvasInfo(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        mode: this.props.mode,
        retryCount: this.state.retryCount
      };

      // Log detailed error information for debugging
      console.group('🚨 Three.js Scene Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.table(errorContext);
      console.groupEnd();

      // Store error info in state for fallback UI
      this.setState({ errorInfo });

      // Report to error tracking service if available
      if (this.props.onError) {
        this.props.onError(error, errorContext);
      }

      // Attempt to recover from certain types of errors
      this.attemptErrorRecovery(error);
    }

    detectWebGLCapabilities = () => {
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
          maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
          extensions: gl.getSupportedExtensions()
        };
      } catch (e) {
        return { supported: false, error: e.message };
      }
    };

    getMemoryInfo = () => {
      try {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
            memoryPressure: performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
          };
        }
        return { available: false };
      } catch (e) {
        return { error: e.message };
      }
    };

    getCanvasInfo = () => {
      try {
        return {
          devicePixelRatio: window.devicePixelRatio,
          screenResolution: `${screen.width}x${screen.height}`,
          viewportSize: `${window.innerWidth}x${window.innerHeight}`,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth
        };
      } catch (e) {
        return { error: e.message };
      }
    };

    attemptErrorRecovery = (error) => {
      const { retryCount } = this.state;
      
      // Only attempt recovery for certain error types and limited retries
      if (retryCount < 2) {
        if (error.message.includes('context') || error.message.includes('CONTEXT_LOST')) {
          // Attempt to recover from WebGL context loss
          setTimeout(() => {
            console.log('🔄 Attempting WebGL context recovery...');
            this.setState({ 
              hasError: false, 
              error: null, 
              retryCount: retryCount + 1 
            });
          }, 1000);
        }
      }
    };

    handleRetry = () => {
      console.log('🔄 Manual retry requested...');
      this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        retryCount: this.state.retryCount + 1 
      });
    };

    render() {
      if (this.state.hasError) {
        return (
          <FallbackUI 
            error={this.state.error} 
            errorType={this.state.errorType}
            retryCount={this.state.retryCount}
            onRetry={this.handleRetry}
          />
        );
      }
      return this.props.children;
    }
  }

  // If WebGL is not supported, show fallback immediately
  if (!isWebGLSupported) {
    return (
      <FallbackUI 
        error={new Error('WebGL not supported')} 
        errorType="webgl"
        retryCount={0}
        onRetry={() => {
          // Re-check WebGL support
          const detectWebGLSupport = () => {
            try {
              const canvas = document.createElement('canvas');
              const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
              return !!gl;
            } catch (e) {
              return false;
            }
          };
          setIsWebGLSupported(detectWebGLSupport());
        }}
      />
    );
  }

  return (
    <SceneErrorBoundary onError={onError} mode={mode}>
      <div 
        className={`scene-wrapper ${className}`}
        style={{
          ...style,
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          overflow: 'hidden'
        }}
      >
        <Canvas 
          ref={canvasRef}
          {...canvasConfig}
          style={{
            width: canvasSize.width || '100vw',
            height: canvasSize.height || '100vh',
            display: 'block'
          }}
        >
          {/* Default lighting setup */}
          <ambientLight intensity={config.lighting.ambientIntensity} />
          <pointLight 
            position={config.lighting.pointLightPosition} 
            intensity={config.lighting.pointLightIntensity} 
          />
          
          {/* Suspense wrapper for loading states with accessibility */}
          <Suspense fallback={<LoadingSpinner />}>
            {enhancedChildren}
          </Suspense>
        </Canvas>
        
        {/* CSS Loading overlay for initial scene loading */}
        {!enhancedChildren && (
          <div className="scene-loading-overlay">
            <CSSLoadingSpinner />
          </div>
        )}
        
        {/* Performance monitor (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="performance-monitor">
            <div className="performance-stats">
              <span 
                data-status={
                  performanceStats.fps >= 55 ? 'good' : 
                  performanceStats.fps >= 30 ? 'warning' : 'critical'
                }
              >
                FPS: {performanceStats.fps}
              </span>
              <span 
                data-status={
                  performanceStats.frameTime <= 18 ? 'good' : 
                  performanceStats.frameTime <= 33 ? 'warning' : 'critical'
                }
              >
                Frame: {performanceStats.frameTime.toFixed(1)}ms
              </span>
              <span>Size: {canvasSize.width}×{canvasSize.height}</span>
              <span>DPR: {config.performance.pixelRatio}</span>
            </div>
          </div>
        )}
      </div>
    </SceneErrorBoundary>
  );
};

// PropTypes for development validation
SceneWrapper.propTypes = {
  mode: PropTypes.string,
  sceneProps: PropTypes.shape({
    bgColor: PropTypes.string,
    ambientSpeed: PropTypes.number,
    camera: PropTypes.shape({
      position: PropTypes.arrayOf(PropTypes.number),
      fov: PropTypes.number,
      near: PropTypes.number,
      far: PropTypes.number
    }),
    lighting: PropTypes.shape({
      ambientIntensity: PropTypes.number,
      pointLightPosition: PropTypes.arrayOf(PropTypes.number),
      pointLightIntensity: PropTypes.number
    }),
    performance: PropTypes.shape({
      pixelRatio: PropTypes.number,
      antialias: PropTypes.bool,
      shadowMap: PropTypes.bool
    })
  }),
  children: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  onError: PropTypes.func
};

export default SceneWrapper;