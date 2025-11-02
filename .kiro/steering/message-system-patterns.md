---
inclusion: fileMatch
fileMatchPattern: "**/MessagePopup.{js,jsx,ts,tsx}"
---

# Message System Implementation Patterns

## Popup Types and Behavior

### Overlay Style
- Center-screen or top-center positioning
- Fade in/out animations with scale effect
- Semi-transparent background for readability
- Stack vertically if multiple messages appear
- 4-7 second default lifespan

### Speech Bubble Style
- Anchored to character position in 3D space
- Tail pointing toward character
- Bounce-in animation from character location
- Follow character if it moves during display
- Slightly longer lifespan (5-8 seconds)

## Message Timing Logic
```javascript
// Standard timing implementation
const scheduleNextMessage = () => {
  const { minDelaySeconds, maxDelaySeconds } = modeConfig;
  const delay = Math.random() * (maxDelaySeconds - minDelaySeconds) + minDelaySeconds;
  
  setTimeout(() => {
    showRandomMessage();
    scheduleNextMessage(); // Recursive scheduling
  }, delay * 1000);
};
```

## Message Selection Algorithm
- Weighted random selection based on mode config
- Avoid repeating the same message within last 5 messages
- Support for message categories (cliche, exaggeration, custom)
- Fallback to default messages if mode messages fail to load

## Animation Requirements
- Smooth CSS transitions for overlay popups
- React Spring or Framer Motion for complex animations
- Stagger animations when multiple messages appear
- Respect user's reduced motion preferences

## Accessibility Considerations
- Ensure sufficient color contrast for all text
- Provide option to disable auto-playing messages
- Support keyboard navigation for manual message triggers
- Screen reader compatible with proper ARIA labels
- Respect prefers-reduced-motion media query

## State Management
- Track active messages to prevent overlap conflicts
- Maintain message history for debugging
- Handle pause/resume functionality globally
- Persist user preferences (frequency, style) in localStorage

## Error Handling
- Graceful fallback if message files fail to load
- Default messages for empty or corrupted message arrays
- Console warnings for malformed message configurations
- Prevent infinite loops in message scheduling