import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';

export default function FloatingElements() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} floatIntensity={2}>
        <mesh position={[-6, 3, -10]}>
          <torusGeometry args={[1.5, 0.4, 32, 64]} />
          <meshPhysicalMaterial 
            color="#FF5F56" 
            transmission={0.9} 
            opacity={1} 
            metalness={0.1} 
            roughness={0.1} 
            ior={1.5} 
            thickness={2} 
          />
        </mesh>
      </Float>
      
      <Float speed={1.5} floatIntensity={2}>
        <mesh position={[7, -1, -12]}>
          <icosahedronGeometry args={[2, 0]} />
          <meshPhysicalMaterial 
            color="#27C93F" 
            transmission={0.9} 
            opacity={1} 
            metalness={0.2} 
            roughness={0.1} 
            ior={1.5} 
            thickness={1.5} 
          />
        </mesh>
      </Float>

      <Float speed={2.5} floatIntensity={1.5}>
        <mesh position={[-5, -2, -8]}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhysicalMaterial 
            color="#FFBD2E" 
            transmission={0.9} 
            opacity={1} 
            metalness={0.3} 
            roughness={0.2} 
            ior={1.5} 
            thickness={1} 
          />
        </mesh>
      </Float>
    </group>
  );
}
