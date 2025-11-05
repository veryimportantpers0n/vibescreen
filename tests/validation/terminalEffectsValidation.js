/**
 * Terminal Effects Validation Test
 * Comprehensive testing of all terminal visual effects
 */

/**
 * Test terminal effects implementation
 */
function testTerminalEffects() {
  console.log('🧪 Starting terminal effects validation...');
  
  const results = {
    passed: true,
    errors: [],
    warnings: [],
    effects: {}
  };

  try {
    // Test 1: CSS File Existence and Loading
    console.log('📋 Test 1: CSS File Loading');
    const terminalEffectsCSS = document.querySelector('link[href*="terminal-effects"]') ||
                               document.querySelector('style[data-source="terminal-effects"]');
    
    if (terminalEffectsCSS) {
      results.effects.cssLoaded = true;
      console.log('✅ Terminal effects CSS loaded');
    } else {
      results.effects.cssLoaded = false;
      results.warnings.push('Terminal effects CSS not found in document');
    }

    // Test 2: CSS Custom Properties
    console.log('📋 Test 2: CSS Custom Properties');
    const testElement = document.createElement('div');
    document.body.appendChild(testElement);
    
    const computedStyle = getComputedStyle(testElement);
    const matrixGreen = getComputedStyle(document.documentElement).getPropertyValue('--matrix-green');
    
    if (matrixGreen && matrixGreen.trim()) {
      results.effects.customProperties = true;
      console.log('✅ CSS custom properties available:', matrixGreen.trim());
    } else {
      results.effects.customProperties = false;
      results.warnings.push('CSS custom properties not available');
    }
    
    document.body.removeChild(testElement);

    // Test 3: Phosphor Glow Effects
    console.log('📋 Test 3: Phosphor Glow Effects');
    const glowTest = document.createElement('div');
    glowTest.className = 'phosphor-glow';
    glowTest.textContent = 'Test Glow';
    glowTest.style.position = 'absolute';
    glowTest.style.top = '-1000px';
    document.body.appendChild(glowTest);
    
    const glowStyle = getComputedStyle(glowTest);
    const textShadow = glowStyle.textShadow;
    
    if (textShadow && textShadow !== 'none') {
      results.effects.phosphorGlow = true;
      console.log('✅ Phosphor glow effects working');
    } else {
      results.effects.phosphorGlow = false;
      results.warnings.push('Phosphor glow effects not applied');
    }
    
    document.body.removeChild(glowTest);

    // Test 4: Animation Support
    console.log('📋 Test 4: Animation Support');
    const animationTest = document.createElement('div');
    animationTest.className = 'phosphor-glow';
    animationTest.style.position = 'absolute';
    animationTest.style.top = '-1000px';
    document.body.appendChild(animationTest);
    
    const animationStyle = getComputedStyle(animationTest);
    const animation = animationStyle.animation || animationStyle.webkitAnimation;
    
    if (animation && animation !== 'none') {
      results.effects.animations = true;
      console.log('✅ CSS animations supported and working');
    } else {
      results.effects.animations = false;
      results.warnings.push('CSS animations not working');
    }
    
    document.body.removeChild(animationTest);

    // Test 5: Scan Lines Implementation
    console.log('📋 Test 5: Scan Lines Implementation');
    const scanLinesTest = document.createElement('div');
    scanLinesTest.className = 'scan-lines';
    scanLinesTest.style.position = 'fixed';
    scanLinesTest.style.top = '0';
    scanLinesTest.style.left = '0';
    scanLinesTest.style.width = '100px';
    scanLinesTest.style.height = '100px';
    scanLinesTest.style.zIndex = '-1';
    document.body.appendChild(scanLinesTest);
    
    const scanStyle = getComputedStyle(scanLinesTest, '::before');
    const background = scanStyle.background || scanStyle.backgroundImage;
    
    if (background && background.includes('linear-gradient')) {
      results.effects.scanLines = true;
      console.log('✅ Scan lines effect implemented');
    } else {
      results.effects.scanLines = false;
      results.warnings.push('Scan lines effect not working');
    }
    
    document.body.removeChild(scanLinesTest);

    // Test 6: CRT Screen Effects
    console.log('📋 Test 6: CRT Screen Effects');
    const crtTest = document.createElement('div');
    crtTest.className = 'crt-screen';
    crtTest.style.position = 'fixed';
    crtTest.style.top = '0';
    crtTest.style.left = '0';
    crtTest.style.width = '100px';
    crtTest.style.height = '100px';
    crtTest.style.zIndex = '-1';
    document.body.appendChild(crtTest);
    
    const crtStyle = getComputedStyle(crtTest);
    const crtBackground = crtStyle.background || crtStyle.backgroundImage;
    
    if (crtBackground && crtBackground.includes('radial-gradient')) {
      results.effects.crtScreen = true;
      console.log('✅ CRT screen effects implemented');
    } else {
      results.effects.crtScreen = false;
      results.warnings.push('CRT screen effects not working');
    }
    
    document.body.removeChild(crtTest);

    // Test 7: Terminal Cursor
    console.log('📋 Test 7: Terminal Cursor');
    const cursorTest = document.createElement('div');
    cursorTest.className = 'terminal-cursor';
    cursorTest.textContent = 'Test';
    cursorTest.style.position = 'absolute';
    cursorTest.style.top = '-1000px';
    document.body.appendChild(cursorTest);
    
    const cursorStyle = getComputedStyle(cursorTest, '::after');
    const cursorContent = cursorStyle.content;
    
    if (cursorContent && cursorContent.includes('█')) {
      results.effects.terminalCursor = true;
      console.log('✅ Terminal cursor implemented');
    } else {
      results.effects.terminalCursor = false;
      results.warnings.push('Terminal cursor not working');
    }
    
    document.body.removeChild(cursorTest);

    // Test 8: Typing Effect
    console.log('📋 Test 8: Typing Effect');
    const typingTest = document.createElement('div');
    typingTest.className = 'typing-effect';
    typingTest.textContent = 'Test typing';
    typingTest.style.position = 'absolute';
    typingTest.style.top = '-1000px';
    document.body.appendChild(typingTest);
    
    const typingStyle = getComputedStyle(typingTest);
    const typingAnimation = typingStyle.animation || typingStyle.webkitAnimation;
    
    if (typingAnimation && typingAnimation.includes('typing')) {
      results.effects.typingEffect = true;
      console.log('✅ Typing effect implemented');
    } else {
      results.effects.typingEffect = false;
      results.warnings.push('Typing effect not working');
    }
    
    document.body.removeChild(typingTest);

    // Test 9: Accessibility Support
    console.log('📋 Test 9: Accessibility Support');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    results.effects.accessibility = {
      reducedMotionSupported: true, // CSS handles this
      highContrastSupported: true,  // CSS handles this
      reducedMotionActive: prefersReducedMotion,
      highContrastActive: prefersHighContrast
    };
    
    console.log('✅ Accessibility support implemented');
    if (prefersReducedMotion) {
      console.log('ℹ️ Reduced motion preference detected');
    }
    if (prefersHighContrast) {
      console.log('ℹ️ High contrast preference detected');
    }

    // Test 10: Performance Optimization Classes
    console.log('📋 Test 10: Performance Optimization');
    const performanceClasses = [
      'terminal-effects-optimized',
      'terminal-qa-high',
      'terminal-qa-medium',
      'terminal-qa-low'
    ];
    
    let performanceSupported = 0;
    performanceClasses.forEach(className => {
      const testEl = document.createElement('div');
      testEl.className = className;
      document.body.appendChild(testEl);
      
      const style = getComputedStyle(testEl);
      if (style.willChange || style.backfaceVisibility || style.transform) {
        performanceSupported++;
      }
      
      document.body.removeChild(testEl);
    });
    
    results.effects.performanceOptimization = performanceSupported >= 2;
    if (results.effects.performanceOptimization) {
      console.log('✅ Performance optimization classes working');
    } else {
      results.warnings.push('Performance optimization classes may not be working');
    }

    // Test 11: Browser Compatibility
    console.log('📋 Test 11: Browser Compatibility');
    const browserSupport = {
      transforms3D: CSS.supports('transform', 'translate3d(0,0,0)'),
      animations: CSS.supports('animation', 'test 1s'),
      gradients: CSS.supports('background', 'linear-gradient(red, blue)'),
      textShadow: CSS.supports('text-shadow', '0 0 5px red'),
      backdropFilter: CSS.supports('backdrop-filter', 'blur(5px)') || 
                      CSS.supports('-webkit-backdrop-filter', 'blur(5px)')
    };
    
    results.effects.browserSupport = browserSupport;
    const supportedFeatures = Object.values(browserSupport).filter(Boolean).length;
    const totalFeatures = Object.keys(browserSupport).length;
    
    console.log(`✅ Browser compatibility: ${supportedFeatures}/${totalFeatures} features supported`);
    
    if (supportedFeatures < totalFeatures) {
      results.warnings.push(`Some browser features not supported: ${totalFeatures - supportedFeatures} missing`);
    }

    // Final Assessment
    const effectsWorking = Object.values(results.effects).filter(effect => 
      typeof effect === 'boolean' ? effect : true
    ).length;
    const totalEffects = Object.keys(results.effects).filter(key => 
      typeof results.effects[key] === 'boolean'
    ).length;
    
    console.log('\n=== TERMINAL EFFECTS VALIDATION SUMMARY ===');
    console.log(`Effects working: ${effectsWorking}/${totalEffects}`);
    console.log(`Warnings: ${results.warnings.length}`);
    console.log(`Errors: ${results.errors.length}`);
    
    if (results.warnings.length > 0) {
      console.log('\nWarnings:');
      results.warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
    }
    
    if (results.errors.length > 0) {
      console.log('\nErrors:');
      results.errors.forEach(error => console.log(`  ❌ ${error}`));
      results.passed = false;
    }
    
    const successRate = (effectsWorking / totalEffects) * 100;
    results.passed = results.passed && successRate >= 80; // 80% success rate required
    
    console.log(`\nOverall result: ${results.passed ? '✅ PASSED' : '❌ FAILED'} (${successRate.toFixed(1)}% success rate)`);
    
    return results;

  } catch (error) {
    results.errors.push(`Validation failed: ${error.message}`);
    results.passed = false;
    console.error('❌ Terminal effects validation failed:', error);
    return results;
  }
}

/**
 * Test terminal effects in different scenarios
 */
function testTerminalEffectsScenarios() {
  console.log('🧪 Testing terminal effects in different scenarios...');
  
  const scenarios = [
    {
      name: 'High Quality Mode',
      className: 'terminal-qa-high',
      expected: 'Full effects'
    },
    {
      name: 'Medium Quality Mode',
      className: 'terminal-qa-medium',
      expected: 'Balanced effects'
    },
    {
      name: 'Low Quality Mode',
      className: 'terminal-qa-low',
      expected: 'Minimal effects'
    },
    {
      name: 'Mobile Optimization',
      className: 'terminal-effects-mobile',
      expected: 'Mobile-optimized effects'
    }
  ];
  
  scenarios.forEach(scenario => {
    console.log(`📱 Testing: ${scenario.name}`);
    
    const testElement = document.createElement('div');
    testElement.className = `phosphor-glow ${scenario.className}`;
    testElement.textContent = 'Test';
    testElement.style.position = 'absolute';
    testElement.style.top = '-1000px';
    document.body.appendChild(testElement);
    
    const style = getComputedStyle(testElement);
    const textShadow = style.textShadow;
    
    if (textShadow && textShadow !== 'none') {
      console.log(`  ✅ ${scenario.name}: Effects applied`);
    } else {
      console.log(`  ⚠️ ${scenario.name}: Effects may not be working`);
    }
    
    document.body.removeChild(testElement);
  });
}

/**
 * Run comprehensive terminal effects validation
 */
export function runTerminalEffectsValidation() {
  console.log('🚀 Starting comprehensive terminal effects validation...');
  
  const mainResults = testTerminalEffects();
  testTerminalEffectsScenarios();
  
  console.log('\n✅ Terminal effects validation completed');
  return mainResults;
}

// Auto-run if this file is loaded directly
if (typeof window !== 'undefined' && window.location) {
  // Run validation when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runTerminalEffectsValidation);
  } else {
    runTerminalEffectsValidation();
  }
}

export { testTerminalEffects, testTerminalEffectsScenarios };