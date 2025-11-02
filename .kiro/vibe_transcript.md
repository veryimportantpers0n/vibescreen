# VibeScreen Development Transcript

## Initial Project Setup
**User Request**: Create a Next.js project called VibeScreen for Kiroween hackathon - an ambient AI co-pilot companion for second monitors with personality modes, Three.js backgrounds, and animated characters.

**Kiro Approach**: 
1. Set up comprehensive steering documents for consistent development
2. Create detailed spec file defining all requirements and interfaces
3. Establish modular architecture with replaceable placeholder components
4. Focus on Frankenstein category - stitching together Next.js + Three.js + AI personalities

## Key Architectural Decisions
- **Pages Router**: Chosen over App Router for simplicity and rapid prototyping
- **React Three Fiber**: Selected for cleaner React integration with Three.js
- **JSON-Driven Config**: All modes, messages, and settings stored in editable JSON files
- **Dynamic Imports**: Lazy loading of mode components for performance
- **Modular Design**: Each personality mode is completely self-contained

## Component Structure Strategy
- `SceneWrapper`: Universal container for all Three.js scenes
- `ModeLoader`: Handles dynamic importing of mode-specific components
- `MessagePopup`: Supports both overlay and speech bubble styles
- `CharacterHost`: Manages character loading and speak animations
- `ModeSelector`: Bottom navigation bar for mode switching

## Placeholder Implementation Philosophy
- Keep all placeholder scenes minimal but functional
- Use basic Three.js geometry (cubes, spheres, planes)
- Implement subtle continuous animations matching personality
- Design for easy replacement with AI-generated components
- Maintain consistent export signatures across all modes

## Message System Design
- Weighted random selection from personality-appropriate message pools
- Configurable timing with min/max delays per mode
- Support for stacking multiple messages gracefully
- "Test popup now" functionality for development
- Accessibility considerations with reduced motion support

## Kiro Integration Points
- **Vibe Coding**: Used for rapid component generation and Three.js scene creation
- **Specs**: Comprehensive YAML spec defining all APIs and requirements
- **Steering**: Multiple context-aware documents for different file types
- **Future Hooks**: Prepared for build/deploy automation

## Development Standards Established
- TypeScript optional but JavaScript acceptable for speed
- Error boundaries required for Three.js components
- Keyboard navigation and accessibility compliance
- Mobile-friendly but desktop-optimized
- Bundle size optimization through dynamic imports

This transcript documents the initial setup phase focusing on architecture and standards rather than implementation details.