import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Environment, Edges } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PeerBrosEngine = () => {
  const groupRef = useRef(null);
  const coreRef = useRef(null);
  
  // Create 6 shards (one for each project)
  const shardRefs = useRef([]);
  shardRefs.current = Array(6).fill(null).map((_, i) => shardRefs.current[i] || React.createRef());

  // Procedural geometries
  const coreGeometry = useMemo(() => new THREE.IcosahedronGeometry(1.5, 1), []);
  const shardGeometry = useMemo(() => new THREE.TetrahedronGeometry(0.8, 0), []);

  // Set initial shard positions (orbiting the core)
  useLayoutEffect(() => {
    shardRefs.current.forEach((ref, i) => {
      if (!ref.current) return;
      const angle = (i / 6) * Math.PI * 2;
      const radius = 3.5;
      ref.current.position.set(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius
      );
      // Point them roughly away from center or spin randomly
      ref.current.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    });
  }, []);

  // Ambient idle animation
  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
      coreRef.current.rotation.x += delta * 0.1;
    }
    shardRefs.current.forEach((ref, i) => {
      if (ref.current) {
        ref.current.rotation.y += delta * (0.1 + i * 0.02);
        ref.current.rotation.x += delta * (0.05 + i * 0.01);
      }
    });
  });

  return (
    <group ref={groupRef} name="peerbros-engine">
      {/* Environment for glass reflections */}
      <Environment preset="city" />

      {/* The Central Core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={coreRef} geometry={coreGeometry}>
          <meshStandardMaterial 
            color="#7C6FE0"
            emissive="#7C6FE0"
            emissiveIntensity={0.5}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.9}
          />
          <Edges color="#ffffff" opacity={0.3} transparent />
          {/* Internal glowing light */}
          <pointLight color="#7C6FE0" intensity={5} distance={10} />
        </mesh>
      </Float>

      {/* The 6 Project Shards */}
      {shardRefs.current.map((ref, i) => (
        <Float key={i} speed={1.5 + Math.random()} rotationIntensity={2} floatIntensity={2}>
          <mesh ref={ref} geometry={shardGeometry} name={`shard-${i}`}>
            <meshPhysicalMaterial 
              color="#ffffff"
              roughness={0.1}
              metalness={0.9}
              transparent
              opacity={0.8}
            />
            <Edges color="#7C6FE0" opacity={0.5} transparent />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

export default PeerBrosEngine;
