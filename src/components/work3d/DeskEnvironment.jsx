import React, { useRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { RoundedBox, MeshWobbleMaterial, useCursor } from '@react-three/drei';
import * as THREE from 'three';

export default function DeskEnvironment() {
  const { scene } = useThree();
  const targetObj = useRef(new THREE.Object3D());
  
  const [lampOn, setLampOn] = useState(true);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');

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

      {/* Studio Lamp Prop (Interactive) */}
      <group 
        position={[-4.5, -0.5, -2.5]}
        onClick={(e) => {
          e.stopPropagation();
          setLampOn(!lampOn);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
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
          <meshBasicMaterial color={lampOn ? "#ffebd6" : "#222"} />
        </mesh>

        {/* The Volumetric Spotlight Casting Shadows */}
        <spotLight
          position={[1.9, 3.3, 0]}
          target={targetObj.current}
          angle={Math.PI / 3}
          penumbra={0.4}
          intensity={lampOn ? 40 : 0} // Toggle light intensity
          distance={20}
          color="#ffebd6"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
        />
      </group>

      {/* Desk Prop: Animated Plant */}
      <group position={[4.5, -0.3, -2]}>
        {/* Pot */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.4, 0.3, 0.8, 32]} />
          <meshStandardMaterial color="#d4d4d8" roughness={0.9} metalness={0.1} />
        </mesh>
        
        {/* Soil */}
        <mesh position={[0, 0.4, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <circleGeometry args={[0.38, 16]} />
          <meshStandardMaterial color="#1c1917" roughness={1} />
        </mesh>

        {/* Plant Stem */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.05, 1.2, 8]} />
          <meshStandardMaterial color="#4ade80" roughness={0.8} />
        </mesh>
        
        {/* Main Leaves (Wobbling with wind) */}
        <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.6, 32, 32]} />
          <MeshWobbleMaterial factor={0.15} speed={1} color="#22c55e" roughness={0.8} />
        </mesh>
        
        {/* Side Leaves */}
        <mesh position={[0.4, 1.0, 0.2]} castShadow receiveShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <MeshWobbleMaterial factor={0.2} speed={1.2} color="#16a34a" roughness={0.8} />
        </mesh>
        
        <mesh position={[-0.3, 0.9, 0.3]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 32, 32]} />
          <MeshWobbleMaterial factor={0.3} speed={0.8} color="#15803d" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
