# Design Document

## Overview

The mode selector design creates an intuitive, accessible bottom navigation interface that serves as the primary method for users to discover and switch between AI personality modes. The design emphasizes usability, accessibility, and visual clarity while maintaining the ambient, non-intrusive nature appropriate for a second-monitor companion application.

## Architecture

### Component Structure
```
ModeSelector
├── Container (fixed bottom positioning)
├── ModeButton[] (dynamic list from API)
├── LoadingState (while fetching modes)
├── ErrorState (if API fails)
└── KeyboardHandler (navigation logic)
```

### State Management
```javascript
const [modes, setModes] = useState([]);
const [activeMode, setActiveMode] = useState(null);
const [loading, setLoading] = useState(true);
const [focusedIndex, setFocusedIndex] = useState(0);
```

### Layout Strategy
- **Desktop**: Horizontal bar with evenly spaced mode buttons
- **Mobile**: Scrollable horizontal layout with touch support
- **Positioning**: Fixed bottom with subtle elevation/shadow
- **Spacing**: Adequate touch targets (44px minimum) for accessibility

## Components and Interfaces

### ModeSelector Component Props
```typescript
interface ModeSelectorProps {
  modes?: ModeConfig[];
  activeMode?: string;
  onModeChange: (mode: ModeConfig) => void;
  loading?: boolean;
  className?: string;
}
```

### ModeButton Component
```typescript
interface ModeButtonProps {
  mode: ModeConfig;
  isActive: boolean;
  isFocused: boolean;
  onClick: () => void;
  onFocus: () => void;
}
```

### Visual Design System
```css
/* Mode selector container - Terminal theme */
.mode-selector {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border-top: 2px solid var(--matrix-green);
  box-shadow: 0 -5px 15px var(--phosphor-glow);
  padding: 12px 16px;
  z-index: 100;
  font-family: var(--font-terminal);
}

/* Mode button styling - Terminal aesthetic */
.mode-button {
  min-width: 80px;
  height: 44px;
  border: 1px solid var(--matrix-green-dim);
  background: transparent;
  color: var(--matrix-green);
  font-family: var(--font-terminal);
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.mode-button.active {
  background: var(--matrix-green);
  color: var(--terminal-black);
  box-shadow: 0 0 15px var(--matrix-green);
  text-shadow: none;
}

.mode-button:hover {
  background: var(--matrix-green-dark);
  box-shadow: 0 0 10px var(--phosphor-glow);
  text-shadow: 0 0 5px var(--matrix-green);
}
```

## Data Models

### Mode Configuration Interface
```typescript
interface ModeConfig {
  id: string;
  name: string;
  popupStyle: 'overlay' | 'speechBubble';
  sceneProps: {
    bgColor?: string;
    primaryColor?: string;
  };
}
```

### Component State Interface
```typescript
interface ModeSelectorState {
  modes: ModeConfig[];
  activeMode: string | null;
  loading: boolean;
  error: string | null;
  focusedIndex: number;
}
```

## Error Handling

### API Integration Error Recovery
```javascript
const loadModes = async () => {
  try {
    setLoading(true);
    const response = await fetch('/api/modes');
    const modesData = await response.json();
    setModes(modesData);
    if (modesData.length > 0 && !activeMode) {
      setActiveMode(modesData[0].id);
      onModeChange(modesData[0]);
    }
  } catch (error) {
    console.error('Failed to load modes:', error);
    setError('Unable to load personality modes');
    // Provide fallback modes or graceful degradation
  } finally {
    setLoading(false);
  }
};
```

### User Interaction Error Handling
- **Mode Switch Failures**: Maintain previous active state, show error message
- **Network Issues**: Cache last successful mode list, show offline indicator
- **Invalid Mode Data**: Filter out invalid modes, log warnings
- **Keyboard Navigation**: Handle edge cases (empty lists, disabled buttons)

## Testing Strategy

### Accessibility Testing
1. **Screen Reader**: Verify mode names are announced correctly
2. **Keyboard Navigation**: Test arrow keys, tab order, and activation
3. **Focus Management**: Ensure visible focus indicators and logical flow
4. **Color Contrast**: Verify sufficient contrast for all states
5. **Touch Targets**: Confirm 44px minimum size for mobile interaction

### Responsive Design Testing
```javascript
const breakpoints = {
  mobile: '320px - 768px',
  tablet: '768px - 1024px', 
  desktop: '1024px+'
};

const testScenarios = [
  'Mode buttons fit within viewport width',
  'Touch targets remain accessible on small screens',
  'Horizontal scrolling works smoothly on mobile',
  'Layout adapts gracefully to orientation changes',
  'Text remains readable at all screen sizes'
];
```

### Integration Testing
- **API Integration**: Test with various API response scenarios
- **Mode Switching**: Verify callback execution and state updates
- **Loading States**: Test behavior during API calls
- **Error Recovery**: Test graceful handling of API failures

## Implementation Notes

### Keyboard Navigation Logic
```javascript
const handleKeyDown = (event) => {
  switch (event.key) {
    case 'ArrowLeft':
      setFocusedIndex(prev => Math.max(0, prev - 1));
      break;
    case 'ArrowRight':
      setFocusedIndex(prev => Math.min(modes.length - 1, prev + 1));
      break;
    case 'Enter':
    case ' ':
      if (modes[focusedIndex]) {
        handleModeSelect(modes[focusedIndex]);
      }
      break;
  }
};
```

### Performance Optimizations
- **Memoization**: Use React.memo for ModeButton components
- **Event Delegation**: Single event listener for all mode buttons
- **Debouncing**: Prevent rapid mode switching that could cause issues
- **Lazy Loading**: Load mode icons/assets only when needed

### Theme Integration
```javascript
const getModeTheme = (mode) => ({
  '--primary-color': mode.sceneProps?.primaryColor || '#007acc',
  '--hover-color': mode.sceneProps?.hoverColor || '#005a9e',
  '--bg-color': mode.sceneProps?.bgColor || '#ffffff'
});
```

### Mobile Considerations
- **Touch Gestures**: Support swipe gestures for mode navigation
- **Scroll Behavior**: Smooth horizontal scrolling with momentum
- **Safe Areas**: Respect device safe areas (iPhone notch, etc.)
- **Performance**: Optimize for 60fps scrolling on mobile devices

### Future Extensibility
- **Mode Icons**: Support for custom icons per personality mode
- **Grouping**: Ability to group related modes together
- **Favorites**: User ability to mark favorite modes
- **Search**: Quick search/filter functionality for many modes
- **Customization**: User ability to reorder or hide modes

This design provides a solid foundation for intuitive mode switching while maintaining the accessibility and performance standards needed for a professional ambient application.