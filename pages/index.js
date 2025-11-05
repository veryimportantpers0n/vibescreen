import { useAppContext } from './_app';
import { useEffect, useState, useRef } from 'react';
import ModeLoader from '../components/ModeLoader';
import CharacterHost from '../components/CharacterHost';
import TerminalInterface from '../components/TerminalInterface';
import MessageController from '../components/MessageController';
import ModeSwitchControllerComponent from '../components/ModeSwitchController';
import TypingEffect from '../components/TypingEffect';

export default function Home() {
  const { currentMode, globalConfig, setCurrentMode, messagesPaused, setMessagesPaused } = useAppContext();
  const [mounted, setMounted] = useState(false);
  const [modeComponents, setModeComponents] = useState({});
  const [modeConfig, setModeConfig] = useState({});
  const [speakTrigger, setSpeakTrigger] = useState(0);
  const [loadingState, setLoadingState] = useState('Ready');
  const modeLoaderRef = useRef(null);
  const switchControllerRef = useRef(null);

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

  // Handle character switching from terminal via ModeSwitchController
  const handleCharacterSwitch = async (characterInput) => {
    console.log('🔄 Character switch requested:', characterInput);
    
    if (switchControllerRef.current) {
      try {
        const result = await switchControllerRef.current.handleCharacterSwitch(characterInput);
        console.log('✅ Character switch result:', result);
        return result;
      } catch (error) {
        console.error('❌ Character switch failed:', error);
        throw error;
      }
    } else {
      // Fallback to direct mode change if controller not available
      console.warn('⚠️ ModeSwitchController not available, using fallback');
      if (typeof characterInput === 'string') {
        setCurrentMode(characterInput);
      } else if (characterInput && characterInput.id) {
        setCurrentMode(characterInput.id);
      }
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
  const getCurrentState = () => {
    const baseState = {
      currentCharacter: currentMode || 'Corporate AI',
      messageStatus: messagesPaused ? 'Paused' : 'Active',
      loadingState: loadingState,
      terminalVisible: true,
      globalConfig
    };

    // Add ModeLoader stats if available
    if (switchControllerRef.current) {
      const status = switchControllerRef.current.getStatus();
      baseState.modeLoaderStats = status.modeLoaderStats;
    }

    return baseState;
  };

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
    <ModeSwitchControllerComponent
      initialMode={currentMode}
      onModeChange={setCurrentMode}
      onLoadingStateChange={setLoadingState}
      onError={handleModeError}
      getCurrentModeData={() => ({
        components: modeComponents[currentMode],
        config: modeConfig[currentMode]
      })}
    >
      {(switchController) => {
        // Store controller reference for use in other handlers
        switchControllerRef.current = switchController;

        return (
          <div className="homepage" role="application" aria-label="VibeScreen Ambient AI Companion">
            {/* Skip to main content link for accessibility */}
            <a href="#main-content" className="skip-link">Skip to main content</a>
            
            {/* Main Content Area */}
            <main id="main-content" className="main-content" role="main">
        {/* Header Section */}
        <header className="app-header" role="banner">
          <h1 className="app-title phosphor-glow" id="app-title">
            <TypingEffect 
              text="VibeScreen" 
              speed={100} 
              delay={500}
              cursor={true}
              cursorChar="█"
            />
          </h1>
          <p className="app-subtitle phosphor-glow-subtle" aria-describedby="app-title">
            <TypingEffect 
              text="Ambient AI Companion for Second Monitors" 
              speed={30} 
              delay={2000}
              cursor={false}
            />
          </p>
          <div className="hackathon-badge" role="img" aria-label="Hackathon submission badge">
            <span className="badge-text phosphor-glow-subtle">
              <TypingEffect 
                text="Kiroween 2025 • Frankenstein Category" 
                speed={25} 
                delay={4000}
                cursor={false}
              />
            </span>
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
                ref={(ref) => {
                  modeLoaderRef.current = ref;
                  // Connect ModeLoader to switch controller
                  if (switchController && ref) {
                    switchController.setModeLoaderRef(ref);
                  }
                }}
                currentMode={currentMode}
                onModeChange={handleModeChange}
                onModeLoaded={handleModeLoaded}
                onError={handleModeError}
              />
              <div className="sr-only" id="scene-status" aria-live="polite">
                Current Mode: {currentMode || 'Loading...'} - Status: {loadingState}
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
              currentCharacter={switchController.currentMode}
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
                  <li>✅ Three.js Scene Wrapper</li>
                  <li>✅ Mode Loader System</li>
                  <li>✅ Terminal Interface</li>
                  <li>✅ Mode Switch Controller</li>
                  <li>✅ Message System</li>
                </ul>
                <div className="config-display">
                  <strong>Switch Controller Status:</strong>
                  <pre aria-label="Switch controller status">{JSON.stringify(switchController.getStatus(), null, 2)}</pre>
                </div>
                <div className="config-display">
                  <strong>Global Config:</strong>
                  <pre aria-label="Global configuration data">{JSON.stringify(globalConfig, null, 2)}</pre>
                </div>
              </aside>
            )}
          </div>
        );
      }}
    </ModeSwitchControllerComponent>
  );
}