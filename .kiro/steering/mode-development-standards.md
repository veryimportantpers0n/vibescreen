---
inclusion: fileMatch
fileMatchPattern: "**/modes/**/*"
---

# Mode Development Standards

## File Structure Requirements
Each mode folder must contain exactly these files:
- `config.json` - Mode metadata and behavior settings
- `messages.json` - Array of message strings for this personality
- `scene.js` - Three.js background scene component
- `character.js` - Animated character component

## Config.json Schema
```json
{
  "id": "mode-name",
  "name": "Display Name",
  "popupStyle": "overlay|speechBubble",
  "minDelaySeconds": 12,
  "maxDelaySeconds": 45,
  "messageProbabilities": {
    "cliche": 0.6,
    "exaggeration": 0.2,
    "other": 0.2
  },
  "sceneProps": {
    "bgColor": "#f7f7f7",
    "ambientSpeed": 0.2,
    "primaryColor": "#333333"
  }
}
```

## Messages.json Format
```json
[
  "First message for this personality",
  "Second message with appropriate tone",
  "At least 15-20 messages per mode",
  "Messages should match the personality perfectly"
]
```

## Scene Component Requirements
- Export default function named `ModeScene`
- Accept `sceneProps` parameter from config
- Return a complete Canvas or scene elements
- Include ambient lighting and camera setup
- Implement continuous subtle animation
- Match personality through visual style

```javascript
// Template structure
export default function ModeScene({ sceneProps }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <SceneContent {...sceneProps} />
    </Canvas>
  );
}
```

## Character Component Requirements
- Export default function named `ModeCharacter`
- Accept `onSpeak` callback prop
- Implement speak animation method
- Use consistent wireframe/low-poly style
- Position appropriately for speech bubbles

```javascript
// Template structure
export default function ModeCharacter({ onSpeak }) {
  const meshRef = useRef();
  
  const speak = useCallback(() => {
    // Animation logic
  }, []);
  
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return <mesh ref={meshRef}>{/* geometry */}</mesh>;
}
```

## Personality Guidelines

### Corporate AI
- Formal, polite, professional tone
- Clean geometric shapes, soft lighting
- Subtle pulsing animations
- Cool color palette (blues, grays)

### Chaos
- Glitchy, unpredictable behavior
- Jittering animations, color shifts
- Random geometry transformations
- High contrast, neon colors

### Emotional Damage
- Passive-aggressive, sarcastic tone
- Dim lighting, flickering effects
- Slow, melancholic animations
- Muted, desaturated colors

### Therapist
- Comforting, understanding tone
- Warm particles, soft movements
- Gentle floating animations
- Warm color palette (oranges, yellows)

### Startup Founder
- Overconfident, buzzword-heavy
- Pulsing neon elements
- Fast, energetic animations
- Bright, attention-grabbing colors

## Testing Requirements
- Each mode must load without errors
- Messages must display with correct popup style
- Scene animations must run smoothly
- Character speak animation must trigger
- Config values must be valid and used correctly

## Replacement Strategy
- All placeholder components designed for easy swapping
- Consistent export names and prop interfaces
- No hard-coded dependencies on placeholder content
- Clear separation between logic and visual implementation