/**
 * useMessageScheduler Hook
 * 
 * React hook for integrating MessageScheduler with React components.
 * Provides state management and lifecycle handling for message scheduling.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import MessageScheduler from './MessageScheduler';

export const useMessageScheduler = (options = {}) => {
  const {
    globalConfig = {},
    onError = console.error,
    autoStart = true,
    initialMode = null
  } = options;

  // State management
  const [messages, setMessages] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentMode, setCurrentMode] = useState(initialMode);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [error, setError] = useState(null);

  // Refs
  const schedulerRef = useRef(null);
  const mountedRef = useRef(true);

  // Initialize scheduler
  useEffect(() => {
    const scheduler = new MessageScheduler({
      globalConfig,
      onMessageShow: handleMessageShow,
      onError: handleError
    });

    schedulerRef.current = scheduler;

    // Auto-start if specified
    if (autoStart && initialMode) {
      scheduler.start(initialMode);
      setIsRunning(true);
      setCurrentMode(initialMode);
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      if (schedulerRef.current) {
        schedulerRef.current.destroy();
      }
    };
  }, [globalConfig, autoStart, initialMode]);

  // Handle new messages from scheduler with enhanced stacking
  const handleMessageShow = useCallback((messageObj) => {
    if (!mountedRef.current) return;

    setMessages(prev => {
      // Check for duplicate messages
      const existingMessage = prev.find(msg => msg.id === messageObj.id);
      if (existingMessage) {
        return prev; // Don't add duplicates
      }

      // Add new message with stacking information
      const enhancedMessage = {
        ...messageObj,
        stackPosition: messageObj.stackPosition || 0,
        stackOffset: messageObj.stackOffset || { x: 0, y: 0 }
      };

      // Add new message and maintain proper stacking order
      const newMessages = [...prev, enhancedMessage];
      
      // Sort by stack position to ensure proper rendering order
      return newMessages
        .sort((a, b) => (a.stackPosition || 0) - (b.stackPosition || 0))
        .slice(-3); // Keep only last 3 messages
    });

    // Note: Auto-cleanup is now handled by the scheduler itself
    // The scheduler will call cleanup() which triggers handleMessageComplete
  }, []);

  // Handle scheduler errors
  const handleError = useCallback((errorMessage, error) => {
    if (!mountedRef.current) return;
    
    console.error('MessageScheduler Error:', errorMessage, error);
    setError({ message: errorMessage, error });
    onError(errorMessage, error);
  }, [onError]);

  // Update scheduler status
  const updateStatus = useCallback(() => {
    if (schedulerRef.current) {
      const status = schedulerRef.current.getStatus();
      setSchedulerStatus(status);
      setIsRunning(status.isRunning);
      setIsPaused(status.isPaused);
    }
  }, []);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  // Start scheduler for a specific mode with enhanced mode switching
  const startMode = useCallback(async (mode) => {
    if (!schedulerRef.current || !mode) return;

    try {
      setError(null);
      
      // Use enhanced mode switching if available
      if (schedulerRef.current.switchMode) {
        await schedulerRef.current.switchMode(mode);
      } else {
        await schedulerRef.current.start(mode);
      }
      
      setCurrentMode(mode);
      setIsRunning(true);
      setIsPaused(false);
      
      // Clear messages when switching modes
      setMessages([]);
      
      updateStatus();
    } catch (error) {
      handleError(`Failed to start mode: ${mode}`, error);
    }
  }, [updateStatus, handleError]);

  // Stop scheduler
  const stop = useCallback(() => {
    if (!schedulerRef.current) return;

    schedulerRef.current.stop();
    setCurrentMode(null);
    setIsRunning(false);
    setIsPaused(false);
    setMessages([]);
    updateStatus();
  }, [updateStatus]);

  // Pause scheduler
  const pause = useCallback(() => {
    if (!schedulerRef.current) return;

    schedulerRef.current.pause();
    setIsPaused(true);
    updateStatus();
  }, [updateStatus]);

  // Resume scheduler
  const resume = useCallback(() => {
    if (!schedulerRef.current) return;

    schedulerRef.current.resume();
    setIsPaused(false);
    updateStatus();
  }, [updateStatus]);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, pause, resume]);

  // Test popup - show message immediately
  const testPopup = useCallback(() => {
    if (!schedulerRef.current) return;

    schedulerRef.current.testPopup();
  }, []);

  // Clear all messages with enhanced cleanup
  const clearMessages = useCallback(() => {
    setMessages([]);
    
    if (schedulerRef.current && schedulerRef.current.clearAllMessages) {
      schedulerRef.current.clearAllMessages();
    }
  }, []);

  // Handle message completion (when user dismisses or message expires)
  const handleMessageComplete = useCallback((messageId) => {
    if (!mountedRef.current) return;
    
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    
    if (schedulerRef.current) {
      schedulerRef.current.cleanup(messageId);
    }
  }, []);

  // Update global configuration
  const updateGlobalConfig = useCallback((newConfig) => {
    if (!schedulerRef.current) return;

    schedulerRef.current.updateGlobalConfig(newConfig);
  }, []);

  // Get current messages for the active mode
  const getCurrentMessages = useCallback(() => {
    if (!schedulerRef.current) return [];
    return schedulerRef.current.getCurrentMessages();
  }, []);

  // Reload messages for current mode
  const reloadMessages = useCallback(async () => {
    if (!schedulerRef.current) return;

    try {
      await schedulerRef.current.reloadMessages();
      updateStatus();
    } catch (error) {
      handleError('Failed to reload messages', error);
    }
  }, [updateStatus, handleError]);

  // Get detailed status including stacking information
  const getDetailedStatus = useCallback(() => {
    if (!schedulerRef.current) return null;
    
    if (schedulerRef.current.getDetailedStatus) {
      return schedulerRef.current.getDetailedStatus();
    }
    
    return schedulerRef.current.getStatus();
  }, []);

  // Return hook interface
  return {
    // State
    messages,
    isRunning,
    isPaused,
    currentMode,
    schedulerStatus,
    error,

    // Actions
    startMode,
    stop,
    pause,
    resume,
    togglePause,
    testPopup,
    clearMessages,
    handleMessageComplete,
    updateGlobalConfig,
    getCurrentMessages,
    reloadMessages,

    // Enhanced utilities
    getDetailedStatus,
    scheduler: schedulerRef.current
  };
};

export default useMessageScheduler;