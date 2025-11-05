import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * TerminalEffects Component
 * 
 * Provides global terminal visual effects including:
 * - Full-screen scan lines overlay
 * - CRT screen curvature and glow effects
 * - Accessibility-aware effect management
 */
const TerminalEffects = ({ 
  enabled = true, 
  intensity = 'normal',
  className = '' 
}) => {
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({
    reducedMotion: false,
    highContrast: false
  });

  // Detect accessibility preferences
  useEffect(() => {
    const detectAccessibilityPrefs = () => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const highContrast = window.matchMedia('(prefers-contrast: high)').matches ||
                          window.matchMedia('(forced-colors: active)').matches;

      setAccessibilityPrefs({
        reducedMotion,
        highContrast
      });
    };

    detectAccessibilityPrefs();

    // Listen for preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const forcedColorsQuery = window.matchMedia('(forced-colors: active)');

    const handlePreferenceChange = () => detectAccessibilityPrefs();

    motionQuery.addEventListener('change', handlePreferenceChange);
    contrastQuery.addEventListener('change', handlePreferenceChange);
    forcedColorsQuery.addEventListener('change', handlePreferenceChange);

    return () => {
      motionQuery.removeEventListener('change', handlePreferenceChange);
      contrastQuery.removeEventListener('change', handlePreferenceChange);
      forcedColorsQuery.removeEventListener('change', handlePreferenceChange);
    };
  }, []);

  // Don't render effects if disabled or accessibility preferences require it
  if (!enabled || accessibilityPrefs.reducedMotion || accessibilityPrefs.highContrast) {
    return null;
  }

  const intensityClass = intensity === 'subtle' ? 'terminal-effects-subtle' : 
                        intensity === 'strong' ? 'terminal-effects-strong' : 
                        'terminal-effects-normal';

  return (
    <>
      {/* Scan Lines Overlay */}
      <div 
        className={`scan-lines ${intensityClass} ${className}`}
        aria-hidden="true"
        role="presentation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: intensity === 'subtle' ? 0.3 : intensity === 'strong' ? 1 : 0.6
        }}
      />

      {/* CRT Screen Effect */}
      <div 
        className={`crt-screen ${intensityClass} ${className}`}
        aria-hidden="true"
        role="presentation"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: intensity === 'subtle' ? 0.2 : intensity === 'strong' ? 0.8 : 0.5
        }}
      />

      {/* Optional Matrix Rain Effect for Strong Intensity */}
      {intensity === 'strong' && (
        <div 
          className={`matrix-rain ${intensityClass} ${className}`}
          aria-hidden="true"
          role="presentation"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 1,
            opacity: 0.1
          }}
        />
      )}
    </>
  );
};

TerminalEffects.propTypes = {
  enabled: PropTypes.bool,
  intensity: PropTypes.oneOf(['subtle', 'normal', 'strong']),
  className: PropTypes.string
};

export default TerminalEffects;