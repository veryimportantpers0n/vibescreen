import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import SceneWrapper from './SceneWrapper';
import ModeLoaderErrorBoundary from './ModeLoaderErrorBoundary';
import DefaultScene from './DefaultScene';
import DefaultCharacter from './DefaultCharacter';
import { modeLoadingRetry, retryDynamicImport } from '../utils/retryMechanism';
import { getModeComponents } from '../utils/modeRegistry';
import { logModeError, logComponentError, logValidationError } from '../utils/errorLogger';
import { ComponentInterfaceValidator, validateModeStructure } from '../utils/componentInterfaceValidator';
import { 
  threeJSResourceManager, 
  componentCacheManager, 
  memoryMonitor,
  cleanupAllResources 
} from '../utils/resourceCleanup';

/**
 * Enhanced Component Cache with comprehensive memory management
 * Now uses the global componentCacheManager for better resource tracking
 */
class ComponentCache {
  constructor(maxSize = 20) {
    // Use the global cache manager but maintain compatibility
    this.cacheManager = componentCacheManager;
    this.maxSize = maxSize;
    this.hitCount = 0;
    this.missCount = 0;
  }

  get(key) {
    const result = this.cacheManager.get(key);
    if (result) {
      this.hitCount++;
      return result;
    }
    this.missCount++;
    return null;
  }

  set(key, value) {
    this.cacheManager.set(key, value);
  }

  evictLRU() {
    this.cacheManager.evictLRU();
  }

  delete(key) {
    return this.cacheManager.delete(key);
  }

  clear() {
    this.cacheManager.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  size() {
    return this.cacheManager.cache.size;
  }

  getStats() {
    const managerStats = this.cacheManager.getStats();
    const hitRate = this.hitCount + this.missCount > 0 ? 
      (this.hitCount / (this.hitCount + this.missCount) * 100).toFixed(2) : 0;

    return {
      ...managerStats,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: `${hitRate}%`,
      estimatedMemoryKB: Math.round(managerStats.totalMemoryMB * 1024)
    };
  }

  estimateComponentSize(component) {
    return this.cacheManager.estimateComponentMemory(component);
  }
}

/**
 * Mode Preloader for background loading of popular modes
 */
class ModePreloader {
  constructor(cache, loadFunction) {
    this.cache = cache;
    this.loadFunction = loadFunction;
    this.preloadQueue = [];
    this.isPreloading = false;
    this.preloadedModes = new Set();
  }

  async preloadPopularModes() {
    const popularModes = ['corporate-ai', 'zen-monk', 'chaos'];
    
    for (const modeId of popularModes) {
      if (!this.cache.get(`components-${modeId}`) && !this.preloadedModes.has(modeId)) {
        this.preloadQueue.push(modeId);
      }
    }

    if (this.preloadQueue.length > 0 && !this.isPreloading) {
      this.processPreloadQueue();
    }
  }

  async processPreloadQueue() {
    if (this.isPreloading) return;
    
    this.isPreloading = true;
    console.log('🚀 Starting background preload of popular modes...');

    while (this.preloadQueue.length > 0) {
      const modeId = this.preloadQueue.shift();
      
      try {
        console.log(`⏳ Preloading mode: ${modeId}`);
        const components = await this.loadFunction(modeId);
        
        if (components) {
          this.cache.set(`components-${modeId}`, components);
          this.preloadedModes.add(modeId);
          console.log(`✅ Preloaded mode: ${modeId}`);
        }
      } catch (error) {
        console.warn(`⚠️ Preload failed for ${modeId}:`, error);
      }

      // Yield to main thread to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isPreloading = false;
    console.log('✅ Background preloading completed');
  }

  cancelPreloading() {
    this.preloadQueue = [];
    this.isPreloading = false;
  }
}

/**
 * Performance Monitor for tracking mode switching performance
 */
class PerformanceMonitor {
  constructor() {
    this.switchTimes = new Map();
    this.loadTimes = new Map();
    this.targetSwitchTime = 500; // 500ms target for cached components
  }

  startSwitchTimer(modeId) {
    this.switchTimes.set(modeId, performance.now());
  }

  endSwitchTimer(modeId, fromCache = false) {
    const startTime = this.switchTimes.get(modeId);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.loadTimes.set(modeId, { duration, fromCache, timestamp: Date.now() });
      
      if (fromCache && duration > this.targetSwitchTime) {
        console.warn(`⚠️ Cached mode switch exceeded target time: ${duration.toFixed(2)}ms > ${this.targetSwitchTime}ms`);
      } else if (fromCache) {
        console.log(`⚡ Fast cached mode switch: ${duration.toFixed(2)}ms`);
      } else {
        console.log(`📊 Initial mode load: ${duration.toFixed(2)}ms`);
      }
      
      this.switchTimes.delete(modeId);
      return duration;
    }
    return null;
  }

  getStats() {
    const recentSwitches = Array.from(this.loadTimes.entries())
      .filter(([_, data]) => Date.now() - data.timestamp < 60000) // Last minute
      .map(([mode, data]) => ({ mode, ...data }));

    const cachedSwitches = recentSwitches.filter(s => s.fromCache);
    const avgCachedTime = cachedSwitches.length > 0 ? 
      cachedSwitches.reduce((sum, s) => sum + s.duration, 0) / cachedSwitches.length : 0;

    return {
      recentSwitches: recentSwitches.length,
      cachedSwitches: cachedSwitches.length,
      avgCachedSwitchTime: Math.round(avgCachedTime),
      targetMet: avgCachedTime <= this.targetSwitchTime,
      allSwitches: Array.from(this.loadTimes.entries()).map(([mode, data]) => ({
        mode,
        duration: Math.round(data.duration),
        fromCache: data.fromCache,
        timestamp: data.timestamp
      }))
    };
  }
}

/**
 * ModeLoader - Dynamically loads and manages personality mode components
 * Handles real mode imports with error handling, caching, and performance optimization
 */
const ModeLoader = React.forwardRef(({ 
  currentMode = 'corporate-ai', 
  onModeChange, 
  onError,
  className = '',
  style = {} 
}, ref) => {
  const [modeComponents, setModeComponents] = useState({});
  const [modeConfigs, setModeConfigs] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [errors, setErrors] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [cacheStats, setCacheStats] = useState({});
  const [performanceStats, setPerformanceStats] = useState({});
  
  // Refs for cleanup tracking and performance systems
  const mountedRef = useRef(true);
  const loadingTimeoutsRef = useRef({});
  const retryCountsRef = useRef({});
  
  // Initialize cache and performance systems with enhanced resource management
  const componentCacheRef = useRef(new ComponentCache(20));
  const preloaderRef = useRef(null);
  const performanceMonitorRef = useRef(new PerformanceMonitor());
  const resourceCleanupRef = useRef(new Set()); // Track resources for cleanup
  const initializationRef = useRef(false); // Prevent multiple initializations
  const isInitializingRef = useRef(false); // Track if currently initializing
  
  // Initialize component validation system
  const validatorRef = useRef(new ComponentInterfaceValidator({
    strictMode: process.env.NODE_ENV === 'development',
    logLevel: process.env.NODE_ENV === 'development' ? 'warn' : 'error'
  }));

  // Available modes configuration
  const availableModes = [
    'corporate-ai',
    'zen-monk', 
    'chaos'
  ];

  const defaultMode = 'corporate-ai';



  /**
   * Component validation engine - verifies exports match required interfaces
   */
  const validateComponentInterface = useCallback((component, type, modeName) => {
    const validationResult = validatorRef.current.validateComponent(component, type, modeName);
    
    if (!validationResult.valid) {
      const errorMessages = validationResult.errors.map(err => err.message).join('; ');
      throw new Error(`${type} component validation failed for mode ${modeName}: ${errorMessages}`);
    }

    // Log warnings if any
    if (validationResult.warnings.length > 0) {
      validationResult.warnings.forEach(warning => {
        console.warn(`⚠️ ${warning.message} (${modeName} ${type}): ${warning.guidance}`);
      });
    }

    console.log(`✅ Component validation passed: ${modeName} ${type}`);
    return validationResult;
  }, []);

  /**
   * Dynamically import mode components with caching, validation and retry logic
   */
  const loadModeComponents = useCallback(async (modeName) => {
    if (!mountedRef.current) return null;

    // Start performance timer
    performanceMonitorRef.current.startSwitchTimer(modeName);

    // Check cache first
    const cacheKey = `components-${modeName}`;
    const cachedComponents = componentCacheRef.current.get(cacheKey);
    
    if (cachedComponents) {
      console.log(`⚡ Loading mode from cache: ${modeName}`);
      
      // Update state with cached components AND notify parent
      if (mountedRef.current) {
        setModeComponents(prev => ({
          ...prev,
          [modeName]: {
            scene: cachedComponents.scene,
            character: cachedComponents.character
          }
        }));

        setModeConfigs(prev => ({
          ...prev,
          [modeName]: cachedComponents.config
        }));

        // Notify parent component about loaded mode
        if (onModeChange) {
          onModeChange(modeName, {
            scene: cachedComponents.scene,
            character: cachedComponents.character
          }, cachedComponents.config);
        }
      }

      // End performance timer for cached load
      performanceMonitorRef.current.endSwitchTimer(modeName, true);
      
      return cachedComponents;
    }

    // Check if already loaded in state (fallback check)
    if (modeComponents[modeName] && modeConfigs[modeName]) {
      const stateComponents = { 
        scene: modeComponents[modeName].scene,
        character: modeComponents[modeName].character,
        config: modeConfigs[modeName]
      };
      
      // Cache the state components for future use
      componentCacheRef.current.set(cacheKey, stateComponents);
      
      performanceMonitorRef.current.endSwitchTimer(modeName, true);
      return stateComponents;
    }

    // Set loading state
    setLoadingStates(prev => ({ ...prev, [modeName]: true }));
    setErrors(prev => ({ ...prev, [modeName]: null }));

    try {
      console.log(`🔄 Loading mode components for: ${modeName}`);

      // Use retry mechanism for dynamic imports
      const operationId = `load-mode-${modeName}`;
      
      // Use static registry instead of dynamic imports
      const registryComponents = getModeComponents(modeName);
      
      if (!registryComponents) {
        throw new Error(`Mode "${modeName}" not found in registry`);
      }
      
      const sceneModule = { default: registryComponents.scene };
      const characterModule = { default: registryComponents.character };
      const configModule = { default: registryComponents.config };
      const messagesModule = { default: registryComponents.messages };

      if (!mountedRef.current) return null;

      // Check if we should use fallback components
      if (!sceneModule || !characterModule) {
        console.warn(`⚠️ Missing required components for ${modeName}, using fallback components`);
        
        const fallbackData = {
          scene: DefaultScene,
          character: DefaultCharacter,
          config: {
            colors: { primary: '#00ff00', secondary: '#008f11' },
            animations: { speed: 1.0 },
            popupStyle: 'overlay',
            minDelaySeconds: 5,
            maxDelaySeconds: 15,
            messages: ['Fallback mode active', 'Components failed to load'],
            modeName: `${modeName}-fallback`,
            loadedAt: Date.now(),
            isFallback: true
          }
        };

        // Store fallback components
        if (mountedRef.current) {
          setModeComponents(prev => ({
            ...prev,
            [modeName]: {
              scene: DefaultScene,
              character: DefaultCharacter
            }
          }));

          setModeConfigs(prev => ({
            ...prev,
            [modeName]: fallbackData.config
          }));

          setLoadingStates(prev => ({ ...prev, [modeName]: false }));
          
          // Cache fallback components (with shorter TTL)
          componentCacheRef.current.set(`fallback-${modeName}`, fallbackData);
          
          // Notify parent component about fallback mode
          if (onModeChange) {
            onModeChange(modeName, {
              scene: DefaultScene,
              character: DefaultCharacter
            }, fallbackData.config);
          }
          
          // End performance timer for fallback load
          performanceMonitorRef.current.endSwitchTimer(modeName, false);
        }

        logModeError(new Error(`Using fallback components for ${modeName}`), { 
          mode: modeName, 
          reason: 'missing_components' 
        });

        return fallbackData;
      }

      // Extract components with multiple export patterns support
      const componentName = modeName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('');
      
      // Try multiple export patterns for flexibility
      const SceneComponent = sceneModule[`${componentName}Scene`] || 
                            sceneModule.ModeScene || 
                            sceneModule.default;
      
      const CharacterComponent = characterModule[`${componentName}Character`] || 
                                characterModule.ModeCharacter || 
                                characterModule.default;

      // Validate component exports
      if (!SceneComponent) {
        const validationError = new Error(`Scene component not found for mode: ${modeName}. Expected exports: ${componentName}Scene, ModeScene, or default`);
        logValidationError(validationError, { mode: modeName, component: 'scene' });
        throw validationError;
      }
      
      if (!CharacterComponent) {
        const validationError = new Error(`Character component not found for mode: ${modeName}. Expected exports: ${componentName}Character, ModeCharacter, or default`);
        logValidationError(validationError, { mode: modeName, component: 'character' });
        throw validationError;
      }

      // Validate individual component interfaces
      try {
        validateComponentInterface(SceneComponent, 'scene', modeName);
        validateComponentInterface(CharacterComponent, 'character', modeName);
      } catch (validationError) {
        logValidationError(validationError, { mode: modeName });
        throw validationError;
      }

      // Process config and messages with defaults
      const config = configModule ? (configModule.default || configModule) : {
        colors: { primary: '#00ff00', secondary: '#008f11' },
        animations: { speed: 1.0 },
        popupStyle: 'overlay',
        minDelaySeconds: 5,
        maxDelaySeconds: 15
      };

      const messages = messagesModule ? (messagesModule.default || messagesModule) : { messages: [] };

      // Comprehensive mode structure validation
      const modeComponents = {
        scene: SceneComponent,
        character: CharacterComponent,
        config: { 
          ...config, 
          messages: messages.messages || [],
          modeName,
          loadedAt: Date.now(),
          isFallback: false
        }
      };

      const structureValidation = validatorRef.current.validateModeStructure(modeName, modeComponents);
      
      if (!structureValidation.valid) {
        const structureErrors = structureValidation.errors.map(err => 
          `${err.type}: ${err.message} (${err.guidance})`
        ).join('; ');
        
        const structureError = new Error(`Mode structure validation failed for ${modeName}: ${structureErrors}`);
        logValidationError(structureError, { 
          mode: modeName, 
          validationDetails: structureValidation 
        });
        
        // In strict mode, throw error. Otherwise, log warnings and continue
        if (validatorRef.current.strictMode) {
          throw structureError;
        } else {
          console.warn(`⚠️ Mode structure validation warnings for ${modeName}:`, structureValidation.warnings);
        }
      }

      // Log validation success with details
      if (structureValidation.valid) {
        console.log(`✅ Complete mode validation passed for ${modeName}:`, {
          components: Object.keys(structureValidation.components),
          warnings: structureValidation.warnings.length,
          timestamp: structureValidation.timestamp
        });
      }

      // Store loaded components with validation passed
      const modeData = modeComponents;

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
        
        // Cache the loaded components for future use
        componentCacheRef.current.set(cacheKey, modeData);
        
        // Reset retry count on successful load
        retryCountsRef.current[modeName] = 0;

        // Notify parent component about loaded mode
        if (onModeChange) {
          onModeChange(modeName, {
            scene: SceneComponent,
            character: CharacterComponent
          }, modeData.config);
        }

        // End performance timer for fresh load
        performanceMonitorRef.current.endSwitchTimer(modeName, false);

        console.log(`✅ Successfully loaded, validated, and cached mode: ${modeName}`);
      }

      return modeData;

    } catch (error) {
      if (!mountedRef.current) return null;

      // Log error with comprehensive context
      logModeError(error, { 
        mode: modeName, 
        retryCount: retryCountsRef.current[modeName] || 0 
      });

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

      return null;
    }
  }, [modeComponents, modeConfigs, onError, validateComponentInterface]);

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
   * Enhanced cleanup of Three.js resources for a specific mode
   */
  const cleanupModeResources = useCallback((modeName) => {
    console.log(`🧹 Starting comprehensive cleanup for mode: ${modeName}`);
    
    // Clear any pending timeouts
    if (loadingTimeoutsRef.current[modeName]) {
      clearTimeout(loadingTimeoutsRef.current[modeName]);
      delete loadingTimeoutsRef.current[modeName];
    }

    // Dispose Three.js resources for this mode
    const disposedResources = threeJSResourceManager.disposeModeResources(modeName);
    
    // Remove from component cache
    const cacheKey = `components-${modeName}`;
    componentCacheRef.current.delete(cacheKey);
    
    // Remove from resource tracking
    resourceCleanupRef.current.delete(modeName);
    
    // Clear mode-specific state
    setModeComponents(prev => {
      const updated = { ...prev };
      delete updated[modeName];
      return updated;
    });
    
    setModeConfigs(prev => {
      const updated = { ...prev };
      delete updated[modeName];
      return updated;
    });
    
    setErrors(prev => {
      const updated = { ...prev };
      delete updated[modeName];
      return updated;
    });
    
    setLoadingStates(prev => {
      const updated = { ...prev };
      delete updated[modeName];
      return updated;
    });

    // Force garbage collection hint
    threeJSResourceManager.forceGarbageCollection();

    console.log(`✅ Cleanup completed for mode: ${modeName} (${disposedResources} resources disposed)`);
    
    return {
      disposedResources,
      clearedCache: true,
      clearedState: true
    };
  }, []);

  /**
   * Initialize mode loader with enhanced resource management
   */
  useEffect(() => {
    const initializeModeLoader = async () => {
      // Prevent multiple initializations
      if (initializationRef.current) {
        console.log('⚠️ ModeLoader already initialized, skipping...');
        return;
      }
      initializationRef.current = true;
      isInitializingRef.current = true;
      
      try {
        console.log('🚀 Initializing ModeLoader with enhanced resource management...');
        
        // Start memory monitoring
        memoryMonitor.startMonitoring();
        
        // Set up memory pressure callbacks
        memoryMonitor.onMemoryStatus('warning', (memoryInfo) => {
          console.warn('⚠️ Memory pressure warning, cleaning up old resources');
          componentCacheRef.current.cacheManager.cleanupOld();
          threeJSResourceManager.cleanupOldResources();
        });
        
        memoryMonitor.onMemoryStatus('critical', (memoryInfo) => {
          console.error('🚨 Critical memory pressure, aggressive cleanup');
          // More aggressive cleanup for critical memory pressure
          componentCacheRef.current.cacheManager.cleanupOld(300000); // 5 minutes
          threeJSResourceManager.cleanupOldResources(180000); // 3 minutes
          threeJSResourceManager.forceGarbageCollection();
        });
        
        // Initialize preloader
        preloaderRef.current = new ModePreloader(
          componentCacheRef.current, 
          loadModeComponents
        );
        
        // Load the current mode
        console.log(`🔄 Attempting to load initial mode: ${currentMode}`);
        const modeData = await loadModeComponents(currentMode);
        
        if (!modeData) {
          console.warn(`⚠️ Initial mode load failed for: ${currentMode}`);
          // Only fallback if we're not already on the default mode
          if (currentMode !== defaultMode) {
            await fallbackToDefault();
          } else {
            console.warn('⚠️ Default mode load attempt failed during initialization - this is usually a timing issue and can be ignored if the app works normally');
          }
        } else {
          console.log(`✅ Initial mode loaded successfully: ${currentMode}`);
        }
        
        // Start background preloading of popular modes
        setTimeout(() => {
          if (preloaderRef.current && mountedRef.current) {
            preloaderRef.current.preloadPopularModes();
          }
        }, 1000); // Delay to not interfere with initial load
        
        setIsInitialized(true);
        isInitializingRef.current = false; // Initialization complete
        console.log('✅ ModeLoader initialized successfully with enhanced resource management');
        
      } catch (error) {
        console.error('❌ ModeLoader initialization failed:', error);
        setIsInitialized(true); // Still mark as initialized to show error state
        isInitializingRef.current = false; // Initialization complete (with error)
      }
    };

    initializeModeLoader();
  }, []); // Only run on mount

  /**
   * Update cache and performance stats periodically
   */
  useEffect(() => {
    const updateStats = () => {
      if (mountedRef.current) {
        setCacheStats(componentCacheRef.current.getStats());
        setPerformanceStats(performanceMonitorRef.current.getStats());
      }
    };

    // Update stats immediately and then every 5 seconds
    updateStats();
    const statsInterval = setInterval(updateStats, 5000);

    return () => clearInterval(statsInterval);
  }, []);

  /**
   * Enhanced memory management with comprehensive monitoring
   */
  useEffect(() => {
    const performMemoryCheck = () => {
      const cacheStats = componentCacheRef.current.getStats();
      const resourceStats = threeJSResourceManager.getMemoryStats();
      const memoryStats = memoryMonitor.getMemoryInfo();
      
      // Check cache memory usage
      if (cacheStats.totalMemoryMB > 40) { // 40MB threshold for cache
        console.warn('⚠️ Component cache memory usage high, triggering cleanup');
        componentCacheRef.current.cacheManager.cleanupOld();
      }
      
      // Check Three.js resource usage
      if (resourceStats.totalMemoryMB > 30) { // 30MB threshold for Three.js resources
        console.warn('⚠️ Three.js resource memory usage high, triggering cleanup');
        threeJSResourceManager.cleanupOldResources();
      }
      
      // Check overall memory pressure
      if (memoryStats.memoryPressure > 75) {
        console.warn('⚠️ High memory pressure detected, performing comprehensive cleanup');
        
        // Cleanup old resources
        componentCacheRef.current.cacheManager.cleanupOld(300000); // 5 minutes
        threeJSResourceManager.cleanupOldResources(300000);
        
        // Force garbage collection
        threeJSResourceManager.forceGarbageCollection();
      }
      
      // Log memory stats in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Memory Stats:', {
          cache: `${cacheStats.totalMemoryMB}MB`,
          threeJS: `${resourceStats.totalMemoryMB}MB`,
          browser: memoryStats.browserMemory ? `${memoryStats.browserMemory.used}MB` : 'N/A',
          pressure: `${memoryStats.memoryPressure}%`
        });
      }
    };

    // Initial check
    performMemoryCheck();
    
    // Regular memory checks
    const memoryCheckInterval = setInterval(performMemoryCheck, 30000); // Check every 30 seconds

    return () => clearInterval(memoryCheckInterval);
  }, []);

  /**
   * Handle mode changes with enhanced cleanup and resource management
   */
  useEffect(() => {
    if (!isInitialized || isInitializingRef.current) return;

    const handleModeChange = async () => {
      // Get current state values to avoid stale closures
      const currentModeComponents = modeComponents;
      const currentModeConfigs = modeConfigs;
      
      // Get previous mode for cleanup
      const previousModes = Object.keys(currentModeComponents).filter(mode => mode !== currentMode);
      
      // Validate mode exists
      if (!availableModes.includes(currentMode)) {
        console.warn(`⚠️ Invalid mode requested: ${currentMode}, falling back to default`);
        await fallbackToDefault();
        return;
      }

      // Cleanup previous modes if memory pressure is high
      if (memoryMonitor.getMemoryInfo().memoryPressure > 60) {
        console.log('🧹 High memory pressure, cleaning up previous modes');
        previousModes.forEach(mode => {
          if (mode !== defaultMode) { // Keep default mode cached
            cleanupModeResources(mode);
          }
        });
      }

      // Load new mode if not already loaded
      if (!currentModeComponents[currentMode] || !currentModeConfigs[currentMode]) {
        console.log(`🔄 Loading mode: ${currentMode}`);
        
        // Track this mode for resource cleanup
        resourceCleanupRef.current.add(currentMode);
        
        const modeData = await loadModeComponents(currentMode);
        
        if (!modeData) {
          console.warn(`⚠️ Failed to load mode: ${currentMode}, falling back to default`);
          resourceCleanupRef.current.delete(currentMode);
          await fallbackToDefault();
        }
      } else {
        console.log(`✅ Mode already loaded: ${currentMode}`);
        // Update access time for cache management
        const cacheKey = `components-${currentMode}`;
        componentCacheRef.current.get(cacheKey); // This updates access time
      }
    };

    handleModeChange();
  }, [currentMode, isInitialized, availableModes]);

  /**
   * Comprehensive cleanup on unmount with enhanced resource management
   */
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      initializationRef.current = false; // Reset initialization flag
      isInitializingRef.current = false; // Reset initializing flag
      
      console.log('🧹 Starting comprehensive ModeLoader cleanup...');
      
      // Clear all loading timeouts
      Object.values(loadingTimeoutsRef.current).forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      
      // Cancel all active retry operations
      modeLoadingRetry.cancelAllRetries();
      
      // Cancel preloading
      if (preloaderRef.current) {
        preloaderRef.current.cancelPreloading();
      }
      
      // Stop memory monitoring
      memoryMonitor.stopMonitoring();
      
      // Cleanup resources for all tracked modes
      resourceCleanupRef.current.forEach(modeName => {
        cleanupModeResources(modeName);
      });
      
      // Clear component cache
      componentCacheRef.current.clear();
      
      // Dispose all Three.js resources
      threeJSResourceManager.disposeAllResources();
      
      // Final garbage collection
      threeJSResourceManager.forceGarbageCollection();
      
      console.log('✅ Comprehensive ModeLoader cleanup completed');
    };
  }, [cleanupModeResources]);

  /**
   * Expose cache management functions
   */
  const getCacheStats = useCallback(() => {
    return componentCacheRef.current.getStats();
  }, []);

  const getPerformanceStats = useCallback(() => {
    return performanceMonitorRef.current.getStats();
  }, []);

  const clearCache = useCallback(() => {
    componentCacheRef.current.clear();
    console.log('🗑️ Component cache cleared manually');
  }, []);

  const preloadMode = useCallback(async (modeId) => {
    if (!componentCacheRef.current.get(`components-${modeId}`)) {
      console.log(`⏳ Manual preload requested for: ${modeId}`);
      try {
        await loadModeComponents(modeId);
        console.log(`✅ Manual preload completed for: ${modeId}`);
      } catch (error) {
        console.warn(`⚠️ Manual preload failed for ${modeId}:`, error);
      }
    }
  }, [loadModeComponents]);

  /**
   * Get validation results for debugging and monitoring
   */
  const getValidationResults = useCallback((modeId) => {
    if (modeId) {
      return validatorRef.current.getValidationResults(modeId);
    }
    return validatorRef.current.getAllValidationResults();
  }, []);

  /**
   * Generate comprehensive validation report
   */
  const getValidationReport = useCallback(() => {
    return validatorRef.current.generateValidationReport();
  }, []);

  /**
   * Clear validation results (useful for testing)
   */
  const clearValidationResults = useCallback(() => {
    validatorRef.current.clearValidationResults();
  }, []);

  // Expose cache management and validation functions via ref (for parent components)
  React.useImperativeHandle(ref, () => ({
    getCacheStats,
    getPerformanceStats,
    clearCache,
    preloadMode,
    getValidationResults,
    getValidationReport,
    clearValidationResults,
    // Additional methods for integration
    getCurrentMode: () => currentMode,
    isLoading: () => loadingStates[currentMode] || false,
    getLoadedModes: () => Object.keys(modeComponents),
    getAvailableModes: () => availableModes
  }), [
    getCacheStats, 
    getPerformanceStats, 
    clearCache, 
    preloadMode, 
    getValidationResults, 
    getValidationReport, 
    clearValidationResults,
    currentMode,
    loadingStates,
    modeComponents,
    availableModes
  ]);

  // Get current mode data
  const currentModeData = {
    scene: modeComponents[currentMode]?.scene,
    character: modeComponents[currentMode]?.character,
    config: modeConfigs[currentMode],
    isLoading: loadingStates[currentMode],
    error: errors[currentMode],
    cacheStats,
    performanceStats
  };

  // Memoize sceneProps to prevent infinite re-renders - use specific config values
  const sceneProps = useMemo(() => {
    const config = modeConfigs[currentMode] || {};
    return {
      bgColor: config.colors?.primary || '#000000',
      ambientSpeed: config.animations?.speed || 1.0
    };
  }, [modeConfigs[currentMode]?.colors?.primary, modeConfigs[currentMode]?.animations?.speed]);

  // Loading state with detailed feedback
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
            <div className="loading-details terminal-text">
              &gt; IMPORTING_COMPONENTS...
            </div>
            <div className="loading-details terminal-text">
              &gt; VALIDATING_INTERFACES...
            </div>
            <div className="loading-progress">
              <div className="progress-bar terminal-text">
                [████████████████████] 100%
              </div>
            </div>
            <div className="sr-only">Loading {currentMode} personality mode components</div>
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



  // Render content wrapped in error boundary
  const renderContent = () => {
    // Success state - render the loaded mode
    if (currentModeData.scene && currentModeData.config) {
      const SceneComponent = currentModeData.scene;
      
      return (
        <div className={`mode-loader loaded ${className}`} style={style}>
          <SceneWrapper 
            mode={currentMode}
            sceneProps={sceneProps}
          >
            <SceneComponent sceneProps={sceneProps} />
          </SceneWrapper>
          {currentModeData.config.isFallback && (
            <div className="fallback-indicator" role="status">
              <div className="terminal-text">
                &gt; FALLBACK_MODE_ACTIVE
              </div>
            </div>
          )}
          {process.env.NODE_ENV === 'development' && (
            <div className="cache-debug-overlay" style={{
              position: 'fixed',
              top: '10px',
              right: '10px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#00ff00',
              padding: '10px',
              fontSize: '10px',
              fontFamily: 'monospace',
              border: '1px solid #00ff00',
              borderRadius: '4px',
              zIndex: 1000,
              maxWidth: '350px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              <div>&gt; CACHE_STATS</div>
              <div>Size: {cacheStats.size}/{cacheStats.maxSize}</div>
              <div>Hit Rate: {cacheStats.hitRate}</div>
              <div>Memory: {cacheStats.estimatedMemoryKB}KB</div>
              <div>&gt; PERFORMANCE_STATS</div>
              <div>Recent Switches: {performanceStats.recentSwitches}</div>
              <div>Cached Switches: {performanceStats.cachedSwitches}</div>
              <div>Avg Cached Time: {performanceStats.avgCachedSwitchTime}ms</div>
              <div>Target Met: {performanceStats.targetMet ? 'YES' : 'NO'}</div>
              <div>&gt; VALIDATION_STATS</div>
              {(() => {
                const validationReport = getValidationReport();
                return (
                  <>
                    <div>Total Modes: {validationReport.totalModes}</div>
                    <div>Valid: {validationReport.validModes}</div>
                    <div>Invalid: {validationReport.invalidModes}</div>
                    <div>Errors: {validationReport.totalErrors}</div>
                    <div>Warnings: {validationReport.totalWarnings}</div>
                    {validationReport.modes.length > 0 && (
                      <div style={{ marginTop: '5px', fontSize: '9px' }}>
                        {validationReport.modes.map(mode => (
                          <div key={mode.modeId} style={{ 
                            color: mode.valid ? '#00ff00' : '#ff4444',
                            marginLeft: '10px'
                          }}>
                            {mode.modeId}: {mode.valid ? '✓' : '✗'} 
                            {mode.errorCount > 0 && ` (${mode.errorCount}E)`}
                            {mode.warningCount > 0 && ` (${mode.warningCount}W)`}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      );
    }

    // Fallback state
    return (
      <div className={`mode-loader fallback ${className}`} style={style}>
        <SceneWrapper mode="fallback">
          <DefaultScene />
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

  return (
    <ModeLoaderErrorBoundary
      mode={currentMode}
      onError={(error, context) => {
        logModeError(error, context);
        if (onError) {
          onError(error, context);
        }
      }}
      onFallback={() => fallbackToDefault()}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {renderContent()}
    </ModeLoaderErrorBoundary>
  );
});

ModeLoader.propTypes = {
  currentMode: PropTypes.string,
  onModeChange: PropTypes.func, // Called with (modeName, components, config) when mode loads
  onError: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

ModeLoader.displayName = 'ModeLoader';

export default ModeLoader;