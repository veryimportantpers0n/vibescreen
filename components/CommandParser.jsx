import React from 'react';

/**
 * CommandParser - Comprehensive terminal command interpreter for VibeScreen
 * Handles command parsing, validation, and execution with fuzzy matching and error handling
 */
class CommandParser {
  constructor() {
    // Character name mapping for the three implemented modes
    this.characterNameMap = {
      // Full names (primary)
      'corporate ai': 'corporate-ai',
      'zen monk': 'zen-monk',
      'chaos': 'chaos',
      
      // Partial matches (fallback)
      'corp': 'corporate-ai',
      'corporate': 'corporate-ai',
      'ai': 'corporate-ai',
      'zen': 'zen-monk',
      'monk': 'zen-monk'
    };

    // Display names for the three implemented characters
    this.characterDisplayNames = {
      'corporate-ai': 'Corporate AI',
      'zen-monk': 'Zen Monk',
      'chaos': 'Chaos'
    };

    // Command registry with patterns and handlers
    this.commandRegistry = {
      help: {
        pattern: /^!help$/i,
        description: 'Show all available commands',
        usage: '!help',
        handler: this.handleHelp.bind(this)
      },
      switch: {
        pattern: /^!switch\s+(.+)$/i,
        description: 'Switch to character (e.g., !switch Corporate AI)',
        usage: '!switch <Character Name>',
        handler: this.handleSwitch.bind(this)
      },
      characters: {
        pattern: /^!characters$/i,
        description: 'List all available characters',
        usage: '!characters',
        handler: this.handleCharacters.bind(this)
      },
      status: {
        pattern: /^!status$/i,
        description: 'Show current character and system status',
        usage: '!status',
        handler: this.handleStatus.bind(this)
      },
      pause: {
        pattern: /^!pause$/i,
        description: 'Pause automatic message rotation',
        usage: '!pause',
        handler: this.handlePause.bind(this)
      },
      resume: {
        pattern: /^!resume$/i,
        description: 'Resume automatic message rotation',
        usage: '!resume',
        handler: this.handleResume.bind(this)
      },
      test: {
        pattern: /^!test$/i,
        description: 'Show test message from current character',
        usage: '!test',
        handler: this.handleTest.bind(this)
      },
      clear: {
        pattern: /^!clear$/i,
        description: 'Clear terminal command history',
        usage: '!clear',
        handler: this.handleClear.bind(this)
      },
      config: {
        pattern: /^!config$/i,
        description: 'Display current configuration settings',
        usage: '!config',
        handler: this.handleConfig.bind(this)
      },
      debug: {
        pattern: /^!debug$/i,
        description: 'Show debug information and system status',
        usage: '!debug',
        handler: this.handleDebug.bind(this)
      }
    };
  }

  /**
   * Parse and execute a command input
   * @param {string} input - Raw command input from terminal
   * @param {Object} context - Execution context with callbacks and state
   * @returns {Object} Command result with success status and message
   */
  parseAndExecute(input, context = {}) {
    const trimmed = input.trim();
    
    // Validate command format
    const validation = this.validateCommand(trimmed);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error,
        suggestion: validation.suggestion
      };
    }

    // Parse command and arguments
    const parsed = this.parseCommand(trimmed);
    if (!parsed) {
      return {
        success: false,
        message: 'Failed to parse command',
        suggestion: 'Type !help for available commands'
      };
    }

    // Validate command parameters
    const paramValidation = this.validateCommandParameters(parsed.command, parsed.args);
    if (!paramValidation.valid) {
      return {
        success: false,
        message: paramValidation.error,
        suggestion: paramValidation.suggestion
      };
    }

    // Find and execute command handler
    const commandInfo = this.commandRegistry[parsed.command];
    if (!commandInfo) {
      const suggestions = this.findSimilarCommands(parsed.command);
      
      // Provide more helpful error messages based on input patterns
      let errorMessage = `Unknown command "${parsed.command}"`;
      let suggestionText;
      
      if (suggestions.length > 0) {
        if (suggestions.length === 1) {
          suggestionText = `Did you mean "!${suggestions[0]}"? (Type exactly as shown)`;
        } else {
          suggestionText = `Did you mean one of these: ${suggestions.map(s => `!${s}`).join(', ')}?`;
        }
      } else {
        // Check if it looks like a common typo pattern
        if (parsed.command.length <= 2) {
          suggestionText = 'Command too short. Type !help to see all available commands';
        } else if (parsed.command.includes('switch') || parsed.command.includes('change')) {
          suggestionText = 'To switch characters, use: !switch <Character Name> (e.g., !switch Zen Monk)';
        } else if (parsed.command.includes('help') || parsed.command.includes('?')) {
          suggestionText = 'For help, type: !help';
        } else {
          suggestionText = 'Type !help for all available commands, or !characters to see character options';
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        suggestion: suggestionText,
        availableCommands: Object.keys(this.commandRegistry)
      };
    }

    // Execute command handler
    try {
      const result = commandInfo.handler(parsed.args, context);
      
      // Ensure result has proper structure
      if (!result || typeof result !== 'object') {
        return {
          success: false,
          message: 'Command handler returned invalid result',
          suggestion: 'Please try again or contact support if the problem persists'
        };
      }
      
      return result;
    } catch (error) {
      // Provide specific error handling based on error type
      let errorMessage = 'Error executing command';
      let suggestion = 'Please try again or type !help for usage';
      
      if (error.name === 'TypeError') {
        errorMessage = 'Command execution failed due to invalid parameters';
        suggestion = `Check your command syntax. Usage: ${commandInfo.usage || `!${parsed.command}`}`;
      } else if (error.name === 'ReferenceError') {
        errorMessage = 'Command execution failed due to missing dependencies';
        suggestion = 'This may be a system issue. Please try again or contact support.';
      } else if (error.message.includes('callback') || error.message.includes('function')) {
        errorMessage = 'Command execution failed - feature not available';
        suggestion = 'This command may not be fully implemented yet. Try other commands.';
      }
      
      return {
        success: false,
        message: `${errorMessage}: ${error.message}`,
        suggestion: suggestion,
        errorType: error.name
      };
    }
  }

  /**
   * Validate command format and structure with enhanced error detection
   * @param {string} input - Command input to validate
   * @returns {Object} Validation result with success status and error details
   */
  validateCommand(input) {
    if (!input || input.length === 0) {
      return {
        valid: false,
        error: 'Empty command',
        suggestion: 'Type !help for available commands'
      };
    }

    // Trim whitespace for validation
    const trimmed = input.trim();
    
    // Check if command starts with !
    if (!trimmed.startsWith('!')) {
      // Provide specific suggestions based on input patterns
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

    // Check for command length limits
    if (trimmed.length > 100) {
      return {
        valid: false,
        error: 'Command too long (maximum 100 characters)',
        suggestion: 'Use shorter commands or break into multiple commands'
      };
    }

    // Check for suspicious patterns that might indicate user confusion
    if (trimmed.includes('!!')) {
      return {
        valid: false,
        error: 'Commands should start with single ! only',
        suggestion: 'Use single ! at the beginning (e.g., !help, not !!help)'
      };
    }

    // Check for common shell command patterns that don't belong here
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

  /**
   * Validate command parameters based on command requirements
   * @param {string} command - Command name
   * @param {Array} args - Command arguments
   * @returns {Object} Parameter validation result
   */
  validateCommandParameters(command, args) {
    const commandInfo = this.commandRegistry[command];
    if (!commandInfo) {
      return { valid: false, error: 'Unknown command' };
    }

    // Define parameter requirements for each command
    const parameterRequirements = {
      help: { minArgs: 0, maxArgs: 0 },
      characters: { minArgs: 0, maxArgs: 0 },
      status: { minArgs: 0, maxArgs: 0 },
      pause: { minArgs: 0, maxArgs: 0 },
      resume: { minArgs: 0, maxArgs: 0 },
      test: { minArgs: 0, maxArgs: 0 },
      clear: { minArgs: 0, maxArgs: 0 },
      config: { minArgs: 0, maxArgs: 0 },
      debug: { minArgs: 0, maxArgs: 0 },
      switch: { minArgs: 1, maxArgs: 10, description: 'character name' }
    };

    const requirements = parameterRequirements[command];
    if (!requirements) {
      return { valid: true }; // No specific requirements defined
    }

    // Check minimum arguments
    if (args.length < requirements.minArgs) {
      const description = requirements.description || 'parameters';
      return {
        valid: false,
        error: `Command !${command} requires ${requirements.minArgs} ${description}`,
        suggestion: `Usage: ${commandInfo.usage || `!${command} <${description}>`}`
      };
    }

    // Check maximum arguments
    if (args.length > requirements.maxArgs) {
      return {
        valid: false,
        error: `Command !${command} accepts maximum ${requirements.maxArgs} parameters`,
        suggestion: `Usage: ${commandInfo.usage || `!${command}`}`
      };
    }

    return { valid: true };
  }

  /**
   * Parse command into command name and arguments
   * @param {string} input - Valid command input
   * @returns {Object} Parsed command with name and arguments
   */
  parseCommand(input) {
    const withoutPrefix = input.slice(1); // Remove !
    const parts = withoutPrefix.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    return {
      command,
      args,
      raw: input
    };
  }

  /**
   * Find similar commands for suggestions with enhanced fuzzy matching
   * @param {string} input - Invalid command to find matches for
   * @returns {Array} Array of similar command names with confidence scores
   */
  findSimilarCommands(input) {
    const commands = Object.keys(this.commandRegistry);
    const inputLower = input.toLowerCase();
    
    // Calculate similarity scores for all commands
    const similarities = commands.map(cmd => ({
      command: cmd,
      score: this.calculateSimilarityScore(cmd, inputLower)
    }));
    
    // Sort by similarity score (higher is better) and filter out low scores
    return similarities
      .filter(item => item.score > 0.3) // Only include reasonably similar commands
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Limit to top 3 suggestions
      .map(item => item.command);
  }

  /**
   * Calculate similarity score between two strings using multiple algorithms
   * @param {string} command - Command name to compare
   * @param {string} input - User input to compare
   * @returns {number} Similarity score between 0 and 1
   */
  calculateSimilarityScore(command, input) {
    // Exact match
    if (command === input) return 1.0;
    
    // Substring match (high score)
    if (command.includes(input) || input.includes(command)) {
      const longer = Math.max(command.length, input.length);
      const shorter = Math.min(command.length, input.length);
      return 0.8 + (shorter / longer) * 0.2;
    }
    
    // Levenshtein distance based similarity
    const distance = this.levenshteinDistance(command, input);
    const maxLength = Math.max(command.length, input.length);
    const levenshteinScore = Math.max(0, 1 - (distance / maxLength));
    
    // Prefix matching bonus
    let prefixBonus = 0;
    const minLength = Math.min(command.length, input.length);
    for (let i = 0; i < minLength; i++) {
      if (command[i] === input[i]) {
        prefixBonus += 0.1;
      } else {
        break;
      }
    }
    
    // Common character ratio
    const commonChars = this.countCommonCharacters(command, input);
    const charRatio = commonChars / Math.max(command.length, input.length);
    
    // Combine scores with weights
    return Math.min(1.0, levenshteinScore * 0.6 + prefixBonus + charRatio * 0.3);
  }

  /**
   * Count common characters between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Number of common characters
   */
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

  /**
   * Calculate Levenshtein distance for fuzzy matching
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {number} Edit distance between strings
   */
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

  /**
   * Find character by name with enhanced fuzzy matching and typo correction
   * @param {string} input - Character name input
   * @returns {Object} Character match result with suggestions
   */
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
        .slice(0, 5); // Limit suggestions
      return {
        found: false,
        error: `Multiple matches found for "${input}"`,
        suggestion: `Did you mean: ${suggestions.join(', ')}?`,
        suggestions: suggestions
      };
    }
    
    // Fuzzy matching for typos and similar names
    const fuzzyMatches = this.findSimilarCharacterNames(normalized);
    
    if (fuzzyMatches.length > 0) {
      // If there's a very close match (high confidence), suggest it specifically
      if (fuzzyMatches[0].score > 0.7) {
        return {
          found: false,
          error: `Character "${input}" not found`,
          suggestion: `Did you mean "${fuzzyMatches[0].displayName}"? (Type: !switch ${fuzzyMatches[0].displayName})`,
          suggestions: fuzzyMatches.slice(0, 3).map(m => m.displayName)
        };
      }
      
      // Multiple similar matches
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

  /**
   * Find similar character names using fuzzy matching
   * @param {string} input - Normalized input string
   * @returns {Array} Array of similar character matches with scores
   */
  findSimilarCharacterNames(input) {
    const allNames = Object.keys(this.characterNameMap);
    const displayNames = Object.values(this.characterDisplayNames);
    
    // Check both internal names and display names
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
    
    // Remove duplicates and calculate similarity scores
    const uniqueCandidates = candidates.filter((candidate, index, self) => 
      index === self.findIndex(c => c.characterId === candidate.characterId)
    );
    
    const similarities = uniqueCandidates.map(candidate => ({
      ...candidate,
      score: this.calculateSimilarityScore(candidate.name, input)
    }));
    
    // Return matches with score > 0.4, sorted by score
    return similarities
      .filter(item => item.score > 0.4)
      .sort((a, b) => b.score - a.score);
  }

  // Command Handlers

  handleHelp(args, context) {
    const helpText = `VibeScreen Terminal Commands:

Character Control:
  !switch <name>     - Change character (e.g., !switch Zen Monk)
  !characters        - List all available characters
  !status           - Show current character and settings

Message Control:
  !pause            - Pause automatic messages
  !resume           - Resume automatic messages  
  !test             - Show test message now

System:
  !help             - Show this help
  !clear            - Clear terminal history
  !config           - Show current settings
  !debug            - Show debug information

Type any command to get started!`;

    return {
      success: true,
      message: helpText,
      action: 'display-help'
    };
  }

  handleSwitch(args, context) {
    // Validate parameter presence
    if (args.length === 0) {
      return {
        success: false,
        message: 'Character name required for switch command',
        suggestion: 'Usage: !switch <Character Name>\nExample: !switch Corporate AI\nType !characters to see all available characters'
      };
    }

    // Validate parameter content
    const characterName = args.join(' ').trim();
    if (characterName.length === 0) {
      return {
        success: false,
        message: 'Character name cannot be empty',
        suggestion: 'Provide a valid character name (e.g., !switch Zen Monk)'
      };
    }

    // Validate character name length (reasonable bounds)
    if (characterName.length > 50) {
      return {
        success: false,
        message: 'Character name too long (maximum 50 characters)',
        suggestion: 'Use a shorter character name or check !characters for valid options'
      };
    }

    // Check for invalid characters (basic validation)
    if (!/^[a-zA-Z0-9\s\-]+$/.test(characterName)) {
      return {
        success: false,
        message: 'Character name contains invalid characters',
        suggestion: 'Use only letters, numbers, spaces, and hyphens in character names'
      };
    }

    const result = this.findCharacter(characterName);
    
    if (!result.found) {
      return {
        success: false,
        message: result.error,
        suggestion: result.suggestion,
        suggestions: result.suggestions
      };
    }

    // Validate context callback availability
    if (!context.onCharacterSwitch) {
      return {
        success: false,
        message: 'Character switching is not available',
        suggestion: 'The character switch function is not properly configured'
      };
    }

    // Execute character switch through context callback
    try {
      context.onCharacterSwitch(result.character);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to switch character',
        suggestion: `Error: ${error.message}. Please try again or contact support.`
      };
    }

    return {
      success: true,
      message: `Switching to ${result.displayName}...`,
      action: 'switch-character',
      data: { character: result.character, displayName: result.displayName }
    };
  }

  handleCharacters(args, context) {
    const characterList = Object.entries(this.characterDisplayNames)
      .map(([id, name]) => `  ${name}`)
      .join('\n');

    const message = `Available Characters:\n${characterList}\n\nUsage: !switch <Character Name>`;

    return {
      success: true,
      message,
      action: 'list-characters'
    };
  }

  handleStatus(args, context) {
    const currentChar = context.currentCharacter || 'Corporate AI';
    const messageStatus = context.messageStatus || 'Active';
    
    const statusText = `Current Status:
Character: ${currentChar}
Messages: ${messageStatus}
Terminal: Active
System: Online`;

    return {
      success: true,
      message: statusText,
      action: 'show-status'
    };
  }

  handlePause(args, context) {
    if (context.onMessageControl) {
      context.onMessageControl('pause');
    }

    return {
      success: true,
      message: 'Message rotation paused.',
      action: 'pause-messages'
    };
  }

  handleResume(args, context) {
    if (context.onMessageControl) {
      context.onMessageControl('resume');
    }

    return {
      success: true,
      message: 'Message rotation resumed.',
      action: 'resume-messages'
    };
  }

  handleTest(args, context) {
    if (context.onMessageControl) {
      context.onMessageControl('test');
    }

    const currentChar = context.currentCharacter || 'Corporate AI';
    return {
      success: true,
      message: `Displaying test message from ${currentChar}...`,
      action: 'test-message'
    };
  }

  handleClear(args, context) {
    return {
      success: true,
      message: 'Terminal cleared.',
      action: 'clear-terminal'
    };
  }

  handleConfig(args, context) {
    const configText = `Current Configuration:
Character: ${context.currentCharacter || 'Corporate AI'}
Messages: ${context.messageStatus || 'Active'}
Theme: Matrix Green
Auto-hide: Enabled (2s delay)
Animations: Enabled`;

    return {
      success: true,
      message: configText,
      action: 'show-config'
    };
  }

  handleDebug(args, context) {
    const debugText = `Debug Information:
Terminal: Active
Parser: CommandParser v1.0
Commands: ${Object.keys(this.commandRegistry).length} registered
Characters: ${Object.keys(this.characterDisplayNames).length} available
Context: ${Object.keys(context).join(', ')}`;

    return {
      success: true,
      message: debugText,
      action: 'show-debug'
    };
  }
}

// React component wrapper for CommandParser
const CommandParserComponent = ({ onCommandExecute, context }) => {
  const parser = new CommandParser();

  const executeCommand = (input) => {
    const result = parser.parseAndExecute(input, context);
    if (onCommandExecute) {
      onCommandExecute(result);
    }
    return result;
  };

  // Expose parser methods for external use
  React.useImperativeHandle(onCommandExecute, () => ({
    executeCommand,
    validateCommand: parser.validateCommand.bind(parser),
    findCharacter: parser.findCharacter.bind(parser),
    getAvailableCommands: () => Object.keys(parser.commandRegistry)
  }));

  return null; // This is a logic-only component
};

export default CommandParserComponent;
export { CommandParser };