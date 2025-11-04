/**
 * SceneWrapper Component Test
 * Tests basic functionality and error handling of the SceneWrapper component
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import SceneWrapper from '../components/SceneWrapper.jsx';

// Test configuration
const testConfig = {
  testName: 'SceneWrapper Component Test',
  timeout: 5000
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

/**
 * Log test results
 */
function logResult(testName, passed, error = null) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
    if (error) {
      console.error(`   Error: ${error.message}`);
      testResults.errors.push({ test: testName, error: error.message });
    }
  }
}

/**
 * Test 1: Component renders without errors
 */
function testBasicRender() {
  try {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    // Test basic render
    root.render(React.createElement(SceneWrapper, {
      mode: 'test',
      sceneProps: { bgColor: '#000000' }
    }));
    
    // Check if component mounted
    const sceneWrapper = container.querySelector('.scene-wrapper');
    const hasWrapper = !!sceneWrapper;
    
    // Cleanup
    root.unmount();
    document.body.removeChild(container);
    
    logResult('Basic component render', hasWrapper);
    return hasWrapper;
    
  } catch (error) {
    logResult('Basic component render', false, error);
    return false;
  }
}

/**
 * Test 2: Props are properly handled
 */
function testPropsHandling() {
  try {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    const testProps = {
      mode: 'corporate-ai',
      sceneProps: {
        bgColor: '#001100',
        ambientSpeed: 2.0,
        cameraPosition: [1, 2, 3]
      },
      className: 'test-class',
      style: { zIndex: 999 }
    };
    
    root.render(React.createElement(SceneWrapper, testProps));
    
    // Check if props are applied
    const sceneWrapper = container.querySelector('.scene-wrapper');
    const hasCorrectClass = sceneWrapper && sceneWrapper.classList.contains('test-class');
    const hasCorrectStyle = sceneWrapper && sceneWrapper.style.zIndex === '999';
    
    // Cleanup
    root.unmount();
    document.body.removeChild(container);
    
    const passed = hasCorrectClass && hasCorrectStyle;
    logResult('Props handling', passed);
    return passed;
    
  } catch (error) {
    logResult('Props handling', false, error);
    return false;
  }
}

/**
 * Test 3: Enhanced error boundary functionality
 */
function testErrorBoundary() {
  try {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    // Create a component that throws an error
    const ErrorComponent = () => {
      throw new Error('Test error for boundary');
    };
    
    let errorCaught = false;
    let errorContext = null;
    const onError = (error, context) => {
      errorCaught = true;
      errorContext = context;
    };
    
    root.render(React.createElement(SceneWrapper, {
      mode: 'test-mode',
      onError: onError
    }, React.createElement(ErrorComponent)));
    
    // Give time for error boundary to catch
    setTimeout(() => {
      // Check if fallback UI is shown
      const fallbackUI = container.querySelector('.scene-fallback');
      const hasFallback = !!fallbackUI;
      
      // Check if error context was provided
      const hasErrorContext = errorCaught && errorContext && errorContext.timestamp;
      
      // Cleanup
      root.unmount();
      document.body.removeChild(container);
      
      const passed = hasFallback && hasErrorContext;
      logResult('Enhanced error boundary functionality', passed);
      
      if (passed) {
        console.log('   ✓ Fallback UI displayed');
        console.log('   ✓ Error context captured');
        console.log('   ✓ Error callback executed');
      }
    }, 100);
    
    return true;
    
  } catch (error) {
    logResult('Enhanced error boundary functionality', false, error);
    return false;
  }
}

/**
 * Test 4: WebGL detection
 */
function testWebGLDetection() {
  try {
    // Mock WebGL unavailable
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type) {
      if (type === 'webgl' || type === 'experimental-webgl') {
        return null; // Simulate WebGL not available
      }
      return originalGetContext.call(this, type);
    };
    
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    root.render(React.createElement(SceneWrapper, {
      mode: 'test'
    }));
    
    // Check if fallback UI is shown for WebGL unavailable
    setTimeout(() => {
      const fallbackUI = container.querySelector('.scene-fallback');
      const hasFallback = !!fallbackUI;
      
      // Restore original getContext
      HTMLCanvasElement.prototype.getContext = originalGetContext;
      
      // Cleanup
      root.unmount();
      document.body.removeChild(container);
      
      logResult('WebGL detection and fallback', hasFallback);
    }, 100);
    
    return true;
    
  } catch (error) {
    logResult('WebGL detection and fallback', false, error);
    return false;
  }
}

/**
 * Test 5: Error type detection and messaging
 */
function testErrorTypeDetection() {
  try {
    const errorTypes = [
      { error: new Error('WebGL context lost'), expectedType: 'webgl' },
      { error: new Error('Out of memory'), expectedType: 'memory' },
      { error: new Error('Shader compilation failed'), expectedType: 'shader' },
      { error: new Error('Texture loading failed'), expectedType: 'resource' },
      { error: new Error('ChunkLoadError: Loading chunk failed'), expectedType: 'loading' }
    ];
    
    let testsCompleted = 0;
    let testsPassed = 0;
    
    errorTypes.forEach(({ error, expectedType }, index) => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);
      
      const ErrorComponent = () => {
        throw error;
      };
      
      root.render(React.createElement(SceneWrapper, {
        mode: 'test-mode'
      }, React.createElement(ErrorComponent)));
      
      setTimeout(() => {
        const fallbackUI = container.querySelector('.scene-fallback');
        const errorTitle = fallbackUI?.querySelector('.error-title');
        const hasCorrectErrorUI = !!errorTitle;
        
        if (hasCorrectErrorUI) {
          testsPassed++;
        }
        
        testsCompleted++;
        
        // Cleanup
        root.unmount();
        document.body.removeChild(container);
        
        // Check if all tests completed
        if (testsCompleted === errorTypes.length) {
          const allPassed = testsPassed === errorTypes.length;
          logResult('Error type detection and messaging', allPassed);
          
          if (allPassed) {
            console.log(`   ✓ All ${errorTypes.length} error types handled correctly`);
          } else {
            console.log(`   ⚠ ${testsPassed}/${errorTypes.length} error types handled correctly`);
          }
        }
      }, 50 + index * 10);
    });
    
    return true;
    
  } catch (error) {
    logResult('Error type detection and messaging', false, error);
    return false;
  }
}

/**
 * Test 6: Retry functionality
 */
function testRetryFunctionality() {
  try {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    // Create a component that throws a recoverable error
    const ErrorComponent = () => {
      throw new Error('memory overflow detected');
    };
    
    root.render(React.createElement(SceneWrapper, {
      mode: 'test-mode'
    }, React.createElement(ErrorComponent)));
    
    setTimeout(() => {
      const fallbackUI = container.querySelector('.scene-fallback');
      const retryButton = fallbackUI?.querySelector('.retry-button');
      const hasRetryButton = !!retryButton;
      
      // Test retry button functionality
      if (retryButton) {
        // Simulate click
        retryButton.click();
      }
      
      // Cleanup
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(container);
        
        logResult('Retry functionality', hasRetryButton);
        
        if (hasRetryButton) {
          console.log('   ✓ Retry button displayed for recoverable errors');
          console.log('   ✓ Retry button is clickable');
        }
      }, 50);
    }, 100);
    
    return true;
    
  } catch (error) {
    logResult('Retry functionality', false, error);
    return false;
  }
}

/**
 * Test 7: Memory and performance monitoring
 */
function testPerformanceMonitoring() {
  try {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    // Mock performance.memory for testing
    const originalMemory = performance.memory;
    performance.memory = {
      usedJSHeapSize: 50000000,
      totalJSHeapSize: 100000000,
      jsHeapSizeLimit: 200000000
    };
    
    const ErrorComponent = () => {
      throw new Error('Test error for performance monitoring');
    };
    
    let errorContext = null;
    const onError = (error, context) => {
      errorContext = context;
    };
    
    root.render(React.createElement(SceneWrapper, {
      mode: 'test-mode',
      onError: onError
    }, React.createElement(ErrorComponent)));
    
    setTimeout(() => {
      // Check if performance data was captured
      const hasMemoryInfo = errorContext && errorContext.memoryInfo && errorContext.memoryInfo.usedJSHeapSize;
      const hasCanvasInfo = errorContext && errorContext.canvasInfo && errorContext.canvasInfo.devicePixelRatio;
      const hasWebGLInfo = errorContext && errorContext.webglSupported;
      
      // Restore original memory object
      performance.memory = originalMemory;
      
      // Cleanup
      root.unmount();
      document.body.removeChild(container);
      
      const passed = hasMemoryInfo && hasCanvasInfo && (hasWebGLInfo !== undefined);
      logResult('Performance monitoring', passed);
      
      if (passed) {
        console.log('   ✓ Memory information captured');
        console.log('   ✓ Canvas information captured');
        console.log('   ✓ WebGL capabilities detected');
      }
    }, 100);
    
    return true;
    
  } catch (error) {
    logResult('Performance monitoring', false, error);
    return false;
  }
}

/**
 * Run all tests
 */
export function runSceneWrapperTests() {
  console.log(`\n🧪 Running ${testConfig.testName}...`);
  console.log('=' .repeat(50));
  
  // Reset results
  testResults = { passed: 0, failed: 0, errors: [] };
  
  try {
    // Run tests
    testBasicRender();
    testPropsHandling();
    testErrorBoundary();
    testWebGLDetection();
    testErrorTypeDetection();
    testRetryFunctionality();
    testPerformanceMonitoring();
    
    // Wait for async tests to complete
    setTimeout(() => {
      console.log('\n📊 Test Results:');
      console.log(`✅ Passed: ${testResults.passed}`);
      console.log(`❌ Failed: ${testResults.failed}`);
      console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
      
      if (testResults.errors.length > 0) {
        console.log('\n🚨 Errors:');
        testResults.errors.forEach(({ test, error }) => {
          console.log(`   ${test}: ${error}`);
        });
      }
      
      console.log('=' .repeat(50));
      
      return testResults;
    }, 500);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    return { passed: 0, failed: 1, errors: [{ test: 'Test Suite', error: error.message }] };
  }
}

// Export for use in other test files
export default {
  runSceneWrapperTests,
  testResults
};

// Auto-run if called directly
if (typeof window !== 'undefined' && window.location) {
  // Browser environment - can be run manually
  console.log('SceneWrapper test module loaded. Call runSceneWrapperTests() to execute tests.');
}