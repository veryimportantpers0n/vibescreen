import { CommandParser } from './CommandParser';

describe('CommandParser', () => {
  let parser;
  let mockContext;

  beforeEach(() => {
    parser = new CommandParser();
    mockContext = {
      onCharacterSwitch: jest.fn(),
      onMessageControl: jest.fn(),
      currentCharacter: 'Corporate AI',
      messageStatus: 'Active'
    };
  });

  describe('Command Validation', () => {
    test('should reject commands without ! prefix', () => {
      const result = parser.validateCommand('help');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Commands must start with !');
    });

    test('should accept commands with ! prefix', () => {
      const result = parser.validateCommand('!help');
      expect(result.valid).toBe(true);
    });

    test('should reject empty commands', () => {
      const result = parser.validateCommand('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Empty command');
    });
  });

  describe('Command Parsing', () => {
    test('should parse simple commands', () => {
      const result = parser.parseCommand('!help');
      expect(result.command).toBe('help');
      expect(result.args).toEqual([]);
    });

    test('should parse commands with arguments', () => {
      const result = parser.parseCommand('!switch Corporate AI');
      expect(result.command).toBe('switch');
      expect(result.args).toEqual(['Corporate', 'AI']);
    });

    test('should handle case insensitive commands', () => {
      const result = parser.parseCommand('!HELP');
      expect(result.command).toBe('help');
    });
  });

  describe('Character Name Matching', () => {
    test('should find exact character matches', () => {
      const result = parser.findCharacter('Corporate AI');
      expect(result.found).toBe(true);
      expect(result.character).toBe('corporate-ai');
      expect(result.displayName).toBe('Corporate AI');
    });

    test('should find partial character matches', () => {
      const result = parser.findCharacter('corp');
      expect(result.found).toBe(true);
      expect(result.character).toBe('corporate-ai');
    });

    test('should handle case insensitive matching', () => {
      const result = parser.findCharacter('zen monk');
      expect(result.found).toBe(true);
      expect(result.character).toBe('zen-monk');
    });

    test('should return error for unknown characters', () => {
      const result = parser.findCharacter('unknown');
      expect(result.found).toBe(false);
      expect(result.error).toContain('not found');
    });

    test('should handle multiple partial matches', () => {
      // This would need a character name that matches multiple entries
      const result = parser.findCharacter('a'); // Very generic
      expect(result.found).toBe(false);
    });
  });

  describe('Command Execution', () => {
    test('should execute help command', () => {
      const result = parser.parseAndExecute('!help', mockContext);
      expect(result.success).toBe(true);
      expect(result.message).toContain('VibeScreen Terminal Commands');
      expect(result.action).toBe('display-help');
    });

    test('should execute switch command', () => {
      const result = parser.parseAndExecute('!switch Zen Monk', mockContext);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Switching to Zen Monk');
      expect(mockContext.onCharacterSwitch).toHaveBeenCalledWith('zen-monk');
    });

    test('should execute characters command', () => {
      const result = parser.parseAndExecute('!characters', mockContext);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Available Characters');
      expect(result.message).toContain('Corporate AI');
    });

    test('should execute status command', () => {
      const result = parser.parseAndExecute('!status', mockContext);
      expect(result.success).toBe(true);
      expect(result.message).toContain('Current Status');
      expect(result.message).toContain('Corporate AI');
    });

    test('should execute pause command', () => {
      const result = parser.parseAndExecute('!pause', mockContext);
      expect(result.success).toBe(true);
      expect(result.message).toContain('paused');
      expect(mockContext.onMessageControl).toHaveBeenCalledWith('pause');
    });

    test('should execute resume command', () => {
      const result = parser.parseAndExecute('!resume', mockContext);
      expect(result.success).toBe(true);
      expect(result.message).toContain('resumed');
      expect(mockContext.onMessageControl).toHaveBeenCalledWith('resume');
    });

    test('should execute test command', () => {
      const result = parser.parseAndExecute('!test', mockContext);
      expect(result.success).toBe(true);
      expect(result.message).toContain('test message');
      expect(mockContext.onMessageControl).toHaveBeenCalledWith('test');
    });

    test('should handle unknown commands', () => {
      const result = parser.parseAndExecute('!unknown', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Unknown command');
    });

    test('should handle switch command without arguments', () => {
      const result = parser.parseAndExecute('!switch', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Character name required');
    });
  });

  describe('Enhanced Fuzzy Matching and Suggestions', () => {
    test('should suggest similar commands with typos', () => {
      const suggestions = parser.findSimilarCommands('halp');
      expect(suggestions).toContain('help');
    });

    test('should suggest commands for partial matches', () => {
      const suggestions = parser.findSimilarCommands('sw');
      expect(suggestions).toContain('switch');
    });

    test('should handle common typos in commands', () => {
      const suggestions = parser.findSimilarCommands('swich');
      expect(suggestions).toContain('switch');
    });

    test('should prioritize better matches', () => {
      const suggestions = parser.findSimilarCommands('hel');
      expect(suggestions[0]).toBe('help'); // Should be first due to higher similarity
    });

    test('should limit suggestions to reasonable matches', () => {
      const suggestions = parser.findSimilarCommands('xyz');
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    test('should handle character name fuzzy matching', () => {
      const result = parser.findCharacter('corp ai');
      expect(result.found).toBe(true);
      expect(result.character).toBe('corporate-ai');
    });

    test('should suggest similar character names for typos', () => {
      const result = parser.findCharacter('corporat');
      expect(result.found).toBe(false);
      expect(result.suggestions).toContain('Corporate AI');
    });

    test('should handle multiple character suggestions', () => {
      const result = parser.findCharacter('a'); // Very generic
      expect(result.found).toBe(false);
      expect(result.suggestions).toBeDefined();
    });
  });

  describe('Parameter Validation', () => {
    test('should validate switch command parameters', () => {
      const validation = parser.validateCommandParameters('switch', []);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('requires');
    });

    test('should accept valid switch command parameters', () => {
      const validation = parser.validateCommandParameters('switch', ['Corporate', 'AI']);
      expect(validation.valid).toBe(true);
    });

    test('should validate help command has no parameters', () => {
      const validation = parser.validateCommandParameters('help', ['extra']);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('maximum');
    });

    test('should handle unknown commands in parameter validation', () => {
      const validation = parser.validateCommandParameters('unknown', []);
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Unknown command');
    });
  });

  describe('Enhanced Error Handling', () => {
    test('should handle execution errors gracefully', () => {
      // Mock a command that throws an error
      const originalHandler = parser.commandRegistry.help.handler;
      parser.commandRegistry.help.handler = () => {
        throw new Error('Test error');
      };

      const result = parser.parseAndExecute('!help', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Error executing command');

      // Restore original handler
      parser.commandRegistry.help.handler = originalHandler;
    });

    test('should provide specific error messages for invalid command format', () => {
      const result = parser.parseAndExecute('help', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Commands must start with !');
      expect(result.suggestion).toContain('!help');
    });

    test('should detect shell commands and provide helpful feedback', () => {
      const result = parser.parseAndExecute('!ls', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('not a VibeScreen command');
      expect(result.suggestion).toContain('Type !help');
    });

    test('should validate command parameters', () => {
      const result = parser.parseAndExecute('!switch', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Character name required');
    });

    test('should handle character name validation errors', () => {
      const result = parser.parseAndExecute('!switch @#$%', mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('invalid characters');
    });

    test('should handle overly long commands', () => {
      const longCommand = '!' + 'a'.repeat(150);
      const result = parser.parseAndExecute(longCommand, mockContext);
      expect(result.success).toBe(false);
      expect(result.message).toContain('too long');
    });

    test('should provide contextual suggestions for unknown commands', () => {
      const result = parser.parseAndExecute('!change zen', mockContext);
      expect(result.success).toBe(false);
      expect(result.suggestion).toContain('switch');
    });
  });
});