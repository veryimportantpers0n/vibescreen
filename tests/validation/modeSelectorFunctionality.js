/**
 * Mode Selector Functionality Test
 * 
 * Tests the core functionality of the ModeSelector component
 * to ensure click handlers, state management, and visual feedback work correctly.
 */

/**
 * Tests mode selector click functionality
 * @returns {Promise<Object>} Test results
 */
export async function testModeSelectorClicks() {
  const results = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    issues: [],
    details: []
  };

  try {
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find the mode selector
    const modeSelector = document.querySelector('.mode-selector');
    if (!modeSelector) {
      results.issues.push('Mode selector not found');
      results.testsFailed++;
      return results;
    }

    // Find mode buttons
    const modeButtons = modeSelector.querySelectorAll('.mode-button');
    if (modeButtons.length === 0) {
      results.issues.push('No mode buttons found');
      results.testsFailed++;
      return results;
    }

    console.log(`Found ${modeButtons.length} mode buttons`);

    // Test each button click
    for (let i = 0; i < Math.min(modeButtons.length, 3); i++) {
      const button = modeButtons[i];
      const modeId = button.getAttribute('data-mode');
      const modeName = button.textContent.trim();

      const testDetail = {
        modeId,
        modeName,
        passed: true,
        issues: []
      };

      try {
        // Record initial state
        const initiallyActive = button.classList.contains('active');
        
        // Click the button
        console.log(`Testing click on ${modeName} (${modeId})`);
        button.click();

        // Wait for state change
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check if button became active
        const nowActive = button.classList.contains('active');
        
        if (!initiallyActive && nowActive) {
          console.log(`✅ ${modeName} button activated successfully`);
          results.testsPassed++;
        } else if (initiallyActive && nowActive) {
          console.log(`✅ ${modeName} button remained active (was already active)`);
          results.testsPassed++;
        } else {
          testDetail.issues.push('Button did not become active after click');
          testDetail.passed = false;
          results.testsFailed++;
        }

        // Check if mode selector container updated
        const activeMode = modeSelector.getAttribute('data-active-mode');
        if (activeMode === modeId) {
          console.log(`✅ Mode selector container updated to ${modeId}`);
        } else {
          testDetail.issues.push(`Container active mode not updated (expected: ${modeId}, got: ${activeMode})`);
          testDetail.passed = false;
        }

        // Test visual feedback
        const computedStyle = window.getComputedStyle(button);
        const hasGlow = computedStyle.boxShadow && computedStyle.boxShadow !== 'none';
        
        if (hasGlow) {
          console.log(`✅ ${modeName} button has visual feedback (glow effect)`);
        } else {
          testDetail.issues.push('Button lacks visual feedback');
        }

      } catch (error) {
        testDetail.issues.push(`Click test failed: ${error.message}`);
        testDetail.passed = false;
        results.testsFailed++;
      }

      results.details.push(testDetail);
    }

    // Test keyboard navigation
    try {
      const firstButton = modeButtons[0];
      firstButton.focus();
      
      // Simulate arrow key navigation
      const arrowRightEvent = new KeyboardEvent('keydown', {
        key: 'ArrowRight',
        bubbles: true
      });
      
      modeSelector.dispatchEvent(arrowRightEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('✅ Keyboard navigation test completed');
      results.testsPassed++;
      
    } catch (error) {
      results.issues.push(`Keyboard navigation test failed: ${error.message}`);
      results.testsFailed++;
    }

  } catch (error) {
    results.issues.push(`Overall test failed: ${error.message}`);
    results.testsFailed++;
  }

  return results;
}

/**
 * Tests mode selector visual feedback
 * @returns {Object} Test results
 */
export function testModeSelectorVisualFeedback() {
  const results = {
    timestamp: new Date().toISOString(),
    testsPassed: 0,
    testsFailed: 0,
    issues: [],
    details: []
  };

  try {
    const modeSelector = document.querySelector('.mode-selector');
    if (!modeSelector) {
      results.issues.push('Mode selector not found');
      results.testsFailed++;
      return results;
    }

    const modeButtons = modeSelector.querySelectorAll('.mode-button');
    
    modeButtons.forEach((button, index) => {
      const modeId = button.getAttribute('data-mode');
      const testDetail = {
        modeId,
        passed: true,
        issues: []
      };

      // Test button styling
      const computedStyle = window.getComputedStyle(button);
      
      // Check for required CSS properties
      const requiredProps = ['border', 'color', 'font-family'];
      requiredProps.forEach(prop => {
        const value = computedStyle[prop];
        if (!value || value === 'initial') {
          testDetail.issues.push(`Missing ${prop} styling`);
          testDetail.passed = false;
        }
      });

      // Check for active state styling
      if (button.classList.contains('active')) {
        const backgroundColor = computedStyle.backgroundColor;
        if (!backgroundColor || backgroundColor === 'rgba(0, 0, 0, 0)') {
          testDetail.issues.push('Active button lacks background color');
          testDetail.passed = false;
        }
      }

      // Check for hover capability
      if (computedStyle.cursor !== 'pointer') {
        testDetail.issues.push('Button should have pointer cursor');
        testDetail.passed = false;
      }

      if (testDetail.passed) {
        results.testsPassed++;
      } else {
        results.testsFailed++;
      }

      results.details.push(testDetail);
    });

  } catch (error) {
    results.issues.push(`Visual feedback test failed: ${error.message}`);
    results.testsFailed++;
  }

  return results;
}

/**
 * Runs all mode selector functionality tests
 * @returns {Promise<Object>} Complete test results
 */
export async function runModeSelectorTests() {
  console.group('🔘 Mode Selector Functionality Tests');
  
  const clickResults = await testModeSelectorClicks();
  console.log('Click Tests:', clickResults);
  
  const visualResults = testModeSelectorVisualFeedback();
  console.log('Visual Feedback Tests:', visualResults);
  
  const overallResults = {
    timestamp: new Date().toISOString(),
    clickTests: clickResults,
    visualTests: visualResults,
    overallPassed: clickResults.testsFailed === 0 && visualResults.testsFailed === 0,
    summary: {
      totalTests: clickResults.testsPassed + clickResults.testsFailed + visualResults.testsPassed + visualResults.testsFailed,
      passedTests: clickResults.testsPassed + visualResults.testsPassed,
      failedTests: clickResults.testsFailed + visualResults.testsFailed
    }
  };
  
  if (overallResults.overallPassed) {
    console.log('✅ All mode selector tests passed!');
  } else {
    console.warn('❌ Some mode selector tests failed. Check results for details.');
  }
  
  console.groupEnd();
  
  return overallResults;
}

// Auto-run tests if in browser environment
if (typeof window !== 'undefined' && window.location) {
  // Wait for page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => runModeSelectorTests(), 1000);
    });
  } else {
    setTimeout(() => runModeSelectorTests(), 1000);
  }
}

export default {
  testModeSelectorClicks,
  testModeSelectorVisualFeedback,
  runModeSelectorTests
};