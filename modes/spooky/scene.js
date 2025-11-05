import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function SpookyScene({ sceneProps }) {
  const fogRef = useRef();
  const ghostsRef = useRef();
  
  useFrame((state, delta) => {
    // Swirling fog effects
    if (fogRef.current) {
      fogRef.current.rotation.y += delta * (sceneProps?.ambientSpeed || 0.4);
    }
    
    // Floating ghost sprites
    if (ghostsRef.current) {
      ghostsRef.current.rotation.y += delta * 0.2;
    }
  });
  
  return (
    <group>
      {/* Eerie purple lighting */}
      <ambientLight intensity={0.2} color={sceneProps?.primaryColor || "#9932cc"} />
      <pointLight 
        position={[0, 3, 0]} 
        color={sceneProps?.primaryColor || "#9932cc"}
        intensity={sceneProps?.fogIntensity || 0.6}
      />
      
      {/* Swirling fog effects */}
      <group ref={fogRef}>
        {[...Array(12)].map((_, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos((i / 12) * Math.PI * 2) * 5,
              Math.sin(state.clock?.elapsedTime * 0.3 + i) * 0.5,
              Math.sin((i / 12) * Math.PI * 2) * 5
            ]}
          >
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshStandardMaterial 
              color="#663399"
              transparent
              opacity={0.3}
            />
          </mesh>
        ))}
      </group>
      
      {/* Floating ghost sprites */}
      <group ref={ghostsRef}>
        {[...Array(6)].map((_, i) => (
          <mesh 
            key={`ghost-${i}`}
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 3,
              Math.sin(state.clock?.elapsedTime * 0.5 + i) * 1 + 2,
              Math.sin((i / 6) * Math.PI * 2) * 3
            ]}
            rotation={[0, state.clock?.elapsedTime * 0.3 + i, 0]}
          >
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial 
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.2}
              transparent
              opacity={0.6}
            />
          </mesh>
        ))}
      </group>
      
      {/* Spooky trees */}
      <group position={[-4, -1, -3]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
          <meshStandardMaterial color="#2d1b2e" />
        </mesh>
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial 
            color="#1a0d26"
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
      
      <group position={[4, -1, -4]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.25, 2.5, 8]} />
          <meshStandardMaterial color="#2d1b2e" />
        </mesh>
        <mesh position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.8, 8, 8]} />
          <meshStandardMaterial 
            color="#1a0d26"
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>
      
      {/* Floating jack-o'-lanterns */}
      {[...Array(3)].map((_, i) => (
        <mesh 
          key={`pumpkin-${i}`}
          position={[
            (i - 1) * 3,
            Math.sin(state.clock?.elapsedTime * 0.8 + i) * 0.2 + 1,
            -2
          ]}
          rotation={[0, state.clock?.elapsedTime * 0.2 + i, 0]}
        >
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial 
            color="#ff6600"
            emissive="#ff6600"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
      
      {/* Spooky ground */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[15, 15]} />
        <meshStandardMaterial 
          color={sceneProps?.bgColor || "#1a0d26"}
          roughness={1.0}
        />
      </mesh>
      
      {/* Mysterious purple orbs */}
      {[...Array(8)].map((_, i) => (
        <mesh 
          key={`orb-${i}`}
          position={[
            (Math.random() - 0.5) * 10,
            Math.sin(state.clock?.elapsedTime * 0.6 + i) * 2 + 1,
            (Math.random() - 0.5) * 10
          ]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color={sceneProps?.primaryColor || "#9932cc"}
            emissive={sceneProps?.primaryColor || "#9932cc"}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      
      {/* Dark background */}
      <mesh position={[0, 0, -8]} scale={[20, 12, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color={sceneProps?.bgColor || "#1a0d26"}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}
export default SpookyScene;