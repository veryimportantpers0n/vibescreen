import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function CorporateAICharacter({ onSpeak }) {
  const meshRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 1000);
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      
      // Speak animation - slight scale pulse
      if (speakingRef.current) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.1;
        meshRef.current.scale.setScalar(pulse);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.5, 0.8, 1.5, 8]} />
      <meshStandardMaterial 
        color="#007acc" 
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
}

export default CorporateAICharacter;