/**
 * ThemeManager - Dynamic theming system for VibeScreen
 * Handles mode-specific color schemes, smooth transitions, and CSS custom property updates
 */

class ThemeManager {
  constructor(options = {}) {
    this.onThemeChange = options.onThemeChange || (() => {});
    this.onTransitionStart = options.onTransitionStart || (() => {});
    this.onTransitionEnd = options.onTransitionEnd || (() => {});
    
    // Current state
    this.currentTheme = options.initialTheme || 'corporate-ai';
    this.isTransitioning = false;
    this.transitionDuration = options.transitionDuration || 600;
    this.transitionEasing = options.transitionEasing || 'cubic-bezier(0.4, 0, 0.2, 1)';
    
    // Theme history for debugging
    this.themeHistory = [];
    
    // Initialize theme configurations
    this.initializeThemeConfigurations();
    
    // Bind methods
    this.applyTheme = this.applyTheme.bind(this);
    this.switchTheme = this.switchTheme.bind(this);
    this.getThemeConfig = this.getThemeConfig.bind(this);
    this.validateTheme = this.validateTheme.bind(this);
  }

  /**
   * Initialize theme configurations for all 11 personality modes
   */
  initializeThemeConfigurations() {
    this.themeConfigurations = {
      'corporate-ai': {
        name: 'Corporate AI',
        primary: '#007acc',
        primaryLight: '#4da6d9',
        primaryDark: '#005a99',
        secondary: '#0099ff',
        accent: '#66b3ff',
        contrast: '#ffffff',
        background: {
          primary: '#f7f7f7',
          secondary: 'rgba(0, 122, 204, 0.1)',
          overlay: 'rgba(0, 122, 204, 0.05)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(0, 122, 204, 0.5)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.7
        }
      },

      'zen-monk': {
        name: 'Zen Monk',
        primary: '#27ae60',
        primaryLight: '#58d68d',
        primaryDark: '#1e8449',
        secondary: '#2ecc71',
        accent: '#85e085',
        contrast: '#ffffff',
        background: {
          primary: '#2a4d3a',
          secondary: 'rgba(39, 174, 96, 0.1)',
          overlay: 'rgba(39, 174, 96, 0.05)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(39, 174, 96, 0.5)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.5
        }
      },

      'chaos': {
        name: 'Chaos',
        primary: '#8e44ad',
        primaryLight: '#bb8fce',
        primaryDark: '#6c3483',
        secondary: '#9b59b6',
        accent: '#d7bde2',
        contrast: '#ffffff',
        background: {
          primary: '#4a0e4e',
          secondary: 'rgba(142, 68, 173, 0.15)',
          overlay: 'rgba(142, 68, 173, 0.08)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(142, 68, 173, 0.6)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.9,
          glitch: true
        }
      },

      'emotional-damage': {
        name: 'Emotional Damage',
        primary: '#e74c3c',
        primaryLight: '#f1948a',
        primaryDark: '#c0392b',
        secondary: '#ec7063',
        accent: '#fadbd8',
        contrast: '#ffffff',
        background: {
          primary: '#2c1810',
          secondary: 'rgba(231, 76, 60, 0.1)',
          overlay: 'rgba(231, 76, 60, 0.05)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(231, 76, 60, 0.5)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.8,
          flicker: true
        }
      },

      'therapist': {
        name: 'Therapist',
        primary: '#16a085',
        primaryLight: '#5dade2',
        primaryDark: '#138d75',
        secondary: '#48c9b0',
        accent: '#a3e4d7',
        contrast: '#ffffff',
        background: {
          primary: '#1a3332',
          secondary: 'rgba(22, 160, 133, 0.1)',
          overlay: 'rgba(22, 160, 133, 0.05)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(22, 160, 133, 0.5)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.6
        }
      },

      'startup-founder': {
        name: 'Startup Founder',
        primary: '#f39c12',
        primaryLight: '#f8c471',
        primaryDark: '#d68910',
        secondary: '#f5b041',
        accent: '#fdeaa7',
        contrast: '#ffffff',
        background: {
          primary: '#3e2723',
          secondary: 'rgba(243, 156, 18, 0.1)',
          overlay: 'rgba(243, 156, 18, 0.05)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(243, 156, 18, 0.5)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.8,
          energy: true
        }
      },

      'doomsday-prophet': {
        name: 'Doomsday Prophet',
        primary: '#663399',
        primaryLight: '#9966cc',
        primaryDark: '#4d1a66',
        secondary: '#7d4cdb',
        accent: '#e8d5f2',
        contrast: '#ffffff',
        background: {
          primary: '#1a0d1a',
          secondary: 'rgba(102, 51, 153, 0.15)',
          overlay: 'rgba(102, 51, 153, 0.08)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(102, 51, 153, 0.6)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.9,
          ominous: true
        }
      },

      'gamer-rage': {
        name: 'Gamer Rage',
        primary: '#e67e22',
        primaryLight: '#f0b27a',
        primaryDark: '#ca6f1e',
        secondary: '#f39c12',
        accent: '#fbeee6',
        contrast: '#ffffff',
        background: {
          primary: '#3e2723',
          secondary: 'rgba(230, 126, 34, 0.15)',
          overlay: 'rgba(230, 126, 34, 0.08)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(230, 126, 34, 0.6)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 1.0,
          rage: true
        }
      },

      'influencer': {
        name: 'Influencer',
        primary: '#e91e63',
        primaryLight: '#f48fb1',
        primaryDark: '#ad1457',
        secondary: '#f06292',
        accent: '#fce4ec',
        contrast: '#ffffff',
        background: {
          primary: '#2d1b2e',
          secondary: 'rgba(233, 30, 99, 0.1)',
          overlay: 'rgba(233, 30, 99, 0.05)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(233, 30, 99, 0.5)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.8,
          sparkle: true
        }
      },

      'wholesome-grandma': {
        name: 'Wholesome Grandma',
        primary: '#8d6e63',
        primaryLight: '#bcaaa4',
        primaryDark: '#5d4037',
        secondary: '#a1887f',
        accent: '#efebe9',
        contrast: '#ffffff',
        background: {
          primary: '#3e2723',
          secondary: 'rgba(141, 110, 99, 0.1)',
          overlay: 'rgba(141, 110, 99, 0.05)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(141, 110, 99, 0.5)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.4,
          warm: true
        }
      },

      'spooky': {
        name: 'Spooky',
        primary: '#ff6600',
        primaryLight: '#ff9933',
        primaryDark: '#cc4400',
        secondary: '#ff8533',
        accent: '#fff3e0',
        contrast: '#ffffff',
        background: {
          primary: '#1a0d00',
          secondary: 'rgba(255, 102, 0, 0.15)',
          overlay: 'rgba(255, 102, 0, 0.08)'
        },
        text: {
          primary: '#2c3e50',
          secondary: '#7f8c8d',
          inverse: '#ffffff'
        },
        glow: 'rgba(255, 102, 0, 0.6)',
        effects: {
          scanLines: true,
          phosphorGlow: true,
          crtEffect: true,
          intensity: 0.9,
          spooky: true
        }
      }
    };
  }

  /**
   * Get theme configuration for a specific mode
   */
  getThemeConfig(themeId) {
    return this.themeConfigurations[themeId] || this.themeConfigurations['corporate-ai'];
  }

  /**
   * Apply theme to the document root
   */
  applyTheme(themeId, options = {}) {
    const theme = this.getThemeConfig(themeId);
    const root = document.documentElement;
    const immediate = options.immediate || false;

    // Set transition duration if not immediate
    if (!immediate) {
      root.style.setProperty('--theme-transition-duration', `${this.transitionDuration}ms`);
      root.style.setProperty('--theme-transition-easing', this.transitionEasing);
    }

    // Apply primary colors
    root.style.setProperty('--active-mode-color', theme.primary);
    root.style.setProperty('--active-mode-color-light', theme.primaryLight);
    root.style.setProperty('--active-mode-color-dark', theme.primaryDark);
    root.style.setProperty('--active-mode-secondary', theme.secondary);
    root.style.setProperty('--active-mode-accent', theme.accent);
    root.style.setProperty('--active-mode-contrast', theme.contrast);

    // Apply background colors
    root.style.setProperty('--active-mode-bg-primary', theme.background.primary);
    root.style.setProperty('--active-mode-bg-secondary', theme.background.secondary);
    root.style.setProperty('--active-mode-bg-overlay', theme.background.overlay);

    // Apply text colors
    root.style.setProperty('--active-mode-text-primary', theme.text.primary);
    root.style.setProperty('--active-mode-text-secondary', theme.text.secondary);
    root.style.setProperty('--active-mode-text-inverse', theme.text.inverse);

    // Apply glow effect
    root.style.setProperty('--active-mode-glow', theme.glow);
    root.style.setProperty('--phosphor-glow', theme.glow);

    // Apply effect intensity
    root.style.setProperty('--effect-intensity', theme.effects.intensity);

    // Apply mode-specific data attributes for CSS targeting
    document.body.setAttribute('data-theme', themeId);
    document.body.setAttribute('data-theme-name', theme.name);

    // Apply effect flags as data attributes
    Object.keys(theme.effects).forEach(effect => {
      if (typeof theme.effects[effect] === 'boolean') {
        document.body.setAttribute(`data-effect-${effect}`, theme.effects[effect]);
      }
    });

    // Update matrix green fallback for compatibility
    root.style.setProperty('--matrix-green', theme.primary);
    root.style.setProperty('--matrix-green-bright', theme.primaryLight);
    root.style.setProperty('--matrix-green-dim', theme.primaryDark);

    console.log(`🎨 Applied theme: ${theme.name} (${themeId})`);
  }

  /**
   * Switch to a new theme with smooth transition
   */
  async switchTheme(newThemeId, options = {}) {
    if (this.isTransitioning) {
      console.warn('Theme transition already in progress, ignoring request');
      return false;
    }

    if (newThemeId === this.currentTheme) {
      console.log(`Already using theme: ${newThemeId}`);
      return true;
    }

    if (!this.themeConfigurations[newThemeId]) {
      console.error(`Theme not found: ${newThemeId}`);
      return false;
    }

    try {
      this.isTransitioning = true;
      const startTime = Date.now();

      // Notify transition start
      if (this.onTransitionStart) {
        this.onTransitionStart(this.currentTheme, newThemeId);
      }

      // Add transition class to body
      document.body.classList.add('theme-transitioning');

      // Apply new theme
      this.applyTheme(newThemeId, options);

      // Wait for transition to complete
      if (!options.immediate) {
        await new Promise(resolve => setTimeout(resolve, this.transitionDuration));
      }

      // Update current theme
      const previousTheme = this.currentTheme;
      this.currentTheme = newThemeId;

      // Add to history
      this.themeHistory.unshift({
        from: previousTheme,
        to: newThemeId,
        timestamp: Date.now(),
        duration: Date.now() - startTime
      });

      // Keep only last 10 transitions
      if (this.themeHistory.length > 10) {
        this.themeHistory = this.themeHistory.slice(0, 10);
      }

      // Remove transition class
      document.body.classList.remove('theme-transitioning');

      // Notify transition end
      if (this.onTransitionEnd) {
        this.onTransitionEnd(previousTheme, newThemeId);
      }

      // Notify theme change
      if (this.onThemeChange) {
        this.onThemeChange(newThemeId, this.getThemeConfig(newThemeId));
      }

      console.log(`✅ Theme transition completed: ${previousTheme} → ${newThemeId} (${Date.now() - startTime}ms)`);
      return true;

    } catch (error) {
      console.error('Theme transition failed:', error);
      return false;
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Validate theme configuration
   */
  validateTheme(themeId) {
    const theme = this.themeConfigurations[themeId];
    if (!theme) {
      return { valid: false, errors: [`Theme "${themeId}" not found`] };
    }

    const errors = [];
    const warnings = [];

    // Check required properties
    const requiredProps = ['name', 'primary', 'primaryLight', 'primaryDark', 'contrast'];
    requiredProps.forEach(prop => {
      if (!theme[prop]) {
        errors.push(`Missing required property: ${prop}`);
      }
    });

    // Validate color format
    const colorProps = ['primary', 'primaryLight', 'primaryDark', 'secondary', 'accent', 'contrast'];
    colorProps.forEach(prop => {
      if (theme[prop] && !this.isValidColor(theme[prop])) {
        errors.push(`Invalid color format for ${prop}: ${theme[prop]}`);
      }
    });

    // Check contrast ratios (simplified)
    if (theme.primary && theme.contrast) {
      const contrastRatio = this.calculateContrastRatio(theme.primary, theme.contrast);
      if (contrastRatio < 4.5) {
        warnings.push(`Low contrast ratio between primary and contrast colors: ${contrastRatio.toFixed(2)}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      theme
    };
  }

  /**
   * Check if a color string is valid
   */
  isValidColor(color) {
    // Simple validation for hex colors and rgba
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
           /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+)?\s*\)$/.test(color);
  }

  /**
   * Calculate contrast ratio between two colors (simplified)
   */
  calculateContrastRatio(color1, color2) {
    // This is a simplified implementation
    // In a real application, you'd use a proper color library
    const getLuminance = (color) => {
      if (color.startsWith('#')) {
        const hex = color.slice(1);
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }
      return 0.5; // Fallback
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get current theme status
   */
  getStatus() {
    return {
      currentTheme: this.currentTheme,
      currentThemeName: this.getThemeConfig(this.currentTheme).name,
      isTransitioning: this.isTransitioning,
      availableThemes: Object.keys(this.themeConfigurations),
      transitionDuration: this.transitionDuration,
      themeHistory: this.themeHistory.slice(0, 3)
    };
  }

  /**
   * Get all available themes
   */
  getAvailableThemes() {
    return Object.keys(this.themeConfigurations).map(id => ({
      id,
      name: this.themeConfigurations[id].name,
      primary: this.themeConfigurations[id].primary
    }));
  }

  /**
   * Initialize theme on page load
   */
  initialize(themeId = 'corporate-ai') {
    this.currentTheme = themeId;
    this.applyTheme(themeId, { immediate: true });
    console.log(`🎨 ThemeManager initialized with theme: ${themeId}`);
  }

  /**
   * Reset to default theme
   */
  reset() {
    return this.switchTheme('corporate-ai', { immediate: true });
  }

  /**
   * Export theme configuration for debugging
   */
  exportThemeConfig(themeId) {
    const theme = this.getThemeConfig(themeId);
    return JSON.stringify(theme, null, 2);
  }
}

export default ThemeManager;