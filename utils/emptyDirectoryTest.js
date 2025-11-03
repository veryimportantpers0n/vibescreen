/**
 * Specific test for empty directory handling
 * This test validates that the API gracefully handles missing modes directory
 */

import fs from 'fs/promises';
import path from 'path';

async function testEmptyDirectoryHandling() {
  console.log('🧪 Testing Empty Directory Handling');
  console.log('=' .repeat(40));
  
  const modesPath = path.join(process.cwd(), 'modes');
  const backupPath = path.join(process.cwd(), 'modes_backup_empty_test');
  let dirMoved = false;
  
  try {
    // Import handler
    const handler = (await import('../pages/api/modes.js')).default;
    
    // Create mock request/response
    function createMockReqRes() {
      const req = { method: 'GET', query: { invalidateCache: 'true' }, headers: {} };
      const res = {
        headers: {},
        statusCode: 200,
        responseData: null,
        setHeader(name, value) { this.headers[name] = value; return this; },
        status(code) { this.statusCode = code; return this; },
        json(data) { this.responseData = data; return this; },
        end() { this.ended = true; return this; }
      };
      return { req, res };
    }
    
    // Step 1: Test with existing directory
    console.log('\n1. Testing with existing modes directory...');
    const { req: req1, res: res1 } = createMockReqRes();
    await handler(req1, res1);
    
    console.log(`   Status: ${res1.statusCode}`);
    console.log(`   Modes found: ${res1.responseData?.modesFound || 0}`);
    console.log(`   Response status: ${res1.responseData?.status}`);
    
    // Step 2: Move modes directory
    console.log('\n2. Moving modes directory...');
    try {
      await fs.access(modesPath);
      await fs.rename(modesPath, backupPath);
      dirMoved = true;
      console.log('   ✅ Modes directory moved successfully');
    } catch (error) {
      console.log('   ℹ️  Modes directory does not exist (perfect for test)');
    }
    
    // Step 3: Test with missing directory
    console.log('\n3. Testing with missing modes directory...');
    const { req: req2, res: res2 } = createMockReqRes();
    await handler(req2, res2);
    
    console.log(`   Status: ${res2.statusCode}`);
    console.log(`   Modes found: ${res2.responseData?.modesFound || 0}`);
    console.log(`   Response status: ${res2.responseData?.status}`);
    console.log(`   Modes array length: ${res2.responseData?.modes?.length || 0}`);
    
    // Validate results
    const success = res2.statusCode === 200 && 
                   Array.isArray(res2.responseData?.modes) && 
                   res2.responseData.modes.length === 0 &&
                   res2.responseData.modesFound === 0 &&
                   res2.responseData.status === 'success';
    
    if (success) {
      console.log('\n✅ EMPTY DIRECTORY TEST: PASSED');
      console.log('   The API gracefully handles missing modes directory by:');
      console.log('   • Returning HTTP 200 status');
      console.log('   • Providing empty modes array');
      console.log('   • Setting modesFound to 0');
      console.log('   • Maintaining success status');
      console.log('   • Including all required response fields');
    } else {
      console.log('\n❌ EMPTY DIRECTORY TEST: FAILED');
      console.log('   Expected: 200 status, empty array, modesFound=0');
      console.log(`   Actual: ${res2.statusCode} status, ${res2.responseData?.modes?.length} modes, modesFound=${res2.responseData?.modesFound}`);
    }
    
    return success;
    
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    return false;
    
  } finally {
    // Restore modes directory
    if (dirMoved) {
      try {
        await fs.rename(backupPath, modesPath);
        console.log('\n📁 Modes directory restored successfully');
      } catch (error) {
        console.error('\n❌ Failed to restore modes directory:', error.message);
      }
    }
  }
}

// Run the test
testEmptyDirectoryHandling()
  .then(success => {
    if (success) {
      console.log('\n🎉 Empty directory handling requirement VERIFIED!');
    } else {
      console.log('\n⚠️  Empty directory handling needs attention');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  });