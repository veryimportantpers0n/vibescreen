import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ChaosCharacter({ onSpeak }) {
  const characterRef = useRef();
  const headRef = useRef();
  const bodyRef = useRef();
  const armRefs = useRef([]);
  const legRefs = useRef([]);
  const speakTrigger = useRef(false);

  useEffect(() => {
    if (onSpeak) {
      speakTrigger.current = true;
      // Reset speak trigger after animation
      setTimeout(() => {
        speakTrigger.current = false;
      }, 1000);
    }
  }, [onSpeak]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (characterRef.current) {
      // Energetic bouncing motion
      const bounceHeight = Math.abs(Math.sin(time * 8)) * 0.8 + 0.2;
      characterRef.current.position.y = -1 + bounceHeight;
      
      // Chaotic spinning
      characterRef.current.rotation.y = time * 2;
      characterRef.current.rotation.z = Math.sin(time * 3) * 0.3;
    }
    
    // Head animation - rapid nodding and color changes
    if (headRef.current) {
      headRef.current.rotation.x = Math.sin(time * 12) * 0.4;
      headRef.current.rotation.z = Math.cos(time * 8) * 0.2;
      
      // Rapidly changing head color
      const hue = (time * 3) % 1;
      headRef.current.material.color.setHSL(hue, 1, 0.6);
      
      // Speak animation - extra wild head movement
      if (speakTrigger.current) {
        headRef.current.rotation.x += Math.sin(time * 20) * 0.3;
        headRef.current.scale.setScalar(1 + Math.sin(time * 15) * 0.2);
      } else {
        headRef.current.scale.setScalar(1);
      }
    }
    
    // Body pulsing and color changing
    if (bodyRef.current) {
      const pulse = 1 + Math.sin(time * 6) * 0.3;
      bodyRef.current.scale.set(pulse, 1, pulse);
      
      const bodyHue = (time * 2 + 0.3) % 1;
      bodyRef.current.material.color.setHSL(bodyHue, 1, 0.5);
    }
    
    // Arm flailing
    armRefs.current.forEach((arm, index) => {
      if (arm) {
        const offset = index * Math.PI;
        arm.rotation.z = Math.sin(time * 10 + offset) * 1.5;
        arm.rotation.x = Math.cos(time * 8 + offset) * 0.8;
        
        const armHue = (time * 4 + index * 0.5) % 1;
        arm.material.color.setHSL(armHue, 1, 0.7);
      }
    });
    
    // Leg kicking
    legRefs.current.forEach((leg, index) => {
      if (leg) {
        const offset = index * Math.PI;
        leg.rotation.x = Math.sin(time * 12 + offset) * 0.6;
        
        const legHue = (time * 5 + index * 0.3) % 1;
        leg.material.color.setHSL(legHue, 1, 0.4);
      }
    });
  });

  return (
    <group ref={characterRef} position={[0, -1, 0]}>
      {/* Head - Rapidly changing sphere */}
      <mesh ref={headRef} position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshStandardMaterial 
          color="#ff0080" 
          wireframe={false}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Body - Pulsing cylinder */}
      <mesh ref={bodyRef} position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.25, 0.35, 1]} />
        <meshStandardMaterial 
          color="#00ff80" 
          wireframe={true}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Left Arm */}
      <mesh 
        ref={(el) => (armRefs.current[0] = el)} 
        position={[-0.4, 0.8, 0]}
        rotation={[0, 0, -0.5]}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.6]} />
        <meshStandardMaterial color="#ff4080" wireframe />
      </mesh>
      
      {/* Right Arm */}
      <mesh 
        ref={(el) => (armRefs.current[1] = el)} 
        position={[0.4, 0.8, 0]}
        rotation={[0, 0, 0.5]}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.6]} />
        <meshStandardMaterial color="#40ff80" wireframe />
      </mesh>
      
      {/* Left Leg */}
      <mesh 
        ref={(el) => (legRefs.current[0] = el)} 
        position={[-0.15, -0.3, 0]}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.8]} />
        <meshStandardMaterial color="#8040ff" wireframe />
      </mesh>
      
      {/* Right Leg */}
      <mesh 
        ref={(el) => (legRefs.current[1] = el)} 
        position={[0.15, -0.3, 0]}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.8]} />
        <meshStandardMaterial color="#ff8040" wireframe />
      </mesh>
      
      {/* Chaotic energy particles around character */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={`energy-${i}`}
          position={[
            Math.sin(i * Math.PI * 0.25) * 0.8,
            Math.cos(i * Math.PI * 0.25) * 0.8 + 0.5,
            Math.sin(i * Math.PI * 0.5) * 0.3
          ]}
        >
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial 
            color={new THREE.Color().setHSL(i * 0.125, 1, 0.8)}
          />
        </mesh>
      ))}
    </group>
  );
}