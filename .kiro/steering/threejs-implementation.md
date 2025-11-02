---
inclusion: fileMatch
fileMatchPattern: "**/*.{js,jsx,ts,tsx}"
---

# Three.js Implementation Guidelines

## React Three Fiber Setup
- Use `@react-three/fiber` and `@react-three/drei` for cleaner React integration
- Wrap all Three.js content in `<Canvas>` components
- Use `useFrame` hook for animations instead of manual render loops
- Implement `Suspense` boundaries for loading states

## Scene Architecture
```javascript
// Standard scene component structure - FULL SCREEN BACKGROUND
export function ModeScene({ sceneProps }) {
  return (
    <Canvas 
      camera={{ position: [0, 0, 5] }}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <SceneContent {...sceneProps} />
    </Canvas>
  );
}
```

## Character Positioning
```javascript
// Characters must be positioned in bottom-right corner
export function ModeCharacter({ onSpeak }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '200px',
      height: '200px',
      zIndex: 10
    }}>
      <Canvas camera={{ position: [0, 0, 3] }}>
        <CharacterMesh onSpeak={onSpeak} />
      </Canvas>
    </div>
  );
}
```

## Character Implementation
- All characters must export a component with `onSpeak` callback
- Use `useRef` for direct mesh manipulation during animations
- Implement speak animation that triggers on message popup
- Keep geometry simple for performance (low-poly wireframe style)

```javascript
// Standard character component structure
export function ModeCharacter({ onSpeak }) {
  const meshRef = useRef();
  
  const speak = useCallback(() => {
    // Trigger animation (bounce, glow, etc.)
    if (meshRef.current) {
      // Animation logic here
    }
  }, []);
  
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <mesh ref={meshRef}>
      {/* Character geometry */}
    </mesh>
  );
}
```

## Performance Guidelines
- Use `useMemo` for expensive geometry calculations
- Implement LOD (Level of Detail) for complex scenes
- Dispose of geometries and materials properly
- Use `useFrame` with delta time for smooth animations
- Avoid creating new objects in render loops

## Animation Patterns
- Smooth rotations: `rotation.y += delta * speed`
- Pulsing effects: `Math.sin(clock.elapsedTime) * amplitude`
- Random movements: Use seeded random for consistent behavior
- Easing: Use drei's `useSpring` or custom easing functions

## Error Handling
- Wrap Three.js components in error boundaries
- Provide fallback components for failed loads
- Handle WebGL context loss gracefully
- Log Three.js warnings and errors appropriately

## Placeholder Requirements
- Each scene should have 2-3 animated elements maximum
- Use basic geometry: boxes, spheres, planes, toruses
- Implement subtle continuous animations (rotation, scaling, position)
- Match the mood of the personality mode through color and movement
- Keep render complexity low for smooth 60fps performance