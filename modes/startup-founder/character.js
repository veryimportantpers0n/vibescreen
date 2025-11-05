import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function StartupFounderCharacter({ onSpeak }) {
  const meshRef = useRef();
  const energyRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 1500); // Quick, energetic speak animation
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Energetic bouncing motion
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.1;
      
      // Constant excited rotation
      meshRef.current.rotation.y += 0.02;
      
      // Hyper speak animation - rapid pulsing
      if (speakingRef.current) {
        const hyperPulse = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.1;
        meshRef.current.scale.setScalar(hyperPulse);
      } else {
        const normalPulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03;
        meshRef.current.scale.setScalar(normalPulse);
      }
    }
    
    // Pulsing energy aura
    if (energyRef.current) {
      const energyPulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.2;
      energyRef.current.scale.setScalar(energyPulse);
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <group>
      {/* Main energetic figure */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial 
          color="#00ffff" 
          emissive="#00ffff"
          emissiveIntensity={0.6}
          wireframe
        />
      </mesh>
      
      {/* Excited eyes */}
      <mesh position={[-0.15, 0.2, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      <mesh position={[0.15, 0.2, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Big excited smile */}
      <mesh position={[0, -0.1, 0.5]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.2, 0.03, 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Pulsing energy aura */}
      <mesh ref={energyRef} position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#00ffff" 
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
      
      {/* Hyper energy field */}
      <mesh position={[0, 0, 0]} scale={[2, 2, 2]}>
        <sphereGeometry args={[0.6, 6, 6]} />
        <meshStandardMaterial 
          color="#ff00ff" 
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
}
export default StartupFounderCharacter;