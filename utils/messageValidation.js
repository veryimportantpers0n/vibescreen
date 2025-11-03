/**
 * Message validation utilities for VibeScreen
 * Validates message files, content quality, and data integrity
 */

import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Validates a message array for content quality and structure
 * @param {Array} messages - Array of message strings
 * @param {string} filePath - File path for error reporting
 * @returns {Object} - Validation result with success flag and issues
 */
export function validateMessageArray(messages, filePath = 'unknown') {
  const errors = [];
  const warnings = [];

  // Check if messages is an array
  if (!Array.isArray(messages)) {
    errors.push(`${filePath}: Messages must be an array, got ${typeof messages}`);
    return { success: false, errors, warnings };
  }

  // Check array length
  if (messages.length === 0) {
    errors.push(`${filePath}: Message array cannot be empty`);
  } else if (messages.length < 5) {
    warnings.push(`${filePath}: Message array has only ${messages.length} items, recommend at least 5`);
  }

  // Validate each message
  messages.forEach((message, index) => {
    const messageErrors = validateSingleMessage(message, index, filePath);
    errors.push(...messageErrors.errors);
    warnings.push(...messageErrors.warnings);
  });

  // Check for duplicate messages
  const duplicates = findDuplicateMessages(messages);
  if (duplicates.length > 0) {
    warnings.push(`${filePath}: Found ${duplicates.length} duplicate messages`);
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    messageCount: messages.length,
    duplicateCount: duplicates.length
  };
}

/**
 * Validates a single message string
 * @param {*} message - Message to validate
 * @param {number} index - Message index for error reporting
 * @param {string} filePath - File path for error reporting
 * @returns {Object} - Validation result
 */
function validateSingleMessage(message, index, filePath) {
  const errors = [];
  const warnings = [];

  // Check if message is a string
  if (typeof message !== 'string') {
    errors.push(`${filePath}[${index}]: Message must be a string, got ${typeof message}`);
    return { errors, warnings };
  }

  // Check message length
  if (message.length === 0) {
    errors.push(`${filePath}[${index}]: Message cannot be empty`);
  } else if (message.length < 3) {
    warnings.push(`${filePath}[${index}]: Message is very short (${message.length} chars): "${message}"`);
  } else if (message.length > 200) {
    warnings.push(`${filePath}[${index}]: Message is very long (${message.length} chars), may not display well`);
  }

  // Check for inappropriate content patterns
  const inappropriatePatterns = [
    /\b(fuck|shit|damn|hell|ass)\b/i,
    /\b(hate|kill|die|death)\b/i,
    /<script|javascript:|onclick/i,
    /\b(password|credit card|ssn)\b/i
  ];

  inappropriatePatterns.forEach(pattern => {
    if (pattern.test(message)) {
      warnings.push(`${filePath}[${index}]: Message may contain inappropriate content: "${message}"`);
    }
  });

  // Check for proper sentence structure
  if (!/^[A-Z]/.test(message.trim())) {
    warnings.push(`${filePath}[${index}]: Message should start with capital letter: "${message}"`);
  }

  // Check for balanced quotes and parentheses
  const quoteCount = (message.match(/"/g) || []).length;
  const parenCount = (message.match(/\(/g) || []).length - (message.match(/\)/g) || []).length;
  
  if (quoteCount % 2 !== 0) {
    warnings.push(`${filePath}[${index}]: Unbalanced quotes in message: "${message}"`);
  }
  
  if (parenCount !== 0) {
    warnings.push(`${filePath}[${index}]: Unbalanced parentheses in message: "${message}"`);
  }

  return { errors, warnings };
}

/**
 * Finds duplicate messages in an array
 * @param {Array} messages - Array of message strings
 * @returns {Array} - Array of duplicate message objects
 */
function findDuplicateMessages(messages) {
  const seen = new Map();
  const duplicates = [];

  messages.forEach((message, index) => {
    const normalized = message.toLowerCase().trim();
    if (seen.has(normalized)) {
      duplicates.push({
        message,
        indices: [seen.get(normalized), index]
      });
    } else {
      seen.set(normalized, index);
    }
  });

  return duplicates;
}

/**
 * Validates JSON file syntax and loads content
 * @param {string} filePath - Path to JSON file
 * @returns {Object} - Validation result with parsed content
 */
export function validateJSONFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    
    // Check for common JSON syntax issues
    const syntaxIssues = checkJSONSyntax(content, filePath);
    if (syntaxIssues.length > 0) {
      return {
        success: false,
        errors: syntaxIssues,
        warnings: [],
        content: null
      };
    }

    // Parse JSON
    const parsed = JSON.parse(content);
    
    return {
      success: true,
      errors: [],
      warnings: [],
      content: parsed,
      fileSize: content.length
    };

  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        success: false,
        errors: [`File not found: ${filePath}`],
        warnings: [],
        content: null
      };
    }

    if (error instanceof SyntaxError) {
      return {
        success: false,
        errors: [`JSON syntax error in ${filePath}: ${error.message}`],
        warnings: [],
        content: null
      };
    }

    return {
      success: false,
      errors: [`Failed to read ${filePath}: ${error.message}`],
      warnings: [],
      content: null
    };
  }
}

/**
 * Checks for common JSON syntax issues before parsing
 * @param {string} content - JSON content string
 * @param {string} filePath - File path for error reporting
 * @returns {Array} - Array of syntax issue descriptions
 */
function checkJSONSyntax(content, filePath) {
  const issues = [];

  // Check for empty file
  if (!content.trim()) {
    issues.push(`${filePath}: File is empty`);
    return issues;
  }

  // Check for BOM (Byte Order Mark)
  if (content.charCodeAt(0) === 0xFEFF) {
    issues.push(`${filePath}: File contains BOM, may cause parsing issues`);
  }

  // Check for trailing commas (common JSON error)
  if (/,\s*[}\]]/.test(content)) {
    issues.push(`${filePath}: Contains trailing commas, which are not valid in JSON`);
  }

  // Check for single quotes (should be double quotes)
  if (/'[^']*'/.test(content)) {
    issues.push(`${filePath}: Contains single quotes, JSON requires double quotes`);
  }

  // Check for unescaped control characters
  if (/[\x00-\x1F]/.test(content)) {
    issues.push(`${filePath}: Contains unescaped control characters`);
  }

  return issues;
}

/**
 * Validates all master message files
 * @param {string} baseDir - Base directory containing message files
 * @returns {Object} - Comprehensive validation results
 */
export function validateAllMessageFiles(baseDir = 'data/master-messages') {
  const messageFiles = [
    'funny-exaggerations.json',
    'cliche-ai-phrases.json',
    'cliche-ai-things.json'
  ];

  const results = {
    success: true,
    files: {},
    summary: {
      totalFiles: messageFiles.length,
      validFiles: 0,
      totalMessages: 0,
      totalErrors: 0,
      totalWarnings: 0
    }
  };

  messageFiles.forEach(filename => {
    const filePath = join(baseDir, filename);
    
    // Validate JSON syntax and load content
    const jsonResult = validateJSONFile(filePath);
    
    if (jsonResult.success) {
      // Validate message content
      const messageResult = validateMessageArray(jsonResult.content, filePath);
      
      results.files[filename] = {
        ...jsonResult,
        ...messageResult,
        filePath
      };

      if (messageResult.success) {
        results.summary.validFiles++;
      } else {
        results.success = false;
      }

      results.summary.totalMessages += messageResult.messageCount || 0;
      results.summary.totalErrors += messageResult.errors.length;
      results.summary.totalWarnings += messageResult.warnings.length;

    } else {
      results.files[filename] = {
        ...jsonResult,
        filePath
      };
      results.success = false;
      results.summary.totalErrors += jsonResult.errors.length;
    }
  });

  return results;
}

/**
 * Generates a detailed validation report
 * @param {Object} validationResults - Results from validateAllMessageFiles
 * @returns {string} - Formatted validation report
 */
export function generateValidationReport(validationResults) {
  const { files, summary } = validationResults;
  
  let report = '=== VibeScreen Message Validation Report ===\n\n';
  
  // Summary
  report += `Summary:\n`;
  report += `  Total files: ${summary.totalFiles}\n`;
  report += `  Valid files: ${summary.validFiles}\n`;
  report += `  Total messages: ${summary.totalMessages}\n`;
  report += `  Total errors: ${summary.totalErrors}\n`;
  report += `  Total warnings: ${summary.totalWarnings}\n`;
  report += `  Overall status: ${validationResults.success ? 'PASS' : 'FAIL'}\n\n`;

  // File details
  Object.entries(files).forEach(([filename, result]) => {
    report += `File: ${filename}\n`;
    report += `  Path: ${result.filePath}\n`;
    report += `  Status: ${result.success ? 'PASS' : 'FAIL'}\n`;
    
    if (result.messageCount !== undefined) {
      report += `  Messages: ${result.messageCount}\n`;
    }
    
    if (result.fileSize !== undefined) {
      report += `  Size: ${result.fileSize} bytes\n`;
    }

    if (result.errors && result.errors.length > 0) {
      report += `  Errors:\n`;
      result.errors.forEach(error => {
        report += `    - ${error}\n`;
      });
    }

    if (result.warnings && result.warnings.length > 0) {
      report += `  Warnings:\n`;
      result.warnings.forEach(warning => {
        report += `    - ${warning}\n`;
      });
    }

    report += '\n';
  });

  return report;
}

/**
 * Validates message file and provides fallback content if needed
 * @param {string} filePath - Path to message file
 * @param {Array} fallbackMessages - Fallback messages to use if file is invalid
 * @returns {Object} - Validation result with content or fallback
 */
export function validateWithFallback(filePath, fallbackMessages = []) {
  const result = validateJSONFile(filePath);
  
  if (!result.success) {
    console.warn(`Message file validation failed: ${filePath}`);
    console.warn('Using fallback messages');
    
    return {
      success: true,
      usingFallback: true,
      errors: result.errors,
      warnings: result.warnings,
      content: fallbackMessages,
      originalError: result.errors[0] || 'Unknown error'
    };
  }

  const messageValidation = validateMessageArray(result.content, filePath);
  
  if (!messageValidation.success) {
    console.warn(`Message content validation failed: ${filePath}`);
    console.warn('Using fallback messages');
    
    return {
      success: true,
      usingFallback: true,
      errors: messageValidation.errors,
      warnings: messageValidation.warnings,
      content: fallbackMessages,
      originalError: messageValidation.errors[0] || 'Content validation failed'
    };
  }

  return {
    success: true,
    usingFallback: false,
    errors: [],
    warnings: messageValidation.warnings,
    content: result.content
  };
}