import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function ZenMonkCharacter({ onSpeak }) {
  const meshRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 1500); // Longer, more peaceful speak animation
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating meditation
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      
      // Peaceful breathing animation
      const breathScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
      
      // Gentle speak animation - soft glow effect
      if (speakingRef.current) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.05;
        meshRef.current.scale.setScalar(breathScale * pulse);
      } else {
        meshRef.current.scale.setScalar(breathScale);
      }
      
      // Subtle swaying meditation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <group>
      {/* Main meditation figure */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial 
          color="#00ff88" 
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>
      
      {/* Meditation aura */}
      <mesh position={[0, 0, 0]} scale={[1.2, 1.2, 1.2]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#00ff88" 
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
    </group>
  );
}
export default ZenMonkCharacter;