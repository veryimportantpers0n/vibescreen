import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function InfluencerCharacter({ onSpeak }) {
  const meshRef = useRef();
  const accessoryRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 1800); // Animated, expressive speak animation
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Bouncy, energetic movement
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2.5) * 0.06;
      
      // Slight pose rotation
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
      
      // Expressive speak animation - dramatic pulsing
      if (speakingRef.current) {
        const expressivePulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.08;
        meshRef.current.scale.setScalar(expressivePulse);
      } else {
        const socialPulse = 1 + Math.sin(state.clock.elapsedTime * 1.8) * 0.03;
        meshRef.current.scale.setScalar(socialPulse);
      }
    }
    
    // Floating accessory animation
    if (accessoryRef.current) {
      accessoryRef.current.rotation.y = state.clock.elapsedTime * 2;
      accessoryRef.current.position.y = 0.9 + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <group>
      {/* Main influencer figure */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial 
          color="#ff69b4" 
          emissive="#ff69b4"
          emissiveIntensity={0.3}
          wireframe
        />
      </mesh>
      
      {/* Sparkling eyes */}
      <mesh position={[-0.15, 0.15, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ffccff"
          emissive="#ffccff"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      <mesh position={[0.15, 0.15, 0.5]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ffccff"
          emissive="#ffccff"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Perfect smile */}
      <mesh position={[0, -0.1, 0.5]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.18, 0.03, 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Floating crown/tiara accessory */}
      <mesh ref={accessoryRef} position={[0, 0.9, 0]} scale={[0.4, 0.4, 0.4]}>
        <coneGeometry args={[0.3, 0.2, 6]} />
        <meshStandardMaterial 
          color="#ffd700"
          emissive="#ffd700"
          emissiveIntensity={0.6}
        />
      </mesh>
      
      {/* Glamorous aura */}
      <mesh position={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial 
          color="#ff69b4" 
          transparent
          opacity={0.2}
          wireframe
        />
      </mesh>
      
      {/* Sparkle energy field */}
      <mesh position={[0, 0, 0]} scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#ffccff" 
          transparent
          opacity={0.12}
          wireframe
        />
      </mesh>
    </group>
  );
}
export default InfluencerCharacter;