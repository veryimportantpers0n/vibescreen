/**
 * Direct API Test - Tests API functionality by directly calling the handler
 * with proper cache management and directory manipulation
 */

import fs from 'fs/promises';
import path from 'path';

// Create a simple test to verify empty directory handling
async function testEmptyDirectoryHandling() {
  console.log('🧪 Testing empty directory handling directly...');
  
  // Import the handler fresh
  const { default: handler } = await import('../pages/api/modes.js');
  
  // Create mock request/response
  const req = { method: 'GET', query: {}, headers: {} };
  const res = {
    headers: {},
    statusCode: 200,
    responseData: null,
    ended: false,
    
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.responseData = data; return this; },
    end() { this.ended = true; return this; }
  };
  
  // Backup and remove modes directory
  const modesPath = path.join(process.cwd(), 'modes');
  const backupPath = path.join(process.cwd(), 'modes_test_backup');
  
  try {
    // Move modes directory
    await fs.rename(modesPath, backupPath);
    console.log('   📁 Moved modes directory');
    
    // Clear any existing cache by setting environment variable
    process.env.DISABLE_CACHE = 'true';
    
    // Re-import handler to get fresh instance
    delete require.cache[require.resolve('../pages/api/modes.js')];
    const { default: freshHandler } = await import('../pages/api/modes.js');
    
    // Call API
    await freshHandler(req, res);
    
    console.log(`   📊 Status: ${res.statusCode}`);
    console.log(`   📊 Modes found: ${res.responseData?.modesFound || 0}`);
    console.log(`   📊 Response status: ${res.responseData?.status}`);
    
    // Verify results
    if (res.statusCode === 200 && 
        Array.isArray(res.responseData?.modes) && 
        res.responseData.modes.length === 0 &&
        res.responseData.modesFound === 0) {
      console.log('   ✅ Empty directory handling: PASS');
      return true;
    } else {
      console.log('   ❌ Empty directory handling: FAIL');
      return false;
    }
    
  } finally {
    // Restore modes directory
    try {
      await fs.rename(backupPath, modesPath);
      console.log('   📁 Restored modes directory');
    } catch (error) {
      console.error('   ❌ Failed to restore modes directory:', error.message);
    }
    
    // Reset cache setting
    delete process.env.DISABLE_CACHE;
  }
}

async function testInvalidJSONHandling() {
  console.log('\n🧪 Testing invalid JSON handling...');
  
  const testModePath = path.join(process.cwd(), 'modes', 'test-invalid-json');
  const configPath = path.join(testModePath, 'config.json');
  
  try {
    // Create test mode with invalid JSON
    await fs.mkdir(testModePath, { recursive: true });
    await fs.writeFile(configPath, '{ "name": "Test", "invalid": json }');
    console.log('   📁 Created test mode with invalid JSON');
    
    // Clear cache
    process.env.DISABLE_CACHE = 'true';
    delete require.cache[require.resolve('../pages/api/modes.js')];
    const { default: handler } = await import('../pages/api/modes.js');
    
    const req = { method: 'GET', query: {}, headers: {} };
    const res = {
      headers: {},
      statusCode: 200,
      responseData: null,
      setHeader(name, value) { this.headers[name] = value; return this; },
      status(code) { this.statusCode = code; return this; },
      json(data) { this.responseData = data; return this; },
      end() { this.ended = true; return this; }
    };
    
    await handler(req, res);
    
    console.log(`   📊 Status: ${res.statusCode}`);
    console.log(`   📊 Total modes found: ${res.responseData?.modesFound || 0}`);
    
    // Check if invalid mode was excluded
    const invalidMode = res.responseData?.modes?.find(m => m.id === 'test-invalid-json');
    
    if (res.statusCode === 200 && !invalidMode) {
      console.log('   ✅ Invalid JSON handling: PASS');
      console.log('   📊 Invalid mode properly excluded');
      return true;
    } else {
      console.log('   ❌ Invalid JSON handling: FAIL');
      console.log(`   📊 Invalid mode excluded: ${!invalidMode}`);
      return false;
    }
    
  } finally {
    // Clean up
    try {
      await fs.rm(testModePath, { recursive: true, force: true });
      console.log('   🧹 Cleaned up test mode');
    } catch (error) {
      console.warn('   ⚠️  Cleanup warning:', error.message);
    }
    delete process.env.DISABLE_CACHE;
  }
}

async function testMissingConfigHandling() {
  console.log('\n🧪 Testing missing config.json handling...');
  
  const testModePath = path.join(process.cwd(), 'modes', 'test-missing-config');
  
  try {
    // Create test mode directory without config.json
    await fs.mkdir(testModePath, { recursive: true });
    console.log('   📁 Created test mode without config.json');
    
    // Clear cache
    process.env.DISABLE_CACHE = 'true';
    delete require.cache[require.resolve('../pages/api/modes.js')];
    const { default: handler } = await import('../pages/api/modes.js');
    
    const req = { method: 'GET', query: {}, headers: {} };
    const res = {
      headers: {},
      statusCode: 200,
      responseData: null,
      setHeader(name, value) { this.headers[name] = value; return this; },
      status(code) { this.statusCode = code; return this; },
      json(data) { this.responseData = data; return this; },
      end() { this.ended = true; return this; }
    };
    
    await handler(req, res);
    
    console.log(`   📊 Status: ${res.statusCode}`);
    console.log(`   📊 Total modes found: ${res.responseData?.modesFound || 0}`);
    
    // Check if mode without config was excluded
    const missingMode = res.responseData?.modes?.find(m => m.id === 'test-missing-config');
    
    if (res.statusCode === 200 && !missingMode) {
      console.log('   ✅ Missing config handling: PASS');
      console.log('   📊 Mode without config properly excluded');
      return true;
    } else {
      console.log('   ❌ Missing config handling: FAIL');
      console.log(`   📊 Mode without config excluded: ${!missingMode}`);
      return false;
    }
    
  } finally {
    // Clean up
    try {
      await fs.rm(testModePath, { recursive: true, force: true });
      console.log('   🧹 Cleaned up test mode');
    } catch (error) {
      console.warn('   ⚠️  Cleanup warning:', error.message);
    }
    delete process.env.DISABLE_CACHE;
  }
}

async function testValidConfiguration() {
  console.log('\n🧪 Testing valid configuration handling...');
  
  // Clear cache and test normal operation
  process.env.DISABLE_CACHE = 'true';
  delete require.cache[require.resolve('../pages/api/modes.js')];
  const { default: handler } = await import('../pages/api/modes.js');
  
  const req = { method: 'GET', query: {}, headers: {} };
  const res = {
    headers: {},
    statusCode: 200,
    responseData: null,
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.responseData = data; return this; },
    end() { this.ended = true; return this; }
  };
  
  await handler(req, res);
  
  console.log(`   📊 Status: ${res.statusCode}`);
  console.log(`   📊 Modes found: ${res.responseData?.modesFound || 0}`);
  console.log(`   📊 Processing time: ${res.responseData?.processingTimeMs}ms`);
  
  // Validate response structure
  const response = res.responseData;
  let valid = true;
  
  if (!Array.isArray(response?.modes)) {
    console.log('   ❌ Modes is not an array');
    valid = false;
  }
  
  if (typeof response?.timestamp !== 'string') {
    console.log('   ❌ Timestamp is not a string');
    valid = false;
  }
  
  if (response?.status !== 'success') {
    console.log('   ❌ Status is not "success"');
    valid = false;
  }
  
  // Check individual modes
  if (response?.modes && response.modes.length > 0) {
    const mode = response.modes[0];
    const requiredFields = ['id', 'name', 'popupStyle', 'minDelaySeconds', 'maxDelaySeconds', 'messageProbabilities', 'sceneProps'];
    
    for (const field of requiredFields) {
      if (!(field in mode)) {
        console.log(`   ❌ Mode missing field: ${field}`);
        valid = false;
      }
    }
    
    if (mode.popupStyle && !['overlay', 'speechBubble'].includes(mode.popupStyle)) {
      console.log(`   ❌ Invalid popupStyle: ${mode.popupStyle}`);
      valid = false;
    }
  }
  
  if (valid) {
    console.log('   ✅ Valid configuration handling: PASS');
    console.log('   📊 All required fields present and valid');
  } else {
    console.log('   ❌ Valid configuration handling: FAIL');
  }
  
  delete process.env.DISABLE_CACHE;
  return valid;
}

async function runDirectTests() {
  console.log('🚀 Direct API Functionality Tests');
  console.log('=' .repeat(50));
  
  const results = [];
  
  try {
    results.push(await testValidConfiguration());
    results.push(await testEmptyDirectoryHandling());
    results.push(await testInvalidJSONHandling());
    results.push(await testMissingConfigHandling());
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 DIRECT TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`\n📈 Results: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)`);
    
    if (passed === total) {
      console.log('\n🎉 All direct API tests PASSED!');
      console.log('\nTask 7 Requirements Verified:');
      console.log('  ✅ Empty modes directory handling');
      console.log('  ✅ Valid configuration response format');
      console.log('  ✅ Invalid JSON error handling');
      console.log('  ✅ Missing config.json error handling');
      console.log('  ✅ Graceful degradation (excludes invalid, includes valid)');
    } else {
      console.log('\n⚠️  Some tests failed - see details above');
    }
    
    return passed === total;
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
    return false;
  }
}

runDirectTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });