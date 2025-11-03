# VibeScreen Data Directory

This directory contains the core configuration and message data for VibeScreen.

## Files

### `global-config.json`
Global configuration file containing default settings for all personality modes:

- **Timing Settings**: Default message display intervals (15-45 seconds)
- **Animation Settings**: Speed multipliers and motion preferences
- **Message Categories**: Weight distribution for different message types
- **Accessibility Options**: Reduced motion, high contrast, and lifespan settings
- **User Preferences**: Sound, animation, theme, and terminal behavior defaults
- **Validation Schema**: Allowed values and ranges for all settings

### `master-messages/` (Coming Soon)
Directory containing master message lists organized by category:

- `funny-exaggerations.json` - Humorous and energetic AI phrases
- `cliche-ai-phrases.json` - Standard AI assistant responses  
- `cliche-ai-things.json` - Neutral AI phrase variations
- `readme.txt` - Distribution guidelines for personality modes

## Configuration Loading

The configuration system includes:

- **Validation**: All values are sanitized and validated against acceptable ranges
- **Fallbacks**: Graceful degradation when files are missing or corrupted
- **Caching**: In-memory caching to avoid repeated file reads
- **Error Handling**: Comprehensive error logging and recovery

## Usage

```javascript
import { loadGlobalConfig, getConfigValue } from '../utils/configLoader.js';

// Load complete configuration
const config = await loadGlobalConfig();

// Get specific values with fallbacks
const minDelay = await getConfigValue('defaultMinDelaySeconds', 15);
const theme = await getConfigValue('userPreferences.preferredTheme', 'matrix-green');
```

## Validation

Run the configuration test to verify system integrity:

```bash
node utils/testConfig.js
```

This validates:
- JSON syntax and structure
- Required field presence
- Value ranges and constraints
- Message category weight distribution
- Accessibility compliance
- User preference defaults