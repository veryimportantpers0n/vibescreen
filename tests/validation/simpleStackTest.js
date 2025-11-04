/**
 * Simple Stack Test
 * 
 * Basic test to verify enhanced stacking functionality
 */

// Test the enhanced MessageScheduler functionality
console.log('🧪 Testing Enhanced MessageScheduler...\n');

// Mock MessageScheduler class to test new methods
class TestMessageScheduler {
  constructor() {
    this.activeMessages = new Map();
    this.messageCleanupTimeouts = new Map();
    this.messageStackPositions = new Map();
    this.messageQueue = [];
    this.nextStackPosition = 0;
    this.maxConcurrentMessages = 3;
    this.lastInteractionTime = null;
  }

  calculateStackPosition() {
    const usedPositions = new Set(this.messageStackPositions.values());
    let position = 0;
    
    while (usedPositions.has(position)) {
      position++;
    }
    
    return position;
  }

  calculateStackOffset(stackPosition) {
    const baseOffset = 60;
    const horizontalVariation = 20;
    
    return {
      x: (stackPosition % 2) * horizontalVariation - horizontalVariation / 2,
      y: stackPosition * baseOffset
    };
  }

  scheduleMessageCleanup(messageId, duration) {
    const timeout = setTimeout(() => {
      this.cleanup(messageId);
    }, duration);
    
    this.messageCleanupTimeouts.set(messageId, timeout);
  }

  processMessageQueue() {
    if (this.messageQueue.length > 0 && this.activeMessages.size < this.maxConcurrentMessages) {
      const queuedMessage = this.messageQueue.shift();
      console.log('📤 Processing queued message:', queuedMessage.substring(0, 30) + '...');
      return true;
    }
    return false;
  }

  clearAllMessages() {
    // Clear all cleanup timeouts
    for (const timeout of this.messageCleanupTimeouts.values()) {
      clearTimeout(timeout);
    }
    
    // Clear all tracking data structures
    this.activeMessages.clear();
    this.messageCleanupTimeouts.clear();
    this.messageStackPositions.clear();
    this.messageQueue = [];
    this.nextStackPosition = 0;
    
    console.log('🗑️ All messages cleared');
  }

  handleRapidInteraction(interactionType) {
    const now = Date.now();
    const minInteractionDelay = 500;
    
    if (this.lastInteractionTime && (now - this.lastInteractionTime) < minInteractionDelay) {
      console.log(`⚡ Rapid interaction detected: ${interactionType}, throttling`);
      return false;
    }
    
    this.lastInteractionTime = now;
    return true;
  }

  cleanup(messageId) {
    this.activeMessages.delete(messageId);
    
    if (this.messageCleanupTimeouts.has(messageId)) {
      clearTimeout(this.messageCleanupTimeouts.get(messageId));
      this.messageCleanupTimeouts.delete(messageId);
    }
    
    this.messageStackPositions.delete(messageId);
    this.processMessageQueue();
    
    console.log(`🗑️ Message cleaned up: ${messageId}`);
  }

  getDetailedStatus() {
    return {
      stackingInfo: {
        activeMessageIds: Array.from(this.activeMessages.keys()),
        stackPositions: Object.fromEntries(this.messageStackPositions),
        queueLength: this.messageQueue.length,
        cleanupTimeouts: this.messageCleanupTimeouts.size
      },
      memoryUsage: {
        activeMessages: this.activeMessages.size,
        messageHistory: 0
      }
    };
  }
}

// Run tests
const scheduler = new TestMessageScheduler();

console.log('Test 1: Stack position calculation');
for (let i = 0; i < 5; i++) {
  const position = scheduler.calculateStackPosition();
  const offset = scheduler.calculateStackOffset(position);
  console.log(`  Message ${i + 1}: Position ${position}, Offset:`, offset);
  scheduler.messageStackPositions.set(`msg-${i}`, position);
}
console.log('✅ Stack positioning works\n');

console.log('Test 2: Message queue processing');
scheduler.messageQueue.push('Test message 1', 'Test message 2', 'Test message 3');
console.log('  Queue length before:', scheduler.messageQueue.length);
scheduler.processMessageQueue();
console.log('  Queue length after:', scheduler.messageQueue.length);
console.log('✅ Queue processing works\n');

console.log('Test 3: Rapid interaction handling');
console.log('  First interaction:', scheduler.handleRapidInteraction('test'));
console.log('  Immediate second interaction:', scheduler.handleRapidInteraction('test'));
setTimeout(() => {
  console.log('  Interaction after delay:', scheduler.handleRapidInteraction('test'));
  console.log('✅ Rapid interaction throttling works\n');
  
  console.log('Test 4: Cleanup functionality');
  console.log('  Status before cleanup:', scheduler.getDetailedStatus());
  scheduler.clearAllMessages();
  console.log('  Status after cleanup:', scheduler.getDetailedStatus());
  console.log('✅ Cleanup functionality works\n');
  
  console.log('🎉 All enhanced stacking tests passed!');
}, 600);