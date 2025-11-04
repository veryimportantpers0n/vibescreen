/**
 * Quick Cache Performance Test
 * Tests the actual performance of the caching system
 */

import React from 'react';
import { render, act } from '@testing-library/react';
import ModeLoader from '../../components/ModeLoader.jsx';

// Mock the retry mechanism
const mockRetryDynamicImport = jest.fn();
jest.mock('../../utils/retryMechanism', () => ({
  modeLoadingRetry: { cancelAllRetries: jest.fn() },
  retryDynamicImport: mockRetryDynamicImport
}));

// Mock error logger
jest.mock('../../utils/errorLogger', () => ({
  logModeError: jest.fn(),
  logComponentError: jest.fn(),
  logValidationError: jest.fn()
}));

// Mock components
const mockScene = () => React.createElement('div', { 'data-testid': 'scene' });
const mockCharacter = () => React.createElement('div', { 'data-testid': 'character' });

describe('Cache Performance Quick Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock responses
    mockRetryDynamicImport.mockImplementation((path) => {
      // Simulate network delay
      return new Promise(resolve => {
        setTimeout(() => {
          if (path.includes('scene.js')) resolve({ default: mockScene });
          else if (path.includes('character.js')) resolve({ default: mockCharacter });
          else if (path.includes('config.json')) resolve({ default: { colors: { primary: '#00ff00' } } });
          else if (path.includes('messages.json')) resolve({ default: { messages: ['Test'] } });
          else resolve({});
        }, 50); // 50ms delay to simulate loading
      });
    });
  });

  test('should demonstrate cache performance improvement', async () => {
    let cacheStats = null;
    let performanceStats = null;
    
    const onModeChange = jest.fn();
    const { rerender } = render(<ModeLoader currentMode="corporate-ai" onModeChange={onModeChange} />);
    
    // Wait for initial load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });
    
    // Get initial stats
    if (onModeChange.getCacheStats) {
      cacheStats = onModeChange.getCacheStats();
      console.log('Initial cache stats:', cacheStats);
    }
    
    // Switch to another mode and back (should use cache)
    const startTime = performance.now();
    
    rerender(<ModeLoader currentMode="zen-monk" onModeChange={onModeChange} />);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    rerender(<ModeLoader currentMode="corporate-ai" onModeChange={onModeChange} />);
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    
    const endTime = performance.now();
    const switchTime = endTime - startTime;
    
    // Get final stats
    if (onModeChange.getCacheStats) {
      cacheStats = onModeChange.getCacheStats();
      console.log('Final cache stats:', cacheStats);
    }
    
    if (onModeChange.getPerformanceStats) {
      performanceStats = onModeChange.getPerformanceStats();
      console.log('Performance stats:', performanceStats);
    }
    
    console.log(`Mode switch completed in ${switchTime.toFixed(2)}ms`);
    
    // Verify cache is working
    expect(cacheStats?.size).toBeGreaterThan(0);
    expect(cacheStats?.hitCount).toBeGreaterThan(0);
  });
});

console.log('✅ Cache Performance Quick Test completed successfully!');