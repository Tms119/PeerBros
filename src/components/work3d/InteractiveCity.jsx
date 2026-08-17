import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Sky, Text, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// Preload the real 3D asset
useGLTF.preload('/LittlestTokyo.glb');

// --- Urban Infrastructure Config ---
const BLOCK_SIZE = 10;
const ROAD_WIDTH = 4;
const GRID_SIZE = 10; // 10x10 blocks
const CITY_SIZE = GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH);

// --- Real 3D Asset Centerpiece ---
const RealCityModel = () => {
  const group = useRef();
  const { scene, animations } = useGLTF('/LittlestTokyo.glb');
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions) {
      Object.values(actions).forEach(action => action?.play());
    }
  }, [actions]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <primitive 
      ref={group} 
      object={scene} 
      // Positioned exactly in the center, scale adjusted to fit our grid
      position={[0, 0, 0]} 
      scale={[0.04, 0.04, 0.04]} 
    />
  );
};

// --- The Roads & Traffic ---
const Roads = () => {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Main Asphalt Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_SIZE * 1.5, CITY_SIZE * 1.5]} />
        <meshStandardMaterial color="#0f1115" roughness={0.8} />
      </mesh>

      {/* Procedural Grid Lines */}
      <gridHelper 
        args={[CITY_SIZE, GRID_SIZE, '#1e222e', '#161922']} 
        position={[0, 0.02, 0]} 
      />
    </group>
  );
};

// Moving Cars using InstancedMesh
const Traffic = () => {
  const count = 150;
  const meshRef = useRef();
  
  const cars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const isHorizontal = Math.random() > 0.5;
      const lineIndex = Math.floor(Math.random() * GRID_SIZE) - GRID_SIZE / 2;
      const roadCoord = lineIndex * (BLOCK_SIZE + ROAD_WIDTH);
      
      // Avoid spawning cars driving straight through the detailed center model
      if (Math.abs(roadCoord) < 15) continue;

      const posAlong = (Math.random() - 0.5) * CITY_SIZE;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const speed = 8 + Math.random() * 8;
      const laneOffset = direction * 1.2;

      const position = isHorizontal 
        ? new THREE.Vector3(posAlong, 0.3, roadCoord + laneOffset)
        : new THREE.Vector3(roadCoord + laneOffset, 0.3, posAlong);

      arr.push({ position, isHorizontal, direction, speed });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    cars.forEach((car, i) => {
      if (car.isHorizontal) {
        car.position.x += car.speed * car.direction * delta;
        if (car.position.x > CITY_SIZE / 2) car.position.x = -CITY_SIZE / 2;
        if (car.position.x < -CITY_SIZE / 2) car.position.x = CITY_SIZE / 2;
      } else {
        car.position.z += car.speed * car.direction * delta;
        if (car.position.z > CITY_SIZE / 2) car.position.z = -CITY_SIZE / 2;
        if (car.position.z < -CITY_SIZE / 2) car.position.z = CITY_SIZE / 2;
      }

      dummy.position.copy(car.position);
      dummy.rotation.y = car.isHorizontal ? (car.direction === 1 ? Math.PI/2 : -Math.PI/2) : (car.direction === 1 ? 0 : Math.PI);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, cars.length]} castShadow receiveShadow>
      <boxGeometry args={[1.2, 0.6, 2.8]} />
      <meshStandardMaterial color="#fff" roughness={0.2} metalness={0.8} emissive="#ffddaa" emissiveIntensity={0.8} />
    </instancedMesh>
  );
};

// --- Interactive Hotspot ---
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
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={hovered || isActive ? accentColor : "#ffffff"}
          emissive={hovered || isActive ? accentColor : "#ffffff"}
          emissiveIntensity={hovered || isActive ? 2 : 0.8}
          transparent
          opacity={0.9}
        />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.8, 32]} />
        <meshBasicMaterial 
          color={accentColor}
          transparent
          opacity={hovered || isActive ? 0.8 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {isActive && (
        <Html
          position={[0, 2.5, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="flex items-center gap-4 px-6 py-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-full shadow-2xl whitespace-nowrap"
            style={{
              background: 'rgba(15, 17, 21, 0.95)',
              backdropFilter: 'blur(16px)',
              border: `1px solid rgba(${project.accentRgb}, 0.5)`,
              color: '#fff'
            }}
          >
            <div className="flex flex-col border-r border-white/20 pr-4">
              <span className="font-mono text-[10px] tracking-widest uppercase mb-0.5" style={{ color: project.accent }}>
                {project.category}
              </span>
              <h3 className="text-lg font-display font-black leading-none">{project.name}</h3>
            </div>
            
            <p className="text-white/70 text-sm font-medium max-w-[280px] truncate hidden md:block border-r border-white/20 pr-4">
              {project.tagline}
            </p>

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
              >
                ✕
              </button>
            </div>
          </div>
        </Html>
      )}

      {!isActive && (
        <Html position={[0, 1.2, 0]} center>
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

// --- Procedural City Blocks (Outer Filler Buildings) ---
const OuterCityBlocks = () => {
  const buildingMeshRef = useRef();

  useEffect(() => {
    if (!buildingMeshRef.current) return;
    
    const dummy = new THREE.Object3D();
    
    let buildingIdx = 0;
    // Leave a massive 3x3 block hole in the center for LittlestTokyo
    const safeRadius = (BLOCK_SIZE + ROAD_WIDTH) * 2;

    for (let x = -GRID_SIZE/2; x < GRID_SIZE/2; x++) {
      for (let z = -GRID_SIZE/2; z < GRID_SIZE/2; z++) {
        
        const blockCenterX = x * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2;
        const blockCenterZ = z * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2;

        // Skip the center where the real model lives
        if (Math.abs(blockCenterX) < safeRadius && Math.abs(blockCenterZ) < safeRadius) continue;
        
        // Randomly skip blocks to create plazas
        if (Math.random() > 0.85) continue;

        const height = 2 + Math.random() * 8;
        const width = (BLOCK_SIZE - 2) * (0.6 + Math.random() * 0.4);
        
        dummy.position.set(blockCenterX, height / 2, blockCenterZ);
        dummy.scale.set(width, height, width);
        dummy.updateMatrix();
        
        buildingMeshRef.current.setMatrixAt(buildingIdx, dummy.matrix);
        buildingIdx++;
      }
    }
    buildingMeshRef.current.instanceMatrix.needsUpdate = true;
    buildingMeshRef.current.count = buildingIdx;
  }, []);

  return (
    <instancedMesh ref={buildingMeshRef} args={[null, null, GRID_SIZE * GRID_SIZE]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#0f1115" roughness={0.9} />
    </instancedMesh>
  );
};

// --- Main Scene ---
const InteractiveCity = () => {
  const { camera } = useThree();
  const [activeProject, setActiveProject] = useState(null);
  const controlsRef = useRef();

  // Coordinates mapped tightly around the LittlestTokyo centerpiece
  const projectPositions = [
    [-6, 4, -4],
    [2, 3, -8],
    [7, 1, 0],
    [-8, 1, 4],
    [-2, 5, 6],
    [4, 6, 4],
  ];

  const godViewPos = new THREE.Vector3(CITY_SIZE * 0.6, CITY_SIZE * 0.4, CITY_SIZE * 0.6);
  const godViewTarget = new THREE.Vector3(0, 2, 0);

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
      
      // Calculate a cinematic close-up view of the hotspot
      const camPos = new THREE.Vector3(targetPos.x + 6, targetPos.y + 2, targetPos.z + 8);

      controlsRef.current.enabled = false;

      gsap.to(camera.position, {
        x: camPos.x,
        y: camPos.y,
        z: camPos.z,
        duration: 2,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      });

      gsap.to(controlsRef.current.target, {
        x: targetPos.x,
        y: targetPos.y, 
        z: targetPos.z,
        duration: 2,
        ease: 'power3.inOut',
        onUpdate: () => controlsRef.current.update()
      });
    } else {
      gsap.to(camera.position, {
        x: godViewPos.x,
        y: godViewPos.y,
        z: godViewPos.z,
        duration: 2,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix()
      });

      gsap.to(controlsRef.current.target, {
        x: godViewTarget.x,
        y: godViewTarget.y,
        z: godViewTarget.z,
        duration: 2,
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
      <color attach="background" args={['#050608']} />
      <Sky sunPosition={[100, 20, 100]} turbidity={0.2} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <fog attach="fog" args={['#0f1115', 40, CITY_SIZE * 1.5]} />
      
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={2.5} 
        color="#ffecd6"
        castShadow 
        shadow-mapSize={[4096, 4096]} 
        shadow-camera-left={-CITY_SIZE/2}
        shadow-camera-right={CITY_SIZE/2}
        shadow-camera-top={CITY_SIZE/2}
        shadow-camera-bottom={-CITY_SIZE/2}
      />
      <directionalLight position={[-50, 50, -50]} intensity={0.5} color="#3b82f6" />

      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.05} 
        minDistance={5}
        maxDistance={CITY_SIZE * 1.5}
      />

      <Roads />
      <Traffic />

      {/* Surrounding Procedural Urban Blocks */}
      <OuterCityBlocks />

      {/* Real 3D Asset Centerpiece */}
      <RealCityModel />

      {/* Interactive Hotspots around the Real Asset */}
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
