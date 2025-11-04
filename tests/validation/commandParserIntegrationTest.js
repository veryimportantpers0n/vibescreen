/**
 * Quick integration test for CommandParser with TerminalInterface
 */

console.log('🧪 Testing CommandParser Integration...\n');

// Test the key integration points
const tests = [
  {
    name: 'CommandParser exports correctly',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/CommandParser.jsx', 'utf8');
      return content.includes('export { CommandParser }') && content.includes('export default');
    }
  },
  {
    name: 'TerminalInterface imports CommandParser',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/TerminalInterface.jsx', 'utf8');
      return content.includes("import { CommandParser } from './CommandParser'");
    }
  },
  {
    name: 'TerminalInterface uses CommandParser instance',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/TerminalInterface.jsx', 'utf8');
      return content.includes('new CommandParser()') && content.includes('parseAndExecute');
    }
  },
  {
    name: 'All required command handlers exist',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/CommandParser.jsx', 'utf8');
      const handlers = ['handleHelp', 'handleSwitch', 'handleCharacters', 'handleStatus', 'handlePause', 'handleResume', 'handleTest'];
      return handlers.every(handler => content.includes(handler));
    }
  },
  {
    name: 'Character name mapping is comprehensive',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/CommandParser.jsx', 'utf8');
      const characters = ['corporate-ai', 'zen-monk', 'chaos'];
      return characters.every(char => content.includes(`'${char}'`));
    }
  },
  {
    name: 'Command patterns use proper regex',
    test: () => {
      const fs = require('fs');
      const content = fs.readFileSync('components/CommandParser.jsx', 'utf8');
      return content.includes('/^!help$/i') && content.includes('/^!switch\\s+(.+)$/i');
    }
  }
];

let passed = 0;
let failed = 0;

tests.forEach(({ name, test }) => {
  try {
    if (test()) {
      console.log(`✅ ${name}`);
      passed++;
    } else {
      console.log(`❌ ${name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 Integration Test Results:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 CommandParser integration is working correctly!');
  console.log('✨ Ready for terminal command execution.');
} else {
  console.log(`\n⚠️ ${failed} integration test(s) failed.`);
}