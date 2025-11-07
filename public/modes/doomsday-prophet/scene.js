import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function DoomsdayProphetScene({ sceneProps }) {
  const sphereRef = useRef();
  const smokeRef = useRef();
  
  useFrame((state, delta) => {
    // Ominous approaching red sphere
    if (sphereRef.current) {
      sphereRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.2) * 2 - 3;
      sphereRef.current.rotation.y += delta * (sceneProps?.ambientSpeed || 0.3);
      
      // Pulsing ominous glow
      const pulse = 0.5 + Math.sin(state.clock.elapsedTime * 1.5) * 0.3;
      sphereRef.current.scale.setScalar(pulse);
    }
    
    // Swirling smoke/fog effect
    if (smokeRef.current) {
      smokeRef.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <group>
      {/* Dim red ambient lighting */}
      <ambientLight intensity={0.2} color={sceneProps?.primaryColor || "#ff0000"} />
      
      {/* Ominous red point light */}
      <pointLight 
        position={[0, 0, -2]} 
        color={sceneProps?.primaryColor || "#ff0000"}
        intensity={sceneProps?.ominousIntensity || 0.7}
      />
      
      {/* Approaching red sphere of doom */}
      <mesh ref={sphereRef} position={[0, 0, -3]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial 
          color={sceneProps?.primaryColor || "#ff0000"}
          emissive={sceneProps?.primaryColor || "#ff0000"}
          emissiveIntensity={0.4}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Dark swirling smoke */}
      <group ref={smokeRef}>
        {[...Array(8)].map((_, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 4,
              Math.sin(state.clock?.elapsedTime * 0.3 + i) * 0.5,
              Math.sin((i / 8) * Math.PI * 2) * 4
            ]}
          >
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial 
              color="#440000"
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
      </group>
      
      {/* Cracked ground */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial 
          color="#220000"
          roughness={1.0}
        />
      </mesh>
      
      {/* Ominous floating debris */}
      {[...Array(5)].map((_, i) => (
        <mesh 
          key={`debris-${i}`}
          position={[
            (Math.random() - 0.5) * 8,
            Math.sin(state.clock?.elapsedTime * 0.2 + i) * 2 + 1,
            (Math.random() - 0.5) * 8
          ]}
          rotation={[
            state.clock?.elapsedTime * 0.1 + i,
            state.clock?.elapsedTime * 0.15 + i,
            0
          ]}
        >
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial 
            color="#660000"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      
      {/* Dark background plane */}
      <mesh position={[0, 0, -8]} scale={[15, 10, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color={sceneProps?.bgColor || "#330000"}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}
export default DoomsdayProphetScene;