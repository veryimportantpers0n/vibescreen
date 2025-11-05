import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function EmotionalDamageScene({ sceneProps }) {
  const lightRef = useRef();
  const screenRef = useRef();
  
  useFrame((state) => {
    // Flickering light effect
    if (lightRef.current) {
      const flicker = 0.3 + Math.random() * (sceneProps?.flickerIntensity || 0.3);
      lightRef.current.intensity = flicker;
    }
    
    // Flickering screen effect
    if (screenRef.current) {
      const screenFlicker = 0.1 + Math.random() * 0.2;
      screenRef.current.material.emissiveIntensity = screenFlicker;
    }
  });
  
  return (
    <group>
      {/* Dim flickering overhead light */}
      <pointLight 
        ref={lightRef} 
        position={[0, 2, 0]} 
        color={sceneProps?.primaryColor || "#666666"}
        intensity={0.3}
      />
      
      {/* Dim room walls */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[10, 6]} />
        <meshStandardMaterial 
          color="#2a2a2a"
          roughness={0.9}
        />
      </mesh>
      
      {/* Floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={1.0}
        />
      </mesh>
      
      {/* Flickering old computer screen */}
      <mesh ref={screenRef} position={[2, 1, -4]}>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial 
          color="#444444"
          emissive="#222222"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Broken desk lamp */}
      <group position={[-2, 0, -3]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.3, 0.5, 8]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      </group>
      
      {/* Scattered papers on floor */}
      {[...Array(3)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            (Math.random() - 0.5) * 4,
            -1.9,
            (Math.random() - 0.5) * 4
          ]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
        >
          <planeGeometry args={[0.3, 0.4]} />
          <meshStandardMaterial 
            color="#f0f0f0"
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
export default EmotionalDamageScene;