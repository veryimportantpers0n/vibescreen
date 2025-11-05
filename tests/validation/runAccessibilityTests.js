/**
 * Accessibility Test Runner
 * 
 * Simple test runner for accessibility validation that can be run in browser console
 */

// Import the accessibility validation module
import { quickAccessibilityTest, runAccessibilityValidation } from './accessibilityValidation.js';

/**
 * Run accessibility tests in browser environment
 */
function runTests() {
  console.log('🚀 Starting Accessibility Tests...\n');
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    console.log('⚠️  These tests require a browser environment with DOM support.');
    console.log('📝 To run these tests:');
    console.log('   1. Open VibeScreen in a browser');
    console.log('   2. Open browser developer tools (F12)');
    console.log('   3. Go to Console tab');
    console.log('   4. Run: import("./tests/validation/runAccessibilityTests.js").then(m => m.runTests())');
    return;
  }
  
  // Run quick test first
  console.log('🔍 Running Quick Accessibility Test...');
  const quickResult = quickAccessibilityTest();
  
  if (quickResult) {
    console.log('\n✅ Quick test passed! Running comprehensive validation...\n');
    
    // Run comprehensive validation
    runAccessibilityValidation().then(results => {
      console.log('\n🏁 All accessibility tests completed!');
      
      if (results.failed === 0) {
        console.log('🎉 Congratulations! Your application meets comprehensive accessibility standards.');
      } else {
        console.log('📋 Review the failed tests and implement the necessary improvements.');
      }
    }).catch(error => {
      console.error('❌ Error running comprehensive validation:', error);
    });
  } else {
    console.log('\n❌ Quick test failed. Please check the accessibility manager setup.');
  }
}

/**
 * Browser console instructions
 */
function showInstructions() {
  console.log('📋 Accessibility Testing Instructions');
  console.log('=====================================');
  console.log('');
  console.log('To test accessibility features:');
  console.log('');
  console.log('1. Quick Test:');
  console.log('   quickAccessibilityTest()');
  console.log('');
  console.log('2. Full Validation:');
  console.log('   runAccessibilityValidation()');
  console.log('');
  console.log('3. Test Keyboard Navigation:');
  console.log('   - Press F1 to show keyboard help');
  console.log('   - Press Tab to navigate elements');
  console.log('   - Press Alt+1 to skip to main content');
  console.log('   - Press Escape to close dialogs');
  console.log('');
  console.log('4. Test Screen Reader:');
  console.log('   - Enable screen reader software');
  console.log('   - Navigate through the interface');
  console.log('   - Listen for announcements');
  console.log('');
  console.log('5. Test High Contrast:');
  console.log('   - Enable high contrast mode in OS');
  console.log('   - Verify interface remains usable');
  console.log('');
  console.log('6. Test Reduced Motion:');
  console.log('   - Enable reduced motion in OS');
  console.log('   - Verify animations are disabled');
}

// Export functions for browser use
if (typeof window !== 'undefined') {
  window.runAccessibilityTests = runTests;
  window.showAccessibilityInstructions = showInstructions;
  window.quickAccessibilityTest = quickAccessibilityTest;
  window.runAccessibilityValidation = runAccessibilityValidation;
}

export { runTests, showInstructions, quickAccessibilityTest, runAccessibilityValidation };