import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Cylinder, Cone } from '@react-three/drei';

export function CorporateAIScene() {
  const boxRef = useRef();
  const cylinderRef = useRef();
  const coneRef = useRef();

  useFrame((state, delta) => {
    // Steady, predictable rotations for corporate precision
    if (boxRef.current) {
      boxRef.current.rotation.x += delta * 0.5;
      boxRef.current.rotation.y += delta * 0.3;
    }
    
    if (cylinderRef.current) {
      cylinderRef.current.rotation.y += delta * 0.4;
      cylinderRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    
    if (coneRef.current) {
      coneRef.current.rotation.z += delta * 0.6;
      coneRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.3) * 1.5;
    }
  });

  return (
    <group>
      {/* Central rotating cube */}
      <Box ref={boxRef} position={[0, 0, 0]} args={[2, 2, 2]}>
        <meshStandardMaterial color="#00ff00" wireframe />
      </Box>
      
      {/* Floating cylinder */}
      <Cylinder ref={cylinderRef} position={[-3, 1, -2]} args={[0.8, 0.8, 2, 8]}>
        <meshStandardMaterial color="#008f11" wireframe />
      </Cylinder>
      
      {/* Orbiting cone */}
      <Cone ref={coneRef} position={[2, -1, 1]} args={[1, 2, 6]}>
        <meshStandardMaterial color="#00ff00" wireframe />
      </Cone>
      
      {/* Additional geometric shapes for corporate structure */}
      <Box position={[4, 2, -3]} args={[1, 1, 1]}>
        <meshStandardMaterial color="#008f11" wireframe />
      </Box>
      
      <Cylinder position={[-2, -2, 2]} args={[0.5, 0.5, 1.5, 6]}>
        <meshStandardMaterial color="#00ff00" wireframe />
      </Cylinder>
    </group>
  );
}