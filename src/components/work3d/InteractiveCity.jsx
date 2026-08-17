import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, Stars, Sparkles, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import gsap from 'gsap';

// --- The Network Connections ---
// Draws laser-like lines connecting all the nodes
const NetworkLines = ({ positions }) => {
  const points = [];
  // Connect each node to the next, and the last to the first to form a closed loop
  for (let i = 0; i < positions.length; i++) {
    points.push(new THREE.Vector3(...positions[i]));
  }
  points.push(new THREE.Vector3(...positions[0])); // Close the loop

  // Add some cross connections for a "web" look
  const crossPoints = [
    new THREE.Vector3(...positions[0]),
    new THREE.Vector3(...positions[3]),
    new THREE.Vector3(...positions[1]),
    new THREE.Vector3(...positions[4]),
  ];

  return (
    <group>
      <Line
        points={points}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.15}
      />
      <Line
        points={crossPoints}
        color="#ffffff"
        lineWidth={1}
        transparent
        opacity={0.1}
      />
    </group>
  );
};


// --- The Data Node (Project Orb) ---
const DataNode = ({ project, position, activeProject, setActiveProject }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = activeProject === project.id;
  const accentColor = new THREE.Color(project.accent);
  
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.2;
      coreRef.current.rotation.y = t * 0.3;
      coreRef.current.position.y = Math.sin(t * 2 + position[0]) * 1.5; // Bobbing
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = t * 0.5;
      ring1Ref.current.rotation.y = t * 0.8;
      ring1Ref.current.position.y = Math.sin(t * 2 + position[0]) * 1.5;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -t * 0.3;
      ring2Ref.current.rotation.y = -t * 0.6;
      ring2Ref.current.position.y = Math.sin(t * 2 + position[0]) * 1.5;
    }
  });

  return (
    <group position={position}>
      
      {/* The Core (Sci-Fi Icosahedron) */}
      <mesh 
        ref={coreRef} 
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
        <icosahedronGeometry args={[3, 1]} />
        <meshStandardMaterial 
          color={accentColor} 
          emissive={accentColor} 
          emissiveIntensity={hovered || isActive ? 2 : 1}
          wireframe={hovered} // Cool wireframe effect on hover
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Kinetic Ring 1 */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[5, 0.1, 16, 64]} />
        <meshBasicMaterial color={accentColor} transparent opacity={hovered || isActive ? 0.8 : 0.3} />
      </mesh>

      {/* Kinetic Ring 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.5, 0.05, 16, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>

      {/* Invisible Click Target (Larger for easier clicking) */}
      <mesh 
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
        <sphereGeometry args={[7, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* Billboard Name (God View) */}
      {!isActive && (
        <Text
          position={[0, 9, 0]}
          fontSize={2.5}
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
          position={[-12, 0, 0]}
          center
          zIndexRange={[100, 0]}
        >
          <div 
            className="w-[360px] md:w-[420px] opacity-0 animate-in fade-in zoom-in duration-500 rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'rgba(5, 7, 12, 0.85)',
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
const InteractiveNetwork = ({ activeProject, setActiveProject }) => {
  const { camera } = useThree();
  const controlsRef = useRef();

  // Position nodes dynamically in a 3D Constellation (x, y, z)
  const projectPositions = [
    [-30, 10, -40],
    [40, 25, -20],
    [-20, -10, 15],
    [35, -5, 30],
    [-45, 15, 35],
    [10, -20, -50],
  ];

  // God View: Looking at the entire constellation from afar
  const godViewPos = new THREE.Vector3(0, 0, 140);
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
      
      // Calculate a cinematic close-up view of the glowing Node
      const camPos = new THREE.Vector3(targetPos.x + 10, targetPos.y + 5, targetPos.z + 25);

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
        y: targetPos.y,
        z: targetPos.z,
        duration: 2.5,
        ease: 'power3.inOut',
        onUpdate: () => controlsRef.current.update()
      });
    } else {
      // Fly back out to the entire constellation
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
      {/* Deep Space Background */}
      <color attach="background" args={['#02040a']} />
      
      {/* Particle Systems (The Data/Stars) */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={500} scale={150} size={4} speed={0.4} opacity={0.2} color="#ffffff" />
      
      {/* Dramatic Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[50, 50, 50]} intensity={2} color="#ffffff" />
      <pointLight position={[0, 0, 0]} intensity={1} color="#3b82f6" distance={100} />

      <OrbitControls 
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={250}
        autoRotate={!activeProject} // Slowly rotate the entire network when idle!
        autoRotateSpeed={0.5}
      />

      {/* Click the void to close projects */}
      <mesh 
        visible={false}
        onClick={() => setActiveProject(null)}
      >
        <sphereGeometry args={[500, 32, 32]} />
        <meshBasicMaterial side={THREE.BackSide} />
      </mesh>

      <group>
        {/* Network Lines */}
        <NetworkLines positions={projectPositions} />

        {/* Data Nodes */}
        {projects.map((project, index) => (
          <DataNode 
            key={project.id} 
            project={project} 
            position={projectPositions[index]}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
          />
        ))}
      </group>
    </>
  );
};

export default InteractiveNetwork;
