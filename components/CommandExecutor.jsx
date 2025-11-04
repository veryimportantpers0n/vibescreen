/**
 * CommandExecutor Component
 * 
 * Integrates terminal commands with the existing VibeScreen application systems.
 * Handles character switching, message control, system status, and command queuing.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

class CommandExecutor {
  constructor(options = {}) {
    this.onCharacterSwitch = options.onCharacterSwitch || (() => {});
    this.onMessageControl = options.onMessageControl || (() => {});
    this.getCurrentState = options.getCurrentState || (() => ({}));
    this.onError = options.onError || console.error;
    
    // Command queue for handling rapid input
    this.commandQueue = [];
    this.isProcessing = false;
    this.maxQueueSize = 10;
    this.processingDelay = 100; // ms between command processing
    
    // Command execution tracking
    this.executionHistory = [];
    this.maxHistorySize = 50;
    
    // Rate limiting for rapid commands
    this.lastExecutionTime = 0;
    this.minExecutionInterval = 50; // ms minimum between executions
    
    // System state cache
    this.systemStateCache = {};
    this.cacheExpiry = 1000; // ms
    this.lastCacheUpdate = 0;
    
    // Bind methods
    this.execute = this.execute.bind(this);
    this.processQueue = this.processQueue.bind(this);
    this.handleCharacterSwitch = this.handleCharacterSwitch.bind(this);
    this.handleMessageControl = this.handleMessageControl.bind(this);
    this.getSystemStatus = this.getSystemStatus.bind(this);
  }

  /**
   * Execute a command with queuing and rate limiting
   * @param {Object} commandResult - Result from CommandParser
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async execute(commandResult, context = {}) {
    // Validate command result
    if (!commandResult || typeof commandResult !== 'object') {
      return {
        success: false,
        message: 'Invalid command result',
        suggestion: 'Please try again with a valid command'
      };
    }

    // Handle failed parsing results
    if (!commandResult.success) {
      return commandResult; // Return parsing error as-is
    }

    // Create execution task
    const executionTask = {
      id: `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      commandResult,
      context,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: 2
    };

    // Add to queue or execute immediately
    if (this.isProcessing || this.commandQueue.length > 0) {
      return this.queueCommand(executionTask);
    } else {
      return this.executeImmediate(executionTask);
    }
  }

  /**
   * Queue a command for later execution
   * @param {Object} executionTask - Task to queue
   * @returns {Object} Queuing result
   */
  queueCommand(executionTask) {
    // Check queue capacity
    if (this.commandQueue.length >= this.maxQueueSize) {
      return {
        success: false,
        message: 'Command queue is full',
        suggestion: 'Please wait for current commands to complete before entering new ones'
      };
    }

    // Add to queue
    this.commandQueue.push(executionTask);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      setTimeout(this.processQueue, this.processingDelay);
    }

    return {
      success: true,
      message: 'Command queued for execution',
      action: 'queued',
      queuePosition: this.commandQueue.length
    };
  }

  /**
   * Execute a command immediately
   * @param {Object} executionTask - Task to execute
   * @returns {Promise<Object>} Execution result
   */
  async executeImmediate(executionTask) {
    const { commandResult, context } = executionTask;
    
    // Rate limiting check
    const now = Date.now();
    if (now - this.lastExecutionTime < this.minExecutionInterval) {
      // Add small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, this.minExecutionInterval));
    }
    
    this.lastExecutionTime = Date.now();

    try {
      // Execute based on action type
      let result;
      
      switch (commandResult.action) {
        case 'switch-character':
          result = await this.handleCharacterSwitch(commandResult, context);
          break;
          
        case 'pause-messages':
        case 'resume-messages':
        case 'test-message':
          result = await this.handleMessageControl(commandResult, context);
          break;
          
        case 'show-status':
        case 'show-config':
        case 'show-debug':
          result = await this.getSystemStatus(commandResult, context);
          break;
          
        case 'clear-terminal':
          result = this.handleClearTerminal(commandResult, context);
          break;
          
        case 'display-help':
        case 'list-characters':
          result = commandResult; // These are display-only commands
          break;
          
        default:
          result = {
            success: true,
            message: commandResult.message || 'Command executed',
            action: commandResult.action
          };
          break;
      }

      // Add to execution history
      this.addToExecutionHistory(executionTask, result);
      
      return result;
      
    } catch (error) {
      this.onError('Command execution failed', error);
      
      const errorResult = {
        success: false,
        message: `Execution failed: ${error.message}`,
        suggestion: 'Please try again or contact support if the problem persists',
        errorType: error.name
      };
      
      // Add error to execution history
      this.addToExecutionHistory(executionTask, errorResult);
      
      return errorResult;
    }
  }

  /**
   * Process the command queue
   */
  async processQueue() {
    if (this.isProcessing || this.commandQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.commandQueue.length > 0) {
        const task = this.commandQueue.shift();
        
        try {
          const result = await this.executeImmediate(task);
          
          // If execution failed and retries are available, re-queue
          if (!result.success && task.retries < task.maxRetries) {
            task.retries++;
            this.commandQueue.unshift(task); // Add back to front of queue
            console.log(`Retrying command execution (attempt ${task.retries + 1})`);
          }
          
        } catch (error) {
          console.error('Queue processing error:', error);
          
          // If retries available, re-queue the task
          if (task.retries < task.maxRetries) {
            task.retries++;
            this.commandQueue.unshift(task);
          }
        }
        
        // Small delay between queue processing to prevent overwhelming
        if (this.commandQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, this.processingDelay));
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Handle character switching commands
   * @param {Object} commandResult - Command result from parser
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async handleCharacterSwitch(commandResult, context) {
    try {
      const { data } = commandResult;
      
      if (!data || !data.character) {
        return {
          success: false,
          message: 'Invalid character data for switch command',
          suggestion: 'Please specify a valid character name'
        };
      }

      // Validate character exists (only the three implemented modes)
      const validCharacters = [
        'corporate-ai', 'zen-monk', 'chaos'
      ];

      if (!validCharacters.includes(data.character)) {
        return {
          success: false,
          message: `Invalid character: ${data.character}`,
          suggestion: 'Type !characters to see available options'
        };
      }

      // Execute character switch through callback
      if (this.onCharacterSwitch) {
        // Create mode object that matches ModeSelector expectations
        const modeObject = {
          id: data.character,
          name: data.displayName || this.formatCharacterName(data.character)
        };
        
        await this.onCharacterSwitch(modeObject);
      }

      // Update system state cache
      this.updateSystemStateCache({
        currentCharacter: data.displayName || data.character,
        lastCharacterSwitch: Date.now()
      });

      return {
        success: true,
        message: `Successfully switched to ${data.displayName || data.character}`,
        action: 'switch-character',
        data: {
          character: data.character,
          displayName: data.displayName
        }
      };

    } catch (error) {
      return {
        success: false,
        message: `Character switch failed: ${error.message}`,
        suggestion: 'Please try again or check if the character name is valid'
      };
    }
  }

  /**
   * Handle message control commands (pause, resume, test)
   * @param {Object} commandResult - Command result from parser
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Execution result
   */
  async handleMessageControl(commandResult, context) {
    try {
      const action = commandResult.action;
      let controlAction;
      
      // Map command actions to message control actions
      switch (action) {
        case 'pause-messages':
          controlAction = 'pause';
          break;
        case 'resume-messages':
          controlAction = 'resume';
          break;
        case 'test-message':
          controlAction = 'test';
          break;
        default:
          return {
            success: false,
            message: `Unknown message control action: ${action}`,
            suggestion: 'Use !pause, !resume, or !test for message control'
          };
      }

      // Execute message control through callback
      if (this.onMessageControl) {
        await this.onMessageControl(controlAction);
      }

      // Update system state cache
      this.updateSystemStateCache({
        lastMessageControl: Date.now(),
        lastMessageAction: controlAction
      });

      // Return appropriate success message
      const messages = {
        pause: 'Message rotation paused',
        resume: 'Message rotation resumed',
        test: 'Test message triggered'
      };

      return {
        success: true,
        message: messages[controlAction] || 'Message control executed',
        action: action,
        data: { controlAction }
      };

    } catch (error) {
      return {
        success: false,
        message: `Message control failed: ${error.message}`,
        suggestion: 'Please try again or check system status'
      };
    }
  }

  /**
   * Handle system status commands (status, config, debug)
   * @param {Object} commandResult - Command result from parser
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} System status result
   */
  async getSystemStatus(commandResult, context) {
    try {
      const action = commandResult.action;
      const currentState = this.getCurrentState();
      
      let statusMessage;
      
      switch (action) {
        case 'show-status':
          statusMessage = this.formatSystemStatus(currentState);
          break;
          
        case 'show-config':
          statusMessage = this.formatSystemConfig(currentState);
          break;
          
        case 'show-debug':
          statusMessage = this.formatDebugInfo(currentState);
          break;
          
        default:
          statusMessage = 'System information unavailable';
          break;
      }

      return {
        success: true,
        message: statusMessage,
        action: action,
        data: currentState
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to get system status: ${error.message}`,
        suggestion: 'System may be experiencing issues. Please try again.'
      };
    }
  }

  /**
   * Handle terminal clear command
   * @param {Object} commandResult - Command result from parser
   * @param {Object} context - Execution context
   * @returns {Object} Clear result
   */
  handleClearTerminal(commandResult, context) {
    // Clear execution history
    this.executionHistory = [];
    
    return {
      success: true,
      message: 'Terminal cleared',
      action: 'clear-terminal',
      clearHistory: true
    };
  }

  /**
   * Format character name for display
   * @param {string} characterId - Character ID
   * @returns {string} Formatted display name
   */
  formatCharacterName(characterId) {
    const nameMap = {
      'corporate-ai': 'Corporate AI',
      'zen-monk': 'Zen Monk',
      'chaos': 'Chaos'
    };
    
    return nameMap[characterId] || characterId;
  }

  /**
   * Format system status information
   * @param {Object} currentState - Current application state
   * @returns {string} Formatted status message
   */
  formatSystemStatus(currentState) {
    const uptime = this.calculateUptime();
    const queueInfo = this.commandQueue.length > 0 ? `\nQueue: ${this.commandQueue.length} pending` : '';
    
    return `System Status:
Character: ${currentState.currentCharacter || 'Corporate AI'}
Messages: ${currentState.messageStatus || 'Active'}
Terminal: Online
Uptime: ${uptime}
Commands Executed: ${this.executionHistory.length}${queueInfo}`;
  }

  /**
   * Format system configuration information
   * @param {Object} currentState - Current application state
   * @returns {string} Formatted config message
   */
  formatSystemConfig(currentState) {
    return `System Configuration:
Character: ${currentState.currentCharacter || 'Corporate AI'}
Messages: ${currentState.messageStatus || 'Active'}
Theme: Matrix Green Terminal
Auto-hide: Enabled (2s delay)
Animations: Enabled
Command Queue: ${this.maxQueueSize} max
Rate Limit: ${this.minExecutionInterval}ms`;
  }

  /**
   * Format debug information
   * @param {Object} currentState - Current application state
   * @returns {string} Formatted debug message
   */
  formatDebugInfo(currentState) {
    const memoryUsage = this.getMemoryUsage();
    
    return `Debug Information:
Terminal: CommandExecutor v1.0
Queue Status: ${this.isProcessing ? 'Processing' : 'Idle'}
Queue Length: ${this.commandQueue.length}/${this.maxQueueSize}
Execution History: ${this.executionHistory.length}/${this.maxHistorySize}
Cache Status: ${this.isCacheValid() ? 'Valid' : 'Expired'}
Memory Usage: ${memoryUsage}
Last Execution: ${this.lastExecutionTime ? new Date(this.lastExecutionTime).toLocaleTimeString() : 'None'}`;
  }

  /**
   * Calculate system uptime
   * @returns {string} Formatted uptime
   */
  calculateUptime() {
    if (!this.startTime) {
      this.startTime = Date.now();
    }
    
    const uptime = Date.now() - this.startTime;
    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / (1000 * 60)) % 60;
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Get memory usage information
   * @returns {string} Memory usage description
   */
  getMemoryUsage() {
    const usage = {
      queue: this.commandQueue.length,
      history: this.executionHistory.length,
      cache: Object.keys(this.systemStateCache).length
    };
    
    return `Queue: ${usage.queue}, History: ${usage.history}, Cache: ${usage.cache}`;
  }

  /**
   * Update system state cache
   * @param {Object} updates - State updates to cache
   */
  updateSystemStateCache(updates) {
    this.systemStateCache = { ...this.systemStateCache, ...updates };
    this.lastCacheUpdate = Date.now();
  }

  /**
   * Check if cache is still valid
   * @returns {boolean} Cache validity
   */
  isCacheValid() {
    return (Date.now() - this.lastCacheUpdate) < this.cacheExpiry;
  }

  /**
   * Add execution to history
   * @param {Object} task - Execution task
   * @param {Object} result - Execution result
   */
  addToExecutionHistory(task, result) {
    const historyEntry = {
      id: task.id,
      timestamp: Date.now(),
      command: task.commandResult.action,
      success: result.success,
      duration: Date.now() - task.timestamp,
      retries: task.retries
    };
    
    this.executionHistory.push(historyEntry);
    
    // Limit history size
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }

  /**
   * Get execution statistics
   * @returns {Object} Execution statistics
   */
  getExecutionStats() {
    const total = this.executionHistory.length;
    const successful = this.executionHistory.filter(entry => entry.success).length;
    const failed = total - successful;
    const avgDuration = total > 0 
      ? this.executionHistory.reduce((sum, entry) => sum + entry.duration, 0) / total 
      : 0;
    
    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total * 100).toFixed(1) + '%' : '0%',
      averageDuration: avgDuration.toFixed(1) + 'ms'
    };
  }

  /**
   * Clear command queue (emergency stop)
   */
  clearQueue() {
    this.commandQueue = [];
    this.isProcessing = false;
    console.log('Command queue cleared');
  }

  /**
   * Get current queue status
   * @returns {Object} Queue status information
   */
  getQueueStatus() {
    return {
      length: this.commandQueue.length,
      maxSize: this.maxQueueSize,
      isProcessing: this.isProcessing,
      nextProcessingTime: this.isProcessing ? null : Date.now() + this.processingDelay
    };
  }

  /**
   * Cleanup and destroy executor
   */
  destroy() {
    this.clearQueue();
    this.executionHistory = [];
    this.systemStateCache = {};
    console.log('CommandExecutor destroyed');
  }
}

/**
 * React component wrapper for CommandExecutor
 */
const CommandExecutorComponent = ({ 
  onCharacterSwitch, 
  onMessageControl, 
  getCurrentState,
  onError,
  children 
}) => {
  const executorRef = useRef(null);

  // Initialize executor
  useEffect(() => {
    executorRef.current = new CommandExecutor({
      onCharacterSwitch,
      onMessageControl,
      getCurrentState,
      onError
    });

    return () => {
      if (executorRef.current) {
        executorRef.current.destroy();
      }
    };
  }, [onCharacterSwitch, onMessageControl, getCurrentState, onError]);

  // Execute command method
  const executeCommand = useCallback(async (commandResult, context) => {
    if (executorRef.current) {
      return await executorRef.current.execute(commandResult, context);
    }
    return {
      success: false,
      message: 'CommandExecutor not initialized',
      suggestion: 'Please try again'
    };
  }, []);

  // Expose executor methods
  const executorMethods = {
    execute: executeCommand,
    getQueueStatus: () => executorRef.current?.getQueueStatus(),
    getExecutionStats: () => executorRef.current?.getExecutionStats(),
    clearQueue: () => executorRef.current?.clearQueue()
  };

  // Render children with executor context
  return typeof children === 'function' ? children(executorMethods) : children;
};

CommandExecutorComponent.propTypes = {
  onCharacterSwitch: PropTypes.func.isRequired,
  onMessageControl: PropTypes.func.isRequired,
  getCurrentState: PropTypes.func,
  onError: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
};

export default CommandExecutorComponent;
export { CommandExecutor };