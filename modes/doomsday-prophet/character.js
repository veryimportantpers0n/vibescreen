import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function DoomsdayProphetCharacter({ onSpeak }) {
  const meshRef = useRef();
  const hoodRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 3000); // Longer, more dramatic speak animation
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Slow, ominous swaying
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
      
      // Subtle floating motion
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
      
      // Dramatic speak animation - intense glow
      if (speakingRef.current) {
        const dramaticPulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
        meshRef.current.scale.setScalar(dramaticPulse);
      } else {
        const normalScale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.01;
        meshRef.current.scale.setScalar(normalScale);
      }
    }
    
    // Floating hood/cloak effect
    if (hoodRef.current) {
      hoodRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <group>
      {/* Main prophet figure */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial 
          color="#ff0000" 
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>
      
      {/* Glowing red eyes */}
      <mesh position={[-0.15, 0.1, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.9}
        />
      </mesh>
      
      <mesh position={[0.15, 0.1, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.9}
        />
      </mesh>
      
      {/* Grim mouth */}
      <mesh position={[0, -0.2, 0.5]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color="#660000"
        />
      </mesh>
      
      {/* Floating hood/cloak */}
      <mesh ref={hoodRef} position={[0, 0.8, 0]} scale={[1.2, 0.8, 1.2]}>
        <coneGeometry args={[0.8, 0.6, 8]} />
        <meshStandardMaterial 
          color="#330000"
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Ominous aura */}
      <mesh position={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0000" 
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      
      {/* Dark energy field */}
      <mesh position={[0, 0, 0]} scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[0.6, 6, 6]} />
        <meshStandardMaterial 
          color="#660000" 
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
    </group>
  );
}
export default DoomsdayProphetCharacter;