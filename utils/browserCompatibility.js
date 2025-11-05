/**
 * Browser Compatibility Utility for VibeScreen
 * Handles cross-browser compatibility and feature detection
 */

class BrowserCompatibility {
  constructor() {
    this.browser = this.detectBrowser();
    this.features = this.detectFeatures();
    this.polyfills = new Map();
    
    // Initialize compatibility
    this.initialize();
  }

  /**
   * Initialize browser compatibility
   */
  initialize() {
    this.applyBrowserSpecificOptimizations();
    this.loadRequiredPolyfills();
    this.setupFeatureDetection();
    this.applyCompatibilityClasses();
    
    console.log('🌐 Browser compatibility initialized', {
      browser: this.browser,
      features: Object.keys(this.features).filter(key => this.features[key])
    });
  }

  /**
   * Detect browser type and version
   */
  detectBrowser() {
    const userAgent = navigator.userAgent;
    const vendor = navigator.vendor || '';
    
    // Chrome/Chromium
    if (userAgent.includes('Chrome') && vendor.includes('Google')) {
      const version = userAgent.match(/Chrome\/(\d+)/)?.[1];
      return {
        name: 'chrome',
        version: parseInt(version) || 0,
        engine: 'blink',
        isModern: parseInt(version) >= 80
      };
    }
    
    // Firefox
    if (userAgent.includes('Firefox')) {
      const version = userAgent.match(/Firefox\/(\d+)/)?.[1];
      return {
        name: 'firefox',
        version: parseInt(version) || 0,
        engine: 'gecko',
        isModern: parseInt(version) >= 75
      };
    }
    
    // Safari
    if (userAgent.includes('Safari') && vendor.includes('Apple')) {
      const version = userAgent.match(/Version\/(\d+)/)?.[1];
      return {
        name: 'safari',
        version: parseInt(version) || 0,
        engine: 'webkit',
        isModern: parseInt(version) >= 13
      };
    }
    
    // Edge (Chromium)
    if (userAgent.includes('Edg/')) {
      const version = userAgent.match(/Edg\/(\d+)/)?.[1];
      return {
        name: 'edge',
        version: parseInt(version) || 0,
        engine: 'blink',
        isModern: parseInt(version) >= 80
      };
    }
    
    // Edge (Legacy)
    if (userAgent.includes('Edge/')) {
      const version = userAgent.match(/Edge\/(\d+)/)?.[1];
      return {
        name: 'edge-legacy',
        version: parseInt(version) || 0,
        engine: 'edgehtml',
        isModern: false
      };
    }
    
    // Internet Explorer
    if (userAgent.includes('Trident') || userAgent.includes('MSIE')) {
      const version = userAgent.match(/(?:MSIE |rv:)(\d+)/)?.[1];
      return {
        name: 'ie',
        version: parseInt(version) || 0,
        engine: 'trident',
        isModern: false
      };
    }
    
    // Default fallback
    return {
      name: 'unknown',
      version: 0,
      engine: 'unknown',
      isModern: false
    };
  }

  /**
   * Detect browser features and capabilities
   */
  detectFeatures() {
    const features = {};
    
    // CSS Features
    features.cssGrid = CSS.supports('display', 'grid');
    features.cssFlexbox = CSS.supports('display', 'flex');
    features.cssCustomProperties = CSS.supports('--test', 'value');
    features.cssBackdropFilter = CSS.supports('backdrop-filter', 'blur(5px)') || 
                                 CSS.supports('-webkit-backdrop-filter', 'blur(5px)');
    features.cssContainment = CSS.supports('contain', 'layout');
    features.cssWillChange = CSS.supports('will-change', 'transform');
    features.cssTransforms3D = CSS.supports('transform', 'translate3d(0,0,0)');
    features.cssAnimations = CSS.supports('animation', 'test 1s');
    features.cssTransitions = CSS.supports('transition', 'all 1s');
    features.cssClipPath = CSS.supports('clip-path', 'circle(50%)');
    features.cssFilter = CSS.supports('filter', 'blur(5px)');
    features.cssGradients = CSS.supports('background', 'linear-gradient(red, blue)');
    
    // JavaScript Features
    features.es6Classes = typeof class {} === 'function';
    features.es6Modules = typeof Symbol !== 'undefined';
    features.es6Arrow = (() => true)() === true;
    features.es6Promises = typeof Promise !== 'undefined';
    features.es6AsyncAwait = (async () => {})().constructor.name === 'AsyncFunction';
    features.es6Destructuring = (() => { try { eval('const {a} = {}'); return true; } catch(e) { return false; } })();
    
    // Web APIs
    features.intersectionObserver = 'IntersectionObserver' in window;
    features.performanceObserver = 'PerformanceObserver' in window;
    features.resizeObserver = 'ResizeObserver' in window;
    features.mutationObserver = 'MutationObserver' in window;
    features.requestAnimationFrame = 'requestAnimationFrame' in window;
    features.requestIdleCallback = 'requestIdleCallback' in window;
    features.webGL = (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    })();
    features.webGL2 = (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!canvas.getContext('webgl2');
      } catch (e) {
        return false;
      }
    })();
    
    // Storage APIs
    features.localStorage = (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })();
    features.sessionStorage = (() => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })();
    features.indexedDB = 'indexedDB' in window;
    
    // Media Features
    features.mediaQueries = window.matchMedia && window.matchMedia('(min-width: 1px)').matches;
    features.touchEvents = 'ontouchstart' in window;
    features.pointerEvents = 'onpointerdown' in window;
    features.deviceMotion = 'DeviceMotionEvent' in window;
    features.deviceOrientation = 'DeviceOrientationEvent' in window;
    
    // Network Features
    features.fetch = 'fetch' in window;
    features.serviceWorker = 'serviceWorker' in navigator;
    features.webSockets = 'WebSocket' in window;
    features.webRTC = 'RTCPeerConnection' in window;
    
    // Performance Features
    features.performanceNow = 'performance' in window && 'now' in performance;
    features.performanceMemory = 'performance' in window && 'memory' in performance;
    features.performanceTiming = 'performance' in window && 'timing' in performance;
    
    return features;
  }

  /**
   * Apply browser-specific optimizations
   */
  applyBrowserSpecificOptimizations() {
    const body = document.body;
    const browser = this.browser;
    
    // Add browser class
    body.classList.add(`browser-${browser.name}`);
    body.classList.add(`engine-${browser.engine}`);
    
    if (browser.isModern) {
      body.classList.add('modern-browser');
    } else {
      body.classList.add('legacy-browser');
    }
    
    // Browser-specific optimizations
    switch (browser.name) {
      case 'chrome':
        this.applyChromeOptimizations();
        break;
      case 'firefox':
        this.applyFirefoxOptimizations();
        break;
      case 'safari':
        this.applySafariOptimizations();
        break;
      case 'edge':
        this.applyEdgeOptimizations();
        break;
      case 'edge-legacy':
        this.applyEdgeLegacyOptimizations();
        break;
      case 'ie':
        this.applyIEOptimizations();
        break;
    }
  }

  /**
   * Chrome-specific optimizations
   */
  applyChromeOptimizations() {
    const style = document.createElement('style');
    style.textContent = `
      .chrome-optimized {
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
        -webkit-perspective: 1000px;
        perspective: 1000px;
        -webkit-transform-style: preserve-3d;
        transform-style: preserve-3d;
      }
      
      .chrome-text-rendering {
        -webkit-font-smoothing: antialiased;
        text-rendering: optimizeLegibility;
      }
      
      .chrome-scroll-optimized {
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
    
    // Enable Chrome-specific features
    document.body.classList.add('chrome-optimized');
  }

  /**
   * Firefox-specific optimizations
   */
  applyFirefoxOptimizations() {
    const style = document.createElement('style');
    style.textContent = `
      .firefox-optimized {
        -moz-backface-visibility: hidden;
        backface-visibility: hidden;
        -moz-transform-style: preserve-3d;
        transform-style: preserve-3d;
      }
      
      .firefox-text-rendering {
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeSpeed;
      }
      
      .firefox-scroll-optimized {
        scrollbar-width: thin;
        scrollbar-color: var(--matrix-green) var(--terminal-black);
      }
    `;
    document.head.appendChild(style);
    
    document.body.classList.add('firefox-optimized');
  }

  /**
   * Safari-specific optimizations
   */
  applySafariOptimizations() {
    const style = document.createElement('style');
    style.textContent = `
      .safari-optimized {
        -webkit-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        backface-visibility: hidden;
      }
      
      .safari-text-rendering {
        -webkit-font-smoothing: subpixel-antialiased;
      }
      
      .safari-scroll-optimized {
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);
    
    document.body.classList.add('safari-optimized');
  }

  /**
   * Edge (Chromium) optimizations
   */
  applyEdgeOptimizations() {
    // Use Chrome optimizations for Chromium-based Edge
    this.applyChromeOptimizations();
    document.body.classList.add('edge-chromium');
  }

  /**
   * Edge Legacy optimizations
   */
  applyEdgeLegacyOptimizations() {
    const style = document.createElement('style');
    style.textContent = `
      .edge-legacy-fallback {
        /* Simplified effects for Edge Legacy */
        animation: none;
        transition: opacity 0.3s ease;
        filter: none;
      }
      
      .edge-legacy-grid-fallback {
        display: flex;
        flex-wrap: wrap;
      }
    `;
    document.head.appendChild(style);
    
    document.body.classList.add('edge-legacy-fallback');
  }

  /**
   * Internet Explorer optimizations
   */
  applyIEOptimizations() {
    const style = document.createElement('style');
    style.textContent = `
      .ie-fallback {
        /* Disable all modern effects */
        animation: none !important;
        transition: none !important;
        transform: none !important;
        filter: none !important;
        backdrop-filter: none !important;
      }
      
      .ie-layout-fallback {
        display: table;
        width: 100%;
      }
      
      .ie-layout-fallback > * {
        display: table-cell;
        vertical-align: top;
      }
    `;
    document.head.appendChild(style);
    
    document.body.classList.add('ie-fallback');
    
    // Show warning for IE users
    this.showIEWarning();
  }

  /**
   * Load required polyfills
   */
  loadRequiredPolyfills() {
    const polyfillsNeeded = [];
    
    // Check for required polyfills
    if (!this.features.intersectionObserver) {
      polyfillsNeeded.push('intersection-observer');
    }
    
    if (!this.features.resizeObserver) {
      polyfillsNeeded.push('resize-observer');
    }
    
    if (!this.features.requestAnimationFrame) {
      polyfillsNeeded.push('raf');
    }
    
    if (!this.features.cssCustomProperties) {
      polyfillsNeeded.push('css-custom-properties');
    }
    
    if (!this.features.fetch) {
      polyfillsNeeded.push('fetch');
    }
    
    // Load polyfills
    polyfillsNeeded.forEach(polyfill => {
      this.loadPolyfill(polyfill);
    });
    
    if (polyfillsNeeded.length > 0) {
      console.log('🔧 Loaded polyfills:', polyfillsNeeded);
    }
  }

  /**
   * Load a specific polyfill
   */
  loadPolyfill(name) {
    switch (name) {
      case 'intersection-observer':
        this.polyfills.set(name, this.intersectionObserverPolyfill());
        break;
      case 'resize-observer':
        this.polyfills.set(name, this.resizeObserverPolyfill());
        break;
      case 'raf':
        this.polyfills.set(name, this.rafPolyfill());
        break;
      case 'css-custom-properties':
        this.polyfills.set(name, this.cssCustomPropertiesPolyfill());
        break;
      case 'fetch':
        this.polyfills.set(name, this.fetchPolyfill());
        break;
    }
  }

  /**
   * IntersectionObserver polyfill
   */
  intersectionObserverPolyfill() {
    if ('IntersectionObserver' in window) return;
    
    // Simple polyfill for basic functionality
    window.IntersectionObserver = class {
      constructor(callback, options = {}) {
        this.callback = callback;
        this.options = options;
        this.elements = new Set();
      }
      
      observe(element) {
        this.elements.add(element);
        // Simplified implementation - always consider elements as intersecting
        setTimeout(() => {
          this.callback([{
            target: element,
            isIntersecting: true,
            intersectionRatio: 1
          }]);
        }, 0);
      }
      
      unobserve(element) {
        this.elements.delete(element);
      }
      
      disconnect() {
        this.elements.clear();
      }
    };
  }

  /**
   * ResizeObserver polyfill
   */
  resizeObserverPolyfill() {
    if ('ResizeObserver' in window) return;
    
    window.ResizeObserver = class {
      constructor(callback) {
        this.callback = callback;
        this.elements = new Set();
        this.resizeHandler = () => {
          const entries = Array.from(this.elements).map(element => ({
            target: element,
            contentRect: element.getBoundingClientRect()
          }));
          this.callback(entries);
        };
        window.addEventListener('resize', this.resizeHandler);
      }
      
      observe(element) {
        this.elements.add(element);
      }
      
      unobserve(element) {
        this.elements.delete(element);
      }
      
      disconnect() {
        this.elements.clear();
        window.removeEventListener('resize', this.resizeHandler);
      }
    };
  }

  /**
   * RequestAnimationFrame polyfill
   */
  rafPolyfill() {
    if ('requestAnimationFrame' in window) return;
    
    let lastTime = 0;
    window.requestAnimationFrame = function(callback) {
      const currTime = new Date().getTime();
      const timeToCall = Math.max(0, 16 - (currTime - lastTime));
      const id = window.setTimeout(() => {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
    
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

  /**
   * CSS Custom Properties polyfill
   */
  cssCustomPropertiesPolyfill() {
    if (CSS.supports('--test', 'value')) return;
    
    // Simple fallback - apply hardcoded values
    const style = document.createElement('style');
    style.textContent = `
      :root {
        /* Fallback values for CSS custom properties */
      }
      
      .terminal-text {
        color: #00FF00;
      }
      
      .matrix-green {
        color: #00FF00;
      }
      
      .terminal-black {
        background-color: #000000;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Fetch polyfill
   */
  fetchPolyfill() {
    if ('fetch' in window) return;
    
    // Simple XMLHttpRequest-based fetch polyfill
    window.fetch = function(url, options = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);
        
        if (options.headers) {
          Object.keys(options.headers).forEach(key => {
            xhr.setRequestHeader(key, options.headers[key]);
          });
        }
        
        xhr.onload = () => {
          resolve({
            ok: xhr.status >= 200 && xhr.status < 300,
            status: xhr.status,
            text: () => Promise.resolve(xhr.responseText),
            json: () => Promise.resolve(JSON.parse(xhr.responseText))
          });
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(options.body);
      });
    };
  }

  /**
   * Setup feature detection classes
   */
  setupFeatureDetection() {
    const body = document.body;
    
    // Add feature classes
    Object.keys(this.features).forEach(feature => {
      if (this.features[feature]) {
        body.classList.add(`supports-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      } else {
        body.classList.add(`no-${feature.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
      }
    });
  }

  /**
   * Apply compatibility classes
   */
  applyCompatibilityClasses() {
    const body = document.body;
    
    // Add version classes
    body.classList.add(`${this.browser.name}-${this.browser.version}`);
    
    // Add capability classes
    if (this.features.webGL) {
      body.classList.add('webgl-enabled');
    } else {
      body.classList.add('webgl-disabled');
    }
    
    if (this.features.touchEvents) {
      body.classList.add('touch-enabled');
    } else {
      body.classList.add('touch-disabled');
    }
    
    if (this.features.cssTransforms3D) {
      body.classList.add('transforms-3d-enabled');
    } else {
      body.classList.add('transforms-3d-disabled');
    }
  }

  /**
   * Show IE warning
   */
  showIEWarning() {
    const warning = document.createElement('div');
    warning.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ff0000;
        color: #ffffff;
        padding: 10px;
        text-align: center;
        z-index: 10000;
        font-family: monospace;
      ">
        ⚠️ Internet Explorer is not supported. Please use a modern browser for the best experience.
        <button onclick="this.parentElement.remove()" style="margin-left: 10px; background: #ffffff; color: #000000; border: none; padding: 5px 10px;">Close</button>
      </div>
    `;
    document.body.appendChild(warning);
  }

  /**
   * Get compatibility report
   */
  getCompatibilityReport() {
    return {
      browser: this.browser,
      features: this.features,
      polyfills: Array.from(this.polyfills.keys()),
      recommendations: this.getRecommendations()
    };
  }

  /**
   * Get browser recommendations
   */
  getRecommendations() {
    const recommendations = [];
    
    if (!this.browser.isModern) {
      recommendations.push('Consider upgrading to a modern browser for better performance');
    }
    
    if (!this.features.webGL) {
      recommendations.push('WebGL is not supported - 3D effects will be disabled');
    }
    
    if (!this.features.cssBackdropFilter) {
      recommendations.push('Backdrop filter not supported - using fallback background');
    }
    
    if (!this.features.intersectionObserver) {
      recommendations.push('Using IntersectionObserver polyfill - performance may be reduced');
    }
    
    return recommendations;
  }

  /**
   * Test browser performance
   */
  testPerformance() {
    return new Promise((resolve) => {
      const start = performance.now();
      let frames = 0;
      
      const testFrame = () => {
        frames++;
        const elapsed = performance.now() - start;
        
        if (elapsed >= 1000) {
          resolve({
            fps: frames,
            isHighPerformance: frames >= 55,
            isMediumPerformance: frames >= 30,
            isLowPerformance: frames < 30
          });
        } else {
          requestAnimationFrame(testFrame);
        }
      };
      
      requestAnimationFrame(testFrame);
    });
  }
}

export default BrowserCompatibility;