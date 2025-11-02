# Design Document

## Overview

The Scene Wrapper design creates a robust, performant foundation for Three.js rendering within the VibeScreen application. The design emphasizes reliability, performance, and ease of use while providing the flexibility needed for diverse personality mode scenes and future extensibility.

## Architecture

### Component Hierarchy
```
SceneWrapper
├── ErrorBoundary (Three.js error handling)
├── Canvas (react-three-fiber)
│   ├── PerspectiveCamera (standard setup)
│   ├── AmbientLight (base illumination)
│   ├── PointLight (directional lighting)
│   └── Suspense (loading fallback)
│       └── {children} (mode-specific content)
```

### Integration Pattern
```javascript
// Usage in parent components
<SceneWrapper mode="corporate-ai" sceneProps={modeConfig.sceneProps}>
  <ModeScene {...sceneProps} />
  <ModeCharacter onSpeak={handleSpeak} />
</SceneWrapper>
```

### State Management
```javascript
const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
const [isWebGLSupported, setIsWebGLSupported] = useState(true);
const [renderingError, setRenderingError] = useState(null);
```

## Components and Interfaces

### SceneWrapper Component Props
```typescript
interface SceneWrapperProps {
  mode?: string;
  sceneProps?: {
    bgColor?: string;
    ambientSpeed?: number;
    cameraPosition?: [number, number, number];
    lightIntensity?: number;
    [key: string]: any;
  };
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onError?: (error: Error) => void;
}
```

### Error Boundary Interface
```typescript
interface SceneErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}
```

### Canvas Configuration
```javascript
const defaultCanvasConfig = {
  camera: { position: [0, 0, 5], fov: 75 },
  gl: { 
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  },
  dpr: Math.min(window.devicePixelRatio, 2), // Optimize for performance
  frameloop: "always"
};
```

## Data Models

### Scene Configuration Schema
```typescript
interface SceneConfig {
  bgColor: string;
  ambientSpeed: number;
  cameraPosition: [number, number, number];
  lighting: {
    ambientIntensity: number;
    pointLightPosition: [number, number, number];
    pointLightIntensity: number;
  };
  performance: {
    pixelRatio: number;
    antialias: boolean;
    shadowMap: boolean;
  };
}
```

### Default Configuration
```javascript
const defaultSceneConfig = {
  bgColor: "#000000",
  ambientSpeed: 1.0,
  cameraPosition: [0, 0, 5],
  lighting: {
    ambientIntensity: 0.5,
    pointLightPosition: [10, 10, 10],
    pointLightIntensity: 1.0
  },
  performance: {
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: true,
    shadowMap: false // Disabled for performance
  }
};
```

## Error Handling

### Three.js Error Boundary
```javascript
class SceneErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Three.js Scene Error:', error, errorInfo);
    
    // Check for common WebGL issues
    if (error.message.includes('WebGL')) {
      this.setState({ 
        error: new Error('WebGL not supported or context lost') 
      });
    }
    
    // Report to error tracking service if available
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return <FallbackUI error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### WebGL Support Detection
```javascript
const detectWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};
```

### Fallback UI Component
```javascript
const FallbackUI = ({ error }) => (
  <div className="scene-fallback">
    <div className="fallback-content">
      <h3 className="terminal-text">&gt; SYSTEM ERROR</h3>
      <p className="terminal-text">
        {error?.message.includes('WebGL') 
          ? '&gt; WebGL not supported on this terminal'
          : '&gt; 3D graphics module offline'
        }
      </p>
      <p className="terminal-text">&gt; Switching to text mode...</p>
      <div className="fallback-visual">
        {/* Terminal-style ambient animation */}
        <div className="terminal-cursor">_</div>
      </div>
    </div>
  </div>
);
```

## Testing Strategy

### Performance Testing
```javascript
const performanceTests = {
  frameRate: 'Monitor FPS and ensure consistent 60fps',
  memoryUsage: 'Check for memory leaks during scene transitions',
  canvasResize: 'Test responsive behavior on window resize',
  multipleScenes: 'Verify performance with rapid mode switching',
  longRunning: 'Test stability during extended usage periods'
};
```

### Error Scenario Testing
1. **WebGL Unavailable**: Test on devices/browsers without WebGL support
2. **Context Loss**: Simulate WebGL context loss and recovery
3. **Invalid Scene Data**: Test with malformed sceneProps
4. **Memory Exhaustion**: Test behavior under low memory conditions
5. **Rapid Mode Switching**: Test stability with quick mode changes

### Integration Testing
```javascript
const integrationTests = [
  'SceneWrapper renders without errors',
  'Children components receive proper Three.js context',
  'Scene props are passed correctly to child components',
  'Error boundary catches and handles Three.js errors',
  'Canvas resizes properly with container',
  'Performance remains stable during mode transitions'
];
```

## Implementation Notes

### React Three Fiber Setup
```javascript
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

const SceneWrapper = ({ mode, sceneProps = {}, children, ...props }) => {
  const config = { ...defaultSceneConfig, ...sceneProps };
  
  return (
    <SceneErrorBoundary onError={props.onError}>
      <div className={`scene-wrapper ${props.className || ''}`}>
        <Canvas
          camera={{ position: config.cameraPosition, fov: 75 }}
          gl={{ antialias: config.performance.antialias }}
          dpr={config.performance.pixelRatio}
        >
          <ambientLight intensity={config.lighting.ambientIntensity} />
          <pointLight 
            position={config.lighting.pointLightPosition} 
            intensity={config.lighting.pointLightIntensity} 
          />
          <Suspense fallback={<LoadingSpinner />}>
            {children}
          </Suspense>
        </Canvas>
      </div>
    </SceneErrorBoundary>
  );
};
```

### Performance Optimizations
- **Pixel Ratio Capping**: Limit to 2x for performance on high-DPI displays
- **Conditional Rendering**: Pause rendering when not visible (Intersection Observer)
- **Resource Disposal**: Proper cleanup of geometries and materials
- **Frame Rate Monitoring**: Optional FPS monitoring for development

### Responsive Design
```css
/* Full-screen background scene */
.scene-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  overflow: hidden;
}

.scene-wrapper canvas {
  display: block;
  width: 100vw !important;
  height: 100vh !important;
}

/* Terminal-themed fallback styling */
.scene-fallback {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--terminal-black);
  color: var(--matrix-green);
  font-family: var(--font-terminal);
  z-index: 1;
}

.fallback-content {
  text-align: center;
  border: 2px solid var(--matrix-green);
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
  box-shadow: 0 0 20px var(--phosphor-glow);
}
```

### Future Extensibility
- **Post-Processing**: Support for bloom, SSAO, and other effects
- **VR/AR Support**: Foundation for immersive experiences
- **Performance Profiling**: Built-in performance monitoring tools
- **Scene Recording**: Ability to capture and replay scenes
- **Multi-Canvas**: Support for multiple simultaneous 3D contexts

This design provides a robust foundation for Three.js integration while maintaining the simplicity and reliability needed for a production ambient application.