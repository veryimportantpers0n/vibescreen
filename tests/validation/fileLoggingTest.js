/**
 * Test file for validating the file-based error logging system
 * Tests log file creation, structure, and retrieval functionality
 */

import { fileErrorLogger } from '../../utils/fileErrorLogger.js';
import { logViewer } from '../../utils/logViewer.js';
import { generateSampleLogs } from '../utils/generateSampleLogs.js';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Test file logging functionality
 */
export function testFileLogging() {
  console.log('\n📁 Testing File-Based Error Logging System...');
  console.log('=' .repeat(50));
  
  const results = {
    logDirectoryExists: false,
    dailyLogCreation: false,
    modeLogCreation: false,
    performanceLogCreation: false,
    crashReportCreation: false,
    logViewerWorks: false,
    logStructureValid: false
  };

  try {
    // Test 1: Check if logs directory exists
    console.log('\n📋 Test 1: Log Directory Structure');
    const logsDir = 'logs';
    if (existsSync(logsDir)) {
      results.logDirectoryExists = true;
      console.log('✅ PASS: Logs directory exists');
      
      // Check subdirectories
      const subdirs = ['mode-errors', 'performance', 'crash-reports'];
      subdirs.forEach(subdir => {
        const path = join(logsDir, subdir);
        if (existsSync(path)) {
          console.log(`✅ PASS: ${subdir} subdirectory exists`);
        } else {
          console.log(`❌ FAIL: ${subdir} subdirectory missing`);
        }
      });
    } else {
      console.log('❌ FAIL: Logs directory does not exist');
    }

    // Test 2: Test daily error logging
    console.log('\n📋 Test 2: Daily Error Log Creation');
    try {
      const testError = new Error('Test daily error');
      fileErrorLogger.writeDailyError(testError, { test: true });
      
      const today = new Date().toISOString().split('T')[0];
      const dailyLogPath = join(logsDir, `error-${today}.json`);
      
      if (existsSync(dailyLogPath)) {
        results.dailyLogCreation = true;
        console.log('✅ PASS: Daily error log created successfully');
        
        // Validate log structure
        const content = readFileSync(dailyLogPath, 'utf8');
        const logs = JSON.parse(content);
        
        if (Array.isArray(logs) && logs.length > 0) {
          const lastLog = logs[logs.length - 1];
          if (lastLog.timestamp && lastLog.error && lastLog.context && lastLog.systemInfo) {
            results.logStructureValid = true;
            console.log('✅ PASS: Log structure is valid');
          } else {
            console.log('❌ FAIL: Log structure is invalid');
          }
        }
      } else {
        console.log('❌ FAIL: Daily error log not created');
      }
    } catch (error) {
      console.log('❌ FAIL: Daily error logging failed:', error.message);
    }

    // Test 3: Test mode-specific logging
    console.log('\n📋 Test 3: Mode-Specific Error Logging');
    try {
      const modeError = new Error('Test mode error');
      fileErrorLogger.writeModeError('test-mode', modeError, { test: true });
      
      const modeLogPath = join(logsDir, 'mode-errors', 'mode-loading-errors.json');
      
      if (existsSync(modeLogPath)) {
        results.modeLogCreation = true;
        console.log('✅ PASS: Mode error log created successfully');
        
        const content = readFileSync(modeLogPath, 'utf8');
        const modeLogs = JSON.parse(content);
        
        if (modeLogs['test-mode'] && Array.isArray(modeLogs['test-mode'])) {
          console.log('✅ PASS: Mode error structure is valid');
        } else {
          console.log('❌ FAIL: Mode error structure is invalid');
        }
      } else {
        console.log('❌ FAIL: Mode error log not created');
      }
    } catch (error) {
      console.log('❌ FAIL: Mode error logging failed:', error.message);
    }

    // Test 4: Test performance logging
    console.log('\n📋 Test 4: Performance Issue Logging');
    try {
      fileErrorLogger.writePerformanceIssue('Test performance issue', { 
        memoryUsed: 100, 
        test: true 
      });
      
      const perfLogPath = join(logsDir, 'performance', 'performance-issues.json');
      
      if (existsSync(perfLogPath)) {
        results.performanceLogCreation = true;
        console.log('✅ PASS: Performance log created successfully');
      } else {
        console.log('❌ FAIL: Performance log not created');
      }
    } catch (error) {
      console.log('❌ FAIL: Performance logging failed:', error.message);
    }

    // Test 5: Test crash report logging
    console.log('\n📋 Test 5: Crash Report Logging');
    try {
      const crashError = new Error('Test crash error');
      fileErrorLogger.writeCrashReport(crashError, { test: true });
      
      // Check if any crash report was created
      const crashDir = join(logsDir, 'crash-reports');
      if (existsSync(crashDir)) {
        const files = readdirSync(crashDir);
        const crashFiles = files.filter(f => f.startsWith('crash-') && f.endsWith('.json'));
        
        if (crashFiles.length > 0) {
          results.crashReportCreation = true;
          console.log('✅ PASS: Crash report created successfully');
        } else {
          console.log('❌ FAIL: No crash reports found');
        }
      } else {
        console.log('❌ FAIL: Crash reports directory not found');
      }
    } catch (error) {
      console.log('❌ FAIL: Crash report logging failed:', error.message);
    }

    // Test 6: Test log viewer functionality
    console.log('\n📋 Test 6: Log Viewer Functionality');
    try {
      const diagnostic = logViewer.generateQuickDiagnostic();
      
      if (diagnostic && diagnostic.analysis && diagnostic.availableFiles) {
        results.logViewerWorks = true;
        console.log('✅ PASS: Log viewer works correctly');
        console.log(`   Health Status: ${diagnostic.analysis.overallHealth}`);
        console.log(`   Total Errors Today: ${diagnostic.analysis.totalErrorsToday}`);
      } else {
        console.log('❌ FAIL: Log viewer not working correctly');
      }
    } catch (error) {
      console.log('❌ FAIL: Log viewer failed:', error.message);
    }

  } catch (error) {
    console.error('❌ File logging test failed:', error);
  }

  return results;
}

/**
 * Test sample log generation
 */
export function testSampleLogGeneration() {
  console.log('\n🧪 Testing Sample Log Generation...');
  console.log('=' .repeat(50));
  
  try {
    console.log('Generating sample logs...');
    generateSampleLogs();
    
    setTimeout(() => {
      console.log('\n📊 Checking generated sample logs...');
      const diagnostic = logViewer.generateQuickDiagnostic();
      
      console.log(`Health Status: ${diagnostic.analysis.overallHealth}`);
      console.log(`Errors Generated: ${diagnostic.analysis.totalErrorsToday}`);
      console.log(`Problematic Modes: ${diagnostic.analysis.problematicModes.length}`);
      console.log(`Performance Issues: ${diagnostic.analysis.performanceIssueCount}`);
      console.log(`Crash Reports: ${diagnostic.analysis.crashCount}`);
      
      console.log('\n✅ Sample log generation test completed');
    }, 2000);
    
  } catch (error) {
    console.error('❌ Sample log generation test failed:', error);
  }
}

/**
 * Run comprehensive file logging validation
 */
export function validateFileLoggingSystem() {
  console.log('🧪 Comprehensive File Logging System Validation');
  console.log('=' .repeat(60));
  
  const fileLoggingResults = testFileLogging();
  
  // Calculate overall results
  const totalTests = Object.keys(fileLoggingResults).length;
  const passedTests = Object.values(fileLoggingResults).filter(result => result === true).length;
  const successRate = (passedTests / totalTests) * 100;
  
  console.log('\n📊 Overall Results');
  console.log('=' .repeat(30));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 80) {
    console.log('\n✅ File logging system validation PASSED');
  } else {
    console.log('\n❌ File logging system validation FAILED');
  }
  
  return {
    success: successRate >= 80,
    results: fileLoggingResults,
    successRate
  };
}

// Export for use in other test files
export default {
  testFileLogging,
  testSampleLogGeneration,
  validateFileLoggingSystem
};

// Run validation if called directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  validateFileLoggingSystem();
}