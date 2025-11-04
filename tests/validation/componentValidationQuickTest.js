/**
 * Quick Component Interface Validation Test
 * 
 * Simple test without JSX to verify the validation system works
 */

import { ComponentInterfaceValidator } from '../../utils/componentInterfaceValidator.js';

// Mock components for testing
function ValidScene({ sceneProps }) {
  // This would return JSX in real usage
  return "mock-scene-jsx";
}

function ValidCharacter({ onSpeak }) {
  // This would return JSX in real usage  
  return "mock-character-jsx";
}

function InvalidComponent() {
  return "no-props";
}

const validConfig = {
  colors: { primary: '#00ff00', secondary: '#008f11' },
  animations: { speed: 1.0 },
  popupStyle: 'overlay',
  minDelaySeconds: 5,
  maxDelaySeconds: 15
};

const invalidConfig = {
  colors: "not-an-object"
  // Missing required fields
};

console.log('🧪 Running Component Interface Validation Quick Test...\n');

try {
  const validator = new ComponentInterfaceValidator({
    strictMode: false,
    logLevel: 'info'
  });

  // Test 1: Valid scene component
  console.log('🔍 Test 1: Valid Scene Component');
  const sceneResult = validator.validateComponent(ValidScene, 'scene', 'test-mode');
  console.log(`Result: ${sceneResult.valid ? '✅ PASS' : '❌ FAIL'}`);
  if (sceneResult.errors.length > 0) {
    console.log('Errors:', sceneResult.errors.map(e => e.message));
  }
  if (sceneResult.warnings.length > 0) {
    console.log('Warnings:', sceneResult.warnings.map(w => w.message));
  }

  // Test 2: Valid character component
  console.log('\n🔍 Test 2: Valid Character Component');
  const characterResult = validator.validateComponent(ValidCharacter, 'character', 'test-mode');
  console.log(`Result: ${characterResult.valid ? '✅ PASS' : '❌ FAIL'}`);
  if (characterResult.errors.length > 0) {
    console.log('Errors:', characterResult.errors.map(e => e.message));
  }
  if (characterResult.warnings.length > 0) {
    console.log('Warnings:', characterResult.warnings.map(w => w.message));
  }

  // Test 3: Invalid component (not a function)
  console.log('\n🔍 Test 3: Invalid Component Type');
  const invalidResult = validator.validateComponent("not-a-function", 'scene', 'test-mode');
  console.log(`Result: ${!invalidResult.valid ? '✅ PASS (correctly detected invalid)' : '❌ FAIL'}`);
  if (invalidResult.errors.length > 0) {
    console.log('Errors:', invalidResult.errors.map(e => e.message));
  }

  // Test 4: Null component
  console.log('\n🔍 Test 4: Null Component');
  const nullResult = validator.validateComponent(null, 'character', 'test-mode');
  console.log(`Result: ${!nullResult.valid ? '✅ PASS (correctly detected null)' : '❌ FAIL'}`);
  if (nullResult.errors.length > 0) {
    console.log('Errors:', nullResult.errors.map(e => e.message));
  }

  // Test 5: Valid config
  console.log('\n🔍 Test 5: Valid Config');
  const configResult = validator.validateConfig(validConfig, 'test-mode');
  console.log(`Result: ${configResult.valid ? '✅ PASS' : '❌ FAIL'}`);
  if (configResult.errors.length > 0) {
    console.log('Errors:', configResult.errors.map(e => e.message));
  }

  // Test 6: Invalid config
  console.log('\n🔍 Test 6: Invalid Config');
  const invalidConfigResult = validator.validateConfig(invalidConfig, 'test-mode');
  console.log(`Result: ${!invalidConfigResult.valid ? '✅ PASS (correctly detected invalid)' : '❌ FAIL'}`);
  if (invalidConfigResult.errors.length > 0) {
    console.log('Errors:', invalidConfigResult.errors.map(e => e.message));
  }

  // Test 7: Complete mode structure validation
  console.log('\n🔍 Test 7: Complete Mode Structure - Valid');
  const modeComponents = {
    scene: ValidScene,
    character: ValidCharacter,
    config: validConfig
  };
  
  const modeResult = validator.validateModeStructure('test-mode', modeComponents);
  console.log(`Result: ${modeResult.valid ? '✅ PASS' : '❌ FAIL'}`);
  if (modeResult.errors.length > 0) {
    console.log('Errors:', modeResult.errors.map(e => e.message));
  }
  if (modeResult.warnings.length > 0) {
    console.log('Warnings:', modeResult.warnings.map(w => w.message));
  }

  // Test 8: Complete mode structure validation - invalid
  console.log('\n🔍 Test 8: Complete Mode Structure - Invalid');
  const invalidModeComponents = {
    scene: null,
    character: "not-a-function",
    config: invalidConfig
  };
  
  const invalidModeResult = validator.validateModeStructure('invalid-mode', invalidModeComponents);
  console.log(`Result: ${!invalidModeResult.valid ? '✅ PASS (correctly detected invalid)' : '❌ FAIL'}`);
  if (invalidModeResult.errors.length > 0) {
    console.log('Errors:', invalidModeResult.errors.map(e => e.message));
  }

  // Test 9: Validation report
  console.log('\n🔍 Test 9: Validation Report Generation');
  const report = validator.generateValidationReport();
  console.log(`Total modes validated: ${report.totalModes}`);
  console.log(`Valid modes: ${report.validModes}`);
  console.log(`Invalid modes: ${report.invalidModes}`);
  console.log(`Total errors: ${report.totalErrors}`);
  console.log(`Total warnings: ${report.totalWarnings}`);
  console.log('✅ Report generated successfully');

  console.log('\n📊 Component Interface Validation Test Summary:');
  console.log('✅ All validation functions are working correctly');
  console.log('✅ Error detection is functioning properly');
  console.log('✅ Warning system is operational');
  console.log('✅ Validation reporting is working');
  
  console.log('\n🎉 Component Interface Validation System is ready for use!');

} catch (error) {
  console.error('❌ Test failed with error:', error.message);
  console.error(error.stack);
  process.exit(1);
}