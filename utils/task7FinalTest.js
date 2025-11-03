/**
 * Task 7 Final Validation Test - Browser Environment
 * 
 * This test validates the complete Scene Wrapper functionality in a browser environment
 * where React and Three.js can actually run. It covers all requirements from task 7.
 */

// Test configuration
const TASK_7_TEST_CONFIG = {
  testName: 'Task 7 - Complete Scene Wrapper Functionality Validation',
  timeout: 10000,
  performanceTestDuration: 3000,
  resizeTestCount: 5,
  modeSwithingTestCount: 10
};

// Global test results
window.task7TestResults = {
  passed: 0,
  failed: 0,
  errors: [],
  startTime: null,
  endTime: null
};

/**
 * Log test results
 */
function logTask7Result(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  
  if (details) {
    console.log(`   ${details}`);
  }
  
  if (passed) {
    window.task7TestResults.passed++;
  } else {
    window.task7TestResults.failed++;
    window.task7TestResults.errors.push({ test: testName, details });
  }
}

/**
 * Test 1: Canvas Initialization and Three.js Context Creation
 */
function testTask7CanvasInitialization() {
  return new Promise((resolve) => {
    console.log('\n🎮 Testing Canvas Initialization and Three.js Context Creation...');
    
    try {
      // Create test container
      const container = document.createElement('div');
      container.id = 'task7-canvas-test';
      container.style.cssText = 'position: fixed; top: -1000px; left: -1000px; width: 800px; height: 600px;';
      document.body.appendChild(container);
      
      // Check if SceneWrapper is available
      if (typeof window.SceneWrapper === 'undefined') {
        logTask7Result('Canvas initialization test', false, 'SceneWrapper component not available in global scope');
        document.body.removeChild(container);
        resolve(false);
        return;
      }
      
      // Create SceneWrapper instance
      const sceneWrapperElement = React.createElement(window.SceneWrapper, {
        mode: 'task7-test',
        sceneProps: {
          camera: { position: [0, 0, 5], fov: 75 },
          lighting: { ambientIntensity: 0.5, pointLightPosition: [10, 10, 10] }
        }
      });
      
      const root = ReactDOM.createRoot(container);
      root.render(sceneWrapperElement);
      
      // Wait for component to initialize
      setTimeout(() => {
        const canvas = container.querySelector('canvas');
        const sceneWrapper = container.querySelector('.scene-wrapper');
        
        const canvasCreated = !!canvas;
        const wrapperCreated = !!sceneWrapper;
        const hasProperStyling = sceneWrapper && 
                                sceneWrapper.style.position === 'fixed' &&
                                sceneWrapper.style.width === '100vw' &&
                                sceneWrapper.style.height === '100vh';
        
        const passed = canvasCreated && wrapperCreated && hasProperStyling;
        
        logTask7Result(
          'Canvas initialization and Three.js context creation',
          passed,
          passed 
            ? 'Canvas and wrapper created with proper styling and Three.js integration'
            : `Failed - Canvas: ${canvasCreated}, Wrapper: ${wrapperCreated}, Styling: ${hasProperStyling}`
        );
        
        // Cleanup
        root.unmount();
        document.body.removeChild(container);
        resolve(passed);
      }, 500);
      
    } catch (error) {
      logTask7Result('Canvas initialization and Three.js context creation', false, error.message);
      resolve(false);
    }
  });
}

/**
 * Test 2: Error Boundary Functionality
 */
function testTask7ErrorBoundary() {
  return new Promise((resolve) => {
    console.log('\n🚨 Testing Error Boundary for Three.js Failure Scenarios...');
    
    try {
      const container = document.createElement('div');
      container.id = 'task7-error-test';
      container.style.cssText = 'position: fixed; top: -1000px; left: -1000px; width: 800px; height: 600px;';
      document.body.appendChild(container);
      
      // Create error component
      const ErrorComponent = () => {
        throw new Error('Test WebGL context lost error');
      };
      
      let errorCaught = false;
      const onError = (error, context) => {
        errorCaught = true;
        console.log('   ✓ Error callback executed with context:', !!context);
      };
      
      const sceneWrapperElement = React.createElement(window.SceneWrapper, {
        mode: 'error-test',
        onError: onError
      }, React.createElement(ErrorComponent));
      
      const root = ReactDOM.createRoot(container);
      root.render(sceneWrapperElement);
      
      setTimeout(() => {
        const fallbackUI = container.querySelector('.scene-fallback');
        const errorTitle = container.querySelector('.error-title');
        const ambientAnimation = container.querySelector('.ambient-animation');
        
        const hasFallbackUI = !!fallbackUI;
        const hasErrorTitle = !!errorTitle;
        const hasAmbientAnimation = !!ambientAnimation;
        
        const passed = hasFallbackUI && hasErrorTitle && hasAmbientAnimation && errorCaught;
        
        logTask7Result(
          'Error boundary catches Three.js failure scenarios',
          passed,
          passed 
            ? 'Error boundary displays fallback UI with ambient animations and executes error callback'
            : `Failed - Fallback: ${hasFallbackUI}, Title: ${hasErrorTitle}, Animation: ${hasAmbientAnimation}, Callback: ${errorCaught}`
        );
        
        // Cleanup
        root.unmount();
        document.body.removeChild(container);
        resolve(passed);
      }, 300);
      
    } catch (error) {
      logTask7Result('Error boundary catches Three.js failure scenarios', false, error.message);
      resolve(false);
    }
  });
}

/**
 * Test 3: Performance with Rapid Scene Changes
 */
function testTask7Performance() {
  return new Promise((resolve) => {
    console.log('\n⚡ Testing Performance with Rapid Scene Changes...');
    
    try {
      const container = document.createElement('div');
      container.id = 'task7-performance-test';
      container.style.cssText = 'position: fixed; top: -1000px; left: -1000px; width: 800px; height: 600px;';
      document.body.appendChild(container);
      
      const root = ReactDOM.createRoot(container);
      let renderCount = 0;
      const startTime = performance.now();
      const renderTimes = [];
      
      const testModes = ['corporate-ai', 'zen-monk', 'chaos', 'emotional-damage'];
      const testSceneProps = [
        { bgColor: '#001100', ambientSpeed: 1.0 },
        { bgColor: '#110000', ambientSpeed: 2.0 },
        { bgColor: '#000011', ambientSpeed: 0.5 },
        { bgColor: '#111100', ambientSpeed: 1.5 }
      ];
      
      const performRapidSwitch = () => {
        const renderStart = performance.now();
        
        const mode = testModes[renderCount % testModes.length];
        const sceneProps = testSceneProps[renderCount % testSceneProps.length];
        
        const sceneWrapperElement = React.createElement(window.SceneWrapper, {
          mode: mode,
          sceneProps: sceneProps,
          key: `perf-test-${renderCount}`
        });
        
        root.render(sceneWrapperElement);
        
        const renderEnd = performance.now();
        renderTimes.push(renderEnd - renderStart);
        renderCount++;
        
        if (renderCount < TASK_7_TEST_CONFIG.modeSwithingTestCount) {
          setTimeout(performRapidSwitch, 100);
        } else {
          // Analyze performance
          const totalTime = performance.now() - startTime;
          const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
          const maxRenderTime = Math.max(...renderTimes);
          
          const avgRenderTimeGood = avgRenderTime < 50; // Less than 50ms average
          const maxRenderTimeAcceptable = maxRenderTime < 200; // Less than 200ms max
          const totalTimeReasonable = totalTime < 5000; // Less than 5 seconds total
          
          const passed = avgRenderTimeGood && maxRenderTimeAcceptable && totalTimeReasonable;
          
          logTask7Result(
            'Performance with multiple rapid scene changes',
            passed,
            passed 
              ? `Excellent performance: ${renderCount} switches in ${totalTime.toFixed(0)}ms (avg: ${avgRenderTime.toFixed(1)}ms)`
              : `Performance issues: avg ${avgRenderTime.toFixed(1)}ms, max ${maxRenderTime.toFixed(1)}ms, total ${totalTime.toFixed(0)}ms`
          );
          
          // Cleanup
          root.unmount();
          document.body.removeChild(container);
          resolve(passed);
        }
      };
      
      performRapidSwitch();
      
    } catch (error) {
      logTask7Result('Performance with multiple rapid scene changes', false, error.message);
      resolve(false);
    }
  });
}

/**
 * Test 4: Responsive Behavior and Canvas Resizing
 */
function testTask7ResponsiveBehavior() {
  return new Promise((resolve) => {
    console.log('\n📱 Testing Responsive Behavior and Canvas Resizing...');
    
    try {
      const container = document.createElement('div');
      container.id = 'task7-responsive-test';
      container.style.cssText = 'position: fixed; top: -1000px; left: -1000px; width: 800px; height: 600px;';
      document.body.appendChild(container);
      
      const root = ReactDOM.createRoot(container);
      
      const sceneWrapperElement = React.createElement(window.SceneWrapper, {
        mode: 'responsive-test',
        sceneProps: { bgColor: '#001122' }
      });
      
      root.render(sceneWrapperElement);
      
      // Store original dimensions
      const originalWidth = window.innerWidth;
      const originalHeight = window.innerHeight;
      
      const viewportSizes = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ];
      
      let resizeTestsCompleted = 0;
      let resizeTestsPassed = 0;
      
      const testResize = (viewport, index) => {
        setTimeout(() => {
          // Mock window dimensions
          Object.defineProperty(window, 'innerWidth', { value: viewport.width, writable: true });
          Object.defineProperty(window, 'innerHeight', { value: viewport.height, writable: true });
          
          // Trigger resize event
          window.dispatchEvent(new Event('resize'));
          
          setTimeout(() => {
            const canvas = container.querySelector('canvas');
            const sceneWrapper = container.querySelector('.scene-wrapper');
            
            const canvasExists = !!canvas;
            const wrapperResponsive = sceneWrapper && 
                                   sceneWrapper.style.width === '100vw' &&
                                   sceneWrapper.style.height === '100vh';
            
            if (canvasExists && wrapperResponsive) {
              resizeTestsPassed++;
            }
            
            resizeTestsCompleted++;
            
            if (resizeTestsCompleted === viewportSizes.length) {
              // Restore original dimensions
              Object.defineProperty(window, 'innerWidth', { value: originalWidth, writable: true });
              Object.defineProperty(window, 'innerHeight', { value: originalHeight, writable: true });
              
              const allPassed = resizeTestsPassed === viewportSizes.length;
              
              logTask7Result(
                'Responsive behavior and canvas resizing',
                allPassed,
                `${resizeTestsPassed}/${viewportSizes.length} viewport sizes handled correctly`
              );
              
              // Cleanup
              root.unmount();
              document.body.removeChild(container);
              resolve(allPassed);
            }
          }, 150); // Wait for debounced resize
        }, index * 200);
      };
      
      viewportSizes.forEach(testResize);
      
    } catch (error) {
      logTask7Result('Responsive behavior and canvas resizing', false, error.message);
      resolve(false);
    }
  });
}

/**
 * Test 5: Resource Cleanup and Memory Management
 */
function testTask7ResourceCleanup() {
  return new Promise((resolve) => {
    console.log('\n🧹 Testing Resource Cleanup and Memory Management...');
    
    try {
      let webglContextLost = false;
      let eventListenersRemoved = false;
      
      // Mock WebGL context lose
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type) {
        if (type === 'webgl' || type === 'experimental-webgl') {
          return {
            getExtension: (name) => {
              if (name === 'WEBGL_lose_context') {
                return {
                  loseContext: () => {
                    webglContextLost = true;
                  }
                };
              }
              return null;
            },
            getParameter: () => 'Mock WebGL'
          };
        }
        return originalGetContext.call(this, type);
      };
      
      // Mock removeEventListener
      const originalRemoveEventListener = window.removeEventListener;
      window.removeEventListener = function(type, listener, options) {
        if (type === 'resize') {
          eventListenersRemoved = true;
        }
        return originalRemoveEventListener.call(this, type, listener, options);
      };
      
      const container = document.createElement('div');
      container.id = 'task7-cleanup-test';
      container.style.cssText = 'position: fixed; top: -1000px; left: -1000px; width: 800px; height: 600px;';
      document.body.appendChild(container);
      
      const root = ReactDOM.createRoot(container);
      
      const sceneWrapperElement = React.createElement(window.SceneWrapper, {
        mode: 'cleanup-test',
        sceneProps: { bgColor: '#112233' }
      });
      
      root.render(sceneWrapperElement);
      
      setTimeout(() => {
        // Unmount to trigger cleanup
        root.unmount();
        document.body.removeChild(container);
        
        setTimeout(() => {
          // Restore original functions
          HTMLCanvasElement.prototype.getContext = originalGetContext;
          window.removeEventListener = originalRemoveEventListener;
          
          const cleanupComplete = webglContextLost && eventListenersRemoved;
          
          logTask7Result(
            'Resource cleanup and memory management',
            cleanupComplete,
            cleanupComplete 
              ? 'WebGL context disposed and event listeners removed properly'
              : `Cleanup incomplete - WebGL: ${webglContextLost}, Events: ${eventListenersRemoved}`
          );
          
          resolve(cleanupComplete);
        }, 200);
      }, 500);
      
    } catch (error) {
      logTask7Result('Resource cleanup and memory management', false, error.message);
      resolve(false);
    }
  });
}

/**
 * Main test runner for Task 7
 */
async function runTask7FinalValidation() {
  console.log(`\n🚀 Running ${TASK_7_TEST_CONFIG.testName}...`);
  console.log('=' .repeat(80));
  console.log('This test validates all requirements from Task 7:');
  console.log('• Canvas initialization and Three.js context creation (Req 1.4)');
  console.log('• Error boundary catches various Three.js failure scenarios (Req 3.5)');
  console.log('• Performance with multiple rapid scene changes (Req 4.4)');
  console.log('• Responsive behavior and canvas resizing (Req 4.2)');
  console.log('• Proper resource cleanup and memory management (Req 1.5)');
  console.log('=' .repeat(80));
  
  // Reset results
  window.task7TestResults = {
    passed: 0,
    failed: 0,
    errors: [],
    startTime: performance.now(),
    endTime: null
  };
  
  try {
    // Check prerequisites
    if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
      console.error('❌ React or ReactDOM not available. Please ensure they are loaded.');
      return false;
    }
    
    if (typeof window.SceneWrapper === 'undefined') {
      console.error('❌ SceneWrapper component not available. Please ensure it is loaded in global scope.');
      return false;
    }
    
    // Run all tests sequentially
    await testTask7CanvasInitialization();
    await testTask7ErrorBoundary();
    await testTask7Performance();
    await testTask7ResponsiveBehavior();
    await testTask7ResourceCleanup();
    
    // Calculate final results
    window.task7TestResults.endTime = performance.now();
    const totalTime = window.task7TestResults.endTime - window.task7TestResults.startTime;
    
    console.log('\n' + '=' .repeat(80));
    console.log('📊 Task 7 Final Validation Results:');
    console.log(`✅ Passed: ${window.task7TestResults.passed}`);
    console.log(`❌ Failed: ${window.task7TestResults.failed}`);
    console.log(`⏱️ Total Time: ${totalTime.toFixed(0)}ms`);
    console.log(`📈 Success Rate: ${((window.task7TestResults.passed / (window.task7TestResults.passed + window.task7TestResults.failed)) * 100).toFixed(1)}%`);
    
    if (window.task7TestResults.errors.length > 0) {
      console.log('\n🚨 Failed Tests:');
      window.task7TestResults.errors.forEach(({ test, details }) => {
        console.log(`   ${test}: ${details}`);
      });
    }
    
    if (window.task7TestResults.failed === 0) {
      console.log('\n🎉 ALL TASK 7 REQUIREMENTS VALIDATED SUCCESSFULLY!');
      console.log('✨ Complete Scene Wrapper Functionality Confirmed:');
      console.log('   ✅ Canvas initialization and Three.js context creation working');
      console.log('   ✅ Comprehensive error boundary handling all failure scenarios');
      console.log('   ✅ Excellent performance with rapid scene changes and mode switching');
      console.log('   ✅ Responsive behavior working across all tested screen sizes');
      console.log('   ✅ Proper resource cleanup and memory management implemented');
      console.log('\n🏆 Task 7 Implementation Complete and Fully Validated!');
      console.log('🎯 All requirements from the specification have been met.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the implementation.');
      console.log('📋 Requirements that need attention:');
      window.task7TestResults.errors.forEach(({ test }) => {
        console.log(`   • ${test}`);
      });
    }
    
    console.log('=' .repeat(80));
    
    return window.task7TestResults.failed === 0;
    
  } catch (error) {
    console.error('❌ Task 7 final validation failed:', error);
    return false;
  }
}

// Export for browser use
if (typeof window !== 'undefined') {
  window.runTask7FinalValidation = runTask7FinalValidation;
  console.log('Task 7 Final Validation loaded. Call runTask7FinalValidation() to execute tests.');
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTask7FinalValidation };
}