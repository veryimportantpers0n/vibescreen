# VibeScreen Master Spec Development Guide

## How to Use This Guide
1. Create each spec in order using the prompts below
2. Reference the steering files mentioned in each prompt
3. Complete each spec fully before moving to the next
4. Test thoroughly at the end of each spec
5. Use the exact naming scheme provided

---

## SPEC 1: Foundation - Project Scaffold

**Spec Name**: `01-project-scaffold.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create a Next.js project scaffold for VibeScreen ambient companion app. 

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/vibescreen-project-context.md]]

Requirements:
- Set up Next.js with pages router (not app router)
- Create package.json with dependencies: next, react, react-dom, three, @react-three/fiber, @react-three/drei
- Basic homepage with title "VibeScreen" and placeholder for mode selector
- Global CSS setup with CSS custom properties for theming
- Next.js config optimized for Three.js
- README with installation and basic usage instructions
- Proper .gitignore that does NOT ignore .kiro directory

Files to create from sitemap:
- package.json
- next.config.js  
- pages/_app.js
- pages/index.js
- styles/globals.css
- .gitignore
- README.md

Testing: Verify `npm install && npm run dev` works and homepage loads at localhost:3000
```

---

## SPEC 2: Data Foundation

**Spec Name**: `02-data-foundation.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create the complete data foundation for VibeScreen message system.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/vibescreen-project-context.md]]
- #[[file:initialconcept.md]]

Requirements:
- Create global-config.json with default timing and animation settings
- Implement all three master message lists from the initial concept:
  * funny-exaggerations.json (20 humorous/exaggerated AI lines)
  * cliche-ai-phrases.json (20 typical AI responses)  
  * cliche-ai-things.json (20 neutral AI phrases)
- Create readme.txt explaining how to distribute messages to personality modes
- Implement JSON validation utilities

Files to create from sitemap:
- data/global-config.json
- data/master-messages/funny-exaggerations.json
- data/master-messages/cliche-ai-phrases.json
- data/master-messages/cliche-ai-things.json
- data/master-messages/readme.txt

Use the exact message lists from initialconcept.md sections A, B, and C.

Testing: Verify all JSON files are valid and can be imported in Node.js
```

---

## SPEC 3: API Endpoints

**Spec Name**: `03-api-endpoints.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create the API endpoint system for VibeScreen mode discovery.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/specs/vibescreen.spec.yaml]]

Requirements:
- Implement /api/modes endpoint that reads mode config.json files
- Return array of mode metadata (id, name, popupStyle, timing settings)
- Handle errors gracefully with proper HTTP status codes
- Support for future mode discovery and validation
- Include proper CORS headers if needed

Files to create from sitemap:
- pages/api/modes.js

API should return format matching the spec:
```json
[
  {
    "id": "corporate-ai",
    "name": "Corporate AI", 
    "popupStyle": "overlay",
    "minDelaySeconds": 12,
    "maxDelaySeconds": 45,
    "sceneProps": {...}
  }
]
```

Testing: Verify endpoint returns empty array initially, proper error handling for missing files
```

---

## SPEC 4: Mode Selector Component

**Spec Name**: `04-mode-selector.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create the bottom navigation mode selector component.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/vibescreen-project-context.md]]

Requirements:
- Bottom-positioned navigation bar with mode buttons
- Keyboard navigation support (arrow keys, enter, escape)
- Visual feedback for active/selected mode
- Responsive design that works on mobile and desktop
- Accessibility features (ARIA labels, focus management)
- Mode switching state management
- Integration with mode theming system

Files to create from sitemap:
- components/ModeSelector.jsx
- styles/modeThemes.css

Component should accept props:
- modes: array of mode objects
- activeMode: string (current mode id)
- onModeChange: function callback

Testing: Verify keyboard navigation, visual states, and callback firing
```

---

## SPEC 5: Scene Wrapper Component

**Spec Name**: `05-scene-wrapper.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create universal Three.js scene wrapper component.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/threejs-implementation.md]]

Requirements:
- Universal Canvas wrapper using react-three-fiber
- Standard camera setup (position [0, 0, 5])
- Basic lighting setup (ambient + point light)
- Error boundary for Three.js failures
- Responsive canvas sizing
- Performance optimization with proper disposal
- Support for mode-specific scene props

Files to create from sitemap:
- components/SceneWrapper.jsx

Component should accept props:
- mode: string (current mode id)
- sceneProps: object (from mode config)
- children: React nodes (scene content)

Testing: Verify Three.js canvas renders, error boundaries work, responsive sizing
```

---

## SPEC 6: Message System

**Spec Name**: `06-message-system.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create the complete message popup system with animations.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/message-system-patterns.md]]

Requirements:
- Support both "overlay" and "speechBubble" popup styles
- Smooth CSS animations for fade in/out and scaling
- Message stacking when multiple appear simultaneously
- Configurable lifespan (4-7 seconds default)
- Timing system with min/max delays
- "Test popup now" functionality
- Accessibility with reduced motion support

Files to create from sitemap:
- components/MessagePopup.jsx
- styles/animations.css

Component should handle:
- Message scheduling and rotation
- Random selection from message arrays
- Animation lifecycle management
- Position calculation for speech bubbles

Testing: Verify both popup styles, animations, stacking, and timing controls
```

---

## SPEC 7: Controls Interface

**Spec Name**: `07-controls-interface.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create the user controls bar interface.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/vibescreen-project-context.md]]

Requirements:
- Pause/resume message system
- "Test popup now" button for development
- Volume toggle for future sound features
- User preference persistence in localStorage
- Keyboard shortcuts (spacebar for pause, T for test)
- Accessibility features and focus management
- Clean, minimal UI design

Files to create from sitemap:
- components/ControlsBar.jsx

Component should provide:
- Global message system control
- Visual feedback for current state
- Keyboard shortcut handling
- Settings persistence

Testing: Verify all controls work, keyboard shortcuts, localStorage persistence
```

---

## SPEC 8: Mode Loading System

**Spec Name**: `08-mode-loader.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create dynamic mode loading and character hosting system.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/mode-development-standards.md]]

Requirements:
- Dynamic import system for mode components (scene.js, character.js)
- Error handling and fallback components
- Loading states and suspense boundaries
- Character positioning and speak animation management
- Mode validation and component interface checking
- Performance optimization with lazy loading

Files to create from sitemap:
- components/ModeLoader.jsx
- components/CharacterHost.jsx

System should handle:
- Dynamic imports: import(`../modes/${modeId}/scene.js`)
- Component validation and error recovery
- Character speak animation callbacks
- Loading and error states

Testing: Verify dynamic imports work, error handling, loading states
```

---

## SPEC 9: Basic Personality Modes

**Spec Name**: `09-basic-modes.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create 3 basic personality modes as proof of concept.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/mode-development-standards.md]]
- #[[file:.kiro/steering/threejs-implementation.md]]
- #[[file:initialconcept.md]]

Requirements:
Create complete mode folders for:
1. corporate-ai (formal, polite, overlay popups)
2. zen-monk (calm, haiku-style, speech bubbles) 
3. chaos (glitchy, unpredictable, overlay popups)

Each mode needs:
- config.json with proper settings
- messages.json with personality-appropriate messages
- scene.js with placeholder Three.js background
- character.js with simple animated character

Files to create from sitemap:
- modes/corporate-ai/* (all 4 files)
- modes/zen-monk/* (all 4 files + haikus.json)
- modes/chaos/* (all 4 files)

Use message distributions from initialconcept.md. Keep Three.js scenes simple but animated.

Testing: Verify all 3 modes load, display messages, show scenes and characters
```

---

## SPEC 10: Remaining Personality Modes

**Spec Name**: `10-remaining-modes.spec.yaml`

**Prompt to use in Spec Mode**:
```
Implement all remaining personality modes to complete the system.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/mode-development-standards.md]]
- #[[file:initialconcept.md]]

Requirements:
Create complete mode folders for remaining personalities:
- emotional-damage (passive-aggressive, speech bubbles)
- therapist (comforting, speech bubbles)
- startup-founder (overconfident, overlay)
- doomsday-prophet (dramatic, overlay)
- gamer-rage (snappy/rude, overlay)
- influencer (hype/CTA, overlay)
- wholesome-grandma (cozy/kind, speech bubbles)
- spooky (ghostly, overlay with slow fade)

Each mode needs all 4 standard files following the established patterns.

Files to create from sitemap:
- All remaining modes/*/* folders and files

Distribute messages appropriately from master lists, create unique scene styles.

Testing: Verify all 11 modes work, proper message distribution, scene variety
```

---

## SPEC 11: Visual Polish

**Spec Name**: `11-visual-polish.spec.yaml`

**Prompt to use in Spec Mode**:
```
Enhance visual design and styling across the application.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/vibescreen-project-context.md]]

Requirements:
- Enhance global styling with better typography and spacing
- Implement mode-specific color theming that changes with active mode
- Create SVG icons for mode selector buttons
- Add responsive design improvements
- Enhance animations and transitions
- Improve accessibility with better contrast and focus indicators

Files to create/enhance from sitemap:
- Enhanced styles/globals.css
- Enhanced styles/modeThemes.css
- public/icons/* (SVG icons for each mode)

Focus on:
- Professional, clean design suitable for second monitor use
- Smooth transitions between modes
- Clear visual hierarchy
- Accessibility compliance

Testing: Verify responsive design, mode theming, icon display, accessibility
```

---

## SPEC 12: Advanced Features

**Spec Name**: `12-advanced-features.spec.yaml`

**Prompt to use in Spec Mode**:
```
Add advanced features and optional enhancements.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/steering/vibescreen-project-context.md]]

Requirements:
- Optional ambient sound system with mode-specific audio loops
- Enhanced Three.js animations and particle effects
- Additional user customization options (message frequency, animation speed)
- Performance monitoring and optimization
- Advanced accessibility features
- Smooth mode transition animations

Files to create from sitemap:
- public/sounds/* (optional ambient audio files)
- Enhanced component features
- Additional customization interfaces

Focus on:
- Optional features that enhance but don't break core functionality
- Performance optimization for smooth 60fps
- User preference expansion

Testing: Verify optional features work, performance remains smooth, no regressions
```

---

## SPEC 13: Testing & Validation

**Spec Name**: `13-testing-validation.spec.yaml`

**Prompt to use in Spec Mode**:
```
Create comprehensive testing and validation system.

Reference steering files:
- #[[file:.kiro/specs/vibescreen.spec.yaml]]
- #[[file:.kiro/steering/sitemap.md]]

Requirements:
- Automated validation of all mode config.json files
- Component testing for critical functionality
- Performance testing and monitoring
- Accessibility testing and validation
- Error boundary testing
- API endpoint testing
- Cross-browser compatibility checks

Create testing utilities and validation scripts that verify:
- All required mode files exist and are valid
- Components render without errors
- API endpoints return correct data
- Accessibility standards are met
- Performance benchmarks are achieved

Testing: Run full test suite, verify all modes work, check performance metrics
```

---

## SPEC 14: Deployment Preparation

**Spec Name**: `14-deployment-prep.spec.yaml`

**Prompt to use in Spec Mode**:
```
Prepare for deployment and final hackathon submission.

Reference steering files:
- #[[file:.kiro/steering/sitemap.md]]
- #[[file:.kiro/specs/vibescreen.spec.yaml]]

Requirements:
- Configure Next.js for static export
- Create deployment documentation and scripts
- Final README updates with demo instructions
- Performance optimization for production
- Final hackathon submission checklist
- Create demo video script and recording guide
- Ensure .kiro directory is properly included

Deliverables:
- Production-ready build configuration
- Deployment documentation
- Demo instructions and video guide
- Final project documentation
- Hackathon submission checklist

Testing: Verify production build works, static export functions, all requirements met
```

---

## Quick Reference

**Steering Files to Reference**:
- `sitemap.md` - Complete file structure and explanations
- `vibescreen-project-context.md` - Project overview and principles  
- `threejs-implementation.md` - Three.js specific guidelines
- `message-system-patterns.md` - Message system implementation
- `mode-development-standards.md` - Mode development standards
- `development-roadmap.md` - This roadmap and naming conventions

**Key Files from Initial Concept**:
- `initialconcept.md` - Original project requirements and message lists
- `vibescreen.spec.yaml` - Main project specification

**Development Order**: Complete specs 1-14 in exact order, testing thoroughly after each one.