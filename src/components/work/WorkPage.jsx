import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { projects } from '../../data/projects';
import Navbar from '../Navbar';
import WorkLoadingScreen from './WorkLoadingScreen';
import StudioMonitor from '../work3d/StudioMonitor';
import DeskEnvironment from '../work3d/DeskEnvironment';

// Cinematic Camera Controller
const CameraController = ({ activeIndex }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    gsap.fromTo(
      camera.position,
      { z: 6.5, y: 1 },
      { z: 5, y: 0, duration: 1.5, ease: 'power3.out' }
    );
    gsap.fromTo(
      camera.rotation,
      { x: -0.1 },
      { x: 0, duration: 1.5, ease: 'power3.out' }
    );
  }, [activeIndex, camera]);

  return null;
};

const WorkPage = () => {
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  const nextProject = useCallback(() => {
    setActiveIndex((prev) => (prev === projects.length - 1 ? 0 : prev + 1));
  }, []);

  const prevProject = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? projects.length - 1 : prev - 1));
  }, []);

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextProject();
      if (e.key === 'ArrowLeft') prevProject();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextProject, prevProject]);

  const activeProject = projects[activeIndex];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="relative bg-[#050508] text-foreground overflow-hidden h-[100svh] w-screen selection:bg-accent/30 selection:text-accent flex flex-col">
      <WorkLoadingScreen onComplete={handleLoadComplete} />
      
      {/* Navbar fixed to top */}
      <div className="absolute top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      {loaded && (
        <>
          {/* Main 3D Canvas Area */}
          <div className="flex-1 relative w-full h-full min-h-0">
            {/* The 3D Engine Studio */}
            <Canvas shadows camera={{ position: [0, 0, 6], fov: 45 }}>
              <color attach="background" args={['#050508']} />
              <fog attach="fog" args={['#050508', 5, 20]} />
              
              <ambientLight intensity={0.2} />
              
              {/* Soft rim light from the back */}
              <directionalLight position={[-5, 5, -5]} intensity={0.5} color={activeProject.accent} castShadow />
              
              <CameraController activeIndex={activeIndex} />

              <Suspense fallback={null}>
                <DeskEnvironment />
                <StudioMonitor activeProjectIndex={activeIndex} />
              </Suspense>
            </Canvas>

            {/* Navigation Controls (Desktop & Mobile) */}
            <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full px-4 md:px-12 flex justify-between items-center pointer-events-none z-40">
              <button 
                onClick={prevProject}
                className="w-12 h-12 md:w-16 md:h-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors pointer-events-auto"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextProject}
                className="w-12 h-12 md:w-16 md:h-16 bg-white/5 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-colors pointer-events-auto"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Progress UI (Dots) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-40">
              <span className="text-white/40 font-mono text-xs tracking-widest">
                {String(activeIndex + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              </span>
              <div className="flex items-center gap-2">
                {projects.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === activeIndex ? 'bg-white scale-125' : 'bg-white/20 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Extraction UI - because 3D text is too small on phones */}
          <div className="md:hidden w-full bg-[#0A0A0C] border-t border-white/10 p-6 z-50 shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.8)]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: activeProject.accent }} />
              <span className="text-xs font-mono tracking-widest text-white/50 uppercase">
                {activeProject.category}
              </span>
            </div>
            
            <h2 className="text-3xl font-display font-black text-white tracking-tighter leading-none mb-3">
              {activeProject.name}
            </h2>
            
            <p className="text-sm text-white/70 font-light leading-relaxed mb-6 line-clamp-2">
              {activeProject.tagline}
            </p>
            
            <a
              href={activeProject.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm transition-all duration-300"
              style={{
                background: activeProject.accent,
                color: '#000',
              }}
            >
              <span>Launch Site</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkPage;
