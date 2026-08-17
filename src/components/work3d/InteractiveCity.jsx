import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Sky, Text, useGLTF, useAnimations, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// Preload the placeholder asset for all 6 buildings
useGLTF.preload('/LittlestTokyo.glb');

// --- Real Asset Loader Component ---
const AssetModel = ({ url, scale = [0.03, 0.03, 0.03] }) => {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);

  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (actions) {
      Object.values(actions).forEach(action => action?.play());
    }
  }, [actions]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  return <primitive ref={group} object={clonedScene} position={[0, 0, 0]} scale={scale} />;
};

// --- Procedural Suspension Bridge ---
const SuspensionBridge = ({ start, end, width = 4 }) => {
  const vStart = new THREE.Vector3(...start);
  const vEnd = new THREE.Vector3(...end);
  const distance = vStart.distanceTo(vEnd);
  
  // Midpoint for the bridge structure
  const midPoint = new THREE.Vector3().addVectors(vStart, vEnd).multiplyScalar(0.5);
  
  // Calculate angle
  const angle = Math.atan2(vEnd.x - vStart.x, vEnd.z - vStart.z);

  return (
    <group position={[midPoint.x, 0.5, midPoint.z]} rotation={[0, angle, 0]}>
      {/* Roadway */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[width, 0.5, distance]} />
        <meshStandardMaterial color="#1f2229" roughness={0.9} />
      </mesh>
      
      {/* Support Pillars */}
      <mesh position={[-width/2 + 0.5, -5, distance * 0.25]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 10, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[width/2 - 0.5, -5, distance * 0.25]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 10, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-width/2 + 0.5, -5, -distance * 0.25]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 10, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[width/2 - 0.5, -5, -distance * 0.25]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 10, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* Suspension Cables (Stylized) */}
      <mesh position={[0, 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, distance, 4]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

// --- Open World Geography ---

const Islands = () => {
  return (
    <group>
      {/* Island 1: Downtown (Center) - Concrete */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0, 0]} receiveShadow castShadow scale={[1, 1, 1.3]}>
          <cylinderGeometry args={[25, 26, 1.5, 64]} />
          <meshStandardMaterial color="#1a1c23" roughness={0.9} />
        </mesh>
        {/* Stepped elevation */}
        <mesh position={[0, 0.8, 0]} receiveShadow castShadow scale={[1, 1, 1.2]}>
          <cylinderGeometry args={[15, 16, 1, 32]} />
          <meshStandardMaterial color="#22252e" roughness={0.9} />
        </mesh>
      </group>

      {/* Island 2: Industrial (North West) - Darker, Rigid */}
      <group position={[-45, 0, -35]}>
        <mesh position={[0, 0, 0]} receiveShadow castShadow scale={[1.2, 1, 0.8]}>
          <boxGeometry args={[35, 1.5, 35]} />
          <meshStandardMaterial color="#111318" roughness={1} />
        </mesh>
      </group>

      {/* Island 3: Creative (South East) - Lush/Green */}
      <group position={[45, 0, 30]}>
        <mesh position={[0, 0, 0]} receiveShadow castShadow scale={[1.4, 1, 1.1]}>
          <cylinderGeometry args={[20, 22, 1.5, 64]} />
          <meshStandardMaterial color="#20331e" roughness={0.8} />
        </mesh>
      </group>

      {/* The Bridges Connecting the Islands */}
      <SuspensionBridge start={[0, 0, 0]} end={[-45, 0, -35]} width={6} />
      <SuspensionBridge start={[0, 0, 0]} end={[45, 0, 30]} width={6} />
    </group>
  );
};


// --- Project Placement on Islands ---
const ProjectLocation = ({ project, position, activeProject, setActiveProject }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = activeProject === project.id;
  const accentColor = new THREE.Color(project.accent);
  
  const BASE_SIZE = 8;

  return (
    <group position={position}>
      
      {/* Foundation Pad */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <boxGeometry args={[BASE_SIZE, 0.2, BASE_SIZE]} />
        <meshStandardMaterial color="#0a0c10" roughness={0.5} />
      </mesh>

      {/* Glowing Accent Ring */}
      <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[BASE_SIZE/2 - 0.5, BASE_SIZE/2, 32]} />
        <meshBasicMaterial 
          color={accentColor} 
          transparent 
          opacity={hovered || isActive ? 1 : 0.3} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* The 3D Asset Placeholder */}
      <group position={[0, 0.2, 0]}>
        <AssetModel url="/LittlestTokyo.glb" />
      </group>

      {/* Interactive Raycast Shield */}
      <mesh 
        position={[0, 5, 0]} 
        visible={false}
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
        <boxGeometry args={[BASE_SIZE, 10, BASE_SIZE]} />
        <meshBasicMaterial />
      </mesh>

      {/* Large Project Description Box UI */}
      {isActive && (
        <Html
          position={[-BASE_SIZE - 2, 5, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="w-[360px] md:w-[420px] opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(10, 12, 16, 0.85)',
              backdropFilter: 'blur(24px)',
              border: `1px solid rgba(${project.accentRgb}, 0.5)`,
              color: '#fff',
              boxShadow: `0 20px 40px -10px rgba(${project.accentRgb}, 0.3)`
            }}
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-px" style={{ background: project.accent }} />
                  <span className="font-mono text-[10px] tracking-widest uppercase" style={{ color: project.accent }}>
                    {project.category}
                  </span>
                </div>
              </div>
              
              <h3 className="text-3xl font-display font-black leading-tight mb-4">{project.name}</h3>
              
              <p className="text-white/70 text-sm leading-relaxed mb-8">
                {project.description}
              </p>

              <div className="flex items-center gap-4">
                <a 
                  href={project.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-3.5 text-center text-sm font-bold text-black rounded-full transition-transform hover:scale-105 active:scale-95"
                  style={{ background: project.accent }}
                >
                  Visit Live Project
                </a>
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Billboard Name (God View) */}
      {!isActive && (
        <Text
          position={[0, 8, 0]}
          rotation={[-Math.PI / 4, 0, 0]}
          fontSize={1.5}
          color={hovered ? accentColor : '#fff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000"
        >
          {project.name}
        </Text>
      )}
    </group>
  );
};


// --- Main Scene ---
const InteractiveCity = ({ activeProject, setActiveProject }) => {
  const { camera } = useThree();
  const controlsRef = useRef();

  // Distribute the 6 projects across the 3 Islands
  const projectPositions = [
    // Island 1: Downtown (Center) - y=1.3 for elevation step
    [-6, 1.3, -4],
    [6, 1.3, 8],
    
    // Island 2: Industrial (North West) - y=0.75 for flat box
    [-52, 0.75, -42],
    [-38, 0.75, -28],
    
    // Island 3: Creative (South East) - y=0.75 for flat cylinder
    [35, 0.75, 25],
    [52, 0.75, 32],
  ];

  const godViewPos = new THREE.Vector3(0, 70, 90);
  const godViewTarget = new THREE.Vector3(0, 0, 0);

  useEffect(() => {
    camera.position.copy(godViewPos);
    camera.lookAt(godViewTarget);
    if (controlsRef.current) {
      controlsRef.current.target.copy(godViewTarget);
      controlsRef.current.update();
    }
  }, [camera]);

  useEffect(() => {
    if (!controlsRef.current) return;

    if (activeProject) {
      const pIndex = projects.findIndex(p => p.id === activeProject);
      const targetPos = new THREE.Vector3(...projectPositions[pIndex]);
      
      // Calculate a cinematic view framing the project
      const camPos = new THREE.Vector3(targetPos.x + 12, targetPos.y + 4, targetPos.z + 16);

      controlsRef.current.enabled = false;

      gsap.to(camera.position, {
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        duration: 2.5,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      });

      gsap.to(controlsRef.current.target, {
        x: targetPos.x,
        y: targetPos.y + 3,
        z: targetPos.z,
        duration: 2.5,
        ease: 'power3.inOut',
        onUpdate: () => controlsRef.current.update()
      });
    } else {
      gsap.to(camera.position, {
        x: godViewPos.x,
        y: godViewPos.y,
        z: godViewPos.z,
        duration: 2.5,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      });

      gsap.to(controlsRef.current.target, {
        x: godViewTarget.x,
        y: godViewTarget.y,
        z: godViewTarget.z,
        duration: 2.5,
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
      <color attach="background" args={['#05070a']} />
      
      <fog attach="fog" args={['#05070a', 60, 200]} />
      
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[100, 100, -50]} 
        intensity={2.5} 
        color="#e0eaff"
        castShadow 
        shadow-mapSize={[4096, 4096]} 
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-50, 20, 50]} intensity={1} color="#3b82f6" />

      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={5}
        maxDistance={150}
      />

      {/* The Ocean (Click to close project) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        onClick={() => setActiveProject(null)}
      >
        <planeGeometry args={[500, 500]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0a0f1a"
          metalness={0.9}
        />
      </mesh>

      {/* The GTA Open World Geography */}
      <Islands />

      {/* Project Buildings on the Islands */}
      {projects.map((project, index) => (
        <ProjectLocation 
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
