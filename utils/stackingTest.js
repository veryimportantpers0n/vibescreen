/**
 * Message Stacking Test
 * 
 * Test the enhanced message stacking and state management functionality
 */

import MessageScheduler from './MessageScheduler.js';

// Mock global config for testing
const mockGlobalConfig = {
  defaultMinDelaySeconds: 1,
  defaultMaxDelaySeconds: 2,
  animationSpeedMultiplier: 3.0, // Very fast for testing
  accessibility: {
    messageLifespanMultiplier: 1.0
  }
};

// Track messages for testing
let activeMessages = [];
let messageHistory = [];

// Test message handler that tracks stacking
const testMessageHandler = (messageObj) => {
  activeMessages.push(messageObj);
  messageHistory.push(messageObj);
  
  console.log(`📨 Message ${messageObj.id}:`, {
    text: messageObj.text.substring(0, 30) + '...',
    stackPosition: messageObj.stackPosition,
    stackOffset: messageObj.stackOffset,
    activeCount: activeMessages.length
  });
  
  // Simulate message cleanup after duration
  setTimeout(() => {
    activeMessages = activeMessages.filter(msg => msg.id !== messageObj.id);
    console.log(`🗑️ Message ${messageObj.id} cleaned up. Active: ${activeMessages.length}`);
  }, messageObj.duration);
};

// Test error handler
const testErrorHandler = (message, error) => {
  console.error('❌ Stacking Test Error:', message, error);
};

/**
 * Test message stacking functionality
 */
export const testMessageStacking = async () => {
  console.log('🧪 Testing Message Stacking and State Management...\n');

  const scheduler = new MessageScheduler({
    globalConfig: mockGlobalConfig,
    onMessageShow: testMessageHandler,
    onError: testErrorHandler
  });

  // Test 1: Initialize and start
  console.log('Test 1: Initialize scheduler');
  await scheduler.start('corporate-ai');
  console.log('✅ Scheduler started');
  console.log('Status:', scheduler.getStatus());
  console.log('');

  // Test 2: Rapid message generation to test stacking
  console.log('Test 2: Generate multiple messages rapidly');
  for (let i = 0; i < 5; i++) {
    scheduler.testPopup();
    await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
  }
  console.log('✅ 5 messages generated rapidly');
  console.log('');

  // Test 3: Check detailed status
  setTimeout(() => {
    console.log('Test 3: Check detailed status after 2 seconds');
    const detailedStatus = scheduler.getDetailedStatus();
    console.log('Detailed Status:', JSON.stringify(detailedStatus, null, 2));
    console.log('');
  }, 2000);

  // Test 4: Mode switching cleanup
  setTimeout(async () => {
    console.log('Test 4: Test mode switching cleanup');
    console.log('Before switch - Active messages:', activeMessages.length);
    await scheduler.switchMode('zen-monk');
    console.log('After switch to zen-monk - Active messages:', activeMessages.length);
    console.log('');
  }, 4000);

  // Test 5: Test queue processing
  setTimeout(() => {
    console.log('Test 5: Test message queue processing');
    // Generate more messages than the limit
    for (let i = 0; i < 6; i++) {
      scheduler.testPopup();
    }
    console.log('✅ 6 messages generated (should queue excess)');
    console.log('');
  }, 6000);

  // Test 6: Test rapid interaction handling
  setTimeout(() => {
    console.log('Test 6: Test rapid interaction handling');
    // Try rapid mode switches
    scheduler.switchMode('chaos');
    scheduler.switchMode('zen-monk');
    scheduler.switchMode('corporate-ai');
    console.log('✅ Rapid mode switches attempted (should be throttled)');
    console.log('');
  }, 8000);

  // Test 7: Memory leak prevention
  setTimeout(() => {
    console.log('Test 7: Test memory leak prevention');
    const beforeCleanup = scheduler.getDetailedStatus();
    console.log('Before cleanup:', beforeCleanup.memoryUsage);
    
    scheduler.clearAllMessages();
    
    const afterCleanup = scheduler.getDetailedStatus();
    console.log('After cleanup:', afterCleanup.memoryUsage);
    console.log('');
  }, 10000);

  // Test 8: Final cleanup
  setTimeout(() => {
    console.log('Test 8: Final cleanup and destroy');
    scheduler.destroy();
    console.log('✅ Scheduler destroyed');
    console.log('Final message history length:', messageHistory.length);
    console.log('Final active messages:', activeMessages.length);
    console.log('\n🎉 Stacking tests completed!');
  }, 12000);

  return scheduler;
};

/**
 * Test stack position calculation
 */
export const testStackPositioning = () => {
  console.log('🧪 Testing Stack Position Calculation...\n');

  const scheduler = new MessageScheduler({
    globalConfig: mockGlobalConfig,
    onMessageShow: () => {}, // No-op for this test
    onError: testErrorHandler
  });

  // Test stack position calculation
  console.log('Testing stack position calculation:');
  
  // Simulate adding messages to test position calculation
  for (let i = 0; i < 5; i++) {
    const position = scheduler.calculateStackPosition();
    const offset = scheduler.calculateStackOffset(position);
    
    console.log(`Message ${i + 1}: Position ${position}, Offset:`, offset);
    
    // Simulate adding to active messages
    scheduler.messageStackPositions.set(`test-${i}`, position);
  }

  // Test cleanup of positions
  console.log('\nTesting position cleanup:');
  scheduler.messageStackPositions.delete('test-1');
  scheduler.messageStackPositions.delete('test-3');
  
  const newPosition = scheduler.calculateStackPosition();
  console.log('New position after cleanup:', newPosition);
  
  console.log('✅ Stack positioning test completed\n');
};

/**
 * Run stacking tests
 */
export const runStackingTests = async () => {
  console.log('🚀 Running Message Stacking Tests...\n');
  
  try {
    testStackPositioning();
    
    setTimeout(async () => {
      await testMessageStacking();
    }, 1000);
    
  } catch (error) {
    console.error('❌ Stacking test suite failed:', error);
  }
};

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStackingTests();
}

export default {
  testMessageStacking,
  testStackPositioning,
  runStackingTests
};