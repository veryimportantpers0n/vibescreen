/**
 * CSS Validation Test
 * 
 * This script checks for common CSS syntax errors in our accessibility
 * and animation files.
 */

import { readFileSync } from 'fs';

const validateCSS = (filePath) => {
  console.log(`🔍 Validating ${filePath}...`);
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const errors = [];
    
    let braceCount = 0;
    let inMediaQuery = false;
    let inRule = false;
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.endsWith('*/')) {
        return;
      }
      
      // Count braces
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      // Check for common syntax errors
      
      // 1. Missing semicolon (property without semicolon, not followed by closing brace)
      if (trimmed.includes(':') && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.includes('@')) {
        errors.push(`Line ${lineNum}: Missing semicolon - "${trimmed}"`);
      }
      
      // 2. Invalid properties
      const invalidProperties = ['speak', 'speak-as'];
      invalidProperties.forEach(prop => {
        if (trimmed.startsWith(`${prop}:`)) {
          errors.push(`Line ${lineNum}: Invalid CSS property "${prop}" - "${trimmed}"`);
        }
      });
      
      // 3. Empty rulesets (opening brace followed by closing brace with only comments)
      if (trimmed === '}' && braceCount >= 0) {
        const prevNonEmptyLine = lines.slice(0, index).reverse().find(l => l.trim() && !l.trim().startsWith('/*') && !l.trim().startsWith('*'));
        if (prevNonEmptyLine && (prevNonEmptyLine.trim() === '{' || prevNonEmptyLine.trim().endsWith('{'))) {
          errors.push(`Line ${lineNum}: Empty ruleset detected`);
        }
      }
      
      // 4. Unclosed braces
      if (braceCount < 0) {
        errors.push(`Line ${lineNum}: Unmatched closing brace`);
      }
    });
    
    // Final brace count check
    if (braceCount !== 0) {
      errors.push(`File: Unmatched braces (${braceCount > 0 ? 'missing closing' : 'extra closing'} braces)`);
    }
    
    if (errors.length === 0) {
      console.log('✅ No syntax errors found');
    } else {
      console.log(`❌ Found ${errors.length} syntax errors:`);
      errors.forEach(error => console.log(`  ${error}`));
    }
    
    return errors.length === 0;
    
  } catch (error) {
    console.log(`❌ Error reading file: ${error.message}`);
    return false;
  }
};

// Validate both CSS files
console.log('🚀 CSS Syntax Validation\n');
console.log('='.repeat(50));

const accessibilityValid = validateCSS('styles/accessibility.css');
console.log('');
const animationsValid = validateCSS('styles/animations.css');

console.log('\n' + '='.repeat(50));
console.log('🏁 Validation Complete!');

if (accessibilityValid && animationsValid) {
  console.log('✅ All CSS files are valid!');
  process.exit(0);
} else {
  console.log('❌ CSS validation failed. Please fix the errors above.');
  process.exit(1);
}

export { validateCSS };