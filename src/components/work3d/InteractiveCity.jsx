import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// --- Architectural Styles ---

const GlassSkyscraper = ({ width, height, accentColor, hovered, isActive }) => {
  return (
    <group>
      {/* Inner solid core */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width * 0.6, height * 0.98, width * 0.6]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      
      {/* Outer glass curtain wall */}
      <mesh position={[0, height / 2, 0]} receiveShadow>
        <boxGeometry args={[width, height, width]} />
        <meshPhysicalMaterial 
          color={hovered || isActive ? accentColor : "#0a0f1a"}
          metalness={0.9}
          roughness={0.1}
          transmission={0.8}
          thickness={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Glowing roof trim */}
      <mesh position={[0, height + 0.05, 0]}>
        <boxGeometry args={[width * 1.05, 0.1, width * 1.05]} />
        <meshStandardMaterial 
          color={hovered || isActive ? accentColor : "#333"}
          emissive={hovered || isActive ? accentColor : "#000"}
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
};

const BrutalistBlock = ({ width, height, accentColor, hovered, isActive }) => {
  return (
    <group>
      {/* Main concrete mass */}
      <mesh position={[0, height * 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.2, height * 0.8, width * 0.8]} />
        <meshStandardMaterial color="#2a2a35" roughness={1} metalness={0} />
      </mesh>
      
      {/* Asymmetric overhang */}
      <mesh position={[width * 0.2, height * 0.85, 0]} castShadow receiveShadow>
        <boxGeometry args={[width * 1.5, height * 0.3, width * 1.1]} />
        <meshStandardMaterial color="#333340" roughness={1} />
      </mesh>

      {/* Neon vertical accent strip */}
      <mesh position={[-width * 0.61, height / 2, 0]}>
        <boxGeometry args={[0.05, height, 0.1]} />
        <meshStandardMaterial 
          color={hovered || isActive ? accentColor : "#111"}
          emissive={hovered || isActive ? accentColor : "#000"}
          emissiveIntensity={1.5}
        />
      </mesh>
    </group>
  );
};

const ModernCampus = ({ width, height, accentColor, hovered, isActive }) => {
  return (
    <group>
      {/* Base tier */}
      <mesh position={[0, height * 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[width * 1.2, width * 1.2, height * 0.4, 6]} />
        <meshStandardMaterial color="#eee" roughness={0.5} />
      </mesh>
      
      {/* Upper terrace */}
      <mesh position={[0, height * 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[width * 0.9, width * 0.9, height * 0.4, 6]} />
        <meshStandardMaterial color="#fff" roughness={0.5} />
      </mesh>

      {/* Glowing connection ring */}
      <mesh position={[0, height * 0.4, 0]}>
        <torusGeometry args={[width * 1.25, 0.05, 16, 32]} />
        <meshStandardMaterial 
          color={hovered || isActive ? accentColor : "#222"}
          emissive={hovered || isActive ? accentColor : "#000"}
          emissiveIntensity={2}
        />
      </mesh>
    </group>
  );
};

// --- Main Project Building Component ---

const ProjectBuilding = ({ project, position, activeProject, setActiveProject }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = activeProject === project.id;
  
  const accentColor = new THREE.Color(project.accent);
  
  // Deterministic seed based on project ID for consistent procedural height
  const seed = project.id.charCodeAt(1);
  const baseHeight = 2 + (seed % 3); 
  const baseWidth = 1.2 + (seed % 2) * 0.4;

  // Assign architectural style based on category
  const isTech = project.category.includes('SaaS') || project.category.includes('FinTech');
  const isHeavy = project.category.includes('Security') || project.category.includes('Hosting');
  
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
      {/* Render the specific architectural style */}
      {isTech ? (
        <GlassSkyscraper width={baseWidth} height={baseHeight * 1.5} accentColor={accentColor} hovered={hovered} isActive={isActive} />
      ) : isHeavy ? (
        <BrutalistBlock width={baseWidth} height={baseHeight} accentColor={accentColor} hovered={hovered} isActive={isActive} />
      ) : (
        <ModernCampus width={baseWidth * 1.2} height={baseHeight * 0.8} accentColor={accentColor} hovered={hovered} isActive={isActive} />
      )}

      {/* Floating UI Bar (Minimalist approach replacing the giant card) */}
      {isActive && (
        <Html
          position={[0, baseHeight * 1.5 + 1, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="flex items-center gap-4 px-6 py-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-full shadow-2xl whitespace-nowrap"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid rgba(${project.accentRgb}, 0.3)`,
              color: '#000'
            }}
          >
            {/* Minimal Project Info */}
            <div className="flex flex-col border-r border-black/10 pr-4">
              <span className="font-mono text-[10px] tracking-widest uppercase mb-0.5" style={{ color: project.accent }}>
                {project.category}
              </span>
              <h3 className="text-lg font-display font-black leading-none">{project.name}</h3>
            </div>
            
            <p className="text-black/60 text-sm font-medium max-w-[280px] truncate hidden md:block border-r border-black/10 pr-4">
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
                className="w-8 h-8 flex items-center justify-center rounded-full border border-black/10 hover:bg-black/5 transition-colors text-black/50 hover:text-black"
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
        <Text
          position={[0, baseHeight * 1.5 + 0.8, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.4}
          color={hovered ? accentColor : '#fff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000"
        >
          {project.name}
        </Text>
      )}
    </group>
  );
};

// --- Optimized Instanced Filler Buildings ---

const FillerCity = () => {
  const meshRef = useRef();
  const count = 150; // We can have massive amounts of buildings now with 1 draw call

  useEffect(() => {
    if (!meshRef.current) return;
    
    const dummy = new THREE.Object3D();
    const materialColor = new THREE.Color('#1a1a24');

    let i = 0;
    for (let x = -30; x < 30; x += 3) {
      for (let z = -30; z < 30; z += 3) {
        // Skip the center area where projects live
        if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
        // Random organic city spread
        if (Math.random() > 0.6) continue;
        if (i >= count) break;

        const height = Math.random() * 3 + 0.5;
        const width = Math.random() * 1.5 + 0.8;
        
        dummy.position.set(x + (Math.random() - 0.5), height / 2, z + (Math.random() - 0.5));
        dummy.scale.set(width, height, width);
        dummy.updateMatrix();
        
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, materialColor);
        i++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.9} />
    </instancedMesh>
  );
};

// --- Main Scene ---

const InteractiveCity = () => {
  const { camera } = useThree();
  const [activeProject, setActiveProject] = useState(null);
  const controlsRef = useRef();

  // Project locations mapped to a street grid
  const projectPositions = [
    [-4, 0, -5],
    [0, 0, -6],
    [4, 0, -4],
    [-5, 0, 2],
    [0, 0, 3],
    [5, 0, 1],
  ];

  // God View Initial Camera
  const godViewPos = new THREE.Vector3(25, 30, 25);
  const godViewTarget = new THREE.Vector3(0, 0, 0);

  useEffect(() => {
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
      const pIndex = projects.findIndex(p => p.id === activeProject);
      const targetPos = new THREE.Vector3(...projectPositions[pIndex]);
      
      // Calculate a dramatic low-angle architectural view
      const camPos = new THREE.Vector3(targetPos.x + 4, targetPos.y + 0.5, targetPos.z + 6);

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
        y: targetPos.y + 2, // Look up slightly at the building
        z: targetPos.z,
        duration: 1.8,
        ease: 'power3.inOut',
        onUpdate: () => controlsRef.current.update()
      });
    } else {
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
      {/* Soft gradient sky */}
      <color attach="background" args={['#0b101a']} />
      <fog attach="fog" args={['#0b101a', 30, 90]} />
      
      {/* Beautiful cinematic lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[15, 30, 10]} 
        intensity={1.2} 
        color="#e0e7ff"
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.3} color="#818cf8" />

      {/* OrbitControls for City Map Interaction */}
      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.2} // Prevent looking from underground
        minDistance={10}
        maxDistance={60}
      />

      {/* The City Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0f141e" roughness={0.8} />
      </mesh>
      
      {/* Subtle grid lines */}
      <gridHelper args={[120, 60, '#1e293b', '#0f141e']} position={[0, 0.01, 0]} />

      {/* Main Procedural Project Buildings */}
      {projects.map((project, index) => (
        <ProjectBuilding 
          key={project.id} 
          project={project} 
          position={projectPositions[index]}
          activeProject={activeProject}
          setActiveProject={setActiveProject}
        />
      ))}

      {/* 150+ Procedural Filler Buildings (1 draw call) */}
      <FillerCity />
    </>
  );
};

export default InteractiveCity;
