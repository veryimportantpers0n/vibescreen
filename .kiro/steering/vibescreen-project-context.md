---
inclusion: always
---

# VibeScreen Project Context

## Project Overview
VibeScreen is a Next.js ambient companion application designed for second monitors, featuring AI personality modes with Three.js backgrounds and animated characters. This is a Kiroween hackathon submission for the **Frankenstein** category.

## Visual Design Theme
- **Overall Aesthetic**: Linux terminal/Matrix-inspired with Fallout-style terminal elements
- **Color Scheme**: Dark green matrix colors (#00FF00, #008F11, #003300) on dark backgrounds
- **Layout**: Full-screen 3D backgrounds with characters positioned in bottom-right corner
- **Typography**: Monospace fonts reminiscent of terminal interfaces
- **UI Elements**: Retro terminal styling with scan lines and phosphor glow effects

## Hackathon Requirements
- **Category**: Frankenstein (stitching together incompatible technologies)
- **Technologies Combined**: Next.js + Three.js + AI personalities + ambient computing
- **Deadline**: December 5, 2025
- **Must Include**: `.kiro` directory with specs, steering docs, and usage examples

## Core Architecture Principles
- **Modular Design**: Each mode is self-contained with its own scene, character, messages, and config
- **Dynamic Loading**: Modes are lazy-loaded on demand to keep bundle size reasonable
- **Replaceable Components**: All placeholder scenes and characters can be swapped without changing app logic
- **JSON-Driven**: All configuration and messages stored in human-editable JSON files

## Development Standards
- Use TypeScript where beneficial but JavaScript is acceptable for rapid prototyping
- Implement proper error boundaries for Three.js components
- Ensure accessibility with keyboard navigation and contrast-safe overlays
- Mobile-friendly but optimized for desktop/second monitor usage
- Keep bundle size reasonable with dynamic imports

## Layout and Positioning Standards
- **Background Scenes**: Full viewport coverage (100vw x 100vh) with responsive scaling
- **Character Placement**: Fixed positioning in bottom-right corner (bottom: 20px, right: 20px)
- **UI Overlays**: Terminal-style interfaces with matrix green color scheme
- **Terminal Interface**: Hover-activated command terminal in bottom-left corner for all user interactions
- **Message Popups**: Terminal-style text boxes with retro computer styling positioned relative to characters

## Terminal Command System
- **Primary Interface**: All user interactions through terminal commands using !command syntax
- **Character Switching**: `!switch <Character Name>` (e.g., `!switch Corporate AI`)
- **Message Control**: `!pause`, `!resume`, `!test` commands for message management
- **Help System**: `!help` and `!characters` for user guidance and discovery
- **Auto-hide Behavior**: Terminal appears on hover, disappears automatically when not in use

## File Structure Requirements
- All mode folders must follow identical structure: `config.json`, `messages.json`, `scene.js`, `character.js`
- Components must use consistent naming: `<ModeScene/>` and `<ModeCharacter/>`
- Global configuration in `/data/global-config.json`
- Master message lists in `/data/master-messages/`

## Three.js Implementation Notes
- Use react-three-fiber + drei for cleaner scene management
- All scenes should be self-contained and performant
- Characters need `onSpeak` callback for message animations
- Placeholder implementations should be minimal but functional

## Message System Requirements
- Support both "overlay" and "speechBubble" popup styles
- Configurable timing with min/max delays per mode
- Messages should stack gracefully if multiple appear
- Include "test popup now" functionality for development

## Kiro Integration Points
- Vibe coding for rapid component generation
- Specs for defining API contracts and behavior
- Steering docs for maintaining consistency
- Potential hooks for build/deploy automation