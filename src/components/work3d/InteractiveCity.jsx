import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Sky, Text } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// --- Urban Infrastructure Config ---
const BLOCK_SIZE = 8;
const ROAD_WIDTH = 3;
const GRID_SIZE = 8; // 8x8 blocks (64 total blocks)
const CITY_SIZE = GRID_SIZE * (BLOCK_SIZE + ROAD_WIDTH);

// --- The Roads & Traffic ---
const Roads = () => {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Main Asphalt Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_SIZE, CITY_SIZE]} />
        <meshStandardMaterial color="#111118" roughness={0.8} />
      </mesh>

      {/* Procedural Grid Lines to simulate roads/blocks */}
      <gridHelper 
        args={[CITY_SIZE, GRID_SIZE, '#222233', '#1a1a24']} 
        position={[0, 0.02, 0]} 
      />
    </group>
  );
};

// Moving Cars using InstancedMesh for high performance
const Traffic = () => {
  const count = 100;
  const meshRef = useRef();
  
  // Initialize car data (position, lane, speed, direction)
  const cars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      // Pick a random road (either horizontal or vertical)
      const isHorizontal = Math.random() > 0.5;
      
      // Snap to a road center line
      const lineIndex = Math.floor(Math.random() * GRID_SIZE) - GRID_SIZE / 2;
      const roadCoord = lineIndex * (BLOCK_SIZE + ROAD_WIDTH);
      
      // Random position along the road
      const posAlong = (Math.random() - 0.5) * CITY_SIZE;
      
      // Direction and speed
      const direction = Math.random() > 0.5 ? 1 : -1;
      const speed = 5 + Math.random() * 5;
      
      // Offset slightly to simulate lanes
      const laneOffset = direction * 0.5;

      const position = isHorizontal 
        ? new THREE.Vector3(posAlong, 0.2, roadCoord + laneOffset)
        : new THREE.Vector3(roadCoord + laneOffset, 0.2, posAlong);

      arr.push({ position, isHorizontal, direction, speed });
    }
    return arr;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    cars.forEach((car, i) => {
      // Move car
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
      // Rotate car to face direction of travel
      dummy.rotation.y = car.isHorizontal ? (car.direction === 1 ? Math.PI/2 : -Math.PI/2) : (car.direction === 1 ? 0 : Math.PI);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} castShadow receiveShadow>
      <boxGeometry args={[0.8, 0.4, 1.8]} />
      <meshStandardMaterial color="#fff" roughness={0.2} metalness={0.8} emissive="#222" emissiveIntensity={0.5} />
    </instancedMesh>
  );
};

// --- Architectural Styles ---

const GlassSkyscraper = ({ width, height, accentColor, hovered, isActive }) => (
  <group>
    <mesh position={[0, height / 2, 0]} castShadow>
      <boxGeometry args={[width * 0.7, height * 0.98, width * 0.7]} />
      <meshStandardMaterial color="#111" roughness={0.9} />
    </mesh>
    <mesh position={[0, height / 2, 0]} receiveShadow>
      <boxGeometry args={[width, height, width]} />
      <meshPhysicalMaterial 
        color={hovered || isActive ? accentColor : "#0f172a"}
        metalness={0.9} roughness={0.1} transmission={0.9} thickness={0.5} transparent opacity={0.8}
      />
    </mesh>
    <mesh position={[0, height + 0.1, 0]}>
      <boxGeometry args={[width * 1.05, 0.2, width * 1.05]} />
      <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={isActive ? 2 : 1} />
    </mesh>
  </group>
);

const BrutalistBlock = ({ width, height, accentColor, hovered, isActive }) => (
  <group>
    <mesh position={[0, height * 0.4, 0]} castShadow receiveShadow>
      <boxGeometry args={[width * 1.2, height * 0.8, width * 0.8]} />
      <meshStandardMaterial color="#1e293b" roughness={1} />
    </mesh>
    <mesh position={[width * 0.2, height * 0.85, 0]} castShadow receiveShadow>
      <boxGeometry args={[width * 1.5, height * 0.3, width * 1.1]} />
      <meshStandardMaterial color="#0f172a" roughness={1} />
    </mesh>
    <mesh position={[-width * 0.61, height / 2, 0]}>
      <boxGeometry args={[0.1, height, 0.2]} />
      <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.5} />
    </mesh>
  </group>
);

const ModernCampus = ({ width, height, accentColor, hovered, isActive }) => (
  <group>
    <mesh position={[0, height * 0.2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[width * 1.2, width * 1.2, height * 0.4, 8]} />
      <meshStandardMaterial color="#334155" roughness={0.5} />
    </mesh>
    <mesh position={[0, height * 0.6, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[width * 0.9, width * 0.9, height * 0.4, 8]} />
      <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
    </mesh>
    <mesh position={[0, height * 0.4, 0]}>
      <torusGeometry args={[width * 1.25, 0.1, 16, 32]} />
      <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
    </mesh>
  </group>
);

// --- Main Project Building Component ---
const ProjectBuilding = ({ project, position, activeProject, setActiveProject }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = activeProject === project.id;
  
  const accentColor = new THREE.Color(project.accent);
  const seed = project.id.charCodeAt(1);
  const baseHeight = 3 + (seed % 4); 
  const baseWidth = 2.5 + (seed % 2) * 0.5;

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
      {/* Foundation / Plaza */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <boxGeometry args={[BLOCK_SIZE - 1, 0.1, BLOCK_SIZE - 1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* The Architecture */}
      <group position={[0, 0.1, 0]}>
        {isTech ? (
          <GlassSkyscraper width={baseWidth} height={baseHeight * 1.5} accentColor={accentColor} hovered={hovered} isActive={isActive} />
        ) : isHeavy ? (
          <BrutalistBlock width={baseWidth} height={baseHeight} accentColor={accentColor} hovered={hovered} isActive={isActive} />
        ) : (
          <ModernCampus width={baseWidth * 1.2} height={baseHeight * 0.8} accentColor={accentColor} hovered={hovered} isActive={isActive} />
        )}
      </group>

      {/* Minimal Floating UI Bar */}
      {isActive && (
        <Html position={[0, baseHeight * 1.5 + 2, 0]} center zIndexRange={[100, 0]}>
          <div 
            className="flex items-center gap-4 px-6 py-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-full shadow-2xl whitespace-nowrap"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: `1px solid rgba(${project.accentRgb}, 0.3)`,
              color: '#000'
            }}
          >
            <div className="flex flex-col border-r border-black/10 pr-4">
              <span className="font-mono text-[10px] tracking-widest uppercase mb-0.5" style={{ color: project.accent }}>
                {project.category}
              </span>
              <h3 className="text-lg font-display font-black leading-none">{project.name}</h3>
            </div>
            <p className="text-black/60 text-sm font-medium max-w-[280px] truncate hidden md:block border-r border-black/10 pr-4">
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
                className="w-8 h-8 flex items-center justify-center rounded-full border border-black/10 hover:bg-black/5 transition-colors text-black/50 hover:text-black"
              >
                ✕
              </button>
            </div>
          </div>
        </Html>
      )}

      {/* Billboard Name */}
      {!isActive && (
        <Text
          position={[0, baseHeight * 1.5 + 1.5, 0]}
          rotation={[-Math.PI / 4, 0, 0]}
          fontSize={0.8}
          color={hovered ? accentColor : '#fff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000"
        >
          {project.name}
        </Text>
      )}
    </group>
  );
};

// --- Procedural City Blocks (Filler Buildings + Trees) ---
const CityBlocks = ({ projectBlockIndices }) => {
  const buildingMeshRef = useRef();
  const treeTrunkRef = useRef();
  const treeLeavesRef = useRef();

  useEffect(() => {
    if (!buildingMeshRef.current) return;
    
    const dummy = new THREE.Object3D();
    const treeDummy = new THREE.Object3D();
    const leafColor = new THREE.Color();
    const colors = ['#1a4314', '#2d5a27', '#3b6e34'];
    
    let buildingIdx = 0;
    let treeIdx = 0;

    for (let x = -GRID_SIZE/2; x < GRID_SIZE/2; x++) {
      for (let z = -GRID_SIZE/2; z < GRID_SIZE/2; z++) {
        const blockId = `${x},${z}`;
        // Skip if this block is reserved for a main project
        if (projectBlockIndices.includes(blockId)) continue;
        
        // Skip some blocks to create parks/plazas
        const isPark = Math.random() > 0.85;

        const blockCenterX = x * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2;
        const blockCenterZ = z * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2;

        if (!isPark) {
          // Generate a filler building block
          const height = 1 + Math.random() * 4;
          const width = (BLOCK_SIZE - 2) * (0.5 + Math.random() * 0.5);
          
          dummy.position.set(blockCenterX, height / 2, blockCenterZ);
          dummy.scale.set(width, height, width);
          dummy.updateMatrix();
          
          buildingMeshRef.current.setMatrixAt(buildingIdx, dummy.matrix);
          buildingIdx++;
        }

        // Generate Trees lining the block sidewalks
        for(let t = 0; t < 4; t++) {
          if (Math.random() > 0.5) continue; // Sparse trees
          
          const treeX = blockCenterX + (Math.random() - 0.5) * (BLOCK_SIZE - 1);
          const treeZ = blockCenterZ + (Math.random() - 0.5) * (BLOCK_SIZE - 1);
          
          treeDummy.position.set(treeX, 0, treeZ);
          treeDummy.scale.setScalar(0.5 + Math.random() * 0.5);
          treeDummy.updateMatrix();
          
          treeTrunkRef.current.setMatrixAt(treeIdx, treeDummy.matrix);
          treeLeavesRef.current.setMatrixAt(treeIdx, treeDummy.matrix);
          treeLeavesRef.current.setColorAt(treeIdx, leafColor.set(colors[Math.floor(Math.random() * colors.length)]));
          
          treeIdx++;
        }
      }
    }
    buildingMeshRef.current.instanceMatrix.needsUpdate = true;
    buildingMeshRef.current.count = buildingIdx;
    
    treeTrunkRef.current.instanceMatrix.needsUpdate = true;
    treeLeavesRef.current.instanceMatrix.needsUpdate = true;
    treeLeavesRef.current.instanceColor.needsUpdate = true;
    treeTrunkRef.current.count = treeIdx;
    treeLeavesRef.current.count = treeIdx;
  }, [projectBlockIndices]);

  return (
    <group>
      {/* Filler Buildings */}
      <instancedMesh ref={buildingMeshRef} args={[null, null, GRID_SIZE * GRID_SIZE]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </instancedMesh>
      
      {/* Sidewalk Trees */}
      <instancedMesh ref={treeTrunkRef} args={[null, null, GRID_SIZE * GRID_SIZE * 4]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 2, 5]} />
        <meshStandardMaterial color="#4a3b2c" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={treeLeavesRef} args={[null, null, GRID_SIZE * GRID_SIZE * 4]} castShadow receiveShadow>
        <coneGeometry args={[1.5, 4, 5]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </group>
  );
};

// --- Main Scene ---
const InteractiveCity = () => {
  const { camera } = useThree();
  const [activeProject, setActiveProject] = useState(null);
  const controlsRef = useRef();

  // Assign projects to specific grid blocks near the center
  const projectGridCoords = [
    { x: -1, z: -2 },
    { x: 1, z: -1 },
    { x: 0, z: 0 },
    { x: -2, z: 1 },
    { x: 2, z: 2 },
    { x: -1, z: 2 },
  ];

  const projectBlockIndices = projectGridCoords.map(c => `${c.x},${c.z}`);

  // Calculate actual 3D world positions based on grid config
  const projectPositions = projectGridCoords.map(coord => {
    return new THREE.Vector3(
      coord.x * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2,
      0,
      coord.z * (BLOCK_SIZE + ROAD_WIDTH) + (BLOCK_SIZE + ROAD_WIDTH) / 2
    );
  });

  const godViewPos = new THREE.Vector3(CITY_SIZE * 0.8, CITY_SIZE * 0.6, CITY_SIZE * 0.8);
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
      const targetPos = projectPositions[pIndex];
      
      // Calculate a cinematic street-level view looking up at the building
      const camPos = new THREE.Vector3(targetPos.x + BLOCK_SIZE, targetPos.y + 2, targetPos.z + BLOCK_SIZE);

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
        y: targetPos.y + 5, // Look up at the building
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
      <color attach="background" args={['#020617']} />
      <Sky sunPosition={[100, 20, 100]} turbidity={0.5} rayleigh={1} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <fog attach="fog" args={['#0f172a', 30, CITY_SIZE * 1.5]} />
      
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[100, 100, 50]} 
        intensity={2} 
        color="#fff"
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
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={5}
        maxDistance={CITY_SIZE * 1.2}
      />

      {/* The City Foundation */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[CITY_SIZE * 2, CITY_SIZE * 2]} />
        <meshStandardMaterial color="#020617" roughness={1} />
      </mesh>

      <Roads />
      <Traffic />

      {/* City Blocks (Fillers and Nature) */}
      <CityBlocks projectBlockIndices={projectBlockIndices} />

      {/* Main Project Architectural Marvels */}
      {projects.map((project, index) => (
        <ProjectBuilding 
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
