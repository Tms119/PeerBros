import React, { useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { Draggable } from 'gsap/Draggable';
import { Minus, Square, X, ExternalLink } from 'lucide-react';
import { MagneticButton } from '../MicroInteractions';

gsap.registerPlugin(Draggable);

const OSWindow = ({ 
  windowState, 
  project, 
  onFocus, 
  onClose, 
  onMinimize, 
  onMaximize 
}) => {
  const windowRef = useRef(null);
  const dragInstance = useRef(null);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  useLayoutEffect(() => {
    if (!windowRef.current) return;
    
    // Mount animation
    if (isMobile) {
      gsap.fromTo(windowRef.current, { y: window.innerHeight, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' });
    } else {
      gsap.fromTo(windowRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' });
    }
  }, [isMobile]);

  useEffect(() => {
    if (!windowRef.current || isMobile) return;

    dragInstance.current = Draggable.create(windowRef.current, {
      type: 'x,y',
      trigger: '.window-titlebar',
      bounds: '.peer-os-desktop',
      onPress: onFocus,
      inertia: false,
      edgeResistance: 0.8, // Snapping resistance
    })[0];

    return () => {
      if (dragInstance.current) dragInstance.current.kill();
    };
  }, [onFocus, isMobile]);

  // Bring to front on click (handled by parent passing updated zIndex, but we also call onFocus)
  const handlePointerDown = (e) => {
    // Only focus if we didn't click a window control
    if (!e.target.closest('.window-controls')) {
      onFocus();
    }
  };

  if (windowState.isMinimized) return null;

  const isMaximized = windowState.isMaximized || isMobile;

  return (
    <div
      ref={windowRef}
      onPointerDown={handlePointerDown}
      className={`absolute flex flex-col bg-[#0A0A0C]/90 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
        isMaximized 
          ? 'top-0 left-0 w-full h-[calc(100%-80px)] md:h-[calc(100%-100px)] rounded-none !translate-x-0 !translate-y-0' 
          : 'w-[90vw] md:w-[800px] h-[70vh] md:h-[600px] rounded-xl'
      }`}
      style={{
        zIndex: windowState.zIndex,
        // On desktop if not maximized, set initial position via transform (handled by GSAP Draggable usually, but we set initial left/top)
        left: isMaximized ? 0 : windowState.x,
        top: isMaximized ? 0 : windowState.y,
        boxShadow: `0 30px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(${project.accentRgb}, 0.2)`
      }}
    >
      {/* Massive Close Button for Mobile */}
      {isMobile && (
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white active:bg-white/20"
        >
          <X size={24} />
        </button>
      )}

      {/* Title Bar (Draggable Area) */}
      {!isMobile && (
        <div 
          className="window-titlebar flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10 select-none cursor-grab active:cursor-grabbing"
        >
          <div className="window-controls flex items-center gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-3 h-3 rounded-full bg-[#FF5F56] hover:bg-[#FF5F56]/80 flex items-center justify-center group"
            >
              <X size={8} className="opacity-0 group-hover:opacity-100 text-black" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onMinimize(); }}
              className="w-3 h-3 rounded-full bg-[#FFBD2E] hover:bg-[#FFBD2E]/80 flex items-center justify-center group"
            >
              <Minus size={8} className="opacity-0 group-hover:opacity-100 text-black" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onMaximize(); }}
              className="w-3 h-3 rounded-full bg-[#27C93F] hover:bg-[#27C93F]/80 flex items-center justify-center group"
            >
              <Square size={6} className="opacity-0 group-hover:opacity-100 text-black" />
            </button>
          </div>
          
          <div className="flex-1 text-center text-xs font-mono tracking-widest text-white/50 pointer-events-none">
            {project.name.toLowerCase()}.exe
          </div>
          
          <div className="w-[52px]" /> {/* Spacer for balance */}
        </div>
      )}

      {/* Window Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: project.accent }} />
            <span className="text-sm font-mono tracking-widest uppercase text-white/50">
              {project.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-6">
            {project.name}
          </h1>

          <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed mb-8">
            {project.tagline}
          </p>

          <p className="text-base text-white/60 leading-relaxed mb-12">
            {project.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-12">
            {project.features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 py-3 border-b border-white/10">
                <div className="mt-1.5 w-1 h-1 rounded-full" style={{ background: project.accent }} />
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h3 className="text-xs font-mono tracking-widest text-white/40 mb-4 uppercase">Tech Stack</h3>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t, i) => (
                <span key={i} className="px-3 py-1 bg-white/5 rounded-md text-xs text-white/70 border border-white/10">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <MagneticButton
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-sm transition-all duration-300 w-full md:w-auto"
            style={{
              background: project.accent,
              color: '#000',
              boxShadow: `0 0 30px rgba(${project.accentRgb}, 0.3)`,
            }}
          >
            <span>Launch Platform</span>
            <ExternalLink size={16} />
          </MagneticButton>
        </div>
      </div>
    </div>
  );
};

export default OSWindow;
