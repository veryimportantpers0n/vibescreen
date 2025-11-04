import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ChaosScene() {
  const groupRef = useRef();
  const meshRefs = useRef([]);
  
  // Create multiple chaotic shapes with random properties
  const shapes = useMemo(() => {
    const shapeArray = [];
    for (let i = 0; i < 15; i++) {
      shapeArray.push({
        id: i,
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 10
        ],
        rotation: [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ],
        scale: Math.random() * 2 + 0.5,
        color: new THREE.Color().setHSL(Math.random(), 1, 0.5),
        speed: Math.random() * 0.1 + 0.05,
        type: Math.floor(Math.random() * 4) // 0: box, 1: sphere, 2: cone, 3: torus
      });
    }
    return shapeArray;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate the entire group chaotically
    if (groupRef.current) {
      groupRef.current.rotation.x = Math.sin(time * 0.7) * 0.3;
      groupRef.current.rotation.y = time * 0.5;
      groupRef.current.rotation.z = Math.cos(time * 0.3) * 0.2;
    }
    
    // Animate each shape individually
    meshRefs.current.forEach((mesh, index) => {
      if (mesh) {
        const shape = shapes[index];
        
        // Erratic rotation
        mesh.rotation.x += shape.speed * 3;
        mesh.rotation.y += shape.speed * 2;
        mesh.rotation.z += shape.speed * 4;
        
        // Chaotic movement
        mesh.position.x = shape.position[0] + Math.sin(time * shape.speed * 10) * 3;
        mesh.position.y = shape.position[1] + Math.cos(time * shape.speed * 8) * 2;
        mesh.position.z = shape.position[2] + Math.sin(time * shape.speed * 6) * 2;
        
        // Pulsing scale
        const pulseScale = 1 + Math.sin(time * shape.speed * 15) * 0.5;
        mesh.scale.setScalar(shape.scale * pulseScale);
        
        // Rapidly changing colors
        const hue = (time * shape.speed * 5 + index * 0.1) % 1;
        mesh.material.color.setHSL(hue, 1, 0.6);
      }
    });
  });

  const getGeometry = (type) => {
    switch (type) {
      case 0: return <boxGeometry args={[1, 1, 1]} />;
      case 1: return <sphereGeometry args={[0.7, 16, 16]} />;
      case 2: return <coneGeometry args={[0.7, 1.5, 8]} />;
      case 3: return <torusGeometry args={[0.7, 0.3, 8, 16]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <group ref={groupRef}>
      {shapes.map((shape, index) => (
        <mesh
          key={shape.id}
          ref={(el) => (meshRefs.current[index] = el)}
          position={shape.position}
          rotation={shape.rotation}
          scale={shape.scale}
        >
          {getGeometry(shape.type)}
          <meshStandardMaterial
            color={shape.color}
            wireframe={Math.random() > 0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
      
      {/* Additional chaotic particles */}
      {Array.from({ length: 30 }, (_, i) => (
        <mesh
          key={`particle-${i}`}
          position={[
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15
          ]}
        >
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshBasicMaterial
            color={new THREE.Color().setHSL(Math.random(), 1, 0.8)}
          />
        </mesh>
      ))}
    </group>
  );
}