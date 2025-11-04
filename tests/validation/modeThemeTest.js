/**
 * Mode Theme Testing Utility
 * 
 * Comprehensive testing suite for validating mode-specific theming
 * across all planned personality modes in VibeScreen.
 */

/**
 * Expected mode configurations for testing
 */
const EXPECTED_MODES = [
  'corporate-ai',
  'zen-monk', 
  'chaos',
  'emotional-damage',
  'therapist',
  'startup-founder',
  'doomsday-prophet',
  'gamer-rage',
  'influencer',
  'wholesome-grandma',
  'spooky'
];

/**
 * Required CSS custom properties for each mode
 */
const REQUIRED_CSS_PROPERTIES = [
  '--mode-color',
  '--mode-color-light',
  '--mode-color-dark',
  '--mode-color-contrast',
  '--mode-bg-primary',
  '--mode-bg-secondary',
  '--mode-text-primary',
  '--mode-text-secondary'
];

/**
 * Tests visual consistency across all mode themes
 * @param {HTMLElement} container - Mode selector container element
 * @returns {Object} Test results
 */
export function testModeThemeConsistency(container) {
  const results = {
    timestamp: new Date().toISOString(),
    totalModes: 0,
    passedModes: 0,
    failedModes: 0,
    issues: [],
    recommendations: [],
    modeDetails: {}
  };

  if (!container) {
    results.issues.push('Mode selector container not found');
    return results;
  }

  // Find all mode buttons
  const modeButtons = container.querySelectorAll('[data-mode]');
  results.totalModes = modeButtons.length;

  modeButtons.forEach(button => {
    const modeId = button.getAttribute('data-mode');
    const modeResult = {
      id: modeId,
      passed: true,
      issues: [],
      recommendations: [],
      cssProperties: {},
      accessibility: {}
    };

    // Test CSS custom properties
    const computedStyle = window.getComputedStyle(button);
    
    REQUIRED_CSS_PROPERTIES.forEach(property => {
      const value = computedStyle.getPropertyValue(property).trim();
      modeResult.cssProperties[property] = value;
      
      if (!value || value === 'initial' || value === 'inherit') {
        modeResult.issues.push(`Missing or invalid CSS property: ${property}`);
        modeResult.passed = false;
      }
    });

    // Test color contrast
    const textColor = computedStyle.color;
    const backgroundColor = computedStyle.backgroundColor;
    const borderColor = computedStyle.borderColor;

    if (textColor && backgroundColor) {
      modeResult.accessibility.textContrast = {
        textColor,
        backgroundColor,
        // Note: Actual contrast calculation would require color parsing
        status: 'needs-calculation'
      };
    }

    // Test hover state functionality
    try {
      button.dispatchEvent(new MouseEvent('mouseenter'));
      const hoverStyle = window.getComputedStyle(button);
      const hoverTransform = hoverStyle.transform;
      
      if (hoverTransform && hoverTransform !== 'none') {
        modeResult.accessibility.hoverState = 'working';
      } else {
        modeResult.recommendations.push('Hover state may not be working properly');
      }
      
      button.dispatchEvent(new MouseEvent('mouseleave'));
    } catch (error) {
      modeResult.issues.push(`Hover state testing failed: ${error.message}`);
    }

    // Test active state
    if (button.classList.contains('active')) {
      const activeBackground = computedStyle.backgroundColor;
      const activeColor = computedStyle.color;
      
      modeResult.accessibility.activeState = {
        backgroundColor: activeBackground,
        color: activeColor,
        status: 'active'
      };
    }

    // Update overall results
    if (modeResult.passed) {
      results.passedModes++;
    } else {
      results.failedModes++;
      results.issues.push(`Mode "${modeId}" failed validation`);
    }

    results.modeDetails[modeId] = modeResult;
  });

  // Check for missing expected modes
  const foundModes = Object.keys(results.modeDetails);
  const missingModes = EXPECTED_MODES.filter(mode => !foundModes.includes(mode));
  
  if (missingModes.length > 0) {
    results.issues.push(`Missing expected modes: ${missingModes.join(', ')}`);
    results.recommendations.push('Ensure all planned personality modes are implemented');
  }

  // Generate overall recommendations
  if (results.failedModes === 0 && results.passedModes > 0) {
    results.recommendations.push('All mode themes passed validation!');
  } else if (results.failedModes > 0) {
    results.recommendations.push('Review failed modes and update CSS custom properties');
    results.recommendations.push('Ensure proper contrast ratios for accessibility');
  }

  return results;
}

/**
 * Tests dynamic theme switching functionality
 * @param {HTMLElement} container - Mode selector container
 * @returns {Promise<Object>} Test results
 */
export async function testDynamicThemeSwitching(container) {
  const results = {
    timestamp: new Date().toISOString(),
    switchingTests: [],
    overallPassed: true,
    issues: []
  };

  if (!container) {
    results.issues.push('Container not found');
    results.overallPassed = false;
    return results;
  }

  const modeButtons = container.querySelectorAll('[data-mode]:not(.active)');
  
  for (const button of modeButtons) {
    const modeId = button.getAttribute('data-mode');
    const testResult = {
      modeId,
      passed: true,
      issues: [],
      timings: {}
    };

    try {
      // Record initial state
      const initialContainerStyle = window.getComputedStyle(container);
      const initialBorderColor = initialContainerStyle.borderTopColor;
      
      // Simulate mode switch
      const startTime = performance.now();
      button.click();
      
      // Wait for transition
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endTime = performance.now();
      testResult.timings.switchDuration = endTime - startTime;
      
      // Check if container theme updated
      const newContainerStyle = window.getComputedStyle(container);
      const newBorderColor = newContainerStyle.borderTopColor;
      
      if (newBorderColor === initialBorderColor) {
        testResult.issues.push('Container border color did not change');
        testResult.passed = false;
      }
      
      // Check if active mode attribute updated
      const activeMode = container.getAttribute('data-active-mode');
      if (activeMode !== modeId) {
        testResult.issues.push(`Active mode attribute not updated (expected: ${modeId}, got: ${activeMode})`);
        testResult.passed = false;
      }
      
    } catch (error) {
      testResult.issues.push(`Theme switching test failed: ${error.message}`);
      testResult.passed = false;
    }

    if (!testResult.passed) {
      results.overallPassed = false;
      results.issues.push(...testResult.issues);
    }

    results.switchingTests.push(testResult);
  }

  return results;
}

/**
 * Runs comprehensive mode theme testing
 * @param {HTMLElement} container - Mode selector container
 * @returns {Promise<Object>} Complete test results
 */
export async function runComprehensiveThemeTests(container) {
  console.group('🎨 VibeScreen Mode Theme Testing');
  
  const consistencyResults = testModeThemeConsistency(container);
  console.log('📊 Consistency Test Results:', consistencyResults);
  
  const switchingResults = await testDynamicThemeSwitching(container);
  console.log('🔄 Dynamic Switching Test Results:', switchingResults);
  
  const overallResults = {
    timestamp: new Date().toISOString(),
    consistency: consistencyResults,
    switching: switchingResults,
    overallPassed: consistencyResults.failedModes === 0 && switchingResults.overallPassed,
    summary: {
      totalModes: consistencyResults.totalModes,
      passedModes: consistencyResults.passedModes,
      failedModes: consistencyResults.failedModes,
      switchingTestsPassed: switchingResults.switchingTests.filter(t => t.passed).length,
      switchingTestsFailed: switchingResults.switchingTests.filter(t => !t.passed).length
    }
  };
  
  // Log summary
  if (overallResults.overallPassed) {
    console.log('✅ All theme tests passed!');
  } else {
    console.warn('❌ Some theme tests failed. Check results for details.');
  }
  
  console.groupEnd();
  
  return overallResults;
}

export default {
  testModeThemeConsistency,
  testDynamicThemeSwitching,
  runComprehensiveThemeTests,
  EXPECTED_MODES,
  REQUIRED_CSS_PROPERTIES
};