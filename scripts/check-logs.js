#!/usr/bin/env node

/**
 * VibeScreen Log Checker CLI
 * Quick command-line tool to check error logs and system health
 */

import { logViewer } from '../utils/logViewer.js';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'diagnostic';

async function main() {
  console.log('🔍 VibeScreen Log Checker');
  console.log('=' .repeat(40));

  switch (command) {
    case 'diagnostic':
    case 'diag':
      logViewer.printDiagnostic();
      break;

    case 'today':
      const todaysErrors = logViewer.getTodaysErrors();
      console.log(`\n📅 Today's Errors (${todaysErrors.count || 0}):`);
      if (todaysErrors.errors && todaysErrors.errors.length > 0) {
        todaysErrors.errors.slice(-5).forEach((error, i) => {
          console.log(`\n${i + 1}. ${error.error.message}`);
          console.log(`   Time: ${new Date(error.timestamp).toLocaleTimeString()}`);
          console.log(`   Context: ${JSON.stringify(error.context)}`);
        });
      } else {
        console.log('   No errors logged today! 🎉');
      }
      break;

    case 'modes':
      const modeErrors = logViewer.getModeErrors();
      console.log('\n🎭 Mode Error Summary:');
      if (Object.keys(modeErrors.modes).length > 0) {
        Object.entries(modeErrors.modes).forEach(([mode, errors]) => {
          console.log(`\n  ${mode}: ${errors.length} errors`);
          if (errors.length > 0) {
            const latest = errors[errors.length - 1];
            console.log(`    Latest: ${latest.error.message}`);
            console.log(`    Time: ${new Date(latest.timestamp).toLocaleString()}`);
          }
        });
      } else {
        console.log('   No mode errors logged! 🎉');
      }
      break;

    case 'performance':
    case 'perf':
      const perfIssues = logViewer.getPerformanceIssues();
      console.log(`\n⚡ Performance Issues (${perfIssues.count || 0}):`);
      if (perfIssues.issues && perfIssues.issues.length > 0) {
        perfIssues.issues.slice(-3).forEach((issue, i) => {
          console.log(`\n${i + 1}. ${issue.issue}`);
          console.log(`   Time: ${new Date(issue.timestamp).toLocaleTimeString()}`);
          if (issue.metrics) {
            console.log(`   Metrics: ${JSON.stringify(issue.metrics)}`);
          }
        });
      } else {
        console.log('   No performance issues logged! 🎉');
      }
      break;

    case 'crashes':
      const crashes = logViewer.getCrashReports();
      console.log(`\n💥 Crash Reports (${crashes.count || 0}):`);
      if (crashes.crashes && crashes.crashes.length > 0) {
        crashes.crashes.forEach((crash, i) => {
          console.log(`\n${i + 1}. ${crash.error.message}`);
          console.log(`   File: ${crash.filename}`);
          console.log(`   Time: ${new Date(crash.timestamp).toLocaleString()}`);
        });
      } else {
        console.log('   No crashes logged! 🎉');
      }
      break;

    case 'files':
      const files = logViewer.getAvailableLogFiles();
      console.log('\n📁 Available Log Files:');
      console.log(`\n  Daily Error Logs (${files.daily.length}):`);
      files.daily.forEach(file => console.log(`    - ${file}`));
      
      console.log(`\n  Mode Error Logs (${files.mode.length}):`);
      files.mode.forEach(file => console.log(`    - ${file}`));
      
      console.log(`\n  Performance Logs (${files.performance.length}):`);
      files.performance.forEach(file => console.log(`    - ${file}`));
      
      console.log(`\n  Crash Reports (${files.crashes.length}):`);
      files.crashes.forEach(file => console.log(`    - ${file}`));
      break;

    case 'help':
      console.log('\n📖 Available Commands:');
      console.log('  diagnostic, diag  - Full diagnostic report (default)');
      console.log('  today            - Show today\'s errors');
      console.log('  modes            - Show mode-specific errors');
      console.log('  performance, perf - Show performance issues');
      console.log('  crashes          - Show crash reports');
      console.log('  files            - List all log files');
      console.log('  help             - Show this help');
      console.log('\n📝 Usage Examples:');
      console.log('  node scripts/check-logs.js');
      console.log('  node scripts/check-logs.js today');
      console.log('  node scripts/check-logs.js modes');
      break;

    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('Run "node scripts/check-logs.js help" for available commands');
      break;
  }

  console.log('\n' + '=' .repeat(40));
}

main().catch(error => {
  console.error('❌ Error running log checker:', error);
  process.exit(1);
});