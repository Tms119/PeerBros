import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useCursor, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// A single Server Rack
const ServerRack = ({ project, index, total, activeProject, setActiveProject }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  // Position racks on alternating sides of the hallway
  const side = index % 2 === 0 ? 1 : -1;
  const x = side * 3.5;
  const z = -index * 6; // Spaced out down the Z axis
  const y = 0;

  // Rack dimensions
  const width = 1.5;
  const height = 4;
  const depth = 2;

  const isActive = activeProject === project.id;
  const accentColor = new THREE.Color(project.accent);

  return (
    <group
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        setActiveProject(project.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main rack chassis */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial 
          color="#111" 
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Glowing screen/panel on the front */}
      <mesh position={[-side * (width / 2 + 0.01), height / 2, 0]} rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
        <planeGeometry args={[depth - 0.2, height - 0.4]} />
        {/* Basic material ignores lights so it stays bright, bloom catches it if color > 1 */}
        <meshBasicMaterial 
          color={hovered || isActive ? accentColor.multiplyScalar(2) : '#222'} 
          toneMapped={false} 
        />
      </mesh>

      {/* Floating Holographic Title (visible when hovering or nearby) */}
      <Text
        position={[-side * 2.5, height + 0.5, 0]}
        rotation={[0, side === 1 ? -Math.PI / 4 : Math.PI / 4, 0]}
        fontSize={0.4}
        color="white"
        font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjQ.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {project.name}
      </Text>

      {/* HTML Overlay UI when active */}
      {isActive && (
        <Html
          position={[-side * 1.5, height / 2, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div className="bg-[#050508]/90 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-[320px] text-white transform transition-all duration-500">
            <div className="text-xs font-mono mb-2" style={{ color: project.accent }}>{project.id} / {project.category}</div>
            <h3 className="text-2xl font-bold mb-4">{project.name}</h3>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">{project.description}</p>
            
            <div className="space-y-2 mb-6">
              {project.features.slice(0, 3).map((f, i) => (
                <div key={i} className="text-xs text-white/40 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full" style={{ background: project.accent }} />
                  {f}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <a 
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center text-xs font-bold py-3 rounded-full text-black hover:opacity-90 transition-opacity"
                style={{ background: project.accent }}
              >
                Visit Site
              </a>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveProject(null);
                }}
                className="px-4 text-xs border border-white/20 rounded-full hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const ServerRoom = () => {
  const { camera } = useThree();
  const [activeProject, setActiveProject] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Determine mobile for post-processing
  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches);
  }, []);

  // Sync scroll with camera Z position
  useFrame(() => {
    if (activeProject) return; // Lock camera if viewing a project

    // Calculate scroll progress (0 to 1)
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, scrollY / maxScroll));

    // Map progress to the length of our hallway
    // 6 projects, spaced by 6 units = total length ~ 30 units
    const hallwayLength = (projects.length - 1) * 6;
    const targetZ = 10 - (progress * hallwayLength * 1.5); // 10 is start pos, go deep into negative Z

    // Smooth camera interpolation
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    camera.position.x += (0 - camera.position.x) * 0.1; // Return to center
    camera.position.y += (2 - camera.position.y) * 0.1;
    camera.rotation.y += (0 - camera.rotation.y) * 0.1;
  });

  // Handle swooping into an active project
  useEffect(() => {
    if (activeProject) {
      const pIndex = projects.findIndex(p => p.id === activeProject);
      const side = pIndex % 2 === 0 ? 1 : -1;
      const targetZ = -pIndex * 6;
      const targetX = side * 1.5;

      gsap.to(camera.position, {
        x: targetX,
        y: 2,
        z: targetZ + 3,
        duration: 1.5,
        ease: 'power3.inOut'
      });
      gsap.to(camera.rotation, {
        y: side * (Math.PI / 8), // Turn slightly towards rack
        duration: 1.5,
        ease: 'power3.inOut'
      });
    }
  }, [activeProject, camera]);

  return (
    <>
      <ambientLight intensity={0.2} />
      {/* Floor grid */}
      <gridHelper args={[50, 50, '#111', '#111']} position={[0, -0.01, 0]} />

      {/* Ceiling lights */}
      {projects.map((_, i) => (
        <pointLight key={`light-${i}`} position={[0, 5, -i * 6]} intensity={1} distance={10} color="#333" />
      ))}

      {/* The Projects */}
      {projects.map((project, index) => (
        <ServerRack 
          key={project.id} 
          project={project} 
          index={index}
          total={projects.length}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
        />
      ))}

      {/* Post Processing - conditionally render Bloom on desktop only for performance */}
      {!isMobile && (
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
        </EffectComposer>
      )}
    </>
  );
};

export default ServerRoom;
