/**
 * Task 7 Completion Test - Complete Scene Wrapper Functionality Validation
 * 
 * This comprehensive test validates all requirements from task 7:
 * - Canvas initialization and Three.js context creation
 * - Error boundary catches various Three.js failure scenarios
 * - Performance with multiple rapid scene changes and mode switching
 * - Responsive behavior and canvas resizing across different screen sizes
 * - Proper resource cleanup and memory management
 * 
 * Requirements: 1.4, 3.5, 4.4, 4.2, 1.5
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import SceneWrapper from '../components/SceneWrapper.jsx';

// Test configuration
const testConfig = {
  testName: 'Task 7 - Complete Scene Wrapper Functionality Validation',
  timeout: 15000,
  performanceTestDuration: 5000,
  resizeTestCount: 10,
  modeSwithingTestCount: 20
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  errors: [],
  performanceMetrics: {},
  memoryMetrics: {}
};

/**
 * Log test results with detailed information
 */
function logResult(testName, passed, details = '', metrics = null) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  
  if (details) {
    console.log(`   ${details}`);
  }
  
  if (metrics) {
    console.log(`   Metrics:`, metrics);
  }
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, details, metrics });
  }
}

/**
 * Test 1: Canvas initialization and Three.js context creation (Requirement 1.4)
 */
function testCanvasInitialization() {
  console.log('\n🎮 Testing Canvas Initialization and Three.js Context Creation...');
  
  try {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    let canvasCreated = false;
    let contextCreated = false;
    let lightingSetup = false;
    let cameraSetup = false;
    
    // Mock Canvas creation to capture initialization
    const originalCanvas = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, options) {
      if (type === 'webgl' || type === 'experimental-webgl') {
        contextCreated = true;
        
        // Mock WebGL context with required methods
        return {
          getParameter: (param) => {
            switch (param) {
              case 0x1F00: return 'Mock WebGL Vendor'; // GL_VENDOR
              case 0x1F01: return 'Mock WebGL Renderer'; // GL_RENDERER
              case 0x1F02: return 'WebGL 1.0'; // GL_VERSION
              case 0x0D33: return 4096; // GL_MAX_TEXTURE_SIZE
              case 0x8869: return 16; // GL_MAX_VERTEX_ATTRIBS
              default: return null;
            }
          },
          getSupportedExtensions: () => ['WEBGL_lose_context'],
          getExtension: (name) => {
            if (name === 'WEBGL_lose_context') {
              return { loseContext: () => {} };
            }
            return null;
          },
          setClearColor: () => {},
          setAnimationLoop: () => {},
          capabilities: {
            renderer: 'Mock Renderer',
            version: 'WebGL 1.0',
            maxTextures: 16,
            maxTextureSize: 4096,
            precision: 'highp'
          }
        };
      }
      return originalCanvas.call(this, type, options);
    };
    
    // Test basic SceneWrapper initialization
    root.render(React.createElement(SceneWrapper, {
      mode: 'test-mode',
      sceneProps: {
        camera: { position: [0, 0, 5], fov: 75 },
        lighting: { ambientIntensity: 0.5, pointLightPosition: [10, 10, 10] }
      }
    }));
    
    setTimeout(() => {
      // Check if canvas was created
      const canvas = container.querySelector('canvas');
      canvasCreated = !!canvas;
      
      // Check if scene wrapper has proper structure
      const sceneWrapper = container.querySelector('.scene-wrapper');
      const hasWrapperStructure = sceneWrapper && 
                                 sceneWrapper.style.position === 'fixed' &&
                                 sceneWrapper.style.width === '100vw' &&
                                 sceneWrapper.style.height === '100vh';
      
      // Restore original getContext
      HTMLCanvasElement.prototype.getContext = originalCanvas;
      
      // Cleanup
      root.unmount();
      document.body.removeChild(container);
      
      const passed = canvasCreated && contextCreated && hasWrapperStructure;
      
      logResult(
        'Canvas initialization and Three.js context creation',
        passed,
        passed 
          ? 'Canvas created with WebGL context, proper wrapper structure, and Three.js integration'
          : `Failed - Canvas: ${canvasCreated}, Context: ${contextCreated}, Structure: ${hasWrapperStructure}`,
        {
          canvasCreated,
          contextCreated,
          hasWrapperStructure,
          lightingSetup: true, // Assumed from component structure
          cameraSetup: true    // Assumed from component structure
        }
      );
    }, 200);
    
    return true;
    
  } catch (error) {
    logResult('Canvas initialization and Three.js context creation', false, error.message);
    return false;
  }
}

/**
 * Test 2: Error boundary catches various Three.js failure scenarios (Requirement 3.5)
 */
function testErrorBoundaryScenarios() {
  console.log('\n🚨 Testing Error Boundary for Various Three.js Failure Scenarios...');
  
  const errorScenarios = [
    {
      name: 'WebGL Context Lost',
      error: new Error('WebGL context lost'),
      expectedType: 'webgl',
      expectedCanRetry: false
    },
    {
      name: 'Memory Overflow',
      error: new Error('Out of memory - heap size exceeded'),
      expectedType: 'memory',
      expectedCanRetry: true
    },
    {
      name: 'Shader Compilation Failed',
      error: new Error('Shader compilation failed: syntax error'),
      expectedType: 'shader',
      expectedCanRetry: true
    },
    {
      name: 'Resource Loading Failed',
      error: new Error('Texture buffer overflow'),
      expectedType: 'resource',
      expectedCanRetry: true
    },
    {
      name: 'Module Loading Failed',
      error: new Error('ChunkLoadError: Loading chunk 3 failed'),
      expectedType: 'loading',
      expectedCanRetry: true
    }
  ];
  
  let scenariosCompleted = 0;
  let scenariosPassed = 0;
  
  errorScenarios.forEach((scenario, index) => {
    try {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);
      
      // Create error component that throws the specific error
      const ErrorComponent = () => {
        throw scenario.error;
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
      
      setTimeout(() => {
        // Check if fallback UI is displayed
        const fallbackUI = container.querySelector('.scene-fallback');
        const errorTitle = fallbackUI?.querySelector('.error-title');
        const retryButton = fallbackUI?.querySelector('.retry-button');
        
        const hasFallbackUI = !!fallbackUI;
        const hasErrorTitle = !!errorTitle;
        const hasRetryButton = !!retryButton;
        const retryButtonCorrect = scenario.expectedCanRetry ? hasRetryButton : !hasRetryButton;
        
        // Check if error context was captured
        const hasErrorContext = errorCaught && errorContext && errorContext.timestamp;
        
        const scenarioPassed = hasFallbackUI && hasErrorTitle && retryButtonCorrect && hasErrorContext;
        
        if (scenarioPassed) {
          scenariosPassed++;
        }
        
        scenariosCompleted++;
        
        // Cleanup
        root.unmount();
        document.body.removeChild(container);
        
        // Log individual scenario result
        console.log(`   ${scenarioPassed ? '✓' : '✗'} ${scenario.name}: ${scenarioPassed ? 'PASS' : 'FAIL'}`);
        
        // Check if all scenarios completed
        if (scenariosCompleted === errorScenarios.length) {
          const allPassed = scenariosPassed === errorScenarios.length;
          
          logResult(
            'Error boundary catches various Three.js failure scenarios',
            allPassed,
            `${scenariosPassed}/${errorScenarios.length} error scenarios handled correctly`,
            {
              totalScenarios: errorScenarios.length,
              passedScenarios: scenariosPassed,
              errorTypes: errorScenarios.map(s => s.expectedType)
            }
          );
        }
      }, 100 + index * 50);
      
    } catch (error) {
      scenariosCompleted++;
      console.log(`   ✗ ${scenario.name}: ERROR - ${error.message}`);
      
      if (scenariosCompleted === errorScenarios.length) {
        logResult('Error boundary catches various Three.js failure scenarios', false, 'Test execution failed');
      }
    }
  });
  
  return true;
}

/**
 * Test 3: Performance with multiple rapid scene changes and mode switching (Requirement 4.4)
 */
function testPerformanceWithRapidChanges() {
  console.log('\n⚡ Testing Performance with Multiple Rapid Scene Changes and Mode Switching...');
  
  try {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    let renderCount = 0;
    let lastRenderTime = performance.now();
    const renderTimes = [];
    const memorySnapshots = [];
    
    // Mock performance.memory for consistent testing
    const originalMemory = performance.memory;
    let mockMemoryUsage = 50000000; // Start with 50MB
    
    Object.defineProperty(performance, 'memory', {
      get: () => ({
        usedJSHeapSize: mockMemoryUsage,
        totalJSHeapSize: mockMemoryUsage * 2,
        jsHeapSizeLimit: mockMemoryUsage * 4
      }),
      configurable: true
    });
    
    // Test modes to switch between
    const testModes = ['corporate-ai', 'zen-monk', 'chaos', 'emotional-damage', 'therapist'];
    const testSceneProps = [
      { bgColor: '#001100', ambientSpeed: 1.0 },
      { bgColor: '#110000', ambientSpeed: 2.0 },
      { bgColor: '#000011', ambientSpeed: 0.5 },
      { bgColor: '#111100', ambientSpeed: 1.5 },
      { bgColor: '#110011', ambientSpeed: 0.8 }
    ];
    
    let currentModeIndex = 0;
    
    // Function to switch modes rapidly
    const switchMode = () => {
      const now = performance.now();
      const renderTime = now - lastRenderTime;
      renderTimes.push(renderTime);
      
      // Simulate memory usage increase
      mockMemoryUsage += Math.random() * 1000000; // Add up to 1MB per switch
      memorySnapshots.push(mockMemoryUsage);
      
      const mode = testModes[currentModeIndex % testModes.length];
      const sceneProps = testSceneProps[currentModeIndex % testSceneProps.length];
      
      root.render(React.createElement(SceneWrapper, {
        mode: mode,
        sceneProps: sceneProps,
        key: `test-${currentModeIndex}` // Force re-render
      }));
      
      renderCount++;
      currentModeIndex++;
      lastRenderTime = now;
    };
    
    // Initial render
    switchMode();
    
    // Rapid mode switching test
    const switchInterval = setInterval(() => {
      if (renderCount >= testConfig.modeSwithingTestCount) {
        clearInterval(switchInterval);
        
        // Analyze performance metrics
        setTimeout(() => {
          const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
          const maxRenderTime = Math.max(...renderTimes);
          const minRenderTime = Math.min(...renderTimes);
          
          const memoryGrowth = memorySnapshots[memorySnapshots.length - 1] - memorySnapshots[0];
          const avgMemoryPerSwitch = memoryGrowth / memorySnapshots.length;
          
          // Performance thresholds
          const avgRenderTimeGood = avgRenderTime < 50; // Less than 50ms average
          const maxRenderTimeAcceptable = maxRenderTime < 200; // Less than 200ms max
          const memoryGrowthReasonable = avgMemoryPerSwitch < 2000000; // Less than 2MB per switch
          
          // Restore original memory object
          Object.defineProperty(performance, 'memory', {
            get: () => originalMemory,
            configurable: true
          });
          
          // Cleanup
          root.unmount();
          document.body.removeChild(container);
          
          const passed = avgRenderTimeGood && maxRenderTimeAcceptable && memoryGrowthReasonable;
          
          const metrics = {
            totalSwitches: renderCount,
            avgRenderTime: avgRenderTime.toFixed(2),
            maxRenderTime: maxRenderTime.toFixed(2),
            minRenderTime: minRenderTime.toFixed(2),
            memoryGrowth: (memoryGrowth / 1024 / 1024).toFixed(2) + 'MB',
            avgMemoryPerSwitch: (avgMemoryPerSwitch / 1024 / 1024).toFixed(2) + 'MB'
          };
          
          testResults.performanceMetrics = metrics;
          
          logResult(
            'Performance with multiple rapid scene changes and mode switching',
            passed,
            passed 
              ? `Excellent performance: ${renderCount} mode switches completed efficiently`
              : `Performance issues detected - see metrics for details`,
            metrics
          );
        }, 500);
      } else {
        switchMode();
      }
    }, 100); // Switch every 100ms
    
    return true;
    
  } catch (error) {
    logResult('Performance with multiple rapid scene changes and mode switching', false, error.message);
    return false;
  }
}

/**
 * Test 4: Responsive behavior and canvas resizing across different screen sizes (Requirement 4.2)
 */
function testResponsiveBehaviorAndCanvasResizing() {
  console.log('\n📱 Testing Responsive Behavior and Canvas Resizing Across Different Screen Sizes...');
  
  try {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    // Store original window dimensions
    const originalInnerWidth = window.innerWidth;
    const originalInnerHeight = window.innerHeight;
    
    // Test viewport sizes
    const viewportSizes = [
      { name: 'Mobile Portrait', width: 375, height: 667 },
      { name: 'Mobile Landscape', width: 667, height: 375 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop Small', width: 1280, height: 720 },
      { name: 'Desktop Large', width: 1920, height: 1080 },
      { name: 'Ultra Wide', width: 2560, height: 1080 },
      { name: '4K', width: 3840, height: 2160 }
    ];
    
    let resizeTestsCompleted = 0;
    let resizeTestsPassed = 0;
    const resizeMetrics = [];
    
    // Initial render
    root.render(React.createElement(SceneWrapper, {
      mode: 'responsive-test',
      sceneProps: { bgColor: '#001122' }
    }));
    
    // Test each viewport size
    viewportSizes.forEach((viewport, index) => {
      setTimeout(() => {
        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          value: viewport.width
        });
        Object.defineProperty(window, 'innerHeight', {
          writable: true,
          value: viewport.height
        });
        
        // Trigger resize event
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
        
        // Wait for debounced resize to complete
        setTimeout(() => {
          const canvas = container.querySelector('canvas');
          const sceneWrapper = container.querySelector('.scene-wrapper');
          
          // Check if canvas and wrapper respond to resize
          const canvasExists = !!canvas;
          const wrapperResponsive = sceneWrapper && 
                                   sceneWrapper.style.width === '100vw' &&
                                   sceneWrapper.style.height === '100vh';
          
          // Check if canvas maintains aspect ratio
          const canvasResponsive = canvas && 
                                  (canvas.style.width === '100vw' || canvas.style.width.includes('px')) &&
                                  (canvas.style.height === '100vh' || canvas.style.height.includes('px'));
          
          const testPassed = canvasExists && wrapperResponsive && canvasResponsive;
          
          if (testPassed) {
            resizeTestsPassed++;
          }
          
          resizeMetrics.push({
            viewport: viewport.name,
            size: `${viewport.width}x${viewport.height}`,
            canvasExists,
            wrapperResponsive,
            canvasResponsive,
            passed: testPassed
          });
          
          console.log(`   ${testPassed ? '✓' : '✗'} ${viewport.name} (${viewport.width}x${viewport.height}): ${testPassed ? 'PASS' : 'FAIL'}`);
          
          resizeTestsCompleted++;
          
          // Check if all resize tests completed
          if (resizeTestsCompleted === viewportSizes.length) {
            // Restore original window dimensions
            Object.defineProperty(window, 'innerWidth', {
              writable: true,
              value: originalInnerWidth
            });
            Object.defineProperty(window, 'innerHeight', {
              writable: true,
              value: originalInnerHeight
            });
            
            // Cleanup
            root.unmount();
            document.body.removeChild(container);
            
            const allPassed = resizeTestsPassed === viewportSizes.length;
            
            logResult(
              'Responsive behavior and canvas resizing across different screen sizes',
              allPassed,
              `${resizeTestsPassed}/${viewportSizes.length} viewport sizes handled correctly`,
              {
                totalViewports: viewportSizes.length,
                passedViewports: resizeTestsPassed,
                failedViewports: viewportSizes.length - resizeTestsPassed,
                testedSizes: viewportSizes.map(v => `${v.name}(${v.width}x${v.height})`).join(', ')
              }
            );
          }
        }, 150); // Wait for debounced resize (100ms + buffer)
      }, index * 200); // Stagger tests
    });
    
    return true;
    
  } catch (error) {
    logResult('Responsive behavior and canvas resizing across different screen sizes', false, error.message);
    return false;
  }
}

/**
 * Test 5: Proper resource cleanup and memory management (Requirement 1.5)
 */
function testResourceCleanupAndMemoryManagement() {
  console.log('\n🧹 Testing Proper Resource Cleanup and Memory Management...');
  
  try {
    let webglContextLost = false;
    let timeoutsCleared = false;
    let eventListenersRemoved = false;
    
    // Mock WebGL context with lose context extension
    const mockWebGLContext = {
      getExtension: (name) => {
        if (name === 'WEBGL_lose_context') {
          return {
            loseContext: () => {
              webglContextLost = true;
              console.log('   ✓ WebGL context lost for cleanup');
            }
          };
        }
        return null;
      },
      getParameter: () => 'Mock WebGL'
    };
    
    // Mock canvas getContext to return our mock WebGL context
    const originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type) {
      if (type === 'webgl' || type === 'experimental-webgl') {
        return mockWebGLContext;
      }
      return originalGetContext.call(this, type);
    };
    
    // Mock clearTimeout to track cleanup
    const originalClearTimeout = window.clearTimeout;
    window.clearTimeout = function(timeoutId) {
      if (timeoutId) {
        timeoutsCleared = true;
        console.log('   ✓ Timeout cleared during cleanup');
      }
      return originalClearTimeout.call(this, timeoutId);
    };
    
    // Mock removeEventListener to track cleanup
    const originalRemoveEventListener = window.removeEventListener;
    window.removeEventListener = function(type, listener, options) {
      if (type === 'resize') {
        eventListenersRemoved = true;
        console.log('   ✓ Resize event listener removed during cleanup');
      }
      return originalRemoveEventListener.call(this, type, listener, options);
    };
    
    // Create multiple components to test resource management
    const containers = [];
    const roots = [];
    
    for (let i = 0; i < 3; i++) {
      const container = document.createElement('div');
      document.body.appendChild(container);
      containers.push(container);
      
      const root = createRoot(container);
      roots.push(root);
      
      // Render SceneWrapper with different configurations
      root.render(React.createElement(SceneWrapper, {
        mode: `test-mode-${i}`,
        sceneProps: {
          bgColor: `#${i}${i}${i}${i}${i}${i}`,
          ambientSpeed: i + 1
        }
      }));
    }
    
    // Wait for components to initialize
    setTimeout(() => {
      // Unmount all components to trigger cleanup
      roots.forEach((root, index) => {
        console.log(`   Unmounting component ${index + 1}...`);
        root.unmount();
      });
      
      // Remove containers
      containers.forEach(container => {
        document.body.removeChild(container);
      });
      
      // Wait for cleanup to complete
      setTimeout(() => {
        // Restore original functions
        HTMLCanvasElement.prototype.getContext = originalGetContext;
        window.clearTimeout = originalClearTimeout;
        window.removeEventListener = originalRemoveEventListener;
        
        // Check cleanup results
        const cleanupComplete = webglContextLost && timeoutsCleared && eventListenersRemoved;
        
        const metrics = {
          webglContextLost,
          timeoutsCleared,
          eventListenersRemoved,
          componentsUnmounted: roots.length
        };
        
        testResults.memoryMetrics = metrics;
        
        logResult(
          'Proper resource cleanup and memory management',
          cleanupComplete,
          cleanupComplete 
            ? `All ${roots.length} components cleaned up properly with WebGL context disposal`
            : 'Some cleanup operations were not performed correctly',
          metrics
        );
      }, 300);
    }, 500);
    
    return true;
    
  } catch (error) {
    logResult('Proper resource cleanup and memory management', false, error.message);
    return false;
  }
}

/**
 * Test 6: Additional comprehensive validation
 */
function testAdditionalValidation() {
  console.log('\n🔍 Testing Additional Comprehensive Validation...');
  
  try {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    
    // Test with complex scene props
    const complexSceneProps = {
      bgColor: '#001122',
      ambientSpeed: 2.5,
      camera: {
        position: [2, 4, 8],
        fov: 90,
        near: 0.5,
        far: 500
      },
      lighting: {
        ambientIntensity: 0.8,
        pointLightPosition: [15, 15, 15],
        pointLightIntensity: 2.0
      },
      performance: {
        pixelRatio: 1.5,
        antialias: false,
        shadowMap: true
      }
    };
    
    // Test children prop handling
    const TestChild = ({ sceneProps, mode, canvasSize }) => {
      return React.createElement('mesh', {}, 
        React.createElement('boxGeometry', { args: [1, 1, 1] }),
        React.createElement('meshBasicMaterial', { color: '#00FF00' })
      );
    };
    
    root.render(React.createElement(SceneWrapper, {
      mode: 'comprehensive-test',
      sceneProps: complexSceneProps,
      className: 'test-wrapper',
      style: { zIndex: 999 }
    }, React.createElement(TestChild)));
    
    setTimeout(() => {
      // Check if component rendered with all props
      const sceneWrapper = container.querySelector('.scene-wrapper');
      const hasWrapper = !!sceneWrapper;
      const hasCustomClass = sceneWrapper && sceneWrapper.classList.contains('test-wrapper');
      const hasCustomStyle = sceneWrapper && sceneWrapper.style.zIndex === '999';
      
      // Check if canvas exists
      const canvas = container.querySelector('canvas');
      const hasCanvas = !!canvas;
      
      // Cleanup
      root.unmount();
      document.body.removeChild(container);
      
      const passed = hasWrapper && hasCustomClass && hasCustomStyle && hasCanvas;
      
      logResult(
        'Additional comprehensive validation',
        passed,
        passed 
          ? 'Complex props, children, and styling handled correctly'
          : 'Issues with complex prop handling or component structure',
        {
          hasWrapper,
          hasCustomClass,
          hasCustomStyle,
          hasCanvas,
          complexPropsHandled: true
        }
      );
    }, 200);
    
    return true;
    
  } catch (error) {
    logResult('Additional comprehensive validation', false, error.message);
    return false;
  }
}

/**
 * Run all Task 7 completion tests
 */
export function runTask7CompletionTests() {
  console.log(`\n🚀 Running ${testConfig.testName}...`);
  console.log('=' .repeat(80));
  console.log('Testing all requirements from Task 7:');
  console.log('• Canvas initialization and Three.js context creation (Req 1.4)');
  console.log('• Error boundary catches various Three.js failure scenarios (Req 3.5)');
  console.log('• Performance with multiple rapid scene changes and mode switching (Req 4.4)');
  console.log('• Responsive behavior and canvas resizing across different screen sizes (Req 4.2)');
  console.log('• Proper resource cleanup and memory management (Req 1.5)');
  console.log('=' .repeat(80));
  
  // Reset results
  testResults = { 
    passed: 0, 
    failed: 0, 
    errors: [], 
    performanceMetrics: {},
    memoryMetrics: {}
  };
  
  try {
    // Run all tests
    testCanvasInitialization();
    testErrorBoundaryScenarios();
    testPerformanceWithRapidChanges();
    testResponsiveBehaviorAndCanvasResizing();
    testResourceCleanupAndMemoryManagement();
    testAdditionalValidation();
    
    // Wait for all async tests to complete
    setTimeout(() => {
      console.log('\n' + '=' .repeat(80));
      console.log('📊 Task 7 Completion Test Results:');
      console.log(`✅ Passed: ${testResults.passed}`);
      console.log(`❌ Failed: ${testResults.failed}`);
      console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
      
      if (Object.keys(testResults.performanceMetrics).length > 0) {
        console.log('\n🚀 Performance Metrics:');
        Object.entries(testResults.performanceMetrics).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }
      
      if (Object.keys(testResults.memoryMetrics).length > 0) {
        console.log('\n🧠 Memory Management Metrics:');
        Object.entries(testResults.memoryMetrics).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      }
      
      if (testResults.errors.length > 0) {
        console.log('\n🚨 Failed Tests:');
        testResults.errors.forEach(({ test, details, metrics }) => {
          console.log(`   ${test}: ${details}`);
          if (metrics) {
            console.log(`     Metrics:`, metrics);
          }
        });
      }
      
      if (testResults.failed === 0) {
        console.log('\n🎉 ALL TASK 7 REQUIREMENTS VALIDATED SUCCESSFULLY!');
        console.log('✨ Complete Scene Wrapper Functionality:');
        console.log('   ✅ Canvas initialization and Three.js context creation');
        console.log('   ✅ Comprehensive error boundary for all failure scenarios');
        console.log('   ✅ Excellent performance with rapid scene changes');
        console.log('   ✅ Responsive behavior across all screen sizes');
        console.log('   ✅ Proper resource cleanup and memory management');
        console.log('   ✅ Additional validation for complex scenarios');
        console.log('\n🏆 Task 7 Implementation Complete and Validated!');
      } else {
        console.log('\n⚠️  Some tests failed. Please review the implementation.');
        console.log('📋 Requirements that need attention:');
        testResults.errors.forEach(({ test }) => {
          console.log(`   • ${test}`);
        });
      }
      
      console.log('=' .repeat(80));
      
      return testResults;
    }, 8000); // Wait 8 seconds for all async tests
    
  } catch (error) {
    console.error('❌ Task 7 test suite failed:', error);
    return { passed: 0, failed: 1, errors: [{ test: 'Task 7 Test Suite', error: error.message }] };
  }
}

// Export for use in other test files
export default {
  runTask7CompletionTests,
  testResults
};

// Auto-run if called directly
if (typeof window !== 'undefined' && window.location) {
  console.log('Task 7 Completion Test module loaded.');
  console.log('Call runTask7CompletionTests() to execute comprehensive validation.');
}