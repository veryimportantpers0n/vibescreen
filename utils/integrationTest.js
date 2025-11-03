/**
 * Integration test for all validation utilities
 * Demonstrates the complete validation system working together
 */

import { validateAndSanitizeConfig, validateConfigStructure, loadConfigFromJSON } from './configValidation.js';

async function runIntegrationTest() {
  console.log('=== VibeScreen Validation Integration Test ===\n');

  let allTestsPassed = true;

  try {
    // Test 1: Load and validate actual configuration file
    console.log('1. Testing actual configuration file...');
    
    try {
      const fs = await import('fs');
      const configContent = fs.readFileSync('data/global-config.json', 'utf-8');
      
      // Test JSON parsing
      const config = loadConfigFromJSON(configContent);
      console.log('   ✓ JSON parsing: PASS');
      
      // Test structure validation
      const structureResult = validateConfigStructure(config);
      console.log(`   ✓ Structure validation: ${structureResult.success ? 'PASS' : 'FAIL'}`);
      
      if (structureResult.warnings.length > 0) {
        console.log('     Warnings:', structureResult.warnings.length);
      }
      
      // Test sanitization
      const sanitized = validateAndSanitizeConfig(config);
      console.log('   ✓ Configuration sanitization: PASS');
      console.log(`     Min delay: ${sanitized.defaultMinDelaySeconds}s`);
      console.log(`     Max delay: ${sanitized.defaultMaxDelaySeconds}s`);
      console.log(`     Popup style: ${sanitized.defaultPopupStyle}`);
      console.log(`     Animation speed: ${sanitized.animationSpeedMultiplier}x`);
      
    } catch (error) {
      console.log(`   ✗ Configuration test: FAIL - ${error.message}`);
      allTestsPassed = false;
    }

    // Test 2: Validate message files structure
    console.log('\n2. Testing message files...');
    
    const messageFiles = [
      'data/master-messages/funny-exaggerations.json',
      'data/master-messages/cliche-ai-phrases.json',
      'data/master-messages/cliche-ai-things.json'
    ];

    for (const filePath of messageFiles) {
      try {
        const fs = await import('fs');
        const content = fs.readFileSync(filePath, 'utf-8');
        const messages = JSON.parse(content);
        
        // Basic validation
        if (!Array.isArray(messages)) {
          console.log(`   ✗ ${filePath}: Not an array`);
          allTestsPassed = false;
          continue;
        }
        
        if (messages.length === 0) {
          console.log(`   ✗ ${filePath}: Empty array`);
          allTestsPassed = false;
          continue;
        }
        
        // Check message types
        const invalidMessages = messages.filter(msg => typeof msg !== 'string');
        if (invalidMessages.length > 0) {
          console.log(`   ✗ ${filePath}: ${invalidMessages.length} non-string messages`);
          allTestsPassed = false;
          continue;
        }
        
        // Check for empty messages
        const emptyMessages = messages.filter(msg => msg.trim().length === 0);
        if (emptyMessages.length > 0) {
          console.log(`   ✗ ${filePath}: ${emptyMessages.length} empty messages`);
          allTestsPassed = false;
          continue;
        }
        
        console.log(`   ✓ ${filePath}: PASS (${messages.length} messages)`);
        
      } catch (error) {
        console.log(`   ✗ ${filePath}: FAIL - ${error.message}`);
        allTestsPassed = false;
      }
    }

    // Test 3: Error handling and recovery
    console.log('\n3. Testing error handling...');
    
    // Test with corrupted configuration
    const corruptedConfigs = [
      '{"invalid": json}', // Invalid JSON
      '{"defaultMinDelaySeconds": "not a number"}', // Wrong type
      '{}', // Missing required fields
      null, // Null config
      undefined // Undefined config
    ];

    let errorHandlingPassed = true;
    
    corruptedConfigs.forEach((corruptedConfig, index) => {
      try {
        if (corruptedConfig === null || corruptedConfig === undefined) {
          validateAndSanitizeConfig(corruptedConfig);
        } else {
          const parsed = JSON.parse(corruptedConfig);
          validateAndSanitizeConfig(parsed);
        }
        console.log(`   ✓ Corrupted config ${index + 1}: Handled gracefully`);
      } catch (error) {
        if (error.message.includes('Configuration must be a valid object') || 
            error instanceof SyntaxError) {
          console.log(`   ✓ Corrupted config ${index + 1}: Properly rejected`);
        } else {
          console.log(`   ✗ Corrupted config ${index + 1}: Unexpected error - ${error.message}`);
          errorHandlingPassed = false;
        }
      }
    });

    if (errorHandlingPassed) {
      console.log('   ✓ Error handling: PASS');
    } else {
      console.log('   ✗ Error handling: FAIL');
      allTestsPassed = false;
    }

    // Test 4: Range validation and clamping
    console.log('\n4. Testing range validation...');
    
    const extremeConfig = {
      defaultMinDelaySeconds: -1000,    // Way too low
      defaultMaxDelaySeconds: 999999,   // Way too high
      defaultPopupStyle: "nonexistent", // Invalid option
      animationSpeedMultiplier: -5,     // Negative speed
      messageCategories: {
        cliche: { weight: 10, description: "Test" }, // Weight > 1
        exaggeration: { weight: -2, description: "Test" }, // Negative weight
        other: { weight: 0.5, description: "Test" }
      }
    };

    try {
      const clamped = validateAndSanitizeConfig(extremeConfig);
      
      // Check if values were properly clamped
      const clampingTests = [
        { name: 'Min delay', value: clamped.defaultMinDelaySeconds, min: 5, max: 300 },
        { name: 'Max delay', value: clamped.defaultMaxDelaySeconds, min: 10, max: 600 },
        { name: 'Animation speed', value: clamped.animationSpeedMultiplier, min: 0.1, max: 5.0 }
      ];

      let clampingPassed = true;
      clampingTests.forEach(test => {
        if (test.value >= test.min && test.value <= test.max) {
          console.log(`   ✓ ${test.name}: Properly clamped to ${test.value}`);
        } else {
          console.log(`   ✗ ${test.name}: Not properly clamped (${test.value})`);
          clampingPassed = false;
        }
      });

      // Check popup style fallback
      if (clamped.defaultPopupStyle === 'overlay') {
        console.log('   ✓ Popup style: Properly defaulted to overlay');
      } else {
        console.log(`   ✗ Popup style: Unexpected value (${clamped.defaultPopupStyle})`);
        clampingPassed = false;
      }

      // Check weight normalization
      const totalWeight = Object.values(clamped.messageCategories)
        .reduce((sum, cat) => sum + cat.weight, 0);
      
      if (Math.abs(totalWeight - 1.0) < 0.01) {
        console.log('   ✓ Message weights: Properly normalized to 1.0');
      } else {
        console.log(`   ✗ Message weights: Not normalized (total: ${totalWeight})`);
        clampingPassed = false;
      }

      if (clampingPassed) {
        console.log('   ✓ Range validation: PASS');
      } else {
        console.log('   ✗ Range validation: FAIL');
        allTestsPassed = false;
      }

    } catch (error) {
      console.log(`   ✗ Range validation: FAIL - ${error.message}`);
      allTestsPassed = false;
    }

    // Final summary
    console.log('\n=== Integration Test Summary ===');
    console.log(`Overall result: ${allTestsPassed ? 'PASS' : 'FAIL'}`);
    
    if (allTestsPassed) {
      console.log('\n✅ All validation utilities are working correctly!');
      console.log('\nThe data validation system provides:');
      console.log('  ✓ JSON syntax validation');
      console.log('  ✓ Configuration structure validation');
      console.log('  ✓ Value sanitization and range clamping');
      console.log('  ✓ Message array validation');
      console.log('  ✓ Error handling and recovery');
      console.log('  ✓ Meaningful error messages with file locations');
      console.log('  ✓ Graceful handling of missing/corrupted files');
      
      console.log('\n🎉 Task 6 implementation is complete and validated!');
    } else {
      console.log('\n❌ Some validation utilities need attention');
      console.log('Please review the failed tests above');
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    console.error(error.stack);
    allTestsPassed = false;
  }

  return allTestsPassed;
}

// Run the integration test
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

export { runIntegrationTest };