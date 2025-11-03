/**
 * Comprehensive data validation utilities for VibeScreen
 * Provides unified validation for all data files and configurations
 */

import { validateAndSanitizeConfig, validateConfigStructure, loadConfigFromJSON } from './configValidation.js';
import { validateAllMessageFiles, validateJSONFile, validateWithFallback, generateValidationReport } from './messageValidation.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Validates all critical data files for the application
 * @param {string} dataDir - Base data directory path
 * @returns {Object} - Comprehensive validation results
 */
export async function validateAllDataFiles(dataDir = 'data') {
  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    files: {},
    summary: {
      totalFiles: 0,
      validFiles: 0,
      totalErrors: 0,
      totalWarnings: 0,
      criticalErrors: []
    }
  };

  console.log('Starting comprehensive data validation...');

  try {
    // 1. Validate global configuration
    console.log('Validating global configuration...');
    const configResult = await validateGlobalConfiguration(join(dataDir, 'global-config.json'));
    results.files['global-config.json'] = configResult;
    
    if (!configResult.success) {
      results.success = false;
      results.summary.criticalErrors.push('Global configuration validation failed');
    }

    // 2. Validate master message files
    console.log('Validating master message files...');
    const messageResult = validateAllMessageFiles(join(dataDir, 'master-messages'));
    results.files['master-messages'] = messageResult;
    
    if (!messageResult.success) {
      results.success = false;
      results.summary.criticalErrors.push('Master message validation failed');
    }

    // 3. Check data directory structure
    console.log('Validating data directory structure...');
    const structureResult = validateDataDirectoryStructure(dataDir);
    results.files['directory-structure'] = structureResult;
    
    if (!structureResult.success) {
      results.success = false;
      results.summary.criticalErrors.push('Data directory structure is invalid');
    }

    // Calculate summary statistics
    calculateValidationSummary(results);

    console.log(`Validation complete. Status: ${results.success ? 'PASS' : 'FAIL'}`);
    
    return results;

  } catch (error) {
    results.success = false;
    results.summary.criticalErrors.push(`Validation process failed: ${error.message}`);
    
    console.error('Data validation failed:', error.message);
    return results;
  }
}

/**
 * Validates global configuration file
 * @param {string} configPath - Path to global config file
 * @returns {Object} - Configuration validation results
 */
async function validateGlobalConfiguration(configPath) {
  try {
    // Check if file exists
    if (!existsSync(configPath)) {
      return {
        success: false,
        errors: [`Configuration file not found: ${configPath}`],
        warnings: [],
        filePath: configPath
      };
    }

    // Validate JSON syntax
    const jsonResult = validateJSONFile(configPath);
    if (!jsonResult.success) {
      return {
        success: false,
        errors: jsonResult.errors,
        warnings: jsonResult.warnings,
        filePath: configPath
      };
    }

    // Validate configuration structure
    const structureResult = validateConfigStructure(jsonResult.content);
    
    // Validate and sanitize configuration values
    const sanitizedConfig = validateAndSanitizeConfig(jsonResult.content);

    return {
      success: structureResult.success,
      errors: structureResult.errors,
      warnings: structureResult.warnings,
      filePath: configPath,
      config: sanitizedConfig,
      fileSize: jsonResult.fileSize
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Configuration validation failed: ${error.message}`],
      warnings: [],
      filePath: configPath
    };
  }
}

/**
 * Validates data directory structure and required files
 * @param {string} dataDir - Data directory path
 * @returns {Object} - Structure validation results
 */
function validateDataDirectoryStructure(dataDir) {
  const errors = [];
  const warnings = [];
  
  const requiredFiles = [
    'global-config.json',
    'master-messages/funny-exaggerations.json',
    'master-messages/cliche-ai-phrases.json',
    'master-messages/cliche-ai-things.json',
    'master-messages/readme.txt'
  ];

  const optionalFiles = [
    'README.md'
  ];

  // Check if data directory exists
  if (!existsSync(dataDir)) {
    errors.push(`Data directory not found: ${dataDir}`);
    return { success: false, errors, warnings };
  }

  // Check required files
  requiredFiles.forEach(file => {
    const filePath = join(dataDir, file);
    if (!existsSync(filePath)) {
      errors.push(`Required file missing: ${filePath}`);
    }
  });

  // Check optional files
  optionalFiles.forEach(file => {
    const filePath = join(dataDir, file);
    if (!existsSync(filePath)) {
      warnings.push(`Optional file missing: ${filePath}`);
    }
  });

  // Check for unexpected files
  try {
    const fs = require('fs');
    const files = fs.readdirSync(dataDir, { withFileTypes: true });
    
    files.forEach(file => {
      if (file.isFile() && !requiredFiles.includes(file.name) && !optionalFiles.includes(file.name)) {
        warnings.push(`Unexpected file found: ${join(dataDir, file.name)}`);
      }
    });
  } catch (error) {
    warnings.push(`Could not scan directory contents: ${error.message}`);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    requiredFiles: requiredFiles.length,
    foundFiles: requiredFiles.filter(file => existsSync(join(dataDir, file))).length
  };
}

/**
 * Calculates summary statistics from validation results
 * @param {Object} results - Validation results object to update
 */
function calculateValidationSummary(results) {
  let totalFiles = 0;
  let validFiles = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  Object.values(results.files).forEach(fileResult => {
    if (fileResult.files) {
      // Handle nested results (like master-messages)
      totalFiles += fileResult.summary?.totalFiles || 0;
      validFiles += fileResult.summary?.validFiles || 0;
      totalErrors += fileResult.summary?.totalErrors || 0;
      totalWarnings += fileResult.summary?.totalWarnings || 0;
    } else {
      // Handle single file results
      totalFiles++;
      if (fileResult.success) validFiles++;
      totalErrors += fileResult.errors?.length || 0;
      totalWarnings += fileResult.warnings?.length || 0;
    }
  });

  results.summary.totalFiles = totalFiles;
  results.summary.validFiles = validFiles;
  results.summary.totalErrors = totalErrors;
  results.summary.totalWarnings = totalWarnings;
}

/**
 * Generates a comprehensive validation report
 * @param {Object} validationResults - Results from validateAllDataFiles
 * @returns {string} - Formatted validation report
 */
export function generateComprehensiveReport(validationResults) {
  const { files, summary, timestamp } = validationResults;
  
  let report = '=== VibeScreen Data Validation Report ===\n';
  report += `Generated: ${timestamp}\n`;
  report += `Overall Status: ${validationResults.success ? 'PASS' : 'FAIL'}\n\n`;

  // Summary section
  report += 'SUMMARY:\n';
  report += `  Total files validated: ${summary.totalFiles}\n`;
  report += `  Valid files: ${summary.validFiles}\n`;
  report += `  Files with errors: ${summary.totalFiles - summary.validFiles}\n`;
  report += `  Total errors: ${summary.totalErrors}\n`;
  report += `  Total warnings: ${summary.totalWarnings}\n`;

  if (summary.criticalErrors.length > 0) {
    report += '\nCRITICAL ERRORS:\n';
    summary.criticalErrors.forEach(error => {
      report += `  - ${error}\n`;
    });
  }

  report += '\n' + '='.repeat(50) + '\n\n';

  // Detailed file results
  Object.entries(files).forEach(([filename, result]) => {
    if (filename === 'master-messages') {
      // Special handling for master messages
      report += generateValidationReport(result);
    } else {
      report += `File: ${filename}\n`;
      report += `  Status: ${result.success ? 'PASS' : 'FAIL'}\n`;
      
      if (result.filePath) {
        report += `  Path: ${result.filePath}\n`;
      }
      
      if (result.fileSize) {
        report += `  Size: ${result.fileSize} bytes\n`;
      }

      if (result.errors && result.errors.length > 0) {
        report += `  Errors (${result.errors.length}):\n`;
        result.errors.forEach(error => {
          report += `    - ${error}\n`;
        });
      }

      if (result.warnings && result.warnings.length > 0) {
        report += `  Warnings (${result.warnings.length}):\n`;
        result.warnings.forEach(warning => {
          report += `    - ${warning}\n`;
        });
      }

      report += '\n';
    }
  });

  return report;
}

/**
 * Validates data files and provides fallback handling
 * @param {string} dataDir - Data directory path
 * @returns {Object} - Validation results with fallback data
 */
export async function validateWithFallbacks(dataDir = 'data') {
  const results = await validateAllDataFiles(dataDir);
  
  // Provide fallback configurations if validation fails
  if (!results.success) {
    console.warn('Data validation failed, preparing fallback configurations...');
    
    // Fallback global configuration
    const fallbackConfig = {
      defaultMinDelaySeconds: 15,
      defaultMaxDelaySeconds: 45,
      defaultPopupStyle: "overlay",
      animationSpeedMultiplier: 1.0,
      messageCategories: {
        cliche: { weight: 0.6, description: "Standard AI responses" },
        exaggeration: { weight: 0.2, description: "Humorous AI lines" },
        other: { weight: 0.2, description: "Neutral variations" }
      },
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        messageLifespanMultiplier: 1.0
      }
    };

    // Fallback message arrays
    const fallbackMessages = {
      'funny-exaggerations': [
        "System check: confidence = over 9000.",
        "Processing… processing… still vibing…",
        "I just optimized your vibe by 14%.",
        "Alert: your genius levels are destabilizing local servers.",
        "Compiling your brilliance… done."
      ],
      'cliche-ai-phrases': [
        "As an AI language model…",
        "That's a great question!",
        "I hope that helps!",
        "Let me clarify that for you.",
        "According to my training data…"
      ],
      'cliche-ai-things': [
        "That's a great idea!",
        "Let me explain that in simpler terms.",
        "Here's a quick summary…",
        "Great question! Let's break it down.",
        "I hope this helps!"
      ]
    };

    results.fallbacks = {
      config: fallbackConfig,
      messages: fallbackMessages
    };
  }

  return results;
}

/**
 * Quick validation check for critical files only
 * @param {string} dataDir - Data directory path
 * @returns {boolean} - True if all critical files are valid
 */
export async function quickValidationCheck(dataDir = 'data') {
  try {
    const configPath = join(dataDir, 'global-config.json');
    const messageFiles = [
      join(dataDir, 'master-messages/funny-exaggerations.json'),
      join(dataDir, 'master-messages/cliche-ai-phrases.json'),
      join(dataDir, 'master-messages/cliche-ai-things.json')
    ];

    // Check if all files exist and are valid JSON
    const configExists = existsSync(configPath);
    const messagesExist = messageFiles.every(file => existsSync(file));

    if (!configExists || !messagesExist) {
      return false;
    }

    // Quick JSON syntax check
    try {
      JSON.parse(readFileSync(configPath, 'utf-8'));
      messageFiles.forEach(file => {
        JSON.parse(readFileSync(file, 'utf-8'));
      });
      return true;
    } catch (error) {
      return false;
    }

  } catch (error) {
    return false;
  }
}

/**
 * Validates data integrity on application startup
 * @param {string} dataDir - Data directory path
 * @returns {Promise<Object>} - Startup validation results
 */
export async function validateOnStartup(dataDir = 'data') {
  console.log('Performing startup data validation...');
  
  const startTime = Date.now();
  const isQuickValid = await quickValidationCheck(dataDir);
  
  if (isQuickValid) {
    console.log(`✓ Quick validation passed (${Date.now() - startTime}ms)`);
    return {
      success: true,
      quick: true,
      duration: Date.now() - startTime,
      message: 'All critical data files are valid'
    };
  }

  console.log('Quick validation failed, performing comprehensive check...');
  const fullResults = await validateWithFallbacks(dataDir);
  
  return {
    success: fullResults.success,
    quick: false,
    duration: Date.now() - startTime,
    results: fullResults,
    message: fullResults.success 
      ? 'Comprehensive validation passed'
      : 'Validation failed, fallbacks prepared'
  };
}