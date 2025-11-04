import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TerminalInterface from '../../components/TerminalInterface';

describe('TerminalInterface Component', () => {
  const defaultProps = {
    onCharacterSwitch: jest.fn(),
    onMessageControl: jest.fn(),
    currentCharacter: 'Corporate AI',
    messageStatus: 'Active'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders terminal trigger area', () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('>');
  });

  test('shows terminal on trigger hover', async () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    const terminal = screen.getByLabelText('Terminal interface');
    
    // Terminal should be hidden initially
    expect(terminal).toHaveAttribute('aria-hidden', 'true');
    
    // Hover over trigger
    fireEvent.mouseEnter(trigger);
    
    await waitFor(() => {
      expect(terminal).toHaveAttribute('aria-hidden', 'false');
    });
  });

  test('hides terminal after mouse leave with delay', async () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    const terminal = screen.getByLabelText('Terminal interface');
    
    // Show terminal
    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      expect(terminal).toHaveAttribute('aria-hidden', 'false');
    });
    
    // Leave terminal
    fireEvent.mouseLeave(terminal);
    
    // Should still be visible immediately
    expect(terminal).toHaveAttribute('aria-hidden', 'false');
    
    // Fast-forward 2 seconds
    jest.advanceTimersByTime(2000);
    
    await waitFor(() => {
      expect(terminal).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test('cancels hide when mouse re-enters terminal', async () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    const terminal = screen.getByLabelText('Terminal interface');
    
    // Show terminal
    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      expect(terminal).toHaveAttribute('aria-hidden', 'false');
    });
    
    // Leave and re-enter quickly
    fireEvent.mouseLeave(terminal);
    fireEvent.mouseEnter(terminal);
    
    // Fast-forward 2 seconds
    jest.advanceTimersByTime(2000);
    
    // Should still be visible
    expect(terminal).toHaveAttribute('aria-hidden', 'false');
  });

  test('displays current character and message status', () => {
    render(<TerminalInterface {...defaultProps} />);
    
    expect(screen.getByText('Current: Corporate AI')).toBeInTheDocument();
    expect(screen.getByText('Messages: Active')).toBeInTheDocument();
  });

  test('renders terminal input field', () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const input = screen.getByPlaceholderText('Enter command...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('autoComplete', 'off');
    expect(input).toHaveAttribute('spellCheck', 'false');
  });

  test('maintains focus state correctly', async () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    const terminal = screen.getByLabelText('Terminal interface');
    
    // Show terminal
    fireEvent.mouseEnter(trigger);
    await waitFor(() => {
      expect(terminal).toHaveAttribute('aria-hidden', 'false');
    });
    
    // Focus terminal
    fireEvent.focus(terminal);
    
    // Leave terminal while focused
    fireEvent.mouseLeave(terminal);
    
    // Fast-forward 2 seconds - should not hide while focused
    jest.advanceTimersByTime(2000);
    expect(terminal).toHaveAttribute('aria-hidden', 'false');
    
    // Blur terminal
    fireEvent.blur(terminal);
    
    // Fast-forward 2 seconds - should hide after blur
    jest.advanceTimersByTime(2000);
    await waitFor(() => {
      expect(terminal).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test('applies custom className', () => {
    render(<TerminalInterface {...defaultProps} className="custom-class" />);
    
    const terminal = screen.getByLabelText('Terminal interface');
    expect(terminal).toHaveClass('custom-class');
  });

  test('has proper accessibility attributes', () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const terminal = screen.getByLabelText('Terminal interface');
    expect(terminal).toHaveAttribute('role', 'application');
    expect(terminal).toHaveAttribute('tabIndex', '-1'); // Initially not focusable
    
    // Show terminal
    const trigger = screen.getByLabelText('Terminal interface trigger');
    fireEvent.mouseEnter(trigger);
    
    // Should become focusable when visible
    expect(terminal).toHaveAttribute('tabIndex', '0');
  });

  test('executes character switch command through CommandExecutor', async () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    fireEvent.mouseEnter(trigger);
    
    const input = screen.getByPlaceholderText('Enter command...');
    
    // Type and execute switch command
    fireEvent.change(input, { target: { value: '!switch Zen Monk' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(defaultProps.onCharacterSwitch).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'zen-monk',
          name: 'Zen Monk'
        })
      );
    });
  });

  test('executes message control commands through CommandExecutor', async () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    fireEvent.mouseEnter(trigger);
    
    const input = screen.getByPlaceholderText('Enter command...');
    
    // Test pause command
    fireEvent.change(input, { target: { value: '!pause' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(defaultProps.onMessageControl).toHaveBeenCalledWith('pause');
    });
    
    // Test resume command
    fireEvent.change(input, { target: { value: '!resume' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(defaultProps.onMessageControl).toHaveBeenCalledWith('resume');
    });
    
    // Test test command
    fireEvent.change(input, { target: { value: '!test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(defaultProps.onMessageControl).toHaveBeenCalledWith('test');
    });
  });

  test('displays system status through CommandExecutor', async () => {
    const getCurrentState = jest.fn(() => ({
      currentCharacter: 'Zen Monk',
      messageStatus: 'Paused',
      terminalVisible: true
    }));
    
    render(<TerminalInterface {...defaultProps} getCurrentState={getCurrentState} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    fireEvent.mouseEnter(trigger);
    
    const input = screen.getByPlaceholderText('Enter command...');
    
    // Execute status command
    fireEvent.change(input, { target: { value: '!status' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText(/Character: Zen Monk/)).toBeInTheDocument();
      expect(screen.getByText(/Messages: Paused/)).toBeInTheDocument();
    });
  });

  test('handles command queue when rapid commands are entered', async () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    fireEvent.mouseEnter(trigger);
    
    const input = screen.getByPlaceholderText('Enter command...');
    
    // Rapidly enter multiple commands
    fireEvent.change(input, { target: { value: '!pause' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    fireEvent.change(input, { target: { value: '!resume' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    fireEvent.change(input, { target: { value: '!test' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // All commands should eventually be processed
    await waitFor(() => {
      expect(defaultProps.onMessageControl).toHaveBeenCalledTimes(3);
    }, { timeout: 3000 });
  });

  test('clears terminal history with clear command', async () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    fireEvent.mouseEnter(trigger);
    
    const input = screen.getByPlaceholderText('Enter command...');
    
    // Add some commands to history
    fireEvent.change(input, { target: { value: '!help' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText('!help')).toBeInTheDocument();
    });
    
    // Clear terminal
    fireEvent.change(input, { target: { value: '!clear' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.queryByText('!help')).not.toBeInTheDocument();
    });
  });

  test('shows CommandExecutor ready status in welcome message', () => {
    render(<TerminalInterface {...defaultProps} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    fireEvent.mouseEnter(trigger);
    
    // Should show CommandExecutor ready status
    expect(screen.getByText('CommandExecutor: Ready')).toBeInTheDocument();
  });

  test('handles errors gracefully', async () => {
    const onError = jest.fn();
    render(<TerminalInterface {...defaultProps} onError={onError} />);
    
    const trigger = screen.getByLabelText('Terminal interface trigger');
    fireEvent.mouseEnter(trigger);
    
    const input = screen.getByPlaceholderText('Enter command...');
    
    // Execute invalid command
    fireEvent.change(input, { target: { value: '!invalid' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(screen.getByText(/Unknown command/)).toBeInTheDocument();
    });
  });
});
 
 // Accessibility Tests
  describe('Accessibility Features', () => {
    test('has proper ARIA labels and roles', () => {
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button', { name: /activate terminal interface/i });
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-controls', 'terminal-container');
      
      const terminal = screen.getByRole('application');
      expect(terminal).toHaveAttribute('aria-label');
      expect(terminal).toHaveAttribute('aria-describedby', 'terminal-help-text');
    });

    test('supports keyboard navigation', async () => {
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      
      // Tab to trigger and activate with Enter
      trigger.focus();
      fireEvent.keyDown(trigger, { key: 'Enter' });
      
      await waitFor(() => {
        const terminal = screen.getByRole('application');
        expect(terminal).toHaveAttribute('aria-hidden', 'false');
      });
      
      // Escape should hide terminal
      fireEvent.keyDown(document, { key: 'Escape' });
      
      await waitFor(() => {
        const terminal = screen.getByRole('application');
        expect(terminal).toHaveAttribute('aria-hidden', 'true');
      });
    });

    test('provides screen reader announcements', async () => {
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      // Check for live regions
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
      
      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toBeInTheDocument();
    });

    test('supports tab completion with announcements', async () => {
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      const input = screen.getByRole('combobox');
      
      // Type partial command
      fireEvent.change(input, { target: { value: '!he' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      
      await waitFor(() => {
        expect(input.value).toBe('!help ');
      });
    });

    test('handles F1 help shortcut', async () => {
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      // Press F1 for help
      fireEvent.keyDown(document, { key: 'F1' });
      
      await waitFor(() => {
        expect(screen.getByText(/available commands/i)).toBeInTheDocument();
      });
    });

    test('adapts to high contrast preferences', () => {
      // Mock high contrast media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-contrast: high)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      const terminal = screen.getByRole('application');
      expect(terminal).toHaveAttribute('data-high-contrast', 'true');
    });

    test('adapts to reduced motion preferences', () => {
      // Mock reduced motion media query
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      const terminal = screen.getByRole('application');
      expect(terminal).toHaveAttribute('data-reduced-motion', 'true');
    });

    test('provides proper input labeling', () => {
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      const input = screen.getByRole('combobox');
      expect(input).toHaveAttribute('aria-describedby', 'terminal-input-help');
      expect(input).toHaveAttribute('aria-autocomplete', 'list');
      
      const label = screen.getByLabelText(/enter terminal command/i);
      expect(label).toBe(input);
    });

    test('maintains focus management for screen readers', async () => {
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      const terminal = screen.getByRole('application');
      fireEvent.focus(terminal);
      
      // Blur should extend hide delay for screen readers
      fireEvent.blur(terminal, { relatedTarget: document.body });
      
      // Should not hide immediately (longer delay for screen readers)
      jest.advanceTimersByTime(2000);
      expect(terminal).toHaveAttribute('aria-hidden', 'false');
      
      // Should hide after extended delay
      jest.advanceTimersByTime(3000);
      await waitFor(() => {
        expect(terminal).toHaveAttribute('aria-hidden', 'true');
      });
    });

    test('provides command history with proper ARIA labels', async () => {
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      const input = screen.getByRole('combobox');
      
      // Execute a command to create history
      fireEvent.change(input, { target: { value: '!help' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        const historyLog = screen.getByRole('log');
        expect(historyLog).toHaveAttribute('aria-label', 'Terminal command history');
        expect(historyLog).toHaveAttribute('aria-live', 'polite');
      });
    });

    test('handles error announcements for screen readers', async () => {
      render(<TerminalInterface {...defaultProps} />);
      
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      
      const input = screen.getByRole('combobox');
      
      // Execute invalid command
      fireEvent.change(input, { target: { value: '!invalid' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        const alertRegion = screen.getByRole('alert');
        expect(alertRegion).toHaveTextContent(/command failed/i);
      });
    });
  });
;