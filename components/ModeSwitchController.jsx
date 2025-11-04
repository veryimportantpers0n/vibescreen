import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * ModeSwitchController - Coordinates mode switching between terminal commands and ModeLoader
 * Handles character name to mode ID mapping, loading states, and status reporting
 */
class ModeSwitchController {
  constructor(options = {}) {
    this.onModeChange = options.onModeChange || (() => {});
    this.onLoadingStateChange = options.onLoadingStateChange || (() => {});
    this.onError = options.onError || (() => {});
    this.getCurrentModeData = options.getCurrentModeData || (() => ({}));
    
    // Current state
    this.currentMode = options.initialMode || 'corporate-ai';
    this.loadingState = 'Ready';
    this.lastSwitchTime = null;
    this.switchHistory = [];
    this.modeLoaderRef = null;
    
    // Character name to mode ID mapping (matches CommandParser)
    this.characterNameMap = {
      // Full names (primary)
      'corporate ai': 'corporate-ai',
      'zen monk': 'zen-monk',
      'chaos': 'chaos',
      'emotional damage': 'emotional-damage',
      'therapist': 'therapist',
      'startup founder': 'startup-founder',
      'doomsday prophet': 'doomsday-prophet',
      'gamer rage': 'gamer-rage',
      'influencer': 'influencer',
      'wholesome grandma': 'wholesome-grandma',
      'spooky': 'spooky'
    };

    // Display names for status reporting
    this.characterDisplayNames = {
      'corporate-ai': 'Corporate AI',
      'zen-monk': 'Zen Monk',
      'chaos': 'Chaos',
      'emotional-damage': 'Emotional Damage',
      'therapist': 'Therapist',
      'startup-founder': 'Startup Founder',
      'doomsday-prophet': 'Doomsday Prophet',
      'gamer-rage': 'Gamer Rage',
      'influencer': 'Influencer',
      'wholesome-grandma': 'Wholesome Grandma',
      'spooky': 'Spooky'
    };

    // Available modes (currently implemented)
    this.availableModes = [
      'corporate-ai',
      'zen-monk', 
      'chaos'
    ];

    // Bind methods
    this.switchToMode = this.switchToMode.bind(this);
    this.handleCharacterSwitch = this.handleCharacterSwitch.bind(this);
    this.getStatus = this.getStatus.bind(this);
    this.setModeLoaderRef = this.setModeLoaderRef.bind(this);
  }

  /**
   * Set reference to ModeLoader for direct communication
   */
  setModeLoaderRef(modeLoaderRef) {
    this.modeLoaderRef = modeLoaderRef;
  }

  /**
   * Switch to a specific mode by ID
   */
  async switchToMode(modeId) {
    if (!modeId || typeof modeId !== 'string') {
      throw new Error('Invalid mode ID provided');
    }

    // Validate mode is available
    if (!this.availableModes.includes(modeId)) {
      throw new Error(`Mode "${modeId}" is not available. Available modes: ${this.availableModes.join(', ')}`);
    }

    // Check if already in this mode
    if (this.currentMode === modeId) {
      return {
        success: true,
        message: `Already in ${this.characterDisplayNames[modeId]} mode`,
        action: 'no-change',
        data: { modeId, displayName: this.characterDisplayNames[modeId] }
      };
    }

    try {
      // Update loading state
      this.setLoadingState('Switching');
      
      // Record switch attempt
      const switchAttempt = {
        fromMode: this.currentMode,
        toMode: modeId,
        timestamp: Date.now(),
        success: false
      };

      // Trigger mode change through callback
      if (this.onModeChange) {
        await this.onModeChange(modeId);
      }

      // Update internal state
      this.currentMode = modeId;
      this.lastSwitchTime = Date.now();
      switchAttempt.success = true;
      switchAttempt.duration = Date.now() - switchAttempt.timestamp;
      
      // Add to history (keep last 10 switches)
      this.switchHistory.unshift(switchAttempt);
      if (this.switchHistory.length > 10) {
        this.switchHistory = this.switchHistory.slice(0, 10);
      }

      // Update loading state
      this.setLoadingState('Ready');

      console.log(`✅ Mode switch completed: ${modeId} (${switchAttempt.duration}ms)`);

      return {
        success: true,
        message: `Switched to ${this.characterDisplayNames[modeId]}`,
        action: 'switch-character',
        data: { 
          modeId, 
          displayName: this.characterDisplayNames[modeId],
          switchTime: switchAttempt.duration
        }
      };

    } catch (error) {
      // Update loading state
      this.setLoadingState('Error');
      
      // Log error
      console.error(`❌ Mode switch failed: ${modeId}`, error);
      
      // Report error
      if (this.onError) {
        this.onError(error, { 
          action: 'mode-switch', 
          fromMode: this.currentMode, 
          toMode: modeId 
        });
      }

      // Reset loading state after delay
      setTimeout(() => {
        this.setLoadingState('Ready');
      }, 2000);

      throw new Error(`Failed to switch to ${this.characterDisplayNames[modeId]}: ${error.message}`);
    }
  }

  /**
   * Handle character switch from terminal command
   */
  async handleCharacterSwitch(characterInput) {
    if (!characterInput) {
      throw new Error('Character name is required');
    }

    // Handle both string and object inputs
    let modeId;
    if (typeof characterInput === 'string') {
      // Map character name to mode ID
      const normalizedName = characterInput.toLowerCase().trim();
      modeId = this.characterNameMap[normalizedName];
      
      if (!modeId) {
        // Try partial matching
        const partialMatches = Object.keys(this.characterNameMap)
          .filter(name => name.includes(normalizedName) || normalizedName.includes(name));
        
        if (partialMatches.length === 1) {
          modeId = this.characterNameMap[partialMatches[0]];
        } else if (partialMatches.length > 1) {
          const suggestions = partialMatches
            .map(name => this.characterDisplayNames[this.characterNameMap[name]])
            .slice(0, 3);
          throw new Error(`Multiple matches found for "${characterInput}". Did you mean: ${suggestions.join(', ')}?`);
        } else {
          throw new Error(`Character "${characterInput}" not found. Type !characters to see available options.`);
        }
      }
    } else if (characterInput.id) {
      modeId = characterInput.id;
    } else {
      throw new Error('Invalid character input format');
    }

    return await this.switchToMode(modeId);
  }

  /**
   * Set loading state and notify listeners
   */
  setLoadingState(state) {
    this.loadingState = state;
    if (this.onLoadingStateChange) {
      this.onLoadingStateChange(state);
    }
  }

  /**
   * Get current status for terminal !status command
   */
  getStatus() {
    const currentModeData = this.getCurrentModeData();
    const modeLoaderStats = this.getModeLoaderStats();
    
    return {
      currentCharacter: this.characterDisplayNames[this.currentMode] || this.currentMode,
      currentMode: this.currentMode,
      loadingState: this.loadingState,
      lastSwitchTime: this.lastSwitchTime,
      availableModes: this.availableModes.length,
      implementedModes: this.availableModes,
      modeLoaderStats,
      switchHistory: this.switchHistory.slice(0, 3), // Last 3 switches
      ...currentModeData
    };
  }

  /**
   * Get ModeLoader statistics if available
   */
  getModeLoaderStats() {
    if (!this.modeLoaderRef) {
      return {};
    }

    try {
      // Try to get stats from ModeLoader if methods are available
      const stats = {};
      
      if (typeof this.modeLoaderRef.getCacheStats === 'function') {
        stats.cacheStats = this.modeLoaderRef.getCacheStats();
      }
      
      if (typeof this.modeLoaderRef.getPerformanceStats === 'function') {
        stats.performanceStats = this.modeLoaderRef.getPerformanceStats();
      }
      
      if (typeof this.modeLoaderRef.getValidationResults === 'function') {
        stats.validationStats = this.modeLoaderRef.getValidationResults();
      }
      
      return stats;
    } catch (error) {
      console.warn('Failed to get ModeLoader stats:', error);
      return {};
    }
  }

  /**
   * Get available character list for !characters command
   */
  getAvailableCharacters() {
    return this.availableModes.map(modeId => ({
      id: modeId,
      name: this.characterDisplayNames[modeId],
      available: true,
      implemented: true
    }));
  }

  /**
   * Preload a mode (if ModeLoader supports it)
   */
  async preloadMode(modeId) {
    if (!this.availableModes.includes(modeId)) {
      throw new Error(`Cannot preload unavailable mode: ${modeId}`);
    }

    if (this.modeLoaderRef && typeof this.modeLoaderRef.preloadMode === 'function') {
      try {
        await this.modeLoaderRef.preloadMode(modeId);
        console.log(`✅ Preloaded mode: ${modeId}`);
        return true;
      } catch (error) {
        console.warn(`⚠️ Failed to preload mode ${modeId}:`, error);
        return false;
      }
    }

    return false;
  }

  /**
   * Clear ModeLoader cache (if supported)
   */
  clearCache() {
    if (this.modeLoaderRef && typeof this.modeLoaderRef.clearCache === 'function') {
      this.modeLoaderRef.clearCache();
      console.log('🗑️ ModeLoader cache cleared via controller');
      return true;
    }
    return false;
  }

  /**
   * Get validation report (if supported)
   */
  getValidationReport() {
    if (this.modeLoaderRef && typeof this.modeLoaderRef.getValidationReport === 'function') {
      return this.modeLoaderRef.getValidationReport();
    }
    return null;
  }
}

/**
 * React component wrapper for ModeSwitchController
 */
const ModeSwitchControllerComponent = ({ 
  initialMode = 'corporate-ai',
  onModeChange,
  onLoadingStateChange,
  onError,
  getCurrentModeData,
  children 
}) => {
  const [controller] = useState(() => new ModeSwitchController({
    initialMode,
    onModeChange,
    onLoadingStateChange,
    onError,
    getCurrentModeData
  }));

  const [currentMode, setCurrentMode] = useState(initialMode);
  const [loadingState, setLoadingState] = useState('Ready');
  const controllerRef = useRef(controller);

  // Update controller callbacks when props change
  useEffect(() => {
    controller.onModeChange = onModeChange;
    controller.onLoadingStateChange = (state) => {
      setLoadingState(state);
      if (onLoadingStateChange) {
        onLoadingStateChange(state);
      }
    };
    controller.onError = onError;
    controller.getCurrentModeData = getCurrentModeData;
  }, [controller, onModeChange, onLoadingStateChange, onError, getCurrentModeData]);

  // Update current mode when controller changes it
  useEffect(() => {
    setCurrentMode(controller.currentMode);
  }, [controller.currentMode]);

  // Expose controller methods to children
  const controllerMethods = {
    switchToMode: controller.switchToMode,
    handleCharacterSwitch: controller.handleCharacterSwitch,
    getStatus: controller.getStatus,
    getAvailableCharacters: controller.getAvailableCharacters,
    preloadMode: controller.preloadMode,
    clearCache: controller.clearCache,
    getValidationReport: controller.getValidationReport,
    setModeLoaderRef: controller.setModeLoaderRef,
    currentMode,
    loadingState
  };

  return children(controllerMethods);
};

ModeSwitchControllerComponent.propTypes = {
  initialMode: PropTypes.string,
  onModeChange: PropTypes.func.isRequired,
  onLoadingStateChange: PropTypes.func,
  onError: PropTypes.func,
  getCurrentModeData: PropTypes.func,
  children: PropTypes.func.isRequired
};

export default ModeSwitchControllerComponent;
export { ModeSwitchController };