import { useAppContext } from './_app';
import { useEffect, useState } from 'react';
import ModeLoader from '../components/ModeLoader';
import CharacterHost from '../components/CharacterHost';
import TerminalInterface from '../components/TerminalInterface';
import MessageController from '../components/MessageController';

export default function Home() {
  const { currentMode, globalConfig, setCurrentMode, messagesPaused, setMessagesPaused } = useAppContext();
  const [mounted, setMounted] = useState(false);
  const [modeComponents, setModeComponents] = useState({});
  const [modeConfig, setModeConfig] = useState({});
  const [speakTrigger, setSpeakTrigger] = useState(0);

  // Ensure component is mounted before rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle mode changes from ModeLoader
  const handleModeChange = (newMode) => {
    console.log(`🔄 Mode change requested: ${newMode}`);
    if (setCurrentMode) {
      setCurrentMode(newMode);
    }
  };

  // Handle mode loading updates
  const handleModeLoaded = (mode, components, config) => {
    setModeComponents(prev => ({
      ...prev,
      [mode]: components
    }));
    setModeConfig(prev => ({
      ...prev,
      [mode]: config
    }));
  };

  // Handle errors from mode loading
  const handleModeError = (error, context) => {
    console.error('Mode loading error:', error, context);
    // Could implement error reporting here
  };

  // Trigger character speak animation
  const triggerSpeak = () => {
    setSpeakTrigger(prev => prev + 1);
  };

  // Handle character switching from terminal
  const handleCharacterSwitch = (modeObject) => {
    console.log('🔄 Character switch requested:', modeObject);
    if (modeObject && modeObject.id) {
      setCurrentMode(modeObject.id);
    } else if (typeof modeObject === 'string') {
      setCurrentMode(modeObject);
    }
  };

  // Handle message control from terminal
  const handleMessageControl = (action) => {
    console.log('📨 Message control requested:', action);
    switch (action) {
      case 'pause':
        setMessagesPaused(true);
        break;
      case 'resume':
        setMessagesPaused(false);
        break;
      case 'test':
        triggerSpeak();
        break;
      default:
        console.warn('Unknown message control action:', action);
    }
  };

  // Get current application state for terminal
  const getCurrentState = () => ({
    currentCharacter: currentMode || 'Corporate AI',
    messageStatus: messagesPaused ? 'Paused' : 'Active',
    terminalVisible: true,
    globalConfig
  });

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

        {/* Scene Container - Real Three.js scenes */}
        <section 
          className="scene-container" 
          id="scene-container"
          role="img"
          aria-label="3D background scene area"
          aria-describedby="scene-status"
        >
          <ModeLoader
            currentMode={currentMode}
            onModeChange={handleModeChange}
            onModeLoaded={handleModeLoaded}
            onError={handleModeError}
          />
          <div className="sr-only" id="scene-status" aria-live="polite">
            Current Mode: {currentMode || 'Loading...'}
          </div>
        </section>

        {/* Character Host Area - Bottom Right */}
        <CharacterHost
          currentMode={currentMode}
          characterComponent={modeComponents[currentMode]?.character}
          config={modeConfig[currentMode]}
          onSpeak={speakTrigger}
          onError={handleModeError}
        />

        {/* Message System */}
        <MessageController
          currentMode={currentMode}
          globalConfig={globalConfig}
          isPaused={messagesPaused}
          onError={handleModeError}
          characterPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 120 : 1200, y: typeof window !== 'undefined' ? window.innerHeight - 120 : 600 }}
        />

        {/* Terminal Interface - Bottom Left */}
        <TerminalInterface
          onCharacterSwitch={handleCharacterSwitch}
          onMessageControl={handleMessageControl}
          currentCharacter={currentMode}
          messageStatus={messagesPaused ? 'Paused' : 'Active'}
          getCurrentState={getCurrentState}
          onError={handleModeError}
        />

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
              onClick={triggerSpeak}
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