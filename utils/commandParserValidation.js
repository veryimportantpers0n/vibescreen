/**
 * CommandParser Validation Script
 * Tests the core functionality of the CommandParser component
 */

// Simple validation without imports for now
// import { CommandParser } from '../components/CommandParser.jsx';

// Test runner function
function runTests() {
  console.log('🧪 Running CommandParser Validation Tests...\n');
  
  const parser = new CommandParser();
  const mockContext = {
    onCharacterSwitch: (character) => console.log(`Mock: Switching to ${character}`),
    onMessageControl: (action) => console.log(`Mock: Message control ${action}`),
    currentCharacter: 'Corporate AI',
    messageStatus: 'Active'
  };

  let passed = 0;
  let failed = 0;

  // Test helper function
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

  // Command Validation Tests
  console.log('📋 Command Validation Tests:');
  
  test('Should reject commands without ! prefix', () => {
    const result = parser.validateCommand('help');
    return !result.valid && result.error.includes('Commands must start with !');
  });

  test('Should accept commands with ! prefix', () => {
    const result = parser.validateCommand('!help');
    return result.valid;
  });

  test('Should reject empty commands', () => {
    const result = parser.validateCommand('');
    return !result.valid && result.error.includes('Empty command');
  });

  // Command Parsing Tests
  console.log('\n🔍 Command Parsing Tests:');
  
  test('Should parse simple commands', () => {
    const result = parser.parseCommand('!help');
    return result.command === 'help' && result.args.length === 0;
  });

  test('Should parse commands with arguments', () => {
    const result = parser.parseCommand('!switch Corporate AI');
    return result.command === 'switch' && result.args.includes('Corporate') && result.args.includes('AI');
  });

  test('Should handle case insensitive commands', () => {
    const result = parser.parseCommand('!HELP');
    return result.command === 'help';
  });

  // Character Matching Tests
  console.log('\n👤 Character Matching Tests:');
  
  test('Should find exact character matches', () => {
    const result = parser.findCharacter('Corporate AI');
    return result.found && result.character === 'corporate-ai' && result.displayName === 'Corporate AI';
  });

  test('Should find partial character matches', () => {
    const result = parser.findCharacter('corp');
    return result.found && result.character === 'corporate-ai';
  });

  test('Should handle case insensitive matching', () => {
    const result = parser.findCharacter('zen monk');
    return result.found && result.character === 'zen-monk';
  });

  test('Should return error for unknown characters', () => {
    const result = parser.findCharacter('unknown');
    return !result.found && result.error.includes('not found');
  });

  // Command Execution Tests
  console.log('\n⚡ Command Execution Tests:');
  
  test('Should execute help command', () => {
    const result = parser.parseAndExecute('!help', mockContext);
    return result.success && result.message.includes('VibeScreen Terminal Commands') && result.action === 'display-help';
  });

  test('Should execute switch command', () => {
    const result = parser.parseAndExecute('!switch Zen Monk', mockContext);
    return result.success && result.message.includes('Switching to Zen Monk');
  });

  test('Should execute characters command', () => {
    const result = parser.parseAndExecute('!characters', mockContext);
    return result.success && result.message.includes('Available Characters') && result.message.includes('Corporate AI');
  });

  test('Should execute status command', () => {
    const result = parser.parseAndExecute('!status', mockContext);
    return result.success && result.message.includes('Current Status') && result.message.includes('Corporate AI');
  });

  test('Should execute pause command', () => {
    const result = parser.parseAndExecute('!pause', mockContext);
    return result.success && result.message.includes('paused');
  });

  test('Should execute resume command', () => {
    const result = parser.parseAndExecute('!resume', mockContext);
    return result.success && result.message.includes('resumed');
  });

  test('Should execute test command', () => {
    const result = parser.parseAndExecute('!test', mockContext);
    return result.success && result.message.includes('test message');
  });

  test('Should handle unknown commands', () => {
    const result = parser.parseAndExecute('!unknown', mockContext);
    return !result.success && result.message.includes('Unknown command');
  });

  test('Should handle switch command without arguments', () => {
    const result = parser.parseAndExecute('!switch', mockContext);
    return !result.success && result.message.includes('Character name required');
  });

  // Fuzzy Matching Tests
  console.log('\n🔍 Fuzzy Matching Tests:');
  
  test('Should suggest similar commands', () => {
    const suggestions = parser.findSimilarCommands('halp');
    return suggestions.includes('help');
  });

  test('Should suggest commands for partial matches', () => {
    const suggestions = parser.findSimilarCommands('sw');
    return suggestions.includes('switch');
  });

  test('Should limit suggestions', () => {
    const suggestions = parser.findSimilarCommands('a');
    return suggestions.length <= 3;
  });

  // Registry Tests
  console.log('\n📚 Command Registry Tests:');
  
  test('Should have all required commands registered', () => {
    const requiredCommands = ['help', 'switch', 'characters', 'status', 'pause', 'resume', 'test', 'clear', 'config', 'debug'];
    return requiredCommands.every(cmd => parser.commandRegistry[cmd]);
  });

  test('Should have proper command patterns', () => {
    return Object.values(parser.commandRegistry).every(cmd => cmd.pattern && cmd.description && cmd.handler);
  });

  test('Should have character name mappings', () => {
    const requiredCharacters = ['corporate-ai', 'zen-monk', 'chaos'];
    return requiredCharacters.every(char => 
      Object.values(parser.characterNameMap).includes(char) &&
      parser.characterDisplayNames[char]
    );
  });

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! CommandParser is working correctly.');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please review the implementation.`);
  }

  return failed === 0;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };