import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function WholesomeGrandmaScene({ sceneProps }) {
  const fireplaceRef = useRef();
  const embersRef = useRef();
  
  useFrame((state, delta) => {
    // Gentle fireplace glow
    if (fireplaceRef.current) {
      const flicker = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      fireplaceRef.current.material.emissiveIntensity = flicker * (sceneProps?.warmth || 0.9);
    }
    
    // Floating embers
    if (embersRef.current) {
      embersRef.current.rotation.y += delta * (sceneProps?.ambientSpeed || 0.2);
    }
  });
  
  return (
    <group>
      {/* Warm cozy lighting */}
      <ambientLight intensity={0.4} color={sceneProps?.primaryColor || "#FFA500"} />
      <pointLight 
        position={[0, 1, -3]} 
        color={sceneProps?.primaryColor || "#FFA500"}
        intensity={sceneProps?.warmth || 0.9}
      />
      
      {/* Cozy fireplace */}
      <group position={[0, -1, -4]}>
        {/* Fireplace frame */}
        <mesh>
          <boxGeometry args={[3, 2, 0.5]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
        
        {/* Fire glow */}
        <mesh ref={fireplaceRef} position={[0, 0, 0.3]}>
          <planeGeometry args={[2, 1]} />
          <meshStandardMaterial 
            color={sceneProps?.primaryColor || "#FFA500"}
            emissive={sceneProps?.primaryColor || "#FFA500"}
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>
      
      {/* Floating warm embers */}
      <group ref={embersRef}>
        {[...Array(8)].map((_, i) => (
          <mesh 
            key={i}
            position={[
              (Math.random() - 0.5) * 6,
              Math.sin(state.clock?.elapsedTime * 0.5 + i) * 2 + 1,
              (Math.random() - 0.5) * 6
            ]}
          >
            <sphereGeometry args={[0.03, 6, 6]} />
            <meshStandardMaterial 
              color="#FF6347"
              emissive="#FF6347"
              emissiveIntensity={0.6}
            />
          </mesh>
        ))}
      </group>
      
      {/* Cozy armchair */}
      <group position={[2, -1.5, -1]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[1.2, 0.2, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 1, -0.4]}>
          <boxGeometry args={[1.2, 1, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[-0.5, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1, 1, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0.5, 1, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1, 1, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>
      
      {/* Knitting basket */}
      <group position={[-2, -1.8, -1]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.4, 0.3, 8]} />
          <meshStandardMaterial color="#D2691E" />
        </mesh>
        {/* Yarn balls */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#FF69B4" />
        </mesh>
        <mesh position={[0.1, 0.25, 0.1]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
      </group>
      
      {/* Warm wooden floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial 
          color={sceneProps?.bgColor || "#8B4513"}
          roughness={0.8}
        />
      </mesh>
      
      {/* Floating hearts of love */}
      {[...Array(4)].map((_, i) => (
        <mesh 
          key={`heart-${i}`}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 2,
            Math.sin(state.clock?.elapsedTime * 0.8 + i) * 0.3 + 2,
            Math.sin((i / 4) * Math.PI * 2) * 2
          ]}
          scale={[0.2, 0.2, 0.2]}
        >
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial 
            color="#FFB6C1"
            emissive="#FFB6C1"
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
export default WholesomeGrandmaScene;