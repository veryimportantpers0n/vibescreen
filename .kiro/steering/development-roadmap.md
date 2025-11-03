---
inclusion: always
---

# VibeScreen Development Roadmap

## Spec Development Order & Naming Scheme

### Phase 1: Foundation (Core Infrastructure)
**Spec 1: `01-project-scaffold.spec.yaml`**
- Create Next.js project structure, package.json, basic routing
- Set up core directories and configuration files
- Implement basic homepage with placeholder content
- **Files to create**: `package.json`, `next.config.js`, `pages/_app.js`, `pages/index.js`, `styles/globals.css`, `.gitignore`, `README.md`

**Spec 2: `02-data-foundation.spec.yaml`**
- Create all master message lists and global configuration
- Set up data structure and JSON schemas
- Implement data validation and loading utilities
- **Files to create**: `data/global-config.json`, `data/master-messages/*.json`, `data/master-messages/readme.txt`

**Spec 3: `03-api-endpoints.spec.yaml`**
- Implement `/api/modes` endpoint
- Create mode discovery and metadata loading
- Set up API error handling and validation
- **Files to create**: `pages/api/modes.js`

### Phase 2: Core Components (UI Foundation)
**Spec 4: `04-mode-selector.spec.yaml`**
- Build bottom navigation mode selector
- Implement keyboard navigation and accessibility
- Create mode switching logic and state management
- **Files to create**: `components/ModeSelector.jsx`, `styles/modeThemes.css`

**Spec 5: `05-scene-wrapper.spec.yaml`**
- Create universal Three.js canvas wrapper
- Set up react-three-fiber integration
- Implement basic lighting and camera setup
- **Files to create**: `components/SceneWrapper.jsx`

**Spec 6: `06-message-system.spec.yaml`**
- Build message popup component with both overlay and speech bubble styles
- Implement animation system and stacking logic
- Create timing and scheduling system
- **Files to create**: `components/MessagePopup.jsx`, `styles/animations.css`

**Spec 7: `07-controls-interface.spec.yaml`**
- Create controls bar with pause/resume, test popup, volume toggle
- Implement user preference persistence
- Add accessibility features and keyboard shortcuts
- **Files to create**: `components/ControlsBar.jsx`

### Phase 3: Mode System (Personality Implementation)
**Spec 8: `08-mode-loader.spec.yaml`**
- Build dynamic mode loading system
- Implement error handling and fallbacks
- Create mode validation and component importing
- **Files to create**: `components/ModeLoader.jsx`, `components/CharacterHost.jsx`

**Spec 9: `09-basic-modes.spec.yaml`**
- Create 3 basic personality modes as proof of concept
- Implement placeholder scenes and characters
- Set up mode configuration and message systems
- **Files to create**: `modes/corporate-ai/*`, `modes/zen-monk/*`, `modes/chaos/*`

**Spec 10: `10-remaining-modes.spec.yaml`**
- Implement remaining 7+ personality modes
- Create all placeholder scenes and characters
- Populate all message datasets
- **Files to create**: All remaining `modes/*/` folders and files

### Phase 4: Enhancement (Polish & Features)
**Spec 11: `11-visual-polish.spec.yaml`**
- Enhance styling and visual design
- Implement mode-specific theming
- Add responsive design and mobile optimization
- **Files to create**: Enhanced CSS files, `public/icons/*`

**Spec 12: `12-advanced-features.spec.yaml`**
- Add optional sound system
- Implement advanced animations and transitions
- Create additional user customization options
- **Files to create**: `public/sounds/*`, enhanced component features

### Phase 5: Testing & Deployment
**Spec 13: `13-testing-validation.spec.yaml`**
- Create comprehensive testing suite
- Implement mode validation and error checking
- Set up performance monitoring and optimization
- **Files to create**: Test files, validation utilities

**Spec 14: `14-deployment-prep.spec.yaml`**
- Prepare for static export and deployment
- Create deployment documentation and scripts
- Final hackathon submission preparation
- **Files to create**: Deployment configs, final documentation

## Naming Convention Rules
- **Format**: `{phase-number}{spec-number}-{descriptive-name}.spec.yaml`
- **Phase Numbers**: 01-05 (Foundation, Core, Mode System, Enhancement, Testing)
- **Spec Numbers**: Sequential within each phase
- **Names**: Kebab-case, descriptive of main functionality
- **Examples**: `01-project-scaffold.spec.yaml`, `09-basic-modes.spec.yaml`

## Development Principles

- Every spec includes testing/validation steps
- Build incrementally - each spec depends on previous ones
- Reference sitemap.md for exact file locations
- Follow steering document patterns consistently
- Test thoroughly before moving to next spec


📋 Complete Spec Development System
14 Individual Specs organized in 5 phases:

Foundation (3 specs) - Project setup, data, API
Core Components (4 specs) - UI building blocks
Mode System (3 specs) - Personality implementation
Enhancement (2 specs) - Polish and advanced features
Testing & Deployment (2 specs) - Validation and launch prep
🎯 How to Proceed
Open the MASTER-SPEC-GUIDE.md - This contains all 14 prompts ready to copy/paste
Start with Spec 1 - Copy the exact prompt for 01-project-scaffold.spec.yaml
Create each spec in order - Each builds on the previous ones
Reference the steering files - They're automatically included in prompts
Test after each spec - Validation steps are included
🏗️ What Each Spec Builds
Specs 1-3: Get a working Next.js app with data and API
Specs 4-7: Build all the UI components and interactions
Specs 8-10: Implement the complete personality mode system
Specs 11-12: Polish the experience and add advanced features
Specs 13-14: Test everything and prepare for hackathon submission