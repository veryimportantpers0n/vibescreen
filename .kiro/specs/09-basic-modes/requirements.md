# Requirements Document

## Introduction

This specification defines the implementation of the first three personality modes (Corporate AI, Zen Monk, and Chaos) as proof of concept for the VibeScreen system. These modes establish the patterns and standards that will be used for all subsequent personality implementations, including placeholder Three.js scenes, animated characters, and personality-appropriate message distributions.

## Glossary

- **Corporate AI Mode**: Formal, polite personality with overlay message style and professional aesthetic
- **Zen Monk Mode**: Calm, haiku-style personality with speech bubble messages and peaceful visuals
- **Chaos Mode**: Glitchy, unpredictable personality with broken animations and chaotic effects
- **Placeholder Scene**: Simple Three.js background using basic geometry that can be replaced later
- **Placeholder Character**: Basic animated 3D character that matches mode personality
- **Message Distribution**: Assignment of appropriate messages from master lists to each personality mode

## Requirements

### Requirement 1

**User Story:** As a developer, I want three complete personality mode implementations, so that I can validate the entire system architecture and establish patterns for remaining modes.

#### Acceptance Criteria

1. WHEN Corporate AI mode is implemented, THE Mode System SHALL include complete folder structure with config.json, messages.json, scene.js, and character.js
2. WHEN Zen Monk mode is implemented, THE Mode System SHALL include all required files plus haikus.json for zen-specific content
3. WHERE Chaos mode is implemented, THE Mode System SHALL include all standard files with glitchy animation configurations
4. WHEN any mode is loaded, THE Mode System SHALL successfully import and render all components without errors
5. WHILE maintaining consistency, THE Mode System SHALL demonstrate different visual styles and message behaviors across all three modes

### Requirement 2

**User Story:** As a user, I want distinct visual personalities for each mode, so that I can immediately recognize which AI personality is active through the background scene and character.

#### Acceptance Criteria

1. WHEN Corporate AI is active, THE Visual System SHALL display rotating polished cubes with soft lighting and professional colors
2. WHEN Zen Monk is active, THE Visual System SHALL show floating lotus elements with slow camera pan and peaceful animations
3. WHERE Chaos mode is active, THE Visual System SHALL render jittering planes with color glitching and unpredictable movements
4. WHEN characters are displayed, THE Visual System SHALL position them consistently in bottom-right corner with mode-appropriate styling
5. WHILE maintaining performance, THE Visual System SHALL ensure all animations run smoothly at 60fps

### Requirement 3

**User Story:** As a user, I want personality-appropriate messages for each mode, so that the AI responses match the expected character and tone of each personality.

#### Acceptance Criteria

1. WHEN Corporate AI sends messages, THE Message System SHALL use formal cliché AI phrases and professional language from master lists B and C
2. WHEN Zen Monk sends messages, THE Message System SHALL display calm haikus and peaceful messages with speech bubble style positioned left of character
3. WHERE Chaos mode is active, THE Message System SHALL show scrambled lines from master list A mixed with glitchy suffixes and broken animations
4. WHEN messages appear, THE Message System SHALL respect mode-specific popup styles (overlay for Corporate AI and Chaos, speechBubble for Zen Monk)
5. WHILE displaying messages, THE Message System SHALL use appropriate timing intervals configured in each mode's config.json

### Requirement 4

**User Story:** As a developer, I want proper mode configurations, so that each personality has correct settings for timing, styling, and behavior that can be easily modified.

#### Acceptance Criteria

1. WHEN mode configurations are created, THE Configuration System SHALL include proper popup styles, timing settings, and scene properties for each mode
2. WHEN Corporate AI config is loaded, THE Configuration System SHALL specify overlay popup style with 12-45 second message intervals
3. WHERE Zen Monk config is defined, THE Configuration System SHALL set speechBubble style with appropriate calm timing and left positioning
4. WHEN Chaos config is processed, THE Configuration System SHALL include overlay style with glitchy animation parameters and chaotic timing
5. WHILE maintaining flexibility, THE Configuration System SHALL allow easy modification of all personality parameters through JSON editing

### Requirement 5

**User Story:** As a system validator, I want all three modes to integrate seamlessly with existing components, so that I can verify the complete system works end-to-end.

#### Acceptance Criteria

1. WHEN terminal commands are used, THE Integration System SHALL successfully switch between all three modes using `!switch Corporate AI`, `!switch Zen Monk`, and `!switch Chaos`
2. WHEN mode switching occurs, THE Integration System SHALL properly load scenes in SceneWrapper and characters in CharacterHost
3. WHERE message systems activate, THE Integration System SHALL coordinate message popups with character speak animations
4. WHEN API endpoints are called, THE Integration System SHALL return correct metadata for all three implemented modes
5. WHILE testing functionality, THE Integration System SHALL demonstrate that all previously built components work correctly with real mode data