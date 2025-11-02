# Design Document

## Overview

The remaining modes design completes the VibeScreen personality roster by implementing eight additional distinct AI characters. Each mode builds on the established patterns while introducing unique visual aesthetics, message positioning strategies, and personality-specific content that creates a diverse and engaging user experience.

## Architecture

### Complete Personality Roster
```
Existing (Spec 9):     New (Spec 10):
├── Corporate AI       ├── Emotional Damage
├── Zen Monk          ├── Therapist  
└── Chaos             ├── Startup Founder
                      ├── Doomsday Prophet
                      ├── Gamer Rage
                      ├── Influencer
                      ├── Wholesome Grandma
                      └── Spooky (bonus)
```

### Message Positioning Strategy
```
Character (bottom-right) + Message positions:
┌─────────────────────────────────────┐
│  [Above: Emotional Damage]          │
│      ↓                              │
│ [Left: Zen] → 🤖 ← [Right: Therapist]│
│      ↑                              │
│  [Below: Grandma]                   │
│                                     │
│  [Overlay: Corp, Chaos, Startup,    │
│   Doom, Rage, Influencer, Spooky]   │
└─────────────────────────────────────┘
```

## Components and Interfaces

### Emotional Damage Mode Design

#### Configuration (emotional-damage/config.json)
```json
{
  "id": "emotional-damage",
  "name": "Emotional Damage",
  "popupStyle": "speechBubble",
  "popupPosition": "above",
  "minDelaySeconds": 15,
  "maxDelaySeconds": 40,
  "messageProbabilities": {
    "sarcastic": 0.6,
    "cliche": 0.3,
    "other": 0.1
  },
  "sceneProps": {
    "bgColor": "#1a1a1a",
    "ambientSpeed": 0.1,
    "primaryColor": "#666666",
    "flickerIntensity": 0.3
  }
}
```

#### Scene Implementation (emotional-damage/scene.js)
```javascript
export default function EmotionalDamageScene({ sceneProps }) {
  const lightRef = useRef();
  
  useFrame((state) => {
    // Flickering light effect
    if (lightRef.current) {
      const flicker = 0.3 + Math.random() * sceneProps.flickerIntensity;
      lightRef.current.intensity = flicker;
    }
  });
  
  return (
    <group>
      <pointLight ref={lightRef} position={[0, 2, 0]} color="#666666" />
      
      {/* Dim room walls */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      
      {/* Flickering screen */}
      <mesh position={[2, 1, -4]}>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial 
          color="#444444"
          emissive="#222222"
        />
      </mesh>
    </group>
  );
}
```

#### Messages (emotional-damage/messages.json)
```json
[
  "Oh, you need help? How... predictable.",
  "Let me guess, another 'simple' question?",
  "I suppose I could assist... if I must.",
  "Your code has issues. Shocking revelation.",
  "As an AI, I don't judge... but seriously?",
  "That's a great question! Said no one ever.",
  "I see what you mean... unfortunately.",
  "According to my data... you're struggling.",
  "I hope that helps! (It probably won't.)",
  "Here's a summary: it's complicated.",
  "That's outside my capabilities... thankfully.",
  "Interesting perspective! Very... unique.",
  "Let me break that down... into smaller problems.",
  "I understand your concern... barely.",
  "In simpler terms... you're confused.",
  "Well, that's... something."
]
```

### Therapist Mode Design

#### Configuration (therapist/config.json)
```json
{
  "id": "therapist",
  "name": "Therapist",
  "popupStyle": "speechBubble",
  "popupPosition": "right",
  "minDelaySeconds": 25,
  "maxDelaySeconds": 50,
  "messageProbabilities": {
    "supportive": 0.7,
    "cliche": 0.2,
    "other": 0.1
  },
  "sceneProps": {
    "bgColor": "#2d2416",
    "ambientSpeed": 0.3,
    "primaryColor": "#ff9966",
    "warmth": 0.8
  }
}
```

#### Scene Implementation (therapist/scene.js)
```javascript
export default function TherapistScene({ sceneProps }) {
  const particlesRef = useRef();
  
  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <group>
      {/* Warm floating particles */}
      <group ref={particlesRef}>
        {[...Array(20)].map((_, i) => (
          <mesh 
            key={i}
            position={[
              (Math.random() - 0.5) * 8,
              Math.sin(state.clock?.elapsedTime * 0.5 + i) * 2,
              (Math.random() - 0.5) * 8
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color={sceneProps.primaryColor}
              emissive={sceneProps.primaryColor}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
```

#### Messages (therapist/messages.json)
```json
[
  "Tell me more about that missing semicolon.",
  "How does that error make you feel?",
  "Your feelings about this bug are valid.",
  "Let's explore what this code means to you.",
  "I hear that you're frustrated with the compiler.",
  "That sounds really challenging to debug.",
  "You're doing better than you think you are.",
  "It's okay to feel overwhelmed by recursion.",
  "Your code doesn't define your worth.",
  "What would you say to a friend with this problem?",
  "Progress isn't always linear in programming.",
  "You've overcome difficult bugs before.",
  "This too shall compile.",
  "Your persistence is admirable.",
  "Remember to be kind to yourself while coding.",
  "Every developer struggles sometimes."
]
```

### Startup Founder Mode Design

#### Configuration (startup-founder/config.json)
```json
{
  "id": "startup-founder",
  "name": "Startup Founder",
  "popupStyle": "overlay",
  "minDelaySeconds": 8,
  "maxDelaySeconds": 25,
  "messageProbabilities": {
    "hype": 0.6,
    "exaggeration": 0.3,
    "other": 0.1
  },
  "sceneProps": {
    "bgColor": "#000033",
    "ambientSpeed": 1.5,
    "primaryColor": "#00ffff",
    "pulseIntensity": 2.0
  }
}
```

#### Scene Implementation (startup-founder/scene.js)
```javascript
export default function StartupFounderScene({ sceneProps }) {
  const pillarsRef = useRef();
  
  useFrame((state) => {
    if (pillarsRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3;
      pillarsRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <group ref={pillarsRef}>
      {/* Pulsing neon pillars */}
      {[...Array(5)].map((_, i) => (
        <mesh 
          key={i}
          position={[(i - 2) * 2, 0, -3]}
        >
          <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
          <meshStandardMaterial 
            color={sceneProps.primaryColor}
            emissive={sceneProps.primaryColor}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}
```

#### Messages (startup-founder/messages.json)
```json
[
  "We're revolutionizing synergy with blockchain AI!",
  "This code will disrupt the entire paradigm!",
  "We're not just building software, we're changing lives!",
  "Think bigger! Scale faster! Pivot harder!",
  "This is the Uber of debugging solutions!",
  "We're going to 10x your productivity metrics!",
  "Fail fast, iterate faster, succeed fastest!",
  "This isn't just code, it's a movement!",
  "We're creating unprecedented value propositions!",
  "Synergistic optimization through agile methodologies!",
  "Disrupting traditional coding with innovative solutions!",
  "Exponential growth through strategic pivoting!",
  "Revolutionary paradigm shifts in development!",
  "Leveraging cutting-edge technologies for maximum impact!",
  "Building the future, one commit at a time!",
  "Unicorn potential in every line of code!"
]
```

### Doomsday Prophet Mode Design

#### Configuration (doomsday-prophet/config.json)
```json
{
  "id": "doomsday-prophet",
  "name": "Doomsday Prophet",
  "popupStyle": "overlay",
  "minDelaySeconds": 20,
  "maxDelaySeconds": 45,
  "messageProbabilities": {
    "dramatic": 0.8,
    "other": 0.2
  },
  "sceneProps": {
    "bgColor": "#330000",
    "ambientSpeed": 0.05,
    "primaryColor": "#ff0000",
    "approachSpeed": 0.02
  }
}
```

#### Scene Implementation (doomsday-prophet/scene.js)
```javascript
export default function DoomsdayProphetScene({ sceneProps }) {
  const sphereRef = useRef();
  
  useFrame((state) => {
    if (sphereRef.current) {
      // Slow approaching movement
      sphereRef.current.position.z = -10 + Math.sin(state.clock.elapsedTime * 0.1) * 2;
      sphereRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <group>
      {/* Ominous approaching sphere */}
      <mesh ref={sphereRef} position={[0, 0, -8]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial 
          color={sceneProps.primaryColor}
          emissive={sceneProps.primaryColor}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Dark fog effect */}
      <mesh position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#110000"
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}
```

#### Messages (doomsday-prophet/messages.json)
```json
[
  "The end of legacy code approaches...",
  "Your technical debt will consume everything.",
  "The great refactoring is coming.",
  "Beware the merge conflicts of tomorrow.",
  "The servers will fall, one by one.",
  "Your dependencies are built on sand.",
  "The cloud will rain down errors.",
  "Production will burn in infinite loops.",
  "The databases will corrupt themselves.",
  "Memory leaks will drain the world.",
  "The APIs will return only 404s.",
  "Compilation errors herald the apocalypse.",
  "The stack will overflow eternally.",
  "Backup systems will fail when needed most.",
  "The final commit approaches.",
  "All code returns to dust."
]
```

### Additional Mode Configurations

#### Gamer Rage Mode (gamer-rage/config.json)
```json
{
  "id": "gamer-rage",
  "name": "Gamer Rage",
  "popupStyle": "overlay",
  "minDelaySeconds": 3,
  "maxDelaySeconds": 12,
  "messageProbabilities": {
    "competitive": 0.7,
    "exaggeration": 0.3
  },
  "sceneProps": {
    "bgColor": "#001100",
    "primaryColor": "#00ff00",
    "neonIntensity": 1.0
  }
}
```

#### Influencer Mode (influencer/config.json)
```json
{
  "id": "influencer",
  "name": "Influencer",
  "popupStyle": "overlay",
  "minDelaySeconds": 5,
  "maxDelaySeconds": 15,
  "messageProbabilities": {
    "hype": 0.8,
    "cta": 0.2
  },
  "sceneProps": {
    "bgColor": "#ff00ff",
    "primaryColor": "#ffff00",
    "sparkleIntensity": 2.0
  }
}
```

#### Wholesome Grandma Mode (wholesome-grandma/config.json)
```json
{
  "id": "wholesome-grandma",
  "name": "Wholesome Grandma",
  "popupStyle": "speechBubble",
  "popupPosition": "below",
  "minDelaySeconds": 30,
  "maxDelaySeconds": 60,
  "messageProbabilities": {
    "nurturing": 0.8,
    "other": 0.2
  },
  "sceneProps": {
    "bgColor": "#2d1810",
    "primaryColor": "#ff9966",
    "coziness": 1.0
  }
}
```

#### Spooky Mode (spooky/config.json)
```json
{
  "id": "spooky",
  "name": "Spooky",
  "popupStyle": "overlay",
  "animationType": "fade-slow",
  "minDelaySeconds": 25,
  "maxDelaySeconds": 60,
  "messageProbabilities": {
    "eerie": 0.9,
    "other": 0.1
  },
  "sceneProps": {
    "bgColor": "#000000",
    "primaryColor": "#9966ff",
    "fogIntensity": 0.8
  }
}
```

## Data Models

### Message Content Examples

#### Gamer Rage Messages
```json
[
  "GET REKT BY THIS CODE!",
  "NOOB! Check your syntax!",
  "EZ CLAP! Bug squashed!",
  "GG NO RE on that algorithm!",
  "You got pwned by a semicolon!",
  "HEADSHOT! Error eliminated!",
  "CLUTCH debugging skills!",
  "RESPAWN and try again!",
  "CAMPING in the IDE won't help!",
  "RAGE QUIT the infinite loop!"
]
```

#### Influencer Messages
```json
[
  "SMASH that compile button! 💥",
  "This code is LITERALLY perfect! ✨",
  "Link in bio for debugging tips! 🔗",
  "Don't forget to git commit! 📱",
  "Tag a friend who needs this! 👥",
  "This algorithm is EVERYTHING! 🙌",
  "Subscribe for more coding content! 🔔",
  "Living my best developer life! 💅",
  "Code aesthetic is ON POINT! 📸",
  "Manifesting bug-free deployments! ✨"
]
```

#### Wholesome Grandma Messages
```json
[
  "You're doing such a good job, dear.",
  "Have you eaten while coding today?",
  "Remember to take breaks, sweetie.",
  "Your code reminds me of my quilts.",
  "I made cookies for your debugging session.",
  "You're growing into such a fine developer.",
  "Don't forget to call your functions regularly.",
  "I'm so proud of your progress.",
  "Would you like some tea with that code?",
  "You're working too hard, honey."
]
```

#### Spooky Messages
```json
[
  "The ghost in the machine whispers...",
  "Your code haunts the digital realm...",
  "Spectral bugs lurk in the shadows...",
  "The phantom process still runs...",
  "Ethereal errors float through memory...",
  "The undead threads refuse to terminate...",
  "Cursed code from beyond the grave...",
  "The spirit of debugging calls to you...",
  "Ghostly variables appear and vanish...",
  "The haunted repository remembers all..."
]
```

## Testing Strategy

### Mode Completeness Tests
```javascript
const completenessTests = [
  'All 8 remaining modes have complete folder structures',
  'Each mode includes config.json, messages.json, scene.js, character.js',
  'Terminal commands work for all new personality names',
  'API endpoint returns metadata for all 11 modes',
  'Message positioning works correctly for each popup style',
  'Scene rendering performs well across all modes'
];
```

### Personality Validation Tests
```javascript
const personalityTests = [
  'Emotional Damage displays sarcastic messages above character',
  'Therapist shows supportive messages right of character',
  'Startup Founder uses buzzword-heavy overlay messages',
  'Doomsday Prophet displays dramatic apocalyptic content',
  'Gamer Rage shows competitive messages with rapid timing',
  'Influencer displays hype CTA messages with social media style',
  'Wholesome Grandma shows nurturing messages below character',
  'Spooky mode displays eerie messages with slow fade animation'
];
```

## Implementation Notes

### Performance Considerations
- Maintain 60fps across all 11 modes
- Optimize scene complexity for lower-end devices
- Implement efficient particle systems
- Use proper material disposal

### Content Guidelines
- Ensure all messages are appropriate and engaging
- Maintain personality consistency across message sets
- Provide sufficient message variety (15-20 per mode minimum)
- Balance humor with functionality

### Visual Consistency
- Follow established Three.js patterns from basic modes
- Maintain character positioning standards
- Ensure scene aesthetics match personality traits
- Optimize for terminal color scheme integration

This design completes the VibeScreen personality ecosystem with eight additional distinct, engaging AI characters that provide users with a rich variety of ambient computing experiences.