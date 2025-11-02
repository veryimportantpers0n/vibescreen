---
inclusion: always
---

# Terminal Command System

## Overview
VibeScreen uses a retro terminal command interface for all user interactions. Commands use the exclamation prefix (!command) and support full character names for an authentic terminal experience.

## Complete Command Reference

### Core Navigation Commands
```bash
!help                           # Display all available commands and usage
!switch <Character Name>        # Change to specified character/personality mode
!status                         # Show current character, message status, and system info
!clear                          # Clear terminal command history
```

### Character Management
```bash
!characters                     # List all available characters with descriptions
!switch Corporate AI            # Switch to Corporate AI personality mode
!switch Zen Monk               # Switch to Zen Monk personality mode  
!switch Chaos                   # Switch to Chaos personality mode
!switch Emotional Damage        # Switch to Emotional Damage personality mode
!switch Therapist               # Switch to Therapist personality mode
!switch Startup Founder         # Switch to Startup Founder personality mode
!switch Doomsday Prophet        # Switch to Doomsday Prophet personality mode
!switch Gamer Rage              # Switch to Gamer Rage personality mode
!switch Influencer              # Switch to Influencer personality mode
!switch Wholesome Grandma       # Switch to Wholesome Grandma personality mode
!switch Spooky                  # Switch to Spooky personality mode (bonus)
```

### Message Control Commands
```bash
!pause                          # Pause automatic message rotation
!resume                         # Resume automatic message rotation
!test                           # Trigger immediate test message from current character
!frequency <seconds>            # Set message frequency (e.g., !frequency 30)
```

### System Commands
```bash
!config                         # Display current configuration settings
!debug                          # Show debug information and system status
!version                        # Display VibeScreen version and build info
!reset                          # Reset to default settings and Corporate AI mode
```

### Advanced Commands
```bash
!speed <multiplier>             # Change animation speed (e.g., !speed 1.5)
!theme <name>                   # Change color theme (future feature)
!export                         # Export current settings (future feature)
!import <settings>              # Import settings configuration (future feature)
```

## Command Parsing Rules

### Character Name Matching
- **Case Insensitive**: `!switch corporate ai` = `!switch Corporate AI`
- **Partial Matching**: `!switch corp` matches "Corporate AI" if unique
- **Exact Matching Preferred**: Full names take priority over partial matches
- **Error Handling**: Invalid names show "Character not found. Type !characters for list."

### Command Validation
```javascript
const commandPatterns = {
  help: /^!help$/i,
  switch: /^!switch\s+(.+)$/i,
  characters: /^!characters$/i,
  status: /^!status$/i,
  pause: /^!pause$/i,
  resume: /^!resume$/i,
  test: /^!test$/i,
  clear: /^!clear$/i,
  config: /^!config$/i,
  debug: /^!debug$/i,
  frequency: /^!frequency\s+(\d+)$/i,
  speed: /^!speed\s+([\d.]+)$/i
};
```

## Response Templates

### Success Responses
```bash
> !switch Zen Monk
Switching to Zen Monk...
Character loaded: Zen Monk
Messages: Active (speechBubble, left position)
Message frequency: 15-45 seconds

> !pause
Message rotation paused.

> !test
Displaying test message from Zen Monk...
```

### Error Responses
```bash
> !switch Invalid Name
Error: Character "Invalid Name" not found.
Type !characters to see available options.

> !frequency abc
Error: Invalid frequency. Use numbers only (e.g., !frequency 30)

> !unknown
Error: Unknown command "unknown"
Type !help for available commands.
```

### Help Response
```bash
> !help
VibeScreen Terminal Commands:

Character Control:
  !switch <name>     - Change character (e.g., !switch Zen Monk)
  !characters        - List all available characters
  !status           - Show current character and settings

Message Control:
  !pause            - Pause automatic messages
  !resume           - Resume automatic messages  
  !test             - Show test message now
  !frequency <sec>  - Set message timing

System:
  !help             - Show this help
  !clear            - Clear terminal history
  !config           - Show current settings
  !debug            - Show debug information

Type any command to get started!
```

## Terminal UI Specifications

### Container Behavior
- **Visibility**: Hidden by default, appears on mouse hover over trigger area
- **Auto-hide**: Disappears when mouse leaves terminal area after 2 seconds
- **Position**: Bottom-left corner, above mode selector area
- **Size**: 400px width, auto height (max 200px with scroll)

### Visual Styling
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
```

### Input Styling
```css
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

## Integration Points

### Character Name Mapping
```javascript
const characterNameMap = {
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
  'spooky': 'spooky'
};
```

### Command Handler Interface
```javascript
interface CommandHandler {
  execute(command: string, args: string[]): CommandResult;
  validate(command: string): boolean;
  getHelp(): string;
}

interface CommandResult {
  success: boolean;
  message: string;
  action?: 'switch-character' | 'pause-messages' | 'show-config';
  data?: any;
}
```

## Accessibility Considerations
- **Screen Reader Support**: All command responses announced via ARIA live regions
- **Keyboard Navigation**: Tab to terminal, Enter to execute, Escape to hide
- **High Contrast**: Terminal styling adapts to high contrast preferences
- **Voice Commands**: Future integration with speech recognition APIs

This terminal command system provides the authentic retro computing experience while maintaining modern usability and accessibility standards.