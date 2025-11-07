import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

function ChaosScene({ sceneProps }) {
  const groupRef = useRef();
  const planeRefs = useRef([]);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Chaotic jittering movement
      groupRef.current.rotation.x += (Math.random() - 0.5) * delta * 2;
      groupRef.current.rotation.y += (Math.random() - 0.5) * delta * 2;
      groupRef.current.rotation.z += (Math.random() - 0.5) * delta * 2;
      
      // Random position jitter
      groupRef.current.position.x = (Math.random() - 0.5) * 0.1;
      groupRef.current.position.y = (Math.random() - 0.5) * 0.1;
    }
    
    // Update each plane with glitchy effects
    planeRefs.current.forEach((plane, i) => {
      if (plane) {
        // Random color glitching
        const hue = Math.random() * 360;
        plane.material.color.setHSL(hue / 360, 1, 0.5);
        
        // Jittery movement
        plane.position.x += (Math.random() - 0.5) * 0.1;
        plane.position.y += (Math.random() - 0.5) * 0.1;
        plane.position.z += (Math.random() - 0.5) * 0.1;
        
        // Chaotic rotation
        plane.rotation.x += (Math.random() - 0.5) * delta * 5;
        plane.rotation.y += (Math.random() - 0.5) * delta * 5;
        plane.rotation.z += (Math.random() - 0.5) * delta * 5;
      }
    });
  });
  
  return (
    <group ref={groupRef}>
      {/* Jittering planes with random colors */}
      {[...Array(6)].map((_, i) => (
        <mesh 
          key={i}
          ref={(el) => (planeRefs.current[i] = el)}
          position={[
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4
          ]}
          rotation={[
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ]}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial 
            color={sceneProps?.primaryColor || "#ff0080"}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
export default ChaosScene;