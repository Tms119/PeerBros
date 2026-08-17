import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// A main project building
const ProjectBuilding = ({ project, position, activeProject, setActiveProject }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = activeProject === project.id;
  const isOtherActive = activeProject !== null && !isActive;

  const accentColor = new THREE.Color(project.accent);
  const baseColor = new THREE.Color(isOtherActive ? '#222' : '#ddd');
  
  // Procedural geometry logic: stack a few blocks
  // Seed based on project ID length to keep it consistent
  const seed = project.id.charCodeAt(1);
  const height = 1 + (seed % 3); 
  const width = 1.2 + (seed % 2) * 0.5;

  return (
    <group 
      position={position}
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
      {/* Base block */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial color={baseColor} roughness={0.9} />
      </mesh>

      {/* Top accent block */}
      <mesh position={[0, height + 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 0.8, 0.5, width * 0.8]} />
        <meshStandardMaterial 
          color={hovered || isActive ? accentColor : '#aaa'} 
          emissive={hovered || isActive ? accentColor : '#000'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Project Label (visible from sky) */}
      <Text
        position={[0, height + 1.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.4}
        color={hovered || isActive ? accentColor : '#fff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000"
      >
        {project.name}
      </Text>

      {/* HTML Overlay UI when active */}
      {isActive && (
        <Html
          position={[0, height / 2, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="w-[300px] md:w-[360px] opacity-0 animate-in fade-in zoom-in duration-500 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: `1px solid rgba(${project.accentRgb}, 0.3)`,
              color: '#000'
            }}
          >
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-px" style={{ background: project.accent }} />
                <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: project.accent }}>
                  {project.category}
                </span>
              </div>
              
              <h3 className="text-2xl font-display font-black mb-2">{project.name}</h3>
              <p className="text-black/60 text-sm leading-relaxed mb-5">{project.description}</p>
              
              <div className="space-y-2 mb-6">
                {project.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-black/70">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: project.accent }} />
                    {f}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <a 
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 text-center text-xs font-bold text-white rounded-full transition-transform hover:scale-105 active:scale-95"
                  style={{ background: project.accent }}
                >
                  Visit Site
                </a>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveProject(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold border border-black/10 rounded-full hover:bg-black/5 transition-colors"
                >
                  Back to Map
                </button>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Filler buildings to make it look like a city
const FillerBuildings = () => {
  const count = 50;
  
  const blocks = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const z = (Math.random() - 0.5) * 40;
      
      // Keep away from the center where our main projects are
      if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;

      const height = Math.random() * 2 + 0.5;
      const width = Math.random() * 1.5 + 0.5;
      temp.push({ position: [x, height / 2, z], args: [width, height, width] });
    }
    return temp;
  }, []);

  return (
    <>
      {blocks.map((block, i) => (
        <mesh key={i} position={block.position} castShadow receiveShadow>
          <boxGeometry args={block.args} />
          <meshStandardMaterial color="#333" roughness={1} />
        </mesh>
      ))}
    </>
  );
};

const InteractiveCity = () => {
  const { camera } = useThree();
  const [activeProject, setActiveProject] = useState(null);
  const controlsRef = useRef();

  // Project locations in the grid
  const projectPositions = [
    [-4, 0, -4],
    [0, 0, -5],
    [4, 0, -3],
    [-5, 0, 2],
    [0, 0, 3],
    [5, 0, 1],
  ];

  // God View / Initial Isometric Camera Position
  const godViewPos = new THREE.Vector3(20, 25, 20);
  const godViewTarget = new THREE.Vector3(0, 0, 0);

  useEffect(() => {
    // Set initial position
    camera.position.copy(godViewPos);
    camera.lookAt(godViewTarget);
    if (controlsRef.current) {
      controlsRef.current.target.copy(godViewTarget);
      controlsRef.current.update();
    }
  }, [camera]);

  // Handle swooping into an active project
  useEffect(() => {
    if (!controlsRef.current) return;

    if (activeProject) {
      // Find the project's position
      const pIndex = projects.findIndex(p => p.id === activeProject);
      const targetPos = new THREE.Vector3(...projectPositions[pIndex]);
      
      // Calculate a street-level camera view
      const camPos = new THREE.Vector3(targetPos.x + 3, targetPos.y + 1, targetPos.z + 5);

      // Disable orbit controls during animation and while active
      controlsRef.current.enabled = false;

      // Animate Camera Position
      gsap.to(camera.position, {
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      });

      // Animate Camera Target (Look At)
      gsap.to(controlsRef.current.target, {
        x: targetPos.x,
        y: targetPos.y + 1,
        z: targetPos.z,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => controlsRef.current.update()
      });
    } else {
      // Return to God View
      gsap.to(camera.position, {
        x: godViewPos.x,
        y: godViewPos.y,
        z: godViewPos.z,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      });

      gsap.to(controlsRef.current.target, {
        x: godViewTarget.x,
        y: godViewTarget.y,
        z: godViewTarget.z,
        duration: 1.5,
        ease: 'power3.inOut',
        onUpdate: () => controlsRef.current.update(),
        onComplete: () => {
          controlsRef.current.enabled = true; // Re-enable panning
        }
      });
    }
  }, [activeProject, camera]);

  return (
    <>
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 30, 80]} />
      
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />

      {/* Controls for panning around the city */}
      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.5} // Don't let them go below ground
        minDistance={10}
        maxDistance={50}
      />

      {/* The Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#1e293b" roughness={1} />
      </mesh>
      
      {/* Grid to make it look like a map */}
      <gridHelper args={[100, 50, '#334155', '#1e293b']} position={[0, 0.01, 0]} />

      {/* Main Projects */}
      {projects.map((project, index) => (
        <ProjectBuilding 
          key={project.id} 
          project={project} 
          position={projectPositions[index]}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
        />
      ))}

      {/* Abstract City Filler */}
      <FillerBuildings />
    </>
  );
};

export default InteractiveCity;
