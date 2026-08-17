import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF, useAnimations, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// Preload the real 3D asset
useGLTF.preload('/LittlestTokyo.glb');

const RealCityModel = () => {
  const group = useRef();
  // Load the real 3D asset
  const { scene, animations } = useGLTF('/LittlestTokyo.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    // Play all animations found in the model (e.g., trains moving, fans spinning)
    if (actions) {
      Object.values(actions).forEach(action => action?.play());
    }
  }, [actions]);

  // Adjust material properties for better lighting
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        // Optional: tweak materials if they are too dark
      }
    });
  }, [scene]);

  return <primitive ref={group} object={scene} position={[0, -0.5, 0]} scale={[0.02, 0.02, 0.02]} />;
};

// Interactive Hotspot for a Project
const ProjectHotspot = ({ project, position, activeProject, setActiveProject }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = activeProject === project.id;
  
  const accentColor = new THREE.Color(project.accent);

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
      {/* Glowing Marker Sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={hovered || isActive ? accentColor : "#ffffff"}
          emissive={hovered || isActive ? accentColor : "#ffffff"}
          emissiveIntensity={hovered || isActive ? 2 : 0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Pulsing Outer Ring */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.45, 32]} />
        <meshBasicMaterial 
          color={accentColor}
          transparent
          opacity={hovered || isActive ? 0.8 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Floating UI Bar (Minimalist approach replacing the giant card) */}
      {isActive && (
        <Html
          position={[0, 1.5, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="flex items-center gap-4 px-6 py-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-full shadow-2xl whitespace-nowrap"
            style={{
              background: 'rgba(20, 20, 25, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid rgba(${project.accentRgb}, 0.5)`,
              color: '#fff'
            }}
          >
            {/* Minimal Project Info */}
            <div className="flex flex-col border-r border-white/20 pr-4">
              <span className="font-mono text-[10px] tracking-widest uppercase mb-0.5" style={{ color: project.accent }}>
                {project.category}
              </span>
              <h3 className="text-lg font-display font-black leading-none">{project.name}</h3>
            </div>
            
            <p className="text-white/70 text-sm font-medium max-w-[280px] truncate hidden md:block border-r border-white/20 pr-4">
              {project.tagline}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 pl-2">
              <a 
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 text-xs font-bold text-white rounded-full transition-transform hover:scale-105 active:scale-95"
                style={{ background: project.accent }}
              >
                Explore Site
              </a>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveProject(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-white/20 hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* Project Label (visible from sky view) */}
      {!isActive && (
        <Html position={[0, 0.8, 0]} center>
          <div 
            className={`px-3 py-1 text-xs font-bold rounded-md whitespace-nowrap transition-all duration-300 ${
              hovered ? 'bg-white text-black scale-110 shadow-lg' : 'bg-black/50 text-white backdrop-blur-sm border border-white/10'
            }`}
            style={hovered ? { boxShadow: `0 0 20px rgba(${project.accentRgb}, 0.5)` } : {}}
          >
            {project.name}
          </div>
        </Html>
      )}
    </group>
  );
};

// --- Main Scene ---

const InteractiveCity = () => {
  const { camera } = useThree();
  const [activeProject, setActiveProject] = useState(null);
  const controlsRef = useRef();

  // Defined hotspot coordinates around the detailed city model
  const projectPositions = [
    [-3, 2, -2],   // High up, back left
    [1, 1.5, -4],  // Mid level, back right
    [3.5, 0.5, 0], // Ground level, right
    [-4, 0.5, 2],  // Ground level, left
    [-1, 2.5, 3],  // High up, front left
    [2, 3, 2],     // High up, front right
  ];

  // God View Initial Camera
  const godViewPos = new THREE.Vector3(12, 10, 12);
  const godViewTarget = new THREE.Vector3(0, 2, 0);

  useEffect(() => {
    camera.position.copy(godViewPos);
    camera.lookAt(godViewTarget);
    if (controlsRef.current) {
      controlsRef.current.target.copy(godViewTarget);
      controlsRef.current.update();
    }
  }, [camera]);

  // Handle swooping into an active project hotspot
  useEffect(() => {
    if (!controlsRef.current) return;

    if (activeProject) {
      const pIndex = projects.findIndex(p => p.id === activeProject);
      const targetPos = new THREE.Vector3(...projectPositions[pIndex]);
      
      // Calculate a cinematic close-up view of the hotspot
      const camPos = new THREE.Vector3(targetPos.x + 3, targetPos.y + 1, targetPos.z + 4);

      controlsRef.current.enabled = false;

      gsap.to(camera.position, {
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      });

      gsap.to(controlsRef.current.target, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.8,
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
          controlsRef.current.enabled = true;
        }
      });
    }
  }, [activeProject, camera]);

  return (
    <>
      <color attach="background" args={['#0a0a0f']} />
      
      {/* High-end Environment Lighting (IBL) */}
      <Environment preset="city" />
      
      {/* Directional light for crisp shadows */}
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={0.4} />

      {/* OrbitControls for interaction */}
      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.1} // Prevent looking from way underneath
        minDistance={2}
        maxDistance={30}
      />

      {/* The Real 3D Asset Centerpiece */}
      <RealCityModel />

      {/* Interactive Project Hotspots */}
      {projects.map((project, index) => (
        <ProjectHotspot 
          key={project.id} 
          project={project} 
          position={projectPositions[index]}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
        />
      ))}
    </>
  );
};

export default InteractiveCity;
