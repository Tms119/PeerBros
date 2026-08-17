import React, { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

export default function DeskEnvironment() {
  const { scene } = useThree();
  const targetObj = useRef(new THREE.Object3D());

  useEffect(() => {
    // Add the target object to the scene so the spotlight can track it
    targetObj.current.position.set(0, 0, 0);
    scene.add(targetObj.current);
    return () => {
      scene.remove(targetObj.current);
    };
  }, [scene]);

  return (
    <group>
      {/* Back Wall (Slightly warm dark grey) */}
      <mesh position={[0, 5, -8]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color="#0c0a0a" roughness={1} />
      </mesh>

      {/* Solid Wooden Desk Slab */}
      <RoundedBox args={[24, 0.6, 12]} radius={0.05} smoothness={4} position={[0, -0.8, -2]} receiveShadow castShadow>
        {/* Dark Walnut / Ash color */}
        <meshStandardMaterial color="#1f1a17" roughness={0.7} metalness={0.1} />
      </RoundedBox>

      {/* Studio Lamp Prop */}
      <group position={[-4.5, -0.5, -2.5]}>
        {/* Lamp Base */}
        <RoundedBox args={[1.2, 0.1, 1.2]} radius={0.6} smoothness={32} castShadow receiveShadow>
          <meshStandardMaterial color="#0a0a0a" metalness={0.5} roughness={0.4} />
        </RoundedBox>
        
        {/* Lower Arm */}
        <mesh position={[0, 1.2, 0]} rotation={[0, 0, 0.4]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 2.5, 16]} />
          <meshStandardMaterial color="#151515" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Joint */}
        <mesh position={[0.45, 2.3, 0]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 16]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
        </mesh>
        
        {/* Upper Arm */}
        <mesh position={[1.0, 3.0, 0]} rotation={[0, 0, -0.6]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 1.8, 16]} />
          <meshStandardMaterial color="#151515" metalness={0.7} roughness={0.4} />
        </mesh>
        
        {/* Lamp Head (Cone) */}
        <mesh position={[1.5, 3.6, 0]} rotation={[0, 0, -1.0]} castShadow>
          <coneGeometry args={[0.6, 1.2, 32]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Lightbulb (Glow) */}
        <mesh position={[1.9, 3.3, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshBasicMaterial color="#ffebd6" />
        </mesh>

        {/* The Volumetric Spotlight Casting Shadows */}
        <spotLight
          position={[1.9, 3.3, 0]}
          target={targetObj.current}
          angle={Math.PI / 3}
          penumbra={0.4}
          intensity={40} // High intensity for physically correct lighting
          distance={20}
          color="#ffebd6"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
        />
      </group>

      {/* Desk Prop: Small Neon Decoration for scale */}
      <group position={[4, -0.5, -2]}>
        <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
          <icosahedronGeometry args={[0.5, 0]} />
          <meshPhysicalMaterial color="#FF5F56" transmission={0.9} roughness={0.1} thickness={2} ior={1.5} />
        </mesh>
      </group>
    </group>
  );
}
