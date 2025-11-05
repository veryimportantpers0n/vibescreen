import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function TherapistScene({ sceneProps }) {
  const particlesRef = useRef();
  const lightRef = useRef();
  
  useFrame((state, delta) => {
    // Gentle particle rotation
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * (sceneProps?.ambientSpeed || 0.3) * 0.1;
    }
    
    // Warm pulsing light
    if (lightRef.current) {
      const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      lightRef.current.intensity = pulse;
    }
  });
  
  return (
    <group>
      {/* Warm ambient lighting */}
      <ambientLight intensity={0.3} color={sceneProps?.primaryColor || "#ff9966"} />
      
      {/* Pulsing warm point light */}
      <pointLight 
        ref={lightRef}
        position={[0, 2, 0]} 
        color={sceneProps?.primaryColor || "#ff9966"}
        intensity={0.6}
      />
      
      {/* Warm floating particles */}
      <group ref={particlesRef}>
        {[...Array(20)].map((_, i) => (
          <mesh 
            key={i}
            position={[
              (Math.random() - 0.5) * 8,
              Math.sin(state.clock?.elapsedTime * 0.5 + i) * 2,
              (Math.random() - 0.5) * 8
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color={sceneProps?.primaryColor || "#ff9966"}
              emissive={sceneProps?.primaryColor || "#ff9966"}
              emissiveIntensity={0.3}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Cozy background gradient plane */}
      <mesh position={[0, 0, -6]} scale={[12, 8, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color={sceneProps?.bgColor || "#2d2416"}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Soft carpet/rug */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial 
          color="#8B4513"
          roughness={0.9}
        />
      </mesh>
      
      {/* Comfortable chair suggestion */}
      <group position={[0, -1, -2]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.2, 0.1, 1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        <mesh position={[0, 1, -0.4]}>
          <boxGeometry args={[1.2, 1, 0.1]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </group>
      
      {/* Gentle floating orbs for ambiance */}
      {[...Array(5)].map((_, i) => (
        <mesh 
          key={`orb-${i}`}
          position={[
            Math.cos((i / 5) * Math.PI * 2) * 4,
            Math.sin(state.clock?.elapsedTime * 0.2 + i) * 0.5 + 1,
            Math.sin((i / 5) * Math.PI * 2) * 4
          ]}
        >
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshStandardMaterial 
            color="#ffcc99"
            emissive="#ffcc99"
            emissiveIntensity={0.2}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
export default TherapistScene;