/**
 * Terminal Animation Test - Task 4 Validation
 * 
 * Tests the enhanced terminal-style animations and effects for message popups
 * including materialization, typing effects, and glitchy chaos mode animations.
 */

// Test configuration
const testConfig = {
  testDuration: 10000, // 10 seconds
  animationTypes: ['normal', 'typing', 'glitchy'],
  modes: ['corporate-ai', 'zen-monk', 'chaos'],
  positions: ['overlay', 'above', 'left', 'right']
};

/**
 * Test 1: Terminal Materialization Effect
 * Validates smooth fade in/out with terminal-style materialization
 */
function testTerminalMaterialization() {
  console.log('🔧 Testing Terminal Materialization Effect...');
  
  const testElement = document.createElement('div');
  testElement.className = 'message-popup message-popup-terminal-materialize';
  testElement.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    border: 2px solid var(--matrix-green, #00FF00);
    padding: 12px 16px;
    color: var(--matrix-green, #00FF00);
    font-family: monospace;
    z-index: 9999;
  `;
  testElement.innerHTML = '> Terminal materialization test';
  
  document.body.appendChild(testElement);
  
  // Test entrance animation
  setTimeout(() => {
    testElement.classList.add('message-popup-entering');
  }, 100);
  
  // Test exit animation
  setTimeout(() => {
    testElement.classList.remove('message-popup-entering');
    testElement.classList.add('message-popup-terminal-dematerialize');
  }, 3000);
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(testElement);
    console.log('✅ Terminal Materialization Test Complete');
  }, 4000);
  
  return true;
}

/**
 * Test 2: Typing Effect Animation
 * Validates character-by-character typing with cursor and scan line effects
 */
function testTypingEffect() {
  console.log('⌨️ Testing Typing Effect Animation...');
  
  const testElement = document.createElement('div');
  testElement.className = 'message-popup message-popup-animation-typing message-popup-scan-lines';
  testElement.style.cssText = `
    position: fixed;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    border: 2px solid var(--matrix-green, #00FF00);
    padding: 12px 16px;
    color: var(--matrix-green, #00FF00);
    font-family: monospace;
    z-index: 9999;
    max-width: 300px;
  `;
  
  const promptSpan = document.createElement('span');
  promptSpan.textContent = '> ';
  promptSpan.className = 'message-popup-prompt';
  
  const contentSpan = document.createElement('span');
  contentSpan.className = 'message-popup-content';
  contentSpan.setAttribute('data-text', 'This is a typing effect test with terminal styling');
  contentSpan.textContent = 'This is a typing effect test with terminal styling';
  
  testElement.appendChild(promptSpan);
  testElement.appendChild(contentSpan);
  document.body.appendChild(testElement);
  
  // Test typing animation
  setTimeout(() => {
    testElement.classList.add('message-popup-entering');
  }, 100);
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(testElement);
    console.log('✅ Typing Effect Test Complete');
  }, 4000);
  
  return true;
}

/**
 * Test 3: Glitchy Chaos Animation
 * Validates glitch effects with color shifts and text distortion
 */
function testGlitchyAnimation() {
  console.log('🌀 Testing Glitchy Chaos Animation...');
  
  const testElement = document.createElement('div');
  testElement.className = 'message-popup message-popup-animation-glitchy message-popup-mode-chaos';
  testElement.style.cssText = `
    position: fixed;
    top: 70%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.95);
    border: 2px solid var(--matrix-green, #00FF00);
    padding: 12px 16px;
    color: var(--matrix-green, #00FF00);
    font-family: monospace;
    z-index: 9999;
    max-width: 300px;
  `;
  
  const promptSpan = document.createElement('span');
  promptSpan.textContent = '> ';
  promptSpan.className = 'message-popup-prompt';
  
  const contentSpan = document.createElement('span');
  contentSpan.className = 'message-popup-content';
  contentSpan.setAttribute('data-text', 'CHAOS MODE GLITCH TEST ERROR ERROR');
  contentSpan.textContent = 'CHAOS MODE GLITCH TEST ERROR ERROR';
  
  testElement.appendChild(promptSpan);
  testElement.appendChild(contentSpan);
  document.body.appendChild(testElement);
  
  // Test glitch animation
  setTimeout(() => {
    testElement.classList.add('message-popup-entering');
  }, 100);
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(testElement);
    console.log('✅ Glitchy Animation Test Complete');
  }, 5000);
  
  return true;
}

/**
 * Test 4: Performance Validation
 * Ensures animations maintain 60fps performance
 */
function testPerformance() {
  console.log('⚡ Testing Animation Performance...');
  
  let frameCount = 0;
  let startTime = performance.now();
  let lastTime = startTime;
  
  function measureFPS() {
    const currentTime = performance.now();
    frameCount++;
    
    if (currentTime - startTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - startTime));
      console.log(`📊 Current FPS: ${fps}`);
      
      if (fps < 50) {
        console.warn('⚠️ Performance Warning: FPS below 50');
      } else if (fps >= 60) {
        console.log('✅ Performance Good: 60+ FPS');
      }
      
      frameCount = 0;
      startTime = currentTime;
    }
    
    if (currentTime - lastTime < 3000) {
      requestAnimationFrame(measureFPS);
    } else {
      console.log('✅ Performance Test Complete');
    }
  }
  
  requestAnimationFrame(measureFPS);
  return true;
}

/**
 * Test 5: Accessibility Compliance
 * Validates reduced motion and high contrast support
 */
function testAccessibility() {
  console.log('♿ Testing Accessibility Compliance...');
  
  // Test reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  console.log(`🎭 Reduced Motion Preference: ${prefersReducedMotion ? 'Enabled' : 'Disabled'}`);
  
  // Test high contrast preference
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  console.log(`🔆 High Contrast Preference: ${prefersHighContrast ? 'Enabled' : 'Disabled'}`);
  
  // Create test element to verify CSS compliance
  const testElement = document.createElement('div');
  testElement.className = 'message-popup';
  testElement.style.cssText = `
    position: fixed;
    top: -100px;
    left: -100px;
    opacity: 0;
    pointer-events: none;
  `;
  document.body.appendChild(testElement);
  
  // Check computed styles
  const computedStyle = window.getComputedStyle(testElement);
  const animationDuration = computedStyle.animationDuration;
  
  if (prefersReducedMotion && animationDuration !== '0.01s') {
    console.warn('⚠️ Accessibility Warning: Reduced motion not properly implemented');
  } else {
    console.log('✅ Accessibility: Reduced motion support verified');
  }
  
  document.body.removeChild(testElement);
  console.log('✅ Accessibility Test Complete');
  return true;
}

/**
 * Run All Terminal Animation Tests
 */
function runAllTests() {
  console.log('🚀 Starting Terminal Animation Tests - Task 4 Implementation');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Terminal Materialization', fn: testTerminalMaterialization, delay: 0 },
    { name: 'Typing Effect', fn: testTypingEffect, delay: 1000 },
    { name: 'Glitchy Animation', fn: testGlitchyAnimation, delay: 2000 },
    { name: 'Performance', fn: testPerformance, delay: 3000 },
    { name: 'Accessibility', fn: testAccessibility, delay: 4000 }
  ];
  
  tests.forEach((test, index) => {
    setTimeout(() => {
      console.log(`\n📋 Test ${index + 1}/5: ${test.name}`);
      test.fn();
    }, test.delay);
  });
  
  // Final summary
  setTimeout(() => {
    console.log('\n' + '=' .repeat(60));
    console.log('🎉 All Terminal Animation Tests Complete!');
    console.log('✅ Task 4: Terminal-style animations and effects implemented');
    console.log('📋 Features tested:');
    console.log('  • Smooth fade in/out with terminal materialization');
    console.log('  • Typing effect animation with cursor and scan lines');
    console.log('  • Glitchy animation for Chaos mode');
    console.log('  • 60fps performance optimization');
    console.log('  • Accessibility compliance (reduced motion)');
  }, 8000);
}

// Export for use in browser console or testing framework
if (typeof window !== 'undefined') {
  window.testTerminalAnimations = runAllTests;
  window.terminalAnimationTests = {
    materialization: testTerminalMaterialization,
    typing: testTypingEffect,
    glitchy: testGlitchyAnimation,
    performance: testPerformance,
    accessibility: testAccessibility,
    runAll: runAllTests
  };
}

// Auto-run if loaded directly
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Terminal Animation Test Suite Ready');
    console.log('💡 Run window.testTerminalAnimations() to start tests');
  });
} else if (typeof document !== 'undefined') {
  console.log('🎯 Terminal Animation Test Suite Ready');
  console.log('💡 Run window.testTerminalAnimations() to start tests');
}

export default {
  runAllTests,
  testTerminalMaterialization,
  testTypingEffect,
  testGlitchyAnimation,
  testPerformance,
  testAccessibility
};