/**
 * Mode Selector Stability Test
 * 
 * Tests that the mode selector doesn't automatically shuffle between modes
 * and only changes modes when the user explicitly clicks a button.
 */

/**
 * Tests that mode selector is stable and doesn't auto-switch
 * @returns {Promise<Object>} Test results
 */
export async function testModeSelectorStability() {
  const results = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    issues: [],
    details: []
  };

  try {
    console.log('🔍 Testing Mode Selector Stability...');

    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find the mode selector
    const modeSelector = document.querySelector('.mode-selector');
    if (!modeSelector) {
      results.issues.push('Mode selector not found');
      results.testsFailed++;
      return results;
    }

    // Record initial state
    const initialActiveMode = modeSelector.getAttribute('data-active-mode');
    const initialActiveButton = modeSelector.querySelector('.mode-button.active');
    const initialActiveButtonText = initialActiveButton ? initialActiveButton.textContent.trim() : 'None';

    console.log(`📊 Initial state: ${initialActiveMode} (${initialActiveButtonText})`);

    // Test 1: Wait and check if mode changes automatically
    console.log('⏱️ Waiting 5 seconds to check for automatic mode changes...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const afterWaitActiveMode = modeSelector.getAttribute('data-active-mode');
    const afterWaitActiveButton = modeSelector.querySelector('.mode-button.active');
    const afterWaitActiveButtonText = afterWaitActiveButton ? afterWaitActiveButton.textContent.trim() : 'None';

    if (afterWaitActiveMode === initialActiveMode && afterWaitActiveButtonText === initialActiveButtonText) {
      console.log('✅ Mode selector is stable - no automatic switching detected');
      results.testsPassed++;
      results.details.push('Mode selector remained stable during 5-second wait');
    } else {
      console.log(`❌ Mode selector changed automatically: ${initialActiveMode} → ${afterWaitActiveMode}`);
      results.testsFailed++;
      results.issues.push(`Automatic mode change detected: ${initialActiveMode} → ${afterWaitActiveMode}`);
    }

    // Test 2: Check for excessive console logging
    const originalConsoleLog = console.log;
    let logCount = 0;
    console.log = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('🎨')) {
        logCount++;
      }
      originalConsoleLog.apply(console, args);
    };

    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log = originalConsoleLog;

    if (logCount < 5) {
      console.log(`✅ Reasonable logging activity: ${logCount} theme-related logs`);
      results.testsPassed++;
      results.details.push(`Low logging activity: ${logCount} theme logs in 2 seconds`);
    } else {
      console.log(`❌ Excessive logging activity: ${logCount} theme-related logs in 2 seconds`);
      results.testsFailed++;
      results.issues.push(`Excessive theme logging: ${logCount} logs in 2 seconds`);
    }

    // Test 3: Manual click test
    const modeButtons = modeSelector.querySelectorAll('.mode-button:not(.active)');
    if (modeButtons.length > 0) {
      const testButton = modeButtons[0];
      const testButtonText = testButton.textContent.trim();
      const testButtonMode = testButton.getAttribute('data-mode');

      console.log(`🖱️ Testing manual click on ${testButtonText} (${testButtonMode})`);
      
      testButton.click();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newActiveMode = modeSelector.getAttribute('data-active-mode');
      const newActiveButton = modeSelector.querySelector('.mode-button.active');
      const newActiveButtonText = newActiveButton ? newActiveButton.textContent.trim() : 'None';

      if (newActiveMode === testButtonMode && newActiveButtonText === testButtonText) {
        console.log(`✅ Manual click worked: switched to ${testButtonText}`);
        results.testsPassed++;
        results.details.push(`Manual click successfully switched to ${testButtonText}`);
      } else {
        console.log(`❌ Manual click failed: expected ${testButtonMode}, got ${newActiveMode}`);
        results.testsFailed++;
        results.issues.push(`Manual click failed: expected ${testButtonMode}, got ${newActiveMode}`);
      }
    }

    // Test 4: Check for WebGL context errors
    const originalConsoleError = console.error;
    let webglErrors = 0;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('WebGL')) {
        webglErrors++;
      }
      originalConsoleError.apply(console, args);
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.error = originalConsoleError;

    if (webglErrors === 0) {
      console.log('✅ No WebGL context errors detected');
      results.testsPassed++;
      results.details.push('No WebGL context errors during test');
    } else {
      console.log(`⚠️ ${webglErrors} WebGL context errors detected`);
      results.issues.push(`${webglErrors} WebGL context errors detected`);
    }

  } catch (error) {
    console.error('❌ Stability test failed:', error);
    results.testsFailed++;
    results.issues.push(`Test error: ${error.message}`);
  }

  // Summary
  const totalTests = results.testsPassed + results.testsFailed;
  console.log(`\n📊 Mode Selector Stability Test Summary:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${results.testsPassed}`);
  console.log(`   Failed: ${results.testsFailed}`);
  console.log(`   Issues: ${results.issues.length}`);

  if (results.testsFailed === 0) {
    console.log('🎉 Mode selector is stable and working correctly!');
  } else {
    console.log('⚠️ Mode selector has stability issues. Check details for more info.');
  }

  return results;
}

// Auto-run test if in browser environment
if (typeof window !== 'undefined' && window.location) {
  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => testModeSelectorStability(), 3000);
    });
  } else {
    setTimeout(() => testModeSelectorStability(), 3000);
  }
}

export default {
  testModeSelectorStability
};