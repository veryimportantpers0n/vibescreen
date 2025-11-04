/**
 * Test script for data validation utilities
 * Run with: node utils/testValidation.js
 */

import { validateAllDataFiles, generateComprehensiveReport, validateWithFallbacks, quickValidationCheck, validateOnStartup } from './dataValidation.js';
import { validateAllMessageFiles, validateJSONFile, generateValidationReport } from './messageValidation.js';
import { validateAndSanitizeConfig, validateConfigStructure } from './configValidation.js';

async function runValidationTests() {
  console.log('=== VibeScreen Data Validation Test Suite ===\n');

  try {
    // Test 1: Quick validation check
    console.log('1. Running quick validation check...');
    const quickResult = await quickValidationCheck();
    console.log(`   Result: ${quickResult ? 'PASS' : 'FAIL'}`);
    
    if (!quickResult) {
      console.log('   ⚠️  Quick validation failed - some files may be missing or corrupted');
    }

    // Test 2: Comprehensive validation
    console.log('\n2. Running comprehensive data validation...');
    const fullResults = await validateAllDataFiles();
    console.log(`   Overall status: ${fullResults.success ? 'PASS' : 'FAIL'}`);
    console.log(`   Files validated: ${fullResults.summary.totalFiles}`);
    console.log(`   Valid files: ${fullResults.summary.validFiles}`);
    console.log(`   Total errors: ${fullResults.summary.totalErrors}`);
    console.log(`   Total warnings: ${fullResults.summary.totalWarnings}`);

    // Test 3: Message file validation
    console.log('\n3. Testing message file validation...');
    const messageResults = validateAllMessageFiles();
    console.log(`   Message files status: ${messageResults.success ? 'PASS' : 'FAIL'}`);
    console.log(`   Total messages: ${messageResults.summary.totalMessages}`);
    
    // Show sample message validation
    Object.entries(messageResults.files).forEach(([filename, result]) => {
      console.log(`   ${filename}: ${result.success ? 'PASS' : 'FAIL'} (${result.messageCount || 0} messages)`);
      if (result.errors && result.errors.length > 0) {
        console.log(`     Errors: ${result.errors.length}`);
      }
      if (result.warnings && result.warnings.length > 0) {
        console.log(`     Warnings: ${result.warnings.length}`);
      }
    });

    // Test 4: Configuration validation
    console.log('\n4. Testing configuration validation...');
    try {
      const configResult = validateJSONFile('data/global-config.json');
      if (configResult.success) {
        const structureResult = validateConfigStructure(configResult.content);
        const sanitizedConfig = validateAndSanitizeConfig(configResult.content);
        
        console.log(`   Config file: ${configResult.success ? 'PASS' : 'FAIL'}`);
        console.log(`   Config structure: ${structureResult.success ? 'PASS' : 'FAIL'}`);
        console.log(`   Config sanitization: PASS`);
        
        // Show key config values
        console.log(`   Min delay: ${sanitizedConfig.defaultMinDelaySeconds}s`);
        console.log(`   Max delay: ${sanitizedConfig.defaultMaxDelaySeconds}s`);
        console.log(`   Popup style: ${sanitizedConfig.defaultPopupStyle}`);
        console.log(`   Animation speed: ${sanitizedConfig.animationSpeedMultiplier}x`);
      } else {
        console.log(`   Config file: FAIL - ${configResult.errors[0]}`);
      }
    } catch (error) {
      console.log(`   Config validation: FAIL - ${error.message}`);
    }

    // Test 5: Error handling with invalid data
    console.log('\n5. Testing error handling with invalid data...');
    
    // Test invalid configuration
    const invalidConfig = {
      defaultMinDelaySeconds: -10,  // Invalid
      defaultMaxDelaySeconds: 1000, // Invalid
      defaultPopupStyle: "invalid", // Invalid
      animationSpeedMultiplier: 20  // Invalid
    };
    
    try {
      const sanitized = validateAndSanitizeConfig(invalidConfig);
      console.log('   Invalid config sanitization: PASS');
      console.log(`     Min delay corrected: ${sanitized.defaultMinDelaySeconds}s (was -10)`);
      console.log(`     Max delay corrected: ${sanitized.defaultMaxDelaySeconds}s (was 1000)`);
      console.log(`     Popup style corrected: ${sanitized.defaultPopupStyle} (was "invalid")`);
      console.log(`     Animation speed corrected: ${sanitized.animationSpeedMultiplier}x (was 20)`);
    } catch (error) {
      console.log(`   Invalid config sanitization: FAIL - ${error.message}`);
    }

    // Test 6: Fallback handling
    console.log('\n6. Testing fallback handling...');
    const fallbackResults = await validateWithFallbacks();
    console.log(`   Fallback validation: ${fallbackResults.success ? 'PASS' : 'FAIL'}`);
    
    if (fallbackResults.fallbacks) {
      console.log('   Fallback data prepared:');
      console.log(`     Config fallback: ${fallbackResults.fallbacks.config ? 'Available' : 'Missing'}`);
      console.log(`     Message fallbacks: ${Object.keys(fallbackResults.fallbacks.messages || {}).length} categories`);
    }

    // Test 7: Startup validation simulation
    console.log('\n7. Testing startup validation...');
    const startupResult = await validateOnStartup();
    console.log(`   Startup validation: ${startupResult.success ? 'PASS' : 'FAIL'}`);
    console.log(`   Validation type: ${startupResult.quick ? 'Quick' : 'Comprehensive'}`);
    console.log(`   Duration: ${startupResult.duration}ms`);
    console.log(`   Message: ${startupResult.message}`);

    // Generate comprehensive report
    console.log('\n8. Generating validation report...');
    const report = generateComprehensiveReport(fullResults);
    console.log('   Report generated successfully');
    console.log(`   Report length: ${report.length} characters`);

    // Summary
    console.log('\n=== Test Summary ===');
    console.log(`Overall validation system: ${fullResults.success ? 'WORKING' : 'NEEDS ATTENTION'}`);
    
    if (fullResults.summary.criticalErrors.length > 0) {
      console.log('\nCritical issues found:');
      fullResults.summary.criticalErrors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    if (fullResults.summary.totalWarnings > 0) {
      console.log(`\nWarnings: ${fullResults.summary.totalWarnings} (check detailed report for specifics)`);
    }

    console.log('\n✅ Validation test suite completed');
    
    // Optionally write detailed report to file
    if (process.argv.includes('--write-report')) {
      const fs = await import('fs/promises');
      await fs.writeFile('validation-report.txt', report);
      console.log('📄 Detailed report written to validation-report.txt');
    }

  } catch (error) {
    console.error('❌ Validation test suite failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidationTests();
}

export { runValidationTests };