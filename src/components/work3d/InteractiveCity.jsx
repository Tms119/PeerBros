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

// --- Floating Island / Pedestal ---
const ProjectIsland = ({ project, position, activeProject, setActiveProject }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = activeProject === project.id;
  const accentColor = new THREE.Color(project.accent);
  
  const PEDESTAL_RADIUS = 7;

  return (
    <group position={position}>
      {/* The Pedestal Base */}
      <mesh position={[0, 0.5, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[PEDESTAL_RADIUS, PEDESTAL_RADIUS - 1, 1, 64]} />
        <meshStandardMaterial color="#0f1115" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Glowing Accent Ring */}
      <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[PEDESTAL_RADIUS - 0.5, PEDESTAL_RADIUS, 64]} />
        <meshBasicMaterial 
          color={accentColor} 
          transparent 
          opacity={hovered || isActive ? 1 : 0.3} 
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* The 3D Asset Placeholder */}
      <group position={[0, 1, 0]}>
        <AssetModel url="/LittlestTokyo.glb" />
      </group>

      {/* Interactive Raycast Shield */}
      <mesh 
        position={[0, 6, 0]} 
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
        <cylinderGeometry args={[PEDESTAL_RADIUS, PEDESTAL_RADIUS, 12, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* Large Project Description Box UI */}
      {isActive && (
        <Html
          position={[-PEDESTAL_RADIUS - 3, 5, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="w-[360px] md:w-[420px] opacity-0 animate-in fade-in zoom-in duration-500 rounded-3xl overflow-hidden shadow-2xl"
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
          position={[0, 10, 0]}
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

  // Arrange the 6 projects in a beautiful wide circle (The Archipelago)
  const RADIUS = 35;
  const projectPositions = projects.map((_, i) => {
    const angle = (i / projects.length) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * RADIUS,
      0,
      Math.sin(angle) * RADIUS
    );
  });

  const godViewPos = new THREE.Vector3(0, 40, RADIUS * 2.5);
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
      
      // Calculate a cinematic view framing the island
      // We look from slightly outside the circle inwards
      const angle = (pIndex / projects.length) * Math.PI * 2;
      const camOffset = new THREE.Vector3(
        Math.cos(angle) * 15,
        5,
        Math.sin(angle) * 15
      );
      
      const camPos = new THREE.Vector3().addVectors(targetPos, camOffset);

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
        y: targetPos.y + 4,
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
      <color attach="background" args={['#05070a']} />
      
      {/* Cinematic Fog and Sky */}
      <fog attach="fog" args={['#05070a', 40, RADIUS * 3.5]} />
      
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[100, 50, -50]} 
        intensity={2} 
        color="#e0eaff"
        castShadow 
        shadow-mapSize={[4096, 4096]} 
        shadow-camera-left={-RADIUS * 2}
        shadow-camera-right={RADIUS * 2}
        shadow-camera-top={RADIUS * 2}
        shadow-camera-bottom={-RADIUS * 2}
        shadow-bias={-0.0001}
      />
      <directionalLight position={[-50, 20, 50]} intensity={1} color="#3b82f6" />

      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2.05} 
        minDistance={5}
        maxDistance={RADIUS * 3}
      />

      {/* The Serene Ocean (Background Click to Close) */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        onClick={() => setActiveProject(null)}
      >
        <planeGeometry args={[RADIUS * 10, RADIUS * 10]} />
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

      {/* Floating Project Islands */}
      {projects.map((project, index) => (
        <ProjectIsland 
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
