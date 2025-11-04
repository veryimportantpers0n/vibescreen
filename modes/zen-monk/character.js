import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ZenMonkCharacter({ onSpeak }) {
  const characterRef = useRef();
  const headRef = useRef();
  const bodyRef = useRef();
  const armLeftRef = useRef();
  const armRightRef = useRef();
  const legLeftRef = useRef();
  const legRightRef = useRef();

  // Handle speak animation
  useEffect(() => {
    if (onSpeak && characterRef.current) {
      // Gentle meditation pose adjustment when speaking
      const originalY = characterRef.current.position.y;
      characterRef.current.position.y = originalY + 0.1;
      
      setTimeout(() => {
        if (characterRef.current) {
          characterRef.current.position.y = originalY;
        }
      }, 500);
    }
  }, [onSpeak]);

  // Peaceful breathing animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (bodyRef.current) {
      // Gentle breathing motion
      bodyRef.current.scale.y = 1 + Math.sin(time * 2) * 0.05;
    }
    
    if (headRef.current) {
      // Subtle head movement
      headRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
    }
    
    // Gentle swaying
    if (characterRef.current) {
      characterRef.current.rotation.z = Math.sin(time * 0.3) * 0.05;
    }
  });

  const material = new THREE.MeshStandardMaterial({
    color: '#4a9eff',
    transparent: true,
    opacity: 0.8,
    wireframe: true
  });

  return (
    <group ref={characterRef} position={[0, -1, 0]}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.2, 0]} material={material}>
        <sphereGeometry args={[0.25, 8, 8]} />
      </mesh>
      
      {/* Body - sitting meditation pose */}
      <mesh ref={bodyRef} position={[0, 0.3, 0]} material={material}>
        <cylinderGeometry args={[0.2, 0.3, 0.8]} />
      </mesh>
      
      {/* Arms in meditation position */}
      <mesh ref={armLeftRef} position={[-0.4, 0.5, 0]} rotation={[0, 0, Math.PI / 4]} material={material}>
        <cylinderGeometry args={[0.08, 0.08, 0.6]} />
      </mesh>
      
      <mesh ref={armRightRef} position={[0.4, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]} material={material}>
        <cylinderGeometry args={[0.08, 0.08, 0.6]} />
      </mesh>
      
      {/* Legs in lotus position */}
      <mesh ref={legLeftRef} position={[-0.3, -0.2, 0.2]} rotation={[Math.PI / 6, 0, Math.PI / 8]} material={material}>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
      </mesh>
      
      <mesh ref={legRightRef} position={[0.3, -0.2, 0.2]} rotation={[Math.PI / 6, 0, -Math.PI / 8]} material={material}>
        <cylinderGeometry args={[0.1, 0.1, 0.5]} />
      </mesh>
      
      {/* Meditation cushion */}
      <mesh position={[0, -0.6, 0]} material={material}>
        <cylinderGeometry args={[0.5, 0.5, 0.1]} />
      </mesh>
    </group>
  );
}