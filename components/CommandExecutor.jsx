/**
 * CommandExecutor Component
 * 
 * Integrates terminal commands with the existing VibeScreen application systems.
 * Handles character switching, message control, system status, and command queuing.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import SettingsManager from '../utils/SettingsManager.js';

class CommandExecutor {
  constructor(options = {}) {
    this.onCharacterSwitch = options.onCharacterSwitch || (() => {});
    this.onMessageControl = options.onMessageControl || (() => {});
    this.getCurrentState = options.getCurrentState || (() => ({}));
    this.onError = options.onError || console.error;
    
    // Initialize settings manager
    this.settingsManager = options.settingsManager || new SettingsManager();
    
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
          
        case 'set-speed':
        case 'set-frequency':
        case 'set-effects':
        case 'set-volume':
        case 'toggle-audio':
        case 'export-config':
        case 'import-config':
        case 'reset-settings':
          result = await this.handleSettingsCommand(commandResult, context);
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

      // Execute character switch through callback
      if (this.onCharacterSwitch) {
        // Pass the character data directly to the switch controller
        // The controller will handle validation and mode mapping
        await this.onCharacterSwitch(data.character);
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
   * Handle settings-related commands
   * @param {Object} commandResult - Command result from parser
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Settings command result
   */
  async handleSettingsCommand(commandResult, context) {
    try {
      const { action, data } = commandResult;
      
      switch (action) {
        case 'set-speed':
          return this.handleSpeedCommand(data);
          
        case 'set-frequency':
          return this.handleFrequencyCommand(data);
          
        case 'set-effects':
          return this.handleEffectsCommand(data);
          
        case 'set-volume':
          return this.handleVolumeCommand(data);
          
        case 'toggle-audio':
          return this.handleAudioToggleCommand(data);
          
        case 'export-config':
          return this.handleExportCommand();
          
        case 'import-config':
          return this.handleImportCommand(data);
          
        case 'reset-settings':
          return this.handleResetCommand();
          
        default:
          return {
            success: false,
            message: `Unknown settings command: ${action}`,
            suggestion: 'Use !help to see available commands'
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Settings command failed: ${error.message}`,
        suggestion: 'Please check your command syntax and try again'
      };
    }
  }

  /**
   * Handle animation speed command
   * @param {Object} data - Command data
   * @returns {Object} Command result
   */
  handleSpeedCommand(data) {
    const speed = parseFloat(data.speed);
    
    if (isNaN(speed) || speed < 0.1 || speed > 5.0) {
      return {
        success: false,
        message: 'Invalid speed value. Use a number between 0.1 and 5.0',
        suggestion: 'Example: !speed 1.5'
      };
    }
    
    const success = this.settingsManager.setSetting('visual.animationSpeed', speed);
    
    if (success) {
      return {
        success: true,
        message: `Animation speed set to ${speed}x`,
        action: 'set-speed',
        data: { speed }
      };
    } else {
      return {
        success: false,
        message: 'Failed to update animation speed',
        suggestion: 'Please try again'
      };
    }
  }

  /**
   * Handle message frequency command
   * @param {Object} data - Command data
   * @returns {Object} Command result
   */
  handleFrequencyCommand(data) {
    const frequency = parseInt(data.frequency);
    
    if (isNaN(frequency) || frequency < 5 || frequency > 300) {
      return {
        success: false,
        message: 'Invalid frequency value. Use a number between 5 and 300 seconds',
        suggestion: 'Example: !frequency 30'
      };
    }
    
    const success = this.settingsManager.setSetting('messages.frequency', frequency);
    
    if (success) {
      return {
        success: true,
        message: `Message frequency set to ${frequency} seconds`,
        action: 'set-frequency',
        data: { frequency }
      };
    } else {
      return {
        success: false,
        message: 'Failed to update message frequency',
        suggestion: 'Please try again'
      };
    }
  }

  /**
   * Handle effects intensity command
   * @param {Object} data - Command data
   * @returns {Object} Command result
   */
  handleEffectsCommand(data) {
    const intensity = data.intensity.toLowerCase();
    const validIntensities = ['high', 'medium', 'low', 'off'];
    
    if (!validIntensities.includes(intensity)) {
      return {
        success: false,
        message: 'Invalid effects intensity. Use: high, medium, low, or off',
        suggestion: 'Example: !effects medium'
      };
    }
    
    const success = this.settingsManager.setSetting('visual.effectsIntensity', intensity);
    
    if (success) {
      return {
        success: true,
        message: `Effects intensity set to ${intensity}`,
        action: 'set-effects',
        data: { intensity }
      };
    } else {
      return {
        success: false,
        message: 'Failed to update effects intensity',
        suggestion: 'Please try again'
      };
    }
  }

  /**
   * Handle volume command
   * @param {Object} data - Command data
   * @returns {Object} Command result
   */
  handleVolumeCommand(data) {
    const { volume } = data;
    
    if (volume === 'mute') {
      const success = this.settingsManager.setSetting('audio.muted', true);
      return {
        success,
        message: success ? 'Audio muted' : 'Failed to mute audio',
        action: 'set-volume',
        data: { muted: true }
      };
    }
    
    if (volume === 'unmute') {
      const success = this.settingsManager.setSetting('audio.muted', false);
      return {
        success,
        message: success ? 'Audio unmuted' : 'Failed to unmute audio',
        action: 'set-volume',
        data: { muted: false }
      };
    }
    
    const volumeLevel = parseFloat(volume);
    
    if (isNaN(volumeLevel) || volumeLevel < 0 || volumeLevel > 1) {
      return {
        success: false,
        message: 'Invalid volume level. Use a number between 0.0 and 1.0, or "mute"/"unmute"',
        suggestion: 'Example: !volume 0.5 or !volume mute'
      };
    }
    
    const success = this.settingsManager.setSetting('audio.volume', volumeLevel);
    
    if (success) {
      return {
        success: true,
        message: `Volume set to ${Math.round(volumeLevel * 100)}%`,
        action: 'set-volume',
        data: { volume: volumeLevel }
      };
    } else {
      return {
        success: false,
        message: 'Failed to update volume',
        suggestion: 'Please try again'
      };
    }
  }

  /**
   * Handle audio toggle command
   * @param {Object} data - Command data
   * @returns {Object} Command result
   */
  handleAudioToggleCommand(data) {
    const currentEnabled = this.settingsManager.getSetting('audio.enabled');
    const newEnabled = !currentEnabled;
    
    const success = this.settingsManager.setSetting('audio.enabled', newEnabled);
    
    if (success) {
      return {
        success: true,
        message: `Audio ${newEnabled ? 'enabled' : 'disabled'}`,
        action: 'toggle-audio',
        data: { enabled: newEnabled }
      };
    } else {
      return {
        success: false,
        message: 'Failed to toggle audio',
        suggestion: 'Please try again'
      };
    }
  }

  /**
   * Handle export configuration command
   * @returns {Object} Export result
   */
  handleExportCommand() {
    const result = this.settingsManager.exportConfig();
    
    if (result.success) {
      return {
        success: true,
        message: result.message,
        action: 'export-config',
        data: {
          configString: result.configString,
          size: result.size
        }
      };
    } else {
      return {
        success: false,
        message: result.message,
        suggestion: 'Please try again or check system status'
      };
    }
  }

  /**
   * Handle import configuration command
   * @param {Object} data - Command data
   * @returns {Object} Import result
   */
  handleImportCommand(data) {
    const { configString } = data;
    
    if (!configString) {
      return {
        success: false,
        message: 'No configuration string provided',
        suggestion: 'Example: !import <config-string>'
      };
    }
    
    const result = this.settingsManager.importConfig(configString);
    
    return {
      success: result.success,
      message: result.message,
      action: 'import-config',
      data: result.success ? { imported: true } : { error: result.message }
    };
  }

  /**
   * Handle reset settings command
   * @returns {Object} Reset result
   */
  handleResetCommand() {
    const result = this.settingsManager.resetToDefaults();
    
    return {
      success: result.success,
      message: result.message,
      action: 'reset-settings',
      data: result.success ? { reset: true } : { error: result.message }
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
    const settings = this.settingsManager.getSettingsSummary();
    
    return `System Configuration:
Character: ${currentState.currentCharacter || settings.system.currentCharacter}
Messages: ${currentState.messageStatus || 'Active'} (${settings.customization.messageFrequency}s)
Audio: ${settings.customization.audioEnabled ? 'Enabled' : 'Disabled'} (${Math.round(settings.customization.audioVolume * 100)}%)
Animation Speed: ${settings.customization.animationSpeed}x
Effects: ${settings.customization.effectsIntensity}
Auto-save: ${settings.system.autoSave ? 'Enabled' : 'Disabled'}
Performance Mode: ${settings.system.performanceMode}
High Contrast: ${settings.accessibility.highContrast ? 'On' : 'Off'}
Reduced Motion: ${settings.accessibility.reducedMotion ? 'On' : 'Off'}`;
  }

  /**
   * Format debug information
   * @param {Object} currentState - Current application state
   * @returns {string} Formatted debug message
   */
  formatDebugInfo(currentState) {
    const memoryUsage = this.getMemoryUsage();
    const performanceMetrics = this.settingsManager.getPerformanceMetrics();
    const systemInfo = this.settingsManager.getSystemInfo();
    
    return `Debug Information:
Terminal: CommandExecutor v1.0
Queue Status: ${this.isProcessing ? 'Processing' : 'Idle'}
Queue Length: ${this.commandQueue.length}/${this.maxQueueSize}
Execution History: ${this.executionHistory.length}/${this.maxHistorySize}
Cache Status: ${this.isCacheValid() ? 'Valid' : 'Expired'}
Memory Usage: ${memoryUsage}
Performance: ${performanceMetrics.fps} FPS, ${performanceMetrics.memoryUsage}MB
Browser: ${systemInfo.userAgent.split(' ')[0]}
Viewport: ${systemInfo.viewport.width}x${systemInfo.viewport.height}
Settings Version: ${systemInfo.version}
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