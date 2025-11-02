# Requirements Document

## Introduction

This specification defines the API endpoint system for VibeScreen mode discovery and metadata retrieval. The API provides a standardized interface for the frontend to discover available personality modes and their configuration settings, enabling dynamic mode loading and validation.

## Glossary

- **API Endpoint**: Server-side route that provides data to the frontend application
- **Mode Discovery**: Process of identifying available personality modes in the system
- **Mode Metadata**: Configuration data including timing, styling, and behavior settings for each mode
- **Dynamic Loading**: System capability to load modes without hardcoding mode lists
- **CORS**: Cross-Origin Resource Sharing headers for API accessibility

## Requirements

### Requirement 1

**User Story:** As a frontend developer, I want a `/api/modes` endpoint that returns all available personality modes, so that the UI can dynamically discover and load modes without hardcoding.

#### Acceptance Criteria

1. WHEN the `/api/modes` endpoint is called, THE API SHALL return a JSON array of all available modes
2. WHEN mode folders exist in the modes directory, THE API SHALL automatically discover them by reading config.json files
3. WHERE mode configuration is valid, THE API SHALL include complete metadata for each mode
4. WHEN the response is generated, THE API SHALL return proper HTTP status codes (200 for success, 500 for errors)
5. WHILE processing requests, THE API SHALL handle concurrent requests efficiently

### Requirement 2

**User Story:** As a client application, I want consistent mode metadata format, so that I can reliably process mode information for UI rendering and behavior configuration.

#### Acceptance Criteria

1. WHEN mode data is returned, THE API Response SHALL include id, name, popupStyle, and timing settings for each mode
2. WHEN scene configuration exists, THE API Response SHALL include sceneProps object with visual settings
3. WHERE message probabilities are defined, THE API Response SHALL include messageProbabilities configuration
4. WHEN metadata is missing, THE API Response SHALL provide sensible default values
5. WHILE maintaining consistency, THE API Response SHALL follow the established JSON schema format

### Requirement 3

**User Story:** As a system administrator, I want robust error handling in the API, so that the application remains stable even when mode configurations are invalid or missing.

#### Acceptance Criteria

1. WHEN mode config.json files are missing, THE API Error Handler SHALL log warnings and exclude those modes from results
2. WHEN JSON parsing fails, THE API Error Handler SHALL provide detailed error information in logs
3. WHERE invalid configuration values exist, THE API Error Handler SHALL sanitize or use default values
4. WHEN the modes directory is missing, THE API Error Handler SHALL return an empty array with appropriate status
5. WHILE handling errors, THE API Error Handler SHALL never crash the application or return 500 errors for client issues

### Requirement 4

**User Story:** As a performance-conscious developer, I want the API to be optimized for speed, so that mode switching and application startup remain responsive.

#### Acceptance Criteria

1. WHEN multiple requests are made, THE API Performance System SHALL cache parsed configuration data
2. WHEN file system operations occur, THE API Performance System SHALL minimize disk reads through intelligent caching
3. WHERE configuration changes happen, THE API Performance System SHALL invalidate cache appropriately
4. WHEN response size matters, THE API Performance System SHALL optimize JSON payload size
5. WHILE maintaining accuracy, THE API Performance System SHALL respond within 100ms for cached requests

### Requirement 5

**User Story:** As a frontend developer, I want proper HTTP headers and CORS support, so that the API works correctly in all deployment scenarios including development and production.

#### Acceptance Criteria

1. WHEN cross-origin requests are made, THE API Headers SHALL include appropriate CORS headers
2. WHEN content is returned, THE API Headers SHALL specify correct Content-Type as application/json
3. WHERE caching is beneficial, THE API Headers SHALL include appropriate cache control directives
4. WHEN errors occur, THE API Headers SHALL maintain consistent header structure
5. WHILE supporting development, THE API Headers SHALL work with Next.js development server and production builds