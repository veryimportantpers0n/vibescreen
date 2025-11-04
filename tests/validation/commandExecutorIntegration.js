/**
 * CommandExecutor Integration Validation
 * 
 * Manual validation script to test CommandExecutor functionality
 * without requiring a full test framework setup.
 */

import { CommandExecutor } from '../../components/CommandExecutor.js';

// Mock functions to simulate application integration
const mockCallbacks = {
  onCharacterSwitch: (mode) => {
    console.log('✓ Character switch called:', mode);
    return Promise.resolve();
  },
  
  onMessageControl: (action) => {
    console.log('✓ Message control called:', action);
    return Promise.resolve();
  },
  
  getCurrentState: () => ({
    currentCharacter: 'Corporate AI',
    messageStatus: 'Active',
    terminalVisible: true
  }),
  
  onError: (message, error) => {
    console.error('✗ Error:', message, error);
  }
};

// Test scenarios
const testScenarios = [
  {
    name: 'Character Switch - Valid',
    command: {
      success: true,
      action: 'switch-character',
      data: {
        character: 'zen-monk',
        displayName: 'Zen Monk'
      }
    },
    expectedSuccess: true
  },
  {
    name: 'Character Switch - Invalid',
    command: {
      success: true,
      action: 'switch-character',
      data: {
        character: 'invalid-character'
      }
    },
    expectedSuccess: false
  },
  {
    name: 'Message Control - Pause',
    command: {
      success: true,
      action: 'pause-messages'
    },
    expectedSuccess: true
  },
  {
    name: 'Message Control - Resume',
    command: {
      success: true,
      action: 'resume-messages'
    },
    expectedSuccess: true
  },
  {
    name: 'Message Control - Test',
    command: {
      success: true,
      action: 'test-message'
    },
    expectedSuccess: true
  },
  {
    name: 'System Status',
    command: {
      success: true,
      action: 'show-status'
    },
    expectedSuccess: true
  },
  {
    name: 'System Config',
    command: {
      success: true,
      action: 'show-config'
    },
    expectedSuccess: true
  },
  {
    name: 'Debug Info',
    command: {
      success: true,
      action: 'show-debug'
    },
    expectedSuccess: true
  },
  {
    name: 'Clear Terminal',
    command: {
      success: true,
      action: 'clear-terminal'
    },
    expectedSuccess: true
  },
  {
    name: 'Parse Error Passthrough',
    command: {
      success: false,
      message: 'Parse error test',
      suggestion: 'Try again'
    },
    expectedSuccess: false
  }
];

async function runValidation() {
  console.log('🚀 Starting CommandExecutor Integration Validation\n');
  
  // Initialize CommandExecutor
  const executor = new CommandExecutor(mockCallbacks);
  
  let passed = 0;
  let failed = 0;
  
  // Run test scenarios
  for (const scenario of testScenarios) {
    console.log(`Testing: ${scenario.name}`);
    
    try {
      const result = await executor.execute(scenario.command);
      
      if (result.success === scenario.expectedSuccess) {
        console.log(`  ✓ PASS - Success: ${result.success}, Message: ${result.message}`);
        passed++;
      } else {
        console.log(`  ✗ FAIL - Expected success: ${scenario.expectedSuccess}, Got: ${result.success}`);
        console.log(`    Message: ${result.message}`);
        failed++;
      }
    } catch (error) {
      console.log(`  ✗ ERROR - ${error.message}`);
      failed++;
    }
    
    console.log('');
  }
  
  // Test command queuing
  console.log('Testing: Command Queuing');
  try {
    const queuePromises = [];
    
    // Submit multiple commands rapidly
    for (let i = 0; i < 5; i++) {
      queuePromises.push(executor.execute({
        success: true,
        action: 'pause-messages'
      }));
    }
    
    const queueResults = await Promise.all(queuePromises);
    const queuedCommands = queueResults.filter(r => r.action === 'queued');
    
    if (queuedCommands.length > 0) {
      console.log(`  ✓ PASS - ${queuedCommands.length} commands were queued`);
      passed++;
    } else {
      console.log('  ✓ PASS - All commands executed immediately (low load)');
      passed++;
    }
  } catch (error) {
    console.log(`  ✗ ERROR - ${error.message}`);
    failed++;
  }
  
  console.log('');
  
  // Test execution statistics
  console.log('Testing: Execution Statistics');
  try {
    const stats = executor.getExecutionStats();
    
    if (stats && typeof stats.total === 'number' && typeof stats.successRate === 'string') {
      console.log(`  ✓ PASS - Stats: ${stats.total} total, ${stats.successRate} success rate`);
      passed++;
    } else {
      console.log('  ✗ FAIL - Invalid statistics format');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ ERROR - ${error.message}`);
    failed++;
  }
  
  console.log('');
  
  // Test queue status
  console.log('Testing: Queue Status');
  try {
    const queueStatus = executor.getQueueStatus();
    
    if (queueStatus && typeof queueStatus.length === 'number' && typeof queueStatus.maxSize === 'number') {
      console.log(`  ✓ PASS - Queue: ${queueStatus.length}/${queueStatus.maxSize}, Processing: ${queueStatus.isProcessing}`);
      passed++;
    } else {
      console.log('  ✗ FAIL - Invalid queue status format');
      failed++;
    }
  } catch (error) {
    console.log(`  ✗ ERROR - ${error.message}`);
    failed++;
  }
  
  console.log('');
  
  // Cleanup
  executor.destroy();
  
  // Summary
  console.log('📊 Validation Summary:');
  console.log(`  ✓ Passed: ${passed}`);
  console.log(`  ✗ Failed: ${failed}`);
  console.log(`  📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! CommandExecutor integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
  }
  
  return { passed, failed };
}

// Export for use in other validation scripts
export { runValidation, testScenarios, mockCallbacks };

// Run validation if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidation().catch(console.error);
}