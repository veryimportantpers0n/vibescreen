#!/usr/bin/env node

/**
 * Generate sample log files for testing the logging system
 * This is a test utility to create sample error logs for development and testing
 */

import { fileErrorLogger } from '../../utils/fileErrorLogger.js';

/**
 * Generate comprehensive sample log files for testing
 */
export function generateSampleLogs() {
  console.log('🧪 Generating sample log files for testing...');

  // Generate some sample errors
  const sampleErrors = [
    {
      error: new Error('Failed to load corporate-ai scene component'),
      context: { mode: 'corporate-ai', operation: 'dynamic_import', retryCount: 1 }
    },
    {
      error: new Error('NetworkError: Failed to fetch zen-monk character'),
      context: { mode: 'zen-monk', operation: 'component_loading', retryCount: 2 }
    },
    {
      error: new Error('WebGL context lost during rendering'),
      context: { mode: 'chaos', operation: 'scene_render', retryCount: 0 }
    },
    {
      error: new Error('Module not found: ./modes/invalid-mode/scene.js'),
      context: { mode: 'invalid-mode', operation: 'mode_loading', retryCount: 3 }
    },
    {
      error: new Error('TimeoutError: Component loading timed out'),
      context: { mode: 'zen-monk', operation: 'timeout', retryCount: 1 }
    },
    {
      error: new Error('ValidationError: Invalid component interface'),
      context: { mode: 'corporate-ai', operation: 'validation', retryCount: 0 }
    }
  ];

  // Generate daily errors
  console.log('📝 Writing daily errors...');
  sampleErrors.forEach((sample, i) => {
    setTimeout(() => {
      fileErrorLogger.writeDailyError(sample.error, sample.context);
    }, i * 100);
  });

  // Generate mode-specific errors
  console.log('🎭 Writing mode-specific errors...');
  setTimeout(() => {
    fileErrorLogger.writeModeError('corporate-ai', new Error('Scene component validation failed'), {
      operation: 'validation',
      retryCount: 1
    });
    
    fileErrorLogger.writeModeError('zen-monk', new Error('Character animation timeout'), {
      operation: 'animation',
      retryCount: 0
    });
    
    fileErrorLogger.writeModeError('chaos', new Error('Memory allocation failed'), {
      operation: 'memory_management',
      retryCount: 2
    });

    fileErrorLogger.writeModeError('emotional-damage', new Error('Component export not found'), {
      operation: 'component_loading',
      retryCount: 3
    });
  }, 500);

  // Generate performance issues
  console.log('⚡ Writing performance issues...');
  setTimeout(() => {
    fileErrorLogger.writePerformanceIssue('High memory usage detected', {
      memoryUsed: 450,
      memoryLimit: 512,
      frameRate: 30,
      sceneComplexity: 'high'
    });
    
    fileErrorLogger.writePerformanceIssue('Low frame rate detected', {
      frameRate: 15,
      targetFrameRate: 60,
      sceneComplexity: 'high',
      threejsObjects: 150
    });

    fileErrorLogger.writePerformanceIssue('WebGL context performance warning', {
      drawCalls: 200,
      maxDrawCalls: 100,
      textureMemory: 256
    });
  }, 700);

  // Generate crash reports
  console.log('💥 Writing crash reports...');
  setTimeout(() => {
    fileErrorLogger.writeCrashReport(new Error('Critical WebGL context loss'), {
      mode: 'corporate-ai',
      operation: 'scene_initialization',
      severity: 'CRITICAL'
    });

    setTimeout(() => {
      fileErrorLogger.writeCrashReport(new Error('Out of memory error'), {
        mode: 'chaos',
        operation: 'texture_loading',
        severity: 'CRITICAL'
      });
    }, 200);
  }, 900);

  // Generate summary report
  console.log('📊 Writing summary report...');
  setTimeout(() => {
    fileErrorLogger.writeSummaryReport();
    
    console.log('\n✅ Sample log files generated successfully!');
    console.log('\n🔍 Now you can test the log viewer:');
    console.log('  npm run logs           # Full diagnostic');
    console.log('  npm run logs:today     # Today\'s errors');
    console.log('  npm run logs:modes     # Mode-specific errors');
    console.log('  npm run logs:perf      # Performance issues');
    console.log('  npm run logs:crashes   # Crash reports');
    
  }, 1100);
}

// Run if called directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // Check if this file is being run directly
  const isMainModule = process.argv[1] && process.argv[1].endsWith('generateSampleLogs.js');
  if (isMainModule) {
    generateSampleLogs();
  }
}

export default generateSampleLogs;