import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * DefaultCharacter - Fallback character component used when mode-specific characters fail to load
 * Provides a simple, reliable animated character that always works
 */
const DefaultCharacter = ({ onSpeak, sceneProps = {} }) => {
  const meshRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [blinkTimer, setBlinkTimer] = useState(0);

  // Register speak callback with parent
  useEffect(() => {
    if (onSpeak) {
      onSpeak(() => {
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 2000);
      });
    }
  }, [onSpeak]);

  // Animation loop
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // Speaking animation - scale slightly when speaking
      if (isSpeaking) {
        const speakScale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.05;
        meshRef.current.scale.setScalar(speakScale);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }

    // Blinking animation
    setBlinkTimer(prev => {
      const newTimer = prev + delta;
      if (newTimer > 3) { // Blink every 3 seconds
        if (eyeLeftRef.current && eyeRightRef.current) {
          eyeLeftRef.current.scale.y = 0.1;
          eyeRightRef.current.scale.y = 0.1;
          setTimeout(() => {
            if (eyeLeftRef.current && eyeRightRef.current) {
              eyeLeftRef.current.scale.y = 1;
              eyeRightRef.current.scale.y = 1;
            }
          }, 150);
        }
        return 0;
      }
      return newTimer;
    });
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main head */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.6]} />
        <meshStandardMaterial 
          color={sceneProps.bgColor || "#00ff00"} 
          wireframe 
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Eyes */}
      <mesh ref={eyeLeftRef} position={[-0.2, 0.1, 0.31]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={eyeRightRef} position={[0.2, 0.1, 0.31]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Eye pupils */}
      <mesh position={[-0.2, 0.1, 0.35]}>
        <sphereGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.2, 0.1, 0.35]}>
        <sphereGeometry args={[0.03, 6, 4]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Mouth - changes when speaking */}
      <mesh position={[0, -0.2, 0.31]} scale={isSpeaking ? [1.2, 0.8, 1] : [1, 1, 1]}>
        <boxGeometry args={[0.3, 0.1, 0.05]} />
        <meshBasicMaterial 
          color={isSpeaking ? "#ff4444" : "#00ff00"} 
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Antenna/indicator */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <meshBasicMaterial color="#ffaa00" />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.05, 6, 4]} />
        <meshBasicMaterial 
          color={isSpeaking ? "#ff0000" : "#00ff00"} 
          transparent
          opacity={isSpeaking ? 1 : 0.6}
        />
      </mesh>

      {/* Body outline */}
      <mesh position={[0, -0.8, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.4]} />
        <meshStandardMaterial 
          color="#008f11" 
          wireframe 
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
};

export default DefaultCharacter;
export { DefaultCharacter };