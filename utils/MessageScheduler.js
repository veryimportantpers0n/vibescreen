/**
 * MessageScheduler Class
 * 
 * Handles automated message rotation, timing, and scheduling for AI personality modes.
 * Manages message queues, random selection, and pause/resume functionality.
 */

class MessageScheduler {
  constructor(options = {}) {
    // Configuration
    this.globalConfig = options.globalConfig || {};
    this.onMessageShow = options.onMessageShow || (() => {});
    this.onError = options.onError || console.error;
    
    // Enhanced state management for stacking and cleanup
    this.activeMessages = new Map(); // Changed to Map for better tracking
    this.messageQueue = [];
    this.isPaused = false;
    this.currentMode = null;
    this.currentModeConfig = null;
    this.currentTimeout = null;
    this.messageHistory = [];
    this.maxHistorySize = 10;
    this.maxConcurrentMessages = 3;
    
    // Message lifecycle management
    this.messageCleanupTimeouts = new Map();
    this.messageStackPositions = new Map();
    this.nextStackPosition = 0;
    
    // Message data cache
    this.messageCache = new Map();
    this.masterMessages = new Map();
    
    // Performance tracking
    this.stats = {
      messagesShown: 0,
      totalScheduled: 0,
      averageDelay: 0,
      lastMessageTime: null
    };
    
    // Bind methods
    this.scheduleNext = this.scheduleNext.bind(this);
    this.showMessage = this.showMessage.bind(this);
    this.cleanup = this.cleanup.bind(this);
    
    // Initialize
    this.loadMasterMessages();
  }

  /**
   * Load master message lists from data directory
   */
  async loadMasterMessages() {
    try {
      const masterMessageTypes = [
        'cliche-ai-phrases',
        'funny-exaggerations', 
        'cliche-ai-things'
      ];
      
      for (const type of masterMessageTypes) {
        try {
          const response = await fetch(`/data/master-messages/${type}.json`);
          if (response.ok) {
            const messages = await response.json();
            this.masterMessages.set(type, messages);
          }
        } catch (error) {
          console.warn(`Failed to load master messages: ${type}`, error);
        }
      }
    } catch (error) {
      this.onError('Failed to load master messages', error);
    }
  }

  /**
   * Load mode-specific configuration and messages
   */
  async loadModeConfig(mode) {
    if (!mode) return null;
    
    try {
      // Load mode configuration
      const configResponse = await fetch(`/modes/${mode}/config.json`);
      if (!configResponse.ok) {
        throw new Error(`Failed to load config for mode: ${mode}`);
      }
      const config = await configResponse.json();
      
      // Try to load mode-specific messages first
      let messages = [];
      try {
        const messagesResponse = await fetch(`/modes/${mode}/messages.json`);
        if (messagesResponse.ok) {
          messages = await messagesResponse.json();
        }
      } catch (error) {
        // If no mode-specific messages, generate from master lists
        messages = this.generateMessagesFromMaster(config);
      }
      
      // Cache the messages
      this.messageCache.set(mode, messages);
      
      return {
        ...config,
        messages: messages
      };
    } catch (error) {
      this.onError(`Failed to load mode config: ${mode}`, error);
      return null;
    }
  }

  /**
   * Generate messages from master lists based on mode probabilities
   */
  generateMessagesFromMaster(config) {
    const messages = [];
    const probabilities = config.messageProbabilities || {
      cliche: 0.6,
      exaggeration: 0.2,
      other: 0.2
    };
    
    // Get messages from each category based on probabilities
    const clicheMessages = this.masterMessages.get('cliche-ai-phrases') || [];
    const exaggerationMessages = this.masterMessages.get('funny-exaggerations') || [];
    const otherMessages = this.masterMessages.get('cliche-ai-things') || [];
    
    // Calculate message counts based on probabilities (target ~20-30 messages per mode)
    const totalMessages = 25;
    const clicheCount = Math.floor(totalMessages * probabilities.cliche);
    const exaggerationCount = Math.floor(totalMessages * probabilities.exaggeration);
    const otherCount = totalMessages - clicheCount - exaggerationCount;
    
    // Randomly select messages from each category
    messages.push(...this.selectRandomMessages(clicheMessages, clicheCount));
    messages.push(...this.selectRandomMessages(exaggerationMessages, exaggerationCount));
    messages.push(...this.selectRandomMessages(otherMessages, otherCount));
    
    return messages;
  }

  /**
   * Select random messages from an array without duplicates
   */
  selectRandomMessages(messageArray, count) {
    if (!messageArray || messageArray.length === 0) return [];
    
    const shuffled = [...messageArray].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Start message scheduling for a specific mode
   */
  async start(mode) {
    if (this.currentMode === mode && !this.isPaused) {
      return; // Already running for this mode
    }
    
    // Stop current scheduling and clean up previous mode
    this.stop();
    
    // Load new mode configuration
    const modeConfig = await this.loadModeConfig(mode);
    if (!modeConfig) {
      this.onError(`Failed to start scheduler: invalid mode ${mode}`);
      return;
    }
    
    // Update state
    this.currentMode = mode;
    this.currentModeConfig = modeConfig;
    this.isPaused = false;
    
    // Enhanced cleanup for mode switching
    this.clearAllMessages();
    this.messageQueue = [];
    this.messageHistory = [];
    this.nextStackPosition = 0;
    
    // Start scheduling
    this.scheduleNext();
    
    console.log(`MessageScheduler started for mode: ${mode}`);
  }

  /**
   * Stop message scheduling
   */
  stop() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    
    // Enhanced cleanup to prevent memory leaks
    this.clearAllMessages();
    
    this.currentMode = null;
    this.currentModeConfig = null;
    this.isPaused = false;
    
    console.log('MessageScheduler stopped');
  }

  /**
   * Pause message scheduling
   */
  pause() {
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    
    this.isPaused = true;
    console.log('MessageScheduler paused');
  }

  /**
   * Resume message scheduling
   */
  resume() {
    if (!this.currentMode || !this.currentModeConfig) {
      console.warn('Cannot resume: no active mode');
      return;
    }
    
    this.isPaused = false;
    this.scheduleNext();
    console.log('MessageScheduler resumed');
  }

  /**
   * Schedule the next message based on mode timing configuration
   */
  scheduleNext() {
    if (this.isPaused || !this.currentModeConfig) {
      return;
    }
    
    // Get timing configuration
    const minDelay = this.currentModeConfig.minDelaySeconds || this.globalConfig.defaultMinDelaySeconds || 15;
    const maxDelay = this.currentModeConfig.maxDelaySeconds || this.globalConfig.defaultMaxDelaySeconds || 45;
    
    // Calculate random delay within range
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    // Apply global animation speed multiplier
    const speedMultiplier = this.globalConfig.animationSpeedMultiplier || 1.0;
    const adjustedDelay = delay / speedMultiplier;
    
    // Update statistics
    this.stats.totalScheduled++;
    this.stats.averageDelay = (this.stats.averageDelay + adjustedDelay) / 2;
    
    // Schedule next message
    this.currentTimeout = setTimeout(() => {
      this.showMessage();
      this.scheduleNext(); // Schedule the next one
    }, adjustedDelay * 1000);
    
    console.log(`Next message scheduled in ${adjustedDelay.toFixed(1)} seconds`);
  }

  /**
   * Show a message immediately with enhanced stacking management
   */
  showMessage(forceMessage = null) {
    if (!this.currentModeConfig) {
      console.warn('Cannot show message: no active mode');
      return;
    }
    
    // Check concurrent message limit and handle queue
    if (this.activeMessages.size >= this.maxConcurrentMessages) {
      // Add to queue if not at capacity
      if (this.messageQueue.length < 5) {
        const queuedMessage = forceMessage || this.selectMessage();
        if (queuedMessage) {
          this.messageQueue.push(queuedMessage);
          console.log('Message queued due to limit');
        }
      }
      return;
    }
    
    // Select message
    const message = forceMessage || this.selectMessage();
    if (!message) {
      console.warn('No message available to show');
      return;
    }
    
    // Calculate stack position to prevent overlapping
    const stackPosition = this.calculateStackPosition();
    
    // Create enhanced message object with stacking info
    const messageObj = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: message,
      mode: this.currentMode,
      position: this.currentModeConfig.popupPosition || 'overlay',
      style: this.currentModeConfig.popupStyle || 'overlay',
      animationType: this.currentModeConfig.animationType || 'normal',
      duration: this.calculateMessageDuration(),
      timestamp: Date.now(),
      stackPosition: stackPosition,
      stackOffset: this.calculateStackOffset(stackPosition)
    };
    
    // Add to active messages with full tracking
    this.activeMessages.set(messageObj.id, messageObj);
    this.messageStackPositions.set(messageObj.id, stackPosition);
    
    // Schedule automatic cleanup
    this.scheduleMessageCleanup(messageObj.id, messageObj.duration);
    
    // Update history
    this.messageHistory.push(message);
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory.shift();
    }
    
    // Update statistics
    this.stats.messagesShown++;
    this.stats.lastMessageTime = Date.now();
    
    // Show the message
    this.onMessageShow(messageObj);
    
    console.log(`Showing message: "${message.substring(0, 50)}..." at stack position ${stackPosition}`);
  }

  /**
   * Select a random message from the current mode's messages
   */
  selectMessage() {
    const messages = this.currentModeConfig.messages || [];
    if (messages.length === 0) {
      return null;
    }
    
    // Filter out recently shown messages to avoid repetition
    const availableMessages = messages.filter(msg => 
      !this.messageHistory.slice(-Math.min(5, messages.length / 2)).includes(msg)
    );
    
    // If all messages were recent, use all messages
    const messagePool = availableMessages.length > 0 ? availableMessages : messages;
    
    // Select random message
    const randomIndex = Math.floor(Math.random() * messagePool.length);
    return messagePool[randomIndex];
  }

  /**
   * Calculate message duration based on configuration and accessibility settings
   */
  calculateMessageDuration() {
    const baseDuration = 5000; // 5 seconds default
    
    // Apply accessibility multiplier
    const accessibilityMultiplier = this.globalConfig.accessibility?.messageLifespanMultiplier || 1.0;
    
    // Apply global animation speed
    const speedMultiplier = this.globalConfig.animationSpeedMultiplier || 1.0;
    
    return (baseDuration * accessibilityMultiplier) / speedMultiplier;
  }

  /**
   * Test popup - show a message immediately
   */
  testPopup() {
    if (!this.currentModeConfig) {
      console.warn('Cannot test popup: no active mode');
      return;
    }
    
    this.showMessage();
    console.log('Test popup triggered');
  }

  /**
   * Clean up a completed message with enhanced memory management
   */
  cleanup(messageId) {
    // Remove from active messages
    this.activeMessages.delete(messageId);
    
    // Clear cleanup timeout if exists
    if (this.messageCleanupTimeouts.has(messageId)) {
      clearTimeout(this.messageCleanupTimeouts.get(messageId));
      this.messageCleanupTimeouts.delete(messageId);
    }
    
    // Remove stack position tracking
    this.messageStackPositions.delete(messageId);
    
    // Process queued messages if space available
    this.processMessageQueue();
    
    console.log(`Message cleaned up: ${messageId}`);
  }

  /**
   * Get current scheduler status
   */
  getStatus() {
    return {
      isRunning: !this.isPaused && this.currentMode !== null,
      isPaused: this.isPaused,
      currentMode: this.currentMode,
      activeMessages: this.activeMessages.size,
      messageHistory: this.messageHistory.length,
      stats: { ...this.stats }
    };
  }

  /**
   * Update global configuration
   */
  updateGlobalConfig(newConfig) {
    this.globalConfig = { ...this.globalConfig, ...newConfig };
    console.log('Global config updated');
  }

  /**
   * Get available messages for current mode
   */
  getCurrentMessages() {
    return this.currentModeConfig?.messages || [];
  }

  /**
   * Force reload messages for current mode
   */
  async reloadMessages() {
    if (this.currentMode) {
      this.messageCache.delete(this.currentMode);
      const modeConfig = await this.loadModeConfig(this.currentMode);
      if (modeConfig) {
        this.currentModeConfig = modeConfig;
        console.log(`Messages reloaded for mode: ${this.currentMode}`);
      }
    }
  }

  /**
   * Calculate stack position for new message to prevent overlapping
   */
  calculateStackPosition() {
    // Find the lowest available stack position
    const usedPositions = new Set(this.messageStackPositions.values());
    let position = 0;
    
    while (usedPositions.has(position)) {
      position++;
    }
    
    return position;
  }

  /**
   * Calculate visual offset for stacked messages
   */
  calculateStackOffset(stackPosition) {
    const baseOffset = 60; // Base vertical offset between messages
    const horizontalVariation = 20; // Slight horizontal variation for visual interest
    
    return {
      x: (stackPosition % 2) * horizontalVariation - horizontalVariation / 2,
      y: stackPosition * baseOffset
    };
  }

  /**
   * Schedule automatic cleanup for a message
   */
  scheduleMessageCleanup(messageId, duration) {
    const timeout = setTimeout(() => {
      this.cleanup(messageId);
    }, duration);
    
    this.messageCleanupTimeouts.set(messageId, timeout);
  }

  /**
   * Process queued messages when space becomes available
   */
  processMessageQueue() {
    if (this.messageQueue.length > 0 && this.activeMessages.size < this.maxConcurrentMessages) {
      const queuedMessage = this.messageQueue.shift();
      this.showMessage(queuedMessage);
    }
  }

  /**
   * Clear all active messages and cleanup resources
   */
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
    
    console.log('All messages cleared');
  }

  /**
   * Handle rapid user interactions gracefully
   */
  handleRapidInteraction(interactionType) {
    const now = Date.now();
    const minInteractionDelay = 500; // Minimum 500ms between rapid interactions
    
    if (this.lastInteractionTime && (now - this.lastInteractionTime) < minInteractionDelay) {
      console.log(`Rapid interaction detected: ${interactionType}, throttling`);
      return false; // Throttle rapid interactions
    }
    
    this.lastInteractionTime = now;
    return true;
  }

  /**
   * Enhanced mode switching with proper cleanup
   */
  async switchMode(newMode) {
    if (!this.handleRapidInteraction('mode-switch')) {
      return;
    }
    
    console.log(`Switching from ${this.currentMode} to ${newMode}`);
    
    // Clear all messages from previous mode
    this.clearAllMessages();
    
    // Start new mode
    await this.start(newMode);
  }

  /**
   * Get detailed status including stacking information
   */
  getDetailedStatus() {
    return {
      ...this.getStatus(),
      stackingInfo: {
        activeMessageIds: Array.from(this.activeMessages.keys()),
        stackPositions: Object.fromEntries(this.messageStackPositions),
        queueLength: this.messageQueue.length,
        cleanupTimeouts: this.messageCleanupTimeouts.size
      },
      memoryUsage: {
        activeMessages: this.activeMessages.size,
        messageCache: this.messageCache.size,
        masterMessages: this.masterMessages.size,
        messageHistory: this.messageHistory.length
      }
    };
  }

  /**
   * Cleanup and destroy scheduler with enhanced memory management
   */
  destroy() {
    this.stop();
    this.clearAllMessages();
    this.messageCache.clear();
    this.masterMessages.clear();
    this.messageHistory = [];
    
    // Clear any remaining timeouts
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
    }
    
    console.log('MessageScheduler destroyed');
  }
}

export default MessageScheduler;