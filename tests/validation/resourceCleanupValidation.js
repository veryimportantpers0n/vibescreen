/**
 * Resource cleanup and memory management validation tests
 * Tests mode switching performance and memory usage across multiple rapid switches
 */

import { 
  threeJSResourceManager, 
  componentCacheManager, 
  memoryMonitor,
  cleanupAllResources 
} from '../../utils/resourceCleanup.js';

/**
 * Performance test configuration
 */
const TEST_CONFIG = {
  rapidSwitchCount: 20,
  switchDelay: 100, // 100ms between switches
  memoryCheckInterval: 1000, // Check memory every second
  maxMemoryIncreaseMB: 20, // Maximum allowed memory increase during test
  testModes: ['corporate-ai', 'zen-monk', 'chaos'],
  maxTestDurationMs: 30000 // 30 second timeout
};

/**
 * Memory tracking utilities
 */
class MemoryTracker {
  constructor() {
    this.snapshots = [];
    this.startMemory = null;
    this.peakMemory = null;
  }

  takeSnapshot(label = '') {
    const snapshot = {
      timestamp: Date.now(),
      label,
      browserMemory: this.getBrowserMemory(),
      threeJSMemory: threeJSResourceManager.getMemoryStats(),
      cacheMemory: componentCacheManager.getStats(),
      resourceCount: threeJSResourceManager.trackedResources.size
    };

    this.snapshots.push(snapshot);

    // Update peak memory
    if (!this.peakMemory || snapshot.browserMemory.used > this.peakMemory.used) {
      this.peakMemory = snapshot.browserMemory;
    }

    return snapshot;
  }

  getBrowserMemory() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return { used: 0, total: 0, limit: 0 };
  }

  getMemoryIncrease() {
    if (!this.startMemory || this.snapshots.length === 0) return 0;
    
    const latest = this.snapshots[this.snapshots.length - 1];
    return latest.browserMemory.used - this.startMemory.used;
  }

  generateReport() {
    const latest = this.snapshots[this.snapshots.length - 1];
    const memoryIncrease = this.getMemoryIncrease();

    return {
      startMemory: this.startMemory,
      endMemory: latest?.browserMemory,
      peakMemory: this.peakMemory,
      memoryIncrease,
      totalSnapshots: this.snapshots.length,
      testDuration: latest ? latest.timestamp - this.snapshots[0].timestamp : 0,
      snapshots: this.snapshots,
      passed: memoryIncrease <= TEST_CONFIG.maxMemoryIncreaseMB
    };
  }

  reset() {
    this.snapshots = [];
    this.startMemory = null;
    this.peakMemory = null;
  }
}

/**
 * Mock mode loader for testing
 */
class MockModeLoader {
  constructor() {
    this.loadedModes = new Set();
    this.loadCount = 0;
  }

  async loadMode(modeId) {
    this.loadCount++;
    
    // Simulate component loading
    const mockScene = {
      dispose: () => console.log(`Disposed scene for ${modeId}`)
    };
    
    const mockCharacter = {
      dispose: () => console.log(`Disposed character for ${modeId}`)
    };

    // Track resources in the resource manager
    threeJSResourceManager.trackResource(`scene-${modeId}-${this.loadCount}`, mockScene, 'geometry');
    threeJSResourceManager.trackResource(`character-${modeId}-${this.loadCount}`, mockCharacter, 'material');

    // Add to cache
    componentCacheManager.set(`components-${modeId}`, {
      scene: mockScene,
      character: mockCharacter,
      config: { modeName: modeId }
    });

    this.loadedModes.add(modeId);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return { scene: mockScene, character: mockCharacter };
  }

  unloadMode(modeId) {
    // Cleanup resources for this mode
    threeJSResourceManager.disposeModeResources(modeId);
    componentCacheManager.delete(`components-${modeId}`);
    this.loadedModes.delete(modeId);
  }

  unloadAll() {
    this.loadedModes.forEach(modeId => this.unloadMode(modeId));
    this.loadedModes.clear();
  }
}

/**
 * Test rapid mode switching performance
 */
async function testRapidModeSwitching() {
  console.log('🧪 Starting rapid mode switching test...');
  
  const memoryTracker = new MemoryTracker();
  const mockLoader = new MockModeLoader();
  const results = {
    passed: false,
    errors: [],
    warnings: [],
    performance: {},
    memory: {}
  };

  try {
    // Initialize memory monitoring
    memoryMonitor.startMonitoring();
    
    // Take initial memory snapshot
    memoryTracker.startMemory = memoryTracker.getBrowserMemory();
    memoryTracker.takeSnapshot('test-start');

    console.log(`📊 Initial memory: ${memoryTracker.startMemory.used}MB`);

    // Perform rapid mode switches
    const startTime = performance.now();
    
    for (let i = 0; i < TEST_CONFIG.rapidSwitchCount; i++) {
      const modeIndex = i % TEST_CONFIG.testModes.length;
      const currentMode = TEST_CONFIG.testModes[modeIndex];
      
      console.log(`🔄 Switch ${i + 1}/${TEST_CONFIG.rapidSwitchCount}: Loading ${currentMode}`);
      
      // Load new mode
      await mockLoader.loadMode(currentMode);
      
      // Take memory snapshot every few switches
      if (i % 5 === 0) {
        memoryTracker.takeSnapshot(`switch-${i + 1}`);
      }
      
      // Cleanup previous mode to simulate real usage
      if (i > 0) {
        const prevModeIndex = (i - 1) % TEST_CONFIG.testModes.length;
        const prevMode = TEST_CONFIG.testModes[prevModeIndex];
        mockLoader.unloadMode(prevMode);
      }
      
      // Wait between switches
      await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.switchDelay));
      
      // Check for timeout
      if (performance.now() - startTime > TEST_CONFIG.maxTestDurationMs) {
        results.warnings.push('Test timed out before completing all switches');
        break;
      }
    }

    const endTime = performance.now();
    const testDuration = endTime - startTime;

    // Take final memory snapshot
    memoryTracker.takeSnapshot('test-end');

    // Generate memory report
    const memoryReport = memoryTracker.generateReport();
    
    // Performance metrics
    const avgSwitchTime = testDuration / TEST_CONFIG.rapidSwitchCount;
    const switchesPerSecond = (TEST_CONFIG.rapidSwitchCount / testDuration) * 1000;

    results.performance = {
      totalDuration: testDuration,
      avgSwitchTime,
      switchesPerSecond,
      totalSwitches: TEST_CONFIG.rapidSwitchCount
    };

    results.memory = memoryReport;

    // Validate performance requirements
    if (avgSwitchTime > 500) { // 500ms per switch is too slow
      results.errors.push(`Average switch time too slow: ${avgSwitchTime.toFixed(2)}ms > 500ms`);
    }

    // Validate memory requirements
    if (memoryReport.memoryIncrease > TEST_CONFIG.maxMemoryIncreaseMB) {
      results.errors.push(`Memory increase too high: ${memoryReport.memoryIncrease}MB > ${TEST_CONFIG.maxMemoryIncreaseMB}MB`);
    }

    // Check resource cleanup
    const finalResourceCount = threeJSResourceManager.trackedResources.size;
    if (finalResourceCount > 10) { // Should have cleaned up most resources
      results.warnings.push(`High resource count after cleanup: ${finalResourceCount} resources still tracked`);
    }

    // Check cache size
    const finalCacheSize = componentCacheManager.cache.size;
    if (finalCacheSize > TEST_CONFIG.testModes.length + 2) { // Allow some caching
      results.warnings.push(`High cache size after cleanup: ${finalCacheSize} items cached`);
    }

    results.passed = results.errors.length === 0;

    console.log(`✅ Rapid switching test completed:`);
    console.log(`   Duration: ${testDuration.toFixed(2)}ms`);
    console.log(`   Avg switch time: ${avgSwitchTime.toFixed(2)}ms`);
    console.log(`   Memory increase: ${memoryReport.memoryIncrease}MB`);
    console.log(`   Resources tracked: ${finalResourceCount}`);
    console.log(`   Cache size: ${finalCacheSize}`);

  } catch (error) {
    results.errors.push(`Test execution failed: ${error.message}`);
    console.error('❌ Rapid switching test failed:', error);
  } finally {
    // Cleanup
    mockLoader.unloadAll();
    cleanupAllResources();
    memoryMonitor.stopMonitoring();
  }

  return results;
}

/**
 * Test memory leak detection
 */
async function testMemoryLeakDetection() {
  console.log('🧪 Starting memory leak detection test...');
  
  const memoryTracker = new MemoryTracker();
  const mockLoader = new MockModeLoader();
  const results = {
    passed: false,
    errors: [],
    warnings: [],
    leakDetected: false,
    memoryGrowth: []
  };

  try {
    // Take baseline memory measurement
    memoryTracker.startMemory = memoryTracker.getBrowserMemory();
    memoryTracker.takeSnapshot('baseline');

    // Perform multiple load/unload cycles
    const cycles = 10;
    const modesPerCycle = TEST_CONFIG.testModes.length;

    for (let cycle = 0; cycle < cycles; cycle++) {
      console.log(`🔄 Memory leak test cycle ${cycle + 1}/${cycles}`);
      
      // Load all modes
      for (const modeId of TEST_CONFIG.testModes) {
        await mockLoader.loadMode(modeId);
      }
      
      // Take memory snapshot after loading
      const loadSnapshot = memoryTracker.takeSnapshot(`cycle-${cycle + 1}-loaded`);
      
      // Unload all modes
      mockLoader.unloadAll();
      
      // Force cleanup
      cleanupAllResources();
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc();
      }
      
      // Wait for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Take memory snapshot after cleanup
      const cleanupSnapshot = memoryTracker.takeSnapshot(`cycle-${cycle + 1}-cleaned`);
      
      // Check for memory growth
      const memoryGrowth = cleanupSnapshot.browserMemory.used - memoryTracker.startMemory.used;
      results.memoryGrowth.push(memoryGrowth);
      
      console.log(`   Memory after cycle ${cycle + 1}: ${cleanupSnapshot.browserMemory.used}MB (growth: ${memoryGrowth}MB)`);
      
      // Detect potential leak (consistent growth over cycles)
      if (cycle >= 3) { // Check after a few cycles
        const recentGrowth = results.memoryGrowth.slice(-3);
        const avgGrowth = recentGrowth.reduce((sum, growth) => sum + growth, 0) / recentGrowth.length;
        
        if (avgGrowth > 2) { // 2MB average growth indicates potential leak
          results.leakDetected = true;
          results.errors.push(`Potential memory leak detected: ${avgGrowth.toFixed(2)}MB average growth`);
          break;
        }
      }
    }

    // Final analysis
    const finalMemory = memoryTracker.snapshots[memoryTracker.snapshots.length - 1].browserMemory;
    const totalGrowth = finalMemory.used - memoryTracker.startMemory.used;
    
    if (totalGrowth > 5) { // 5MB total growth is concerning
      results.warnings.push(`Significant memory growth detected: ${totalGrowth}MB`);
    }

    results.passed = results.errors.length === 0;

    console.log(`✅ Memory leak detection completed:`);
    console.log(`   Total memory growth: ${totalGrowth}MB`);
    console.log(`   Leak detected: ${results.leakDetected ? 'YES' : 'NO'}`);

  } catch (error) {
    results.errors.push(`Memory leak test failed: ${error.message}`);
    console.error('❌ Memory leak test failed:', error);
  } finally {
    // Cleanup
    mockLoader.unloadAll();
    cleanupAllResources();
  }

  return results;
}

/**
 * Test resource cleanup effectiveness
 */
async function testResourceCleanup() {
  console.log('🧪 Starting resource cleanup effectiveness test...');
  
  const results = {
    passed: false,
    errors: [],
    warnings: [],
    cleanup: {}
  };

  try {
    // Track initial state
    const initialResourceCount = threeJSResourceManager.trackedResources.size;
    const initialCacheSize = componentCacheManager.cache.size;

    console.log(`📊 Initial state: ${initialResourceCount} resources, ${initialCacheSize} cached items`);

    // Create test resources
    const testResources = [];
    for (let i = 0; i < 20; i++) {
      const mockGeometry = { dispose: () => console.log(`Disposed geometry ${i}`) };
      const mockMaterial = { dispose: () => console.log(`Disposed material ${i}`) };
      
      threeJSResourceManager.trackResource(`test-geometry-${i}`, mockGeometry, 'geometry');
      threeJSResourceManager.trackResource(`test-material-${i}`, mockMaterial, 'material');
      
      testResources.push({ geometry: mockGeometry, material: mockMaterial });
    }

    // Add test items to cache
    for (let i = 0; i < 10; i++) {
      componentCacheManager.set(`test-component-${i}`, {
        scene: { dispose: () => {} },
        character: { dispose: () => {} }
      });
    }

    const afterCreationResourceCount = threeJSResourceManager.trackedResources.size;
    const afterCreationCacheSize = componentCacheManager.cache.size;

    console.log(`📊 After creation: ${afterCreationResourceCount} resources, ${afterCreationCacheSize} cached items`);

    // Test selective cleanup
    const disposedResources = threeJSResourceManager.disposeModeResources('test');
    console.log(`🧹 Disposed ${disposedResources} test resources`);

    // Test cache cleanup
    const cleanedCacheItems = componentCacheManager.cleanupOld(0); // Clean all items
    console.log(`🧹 Cleaned ${cleanedCacheItems} cache items`);

    // Test comprehensive cleanup
    const cleanupStats = cleanupAllResources();
    console.log(`🧹 Comprehensive cleanup:`, cleanupStats);

    const finalResourceCount = threeJSResourceManager.trackedResources.size;
    const finalCacheSize = componentCacheManager.cache.size;

    console.log(`📊 Final state: ${finalResourceCount} resources, ${finalCacheSize} cached items`);

    // Validate cleanup effectiveness
    results.cleanup = {
      initialResources: initialResourceCount,
      createdResources: afterCreationResourceCount - initialResourceCount,
      disposedResources,
      finalResources: finalResourceCount,
      initialCache: initialCacheSize,
      createdCacheItems: afterCreationCacheSize - initialCacheSize,
      cleanedCacheItems,
      finalCache: finalCacheSize
    };

    // Check if cleanup was effective
    if (finalResourceCount > initialResourceCount + 5) {
      results.errors.push(`Resource cleanup ineffective: ${finalResourceCount} resources remaining`);
    }

    if (finalCacheSize > initialCacheSize + 2) {
      results.errors.push(`Cache cleanup ineffective: ${finalCacheSize} items remaining`);
    }

    results.passed = results.errors.length === 0;

    console.log(`✅ Resource cleanup test completed: ${results.passed ? 'PASSED' : 'FAILED'}`);

  } catch (error) {
    results.errors.push(`Resource cleanup test failed: ${error.message}`);
    console.error('❌ Resource cleanup test failed:', error);
  }

  return results;
}

/**
 * Run all resource cleanup validation tests
 */
export async function runResourceCleanupValidation() {
  console.log('🚀 Starting comprehensive resource cleanup validation...');
  
  const testResults = {
    rapidSwitching: null,
    memoryLeak: null,
    resourceCleanup: null,
    overall: {
      passed: false,
      errors: [],
      warnings: [],
      summary: {}
    }
  };

  try {
    // Run rapid switching test
    console.log('\n=== RAPID MODE SWITCHING TEST ===');
    testResults.rapidSwitching = await testRapidModeSwitching();
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Run memory leak detection test
    console.log('\n=== MEMORY LEAK DETECTION TEST ===');
    testResults.memoryLeak = await testMemoryLeakDetection();
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Run resource cleanup test
    console.log('\n=== RESOURCE CLEANUP EFFECTIVENESS TEST ===');
    testResults.resourceCleanup = await testResourceCleanup();

    // Compile overall results
    const allTests = [testResults.rapidSwitching, testResults.memoryLeak, testResults.resourceCleanup];
    const passedTests = allTests.filter(test => test.passed).length;
    const totalErrors = allTests.reduce((sum, test) => sum + test.errors.length, 0);
    const totalWarnings = allTests.reduce((sum, test) => sum + test.warnings.length, 0);

    testResults.overall.passed = passedTests === allTests.length;
    testResults.overall.errors = allTests.flatMap(test => test.errors);
    testResults.overall.warnings = allTests.flatMap(test => test.warnings);
    testResults.overall.summary = {
      totalTests: allTests.length,
      passedTests,
      failedTests: allTests.length - passedTests,
      totalErrors,
      totalWarnings
    };

    // Generate final report
    console.log('\n=== RESOURCE CLEANUP VALIDATION SUMMARY ===');
    console.log(`Tests: ${passedTests}/${allTests.length} passed`);
    console.log(`Errors: ${totalErrors}`);
    console.log(`Warnings: ${totalWarnings}`);
    console.log(`Overall: ${testResults.overall.passed ? '✅ PASSED' : '❌ FAILED'}`);

    if (testResults.overall.errors.length > 0) {
      console.log('\nErrors:');
      testResults.overall.errors.forEach(error => console.log(`  ❌ ${error}`));
    }

    if (testResults.overall.warnings.length > 0) {
      console.log('\nWarnings:');
      testResults.overall.warnings.forEach(warning => console.log(`  ⚠️ ${warning}`));
    }

  } catch (error) {
    testResults.overall.errors.push(`Validation suite failed: ${error.message}`);
    console.error('❌ Resource cleanup validation suite failed:', error);
  }

  return testResults;
}

// Export individual test functions for targeted testing
export {
  testRapidModeSwitching,
  testMemoryLeakDetection,
  testResourceCleanup,
  MemoryTracker,
  MockModeLoader
};