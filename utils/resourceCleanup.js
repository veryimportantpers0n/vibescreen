/**
 * Resource cleanup utilities for Three.js and mode loading system
 * Provides comprehensive memory management and resource disposal
 */

/**
 * Three.js resource cleanup utilities
 */
export class ThreeJSResourceManager {
  constructor() {
    this.trackedResources = new Map();
    this.activeContexts = new Set();
    this.memoryStats = {
      geometries: 0,
      materials: 0,
      textures: 0,
      renderers: 0,
      totalMemoryMB: 0
    };
  }

  /**
   * Track a Three.js resource for cleanup
   */
  trackResource(id, resource, type) {
    this.trackedResources.set(id, {
      resource,
      type,
      createdAt: Date.now(),
      memoryEstimate: this.estimateResourceMemory(resource, type)
    });

    // Update memory stats
    this.updateMemoryStats();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Tracking ${type} resource: ${id} (${this.trackedResources.size} total)`);
    }
  }

  /**
   * Estimate memory usage of a Three.js resource
   */
  estimateResourceMemory(resource, type) {
    try {
      switch (type) {
        case 'geometry':
          if (resource.attributes) {
            let size = 0;
            Object.values(resource.attributes).forEach(attr => {
              if (attr.array) {
                size += attr.array.byteLength;
              }
            });
            return size;
          }
          return 1024; // Default estimate

        case 'material':
          let materialSize = 512; // Base material size
          if (resource.map) materialSize += 1024 * 1024; // Texture estimate
          if (resource.normalMap) materialSize += 1024 * 1024;
          if (resource.roughnessMap) materialSize += 512 * 512;
          return materialSize;

        case 'texture':
          if (resource.image) {
            const width = resource.image.width || 512;
            const height = resource.image.height || 512;
            const channels = 4; // RGBA
            return width * height * channels;
          }
          return 512 * 512 * 4; // Default texture estimate

        case 'renderer':
          return 10 * 1024 * 1024; // 10MB estimate for renderer

        default:
          return 1024; // 1KB default
      }
    } catch (error) {
      console.warn('Failed to estimate resource memory:', error);
      return 1024;
    }
  }

  /**
   * Update memory statistics
   */
  updateMemoryStats() {
    const stats = {
      geometries: 0,
      materials: 0,
      textures: 0,
      renderers: 0,
      totalMemoryMB: 0
    };

    for (const [id, tracked] of this.trackedResources) {
      stats[tracked.type + 's'] = (stats[tracked.type + 's'] || 0) + 1;
      stats.totalMemoryMB += tracked.memoryEstimate;
    }

    stats.totalMemoryMB = Math.round(stats.totalMemoryMB / 1024 / 1024 * 100) / 100;
    this.memoryStats = stats;
  }

  /**
   * Dispose of a specific resource
   */
  disposeResource(id) {
    const tracked = this.trackedResources.get(id);
    if (!tracked) return false;

    try {
      const { resource, type } = tracked;

      switch (type) {
        case 'geometry':
          if (resource.dispose) {
            resource.dispose();
          }
          break;

        case 'material':
          if (resource.dispose) {
            resource.dispose();
          }
          // Dispose of material textures
          ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'].forEach(prop => {
            if (resource[prop] && resource[prop].dispose) {
              resource[prop].dispose();
            }
          });
          break;

        case 'texture':
          if (resource.dispose) {
            resource.dispose();
          }
          break;

        case 'renderer':
          if (resource.dispose) {
            resource.dispose();
          }
          // Force WebGL context loss
          if (resource.domElement) {
            const gl = resource.domElement.getContext('webgl') || 
                      resource.domElement.getContext('experimental-webgl');
            if (gl) {
              const loseContext = gl.getExtension('WEBGL_lose_context');
              if (loseContext) {
                loseContext.loseContext();
              }
            }
          }
          break;
      }

      this.trackedResources.delete(id);
      this.updateMemoryStats();

      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Disposed ${type} resource: ${id}`);
      }

      return true;
    } catch (error) {
      console.error(`Failed to dispose resource ${id}:`, error);
      return false;
    }
  }

  /**
   * Dispose of all resources for a specific mode
   */
  disposeModeResources(modeId) {
    const modeResources = Array.from(this.trackedResources.keys())
      .filter(id => id.startsWith(`${modeId}-`));

    let disposedCount = 0;
    modeResources.forEach(id => {
      if (this.disposeResource(id)) {
        disposedCount++;
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`🧹 Disposed ${disposedCount} resources for mode: ${modeId}`);
    }

    return disposedCount;
  }

  /**
   * Dispose of all tracked resources
   */
  disposeAllResources() {
    const resourceIds = Array.from(this.trackedResources.keys());
    let disposedCount = 0;

    resourceIds.forEach(id => {
      if (this.disposeResource(id)) {
        disposedCount++;
      }
    });

    // Clear active contexts
    this.activeContexts.clear();

    if (process.env.NODE_ENV === 'development') {
      console.log(`🧹 Disposed all ${disposedCount} tracked resources`);
    }

    return disposedCount;
  }

  /**
   * Force garbage collection if available
   */
  forceGarbageCollection() {
    if (window.gc) {
      window.gc();
      console.log('🗑️ Forced garbage collection');
    } else if (process.env.NODE_ENV === 'development') {
      console.log('💡 Garbage collection not available. Run Chrome with --js-flags="--expose-gc" to enable.');
    }
  }

  /**
   * Get memory statistics
   */
  getMemoryStats() {
    return {
      ...this.memoryStats,
      trackedResources: this.trackedResources.size,
      activeContexts: this.activeContexts.size,
      browserMemory: this.getBrowserMemoryInfo()
    };
  }

  /**
   * Get browser memory information if available
   */
  getBrowserMemoryInfo() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
        pressure: Math.round(performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100)
      };
    }
    return null;
  }

  /**
   * Check if memory usage is high
   */
  isMemoryPressureHigh() {
    const browserMemory = this.getBrowserMemoryInfo();
    if (browserMemory) {
      return browserMemory.pressure > 80; // 80% threshold
    }
    
    // Fallback: check if we have too many tracked resources
    return this.trackedResources.size > 100 || this.memoryStats.totalMemoryMB > 50;
  }

  /**
   * Cleanup old or unused resources
   */
  cleanupOldResources(maxAge = 300000) { // 5 minutes default
    const now = Date.now();
    const oldResources = [];

    for (const [id, tracked] of this.trackedResources) {
      if (now - tracked.createdAt > maxAge) {
        oldResources.push(id);
      }
    }

    let cleanedCount = 0;
    oldResources.forEach(id => {
      if (this.disposeResource(id)) {
        cleanedCount++;
      }
    });

    if (cleanedCount > 0 && process.env.NODE_ENV === 'development') {
      console.log(`🧹 Cleaned up ${cleanedCount} old resources`);
    }

    return cleanedCount;
  }

  /**
   * Register WebGL context for tracking
   */
  registerWebGLContext(canvas, contextId) {
    this.activeContexts.add(contextId);
    
    // Add context lost event listener
    canvas.addEventListener('webglcontextlost', (event) => {
      console.warn(`WebGL context lost: ${contextId}`);
      this.activeContexts.delete(contextId);
    });

    // Add context restored event listener
    canvas.addEventListener('webglcontextrestored', (event) => {
      console.log(`WebGL context restored: ${contextId}`);
      this.activeContexts.add(contextId);
    });
  }

  /**
   * Force lose WebGL context
   */
  loseWebGLContext(canvas) {
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const loseContext = gl.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to lose WebGL context:', error);
    }
    return false;
  }
}

/**
 * Component cache memory manager
 */
export class ComponentCacheManager {
  constructor(maxMemoryMB = 50) {
    this.maxMemoryMB = maxMemoryMB;
    this.cache = new Map();
    this.memoryUsage = new Map();
    this.accessTimes = new Map();
    this.totalMemoryMB = 0;
  }

  /**
   * Estimate component memory usage
   */
  estimateComponentMemory(component) {
    try {
      // Base component size
      let size = 5000; // 5KB base

      if (component.scene) {
        size += 15000; // Scene components are larger
      }

      if (component.character) {
        size += 10000; // Character components
      }

      if (component.config) {
        size += JSON.stringify(component.config).length;
      }

      if (component.messages) {
        size += JSON.stringify(component.messages).length;
      }

      return size;
    } catch (error) {
      console.warn('Failed to estimate component memory:', error);
      return 5000; // Default estimate
    }
  }

  /**
   * Add component to cache with memory tracking
   */
  set(key, component) {
    const memorySize = this.estimateComponentMemory(component);
    
    // Check if adding this component would exceed memory limit
    if (this.totalMemoryMB + (memorySize / 1024 / 1024) > this.maxMemoryMB) {
      this.evictLRU();
    }

    this.cache.set(key, component);
    this.memoryUsage.set(key, memorySize);
    this.accessTimes.set(key, Date.now());
    this.updateTotalMemory();

    if (process.env.NODE_ENV === 'development') {
      console.log(`💾 Cached component: ${key} (${Math.round(memorySize / 1024)}KB)`);
    }
  }

  /**
   * Get component from cache
   */
  get(key) {
    if (this.cache.has(key)) {
      this.accessTimes.set(key, Date.now());
      return this.cache.get(key);
    }
    return null;
  }

  /**
   * Remove component from cache
   */
  delete(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.memoryUsage.delete(key);
      this.accessTimes.delete(key);
      this.updateTotalMemory();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🗑️ Removed from cache: ${key}`);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Evict least recently used item
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      console.log(`🗑️ Evicted LRU component: ${oldestKey}`);
    }
  }

  /**
   * Update total memory calculation
   */
  updateTotalMemory() {
    this.totalMemoryMB = Array.from(this.memoryUsage.values())
      .reduce((sum, size) => sum + size, 0) / 1024 / 1024;
  }

  /**
   * Clear all cached components
   */
  clear() {
    const count = this.cache.size;
    this.cache.clear();
    this.memoryUsage.clear();
    this.accessTimes.clear();
    this.totalMemoryMB = 0;

    if (process.env.NODE_ENV === 'development') {
      console.log(`🧹 Cleared ${count} cached components`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      totalMemoryMB: Math.round(this.totalMemoryMB * 100) / 100,
      maxMemoryMB: this.maxMemoryMB,
      memoryUsagePercent: Math.round((this.totalMemoryMB / this.maxMemoryMB) * 100),
      keys: Array.from(this.cache.keys()),
      oldestAccess: Math.min(...Array.from(this.accessTimes.values())),
      newestAccess: Math.max(...Array.from(this.accessTimes.values()))
    };
  }

  /**
   * Cleanup old components
   */
  cleanupOld(maxAge = 600000) { // 10 minutes default
    const now = Date.now();
    const oldKeys = [];

    for (const [key, time] of this.accessTimes) {
      if (now - time > maxAge) {
        oldKeys.push(key);
      }
    }

    oldKeys.forEach(key => this.delete(key));
    
    if (oldKeys.length > 0 && process.env.NODE_ENV === 'development') {
      console.log(`🧹 Cleaned up ${oldKeys.length} old cached components`);
    }

    return oldKeys.length;
  }
}

/**
 * Memory monitoring system
 */
export class MemoryMonitor {
  constructor(options = {}) {
    this.options = {
      checkInterval: 30000, // 30 seconds
      warningThreshold: 70, // 70% memory usage
      criticalThreshold: 85, // 85% memory usage
      ...options
    };

    this.isMonitoring = false;
    this.intervalId = null;
    this.memoryHistory = [];
    this.maxHistoryLength = 100;
    this.callbacks = {
      warning: [],
      critical: [],
      normal: []
    };
  }

  /**
   * Start memory monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.intervalId = setInterval(() => {
      this.checkMemoryUsage();
    }, this.options.checkInterval);

    console.log('📊 Memory monitoring started');
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('📊 Memory monitoring stopped');
  }

  /**
   * Check current memory usage
   */
  checkMemoryUsage() {
    const memoryInfo = this.getMemoryInfo();
    
    // Add to history
    this.memoryHistory.push({
      ...memoryInfo,
      timestamp: Date.now()
    });

    // Maintain history length
    if (this.memoryHistory.length > this.maxHistoryLength) {
      this.memoryHistory.shift();
    }

    // Check thresholds and trigger callbacks
    this.checkThresholds(memoryInfo);

    return memoryInfo;
  }

  /**
   * Get comprehensive memory information
   */
  getMemoryInfo() {
    const info = {
      timestamp: Date.now(),
      browserMemory: null,
      memoryPressure: 0,
      status: 'normal'
    };

    // Browser memory info
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.totalJSHeapSize;
      const limit = performance.memory.jsHeapSizeLimit;

      info.browserMemory = {
        used: Math.round(used / 1024 / 1024),
        total: Math.round(total / 1024 / 1024),
        limit: Math.round(limit / 1024 / 1024),
        usedPercent: Math.round((used / limit) * 100)
      };

      info.memoryPressure = info.browserMemory.usedPercent;
    }

    // Determine status
    if (info.memoryPressure >= this.options.criticalThreshold) {
      info.status = 'critical';
    } else if (info.memoryPressure >= this.options.warningThreshold) {
      info.status = 'warning';
    }

    return info;
  }

  /**
   * Check memory thresholds and trigger callbacks
   */
  checkThresholds(memoryInfo) {
    const { status } = memoryInfo;
    
    this.callbacks[status].forEach(callback => {
      try {
        callback(memoryInfo);
      } catch (error) {
        console.error('Memory monitor callback error:', error);
      }
    });

    // Log warnings
    if (status === 'warning') {
      console.warn(`⚠️ Memory usage high: ${memoryInfo.memoryPressure}%`);
    } else if (status === 'critical') {
      console.error(`🚨 Critical memory usage: ${memoryInfo.memoryPressure}%`);
    }
  }

  /**
   * Add callback for memory status changes
   */
  onMemoryStatus(status, callback) {
    if (this.callbacks[status]) {
      this.callbacks[status].push(callback);
    }
  }

  /**
   * Remove callback
   */
  removeCallback(status, callback) {
    if (this.callbacks[status]) {
      const index = this.callbacks[status].indexOf(callback);
      if (index > -1) {
        this.callbacks[status].splice(index, 1);
      }
    }
  }

  /**
   * Get memory statistics
   */
  getStats() {
    const current = this.getMemoryInfo();
    const history = this.memoryHistory.slice(-10); // Last 10 readings

    return {
      current,
      history,
      isMonitoring: this.isMonitoring,
      averagePressure: history.length > 0 ? 
        Math.round(history.reduce((sum, h) => sum + h.memoryPressure, 0) / history.length) : 0,
      peakPressure: history.length > 0 ? 
        Math.max(...history.map(h => h.memoryPressure)) : 0
    };
  }
}

// Global instances
export const threeJSResourceManager = new ThreeJSResourceManager();
export const componentCacheManager = new ComponentCacheManager(50); // 50MB limit
export const memoryMonitor = new MemoryMonitor();

// Cleanup function for all resource managers
export function cleanupAllResources() {
  console.log('🧹 Starting comprehensive resource cleanup...');
  
  const stats = {
    threeJSResources: threeJSResourceManager.disposeAllResources(),
    cachedComponents: componentCacheManager.cache.size
  };
  
  componentCacheManager.clear();
  memoryMonitor.stopMonitoring();
  threeJSResourceManager.forceGarbageCollection();
  
  console.log('✅ Resource cleanup completed:', stats);
  return stats;
}

export default {
  ThreeJSResourceManager,
  ComponentCacheManager,
  MemoryMonitor,
  threeJSResourceManager,
  componentCacheManager,
  memoryMonitor,
  cleanupAllResources
};