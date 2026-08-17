import React, { useRef, useEffect } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import { projects } from '../../data/projects';
import { ExternalLink } from 'lucide-react';

export default function StudioMonitor({ activeProjectIndex }) {
  const monitorRef = useRef();
  const project = projects[activeProjectIndex];

  useEffect(() => {
    if (monitorRef.current) {
      gsap.fromTo(
        monitorRef.current.rotation,
        { y: monitorRef.current.rotation.y - Math.PI },
        { y: 0, duration: 1.5, ease: 'power3.out' }
      );
    }
  }, [activeProjectIndex]);

  return (
    <group position={[0, -0.5, 0.5]}>
      <group ref={monitorRef}>
        
        {/* Base/Stand */}
        <RoundedBox args={[1.5, 0.08, 1.2]} radius={0.02} smoothness={4} position={[0, 0, -0.5]} castShadow receiveShadow>
          <meshStandardMaterial color="#888c8f" metalness={0.9} roughness={0.3} />
        </RoundedBox>
        
        {/* Neck */}
        <RoundedBox args={[0.3, 1.4, 0.15]} radius={0.05} smoothness={4} position={[0, 0.7, -0.8]} castShadow>
          <meshStandardMaterial color="#888c8f" metalness={0.9} roughness={0.3} />
        </RoundedBox>

        {/* Screen Display */}
        <group position={[0, 1.6, -0.6]}>
          {/* Outer Aluminum Case */}
          <RoundedBox args={[4.4, 2.8, 0.15]} radius={0.05} smoothness={4} castShadow>
            <meshStandardMaterial color="#888c8f" metalness={0.9} roughness={0.3} />
          </RoundedBox>
          
          {/* Inner Black Bezel */}
          <RoundedBox args={[4.3, 2.7, 0.17]} radius={0.02} smoothness={4} position={[0, 0, 0.01]}>
            <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.5} />
          </RoundedBox>

          {/* The HTML Screen Overlay (Precisely Placed on the Z-axis to prevent clipping) */}
          <Html
            transform
            wrapperClass="studio-monitor-overlay"
            distanceFactor={1.25}
            position={[0, 0, 0.1]} // Perfectly in front of bezel, zero clipping
            rotation-x={0}
          >
            <div 
              className="w-[1280px] h-[780px] bg-[#0A0A0C] overflow-hidden flex flex-col p-16 transition-colors duration-1000"
              style={{
                boxShadow: `inset 0 0 120px rgba(${project.accentRgb}, 0.15)`
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-6">
                  <div className="w-4 h-4 rounded-full" style={{ background: project.accent }} />
                  <span className="text-3xl font-mono tracking-widest text-white/50 uppercase">
                    {project.category}
                  </span>
                </div>
                <span className="text-3xl font-mono text-white/30">
                  {project.id} / 06
                </span>
              </div>

              {/* Content */}
              <h1 className="text-9xl font-display font-black text-white tracking-tighter leading-none mb-10">
                {project.name}
              </h1>
              
              <p className="text-5xl text-white/80 font-light leading-relaxed mb-12 max-w-4xl">
                {project.tagline}
              </p>

              <p className="text-3xl text-white/60 leading-relaxed mb-auto max-w-5xl">
                {project.description}
              </p>

              {/* Footer Action */}
              <div className="flex items-center gap-10 mt-12 pt-12 border-t border-white/10">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-12 py-6 rounded-full font-bold text-3xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: project.accent,
                    color: '#000',
                    boxShadow: `0 0 50px rgba(${project.accentRgb}, 0.4)`,
                  }}
                >
                  <span>Launch Live Platform</span>
                  <ExternalLink size={28} />
                </a>
                <div className="flex items-center gap-4">
                  {project.tech.map((t, i) => (
                    <span key={i} className="px-6 py-3 bg-white/5 rounded-xl text-2xl text-white/70 border border-white/10">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Html>
        </group>
      </group>
    </group>
  );
}
