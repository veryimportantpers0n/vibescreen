import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function TherapistCharacter({ onSpeak }) {
  const meshRef = useRef();
  const heartRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 2500); // Longer, more thoughtful speak animation
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle, caring floating motion
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.03;
      
      // Peaceful breathing animation
      const breathScale = 1 + Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      
      // Warm speak animation - gentle glow and nod
      if (speakingRef.current) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.03;
        meshRef.current.scale.setScalar(breathScale * pulse);
        
        // Gentle nodding motion
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      } else {
        meshRef.current.scale.setScalar(breathScale);
        meshRef.current.rotation.x = 0;
      }
      
      // Subtle caring sway
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.6) * 0.01;
    }
    
    // Floating heart animation
    if (heartRef.current) {
      heartRef.current.position.y = 0.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      heartRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <group>
      {/* Main therapist figure */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial 
          color="#ff9966" 
          transparent
          opacity={0.9}
          wireframe
        />
      </mesh>
      
      {/* Caring eyes */}
      <mesh position={[-0.15, 0.15, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color="#66ccff"
          emissive="#66ccff"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <mesh position={[0.15, 0.15, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color="#66ccff"
          emissive="#66ccff"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Gentle smile */}
      <mesh position={[0, -0.1, 0.5]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.12, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color="#ffcc99"
          emissive="#ffcc99"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Floating heart above */}
      <mesh ref={heartRef} position={[0, 0.8, 0]} scale={[0.3, 0.3, 0.3]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial 
          color="#ff6699"
          emissive="#ff6699"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Warm caring aura */}
      <mesh position={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial 
          color="#ff9966" 
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      
      {/* Extended warm aura */}
      <mesh position={[0, 0, 0]} scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#ffcc99" 
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
    </group>
  );
}
export default TherapistCharacter;