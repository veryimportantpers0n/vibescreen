import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function WholesomeGrandmaCharacter({ onSpeak }) {
  const meshRef = useRef();
  const glassesRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 2500); // Gentle, caring speak animation
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle, caring floating motion
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
      
      // Slight rocking motion like in a rocking chair
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * 0.01;
      
      // Warm speak animation - gentle glow
      if (speakingRef.current) {
        const warmPulse = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.04;
        meshRef.current.scale.setScalar(warmPulse);
      } else {
        const gentlePulse = 1 + Math.sin(state.clock.elapsedTime * 1.2) * 0.015;
        meshRef.current.scale.setScalar(gentlePulse);
      }
    }
    
    // Glasses adjustment animation
    if (glassesRef.current) {
      glassesRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.005;
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <group>
      {/* Main grandma figure */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 16, 16]} />
        <meshStandardMaterial 
          color="#FFA500" 
          transparent
          opacity={0.9}
          wireframe
        />
      </mesh>
      
      {/* Kind, twinkling eyes */}
      <mesh position={[-0.12, 0.1, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color="#87CEEB"
          emissive="#87CEEB"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      <mesh position={[0.12, 0.1, 0.5]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial 
          color="#87CEEB"
          emissive="#87CEEB"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Gentle smile */}
      <mesh position={[0, -0.15, 0.5]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.12, 0.02, 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color="#FFB6C1"
          emissive="#FFB6C1"
          emissiveIntensity={0.2}
        />
      </mesh>
      
      {/* Reading glasses */}
      <mesh ref={glassesRef} position={[0, 0.05, 0.45]} scale={[1.2, 0.8, 0.1]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshStandardMaterial 
          color="#C0C0C0"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {/* Gray hair bun */}
      <mesh position={[0, 0.5, -0.2]} scale={[0.8, 0.6, 0.8]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial 
          color="#D3D3D3"
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Warm loving aura */}
      <mesh position={[0, 0, 0]} scale={[1.3, 1.3, 1.3]}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial 
          color="#FFA500" 
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
      
      {/* Extended caring energy field */}
      <mesh position={[0, 0, 0]} scale={[1.7, 1.7, 1.7]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#FFB6C1" 
          transparent
          opacity={0.08}
          wireframe
        />
      </mesh>
    </group>
  );
}
export default WholesomeGrandmaCharacter;