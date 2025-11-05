import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function SpookyCharacter({ onSpeak }) {
  const meshRef = useRef();
  const cloakRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 2200); // Eerie, mysterious speak animation
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Ghostly floating motion
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.04;
      
      // Mysterious swaying
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      
      // Spooky speak animation - ethereal glow
      if (speakingRef.current) {
        const eerieGlow = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.06;
        meshRef.current.scale.setScalar(eerieGlow);
      } else {
        const ghostlyPulse = 1 + Math.sin(state.clock.elapsedTime * 1.1) * 0.02;
        meshRef.current.scale.setScalar(ghostlyPulse);
      }
    }
    
    // Floating cloak animation
    if (cloakRef.current) {
      cloakRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
      cloakRef.current.position.y = 0.7 + Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <group>
      {/* Main spooky figure */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial 
          color="#9932cc" 
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>
      
      {/* Glowing purple eyes */}
      <mesh position={[-0.15, 0.1, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#9932cc"
          emissive="#9932cc"
          emissiveIntensity={0.9}
        />
      </mesh>
      
      <mesh position={[0.15, 0.1, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#9932cc"
          emissive="#9932cc"
          emissiveIntensity={0.9}
        />
      </mesh>
      
      {/* Mysterious smile */}
      <mesh position={[0, -0.15, 0.5]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color="#663399"
          emissive="#663399"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Floating witch hat */}
      <mesh ref={cloakRef} position={[0, 0.7, 0]} rotation={[0, 0, 0.1]}>
        <coneGeometry args={[0.4, 0.8, 8]} />
        <meshStandardMaterial 
          color="#1a0d26"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Hat brim */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.05, 16]} />
        <meshStandardMaterial 
          color="#1a0d26"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Spooky aura */}
      <mesh position={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#9932cc" 
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      
      {/* Ethereal energy field */}
      <mesh position={[0, 0, 0]} scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[0.6, 6, 6]} />
        <meshStandardMaterial 
          color="#663399" 
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
    </group>
  );
}
export default SpookyCharacter;