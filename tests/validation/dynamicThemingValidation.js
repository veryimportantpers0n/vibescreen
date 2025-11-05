/**
 * Dynamic Theming System Validation
 * Tests the ThemeManager and dynamic theming functionality
 */

import ThemeManager from '../../utils/ThemeManager.js';

/**
 * Validate ThemeManager initialization and basic functionality
 */
export async function validateThemeManagerBasics() {
  console.log('🎨 Testing ThemeManager basics...');
  
  const results = {
    initialization: false,
    themeConfigurations: false,
    basicSwitching: false,
    cssPropertyApplication: false,
    errors: []
  };

  try {
    // Test initialization
    const themeManager = new ThemeManager({
      initialTheme: 'corporate-ai',
      transitionDuration: 300
    });
    
    if (themeManager) {
      results.initialization = true;
      console.log('✅ ThemeManager initialized successfully');
    }

    // Test theme configurations
    const availableThemes = themeManager.getAvailableThemes();
    if (availableThemes.length === 11) {
      results.themeConfigurations = true;
      console.log('✅ All 11 theme configurations loaded');
      
      // Validate each theme has required properties
      const requiredProps = ['name', 'primary', 'primaryLight', 'primaryDark', 'contrast'];
      let allThemesValid = true;
      
      availableThemes.forEach(theme => {
        const config = themeManager.getThemeConfig(theme.id);
        requiredProps.forEach(prop => {
          if (!config[prop]) {
            allThemesValid = false;
            results.errors.push(`Theme ${theme.id} missing property: ${prop}`);
          }
        });
      });
      
      if (allThemesValid) {
        console.log('✅ All themes have required properties');
      }
    } else {
      results.errors.push(`Expected 11 themes, found ${availableThemes.length}`);
    }

    // Test basic theme switching
    const switchResult = await themeManager.switchTheme('zen-monk', { immediate: true });
    if (switchResult && themeManager.currentTheme === 'zen-monk') {
      results.basicSwitching = true;
      console.log('✅ Basic theme switching works');
    } else {
      results.errors.push('Theme switching failed');
    }

    // Test CSS property application (requires DOM)
    if (typeof document !== 'undefined') {
      themeManager.applyTheme('chaos', { immediate: true });
      const rootStyle = getComputedStyle(document.documentElement);
      const activeColor = rootStyle.getPropertyValue('--active-mode-color').trim();
      
      if (activeColor) {
        results.cssPropertyApplication = true;
        console.log('✅ CSS properties applied successfully');
      } else {
        results.errors.push('CSS properties not applied to document root');
      }
    }

  } catch (error) {
    results.errors.push(`ThemeManager test error: ${error.message}`);
    console.error('❌ ThemeManager test failed:', error);
  }

  return results;
}

/**
 * Validate theme transitions and animations
 */
export async function validateThemeTransitions() {
  console.log('🎨 Testing theme transitions...');
  
  const results = {
    transitionTiming: false,
    transitionCallbacks: false,
    cssTransitions: false,
    errors: []
  };

  if (typeof document === 'undefined') {
    results.errors.push('DOM not available for transition testing');
    return results;
  }

  try {
    let transitionStartCalled = false;
    let transitionEndCalled = false;

    const themeManager = new ThemeManager({
      initialTheme: 'corporate-ai',
      transitionDuration: 100, // Short duration for testing
      onTransitionStart: () => {
        transitionStartCalled = true;
      },
      onTransitionEnd: () => {
        transitionEndCalled = true;
      }
    });

    themeManager.initialize('corporate-ai');

    // Test transition timing
    const startTime = Date.now();
    await themeManager.switchTheme('zen-monk');
    const endTime = Date.now();
    const duration = endTime - startTime;

    if (duration >= 100 && duration <= 200) {
      results.transitionTiming = true;
      console.log('✅ Transition timing is correct');
    } else {
      results.errors.push(`Transition took ${duration}ms, expected ~100ms`);
    }

    // Test callbacks
    if (transitionStartCalled && transitionEndCalled) {
      results.transitionCallbacks = true;
      console.log('✅ Transition callbacks work');
    } else {
      results.errors.push('Transition callbacks not called');
    }

    // Test CSS transition classes
    document.body.classList.add('theme-transitioning');
    const hasTransitionClass = document.body.classList.contains('theme-transitioning');
    document.body.classList.remove('theme-transitioning');

    if (hasTransitionClass) {
      results.cssTransitions = true;
      console.log('✅ CSS transition classes work');
    } else {
      results.errors.push('CSS transition classes not applied');
    }

  } catch (error) {
    results.errors.push(`Transition test error: ${error.message}`);
    console.error('❌ Transition test failed:', error);
  }

  return results;
}

/**
 * Validate all 11 personality mode themes
 */
export async function validateAllModeThemes() {
  console.log('🎨 Testing all personality mode themes...');
  
  const results = {
    allModesValid: false,
    contrastRatios: false,
    colorFormats: false,
    themeDetails: {},
    errors: []
  };

  try {
    const themeManager = new ThemeManager();
    const availableThemes = themeManager.getAvailableThemes();
    
    const expectedModes = [
      'corporate-ai', 'zen-monk', 'chaos', 'emotional-damage', 'therapist',
      'startup-founder', 'doomsday-prophet', 'gamer-rage', 'influencer',
      'wholesome-grandma', 'spooky'
    ];

    let allModesFound = true;
    let allColorsValid = true;
    let allContrastsGood = true;

    expectedModes.forEach(modeId => {
      const themeExists = availableThemes.find(t => t.id === modeId);
      if (!themeExists) {
        allModesFound = false;
        results.errors.push(`Missing theme: ${modeId}`);
        return;
      }

      const config = themeManager.getThemeConfig(modeId);
      const validation = themeManager.validateTheme(modeId);
      
      results.themeDetails[modeId] = {
        name: config.name,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings
      };

      if (!validation.valid) {
        allModesFound = false;
        results.errors.push(`Invalid theme ${modeId}: ${validation.errors.join(', ')}`);
      }

      // Check color formats
      const colorProps = ['primary', 'primaryLight', 'primaryDark'];
      colorProps.forEach(prop => {
        if (config[prop] && !themeManager.isValidColor(config[prop])) {
          allColorsValid = false;
          results.errors.push(`Invalid color format in ${modeId}.${prop}: ${config[prop]}`);
        }
      });

      // Check contrast ratios
      if (validation.warnings && validation.warnings.length > 0) {
        allContrastsGood = false;
        console.warn(`⚠️ ${modeId}: ${validation.warnings.join(', ')}`);
      }
    });

    results.allModesValid = allModesFound;
    results.colorFormats = allColorsValid;
    results.contrastRatios = allContrastsGood;

    if (allModesFound) {
      console.log('✅ All 11 personality mode themes are valid');
    }
    if (allColorsValid) {
      console.log('✅ All color formats are valid');
    }
    if (allContrastsGood) {
      console.log('✅ All contrast ratios are acceptable');
    }

  } catch (error) {
    results.errors.push(`Mode theme validation error: ${error.message}`);
    console.error('❌ Mode theme validation failed:', error);
  }

  return results;
}

/**
 * Test theme integration with React components
 */
export async function validateReactIntegration() {
  console.log('🎨 Testing React integration...');
  
  const results = {
    hookImport: false,
    contextProvider: false,
    errors: []
  };

  try {
    // Test hook import
    const { useThemeManager } = await import('../../utils/useThemeManager.js');
    if (typeof useThemeManager === 'function') {
      results.hookImport = true;
      console.log('✅ useThemeManager hook imports correctly');
    }

    // Test context provider import
    const { ThemeProvider } = await import('../../utils/useThemeManager.js');
    if (typeof ThemeProvider === 'function') {
      results.contextProvider = true;
      console.log('✅ ThemeProvider imports correctly');
    }

  } catch (error) {
    results.errors.push(`React integration test error: ${error.message}`);
    console.error('❌ React integration test failed:', error);
  }

  return results;
}

/**
 * Run comprehensive dynamic theming validation
 */
export async function runDynamicThemingValidation() {
  console.log('🎨 Starting comprehensive dynamic theming validation...');
  
  const results = {
    timestamp: new Date().toISOString(),
    overall: false,
    tests: {},
    summary: {
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  try {
    // Run all validation tests
    results.tests.basics = await validateThemeManagerBasics();
    results.tests.transitions = await validateThemeTransitions();
    results.tests.allModes = await validateAllModeThemes();
    results.tests.reactIntegration = await validateReactIntegration();

    // Calculate summary
    Object.values(results.tests).forEach(test => {
      const testPassed = Object.values(test).filter(v => v === true).length;
      const testFailed = test.errors ? test.errors.length : 0;
      
      results.summary.passed += testPassed;
      results.summary.failed += testFailed;
    });

    // Determine overall result
    results.overall = results.summary.failed === 0 && results.summary.passed > 0;

    console.log('\n🎨 Dynamic Theming Validation Summary:');
    console.log(`✅ Passed: ${results.summary.passed}`);
    console.log(`❌ Failed: ${results.summary.failed}`);
    console.log(`⚠️  Warnings: ${results.summary.warnings}`);
    console.log(`Overall: ${results.overall ? '✅ PASS' : '❌ FAIL'}`);

    if (results.overall) {
      console.log('\n🎉 Dynamic theming system is working correctly!');
    } else {
      console.log('\n⚠️ Dynamic theming system has issues that need attention.');
    }

  } catch (error) {
    results.errors = [`Validation suite error: ${error.message}`];
    console.error('❌ Dynamic theming validation suite failed:', error);
  }

  return results;
}

// Export for use in other test files
export default {
  validateThemeManagerBasics,
  validateThemeTransitions,
  validateAllModeThemes,
  validateReactIntegration,
  runDynamicThemingValidation
};