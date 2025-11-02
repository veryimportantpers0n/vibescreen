---
inclusion: always
---

# VibeScreen Project Sitemap

## Complete File Structure

```
/ (repo root)
│
├── /.kiro/
│   ├── specs/vibescreen.spec.yaml      → Kiro test + validation spec (defines endpoints, data flow, etc.)
│   ├── vibe_transcript.md              → Prompt transcript used to generate scaffold
│   ├── steering/
│   │   ├── vibescreen-project-context.md
│   │   ├── threejs-implementation.md
│   │   ├── message-system-patterns.md
│   │   ├── mode-development-standards.md
│   │   └── sitemap.md
│   └── hooks/                          → Optional automation scripts
│       ├── deploy_preview.hook         → Stub script for generating deploy preview
│       └── test_modes.hook             → Optional hook for testing all modes
│
├── /components/
│   ├── SceneWrapper.jsx                → Universal wrapper for all Three.js mode scenes
│   ├── CharacterHost.jsx               → Loads & positions the active mode character
│   ├── ModeLoader.jsx                  → Dynamically imports mode folder (scene + char + data)
│   ├── TerminalInterface.jsx           → Hover-activated terminal for command-based control
│   ├── CommandParser.jsx               → Processes and executes terminal commands
│   ├── MessagePopup.jsx                → Handles overlay or speech-bubble message rendering
│   └── Layout.jsx                      → Optional layout shell (shared header/footer)
│
├── /modes/                             → Each mode = self-contained character "universe"
│   │                                   → Includes its config, background, messages, and animation
│   ├── /corporate-ai/
│   │   ├── config.json                 → Mode settings (popup style, timing, colors)
│   │   ├── messages.json               → Text messages shown for this mode
│   │   ├── scene.js                    → Placeholder Three.js background (rotating shapes, etc.)
│   │   ├── character.js                → Wireframe character matching mode tone
│   │   └── assets/                     → Optional textures, SFX, or icons
│   │
│   ├── /zen-monk/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── haikus.json                 → Zen-specific text dataset
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── /chaos/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── /emotional-damage/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── /therapist/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── /startup-founder/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── /doomsday-prophet/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── /gamer-rage/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── /influencer/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   ├── /wholesome-grandma/
│   │   ├── config.json
│   │   ├── messages.json
│   │   ├── scene.js
│   │   ├── character.js
│   │   └── assets/
│   │
│   └── /spooky/
│       ├── config.json
│       ├── messages.json
│       ├── scene.js
│       ├── character.js
│       └── assets/
│
├── /data/
│   ├── master-messages/
│   │   ├── funny-exaggerations.json    → "A" master list (humor/hype lines)
│   │   ├── cliche-ai-phrases.json      → "B" master list (classic AI responses)
│   │   ├── cliche-ai-things.json       → "C" master list (neutral filler phrases)
│   │   └── readme.txt                  → Optional: explain how to remix subsets per mode
│   └── global-config.json              → Universal defaults (popup delays, animation speed, etc.)
│
├── /public/
│   ├── favicon.ico
│   ├── icons/                          → Mode selector icons or small SVGs
│   └── sounds/                         → Optional ambient or SFX loops per mode
│
├── /styles/
│   ├── globals.css                     → Core page and layout styling with terminal theme
│   ├── modeThemes.css                  → Mode-specific palette and UI color hooks
│   ├── animations.css                  → Popup, fade, and character bounce transitions
│   └── terminal-effects.css           → Phosphor glow, scan lines, and retro effects
│
├── /pages/
│   ├── index.js                        → Homepage (overview + mode selector)
│   ├── mode/[id].js                    → Dynamic renderer: loads scene + character for selected mode
│   ├── api/modes.js                    → Returns mode metadata by reading each config.json
│   └── _app.js                         → Global wrapper (imports styles, providers, etc.)
│
├── README.md                           → Install + usage + how to replace placeholder components
├── package.json                        → Project dependencies and scripts
├── next.config.js                      → Next.js config and custom build tweaks
└── .gitignore                          → Git ignore file (MUST NOT ignore .kiro directory)
```

---

## File Purpose Explanations

### Core Application Files

**`package.json`** - Project dependencies including Next.js, React, Three.js, react-three-fiber, and development tools. Defines build scripts and project metadata.

**`next.config.js`** - Next.js configuration for optimizing Three.js imports, static export settings, and any custom webpack configurations needed for the project.

**`README.md`** - Installation instructions, usage guide, demo steps, and documentation on how to replace placeholder components with real implementations.

**`.gitignore`** - Standard Git ignore patterns BUT must NOT include `.kiro/` directory as this is required for hackathon submission validation.

### Pages (Next.js Routing)

**`pages/index.js`** - Main homepage featuring the mode selector interface, controls bar, and the active scene wrapper. This is the primary user interface.

**`pages/mode/[id].js`** - Dynamic route for direct mode access (optional). Allows deep linking to specific personality modes.

**`pages/_app.js`** - Global Next.js wrapper that imports CSS, sets up providers, and handles global state management.

**`pages/api/modes.js`** - API endpoint that reads all mode config.json files and returns available modes with their metadata for the frontend.

### Core Components

**`components/SceneWrapper.jsx`** - Universal container that manages Three.js Canvas setup, camera positioning, and lighting for all personality modes.

**`components/ModeLoader.jsx`** - Handles dynamic importing of mode-specific components (scene.js and character.js) with loading states and error handling.

**`components/TerminalInterface.jsx`** - Hover-activated terminal interface for command-based character switching and system control using authentic terminal commands (!switch, !help, !pause, etc.).

**`components/CommandParser.jsx`** - Processes terminal commands and executes corresponding actions with proper error handling, validation, and user feedback.

**`components/MessagePopup.jsx`** - Renders both overlay and speech bubble style messages with animations, stacking, and accessibility features.

**`components/CharacterHost.jsx`** - Manages loading and positioning of the active mode's character component, handles speak animations.

**`components/Layout.jsx`** - Optional shared layout component for consistent header/footer across pages.

### Mode System (Self-Contained Personalities)

Each `/modes/{personality}/` folder contains:

**`config.json`** - Mode metadata including popup style preference, timing settings, color schemes, and animation parameters.

**`messages.json`** - Array of personality-appropriate message strings that will be randomly displayed during mode operation.

**`scene.js`** - Three.js React component that creates the background environment. Exports `ModeScene` component with placeholder geometry and animations.

**`character.js`** - Three.js React component for the animated character. Exports `ModeCharacter` component with speak animation callback support.

**`assets/`** - Optional folder for mode-specific textures, sound effects, or icon files.

**Special Files:**
- `modes/zen-monk/haikus.json` - Additional zen-specific text content for variety in message selection.

### Data Management

**`data/global-config.json`** - Universal default settings for message timing, animation speeds, and other configurable parameters that apply across all modes.

**`data/master-messages/funny-exaggerations.json`** - Master list of humorous and exaggerated AI phrases used as source material for personality-appropriate message selection.

**`data/master-messages/cliche-ai-phrases.json`** - Collection of typical AI assistant responses and phrases for modes that need formal or standard AI personality traits.

**`data/master-messages/cliche-ai-things.json`** - Additional neutral AI phrases and responses for filling out message pools across different personality modes.

**`data/master-messages/readme.txt`** - Documentation explaining how to remix and distribute message subsets to appropriate personality modes.

### Styling

**`styles/globals.css`** - Base application styles with Linux terminal/Matrix theme, typography using monospace fonts, layout fundamentals for full-screen backgrounds, and CSS custom properties for matrix green color scheme.

**`styles/modeThemes.css`** - Mode-specific color palettes and UI styling hooks that change based on active personality mode while maintaining terminal aesthetic.

**`styles/animations.css`** - CSS animations for message popups, character interactions, scene transitions, and UI feedback effects with terminal-style transitions.

**`styles/terminal-effects.css`** - Specialized CSS for phosphor glow effects, scan lines, cursor blink animations, and other retro computer visual effects.

### Public Assets

**`public/favicon.ico`** - Site favicon and app icons.

**`public/icons/`** - SVG icons for mode selector buttons and UI elements.

**`public/sounds/`** - Optional ambient audio loops and sound effects for each personality mode.

### Kiro Integration

**`.kiro/specs/vibescreen.spec.yaml`** - Comprehensive specification defining all APIs, component interfaces, and testing requirements for validation.

**`.kiro/vibe_transcript.md`** - Documentation of the development process and prompts used, required for hackathon submission.

**`.kiro/steering/`** - Context-aware development guidelines that automatically provide relevant information based on which files are being worked on.

**`.kiro/hooks/`** - Optional automation scripts for build processes, testing, and deployment workflows.

This sitemap serves as the definitive reference for project structure and ensures all team members understand the purpose and relationships between different parts of the VibeScreen application.