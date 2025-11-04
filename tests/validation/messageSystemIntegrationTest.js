/**
 * Message System Integration Test
 * 
 * Tests the complete message system including MessageScheduler,
 * MessageController, and MessagePopup components working together.
 */

// Test configuration
const testConfig = {
  modes: ['corporate-ai', 'zen-monk', 'chaos'],
  testDuration: 30000, // 30 seconds
  messageInterval: 3000, // 3 seconds for testing
  maxConcurrentMessages: 3
};

/**
 * Test MessageScheduler integration with fetch API
 */
export const testMessageDataLoading = async () => {
  console.log('🧪 Testing Message Data Loading...\n');

  const results = {
    globalConfig: null,
    modeConfigs: {},
    modeMessages: {},
    masterMessages: {},
    errors: []
  };

  try {
    // Test 1: Load global configuration
    console.log('Test 1: Loading global configuration...');
    try {
      const response = await fetch('/data/global-config.json');
      if (response.ok) {
        results.globalConfig = await response.json();
        console.log('✅ Global config loaded:', Object.keys(results.globalConfig));
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      results.errors.push(`Global config: ${error.message}`);
      console.error('❌ Failed to load global config:', error);
    }

    // Test 2: Load master messages
    console.log('\nTest 2: Loading master messages...');
    const masterMessageTypes = ['cliche-ai-phrases', 'funny-exaggerations', 'cliche-ai-things'];
    
    for (const type of masterMessageTypes) {
      try {
        const response = await fetch(`/data/master-messages/${type}.json`);
        if (response.ok) {
          results.masterMessages[type] = await response.json();
          console.log(`✅ ${type}: ${results.masterMessages[type].length} messages`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        results.errors.push(`Master messages ${type}: ${error.message}`);
        console.error(`❌ Failed to load ${type}:`, error);
      }
    }

    // Test 3: Load mode configurations and messages
    console.log('\nTest 3: Loading mode configurations and messages...');
    for (const mode of testConfig.modes) {
      try {
        // Load config
        const configResponse = await fetch(`/modes/${mode}/config.json`);
        if (configResponse.ok) {
          results.modeConfigs[mode] = await configResponse.json();
          console.log(`✅ ${mode} config loaded`);
        } else {
          throw new Error(`Config HTTP ${configResponse.status}`);
        }

        // Load messages
        const messagesResponse = await fetch(`/modes/${mode}/messages.json`);
        if (messagesResponse.ok) {
          results.modeMessages[mode] = await messagesResponse.json();
          console.log(`✅ ${mode} messages: ${results.modeMessages[mode].length} items`);
        } else {
          throw new Error(`Messages HTTP ${messagesResponse.status}`);
        }
      } catch (error) {
        results.errors.push(`Mode ${mode}: ${error.message}`);
        console.error(`❌ Failed to load ${mode}:`, error);
      }
    }

    // Test 4: Validate data structure
    console.log('\nTest 4: Validating data structures...');
    
    // Validate global config
    if (results.globalConfig) {
      const requiredGlobalKeys = ['defaultMinDelaySeconds', 'defaultMaxDelaySeconds', 'defaultPopupStyle'];
      const missingKeys = requiredGlobalKeys.filter(key => !(key in results.globalConfig));
      if (missingKeys.length === 0) {
        console.log('✅ Global config structure valid');
      } else {
        console.error('❌ Global config missing keys:', missingKeys);
        results.errors.push(`Global config missing: ${missingKeys.join(', ')}`);
      }
    }

    // Validate mode configs
    for (const [mode, config] of Object.entries(results.modeConfigs)) {
      const requiredModeKeys = ['name', 'popupStyle', 'minDelaySeconds', 'maxDelaySeconds'];
      const missingKeys = requiredModeKeys.filter(key => !(key in config));
      if (missingKeys.length === 0) {
        console.log(`✅ ${mode} config structure valid`);
      } else {
        console.error(`❌ ${mode} config missing keys:`, missingKeys);
        results.errors.push(`${mode} config missing: ${missingKeys.join(', ')}`);
      }
    }

    // Validate messages
    for (const [mode, messages] of Object.entries(results.modeMessages)) {
      if (Array.isArray(messages) && messages.length > 0) {
        console.log(`✅ ${mode} messages valid (${messages.length} items)`);
      } else {
        console.error(`❌ ${mode} messages invalid or empty`);
        results.errors.push(`${mode} messages invalid`);
      }
    }

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    results.errors.push(`Test failure: ${error.message}`);
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`Global Config: ${results.globalConfig ? '✅' : '❌'}`);
  console.log(`Master Messages: ${Object.keys(results.masterMessages).length}/3 loaded`);
  console.log(`Mode Configs: ${Object.keys(results.modeConfigs).length}/${testConfig.modes.length} loaded`);
  console.log(`Mode Messages: ${Object.keys(results.modeMessages).length}/${testConfig.modes.length} loaded`);
  console.log(`Errors: ${results.errors.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  } else {
    console.log('\n🎉 All data loading tests passed!');
  }

  return results;
};

/**
 * Test message scheduling timing and frequency
 */
export const testMessageTiming = () => {
  console.log('🧪 Testing Message Timing and Frequency...\n');

  return new Promise((resolve) => {
    const messageLog = [];
    const startTime = Date.now();

    // Mock message handler that logs timing
    const logMessage = (messageObj) => {
      const timestamp = Date.now();
      const elapsed = timestamp - startTime;
      
      messageLog.push({
        id: messageObj.id,
        text: messageObj.text.substring(0, 30) + '...',
        mode: messageObj.mode,
        elapsed: elapsed,
        timestamp: new Date(timestamp).toLocaleTimeString()
      });

      console.log(`[${messageLog.length}] ${messageObj.mode}: ${messageObj.text.substring(0, 40)}... (${elapsed}ms)`);
    };

    // Import and initialize scheduler
    import('./MessageScheduler.js').then(({ default: MessageScheduler }) => {
      const scheduler = new MessageScheduler({
        globalConfig: {
          defaultMinDelaySeconds: 2,
          defaultMaxDelaySeconds: 4,
          animationSpeedMultiplier: 2.0
        },
        onMessageShow: logMessage,
        onError: console.error
      });

      // Test sequence
      const runTest = async () => {
        console.log('Starting timing test with 2-4 second intervals...\n');

        // Start with corporate-ai
        await scheduler.start('corporate-ai');
        console.log('✅ Corporate AI mode started');

        // Switch modes during test
        setTimeout(async () => {
          await scheduler.start('zen-monk');
          console.log('✅ Switched to Zen Monk mode');
        }, 8000);

        setTimeout(async () => {
          await scheduler.start('chaos');
          console.log('✅ Switched to Chaos mode');
        }, 16000);

        // Test manual popups
        setTimeout(() => {
          console.log('Testing manual popups...');
          scheduler.testPopup();
          setTimeout(() => scheduler.testPopup(), 500);
          setTimeout(() => scheduler.testPopup(), 1000);
        }, 12000);

        // Test pause/resume
        setTimeout(() => {
          console.log('Testing pause...');
          scheduler.pause();
        }, 20000);

        setTimeout(() => {
          console.log('Testing resume...');
          scheduler.resume();
        }, 22000);

        // End test
        setTimeout(() => {
          scheduler.stop();
          
          // Analyze results
          console.log('\n📊 Timing Analysis:');
          console.log(`Total messages: ${messageLog.length}`);
          console.log(`Test duration: ${testConfig.testDuration / 1000} seconds`);
          console.log(`Average frequency: ${(messageLog.length / (testConfig.testDuration / 1000)).toFixed(2)} messages/second`);
          
          if (messageLog.length > 1) {
            const intervals = [];
            for (let i = 1; i < messageLog.length; i++) {
              intervals.push(messageLog[i].elapsed - messageLog[i-1].elapsed);
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            console.log(`Average interval: ${(avgInterval / 1000).toFixed(2)} seconds`);
          }

          console.log('\n🎉 Timing test completed!');
          resolve(messageLog);
        }, testConfig.testDuration);
      };

      runTest().catch(console.error);
    });
  });
};

/**
 * Test message stacking and cleanup
 */
export const testMessageStacking = () => {
  console.log('🧪 Testing Message Stacking and Cleanup...\n');

  const activeMessages = new Set();
  const messageHistory = [];

  const mockMessageHandler = (messageObj) => {
    activeMessages.add(messageObj.id);
    messageHistory.push({
      id: messageObj.id,
      text: messageObj.text.substring(0, 30),
      timestamp: Date.now()
    });

    console.log(`📨 Message added: ${messageObj.id} (Active: ${activeMessages.size})`);

    // Simulate message cleanup after duration
    setTimeout(() => {
      activeMessages.delete(messageObj.id);
      console.log(`🗑️ Message cleaned: ${messageObj.id} (Active: ${activeMessages.size})`);
    }, messageObj.duration);
  };

  return import('./MessageScheduler.js').then(({ default: MessageScheduler }) => {
    const scheduler = new MessageScheduler({
      globalConfig: {
        defaultMinDelaySeconds: 1,
        defaultMaxDelaySeconds: 2,
        animationSpeedMultiplier: 3.0
      },
      onMessageShow: mockMessageHandler,
      onError: console.error
    });

    return new Promise(async (resolve) => {
      await scheduler.start('corporate-ai');
      console.log('Scheduler started with fast intervals for stacking test...\n');

      // Trigger multiple rapid messages
      setTimeout(() => {
        console.log('Triggering rapid test messages...');
        for (let i = 0; i < 5; i++) {
          setTimeout(() => scheduler.testPopup(), i * 200);
        }
      }, 2000);

      // Check stacking behavior
      setTimeout(() => {
        console.log(`\n📊 Stacking Test Results:`);
        console.log(`Max concurrent messages observed: ${Math.max(...messageHistory.map(() => activeMessages.size))}`);
        console.log(`Total messages created: ${messageHistory.length}`);
        console.log(`Currently active: ${activeMessages.size}`);
        
        scheduler.stop();
        console.log('\n🎉 Stacking test completed!');
        resolve({
          totalMessages: messageHistory.length,
          activeMessages: activeMessages.size,
          messageHistory
        });
      }, 10000);
    });
  });
};

/**
 * Run complete integration test suite
 */
export const runIntegrationTests = async () => {
  console.log('🚀 Running Complete Message System Integration Tests...\n');
  
  try {
    // Test 1: Data loading
    const dataResults = await testMessageDataLoading();
    
    // Only continue if data loading was successful
    if (dataResults.errors.length === 0) {
      console.log('\n⏳ Waiting 3 seconds before timing tests...\n');
      
      setTimeout(async () => {
        // Test 2: Timing
        const timingResults = await testMessageTiming();
        
        setTimeout(async () => {
          // Test 3: Stacking
          const stackingResults = await testMessageStacking();
          
          console.log('\n🎉 All integration tests completed!');
          console.log('\n📊 Final Summary:');
          console.log(`Data Loading: ${dataResults.errors.length === 0 ? '✅' : '❌'}`);
          console.log(`Timing Test: ${timingResults.length > 0 ? '✅' : '❌'}`);
          console.log(`Stacking Test: ${stackingResults.totalMessages > 0 ? '✅' : '❌'}`);
          
        }, 32000);
      }, 3000);
    } else {
      console.log('\n❌ Skipping timing tests due to data loading failures');
    }
    
  } catch (error) {
    console.error('❌ Integration test suite failed:', error);
  }
};

// Export for browser console usage
if (typeof window !== 'undefined') {
  window.messageSystemTests = {
    testMessageDataLoading,
    testMessageTiming,
    testMessageStacking,
    runIntegrationTests
  };
}

export default {
  testMessageDataLoading,
  testMessageTiming,
  testMessageStacking,
  runIntegrationTests
};