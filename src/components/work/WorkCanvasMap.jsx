import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { ExternalLink, X, Maximize2 } from 'lucide-react';
import { projects } from '../../data/projects';
import { MagneticButton } from '../MicroInteractions';

gsap.registerPlugin(Draggable);

// Spread the projects around a massive 5000x5000 canvas
const PROJECT_POSITIONS = [
  { x: 1500, y: 1500 }, // OutreachOS
  { x: 3000, y: 1200 }, // ThemesZoo
  { x: 2200, y: 2500 }, // Moneo
  { x: 3500, y: 3000 }, // WhoGoHost
  { x: 1200, y: 3200 }, // Earose
  { x: 4200, y: 2000 }, // RRS Tek
];

const WorkCanvasMap = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeProject, setActiveProject] = useState(null);
  const draggableInstance = useRef(null);

  // Initialize Draggable Map
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Start centered roughly in the middle
    gsap.set(canvasRef.current, {
      x: -1500,
      y: -1000,
      scale: 1,
      transformOrigin: '0 0'
    });

    draggableInstance.current = Draggable.create(canvasRef.current, {
      type: 'x,y',
      bounds: {
        minX: -5000 + window.innerWidth,
        maxX: 0,
        minY: -5000 + window.innerHeight,
        maxY: 0,
      },
      edgeResistance: 0.65,
      zIndexBoost: false,
    })[0];

    return () => {
      if (draggableInstance.current) draggableInstance.current.kill();
    };
  }, []);

  // Zoom to Project
  const focusOnProject = (index) => {
    if (!canvasRef.current || !containerRef.current) return;
    
    // Disable dragging while focused
    if (draggableInstance.current) draggableInstance.current.disable();
    setActiveProject(index);

    const pos = PROJECT_POSITIONS[index];
    const targetScale = 1.5; // Zoom in

    // Calculate center of screen
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    // We want the project's coordinate (pos.x, pos.y) to end up at (cx, cy) after scaling
    const targetX = cx - (pos.x * targetScale);
    const targetY = cy - (pos.y * targetScale);

    gsap.to(canvasRef.current, {
      x: targetX,
      y: targetY,
      scale: targetScale,
      duration: 1.2,
      ease: 'power4.inOut',
    });
  };

  // Zoom out back to map
  const resetView = () => {
    if (!canvasRef.current) return;
    setActiveProject(null);
    
    // Re-enable dragging
    if (draggableInstance.current) draggableInstance.current.enable();

    // Zoom back out to 1, keeping roughly the same center
    const currentX = gsap.getProperty(canvasRef.current, 'x');
    const currentY = gsap.getProperty(canvasRef.current, 'y');
    
    gsap.to(canvasRef.current, {
      scale: 1,
      // Adjust x and y so we don't jump, just zoom out
      x: Math.max(-5000 + window.innerWidth, Math.min(0, currentX / 1.5)),
      y: Math.max(-5000 + window.innerHeight, Math.min(0, currentY / 1.5)),
      duration: 1.2,
      ease: 'power3.inOut',
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-screen h-[100svh] overflow-hidden bg-[#050508] cursor-grab active:cursor-grabbing"
    >
      {/* UI Overlay */}
      <div className="absolute top-6 md:top-12 left-6 md:left-12 z-50 pointer-events-none">
        <h1 className="font-display font-black text-white text-2xl tracking-tighter uppercase mb-2">
          The Blueprint
        </h1>
        <p className="text-white/50 text-xs font-mono tracking-widest uppercase">
          {activeProject !== null ? 'Focus Mode' : 'Drag to Explore'}
        </p>
      </div>

      {activeProject !== null && (
        <button
          onClick={resetView}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
        >
          <X size={16} />
          Back to Map
        </button>
      )}

      {/* Massive 5000x5000 Canvas */}
      <div 
        ref={canvasRef} 
        className="absolute top-0 left-0 w-[5000px] h-[5000px] will-change-transform"
        style={{
          // Blueprint grid background
          backgroundImage: `
            linear-gradient(rgba(124, 111, 224, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 111, 224, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(124, 111, 224, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124, 111, 224, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          backgroundPosition: '-1px -1px, -1px -1px, -1px -1px, -1px -1px'
        }}
      >
        {/* SVG Connection Lines (Circuit logic) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <path 
            d="M 1500 1500 L 2200 1500 L 2200 2500" 
            stroke="#7C6FE0" strokeWidth="2" fill="none" strokeDasharray="10 10" 
          />
          <path 
            d="M 3000 1200 L 3000 3000 L 3500 3000" 
            stroke="#7C6FE0" strokeWidth="2" fill="none" strokeDasharray="10 10" 
          />
          <path 
            d="M 1500 1500 L 1500 3200 L 1200 3200" 
            stroke="#7C6FE0" strokeWidth="2" fill="none" strokeDasharray="10 10" 
          />
          <path 
            d="M 3000 1200 L 4200 1200 L 4200 2000" 
            stroke="#7C6FE0" strokeWidth="2" fill="none" strokeDasharray="10 10" 
          />
        </svg>

        {/* Project Nodes */}
        {projects.map((project, index) => {
          const pos = PROJECT_POSITIONS[index];
          const isFocused = activeProject === index;
          const isFaded = activeProject !== null && !isFocused;

          return (
            <div
              key={project.id}
              className="absolute group transition-opacity duration-700"
              style={{
                left: pos.x,
                top: pos.y,
                // Center the div on the exact coordinate
                transform: 'translate(-50%, -50%)',
                opacity: isFaded ? 0.1 : 1,
                pointerEvents: isFaded ? 'none' : 'auto',
                width: isFocused ? '600px' : '400px',
                transitionProperty: 'width, opacity',
              }}
            >
              {/* Node Core UI */}
              <div 
                className="bg-[#0A0A0C] border border-white/10 rounded-3xl p-8 backdrop-blur-xl transition-all duration-500 hover:border-white/30"
                style={{ 
                  boxShadow: isFocused ? `0 0 80px rgba(${project.accentRgb}, 0.2)` : '0 20px 40px rgba(0,0,0,0.5)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: project.accent }} />
                    <span className="text-xs font-mono tracking-widest text-white/50">
                      NODE {project.id}
                    </span>
                  </div>
                  {!isFocused && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        focusOnProject(index);
                      }}
                      className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                    >
                      <Maximize2 size={16} />
                    </button>
                  )}
                </div>

                <h2 className="text-4xl font-display font-black text-white tracking-tighter leading-none mb-4">
                  {project.name}
                </h2>
                
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                  {isFocused ? project.description : project.tagline}
                </p>

                {/* Expanded Details when Focused */}
                {isFocused && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {project.features.map((f, i) => (
                        <div key={i} className="text-xs text-white/70 py-2 border-b border-white/10">
                          {f}
                        </div>
                      ))}
                    </div>
                    
                    <MagneticButton
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold text-sm transition-all duration-300"
                      style={{
                        background: project.accent,
                        color: '#000',
                      }}
                    >
                      <span>Deploy Live</span>
                      <ExternalLink size={16} />
                    </MagneticButton>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkCanvasMap;
