import { useFrame } from '@react-three/fiber';
import { useRef, useCallback, useEffect } from 'react';

function ChaosCharacter({ onSpeak }) {
  const meshRef = useRef();
  const speakingRef = useRef(false);
  
  const speak = useCallback(() => {
    speakingRef.current = true;
    setTimeout(() => {
      speakingRef.current = false;
    }, 800); // Shorter, more chaotic speak animation
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Unpredictable movements
      meshRef.current.position.x = (Math.random() - 0.5) * 0.2;
      meshRef.current.position.y = (Math.random() - 0.5) * 0.2;
      meshRef.current.position.z = (Math.random() - 0.5) * 0.1;
      
      // Chaotic rotation
      meshRef.current.rotation.x += (Math.random() - 0.5) * 0.1;
      meshRef.current.rotation.y += (Math.random() - 0.5) * 0.1;
      meshRef.current.rotation.z += (Math.random() - 0.5) * 0.1;
      
      // Random color glitching
      const hue = Math.random();
      meshRef.current.material.color.setHSL(hue, 1, 0.6);
      
      // Glitchy speak animation - erratic scaling and movement
      if (speakingRef.current) {
        const glitchScale = 1 + (Math.random() - 0.5) * 0.4;
        meshRef.current.scale.setScalar(glitchScale);
        
        // Extra chaotic movement when speaking
        meshRef.current.position.x += (Math.random() - 0.5) * 0.3;
        meshRef.current.position.y += (Math.random() - 0.5) * 0.3;
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
      <boxGeometry args={[0.8, 0.8, 0.8]} />
      <meshStandardMaterial 
        color="#ff0080" 
        wireframe
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}
export default ChaosCharacter;