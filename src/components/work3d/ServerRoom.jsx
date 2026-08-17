import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useCursor, Text, MeshReflectorMaterial, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// A single Project Monolith
const ProjectMonolith = ({ project, index, activeProject, setActiveProject }) => {
  const groupRef = useRef();
  const screenRef = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Position monoliths in a grand hallway
  const side = index % 2 === 0 ? 1 : -1;
  const x = side * 4;
  const z = -index * 7;
  const y = 2.5; // Raised slightly off the floor

  const width = 2;
  const height = 5;
  const depth = 0.2;

  const isActive = activeProject === project.id;
  const isOtherActive = activeProject !== null && !isActive;
  
  const accentColor = new THREE.Color(project.accent);
  // Dim non-active projects
  const currentOpacity = isOtherActive ? 0.1 : 1;

  // Pulse animation on the screen
  useFrame(({ clock }) => {
    if (screenRef.current && !isActive) {
      const pulse = Math.sin(clock.elapsedTime * 2 + index) * 0.2 + 0.8;
      screenRef.current.material.emissiveIntensity = hovered ? 2 : pulse * 0.8;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[x, y, z]}
      rotation={[0, side === 1 ? -Math.PI / 12 : Math.PI / 12, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setActiveProject(project.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!activeProject) setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.1, 0.1]}>
        
        {/* Outer Frame (Glass/Metal) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width + 0.1, height + 0.1, depth]} />
          <meshPhysicalMaterial 
            color="#000"
            metalness={0.9}
            roughness={0.1}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transparent
            opacity={currentOpacity}
          />
        </mesh>

        {/* Inner Glowing Screen */}
        <mesh ref={screenRef} position={[0, 0, depth / 2 + 0.01]}>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial 
            color="#000"
            emissive={accentColor}
            emissiveIntensity={0.8}
            transparent
            opacity={currentOpacity * 0.9}
          />
        </mesh>

        {/* Dynamic Typography */}
        <Text
          position={[0, 0, depth / 2 + 0.05]}
          fontSize={hovered || isActive ? 0.35 : 0.25}
          color="#ffffff"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjQ.ttf"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
          transparent
          opacity={currentOpacity}
        >
          {project.name.toUpperCase()}
        </Text>
        
        {/* Subtitle / Category */}
        <Text
          position={[0, -0.4, depth / 2 + 0.05]}
          fontSize={0.12}
          color={accentColor}
          font="https://fonts.gstatic.com/s/jetbrainsmono/v18/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKwI.woff"
          anchorX="center"
          anchorY="middle"
          transparent
          opacity={hovered || isActive ? currentOpacity : 0}
        >
          {project.category.toUpperCase()}
        </Text>

      </Float>

      {/* HTML Interface Overlay */}
      {isActive && (
        <Html
          position={[-side * 2.5, 0, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="w-[340px] md:w-[400px] text-white opacity-0 animate-in fade-in zoom-in duration-500 rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(5, 5, 8, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: `1px solid rgba(${project.accentRgb}, 0.2)`,
              boxShadow: `0 0 40px rgba(${project.accentRgb}, 0.15), inset 0 0 20px rgba(255,255,255,0.02)`
            }}
          >
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-px" style={{ background: project.accent }} />
                <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: project.accent }}>
                  {project.id}
                </span>
              </div>
              
              <h3 className="text-3xl font-display font-black mb-2 tracking-tight">{project.name}</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 font-light">{project.description}</p>
              
              <div className="space-y-3 mb-8">
                {project.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-white/70">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: project.accent }} />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <a 
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3.5 text-center text-sm font-bold text-black rounded-full transition-transform hover:scale-105 active:scale-95"
                  style={{ background: project.accent }}
                >
                  Visit Project
                </a>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveProject(null);
                  }}
                  className="px-6 py-3.5 text-sm font-medium border border-white/20 rounded-full hover:bg-white/10 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Atmospheric Dust Particles
const DustParticles = () => {
  const pointsRef = useRef();
  const count = 300;
  
  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20; // x
      pos[i * 3 + 1] = Math.random() * 10;     // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 40; // z
    }
    return pos;
  });

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.02;
      pointsRef.current.position.y = Math.sin(clock.elapsedTime * 0.1) * 0.5;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.3} sizeAttenuation />
    </points>
  );
};

const ServerRoom = () => {
  const { camera } = useThree();
  const [activeProject, setActiveProject] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    // Initial camera setup
    camera.position.set(0, 2, 8);
  }, [camera]);

  // Sync native scroll with camera Z position
  useFrame(() => {
    if (activeProject) return;

    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrollY / (maxScroll || 1)));

    const hallwayLength = (projects.length - 1) * 7;
    const targetZ = 8 - (progress * hallwayLength * 1.3);

    // Smooth dampening
    camera.position.z += (targetZ - camera.position.z) * 0.08;
    camera.position.x += (0 - camera.position.x) * 0.08;
    camera.position.y += (2 - camera.position.y) * 0.08;
    
    // Slight sway based on movement
    const sway = Math.sin(Date.now() * 0.001) * 0.02;
    camera.rotation.y += (sway - camera.rotation.y) * 0.1;
    camera.rotation.x = 0;
    camera.rotation.z = 0;
  });

  // Handle swooping into an active project
  useEffect(() => {
    if (activeProject) {
      const pIndex = projects.findIndex(p => p.id === activeProject);
      const side = pIndex % 2 === 0 ? 1 : -1;
      const targetZ = -pIndex * 7;
      const targetX = side * 1.2; // Move close to the monolith

      gsap.to(camera.position, {
        x: targetX,
        y: 2.5,
        z: targetZ + 3.5,
        duration: 1.5,
        ease: 'power3.inOut'
      });
      gsap.to(camera.rotation, {
        y: side * (Math.PI / 10),
        duration: 1.5,
        ease: 'power3.inOut'
      });
    }
  }, [activeProject, camera]);

  return (
    <>
      <color attach="background" args={['#020203']} />
      <fog attach="fog" args={['#020203', 2, 25]} />
      
      <ambientLight intensity={0.5} />
      
      {/* High-end Mirror Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 100]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050508"
          metalness={0.5}
        />
      </mesh>

      {/* Grid lines fading into distance */}
      <gridHelper args={[50, 50, '#1a1a24', '#0a0a10']} position={[0, 0.01, -20]} />

      {/* The Monoliths */}
      {projects.map((project, index) => (
        <ProjectMonolith 
          key={project.id} 
          project={project} 
          index={index}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
        />
      ))}

      {/* Atmospheric Dust */}
      {!isMobile && <DustParticles />}

      {/* Premium Post Processing */}
      <EffectComposer disableNormalPass multisampling={0}>
        <Bloom 
          luminanceThreshold={0.2} 
          mipmapBlur 
          intensity={isMobile ? 0.5 : 1.2} 
          radius={0.8}
        />
        {!isMobile && <Noise opacity={0.03} />}
        {!isMobile && <Vignette eskil={false} offset={0.1} darkness={1.1} />}
      </EffectComposer>
    </>
  );
};

export default ServerRoom;
