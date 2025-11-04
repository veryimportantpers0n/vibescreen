/**
 * Component Interface Validation System
 * 
 * Validates mode components against required interfaces and naming conventions.
 * Provides detailed error reporting and guidance for fixing component issues.
 */

/**
 * Component validation schemas defining required exports and interfaces
 */
export const COMPONENT_VALIDATION_SCHEMAS = {
  scene: {
    requiredExports: ['default', 'ModeScene'],
    alternativeExports: ['Scene'], // Additional acceptable export names
    requiredProps: ['sceneProps'],
    optionalProps: ['mode', 'config', 'onUpdate'],
    componentType: 'function',
    description: 'Scene component that renders the 3D background environment'
  },
  character: {
    requiredExports: ['default', 'ModeCharacter'],
    alternativeExports: ['Character'], // Additional acceptable export names
    requiredProps: ['onSpeak'],
    optionalProps: ['sceneProps', 'mode', 'config', 'position'],
    componentType: 'function',
    description: 'Character component that renders the animated personality figure'
  },
  config: {
    requiredFields: ['popupStyle', 'minDelaySeconds', 'maxDelaySeconds'],
    optionalFields: ['id', 'name', 'colors', 'animations', 'messages', 'modeName', 'sounds', 'theme', 'messageProbabilities', 'sceneProps'],
    description: 'Configuration object defining mode behavior and styling'
  },
  messages: {
    requiredFields: [], // Messages can be either array or object with messages field
    optionalFields: ['messages', 'categories', 'weights', 'metadata'],
    description: 'Messages array or object containing personality-appropriate text content'
  }
};

/**
 * Naming convention patterns for mode components
 */
export const NAMING_CONVENTIONS = {
  scene: {
    pattern: /^[A-Z][a-zA-Z]*Scene$/,
    examples: ['CorporateAIScene', 'ZenMonkScene', 'ChaosScene'],
    description: 'Scene components should be named {ModeName}Scene in PascalCase'
  },
  character: {
    pattern: /^[A-Z][a-zA-Z]*Character$/,
    examples: ['CorporateAICharacter', 'ZenMonkCharacter', 'ChaosCharacter'],
    description: 'Character components should be named {ModeName}Character in PascalCase'
  }
};

/**
 * Component Interface Validator Class
 */
export class ComponentInterfaceValidator {
  constructor(options = {}) {
    this.strictMode = options.strictMode || false;
    this.logLevel = options.logLevel || 'warn'; // 'error', 'warn', 'info', 'debug'
    this.validationResults = new Map();
    this.errorReports = [];
  }

  /**
   * Validate a complete mode structure including all components
   */
  validateModeStructure(modeId, components) {
    const results = {
      modeId,
      valid: true,
      errors: [],
      warnings: [],
      components: {},
      timestamp: Date.now()
    };

    try {
      // Validate scene component
      if (components.scene) {
        const sceneResult = this.validateComponent(components.scene, 'scene', modeId);
        results.components.scene = sceneResult;
        if (!sceneResult.valid) {
          results.valid = false;
          results.errors.push(...sceneResult.errors);
        }
        results.warnings.push(...sceneResult.warnings);
      } else {
        results.valid = false;
        results.errors.push({
          type: 'MISSING_COMPONENT',
          component: 'scene',
          message: 'Scene component is required but not provided',
          guidance: 'Ensure your mode exports a scene component as default, ModeScene, or Scene'
        });
      }

      // Validate character component
      if (components.character) {
        const characterResult = this.validateComponent(components.character, 'character', modeId);
        results.components.character = characterResult;
        if (!characterResult.valid) {
          results.valid = false;
          results.errors.push(...characterResult.errors);
        }
        results.warnings.push(...characterResult.warnings);
      } else {
        results.valid = false;
        results.errors.push({
          type: 'MISSING_COMPONENT',
          component: 'character',
          message: 'Character component is required but not provided',
          guidance: 'Ensure your mode exports a character component as default, ModeCharacter, or Character'
        });
      }

      // Validate config object
      if (components.config) {
        const configResult = this.validateConfig(components.config, modeId);
        results.components.config = configResult;
        if (!configResult.valid) {
          results.valid = false;
          results.errors.push(...configResult.errors);
        }
        results.warnings.push(...configResult.warnings);
      } else {
        results.warnings.push({
          type: 'MISSING_CONFIG',
          message: 'Config object not provided, using defaults',
          guidance: 'Consider providing a config.json file for better mode customization'
        });
      }

      // Validate messages if provided
      if (components.messages) {
        const messagesResult = this.validateMessages(components.messages, modeId);
        results.components.messages = messagesResult;
        if (!messagesResult.valid) {
          results.valid = false;
          results.errors.push(...messagesResult.errors);
        }
        results.warnings.push(...messagesResult.warnings);
      } else {
        results.warnings.push({
          type: 'MISSING_MESSAGES',
          message: 'Messages not provided',
          guidance: 'Consider providing a messages.json file with personality-appropriate messages'
        });
      }

      // Store validation results
      this.validationResults.set(modeId, results);

      // Log results based on log level
      this.logValidationResults(results);

      return results;

    } catch (error) {
      const errorResult = {
        modeId,
        valid: false,
        errors: [{
          type: 'VALIDATION_ERROR',
          message: `Validation failed: ${error.message}`,
          guidance: 'Check component exports and structure'
        }],
        warnings: [],
        components: {},
        timestamp: Date.now()
      };

      this.validationResults.set(modeId, errorResult);
      this.logError(`Validation error for mode ${modeId}:`, error);
      
      return errorResult;
    }
  }

  /**
   * Validate individual component against schema
   */
  validateComponent(component, type, modeId) {
    const schema = COMPONENT_VALIDATION_SCHEMAS[type];
    const result = {
      type,
      valid: true,
      errors: [],
      warnings: [],
      checks: {}
    };

    if (!schema) {
      result.valid = false;
      result.errors.push({
        type: 'UNKNOWN_COMPONENT_TYPE',
        message: `Unknown component type: ${type}`,
        guidance: 'Valid component types are: scene, character'
      });
      return result;
    }

    // Check if component exists and is a function
    result.checks.exists = this.checkComponentExists(component, result);
    result.checks.isFunction = this.checkComponentIsFunction(component, result);
    
    if (!result.checks.exists || !result.checks.isFunction) {
      result.valid = false;
      return result;
    }

    // Check naming convention
    result.checks.namingConvention = this.checkNamingConvention(component, type, modeId, result);

    // Check component props interface
    result.checks.propsInterface = this.checkPropsInterface(component, schema, result);

    // Check component structure and patterns
    result.checks.structure = this.checkComponentStructure(component, type, result);

    // Check for React-specific patterns
    result.checks.reactPatterns = this.checkReactPatterns(component, result);

    return result;
  }

  /**
   * Validate configuration object
   */
  validateConfig(config, modeId) {
    const schema = COMPONENT_VALIDATION_SCHEMAS.config;
    const result = {
      type: 'config',
      valid: true,
      errors: [],
      warnings: [],
      checks: {}
    };

    // Check required fields
    result.checks.requiredFields = this.checkRequiredFields(config, schema.requiredFields, result);

    // Check field types and values
    result.checks.fieldTypes = this.checkConfigFieldTypes(config, result);

    // Check for deprecated or unknown fields
    result.checks.unknownFields = this.checkUnknownFields(config, schema, result);

    return result;
  }

  /**
   * Validate messages array or object
   */
  validateMessages(messages, modeId) {
    const result = {
      type: 'messages',
      valid: true,
      errors: [],
      warnings: [],
      checks: {}
    };

    if (!messages) {
      result.warnings.push({
        type: 'MISSING_MESSAGES',
        message: 'No messages provided',
        guidance: 'Consider adding a messages.json file with an array of personality-appropriate messages'
      });
      return result;
    }

    // Handle both array format and object format
    let messageArray = [];
    
    if (Array.isArray(messages)) {
      messageArray = messages;
    } else if (messages.messages && Array.isArray(messages.messages)) {
      messageArray = messages.messages;
    } else {
      result.errors.push({
        type: 'INVALID_MESSAGES_FORMAT',
        message: 'Messages must be an array or an object with a messages array property',
        guidance: 'Use either ["message1", "message2"] or {"messages": ["message1", "message2"]}'
      });
      result.valid = false;
      return result;
    }

    // Validate message content
    if (messageArray.length === 0) {
      result.warnings.push({
        type: 'EMPTY_MESSAGES',
        message: 'Messages array is empty',
        guidance: 'Add some personality-appropriate messages for better user experience'
      });
    } else if (messageArray.length < 5) {
      result.warnings.push({
        type: 'FEW_MESSAGES',
        message: `Only ${messageArray.length} messages provided`,
        guidance: 'Consider adding more messages (at least 10-15) for better variety'
      });
    }

    // Check message quality
    const shortMessages = messageArray.filter(msg => typeof msg === 'string' && msg.length < 10);
    if (shortMessages.length > 0) {
      result.warnings.push({
        type: 'SHORT_MESSAGES',
        message: `${shortMessages.length} messages are very short (< 10 characters)`,
        guidance: 'Consider making messages more descriptive for better engagement'
      });
    }

    const nonStringMessages = messageArray.filter(msg => typeof msg !== 'string');
    if (nonStringMessages.length > 0) {
      result.errors.push({
        type: 'INVALID_MESSAGE_TYPE',
        message: `${nonStringMessages.length} messages are not strings`,
        guidance: 'All messages should be text strings'
      });
      result.valid = false;
    }

    result.checks.messageCount = messageArray.length;
    result.checks.averageLength = messageArray.length > 0 ? 
      Math.round(messageArray.reduce((sum, msg) => sum + (msg?.length || 0), 0) / messageArray.length) : 0;

    return result;
  }

  /**
   * Check if component exists and is not null/undefined
   */
  checkComponentExists(component, result) {
    if (!component) {
      result.errors.push({
        type: 'NULL_COMPONENT',
        message: 'Component is null or undefined',
        guidance: 'Ensure the component is properly exported from the module'
      });
      return false;
    }
    return true;
  }

  /**
   * Check if component is a React function component
   */
  checkComponentIsFunction(component, result) {
    if (typeof component !== 'function') {
      result.errors.push({
        type: 'INVALID_COMPONENT_TYPE',
        message: `Component must be a React function component, got: ${typeof component}`,
        guidance: 'Export a function component that returns JSX'
      });
      return false;
    }
    return true;
  }

  /**
   * Check component naming convention
   */
  checkNamingConvention(component, type, modeId, result) {
    const convention = NAMING_CONVENTIONS[type];
    if (!convention) return true;

    const componentName = component.name || component.displayName;
    
    if (!componentName) {
      result.warnings.push({
        type: 'MISSING_COMPONENT_NAME',
        message: 'Component does not have a name property',
        guidance: 'Consider naming your function component for better debugging'
      });
      return false;
    }

    if (!convention.pattern.test(componentName)) {
      const expectedName = this.generateExpectedComponentName(modeId, type);
      
      if (this.strictMode) {
        result.errors.push({
          type: 'NAMING_CONVENTION_VIOLATION',
          message: `Component name "${componentName}" does not follow naming convention`,
          guidance: `Expected name pattern: ${convention.description}. Suggested name: "${expectedName}"`
        });
        return false;
      } else {
        result.warnings.push({
          type: 'NAMING_CONVENTION_WARNING',
          message: `Component name "${componentName}" does not follow recommended naming convention`,
          guidance: `Consider renaming to: "${expectedName}"`
        });
      }
    }

    return true;
  }

  /**
   * Check component props interface
   */
  checkPropsInterface(component, schema, result) {
    const componentString = component.toString();
    let propsFound = false;

    // Check for props parameter
    if (componentString.includes('props') || componentString.includes('{')) {
      propsFound = true;
    }

    // Check for required props
    for (const requiredProp of schema.requiredProps) {
      if (!componentString.includes(requiredProp)) {
        if (this.strictMode) {
          result.errors.push({
            type: 'MISSING_REQUIRED_PROP',
            message: `Component does not handle required prop: ${requiredProp}`,
            guidance: `Add ${requiredProp} to your component props: function Component({ ${requiredProp} }) { ... }`
          });
        } else {
          result.warnings.push({
            type: 'MISSING_REQUIRED_PROP_WARNING',
            message: `Component may not handle required prop: ${requiredProp}`,
            guidance: `Consider adding ${requiredProp} to your component props for full functionality`
          });
        }
      }
    }

    return propsFound;
  }

  /**
   * Check component structure and Three.js patterns
   */
  checkComponentStructure(component, type, result) {
    const componentString = component.toString();
    
    // Check for Three.js/react-three-fiber patterns
    if (type === 'scene' || type === 'character') {
      const hasThreeJSElements = /(<mesh|<group|<Box|<Sphere|<Cylinder|useFrame|useRef)/i.test(componentString);
      
      if (!hasThreeJSElements) {
        result.warnings.push({
          type: 'NO_THREEJS_PATTERNS',
          message: 'Component does not appear to use Three.js elements',
          guidance: 'Consider using <mesh>, <group>, or @react-three/drei components for 3D content'
        });
      }

      // Check for animation patterns
      const hasAnimations = /useFrame|rotation|position|scale/i.test(componentString);
      
      if (!hasAnimations && type === 'character') {
        result.warnings.push({
          type: 'NO_ANIMATION_PATTERNS',
          message: 'Character component does not appear to have animations',
          guidance: 'Consider adding useFrame hook for character animations and speak responses'
        });
      }
    }

    return true;
  }

  /**
   * Check for React-specific patterns and hooks
   */
  checkReactPatterns(component, result) {
    const componentString = component.toString();
    
    // Check for proper React imports (if visible in string)
    const hasReactImport = componentString.includes('React') || componentString.includes('import');
    
    // Check for JSX return
    const hasJSXReturn = componentString.includes('return') && (
      componentString.includes('<') || componentString.includes('jsx')
    );

    if (!hasJSXReturn) {
      result.warnings.push({
        type: 'NO_JSX_RETURN',
        message: 'Component does not appear to return JSX',
        guidance: 'Ensure your component returns JSX elements'
      });
    }

    // Check for proper hook usage patterns
    const hasHooks = /use[A-Z]/.test(componentString);
    
    if (hasHooks) {
      // Check for hooks at top level (basic check)
      const hookLines = componentString.split('\n').filter(line => /use[A-Z]/.test(line));
      const hasConditionalHooks = hookLines.some(line => 
        line.includes('if') || line.includes('for') || line.includes('while')
      );
      
      if (hasConditionalHooks) {
        result.warnings.push({
          type: 'CONDITIONAL_HOOKS',
          message: 'Component may have conditional hook usage',
          guidance: 'Ensure hooks are called at the top level, not inside conditions or loops'
        });
      }
    }

    return true;
  }

  /**
   * Check required fields in config object
   */
  checkRequiredFields(config, requiredFields, result) {
    const missingFields = [];

    for (const field of requiredFields) {
      if (!(field in config)) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      result.errors.push({
        type: 'MISSING_CONFIG_FIELDS',
        message: `Missing required config fields: ${missingFields.join(', ')}`,
        guidance: `Add these fields to your config.json: ${missingFields.map(f => `"${f}": <value>`).join(', ')}`
      });
      return false;
    }

    return true;
  }

  /**
   * Check config field types and values
   */
  checkConfigFieldTypes(config, result) {
    const typeChecks = {
      id: (val) => typeof val === 'string' && val.length > 0,
      name: (val) => typeof val === 'string' && val.length > 0,
      colors: (val) => typeof val === 'object' && val !== null,
      animations: (val) => typeof val === 'object' && val !== null,
      popupStyle: (val) => typeof val === 'string' && ['overlay', 'speechBubble'].includes(val),
      minDelaySeconds: (val) => typeof val === 'number' && val > 0,
      maxDelaySeconds: (val) => typeof val === 'number' && val > 0,
      messageProbabilities: (val) => typeof val === 'object' && val !== null,
      sceneProps: (val) => typeof val === 'object' && val !== null
    };

    for (const [field, checker] of Object.entries(typeChecks)) {
      if (field in config && !checker(config[field])) {
        result.errors.push({
          type: 'INVALID_CONFIG_TYPE',
          message: `Invalid type or value for config field: ${field}`,
          guidance: this.getConfigFieldGuidance(field)
        });
      }
    }

    // Check logical constraints
    if (config.minDelaySeconds && config.maxDelaySeconds && 
        config.minDelaySeconds >= config.maxDelaySeconds) {
      result.errors.push({
        type: 'INVALID_CONFIG_LOGIC',
        message: 'minDelaySeconds must be less than maxDelaySeconds',
        guidance: 'Ensure minDelaySeconds < maxDelaySeconds for proper message timing'
      });
    }

    return true;
  }

  /**
   * Check for unknown or deprecated fields
   */
  checkUnknownFields(config, schema, result) {
    const knownFields = [...schema.requiredFields, ...schema.optionalFields];
    const unknownFields = Object.keys(config).filter(field => !knownFields.includes(field));

    if (unknownFields.length > 0) {
      result.warnings.push({
        type: 'UNKNOWN_CONFIG_FIELDS',
        message: `Unknown config fields: ${unknownFields.join(', ')}`,
        guidance: 'These fields will be ignored. Check for typos or refer to documentation'
      });
    }

    return true;
  }

  /**
   * Generate expected component name based on mode ID and type
   */
  generateExpectedComponentName(modeId, type) {
    const pascalCaseName = modeId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    return `${pascalCaseName}${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }

  /**
   * Get guidance for specific config fields
   */
  getConfigFieldGuidance(field) {
    const guidance = {
      id: 'Should be a string identifier for the mode (e.g., "corporate-ai")',
      name: 'Should be a human-readable name for the mode (e.g., "Corporate AI")',
      colors: 'Should be an object with primary and secondary color properties: { "primary": "#00ff00", "secondary": "#008f11" }',
      animations: 'Should be an object with animation settings: { "speed": 1.0 }',
      popupStyle: 'Should be either "overlay" or "speechBubble"',
      minDelaySeconds: 'Should be a positive number representing minimum delay between messages',
      maxDelaySeconds: 'Should be a positive number representing maximum delay between messages',
      messageProbabilities: 'Should be an object with probability weights for different message types',
      sceneProps: 'Should be an object with scene-specific properties like bgColor, ambientSpeed, etc.'
    };

    return guidance[field] || 'Check documentation for proper format and values';
  }

  /**
   * Log validation results based on log level
   */
  logValidationResults(results) {
    if (this.logLevel === 'debug' || (this.logLevel === 'info' && !results.valid)) {
      console.log(`🔍 Validation results for mode ${results.modeId}:`, results);
    }

    if (results.errors.length > 0 && (this.logLevel === 'error' || this.logLevel === 'warn')) {
      console.error(`❌ Validation errors for mode ${results.modeId}:`, results.errors);
    }

    if (results.warnings.length > 0 && this.logLevel === 'warn') {
      console.warn(`⚠️ Validation warnings for mode ${results.modeId}:`, results.warnings);
    }

    if (results.valid && this.logLevel === 'info') {
      console.log(`✅ Mode ${results.modeId} passed validation`);
    }
  }

  /**
   * Log error messages
   */
  logError(message, error) {
    if (this.logLevel === 'error' || this.logLevel === 'warn') {
      console.error(message, error);
    }
  }

  /**
   * Get validation results for a specific mode
   */
  getValidationResults(modeId) {
    return this.validationResults.get(modeId);
  }

  /**
   * Get all validation results
   */
  getAllValidationResults() {
    return Array.from(this.validationResults.values());
  }

  /**
   * Clear validation results
   */
  clearValidationResults() {
    this.validationResults.clear();
    this.errorReports = [];
  }

  /**
   * Generate validation report
   */
  generateValidationReport() {
    const results = this.getAllValidationResults();
    const report = {
      timestamp: Date.now(),
      totalModes: results.length,
      validModes: results.filter(r => r.valid).length,
      invalidModes: results.filter(r => !r.valid).length,
      totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
      modes: results.map(r => ({
        modeId: r.modeId,
        valid: r.valid,
        errorCount: r.errors.length,
        warningCount: r.warnings.length,
        components: Object.keys(r.components)
      }))
    };

    return report;
  }
}

/**
 * Create a default validator instance
 */
export const createValidator = (options = {}) => {
  return new ComponentInterfaceValidator(options);
};

/**
 * Validate a single component quickly
 */
export const validateComponent = (component, type, modeId, options = {}) => {
  const validator = createValidator(options);
  return validator.validateComponent(component, type, modeId);
};

/**
 * Validate a complete mode structure quickly
 */
export const validateModeStructure = (modeId, components, options = {}) => {
  const validator = createValidator(options);
  return validator.validateModeStructure(modeId, components);
};

export default ComponentInterfaceValidator;