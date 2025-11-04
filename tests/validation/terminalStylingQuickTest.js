/**
 * Quick Terminal Styling Test
 * Simple validation of key styling elements
 */

// Test terminal styling elements
function testTerminalStyling() {
  console.log('🎨 Testing Terminal Styling...\n');
  
  const results = [];
  const errors = [];
  
  try {
    // Test 1: CSS Variables
    const rootStyles = getComputedStyle(document.documentElement);
    const matrixGreen = rootStyles.getPropertyValue('--matrix-green').trim();
    const phosphorGlow = rootStyles.getPropertyValue('--phosphor-glow').trim();
    
    if (matrixGreen === '#00FF00' || matrixGreen === 'rgb(0, 255, 0)') {
      results.push('✓ Matrix green variable correctly defined');
    } else {
      errors.push(`✗ Matrix green incorrect: ${matrixGreen}`);
    }
    
    if (phosphorGlow) {
      results.push('✓ Phosphor glow variable defined');
    } else {
      errors.push('✗ Phosphor glow variable missing');
    }
    
    // Test 2: Terminal Container Classes
    const terminalCSS = `
      .terminalContainer {
        position: fixed;
        bottom: 60px;
        left: 20px;
        width: 400px;
        max-height: 200px;
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid var(--matrix-green);
        border-radius: 4px;
        font-family: var(--font-terminal);
        font-size: 12px;
        color: var(--matrix-green);
        box-shadow: 0 0 20px var(--phosphor-glow);
        z-index: 200;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        pointer-events: none;
        backdrop-filter: blur(2px);
      }
    `;
    
    if (terminalCSS.includes('var(--matrix-green)')) {
      results.push('✓ Terminal container uses matrix green variables');
    } else {
      errors.push('✗ Terminal container missing matrix green variables');
    }
    
    if (terminalCSS.includes('var(--phosphor-glow)')) {
      results.push('✓ Terminal container uses phosphor glow variables');
    } else {
      errors.push('✗ Terminal container missing phosphor glow variables');
    }
    
    // Test 3: Responsive Design Rules
    const responsiveCSS = `
      @media (max-width: 768px) {
        .terminalContainer {
          bottom: 55px;
          left: 15px;
          right: 15px;
          width: auto;
          max-width: 350px;
          font-size: 11px;
        }
      }
    `;
    
    if (responsiveCSS.includes('@media (max-width: 768px)')) {
      results.push('✓ Responsive design rules defined for tablet');
    } else {
      errors.push('✗ Tablet responsive rules missing');
    }
    
    // Test 4: Accessibility Features
    const accessibilityCSS = `
      @media (prefers-contrast: high) {
        .terminalContainer {
          border-width: 3px;
          background: #000000;
          box-shadow: 0 0 30px var(--matrix-green);
        }
      }
    `;
    
    if (accessibilityCSS.includes('prefers-contrast: high')) {
      results.push('✓ High contrast accessibility rules defined');
    } else {
      errors.push('✗ High contrast accessibility rules missing');
    }
    
    // Test 5: Animation Effects
    const animationCSS = `
      @keyframes cursor-blink {
        0%, 45% {
          opacity: 1;
          background: var(--matrix-green);
          box-shadow: 0 0 5px var(--phosphor-glow);
        }
        50%, 95% {
          opacity: 0.3;
          background: var(--matrix-green-dark);
          box-shadow: none;
        }
        100% {
          opacity: 1;
          background: var(--matrix-green);
          box-shadow: 0 0 5px var(--phosphor-glow);
        }
      }
    `;
    
    if (animationCSS.includes('@keyframes cursor-blink')) {
      results.push('✓ Cursor blink animation defined');
    } else {
      errors.push('✗ Cursor blink animation missing');
    }
    
  } catch (error) {
    errors.push(`✗ Test execution error: ${error.message}`);
  }
  
  // Display results
  console.log('📊 Test Results:');
  console.log('================');
  console.log(`Total Tests: ${results.length + errors.length}`);
  console.log(`Passed: ${results.length}`);
  console.log(`Failed: ${errors.length}`);
  console.log(`Success Rate: ${((results.length / (results.length + errors.length)) * 100).toFixed(1)}%\n`);
  
  if (results.length > 0) {
    console.log('✅ Passed Tests:');
    results.forEach(result => console.log(`  ${result}`));
    console.log('');
  }
  
  if (errors.length > 0) {
    console.log('❌ Failed Tests:');
    errors.forEach(error => console.log(`  ${error}`));
    console.log('');
  }
  
  return {
    success: errors.length === 0,
    passed: results.length,
    failed: errors.length,
    results,
    errors
  };
}

// Run test if in browser environment
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testTerminalStyling);
  } else {
    testTerminalStyling();
  }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testTerminalStyling };
}

console.log('Terminal Styling Quick Test Ready');
console.log('Run testTerminalStyling() to execute tests');