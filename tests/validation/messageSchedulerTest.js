/**
 * MessageScheduler Test Utility
 * 
 * Test script to verify MessageScheduler functionality
 */

import MessageScheduler from './MessageScheduler.js';

// Mock global config for testing
const mockGlobalConfig = {
  defaultMinDelaySeconds: 5,
  defaultMaxDelaySeconds: 15,
  defaultPopupStyle: "overlay",
  animationSpeedMultiplier: 2.0, // Faster for testing
  accessibility: {
    messageLifespanMultiplier: 1.0
  }
};

// Test message handler
const testMessageHandler = (messageObj) => {
  console.log('📨 Message Received:', {
    id: messageObj.id,
    text: messageObj.text.substring(0, 50) + '...',
    mode: messageObj.mode,
    position: messageObj.position,
    style: messageObj.style,
    duration: messageObj.duration
  });
};

// Test error handler
const testErrorHandler = (message, error) => {
  console.error('❌ Scheduler Error:', message, error);
};

/**
 * Test MessageScheduler basic functionality
 */
export const testMessageScheduler = async () => {
  console.log('🧪 Starting MessageScheduler Tests...\n');

  // Test 1: Initialize scheduler
  console.log('Test 1: Initialize MessageScheduler');
  const scheduler = new MessageScheduler({
    globalConfig: mockGlobalConfig,
    onMessageShow: testMessageHandler,
    onError: testErrorHandler
  });

  console.log('✅ Scheduler initialized');
  console.log('Status:', scheduler.getStatus());
  console.log('');

  // Test 2: Start with Corporate AI mode
  console.log('Test 2: Start Corporate AI mode');
  try {
    await scheduler.start('corporate-ai');
    console.log('✅ Corporate AI mode started');
    console.log('Status:', scheduler.getStatus());
  } catch (error) {
    console.error('❌ Failed to start Corporate AI mode:', error);
  }
  console.log('');

  // Test 3: Test popup functionality
  console.log('Test 3: Test popup functionality');
  scheduler.testPopup();
  console.log('✅ Test popup triggered');
  console.log('');

  // Test 4: Pause and resume
  console.log('Test 4: Pause and resume functionality');
  scheduler.pause();
  console.log('✅ Scheduler paused');
  console.log('Status:', scheduler.getStatus());
  
  setTimeout(() => {
    scheduler.resume();
    console.log('✅ Scheduler resumed');
    console.log('Status:', scheduler.getStatus());
  }, 2000);
  console.log('');

  // Test 5: Switch to Zen Monk mode
  setTimeout(async () => {
    console.log('Test 5: Switch to Zen Monk mode');
    try {
      await scheduler.start('zen-monk');
      console.log('✅ Zen Monk mode started');
      console.log('Status:', scheduler.getStatus());
    } catch (error) {
      console.error('❌ Failed to start Zen Monk mode:', error);
    }
    console.log('');
  }, 4000);

  // Test 6: Switch to Chaos mode
  setTimeout(async () => {
    console.log('Test 6: Switch to Chaos mode');
    try {
      await scheduler.start('chaos');
      console.log('✅ Chaos mode started');
      console.log('Status:', scheduler.getStatus());
    } catch (error) {
      console.error('❌ Failed to start Chaos mode:', error);
    }
    console.log('');
  }, 8000);

  // Test 7: Multiple test popups
  setTimeout(() => {
    console.log('Test 7: Multiple test popups');
    scheduler.testPopup();
    setTimeout(() => scheduler.testPopup(), 500);
    setTimeout(() => scheduler.testPopup(), 1000);
    console.log('✅ Multiple test popups triggered');
    console.log('');
  }, 12000);

  // Test 8: Stop scheduler
  setTimeout(() => {
    console.log('Test 8: Stop scheduler');
    scheduler.stop();
    console.log('✅ Scheduler stopped');
    console.log('Final Status:', scheduler.getStatus());
    console.log('');
    
    // Test 9: Cleanup
    console.log('Test 9: Cleanup');
    scheduler.destroy();
    console.log('✅ Scheduler destroyed');
    console.log('\n🎉 All tests completed!');
  }, 16000);

  return scheduler;
};

/**
 * Test message selection algorithms
 */
export const testMessageSelection = async () => {
  console.log('🧪 Testing Message Selection...\n');

  const scheduler = new MessageScheduler({
    globalConfig: mockGlobalConfig,
    onMessageShow: testMessageHandler,
    onError: testErrorHandler
  });

  // Load Corporate AI mode
  await scheduler.start('corporate-ai');
  
  // Test message selection 10 times
  console.log('Testing message selection (10 iterations):');
  for (let i = 0; i < 10; i++) {
    const message = scheduler.selectMessage();
    console.log(`${i + 1}. ${message?.substring(0, 40)}...`);
  }

  scheduler.destroy();
  console.log('\n✅ Message selection test completed');
};

/**
 * Test timing and scheduling
 */
export const testTiming = async () => {
  console.log('🧪 Testing Timing and Scheduling...\n');

  const scheduler = new MessageScheduler({
    globalConfig: {
      ...mockGlobalConfig,
      defaultMinDelaySeconds: 2,
      defaultMaxDelaySeconds: 4
    },
    onMessageShow: (msg) => {
      const now = new Date().toLocaleTimeString();
      console.log(`[${now}] Message: ${msg.text.substring(0, 30)}...`);
    },
    onError: testErrorHandler
  });

  await scheduler.start('corporate-ai');
  console.log('Scheduler started with 2-4 second intervals...');
  console.log('Watching for automatic messages (will run for 15 seconds):\n');

  // Stop after 15 seconds
  setTimeout(() => {
    scheduler.stop();
    console.log('\n✅ Timing test completed');
  }, 15000);

  return scheduler;
};

/**
 * Run all tests
 */
export const runAllTests = async () => {
  console.log('🚀 Running All MessageScheduler Tests...\n');
  
  try {
    await testMessageScheduler();
    
    setTimeout(async () => {
      await testMessageSelection();
      
      setTimeout(async () => {
        await testTiming();
      }, 2000);
    }, 18000);
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
};

// Export for use in browser console or Node.js
if (typeof window !== 'undefined') {
  window.testMessageScheduler = {
    testMessageScheduler,
    testMessageSelection,
    testTiming,
    runAllTests
  };
}

export default {
  testMessageScheduler,
  testMessageSelection,
  testTiming,
  runAllTests
};