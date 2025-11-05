import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function ZenMonkScene({ sceneProps }) {
  const lotusRef = useRef();
  
  useFrame((state, delta) => {
    // Slow lotus rotation
    if (lotusRef.current) {
      lotusRef.current.rotation.y += delta * (sceneProps?.ambientSpeed || 0.05);
    }
    
    // Gentle camera pan
    state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.5;
  });
  
  return (
    <group>
      {/* Floating lotus petals */}
      <group ref={lotusRef}>
        {[...Array(8)].map((_, i) => (
          <mesh 
            key={i}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 2,
              Math.sin(state.clock?.elapsedTime * 0.5 + i) * 0.2,
              Math.sin((i / 8) * Math.PI * 2) * 2
            ]}
            rotation={[0, (i / 8) * Math.PI * 2, 0]}
          >
            <planeGeometry args={[0.8, 0.4]} />
            <meshStandardMaterial 
              color={sceneProps?.primaryColor || "#00ff88"}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
      </group>
      
      {/* Central meditation stone */}
      <mesh position={[0, -1, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial 
          color="#444444"
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}
export default ZenMonkScene;