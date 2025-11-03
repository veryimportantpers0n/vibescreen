/**
 * MessageController Component
 * 
 * Integrates MessageScheduler with MessagePopup components to provide
 * complete message scheduling and display functionality.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MessagePopupContainer } from './MessagePopup';
import { useMessageScheduler } from '../utils/useMessageScheduler';

const MessageController = ({
  currentMode,
  globalConfig = {},
  characterPosition = { x: window.innerWidth - 120, y: window.innerHeight - 120 },
  onError = console.error,
  onStatusChange,
  className = '',
  testId = 'message-controller'
}) => {
  const [characterPos, setCharacterPos] = useState(characterPosition);

  // Initialize message scheduler
  const {
    messages,
    isRunning,
    isPaused,
    schedulerStatus,
    error,
    startMode,
    stop,
    pause,
    resume,
    togglePause,
    testPopup,
    clearMessages,
    handleMessageComplete,
    updateGlobalConfig
  } = useMessageScheduler({
    globalConfig,
    onError,
    autoStart: false,
    initialMode: null
  });

  // Update character position when prop changes
  useEffect(() => {
    setCharacterPos(characterPosition);
  }, [characterPosition]);

  // Start scheduler when mode changes
  useEffect(() => {
    if (currentMode) {
      startMode(currentMode);
    } else {
      stop();
    }
  }, [currentMode, startMode, stop]);

  // Update global config when it changes
  useEffect(() => {
    updateGlobalConfig(globalConfig);
  }, [globalConfig, updateGlobalConfig]);

  // Notify parent of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange({
        isRunning,
        isPaused,
        currentMode,
        messageCount: messages.length,
        schedulerStatus,
        error
      });
    }
  }, [isRunning, isPaused, currentMode, messages.length, schedulerStatus, error, onStatusChange]);

  // Handle window resize to update character position
  useEffect(() => {
    const handleResize = () => {
      // Update character position if using default positioning
      if (characterPosition.x === window.innerWidth - 120 && 
          characterPosition.y === window.innerHeight - 120) {
        setCharacterPos({
          x: window.innerWidth - 120,
          y: window.innerHeight - 120
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [characterPosition]);

  // Expose control methods via ref (for parent components)
  React.useImperativeHandle(React.forwardRef((props, ref) => ({
    pause,
    resume,
    togglePause,
    testPopup,
    clearMessages,
    stop,
    getStatus: () => schedulerStatus,
    isRunning,
    isPaused
  })), [pause, resume, togglePause, testPopup, clearMessages, stop, schedulerStatus, isRunning, isPaused]);

  // Handle errors
  if (error) {
    console.error('MessageController Error:', error);
  }

  return (
    <div 
      className={`message-controller ${className}`}
      data-testid={testId}
      data-mode={currentMode}
      data-running={isRunning}
      data-paused={isPaused}
      role="region"
      aria-label="AI message system"
      aria-live="polite"
    >
      {/* Message Popup Container */}
      <MessagePopupContainer
        messages={messages}
        characterPosition={characterPos}
        onMessageComplete={handleMessageComplete}
        maxMessages={3}
        className="message-controller-popups"
      />

      {/* Debug Info (Development Only) */}
      {process.env.NODE_ENV === 'development' && schedulerStatus && (
        <div 
          className="message-controller-debug"
          style={{
            position: 'fixed',
            top: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'var(--matrix-green)',
            padding: '8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontFamily: 'var(--font-terminal)',
            zIndex: 'var(--z-debug)',
            maxWidth: '200px'
          }}
        >
          <div><strong>Message Scheduler Debug</strong></div>
          <div>Mode: {currentMode || 'None'}</div>
          <div>Running: {isRunning ? 'Yes' : 'No'}</div>
          <div>Paused: {isPaused ? 'Yes' : 'No'}</div>
          <div>Active Messages: {schedulerStatus.activeMessages}</div>
          <div>Total Shown: {schedulerStatus.stats.messagesShown}</div>
          <div>Avg Delay: {schedulerStatus.stats.averageDelay.toFixed(1)}s</div>
          {error && (
            <div style={{ color: '#ff4444', marginTop: '4px' }}>
              Error: {error.message}
            </div>
          )}
        </div>
      )}

      {/* Screen Reader Status Updates */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {isRunning && !isPaused && `Message system active for ${currentMode} mode`}
        {isPaused && 'Message system paused'}
        {!isRunning && 'Message system stopped'}
      </div>
    </div>
  );
};

/**
 * MessageControllerProvider Component
 * 
 * Provides message controller context to child components
 */
export const MessageControllerProvider = ({ 
  children, 
  globalConfig,
  onError 
}) => {
  const [controllerRef, setControllerRef] = useState(null);

  const contextValue = {
    controller: controllerRef,
    pause: () => controllerRef?.pause(),
    resume: () => controllerRef?.resume(),
    togglePause: () => controllerRef?.togglePause(),
    testPopup: () => controllerRef?.testPopup(),
    clearMessages: () => controllerRef?.clearMessages(),
    getStatus: () => controllerRef?.getStatus()
  };

  return (
    <MessageControllerContext.Provider value={contextValue}>
      {children}
    </MessageControllerContext.Provider>
  );
};

/**
 * Context for accessing message controller
 */
export const MessageControllerContext = React.createContext(null);

/**
 * Hook for accessing message controller context
 */
export const useMessageController = () => {
  const context = React.useContext(MessageControllerContext);
  if (!context) {
    console.warn('useMessageController must be used within MessageControllerProvider');
  }
  return context;
};

// PropTypes
MessageController.propTypes = {
  currentMode: PropTypes.string,
  globalConfig: PropTypes.object,
  characterPosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  onError: PropTypes.func,
  onStatusChange: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string
};

MessageControllerProvider.propTypes = {
  children: PropTypes.node.isRequired,
  globalConfig: PropTypes.object,
  onError: PropTypes.func
};

export default MessageController;