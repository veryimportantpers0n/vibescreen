import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getAccessibilityManager, announce, announceStatus } from '../utils/accessibilityManager';

/**
 * MessagePopup Component
 * 
 * Terminal-styled message container that displays AI personality messages
 * with support for both speech bubble and overlay display modes.
 * Features terminal aesthetics with matrix green styling and phosphor glow effects.
 */
const MessagePopup = React.forwardRef(({
  message,
  position = 'overlay',
  characterPosition = { x: 0, y: 0 },
  mode = 'default',
  onComplete,
  style = 'overlay',
  animationType = 'normal',
  isVisible = true,
  duration = 5000,
  className = '',
  ariaLabel,
  testId,
  enhancedPosition,
  stackPosition = 0,
  stackOffset = { x: 0, y: 0 }
}, ref) => {
  const [isAnimatingIn, setIsAnimatingIn] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isKeyboardDismissible, setIsKeyboardDismissible] = useState(false);
  const messageRef = useRef(null);
  const timeoutRef = useRef(null);
  const announcementRef = useRef(null);

  // Accessibility: Check for reduced motion preference
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Accessibility: Check for high contrast preference
  const prefersHighContrast = useCallback(() => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }, []);

  // Enhanced accessibility: Announce message to screen readers using accessibility manager
  const announceToScreenReader = useCallback((text, priority = 'polite') => {
    if (!text) return;
    
    // Use accessibility manager for consistent announcements
    if (priority === 'assertive') {
      announce(text, 'assertive');
    } else {
      announce(text, 'polite');
    }
    
    // Fallback to local announcement element for compatibility
    if (!announcementRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', priority);
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
      announcementRef.current = announcer;
    }

    // Clear previous announcement and set new one
    announcementRef.current.textContent = '';
    setTimeout(() => {
      if (announcementRef.current) {
        announcementRef.current.textContent = text;
      }
    }, 100);
  }, []);

  // Accessibility: Handle keyboard navigation
  const handleKeyDown = useCallback((event) => {
    if (!isFullyVisible || !isKeyboardDismissible) return;

    switch (event.key) {
      case 'Escape':
      case 'Enter':
      case ' ':
        event.preventDefault();
        event.stopPropagation();
        announceToScreenReader(`Message dismissed: ${message}`);
        if (onComplete) {
          setIsFullyVisible(false);
          setIsAnimatingOut(true);
          setTimeout(() => {
            setIsAnimatingOut(false);
            onComplete();
          }, prefersReducedMotion() ? 50 : 300);
        }
        break;
      case 'Tab':
        // Allow tab navigation but announce current message
        announceToScreenReader(`Current message: ${message}. Press Escape or Enter to dismiss.`);
        break;
      default:
        break;
    }
  }, [isFullyVisible, isKeyboardDismissible, message, onComplete, announceToScreenReader, prefersReducedMotion]);

  // Accessibility: Focus management
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setIsKeyboardDismissible(true);
    announceToScreenReader(`Message focused: ${message}. Press Escape or Enter to dismiss.`);
  }, [message, announceToScreenReader]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Keep keyboard dismissible for a short time after blur
    setTimeout(() => setIsKeyboardDismissible(false), 1000);
  }, []);

  // Mode-specific positioning configuration
  const getModePositioning = (mode) => {
    const modePositioning = {
      'corporate-ai': { style: 'overlay', position: 'overlay' },
      'zen-monk': { style: 'speechBubble', position: 'left' },
      'chaos': { style: 'overlay', position: 'overlay', animation: 'glitchy' },
      'emotional-damage': { style: 'speechBubble', position: 'above' },
      'therapist': { style: 'speechBubble', position: 'right' },
      'startup-founder': { style: 'overlay', position: 'overlay' },
      'doomsday-prophet': { style: 'overlay', position: 'overlay' },
      'gamer-rage': { style: 'overlay', position: 'overlay' },
      'influencer': { style: 'overlay', position: 'overlay' },
      'wholesome-grandma': { style: 'speechBubble', position: 'below' },
      'spooky': { style: 'overlay', position: 'overlay', animation: 'fade-slow' }
    };
    
    return modePositioning[mode] || { style: 'overlay', position: 'overlay' };
  };

  // Enhanced responsive position calculation
  const calculatePosition = () => {
    const modeConfig = getModePositioning(mode);
    const effectiveStyle = style || modeConfig.style;
    const effectivePosition = position || modeConfig.position;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth <= 768;
    const isSmallMobile = viewportWidth <= 480;

    if (effectiveStyle === 'overlay') {
      // Enhanced overlay positioning with responsive adjustments
      const topOffset = isMobile ? '45%' : '50%';
      return {
        position: 'fixed',
        top: topOffset,
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 'var(--z-modal)',
        // Ensure proper spacing from edges on mobile
        maxWidth: isMobile ? 'calc(100vw - 20px)' : 'none',
        margin: isMobile ? '0 10px' : '0'
      };
    }

    // Enhanced speech bubble positioning with mobile adaptations
    let baseOffsets;
    
    if (isMobile) {
      // On mobile, convert side positions to top/bottom for better UX
      baseOffsets = {
        above: { x: 0, y: -100 },
        below: { x: 0, y: 100 },
        left: { x: 0, y: -100 }, // Convert to above on mobile
        right: { x: 0, y: 100 }  // Convert to below on mobile
      };
    } else {
      // Desktop/tablet positioning
      const offsetScale = viewportWidth > 1440 ? 1.2 : viewportWidth > 1024 ? 1.1 : 1.0;
      baseOffsets = {
        above: { x: 0, y: -120 * offsetScale },
        below: { x: 0, y: 120 * offsetScale },
        left: { x: -200 * offsetScale, y: -60 * offsetScale },
        right: { x: 200 * offsetScale, y: -60 * offsetScale }
      };
    }

    const offset = baseOffsets[effectivePosition] || baseOffsets.above;
    
    // Responsive message dimensions
    const messageWidth = isSmallMobile ? 240 : isMobile ? 300 : viewportWidth > 1024 ? 400 : 350;
    const messageHeight = isSmallMobile ? 80 : isMobile ? 100 : 120;
    
    let x = characterPosition.x + offset.x;
    let y = characterPosition.y + offset.y;
    
    // On mobile, center horizontally for converted positions
    if (isMobile && (effectivePosition === 'left' || effectivePosition === 'right')) {
      x = viewportWidth / 2 - messageWidth / 2;
    }
    
    // Advanced boundary checking with responsive fallback positioning
    const safePosition = calculateSafePosition(
      { x, y }, 
      characterPosition, 
      { width: viewportWidth, height: viewportHeight },
      { width: messageWidth, height: messageHeight },
      effectivePosition,
      isMobile
    );

    return {
      position: 'fixed',
      left: `${safePosition.x}px`,
      top: `${safePosition.y}px`,
      zIndex: 'var(--z-ui)',
      // Enhanced responsive constraints
      maxWidth: isMobile ? 'calc(100vw - 20px)' : 'none',
      margin: isMobile ? '0 10px' : '0'
    };
  };

  // Enhanced position calculation with responsive viewport boundary checking
  const calculateSafePosition = (basePosition, characterPos, viewport, messageSize, preferredPosition, isMobile = false) => {
    let { x, y } = basePosition;
    const { width: vw, height: vh } = viewport;
    const { width: mw, height: mh } = messageSize;
    
    // Responsive safety margins
    const margin = isMobile ? 10 : 20;
    const topMargin = Math.max(margin, window.env?.safeAreaInsetTop || 0);
    const bottomMargin = Math.max(margin, window.env?.safeAreaInsetBottom || 0);
    
    // Account for UI elements with responsive heights
    const modeSelectorHeight = isMobile ? 80 : 120;
    const headerHeight = isMobile ? 60 : 80;
    
    // Enhanced boundary checking with responsive considerations
    const isWithinBounds = (testX, testY) => {
      return testX >= margin && 
             testX + mw <= vw - margin && 
             testY >= topMargin + headerHeight && 
             testY + mh <= vh - bottomMargin - modeSelectorHeight;
    };
    
    // If current position is safe, use it
    if (isWithinBounds(x, y)) {
      return { x, y };
    }
    
    // Enhanced alternative positions with responsive scaling
    const offsetScale = isMobile ? 0.8 : vw > 1440 ? 1.2 : 1.0;
    const alternativePositions = {
      above: { 
        x: isMobile ? vw / 2 - mw / 2 : characterPos.x - mw / 2, 
        y: characterPos.y - (120 * offsetScale) 
      },
      below: { 
        x: isMobile ? vw / 2 - mw / 2 : characterPos.x - mw / 2, 
        y: characterPos.y + (120 * offsetScale) 
      },
      left: { 
        x: characterPos.x - (200 * offsetScale), 
        y: characterPos.y - (60 * offsetScale) 
      },
      right: { 
        x: characterPos.x + (200 * offsetScale), 
        y: characterPos.y - (60 * offsetScale) 
      }
    };
    
    // Responsive position priority order
    const positionOrder = isMobile 
      ? [preferredPosition, 'above', 'below', 'right', 'left']
      : [preferredPosition, 'above', 'right', 'below', 'left'];
    
    // Try each alternative position
    for (const pos of positionOrder) {
      if (alternativePositions[pos]) {
        const altPos = alternativePositions[pos];
        if (isWithinBounds(altPos.x, altPos.y)) {
          return altPos;
        }
      }
    }
    
    // Enhanced fallback positioning with responsive constraints
    const safeX = Math.max(margin, Math.min(x, vw - mw - margin));
    const safeY = Math.max(
      topMargin + headerHeight, 
      Math.min(y, vh - mh - bottomMargin - modeSelectorHeight)
    );
    
    // Final mobile-specific adjustments
    if (isMobile) {
      // Ensure message doesn't overlap with virtual keyboard area
      const keyboardHeight = vh > 500 ? 0 : 200; // Estimate keyboard height on small screens
      const adjustedY = Math.min(safeY, vh - mh - bottomMargin - modeSelectorHeight - keyboardHeight);
      
      return { 
        x: Math.max(margin, Math.min(safeX, vw - mw - margin)), 
        y: Math.max(topMargin + headerHeight, adjustedY) 
      };
    }
    
    return { x: safeX, y: safeY };
  };

  // Calculate tail position to point toward character
  const calculateTailPosition = () => {
    const modeConfig = getModePositioning(mode);
    const effectivePosition = position || modeConfig.position;
    
    // Base tail styles are handled by CSS classes
    // This function can add dynamic positioning if needed
    const tailStyles = {};
    
    // For responsive design, adjust tail size on mobile
    if (window.innerWidth <= 768) {
      const mobilePositions = ['left', 'right'];
      if (mobilePositions.includes(effectivePosition)) {
        // Convert left/right to above/below on mobile for better UX
        tailStyles.display = 'none';
      }
    }
    
    return tailStyles;
  };

  // Handle component lifecycle and animations with enhanced terminal effects
  useEffect(() => {
    if (isVisible) {
      // Accessibility: Announce message appearance
      const modeConfig = getModePositioning(mode);
      const modeDisplayName = mode.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      announceToScreenReader(`New message from ${modeDisplayName}: ${message}`);

      // Start entrance animation
      setIsAnimatingIn(true);
      setIsAnimatingOut(false);
      
      // Determine animation duration based on type and accessibility preferences
      const effectiveAnimation = animationType || modeConfig.animation || 'normal';
      const baseAnimationDuration = effectiveAnimation === 'typing' ? 600 : 
                                   effectiveAnimation === 'glitchy' ? 600 : 300;
      
      // Respect reduced motion preferences
      const animationDuration = prefersReducedMotion() ? 50 : baseAnimationDuration;
      
      // Set fully visible after entrance animation
      const enterTimeout = setTimeout(() => {
        setIsAnimatingIn(false);
        setIsFullyVisible(true);
        
        // Accessibility: Enable keyboard interaction after animation completes
        setIsKeyboardDismissible(true);
      }, animationDuration);

      // Schedule exit animation
      if (duration > 0) {
        timeoutRef.current = setTimeout(() => {
          // Accessibility: Announce message expiration
          announceToScreenReader(`Message from ${modeDisplayName} expired`);
          
          setIsFullyVisible(false);
          setIsAnimatingOut(true);
          setIsKeyboardDismissible(false);
          
          // Complete exit after animation
          const exitDuration = prefersReducedMotion() ? 50 : 300;
          setTimeout(() => {
            setIsAnimatingOut(false);
            if (onComplete) {
              onComplete();
            }
          }, exitDuration);
        }, duration);
      }

      return () => {
        clearTimeout(enterTimeout);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      // Handle immediate hide with terminal dematerialization
      setIsFullyVisible(false);
      setIsAnimatingIn(false);
      setIsAnimatingOut(true);
      setIsKeyboardDismissible(false);
      
      const exitDuration = prefersReducedMotion() ? 50 : 300;
      setTimeout(() => {
        setIsAnimatingOut(false);
        if (onComplete) {
          onComplete();
        }
      }, exitDuration);
    }
  }, [isVisible, duration, onComplete, mode, animationType, message, announceToScreenReader, prefersReducedMotion]);

  // Accessibility: Keyboard event listener
  useEffect(() => {
    if (isFullyVisible && messageRef.current) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isFullyVisible, handleKeyDown]);

  // Accessibility: Cleanup announcement element on unmount
  useEffect(() => {
    return () => {
      if (announcementRef.current && announcementRef.current.parentNode) {
        announcementRef.current.parentNode.removeChild(announcementRef.current);
      }
    };
  }, []);

  // Don't render if not visible and not animating
  if (!isVisible && !isAnimatingIn && !isAnimatingOut) {
    return null;
  }

  // Build CSS classes based on component state and props
  const modeConfig = getModePositioning(mode);
  const effectiveStyle = style || modeConfig.style;
  const effectivePosition = position || modeConfig.position;
  const effectiveAnimation = animationType || modeConfig.animation || 'normal';
  
  const messageClasses = [
    'message-popup',
    `message-popup-${effectiveStyle}`,
    `message-popup-position-${effectivePosition}`,
    `message-popup-animation-${effectiveAnimation}`,
    `message-popup-mode-${mode}`,
    // Animation states
    isAnimatingIn && 'message-popup-entering',
    isAnimatingOut && 'message-popup-exiting',
    isFullyVisible && 'message-popup-visible',
    // Terminal-specific effects
    'message-popup-scan-lines',
    'message-popup-phosphor-persistence',
    // Enhanced terminal materialization effects
    isAnimatingIn && effectiveAnimation === 'normal' && 'message-popup-terminal-materialize',
    isAnimatingOut && 'message-popup-terminal-dematerialize',
    className
  ].filter(Boolean).join(' ');

  // Get positioning styles (use enhanced position if provided)
  const positionStyles = enhancedPosition || calculatePosition();

  // Handle click to dismiss (optional) with accessibility support
  const handleClick = useCallback(() => {
    if (onComplete && isFullyVisible) {
      announceToScreenReader(`Message dismissed: ${message}`);
      setIsFullyVisible(false);
      setIsAnimatingOut(true);
      setIsKeyboardDismissible(false);
      
      const exitDuration = prefersReducedMotion() ? 50 : 300;
      setTimeout(() => {
        setIsAnimatingOut(false);
        onComplete();
      }, exitDuration);
    }
  }, [onComplete, isFullyVisible, message, announceToScreenReader, prefersReducedMotion]);

  // Generate comprehensive accessibility attributes
  const modeDisplayName = mode.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const accessibilityLabel = ariaLabel || `Message from ${modeDisplayName}: ${message}`;
  const accessibilityDescription = `${effectiveStyle === 'overlay' ? 'Overlay' : 'Speech bubble'} message. ${isKeyboardDismissible ? 'Press Escape or Enter to dismiss.' : 'Will auto-dismiss in a few seconds.'}`;

  return (
    <div
      ref={(el) => {
        messageRef.current = el;
        if (ref) {
          if (typeof ref === 'function') {
            ref(el);
          } else {
            ref.current = el;
          }
        }
      }}
      className={messageClasses}
      style={positionStyles}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      // Enhanced accessibility attributes
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      aria-label={accessibilityLabel}
      aria-describedby={`message-description-${stackPosition}`}
      aria-expanded={isFullyVisible}
      aria-hidden={!isFullyVisible}
      // Keyboard accessibility
      tabIndex={isFullyVisible ? 0 : -1}
      // High contrast and reduced motion support
      data-high-contrast={prefersHighContrast()}
      data-reduced-motion={prefersReducedMotion()}
      // Testing and debugging
      data-testid={testId}
      data-message-style={effectiveStyle}
      data-message-position={effectivePosition}
      data-message-mode={mode}
      data-stack-position={stackPosition}
      data-keyboard-dismissible={isKeyboardDismissible}
      data-focused={isFocused}
    >
      {/* Terminal prompt prefix */}
      <span 
        className="message-popup-prompt" 
        aria-hidden="true"
        data-reduced-motion={prefersReducedMotion()}
      >
        &gt;
      </span>
      
      {/* Message content with enhanced accessibility */}
      <span 
        className="message-popup-content"
        data-text={message}
        role="text"
        aria-label={`Message content: ${message}`}
      >
        {message}
      </span>
      
      {/* Speech bubble tail (only for speech bubble style) */}
      {(style === 'speechBubble' || getModePositioning(mode).style === 'speechBubble') && (
        <div 
          className={`message-popup-tail message-popup-tail-${position || getModePositioning(mode).position}`}
          aria-hidden="true"
          style={calculateTailPosition()}
          role="presentation"
        />
      )}
      
      {/* Accessibility: Hidden description for screen readers */}
      <div 
        id={`message-description-${stackPosition}`}
        className="sr-only"
        aria-hidden="false"
      >
        {accessibilityDescription}
      </div>
      
      {/* Accessibility: Keyboard instructions (only when focused) */}
      {isFocused && (
        <div className="sr-only" aria-live="polite">
          Message focused. Press Escape, Enter, or Space to dismiss. Press Tab to navigate.
        </div>
      )}
      
      {/* Accessibility: High contrast indicator */}
      {prefersHighContrast() && (
        <div className="sr-only">
          High contrast mode active. Message styling adjusted for better visibility.
        </div>
      )}
      
      {/* Accessibility: Reduced motion indicator */}
      {prefersReducedMotion() && (
        <div className="sr-only">
          Reduced motion mode active. Animations are minimized.
        </div>
      )}
    </div>
  );
});

/**
 * MessagePopupContainer Component
 * 
 * Enhanced container component that manages multiple message popups with proper stacking,
 * prevents overlapping, and handles automatic cleanup with memory leak prevention.
 */
export const MessagePopupContainer = ({
  messages = [],
  characterPosition = { x: window.innerWidth - 120, y: window.innerHeight - 120 },
  onMessageComplete,
  maxMessages = 3,
  className = ''
}) => {
  const [activeMessages, setActiveMessages] = useState([]);
  const [focusedMessageId, setFocusedMessageId] = useState(null);
  const containerRef = useRef(null);
  const messageRefs = useRef(new Map());
  const regionAnnouncerRef = useRef(null);

  // Enhanced message processing with stacking support and accessibility
  useEffect(() => {
    // Process messages with enhanced stacking information
    const processedMessages = messages.slice(0, maxMessages).map((msg, index) => {
      const messageId = msg.id || `msg-${Date.now()}-${index}`;
      const stackPosition = msg.stackPosition || index;
      const stackOffset = msg.stackOffset || { x: 0, y: 0 };
      
      return {
        ...msg,
        id: messageId,
        key: msg.key || messageId,
        stackPosition,
        stackOffset,
        // Calculate enhanced positioning to prevent overlaps
        enhancedPosition: calculateEnhancedPosition(msg, stackPosition, stackOffset, characterPosition)
      };
    });
    
    setActiveMessages(processedMessages);
    
    // Announce container state change
    if (processedMessages.length !== activeMessages.length) {
      announceContainerState(processedMessages.length, 'updated');
    }
  }, [messages, maxMessages, characterPosition, activeMessages.length, announceContainerState]);

  // Calculate enhanced positioning with stacking offsets
  const calculateEnhancedPosition = (message, stackPosition, stackOffset, charPos) => {
    const basePosition = message.position || 'overlay';
    
    if (message.style === 'overlay' || basePosition === 'overlay') {
      // For overlay messages, stack vertically in center
      return {
        position: 'fixed',
        top: `calc(50% + ${stackOffset.y}px)`,
        left: `calc(50% + ${stackOffset.x}px)`,
        transform: 'translate(-50%, -50%)',
        zIndex: `calc(var(--z-modal) + ${stackPosition})`
      };
    }
    
    // For speech bubble messages, apply stacking offset to character-relative positioning
    const baseOffsets = {
      above: { x: 0, y: -120 },
      below: { x: 0, y: 120 },
      left: { x: -200, y: -60 },
      right: { x: 200, y: -60 }
    };
    
    const baseOffset = baseOffsets[basePosition] || baseOffsets.above;
    
    return {
      position: 'fixed',
      left: `${charPos.x + baseOffset.x + stackOffset.x}px`,
      top: `${charPos.y + baseOffset.y + stackOffset.y}px`,
      zIndex: `calc(var(--z-ui) + ${stackPosition})`
    };
  };

  // Accessibility: Announce container state changes
  const announceContainerState = useCallback((messageCount, action = 'updated') => {
    if (!regionAnnouncerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'false');
      announcer.className = 'sr-only';
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      document.body.appendChild(announcer);
      regionAnnouncerRef.current = announcer;
    }

    const announcement = messageCount === 0 
      ? 'All messages cleared'
      : messageCount === 1 
        ? '1 message active'
        : `${messageCount} messages active`;
    
    regionAnnouncerRef.current.textContent = announcement;
  }, []);

  // Enhanced message completion handler with cleanup and accessibility
  const handleMessageComplete = useCallback((messageId) => {
    setActiveMessages(prev => {
      const filtered = prev.filter(msg => msg.id !== messageId);
      
      // Clean up message ref
      messageRefs.current.delete(messageId);
      
      // Update focused message if the completed message was focused
      if (focusedMessageId === messageId) {
        setFocusedMessageId(null);
      }
      
      // Announce state change
      announceContainerState(filtered.length, 'removed');
      
      return filtered;
    });
    
    if (onMessageComplete) {
      onMessageComplete(messageId);
    }
  }, [onMessageComplete, focusedMessageId, announceContainerState]);

  // Handle container resize for responsive stacking
  useEffect(() => {
    const handleResize = () => {
      // Recalculate positions on resize to maintain proper stacking
      setActiveMessages(prev => prev.map(msg => ({
        ...msg,
        enhancedPosition: calculateEnhancedPosition(
          msg, 
          msg.stackPosition, 
          msg.stackOffset, 
          characterPosition
        )
      })));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [characterPosition]);

  // Accessibility: Container keyboard navigation
  const handleContainerKeyDown = useCallback((event) => {
    const messageElements = Array.from(messageRefs.current.values()).filter(el => el && el.tabIndex >= 0);
    
    if (messageElements.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        const currentIndex = messageElements.findIndex(el => el === document.activeElement);
        const nextIndex = (currentIndex + 1) % messageElements.length;
        messageElements[nextIndex]?.focus();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        const currentIdx = messageElements.findIndex(el => el === document.activeElement);
        const prevIndex = currentIdx <= 0 ? messageElements.length - 1 : currentIdx - 1;
        messageElements[prevIndex]?.focus();
        break;
      case 'Home':
        event.preventDefault();
        messageElements[0]?.focus();
        break;
      case 'End':
        event.preventDefault();
        messageElements[messageElements.length - 1]?.focus();
        break;
      default:
        break;
    }
  }, []);

  // Accessibility: Container keyboard event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container && activeMessages.length > 0) {
      container.addEventListener('keydown', handleContainerKeyDown);
      return () => {
        container.removeEventListener('keydown', handleContainerKeyDown);
      };
    }
  }, [activeMessages.length, handleContainerKeyDown]);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      messageRefs.current.clear();
      if (regionAnnouncerRef.current && regionAnnouncerRef.current.parentNode) {
        regionAnnouncerRef.current.parentNode.removeChild(regionAnnouncerRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`message-popup-container ${className}`}
      role="region"
      aria-label={`AI personality messages region. ${activeMessages.length} of ${maxMessages} messages active.`}
      aria-live="polite"
      aria-atomic="false"
      aria-describedby="message-container-instructions"
      tabIndex={activeMessages.length > 0 ? 0 : -1}
      data-active-messages={activeMessages.length}
      data-max-messages={maxMessages}
    >
      {/* Accessibility: Container instructions */}
      <div 
        id="message-container-instructions" 
        className="sr-only"
      >
        Message container. Use arrow keys to navigate between messages. Press Escape or Enter on a message to dismiss it.
      </div>
      {activeMessages.map((message, index) => {
        const messageRef = (el) => {
          if (el) {
            messageRefs.current.set(message.id, el);
          } else {
            messageRefs.current.delete(message.id);
          }
        };

        return (
          <MessagePopup
            ref={messageRef}
            key={message.key}
            message={message.text || message.message}
            position={message.position || 'overlay'}
            characterPosition={characterPosition}
            mode={message.mode || 'default'}
            style={message.style || 'overlay'}
            animationType={message.animationType || 'normal'}
            duration={message.duration || 5000}
            isVisible={message.isVisible !== false}
            onComplete={() => handleMessageComplete(message.id)}
            ariaLabel={message.ariaLabel}
            testId={message.testId}
            className={`message-popup-stacked message-popup-stack-${message.stackPosition || index}`}
            // Pass enhanced positioning
            enhancedPosition={message.enhancedPosition}
            stackPosition={message.stackPosition}
            stackOffset={message.stackOffset}
          />
        );
      })}
      
      {/* Debug info for development */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="message-container-debug"
          style={{
            position: 'fixed',
            bottom: '10px',
            left: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'var(--matrix-green)',
            padding: '4px 8px',
            borderRadius: '2px',
            fontSize: '10px',
            fontFamily: 'var(--font-terminal)',
            zIndex: 'var(--z-debug)'
          }}
        >
          Messages: {activeMessages.length}/{maxMessages}
        </div>
      )}
    </div>
  );
};

// PropTypes for component validation
MessagePopup.propTypes = {
  message: PropTypes.string.isRequired,
  position: PropTypes.oneOf(['above', 'below', 'left', 'right', 'overlay']),
  characterPosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  mode: PropTypes.string,
  onComplete: PropTypes.func,
  style: PropTypes.oneOf(['speechBubble', 'overlay']),
  animationType: PropTypes.oneOf(['normal', 'glitchy', 'typing']),
  isVisible: PropTypes.bool,
  duration: PropTypes.number,
  className: PropTypes.string,
  ariaLabel: PropTypes.string,
  testId: PropTypes.string,
  enhancedPosition: PropTypes.object,
  stackPosition: PropTypes.number,
  stackOffset: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  })
};

MessagePopupContainer.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      key: PropTypes.string,
      text: PropTypes.string,
      message: PropTypes.string,
      position: PropTypes.oneOf(['above', 'below', 'left', 'right', 'overlay']),
      mode: PropTypes.string,
      style: PropTypes.oneOf(['speechBubble', 'overlay']),
      animationType: PropTypes.oneOf(['normal', 'glitchy', 'typing']),
      duration: PropTypes.number,
      isVisible: PropTypes.bool,
      ariaLabel: PropTypes.string,
      testId: PropTypes.string
    })
  ),
  characterPosition: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }),
  onMessageComplete: PropTypes.func,
  maxMessages: PropTypes.number,
  className: PropTypes.string
};

// Default export
export default MessagePopup;