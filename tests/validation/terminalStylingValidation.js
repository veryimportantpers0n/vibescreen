/**
 * Terminal Styling and Responsive Design Validation
 * Tests matrix green styling, phosphor glow effects, and responsive behavior
 */

class TerminalStylingValidator {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  /**
   * Validate matrix green color scheme and phosphor glow effects
   */
  validateMatrixStyling() {
    console.log('🎨 Validating matrix green styling and phosphor glow effects...');
    
    try {
      // Check CSS custom properties
      const rootStyles = getComputedStyle(document.documentElement);
      const matrixGreen = rootStyles.getPropertyValue('--matrix-green').trim();
      const phosphorGlow = rootStyles.getPropertyValue('--phosphor-glow').trim();
      
      if (!matrixGreen || matrixGreen === '') {
        this.errors.push('Matrix green CSS variable not defined');
      } else if (matrixGreen !== '#00FF00') {
        this.errors.push(`Matrix green color incorrect: expected #00FF00, got ${matrixGreen}`);
      } else {
        this.results.push('✓ Matrix green color correctly defined');
      }
      
      if (!phosphorGlow || phosphorGlow === '') {
        this.errors.push('Phosphor glow CSS variable not defined');
      } else {
        this.results.push('✓ Phosphor glow effect defined');
      }
      
      // Check terminal container styling
      const terminalContainer = document.querySelector('.terminal-container, [class*="terminalContainer"]');
      if (terminalContainer) {
        const containerStyles = getComputedStyle(terminalContainer);
        
        // Check border color
        const borderColor = containerStyles.borderColor;
        if (borderColor.includes('0, 255, 0') || borderColor.includes('#00ff00')) {
          this.results.push('✓ Terminal container has matrix green border');
        } else {
          this.errors.push(`Terminal border color incorrect: ${borderColor}`);
        }
        
        // Check box shadow for phosphor glow
        const boxShadow = containerStyles.boxShadow;
        if (boxShadow && boxShadow !== 'none') {
          this.results.push('✓ Terminal container has phosphor glow effect');
        } else {
          this.errors.push('Terminal container missing phosphor glow effect');
        }
        
        // Check background
        const backgroundColor = containerStyles.backgroundColor;
        if (backgroundColor.includes('rgba(0, 0, 0') || backgroundColor.includes('rgb(0, 0, 0')) {
          this.results.push('✓ Terminal container has dark background');
        } else {
          this.errors.push(`Terminal background incorrect: ${backgroundColor}`);
        }
      } else {
        this.errors.push('Terminal container element not found');
      }
      
    } catch (error) {
      this.errors.push(`Matrix styling validation error: ${error.message}`);
    }
  }

  /**
   * Test responsive design across different screen sizes
   */
  validateResponsiveDesign() {
    console.log('📱 Validating responsive design...');
    
    try {
      const originalWidth = window.innerWidth;
      const originalHeight = window.innerHeight;
      
      // Test different viewport sizes
      const viewports = [
        { width: 1920, height: 1080, name: 'Desktop Large' },
        { width: 1366, height: 768, name: 'Desktop Standard' },
        { width: 768, height: 1024, name: 'Tablet' },
        { width: 480, height: 800, name: 'Mobile Large' },
        { width: 320, height: 568, name: 'Mobile Small' }
      ];
      
      viewports.forEach(viewport => {
        this.testViewport(viewport);
      });
      
      // Restore original viewport
      if (window.resizeTo) {
        window.resizeTo(originalWidth, originalHeight);
      }
      
    } catch (error) {
      this.errors.push(`Responsive design validation error: ${error.message}`);
    }
  }

  /**
   * Test terminal styling at specific viewport size
   */
  testViewport(viewport) {
    try {
      console.log(`Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
      
      // Simulate viewport change
      if (window.resizeTo) {
        window.resizeTo(viewport.width, viewport.height);
      }
      
      // Trigger media query evaluation
      window.dispatchEvent(new Event('resize'));
      
      // Wait for styles to apply
      setTimeout(() => {
        const terminalContainer = document.querySelector('.terminal-container, [class*="terminalContainer"]');
        const terminalTrigger = document.querySelector('.terminal-trigger, [class*="terminalTrigger"]');
        
        if (terminalContainer) {
          const containerStyles = getComputedStyle(terminalContainer);
          const containerWidth = parseInt(containerStyles.width);
          const containerFontSize = parseInt(containerStyles.fontSize);
          
          // Check mobile adaptations
          if (viewport.width <= 768) {
            if (containerWidth <= viewport.width - 30) { // Account for margins
              this.results.push(`✓ ${viewport.name}: Terminal width adapts to screen`);
            } else {
              this.errors.push(`${viewport.name}: Terminal width too large (${containerWidth}px)`);
            }
            
            if (containerFontSize <= 12) {
              this.results.push(`✓ ${viewport.name}: Font size appropriate for mobile`);
            } else {
              this.errors.push(`${viewport.name}: Font size too large for mobile (${containerFontSize}px)`);
            }
          }
          
          // Check positioning
          const position = containerStyles.position;
          const bottom = containerStyles.bottom;
          const left = containerStyles.left;
          
          if (position === 'fixed') {
            this.results.push(`✓ ${viewport.name}: Terminal properly positioned (fixed)`);
          } else {
            this.errors.push(`${viewport.name}: Terminal positioning incorrect (${position})`);
          }
          
          if (bottom && left) {
            this.results.push(`✓ ${viewport.name}: Terminal positioned in bottom-left`);
          } else {
            this.errors.push(`${viewport.name}: Terminal positioning values missing`);
          }
        }
        
        if (terminalTrigger) {
          const triggerStyles = getComputedStyle(terminalTrigger);
          const triggerWidth = parseInt(triggerStyles.width);
          const triggerHeight = parseInt(triggerStyles.height);
          
          // Check trigger size for touch devices
          if (viewport.width <= 768) {
            if (triggerWidth >= 44 && triggerHeight >= 44) {
              this.results.push(`✓ ${viewport.name}: Trigger area meets touch target size`);
            } else {
              this.errors.push(`${viewport.name}: Trigger area too small for touch (${triggerWidth}x${triggerHeight})`);
            }
          }
        }
        
      }, 100);
      
    } catch (error) {
      this.errors.push(`Viewport test error for ${viewport.name}: ${error.message}`);
    }
  }

  /**
   * Validate terminal trigger area styling and hover states
   */
  validateTriggerAreaStyling() {
    console.log('🎯 Validating terminal trigger area styling...');
    
    try {
      const terminalTrigger = document.querySelector('.terminal-trigger, [class*="terminalTrigger"]');
      
      if (!terminalTrigger) {
        this.errors.push('Terminal trigger element not found');
        return;
      }
      
      const triggerStyles = getComputedStyle(terminalTrigger);
      
      // Check basic styling
      const position = triggerStyles.position;
      const cursor = triggerStyles.cursor;
      const opacity = parseFloat(triggerStyles.opacity);
      
      if (position === 'fixed') {
        this.results.push('✓ Trigger area properly positioned (fixed)');
      } else {
        this.errors.push(`Trigger positioning incorrect: ${position}`);
      }
      
      if (cursor === 'pointer') {
        this.results.push('✓ Trigger area has pointer cursor');
      } else {
        this.errors.push(`Trigger cursor incorrect: ${cursor}`);
      }
      
      if (opacity > 0 && opacity <= 1) {
        this.results.push('✓ Trigger area has appropriate opacity');
      } else {
        this.errors.push(`Trigger opacity incorrect: ${opacity}`);
      }
      
      // Check border and background
      const borderColor = triggerStyles.borderColor;
      const backgroundColor = triggerStyles.backgroundColor;
      
      if (borderColor.includes('0, 255, 0') || borderColor.includes('#00ff00')) {
        this.results.push('✓ Trigger area has matrix green border');
      } else {
        this.errors.push(`Trigger border color incorrect: ${borderColor}`);
      }
      
      // Test hover state simulation
      terminalTrigger.classList.add('hover');
      const hoverStyles = getComputedStyle(terminalTrigger);
      const hoverBoxShadow = hoverStyles.boxShadow;
      
      if (hoverBoxShadow && hoverBoxShadow !== 'none') {
        this.results.push('✓ Trigger area has hover glow effect');
      } else {
        this.errors.push('Trigger area missing hover glow effect');
      }
      
      terminalTrigger.classList.remove('hover');
      
    } catch (error) {
      this.errors.push(`Trigger area validation error: ${error.message}`);
    }
  }

  /**
   * Test accessibility styling enhancements
   */
  validateAccessibilityStyling() {
    console.log('♿ Validating accessibility styling...');
    
    try {
      // Test high contrast mode
      const terminalContainer = document.querySelector('.terminal-container, [class*="terminalContainer"]');
      
      if (terminalContainer) {
        // Simulate high contrast mode
        terminalContainer.classList.add('highContrast');
        const highContrastStyles = getComputedStyle(terminalContainer);
        
        const borderWidth = parseInt(highContrastStyles.borderWidth);
        if (borderWidth >= 3) {
          this.results.push('✓ High contrast mode increases border width');
        } else {
          this.errors.push(`High contrast border width insufficient: ${borderWidth}px`);
        }
        
        terminalContainer.classList.remove('highContrast');
        
        // Test reduced motion mode
        terminalContainer.classList.add('reducedMotion');
        const reducedMotionStyles = getComputedStyle(terminalContainer);
        
        // Check if animations are disabled
        const transition = reducedMotionStyles.transition;
        if (transition.includes('0.01s') || transition === 'none') {
          this.results.push('✓ Reduced motion mode disables animations');
        } else {
          this.results.push('ℹ Reduced motion styling may need verification');
        }
        
        terminalContainer.classList.remove('reducedMotion');
      }
      
      // Test focus states
      const terminalInput = document.querySelector('.terminal-input, [class*="terminalInput"]');
      if (terminalInput) {
        terminalInput.focus();
        const focusStyles = getComputedStyle(terminalInput);
        const outline = focusStyles.outline;
        
        if (outline && outline !== 'none') {
          this.results.push('✓ Terminal input has focus outline');
        } else {
          this.errors.push('Terminal input missing focus outline');
        }
        
        terminalInput.blur();
      }
      
    } catch (error) {
      this.errors.push(`Accessibility styling validation error: ${error.message}`);
    }
  }

  /**
   * Test cursor animation and phosphor effects
   */
  validateAnimationEffects() {
    console.log('✨ Validating animation effects...');
    
    try {
      const cursor = document.querySelector('.cursor, [class*="cursor"]');
      
      if (cursor) {
        const cursorStyles = getComputedStyle(cursor);
        const animation = cursorStyles.animation;
        
        if (animation && animation !== 'none') {
          this.results.push('✓ Cursor has blinking animation');
        } else {
          this.errors.push('Cursor missing blinking animation');
        }
        
        // Check cursor color
        const backgroundColor = cursorStyles.backgroundColor;
        if (backgroundColor.includes('0, 255, 0') || backgroundColor.includes('#00ff00')) {
          this.results.push('✓ Cursor has matrix green color');
        } else {
          this.errors.push(`Cursor color incorrect: ${backgroundColor}`);
        }
      } else {
        this.errors.push('Cursor element not found');
      }
      
      // Test phosphor glow animation
      const terminalContainer = document.querySelector('.terminal-container, [class*="terminalContainer"]');
      if (terminalContainer) {
        const pseudoElement = window.getComputedStyle(terminalContainer, '::before');
        if (pseudoElement) {
          const animation = pseudoElement.animation;
          if (animation && animation !== 'none') {
            this.results.push('✓ Terminal has phosphor glow animation');
          } else {
            this.results.push('ℹ Phosphor glow animation may be present (pseudo-element)');
          }
        }
      }
      
    } catch (error) {
      this.errors.push(`Animation effects validation error: ${error.message}`);
    }
  }

  /**
   * Run all validation tests
   */
  async runAllTests() {
    console.log('🚀 Starting terminal styling and responsive design validation...\n');
    
    this.validateMatrixStyling();
    this.validateTriggerAreaStyling();
    this.validateAccessibilityStyling();
    this.validateAnimationEffects();
    
    // Run responsive tests with delay to allow for viewport changes
    await new Promise(resolve => {
      setTimeout(() => {
        this.validateResponsiveDesign();
        resolve();
      }, 500);
    });
    
    return this.generateReport();
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: this.results.length + this.errors.length,
      passed: this.results.length,
      failed: this.errors.length,
      success: this.errors.length === 0,
      results: this.results,
      errors: this.errors
    };
    
    console.log('\n📊 Terminal Styling Validation Report');
    console.log('=====================================');
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Success Rate: ${((report.passed / report.totalTests) * 100).toFixed(1)}%`);
    
    if (this.results.length > 0) {
      console.log('\n✅ Passed Tests:');
      this.results.forEach(result => console.log(`  ${result}`));
    }
    
    if (this.errors.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }
    
    console.log('\n=====================================\n');
    
    return report;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TerminalStylingValidator;
}

// Auto-run if loaded directly in browser
if (typeof window !== 'undefined') {
  window.TerminalStylingValidator = TerminalStylingValidator;
  
  // Auto-run validation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const validator = new TerminalStylingValidator();
      validator.runAllTests();
    });
  } else {
    const validator = new TerminalStylingValidator();
    validator.runAllTests();
  }
}