import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/**
 * DefaultScene - Fallback scene component used when mode-specific scenes fail to load
 * Provides a simple, reliable 3D scene that always works
 */
const DefaultScene = ({ sceneProps = {} }) => {
  const meshRef = useRef();
  const groupRef = useRef();

  // Simple rotation animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />

      {/* Central rotating cube */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={sceneProps.bgColor || "#00ff00"} 
          wireframe 
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Surrounding wireframe spheres */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        return (
          <mesh key={i} position={[x, 0, z]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshBasicMaterial 
              color="#008f11" 
              wireframe 
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {/* Grid floor */}
      <gridHelper args={[10, 10, "#003300", "#001100"]} position={[0, -2, 0]} />
    </group>
  );
};

export default DefaultScene;
export { DefaultScene };