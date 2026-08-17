import React, { useRef, useEffect } from 'react';
import { useGLTF, Html, ContactShadows, Environment, Float, PresentationControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { projects } from '../../data/projects';
import { ExternalLink } from 'lucide-react';

export default function MacBook({ activeProjectIndex }) {
  const laptopRef = useRef();
  
  // Load the lightweight MacBook GLTF model
  const { nodes, materials } = useGLTF(
    'https://vazxmixizkinqawvyr3z.supabase.co/storage/v1/object/public/models/macbook/model.gltf'
  );

  const project = projects[activeProjectIndex];

  // GSAP animation on project change
  useEffect(() => {
    if (laptopRef.current) {
      // 360 Spin effect
      gsap.fromTo(
        laptopRef.current.rotation,
        { y: laptopRef.current.rotation.y - Math.PI },
        { y: 0, duration: 1.5, ease: 'power3.out' }
      );
    }
  }, [activeProjectIndex]);

  return (
    <group position={[0, -1.2, 0]}>
      {/* Interactive controls so user can gently drag to rotate the laptop slightly */}
      <PresentationControls
        global
        rotation={[0.13, 0.1, 0]}
        polar={[-0.4, 0.2]}
        azimuth={[-1, 0.75]}
        config={{ mass: 2, tension: 400 }}
        snap={{ mass: 4, tension: 400 }}
      >
        <Float rotationIntensity={0.4} floatIntensity={1} speed={1.5}>
          <group ref={laptopRef}>
            {/* The actual 3D Laptop Model */}
            <primitive object={nodes.Scene} />
            
            {/* The HTML Screen Overlay */}
            {/* These coordinates specifically match the supabase macbook model screen plane */}
            <Html
              transform
              wrapperClass="macbook-screen-overlay"
              distanceFactor={1.17}
              position={[0, 1.56, -1.4]}
              rotation-x={-0.256}
            >
              <div 
                className="w-[1024px] h-[670px] bg-[#0A0A0C] border-[8px] border-black rounded-[8px] overflow-hidden flex flex-col p-12 transition-colors duration-1000"
                style={{
                  boxShadow: `inset 0 0 100px rgba(${project.accentRgb}, 0.1)`
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full" style={{ background: project.accent }} />
                    <span className="text-2xl font-mono tracking-widest text-white/50 uppercase">
                      {project.category}
                    </span>
                  </div>
                  <span className="text-2xl font-mono text-white/30">
                    {project.id} / 06
                  </span>
                </div>

                {/* Content */}
                <h1 className="text-8xl font-display font-black text-white tracking-tighter leading-none mb-8">
                  {project.name}
                </h1>
                
                <p className="text-4xl text-white/80 font-light leading-relaxed mb-12 max-w-3xl">
                  {project.tagline}
                </p>

                <p className="text-2xl text-white/60 leading-relaxed mb-auto max-w-4xl">
                  {project.description}
                </p>

                {/* Footer Action */}
                <div className="flex items-center gap-8 mt-12 pt-12 border-t border-white/10">
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-10 py-5 rounded-full font-bold text-2xl transition-all duration-300 hover:scale-105"
                    style={{
                      background: project.accent,
                      color: '#000',
                      boxShadow: `0 0 40px rgba(${project.accentRgb}, 0.4)`,
                    }}
                  >
                    <span>Launch Live Platform</span>
                    <ExternalLink size={24} />
                  </a>
                  <div className="flex items-center gap-4">
                    {project.tech.map((t, i) => (
                      <span key={i} className="px-5 py-2 bg-white/5 rounded-lg text-lg text-white/70 border border-white/10">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Html>
          </group>
        </Float>
      </PresentationControls>

      {/* Realistic shadows under the laptop */}
      <ContactShadows position={[0, -1.4, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      
      {/* Studio lighting environment for beautiful metal reflections */}
      <Environment preset="city" />
    </group>
  );
}

useGLTF.preload('https://vazxmixizkinqawvyr3z.supabase.co/storage/v1/object/public/models/macbook/model.gltf');
