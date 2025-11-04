import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box } from '@react-three/drei';

export function CorporateAICharacter({ onSpeak }) {
  const characterRef = useRef();
  const headRef = useRef();
  const speakAnimation = useRef(false);

  useEffect(() => {
    if (onSpeak) {
      speakAnimation.current = true;
      // Reset animation after 2 seconds
      setTimeout(() => {
        speakAnimation.current = false;
      }, 2000);
    }
  }, [onSpeak]);

  useFrame((state, delta) => {
    // Subtle idle animation
    if (characterRef.current) {
      characterRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 - 1;
    }
    
    // Head animation when speaking
    if (headRef.current && speakAnimation.current) {
      headRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 8) * 0.1);
    } else if (headRef.current) {
      headRef.current.scale.setScalar(1);
    }
  });

  return (
    <group ref={characterRef} position={[0, -1, 0]}>
      {/* Body - cylindrical business figure */}
      <Cylinder position={[0, 0, 0]} args={[0.3, 0.3, 1.5]}>
        <meshStandardMaterial color="#00ff00" wireframe />
      </Cylinder>
      
      {/* Head */}
      <Box ref={headRef} position={[0, 1, 0]} args={[0.4, 0.4, 0.4]}>
        <meshStandardMaterial color="#00ff00" wireframe />
      </Box>
      
      {/* Arms */}
      <Cylinder position={[-0.5, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} args={[0.1, 0.1, 0.8]}>
        <meshStandardMaterial color="#008f11" wireframe />
      </Cylinder>
      <Cylinder position={[0.5, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} args={[0.1, 0.1, 0.8]}>
        <meshStandardMaterial color="#008f11" wireframe />
      </Cylinder>
      
      {/* Legs */}
      <Cylinder position={[-0.2, -1, 0]} args={[0.1, 0.1, 0.8]}>
        <meshStandardMaterial color="#008f11" wireframe />
      </Cylinder>
      <Cylinder position={[0.2, -1, 0]} args={[0.1, 0.1, 0.8]}>
        <meshStandardMaterial color="#008f11" wireframe />
      </Cylinder>
      
      {/* Corporate briefcase accessory */}
      <Box position={[0.8, -0.2, 0]} args={[0.3, 0.2, 0.1]}>
        <meshStandardMaterial color="#00ff00" wireframe />
      </Box>
    </group>
  );
}