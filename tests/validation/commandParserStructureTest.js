/**
 * CommandParser Structure Validation
 * Validates the CommandParser component structure and exports
 */

import fs from 'fs';
import path from 'path';

function validateCommandParserStructure() {
  console.log('🔍 Validating CommandParser Structure...\n');
  
  const componentPath = 'components/CommandParser.jsx';
  let passed = 0;
  let failed = 0;

  function test(description, testFn) {
    try {
      const result = testFn();
      if (result) {
        console.log(`✅ ${description}`);
        passed++;
      } else {
        console.log(`❌ ${description}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${description} - Error: ${error.message}`);
      failed++;
    }
  }

  // Check if file exists
  test('CommandParser.jsx file exists', () => {
    return fs.existsSync(componentPath);
  });

  // Read and analyze file content
  let fileContent = '';
  try {
    fileContent = fs.readFileSync(componentPath, 'utf8');
  } catch (error) {
    console.log(`❌ Could not read ${componentPath}: ${error.message}`);
    return false;
  }

  // Structure tests
  console.log('📋 Component Structure Tests:');
  
  test('Has CommandParser class definition', () => {
    return fileContent.includes('class CommandParser');
  });

  test('Has React component export', () => {
    return fileContent.includes('export default') && fileContent.includes('CommandParserComponent');
  });

  test('Has CommandParser class export', () => {
    return fileContent.includes('export { CommandParser }');
  });

  test('Has character name mapping', () => {
    return fileContent.includes('characterNameMap') && fileContent.includes('corporate-ai');
  });

  test('Has command registry', () => {
    return fileContent.includes('commandRegistry') && fileContent.includes('help:') && fileContent.includes('switch:');
  });

  // Required methods tests
  console.log('\n⚙️ Required Methods Tests:');
  
  test('Has parseAndExecute method', () => {
    return fileContent.includes('parseAndExecute(');
  });

  test('Has validateCommand method', () => {
    return fileContent.includes('validateCommand(');
  });

  test('Has parseCommand method', () => {
    return fileContent.includes('parseCommand(');
  });

  test('Has findCharacter method', () => {
    return fileContent.includes('findCharacter(');
  });

  test('Has findSimilarCommands method', () => {
    return fileContent.includes('findSimilarCommands(');
  });

  // Command handler tests
  console.log('\n🎯 Command Handler Tests:');
  
  const requiredHandlers = ['handleHelp', 'handleSwitch', 'handleCharacters', 'handleStatus', 'handlePause', 'handleResume', 'handleTest', 'handleClear'];
  
  requiredHandlers.forEach(handler => {
    test(`Has ${handler} method`, () => {
      return fileContent.includes(`${handler}(`);
    });
  });

  // Required commands tests
  console.log('\n📝 Required Commands Tests:');
  
  const requiredCommands = ['help', 'switch', 'characters', 'status', 'pause', 'resume', 'test', 'clear', 'config', 'debug'];
  
  requiredCommands.forEach(command => {
    test(`Has ${command} command registered`, () => {
      return fileContent.includes(`${command}: {`) && fileContent.includes(`pattern:`);
    });
  });

  // Character mapping tests
  console.log('\n👤 Character Mapping Tests:');
  
  const requiredCharacters = ['corporate-ai', 'zen-monk', 'chaos'];
  
  requiredCharacters.forEach(character => {
    test(`Has ${character} character mapping`, () => {
      return fileContent.includes(`'${character}'`);
    });
  });

  // Pattern matching tests
  console.log('\n🔍 Pattern Matching Tests:');
  
  test('Has regex patterns for commands', () => {
    return fileContent.includes('/^!help$/i') && fileContent.includes('/^!switch\\s+(.+)$/i');
  });

  test('Has fuzzy matching implementation', () => {
    return fileContent.includes('levenshteinDistance') || fileContent.includes('findSimilarCommands');
  });

  test('Has error handling patterns', () => {
    return fileContent.includes('try {') && fileContent.includes('catch (error)');
  });

  // Integration tests
  console.log('\n🔗 Integration Tests:');
  
  test('Has context parameter handling', () => {
    return fileContent.includes('context') && fileContent.includes('onCharacterSwitch') && fileContent.includes('onMessageControl');
  });

  test('Has proper return value structure', () => {
    return fileContent.includes('success:') && fileContent.includes('message:') && fileContent.includes('action:');
  });

  test('Has React integration', () => {
    return fileContent.includes('React.') && fileContent.includes('useImperativeHandle');
  });

  // Summary
  console.log('\n📊 Validation Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 CommandParser structure validation passed!');
    console.log('✨ Component is properly structured with all required methods and commands.');
  } else {
    console.log(`\n⚠️  ${failed} validation(s) failed. Please review the implementation.`);
  }

  return failed === 0;
}

// Run validation
validateCommandParserStructure();