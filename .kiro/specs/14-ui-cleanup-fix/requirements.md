# UI Cleanup and Core Functionality Fix Requirements

## Introduction

VibeScreen has accumulated visual and functional issues that make it unusable. This spec addresses critical UI problems including character visibility, excessive visual effects, non-functional controls, and overall poor user experience.

## Glossary

- **VibeScreen**: The main ambient companion application
- **Character**: The 3D animated personality figure that should appear in bottom-right
- **Mode Selector**: Bottom navigation for switching between personality modes
- **Terminal Interface**: Command-line style control interface
- **Scan Lines**: Retro terminal visual effect overlay
- **Development Panel**: Debug/status information display

## Requirements

### Requirement 1: Character Visibility and Loading

**User Story:** As a user, I want to see the animated character clearly in the bottom-right corner, so that I can interact with the personality mode.

#### Acceptance Criteria

1. WHEN the application loads, THE VibeScreen SHALL display a visible 3D character in the bottom-right corner
2. WHEN a character fails to load, THE VibeScreen SHALL display a fallback wireframe character
3. THE VibeScreen SHALL ensure character positioning does not overlap with other UI elements
4. THE VibeScreen SHALL provide adequate lighting for character visibility
5. WHEN switching modes, THE VibeScreen SHALL smoothly transition between characters

### Requirement 2: Visual Effects Optimization

**User Story:** As a user, I want subtle retro effects that enhance rather than overwhelm the interface, so that I can focus on the content.

#### Acceptance Criteria

1. THE VibeScreen SHALL reduce scan line opacity to barely visible levels (0.001 or less)
2. THE VibeScreen SHALL increase overall page brightness by at least 40%
3. THE VibeScreen SHALL eliminate background glitching and visual artifacts
4. THE VibeScreen SHALL use consistent matrix green colors (#00FF41) with proper contrast
5. THE VibeScreen SHALL ensure all text remains readable against backgrounds

### Requirement 3: UI Element Organization

**User Story:** As a user, I want a clean, organized interface without overlapping elements, so that I can navigate effectively.

#### Acceptance Criteria

1. THE VibeScreen SHALL remove or hide the development status panel completely
2. THE VibeScreen SHALL prevent UI element overlap in all viewport sizes
3. THE VibeScreen SHALL position the site title statically without flashing effects
4. THE VibeScreen SHALL organize controls in clearly defined, non-overlapping areas
5. THE VibeScreen SHALL maintain consistent spacing between interface elements

### Requirement 4: Functional Controls

**User Story:** As a user, I want all buttons and controls to work properly, so that I can interact with the application.

#### Acceptance Criteria

1. WHEN clicking mode selector buttons, THE VibeScreen SHALL switch personality modes
2. WHEN clicking settings button, THE VibeScreen SHALL open settings interface
3. WHEN using terminal commands, THE VibeScreen SHALL execute commands and provide feedback
4. THE VibeScreen SHALL provide visual feedback for all interactive elements
5. THE VibeScreen SHALL ensure keyboard navigation works for all controls

### Requirement 5: Performance and Stability

**User Story:** As a user, I want the application to run smoothly without crashes or errors, so that I can use it reliably.

#### Acceptance Criteria

1. THE VibeScreen SHALL load without React hook errors or console warnings
2. THE VibeScreen SHALL prevent infinite render loops and memory leaks
3. THE VibeScreen SHALL handle mode switching without crashes
4. THE VibeScreen SHALL maintain stable frame rates during 3D rendering
5. THE VibeScreen SHALL gracefully handle missing assets or network errors

### Requirement 6: Simplified Architecture

**User Story:** As a developer, I want a cleaner, more maintainable codebase, so that future changes are easier to implement.

#### Acceptance Criteria

1. THE VibeScreen SHALL use a simplified component structure with clear responsibilities
2. THE VibeScreen SHALL eliminate unnecessary complexity and redundant features
3. THE VibeScreen SHALL consolidate styling into focused, organized CSS files
4. THE VibeScreen SHALL remove unused components and utilities
5. THE VibeScreen SHALL document the simplified architecture clearly