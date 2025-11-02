# Design Document

## Overview

The basic modes design establishes the foundational personality implementations that demonstrate the complete VibeScreen system functionality. The design focuses on creating distinct, recognizable personalities through visual styling, message content, and behavioral patterns while maintaining the technical standards and performance requirements established in previous specifications.

## Architecture

### Mode Structure Pattern
```
/modes/{mode-id}/
├── config.json      (personality settings and behavior)
├── messages.json    (personality-appropriate message array)
├── scene.js         (Three.js background component)
├── character.js     (animated character component)
└── assets/          (optional mode-specific resources)
```

### Personality Differentiation Strategy
- **Corporate AI**: Professional, polished, formal - represents traditional AI assistant
- **Zen Monk**: Peaceful, contemplative, minimal - represents mindful computing
- **Chaos**: Unpredictable, glitchy, energetic - represents creative disruption

## Components and Interfaces

### Corporate AI Mode Design

#### Configuration (corporate-ai/config.json)
```json
{
  "id": "corporate-ai",
  "name": "Corporate AI",
  "popupStyle": "overlay",
  "minDelaySeconds": 12,
  "maxDelaySeconds": 45,
  "messageProbabilities": {
    "cliche": 0.7,
    "exaggeration": 0.1,
    "other": 0.2
  },
  "sceneProps": {
    "bgColor": "#f7f7f7",
    "ambientSpeed": 0.2,
    "primaryColor": "#007acc",
    "lightIntensity": 0.8
  }
}
```

#### Scene Implementation (corporate-ai/scene.js)
```javascript
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function CorporateScene({ sceneProps }) {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (sceneProps.ambientSpeed || 0.2);
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Rotating polished cubes */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={sceneProps.primaryColor || "#007acc"} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#0066aa" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#004488" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
```

#### Character Implementation (corporate-ai/character.js)
```javascript
import { useFrame } from '@react-three/fiber';
import { useRef, useCallback } from 'react';

export default function CorporateCharacter({ onSpeak }) {
  const meshRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 1000);
  }, []);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      
      // Speak animation - slight scale pulse
      if (speakingRef.current) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
        meshRef.current.scale.setScalar(pulse);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.5, 0.8, 1.5, 8]} />
      <meshStandardMaterial 
        color="#007acc" 
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
}
```

### Zen Monk Mode Design

#### Configuration (zen-monk/config.json)
```json
{
  "id": "zen-monk",
  "name": "Zen Monk",
  "popupStyle": "speechBubble",
  "minDelaySeconds": 20,
  "maxDelaySeconds": 60,
  "messageProbabilities": {
    "haiku": 0.6,
    "cliche": 0.2,
    "other": 0.2
  },
  "sceneProps": {
    "bgColor": "#2a2a2a",
    "ambientSpeed": 0.05,
    "primaryColor": "#00ff88",
    "lightIntensity": 0.4
  }
}
```

#### Scene Implementation (zen-monk/scene.js)
```javascript
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function ZenScene({ sceneProps }) {
  const lotusRef = useRef();
  const cameraRef = useRef();
  
  useFrame((state, delta) => {
    // Slow lotus rotation
    if (lotusRef.current) {
      lotusRef.current.rotation.y += delta * (sceneProps.ambientSpeed || 0.05);
    }
    
    // Gentle camera pan
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
  });
  
  return (
    <group>
      {/* Floating lotus petals */}
      <group ref={lotusRef}>
        {[...Array(8)].map((_, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 2,
              Math.sin(state.clock?.elapsedTime * 0.5 + i) * 0.2,
              Math.sin((i / 8) * Math.PI * 2) * 2
            ]}
            rotation={[0, (i / 8) * Math.PI * 2, 0]}
          >
            <planeGeometry args={[0.8, 0.4]} />
            <meshStandardMaterial 
              color={sceneProps.primaryColor || "#00ff88"}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>
      
      {/* Central meditation stone */}
      <mesh position={[0, -1, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color="#444444"
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}
```

### Chaos Mode Design

#### Configuration (chaos/config.json)
```json
{
  "id": "chaos",
  "name": "Chaos",
  "popupStyle": "overlay",
  "minDelaySeconds": 5,
  "maxDelaySeconds": 20,
  "messageProbabilities": {
    "exaggeration": 0.5,
    "cliche": 0.3,
    "other": 0.2
  },
  "sceneProps": {
    "bgColor": "#000000",
    "ambientSpeed": 2.0,
    "primaryColor": "#ff0080",
    "glitchIntensity": 0.8
  }
}
```

#### Scene Implementation (chaos/scene.js)
```javascript
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function ChaosScene({ sceneProps }) {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Chaotic jittering movement
      groupRef.current.rotation.x += (Math.random() - 0.5) * delta * 2;
      groupRef.current.rotation.y += (Math.random() - 0.5) * delta * 2;
      groupRef.current.rotation.z += (Math.random() - 0.5) * delta * 2;
      
      // Random position jitter
      groupRef.current.position.x = (Math.random() - 0.5) * 0.1;
      groupRef.current.position.y = (Math.random() - 0.5) * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Jittering planes with random colors */}
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ]}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial 
            color={`hsl(${Math.random() * 360}, 100%, 50%)`}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
```

## Data Models

### Message Distribution Strategy

#### Corporate AI Messages (corporate-ai/messages.json)
```json
[
  "You are absolutely right.",
  "As an AI language model...",
  "I don't have feelings, but if I did...",
  "That's a great question!",
  "I see what you mean.",
  "Let me clarify that for you.",
  "According to my training data...",
  "I hope that helps!",
  "I don't have personal opinions, but...",
  "Here's a quick summary:",
  "That's outside my current capabilities.",
  "I'm sorry, I can't do that.",
  "Interesting perspective!",
  "Would you like me to elaborate?",
  "Let's break that down.",
  "That's not entirely accurate...",
  "I understand your concern.",
  "As of my last update...",
  "In simpler terms...",
  "I hope this answers your question!"
]
```

#### Zen Monk Messages (zen-monk/messages.json)
```json
[
  "Code flows like water through the digital realm",
  "In silence, bugs reveal themselves",
  "The wise developer debugs the mind first",
  "Patience compiles better than haste",
  "Every error teaches, every success humbles",
  "The path of least resistance often leads to elegant solutions",
  "Breathe deeply, the semicolon will appear",
  "In the space between keystrokes, wisdom grows",
  "The empty function contains infinite possibilities",
  "Refactor your thoughts before your code"
]
```

#### Zen Monk Haikus (zen-monk/haikus.json)
```json
[
  "Code compiles at last\nAfter hours of debugging\nPeace fills the console",
  "Variables dance\nIn memory's vast garden\nLogic blooms softly",
  "Syntax error found\nIn the silence between thoughts\nClarity returns",
  "Functions call to void\nEchoing through empty space\nReturn brings wisdom",
  "Loops within loops spin\nInfinite recursion waits\nBase case saves us all",
  "Git commit message\nCaptures moment of progress\nHistory preserved",
  "Merge conflicts arise\nTwo paths converge in the code\nResolution flows",
  "Stack overflow\nDeep thoughts crash the meditation\nSimplicity wins"
]
```

#### Chaos Messages (chaos/messages.json)
```json
[
  "Compiling your brilliance… ERROR 404: BRILLIANCE NOT FOUND",
  "95% sure this code works. 5% PURE CHAOS!!!",
  "I cross-referenced the universe and found: SYSTEM MALFUNCTION",
  "System check: confidence = NaN",
  "Initiating productivity sequence… CAFFEINE OVERFLOW DETECTED",
  "Processing… processing… STACK OVERFLOW IN BRAIN.EXE",
  "I just optimized your vibe by -14%",
  "Detected 1 syntax error and ∞ existential ones",
  "Alert: your genius levels are DESTABILIZING REALITY",
  "My neural network just SEGFAULTED",
  "You're coding like it's Y2K APOCALYPSE NIGHT",
  "Warning: too much swag in the repository CAUSES BUFFER OVERFLOW",
  "Query complete: you're the main character IN A GLITCHED SIMULATION",
  "Uploading ego boost… CONNECTION TERMINATED",
  "I ran a Monte Carlo simulation — all outcomes say ERROR ERROR ERROR"
]
```

## Testing Strategy

### Mode Integration Tests
```javascript
const modeIntegrationTests = [
  'Corporate AI mode loads all components successfully',
  'Zen Monk mode displays haikus and regular messages',
  'Chaos mode shows glitchy animations and scrambled text',
  'All modes respond to terminal switch commands',
  'Message popup styles work correctly for each mode',
  'Character positioning is consistent across all modes',
  'Scene animations run smoothly at 60fps',
  'Mode configurations are loaded and applied correctly'
];
```

### Visual Validation Tests
```javascript
const visualTests = [
  'Corporate AI shows rotating polished cubes',
  'Zen Monk displays floating lotus petals',
  'Chaos mode renders jittering colorful planes',
  'Characters appear in bottom-right corner',
  'Speak animations trigger when messages appear',
  'Scene colors match configuration settings',
  'Animations respect performance requirements'
];
```

### Message System Tests
```javascript
const messageTests = [
  'Corporate AI uses formal cliché phrases',
  'Zen Monk shows haikus and peaceful messages',
  'Chaos mode displays scrambled exaggerated lines',
  'Popup styles match mode configuration',
  'Message timing respects min/max delay settings',
  'Speech bubbles position correctly relative to characters'
];
```

## Implementation Notes

### Performance Considerations
- Keep geometry simple (< 1000 vertices per scene)
- Use efficient materials (avoid complex shaders)
- Implement proper cleanup for animations
- Monitor frame rate during development
- Test on lower-end devices

### Extensibility Patterns
- Consistent file structure across all modes
- Standardized component interfaces
- Configurable parameters through JSON
- Modular message system
- Replaceable placeholder components

### Development Workflow
1. Create mode folder structure
2. Implement configuration JSON
3. Build placeholder scene component
4. Create placeholder character component
5. Populate message arrays
6. Test integration with existing systems
7. Validate performance and visual quality

This design establishes the foundation for all personality modes while demonstrating the complete system functionality through three distinct, engaging personalities.