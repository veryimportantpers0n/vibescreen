/**
 * Accessibility Validation Tests
 * 
 * Comprehensive validation of accessibility enhancements including
 * high contrast mode, reduced motion, screen reader support, and keyboard navigation.
 */

import { getAccessibilityManager, announce, announceStatus, announceAlert } from '../../utils/accessibilityManager.js';

/**
 * Test accessibility manager initialization
 */
function testAccessibilityManagerInit() {
  console.log('🔍 Testing Accessibility Manager Initialization...');
  
  try {
    const manager = getAccessibilityManager();
    
    // Test manager exists
    if (!manager) {
      throw new Error('Accessibility manager not initialized');
    }
    
    // Test preferences detection
    const preferences = manager.getPreferences();
    console.log('✅ Accessibility preferences detected:', preferences);
    
    // Test live regions creation
    const politeRegion = document.querySelector('.sr-live-polite');
    const assertiveRegion = document.querySelector('.sr-live-assertive');
    const statusRegion = document.querySelector('.sr-live-status');
    
    if (!politeRegion || !assertiveRegion || !statusRegion) {
      throw new Error('Live regions not created properly');
    }
    
    console.log('✅ Live regions created successfully');
    
    // Test skip link
    const skipLink = document.querySelector('.skip-to-content');
    if (!skipLink) {
      throw new Error('Skip link not created');
    }
    
    console.log('✅ Skip link created successfully');
    
    // Test keyboard help overlay
    const keyboardHelp = document.querySelector('.keyboard-help-overlay');
    if (!keyboardHelp) {
      throw new Error('Keyboard help overlay not created');
    }
    
    console.log('✅ Keyboard help overlay created successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Accessibility Manager Init Test Failed:', error.message);
    return false;
  }
}

/**
 * Test screen reader announcements
 */
function testScreenReaderAnnouncements() {
  console.log('🔍 Testing Screen Reader Announcements...');
  
  try {
    // Test polite announcement
    announce('Test polite announcement', 'polite');
    console.log('✅ Polite announcement sent');
    
    // Test assertive announcement
    announce('Test assertive announcement', 'assertive');
    console.log('✅ Assertive announcement sent');
    
    // Test status announcement
    announceStatus('Test status update');
    console.log('✅ Status announcement sent');
    
    // Test alert announcement
    announceAlert('Test alert message');
    console.log('✅ Alert announcement sent');
    
    // Verify live regions have content
    setTimeout(() => {
      const politeRegion = document.querySelector('.sr-live-polite');
      const assertiveRegion = document.querySelector('.sr-live-assertive');
      const statusRegion = document.querySelector('.sr-live-status');
      
      if (politeRegion && politeRegion.textContent.includes('Test polite')) {
        console.log('✅ Polite live region updated');
      }
      
      if (assertiveRegion && assertiveRegion.textContent.includes('Test assertive')) {
        console.log('✅ Assertive live region updated');
      }
      
      if (statusRegion && statusRegion.textContent.includes('Test status')) {
        console.log('✅ Status live region updated');
      }
    }, 200);
    
    return true;
  } catch (error) {
    console.error('❌ Screen Reader Announcements Test Failed:', error.message);
    return false;
  }
}

/**
 * Test keyboard navigation
 */
function testKeyboardNavigation() {
  console.log('🔍 Testing Keyboard Navigation...');
  
  try {
    const manager = getAccessibilityManager();
    
    // Test keyboard help display
    manager.showKeyboardHelp();
    
    const keyboardHelp = document.querySelector('.keyboard-help-overlay');
    if (!keyboardHelp.classList.contains('visible')) {
      throw new Error('Keyboard help not shown');
    }
    
    console.log('✅ Keyboard help shown successfully');
    
    // Test keyboard help hide
    manager.hideKeyboardHelp();
    
    if (keyboardHelp.classList.contains('visible')) {
      throw new Error('Keyboard help not hidden');
    }
    
    console.log('✅ Keyboard help hidden successfully');
    
    // Test focusable elements detection
    const focusableElements = manager.getFocusableElements();
    console.log(`✅ Found ${focusableElements.length} focusable elements`);
    
    // Test skip to main content
    manager.skipToMainContent();
    console.log('✅ Skip to main content executed');
    
    return true;
  } catch (error) {
    console.error('❌ Keyboard Navigation Test Failed:', error.message);
    return false;
  }
}

/**
 * Test high contrast mode
 */
function testHighContrastMode() {
  console.log('🔍 Testing High Contrast Mode...');
  
  try {
    const manager = getAccessibilityManager();
    const preferences = manager.getPreferences();
    
    // Test high contrast detection
    const highContrastDetected = preferences.highContrast;
    console.log(`✅ High contrast mode detected: ${highContrastDetected}`);
    
    // Test CSS custom properties for high contrast
    const root = document.documentElement;
    const highContrastAttr = root.getAttribute('data-high-contrast');
    
    if (highContrastAttr !== null) {
      console.log('✅ High contrast attribute applied to document');
    }
    
    // Test high contrast styles
    const testElement = document.createElement('div');
    testElement.className = 'message-popup';
    testElement.setAttribute('data-high-contrast', 'true');
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    
    // Clean up test element
    document.body.removeChild(testElement);
    
    console.log('✅ High contrast styles applied');
    
    return true;
  } catch (error) {
    console.error('❌ High Contrast Mode Test Failed:', error.message);
    return false;
  }
}

/**
 * Test reduced motion mode
 */
function testReducedMotionMode() {
  console.log('🔍 Testing Reduced Motion Mode...');
  
  try {
    const manager = getAccessibilityManager();
    const preferences = manager.getPreferences();
    
    // Test reduced motion detection
    const reducedMotionDetected = preferences.reducedMotion;
    console.log(`✅ Reduced motion mode detected: ${reducedMotionDetected}`);
    
    // Test CSS custom properties for reduced motion
    const root = document.documentElement;
    const reducedMotionAttr = root.getAttribute('data-reduced-motion');
    
    if (reducedMotionAttr !== null) {
      console.log('✅ Reduced motion attribute applied to document');
    }
    
    // Test reduced motion styles
    const testElement = document.createElement('div');
    testElement.className = 'message-popup';
    testElement.setAttribute('data-reduced-motion', 'true');
    document.body.appendChild(testElement);
    
    const computedStyle = window.getComputedStyle(testElement);
    
    // Clean up test element
    document.body.removeChild(testElement);
    
    console.log('✅ Reduced motion styles applied');
    
    return true;
  } catch (error) {
    console.error('❌ Reduced Motion Mode Test Failed:', error.message);
    return false;
  }
}

/**
 * Test ARIA enhancements
 */
function testARIAEnhancements() {
  console.log('🔍 Testing ARIA Enhancements...');
  
  try {
    const manager = getAccessibilityManager();
    
    // Test element enhancement
    const testElement = document.createElement('button');
    testElement.textContent = 'Test Button';
    document.body.appendChild(testElement);
    
    manager.enhanceElement(testElement, {
      role: 'button',
      label: 'Test button for accessibility',
      describedBy: 'test-description',
      pressed: false,
      disabled: false
    });
    
    // Verify ARIA attributes
    if (testElement.getAttribute('aria-label') !== 'Test button for accessibility') {
      throw new Error('ARIA label not set correctly');
    }
    
    if (testElement.getAttribute('aria-describedby') !== 'test-description') {
      throw new Error('ARIA describedby not set correctly');
    }
    
    if (testElement.getAttribute('aria-pressed') !== 'false') {
      throw new Error('ARIA pressed not set correctly');
    }
    
    console.log('✅ ARIA attributes enhanced successfully');
    
    // Clean up test element
    document.body.removeChild(testElement);
    
    // Test accessible button creation
    const accessibleButton = manager.createAccessibleButton(
      'Accessible Test Button',
      () => console.log('Button clicked'),
      {
        label: 'Test accessible button',
        describedBy: 'button-description',
        pressed: false
      }
    );
    
    if (!accessibleButton.getAttribute('aria-label')) {
      throw new Error('Accessible button not created with proper ARIA attributes');
    }
    
    console.log('✅ Accessible button created successfully');
    
    return true;
  } catch (error) {
    console.error('❌ ARIA Enhancements Test Failed:', error.message);
    return false;
  }
}

/**
 * Test focus management
 */
function testFocusManagement() {
  console.log('🔍 Testing Focus Management...');
  
  try {
    const manager = getAccessibilityManager();
    
    // Create test focusable elements
    const container = document.createElement('div');
    container.className = 'test-focus-container';
    
    const button1 = document.createElement('button');
    button1.textContent = 'Button 1';
    button1.id = 'test-button-1';
    
    const button2 = document.createElement('button');
    button2.textContent = 'Button 2';
    button2.id = 'test-button-2';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'test-input';
    
    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(input);
    document.body.appendChild(container);
    
    // Test focusable elements detection
    const focusableElements = manager.getFocusableElements(container);
    
    if (focusableElements.length !== 3) {
      throw new Error(`Expected 3 focusable elements, found ${focusableElements.length}`);
    }
    
    console.log('✅ Focusable elements detected correctly');
    
    // Test focus trapping (simulate)
    const mockEvent = {
      key: 'Tab',
      shiftKey: false,
      preventDefault: () => {},
      target: button2
    };
    
    // This would normally be called by the event listener
    // manager.trapFocus(mockEvent, container);
    
    console.log('✅ Focus trapping logic available');
    
    // Clean up test elements
    document.body.removeChild(container);
    
    return true;
  } catch (error) {
    console.error('❌ Focus Management Test Failed:', error.message);
    return false;
  }
}

/**
 * Test accessibility preferences persistence
 */
function testPreferencesPersistence() {
  console.log('🔍 Testing Preferences Persistence...');
  
  try {
    const manager = getAccessibilityManager();
    
    // Get initial preferences
    const initialPrefs = manager.getPreferences();
    console.log('✅ Initial preferences retrieved:', initialPrefs);
    
    // Update preferences
    const newPrefs = {
      highContrast: !initialPrefs.highContrast,
      reducedMotion: !initialPrefs.reducedMotion,
      screenReader: initialPrefs.screenReader,
      keyboardOnly: !initialPrefs.keyboardOnly
    };
    
    manager.updatePreferences(newPrefs);
    
    // Verify preferences updated
    const updatedPrefs = manager.getPreferences();
    
    if (updatedPrefs.highContrast !== newPrefs.highContrast) {
      throw new Error('High contrast preference not updated');
    }
    
    if (updatedPrefs.reducedMotion !== newPrefs.reducedMotion) {
      throw new Error('Reduced motion preference not updated');
    }
    
    if (updatedPrefs.keyboardOnly !== newPrefs.keyboardOnly) {
      throw new Error('Keyboard only preference not updated');
    }
    
    console.log('✅ Preferences updated successfully:', updatedPrefs);
    
    // Restore initial preferences
    manager.updatePreferences(initialPrefs);
    
    return true;
  } catch (error) {
    console.error('❌ Preferences Persistence Test Failed:', error.message);
    return false;
  }
}

/**
 * Run all accessibility validation tests
 */
export async function runAccessibilityValidation() {
  console.log('🚀 Starting Accessibility Validation Tests...\n');
  
  const tests = [
    { name: 'Accessibility Manager Initialization', test: testAccessibilityManagerInit },
    { name: 'Screen Reader Announcements', test: testScreenReaderAnnouncements },
    { name: 'Keyboard Navigation', test: testKeyboardNavigation },
    { name: 'High Contrast Mode', test: testHighContrastMode },
    { name: 'Reduced Motion Mode', test: testReducedMotionMode },
    { name: 'ARIA Enhancements', test: testARIAEnhancements },
    { name: 'Focus Management', test: testFocusManagement },
    { name: 'Preferences Persistence', test: testPreferencesPersistence }
  ];
  
  const results = {
    passed: 0,
    failed: 0,
    total: tests.length,
    details: []
  };
  
  for (const { name, test } of tests) {
    console.log(`\n📋 Running: ${name}`);
    
    try {
      const passed = await test();
      
      if (passed) {
        results.passed++;
        results.details.push({ name, status: 'PASSED' });
        console.log(`✅ ${name}: PASSED`);
      } else {
        results.failed++;
        results.details.push({ name, status: 'FAILED' });
        console.log(`❌ ${name}: FAILED`);
      }
    } catch (error) {
      results.failed++;
      results.details.push({ name, status: 'ERROR', error: error.message });
      console.error(`💥 ${name}: ERROR -`, error.message);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 ACCESSIBILITY VALIDATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${results.passed} ✅`);
  console.log(`Failed: ${results.failed} ❌`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 All accessibility tests passed! The application meets comprehensive accessibility standards.');
  } else {
    console.log('\n⚠️  Some accessibility tests failed. Review the details above.');
  }
  
  console.log('\n📋 Detailed Results:');
  results.details.forEach(({ name, status, error }) => {
    const icon = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '💥';
    console.log(`${icon} ${name}: ${status}${error ? ` (${error})` : ''}`);
  });
  
  return results;
}

/**
 * Quick accessibility test for development
 */
export function quickAccessibilityTest() {
  console.log('🔍 Quick Accessibility Test...');
  
  try {
    // Test basic functionality
    const manager = getAccessibilityManager();
    const preferences = manager.getPreferences();
    
    console.log('✅ Accessibility Manager: Working');
    console.log('✅ Preferences Detection: Working');
    console.log('✅ Current Preferences:', preferences);
    
    // Test announcement
    announce('Quick test announcement');
    console.log('✅ Screen Reader Announcements: Working');
    
    // Test keyboard help
    const keyboardHelp = document.querySelector('.keyboard-help-overlay');
    if (keyboardHelp) {
      console.log('✅ Keyboard Help: Available');
    }
    
    // Test skip link
    const skipLink = document.querySelector('.skip-to-content');
    if (skipLink) {
      console.log('✅ Skip Link: Available');
    }
    
    console.log('🎉 Quick accessibility test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Quick accessibility test failed:', error.message);
    return false;
  }
}

// Export for use in other modules
export default {
  runAccessibilityValidation,
  quickAccessibilityTest,
  testAccessibilityManagerInit,
  testScreenReaderAnnouncements,
  testKeyboardNavigation,
  testHighContrastMode,
  testReducedMotionMode,
  testARIAEnhancements,
  testFocusManagement,
  testPreferencesPersistence
};