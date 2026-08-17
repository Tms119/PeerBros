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
        <group position={[0, 1.8, -0.6]}>
          {/* Outer Aluminum Case (16:9 aspect ratio) */}
          <RoundedBox args={[4.8, 2.7, 0.15]} radius={0.05} smoothness={4} castShadow>
            <meshStandardMaterial color="#888c8f" metalness={0.9} roughness={0.3} />
          </RoundedBox>
          
          {/* Inner Black Bezel (Strict 16:9 bounds) */}
          <RoundedBox args={[4.6, 2.5875, 0.17]} radius={0.02} smoothness={4} position={[0, 0, 0.01]}>
            <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.5} />
          </RoundedBox>

          {/* The HTML Screen Overlay (Mathematically scaled to perfectly fit 4.6 width) */}
          <Html
            transform
            wrapperClass="studio-monitor-overlay"
            scale={0.0044921875} // 4.6 (3D width) / 1024 (CSS width)
            position={[0, 0, 0.1]} // Perfectly in front of bezel, zero clipping
            rotation-x={0}
          >
            <div 
              className="w-[1024px] h-[576px] bg-[#0A0A0C] overflow-hidden flex flex-col p-10 transition-colors duration-1000"
              style={{
                boxShadow: `inset 0 0 100px rgba(${project.accentRgb}, 0.2)`
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
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
              <h1 className="text-7xl font-display font-black text-white tracking-tighter leading-none mb-6">
                {project.name}
              </h1>
              
              <p className="text-3xl text-white/80 font-light leading-relaxed mb-6 max-w-3xl">
                {project.tagline}
              </p>

              <p className="text-xl text-white/60 leading-relaxed mb-auto max-w-4xl line-clamp-3">
                {project.description}
              </p>

              {/* Footer Action */}
              <div className="flex items-center gap-8 mt-6 pt-6 border-t border-white/10 shrink-0">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-8 py-4 rounded-full font-bold text-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: project.accent,
                    color: '#000',
                    boxShadow: `0 0 40px rgba(${project.accentRgb}, 0.4)`,
                  }}
                >
                  <span>Launch Live Platform</span>
                  <ExternalLink size={20} />
                </a>
                <div className="flex items-center gap-3">
                  {project.tech.map((t, i) => (
                    <span key={i} className="px-4 py-2 bg-white/5 rounded-lg text-lg text-white/70 border border-white/10">
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
