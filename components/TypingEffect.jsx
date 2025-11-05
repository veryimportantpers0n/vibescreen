import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * TypingEffect Component
 * 
 * Creates authentic terminal typing animations with:
 * - Character-by-character typing
 * - Configurable typing speed
 * - Blinking cursor
 * - Accessibility support
 */
const TypingEffect = ({ 
  text = '', 
  speed = 50, 
  delay = 0,
  cursor = true,
  cursorChar = '█',
  onComplete = null,
  className = '',
  loop = false,
  pauseOnComplete = 2000
}) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(cursor);
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    reducedMotion: false
  });
  
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const currentIndex = useRef(0);
  const isLooping = useRef(false);

  // Detect accessibility preferences
  useEffect(() => {
    const detectAccessibilityPrefs = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setAccessibilityPrefs({ reducedMotion });
    };

    detectAccessibilityPrefs();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handlePreferenceChange = () => detectAccessibilityPrefs();
    motionQuery.addEventListener('change', handlePreferenceChange);

    return () => {
      motionQuery.removeEventListener('change', handlePreferenceChange);
    };
  }, []);

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Start typing effect
  useEffect(() => {
    if (!text) return;

    // If reduced motion is preferred, show text immediately
    if (accessibilityPrefs.reducedMotion) {
      setDisplayText(text);
      setIsTyping(false);
      if (onComplete) onComplete();
      return;
    }

    const startTyping = () => {
      setIsTyping(true);
      setDisplayText('');
      currentIndex.current = 0;

      const typeNextCharacter = () => {
        if (currentIndex.current < text.length) {
          setDisplayText(text.substring(0, currentIndex.current + 1));
          currentIndex.current++;
          
          // Variable speed for more realistic typing
          const charSpeed = speed + (Math.random() * 20 - 10);
          timeoutRef.current = setTimeout(typeNextCharacter, Math.max(10, charSpeed));
        } else {
          // Typing complete
          setIsTyping(false);
          if (onComplete) onComplete();
          
          // Handle looping
          if (loop && !isLooping.current) {
            isLooping.current = true;
            timeoutRef.current = setTimeout(() => {
              isLooping.current = false;
              startTyping();
            }, pauseOnComplete);
          }
        }
      };

      // Start typing after initial delay
      timeoutRef.current = setTimeout(typeNextCharacter, delay);
    };

    startTyping();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsTyping(false);
    };
  }, [text, speed, delay, onComplete, loop, pauseOnComplete, accessibilityPrefs.reducedMotion]);

  // Cursor blinking effect
  useEffect(() => {
    if (!cursor || accessibilityPrefs.reducedMotion) {
      setShowCursor(cursor);
      return;
    }

    intervalRef.current = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Slightly irregular blink for authenticity

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cursor, accessibilityPrefs.reducedMotion]);

  const containerClass = `typing-effect ${isTyping ? 'typing' : 'complete'} ${className}`;
  
  return (
    <span 
      className={containerClass}
      role="text"
      aria-live={isTyping ? "polite" : "off"}
      aria-label={accessibilityPrefs.reducedMotion ? text : `Typing: ${displayText}`}
      data-typing={isTyping}
      data-reduced-motion={accessibilityPrefs.reducedMotion}
    >
      <span className="typing-text phosphor-glow">
        {displayText}
      </span>
      {cursor && (
        <span 
          className={`typing-cursor ${showCursor ? 'visible' : 'hidden'} ${
            accessibilityPrefs.reducedMotion ? 'static' : ''
          }`}
          aria-hidden="true"
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
};

TypingEffect.propTypes = {
  text: PropTypes.string.isRequired,
  speed: PropTypes.number,
  delay: PropTypes.number,
  cursor: PropTypes.bool,
  cursorChar: PropTypes.string,
  onComplete: PropTypes.func,
  className: PropTypes.string,
  loop: PropTypes.bool,
  pauseOnComplete: PropTypes.number
};

export default TypingEffect;