import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function StartupFounderScene({ sceneProps }) {
  const pillarRef = useRef();
  const ringsRef = useRef();
  
  useFrame((state, delta) => {
    // Energetic pillar pulsing
    if (pillarRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
      pillarRef.current.scale.setScalar(pulse);
      pillarRef.current.rotation.y += delta * (sceneProps?.ambientSpeed || 1.5);
    }
    
    // Fast rotating energy rings
    if (ringsRef.current) {
      ringsRef.current.rotation.y += delta * 2;
      ringsRef.current.rotation.x += delta * 0.5;
    }
  });
  
  return (
    <group>
      {/* Bright neon lighting */}
      <ambientLight intensity={0.4} color={sceneProps?.primaryColor || "#00ffff"} />
      <pointLight 
        position={[0, 5, 0]} 
        color={sceneProps?.primaryColor || "#00ffff"}
        intensity={2}
      />
      
      {/* Central pulsing neon pillar */}
      <mesh ref={pillarRef}>
        <cylinderGeometry args={[0.3, 0.3, 4, 8]} />
        <meshStandardMaterial 
          color={sceneProps?.primaryColor || "#00ffff"}
          emissive={sceneProps?.primaryColor || "#00ffff"}
          emissiveIntensity={sceneProps?.neonIntensity || 0.9}
          wireframe
        />
      </mesh>
      
      {/* Energy rings around pillar */}
      <group ref={ringsRef}>
        {[...Array(3)].map((_, i) => (
          <mesh 
            key={i}
            position={[0, (i - 1) * 1.5, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[1 + i * 0.5, 0.1, 8, 16]} />
            <meshStandardMaterial 
              color={sceneProps?.primaryColor || "#00ffff"}
              emissive={sceneProps?.primaryColor || "#00ffff"}
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Floating data cubes */}
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i}
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 3,
            Math.sin(state.clock?.elapsedTime * 2 + i) * 1,
            Math.sin((i / 6) * Math.PI * 2) * 3
          ]}
          rotation={[
            state.clock?.elapsedTime * 0.5 + i,
            state.clock?.elapsedTime * 0.7 + i,
            0
          ]}
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial 
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.4}
            wireframe
          />
        </mesh>
      ))}
      
      {/* Grid floor */}
      <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20, 10, 10]} />
        <meshStandardMaterial 
          color={sceneProps?.primaryColor || "#00ffff"}
          wireframe
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}
export default StartupFounderScene;