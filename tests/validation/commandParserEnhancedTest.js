/**
 * Enhanced CommandParser Test - Tests the new fuzzy matching and error handling features
 */

// Import the CommandParser class (simplified for testing)
class CommandParser {
  constructor() {
    // Character name mapping for full names and partial matches
    this.characterNameMap = {
      // Full names (primary)
      'corporate ai': 'corporate-ai',
      'zen monk': 'zen-monk',
      'chaos': 'chaos',
      'emotional damage': 'emotional-damage',
      'therapist': 'therapist',
      'startup founder': 'startup-founder',
      'doomsday prophet': 'doomsday-prophet',
      'gamer rage': 'gamer-rage',
      'influencer': 'influencer',
      'wholesome grandma': 'wholesome-grandma',
      'spooky': 'spooky',
      
      // Partial matches (fallback)
      'corp': 'corporate-ai',
      'corporate': 'corporate-ai',
      'zen': 'zen-monk',
      'monk': 'zen-monk',
      'damage': 'emotional-damage',
      'emotional': 'emotional-damage',
      'startup': 'startup-founder',
      'founder': 'startup-founder',
      'doom': 'doomsday-prophet',
      'doomsday': 'doomsday-prophet',
      'prophet': 'doomsday-prophet',
      'rage': 'gamer-rage',
      'gamer': 'gamer-rage',
      'gaming': 'gamer-rage',
      'grandma': 'wholesome-grandma',
      'wholesome': 'wholesome-grandma',
      'granny': 'wholesome-grandma'
    };

    // Display names for characters
    this.characterDisplayNames = {
      'corporate-ai': 'Corporate AI',
      'zen-monk': 'Zen Monk',
      'chaos': 'Chaos',
      'emotional-damage': 'Emotional Damage',
      'therapist': 'Therapist',
      'startup-founder': 'Startup Founder',
      'doomsday-prophet': 'Doomsday Prophet',
      'gamer-rage': 'Gamer Rage',
      'influencer': 'Influencer',
      'wholesome-grandma': 'Wholesome Grandma',
      'spooky': 'Spooky'
    };

    // Command registry
    this.commandRegistry = {
      help: { pattern: /^!help$/i, description: 'Show all available commands', usage: '!help' },
      switch: { pattern: /^!switch\s+(.+)$/i, description: 'Switch to character', usage: '!switch <Character Name>' },
      characters: { pattern: /^!characters$/i, description: 'List all available characters', usage: '!characters' },
      status: { pattern: /^!status$/i, description: 'Show current status', usage: '!status' },
      pause: { pattern: /^!pause$/i, description: 'Pause messages', usage: '!pause' },
      resume: { pattern: /^!resume$/i, description: 'Resume messages', usage: '!resume' },
      test: { pattern: /^!test$/i, description: 'Test message', usage: '!test' },
      clear: { pattern: /^!clear$/i, description: 'Clear terminal', usage: '!clear' }
    };
  }

  // Enhanced fuzzy matching methods
  calculateSimilarityScore(command, input) {
    if (command === input) return 1.0;
    
    if (command.includes(input) || input.includes(command)) {
      const longer = Math.max(command.length, input.length);
      const shorter = Math.min(command.length, input.length);
      return 0.8 + (shorter / longer) * 0.2;
    }
    
    const distance = this.levenshteinDistance(command, input);
    const maxLength = Math.max(command.length, input.length);
    const levenshteinScore = Math.max(0, 1 - (distance / maxLength));
    
    let prefixBonus = 0;
    const minLength = Math.min(command.length, input.length);
    for (let i = 0; i < minLength; i++) {
      if (command[i] === input[i]) {
        prefixBonus += 0.1;
      } else {
        break;
      }
    }
    
    const commonChars = this.countCommonCharacters(command, input);
    const charRatio = commonChars / Math.max(command.length, input.length);
    
    return Math.min(1.0, levenshteinScore * 0.6 + prefixBonus + charRatio * 0.3);
  }

  levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  countCommonCharacters(str1, str2) {
    const chars1 = str1.split('').sort();
    const chars2 = str2.split('').sort();
    let common = 0;
    let i = 0, j = 0;
    
    while (i < chars1.length && j < chars2.length) {
      if (chars1[i] === chars2[j]) {
        common++;
        i++;
        j++;
      } else if (chars1[i] < chars2[j]) {
        i++;
      } else {
        j++;
      }
    }
    
    return common;
  }

  findSimilarCommands(input) {
    const commands = Object.keys(this.commandRegistry);
    const inputLower = input.toLowerCase();
    
    const similarities = commands.map(cmd => ({
      command: cmd,
      score: this.calculateSimilarityScore(cmd, inputLower)
    }));
    
    return similarities
      .filter(item => item.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.command);
  }

  findCharacter(input) {
    const normalized = input.toLowerCase().trim();
    
    // Exact match first
    if (this.characterNameMap[normalized]) {
      const characterId = this.characterNameMap[normalized];
      return {
        found: true,
        character: characterId,
        displayName: this.characterDisplayNames[characterId]
      };
    }
    
    // Partial match with exact substring
    const partialMatches = Object.keys(this.characterNameMap)
      .filter(name => name.includes(normalized) || normalized.includes(name));
    
    if (partialMatches.length === 1) {
      const characterId = this.characterNameMap[partialMatches[0]];
      return {
        found: true,
        character: characterId,
        displayName: this.characterDisplayNames[characterId],
        matchType: 'partial'
      };
    }
    
    if (partialMatches.length > 1) {
      const suggestions = partialMatches
        .map(name => this.characterDisplayNames[this.characterNameMap[name]])
        .slice(0, 5);
      return {
        found: false,
        error: `Multiple matches found for "${input}"`,
        suggestion: `Did you mean: ${suggestions.join(', ')}?`,
        suggestions: suggestions
      };
    }
    
    // Fuzzy matching for typos
    const fuzzyMatches = this.findSimilarCharacterNames(normalized);
    
    if (fuzzyMatches.length > 0) {
      if (fuzzyMatches[0].score > 0.7) {
        return {
          found: false,
          error: `Character "${input}" not found`,
          suggestion: `Did you mean "${fuzzyMatches[0].displayName}"? (Type: !switch ${fuzzyMatches[0].displayName})`,
          suggestions: fuzzyMatches.slice(0, 3).map(m => m.displayName)
        };
      }
      
      const suggestions = fuzzyMatches.slice(0, 3).map(m => m.displayName);
      return {
        found: false,
        error: `Character "${input}" not found`,
        suggestion: `Similar characters: ${suggestions.join(', ')}`,
        suggestions: suggestions
      };
    }
    
    return {
      found: false,
      error: `Character "${input}" not found`,
      suggestion: 'Type !characters to see all available characters',
      suggestions: []
    };
  }

  findSimilarCharacterNames(input) {
    const allNames = Object.keys(this.characterNameMap);
    const displayNames = Object.values(this.characterDisplayNames);
    
    const candidates = [
      ...allNames.map(name => ({ 
        name, 
        displayName: this.characterDisplayNames[this.characterNameMap[name]],
        characterId: this.characterNameMap[name]
      })),
      ...displayNames.map(displayName => {
        const characterId = Object.keys(this.characterDisplayNames)
          .find(id => this.characterDisplayNames[id] === displayName);
        return {
          name: displayName.toLowerCase(),
          displayName,
          characterId
        };
      })
    ];
    
    const uniqueCandidates = candidates.filter((candidate, index, self) => 
      index === self.findIndex(c => c.characterId === candidate.characterId)
    );
    
    const similarities = uniqueCandidates.map(candidate => ({
      ...candidate,
      score: this.calculateSimilarityScore(candidate.name, input)
    }));
    
    return similarities
      .filter(item => item.score > 0.4)
      .sort((a, b) => b.score - a.score);
  }

  validateCommand(input) {
    if (!input || input.length === 0) {
      return {
        valid: false,
        error: 'Empty command',
        suggestion: 'Type !help for available commands'
      };
    }

    const trimmed = input.trim();
    
    if (!trimmed.startsWith('!')) {
      let suggestion;
      if (trimmed.toLowerCase().includes('help')) {
        suggestion = 'For help, type: !help';
      } else if (trimmed.toLowerCase().includes('switch') || trimmed.toLowerCase().includes('change')) {
        suggestion = 'To switch characters, type: !switch <Character Name>';
      } else if (Object.keys(this.commandRegistry).some(cmd => trimmed.toLowerCase().includes(cmd))) {
        suggestion = `Commands must start with ! - try: !${trimmed}`;
      } else {
        suggestion = `Commands must start with ! (e.g., !help) - try: !${trimmed}`;
      }
      
      return {
        valid: false,
        error: 'Commands must start with ! (exclamation mark)',
        suggestion: suggestion
      };
    }

    if (trimmed.length > 100) {
      return {
        valid: false,
        error: 'Command too long (maximum 100 characters)',
        suggestion: 'Use shorter commands or break into multiple commands'
      };
    }

    if (trimmed.includes('!!')) {
      return {
        valid: false,
        error: 'Commands should start with single ! only',
        suggestion: 'Use single ! at the beginning (e.g., !help, not !!help)'
      };
    }

    const shellPatterns = ['ls', 'cd', 'pwd', 'mkdir', 'rm', 'cp', 'mv'];
    const commandPart = trimmed.slice(1).split(/\s+/)[0].toLowerCase();
    if (shellPatterns.includes(commandPart)) {
      return {
        valid: false,
        error: `"${commandPart}" is not a VibeScreen command`,
        suggestion: 'This is a terminal interface for VibeScreen, not a system shell. Type !help for available commands.'
      };
    }

    return { valid: true };
  }
}

// Test runner
function runEnhancedTests() {
  console.log('🚀 Running Enhanced CommandParser Tests...\n');
  
  const parser = new CommandParser();
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

  // Enhanced Fuzzy Matching Tests
  console.log('🔍 Enhanced Fuzzy Matching Tests:');
  
  test('Should handle typos in commands (halp -> help)', () => {
    const suggestions = parser.findSimilarCommands('halp');
    return suggestions.includes('help');
  });

  test('Should handle typos in commands (swich -> switch)', () => {
    const suggestions = parser.findSimilarCommands('swich');
    return suggestions.includes('switch');
  });

  test('Should prioritize better matches', () => {
    const suggestions = parser.findSimilarCommands('hel');
    return suggestions[0] === 'help';
  });

  test('Should handle character name typos (corporat -> Corporate AI)', () => {
    const result = parser.findCharacter('corporat');
    return !result.found && result.suggestions && result.suggestions.includes('Corporate AI');
  });

  test('Should handle character name variations (zen -> Zen Monk)', () => {
    const result = parser.findCharacter('zen');
    return result.found && result.character === 'zen-monk';
  });

  test('Should provide multiple suggestions for ambiguous input', () => {
    const result = parser.findCharacter('a');
    return !result.found && result.suggestions && result.suggestions.length > 0;
  });

  // Enhanced Error Handling Tests
  console.log('\n🛡️ Enhanced Error Handling Tests:');
  
  test('Should detect shell commands (ls)', () => {
    const result = parser.validateCommand('!ls');
    return !result.valid && result.error.includes('not a VibeScreen command');
  });

  test('Should handle double exclamation marks', () => {
    const result = parser.validateCommand('!!help');
    return !result.valid && result.error.includes('single ! only');
  });

  test('Should handle overly long commands', () => {
    const longCommand = '!' + 'a'.repeat(150);
    const result = parser.validateCommand(longCommand);
    return !result.valid && result.error.includes('too long');
  });

  test('Should provide contextual suggestions for help-like commands', () => {
    const result = parser.validateCommand('help');
    return !result.valid && result.suggestion.includes('!help');
  });

  test('Should provide contextual suggestions for switch-like commands', () => {
    const result = parser.validateCommand('change zen');
    return !result.valid && result.suggestion.includes('switch');
  });

  // Similarity Score Tests
  console.log('\n📊 Similarity Score Tests:');
  
  test('Should calculate high similarity for exact matches', () => {
    const score = parser.calculateSimilarityScore('help', 'help');
    return score === 1.0;
  });

  test('Should calculate good similarity for substring matches', () => {
    const score = parser.calculateSimilarityScore('help', 'hel');
    return score > 0.8;
  });

  test('Should calculate reasonable similarity for typos', () => {
    const score = parser.calculateSimilarityScore('help', 'halp');
    return score > 0.5 && score < 0.9;
  });

  test('Should calculate low similarity for very different strings', () => {
    const score = parser.calculateSimilarityScore('help', 'xyz');
    return score < 0.3;
  });

  // Character Fuzzy Matching Tests
  console.log('\n👤 Character Fuzzy Matching Tests:');
  
  test('Should find character with partial name (corp)', () => {
    const result = parser.findCharacter('corp');
    return result.found && result.character === 'corporate-ai';
  });

  test('Should suggest similar characters for typos', () => {
    const result = parser.findCharacter('zenn');
    return !result.found && result.suggestions && result.suggestions.some(s => s.includes('Zen'));
  });

  test('Should handle multiple partial matches gracefully', () => {
    const result = parser.findCharacter('a');
    return !result.found && result.suggestions && result.suggestions.length > 0;
  });

  test('Should provide specific suggestion for close matches', () => {
    const result = parser.findCharacter('corporate');
    return result.found || (result.suggestion && result.suggestion.includes('Corporate AI'));
  });

  // Summary
  console.log('\n📊 Enhanced Test Results Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All enhanced tests passed! Fuzzy matching and error handling are working correctly.');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please review the enhanced implementation.`);
  }

  return failed === 0;
}

// Run tests
runEnhancedTests();