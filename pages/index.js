import { useAppContext } from './_app';
import { useEffect, useState, useRef } from 'react';
import ModeLoader from '../components/ModeLoader';
import CharacterHost from '../components/CharacterHost';
import TerminalInterface from '../components/TerminalInterface';
import MessageController from '../components/MessageController';
import ModeSwitchControllerComponent from '../components/ModeSwitchController';
import ModeSelectorWithAPI from '../components/ModeSelector';


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
  const handleModeChange = (newMode, components, config) => {
    console.log(`🔄 Mode change requested: ${newMode}`, { hasComponents: !!components, hasConfig: !!config });
    
    // Update current mode
    if (setCurrentMode) {
      setCurrentMode(newMode);
    }
    
    // Update components and config if provided
    if (components) {
      setModeComponents(prev => ({
        ...prev,
        [newMode]: components
      }));
    }
    
    if (config) {
      setModeConfig(prev => ({
        ...prev,
        [newMode]: config
      }));
    }
  };

  // Handle mode loading updates (legacy support)
  const handleModeLoaded = (mode, components, config) => {
    console.log(`📦 Mode loaded: ${mode}`, { hasComponents: !!components, hasConfig: !!config });
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
      onModeChange={(newMode) => {
        // Only update if it's actually different to prevent loops
        if (newMode !== currentMode) {
          console.log('🔄 ModeSwitchController mode change:', newMode);
          setCurrentMode(newMode);
        }
      }}
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
            VibeScreen
          </h1>
          <p className="app-subtitle phosphor-glow-subtle" aria-describedby="app-title">
            Ambient AI Companion for Second Monitors
          </p>
          <div className="hackathon-badge" role="img" aria-label="Hackathon submission badge">
            <span className="badge-text phosphor-glow-subtle">
              Kiroween 2025 • Frankenstein Category
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

        {/* Mode Selector - Bottom Navigation */}
        <ModeSelectorWithAPI
          onModeChange={(mode) => {
            console.log('🔄 Mode selector change:', mode);
            if (mode && mode.id && mode.id !== currentMode) {
              // Direct mode change to avoid circular dependencies
              setCurrentMode(mode.id);
            }
          }}
          initialActiveMode={currentMode}
          className="main-mode-selector"
        />

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


          </div>
        );
      }}
    </ModeSwitchControllerComponent>
  );
}