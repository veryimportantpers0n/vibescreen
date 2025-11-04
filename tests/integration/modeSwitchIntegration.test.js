/**
 * Integration test for Mode Switch Controller and Terminal Command System
 * Tests the complete flow from terminal command to mode loading
 */

import { ModeSwitchController } from '../../components/ModeSwitchController';
import { CommandParser } from '../../components/CommandParser';

describe('Mode Switch Integration', () => {
  let controller;
  let parser;
  let mockCallbacks;

  beforeEach(() => {
    mockCallbacks = {
      onModeChange: jest.fn().mockResolvedValue(undefined),
      onLoadingStateChange: jest.fn(),
      onError: jest.fn(),
      getCurrentModeData: jest.fn(() => ({}))
    };

    controller = new ModeSwitchController({
      initialMode: 'corporate-ai',
      ...mockCallbacks
    });

    parser = new CommandParser();
  });

  describe('Character Name to Mode ID Mapping', () => {
    test('maps full character names correctly', async () => {
      const result = await controller.handleCharacterSwitch('Corporate AI');
      expect(result.success).toBe(true);
      expect(result.data.modeId).toBe('corporate-ai');
    });

    test('maps partial character names correctly', async () => {
      const result = await controller.handleCharacterSwitch('zen');
      expect(result.success).toBe(true);
      expect(result.data.modeId).toBe('zen-monk');
    });

    test('handles case insensitive input', async () => {
      const result = await controller.handleCharacterSwitch('CHAOS');
      expect(result.success).toBe(true);
      expect(result.data.modeId).toBe('chaos');
    });

    test('provides suggestions for ambiguous input', async () => {
      await expect(controller.handleCharacterSwitch('a')).rejects.toThrow(/Multiple matches found/);
    });

    test('handles invalid character names', async () => {
      await expect(controller.handleCharacterSwitch('invalid')).rejects.toThrow(/not found/);
    });
  });

  describe('Terminal Command Integration', () => {
    test('processes !switch command through complete flow', () => {
      const context = {
        onCharacterSwitch: controller.handleCharacterSwitch,
        currentCharacter: 'Corporate AI',
        messageStatus: 'Active'
      };

      const result = parser.parseAndExecute('!switch Zen Monk', context);
      expect(result.success).toBe(true);
      expect(result.action).toBe('switch-character');
    });

    test('provides status information with mode loader stats', () => {
      // Mock ModeLoader reference
      const mockModeLoader = {
        getCacheStats: () => ({ size: 3, hitRate: '85%' }),
        getPerformanceStats: () => ({ avgCachedSwitchTime: 150 })
      };
      
      controller.setModeLoaderRef(mockModeLoader);

      const status = controller.getStatus();
      expect(status.currentCharacter).toBe('Corporate AI');
      expect(status.modeLoaderStats.cacheStats).toBeDefined();
      expect(status.modeLoaderStats.performanceStats).toBeDefined();
    });

    test('handles !characters command', () => {
      const characters = controller.getAvailableCharacters();
      expect(characters).toHaveLength(3); // Currently implemented modes
      expect(characters[0]).toHaveProperty('id');
      expect(characters[0]).toHaveProperty('name');
      expect(characters[0]).toHaveProperty('available', true);
    });
  });

  describe('Mode Loading Coordination', () => {
    test('prevents switching to same mode', async () => {
      const result = await controller.switchToMode('corporate-ai');
      expect(result.success).toBe(true);
      expect(result.action).toBe('no-change');
      expect(mockCallbacks.onModeChange).not.toHaveBeenCalled();
    });

    test('validates mode availability', async () => {
      await expect(controller.switchToMode('invalid-mode')).rejects.toThrow(/not available/);
    });

    test('tracks switch history', async () => {
      await controller.switchToMode('zen-monk');
      await controller.switchToMode('chaos');
      
      const status = controller.getStatus();
      expect(status.switchHistory).toHaveLength(2);
      expect(status.switchHistory[0].toMode).toBe('chaos');
      expect(status.switchHistory[1].toMode).toBe('zen-monk');
    });

    test('handles loading state changes', async () => {
      const switchPromise = controller.switchToMode('zen-monk');
      
      // Should have called loading state change
      expect(mockCallbacks.onLoadingStateChange).toHaveBeenCalledWith('Switching');
      
      await switchPromise;
      
      // Should have reset loading state
      expect(mockCallbacks.onLoadingStateChange).toHaveBeenCalledWith('Ready');
    });
  });

  describe('Error Handling', () => {
    test('handles mode change callback errors', async () => {
      mockCallbacks.onModeChange.mockRejectedValue(new Error('Mode change failed'));
      
      await expect(controller.switchToMode('zen-monk')).rejects.toThrow(/Mode change failed/);
      expect(mockCallbacks.onError).toHaveBeenCalled();
    });

    test('resets loading state after error', async () => {
      mockCallbacks.onModeChange.mockRejectedValue(new Error('Test error'));
      
      try {
        await controller.switchToMode('zen-monk');
      } catch (error) {
        // Expected to throw
      }
      
      // Should eventually reset loading state
      setTimeout(() => {
        expect(mockCallbacks.onLoadingStateChange).toHaveBeenCalledWith('Ready');
      }, 2100);
    });
  });

  describe('ModeLoader Integration', () => {
    test('connects to ModeLoader for cache management', () => {
      const mockModeLoader = {
        getCacheStats: jest.fn(() => ({ size: 5 })),
        clearCache: jest.fn(),
        preloadMode: jest.fn().mockResolvedValue(undefined)
      };

      controller.setModeLoaderRef(mockModeLoader);
      
      // Test cache stats
      const stats = controller.getModeLoaderStats();
      expect(mockModeLoader.getCacheStats).toHaveBeenCalled();
      expect(stats.cacheStats.size).toBe(5);
      
      // Test cache clearing
      const cleared = controller.clearCache();
      expect(cleared).toBe(true);
      expect(mockModeLoader.clearCache).toHaveBeenCalled();
      
      // Test preloading
      controller.preloadMode('zen-monk');
      expect(mockModeLoader.preloadMode).toHaveBeenCalledWith('zen-monk');
    });

    test('handles missing ModeLoader gracefully', () => {
      controller.setModeLoaderRef(null);
      
      const stats = controller.getModeLoaderStats();
      expect(stats).toEqual({});
      
      const cleared = controller.clearCache();
      expect(cleared).toBe(false);
    });
  });
});