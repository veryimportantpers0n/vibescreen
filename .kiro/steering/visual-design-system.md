---
inclusion: fileMatch
fileMatchPattern: "**/*.{css,scss,jsx,tsx}"
---

# Visual Design System

## Theme Overview
VibeScreen uses a retro-futuristic terminal aesthetic inspired by Linux terminals, The Matrix, and Fallout computer interfaces. The design creates an ambient, nostalgic computing experience perfect for second-monitor companions.

## Color Palette

### Primary Colors (Matrix Green Theme)
```css
:root {
  --matrix-green: #00FF00;        /* Bright terminal green */
  --matrix-green-dim: #008F11;    /* Dimmed green for secondary text */
  --matrix-green-dark: #003300;   /* Dark green for backgrounds */
  --terminal-black: #000000;      /* Pure black backgrounds */
  --terminal-dark: #0a0a0a;       /* Slightly lighter black for depth */
  --phosphor-glow: #00FF0080;     /* Semi-transparent green for glow effects */
}
```

### Accent Colors
```css
:root {
  --amber-warning: #FFB000;       /* Fallout-style amber for warnings */
  --red-error: #FF0000;           /* Classic terminal red for errors */
  --blue-info: #0080FF;           /* Retro blue for information */
  --white-text: #FFFFFF;          /* High contrast white text */
}
```

## Typography

### Font Stack
```css
:root {
  --font-mono: 'Courier New', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  --font-terminal: 'Source Code Pro', 'Fira Code', var(--font-mono);
}
```

### Text Styles
```css
.terminal-text {
  font-family: var(--font-terminal);
  color: var(--matrix-green);
  text-shadow: 0 0 5px var(--phosphor-glow);
  letter-spacing: 0.05em;
}

.terminal-prompt {
  color: var(--matrix-green);
  font-weight: bold;
}

.terminal-cursor::after {
  content: '█';
  animation: blink 1s infinite;
}
```

## Layout System

### Full-Screen Background
```css
.scene-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  overflow: hidden;
}
```

### Character Positioning
```css
.character-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10;
  width: 200px;
  height: 200px;
}

@media (max-width: 768px) {
  .character-container {
    width: 150px;
    height: 150px;
    bottom: 80px; /* Above mobile mode selector */
    right: 15px;
  }
}
```

### UI Overlay System
```css
.ui-overlay {
  position: relative;
  z-index: 100;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid var(--matrix-green);
  box-shadow: 
    0 0 10px var(--phosphor-glow),
    inset 0 0 10px rgba(0, 255, 0, 0.1);
}
```

### Terminal Interface
```css
.terminal-container {
  position: fixed;
  bottom: 80px;
  left: 20px;
  width: 400px;
  max-height: 200px;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid var(--matrix-green);
  border-radius: 4px;
  font-family: var(--font-terminal);
  font-size: 12px;
  color: var(--matrix-green);
  box-shadow: 0 0 20px var(--phosphor-glow);
  z-index: 200;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.terminal-container.visible {
  opacity: 1;
  transform: translateY(0);
}

.terminal-input {
  background: transparent;
  border: none;
  color: var(--matrix-green);
  font-family: var(--font-terminal);
  font-size: 12px;
  width: 100%;
  outline: none;
}

.terminal-prompt::before {
  content: '> ';
  color: var(--matrix-green);
  font-weight: bold;
}
```

## Terminal Effects

### Scan Lines Effect
```css
.terminal-scanlines::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    transparent 50%,
    rgba(0, 255, 0, 0.03) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 1000;
}
```

### Phosphor Glow Animation
```css
@keyframes phosphor-glow {
  0%, 100% { 
    text-shadow: 0 0 5px var(--phosphor-glow);
  }
  50% { 
    text-shadow: 0 0 10px var(--phosphor-glow), 0 0 15px var(--matrix-green-dim);
  }
}

.glow-text {
  animation: phosphor-glow 2s ease-in-out infinite;
}
```

### Terminal Cursor Blink
```css
@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
```

## Component-Specific Styling

### Mode Selector (Bottom Navigation)
```css
.mode-selector {
  background: rgba(0, 0, 0, 0.9);
  border-top: 2px solid var(--matrix-green);
  box-shadow: 0 -5px 15px var(--phosphor-glow);
}

.mode-button {
  background: transparent;
  border: 1px solid var(--matrix-green-dim);
  color: var(--matrix-green);
  font-family: var(--font-terminal);
  transition: all 0.3s ease;
}

.mode-button:hover {
  background: var(--matrix-green-dark);
  box-shadow: 0 0 10px var(--phosphor-glow);
  text-shadow: 0 0 5px var(--matrix-green);
}

.mode-button.active {
  background: var(--matrix-green);
  color: var(--terminal-black);
  box-shadow: 0 0 15px var(--matrix-green);
}
```

### Message Popups
```css
.message-popup {
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid var(--matrix-green);
  border-radius: 4px;
  padding: 12px 16px;
  font-family: var(--font-terminal);
  color: var(--matrix-green);
  box-shadow: 
    0 0 20px var(--phosphor-glow),
    inset 0 0 20px rgba(0, 255, 0, 0.1);
}

.message-popup::before {
  content: '> ';
  color: var(--matrix-green);
  font-weight: bold;
}
```

## Responsive Design

### Breakpoints
```css
/* Mobile */
@media (max-width: 768px) {
  .terminal-text { font-size: 14px; }
  .character-container { 
    width: 120px; 
    height: 120px; 
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .terminal-text { font-size: 16px; }
  .character-container { 
    width: 180px; 
    height: 180px; 
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .terminal-text { font-size: 18px; }
  .character-container { 
    width: 200px; 
    height: 200px; 
  }
}
```

## Accessibility Considerations

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  :root {
    --matrix-green: #00FF00;
    --terminal-black: #000000;
    --phosphor-glow: transparent;
  }
  
  .terminal-text {
    text-shadow: none;
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .phosphor-glow,
  .terminal-cursor::after,
  .mode-button {
    animation: none;
  }
  
  .terminal-scanlines::before {
    display: none;
  }
}
```

## Implementation Guidelines

1. **Always use CSS custom properties** for colors to enable easy theming
2. **Apply terminal effects sparingly** to avoid overwhelming the user
3. **Ensure sufficient contrast** for accessibility compliance
4. **Test on multiple screen sizes** to verify responsive behavior
5. **Provide fallbacks** for users who prefer reduced motion or high contrast