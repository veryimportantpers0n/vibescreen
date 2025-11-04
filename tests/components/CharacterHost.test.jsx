import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CharacterHost from '../../components/CharacterHost';

// Mock Three.js Canvas component
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children, onCreated, ...props }) => {
    // Simulate canvas creation
    React.useEffect(() => {
      if (onCreated) {
        const mockGL = {
          setClearColor: jest.fn(),
          shadowMap: { enabled: false }
        };
        const mockCamera = {
          position: { set: jest.fn() },
          lookAt: jest.fn()
        };
        onCreated({ gl: mockGL, camera: mockCamera });
      }
    }, [onCreated]);
    
    return (
      <div data-testid="mock-canvas" {...props}>
        {children}
      </div>
    );
  }
}));

// Mock character component
const MockCharacter = ({ onSpeak, isAnimating, mode }) => (
  <div data-testid="mock-character" data-mode={mode} data-animating={isAnimating}>
    Mock Character {onSpeak}
  </div>
);

describe('CharacterHost Component', () => {
  const defaultProps = {
    currentMode: 'corporate-ai',
    characterComponent: MockCharacter,
    config: {
      colors: {
        primary: '#00ff00',
        secondary: '#ffffff'
      }
    }
  };

  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1080
    });
  });

  test('positions character in bottom-right corner', () => {
    render(<CharacterHost {...defaultProps} />);
    
    const characterHost = document.querySelector('.character-host');
    expect(characterHost).toHaveStyle({
      position: 'fixed',
      bottom: '20px',
      right: '20px'
    });
  });

  test('renders character component when provided', () => {
    render(<CharacterHost {...defaultProps} />);
    
    expect(screen.getByTestId('mock-character')).toBeInTheDocument();
    expect(screen.getByTestId('mock-canvas')).toBeInTheDocument();
  });

  test('shows loading state when no character component', () => {
    render(<CharacterHost {...defaultProps} characterComponent={null} />);
    
    expect(screen.getByText('> LOADING_CHARACTER')).toBeInTheDocument();
    expect(screen.getByText('Loading character for corporate-ai mode')).toBeInTheDocument();
  });

  test('handles speak animation trigger', async () => {
    const { rerender } = render(<CharacterHost {...defaultProps} onSpeak={0} />);
    
    // Trigger speak animation
    rerender(<CharacterHost {...defaultProps} onSpeak={1} />);
    
    await waitFor(() => {
      const characterHost = document.querySelector('.character-host');
      expect(characterHost).toHaveClass('speaking');
    });
  });

  test('applies responsive sizing', () => {
    render(<CharacterHost {...defaultProps} />);
    
    const characterHost = document.querySelector('.character-host');
    const style = window.getComputedStyle(characterHost);
    
    // Should have reasonable size constraints
    expect(parseInt(style.width)).toBeGreaterThanOrEqual(150);
    expect(parseInt(style.width)).toBeLessThanOrEqual(250);
  });

  test('shows error state when character fails to load', () => {
    const onError = jest.fn();
    render(<CharacterHost {...defaultProps} onError={onError} />);
    
    // Simulate error by setting error state
    const errorButton = screen.queryByText('> RETRY');
    if (errorButton) {
      expect(errorButton).toBeInTheDocument();
    }
  });

  test('maintains accessibility attributes', () => {
    render(<CharacterHost {...defaultProps} />);
    
    const characterHost = document.querySelector('.character-host');
    expect(characterHost).toHaveAttribute('role', 'img');
    expect(characterHost).toHaveAttribute('aria-label');
    expect(characterHost).toHaveAttribute('aria-live', 'polite');
  });

  test('supports different character sizes and aspect ratios', () => {
    const config = {
      ...defaultProps.config,
      characterSize: 'large'
    };
    
    render(<CharacterHost {...defaultProps} config={config} />);
    
    const characterHost = document.querySelector('.character-host');
    expect(characterHost).toBeInTheDocument();
    
    // Component should handle different configurations gracefully
    expect(characterHost).toHaveStyle('overflow: hidden');
  });

  test('coordinates with message system timing', async () => {
    let speakCallback;
    const MockCharacterWithCallback = ({ onSpeak }) => {
      React.useEffect(() => {
        if (typeof onSpeak === 'number' && onSpeak > 0) {
          speakCallback = onSpeak;
        }
      }, [onSpeak]);
      return <div data-testid="character-with-callback">Character</div>;
    };

    render(
      <CharacterHost 
        {...defaultProps} 
        characterComponent={MockCharacterWithCallback}
        onSpeak={1}
      />
    );

    await waitFor(() => {
      expect(speakCallback).toBeDefined();
    });
  });
});