import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Text, useGLTF, useAnimations, MeshReflectorMaterial, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// Preload the placeholder assets
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

// --- High-Resolution 2D Map Plane ---
const TexturedMap = ({ size = 200 }) => {
  // We use the downloaded placeholder map. You will swap this for your GTA style JPG map.
  const mapTexture = useTexture('/map_placeholder.jpg');
  mapTexture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial map={mapTexture} roughness={0.8} />
    </mesh>
  );
};

// --- Interactive Map Pin (Hovering over the 3D asset) ---
const MapPin = ({ accentColor, isActive }) => {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (groupRef.current && !isActive) {
      // Bob up and down gently when not active
      groupRef.current.position.y = 8 + Math.sin(clock.elapsedTime * 2) * 1.5;
    }
  });

  if (isActive) return null; // Hide the pin when zoomed into the building

  return (
    <group ref={groupRef}>
      {/* Pin Head */}
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
      </mesh>
      {/* Pin Point */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[2, 0.1, 4, 32]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
};

// --- Project Location (Asset + Pin on the Map) ---
const ProjectLocation = ({ project, position, activeProject, setActiveProject }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = activeProject === project.id;
  const accentColor = new THREE.Color(project.accent);
  
  const BASE_SIZE = 12;

  return (
    <group position={position}>
      
      {/* The 3D Asset Placeholder sitting on the map */}
      <group position={[0, 0.1, 0]}>
        <AssetModel url="/LittlestTokyo.glb" />
      </group>

      {/* The Floating Map Pin */}
      <MapPin accentColor={accentColor} isActive={isActive} />

      {/* Invisible Click Target (Larger for easier clicking from God View) */}
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
        <cylinderGeometry args={[6, 6, 20, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* Glowing Base Ring when hovered in God View */}
      {!isActive && hovered && (
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[6, 8, 32]} />
          <meshBasicMaterial color={accentColor} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Billboard Name (God View) */}
      {!isActive && (
        <Text
          position={[0, 15, 0]}
          rotation={[-Math.PI / 2, 0, 0]} // Face straight up for top-down view
          fontSize={3}
          color={hovered ? accentColor : '#ffffff'}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.1}
          outlineColor="#000000"
        >
          {project.name}
        </Text>
      )}

      {/* Large Project Description Box UI (When Zoomed In) */}
      {isActive && (
        <Html
          position={[-BASE_SIZE, 6, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="w-[360px] md:w-[420px] opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(10, 12, 16, 0.9)',
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
    </group>
  );
};


// --- Main Scene ---
const InteractiveCity = ({ activeProject, setActiveProject }) => {
  const { camera } = useThree();
  const controlsRef = useRef();

  const MAP_SIZE = 200;

  // Scatter the 6 projects across the 200x200 2D map texture
  const projectPositions = [
    [-40, 0, -60],
    [50, 0, -30],
    [-20, 0, 10],
    [30, 0, 40],
    [-60, 0, 50],
    [70, 0, -70],
  ];

  // God View: Looking straight down from the sky
  const godViewPos = new THREE.Vector3(0, 160, 1); // Slight Z offset prevents gimbal lock
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
      
      // Calculate a cinematic 3D street-level view framing the project
      // We swoop down from the 2D top-down view into 3D!
      const camPos = new THREE.Vector3(targetPos.x + 15, targetPos.y + 6, targetPos.z + 20);

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
        y: targetPos.y + 4,
        z: targetPos.z,
        duration: 2.5,
        ease: 'power3.inOut',
        onUpdate: () => controlsRef.current.update()
      });
    } else {
      // Fly back up to the 2D God View Map
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
      <color attach="background" args={['#0a0f1a']} />
      
      {/* Soft lighting for the map */}
      <ambientLight intensity={1.2} />
      <directionalLight 
        position={[50, 100, 20]} 
        intensity={2} 
        color="#ffffff"
        castShadow 
        shadow-mapSize={[4096, 4096]} 
        shadow-camera-left={-MAP_SIZE/2}
        shadow-camera-right={MAP_SIZE/2}
        shadow-camera-top={MAP_SIZE/2}
        shadow-camera-bottom={-MAP_SIZE/2}
        shadow-bias={-0.0001}
      />

      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.1} 
        minDistance={10}
        maxDistance={250}
      />

      {/* The Reflective Ocean underneath the map to make the edges look premium */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[MAP_SIZE * 3, MAP_SIZE * 3]} />
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

      {/* Click the map floor to close projects */}
      <group onClick={() => setActiveProject(null)}>
        {/* The Massive High-Res Texture Map */}
        <TexturedMap size={MAP_SIZE} />
      </group>

      {/* Project Buildings & Map Pins on the Map */}
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
