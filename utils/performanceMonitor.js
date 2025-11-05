/**
 * VibeScreen Performance Monitor
 * Monitors visual effects and theme transitions for 60fps performance
 */

class PerformanceMonitor {
  constructor(options = {}) {
    this.isEnabled = options.enabled !== false;
    this.targetFPS = options.targetFPS || 60;
    this.sampleSize = options.sampleSize || 60; // Number of frames to average
    this.warningThreshold = options.warningThreshold || 50; // FPS warning threshold
    this.criticalThreshold = options.criticalThreshold || 30; // FPS critical threshold
    
    // Performance tracking
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.frameTimes = [];
    this.currentFPS = 0;
    this.averageFPS = 0;
    
    // Memory tracking
    this.memoryBaseline = 0;
    this.memoryPeak = 0;
    this.memoryWarningThreshold = 50 * 1024 * 1024; // 50MB
    
    // Animation tracking
    this.activeAnimations = new Set();
    this.animationPerformance = new Map();
    
    // Theme transition tracking
    this.themeTransitionStart = 0;
    this.themeTransitionDuration = 0;
    
    // Device capabilities
    this.deviceCapabilities = this.detectDeviceCapabilities();
    
    // Performance recommendations
    this.recommendations = [];
    
    // Callbacks
    this.onPerformanceUpdate = options.onPerformanceUpdate || (() => {});
    this.onPerformanceWarning = options.onPerformanceWarning || (() => {});
    this.onPerformanceCritical = options.onPerformanceCritical || (() => {});
    
    // Initialize
    if (this.isEnabled) {
      this.initialize();
    }
  }

  /**
   * Initialize performance monitoring
   */
  initialize() {
    // Set up frame rate monitoring
    this.startFrameRateMonitoring();
    
    // Set up memory monitoring
    this.startMemoryMonitoring();
    
    // Set up animation monitoring
    this.startAnimationMonitoring();
    
    // Set up intersection observer for viewport optimizations
    this.setupViewportOptimizations();
    
    // Apply initial optimizations based on device capabilities
    this.applyDeviceOptimizations();
    
    console.log('🔍 PerformanceMonitor initialized', {
      targetFPS: this.targetFPS,
      deviceCapabilities: this.deviceCapabilities
    });
  }

  /**
   * Detect device capabilities
   */
  detectDeviceCapabilities() {
    const capabilities = {
      // Hardware detection
      cores: navigator.hardwareConcurrency || 2,
      memory: navigator.deviceMemory || 4,
      connection: navigator.connection?.effectiveType || '4g',
      
      // Display capabilities
      pixelRatio: window.devicePixelRatio || 1,
      refreshRate: this.detectRefreshRate(),
      screenSize: {
        width: screen.width,
        height: screen.height
      },
      
      // Browser capabilities
      supportsWillChange: CSS.supports('will-change', 'transform'),
      supportsContainment: CSS.supports('contain', 'layout'),
      supportsBackdropFilter: CSS.supports('backdrop-filter', 'blur(5px)') || 
                              CSS.supports('-webkit-backdrop-filter', 'blur(5px)'),
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      supportsPerformanceObserver: 'PerformanceObserver' in window,
      
      // Performance indicators
      isLowEndDevice: this.isLowEndDevice(),
      isBatteryConstrained: this.isBatteryConstrained(),
      isSlowConnection: this.isSlowConnection()
    };
    
    return capabilities;
  }

  /**
   * Detect refresh rate (approximate)
   */
  detectRefreshRate() {
    return new Promise((resolve) => {
      let start = performance.now();
      let frames = 0;
      
      const measureFrame = () => {
        frames++;
        const now = performance.now();
        
        if (now - start >= 1000) {
          resolve(frames);
        } else {
          requestAnimationFrame(measureFrame);
        }
      };
      
      requestAnimationFrame(measureFrame);
    });
  }

  /**
   * Check if device is low-end
   */
  isLowEndDevice() {
    const cores = navigator.hardwareConcurrency || 2;
    const memory = navigator.deviceMemory || 4;
    
    return cores <= 2 || memory <= 2;
  }

  /**
   * Check if battery is constrained
   */
  isBatteryConstrained() {
    if ('getBattery' in navigator) {
      return navigator.getBattery().then(battery => {
        return !battery.charging && battery.level < 0.2;
      });
    }
    return false;
  }

  /**
   * Check if connection is slow
   */
  isSlowConnection() {
    if (navigator.connection) {
      const connection = navigator.connection;
      return connection.effectiveType === 'slow-2g' || 
             connection.effectiveType === '2g' ||
             connection.saveData === true;
    }
    return false;
  }

  /**
   * Start frame rate monitoring
   */
  startFrameRateMonitoring() {
    const measureFrame = (timestamp) => {
      if (this.lastTime) {
        const delta = timestamp - this.lastTime;
        const fps = 1000 / delta;
        
        this.frameTimes.push(fps);
        
        // Keep only recent samples
        if (this.frameTimes.length > this.sampleSize) {
          this.frameTimes.shift();
        }
        
        // Calculate current and average FPS
        this.currentFPS = fps;
        this.averageFPS = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        
        // Check for performance issues
        this.checkPerformanceThresholds();
        
        // Update performance display
        this.updatePerformanceDisplay();
      }
      
      this.lastTime = timestamp;
      this.frameCount++;
      
      if (this.isEnabled) {
        requestAnimationFrame(measureFrame);
      }
    };
    
    requestAnimationFrame(measureFrame);
  }

  /**
   * Start memory monitoring
   */
  startMemoryMonitoring() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = performance.memory;
        const currentUsage = memory.usedJSHeapSize;
        
        if (this.memoryBaseline === 0) {
          this.memoryBaseline = currentUsage;
        }
        
        if (currentUsage > this.memoryPeak) {
          this.memoryPeak = currentUsage;
        }
        
        // Check for memory leaks
        const memoryIncrease = currentUsage - this.memoryBaseline;
        if (memoryIncrease > this.memoryWarningThreshold) {
          this.onPerformanceWarning({
            type: 'memory',
            message: 'High memory usage detected',
            current: currentUsage,
            baseline: this.memoryBaseline,
            increase: memoryIncrease
          });
        }
        
        setTimeout(checkMemory, 5000); // Check every 5 seconds
      };
      
      checkMemory();
    }
  }

  /**
   * Start animation monitoring
   */
  startAnimationMonitoring() {
    // Monitor CSS animations
    document.addEventListener('animationstart', (event) => {
      const animationName = event.animationName;
      const element = event.target;
      
      this.activeAnimations.add({
        name: animationName,
        element: element,
        startTime: performance.now()
      });
    });
    
    document.addEventListener('animationend', (event) => {
      const animationName = event.animationName;
      const endTime = performance.now();
      
      // Find and remove the animation
      for (const animation of this.activeAnimations) {
        if (animation.name === animationName && animation.element === event.target) {
          const duration = endTime - animation.startTime;
          
          // Track animation performance
          if (!this.animationPerformance.has(animationName)) {
            this.animationPerformance.set(animationName, []);
          }
          
          this.animationPerformance.get(animationName).push(duration);
          this.activeAnimations.delete(animation);
          break;
        }
      }
    });
  }

  /**
   * Setup viewport optimizations using Intersection Observer
   */
  setupViewportOptimizations() {
    if (!this.deviceCapabilities.supportsIntersectionObserver) {
      return;
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target;
        
        if (entry.isIntersecting) {
          // Element is in viewport - enable animations
          element.classList.add('in-viewport');
          element.classList.remove('out-of-viewport');
          
          // Resume paused animations
          if (element.classList.contains('lazy-animate')) {
            element.style.animationPlayState = 'running';
          }
        } else {
          // Element is out of viewport - optimize
          element.classList.remove('in-viewport');
          element.classList.add('out-of-viewport');
          
          // Pause animations to save resources
          if (element.classList.contains('lazy-animate')) {
            element.style.animationPlayState = 'paused';
          }
        }
      });
    }, {
      rootMargin: '50px', // Start optimizing 50px before element enters viewport
      threshold: 0.1
    });
    
    // Observe all animatable elements
    document.querySelectorAll('.lazy-animate, .message-popup, .terminal-effects').forEach(el => {
      observer.observe(el);
    });
    
    this.viewportObserver = observer;
  }

  /**
   * Apply device-specific optimizations
   */
  applyDeviceOptimizations() {
    const body = document.body;
    const capabilities = this.deviceCapabilities;
    
    // Apply performance class based on device capabilities
    if (capabilities.isLowEndDevice) {
      body.classList.add('quality-low', 'mobile-performance');
      this.recommendations.push('Applied low-quality mode for better performance on low-end device');
    } else if (capabilities.cores <= 4 || capabilities.memory <= 4) {
      body.classList.add('quality-medium', 'performance-optimized');
      this.recommendations.push('Applied medium-quality mode for balanced performance');
    } else {
      body.classList.add('quality-high', 'gpu-accelerated');
      this.recommendations.push('Applied high-quality mode for capable device');
    }
    
    // Apply connection-based optimizations
    if (capabilities.isSlowConnection) {
      body.classList.add('data-saver-performance');
      this.recommendations.push('Applied data-saver optimizations for slow connection');
    }
    
    // Apply refresh rate optimizations
    if (capabilities.refreshRate > 60) {
      body.classList.add('high-refresh-optimized');
      this.recommendations.push(`Optimized for ${capabilities.refreshRate}Hz display`);
    }
    
    // Apply browser-specific optimizations
    if (navigator.userAgent.includes('Chrome')) {
      body.classList.add('chrome-optimized');
    } else if (navigator.userAgent.includes('Firefox')) {
      body.classList.add('firefox-optimized');
    } else if (navigator.userAgent.includes('Safari')) {
      body.classList.add('safari-optimized');
    }
  }

  /**
   * Check performance thresholds and trigger warnings
   */
  checkPerformanceThresholds() {
    const avgFPS = this.averageFPS;
    
    if (avgFPS < this.criticalThreshold) {
      this.onPerformanceCritical({
        type: 'fps',
        message: 'Critical performance issue detected',
        currentFPS: this.currentFPS,
        averageFPS: avgFPS,
        targetFPS: this.targetFPS
      });
      
      // Apply emergency optimizations
      this.applyEmergencyOptimizations();
      
    } else if (avgFPS < this.warningThreshold) {
      this.onPerformanceWarning({
        type: 'fps',
        message: 'Performance warning',
        currentFPS: this.currentFPS,
        averageFPS: avgFPS,
        targetFPS: this.targetFPS
      });
      
      // Apply moderate optimizations
      this.applyModerateOptimizations();
    }
  }

  /**
   * Apply emergency performance optimizations
   */
  applyEmergencyOptimizations() {
    const body = document.body;
    
    // Switch to minimal quality
    body.classList.remove('quality-high', 'quality-medium');
    body.classList.add('quality-low');
    
    // Disable complex effects
    body.classList.add('no-animation');
    
    // Pause non-critical animations
    document.querySelectorAll('.message-popup, .terminal-effects').forEach(el => {
      el.style.animationPlayState = 'paused';
    });
    
    this.recommendations.push('Applied emergency optimizations due to critical performance issues');
    
    console.warn('🚨 Emergency performance optimizations applied');
  }

  /**
   * Apply moderate performance optimizations
   */
  applyModerateOptimizations() {
    const body = document.body;
    
    // Switch to medium quality if not already
    if (body.classList.contains('quality-high')) {
      body.classList.remove('quality-high');
      body.classList.add('quality-medium');
      
      this.recommendations.push('Reduced quality to medium due to performance warning');
    }
    
    // Reduce animation complexity
    document.querySelectorAll('.phosphor-glow-bright').forEach(el => {
      el.classList.remove('phosphor-glow-bright');
      el.classList.add('phosphor-glow');
    });
    
    console.warn('⚠️ Moderate performance optimizations applied');
  }

  /**
   * Monitor theme transition performance
   */
  startThemeTransition() {
    this.themeTransitionStart = performance.now();
  }

  /**
   * End theme transition monitoring
   */
  endThemeTransition() {
    if (this.themeTransitionStart) {
      this.themeTransitionDuration = performance.now() - this.themeTransitionStart;
      
      // Check if transition was too slow
      if (this.themeTransitionDuration > 1000) { // 1 second threshold
        this.onPerformanceWarning({
          type: 'theme-transition',
          message: 'Slow theme transition detected',
          duration: this.themeTransitionDuration
        });
      }
      
      this.themeTransitionStart = 0;
    }
  }

  /**
   * Update performance display
   */
  updatePerformanceDisplay() {
    // Update performance monitor UI if it exists
    const monitor = document.querySelector('.performance-monitor');
    if (monitor) {
      const fpsElement = monitor.querySelector('[data-metric="fps"]');
      const memoryElement = monitor.querySelector('[data-metric="memory"]');
      const animationsElement = monitor.querySelector('[data-metric="animations"]');
      
      if (fpsElement) {
        fpsElement.textContent = `${Math.round(this.averageFPS)} fps`;
        fpsElement.setAttribute('data-status', this.getFPSStatus());
      }
      
      if (memoryElement && 'memory' in performance) {
        const memory = performance.memory;
        const memoryMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        memoryElement.textContent = `${memoryMB} MB`;
        memoryElement.setAttribute('data-status', this.getMemoryStatus());
      }
      
      if (animationsElement) {
        animationsElement.textContent = `${this.activeAnimations.size} active`;
        animationsElement.setAttribute('data-status', this.getAnimationStatus());
      }
    }
    
    // Trigger callback
    this.onPerformanceUpdate({
      fps: {
        current: this.currentFPS,
        average: this.averageFPS,
        target: this.targetFPS
      },
      memory: 'memory' in performance ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      } : null,
      animations: {
        active: this.activeAnimations.size,
        performance: Object.fromEntries(this.animationPerformance)
      },
      recommendations: this.recommendations
    });
  }

  /**
   * Get FPS status for UI
   */
  getFPSStatus() {
    if (this.averageFPS >= this.targetFPS * 0.9) return 'good';
    if (this.averageFPS >= this.warningThreshold) return 'warning';
    return 'critical';
  }

  /**
   * Get memory status for UI
   */
  getMemoryStatus() {
    if (!('memory' in performance)) return 'unknown';
    
    const memory = performance.memory;
    const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    if (usageRatio < 0.5) return 'good';
    if (usageRatio < 0.8) return 'warning';
    return 'critical';
  }

  /**
   * Get animation status for UI
   */
  getAnimationStatus() {
    const activeCount = this.activeAnimations.size;
    
    if (activeCount <= 5) return 'good';
    if (activeCount <= 10) return 'warning';
    return 'critical';
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      fps: {
        current: this.currentFPS,
        average: this.averageFPS,
        target: this.targetFPS,
        status: this.getFPSStatus()
      },
      memory: 'memory' in performance ? {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        baseline: this.memoryBaseline,
        peak: this.memoryPeak,
        status: this.getMemoryStatus()
      } : null,
      animations: {
        active: this.activeAnimations.size,
        performance: Object.fromEntries(this.animationPerformance),
        status: this.getAnimationStatus()
      },
      device: this.deviceCapabilities,
      recommendations: this.recommendations,
      themeTransitionDuration: this.themeTransitionDuration
    };
  }

  /**
   * Enable performance monitoring
   */
  enable() {
    if (!this.isEnabled) {
      this.isEnabled = true;
      this.initialize();
    }
  }

  /**
   * Disable performance monitoring
   */
  disable() {
    this.isEnabled = false;
    
    // Clean up observers
    if (this.viewportObserver) {
      this.viewportObserver.disconnect();
    }
    
    // Reset performance classes
    document.body.classList.remove(
      'quality-high', 'quality-medium', 'quality-low',
      'performance-optimized', 'gpu-accelerated', 'mobile-performance'
    );
  }

  /**
   * Reset performance monitoring
   */
  reset() {
    this.frameCount = 0;
    this.frameTimes = [];
    this.currentFPS = 0;
    this.averageFPS = 0;
    this.memoryBaseline = 0;
    this.memoryPeak = 0;
    this.activeAnimations.clear();
    this.animationPerformance.clear();
    this.recommendations = [];
    this.themeTransitionStart = 0;
    this.themeTransitionDuration = 0;
  }
}

export default PerformanceMonitor;