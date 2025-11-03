# Implementation Plan

- [x] 1. Create MessagePopup component with terminal styling





  - Create components/MessagePopup.jsx with terminal-themed message container
  - Implement black background with matrix green border and phosphor glow effects
  - Add monospace font styling and terminal prompt prefix ("> ")
  - Support both speech bubble and overlay display modes
  - _Requirements: 1.1, 1.3, 1.5_

- [x] 2. Implement character-relative positioning system





  - Create position calculation logic for above, below, left, right placement relative to character
  - Add speech bubble tail rendering that points toward character position
  - Implement viewport boundary checking to keep messages visible on screen
  - Add mode-specific positioning configuration (Corporate AI overlay, Zen Monk left, etc.)
  - _Requirements: 1.2, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Build message scheduling and timing system





  - Create MessageScheduler class for automated message rotation based on mode timing
  - Implement random message selection from mode-specific message arrays
  - Add "test popup now" functionality for immediate message display
  - Create pause/resume controls for message scheduling system
  - _Requirements: 4.1, 4.2, 4.3, 4.5_

- [x] 4. Add terminal-style animations and effects





  - Implement smooth fade in/out animations with terminal materialization effects
  - Create typing effect animation for message text appearance
  - Add glitchy animation variant for Chaos mode messages
  - Ensure 60fps performance and respect reduced motion accessibility preferences
  - _Requirements: 3.1, 3.2, 3.5_

- [x] 5. Create message stacking and state management





  - Implement message queue system that prevents overlapping containers
  - Add automatic cleanup of expired messages after configured lifespan (4-7 seconds)
  - Create mode switching logic that clears previous messages and loads new configuration
  - Prevent memory leaks and handle rapid user interactions gracefully
  - _Requirements: 1.4, 3.4, 4.4, 4.5_

- [x] 6. Add comprehensive accessibility support






  - Implement ARIA labels and screen reader announcements for message content
  - Create high contrast mode styling adjustments for better visibility
  - Add keyboard navigation support and focus management for message interaction
  - Ensure reduced motion preferences disable complex animations while maintaining functionality
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7. Create animations CSS and responsive design





  - Build styles/animations.css with terminal-style message animations
  - Implement responsive positioning that adapts to mobile screen sizes
  - Add mobile-specific positioning logic (convert left/right to above/below on small screens)
  - Test message system across different screen sizes and ensure proper character positioning
  - _Requirements: 3.3, 1.4, 2.5_