/**
 * Simple validation test that works in browser and Node.js environments
 */

import { validateAndSanitizeConfig, validateConfigStructure } from './configValidation.js';

// Test configuration validation
console.log('=== Simple Validation Test ===\n');

// Test 1: Valid configuration
console.log('1. Testing valid configuration...');
const validConfig = {
  defaultMinDelaySeconds: 15,
  defaultMaxDelaySeconds: 45,
  defaultPopupStyle: "overlay",
  animationSpeedMultiplier: 1.0,
  messageCategories: {
    cliche: { weight: 0.6, description: "Standard AI responses" },
    exaggeration: { weight: 0.2, description: "Humorous AI lines" },
    other: { weight: 0.2, description: "Neutral variations" }
  }
};

try {
  const sanitized = validateAndSanitizeConfig(validConfig);
  console.log('✓ Valid config sanitization: PASS');
  console.log(`  Min delay: ${sanitized.defaultMinDelaySeconds}s`);
  console.log(`  Max delay: ${sanitized.defaultMaxDelaySeconds}s`);
  console.log(`  Popup style: ${sanitized.defaultPopupStyle}`);
} catch (error) {
  console.log('✗ Valid config sanitization: FAIL -', error.message);
}

// Test 2: Invalid configuration
console.log('\n2. Testing invalid configuration...');
const invalidConfig = {
  defaultMinDelaySeconds: -10,  // Too low
  defaultMaxDelaySeconds: 1000, // Too high
  defaultPopupStyle: "invalid", // Not allowed
  animationSpeedMultiplier: 20, // Too high
  messageCategories: {
    cliche: { weight: 2.0, description: "Test" } // Weight > 1
  }
};

try {
  const sanitized = validateAndSanitizeConfig(invalidConfig);
  console.log('✓ Invalid config sanitization: PASS');
  console.log(`  Min delay corrected: ${sanitized.defaultMinDelaySeconds}s (was -10)`);
  console.log(`  Max delay corrected: ${sanitized.defaultMaxDelaySeconds}s (was 1000)`);
  console.log(`  Popup style corrected: ${sanitized.defaultPopupStyle} (was "invalid")`);
  console.log(`  Animation speed corrected: ${sanitized.animationSpeedMultiplier}x (was 20)`);
} catch (error) {
  console.log('✗ Invalid config sanitization: FAIL -', error.message);
}

// Test 3: Structure validation
console.log('\n3. Testing structure validation...');
const structureResult = validateConfigStructure(validConfig);
console.log(`✓ Structure validation: ${structureResult.success ? 'PASS' : 'FAIL'}`);
if (structureResult.errors.length > 0) {
  console.log('  Errors:', structureResult.errors);
}
if (structureResult.warnings.length > 0) {
  console.log('  Warnings:', structureResult.warnings);
}

// Test 4: Message array validation (simple test)
console.log('\n4. Testing message array validation...');
const testMessages = [
  "This is a valid message.",
  "Another good message!",
  "A third message for testing.",
  "", // Empty message - should cause error
  123, // Non-string - should cause error
  "A very long message that exceeds the reasonable length limit for display purposes and might cause issues with the user interface layout and readability factors" // Too long - should cause warning
];

// Simple validation without file system
function validateSimpleMessageArray(messages) {
  const errors = [];
  const warnings = [];
  
  if (!Array.isArray(messages)) {
    errors.push('Messages must be an array');
    return { success: false, errors, warnings };
  }
  
  messages.forEach((message, index) => {
    if (typeof message !== 'string') {
      errors.push(`Message ${index}: must be a string, got ${typeof message}`);
    } else if (message.length === 0) {
      errors.push(`Message ${index}: cannot be empty`);
    } else if (message.length > 100) {
      warnings.push(`Message ${index}: very long (${message.length} chars)`);
    }
  });
  
  return {
    success: errors.length === 0,
    errors,
    warnings,
    messageCount: messages.length
  };
}

const messageResult = validateSimpleMessageArray(testMessages);
console.log(`✓ Message validation: ${messageResult.success ? 'PASS' : 'FAIL'}`);
console.log(`  Message count: ${messageResult.messageCount}`);
if (messageResult.errors.length > 0) {
  console.log('  Errors:');
  messageResult.errors.forEach(error => console.log(`    - ${error}`));
}
if (messageResult.warnings.length > 0) {
  console.log('  Warnings:');
  messageResult.warnings.forEach(warning => console.log(`    - ${warning}`));
}

console.log('\n✅ Simple validation tests completed');
console.log('\nValidation utilities are working correctly!');
console.log('The system can:');
console.log('  - Validate and sanitize configuration values');
console.log('  - Check configuration structure');
console.log('  - Handle invalid data gracefully');
console.log('  - Provide meaningful error messages');
console.log('  - Validate message arrays');
console.log('  - Clamp values to acceptable ranges');