# Design Document

## Overview

The data foundation design establishes a comprehensive system for managing message content, global configuration, and data validation for VibeScreen. This system provides the content infrastructure that will power all personality modes while maintaining flexibility for future expansion and easy content management.

## Architecture

### Data Organization Structure
```
/data/
├── global-config.json          (Universal defaults)
├── master-messages/
│   ├── funny-exaggerations.json    (List A: 24 humorous AI lines)
│   ├── cliche-ai-phrases.json      (List B: 20 typical AI responses)
│   ├── cliche-ai-things.json       (List C: 20 neutral AI phrases)
│   └── readme.txt                  (Distribution guidelines)
```

### Configuration Hierarchy
1. **Global Defaults** - Base settings for all modes
2. **Mode Overrides** - Specific settings per personality mode
3. **User Preferences** - Runtime customizations (future)

## Components and Interfaces

### Global Configuration Schema
```json
{
  "defaultMinDelaySeconds": 15,
  "defaultMaxDelaySeconds": 45,
  "defaultPopupStyle": "overlay",
  "animationSpeedMultiplier": 1.0,
  "messageCategories": {
    "cliche": { "weight": 0.6, "description": "Standard AI responses" },
    "exaggeration": { "weight": 0.2, "description": "Humorous AI lines" },
    "other": { "weight": 0.2, "description": "Neutral variations" }
  },
  "accessibility": {
    "reducedMotion": false,
    "highContrast": false,
    "messageLifespanMultiplier": 1.0
  }
}
```

### Master Message List Structure
Each message list follows a consistent JSON array format:
```json
[
  "Message string 1",
  "Message string 2",
  "Message string N"
]
```

### Message Distribution Guidelines
**List A (Funny/Exaggerated)** - 24 entries:
- Target modes: startup-founder, gamer-rage, chaos, influencer
- Tone: Humorous, confident, energetic
- Usage: High-energy personalities that need engaging content

**List B (Cliché AI Phrases)** - 20 entries:
- Target modes: corporate-ai, therapist, emotional-damage
- Tone: Formal, helpful, standard AI responses
- Usage: Professional or supportive personalities

**List C (Neutral AI Things)** - 20 entries:
- Target modes: zen-monk, wholesome-grandma, doomsday-prophet
- Tone: Calm, neutral, philosophical
- Usage: Balanced personalities that need versatile content

## Data Models

### Message Category System
```javascript
const MessageCategory = {
  CLICHE: 'cliche',           // Standard AI responses
  EXAGGERATION: 'exaggeration', // Humorous/energetic content
  OTHER: 'other'              // Neutral/custom content
};
```

### Validation Schema
```javascript
const GlobalConfigSchema = {
  defaultMinDelaySeconds: { type: 'number', min: 5, max: 300 },
  defaultMaxDelaySeconds: { type: 'number', min: 10, max: 600 },
  defaultPopupStyle: { type: 'string', enum: ['overlay', 'speechBubble'] },
  animationSpeedMultiplier: { type: 'number', min: 0.1, max: 5.0 }
};
```

## Error Handling

### Data Loading Resilience
- **Missing Files**: Provide hardcoded fallback message arrays
- **Corrupted JSON**: Log errors and use default configuration
- **Invalid Values**: Sanitize and clamp to acceptable ranges
- **Network Issues**: Cache data locally for offline operation

### Validation Error Recovery
```javascript
const validateAndSanitize = (config) => {
  return {
    defaultMinDelaySeconds: Math.max(5, Math.min(300, config.defaultMinDelaySeconds || 15)),
    defaultMaxDelaySeconds: Math.max(10, Math.min(600, config.defaultMaxDelaySeconds || 45)),
    defaultPopupStyle: ['overlay', 'speechBubble'].includes(config.defaultPopupStyle) 
      ? config.defaultPopupStyle : 'overlay',
    animationSpeedMultiplier: Math.max(0.1, Math.min(5.0, config.animationSpeedMultiplier || 1.0))
  };
};
```

## Testing Strategy

### Data Integrity Tests
1. **JSON Validation**: Verify all files parse correctly
2. **Schema Compliance**: Ensure configuration matches expected structure
3. **Message Quality**: Validate message arrays contain appropriate content
4. **Distribution Logic**: Test message assignment to personality modes

### Performance Considerations
- **Lazy Loading**: Load message lists only when needed
- **Caching**: Store parsed JSON in memory after first load
- **Bundle Size**: Keep message files reasonably sized (< 10KB each)

### Manual Validation Checklist
- All 24 funny/exaggerated messages are engaging and appropriate
- All 20 cliché AI phrases sound like typical AI responses
- All 20 neutral phrases are versatile for multiple personalities
- Global configuration provides sensible defaults
- Documentation clearly explains message distribution strategy

## Implementation Notes

### Content Creation Strategy
The exact message content from the initial concept document will be used:

**List A (funny-exaggerations.json)**: All 24 messages from "A. 20 Funny / Exaggerated AI Lines" plus the 4 additional ones mentioned
**List B (cliche-ai-phrases.json)**: All 20 messages from "B. 20 Cliché AI Phrases"  
**List C (cliche-ai-things.json)**: All 20 messages from "C. 20 Cliché AI Things to Say"

### Distribution Documentation
The readme.txt will include the suggested assignment mapping:
- corporate-ai → Lists B + C
- chaos → Lists A + C (scrambled)
- emotional-damage → Lists B + A (sarcastic edits)
- therapist → List B + custom calming messages
- startup-founder → List A + custom hype messages
- And so on for all personality modes

### Future Extensibility
- Support for additional message categories
- Dynamic message loading from external sources
- User-generated content integration
- Multilingual message support
- A/B testing for message effectiveness

This data foundation provides a robust, maintainable system that supports the creative vision while ensuring technical reliability and ease of content management.