/**
 * Comprehensive test suite for data loading resilience and error handling
 * Tests various failure scenarios to ensure application stability
 */

import { 
  loadGlobalConfig, 
  loadMessages, 
  loadAllMessages, 
  initializeApplicationData,
  getConfigValue,
  clearDataCache,
  getDataLoadingHealth,
  dataLoadingLogger
} from './dataLoader.js';

/**
 * Test scenarios for data loading resilience
 */
const TEST_SCENARIOS = {
  MISSING_FILES: 'missing_files',
  CORRUPTED_JSON: 'corrupted_json',
  NETWORK_FAILURE: 'network_failure',
  INVALID_DATA: 'invalid_data',
  PARTIAL_FAILURE: 'partial_failure',
  CACHE_CORRUPTION: 'cache_corruption',
  CONCURRENT_LOADING: 'concurrent_loading',
  RECOVERY_TESTING: 'recovery_testing'
};

/**
 * Mock file system for testing failure scenarios
 */
class MockFileSystem {
  constructor() {
    this.files = new Map();
    this.failures = new Map();
    this.networkDelay = 0;
    this.networkFailure = false;
  }

  setFile(path, content) {
    this.files.set(path, content);
  }

  setFailure(path, errorType) {
    this.failures.set(path, errorType);
  }

  setNetworkDelay(delay) {
    this.networkDelay = delay;
  }

  setNetworkFailure(shouldFail) {
    this.networkFailure = shouldFail;
  }

  async readFile(path) {
    // Simulate network delay
    if (this.networkDelay > 0) {
      await new Promise(resolve => setTimeout(resolve, this.networkDelay));
    }

    // Simulate network failure
    if (this.networkFailure) {
      throw new Error('Network connection failed');
    }

    // Check for specific file failures
    const failureType = this.failures.get(path);
    if (failureType) {
      switch (failureType) {
        case 'not_found':
          const error = new Error(`File not found: ${path}`);
          error.code = 'ENOENT';
          throw error;
        case 'permission_denied':
          const permError = new Error(`Permission denied: ${path}`);
          permError.code = 'EACCES';
          throw permError;
        case 'corrupted':
          throw new Error('File is corrupted or unreadable');
        default:
          throw new Error(`Unknown failure type: ${failureType}`);
      }
    }

    // Return file content if available
    if (this.files.has(path)) {
      return this.files.get(path);
    }

    // Default file not found
    const error = new Error(`File not found: ${path}`);
    error.code = 'ENOENT';
    throw error;
  }

  clear() {
    this.files.clear();
    this.failures.clear();
    this.networkDelay = 0;
    this.networkFailure = false;
  }
}

/**
 * Test runner for data loading resilience
 */
class DataLoadingResilienceTest {
  constructor() {
    this.mockFS = new MockFileSystem();
    this.testResults = [];
    this.originalFetch = null;
  }

  /**
   * Sets up test environment with mock data
   */
  setupTestEnvironment() {
    // Valid test data
    const validConfig = {
      defaultMinDelaySeconds: 15,
      defaultMaxDelaySeconds: 45,
      defaultPopupStyle: "overlay",
      animationSpeedMultiplier: 1.0,
      messageCategories: {
        cliche: { weight: 0.6, description: "Standard AI responses" },
        exaggeration: { weight: 0.2, description: "Humorous AI lines" },
        other: { weight: 0.2, description: "Neutral variations" }
      }
    };

    const validMessages = [
      "Test message 1",
      "Test message 2", 
      "Test message 3"
    ];

    // Set up valid files
    this.mockFS.setFile('data/global-config.json', JSON.stringify(validConfig));
    this.mockFS.setFile('data/master-messages/funny-exaggerations.json', JSON.stringify(validMessages));
    this.mockFS.setFile('data/master-messages/cliche-ai-phrases.json', JSON.stringify(validMessages));
    this.mockFS.setFile('data/master-messages/cliche-ai-things.json', JSON.stringify(validMessages));

    // Mock fetch for browser environment
    if (typeof window !== 'undefined') {
      this.originalFetch = window.fetch;
      window.fetch = this.mockFetch.bind(this);
    }
  }

  /**
   * Mock fetch implementation for testing
   */
  async mockFetch(url) {
    try {
      const content = await this.mockFS.readFile(url.replace('/', ''));
      return {
        ok: true,
        status: 200,
        json: async () => JSON.parse(content)
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          ok: false,
          status: 404,
          statusText: 'Not Found'
        };
      }
      throw error;
    }
  }

  /**
   * Restores original environment
   */
  teardownTestEnvironment() {
    this.mockFS.clear();
    
    if (typeof window !== 'undefined' && this.originalFetch) {
      window.fetch = this.originalFetch;
    }
  }

  /**
   * Runs a single test scenario
   */
  async runTestScenario(scenarioName, testFunction) {
    console.log(`\n🧪 Testing: ${scenarioName}`);
    
    const startTime = Date.now();
    let result;
    
    try {
      // Clear cache before each test
      clearDataCache();
      dataLoadingLogger.clearLogs();
      
      result = await testFunction();
      
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        scenario: scenarioName,
        success: result.success,
        duration,
        details: result.details,
        errors: result.errors || [],
        warnings: result.warnings || []
      });
      
      console.log(`   ${result.success ? '✅' : '❌'} ${scenarioName}: ${result.success ? 'PASS' : 'FAIL'} (${duration}ms)`);
      
      if (result.details) {
        console.log(`   Details: ${result.details}`);
      }
      
      if (result.errors && result.errors.length > 0) {
        console.log(`   Errors: ${result.errors.length}`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        scenario: scenarioName,
        success: false,
        duration,
        error: error.message,
        stack: error.stack
      });
      
      console.log(`   ❌ ${scenarioName}: FAIL (${duration}ms) - ${error.message}`);
    }
  }

  /**
   * Test missing configuration file
   */
  async testMissingConfigFile() {
    this.mockFS.setFailure('data/global-config.json', 'not_found');
    
    const config = await loadGlobalConfig(true);
    
    return {
      success: config && config._isFallback === true,
      details: `Fallback config loaded: ${!!config}`,
      errors: config ? [] : ['Failed to load fallback config']
    };
  }

  /**
   * Test corrupted JSON files
   */
  async testCorruptedJSON() {
    // Set corrupted JSON content
    this.mockFS.setFile('data/global-config.json', '{"invalid": json syntax}');
    this.mockFS.setFile('data/master-messages/funny-exaggerations.json', '[invalid json array');
    
    const config = await loadGlobalConfig(true);
    const messages = await loadMessages('funny-exaggerations', true);
    
    return {
      success: config && config._isFallback && messages && messages.usingFallback,
      details: `Config fallback: ${config?._isFallback}, Messages fallback: ${messages?.usingFallback}`,
      errors: []
    };
  }

  /**
   * Test network failure scenarios
   */
  async testNetworkFailure() {
    this.mockFS.setNetworkFailure(true);
    
    const config = await loadGlobalConfig(true);
    const messages = await loadAllMessages(true);
    
    return {
      success: config && messages && messages.success,
      details: `Network failure handled gracefully`,
      errors: []
    };
  }

  /**
   * Test invalid data structures
   */
  async testInvalidDataStructures() {
    // Set invalid data structures
    this.mockFS.setFile('data/global-config.json', JSON.stringify({
      defaultMinDelaySeconds: "not a number",
      defaultMaxDelaySeconds: -100,
      defaultPopupStyle: "invalid_style",
      animationSpeedMultiplier: "also not a number"
    }));
    
    this.mockFS.setFile('data/master-messages/funny-exaggerations.json', JSON.stringify({
      "not": "an array"
    }));
    
    const config = await loadGlobalConfig(true);
    const messages = await loadMessages('funny-exaggerations', true);
    
    // Check if values were sanitized properly
    const validConfig = config && 
      typeof config.defaultMinDelaySeconds === 'number' &&
      typeof config.defaultMaxDelaySeconds === 'number' &&
      config.defaultMinDelaySeconds > 0 &&
      config.defaultMaxDelaySeconds > config.defaultMinDelaySeconds;
    
    return {
      success: validConfig && messages && messages.usingFallback,
      details: `Config sanitized: ${validConfig}, Messages fallback: ${messages?.usingFallback}`,
      errors: []
    };
  }

  /**
   * Test partial failure scenarios
   */
  async testPartialFailure() {
    // Make some files fail, others succeed
    this.mockFS.setFailure('data/master-messages/funny-exaggerations.json', 'not_found');
    // cliche-ai-phrases.json and cliche-ai-things.json should load normally
    
    const allMessages = await loadAllMessages(true);
    
    const partialSuccess = allMessages && 
      allMessages.results &&
      allMessages.results['funny-exaggerations']?.usingFallback &&
      !allMessages.results['cliche-ai-phrases']?.usingFallback &&
      !allMessages.results['cliche-ai-things']?.usingFallback;
    
    return {
      success: partialSuccess,
      details: `Partial loading handled correctly`,
      errors: []
    };
  }

  /**
   * Test cache corruption scenarios
   */
  async testCacheCorruption() {
    // Load data normally first
    await loadGlobalConfig();
    await loadAllMessages();
    
    // Simulate cache corruption by clearing and loading with failures
    clearDataCache();
    this.mockFS.setFailure('data/global-config.json', 'corrupted');
    
    const config = await loadGlobalConfig();
    
    return {
      success: config && config._isFallback,
      details: `Cache corruption handled with fallback`,
      errors: []
    };
  }

  /**
   * Test concurrent loading scenarios
   */
  async testConcurrentLoading() {
    // Simulate network delay
    this.mockFS.setNetworkDelay(100);
    
    // Start multiple concurrent loads
    const promises = [
      loadGlobalConfig(true),
      loadMessages('funny-exaggerations', true),
      loadMessages('cliche-ai-phrases', true),
      loadMessages('cliche-ai-things', true),
      initializeApplicationData({ forceReload: true })
    ];
    
    const results = await Promise.all(promises);
    
    const allSuccessful = results.every(result => 
      result && (result.success !== false)
    );
    
    return {
      success: allSuccessful,
      details: `Concurrent loading completed successfully`,
      errors: []
    };
  }

  /**
   * Test error recovery mechanisms
   */
  async testErrorRecovery() {
    // First, cause failures
    this.mockFS.setFailure('data/global-config.json', 'not_found');
    this.mockFS.setFailure('data/master-messages/funny-exaggerations.json', 'not_found');
    
    // Try to load (should use fallbacks)
    const failedConfig = await loadGlobalConfig(true);
    const failedMessages = await loadMessages('funny-exaggerations', true);
    
    // Now fix the files
    this.mockFS.setFailure('data/global-config.json', null);
    this.mockFS.setFailure('data/master-messages/funny-exaggerations.json', null);
    
    // Clear cache and reload
    clearDataCache();
    const recoveredConfig = await loadGlobalConfig(true);
    const recoveredMessages = await loadMessages('funny-exaggerations', true);
    
    const recoverySuccessful = 
      failedConfig?._isFallback &&
      failedMessages?.usingFallback &&
      !recoveredConfig?._isFallback &&
      !recoveredMessages?.usingFallback;
    
    return {
      success: recoverySuccessful,
      details: `Error recovery mechanism working`,
      errors: []
    };
  }

  /**
   * Runs all resilience tests
   */
  async runAllTests() {
    console.log('=== Data Loading Resilience Test Suite ===\n');
    
    this.setupTestEnvironment();
    
    try {
      // Run all test scenarios
      await this.runTestScenario('Missing Config File', () => this.testMissingConfigFile());
      await this.runTestScenario('Corrupted JSON', () => this.testCorruptedJSON());
      await this.runTestScenario('Network Failure', () => this.testNetworkFailure());
      await this.runTestScenario('Invalid Data Structures', () => this.testInvalidDataStructures());
      await this.runTestScenario('Partial Failure', () => this.testPartialFailure());
      await this.runTestScenario('Cache Corruption', () => this.testCacheCorruption());
      await this.runTestScenario('Concurrent Loading', () => this.testConcurrentLoading());
      await this.runTestScenario('Error Recovery', () => this.testErrorRecovery());
      
      // Generate summary
      this.generateTestSummary();
      
    } finally {
      this.teardownTestEnvironment();
    }
  }

  /**
   * Generates comprehensive test summary
   */
  generateTestSummary() {
    console.log('\n=== Test Summary ===');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    console.log(`Total duration: ${totalDuration}ms`);
    
    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  - ${r.scenario}: ${r.error || 'Unknown error'}`);
        });
    }
    
    // Check data loading health
    const health = getDataLoadingHealth();
    console.log('\n📊 Data Loading Health:');
    console.log(`  Status: ${health.health.status}`);
    console.log(`  Total errors logged: ${health.errors.totalErrors}`);
    console.log(`  Total warnings logged: ${health.errors.totalWarnings}`);
    
    // Overall assessment
    console.log('\n🎯 Resilience Assessment:');
    if (passedTests === totalTests) {
      console.log('✅ EXCELLENT: All resilience tests passed');
      console.log('   The data loading system handles all failure scenarios gracefully');
    } else if (passedTests >= totalTests * 0.8) {
      console.log('✅ GOOD: Most resilience tests passed');
      console.log('   The data loading system is robust with minor issues');
    } else if (passedTests >= totalTests * 0.6) {
      console.log('⚠️  FAIR: Some resilience tests failed');
      console.log('   The data loading system needs improvement');
    } else {
      console.log('❌ POOR: Many resilience tests failed');
      console.log('   The data loading system requires significant fixes');
    }
    
    console.log('\n✅ Task 7 resilience testing completed');
  }
}

/**
 * Runs the resilience test suite
 */
export async function runDataLoadingResilienceTests() {
  const testRunner = new DataLoadingResilienceTest();
  await testRunner.runAllTests();
  return testRunner.testResults;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDataLoadingResilienceTests().then(() => {
    console.log('\n🎉 Data loading resilience testing complete!');
  }).catch(error => {
    console.error('❌ Resilience testing failed:', error.message);
    process.exit(1);
  });
}