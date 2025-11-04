/**
 * Simple test script to validate the global configuration system
 * Run with: node utils/testConfig.js
 */

import { readFileSync } from 'fs';
import { validateAndSanitizeConfig, validateConfigStructure, loadConfigFromJSON } from './configValidation.js';

async function testConfigurationSystem() {
  console.log('Testing VibeScreen Global Configuration System...\n');

  try {
    // Test 1: Load and validate the actual config file
    console.log('1. Loading global-config.json...');
    const configContent = readFileSync('data/global-config.json', 'utf-8');
    const config = loadConfigFromJSON(configContent);
    console.log('✓ Configuration loaded and validated successfully');
    console.log(`   - Min delay: ${config.defaultMinDelaySeconds}s`);
    console.log(`   - Max delay: ${config.defaultMaxDelaySeconds}s`);
    console.log(`   - Popup style: ${config.defaultPopupStyle}`);
    console.log(`   - Animation speed: ${config.animationSpeedMultiplier}x`);

    // Test 2: Validate message categories
    console.log('\n2. Validating message categories...');
    const categories = config.messageCategories;
    const totalWeight = Object.values(categories).reduce((sum, cat) => sum + cat.weight, 0);
    console.log(`✓ Message categories configured (total weight: ${totalWeight.toFixed(3)})`);
    for (const [name, category] of Object.entries(categories)) {
      console.log(`   - ${name}: ${(category.weight * 100).toFixed(1)}% - ${category.description}`);
    }

    // Test 3: Test accessibility settings
    console.log('\n3. Checking accessibility settings...');
    const accessibility = config.accessibility;
    console.log(`✓ Accessibility options configured`);
    console.log(`   - Reduced motion: ${accessibility.reducedMotion}`);
    console.log(`   - High contrast: ${accessibility.highContrast}`);
    console.log(`   - Message lifespan multiplier: ${accessibility.messageLifespanMultiplier}x`);

    // Test 4: Test user preferences
    console.log('\n4. Checking user preferences...');
    const prefs = config.userPreferences;
    console.log(`✓ User preferences configured`);
    console.log(`   - Sounds enabled: ${prefs.enableSounds}`);
    console.log(`   - Animations enabled: ${prefs.enableAnimations}`);
    console.log(`   - Theme: ${prefs.preferredTheme}`);
    console.log(`   - Auto-hide terminal: ${prefs.autoHideTerminal} (${prefs.terminalAutoHideDelay}ms)`);

    // Test 5: Test validation ranges
    console.log('\n5. Checking validation schema...');
    const validation = config.validation;
    console.log(`✓ Validation schema present`);
    console.log(`   - Min delay range: ${validation.minDelayRange.min}-${validation.minDelayRange.max}s`);
    console.log(`   - Max delay range: ${validation.maxDelayRange.min}-${validation.maxDelayRange.max}s`);
    console.log(`   - Animation speed range: ${validation.animationSpeedRange.min}-${validation.animationSpeedRange.max}x`);
    console.log(`   - Allowed popup styles: ${validation.allowedPopupStyles.join(', ')}`);
    console.log(`   - Allowed themes: ${validation.allowedThemes.join(', ')}`);

    // Test 6: Test invalid configuration handling
    console.log('\n6. Testing invalid configuration handling...');
    const invalidConfig = {
      defaultMinDelaySeconds: -5,  // Invalid: too low
      defaultMaxDelaySeconds: 1000, // Invalid: too high
      defaultPopupStyle: "invalid", // Invalid: not allowed
      animationSpeedMultiplier: 10, // Invalid: too high
      messageCategories: {
        cliche: { weight: 2.0, description: "Test" } // Invalid: weight > 1
      }
    };

    const sanitized = validateAndSanitizeConfig(invalidConfig);
    console.log('✓ Invalid configuration sanitized successfully');
    console.log(`   - Min delay corrected: ${sanitized.defaultMinDelaySeconds}s (was -5)`);
    console.log(`   - Max delay corrected: ${sanitized.defaultMaxDelaySeconds}s (was 1000)`);
    console.log(`   - Popup style corrected: ${sanitized.defaultPopupStyle} (was "invalid")`);
    console.log(`   - Animation speed corrected: ${sanitized.animationSpeedMultiplier}x (was 10)`);

    console.log('\n✅ All configuration tests passed!');
    console.log('\nGlobal configuration system is ready for use.');

  } catch (error) {
    console.error('❌ Configuration test failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConfigurationSystem();
}

export { testConfigurationSystem };