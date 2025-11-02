# Design Document

## Overview

The message system design creates an immersive terminal-style communication interface where AI personality messages appear in strategically positioned containers around characters. The design emphasizes readability, personality expression, and seamless integration with the retro-futuristic terminal aesthetic while providing flexible positioning and animation systems.

## Architecture

### Component Structure
```
MessageSystem
├── MessageScheduler (timing and queue management)
├── MessagePopup (individual message container)
├── PositionCalculator (character-relative positioning)
├── AnimationController (fade in/out and effects)
└── AccessibilityManager (screen reader and a11y support)
```

### Message Flow
1. **Scheduler** → Triggers message based on mode timing
2. **Message Selection** → Random pick from mode's message array
3. **Position Calculation** → Determine container placement relative to character
4. **Container Creation** → Render terminal-style message box
5. **Animation** → Fade in with typing effect
6. **Lifespan** → Display for configured duration
7. **Cleanup** → Fade out and remove from DOM

## Components and Interfaces

### MessagePopup Component Props
```typescript
interface MessagePopupProps {
  message: string;
  position: 'above' | 'below' | 'left' | 'right' | 'overlay';
  characterPosition: { x: number; y: number };
  mode: string;
  onComplete: () => void;
  style?: 'speechBubble' | 'overlay';
  animationType?: 'normal' | 'glitchy' | 'typing';
}
```

### Position Configuration
```typescript
interface PositionConfig {
  above: { offsetY: -120, offsetX: 0 };
  below: { offsetY: 120, offsetX: 0 };
  left: { offsetY: -60, offsetX: -200 };
  right: { offsetY: -60, offsetX: 200 };
  overlay: { centerScreen: true };
}
```

### Mode-Specific Message Positioning
```javascript
const modePositioning = {
  'corporate-ai': { style: 'overlay', position: 'overlay' },
  'zen-monk': { style: 'speechBubble', position: 'left' },
  'chaos': { style: 'overlay', position: 'overlay', animation: 'glitchy' },
  'emotional-damage': { style: 'speechBubble', position: 'above' },
  'therapist': { style: 'speechBubble', position: 'right' },
  'startup-founder': { style: 'overlay', position: 'overlay' },
  'doomsday-prophet': { style: 'overlay', position: 'overlay' },
  'gamer-rage': { style: 'overlay', position: 'overlay' },
  'influencer': { style: 'overlay', position: 'overlay' },
  'wholesome-grandma': { style: 'speechBubble', position: 'below' },
  'spooky': { style: 'overlay', position: 'overlay', animation: 'fade-slow' }
};
```

## Data Models

### Message Container Styling
```css
/* Base terminal message container */
.message-popup {
  position: fixed;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid var(--matrix-green);
  border-radius: 4px;
  padding: 12px 16px;
  font-family: var(--font-terminal);
  color: var(--matrix-green);
  font-size: 14px;
  line-height: 1.4;
  max-width: 300px;
  min-width: 200px;
  z-index: 50;
  box-shadow: 
    0 0 20px var(--phosphor-glow),
    inset 0 0 20px rgba(0, 255, 0, 0.1);
  backdrop-filter: blur(5px);
}

/* Terminal prompt prefix */
.message-popup::before {
  content: '> ';
  color: var(--matrix-green);
  font-weight: bold;
}

/* Speech bubble tail */
.message-popup.speech-bubble::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 8px solid transparent;
}

/* Positioning variants */
.message-popup.position-above::after {
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: var(--matrix-green);
}

.message-popup.position-below::after {
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: var(--matrix-green);
}

.message-popup.position-left::after {
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: var(--matrix-green);
}

.message-popup.position-right::after {
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: var(--matrix-green);
}
```

### Animation Definitions
```css
/* Standard fade in animation */
@keyframes messageAppear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Typing effect animation */
@keyframes typingEffect {
  0% { width: 0; }
  100% { width: 100%; }
}

/* Glitchy chaos animation */
@keyframes glitchEffect {
  0%, 100% { 
    transform: translateX(0);
    filter: hue-rotate(0deg);
  }
  10% { 
    transform: translateX(-2px);
    filter: hue-rotate(90deg);
  }
  20% { 
    transform: translateX(2px);
    filter: hue-rotate(180deg);
  }
  30% { 
    transform: translateX(-1px);
    filter: hue-rotate(270deg);
  }
}

/* Fade out animation */
@keyframes messageDisappear {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9) translateY(-10px);
  }
}
```

## Error Handling

### Position Calculation Safety
```javascript
const calculateSafePosition = (basePosition, characterPos, viewport) => {
  let { x, y } = basePosition;
  
  // Ensure message stays within viewport
  const messageWidth = 300;
  const messageHeight = 100;
  
  // Horizontal bounds checking
  if (x + messageWidth > viewport.width) {
    x = viewport.width - messageWidth - 20;
  }
  if (x < 20) {
    x = 20;
  }
  
  // Vertical bounds checking
  if (y + messageHeight > viewport.height - 100) { // Account for mode selector
    y = viewport.height - messageHeight - 120;
  }
  if (y < 20) {
    y = 20;
  }
  
  return { x, y };
};
```

### Message Queue Management
```javascript
class MessageScheduler {
  constructor() {
    this.activeMessages = new Set();
    this.messageQueue = [];
    this.isPaused = false;
    this.currentTimeout = null;
  }
  
  scheduleNext(mode) {
    if (this.isPaused) return;
    
    const config = modeConfigs[mode];
    const delay = Math.random() * 
      (config.maxDelaySeconds - config.minDelaySeconds) + 
      config.minDelaySeconds;
    
    this.currentTimeout = setTimeout(() => {
      this.showMessage(mode);
      this.scheduleNext(mode);
    }, delay * 1000);
  }
  
  showMessage(mode) {
    if (this.activeMessages.size >= 3) return; // Max 3 concurrent messages
    
    const message = this.selectRandomMessage(mode);
    const messageId = Date.now();
    
    this.activeMessages.add(messageId);
    
    // Create and show message popup
    this.createMessagePopup(message, mode, messageId);
  }
  
  cleanup(messageId) {
    this.activeMessages.delete(messageId);
  }
}
```

## Testing Strategy

### Visual Positioning Tests
```javascript
const positioningTests = [
  'Messages appear in correct positions relative to character',
  'Speech bubble tails point toward character correctly',
  'Messages stay within viewport boundaries',
  'Multiple messages stack without overlapping',
  'Mobile positioning adapts appropriately',
  'Messages avoid mode selector area',
  'Overlay messages center properly on all screen sizes'
];
```

### Animation Performance Tests
```javascript
const animationTests = [
  'Fade in animations complete smoothly',
  'Typing effects render at readable speed',
  'Glitch effects don\'t cause seizure risk',
  'Fade out animations clean up properly',
  'Reduced motion preferences are respected',
  'Animations maintain 60fps performance'
];
```

### Accessibility Testing
```javascript
const accessibilityTests = [
  'Screen readers announce message content',
  'ARIA labels are properly set',
  'High contrast mode adjusts styling',
  'Keyboard navigation works with messages',
  'Focus management handles message lifecycle',
  'Color contrast meets WCAG standards'
];
```

## Implementation Notes

### Character Position Detection
```javascript
const getCharacterPosition = () => {
  const characterElement = document.querySelector('.character-container');
  if (!characterElement) return { x: window.innerWidth - 120, y: window.innerHeight - 120 };
  
  const rect = characterElement.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
};
```

### Message Selection Algorithm
```javascript
const selectMessage = (mode, messageHistory = []) => {
  const messages = modeMessages[mode] || [];
  
  // Avoid repeating recent messages
  const availableMessages = messages.filter(msg => 
    !messageHistory.slice(-5).includes(msg)
  );
  
  if (availableMessages.length === 0) {
    return messages[Math.floor(Math.random() * messages.length)];
  }
  
  return availableMessages[Math.floor(Math.random() * availableMessages.length)];
};
```

### Responsive Positioning
```css
/* Mobile adaptations */
@media (max-width: 768px) {
  .message-popup {
    max-width: 250px;
    font-size: 12px;
    padding: 8px 12px;
  }
  
  .message-popup.position-left,
  .message-popup.position-right {
    /* Convert to above/below on mobile */
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
  }
}
```

### Performance Optimizations
- **Message Pooling**: Reuse DOM elements for better performance
- **Intersection Observer**: Only animate visible messages
- **Debounced Positioning**: Limit position recalculations during resize
- **Memory Management**: Clean up event listeners and timeouts properly

This design creates an engaging, accessible message system that brings the AI personalities to life while maintaining the terminal aesthetic and ensuring excellent user experience across all devices and accessibility needs.