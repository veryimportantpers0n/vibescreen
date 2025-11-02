# Design Document

## Overview

The terminal interface design creates an authentic retro computing experience that serves as the primary control mechanism for VibeScreen. The design emphasizes usability, authenticity, and seamless integration with the ambient interface while providing powerful command-based control over all system functions.

## Architecture

### Component Structure
```
TerminalInterface
├── TerminalContainer (hover-activated wrapper)
├── TerminalDisplay (command history and output)
├── TerminalInput (command input field)
├── CommandParser (command interpretation)
├── CommandExecutor (action execution)
└── ResponseFormatter (output formatting)
```

### Command Flow
1. **User Input** → Command typed in terminal
2. **Parsing** → Command validated and parsed for arguments
3. **Execution** → Appropriate action executed (character switch, message control, etc.)
4. **Feedback** → Response formatted and displayed in terminal
5. **State Update** → Application state updated if needed

### Integration Points
```javascript
// Terminal integrates with existing systems
const integrationPoints = {
  characterSwitching: 'ModeLoader component',
  messageControl: 'MessageScheduler system', 
  systemStatus: 'Global application state',
  errorHandling: 'Centralized error boundary'
};
```

## Components and Interfaces

### TerminalInterface Component Props
```typescript
interface TerminalInterfaceProps {
  onCharacterSwitch: (characterId: string) => void;
  onMessageControl: (action: 'pause' | 'resume' | 'test') => void;
  currentCharacter: string;
  messageStatus: 'active' | 'paused';
  className?: string;
}
```

### Command Parser Interface
```typescript
interface CommandParser {
  parse(input: string): ParsedCommand;
  validate(command: ParsedCommand): ValidationResult;
  suggest(input: string): string[];
}

interface ParsedCommand {
  command: string;
  args: string[];
  raw: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  suggestion?: string;
}
```

### Command Registry
```javascript
const commandRegistry = {
  help: {
    pattern: /^!help$/i,
    description: 'Show all available commands',
    execute: () => showHelp()
  },
  switch: {
    pattern: /^!switch\s+(.+)$/i,
    description: 'Switch to character (e.g., !switch Corporate AI)',
    execute: (args) => switchCharacter(args[0])
  },
  characters: {
    pattern: /^!characters$/i,
    description: 'List all available characters',
    execute: () => listCharacters()
  },
  status: {
    pattern: /^!status$/i,
    description: 'Show current character and system status',
    execute: () => showStatus()
  },
  pause: {
    pattern: /^!pause$/i,
    description: 'Pause automatic message rotation',
    execute: () => pauseMessages()
  },
  resume: {
    pattern: /^!resume$/i,
    description: 'Resume automatic message rotation',
    execute: () => resumeMessages()
  },
  test: {
    pattern: /^!test$/i,
    description: 'Show test message from current character',
    execute: () => testMessage()
  },
  clear: {
    pattern: /^!clear$/i,
    description: 'Clear terminal command history',
    execute: () => clearTerminal()
  }
};
```

## Data Models

### Terminal State Management
```typescript
interface TerminalState {
  visible: boolean;
  focused: boolean;
  history: TerminalEntry[];
  currentInput: string;
  cursorPosition: number;
}

interface TerminalEntry {
  type: 'command' | 'response' | 'error';
  content: string;
  timestamp: Date;
}
```

### Character Name Mapping
```javascript
const characterNameMap = {
  // Full names (primary)
  'corporate ai': 'corporate-ai',
  'zen monk': 'zen-monk',
  'chaos': 'chaos',
  'emotional damage': 'emotional-damage',
  'therapist': 'therapist',
  'startup founder': 'startup-founder',
  'doomsday prophet': 'doomsday-prophet',
  'gamer rage': 'gamer-rage',
  'influencer': 'influencer',
  'wholesome grandma': 'wholesome-grandma',
  'spooky': 'spooky',
  
  // Partial matches (fallback)
  'corp': 'corporate-ai',
  'zen': 'zen-monk',
  'damage': 'emotional-damage',
  'startup': 'startup-founder',
  'doom': 'doomsday-prophet',
  'rage': 'gamer-rage',
  'grandma': 'wholesome-grandma'
};
```

## Error Handling

### Command Validation and Suggestions
```javascript
class CommandValidator {
  validate(input) {
    const trimmed = input.trim();
    
    // Check if command starts with !
    if (!trimmed.startsWith('!')) {
      return {
        valid: false,
        error: 'Commands must start with ! (e.g., !help)',
        suggestion: `Try: !${trimmed}`
      };
    }
    
    // Parse command and arguments
    const [command, ...args] = trimmed.slice(1).split(/\s+/);
    
    // Check if command exists
    if (!commandRegistry[command.toLowerCase()]) {
      const suggestions = this.findSimilarCommands(command);
      return {
        valid: false,
        error: `Unknown command "${command}"`,
        suggestion: suggestions.length > 0 
          ? `Did you mean: ${suggestions.join(', ')}?`
          : 'Type !help for available commands'
      };
    }
    
    return { valid: true };
  }
  
  findSimilarCommands(input) {
    const commands = Object.keys(commandRegistry);
    return commands.filter(cmd => 
      cmd.includes(input.toLowerCase()) || 
      input.toLowerCase().includes(cmd)
    );
  }
}
```

### Character Name Fuzzy Matching
```javascript
class CharacterMatcher {
  findCharacter(input) {
    const normalized = input.toLowerCase().trim();
    
    // Exact match first
    if (characterNameMap[normalized]) {
      return {
        found: true,
        character: characterNameMap[normalized],
        displayName: this.getDisplayName(characterNameMap[normalized])
      };
    }
    
    // Partial match
    const partialMatches = Object.keys(characterNameMap)
      .filter(name => name.includes(normalized) || normalized.includes(name));
    
    if (partialMatches.length === 1) {
      return {
        found: true,
        character: characterNameMap[partialMatches[0]],
        displayName: this.getDisplayName(characterNameMap[partialMatches[0]])
      };
    }
    
    if (partialMatches.length > 1) {
      return {
        found: false,
        error: `Multiple matches found: ${partialMatches.join(', ')}`,
        suggestion: 'Be more specific or use full character name'
      };
    }
    
    return {
      found: false,
      error: `Character "${input}" not found`,
      suggestion: 'Type !characters to see available options'
    };
  }
}
```

## Testing Strategy

### Command Parsing Tests
```javascript
const commandTests = [
  { input: '!help', expected: { command: 'help', args: [] } },
  { input: '!switch Corporate AI', expected: { command: 'switch', args: ['Corporate AI'] } },
  { input: '!SWITCH zen monk', expected: { command: 'switch', args: ['zen monk'] } },
  { input: 'help', expected: { error: 'Commands must start with !' } },
  { input: '!invalid', expected: { error: 'Unknown command' } }
];
```

### Character Matching Tests
```javascript
const characterTests = [
  { input: 'Corporate AI', expected: 'corporate-ai' },
  { input: 'corp', expected: 'corporate-ai' },
  { input: 'zen', expected: 'zen-monk' },
  { input: 'invalid', expected: null }
];
```

### Integration Tests
```javascript
const integrationTests = [
  'Terminal appears on hover over trigger area',
  'Terminal hides after 2 seconds of mouse inactivity',
  'Character switching commands update application state',
  'Message control commands integrate with scheduler',
  'Error messages display correctly in terminal',
  'Command history persists during session',
  'Keyboard navigation works properly'
];
```

## Implementation Notes

### Hover Detection and Auto-hide
```javascript
class TerminalVisibility {
  constructor(terminalElement, triggerArea) {
    this.terminal = terminalElement;
    this.trigger = triggerArea;
    this.hideTimeout = null;
    this.isVisible = false;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Show on hover
    this.trigger.addEventListener('mouseenter', () => {
      this.show();
    });
    
    // Hide on leave (with delay)
    this.terminal.addEventListener('mouseleave', () => {
      this.scheduleHide();
    });
    
    // Cancel hide if mouse returns
    this.terminal.addEventListener('mouseenter', () => {
      this.cancelHide();
    });
  }
  
  show() {
    this.cancelHide();
    this.terminal.classList.add('visible');
    this.isVisible = true;
  }
  
  scheduleHide() {
    this.hideTimeout = setTimeout(() => {
      this.hide();
    }, 2000);
  }
  
  cancelHide() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }
  
  hide() {
    this.terminal.classList.remove('visible');
    this.isVisible = false;
  }
}
```

### Command History Management
```javascript
class TerminalHistory {
  constructor(maxEntries = 50) {
    this.entries = [];
    this.maxEntries = maxEntries;
    this.currentIndex = -1;
  }
  
  addEntry(type, content) {
    const entry = {
      type,
      content,
      timestamp: new Date()
    };
    
    this.entries.push(entry);
    
    // Limit history size
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }
    
    this.currentIndex = -1;
  }
  
  navigateHistory(direction) {
    const commandEntries = this.entries.filter(e => e.type === 'command');
    
    if (direction === 'up') {
      this.currentIndex = Math.min(this.currentIndex + 1, commandEntries.length - 1);
    } else {
      this.currentIndex = Math.max(this.currentIndex - 1, -1);
    }
    
    return this.currentIndex >= 0 ? commandEntries[commandEntries.length - 1 - this.currentIndex].content : '';
  }
}
```

### Responsive Design
```css
/* Desktop terminal */
.terminal-container {
  position: fixed;
  bottom: 80px;
  left: 20px;
  width: 400px;
  max-height: 200px;
}

/* Mobile adaptations */
@media (max-width: 768px) {
  .terminal-container {
    bottom: 60px;
    left: 10px;
    right: 10px;
    width: auto;
    max-width: 350px;
    font-size: 11px;
  }
  
  .terminal-trigger {
    /* Larger touch target on mobile */
    width: 60px;
    height: 40px;
  }
}
```

### Performance Optimizations
- **Debounced Input**: Prevent excessive parsing during rapid typing
- **Virtual Scrolling**: Handle large command histories efficiently
- **Memoized Suggestions**: Cache command suggestions for better performance
- **Lazy Loading**: Load command handlers only when needed

This design creates an authentic, powerful terminal interface that enhances the retro-futuristic experience while providing intuitive, accessible control over all VibeScreen functionality.