import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function CorporateAIScene({ sceneProps }) {
  const groupRef = useRef();
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (sceneProps?.ambientSpeed || 0.2);
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Rotating polished cubes */}
      <mesh position={[-2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color={sceneProps?.primaryColor || "#007acc"} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh position={[2, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#0066aa" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#004488" 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default CorporateAIScene;