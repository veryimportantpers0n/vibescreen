import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ZenMonkScene() {
  const groupRef = useRef();
  const torusRef = useRef();
  const sphereRef = useRef();
  const ringRef = useRef();

  // Create flowing organic shapes with peaceful animations
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.1;
    }
    
    if (torusRef.current) {
      torusRef.current.rotation.x = time * 0.2;
      torusRef.current.rotation.z = Math.sin(time * 0.3) * 0.2;
      torusRef.current.position.y = Math.sin(time * 0.4) * 0.5;
    }
    
    if (sphereRef.current) {
      sphereRef.current.position.x = Math.sin(time * 0.2) * 2;
      sphereRef.current.position.z = Math.cos(time * 0.2) * 2;
      sphereRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.2);
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.y = time * 0.15;
      ringRef.current.rotation.x = Math.sin(time * 0.25) * 0.3;
    }
  });

  const material = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: '#4a9eff',
      transparent: true,
      opacity: 0.7,
      wireframe: false
    }), []
  );

  const wireframeMaterial = useMemo(() => 
    new THREE.MeshStandardMaterial({
      color: '#2d5aa0',
      transparent: true,
      opacity: 0.4,
      wireframe: true
    }), []
  );

  return (
    <group ref={groupRef}>
      {/* Flowing torus - main focal point */}
      <mesh ref={torusRef} position={[0, 0, 0]} material={material}>
        <torusGeometry args={[2, 0.6, 16, 32]} />
      </mesh>
      
      {/* Floating sphere */}
      <mesh ref={sphereRef} position={[3, 1, 0]} material={wireframeMaterial}>
        <sphereGeometry args={[0.8, 16, 16]} />
      </mesh>
      
      {/* Rotating ring */}
      <mesh ref={ringRef} position={[-2, -1, 1]} material={material}>
        <ringGeometry args={[1.2, 2, 16]} />
      </mesh>
      
      {/* Additional organic shapes for depth */}
      <mesh position={[0, -3, -2]} rotation={[Math.PI / 4, 0, 0]} material={wireframeMaterial}>
        <torusKnotGeometry args={[1, 0.3, 64, 8]} />
      </mesh>
      
      <mesh position={[4, -2, -3]} material={material}>
        <octahedronGeometry args={[1]} />
      </mesh>
    </group>
  );
}