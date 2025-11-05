/**
 * Accessibility Manager
 * 
 * Comprehensive accessibility utilities for VibeScreen including
 * screen reader announcements, keyboard navigation, and ARIA management.
 */

class AccessibilityManager {
  constructor() {
    this.liveRegions = new Map();
    this.keyboardNavActive = false;
    this.focusHistory = [];
    this.preferences = {
      highContrast: false,
      reducedMotion: false,
      screenReader: false,
      keyboardOnly: false
    };
    
    this.init();
  }

  /**
   * Initialize accessibility manager
   */
  init() {
    this.detectPreferences();
    this.createLiveRegions();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
    this.setupPreferenceListeners();
    
    // Add skip link if not present
    this.ensureSkipLink();
    
    // Setup keyboard help
    this.setupKeyboardHelp();
  }

  /**
   * Detect user accessibility preferences
   */
  detectPreferences() {
    // High contrast detection
    this.preferences.highContrast = 
      window.matchMedia('(prefers-contrast: high)').matches ||
      window.matchMedia('(forced-colors: active)').matches;

    // Reduced motion detection
    this.preferences.reducedMotion = 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Screen reader detection (heuristic)
    this.preferences.screenReader = 
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.navigator.userAgent.includes('VoiceOver') ||
      window.speechSynthesis?.speaking ||
      document.querySelector('[aria-live]') !== null;

    // Keyboard-only detection
    this.preferences.keyboardOnly = 
      window.matchMedia('(pointer: none)').matches ||
      window.matchMedia('(pointer: coarse)').matches === false;

    // Apply preferences to document
    this.applyPreferences();
  }

  /**
   * Apply accessibility preferences to document
   */
  applyPreferences() {
    const root = document.documentElement;
    
    root.setAttribute('data-high-contrast', this.preferences.highContrast);
    root.setAttribute('data-reduced-motion', this.preferences.reducedMotion);
    root.setAttribute('data-screen-reader', this.preferences.screenReader);
    root.setAttribute('data-keyboard-only', this.preferences.keyboardOnly);

    // Update CSS custom properties
    if (this.preferences.highContrast) {
      root.style.setProperty('--accessibility-mode', 'high-contrast');
    }
    
    if (this.preferences.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms');
      root.style.setProperty('--transition-duration', '0.01ms');
    }
  }

  /**
   * Create ARIA live regions for announcements
   */
  createLiveRegions() {
    // Polite live region for general announcements
    const politeRegion = this.createLiveRegion('polite', 'sr-live-polite');
    this.liveRegions.set('polite', politeRegion);

    // Assertive live region for urgent announcements
    const assertiveRegion = this.createLiveRegion('assertive', 'sr-live-assertive');
    this.liveRegions.set('assertive', assertiveRegion);

    // Status live region for status updates
    const statusRegion = this.createLiveRegion('polite', 'sr-live-status');
    statusRegion.setAttribute('role', 'status');
    this.liveRegions.set('status', statusRegion);
  }

  /**
   * Create a single live region element
   */
  createLiveRegion(politeness, className) {
    const region = document.createElement('div');
    region.setAttribute('aria-live', politeness);
    region.setAttribute('aria-atomic', 'true');
    region.className = `sr-only ${className}`;
    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';
    region.style.clip = 'rect(0, 0, 0, 0)';
    region.style.whiteSpace = 'nowrap';
    region.style.border = '0';
    
    document.body.appendChild(region);
    return region;
  }

  /**
   * Announce message to screen readers
   */
  announce(message, priority = 'polite', delay = 100) {
    if (!message || typeof message !== 'string') return;

    const region = this.liveRegions.get(priority);
    if (!region) return;

    // Clear previous announcement
    region.textContent = '';
    
    // Set new announcement after delay to ensure it's read
    setTimeout(() => {
      region.textContent = message;
      
      // Clear after announcement to prevent repetition
      setTimeout(() => {
        region.textContent = '';
      }, 3000);
    }, delay);
  }

  /**
   * Announce status update
   */
  announceStatus(message, delay = 100) {
    this.announce(message, 'status', delay);
  }

  /**
   * Announce urgent alert
   */
  announceAlert(message, delay = 50) {
    this.announce(message, 'assertive', delay);
  }

  /**
   * Setup keyboard navigation
   */
  setupKeyboardNavigation() {
    let keyboardNavTimer = null;

    document.addEventListener('keydown', (event) => {
      // Detect keyboard navigation
      if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ' || 
          event.key.startsWith('Arrow') || event.key === 'Home' || event.key === 'End') {
        
        if (!this.keyboardNavActive) {
          this.keyboardNavActive = true;
          document.body.classList.add('keyboard-navigation-active');
          this.showKeyboardNavStatus();
        }

        // Reset timer
        clearTimeout(keyboardNavTimer);
        keyboardNavTimer = setTimeout(() => {
          this.keyboardNavActive = false;
          document.body.classList.remove('keyboard-navigation-active');
          this.hideKeyboardNavStatus();
        }, 3000);
      }

      // Global keyboard shortcuts
      this.handleGlobalKeyboardShortcuts(event);
    });

    // Detect mouse usage to disable keyboard nav indicators
    document.addEventListener('mousedown', () => {
      if (this.keyboardNavActive) {
        this.keyboardNavActive = false;
        document.body.classList.remove('keyboard-navigation-active');
        this.hideKeyboardNavStatus();
      }
    });
  }

  /**
   * Handle global keyboard shortcuts
   */
  handleGlobalKeyboardShortcuts(event) {
    // F1 - Show keyboard help
    if (event.key === 'F1') {
      event.preventDefault();
      this.showKeyboardHelp();
      return;
    }

    // Alt + 1 - Skip to main content
    if (event.altKey && event.key === '1') {
      event.preventDefault();
      this.skipToMainContent();
      return;
    }

    // Alt + 2 - Skip to navigation
    if (event.altKey && event.key === '2') {
      event.preventDefault();
      this.skipToNavigation();
      return;
    }

    // Escape - Close modals/overlays
    if (event.key === 'Escape') {
      this.handleEscapeKey();
      return;
    }

    // Ctrl + / - Toggle keyboard help
    if (event.ctrlKey && event.key === '/') {
      event.preventDefault();
      this.toggleKeyboardHelp();
      return;
    }
  }

  /**
   * Setup focus management
   */
  setupFocusManagement() {
    // Track focus history for restoration
    document.addEventListener('focusin', (event) => {
      this.focusHistory.push(event.target);
      
      // Limit history to last 10 elements
      if (this.focusHistory.length > 10) {
        this.focusHistory.shift();
      }
    });

    // Handle focus trapping for modals
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        const focusableElements = this.getFocusableElements();
        const activeModal = document.querySelector('.modal.active, .overlay.active');
        
        if (activeModal) {
          this.trapFocus(event, activeModal);
        }
      }
    });
  }

  /**
   * Get all focusable elements in container
   */
  getFocusableElements(container = document) {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(el => {
        return el.offsetWidth > 0 && el.offsetHeight > 0 && 
               getComputedStyle(el).visibility !== 'hidden';
      });
  }

  /**
   * Trap focus within container
   */
  trapFocus(event, container) {
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Setup preference change listeners
   */
  setupPreferenceListeners() {
    // High contrast changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    contrastQuery.addEventListener('change', () => {
      this.preferences.highContrast = contrastQuery.matches;
      this.applyPreferences();
      this.announce('High contrast mode ' + (contrastQuery.matches ? 'enabled' : 'disabled'));
    });

    // Reduced motion changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', () => {
      this.preferences.reducedMotion = motionQuery.matches;
      this.applyPreferences();
      this.announce('Reduced motion ' + (motionQuery.matches ? 'enabled' : 'disabled'));
    });

    // Forced colors changes
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');
    forcedColorsQuery.addEventListener('change', () => {
      this.preferences.highContrast = forcedColorsQuery.matches;
      this.applyPreferences();
      this.announce('Forced colors mode ' + (forcedColorsQuery.matches ? 'enabled' : 'disabled'));
    });
  }

  /**
   * Ensure skip link exists
   */
  ensureSkipLink() {
    if (document.querySelector('.skip-to-content')) return;

    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.skipToMainContent();
    });

    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  /**
   * Skip to main content
   */
  skipToMainContent() {
    const mainContent = document.querySelector('#main-content, main, [role="main"]') ||
                       document.querySelector('.main-content, .scene-container');
    
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.announce('Skipped to main content');
    }
  }

  /**
   * Skip to navigation
   */
  skipToNavigation() {
    const navigation = document.querySelector('nav, [role="navigation"]') ||
                      document.querySelector('.mode-selector, .navigation');
    
    if (navigation) {
      const firstFocusable = this.getFocusableElements(navigation)[0];
      if (firstFocusable) {
        firstFocusable.focus();
        navigation.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.announce('Skipped to navigation');
      }
    }
  }

  /**
   * Handle escape key
   */
  handleEscapeKey() {
    // Close keyboard help if open
    const keyboardHelp = document.querySelector('.keyboard-help-overlay.visible');
    if (keyboardHelp) {
      this.hideKeyboardHelp();
      return;
    }

    // Close any modals or overlays
    const modal = document.querySelector('.modal.active, .overlay.active');
    if (modal) {
      const closeButton = modal.querySelector('.close, .cancel, [data-close]');
      if (closeButton) {
        closeButton.click();
      } else {
        modal.classList.remove('active', 'visible');
      }
      return;
    }

    // Blur current element if it's focusable
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur();
    }
  }

  /**
   * Setup keyboard help overlay
   */
  setupKeyboardHelp() {
    if (document.querySelector('.keyboard-help-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'keyboard-help-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-labelledby', 'keyboard-help-title');
    overlay.setAttribute('aria-modal', 'true');

    const content = document.createElement('div');
    content.className = 'keyboard-help-content';

    const title = document.createElement('h2');
    title.id = 'keyboard-help-title';
    title.className = 'keyboard-help-title';
    title.textContent = 'Keyboard Shortcuts';

    const shortcuts = document.createElement('div');
    shortcuts.className = 'keyboard-shortcuts';

    const shortcutList = [
      { key: 'F1', description: 'Show/hide this help' },
      { key: 'Tab', description: 'Navigate between elements' },
      { key: 'Shift + Tab', description: 'Navigate backwards' },
      { key: 'Enter / Space', description: 'Activate buttons and links' },
      { key: 'Escape', description: 'Close dialogs and menus' },
      { key: 'Alt + 1', description: 'Skip to main content' },
      { key: 'Alt + 2', description: 'Skip to navigation' },
      { key: 'Arrow Keys', description: 'Navigate within components' },
      { key: 'Home / End', description: 'Go to first/last item' },
      { key: 'Ctrl + /', description: 'Toggle keyboard help' }
    ];

    shortcutList.forEach(shortcut => {
      const item = document.createElement('div');
      item.className = 'shortcut-item';

      const key = document.createElement('kbd');
      key.className = 'shortcut-key';
      key.textContent = shortcut.key;

      const description = document.createElement('span');
      description.className = 'shortcut-description';
      description.textContent = shortcut.description;

      item.appendChild(key);
      item.appendChild(description);
      shortcuts.appendChild(item);
    });

    const closeButton = document.createElement('button');
    closeButton.className = 'keyboard-help-close';
    closeButton.textContent = 'Close (Escape)';
    closeButton.addEventListener('click', () => this.hideKeyboardHelp());

    content.appendChild(title);
    content.appendChild(shortcuts);
    content.appendChild(closeButton);
    overlay.appendChild(content);

    document.body.appendChild(overlay);

    // Handle overlay click to close
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        this.hideKeyboardHelp();
      }
    });
  }

  /**
   * Show keyboard help
   */
  showKeyboardHelp() {
    const overlay = document.querySelector('.keyboard-help-overlay');
    if (!overlay) return;

    overlay.classList.add('visible');
    
    // Focus the close button
    const closeButton = overlay.querySelector('.keyboard-help-close');
    if (closeButton) {
      closeButton.focus();
    }

    this.announce('Keyboard shortcuts help opened');
  }

  /**
   * Hide keyboard help
   */
  hideKeyboardHelp() {
    const overlay = document.querySelector('.keyboard-help-overlay');
    if (!overlay) return;

    overlay.classList.remove('visible');
    
    // Restore focus to previous element
    if (this.focusHistory.length > 1) {
      const previousElement = this.focusHistory[this.focusHistory.length - 2];
      if (previousElement && document.contains(previousElement)) {
        previousElement.focus();
      }
    }

    this.announce('Keyboard shortcuts help closed');
  }

  /**
   * Toggle keyboard help
   */
  toggleKeyboardHelp() {
    const overlay = document.querySelector('.keyboard-help-overlay');
    if (overlay && overlay.classList.contains('visible')) {
      this.hideKeyboardHelp();
    } else {
      this.showKeyboardHelp();
    }
  }

  /**
   * Show keyboard navigation status
   */
  showKeyboardNavStatus() {
    let status = document.querySelector('.keyboard-nav-status');
    
    if (!status) {
      status = document.createElement('div');
      status.className = 'keyboard-nav-status';
      status.textContent = 'Keyboard Navigation Active';
      status.setAttribute('aria-live', 'polite');
      document.body.appendChild(status);
    }

    status.classList.add('active');
  }

  /**
   * Hide keyboard navigation status
   */
  hideKeyboardNavStatus() {
    const status = document.querySelector('.keyboard-nav-status');
    if (status) {
      status.classList.remove('active');
    }
  }

  /**
   * Enhance element with ARIA attributes
   */
  enhanceElement(element, options = {}) {
    if (!element) return;

    const {
      role,
      label,
      describedBy,
      expanded,
      pressed,
      selected,
      disabled,
      required,
      invalid,
      live,
      atomic
    } = options;

    if (role) element.setAttribute('role', role);
    if (label) element.setAttribute('aria-label', label);
    if (describedBy) element.setAttribute('aria-describedby', describedBy);
    if (expanded !== undefined) element.setAttribute('aria-expanded', expanded);
    if (pressed !== undefined) element.setAttribute('aria-pressed', pressed);
    if (selected !== undefined) element.setAttribute('aria-selected', selected);
    if (disabled !== undefined) element.setAttribute('aria-disabled', disabled);
    if (required !== undefined) element.setAttribute('aria-required', required);
    if (invalid !== undefined) element.setAttribute('aria-invalid', invalid);
    if (live) element.setAttribute('aria-live', live);
    if (atomic !== undefined) element.setAttribute('aria-atomic', atomic);
  }

  /**
   * Create accessible button
   */
  createAccessibleButton(text, onClick, options = {}) {
    const button = document.createElement('button');
    button.textContent = text;
    button.addEventListener('click', onClick);

    this.enhanceElement(button, {
      role: 'button',
      label: options.label || text,
      describedBy: options.describedBy,
      pressed: options.pressed,
      disabled: options.disabled,
      ...options
    });

    return button;
  }

  /**
   * Get accessibility preferences
   */
  getPreferences() {
    return { ...this.preferences };
  }

  /**
   * Update accessibility preferences
   */
  updatePreferences(newPreferences) {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.applyPreferences();
  }

  /**
   * Cleanup accessibility manager
   */
  destroy() {
    // Remove live regions
    this.liveRegions.forEach(region => {
      if (region.parentNode) {
        region.parentNode.removeChild(region);
      }
    });
    this.liveRegions.clear();

    // Remove keyboard help overlay
    const keyboardHelp = document.querySelector('.keyboard-help-overlay');
    if (keyboardHelp && keyboardHelp.parentNode) {
      keyboardHelp.parentNode.removeChild(keyboardHelp);
    }

    // Remove keyboard nav status
    const navStatus = document.querySelector('.keyboard-nav-status');
    if (navStatus && navStatus.parentNode) {
      navStatus.parentNode.removeChild(navStatus);
    }

    // Clear focus history
    this.focusHistory = [];
  }
}

// Create global accessibility manager instance
let accessibilityManager = null;

/**
 * Get or create accessibility manager instance
 */
export function getAccessibilityManager() {
  if (!accessibilityManager) {
    accessibilityManager = new AccessibilityManager();
  }
  return accessibilityManager;
}

/**
 * Initialize accessibility manager
 */
export function initializeAccessibility() {
  return getAccessibilityManager();
}

/**
 * Announce message to screen readers
 */
export function announce(message, priority = 'polite', delay = 100) {
  const manager = getAccessibilityManager();
  manager.announce(message, priority, delay);
}

/**
 * Announce status update
 */
export function announceStatus(message, delay = 100) {
  const manager = getAccessibilityManager();
  manager.announceStatus(message, delay);
}

/**
 * Announce urgent alert
 */
export function announceAlert(message, delay = 50) {
  const manager = getAccessibilityManager();
  manager.announceAlert(message, delay);
}

/**
 * Enhance element with accessibility features
 */
export function enhanceAccessibility(element, options = {}) {
  const manager = getAccessibilityManager();
  manager.enhanceElement(element, options);
}

/**
 * Get accessibility preferences
 */
export function getAccessibilityPreferences() {
  const manager = getAccessibilityManager();
  return manager.getPreferences();
}

export default AccessibilityManager;