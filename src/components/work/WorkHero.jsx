import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WorkHero = ({ ready }) => {
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hero reveal and scroll-driven thread animation
  useEffect(() => {
    if (!ready || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Initial Load Reveal
      const tl = gsap.timeline({ delay: 0.1 });

      tl.fromTo('.hero-text-line', 
        { y: 100, opacity: 0, rotateX: -15 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1.2, stagger: 0.15, ease: 'power4.out', transformOrigin: "50% 100%" }
      )
      .fromTo('.hero-sub',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        "-=0.8"
      )
      .fromTo('.corner-spec',
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out', stagger: 0.1 },
        "-=0.6"
      )
      // Draw the vertical thread downward
      .fromTo('.hero-thread',
        { strokeDashoffset: 1500 },
        { strokeDashoffset: 0, duration: 1.5, ease: 'power3.inOut' },
        "-=1.0"
      );

      // 2. Scroll Parallax (Move text up slightly while scrolling)
      gsap.to('.hero-text-wrapper', {
        y: -100,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });

      // 3. Move the thread down as we scroll, creating the "continuous" feel
      // It pushes down out of the hero to connect with the marquee/gallery
      gsap.to('.hero-thread', {
        y: 200,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, [ready]);

  return (
    <section
      ref={sectionRef}
      id="work-hero"
      className="relative w-full min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-background px-6"
    >
      {/* Structural Grid Background (Precise, Engineering Feel) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          backgroundPosition: 'center center',
        }}
      />
      
      {/* Dark gradient fade at the bottom to transition smoothly to next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      {/* The Continuous Thread (SVG Vertical Line) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <line
          x1="50%" y1="65%" x2="50%" y2="150%"
          stroke="rgba(192, 160, 128, 0.7)" // Champagne accent color to match Gallery
          strokeWidth="2.5"
          className="hero-thread"
          style={{ 
            strokeDasharray: 1500, 
            strokeDashoffset: 1500,
            filter: 'drop-shadow(0 0 6px rgba(192,160,128,0.4))' 
          }}
        />
      </svg>

      {/* Main Content */}
      <div className="hero-text-wrapper relative z-10 text-center w-full max-w-6xl mx-auto flex flex-col items-center">
        
        {/* Top Label */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(192,160,128,0.8)]" />
          <span className="text-accent font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase">
            Portfolio & Case Studies
          </span>
          <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(192,160,128,0.8)]" />
        </div>

        {/* Razor-Sharp Typography */}
        <div className="overflow-hidden" style={{ perspective: 1000 }}>
          <h1 className="hero-text-line text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[8.5vw] font-display font-black text-white tracking-tighter leading-[0.9] uppercase">
            Systems Built
          </h1>
        </div>
        <div className="overflow-hidden mb-10 sm:mb-12" style={{ perspective: 1000 }}>
          <h1 className="hero-text-line text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[8.5vw] font-display font-black text-white/30 tracking-tighter leading-[0.9] uppercase">
            To Scale
          </h1>
        </div>

        {/* Explanatory Subtitle */}
        <p className="hero-sub text-white/50 text-sm sm:text-base md:text-lg font-light max-w-xl mx-auto leading-relaxed px-4">
          We don't just design interfaces. We engineer automated workflows, resilient infrastructure, and digital platforms that drive serious growth.
        </p>

        {/* Scroll Cue attached to thread */}
        <div className="hero-sub mt-16 sm:mt-24 flex flex-col items-center gap-2">
          <span className="text-white/40 font-mono text-[9px] tracking-[0.3em] uppercase">Scroll to explore</span>
        </div>
      </div>

      {/* Corner Technical Details (Auxia Editorial Style) */}
      <div className="corner-spec hidden md:flex absolute top-10 left-10 text-white/20 font-mono text-[9px] tracking-[0.3em] uppercase flex-col gap-1">
        <span>SYS.ENV // PEERBROS</span>
        <span>STATUS // OPERATIONAL</span>
      </div>
      
      <div className="corner-spec hidden md:flex absolute top-10 right-10 text-white/20 font-mono text-[9px] tracking-[0.3em] uppercase flex-col gap-1 text-right">
        <span>YEAR // {new Date().getFullYear()}</span>
        <span>VERSION // 2.0.4</span>
      </div>
      
      <div className="corner-spec hidden md:flex absolute bottom-10 left-10 text-white/20 font-mono text-[9px] tracking-[0.3em] uppercase items-center gap-2">
        <div className="w-1 h-1 bg-white/40 rounded-full animate-pulse" />
        INITIATING ARCHITECTURE SEQUENCE
      </div>
    </section>
  );
};

export default WorkHero;
