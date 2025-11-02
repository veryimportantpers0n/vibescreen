# Design Document

## Overview

The mode loader design creates a robust, performant system for dynamically loading and managing personality mode components. The design emphasizes reliability, performance optimization, and seamless user experience while providing the flexibility needed for diverse personality implementations and future extensibility.

## Architecture

### Component Hierarchy
```
ModeLoader
├── ComponentCache (in-memory component storage)
├── DynamicImporter (runtime component loading)
├── ValidationEngine (component interface checking)
├── ErrorBoundary (failure recovery)
└── LoadingStateManager (user feedback during loading)

CharacterHost
├── PositionManager (bottom-right corner positioning)
├── AnimationController (speak animations and transitions)
├── ResponsiveHandler (mobile/desktop adaptations)
└── MessageIntegration (coordination with message system)
```

### Loading Flow
1. **Terminal Command** → `!switch Corporate AI`
2. **Mode Resolution** → Map character name to mode ID
3. **Cache Check** → Look for previously loaded components
4. **Dynamic Import** → Load scene.js and character.js if not cached
5. **Validation** → Verify component exports and interfaces
6. **Rendering** → Mount components in SceneWrapper and CharacterHost
7. **Cleanup** → Dispose of previous mode resources

## Components and Interfaces

### ModeLoader Component Props
```typescript
interface ModeLoaderProps {
  currentMode: string;
  onModeChange: (modeId: string) => void;
  onLoadingStateChange: (loading: boolean) => void;
  onError: (error: Error) => void;
}
```

### CharacterHost Component Props
```typescript
interface CharacterHostProps {
  mode: string;
  characterComponent: React.ComponentType<CharacterProps>;
  onSpeak: (callback: () => void) => void;
  className?: string;
}

interface CharacterProps {
  onSpeak?: (speakFn: () => void) => void;
  sceneProps?: any;
}
```

### Component Cache Interface
```typescript
interface ComponentCache {
  scenes: Map<string, React.ComponentType>;
  characters: Map<string, React.ComponentType>;
  configs: Map<string, ModeConfig>;
  
  get(type: 'scene' | 'character' | 'config', modeId: string): any;
  set(type: 'scene' | 'character' | 'config', modeId: string, component: any): void;
  clear(modeId?: string): void;
  size(): number;
}
```

### Dynamic Import System
```javascript
class DynamicImporter {
  async loadModeComponents(modeId) {
    try {
      // Load scene and character components in parallel
      const [sceneModule, characterModule] = await Promise.all([
        import(`../modes/${modeId}/scene.js`),
        import(`../modes/${modeId}/character.js`)
      ]);
      
      return {
        scene: sceneModule.default || sceneModule.ModeScene,
        character: characterModule.default || characterModule.ModeCharacter
      };
    } catch (error) {
      throw new Error(`Failed to load components for mode ${modeId}: ${error.message}`);
    }
  }
  
  async loadModeConfig(modeId) {
    try {
      const configModule = await import(`../modes/${modeId}/config.json`);
      return configModule.default;
    } catch (error) {
      console.warn(`Failed to load config for mode ${modeId}, using defaults`);
      return this.getDefaultConfig(modeId);
    }
  }
}
```

## Data Models

### Mode Loading State
```typescript
interface ModeLoadingState {
  currentMode: string | null;
  loading: boolean;
  error: Error | null;
  loadedModes: Set<string>;
  lastLoadTime: number;
}
```

### Component Validation Schema
```javascript
const componentValidation = {
  scene: {
    requiredExports: ['default', 'ModeScene'],
    requiredProps: ['sceneProps'],
    componentType: 'function'
  },
  character: {
    requiredExports: ['default', 'ModeCharacter'],
    requiredProps: ['onSpeak'],
    componentType: 'function'
  }
};
```

### Character Positioning System
```css
/* Character host positioning */
.character-host {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 200px;
  height: 200px;
  z-index: 10;
  pointer-events: none; /* Allow clicks to pass through to background */
}

/* Responsive adaptations */
@media (max-width: 768px) {
  .character-host {
    width: 150px;
    height: 150px;
    bottom: 80px; /* Above terminal area */
    right: 15px;
  }
}

@media (max-width: 480px) {
  .character-host {
    width: 120px;
    height: 120px;
    bottom: 70px;
    right: 10px;
  }
}
```

## Error Handling

### Component Loading Error Recovery
```javascript
class ModeErrorHandler {
  handleLoadingError(modeId, error) {
    console.error(`Mode loading failed for ${modeId}:`, error);
    
    // Determine error type and recovery strategy
    if (error.message.includes('Network')) {
      return this.retryWithBackoff(modeId);
    }
    
    if (error.message.includes('Module not found')) {
      return this.useFallbackComponents(modeId);
    }
    
    // Generic error - use safe defaults
    return this.loadDefaultMode();
  }
  
  async retryWithBackoff(modeId, attempt = 1) {
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      return await this.loadModeComponents(modeId);
    } catch (error) {
      if (attempt < 3) {
        return this.retryWithBackoff(modeId, attempt + 1);
      }
      throw error;
    }
  }
  
  useFallbackComponents(modeId) {
    return {
      scene: DefaultScene,
      character: DefaultCharacter,
      config: this.getDefaultConfig(modeId)
    };
  }
}
```

### Component Validation
```javascript
class ComponentValidator {
  validateComponent(component, type) {
    const validation = componentValidation[type];
    
    if (!component) {
      throw new Error(`${type} component is null or undefined`);
    }
    
    if (typeof component !== 'function') {
      throw new Error(`${type} component must be a React function component`);
    }
    
    // Check if component accepts required props
    const componentString = component.toString();
    validation.requiredProps.forEach(prop => {
      if (!componentString.includes(prop)) {
        console.warn(`${type} component may not handle required prop: ${prop}`);
      }
    });
    
    return true;
  }
  
  validateModeStructure(modeId) {
    const requiredFiles = ['scene.js', 'character.js', 'config.json', 'messages.json'];
    
    // This would be implemented with actual file system checks in Node.js
    // For client-side, we rely on import error handling
    return true;
  }
}
```

## Testing Strategy

### Component Loading Tests
```javascript
const loadingTests = [
  'Successfully loads valid mode components',
  'Handles missing scene.js files gracefully',
  'Handles missing character.js files gracefully',
  'Validates component exports correctly',
  'Caches loaded components for reuse',
  'Clears cache when memory limit reached',
  'Retries failed loads with exponential backoff',
  'Falls back to default components on persistent failures'
];
```

### Character Positioning Tests
```javascript
const positioningTests = [
  'Character appears in bottom-right corner on desktop',
  'Character position adapts correctly on mobile',
  'Character stays within bounds during animations',
  'Multiple character switches maintain consistent positioning',
  'Responsive breakpoints work correctly',
  'Character doesn\'t interfere with terminal or messages'
];
```

### Performance Tests
```javascript
const performanceTests = [
  'Mode switching completes within 500ms for cached components',
  'Initial mode loading completes within 2 seconds',
  'Memory usage stays within acceptable limits',
  'Cache eviction works correctly under memory pressure',
  'Concurrent mode switches don\'t cause race conditions',
  'Component cleanup prevents memory leaks'
];
```

## Implementation Notes

### Component Caching Strategy
```javascript
class ComponentCache {
  constructor(maxSize = 20) {
    this.maxSize = maxSize;
    this.cache = new Map();
    this.accessOrder = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // Update access time for LRU
      this.accessOrder.set(key, Date.now());
      return this.cache.get(key);
    }
    return null;
  }
  
  set(key, value) {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, value);
    this.accessOrder.set(key, Date.now());
  }
  
  evictLRU() {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, time] of this.accessOrder) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessOrder.delete(oldestKey);
    }
  }
}
```

### Preloading Strategy
```javascript
class ModePreloader {
  constructor(cache, importer) {
    this.cache = cache;
    this.importer = importer;
    this.preloadQueue = [];
  }
  
  async preloadPopularModes() {
    const popularModes = ['corporate-ai', 'zen-monk', 'chaos'];
    
    for (const modeId of popularModes) {
      if (!this.cache.get(`scene-${modeId}`)) {
        this.preloadQueue.push(modeId);
      }
    }
    
    // Preload in background with low priority
    this.processPreloadQueue();
  }
  
  async processPreloadQueue() {
    while (this.preloadQueue.length > 0) {
      const modeId = this.preloadQueue.shift();
      
      try {
        const components = await this.importer.loadModeComponents(modeId);
        this.cache.set(`scene-${modeId}`, components.scene);
        this.cache.set(`character-${modeId}`, components.character);
      } catch (error) {
        console.warn(`Preload failed for ${modeId}:`, error);
      }
      
      // Yield to main thread
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}
```

### Integration with Terminal Commands
```javascript
class ModeController {
  constructor(loader, characterHost) {
    this.loader = loader;
    this.characterHost = characterHost;
    this.currentMode = null;
  }
  
  async switchMode(characterName) {
    try {
      // Map character name to mode ID
      const modeId = this.mapCharacterNameToId(characterName);
      
      if (modeId === this.currentMode) {
        return { success: true, message: `Already in ${characterName} mode` };
      }
      
      // Load mode components
      const components = await this.loader.loadMode(modeId);
      
      // Update character host
      this.characterHost.setCharacter(components.character);
      
      // Update scene (handled by parent component)
      this.onModeChange(modeId, components);
      
      this.currentMode = modeId;
      
      return {
        success: true,
        message: `Switched to ${characterName}\nMessages: ${components.config.popupStyle}, ${components.config.minDelaySeconds}-${components.config.maxDelaySeconds}s`
      };
      
    } catch (error) {
      return {
        success: false,
        message: `Failed to switch to ${characterName}: ${error.message}`
      };
    }
  }
}
```

This design provides a robust, performant foundation for dynamic mode loading while maintaining the seamless user experience and terminal aesthetic that defines VibeScreen.