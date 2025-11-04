/**
 * Comprehensive API Functionality Test Suite for Task 7
 * Tests all aspects of the /api/modes endpoint including error scenarios,
 * performance, caching, and response format validation
 */

import fs from 'fs/promises';
import path from 'path';
import handler from '../pages/api/modes.js';

// Test utilities
function createMockRequest(method = 'GET', query = {}) {
  return {
    method,
    query,
    headers: {}
  };
}

function createMockResponse() {
  const res = {
    headers: {},
    statusCode: 200,
    responseData: null,
    ended: false,
    
    setHeader(name, value) { 
      this.headers[name] = value; 
      return this;
    },
    
    status(code) { 
      this.statusCode = code; 
      return this; 
    },
    
    json(data) { 
      this.responseData = data; 
      return this;
    },
    
    end() { 
      this.ended = true; 
      return this;
    }
  };
  
  return res;
}

// Schema validation utilities
function validateResponseSchema(response, expectedStatus = 'success') {
  const errors = [];
  
  // Check required fields
  if (!response) {
    errors.push('Response is null or undefined');
    return { valid: false, errors };
  }
  
  if (!Array.isArray(response.modes)) {
    errors.push('Response.modes is not an array');
  }
  
  if (typeof response.timestamp !== 'string') {
    errors.push('Response.timestamp is not a string');
  }
  
  if (typeof response.status !== 'string') {
    errors.push('Response.status is not a string');
  }
  
  if (response.status !== expectedStatus) {
    errors.push(`Expected status '${expectedStatus}', got '${response.status}'`);
  }
  
  if (typeof response.requestId !== 'string') {
    errors.push('Response.requestId is not a string');
  }
  
  if (typeof response.processingTimeMs !== 'number') {
    errors.push('Response.processingTimeMs is not a number');
  }
  
  if (typeof response.modesFound !== 'number') {
    errors.push('Response.modesFound is not a number');
  }
  
  if (response.modes.length !== response.modesFound) {
    errors.push(`Modes array length (${response.modes.length}) doesn't match modesFound (${response.modesFound})`);
  }
  
  // Validate individual mode objects
  response.modes.forEach((mode, index) => {
    if (!mode || typeof mode !== 'object') {
      errors.push(`Mode ${index} is not an object`);
      return;
    }
    
    const requiredFields = ['id', 'name', 'popupStyle', 'minDelaySeconds', 'maxDelaySeconds', 'messageProbabilities', 'sceneProps'];
    requiredFields.forEach(field => {
      if (!(field in mode)) {
        errors.push(`Mode ${index} missing required field: ${field}`);
      }
    });
    
    // Validate field types
    if (typeof mode.id !== 'string') {
      errors.push(`Mode ${index}.id is not a string`);
    }
    
    if (typeof mode.name !== 'string') {
      errors.push(`Mode ${index}.name is not a string`);
    }
    
    if (!['overlay', 'speechBubble'].includes(mode.popupStyle)) {
      errors.push(`Mode ${index}.popupStyle has invalid value: ${mode.popupStyle}`);
    }
    
    if (typeof mode.minDelaySeconds !== 'number' || mode.minDelaySeconds < 5 || mode.minDelaySeconds > 300) {
      errors.push(`Mode ${index}.minDelaySeconds is invalid: ${mode.minDelaySeconds}`);
    }
    
    if (typeof mode.maxDelaySeconds !== 'number' || mode.maxDelaySeconds < 10 || mode.maxDelaySeconds > 600) {
      errors.push(`Mode ${index}.maxDelaySeconds is invalid: ${mode.maxDelaySeconds}`);
    }
    
    if (mode.maxDelaySeconds <= mode.minDelaySeconds) {
      errors.push(`Mode ${index}.maxDelaySeconds (${mode.maxDelaySeconds}) must be > minDelaySeconds (${mode.minDelaySeconds})`);
    }
    
    // Validate message probabilities
    if (!mode.messageProbabilities || typeof mode.messageProbabilities !== 'object') {
      errors.push(`Mode ${index}.messageProbabilities is not an object`);
    } else {
      const probKeys = ['cliche', 'exaggeration', 'other'];
      probKeys.forEach(key => {
        if (typeof mode.messageProbabilities[key] !== 'number' || 
            mode.messageProbabilities[key] < 0 || 
            mode.messageProbabilities[key] > 1) {
          errors.push(`Mode ${index}.messageProbabilities.${key} is invalid: ${mode.messageProbabilities[key]}`);
        }
      });
      
      const totalProb = probKeys.reduce((sum, key) => sum + (mode.messageProbabilities[key] || 0), 0);
      if (Math.abs(totalProb - 1.0) > 0.01) {
        errors.push(`Mode ${index}.messageProbabilities don't sum to 1.0: ${totalProb}`);
      }
    }
    
    // Validate scene props
    if (!mode.sceneProps || typeof mode.sceneProps !== 'object') {
      errors.push(`Mode ${index}.sceneProps is not an object`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

// Test suite implementation
class APITestSuite {
  constructor() {
    this.testResults = [];
    this.backupDir = null;
  }
  
  async runTest(testName, testFn) {
    console.log(`\n🧪 Running: ${testName}`);
    const startTime = Date.now();
    
    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      
      this.testResults.push({
        name: testName,
        passed: result.passed,
        duration,
        details: result.details || [],
        errors: result.errors || []
      });
      
      if (result.passed) {
        console.log(`   ✅ PASSED (${duration}ms)`);
        if (result.details && result.details.length > 0) {
          result.details.forEach(detail => console.log(`      ${detail}`));
        }
      } else {
        console.log(`   ❌ FAILED (${duration}ms)`);
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => console.log(`      ❌ ${error}`));
        }
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`   💥 ERROR (${duration}ms): ${error.message}`);
      
      this.testResults.push({
        name: testName,
        passed: false,
        duration,
        details: [],
        errors: [error.message]
      });
    }
  }
  
  async backupModesDirectory() {
    try {
      const modesPath = path.join(process.cwd(), 'modes');
      this.backupDir = path.join(process.cwd(), 'modes_backup_' + Date.now());
      
      // Check if modes directory exists
      try {
        await fs.access(modesPath);
        await fs.cp(modesPath, this.backupDir, { recursive: true });
        console.log(`📁 Backed up modes directory to: ${this.backupDir}`);
      } catch (error) {
        // Modes directory doesn't exist, that's fine
        console.log(`📁 No modes directory to backup`);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to backup modes directory: ${error.message}`);
    }
  }
  
  async restoreModesDirectory() {
    if (!this.backupDir) return;
    
    try {
      const modesPath = path.join(process.cwd(), 'modes');
      
      // Remove current modes directory
      try {
        await fs.rm(modesPath, { recursive: true, force: true });
      } catch (error) {
        // Directory might not exist, that's fine
      }
      
      // Restore from backup
      try {
        await fs.access(this.backupDir);
        await fs.cp(this.backupDir, modesPath, { recursive: true });
        console.log(`📁 Restored modes directory from backup`);
      } catch (error) {
        console.log(`📁 No backup to restore from`);
      }
      
      // Clean up backup
      try {
        await fs.rm(this.backupDir, { recursive: true, force: true });
      } catch (error) {
        console.warn(`⚠️  Failed to clean up backup: ${error.message}`);
      }
      
    } catch (error) {
      console.warn(`⚠️  Failed to restore modes directory: ${error.message}`);
    }
  }
  
  // Test 1: Empty modes directory handling
  async testEmptyModesDirectory() {
    return this.runTest('Empty modes directory handling', async () => {
      // Remove modes directory temporarily
      const modesPath = path.join(process.cwd(), 'modes');
      let dirExisted = false;
      
      try {
        await fs.access(modesPath);
        dirExisted = true;
        await fs.rm(modesPath, { recursive: true, force: true });
      } catch (error) {
        // Directory doesn't exist, that's what we want
      }
      
      try {
        const req = createMockRequest('GET');
        const res = createMockResponse();
        
        await handler(req, res);
        
        // Validate response
        const validation = validateResponseSchema(res.responseData);
        const errors = [];
        
        if (res.statusCode !== 200) {
          errors.push(`Expected status 200, got ${res.statusCode}`);
        }
        
        if (!Array.isArray(res.responseData?.modes) || res.responseData.modes.length !== 0) {
          errors.push(`Expected empty modes array, got ${res.responseData?.modes?.length} modes`);
        }
        
        if (res.responseData?.modesFound !== 0) {
          errors.push(`Expected modesFound to be 0, got ${res.responseData?.modesFound}`);
        }
        
        errors.push(...validation.errors);
        
        return {
          passed: errors.length === 0,
          errors,
          details: [
            `Status: ${res.statusCode}`,
            `Modes found: ${res.responseData?.modesFound || 0}`,
            `Processing time: ${res.responseData?.processingTimeMs}ms`
          ]
        };
        
      } finally {
        // Restore directory if it existed
        if (dirExisted) {
          await fs.mkdir(modesPath, { recursive: true });
        }
      }
    });
  }
  
  // Test 2: Valid configuration response format
  async testValidConfigurationFormat() {
    return this.runTest('Valid configuration response format', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();
      
      await handler(req, res);
      
      const validation = validateResponseSchema(res.responseData);
      const errors = [];
      
      if (res.statusCode !== 200) {
        errors.push(`Expected status 200, got ${res.statusCode}`);
      }
      
      // Check headers
      const expectedHeaders = ['Content-Type', 'Access-Control-Allow-Origin', 'Cache-Control'];
      expectedHeaders.forEach(header => {
        if (!res.headers[header]) {
          errors.push(`Missing header: ${header}`);
        }
      });
      
      if (res.headers['Content-Type'] && !res.headers['Content-Type'].includes('application/json')) {
        errors.push(`Invalid Content-Type: ${res.headers['Content-Type']}`);
      }
      
      errors.push(...validation.errors);
      
      return {
        passed: errors.length === 0,
        errors,
        details: [
          `Status: ${res.statusCode}`,
          `Modes found: ${res.responseData?.modesFound || 0}`,
          `Content-Type: ${res.headers['Content-Type']}`,
          `Processing time: ${res.responseData?.processingTimeMs}ms`
        ]
      };
    });
  }
  
  // Test 3: Missing config.json files
  async testMissingConfigFiles() {
    return this.runTest('Missing config.json files handling', async () => {
      const modesPath = path.join(process.cwd(), 'modes');
      const testModePath = path.join(modesPath, 'test-missing-config');
      
      try {
        // Create a mode directory without config.json
        await fs.mkdir(testModePath, { recursive: true });
        
        const req = createMockRequest('GET');
        const res = createMockResponse();
        
        await handler(req, res);
        
        const errors = [];
        
        if (res.statusCode !== 200) {
          errors.push(`Expected status 200, got ${res.statusCode}`);
        }
        
        // The API should exclude the invalid mode but continue processing
        const validation = validateResponseSchema(res.responseData);
        errors.push(...validation.errors);
        
        // Check that the mode without config.json is not included
        const testMode = res.responseData?.modes?.find(mode => mode.id === 'test-missing-config');
        if (testMode) {
          errors.push('Mode without config.json was incorrectly included');
        }
        
        return {
          passed: errors.length === 0,
          errors,
          details: [
            `Status: ${res.statusCode}`,
            `Modes found: ${res.responseData?.modesFound || 0}`,
            `Test mode excluded: ${!testMode ? 'Yes' : 'No'}`
          ]
        };
        
      } finally {
        // Clean up test directory
        try {
          await fs.rm(testModePath, { recursive: true, force: true });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });
  }
  
  // Test 4: Invalid JSON handling
  async testInvalidJSONHandling() {
    return this.runTest('Invalid JSON handling', async () => {
      const modesPath = path.join(process.cwd(), 'modes');
      const testModePath = path.join(modesPath, 'test-invalid-json');
      const configPath = path.join(testModePath, 'config.json');
      
      try {
        // Create a mode directory with invalid JSON
        await fs.mkdir(testModePath, { recursive: true });
        await fs.writeFile(configPath, '{ "invalid": json }'); // Invalid JSON
        
        const req = createMockRequest('GET');
        const res = createMockResponse();
        
        await handler(req, res);
        
        const errors = [];
        
        if (res.statusCode !== 200) {
          errors.push(`Expected status 200, got ${res.statusCode}`);
        }
        
        // The API should exclude the invalid mode but continue processing
        const validation = validateResponseSchema(res.responseData);
        errors.push(...validation.errors);
        
        // Check that the mode with invalid JSON is not included
        const testMode = res.responseData?.modes?.find(mode => mode.id === 'test-invalid-json');
        if (testMode) {
          errors.push('Mode with invalid JSON was incorrectly included');
        }
        
        return {
          passed: errors.length === 0,
          errors,
          details: [
            `Status: ${res.statusCode}`,
            `Modes found: ${res.responseData?.modesFound || 0}`,
            `Invalid JSON mode excluded: ${!testMode ? 'Yes' : 'No'}`
          ]
        };
        
      } finally {
        // Clean up test directory
        try {
          await fs.rm(testModePath, { recursive: true, force: true });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });
  }
  
  // Test 5: Configuration validation and sanitization
  async testConfigurationValidation() {
    return this.runTest('Configuration validation and sanitization', async () => {
      const modesPath = path.join(process.cwd(), 'modes');
      const testModePath = path.join(modesPath, 'test-validation');
      const configPath = path.join(testModePath, 'config.json');
      
      try {
        // Create a mode with invalid configuration values
        await fs.mkdir(testModePath, { recursive: true });
        const invalidConfig = {
          name: "Test Mode",
          popupStyle: "invalid-style", // Invalid
          minDelaySeconds: -10, // Too low
          maxDelaySeconds: 1000, // Too high
          messageProbabilities: {
            cliche: 2.0, // > 1.0
            exaggeration: -0.5, // < 0
            other: 0.3
          },
          sceneProps: {
            bgColor: "not-a-color", // Invalid color
            ambientSpeed: 100 // Too high
          }
        };
        
        await fs.writeFile(configPath, JSON.stringify(invalidConfig, null, 2));
        
        const req = createMockRequest('GET');
        const res = createMockResponse();
        
        await handler(req, res);
        
        const errors = [];
        
        if (res.statusCode !== 200) {
          errors.push(`Expected status 200, got ${res.statusCode}`);
        }
        
        // Find the test mode in the response
        const testMode = res.responseData?.modes?.find(mode => mode.id === 'test-validation');
        
        if (!testMode) {
          errors.push('Test mode was not included in response');
        } else {
          // Verify that invalid values were sanitized
          if (testMode.popupStyle !== 'overlay') {
            errors.push(`Expected popupStyle to be sanitized to 'overlay', got '${testMode.popupStyle}'`);
          }
          
          if (testMode.minDelaySeconds < 5 || testMode.minDelaySeconds > 300) {
            errors.push(`minDelaySeconds not properly clamped: ${testMode.minDelaySeconds}`);
          }
          
          if (testMode.maxDelaySeconds < 10 || testMode.maxDelaySeconds > 600) {
            errors.push(`maxDelaySeconds not properly clamped: ${testMode.maxDelaySeconds}`);
          }
          
          if (testMode.maxDelaySeconds <= testMode.minDelaySeconds) {
            errors.push(`maxDelaySeconds (${testMode.maxDelaySeconds}) should be > minDelaySeconds (${testMode.minDelaySeconds})`);
          }
          
          // Check probability normalization
          const totalProb = testMode.messageProbabilities.cliche + 
                           testMode.messageProbabilities.exaggeration + 
                           testMode.messageProbabilities.other;
          
          if (Math.abs(totalProb - 1.0) > 0.01) {
            errors.push(`Message probabilities not normalized: ${totalProb}`);
          }
          
          // Check scene props sanitization
          if (testMode.sceneProps.bgColor) {
            errors.push(`Invalid bgColor should have been removed: ${testMode.sceneProps.bgColor}`);
          }
          
          if (testMode.sceneProps.ambientSpeed && (testMode.sceneProps.ambientSpeed < 0.1 || testMode.sceneProps.ambientSpeed > 5.0)) {
            errors.push(`ambientSpeed not properly clamped: ${testMode.sceneProps.ambientSpeed}`);
          }
        }
        
        return {
          passed: errors.length === 0,
          errors,
          details: [
            `Status: ${res.statusCode}`,
            `Test mode included: ${testMode ? 'Yes' : 'No'}`,
            testMode ? `Sanitized popupStyle: ${testMode.popupStyle}` : '',
            testMode ? `Clamped minDelay: ${testMode.minDelaySeconds}s` : '',
            testMode ? `Clamped maxDelay: ${testMode.maxDelaySeconds}s` : ''
          ].filter(Boolean)
        };
        
      } finally {
        // Clean up test directory
        try {
          await fs.rm(testModePath, { recursive: true, force: true });
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });
  }
  
  // Test 6: Performance and caching
  async testPerformanceAndCaching() {
    return this.runTest('Performance and caching behavior', async () => {
      const errors = [];
      const details = [];
      
      // First request (cache miss)
      const req1 = createMockRequest('GET');
      const res1 = createMockResponse();
      
      const start1 = Date.now();
      await handler(req1, res1);
      const time1 = Date.now() - start1;
      
      if (res1.statusCode !== 200) {
        errors.push(`First request failed with status ${res1.statusCode}`);
      }
      
      details.push(`First request: ${time1}ms`);
      
      // Second request (should use cache)
      const req2 = createMockRequest('GET');
      const res2 = createMockResponse();
      
      const start2 = Date.now();
      await handler(req2, res2);
      const time2 = Date.now() - start2;
      
      if (res2.statusCode !== 200) {
        errors.push(`Second request failed with status ${res2.statusCode}`);
      }
      
      details.push(`Second request: ${time2}ms`);
      
      // Cache should make second request faster (or at least not significantly slower)
      if (time2 > time1 * 2) {
        errors.push(`Second request (${time2}ms) was significantly slower than first (${time1}ms), caching may not be working`);
      }
      
      // Test cache status endpoint
      const req3 = createMockRequest('GET', { cacheStatus: 'true' });
      const res3 = createMockResponse();
      
      await handler(req3, res3);
      
      if (res3.statusCode !== 200) {
        errors.push(`Cache status request failed with status ${res3.statusCode}`);
      } else if (!res3.responseData?.stats) {
        errors.push('Cache status response missing stats');
      } else {
        details.push(`Cache hits: ${res3.responseData.stats.hits}`);
        details.push(`Cache misses: ${res3.responseData.stats.misses}`);
      }
      
      // Test cache invalidation
      const req4 = createMockRequest('GET', { invalidateCache: 'true' });
      const res4 = createMockResponse();
      
      await handler(req4, res4);
      
      if (res4.statusCode !== 200) {
        errors.push(`Cache invalidation request failed with status ${res4.statusCode}`);
      }
      
      details.push('Cache invalidation tested');
      
      // Performance requirement: should respond within 100ms for cached requests
      if (time2 > 100) {
        errors.push(`Second request took ${time2}ms, exceeds 100ms requirement for cached requests`);
      }
      
      return {
        passed: errors.length === 0,
        errors,
        details
      };
    });
  }
  
  // Test 7: HTTP methods and CORS
  async testHTTPMethodsAndCORS() {
    return this.runTest('HTTP methods and CORS handling', async () => {
      const errors = [];
      const details = [];
      
      // Test OPTIONS request (CORS preflight)
      const optionsReq = createMockRequest('OPTIONS');
      const optionsRes = createMockResponse();
      
      await handler(optionsReq, optionsRes);
      
      if (optionsRes.statusCode !== 200) {
        errors.push(`OPTIONS request failed with status ${optionsRes.statusCode}`);
      }
      
      if (!optionsRes.ended) {
        errors.push('OPTIONS request should end without response body');
      }
      
      // Check CORS headers
      const corsHeaders = ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'];
      corsHeaders.forEach(header => {
        if (!optionsRes.headers[header]) {
          errors.push(`Missing CORS header: ${header}`);
        }
      });
      
      details.push(`OPTIONS status: ${optionsRes.statusCode}`);
      
      // Test POST request (should be rejected)
      const postReq = createMockRequest('POST');
      const postRes = createMockResponse();
      
      await handler(postReq, postRes);
      
      if (postRes.statusCode !== 405) {
        errors.push(`POST request should return 405, got ${postRes.statusCode}`);
      }
      
      if (!postRes.headers['Allow']) {
        errors.push('405 response missing Allow header');
      }
      
      details.push(`POST status: ${postRes.statusCode}`);
      
      // Test PUT request (should be rejected)
      const putReq = createMockRequest('PUT');
      const putRes = createMockResponse();
      
      await handler(putReq, putRes);
      
      if (putRes.statusCode !== 405) {
        errors.push(`PUT request should return 405, got ${putRes.statusCode}`);
      }
      
      details.push(`PUT status: ${putRes.statusCode}`);
      
      return {
        passed: errors.length === 0,
        errors,
        details
      };
    });
  }
  
  // Test 8: Mixed valid and invalid modes
  async testMixedValidInvalidModes() {
    return this.runTest('Mixed valid and invalid modes handling', async () => {
      const modesPath = path.join(process.cwd(), 'modes');
      const testPaths = [
        path.join(modesPath, 'test-valid'),
        path.join(modesPath, 'test-invalid-json'),
        path.join(modesPath, 'test-missing-config')
      ];
      
      try {
        // Create valid mode
        await fs.mkdir(testPaths[0], { recursive: true });
        await fs.writeFile(path.join(testPaths[0], 'config.json'), JSON.stringify({
          name: "Valid Test Mode",
          popupStyle: "overlay",
          minDelaySeconds: 10,
          maxDelaySeconds: 30
        }));
        
        // Create invalid JSON mode
        await fs.mkdir(testPaths[1], { recursive: true });
        await fs.writeFile(path.join(testPaths[1], 'config.json'), '{ invalid json }');
        
        // Create missing config mode
        await fs.mkdir(testPaths[2], { recursive: true });
        // No config.json file
        
        const req = createMockRequest('GET');
        const res = createMockResponse();
        
        await handler(req, res);
        
        const errors = [];
        
        if (res.statusCode !== 200) {
          errors.push(`Expected status 200, got ${res.statusCode}`);
        }
        
        // Should include valid modes (original + test-valid)
        const validMode = res.responseData?.modes?.find(mode => mode.id === 'test-valid');
        if (!validMode) {
          errors.push('Valid test mode was not included');
        }
        
        // Should exclude invalid modes
        const invalidJsonMode = res.responseData?.modes?.find(mode => mode.id === 'test-invalid-json');
        if (invalidJsonMode) {
          errors.push('Invalid JSON mode was incorrectly included');
        }
        
        const missingConfigMode = res.responseData?.modes?.find(mode => mode.id === 'test-missing-config');
        if (missingConfigMode) {
          errors.push('Missing config mode was incorrectly included');
        }
        
        // Should have at least the original modes + valid test mode
        const expectedMinModes = 4; // corporate-ai, zen-monk, chaos, test-valid
        if (res.responseData?.modesFound < expectedMinModes) {
          errors.push(`Expected at least ${expectedMinModes} modes, got ${res.responseData?.modesFound}`);
        }
        
        return {
          passed: errors.length === 0,
          errors,
          details: [
            `Status: ${res.statusCode}`,
            `Total modes found: ${res.responseData?.modesFound || 0}`,
            `Valid test mode included: ${validMode ? 'Yes' : 'No'}`,
            `Invalid modes excluded: ${!invalidJsonMode && !missingConfigMode ? 'Yes' : 'No'}`
          ]
        };
        
      } finally {
        // Clean up test directories
        for (const testPath of testPaths) {
          try {
            await fs.rm(testPath, { recursive: true, force: true });
          } catch (error) {
            // Ignore cleanup errors
          }
        }
      }
    });
  }
  
  // Generate summary report
  generateSummary() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(test => test.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = this.testResults.reduce((sum, test) => sum + test.duration, 0);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE API TEST SUMMARY');
    console.log('='.repeat(60));
    
    console.log(`\n📈 Overall Results:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests} ✅`);
    console.log(`   Failed: ${failedTests} ${failedTests > 0 ? '❌' : '✅'}`);
    console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`   Total Duration: ${totalDuration}ms`);
    
    if (failedTests > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.testResults
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`   • ${test.name}`);
          test.errors.forEach(error => console.log(`     - ${error}`));
        });
    }
    
    console.log(`\n✅ Requirements Coverage:`);
    console.log(`   • Empty modes directory handling: ${this.testResults.find(t => t.name.includes('Empty modes'))?.passed ? 'PASS' : 'FAIL'}`);
    console.log(`   • Response format validation: ${this.testResults.find(t => t.name.includes('Valid configuration'))?.passed ? 'PASS' : 'FAIL'}`);
    console.log(`   • Error scenario handling: ${this.testResults.filter(t => t.name.includes('Missing') || t.name.includes('Invalid')).every(t => t.passed) ? 'PASS' : 'FAIL'}`);
    console.log(`   • Performance and caching: ${this.testResults.find(t => t.name.includes('Performance'))?.passed ? 'PASS' : 'FAIL'}`);
    console.log(`   • HTTP methods and CORS: ${this.testResults.find(t => t.name.includes('HTTP methods'))?.passed ? 'PASS' : 'FAIL'}`);
    
    const allPassed = failedTests === 0;
    
    console.log(`\n${allPassed ? '🎉' : '⚠️'} Task 7 Implementation: ${allPassed ? 'COMPLETE AND VALIDATED' : 'NEEDS ATTENTION'}`);
    
    if (allPassed) {
      console.log('\nThe API endpoint provides:');
      console.log('  ✓ Graceful handling of empty modes directory');
      console.log('  ✓ Proper response format matching established schema');
      console.log('  ✓ Robust error handling for missing files and invalid JSON');
      console.log('  ✓ Performance optimization with caching system');
      console.log('  ✓ Correct HTTP method handling and CORS support');
      console.log('  ✓ Configuration validation and sanitization');
      console.log('  ✓ Mixed scenario handling (valid + invalid modes)');
    }
    
    return allPassed;
  }
}

// Main test execution
async function runComprehensiveAPITests() {
  console.log('🚀 Starting Comprehensive API Functionality Tests for Task 7');
  console.log('Testing /api/modes endpoint with all required scenarios...\n');
  
  const testSuite = new APITestSuite();
  
  try {
    // Backup existing modes directory
    await testSuite.backupModesDirectory();
    
    // Run all tests
    await testSuite.testEmptyModesDirectory();
    await testSuite.testValidConfigurationFormat();
    await testSuite.testMissingConfigFiles();
    await testSuite.testInvalidJSONHandling();
    await testSuite.testConfigurationValidation();
    await testSuite.testPerformanceAndCaching();
    await testSuite.testHTTPMethodsAndCORS();
    await testSuite.testMixedValidInvalidModes();
    
    // Generate summary
    const allPassed = testSuite.generateSummary();
    
    return allPassed;
    
  } finally {
    // Restore original modes directory
    await testSuite.restoreModesDirectory();
  }
}

// Export for use in other test files
export { runComprehensiveAPITests, APITestSuite, validateResponseSchema };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveAPITests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    });
}