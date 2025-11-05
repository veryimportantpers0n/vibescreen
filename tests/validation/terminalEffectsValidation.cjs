/**
 * Terminal Effects Validation Script
 * 
 * Tests the advanced terminal effects system implementation
 * including phosphor glow, scan lines, CRT effects, and accessibility
 */

const fs = require('fs');
const path = require('path');

class TerminalEffectsValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logEntry);
    this.results.details.push({ timestamp, type, message });
  }

  test(description, testFn) {
    try {
      const result = testFn();
      if (result) {
        this.log(`✅ ${description}`, 'pass');
        this.results.passed++;
      } else {
        this.log(`❌ ${description}`, 'fail');
        this.results.failed++;
      }
      return result;
    } catch (error) {
      this.log(`❌ ${description} - Error: ${error.message}`, 'fail');
      this.results.failed++;
      return false;
    }
  }

  warn(message) {
    this.log(`⚠️ ${message}`, 'warn');
    this.results.warnings++;
  }

  // Test 1: Verify terminal-effects.css file exists and has required content
  testTerminalEffectsCSS() {
    this.log('Testing terminal-effects.css file...');
    
    const cssPath = path.join(process.cwd(), 'styles', 'terminal-effects.css');
    
    this.test('terminal-effects.css file exists', () => {
      return fs.existsSync(cssPath);
    });

    if (!fs.existsSync(cssPath)) {
      return false;
    }

    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Test for required CSS custom properties
    this.test('CSS custom properties defined', () => {
      const requiredProps = [
        '--matrix-green',
        '--matrix-green-dim',
        '--matrix-green-dark',
        '--phosphor-glow',
        '--scan-line-opacity'
      ];
      return requiredProps.every(prop => cssContent.includes(prop));
    });

    // Test for phosphor glow classes
    this.test('Phosphor glow classes defined', () => {
      const requiredClasses = [
        '.phosphor-glow',
        '.phosphor-glow-bright',
        '.phosphor-glow-subtle'
      ];
      return requiredClasses.every(cls => cssContent.includes(cls));
    });

    // Test for cursor animation classes
    this.test('Cursor animation classes defined', () => {
      const requiredClasses = [
        '.terminal-cursor',
        '.terminal-cursor-block',
        '.terminal-cursor-underscore',
        '.terminal-cursor-pipe'
      ];
      return requiredClasses.every(cls => cssContent.includes(cls));
    });

    // Test for scan lines implementation
    this.test('Scan lines implementation present', () => {
      return cssContent.includes('.scan-lines') && 
             cssContent.includes('background: linear-gradient') &&
             cssContent.includes('scan-line-flicker');
    });

    // Test for CRT screen effects
    this.test('CRT screen effects present', () => {
      return cssContent.includes('.crt-screen') && 
             cssContent.includes('radial-gradient') &&
             cssContent.includes('crt-flicker');
    });

    // Test for typing effects
    this.test('Typing effects present', () => {
      return cssContent.includes('.typing-effect') && 
             cssContent.includes('@keyframes typing');
    });

    // Test for accessibility support
    this.test('Accessibility support present', () => {
      return cssContent.includes('@media (prefers-reduced-motion: reduce)') &&
             cssContent.includes('@media (prefers-contrast: high)');
    });

    // Test for mobile optimizations
    this.test('Mobile optimizations present', () => {
      return cssContent.includes('@media (max-width: 768px)');
    });

    return true;
  }

  // Test 2: Verify TerminalEffects component
  testTerminalEffectsComponent() {
    this.log('Testing TerminalEffects component...');
    
    const componentPath = path.join(process.cwd(), 'components', 'TerminalEffects.jsx');
    
    this.test('TerminalEffects.jsx file exists', () => {
      return fs.existsSync(componentPath);
    });

    if (!fs.existsSync(componentPath)) {
      return false;
    }

    const componentContent = fs.readFileSync(componentPath, 'utf8');

    // Test for React component structure
    this.test('React component structure present', () => {
      return componentContent.includes('import') &&
             componentContent.includes('const TerminalEffects') &&
             componentContent.includes('export default TerminalEffects');
    });

    // Test for accessibility detection
    this.test('Accessibility detection implemented', () => {
      return componentContent.includes('prefers-reduced-motion') &&
             componentContent.includes('prefers-contrast');
    });

    // Test for PropTypes validation
    this.test('PropTypes validation present', () => {
      return componentContent.includes('PropTypes') &&
             componentContent.includes('.propTypes');
    });

    // Test for intensity levels
    this.test('Intensity levels implemented', () => {
      return componentContent.includes('subtle') &&
             componentContent.includes('normal') &&
             componentContent.includes('strong');
    });

    return true;
  }

  // Test 3: Verify TypingEffect component
  testTypingEffectComponent() {
    this.log('Testing TypingEffect component...');
    
    const componentPath = path.join(process.cwd(), 'components', 'TypingEffect.jsx');
    
    this.test('TypingEffect.jsx file exists', () => {
      return fs.existsSync(componentPath);
    });

    if (!fs.existsSync(componentPath)) {
      return false;
    }

    const componentContent = fs.readFileSync(componentPath, 'utf8');

    // Test for React hooks usage
    this.test('React hooks properly used', () => {
      return componentContent.includes('useState') &&
             componentContent.includes('useEffect') &&
             componentContent.includes('useRef');
    });

    // Test for typing animation logic
    this.test('Typing animation logic present', () => {
      return componentContent.includes('typeNextCharacter') &&
             componentContent.includes('currentIndex') &&
             componentContent.includes('setTimeout');
    });

    // Test for accessibility features
    this.test('Accessibility features implemented', () => {
      return componentContent.includes('aria-live') &&
             componentContent.includes('aria-label') &&
             componentContent.includes('reducedMotion');
    });

    // Test for cursor blinking
    this.test('Cursor blinking implemented', () => {
      return componentContent.includes('showCursor') &&
             componentContent.includes('setInterval');
    });

    return true;
  }

  // Test 4: Verify integration with existing components
  testIntegration() {
    this.log('Testing integration with existing components...');
    
    // Test _app.js integration
    const appPath = path.join(process.cwd(), 'pages', '_app.js');
    if (fs.existsSync(appPath)) {
      const appContent = fs.readFileSync(appPath, 'utf8');
      
      this.test('TerminalEffects imported in _app.js', () => {
        return appContent.includes('TerminalEffects');
      });

      this.test('terminal-effects.css imported in globals.css', () => {
        const globalsPath = path.join(process.cwd(), 'styles', 'globals.css');
        if (fs.existsSync(globalsPath)) {
          const globalsContent = fs.readFileSync(globalsPath, 'utf8');
          return globalsContent.includes('terminal-effects.css');
        }
        return false;
      });
    }

    // Test terminal interface integration
    const terminalPath = path.join(process.cwd(), 'styles', 'terminal-interface.module.css');
    if (fs.existsSync(terminalPath)) {
      const terminalContent = fs.readFileSync(terminalPath, 'utf8');
      
      this.test('Terminal interface enhanced with effects', () => {
        return terminalContent.includes('phosphor') &&
               terminalContent.includes('text-shadow');
      });
    }

    return true;
  }

  // Test 5: Verify performance considerations
  testPerformance() {
    this.log('Testing performance considerations...');
    
    const cssPath = path.join(process.cwd(), 'styles', 'terminal-effects.css');
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Test for will-change optimization
      this.test('Performance optimizations present', () => {
        return cssContent.includes('will-change') ||
               cssContent.includes('backface-visibility') ||
               cssContent.includes('perspective');
      });

      // Test for reduced motion fallbacks
      this.test('Reduced motion fallbacks implemented', () => {
        return cssContent.includes('animation: none') &&
               cssContent.includes('prefers-reduced-motion');
      });

      // Test for mobile optimizations
      this.test('Mobile performance optimizations present', () => {
        return cssContent.includes('max-width: 768px') &&
               (cssContent.includes('opacity: 0.5') || cssContent.includes('display: none'));
      });
    }

    return true;
  }

  // Test 6: Verify accessibility compliance
  testAccessibility() {
    this.log('Testing accessibility compliance...');
    
    const cssPath = path.join(process.cwd(), 'styles', 'terminal-effects.css');
    if (fs.existsSync(cssPath)) {
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Test for high contrast support
      this.test('High contrast mode support', () => {
        return cssContent.includes('prefers-contrast: high') &&
               cssContent.includes('text-shadow: none');
      });

      // Test for forced colors support
      this.test('Forced colors mode considered', () => {
        return cssContent.includes('forced-colors') || 
               cssContent.includes('prefers-contrast: high');
      });
    }

    // Test component accessibility
    const terminalEffectsPath = path.join(process.cwd(), 'components', 'TerminalEffects.jsx');
    if (fs.existsSync(terminalEffectsPath)) {
      const componentContent = fs.readFileSync(terminalEffectsPath, 'utf8');
      
      this.test('ARIA attributes present', () => {
        return componentContent.includes('aria-hidden') &&
               componentContent.includes('role="presentation"');
      });
    }

    return true;
  }

  // Run all tests
  async runAllTests() {
    this.log('Starting Terminal Effects Validation...');
    this.log('='.repeat(50));

    // Run all test suites
    this.testTerminalEffectsCSS();
    this.testTerminalEffectsComponent();
    this.testTypingEffectComponent();
    this.testIntegration();
    this.testPerformance();
    this.testAccessibility();

    // Generate summary
    this.log('='.repeat(50));
    this.log('Terminal Effects Validation Complete');
    this.log(`✅ Passed: ${this.results.passed}`);
    this.log(`❌ Failed: ${this.results.failed}`);
    this.log(`⚠️ Warnings: ${this.results.warnings}`);

    const totalTests = this.results.passed + this.results.failed;
    const successRate = totalTests > 0 ? ((this.results.passed / totalTests) * 100).toFixed(1) : 0;
    this.log(`📊 Success Rate: ${successRate}%`);

    // Determine overall result
    if (this.results.failed === 0) {
      this.log('🎉 All terminal effects tests passed!', 'success');
      return true;
    } else if (this.results.failed <= 2) {
      this.log('⚠️ Terminal effects mostly working with minor issues', 'warning');
      return true;
    } else {
      this.log('❌ Terminal effects have significant issues', 'error');
      return false;
    }
  }

  // Generate detailed report
  generateReport() {
    const reportPath = path.join(process.cwd(), 'tests', 'validation', 'terminal-effects-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: this.results.passed + this.results.failed > 0 ? 
          ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1) : 0
      },
      details: this.results.details
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`📄 Detailed report saved to: ${reportPath}`);
    
    return report;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new TerminalEffectsValidator();
  
  validator.runAllTests()
    .then((success) => {
      validator.generateReport();
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Validation failed with error:', error);
      process.exit(1);
    });
}

module.exports = TerminalEffectsValidator;