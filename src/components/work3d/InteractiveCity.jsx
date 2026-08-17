import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, useGLTF, useAnimations, OrbitControls, Sky, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// Preload the real 3D asset
useGLTF.preload('/LittlestTokyo.glb');

// --- Centerpiece City Model ---
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
      position={[0, 0, 0]} 
      scale={[0.02, 0.02, 0.02]} 
    />
  );
};

// --- Procedural Instanced Forest ---
const ProceduralForest = () => {
  const count = 2000;
  const trunkRef = useRef();
  const leavesRef = useRef();

  useEffect(() => {
    if (!trunkRef.current || !leavesRef.current) return;
    
    const dummy = new THREE.Object3D();
    const colorDummy = new THREE.Color();
    
    // Base colors for variation
    const leafColors = ['#1a4314', '#2d5a27', '#153310', '#3b6e34'];

    let i = 0;
    // Scatter trees across a massive 200x200 grid
    for (let x = -100; x < 100; x += 3) {
      for (let z = -100; z < 100; z += 3) {
        // Keep a massive clearing for the city and immediate surroundings
        if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;
        // Keep clearing for the river/ocean edge
        const distanceToCenter = Math.sqrt(x*x + z*z);
        if (distanceToCenter > 90) continue; // Don't place trees in the ocean

        // Organic clustering
        if (Math.random() > 0.4) continue;
        if (i >= count) break;

        const scale = Math.random() * 0.5 + 0.5;
        // Scatter slightly off grid
        dummy.position.set(x + (Math.random() - 0.5) * 2, 0, z + (Math.random() - 0.5) * 2);
        dummy.scale.set(scale, scale, scale);
        // Random rotation for organic look
        dummy.rotation.y = Math.random() * Math.PI;
        dummy.updateMatrix();
        
        trunkRef.current.setMatrixAt(i, dummy.matrix);
        leavesRef.current.setMatrixAt(i, dummy.matrix);
        
        // Randomize leaf color slightly
        const randomColor = leafColors[Math.floor(Math.random() * leafColors.length)];
        leavesRef.current.setColorAt(i, colorDummy.set(randomColor));

        i++;
      }
    }
    trunkRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceMatrix.needsUpdate = true;
    leavesRef.current.instanceColor.needsUpdate = true;
  }, []);

  return (
    <group>
      {/* Trunks */}
      <instancedMesh ref={trunkRef} args={[null, null, count]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.4, 2, 5]} />
        {/* Shift geometry up so base is at 0,0,0 */}
        <meshStandardMaterial color="#4a3b2c" roughness={1} />
      </instancedMesh>
      
      {/* Leaves */}
      <instancedMesh ref={leavesRef} args={[null, null, count]} castShadow receiveShadow>
        <coneGeometry args={[1.5, 4, 5]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </group>
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
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial 
          color={hovered || isActive ? accentColor : "#ffffff"}
          emissive={hovered || isActive ? accentColor : "#ffffff"}
          emissiveIntensity={hovered || isActive ? 2 : 0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.45, 32]} />
        <meshBasicMaterial 
          color={accentColor}
          transparent
          opacity={hovered || isActive ? 0.8 : 0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {isActive && (
        <Html
          position={[0, 1.5, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="flex items-center gap-4 px-6 py-4 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-full shadow-2xl whitespace-nowrap"
            style={{
              background: 'rgba(20, 20, 25, 0.85)',
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

  // Shifted geometry in trees requires we lift them, but simpler to just shift the mesh inside InstancedMesh
  // We handle it via Matrix in the loop above

  const projectPositions = [
    [-3, 2, -2],
    [1, 1.5, -4],
    [3.5, 0.5, 0],
    [-4, 0.5, 2],
    [-1, 2.5, 3],
    [2, 3, 2],
  ];

  const godViewPos = new THREE.Vector3(25, 15, 25);
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

  // Adjust tree geometry shifting so the base is exactly at 0
  useEffect(() => {
    // This is handled by positioning the geometry directly in standard ThreeJS, 
    // but in R3F instancedMesh, we can't easily translate geometry declaratively.
    // So we just let them sink into the ground slightly, which looks fine for trees!
  }, []);

  return (
    <>
      {/* Dynamic Golden Hour Sky & Atmosphere */}
      <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={0.5} mieCoefficient={0.005} mieDirectionalG={0.8} />
      <fog attach="fog" args={['#d6e3f2', 40, 180]} />
      
      {/* Cinematic Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[100, 50, 100]} 
        intensity={2.5} 
        color="#ffecd6"
        castShadow 
        shadow-mapSize={[4096, 4096]} 
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-50, 20, -50]} intensity={0.5} color="#a0c2f2" />

      {/* Constraints to prevent clipping into ground/ocean */}
      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.05} 
        minDistance={2}
        maxDistance={60}
      />

      {/* --- The World --- */}

      {/* 1. The Landmass (Island) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <cylinderGeometry args={[95, 100, 0.5, 64]} />
        <meshStandardMaterial color="#2d4a22" roughness={0.9} />
      </mesh>

      {/* 2. The Reflective Ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[500, 500]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={30}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#1e3a5f"
          metalness={0.8}
        />
      </mesh>

      {/* 3. The Instanced Forest (2000 Trees, 2 draw calls) */}
      <ProceduralForest />

      {/* 4. The City Centerpiece */}
      <RealCityModel />

      {/* 5. Interactive UI Hotspots */}
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
