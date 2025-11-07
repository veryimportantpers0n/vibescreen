import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function GamerRageCharacter({ onSpeak }) {
  const meshRef = useRef();
  const headsetRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 1200); // Quick, intense speak animation
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Aggressive competitive bouncing
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.08;
      
      // Rapid competitive rotation
      meshRef.current.rotation.y += 0.03;
      
      // Intense speak animation - rapid pulsing
      if (speakingRef.current) {
        const ragePulse = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.15;
        meshRef.current.scale.setScalar(ragePulse);
      } else {
        const competitivePulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
        meshRef.current.scale.setScalar(competitivePulse);
      }
    }
    
    // Gaming headset animation
    if (headsetRef.current) {
      headsetRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.02;
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <group>
      {/* Main gamer figure */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00"
          emissiveIntensity={0.4}
          wireframe
        />
      </mesh>
      
      {/* Intense focused eyes */}
      <mesh position={[-0.15, 0.15, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.9}
        />
      </mesh>
      
      <mesh position={[0.15, 0.15, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.9}
        />
      </mesh>
      
      {/* Competitive grin */}
      <mesh position={[0, -0.1, 0.5]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Gaming headset */}
      <mesh ref={headsetRef} position={[0, 0.4, 0]} scale={[1.2, 0.3, 1.2]}>
        <torusGeometry args={[0.7, 0.1, 8, 16]} />
        <meshStandardMaterial 
          color="#333333"
          emissive="#00ff00"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Competitive aura */}
      <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#00ff00" 
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
      
      {/* Victory energy field */}
      <mesh position={[0, 0, 0]} scale={[2, 2, 2]}>
        <sphereGeometry args={[0.6, 6, 6]} />
        <meshStandardMaterial 
          color="#ffff00" 
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
}
export default GamerRageCharacter;