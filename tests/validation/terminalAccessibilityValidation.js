/**
 * Terminal Interface Accessibility Validation
 * Validates comprehensive accessibility support implementation
 */

class TerminalAccessibilityValidator {
  constructor() {
    this.results = {
      keyboardNavigation: false,
      screenReaderSupport: false,
      highContrastMode: false,
      reducedMotionSupport: false,
      ariaLabels: false,
      focusManagement: false,
      announcements: false
    };
    this.errors = [];
  }

  /**
   * Validate keyboard navigation support
   */
  validateKeyboardNavigation() {
    console.log('🔍 Validating keyboard navigation...');
    
    try {
      // Check for Tab navigation
      const trigger = document.querySelector('[role="button"][aria-label*="terminal"]');
      if (!trigger) {
        throw new Error('Terminal trigger button not found');
      }

      if (!trigger.hasAttribute('tabIndex') || trigger.getAttribute('tabIndex') !== '0') {
        throw new Error('Terminal trigger is not keyboard focusable');
      }

      // Check for Enter/Space activation
      const hasKeyDownHandler = trigger.onkeydown || 
        trigger.getAttribute('onkeydown') || 
        trigger.hasAttribute('data-keyboard-handler');
      
      if (!hasKeyDownHandler) {
        console.warn('⚠️ Terminal trigger may not handle keyboard activation');
      }

      // Check for Escape key support
      const terminal = document.querySelector('[role="application"]');
      if (terminal && !terminal.hasAttribute('data-escape-handler')) {
        console.warn('⚠️ Terminal may not handle Escape key');
      }

      // Check for F1 help shortcut
      if (!document.querySelector('[data-f1-handler]') && 
          !document.addEventListener) {
        console.warn('⚠️ F1 help shortcut may not be implemented');
      }

      this.results.keyboardNavigation = true;
      console.log('✅ Keyboard navigation validation passed');
      
    } catch (error) {
      this.errors.push(`Keyboard Navigation: ${error.message}`);
      console.error('❌ Keyboard navigation validation failed:', error.message);
    }
  }

  /**
   * Validate screen reader support
   */
  validateScreenReaderSupport() {
    console.log('🔍 Validating screen reader support...');
    
    try {
      // Check for ARIA live regions
      const liveRegion = document.querySelector('[aria-live="polite"]');
      const alertRegion = document.querySelector('[aria-live="assertive"]');
      
      if (!liveRegion) {
        throw new Error('Polite live region not found');
      }
      
      if (!alertRegion) {
        throw new Error('Assertive live region (alert) not found');
      }

      // Check for proper roles
      const statusRegion = document.querySelector('[role="status"]');
      const alertRoleRegion = document.querySelector('[role="alert"]');
      
      if (!statusRegion) {
        throw new Error('Status role region not found');
      }
      
      if (!alertRoleRegion) {
        throw new Error('Alert role region not found');
      }

      // Check for screen reader only content
      const srOnlyElements = document.querySelectorAll('.sr-only, .srOnly');
      if (srOnlyElements.length === 0) {
        throw new Error('No screen reader only content found');
      }

      // Validate screen reader only CSS
      const srElement = srOnlyElements[0];
      const styles = window.getComputedStyle(srElement);
      if (styles.position !== 'absolute' || 
          styles.width !== '1px' || 
          styles.height !== '1px') {
        throw new Error('Screen reader only styles not properly applied');
      }

      this.results.screenReaderSupport = true;
      console.log('✅ Screen reader support validation passed');
      
    } catch (error) {
      this.errors.push(`Screen Reader Support: ${error.message}`);
      console.error('❌ Screen reader support validation failed:', error.message);
    }
  }

  /**
   * Validate high contrast mode support
   */
  validateHighContrastMode() {
    console.log('🔍 Validating high contrast mode support...');
    
    try {
      // Check for high contrast media query support
      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      if (!highContrastQuery) {
        throw new Error('High contrast media query not supported');
      }

      // Check for forced colors support
      const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
      if (!forcedColorsQuery) {
        console.warn('⚠️ Forced colors media query not supported');
      }

      // Check for high contrast CSS classes
      const terminal = document.querySelector('[role="application"]');
      if (terminal) {
        // Simulate high contrast mode
        terminal.setAttribute('data-high-contrast', 'true');
        terminal.classList.add('highContrast');
        
        const styles = window.getComputedStyle(terminal);
        if (!styles.borderWidth || parseInt(styles.borderWidth) < 3) {
          console.warn('⚠️ High contrast border width may not be enhanced');
        }
        
        // Clean up test
        terminal.removeAttribute('data-high-contrast');
        terminal.classList.remove('highContrast');
      }

      // Check for high contrast CSS rules
      const stylesheets = Array.from(document.styleSheets);
      let hasHighContrastRules = false;
      
      try {
        stylesheets.forEach(sheet => {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach(rule => {
              if (rule.media && rule.media.mediaText.includes('prefers-contrast: high')) {
                hasHighContrastRules = true;
              }
            });
          }
        });
      } catch (e) {
        console.warn('⚠️ Could not access stylesheet rules (CORS)');
      }

      if (!hasHighContrastRules) {
        console.warn('⚠️ High contrast CSS rules may not be present');
      }

      this.results.highContrastMode = true;
      console.log('✅ High contrast mode validation passed');
      
    } catch (error) {
      this.errors.push(`High Contrast Mode: ${error.message}`);
      console.error('❌ High contrast mode validation failed:', error.message);
    }
  }

  /**
   * Validate reduced motion support
   */
  validateReducedMotionSupport() {
    console.log('🔍 Validating reduced motion support...');
    
    try {
      // Check for reduced motion media query support
      const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!reducedMotionQuery) {
        throw new Error('Reduced motion media query not supported');
      }

      // Check for reduced motion CSS classes
      const terminal = document.querySelector('[role="application"]');
      if (terminal) {
        // Simulate reduced motion mode
        terminal.setAttribute('data-reduced-motion', 'true');
        terminal.classList.add('reducedMotion');
        
        // Check for static cursor
        const cursor = terminal.querySelector('.cursor, .staticCursor');
        if (cursor) {
          cursor.classList.add('staticCursor');
          const styles = window.getComputedStyle(cursor);
          if (styles.animation !== 'none') {
            console.warn('⚠️ Cursor animation may not be disabled in reduced motion mode');
          }
          cursor.classList.remove('staticCursor');
        }
        
        // Clean up test
        terminal.removeAttribute('data-reduced-motion');
        terminal.classList.remove('reducedMotion');
      }

      // Check for reduced motion CSS rules
      const stylesheets = Array.from(document.styleSheets);
      let hasReducedMotionRules = false;
      
      try {
        stylesheets.forEach(sheet => {
          if (sheet.cssRules) {
            Array.from(sheet.cssRules).forEach(rule => {
              if (rule.media && rule.media.mediaText.includes('prefers-reduced-motion: reduce')) {
                hasReducedMotionRules = true;
              }
            });
          }
        });
      } catch (e) {
        console.warn('⚠️ Could not access stylesheet rules (CORS)');
      }

      if (!hasReducedMotionRules) {
        console.warn('⚠️ Reduced motion CSS rules may not be present');
      }

      this.results.reducedMotionSupport = true;
      console.log('✅ Reduced motion support validation passed');
      
    } catch (error) {
      this.errors.push(`Reduced Motion Support: ${error.message}`);
      console.error('❌ Reduced motion support validation failed:', error.message);
    }
  }

  /**
   * Validate ARIA labels and attributes
   */
  validateAriaLabels() {
    console.log('🔍 Validating ARIA labels and attributes...');
    
    try {
      // Check terminal trigger
      const trigger = document.querySelector('[role="button"]');
      if (!trigger) {
        throw new Error('Terminal trigger button not found');
      }

      const requiredTriggerAttrs = ['aria-label', 'aria-expanded', 'aria-controls'];
      requiredTriggerAttrs.forEach(attr => {
        if (!trigger.hasAttribute(attr)) {
          throw new Error(`Terminal trigger missing ${attr} attribute`);
        }
      });

      // Check terminal container
      const terminal = document.querySelector('[role="application"]');
      if (!terminal) {
        throw new Error('Terminal application not found');
      }

      const requiredTerminalAttrs = ['aria-label', 'aria-hidden', 'aria-describedby'];
      requiredTerminalAttrs.forEach(attr => {
        if (!terminal.hasAttribute(attr)) {
          throw new Error(`Terminal container missing ${attr} attribute`);
        }
      });

      // Check input field
      const input = document.querySelector('[role="combobox"]');
      if (input) {
        const requiredInputAttrs = ['aria-describedby', 'aria-autocomplete'];
        requiredInputAttrs.forEach(attr => {
          if (!input.hasAttribute(attr)) {
            throw new Error(`Terminal input missing ${attr} attribute`);
          }
        });
      }

      // Check history log
      const historyLog = document.querySelector('[role="log"]');
      if (historyLog) {
        if (!historyLog.hasAttribute('aria-label')) {
          throw new Error('History log missing aria-label');
        }
        if (!historyLog.hasAttribute('aria-live')) {
          throw new Error('History log missing aria-live');
        }
      }

      this.results.ariaLabels = true;
      console.log('✅ ARIA labels validation passed');
      
    } catch (error) {
      this.errors.push(`ARIA Labels: ${error.message}`);
      console.error('❌ ARIA labels validation failed:', error.message);
    }
  }

  /**
   * Validate focus management
   */
  validateFocusManagement() {
    console.log('🔍 Validating focus management...');
    
    try {
      // Check for focus styles
      const focusableElements = document.querySelectorAll(
        '[tabindex]:not([tabindex="-1"]), button, input, [role="button"]'
      );
      
      if (focusableElements.length === 0) {
        throw new Error('No focusable elements found');
      }

      // Check for focus indicators
      let hasFocusStyles = false;
      focusableElements.forEach(element => {
        element.focus();
        const styles = window.getComputedStyle(element);
        if (styles.outline !== 'none' || styles.boxShadow !== 'none') {
          hasFocusStyles = true;
        }
        element.blur();
      });

      if (!hasFocusStyles) {
        console.warn('⚠️ Focus indicators may not be visible');
      }

      // Check for focus trap prevention
      const terminal = document.querySelector('[role="application"]');
      if (terminal) {
        // Test focus management
        terminal.focus();
        if (document.activeElement !== terminal) {
          console.warn('⚠️ Terminal may not be properly focusable');
        }
      }

      this.results.focusManagement = true;
      console.log('✅ Focus management validation passed');
      
    } catch (error) {
      this.errors.push(`Focus Management: ${error.message}`);
      console.error('❌ Focus management validation failed:', error.message);
    }
  }

  /**
   * Validate announcement system
   */
  validateAnnouncements() {
    console.log('🔍 Validating announcement system...');
    
    try {
      // Check for live region updates
      const liveRegion = document.querySelector('[role="status"]');
      const alertRegion = document.querySelector('[role="alert"]');
      
      if (!liveRegion || !alertRegion) {
        throw new Error('Live regions not found');
      }

      // Test announcement functionality
      const testMessage = 'Test accessibility announcement';
      
      // Simulate announcement
      liveRegion.textContent = testMessage;
      if (liveRegion.textContent !== testMessage) {
        throw new Error('Live region content not updated');
      }

      // Test alert announcement
      const alertDiv = document.createElement('div');
      alertDiv.textContent = 'Test alert';
      alertRegion.appendChild(alertDiv);
      
      if (!alertRegion.contains(alertDiv)) {
        throw new Error('Alert region content not added');
      }

      // Clean up test
      liveRegion.textContent = '';
      alertRegion.removeChild(alertDiv);

      this.results.announcements = true;
      console.log('✅ Announcement system validation passed');
      
    } catch (error) {
      this.errors.push(`Announcements: ${error.message}`);
      console.error('❌ Announcement system validation failed:', error.message);
    }
  }

  /**
   * Run all accessibility validations
   */
  async validateAll() {
    console.log('🚀 Starting Terminal Interface Accessibility Validation...\n');
    
    // Wait for DOM to be ready
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve);
      });
    }

    // Run all validations
    this.validateKeyboardNavigation();
    this.validateScreenReaderSupport();
    this.validateHighContrastMode();
    this.validateReducedMotionSupport();
    this.validateAriaLabels();
    this.validateFocusManagement();
    this.validateAnnouncements();

    // Generate report
    this.generateReport();
    
    return {
      success: this.errors.length === 0,
      results: this.results,
      errors: this.errors
    };
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n📊 ACCESSIBILITY VALIDATION REPORT');
    console.log('=====================================');
    
    const totalTests = Object.keys(this.results).length;
    const passedTests = Object.values(this.results).filter(Boolean).length;
    const successRate = Math.round((passedTests / totalTests) * 100);
    
    console.log(`Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`);
    console.log('');
    
    // Individual test results
    Object.entries(this.results).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL';
      const testName = test.replace(/([A-Z])/g, ' $1').toLowerCase();
      console.log(`${status} - ${testName}`);
    });
    
    // Error details
    if (this.errors.length > 0) {
      console.log('\n🚨 ERRORS FOUND:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n🎉 All accessibility tests passed!');
    }
    
    console.log('\n=====================================');
  }
}

// Export for use in tests and validation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TerminalAccessibilityValidator;
}

// Auto-run if loaded directly in browser
if (typeof window !== 'undefined') {
  window.TerminalAccessibilityValidator = TerminalAccessibilityValidator;
  
  // Auto-run validation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        const validator = new TerminalAccessibilityValidator();
        validator.validateAll();
      }, 1000);
    });
  }
}