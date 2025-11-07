import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function InfluencerScene({ sceneProps }) {
  const sparklesRef = useRef();
  const cameraRef = useRef();
  
  useFrame((state, delta) => {
    // Sparkle particle animation
    if (sparklesRef.current) {
      sparklesRef.current.rotation.y += delta * (sceneProps?.ambientSpeed || 1.0);
    }
    
    // Quick camera zoom effects
    if (cameraRef.current) {
      const zoom = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      cameraRef.current.scale.setScalar(zoom);
    }
  });
  
  return (
    <group>
      {/* Bright pink/magenta lighting */}
      <ambientLight intensity={0.5} color={sceneProps?.primaryColor || "#ff69b4"} />
      <pointLight 
        position={[2, 3, 2]} 
        color={sceneProps?.primaryColor || "#ff69b4"}
        intensity={sceneProps?.sparkleIntensity || 0.8}
      />
      <pointLight 
        position={[-2, 3, 2]} 
        color="#ffccff"
        intensity={0.6}
      />
      
      {/* Sparkle particles everywhere */}
      <group ref={sparklesRef}>
        {[...Array(20)].map((_, i) => (
          <mesh 
            key={i}
            position={[
              (Math.random() - 0.5) * 10,
              Math.sin(state.clock?.elapsedTime * 2 + i) * 3,
              (Math.random() - 0.5) * 10
            ]}
            rotation={[
              state.clock?.elapsedTime * 2 + i,
              state.clock?.elapsedTime * 1.5 + i,
              0
            ]}
          >
            <octahedronGeometry args={[0.1]} />
            <meshStandardMaterial 
              color={i % 2 === 0 ? "#ff69b4" : "#ffccff"}
              emissive={i % 2 === 0 ? "#ff69b4" : "#ffccff"}
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}
      </group>
      
      {/* Ring light setup */}
      <mesh position={[0, 1, -2]} rotation={[0, 0, 0]}>
        <torusGeometry args={[1.5, 0.1, 8, 32]} />
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Camera/phone on tripod */}
      <group ref={cameraRef} position={[0, 0, -1]}>
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.2, 0.3, 0.1]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      </group>
      
      {/* Aesthetic background gradient */}
      <mesh position={[0, 0, -5]} scale={[12, 8, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color={sceneProps?.bgColor || "#ffccff"}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* Floating hearts */}
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={`heart-${i}`}
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 3,
            Math.sin(state.clock?.elapsedTime * 1.5 + i) * 1 + 2,
            Math.sin((i / 6) * Math.PI * 2) * 3
          ]}
          scale={[0.3, 0.3, 0.3]}
        >
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial 
            color="#ff1493"
            emissive="#ff1493"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
      
      {/* Glossy floor for reflections */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial 
          color="#ffffff"
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}
export default InfluencerScene;