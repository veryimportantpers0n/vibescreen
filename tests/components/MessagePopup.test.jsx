import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessagePopup, { MessagePopupContainer } from './MessagePopup';

// Mock window dimensions for position calculations
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768,
});

describe('MessagePopup Component', () => {
  const defaultProps = {
    message: 'Test message from AI',
    position: 'overlay',
    characterPosition: { x: 100, y: 100 },
    mode: 'test-mode',
    onComplete: jest.fn(),
    style: 'overlay',
    animationType: 'normal',
    isVisible: true,
    duration: 1000
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders message popup with terminal styling', () => {
    render(<MessagePopup {...defaultProps} />);
    
    const popup = screen.getByRole('alert');
    expect(popup).toBeInTheDocument();
    expect(popup).toHaveClass('message-popup');
    expect(popup).toHaveClass('message-popup-overlay');
    expect(popup).toHaveClass('message-popup-position-overlay');
    expect(popup).toHaveClass('message-popup-mode-test-mode');
  });

  test('displays message content with terminal prompt', () => {
    render(<MessagePopup {...defaultProps} />);
    
    expect(screen.getByText('Test message from AI')).toBeInTheDocument();
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  test('applies speech bubble style with tail', () => {
    render(
      <MessagePopup 
        {...defaultProps} 
        style="speechBubble" 
        position="above"
      />
    );
    
    const popup = screen.getByRole('alert');
    expect(popup).toHaveClass('message-popup-speechBubble');
    expect(popup).toHaveClass('message-popup-position-above');
    
    const tail = popup.querySelector('.message-popup-tail-above');
    expect(tail).toBeInTheDocument();
  });

  test('handles different animation types', () => {
    const { rerender } = render(
      <MessagePopup {...defaultProps} animationType="typing" />
    );
    
    let popup = screen.getByRole('alert');
    expect(popup).toHaveClass('message-popup-animation-typing');
    
    rerender(<MessagePopup {...defaultProps} animationType="glitchy" />);
    popup = screen.getByRole('alert');
    expect(popup).toHaveClass('message-popup-animation-glitchy');
  });

  test('calls onComplete after duration expires', async () => {
    const onComplete = jest.fn();
    render(<MessagePopup {...defaultProps} onComplete={onComplete} duration={1000} />);
    
    expect(onComplete).not.toHaveBeenCalled();
    
    // Fast-forward time
    jest.advanceTimersByTime(1000);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  test('handles click to dismiss', async () => {
    const onComplete = jest.fn();
    render(<MessagePopup {...defaultProps} onComplete={onComplete} />);
    
    const popup = screen.getByRole('alert');
    fireEvent.click(popup);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  test('does not render when not visible', () => {
    render(<MessagePopup {...defaultProps} isVisible={false} />);
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('applies proper ARIA attributes', () => {
    const ariaLabel = 'Custom aria label';
    render(<MessagePopup {...defaultProps} ariaLabel={ariaLabel} />);
    
    const popup = screen.getByRole('alert');
    expect(popup).toHaveAttribute('aria-live', 'polite');
    expect(popup).toHaveAttribute('aria-label', ariaLabel);
  });

  test('includes screen reader instructions', () => {
    render(<MessagePopup {...defaultProps} />);
    
    expect(screen.getByText('Press any key or click to dismiss this message.')).toBeInTheDocument();
  });
});

describe('MessagePopupContainer Component', () => {
  const containerProps = {
    messages: [
      {
        id: 'msg1',
        text: 'First message',
        position: 'overlay',
        mode: 'corporate-ai',
        style: 'overlay'
      },
      {
        id: 'msg2',
        text: 'Second message',
        position: 'above',
        mode: 'zen-monk',
        style: 'speechBubble'
      }
    ],
    characterPosition: { x: 100, y: 100 },
    onMessageComplete: jest.fn(),
    maxMessages: 3
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders multiple message popups', () => {
    render(<MessagePopupContainer {...containerProps} />);
    
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
    
    const popups = screen.getAllByRole('alert');
    expect(popups).toHaveLength(2);
  });

  test('limits messages to maxMessages', () => {
    const manyMessages = Array.from({ length: 5 }, (_, i) => ({
      id: `msg${i}`,
      text: `Message ${i}`,
      position: 'overlay',
      mode: 'test',
      style: 'overlay'
    }));

    render(
      <MessagePopupContainer 
        {...containerProps} 
        messages={manyMessages}
        maxMessages={3}
      />
    );
    
    const popups = screen.getAllByRole('alert');
    expect(popups).toHaveLength(3);
  });

  test('applies stacking classes to messages', () => {
    render(<MessagePopupContainer {...containerProps} />);
    
    const popups = screen.getAllByRole('alert');
    expect(popups[0]).toHaveClass('message-popup-stack-0');
    expect(popups[1]).toHaveClass('message-popup-stack-1');
  });

  test('handles message completion', async () => {
    const onMessageComplete = jest.fn();
    render(
      <MessagePopupContainer 
        {...containerProps} 
        onMessageComplete={onMessageComplete}
      />
    );
    
    const firstPopup = screen.getByText('First message').closest('[role="alert"]');
    fireEvent.click(firstPopup);
    
    await waitFor(() => {
      expect(onMessageComplete).toHaveBeenCalledWith('msg1');
    });
  });

  test('provides proper ARIA region', () => {
    render(<MessagePopupContainer {...containerProps} />);
    
    const container = screen.getByRole('region');
    expect(container).toHaveAttribute('aria-label', 'AI personality messages');
    expect(container).toHaveAttribute('aria-live', 'polite');
  });
});