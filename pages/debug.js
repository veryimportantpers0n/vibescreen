/**
 * Debug page with minimal layout to test basic functionality
 */

import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import CorporateAIScene from '../modes/corporate-ai/scene.js';
import CorporateAICharacter from '../modes/corporate-ai/character.js';

export default function DebugPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: '#000000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Scene - Full Screen */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1
      }}>
        <Canvas camera={{ position: [0, 0, 5] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <CorporateAIScene sceneProps={{ 
            primaryColor: '#007acc',
            ambientSpeed: 0.2 
          }} />
        </Canvas>
      </div>

      {/* Character - Bottom Right */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '200px',
        height: '200px',
        zIndex: 10
      }}>
        <Canvas camera={{ position: [0, 0, 3] }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[5, 5, 5]} />
          <CorporateAICharacter />
        </Canvas>
      </div>

      {/* UI Overlay - Top Left */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 100,
        color: '#00FF00',
        fontFamily: 'monospace',
        fontSize: '24px',
        textShadow: '0 0 10px #00FF00'
      }}>
        <h1>VibeScreen Debug</h1>
        <p>Corporate AI Mode</p>
      </div>

      {/* Mode Selector - Bottom */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '220px',
        height: '60px',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.8)',
        border: '2px solid #00FF00',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#00FF00',
        fontFamily: 'monospace'
      }}>
        <button style={{
          background: 'transparent',
          border: '1px solid #00FF00',
          color: '#00FF00',
          padding: '10px 20px',
          fontFamily: 'monospace',
          cursor: 'pointer'
        }}>
          Corporate AI (Active)
        </button>
      </div>
    </div>
  );
}