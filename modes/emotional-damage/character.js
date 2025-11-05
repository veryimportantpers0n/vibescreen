import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function EmotionalDamageCharacter({ onSpeak }) {
  const meshRef = useRef();
  const eyeLeftRef = useRef();
  const eyeRightRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 2000); // Longer speak animation for dramatic effect
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Subtle annoyed swaying
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      
      // Slight up-down movement (sighing motion)
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
      
      // Sarcastic speak animation - eye roll effect
      if (speakingRef.current) {
        const rollIntensity = Math.sin(state.clock.elapsedTime * 4) * 0.1;
        if (eyeLeftRef.current && eyeRightRef.current) {
          eyeLeftRef.current.position.y = rollIntensity;
          eyeRightRef.current.position.y = rollIntensity;
        }
        
        // Slight head tilt during speaking
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 3) * 0.03;
      } else {
        // Reset eye positions
        if (eyeLeftRef.current && eyeRightRef.current) {
          eyeLeftRef.current.position.y = 0.1;
          eyeRightRef.current.position.y = 0.1;
        }
        meshRef.current.rotation.x = 0;
      }
    }
  });
  
  // Register speak function with parent
  useEffect(() => {
    if (onSpeak) onSpeak(speak);
  }, [onSpeak, speak]);
  
  return (
    <group>
      {/* Main character body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.6, 12, 12]} />
        <meshStandardMaterial 
          color="#666666" 
          transparent
          opacity={0.9}
          wireframe
        />
      </mesh>
      
      {/* Annoyed eyes */}
      <mesh 
        ref={eyeLeftRef}
        position={[-0.2, 0.1, 0.5]}
      >
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ff4444"
          emissive="#ff2222"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      <mesh 
        ref={eyeRightRef}
        position={[0.2, 0.1, 0.5]}
      >
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color="#ff4444"
          emissive="#ff2222"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Frowning mouth */}
      <mesh position={[0, -0.2, 0.5]}>
        <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
        <meshStandardMaterial 
          color="#444444"
          rotation={[0, 0, Math.PI]}
        />
      </mesh>
      
      {/* Dim aura of disappointment */}
      <mesh position={[0, 0, 0]} scale={[1.3, 1.3, 1.3]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial 
          color="#333333" 
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
}
export default EmotionalDamageCharacter;