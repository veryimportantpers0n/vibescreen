# Requirements Document

## Introduction

This specification defines the implementation of the remaining eight personality modes to complete the full roster of 11 AI personalities for VibeScreen. Building on the patterns established in the basic modes, these implementations will provide diverse personality experiences while maintaining consistent technical standards and performance requirements.

## Glossary

- **Emotional Damage Mode**: Passive-aggressive personality with sarcastic speech bubbles positioned above character
- **Therapist Mode**: Comforting, understanding personality with speech bubbles positioned right of character
- **Startup Founder Mode**: Overconfident, buzzword-heavy personality with energetic overlay messages
- **Doomsday Prophet Mode**: Dramatic, apocalyptic personality with ominous overlay messages
- **Gamer Rage Mode**: Snappy, competitive personality with rapid overlay messages
- **Influencer Mode**: Hype-focused personality with call-to-action overlay messages
- **Wholesome Grandma Mode**: Cozy, nurturing personality with speech bubbles positioned below character
- **Spooky Mode**: Ghostly, eerie personality with slow-fade overlay messages (bonus Halloween mode)

## Requirements

### Requirement 1

**User Story:** As a developer, I want all remaining personality modes implemented with complete folder structures, so that users can access the full range of 11 AI personalities through terminal commands.

#### Acceptance Criteria

1. WHEN all remaining modes are implemented, THE Mode System SHALL include complete folder structures for emotional-damage, therapist, startup-founder, doomsday-prophet, gamer-rage, influencer, wholesome-grandma, and spooky modes
2. WHEN any remaining mode is accessed, THE Mode System SHALL successfully load all required files (config.json, messages.json, scene.js, character.js)
3. WHERE mode switching occurs, THE Mode System SHALL support terminal commands for all personality names (!switch Emotional Damage, !switch Therapist, etc.)
4. WHEN the complete roster is available, THE Mode System SHALL provide 11 distinct personality experiences with unique visual and behavioral characteristics
5. WHILE maintaining consistency, THE Mode System SHALL follow established patterns from basic modes for file structure and component interfaces

### Requirement 2

**User Story:** As a user, I want visually distinct scenes for each personality, so that I can immediately recognize which AI personality is active through unique background aesthetics.

#### Acceptance Criteria

1. WHEN Emotional Damage is active, THE Visual System SHALL display dim room with flickering effects and desaturated colors
2. WHEN Therapist is active, THE Visual System SHALL show warm soft particles with gentle floating animations
3. WHERE Startup Founder is active, THE Visual System SHALL render pulsing neon pillars with energetic movements
4. WHEN Doomsday Prophet is active, THE Visual System SHALL display slow approaching red sphere with ominous atmosphere
5. WHILE maintaining performance, THE Visual System SHALL ensure all 8 new scenes run smoothly at 60fps alongside existing modes

### Requirement 3

**User Story:** As a user, I want personality-appropriate messages and positioning for each mode, so that each AI personality feels authentic and engaging through their communication style.

#### Acceptance Criteria

1. WHEN Emotional Damage sends messages, THE Message System SHALL display sarcastic edits of AI phrases with speech bubbles positioned above the character
2. WHEN Therapist communicates, THE Message System SHALL show gentle, supportive messages with speech bubbles positioned right of the character
3. WHERE Startup Founder is active, THE Message System SHALL display hype lines and buzzword-heavy messages with overlay style
4. WHEN Wholesome Grandma speaks, THE Message System SHALL show warm, nurturing messages with speech bubbles positioned below the character
5. WHILE respecting personality traits, THE Message System SHALL use appropriate message timing and popup styles for each mode's character

### Requirement 4

**User Story:** As a content creator, I want diverse message content that matches each personality, so that users experience authentic and entertaining interactions with each AI character.

#### Acceptance Criteria

1. WHEN message content is created, THE Content System SHALL distribute appropriate messages from master lists based on personality traits
2. WHEN Gamer Rage is active, THE Content System SHALL provide short, blunt competitive messages from exaggerated AI lines
3. WHERE Influencer mode is used, THE Content System SHALL display short hype call-to-action messages with social media style
4. WHEN Doomsday Prophet communicates, THE Content System SHALL show dramatic, apocalyptic custom messages
5. WHILE maintaining variety, THE Content System SHALL ensure each mode has at least 15-20 unique messages for engaging interactions

### Requirement 5

**User Story:** As a system administrator, I want all modes to integrate seamlessly with existing components, so that the complete personality roster works reliably with terminal commands, message systems, and visual rendering.

#### Acceptance Criteria

1. WHEN terminal commands are used, THE Integration System SHALL successfully switch between all 11 personality modes using full character names
2. WHEN API endpoints are called, THE Integration System SHALL return correct metadata for all implemented modes including the 8 new personalities
3. WHERE message systems activate, THE Integration System SHALL coordinate popup positioning (above, below, left, right, overlay) correctly for each mode
4. WHEN performance testing occurs, THE Integration System SHALL maintain smooth operation across all 11 modes without memory leaks or performance degradation
5. WHILE validating functionality, THE Integration System SHALL demonstrate that mode switching, message display, and visual rendering work correctly for the complete personality roster