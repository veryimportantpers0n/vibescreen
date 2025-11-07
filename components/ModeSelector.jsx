import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { runThemeTests } from '../utils/modeThemeValidator.js';
import { runComprehensiveThemeTests } from '../tests/validation/modeThemeTest.js';
import { useThemeManager } from '../utils/useThemeManager.js';
import { getAccessibilityManager, announce, announceStatus } from '../utils/accessibilityManager';

/**
 * ModeSelectorWithAPI Component
 * 
 * Wrapper component that handles API integration for loading modes
 * and manages the mode selection state with automatic fallbacks.
 */
const ModeSelectorWithAPI = ({ 
  onModeChange, 
  className = '',
  initialActiveMode = null 
}) => {
  const [modes, setModes] = useState([]);
  const [activeMode, setActiveMode] = useState(initialActiveMode || 'corporate-ai');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize theme manager
  const themeManager = useThemeManager({
    initialTheme: initialActiveMode || 'corporate-ai',
    onThemeChange: (themeId, config) => {
      console.log(`🎨 Theme changed to: ${config.name}`);
    },
    onTransitionStart: (fromTheme, toTheme) => {
      console.log(`🎨 Theme transition: ${fromTheme} → ${toTheme}`);
    }
  });

  // Load modes from API on component mount
  useEffect(() => {
    const loadModes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/modes');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle both direct array and wrapped response formats
        const modesData = Array.isArray(data) ? data : (data.modes || []);
        
        setModes(modesData);
        
        // Only auto-select if no initial active mode was provided
        if (modesData.length > 0 && !activeMode && !initialActiveMode) {
          const firstMode = modesData[0];
          setActiveMode(firstMode.id);
          // Don't trigger onModeChange on initial load to prevent automatic switching
        }
        
      } catch (error) {
        console.error('Failed to load modes:', error);
        setError(error.message);
        
        // Provide graceful fallback with basic modes
        const fallbackModes = [
          {
            id: 'corporate-ai',
            name: 'Corporate AI',
            popupStyle: 'overlay',
            sceneProps: { primaryColor: '#007acc' }
          },
          {
            id: 'zen-monk',
            name: 'Zen Monk',
            popupStyle: 'speechBubble',
            sceneProps: { primaryColor: '#4a90e2' }
          }
        ];
        
        setModes(fallbackModes);
        
        // Only auto-select fallback if no initial active mode was provided
        if (!activeMode && !initialActiveMode) {
          setActiveMode(fallbackModes[0].id);
          // Don't trigger onModeChange on initial load to prevent automatic switching
        }
        
      } finally {
        setLoading(false);
      }
    };

    loadModes();
  }, []); // Empty dependency array - only run on mount

  // Sync activeMode with initialActiveMode changes
  useEffect(() => {
    if (initialActiveMode && initialActiveMode !== activeMode) {
      setActiveMode(initialActiveMode);
    }
  }, [initialActiveMode, activeMode]);

  // Handle mode selection from the UI
  const handleModeSelect = async (mode) => {
    if (mode && mode.id !== activeMode) {
      setActiveMode(mode.id);
      if (onModeChange) {
        onModeChange(mode);
      }
      
      // Switch theme after mode change to prevent circular dependencies
      try {
        await themeManager.switchTheme(mode.id);
      } catch (error) {
        console.warn('Theme switch failed:', error);
      }
    }
  };

  return (
    <ModeSelector
      modes={modes}
      activeMode={activeMode}
      onModeChange={handleModeSelect}
      loading={loading}
      error={error}
      className={className}
      themeManager={themeManager}
    />
  );
};

/**
 * ModeSelector Component
 * 
 * A bottom navigation interface for switching between AI personality modes.
 * Provides keyboard navigation, accessibility features, and responsive design.
 */
const ModeSelector = ({ 
  modes = [], 
  activeMode = null, 
  onModeChange, 
  loading = false, 
  error = null,
  className = '',
  themeManager = null
}) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);
  const containerRef = useRef(null);
  const buttonRefs = useRef([]);

  // Initialize button refs array when modes change
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(0, modes.length);
  }, [modes.length]);

  // Handle keyboard navigation with enhanced accessibility
  const handleKeyDown = (event) => {
    if (modes.length === 0) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        setIsKeyboardNavigating(true);
        const prevIndex = focusedIndex > 0 ? focusedIndex - 1 : modes.length - 1;
        setFocusedIndex(prevIndex);
        // Focus the button element for screen reader announcement
        if (buttonRefs.current[prevIndex]) {
          buttonRefs.current[prevIndex].focus();
          // Ensure button is visible in scroll container
          buttonRefs.current[prevIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        setIsKeyboardNavigating(true);
        const nextIndex = focusedIndex < modes.length - 1 ? focusedIndex + 1 : 0;
        setFocusedIndex(nextIndex);
        // Focus the button element for screen reader announcement
        if (buttonRefs.current[nextIndex]) {
          buttonRefs.current[nextIndex].focus();
          // Ensure button is visible in scroll container
          buttonRefs.current[nextIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
        break;
      case 'Home':
        event.preventDefault();
        setIsKeyboardNavigating(true);
        setFocusedIndex(0);
        if (buttonRefs.current[0]) {
          buttonRefs.current[0].focus();
          buttonRefs.current[0].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
        break;
      case 'End':
        event.preventDefault();
        setIsKeyboardNavigating(true);
        const lastIndex = modes.length - 1;
        setFocusedIndex(lastIndex);
        if (buttonRefs.current[lastIndex]) {
          buttonRefs.current[lastIndex].focus();
          buttonRefs.current[lastIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (modes[focusedIndex]) {
          handleModeSelect(modes[focusedIndex]);
          // Announce mode change to screen readers
          announceToScreenReader(`Switched to ${modes[focusedIndex].name} mode`);
        }
        break;
      case 'Escape':
        // Allow users to exit keyboard navigation mode
        event.preventDefault();
        setIsKeyboardNavigating(false);
        if (containerRef.current) {
          containerRef.current.blur();
        }
        break;
      default:
        break;
    }
  };

  // Enhanced screen reader announcement helper using accessibility manager
  const announceToScreenReader = (message, priority = 'assertive') => {
    if (!message) return;
    
    // Use accessibility manager for consistent announcements
    if (priority === 'assertive') {
      announce(message, 'assertive');
    } else {
      announceStatus(message);
    }
  };

  // Visual consistency testing utility
  const validateModeThemes = () => {
    if (process.env.NODE_ENV === 'development') {
      modes.forEach(mode => {
        // Validate that each mode has proper theming
        const modeButton = buttonRefs.current.find((btn, index) => 
          modes[index]?.id === mode.id
        );
        
        if (modeButton) {
          // Check if mode has proper CSS custom properties
          const computedStyle = window.getComputedStyle(modeButton);
          const modeColor = computedStyle.getPropertyValue('--mode-color').trim();
          
          if (!modeColor) {
            console.warn(`Mode "${mode.id}" is missing --mode-color CSS custom property`);
          }
          
          // Validate contrast ratios (simplified check)
          const backgroundColor = computedStyle.backgroundColor;
          const textColor = computedStyle.color;
          
          if (backgroundColor && textColor) {
            // Add contrast ratio as data attribute for debugging
            modeButton.setAttribute('data-bg-color', backgroundColor);
            modeButton.setAttribute('data-text-color', textColor);
          }
        }
      });
    }
  };

  // Run theme validation when modes change
  useEffect(() => {
    if (modes.length > 0) {
      // Delay validation to ensure DOM is updated
      setTimeout(() => {
        validateModeThemes();
        
        // DISABLED: Automatic theme testing causes unwanted mode cycling
        // Run comprehensive theme testing in development
        // if (process.env.NODE_ENV === 'development') {
        //   runThemeTests(modes);
        //   
        //   // Run comprehensive visual consistency tests
        //   if (containerRef.current) {
        //     runComprehensiveThemeTests(containerRef.current).then(results => {
        //       console.log('🎨 Comprehensive Theme Test Results:', results);
        //     }).catch(error => {
        //       console.error('Theme testing failed:', error);
        //     });
        //   }
        // }
      }, 100);
    }
  }, [modes]);

  // Handle mode selection with enhanced feedback and animations
  const handleModeSelect = async (mode) => {
    if (onModeChange && mode && mode.id !== activeMode) {
      // Add switching animation class to current active button
      const currentActiveButton = buttonRefs.current.find((btn, index) => 
        modes[index]?.id === activeMode
      );
      if (currentActiveButton) {
        currentActiveButton.classList.add('switching');
        setTimeout(() => {
          currentActiveButton.classList.remove('switching');
        }, 300);
      }
      
      // Add switching-in animation to new button
      const newActiveIndex = modes.findIndex(m => m.id === mode.id);
      if (buttonRefs.current[newActiveIndex]) {
        buttonRefs.current[newActiveIndex].classList.add('switching-in');
        setTimeout(() => {
          buttonRefs.current[newActiveIndex].classList.remove('switching-in');
        }, 400);
      }
      
      // Add mode transition class to container
      if (containerRef.current) {
        containerRef.current.classList.add('mode-transitioning');
        setTimeout(() => {
          containerRef.current.classList.remove('mode-transitioning');
        }, 600);
      }
      
      onModeChange(mode);
      // Provide immediate feedback for screen readers
      announceToScreenReader(`${mode.name} mode selected`);
    }
  };

  // Handle button focus with keyboard navigation awareness
  const handleButtonFocus = (index) => {
    setFocusedIndex(index);
    // Only announce if we're in keyboard navigation mode
    if (isKeyboardNavigating && modes[index]) {
      announceToScreenReader(`${modes[index].name} mode focused`);
    }
  };

  // Handle mouse interaction to disable keyboard navigation mode
  const handleMouseInteraction = () => {
    setIsKeyboardNavigating(false);
  };

  // Reset focused index when modes change and ensure valid focus
  useEffect(() => {
    if (modes.length > 0) {
      if (focusedIndex >= modes.length) {
        setFocusedIndex(0);
      }
      // If there's an active mode, focus on it initially
      const activeIndex = modes.findIndex(mode => mode.id === activeMode);
      if (activeIndex !== -1 && !isKeyboardNavigating) {
        setFocusedIndex(activeIndex);
      }
    }
  }, [modes.length, activeMode, focusedIndex, isKeyboardNavigating]);

  // Update CSS custom properties for active mode theming
  useEffect(() => {
    if (containerRef.current && activeMode) {
      const activeModeData = modes.find(mode => mode.id === activeMode);
      if (activeModeData) {
        // Apply mode-specific theming to the container
        containerRef.current.setAttribute('data-active-mode', activeMode);
        
        // Use ThemeManager if available, otherwise fallback to legacy theming
        if (themeManager) {
          // ThemeManager handles all CSS custom properties
          const themeConfig = themeManager.getThemeConfig(activeMode);
          if (themeConfig) {
            console.log(`🎨 Applied theme config for ${activeMode}:`, themeConfig.name);
          }
        } else {
          // Legacy theming fallback
          if (activeModeData.sceneProps) {
            // Primary color from sceneProps
            if (activeModeData.sceneProps.primaryColor) {
              containerRef.current.style.setProperty('--active-mode-color', activeModeData.sceneProps.primaryColor);
            }
            
            // Background color from sceneProps
            if (activeModeData.sceneProps.bgColor) {
              containerRef.current.style.setProperty('--active-mode-bg-primary', activeModeData.sceneProps.bgColor);
            }
            
            // Additional scene properties for theming
            Object.keys(activeModeData.sceneProps).forEach(key => {
              if (typeof activeModeData.sceneProps[key] === 'string' && activeModeData.sceneProps[key].startsWith('#')) {
                containerRef.current.style.setProperty(`--active-mode-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, activeModeData.sceneProps[key]);
              }
            });
          }
        }
        
        // Apply mode-specific class for enhanced theming
        containerRef.current.classList.add(`mode-theme-${activeMode}`);
        
        // Remove previous mode theme classes
        modes.forEach(mode => {
          if (mode.id !== activeMode) {
            containerRef.current.classList.remove(`mode-theme-${mode.id}`);
          }
        });
      }
    }
  }, [activeMode, modes, themeManager]);

  // Handle container focus to enable keyboard navigation
  const handleContainerFocus = () => {
    setIsKeyboardNavigating(true);
    // Ensure a button is focused when container receives focus
    if (modes.length > 0 && buttonRefs.current[focusedIndex]) {
      buttonRefs.current[focusedIndex].focus();
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`mode-selector ${className} ${isKeyboardNavigating ? 'keyboard-navigating' : ''}`}
      onKeyDown={handleKeyDown}
      onFocus={handleContainerFocus}
      onMouseMove={handleMouseInteraction}
      onMouseDown={handleMouseInteraction}
      role="navigation"
      aria-label="Personality mode selector"
      aria-describedby="mode-selector-instructions"
      tabIndex={modes.length > 0 ? 0 : -1}
    >
      <div className="mode-selector-container">
        {/* Screen reader instructions */}
        <div id="mode-selector-instructions" className="sr-only">
          Use arrow keys to navigate between personality modes. Press Enter or Space to select a mode. Press Escape to exit navigation.
        </div>
        
        {loading ? (
          <div className="mode-selector-loading" role="status" aria-live="polite">
            <span className="loading-text">Loading modes...</span>
          </div>
        ) : error ? (
          <div className="mode-selector-error" role="alert" aria-live="assertive">
            <span className="error-text">Failed to load modes</span>
            <span className="error-detail">{error}</span>
          </div>
        ) : modes.length === 0 ? (
          <div className="mode-selector-empty" role="status" aria-live="polite">
            <span className="empty-text">No modes available</span>
          </div>
        ) : (
          <div 
            className="mode-button-list" 
            role="group" 
            aria-label={`Available personality modes. ${modes.length} modes available. Currently selected: ${modes.find(m => m.id === activeMode)?.name || 'None'}`}
          >
            {modes.map((mode, index) => (
              <ModeButton
                key={mode.id || index}
                ref={el => buttonRefs.current[index] = el}
                mode={mode}
                isActive={activeMode === mode.id}
                isFocused={focusedIndex === index && isKeyboardNavigating}
                onClick={() => handleModeSelect(mode)}
                onFocus={() => handleButtonFocus(index)}
                onMouseEnter={handleMouseInteraction}
                tabIndex={focusedIndex === index ? 0 : -1}
                isKeyboardNavigating={isKeyboardNavigating}
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
                className="animate-slide-up"
              />
            ))}
          </div>
        )}
        
        {/* Live region for announcements */}
        <div 
          className="sr-only" 
          aria-live="polite" 
          aria-atomic="true"
          id="mode-selector-announcements"
        ></div>
      </div>
    </div>
  );
};

/**
 * ModeButton Component
 * 
 * Individual button for each personality mode with comprehensive accessibility,
 * visual states, and terminal-themed styling. Handles active, hover, focus,
 * and disabled states with proper ARIA attributes.
 */
const ModeButton = React.forwardRef(({ 
  mode, 
  isActive, 
  isFocused, 
  onClick, 
  onFocus, 
  onMouseEnter,
  tabIndex,
  disabled = false,
  isKeyboardNavigating = false
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);

  // Build CSS classes based on component state
  const buttonClasses = [
    'mode-button',
    isActive && 'active',
    isFocused && 'focused',
    isHovered && 'hovered',
    disabled && 'disabled',
    isActive && 'animate-glow-pulse'
  ].filter(Boolean).join(' ');

  // Handle click with disabled state check
  const handleClick = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick();
  };

  // Handle mouse enter for hover state
  const handleMouseEnter = (event) => {
    if (!disabled) {
      setIsHovered(true);
      if (onMouseEnter) {
        onMouseEnter(event);
      }
    }
  };

  // Handle mouse leave for hover state
  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Handle focus with disabled state check
  const handleFocus = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onFocus();
  };

  // Handle keyboard activation (Enter/Space)
  const handleKeyDown = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      className={buttonClasses}
      onClick={handleClick}
      onFocus={handleFocus}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : tabIndex}
      disabled={disabled}
      role="button"
      aria-label={`Switch to ${mode.name} personality mode${isActive ? ' (currently active)' : ''}${isFocused && isKeyboardNavigating ? ' (focused)' : ''}`}
      aria-pressed={isActive}
      aria-disabled={disabled}
      aria-describedby={`mode-${mode.id}-description mode-${mode.id}-position`}
      aria-current={isActive ? 'true' : 'false'}
      title={`${mode.name}${mode.description ? ` - ${mode.description}` : ''}`}
      data-mode={mode.id}
    >
      <span className="mode-button-text">
        {mode.name}
      </span>
      {isActive && (
        <span className="mode-button-indicator" aria-hidden="true">
          ●
        </span>
      )}
      {isFocused && isKeyboardNavigating && (
        <span className="mode-button-focus-indicator" aria-hidden="true">
          ▶
        </span>
      )}
      {mode.description && (
        <span 
          id={`mode-${mode.id}-description`} 
          className="sr-only"
        >
          {mode.description}
        </span>
      )}
      <span 
        id={`mode-${mode.id}-position`} 
        className="sr-only"
      >
        {/* Position information for screen readers */}
      </span>
    </button>
  );
});

// PropTypes for component validation
ModeSelectorWithAPI.propTypes = {
  onModeChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  initialActiveMode: PropTypes.string
};

ModeSelector.propTypes = {
  modes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      popupStyle: PropTypes.oneOf(['overlay', 'speechBubble']),
      sceneProps: PropTypes.shape({
        bgColor: PropTypes.string,
        primaryColor: PropTypes.string
      })
    })
  ),
  activeMode: PropTypes.string,
  onModeChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  className: PropTypes.string,
  themeManager: PropTypes.object
};

ModeButton.propTypes = {
  mode: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    popupStyle: PropTypes.oneOf(['overlay', 'speechBubble']),
    sceneProps: PropTypes.shape({
      bgColor: PropTypes.string,
      primaryColor: PropTypes.string
    })
  }).isRequired,
  isActive: PropTypes.bool.isRequired,
  isFocused: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func,
  tabIndex: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  isKeyboardNavigating: PropTypes.bool
};

// Add display name for debugging
ModeButton.displayName = 'ModeButton';

// Export both components - the API-integrated version as default
export default ModeSelectorWithAPI;
export { ModeSelector };