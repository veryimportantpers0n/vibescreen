import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommandExecutor } from '../../components/CommandExecutor';

describe('CommandExecutor', () => {
  let executor;
  let mockOnCharacterSwitch;
  let mockOnMessageControl;
  let mockGetCurrentState;
  let mockOnError;

  beforeEach(() => {
    mockOnCharacterSwitch = jest.fn();
    mockOnMessageControl = jest.fn();
    mockGetCurrentState = jest.fn(() => ({
      currentCharacter: 'Corporate AI',
      messageStatus: 'Active'
    }));
    mockOnError = jest.fn();

    executor = new CommandExecutor({
      onCharacterSwitch: mockOnCharacterSwitch,
      onMessageControl: mockOnMessageControl,
      getCurrentState: mockGetCurrentState,
      onError: mockOnError
    });

    jest.clearAllMocks();
  });

  afterEach(() => {
    if (executor) {
      executor.destroy();
    }
  });

  describe('Character Switching', () => {
    test('executes character switch command successfully', async () => {
      const commandResult = {
        success: true,
        action: 'switch-character',
        data: {
          character: 'zen-monk',
          displayName: 'Zen Monk'
        }
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully switched to Zen Monk');
      expect(mockOnCharacterSwitch).toHaveBeenCalledWith({
        id: 'zen-monk',
        name: 'Zen Monk'
      });
    });

    test('handles invalid character data', async () => {
      const commandResult = {
        success: true,
        action: 'switch-character',
        data: {
          character: 'invalid-character'
        }
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid character');
      expect(mockOnCharacterSwitch).not.toHaveBeenCalled();
    });

    test('handles missing character data', async () => {
      const commandResult = {
        success: true,
        action: 'switch-character',
        data: {}
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid character data');
      expect(mockOnCharacterSwitch).not.toHaveBeenCalled();
    });
  });

  describe('Message Control', () => {
    test('executes pause command', async () => {
      const commandResult = {
        success: true,
        action: 'pause-messages'
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Message rotation paused');
      expect(mockOnMessageControl).toHaveBeenCalledWith('pause');
    });

    test('executes resume command', async () => {
      const commandResult = {
        success: true,
        action: 'resume-messages'
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Message rotation resumed');
      expect(mockOnMessageControl).toHaveBeenCalledWith('resume');
    });

    test('executes test message command', async () => {
      const commandResult = {
        success: true,
        action: 'test-message'
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Test message triggered');
      expect(mockOnMessageControl).toHaveBeenCalledWith('test');
    });

    test('handles unknown message control action', async () => {
      const commandResult = {
        success: true,
        action: 'unknown-message-action'
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown message control action');
      expect(mockOnMessageControl).not.toHaveBeenCalled();
    });
  });

  describe('System Status', () => {
    test('returns system status', async () => {
      const commandResult = {
        success: true,
        action: 'show-status'
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(true);
      expect(result.message).toContain('System Status:');
      expect(result.message).toContain('Character: Corporate AI');
      expect(result.message).toContain('Messages: Active');
      expect(mockGetCurrentState).toHaveBeenCalled();
    });

    test('returns system configuration', async () => {
      const commandResult = {
        success: true,
        action: 'show-config'
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(true);
      expect(result.message).toContain('System Configuration:');
      expect(result.message).toContain('Theme: Matrix Green Terminal');
    });

    test('returns debug information', async () => {
      const commandResult = {
        success: true,
        action: 'show-debug'
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Debug Information:');
      expect(result.message).toContain('CommandExecutor v1.0');
    });
  });

  describe('Command Queuing', () => {
    test('queues commands when processing', async () => {
      // Make the first command take time to process
      mockOnCharacterSwitch.mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const command1 = {
        success: true,
        action: 'switch-character',
        data: { character: 'zen-monk', displayName: 'Zen Monk' }
      };

      const command2 = {
        success: true,
        action: 'pause-messages'
      };

      // Execute commands rapidly
      const promise1 = executor.execute(command1);
      const promise2 = executor.execute(command2);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // First command should execute normally
      expect(result1.success).toBe(true);
      
      // Second command should be queued
      expect(result2.success).toBe(true);
      expect(result2.action).toBe('queued');
    });

    test('processes queued commands in order', async () => {
      const commands = [];
      mockOnMessageControl.mockImplementation((action) => {
        commands.push(action);
      });

      // Queue multiple commands
      await executor.execute({ success: true, action: 'pause-messages' });
      await executor.execute({ success: true, action: 'resume-messages' });
      await executor.execute({ success: true, action: 'test-message' });

      // Wait for queue processing
      await waitFor(() => {
        expect(commands).toEqual(['pause', 'resume', 'test']);
      }, { timeout: 1000 });
    });

    test('handles queue overflow', async () => {
      // Fill the queue beyond capacity
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(executor.execute({
          success: true,
          action: 'pause-messages'
        }));
      }

      const results = await Promise.all(promises);
      
      // Some commands should be rejected due to queue overflow
      const rejectedCommands = results.filter(r => !r.success && r.message.includes('queue is full'));
      expect(rejectedCommands.length).toBeGreaterThan(0);
    });
  });

  describe('Rate Limiting', () => {
    test('applies rate limiting to rapid commands', async () => {
      const startTime = Date.now();
      
      // Execute multiple commands rapidly
      await executor.execute({ success: true, action: 'pause-messages' });
      await executor.execute({ success: true, action: 'resume-messages' });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should take at least the minimum execution interval
      expect(duration).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Error Handling', () => {
    test('handles execution errors gracefully', async () => {
      mockOnCharacterSwitch.mockImplementation(() => {
        throw new Error('Character switch failed');
      });

      const commandResult = {
        success: true,
        action: 'switch-character',
        data: { character: 'zen-monk', displayName: 'Zen Monk' }
      };

      const result = await executor.execute(commandResult);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Character switch failed');
    });

    test('handles invalid command results', async () => {
      const result = await executor.execute(null);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid command result');
    });

    test('passes through parsing errors', async () => {
      const parseError = {
        success: false,
        message: 'Parse error',
        suggestion: 'Try again'
      };

      const result = await executor.execute(parseError);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Parse error');
      expect(result.suggestion).toBe('Try again');
    });
  });

  describe('Execution History', () => {
    test('tracks execution history', async () => {
      await executor.execute({ success: true, action: 'pause-messages' });
      await executor.execute({ success: true, action: 'resume-messages' });

      const stats = executor.getExecutionStats();
      
      expect(stats.total).toBe(2);
      expect(stats.successful).toBe(2);
      expect(stats.failed).toBe(0);
      expect(stats.successRate).toBe('100.0%');
    });

    test('limits history size', async () => {
      // Execute more commands than the history limit
      for (let i = 0; i < 60; i++) {
        await executor.execute({ success: true, action: 'pause-messages' });
      }

      const stats = executor.getExecutionStats();
      expect(stats.total).toBeLessThanOrEqual(50); // maxHistorySize
    });
  });

  describe('Clear Terminal', () => {
    test('clears execution history', async () => {
      // Add some history
      await executor.execute({ success: true, action: 'pause-messages' });
      
      let stats = executor.getExecutionStats();
      expect(stats.total).toBe(1);

      // Clear terminal
      const result = await executor.execute({ success: true, action: 'clear-terminal' });
      
      expect(result.success).toBe(true);
      expect(result.clearHistory).toBe(true);
      
      // History should be cleared
      stats = executor.getExecutionStats();
      expect(stats.total).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    test('formats character names correctly', () => {
      expect(executor.formatCharacterName('zen-monk')).toBe('Zen Monk');
      expect(executor.formatCharacterName('corporate-ai')).toBe('Corporate AI');
      expect(executor.formatCharacterName('unknown')).toBe('unknown');
    });

    test('calculates uptime', () => {
      const uptime = executor.calculateUptime();
      expect(uptime).toMatch(/^\d+s$/); // Should be in seconds format initially
    });

    test('provides queue status', () => {
      const status = executor.getQueueStatus();
      
      expect(status).toHaveProperty('length');
      expect(status).toHaveProperty('maxSize');
      expect(status).toHaveProperty('isProcessing');
      expect(status.maxSize).toBe(10);
    });
  });

  describe('Cleanup', () => {
    test('destroys executor cleanly', () => {
      const queueLength = executor.commandQueue.length;
      const historyLength = executor.executionHistory.length;
      
      executor.destroy();
      
      expect(executor.commandQueue).toEqual([]);
      expect(executor.executionHistory).toEqual([]);
    });
  });
});