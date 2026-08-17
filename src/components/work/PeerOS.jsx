import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { projects } from '../../data/projects';
import OSWindow from './OSWindow';
import * as LucideIcons from 'lucide-react';

const PeerOS = () => {
  const [windows, setWindows] = useState([]);
  const [activeZIndex, setActiveZIndex] = useState(10);
  const [time, setTime] = useState(new Date());

  const dockRef = useRef(null);
  const topBarRef = useRef(null);
  const iconsRef = useRef([]);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Boot Sequence
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(topBarRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' });
      gsap.fromTo(dockRef.current, { y: 100, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.2 });
      gsap.fromTo(iconsRef.current, 
        { scale: 0.8, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.5)', delay: 0.5 }
      );
    });
    return () => ctx.revert();
  }, []);

  const openApp = (project) => {
    // Check if already open
    const existingIndex = windows.findIndex(w => w.projectId === project.id);
    
    if (existingIndex >= 0) {
      // Focus it and ensure it's un-minimized
      const updatedWindows = [...windows];
      updatedWindows[existingIndex].zIndex = activeZIndex + 1;
      updatedWindows[existingIndex].isMinimized = false;
      setWindows(updatedWindows);
      setActiveZIndex(prev => prev + 1);
      return;
    }

    // Open new
    // Stagger initial positions slightly
    const offset = (windows.length * 40) % 200;
    
    const newWindow = {
      id: `win-${Date.now()}`,
      projectId: project.id,
      x: 100 + offset,
      y: 100 + offset,
      zIndex: activeZIndex + 1,
      isMinimized: false,
      isMaximized: false,
    };

    setWindows([...windows, newWindow]);
    setActiveZIndex(prev => prev + 1);
  };

  const closeWindow = (winId) => {
    setWindows(windows.filter(w => w.id !== winId));
  };

  const focusWindow = (winId) => {
    setWindows(windows.map(w => {
      if (w.id === winId && w.zIndex !== activeZIndex + 1) {
        setActiveZIndex(prev => prev + 1);
        return { ...w, zIndex: activeZIndex + 1, isMinimized: false };
      }
      return w;
    }));
  };

  const toggleMinimize = (winId) => {
    setWindows(windows.map(w => w.id === winId ? { ...w, isMinimized: !w.isMinimized } : w));
  };

  const toggleMaximize = (winId) => {
    setWindows(windows.map(w => w.id === winId ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  // Helper to render dynamic icon
  const getIcon = (iconName, color, size = 24) => {
    const Icon = LucideIcons[iconName] || LucideIcons.File;
    return <Icon size={size} color={color} />;
  };

  return (
    <div className="peer-os-desktop relative w-screen h-[100svh] overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      
      {/* Top Menu Bar */}
      <div ref={topBarRef} className="absolute top-0 left-0 w-full h-8 bg-black/40 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4 text-xs font-mono text-white/70">
        <div className="flex items-center gap-4">
          <LucideIcons.Command size={14} className="text-white hidden md:block" />
          <span className="font-bold text-white hidden md:inline">PeerOS v1.0</span>
          <a href="/" className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
            <LucideIcons.ChevronLeft size={16} className="md:hidden" />
            <span className="md:hidden font-bold">Home</span>
            <span className="hidden md:inline">Home</span>
          </a>
          <span className="hidden md:inline cursor-pointer hover:text-white transition-colors">File</span>
          <span className="hidden md:inline cursor-pointer hover:text-white transition-colors">View</span>
          <span className="hidden md:inline cursor-pointer hover:text-white transition-colors">Help</span>
        </div>
        <div className="flex items-center gap-4">
          <LucideIcons.Wifi size={14} />
          <LucideIcons.Battery size={14} />
          <span>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Desktop Grid (Shortcuts) */}
      <div className="absolute top-12 left-4 md:bottom-24 bottom-4 right-4 md:right-auto flex flex-row md:flex-col flex-wrap content-start gap-6 md:gap-6 p-4 md:w-28 w-full z-0">
        {projects.map((project, index) => (
          <button
            key={`desktop-${project.id}`}
            ref={el => iconsRef.current[index] = el}
            onClick={() => openApp(project)}
            className="group flex flex-col items-center gap-2 w-20 md:w-20 outline-none"
          >
            <div 
              className="w-14 h-14 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white/10 group-focus:bg-white/20 group-focus:border-white/40"
              style={{ boxShadow: `inset 0 0 20px rgba(${project.accentRgb}, 0.2)` }}
            >
              {getIcon(project.category_icon, project.accent, 28)}
            </div>
            <span className="text-xs text-white/80 font-medium text-center drop-shadow-md px-1 rounded group-focus:bg-blue-600 group-focus:text-white line-clamp-2 leading-tight">
              {project.name}
            </span>
          </button>
        ))}
      </div>

      {/* Render Open Windows */}
      {windows.map(win => {
        const project = projects.find(p => p.id === win.projectId);
        return (
          <OSWindow 
            key={win.id}
            windowState={win}
            project={project}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => toggleMinimize(win.id)}
            onMaximize={() => toggleMaximize(win.id)}
          />
        );
      })}

      {/* Dock (Taskbar) */}
      <div ref={dockRef} className="hidden md:block absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-end gap-2 p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          {projects.map(project => {
            const isOpen = windows.some(w => w.projectId === project.id);
            return (
              <button
                key={`dock-${project.id}`}
                onClick={() => openApp(project)}
                className="relative group outline-none"
              >
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {project.name}
                </div>
                
                <div 
                  className={`w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center transition-all duration-300 origin-bottom group-hover:scale-125 group-hover:-translate-y-2 group-focus:bg-white/10 ${isOpen ? 'bg-white/5' : ''}`}
                  style={{ boxShadow: isOpen ? `0 0 15px rgba(${project.accentRgb}, 0.4)` : 'none' }}
                >
                  {getIcon(project.category_icon, project.accent, 24)}
                </div>
                
                {/* Active Indicator */}
                {isOpen && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />
                )}
              </button>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};

export default PeerOS;
