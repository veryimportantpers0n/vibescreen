/**
 * Log viewer utility for VibeScreen error logs
 * Provides easy access to view and analyze error log files
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * Log viewer class for reading and analyzing error logs
 */
export class LogViewer {
  constructor(logsDir = 'logs') {
    this.logsDir = logsDir;
  }

  /**
   * Get all available log files
   */
  getAvailableLogFiles() {
    try {
      if (!existsSync(this.logsDir)) {
        return { daily: [], mode: [], performance: [], crashes: [] };
      }

      const files = readdirSync(this.logsDir);
      const result = {
        daily: files.filter(f => f.startsWith('error-') && f.endsWith('.json')),
        summary: files.filter(f => f.startsWith('summary-') && f.endsWith('.json')),
        mode: [],
        performance: [],
        crashes: []
      };

      // Check subdirectories
      const subdirs = ['mode-errors', 'performance', 'crash-reports'];
      subdirs.forEach(subdir => {
        const subdirPath = join(this.logsDir, subdir);
        if (existsSync(subdirPath)) {
          const subdirFiles = readdirSync(subdirPath);
          if (subdir === 'mode-errors') {
            result.mode = subdirFiles;
          } else if (subdir === 'performance') {
            result.performance = subdirFiles;
          } else if (subdir === 'crash-reports') {
            result.crashes = subdirFiles;
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Failed to get log files:', error);
      return { daily: [], mode: [], performance: [], crashes: [] };
    }
  }

  /**
   * Read today's error log
   */
  getTodaysErrors() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filename = `error-${today}.json`;
      const filepath = join(this.logsDir, filename);

      if (!existsSync(filepath)) {
        return { errors: [], message: 'No errors logged today' };
      }

      const content = readFileSync(filepath, 'utf8');
      const errors = JSON.parse(content);

      return { errors, count: errors.length };
    } catch (error) {
      return { errors: [], error: error.message };
    }
  }

  /**
   * Read mode-specific errors
   */
  getModeErrors(modeName = null) {
    try {
      const filepath = join(this.logsDir, 'mode-errors', 'mode-loading-errors.json');

      if (!existsSync(filepath)) {
        return { modes: {}, message: 'No mode errors logged' };
      }

      const content = readFileSync(filepath, 'utf8');
      const modeErrors = JSON.parse(content);

      if (modeName) {
        return {
          mode: modeName,
          errors: modeErrors[modeName] || [],
          count: (modeErrors[modeName] || []).length
        };
      }

      return { modes: modeErrors };
    } catch (error) {
      return { modes: {}, error: error.message };
    }
  }

  /**
   * Read performance issues
   */
  getPerformanceIssues() {
    try {
      const filepath = join(this.logsDir, 'performance', 'performance-issues.json');

      if (!existsSync(filepath)) {
        return { issues: [], message: 'No performance issues logged' };
      }

      const content = readFileSync(filepath, 'utf8');
      const issues = JSON.parse(content);

      return { issues, count: issues.length };
    } catch (error) {
      return { issues: [], error: error.message };
    }
  }

  /**
   * Read crash reports
   */
  getCrashReports() {
    try {
      const crashDir = join(this.logsDir, 'crash-reports');

      if (!existsSync(crashDir)) {
        return { crashes: [], message: 'No crash reports' };
      }

      const files = readdirSync(crashDir);
      const crashes = [];

      files.forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const content = readFileSync(join(crashDir, file), 'utf8');
            const crash = JSON.parse(content);
            crashes.push({ filename: file, ...crash });
          } catch (error) {
            console.warn(`Failed to read crash report ${file}:`, error);
          }
        }
      });

      return { crashes, count: crashes.length };
    } catch (error) {
      return { crashes: [], error: error.message };
    }
  }

  /**
   * Get latest summary report
   */
  getLatestSummary() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const filename = `summary-${today}.json`;
      const filepath = join(this.logsDir, filename);

      if (!existsSync(filepath)) {
        return { summary: null, message: 'No summary report for today' };
      }

      const content = readFileSync(filepath, 'utf8');
      const summary = JSON.parse(content);

      return { summary };
    } catch (error) {
      return { summary: null, error: error.message };
    }
  }

  /**
   * Generate a quick diagnostic report
   */
  generateQuickDiagnostic() {
    const diagnostic = {
      timestamp: new Date().toISOString(),
      todaysErrors: this.getTodaysErrors(),
      modeErrors: this.getModeErrors(),
      performanceIssues: this.getPerformanceIssues(),
      crashReports: this.getCrashReports(),
      availableFiles: this.getAvailableLogFiles()
    };

    // Add quick analysis
    diagnostic.analysis = {
      totalErrorsToday: diagnostic.todaysErrors.count || 0,
      problematicModes: Object.keys(diagnostic.modeErrors.modes || {}),
      performanceIssueCount: diagnostic.performanceIssues.count || 0,
      crashCount: diagnostic.crashReports.count || 0
    };
    
    diagnostic.analysis.overallHealth = this.assessOverallHealth(diagnostic);

    return diagnostic;
  }

  /**
   * Assess overall system health based on logs
   */
  assessOverallHealth(diagnostic) {
    const errors = diagnostic.todaysErrors.count || 0;
    const crashes = diagnostic.crashReports.count || 0;
    const modes = Object.keys(diagnostic.modeErrors.modes || {}).length;

    if (crashes > 0) return 'CRITICAL';
    if (errors > 20 || modes > 3) return 'WARNING';
    if (errors > 5 || modes > 1) return 'CAUTION';
    return 'HEALTHY';
  }

  /**
   * Print diagnostic report to console
   */
  printDiagnostic() {
    const diagnostic = this.generateQuickDiagnostic();
    
    console.log('\n🔍 VibeScreen Error Log Diagnostic Report');
    console.log('=' .repeat(50));
    console.log(`📅 Generated: ${diagnostic.timestamp}`);
    console.log(`🏥 Overall Health: ${diagnostic.analysis.overallHealth}`);
    
    console.log('\n📊 Error Summary:');
    console.log(`  Today's Errors: ${diagnostic.analysis.totalErrorsToday}`);
    console.log(`  Problematic Modes: ${diagnostic.analysis.problematicModes.length}`);
    console.log(`  Performance Issues: ${diagnostic.analysis.performanceIssueCount}`);
    console.log(`  Crash Reports: ${diagnostic.analysis.crashCount}`);
    
    if (diagnostic.analysis.problematicModes.length > 0) {
      console.log('\n⚠️ Problematic Modes:');
      diagnostic.analysis.problematicModes.forEach(mode => {
        const modeData = diagnostic.modeErrors.modes[mode];
        console.log(`  - ${mode}: ${modeData.length} errors`);
      });
    }
    
    console.log('\n📁 Available Log Files:');
    const files = diagnostic.availableFiles;
    console.log(`  Daily Logs: ${files.daily.length}`);
    console.log(`  Mode Error Logs: ${files.mode.length}`);
    console.log(`  Performance Logs: ${files.performance.length}`);
    console.log(`  Crash Reports: ${files.crashes.length}`);
    
    return diagnostic;
  }
}

/**
 * Global log viewer instance
 */
export const logViewer = new LogViewer();

/**
 * Convenience functions
 */
export function viewTodaysErrors() {
  return logViewer.getTodaysErrors();
}

export function viewModeErrors(modeName) {
  return logViewer.getModeErrors(modeName);
}

export function viewPerformanceIssues() {
  return logViewer.getPerformanceIssues();
}

export function viewCrashReports() {
  return logViewer.getCrashReports();
}

export function quickDiagnostic() {
  return logViewer.printDiagnostic();
}

// Export default viewer
export default logViewer;