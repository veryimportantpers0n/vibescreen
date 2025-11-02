# Design Document

## Overview

The API endpoints design creates a robust, performant system for mode discovery and metadata retrieval. The design emphasizes simplicity, reliability, and performance while providing the flexibility needed for dynamic mode loading and future extensibility.

## Architecture

### API Structure
```
/api/
└── modes.js          → GET /api/modes (mode discovery endpoint)
```

### Request/Response Flow
1. **Client Request** → GET /api/modes
2. **File System Scan** → Read modes/ directory structure
3. **Configuration Loading** → Parse each mode's config.json
4. **Data Validation** → Sanitize and validate configuration data
5. **Response Generation** → Return formatted JSON array
6. **Caching** → Store results for subsequent requests

### Caching Strategy
- **In-Memory Cache**: Parsed configuration data cached in Node.js memory
- **Cache Invalidation**: Development mode clears cache on each request
- **Production Optimization**: Cache persists until server restart
- **File Watching**: Future enhancement to invalidate cache on file changes

## Components and Interfaces

### API Response Schema
```json
[
  {
    "id": "corporate-ai",
    "name": "Corporate AI",
    "popupStyle": "overlay",
    "minDelaySeconds": 12,
    "maxDelaySeconds": 45,
    "messageProbabilities": {
      "cliche": 0.6,
      "exaggeration": 0.2,
      "other": 0.2
    },
    "sceneProps": {
      "bgColor": "#f7f7f7",
      "ambientSpeed": 0.2
    }
  }
]
```

### Error Response Schema
```json
{
  "error": "Configuration error",
  "message": "Invalid JSON in corporate-ai/config.json",
  "modes": [],
  "timestamp": "2025-11-01T12:00:00Z"
}
```

### Configuration Validation
```javascript
const validateModeConfig = (config, modeId) => {
  return {
    id: modeId,
    name: config.name || modeId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    popupStyle: ['overlay', 'speechBubble'].includes(config.popupStyle) ? config.popupStyle : 'overlay',
    minDelaySeconds: Math.max(5, Math.min(300, config.minDelaySeconds || 15)),
    maxDelaySeconds: Math.max(10, Math.min(600, config.maxDelaySeconds || 45)),
    messageProbabilities: config.messageProbabilities || { cliche: 0.6, exaggeration: 0.2, other: 0.2 },
    sceneProps: config.sceneProps || {}
  };
};
```

## Data Models

### Mode Configuration Interface
```typescript
interface ModeConfig {
  id: string;
  name: string;
  popupStyle: 'overlay' | 'speechBubble';
  minDelaySeconds: number;
  maxDelaySeconds: number;
  messageProbabilities: {
    cliche: number;
    exaggeration: number;
    other: number;
  };
  sceneProps: {
    bgColor?: string;
    ambientSpeed?: number;
    [key: string]: any;
  };
}
```

### API Response Interface
```typescript
interface ModesApiResponse {
  modes?: ModeConfig[];
  error?: string;
  message?: string;
  timestamp: string;
}
```

## Error Handling

### File System Error Recovery
```javascript
const loadModeConfig = async (modeId) => {
  try {
    const configPath = path.join(process.cwd(), 'modes', modeId, 'config.json');
    const configData = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(configData);
    return validateModeConfig(config, modeId);
  } catch (error) {
    console.warn(`Failed to load config for mode ${modeId}:`, error.message);
    return null; // Exclude this mode from results
  }
};
```

### HTTP Error Handling
- **200 OK**: Successful response with mode array (may be empty)
- **500 Internal Server Error**: Only for unexpected server errors
- **Graceful Degradation**: Invalid modes excluded, valid modes returned
- **Detailed Logging**: All errors logged with context for debugging

## Testing Strategy

### API Contract Testing
1. **Response Format**: Verify JSON structure matches schema
2. **Data Validation**: Ensure all required fields are present
3. **Error Scenarios**: Test with missing/invalid configuration files
4. **Performance**: Measure response times under various loads
5. **Caching**: Verify cache behavior in development and production

### Integration Testing
```javascript
// Test cases to implement
const testCases = [
  'Returns empty array when no modes exist',
  'Returns valid modes when configurations are correct',
  'Excludes invalid modes but includes valid ones',
  'Handles missing config.json files gracefully',
  'Validates and sanitizes configuration values',
  'Returns consistent response format',
  'Includes proper HTTP headers',
  'Responds within performance thresholds'
];
```

### Manual Testing Checklist
1. **Empty Directory**: Test with no modes/ directory
2. **Valid Configurations**: Test with properly formatted config files
3. **Invalid JSON**: Test with malformed JSON files
4. **Missing Files**: Test with missing config.json files
5. **Mixed Scenarios**: Test with combination of valid and invalid modes
6. **Performance**: Test response time with multiple modes
7. **Concurrent Requests**: Test multiple simultaneous API calls

## Implementation Notes

### File System Operations
- Use Node.js `fs.promises` for async file operations
- Implement proper error handling for file system access
- Use `path.join()` for cross-platform path handling
- Cache directory listings to minimize file system calls

### Next.js Integration
- Leverage Next.js API routes for automatic routing
- Use built-in request/response objects
- Implement proper HTTP method handling (GET only)
- Support both development and production environments

### Performance Optimizations
- Implement simple in-memory caching for parsed configurations
- Use `JSON.stringify()` once and cache the result
- Minimize file system operations through intelligent caching
- Consider lazy loading for large numbers of modes

### Security Considerations
- Validate file paths to prevent directory traversal
- Sanitize configuration data before returning
- Implement rate limiting for production use (future enhancement)
- Use proper error messages that don't expose system internals

### Future Extensibility
- Design supports additional metadata fields
- Cache invalidation system ready for file watching
- Response format allows for pagination (future)
- Error handling supports detailed debugging information

This design provides a solid foundation for mode discovery while maintaining the simplicity and performance needed for a responsive user experience.