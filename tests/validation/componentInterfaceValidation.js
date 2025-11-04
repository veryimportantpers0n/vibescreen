/**
 * Component Interface Validation Tests
 * 
 * Tests the component interface validation system to ensure it properly
 * validates mode components and provides helpful error messages.
 */

import { ComponentInterfaceValidator, validateComponent, validateModeStructure } from '../../utils/componentInterfaceValidator.js';

/**
 * Mock components for testing
 */

// Valid scene component (mock JSX with createElement calls)
function ValidScene({ sceneProps }) {
  // Mock JSX return - in real usage this would be JSX
  return "mock-jsx-group-with-mesh";
}

// Valid character component
function ValidCharacter({ onSpeak }) {
  // Mock JSX return - in real usage this would be JSX
  return "mock-jsx-character-mesh";
}

// Invalid components for testing
function InvalidSceneNoProps() {
  return "mock-jsx-mesh";
}

const InvalidCharacterNotFunction = "not a function";

function InvalidCharacterNoOnSpeak({ someOtherProp }) {
  return "mock-jsx-mesh";
}

// Valid config objects
const validConfig = {
  colors: { primary: '#00ff00', secondary: '#008f11' },
  animations: { speed: 1.0 },
  popupStyle: 'overlay',
  minDelaySeconds: 5,
  maxDelaySeconds: 15
};

// Invalid config objects
const invalidConfigMissingFields = {
  colors: { primary: '#00ff00' }
  // Missing required fields
};

const invalidConfigWrongTypes = {
  colors: "not an object",
  animations: { speed: 1.0 },
  popupStyle: 'invalid-style',
  minDelaySeconds: -5,
  maxDelaySeconds: 3
};

/**
 * Test suite for component validation
 */
export function runComponentInterfaceValidationTests() {
  console.log('🧪 Running Component Interface Validation Tests...');
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function runTest(testName, testFn) {
    try {
      console.log(`\n🔍 Testing: ${testName}`);
      const result = testFn();
      
      if (result.success) {
        console.log(`✅ PASS: ${testName}`);
        results.passed++;
      } else {
        console.log(`❌ FAIL: ${testName} - ${result.message}`);
        results.failed++;
      }
      
      results.tests.push({
        name: testName,
        success: result.success,
        message: result.message,
        details: result.details
      });
      
    } catch (error) {
      console.log(`❌ ERROR: ${testName} - ${error.message}`);
      results.failed++;
      results.tests.push({
        name: testName,
        success: false,
        message: error.message,
        error: true
      });
    }
  }

  // Test 1: Valid scene component validation
  runTest('Valid Scene Component', () => {
    const result = validateComponent(ValidScene, 'scene', 'test-mode');
    
    if (result.valid && result.errors.length === 0) {
      return { success: true, message: 'Valid scene component passed validation' };
    } else {
      return { 
        success: false, 
        message: `Validation failed: ${result.errors.map(e => e.message).join(', ')}`,
        details: result
      };
    }
  });

  // Test 2: Valid character component validation
  runTest('Valid Character Component', () => {
    const result = validateComponent(ValidCharacter, 'character', 'test-mode');
    
    if (result.valid && result.errors.length === 0) {
      return { success: true, message: 'Valid character component passed validation' };
    } else {
      return { 
        success: false, 
        message: `Validation failed: ${result.errors.map(e => e.message).join(', ')}`,
        details: result
      };
    }
  });

  // Test 3: Invalid component type detection
  runTest('Invalid Component Type Detection', () => {
    const result = validateComponent(InvalidCharacterNotFunction, 'character', 'test-mode');
    
    if (!result.valid && result.errors.some(e => e.type === 'INVALID_COMPONENT_TYPE')) {
      return { success: true, message: 'Correctly detected invalid component type' };
    } else {
      return { 
        success: false, 
        message: 'Failed to detect invalid component type',
        details: result
      };
    }
  });

  // Test 4: Missing required props detection
  runTest('Missing Required Props Detection', () => {
    const result = validateComponent(InvalidCharacterNoOnSpeak, 'character', 'test-mode');
    
    const hasMissingPropWarning = result.warnings.some(w => 
      w.type === 'MISSING_REQUIRED_PROP_WARNING' && w.message.includes('onSpeak')
    );
    
    if (hasMissingPropWarning) {
      return { success: true, message: 'Correctly detected missing onSpeak prop' };
    } else {
      return { 
        success: false, 
        message: 'Failed to detect missing onSpeak prop',
        details: result
      };
    }
  });

  // Test 5: Null component detection
  runTest('Null Component Detection', () => {
    const result = validateComponent(null, 'scene', 'test-mode');
    
    if (!result.valid && result.errors.some(e => e.type === 'NULL_COMPONENT')) {
      return { success: true, message: 'Correctly detected null component' };
    } else {
      return { 
        success: false, 
        message: 'Failed to detect null component',
        details: result
      };
    }
  });

  // Test 6: Valid config validation
  runTest('Valid Config Validation', () => {
    const validator = new ComponentInterfaceValidator();
    const result = validator.validateConfig(validConfig, 'test-mode');
    
    if (result.valid && result.errors.length === 0) {
      return { success: true, message: 'Valid config passed validation' };
    } else {
      return { 
        success: false, 
        message: `Config validation failed: ${result.errors.map(e => e.message).join(', ')}`,
        details: result
      };
    }
  });

  // Test 7: Invalid config - missing fields
  runTest('Invalid Config - Missing Fields', () => {
    const validator = new ComponentInterfaceValidator();
    const result = validator.validateConfig(invalidConfigMissingFields, 'test-mode');
    
    if (!result.valid && result.errors.some(e => e.type === 'MISSING_CONFIG_FIELDS')) {
      return { success: true, message: 'Correctly detected missing config fields' };
    } else {
      return { 
        success: false, 
        message: 'Failed to detect missing config fields',
        details: result
      };
    }
  });

  // Test 8: Invalid config - wrong types
  runTest('Invalid Config - Wrong Types', () => {
    const validator = new ComponentInterfaceValidator();
    const result = validator.validateConfig(invalidConfigWrongTypes, 'test-mode');
    
    if (!result.valid && result.errors.some(e => e.type === 'INVALID_CONFIG_TYPE')) {
      return { success: true, message: 'Correctly detected invalid config types' };
    } else {
      return { 
        success: false, 
        message: 'Failed to detect invalid config types',
        details: result
      };
    }
  });

  // Test 9: Complete mode structure validation - valid
  runTest('Complete Mode Structure - Valid', () => {
    const modeComponents = {
      scene: ValidScene,
      character: ValidCharacter,
      config: validConfig
    };
    
    const result = validateModeStructure('test-mode', modeComponents);
    
    if (result.valid) {
      return { success: true, message: 'Valid mode structure passed validation' };
    } else {
      return { 
        success: false, 
        message: `Mode structure validation failed: ${result.errors.map(e => e.message).join(', ')}`,
        details: result
      };
    }
  });

  // Test 10: Complete mode structure validation - invalid
  runTest('Complete Mode Structure - Invalid', () => {
    const modeComponents = {
      scene: null,
      character: InvalidCharacterNotFunction,
      config: invalidConfigMissingFields
    };
    
    const result = validateModeStructure('test-mode', modeComponents);
    
    if (!result.valid && result.errors.length > 0) {
      return { success: true, message: 'Correctly detected invalid mode structure' };
    } else {
      return { 
        success: false, 
        message: 'Failed to detect invalid mode structure',
        details: result
      };
    }
  });

  // Test 11: Validation report generation
  runTest('Validation Report Generation', () => {
    const validator = new ComponentInterfaceValidator();
    
    // Validate a few modes to populate results
    validator.validateModeStructure('valid-mode', {
      scene: ValidScene,
      character: ValidCharacter,
      config: validConfig
    });
    
    validator.validateModeStructure('invalid-mode', {
      scene: null,
      character: InvalidCharacterNotFunction,
      config: invalidConfigMissingFields
    });
    
    const report = validator.generateValidationReport();
    
    if (report.totalModes === 2 && report.validModes === 1 && report.invalidModes === 1) {
      return { success: true, message: 'Validation report generated correctly' };
    } else {
      return { 
        success: false, 
        message: 'Validation report has incorrect statistics',
        details: report
      };
    }
  });

  // Test 12: Naming convention validation
  runTest('Naming Convention Validation', () => {
    // Create a component with proper naming
    function TestModeScene({ sceneProps }) {
      return "mock-jsx-mesh";
    }
    
    const validator = new ComponentInterfaceValidator({ strictMode: false });
    const result = validator.validateComponent(TestModeScene, 'scene', 'test-mode');
    
    // Should pass validation (component name matches convention)
    if (result.valid) {
      return { success: true, message: 'Naming convention validation working correctly' };
    } else {
      return { 
        success: false, 
        message: 'Naming convention validation failed unexpectedly',
        details: result
      };
    }
  });

  // Print summary
  console.log('\n📊 Component Interface Validation Test Results:');
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.success).forEach(test => {
      console.log(`  - ${test.name}: ${test.message}`);
    });
  }

  return results;
}

/**
 * Quick validation test for development
 */
export function quickValidationTest() {
  console.log('🚀 Quick Component Interface Validation Test');
  
  try {
    // Test basic component validation
    const sceneResult = validateComponent(ValidScene, 'scene', 'quick-test');
    console.log('Scene validation:', sceneResult.valid ? '✅ PASS' : '❌ FAIL');
    
    const characterResult = validateComponent(ValidCharacter, 'character', 'quick-test');
    console.log('Character validation:', characterResult.valid ? '✅ PASS' : '❌ FAIL');
    
    // Test mode structure validation
    const modeResult = validateModeStructure('quick-test', {
      scene: ValidScene,
      character: ValidCharacter,
      config: validConfig
    });
    console.log('Mode structure validation:', modeResult.valid ? '✅ PASS' : '❌ FAIL');
    
    console.log('✅ Quick validation test completed successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Quick validation test failed:', error);
    return false;
  }
}

// Export for use in other test files
export {
  ValidScene,
  ValidCharacter,
  validConfig,
  InvalidSceneNoProps,
  InvalidCharacterNotFunction,
  invalidConfigMissingFields
};

export default runComponentInterfaceValidationTests;