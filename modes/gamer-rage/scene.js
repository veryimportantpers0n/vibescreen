import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function GamerRageScene({ sceneProps }) {
  const scoreboardRef = useRef();
  const particlesRef = useRef();
  
  useFrame((state, delta) => {
    // Rapid scoreboard updates
    if (scoreboardRef.current) {
      scoreboardRef.current.rotation.y += delta * (sceneProps?.ambientSpeed || 2.0);
      
      // Aggressive pulsing
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.2;
      scoreboardRef.current.scale.setScalar(pulse);
    }
    
    // Fast-moving competitive particles
    if (particlesRef.current) {
      particlesRef.current.rotation.x += delta * 1.5;
      particlesRef.current.rotation.z += delta * 0.8;
    }
  });
  
  return (
    <group>
      {/* Intense green gaming lighting */}
      <ambientLight intensity={0.3} color={sceneProps?.primaryColor || "#00ff00"} />
      <pointLight 
        position={[0, 3, 0]} 
        color={sceneProps?.primaryColor || "#00ff00"}
        intensity={sceneProps?.rageIntensity || 1.2}
      />
      
      {/* Central scoreboard display */}
      <mesh ref={scoreboardRef}>
        <boxGeometry args={[3, 2, 0.2]} />
        <meshStandardMaterial 
          color="#001100"
          emissive={sceneProps?.primaryColor || "#00ff00"}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Scoreboard frame */}
      <mesh>
        <boxGeometry args={[3.2, 2.2, 0.1]} />
        <meshStandardMaterial 
          color={sceneProps?.primaryColor || "#00ff00"}
          emissive={sceneProps?.primaryColor || "#00ff00"}
          emissiveIntensity={0.6}
          wireframe
        />
      </mesh>
      
      {/* Fast-moving competitive particles */}
      <group ref={particlesRef}>
        {[...Array(12)].map((_, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos((i / 12) * Math.PI * 2) * 4,
              Math.sin(state.clock?.elapsedTime * 3 + i) * 1.5,
              Math.sin((i / 12) * Math.PI * 2) * 4
            ]}
          >
            <sphereGeometry args={[0.1, 6, 6]} />
            <meshStandardMaterial 
              color={sceneProps?.primaryColor || "#00ff00"}
              emissive={sceneProps?.primaryColor || "#00ff00"}
              emissiveIntensity={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Gaming setup elements */}
      <group position={[-2, -1, -1]}>
        {/* Monitor */}
        <mesh>
          <boxGeometry args={[1, 0.6, 0.1]} />
          <meshStandardMaterial 
            color="#000000"
            emissive={sceneProps?.primaryColor || "#00ff00"}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Keyboard */}
        <mesh position={[0, -0.5, 0.3]}>
          <boxGeometry args={[0.8, 0.05, 0.3]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
      
      {/* Competitive arena floor */}
      <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12, 6, 6]} />
        <meshStandardMaterial 
          color={sceneProps?.primaryColor || "#00ff00"}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
      
      {/* Victory/kill streak indicators */}
      {[...Array(4)].map((_, i) => (
        <mesh 
          key={`indicator-${i}`}
          position={[
            (i - 1.5) * 2,
            2 + Math.sin(state.clock?.elapsedTime * 4 + i) * 0.3,
            -3
          ]}
        >
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial 
            color="#ffff00"
            emissive="#ffff00"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}
export default GamerRageScene;