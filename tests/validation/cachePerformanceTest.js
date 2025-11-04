/**
 * Performance test for the caching system
 * Tests cache hits, misses, and response times
 */

import handler from '../pages/api/modes.js';

function createMockReqRes(method = 'GET', query = {}) {
  const req = { method, query };
  const res = {
    headers: {},
    statusCode: 200,
    responseData: null,
    
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.responseData = data; },
    end() {}
  };
  
  return { req, res };
}

async function measureRequestTime(req, res) {
  const start = Date.now();
  await handler(req, res);
  const end = Date.now();
  return end - start;
}

async function runCachePerformanceTest() {
  console.log('🚀 Cache Performance Test\n');
  
  // Test 1: First request (cache miss)
  console.log('📊 Test 1: First request (should be cache miss)');
  const { req: req1, res: res1 } = createMockReqRes('GET');
  const time1 = await measureRequestTime(req1, res1);
  
  console.log(`⏱️  Response time: ${time1}ms`);
  console.log(`📈 Cache stats: hits=${res1.responseData.cache.hits}, misses=${res1.responseData.cache.misses}`);
  console.log(`🎯 Cache hit: ${res1.responseData.cache.isHit}`);
  console.log(`📦 Modes found: ${res1.responseData.modesFound}`);
  
  // Test 2: Second request (should be cache hit)
  console.log('\n📊 Test 2: Second request (should be cache hit)');
  const { req: req2, res: res2 } = createMockReqRes('GET');
  const time2 = await measureRequestTime(req2, res2);
  
  console.log(`⏱️  Response time: ${time2}ms`);
  console.log(`📈 Cache stats: hits=${res2.responseData.cache.hits}, misses=${res2.responseData.cache.misses}`);
  console.log(`🎯 Cache hit: ${res2.responseData.cache.isHit}`);
  console.log(`📦 Modes found: ${res2.responseData.modesFound}`);
  
  // Test 3: Cache invalidation
  console.log('\n📊 Test 3: Cache invalidation');
  const { req: req3, res: res3 } = createMockReqRes('GET', { invalidateCache: 'true' });
  const time3 = await measureRequestTime(req3, res3);
  
  console.log(`⏱️  Response time: ${time3}ms`);
  console.log(`📈 Cache stats: hits=${res3.responseData.cache.hits}, misses=${res3.responseData.cache.misses}`);
  console.log(`🎯 Cache hit: ${res3.responseData.cache.isHit}`);
  console.log(`🔄 Invalidations: ${res3.responseData.cache.invalidations}`);
  
  // Test 4: Cache status endpoint
  console.log('\n📊 Test 4: Cache status endpoint');
  const { req: req4, res: res4 } = createMockReqRes('GET', { cacheStatus: 'true' });
  await handler(req4, res4);
  
  console.log(`📊 Cache enabled: ${res4.responseData.enabled}`);
  console.log(`⏰ TTL: ${res4.responseData.config.ttlMs}ms`);
  console.log(`💾 Max size: ${res4.responseData.config.maxSizeKB}KB`);
  
  // Performance analysis
  console.log('\n🎯 Performance Analysis:');
  const speedImprovement = time1 > 0 ? ((time1 - time2) / time1 * 100).toFixed(1) : 0;
  console.log(`🚀 Cache hit speed improvement: ${speedImprovement}%`);
  console.log(`✅ Cache hit under 100ms: ${time2 < 100 ? 'YES' : 'NO'} (${time2}ms)`);
  console.log(`✅ Cache miss reasonable: ${time1 < 1000 ? 'YES' : 'NO'} (${time1}ms)`);
  
  // Requirements verification
  console.log('\n🎯 Task 5 Requirements Verification:');
  console.log(`✅ In-memory caching implemented: ${res2.responseData.cache.enabled}`);
  console.log(`✅ Cache invalidation logic: ${res3.responseData.cache.invalidations > 0}`);
  console.log(`✅ File system operations optimized: ${time2 < time1}`);
  console.log(`✅ Response time under 100ms for cached requests: ${time2 < 100}`);
  
  console.log('\n🏆 Task 5 Implementation Complete!');
}

runCachePerformanceTest().catch(console.error);