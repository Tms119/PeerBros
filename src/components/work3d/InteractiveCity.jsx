import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Sky, Text, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// Preload the placeholder asset for all 6 buildings
useGLTF.preload('/LittlestTokyo.glb');

// --- Urban Infrastructure Config ---
const BLOCK_SIZE = 12;
const ROAD_WIDTH = 4;
const GRID_SIZE = 14; // 14x14 blocks (massive city)
const CITY_SIZE = GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH);

// --- Real Asset Loader Component ---
// This acts as a wrapper. When the user gets their 6 unique models, they just pass the URL here.
const AssetModel = ({ url, scale = [0.03, 0.03, 0.03] }) => {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions } = useAnimations(animations, group);

  // Clone the scene so we can render multiple instances of the same GLTF safely
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

// --- The Roads & Traffic ---
const Roads = ({ onBackgroundClick }) => {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Main Asphalt Plane - acts as a background click detector */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow onClick={onBackgroundClick}>
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
  const count = 300;
  const meshRef = useRef();
  
  const cars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const isHorizontal = Math.random() > 0.5;
      const lineIndex = Math.floor(Math.random() * GRID_SIZE) - GRID_SIZE / 2;
      const roadCoord = lineIndex * (BLOCK_SIZE + ROAD_WIDTH);
      
      const posAlong = (Math.random() - 0.5) * CITY_SIZE;
      const direction = Math.random() > 0.5 ? 1 : -1;
      const speed = 10 + Math.random() * 10;
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

// --- Project Block (Asset + Description Box) ---
const ProjectBlock = ({ project, position, activeProject, setActiveProject }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = activeProject === project.id;
  const accentColor = new THREE.Color(project.accent);

  return (
    <group position={position}>
      {/* Foundation Plaza */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[BLOCK_SIZE - 0.5, 0.1, BLOCK_SIZE - 0.5]} />
        <meshStandardMaterial color="#1a1c23" />
      </mesh>

      {/* The 3D Asset Placeholder (Uses LittlestTokyo for all 6 until replaced) */}
      <group position={[0, 0.1, 0]}>
        <AssetModel url="/LittlestTokyo.glb" />
      </group>

      {/* Interactive Raycast Hotspot Shield (Covers the building for easy clicking) */}
      <mesh 
        position={[0, 4, 0]} 
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
        <boxGeometry args={[BLOCK_SIZE, 8, BLOCK_SIZE]} />
        <meshBasicMaterial />
      </mesh>

      {/* Large Project Description Box UI */}
      {isActive && (
        <Html
          position={[-BLOCK_SIZE / 2 - 2, 4, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="w-[360px] md:w-[420px] opacity-0 animate-in fade-in zoom-in duration-500 rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(10, 12, 16, 0.95)',
              backdropFilter: 'blur(20px)',
              border: `1px solid rgba(${project.accentRgb}, 0.4)`,
              color: '#fff'
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
          fontSize={1.2}
          color={hovered ? accentColor : '#fff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000"
        >
          {project.name}
        </Text>
      )}

      {/* Glowing Base Ring when hovered */}
      {!isActive && hovered && (
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[BLOCK_SIZE/2, BLOCK_SIZE/2 + 0.5, 32]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

// --- Procedural City Blocks (Outer Filler Buildings) ---
const OuterCityBlocks = ({ projectBlockIndices }) => {
  const buildingMeshRef = useRef();

  useEffect(() => {
    if (!buildingMeshRef.current) return;
    const dummy = new THREE.Object3D();
    let buildingIdx = 0;

    for (let x = -GRID_SIZE/2; x < GRID_SIZE/2; x++) {
      for (let z = -GRID_SIZE/2; z < GRID_SIZE/2; z++) {
        const blockId = `${x},${z}`;
        // Skip blocks assigned to real projects
        if (projectBlockIndices.includes(blockId)) continue;
        // Skip some blocks to create empty plazas/parks
        if (Math.random() > 0.8) continue;

        const blockCenterX = x * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2;
        const blockCenterZ = z * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2;

        const height = 4 + Math.random() * 10;
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
  }, [projectBlockIndices]);

  return (
    <instancedMesh ref={buildingMeshRef} args={[null, null, GRID_SIZE * GRID_SIZE]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#0f1115" roughness={0.9} />
    </instancedMesh>
  );
};

// --- Main Scene ---
const InteractiveCity = ({ activeProject, setActiveProject }) => {
  const { camera } = useThree();
  const controlsRef = useRef();

  // Coordinates spreading the 6 projects far apart across the massive grid
  const projectGridCoords = [
    { x: -3, z: -4 },
    { x: 3, z: -3 },
    { x: -1, z: 0 },
    { x: 4, z: 2 },
    { x: -4, z: 4 },
    { x: 1, z: 5 },
  ];

  const projectBlockIndices = projectGridCoords.map(c => `${c.x},${c.z}`);

  const projectPositions = projectGridCoords.map(coord => {
    return new THREE.Vector3(
      coord.x * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2,
      0,
      coord.z * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2
    );
  });

  const godViewPos = new THREE.Vector3(CITY_SIZE * 0.6, CITY_SIZE * 0.5, CITY_SIZE * 0.6);
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
      const targetPos = projectPositions[pIndex];
      
      // Calculate a cinematic street-level view framing the building
      const camPos = new THREE.Vector3(targetPos.x + BLOCK_SIZE * 1.5, targetPos.y + 3, targetPos.z + BLOCK_SIZE * 1.5);

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
        y: targetPos.y + 4, // Look up at the building
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
      <fog attach="fog" args={['#0f1115', 50, CITY_SIZE * 1.5]} />
      
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

      <Roads onBackgroundClick={() => setActiveProject(null)} />
      <Traffic />

      <OuterCityBlocks projectBlockIndices={projectBlockIndices} />

      {projects.map((project, index) => (
        <ProjectBlock 
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
