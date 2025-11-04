/**
 * Simple test runner for resource cleanup validation
 * Node.js compatible version
 */

// Mock browser APIs for Node.js testing
global.performance = global.performance || {
  now: () => Date.now(),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
    totalJSHeapSize: 100 * 1024 * 1024, // 100MB
    jsHeapSizeLimit: 2 * 1024 * 1024 * 1024 // 2GB
  }
};

global.window = global.window || {
  devicePixelRatio: 1,
  addEventListener: () => {},
  removeEventListener: () => {}
};

// Simple test implementation
async function testResourceCleanupBasics() {
  console.log('🧪 Testing basic resource cleanup functionality...');
  
  try {
    // Import the resource cleanup utilities
    const resourceCleanup = await import('../../utils/resourceCleanup.js');
    const { 
      threeJSResourceManager, 
      componentCacheManager, 
      memoryMonitor,
      cleanupAllResources 
    } = resourceCleanup;

    console.log('✅ Successfully imported resource cleanup utilities');

    // Test 1: Resource tracking
    console.log('\n📊 Test 1: Resource Tracking');
    const mockGeometry = { dispose: () => console.log('Disposed geometry') };
    const mockMaterial = { dispose: () => console.log('Disposed material') };
    
    threeJSResourceManager.trackResource('test-geometry', mockGeometry, 'geometry');
    threeJSResourceManager.trackResource('test-material', mockMaterial, 'material');
    
    const stats1 = threeJSResourceManager.getMemoryStats();
    console.log(`   Tracked resources: ${stats1.trackedResources}`);
    console.log(`   Estimated memory: ${stats1.totalMemoryMB}MB`);

    // Test 2: Component caching
    console.log('\n📊 Test 2: Component Caching');
    const mockComponent = {
      scene: { dispose: () => {} },
      character: { dispose: () => {} },
      config: { modeName: 'test' }
    };
    
    componentCacheManager.set('test-component', mockComponent);
    const cacheStats = componentCacheManager.getStats();
    console.log(`   Cache size: ${cacheStats.size}`);
    console.log(`   Cache memory: ${cacheStats.totalMemoryMB}MB`);

    // Test 3: Memory monitoring
    console.log('\n📊 Test 3: Memory Monitoring');
    const memoryInfo = memoryMonitor.getMemoryInfo();
    console.log(`   Memory pressure: ${memoryInfo.memoryPressure}%`);
    console.log(`   Browser memory: ${memoryInfo.browserMemory?.used || 'N/A'}MB`);

    // Test 4: Resource disposal
    console.log('\n📊 Test 4: Resource Disposal');
    const disposedCount = threeJSResourceManager.disposeResource('test-geometry');
    console.log(`   Disposed resource: ${disposedCount ? 'Success' : 'Failed'}`);

    // Test 5: Comprehensive cleanup
    console.log('\n📊 Test 5: Comprehensive Cleanup');
    const cleanupStats = cleanupAllResources();
    console.log(`   Cleanup completed:`, cleanupStats);

    const finalStats = threeJSResourceManager.getMemoryStats();
    console.log(`   Final tracked resources: ${finalStats.trackedResources}`);

    console.log('\n✅ All basic resource cleanup tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Resource cleanup test failed:', error);
    return false;
  }
}

// Test mode switching simulation
async function testModeSwitchingSimulation() {
  console.log('\n🧪 Testing mode switching simulation...');
  
  try {
    const resourceCleanup = await import('../../utils/resourceCleanup.js');
    const { threeJSResourceManager, componentCacheManager } = resourceCleanup;

    const modes = ['corporate-ai', 'zen-monk', 'chaos'];
    const switchCount = 5;

    console.log(`🔄 Simulating ${switchCount} mode switches...`);

    for (let i = 0; i < switchCount; i++) {
      const currentMode = modes[i % modes.length];
      console.log(`   Switch ${i + 1}: Loading ${currentMode}`);

      // Simulate loading resources
      const mockScene = { dispose: () => console.log(`Disposed scene for ${currentMode}`) };
      const mockCharacter = { dispose: () => console.log(`Disposed character for ${currentMode}`) };

      threeJSResourceManager.trackResource(`scene-${currentMode}-${i}`, mockScene, 'geometry');
      threeJSResourceManager.trackResource(`character-${currentMode}-${i}`, mockCharacter, 'material');

      componentCacheManager.set(`components-${currentMode}`, {
        scene: mockScene,
        character: mockCharacter,
        config: { modeName: currentMode }
      });

      // Simulate cleanup of previous mode
      if (i > 0) {
        const prevMode = modes[(i - 1) % modes.length];
        threeJSResourceManager.disposeModeResources(prevMode);
      }

      // Check memory stats
      const stats = threeJSResourceManager.getMemoryStats();
      console.log(`     Resources: ${stats.trackedResources}, Memory: ${stats.totalMemoryMB}MB`);
    }

    // Final cleanup
    const finalCleanup = threeJSResourceManager.disposeAllResources();
    componentCacheManager.clear();

    console.log(`✅ Mode switching simulation completed. Cleaned ${finalCleanup} resources.`);
    return true;

  } catch (error) {
    console.error('❌ Mode switching simulation failed:', error);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Resource Cleanup Validation Tests\n');
  
  const results = {
    basicTests: false,
    modeSwitching: false
  };

  // Run basic tests
  results.basicTests = await testResourceCleanupBasics();
  
  // Run mode switching simulation
  results.modeSwitching = await testModeSwitchingSimulation();

  // Summary
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log('\n=== TEST SUMMARY ===');
  console.log(`Tests passed: ${passedTests}/${totalTests}`);
  console.log(`Basic functionality: ${results.basicTests ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Mode switching: ${results.modeSwitching ? '✅ PASSED' : '❌ FAILED'}`);
  
  const allPassed = passedTests === totalTests;
  console.log(`\nOverall result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  return allPassed;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
    .then(success => process.exit(success ? 0 : 1))
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

export { runTests, testResourceCleanupBasics, testModeSwitchingSimulation };