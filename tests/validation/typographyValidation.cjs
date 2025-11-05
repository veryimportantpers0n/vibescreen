/**
 * Typography Enhancement Validation Test
 * Tests the implementation of Source Code Pro font and enhanced typography system
 */

const fs = require('fs');
const path = require('path');

class TypographyValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  test(description, condition) {
    const result = {
      description,
      passed: condition,
      timestamp: new Date().toISOString()
    };
    
    this.results.tests.push(result);
    
    if (condition) {
      this.results.passed++;
      console.log(`✓ ${description}`);
    } else {
      this.results.failed++;
      console.log(`✗ ${description}`);
    }
    
    return condition;
  }

  async validateTypographyImplementation() {
    console.log('🔤 Typography Enhancement Validation');
    console.log('=====================================\n');

    // Test 1: Source Code Pro font import
    const globalsCSS = fs.readFileSync(path.join(__dirname, '..', '..', 'styles/globals.css'), 'utf8');
    this.test(
      'Source Code Pro font is imported via Google Fonts',
      globalsCSS.includes('Source+Code+Pro') && globalsCSS.includes('fonts.googleapis.com')
    );

    // Test 2: Font terminal variable includes Source Code Pro
    this.test(
      'Font terminal variable includes Source Code Pro as primary font',
      globalsCSS.includes("--font-terminal: 'Source Code Pro'")
    );

    // Test 3: Comprehensive typography scale
    const fontSizeVariables = [
      '--font-size-xs',
      '--font-size-sm', 
      '--font-size-base',
      '--font-size-md',
      '--font-size-lg',
      '--font-size-xl',
      '--font-size-xxl',
      '--font-size-title',
      '--font-size-display'
    ];
    
    const hasAllFontSizes = fontSizeVariables.every(variable => 
      globalsCSS.includes(variable) && globalsCSS.includes(`${variable}: clamp(`)
    );
    
    this.test(
      'Comprehensive responsive typography scale with clamp() functions',
      hasAllFontSizes
    );

    // Test 4: Font weight variables
    const fontWeightVariables = [
      '--font-weight-light',
      '--font-weight-normal',
      '--font-weight-medium',
      '--font-weight-semibold',
      '--font-weight-bold',
      '--font-weight-extrabold'
    ];
    
    const hasAllFontWeights = fontWeightVariables.every(variable => 
      globalsCSS.includes(variable)
    );
    
    this.test(
      'Complete font weight scale defined',
      hasAllFontWeights
    );

    // Test 5: Letter spacing variables
    const letterSpacingVariables = [
      '--letter-spacing-tight',
      '--letter-spacing-normal',
      '--letter-spacing-wide',
      '--letter-spacing-wider',
      '--letter-spacing-widest'
    ];
    
    const hasAllLetterSpacing = letterSpacingVariables.every(variable => 
      globalsCSS.includes(variable)
    );
    
    this.test(
      'Letter spacing scale for terminal typography',
      hasAllLetterSpacing
    );

    // Test 6: Line height variables
    const lineHeightVariables = [
      '--line-height-tight',
      '--line-height-normal',
      '--line-height-relaxed',
      '--line-height-loose'
    ];
    
    const hasAllLineHeights = lineHeightVariables.every(variable => 
      globalsCSS.includes(variable)
    );
    
    this.test(
      'Line height scale for optimal readability',
      hasAllLineHeights
    );

    // Test 7: Text shadow variables for terminal effects
    const textShadowVariables = [
      '--text-shadow-subtle',
      '--text-shadow-normal',
      '--text-shadow-strong',
      '--text-shadow-intense'
    ];
    
    const hasAllTextShadows = textShadowVariables.every(variable => 
      globalsCSS.includes(variable)
    );
    
    this.test(
      'Text shadow variables for phosphor glow effects',
      hasAllTextShadows
    );

    // Test 8: Enhanced heading typography
    this.test(
      'Headings use enhanced typography with proper hierarchy',
      globalsCSS.includes('font-feature-settings') && 
      globalsCSS.includes('text-rendering: optimizeLegibility') &&
      globalsCSS.includes('h1 {') &&
      globalsCSS.includes('font-size: var(--font-size-display)')
    );

    // Test 9: Typography utility classes
    const typographyUtilities = [
      '.text-xs',
      '.text-sm',
      '.text-base',
      '.text-md',
      '.text-lg',
      '.text-xl',
      '.text-xxl',
      '.text-title',
      '.text-display'
    ];
    
    const hasTypographyUtilities = typographyUtilities.every(utility => 
      globalsCSS.includes(utility)
    );
    
    this.test(
      'Typography utility classes available',
      hasTypographyUtilities
    );

    // Test 10: Component-specific typography classes
    const componentClasses = [
      '.app-title',
      '.app-subtitle',
      '.terminal-text',
      '.terminal-text-bold',
      '.terminal-text-dim',
      '.terminal-text-bright',
      '.message-text',
      '.button-text',
      '.label-text',
      '.status-text'
    ];
    
    const hasComponentClasses = componentClasses.every(className => 
      globalsCSS.includes(className)
    );
    
    this.test(
      'Component-specific typography classes defined',
      hasComponentClasses
    );

    // Test 11: Terminal interface typography
    const terminalCSS = fs.readFileSync(path.join(__dirname, '..', '..', 'styles/terminal-interface.module.css'), 'utf8');
    this.test(
      'Terminal interface uses enhanced typography variables',
      terminalCSS.includes('var(--font-terminal)') &&
      terminalCSS.includes('var(--font-size-') &&
      terminalCSS.includes('var(--font-weight-') &&
      terminalCSS.includes('var(--letter-spacing-') &&
      terminalCSS.includes('var(--text-shadow-')
    );

    // Test 12: Mode themes typography
    const modeThemesCSS = fs.readFileSync(path.join(__dirname, '..', '..', 'styles/modeThemes.css'), 'utf8');
    this.test(
      'Mode selector buttons use enhanced typography',
      modeThemesCSS.includes('font-size: var(--font-size-sm)') &&
      modeThemesCSS.includes('font-weight: var(--font-weight-normal)') &&
      modeThemesCSS.includes('letter-spacing: var(--letter-spacing-wide)')
    );

    // Test 13: High contrast typography support
    this.test(
      'High contrast mode has enhanced typography support',
      globalsCSS.includes('@media (prefers-contrast: high)') &&
      globalsCSS.includes('--font-weight-extrabold: 900') &&
      globalsCSS.includes('text-shadow: none')
    );

    // Test 14: Reduced motion typography support
    this.test(
      'Reduced motion preferences disable typography animations',
      globalsCSS.includes('@media (prefers-reduced-motion: reduce)') &&
      globalsCSS.includes('.text-glow-') &&
      globalsCSS.includes('text-shadow: none !important')
    );

    // Test 15: Responsive typography scaling
    this.test(
      'Mobile responsive typography scaling implemented',
      globalsCSS.includes('@media (max-width: 768px)') &&
      globalsCSS.includes('--font-size-xs: clamp(7px') &&
      globalsCSS.includes('--letter-spacing-wide: 0.02em')
    );

    console.log('\n📊 Typography Validation Results');
    console.log('================================');
    console.log(`✓ Passed: ${this.results.passed}`);
    console.log(`✗ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.failed === 0) {
      console.log('\n🎉 All typography enhancement tests passed!');
      console.log('✨ Source Code Pro font and enhanced typography system successfully implemented');
    } else {
      console.log('\n⚠️  Some typography tests failed. Please review the implementation.');
    }

    return this.results;
  }

  generateReport() {
    const report = {
      summary: {
        total: this.results.passed + this.results.failed,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)
      },
      tests: this.results.tests,
      timestamp: new Date().toISOString(),
      implementation: {
        sourceCodePro: true,
        responsiveTypography: true,
        typographyScale: true,
        accessibilitySupport: true,
        componentIntegration: true
      }
    };

    return report;
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new TypographyValidator();
  validator.validateTypographyImplementation()
    .then(results => {
      // Save results to file
      const report = validator.generateReport();
      fs.writeFileSync(
        path.join(__dirname, 'typography-validation-report.json'),
        JSON.stringify(report, null, 2)
      );
      
      process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('Typography validation failed:', error);
      process.exit(1);
    });
}

module.exports = TypographyValidator;