import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { CommandParser } from './CommandParser';
import CommandExecutorComponent from './CommandExecutor';
import styles from '../styles/terminal-interface.module.css';

const TerminalInterface = ({ 
  onCharacterSwitch, 
  onMessageControl, 
  currentCharacter, 
  messageStatus,
  getCurrentState,
  onError,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [displayHistory, setDisplayHistory] = useState([]);
  const [executorMethods, setExecutorMethods] = useState(null);
  const [lastResponse, setLastResponse] = useState('');
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    highContrast: false,
    reducedMotion: false,
    screenReader: false
  });
  const [announcements, setAnnouncements] = useState([]);
  const hideTimeoutRef = useRef(null);
  const terminalRef = useRef(null);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef(null);
  const liveRegionRef = useRef(null);
  const commandParser = useRef(new CommandParser());

  // Detect accessibility preferences
  useEffect(() => {
    const detectAccessibilityPrefs = () => {
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches ||
                          window.matchMedia('(forced-colors: active)').matches;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const screenReader = window.navigator.userAgent.includes('NVDA') ||
                          window.navigator.userAgent.includes('JAWS') ||
                          window.speechSynthesis?.speaking ||
                          document.querySelector('[aria-live]') !== null;

      setAccessibilityPrefs({
        highContrast,
        reducedMotion,
        screenReader
      });
    };

    detectAccessibilityPrefs();

    // Listen for preference changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');

    const handlePreferenceChange = () => detectAccessibilityPrefs();

    contrastQuery.addEventListener('change', handlePreferenceChange);
    motionQuery.addEventListener('change', handlePreferenceChange);
    forcedColorsQuery.addEventListener('change', handlePreferenceChange);

    return () => {
      contrastQuery.removeEventListener('change', handlePreferenceChange);
      motionQuery.removeEventListener('change', handlePreferenceChange);
      forcedColorsQuery.removeEventListener('change', handlePreferenceChange);
    };
  }, []);

  // Clear any existing timeout
  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  // Schedule terminal to hide after 2 seconds
  const scheduleHide = () => {
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsFocused(false);
    }, 2000);
  };

  // Show terminal immediately
  const showTerminal = () => {
    clearHideTimeout();
    setIsVisible(true);
  };

  // Handle mouse enter on trigger area
  const handleTriggerEnter = () => {
    showTerminal();
  };

  // Handle mouse leave from terminal
  const handleTerminalLeave = () => {
    if (!isFocused) {
      scheduleHide();
    }
  };

  // Handle mouse enter on terminal (cancel hide)
  const handleTerminalEnter = () => {
    clearHideTimeout();
  };

  // Handle terminal focus with accessibility enhancements
  const handleTerminalFocus = () => {
    setIsFocused(true);
    clearHideTimeout();
    
    // Announce terminal activation for screen readers
    announceToScreenReader('Terminal interface activated. Type !help for available commands.');
    
    // Focus the input field when terminal is focused
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle terminal blur with accessibility considerations
  const handleTerminalBlur = (e) => {
    // Don't hide if focus is moving to another element within the terminal
    if (terminalRef.current && terminalRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    setIsFocused(false);
    
    // Use longer delay for screen reader users
    const hideDelay = accessibilityPrefs.screenReader ? 5000 : 2000;
    
    clearHideTimeout();
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
      setIsFocused(false);
      announceToScreenReader('Terminal interface hidden.');
    }, hideDelay);
  };

  // Handle command input with enhanced validation
  const handleInputChange = (e) => {
    const value = e.target.value;
    setCurrentInput(value);
    setHistoryIndex(-1); // Reset history navigation
    
    // Keep terminal visible while typing
    if (value.trim()) {
      clearHideTimeout();
    }
  };

  // Enhanced keyboard navigation with accessibility support
  const handleKeyDown = (e) => {
    // Handle global keyboard shortcuts when terminal is visible
    if (isVisible) {
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          executeCommand(currentInput);
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateHistory('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateHistory('down');
          break;
        case 'Tab':
          // Allow normal tab behavior within terminal, but handle completion
          if (e.target === inputRef.current && currentInput.trim()) {
            e.preventDefault();
            handleTabCompletion();
          }
          break;
        case 'Escape':
          e.preventDefault();
          hideTerminal();
          break;
        case 'F1':
          // Help shortcut
          e.preventDefault();
          executeCommand('!help');
          break;
        default:
          break;
      }
    }
  };

  // Enhanced terminal hiding with accessibility announcements
  const hideTerminal = () => {
    setIsVisible(false);
    setIsFocused(false);
    clearHideTimeout();
    announceToScreenReader('Terminal interface hidden. Press Tab to reactivate.');
    
    // Return focus to trigger for keyboard users
    if (triggerRef.current) {
      triggerRef.current.focus();
    }
  };

  // Enhanced tab completion with accessibility announcements
  const handleTabCompletion = () => {
    const input = currentInput.trim().toLowerCase();
    if (!input.startsWith('!')) {
      announceToScreenReader('Commands must start with exclamation mark. Type !help for available commands.');
      return;
    }
    
    const commands = ['!help', '!switch', '!characters', '!status', '!pause', '!resume', '!test', '!clear'];
    const matches = commands.filter(cmd => cmd.startsWith(input));
    
    if (matches.length === 1) {
      const completed = matches[0] + ' ';
      setCurrentInput(completed);
      announceToScreenReader(`Command completed to: ${completed}`);
    } else if (matches.length > 1) {
      const completionText = `Available completions: ${matches.join(', ')}`;
      addToDisplayHistory('info', completionText);
      announceToScreenReader(completionText);
    } else {
      announceToScreenReader('No matching commands found. Type !help for available commands.');
    }
  };

  // Screen reader announcement function
  const announceToScreenReader = (message) => {
    if (!message) return;
    
    // Add to announcements queue
    setAnnouncements(prev => {
      const newAnnouncements = [...prev, {
        id: Date.now(),
        message,
        timestamp: new Date()
      }];
      
      // Limit to last 3 announcements
      return newAnnouncements.slice(-3);
    });
    
    // Update live region
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
    
    // Clear announcement after delay to prevent repetition
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.message !== message));
    }, 3000);
  };

  // Execute command through parser and executor
  const executeCommand = async (input) => {
    if (!input.trim()) return;

    // Add to history
    const newHistory = [...commandHistory, input];
    setCommandHistory(newHistory);
    setHistoryIndex(-1);

    // Add command to display history
    addToDisplayHistory('command', input);

    try {
      // Create execution context
      const context = {
        currentCharacter,
        messageStatus
      };

      // Parse command first
      const parseResult = commandParser.current.parseAndExecute(input, context);
      
      // If parsing failed, show error
      if (!parseResult.success) {
        addToDisplayHistory('error', formatResponse(parseResult.message, 'error'));
        if (parseResult.suggestion) {
          addToDisplayHistory('suggestion', parseResult.suggestion);
        }
        setCurrentInput('');
        return;
      }

      // Execute through CommandExecutor if available
      if (executorMethods && executorMethods.execute) {
        const executionResult = await executorMethods.execute(parseResult, context);
        
        // Handle execution result with accessibility announcements
        if (executionResult.success) {
          const responseType = executionResult.type || 'success';
          const formattedMessage = formatResponse(executionResult.message, responseType);
          
          addToDisplayHistory('response', formattedMessage, {
            action: executionResult.action,
            timestamp: new Date()
          });
          
          // Announce success to screen readers
          announceToScreenReader(`Command executed successfully: ${executionResult.message}`);
          
          // Handle special actions
          if (executionResult.action === 'clear-terminal' && executionResult.clearHistory) {
            setDisplayHistory([]);
            announceToScreenReader('Terminal history cleared.');
          }
        } else {
          const errorMessage = formatResponse(executionResult.message, 'error');
          addToDisplayHistory('error', errorMessage);
          
          // Announce error to screen readers
          announceToScreenReader(`Command failed: ${executionResult.message}`);
          
          if (executionResult.suggestion) {
            addToDisplayHistory('suggestion', executionResult.suggestion);
            announceToScreenReader(`Suggestion: ${executionResult.suggestion}`);
          }
        }
      } else {
        // Fallback to direct execution if executor not available
        addToDisplayHistory('response', formatResponse(parseResult.message, 'info'));
        announceToScreenReader(parseResult.message);
        
        if (parseResult.suggestion) {
          addToDisplayHistory('suggestion', parseResult.suggestion);
          announceToScreenReader(`Suggestion: ${parseResult.suggestion}`);
        }
      }
    } catch (error) {
      console.error('Command execution error:', error);
      const errorMessage = `Execution failed: ${error.message}`;
      addToDisplayHistory('error', formatResponse(errorMessage, 'error'));
      addToDisplayHistory('suggestion', 'Please try again or type !help for available commands');
      
      // Announce error to screen readers
      announceToScreenReader(errorMessage);
      announceToScreenReader('Please try again or type !help for available commands');
    }

    // Clear input
    setCurrentInput('');
  };

  // Navigate command history
  const navigateHistory = (direction) => {
    if (commandHistory.length === 0) return;

    let newIndex = historyIndex;
    if (direction === 'up') {
      newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
    } else {
      newIndex = Math.max(historyIndex - 1, -1);
    }

    setHistoryIndex(newIndex);
    if (newIndex >= 0) {
      setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
    } else {
      setCurrentInput('');
    }
  };

  // Add entry to display history with enhanced formatting and accessibility
  const addToDisplayHistory = (type, content, metadata = {}) => {
    const entry = {
      type,
      content,
      timestamp: new Date(),
      metadata,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Update last response for screen readers
    if (type === 'response' || type === 'error' || type === 'success') {
      setLastResponse(content);
    }
    
    setDisplayHistory(prev => {
      const newHistory = [...prev, entry];
      // Limit history to 50 entries
      const limitedHistory = newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
      
      // Auto-scroll to bottom after state update with accessibility consideration
      setTimeout(() => {
        if (historyRef.current) {
          historyRef.current.scrollTop = historyRef.current.scrollHeight;
          
          // Announce scroll position for screen readers
          if (accessibilityPrefs.screenReader && limitedHistory.length > 10) {
            announceToScreenReader(`Terminal history updated. ${limitedHistory.length} entries total.`);
          }
        }
      }, 0);
      
      return limitedHistory;
    });
  };

  // Format response content for consistent display
  const formatResponse = (content, type = 'response') => {
    if (typeof content !== 'string') {
      return JSON.stringify(content, null, 2);
    }
    
    // Handle multi-line content
    if (content.includes('\n')) {
      return content;
    }
    
    // Add appropriate prefixes for different response types
    switch (type) {
      case 'success':
        return `✓ ${content}`;
      case 'error':
        return `✗ ${content}`;
      case 'info':
        return `ℹ ${content}`;
      case 'warning':
        return `⚠ ${content}`;
      default:
        return content;
    }
  };

  // Default getCurrentState function if not provided
  const defaultGetCurrentState = () => ({
    currentCharacter: currentCharacter || 'Corporate AI',
    messageStatus: messageStatus || 'Active',
    terminalVisible: isVisible,
    terminalFocused: isFocused
  });

  // Global keyboard event listener for accessibility
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Tab to focus terminal when not visible
      if (e.key === 'Tab' && !isVisible && !e.shiftKey) {
        // Check if focus is near the trigger area or no other focusable element is active
        const activeElement = document.activeElement;
        if (!activeElement || activeElement === document.body || activeElement === triggerRef.current) {
          e.preventDefault();
          showTerminal();
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      }
      
      // Handle keyboard shortcuts when terminal is visible
      if (isVisible) {
        handleKeyDown(e);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
      clearHideTimeout();
    };
  }, [isVisible, currentInput]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearHideTimeout();
    };
  }, []);

  return (
    <CommandExecutorComponent
      onCharacterSwitch={onCharacterSwitch}
      onMessageControl={onMessageControl}
      getCurrentState={getCurrentState || defaultGetCurrentState}
      onError={onError || console.error}
    >
      {(methods) => {
        // Store executor methods for use in executeCommand
        if (methods && !executorMethods) {
          setExecutorMethods(methods);
        }

        return (
          <>
            {/* Terminal trigger area - always visible for hover detection */}
            <div
              ref={triggerRef}
              className={`${styles.terminalTrigger} ${accessibilityPrefs.highContrast ? styles.highContrast : ''}`}
              onMouseEnter={handleTriggerEnter}
              onClick={() => {
                showTerminal();
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  showTerminal();
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Activate terminal interface. Press Enter or Space to open, Tab to navigate."
              aria-expanded={isVisible}
              aria-controls="terminal-container"
              aria-describedby="terminal-instructions"
            >
              <div className={styles.triggerIcon}>
                <span aria-hidden="true">{'>'}</span>
              </div>
            </div>

            {/* Hidden instructions for screen readers */}
            <div id="terminal-instructions" className={styles.srOnly}>
              Terminal interface for VibeScreen commands. Use !help for available commands. 
              Press Escape to hide, F1 for help, Tab for command completion.
            </div>

            {/* Enhanced ARIA live regions for screen readers */}
            <div
              ref={liveRegionRef}
              aria-live="polite"
              aria-atomic="true"
              className={styles.srOnly}
              role="status"
              aria-label="Terminal status updates"
            >
              {lastResponse}
            </div>

            {/* Announcements queue for complex screen reader feedback */}
            <div
              aria-live="assertive"
              aria-atomic="false"
              className={styles.srOnly}
              role="alert"
              aria-label="Terminal command results"
            >
              {announcements.map(announcement => (
                <div key={announcement.id}>
                  {announcement.message}
                </div>
              ))}
            </div>

            {/* Terminal container - appears on hover */}
            <div
              id="terminal-container"
              ref={terminalRef}
              className={`${styles.terminalContainer} ${isVisible ? styles.visible : ''} ${className} ${
                accessibilityPrefs.highContrast ? styles.highContrast : ''
              } ${accessibilityPrefs.reducedMotion ? styles.reducedMotion : ''}`}
              onMouseEnter={handleTerminalEnter}
              onMouseLeave={handleTerminalLeave}
              onFocus={handleTerminalFocus}
              onBlur={handleTerminalBlur}
              tabIndex={isVisible ? 0 : -1}
              role="application"
              aria-label={`VibeScreen Terminal Interface. Current character: ${currentCharacter || 'Corporate AI'}. Messages: ${messageStatus || 'Active'}.`}
              aria-hidden={!isVisible}
              aria-describedby="terminal-help-text"
              data-high-contrast={accessibilityPrefs.highContrast}
              data-reduced-motion={accessibilityPrefs.reducedMotion}
              data-screen-reader={accessibilityPrefs.screenReader}
            >
              <div className={styles.terminalHeader}>
                <span className={styles.terminalTitle} id="terminal-help-text">
                  VibeScreen Terminal - Press F1 for help, Escape to close
                </span>
                <div className={styles.terminalControls} aria-hidden="true">
                  <span className={styles.controlDot} title="Terminal status indicator"></span>
                  <span className={styles.controlDot} title="Connection indicator"></span>
                  <span className={styles.controlDot} title="Activity indicator"></span>
                </div>
              </div>
              
              <div className={styles.terminalContent}>
                {displayHistory.length === 0 ? (
                  <div className={styles.terminalWelcome} role="region" aria-label="Terminal welcome message">
                    <div className={styles.welcomeLine}>Welcome to VibeScreen Terminal</div>
                    <div className={styles.welcomeLine}>Type !help for available commands</div>
                    <div className={styles.welcomeLine}>Current: {currentCharacter || 'Corporate AI'}</div>
                    <div className={styles.welcomeLine}>Messages: {messageStatus || 'Active'}</div>
                    {methods && (
                      <div className={styles.welcomeLine}>CommandExecutor: Ready</div>
                    )}
                    <div className={styles.welcomeLine} aria-hidden="true">
                      Keyboard shortcuts: F1=Help, Esc=Close, Tab=Complete
                    </div>
                  </div>
                ) : (
                  <div 
                    ref={historyRef} 
                    className={styles.terminalHistory}
                    role="log"
                    aria-label="Terminal command history"
                    aria-live="polite"
                    tabIndex={0}
                  >
                    {displayHistory.map((entry, index) => (
                      <div 
                        key={entry.id || index} 
                        className={`${styles.historyEntry} ${styles[entry.type]}`}
                        role={entry.type === 'command' ? 'none' : 'status'}
                        aria-label={entry.type === 'command' ? 
                          `Command: ${entry.content}` : 
                          `${entry.type}: ${entry.content}`
                        }
                      >
                        {entry.type === 'command' && (
                          <span className={styles.promptSymbol} aria-hidden="true">{'>'} </span>
                        )}
                        <span className={styles.entryContent}>{entry.content}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={styles.terminalPrompt} role="group" aria-label="Command input">
                  <label htmlFor="terminal-input" className={styles.srOnly}>
                    Enter terminal command. Commands start with exclamation mark. Press Tab for completion, F1 for help.
                  </label>
                  <span className={styles.promptSymbol} aria-hidden="true">{'>'}</span>
                  <input
                    id="terminal-input"
                    ref={inputRef}
                    type="text"
                    value={currentInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className={styles.terminalInput}
                    placeholder={accessibilityPrefs.screenReader ? 
                      "Type !help for commands" : 
                      "Enter command..."
                    }
                    autoComplete="off"
                    spellCheck="false"
                    autoFocus={isVisible}
                    aria-describedby="terminal-input-help"
                    aria-autocomplete="list"
                    role="combobox"
                    aria-expanded="false"
                    aria-haspopup="listbox"
                  />
                  <div id="terminal-input-help" className={styles.srOnly}>
                    Available commands: !help, !switch, !characters, !status, !pause, !resume, !test, !clear
                  </div>
                  <span 
                    className={`${styles.cursor} ${accessibilityPrefs.reducedMotion ? styles.staticCursor : ''}`}
                    aria-hidden="true"
                  ></span>
                </div>
              </div>
            </div>
          </>
        );
      }}
    </CommandExecutorComponent>
  );
};

TerminalInterface.propTypes = {
  onCharacterSwitch: PropTypes.func.isRequired,
  onMessageControl: PropTypes.func.isRequired,
  currentCharacter: PropTypes.string,
  messageStatus: PropTypes.string,
  getCurrentState: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string
};

export default TerminalInterface;