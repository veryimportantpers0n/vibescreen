# Design Document

## Overview

This design implements basic 3D content for three personality modes to validate the complete VibeScreen architecture. The focus is on creating simple but functional 3D scenes and characters that demonstrate the system works end-to-end, rather than polished visual content.

## Architecture

### Mode Structure
Each mode follows the established pattern:
```
modes/{mode-name}/
├── config.json     - Mode settings and timing
├── messages.json   - Personality-appropriate messages
├── scene.js        - Three.js background component
└── character.js    - Three.js character component
```

### Component Integration
- **ModeLoader**: Dynamically imports mode components
- **SceneWrapper**: Provides Three.js Canvas and lighting
- **CharacterHost**: Positions and manages character animations
- **Terminal Interface**: Handles mode switching commands
- **Message System**: Displays personality-appropriate messages

## Components and Interfaces

### Scene Components
Each scene component exports a React component using react-three-fiber:

```javascript
// Corporate AI Scene
export function CorporateAIScene() {
  return (
    <group>
      <mesh rotation={[0, 0, 0]} ref={meshRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#00ff00" wireframe />
      </mesh>
      {/* Additional geometric shapes */}
    </group>
  );
}
```

### Character Components
Each character component includes speak animation callback:

```javascript
// Corporate AI Character
export function CorporateAICharacter({ onSpeak }) {
  const characterRef = useRef();
  
  useEffect(() => {
    if (onSpeak) {
      // Trigger speak animation
    }
  }, [onSpeak]);
  
  return (
    <group ref={characterRef} position={[0, -1, 0]}>
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 1.5]} />
        <meshStandardMaterial color="#00ff00" wireframe />
      </mesh>
    </group>
  );
}
```

### Configuration Schema
```json
{
  "name": "Corporate AI",
  "displayName": "Corporate AI",
  "popupStyle": "overlay",
  "messageFrequency": {
    "min": 15000,
    "max": 30000
  },
  "colors": {
    "primary": "#00ff00",
    "secondary": "#008f11"
  },
  "animations": {
    "speed": 1.0,
    "intensity": "medium"
  }
}
```

## Data Models

### Mode Configuration
- **name**: Internal mode identifier
- **displayName**: User-facing mode name
- **popupStyle**: "overlay" or "speechBubble"
- **messageFrequency**: Min/max timing in milliseconds
- **colors**: Primary and secondary theme colors
- **animations**: Speed and intensity settings

### Message Structure
```json
{
  "messages": [
    "Optimizing synergies for maximum efficiency...",
    "Leveraging AI capabilities to drive innovation...",
    "Processing data streams with corporate precision..."
  ]
}
```

## Error Handling

### WebGL Context Management
- Detect WebGL support on component mount
- Graceful fallback to 2D content if WebGL unavailable
- Memory cleanup on component unmount

### Mode Loading Errors
- Catch dynamic import failures
- Display error message in terminal
- Fall back to default mode if specific mode fails

### Performance Monitoring
- Track frame rate during animations
- Monitor memory usage during mode switches
- Log WebGL errors to console for debugging

## Testing Strategy

### Unit Testing
- Test each scene component renders without errors
- Verify character components accept onSpeak callback
- Validate configuration JSON schemas

### Integration Testing
- Test mode switching updates both scene and character
- Verify terminal commands trigger correct mode changes
- Ensure message system works with real content

### Performance Testing
- Measure frame rate with all animations running
- Monitor memory usage during rapid mode switching
- Validate WebGL context handles multiple scene changes

### Visual Validation
- Screenshot comparison for each mode
- Animation smoothness verification
- Character positioning accuracy

## Implementation Details

### Corporate AI Mode
- **Scene**: Rotating geometric shapes (cubes, pyramids)
- **Colors**: Matrix green with structured patterns
- **Animation**: Steady, predictable rotations
- **Character**: Simple wireframe business figure
- **Messages**: Professional AI corporate speak

### Zen Monk Mode  
- **Scene**: Flowing organic shapes (toruses, spheres)
- **Colors**: Soft greens and blues
- **Animation**: Slow, peaceful movements
- **Character**: Simple meditation pose figure
- **Messages**: Zen wisdom and peaceful thoughts

### Chaos Mode
- **Scene**: Multiple erratic shapes with random colors
- **Colors**: Rapidly changing rainbow palette
- **Animation**: Fast, unpredictable movements
- **Character**: Energetic bouncing figure
- **Messages**: Chaotic and energetic phrases

### Performance Optimizations
- Use `useFrame` hook for smooth animations
- Implement object pooling for repeated geometries
- Dispose of geometries and materials on cleanup
- Limit particle counts and polygon complexity