import { useAppContext } from './_app';
import { useEffect, useState } from 'react';

export default function Home() {
  const { currentMode, globalConfig } = useAppContext();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="loading-content">
          <h1 className="loading-title">VibeScreen</h1>
          <div className="loading-spinner" aria-label="Loading application">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="homepage" role="application" aria-label="VibeScreen Ambient AI Companion">
      {/* Skip to main content link for accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      {/* Main Content Area */}
      <main id="main-content" className="main-content" role="main">
        {/* Header Section */}
        <header className="app-header" role="banner">
          <h1 className="app-title" id="app-title">VibeScreen</h1>
          <p className="app-subtitle" aria-describedby="app-title">
            Ambient AI Companion for Second Monitors
          </p>
          <div className="hackathon-badge" role="img" aria-label="Hackathon submission badge">
            <span className="badge-text">Kiroween 2025 • Frankenstein Category</span>
          </div>
        </header>

        {/* Scene Container - Will hold Three.js scenes */}
        <section 
          className="scene-container" 
          id="scene-container"
          role="img"
          aria-label="3D background scene area"
          aria-describedby="scene-status"
        >
          <div className="scene-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon" aria-hidden="true">🤖</div>
              <p className="placeholder-text" id="scene-status">3D Scene Loading...</p>
              <small className="placeholder-note" aria-live="polite">
                Current Mode: {currentMode || 'Loading...'}
              </small>
            </div>
          </div>
        </section>

        {/* Character Host Area - Bottom Right */}
        <aside 
          className="character-host" 
          id="character-host"
          role="complementary"
          aria-label="AI character display area"
          aria-describedby="character-status"
        >
          <div className="character-placeholder">
            <div className="character-icon" aria-hidden="true">👾</div>
            <div className="character-status">
              <span className="status-text" id="character-status" aria-live="polite">
                Character Loading...
              </span>
            </div>
          </div>
        </aside>

        {/* Mode Selector Placeholder - Bottom Navigation */}
        <nav 
          className="mode-selector-placeholder"
          role="navigation"
          aria-label="Personality mode selection"
        >
          <div className="selector-container">
            <h2 className="selector-title" id="mode-selector-title">Personality Modes</h2>
            <div 
              className="mode-buttons" 
              role="group" 
              aria-labelledby="mode-selector-title"
            >
              <button 
                className="mode-button active" 
                data-mode="corporate-ai"
                aria-pressed="true"
                aria-describedby="mode-selector-title"
              >
                Corporate AI
              </button>
              <button 
                className="mode-button" 
                data-mode="zen-monk"
                aria-pressed="false"
                aria-describedby="mode-selector-title"
              >
                Zen Monk
              </button>
              <button 
                className="mode-button" 
                data-mode="chaos"
                aria-pressed="false"
                aria-describedby="mode-selector-title"
              >
                Chaos
              </button>
              <span className="more-modes" aria-label="8 additional modes available">
                + 8 more modes
              </span>
            </div>
          </div>
        </nav>

        {/* Controls Placeholder - Top Right */}
        <aside 
          className="controls-placeholder"
          role="complementary"
          aria-label="Application controls"
        >
          <div className="control-group" role="group" aria-label="Message and system controls">
            <button 
              className="control-button" 
              title="Pause Messages"
              aria-label="Pause automatic messages"
              type="button"
            >
              <span aria-hidden="true">⏸️</span>
            </button>
            <button 
              className="control-button" 
              title="Test Message"
              aria-label="Show test message"
              type="button"
            >
              <span aria-hidden="true">💬</span>
            </button>
            <button 
              className="control-button" 
              title="Settings"
              aria-label="Open settings"
              type="button"
            >
              <span aria-hidden="true">⚙️</span>
            </button>
          </div>
        </aside>

        {/* Terminal Interface Placeholder - Bottom Left */}
        <aside 
          className="terminal-placeholder"
          role="complementary"
          aria-label="Terminal command interface"
        >
          <div 
            className="terminal-indicator"
            role="button"
            tabIndex="0"
            aria-label="Activate terminal interface"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                // Future: activate terminal
                e.preventDefault();
              }
            }}
          >
            <span className="terminal-icon" aria-hidden="true">&gt;</span>
            <span className="terminal-text">Terminal (Hover to activate)</span>
          </div>
        </aside>
      </main>

      {/* Development Info Panel */}
      {process.env.NODE_ENV === 'development' && (
        <aside 
          className="dev-info"
          role="complementary"
          aria-label="Development information"
        >
          <h3>Development Status</h3>
          <ul role="list">
            <li>✅ Next.js App Structure</li>
            <li>✅ Global State Management</li>
            <li>✅ Error Boundary</li>
            <li>⏳ Three.js Scene Wrapper</li>
            <li>⏳ Mode Loader System</li>
            <li>⏳ Terminal Interface</li>
            <li>⏳ Message System</li>
          </ul>
          <div className="config-display">
            <strong>Global Config:</strong>
            <pre aria-label="Global configuration data">{JSON.stringify(globalConfig, null, 2)}</pre>
          </div>
        </aside>
      )}
    </div>
  );
}