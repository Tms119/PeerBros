import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import WorkLoadingScreen from './WorkLoadingScreen';
import { CustomCursor, MagneticButton } from '../MicroInteractions';
import Navbar from '../Navbar';
import Work3DCanvas from '../work3d/Work3DCanvas';
import { projects } from '../../data/projects';
import { ExternalLink } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const WorkPage = () => {
  const [loaded, setLoaded] = useState(false);
  const scrollContainerRef = useRef(null);
  const lenisRef = useRef(null);
  const textRefs = useRef([]);

  // Boot Lenis for smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
    };
  }, []);

  // Map scroll progress to text overlays
  useEffect(() => {
    if (!loaded || !scrollContainerRef.current) return;

    const ctx = gsap.context(() => {
      // We have 6 projects. 
      // The total scroll is 600vh. 
      // We divide it into sections.
      textRefs.current.forEach((el, index) => {
        if (!el) return;
        
        // Example: Project 0 fades in at 15% scroll, fades out at 30% scroll.
        // We will just use ScrollTrigger with start/end based on percentages of the container.
        const startPercent = 10 + (index * 15);
        const endPercent = startPercent + 10;
        
        gsap.fromTo(el, 
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: scrollContainerRef.current,
              start: `${startPercent}% center`,
              end: `${startPercent + 5}% center`,
              scrub: true,
            }
          }
        );

        gsap.to(el, {
          opacity: 0,
          y: -50,
          scrollTrigger: {
            trigger: scrollContainerRef.current,
            start: `${endPercent}% center`,
            end: `${endPercent + 5}% center`,
            scrub: true,
          }
        });
      });
    }, scrollContainerRef);

    return () => ctx.revert();
  }, [loaded]);

  const handleLoadComplete = useCallback(() => setLoaded(true), []);

  return (
    <div className="relative bg-transparent text-foreground overflow-x-hidden min-h-screen selection:bg-accent/30 selection:text-accent">
      <WorkLoadingScreen onComplete={handleLoadComplete} />
      <CustomCursor />
      <div className="noise-overlay pointer-events-none z-[100]" />
      <Navbar />
      
      {/* 3D Canvas Fixed in Background */}
      {loaded && <Work3DCanvas containerRef={scrollContainerRef} />}

      {/* Massive Scroll Container */}
      <main ref={scrollContainerRef} className="relative w-full" style={{ height: '700vh' }}>
        
        {/* Fixed UI Overlay for Text */}
        <div className="fixed inset-0 pointer-events-none z-10 flex items-center justify-start px-6 md:px-24">
          
          {/* Projects Iteration */}
          {projects.map((project, index) => (
            <div 
              key={project.id}
              ref={el => textRefs.current[index] = el}
              className="absolute left-6 md:left-24 max-w-xl opacity-0 pointer-events-auto"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 rounded-full" style={{ background: project.accent }} />
                <div className="text-xs font-mono tracking-[0.3em] uppercase" style={{ color: project.accent }}>
                  {project.id} / {project.category}
                </div>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-display font-black text-white tracking-tighter leading-none mb-6">
                {project.name}
              </h2>
              
              <p className="text-white/60 text-lg font-light leading-relaxed mb-8">
                {project.description}
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {project.features.slice(0, 2).map((f, i) => (
                  <div key={i} className="text-sm text-white/70 py-2 border-b border-white/10">
                    {f}
                  </div>
                ))}
              </div>
              
              <MagneticButton
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300"
                style={{
                  background: project.accent,
                  color: '#000',
                  boxShadow: `0 0 20px rgba(${project.accentRgb}, 0.3)`,
                }}
              >
                <span>Visit Live Site</span>
                <ExternalLink size={14} />
              </MagneticButton>
            </div>
          ))}

        </div>

      </main>
    </div>
  );
};

export default WorkPage;
