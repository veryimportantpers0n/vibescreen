/**
 * Mode Selector Fix Validation
 * 
 * Validates that the mode selector functionality fixes are working correctly
 * after Task 5 implementation.
 */

/**
 * Tests that mode selector is properly integrated and functional
 * @returns {Promise<Object>} Test results
 */
export async function validateModeSelectorFix() {
  const results = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    issues: [],
    details: []
  };

  try {
    console.log('🔘 Starting Mode Selector Fix Validation...');

    // Test 1: Check if ModeSelector component is rendered
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for app to load
    
    const modeSelector = document.querySelector('.mode-selector');
    if (modeSelector) {
      console.log('✅ Mode selector component found');
      results.testsPassed++;
      results.details.push('Mode selector component rendered successfully');
    } else {
      console.log('❌ Mode selector component not found');
      results.testsFailed++;
      results.issues.push('Mode selector component not rendered');
      return results;
    }

    // Test 2: Check for mode buttons
    const modeButtons = modeSelector.querySelectorAll('.mode-button');
    if (modeButtons.length > 0) {
      console.log(`✅ Found ${modeButtons.length} mode buttons`);
      results.testsPassed++;
      results.details.push(`${modeButtons.length} mode buttons found`);
    } else {
      console.log('❌ No mode buttons found');
      results.testsFailed++;
      results.issues.push('No mode buttons found');
    }

    // Test 3: Check if buttons have proper data-mode attributes
    let buttonsWithDataMode = 0;
    modeButtons.forEach(button => {
      if (button.getAttribute('data-mode')) {
        buttonsWithDataMode++;
      }
    });

    if (buttonsWithDataMode === modeButtons.length) {
      console.log('✅ All buttons have data-mode attributes');
      results.testsPassed++;
      results.details.push('All buttons have proper data-mode attributes');
    } else {
      console.log(`❌ Only ${buttonsWithDataMode}/${modeButtons.length} buttons have data-mode attributes`);
      results.testsFailed++;
      results.issues.push('Some buttons missing data-mode attributes');
    }

    // Test 4: Check if container has data-active-mode attribute
    const activeMode = modeSelector.getAttribute('data-active-mode');
    if (activeMode) {
      console.log(`✅ Container has active mode: ${activeMode}`);
      results.testsPassed++;
      results.details.push(`Active mode set to: ${activeMode}`);
    } else {
      console.log('⚠️ Container missing data-active-mode attribute');
      results.issues.push('Container missing data-active-mode attribute');
    }

    // Test 5: Test button click functionality
    const inactiveButton = Array.from(modeButtons).find(btn => !btn.classList.contains('active'));
    if (inactiveButton) {
      const buttonMode = inactiveButton.getAttribute('data-mode');
      const buttonName = inactiveButton.textContent.trim();
      
      console.log(`🔄 Testing click on ${buttonName} (${buttonMode})`);
      
      // Record initial state
      const initialActiveButtons = modeSelector.querySelectorAll('.mode-button.active').length;
      
      // Click the button
      inactiveButton.click();
      
      // Wait for state change
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if button became active or if there was a theme change
      const newActiveButtons = modeSelector.querySelectorAll('.mode-button.active').length;
      const newActiveMode = modeSelector.getAttribute('data-active-mode');
      
      if (inactiveButton.classList.contains('active') || newActiveMode === buttonMode) {
        console.log(`✅ Button click successful - mode changed to ${newActiveMode}`);
        results.testsPassed++;
        results.details.push(`Button click test passed for ${buttonName}`);
      } else {
        console.log(`❌ Button click failed - expected ${buttonMode}, got ${newActiveMode}`);
        results.testsFailed++;
        results.issues.push(`Button click test failed for ${buttonName}`);
      }
    }

    // Test 6: Check CSS theming
    const activeButton = modeSelector.querySelector('.mode-button.active');
    if (activeButton) {
      const computedStyle = window.getComputedStyle(activeButton);
      const hasBackground = computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)';
      const hasGlow = computedStyle.boxShadow && computedStyle.boxShadow !== 'none';
      
      if (hasBackground || hasGlow) {
        console.log('✅ Active button has proper styling');
        results.testsPassed++;
        results.details.push('Active button styling verified');
      } else {
        console.log('⚠️ Active button may be missing styling');
        results.issues.push('Active button styling may be incomplete');
      }
    }

    // Test 7: Check for accessibility attributes
    let accessibleButtons = 0;
    modeButtons.forEach(button => {
      if (button.getAttribute('aria-label') && button.getAttribute('aria-pressed')) {
        accessibleButtons++;
      }
    });

    if (accessibleButtons === modeButtons.length) {
      console.log('✅ All buttons have accessibility attributes');
      results.testsPassed++;
      results.details.push('Accessibility attributes verified');
    } else {
      console.log(`⚠️ Only ${accessibleButtons}/${modeButtons.length} buttons have full accessibility attributes`);
      results.issues.push('Some buttons missing accessibility attributes');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
    results.testsFailed++;
    results.issues.push(`Validation error: ${error.message}`);
  }

  // Summary
  const totalTests = results.testsPassed + results.testsFailed;
  console.log(`\n📊 Mode Selector Fix Validation Summary:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${results.testsPassed}`);
  console.log(`   Failed: ${results.testsFailed}`);
  console.log(`   Issues: ${results.issues.length}`);

  if (results.testsFailed === 0) {
    console.log('🎉 All mode selector functionality tests passed!');
  } else {
    console.log('⚠️ Some tests failed. Check issues for details.');
  }

  return results;
}

/**
 * Tests character name conversion for ModeSwitchController compatibility
 * @returns {Object} Test results
 */
export function testCharacterNameConversion() {
  const results = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    conversions: []
  };

  const testCases = [
    { id: 'corporate-ai', expectedName: 'Corporate AI' },
    { id: 'zen-monk', expectedName: 'Zen Monk' },
    { id: 'doomsday-prophet', expectedName: 'Doomsday Prophet' },
    { id: 'emotional-damage', expectedName: 'Emotional Damage' },
    { id: 'gamer-rage', expectedName: 'Gamer Rage' },
    { id: 'startup-founder', expectedName: 'Startup Founder' },
    { id: 'wholesome-grandma', expectedName: 'Wholesome Grandma' }
  ];

  testCases.forEach(testCase => {
    // Simulate the conversion logic from the mode selector
    const convertedName = testCase.id.replace(/-/g, ' ');
    const properName = convertedName.replace(/\b\w/g, l => l.toUpperCase());
    
    results.conversions.push({
      modeId: testCase.id,
      converted: properName,
      expected: testCase.expectedName,
      matches: properName === testCase.expectedName
    });

    if (properName === testCase.expectedName) {
      results.testsPassed++;
    } else {
      results.testsFailed++;
    }
  });

  console.log('🔄 Character Name Conversion Test Results:');
  results.conversions.forEach(conv => {
    const status = conv.matches ? '✅' : '❌';
    console.log(`   ${status} ${conv.modeId} → "${conv.converted}" (expected: "${conv.expected}")`);
  });

  return results;
}

// Auto-run validation if in browser environment
if (typeof window !== 'undefined' && window.location) {
  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        validateModeSelectorFix();
        testCharacterNameConversion();
      }, 2000);
    });
  } else {
    setTimeout(() => {
      validateModeSelectorFix();
      testCharacterNameConversion();
    }, 2000);
  }
}

export default {
  validateModeSelectorFix,
  testCharacterNameConversion
};