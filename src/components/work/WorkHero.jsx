import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const WorkHero = ({ ready }) => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const subRef = useRef(null);
  const scrollRef = useRef(null);
  const particlesRef = useRef(null);
  const velocityListenerRef = useRef(null);

  // ── Particle field — fires once on mount ───────────────────────
  useEffect(() => {
    if (!particlesRef.current) return;
    const ctx = gsap.context(() => {
      Array.from(particlesRef.current.children).forEach((p) => {
        gsap.to(p, {
          y: `${-30 - Math.random() * 60}px`,
          x: `${(Math.random() - 0.5) * 40}px`,
          opacity: Math.random() * 0.6 + 0.1,
          duration: 3 + Math.random() * 4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: Math.random() * 4,
        });
      });
    }, particlesRef);
    return () => ctx.revert();
  }, []);

  // ── Hero reveal — fires only when loading screen is DONE ───────
  useEffect(() => {
    if (!ready) return;
    if (
      !sectionRef.current ||
      !line1Ref.current ||
      !line2Ref.current ||
      !subRef.current ||
      !scrollRef.current
    )
      return;

    const ctx = gsap.context(() => {
      // Short pause then reveal all lines cleanly
      const tl = gsap.timeline({ delay: 0.15 });

      tl.fromTo(
        line1Ref.current,
        { y: 70, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: 'power4.out' }
      )
        .fromTo(
          line2Ref.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out' },
          '-=0.55'
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
          '-=0.45'
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.5 },
          '-=0.3'
        );

      // Scroll-out fade
      gsap.to(sectionRef.current, {
        opacity: 0,
        y: -50,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    // Velocity warp
    let lastScrollY = window.scrollY;
    const velocitySkew = () => {
      const currentY = window.scrollY;
      const velocity = currentY - lastScrollY;
      lastScrollY = currentY;
      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          skewY: velocity * -0.03,
          scaleX: 1 + Math.abs(velocity) * 0.0008,
          duration: 0.5,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    };
    velocityListenerRef.current = velocitySkew;
    window.addEventListener('scroll', velocitySkew, { passive: true });

    return () => {
      ctx.revert();
      if (velocityListenerRef.current) {
        window.removeEventListener('scroll', velocityListenerRef.current);
      }
    };
  }, [ready]);

  const particles = Array.from({ length: 40 });

  return (
    <section
      ref={sectionRef}
      id="work-hero"
      className="relative w-full min-h-[100svh] flex flex-col items-center justify-center overflow-hidden bg-background px-6"
    >
      {/* Ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      {/* Particle field */}
      <div
        ref={particlesRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {particles.map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.05,
            }}
          />
        ))}
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <div
        ref={headlineRef}
        className="relative z-10 text-center w-full max-w-6xl mx-auto will-change-transform"
      >
        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
          <div className="h-px w-12 sm:w-20 bg-accent/50" />
          <span className="text-accent font-mono text-xs sm:text-sm tracking-[0.4em] uppercase">
            What We've Built
          </span>
          <div className="h-px w-12 sm:w-20 bg-accent/50" />
        </div>

        {/* Headline line 1 */}
        <div className="overflow-hidden mb-2 sm:mb-3">
          <h1
            ref={line1Ref}
            className="text-[15vw] sm:text-[12vw] md:text-[10vw] lg:text-[9vw] font-display font-black text-white tracking-tighter leading-none uppercase will-change-transform"
            style={{ opacity: 0 }}
          >
            OUR WORK
          </h1>
        </div>

        {/* Headline line 2 */}
        <div className="overflow-hidden mb-8 sm:mb-12">
          <p
            ref={line2Ref}
            className="text-[6vw] sm:text-[4.5vw] md:text-[3.5vw] lg:text-[3vw] font-display font-light text-white/30 tracking-wider uppercase leading-none will-change-transform"
            style={{ opacity: 0 }}
          >
            Speaks for Itself
          </p>
        </div>

        {/* Subtitle */}
        <p
          ref={subRef}
          className="text-white/50 text-sm sm:text-base md:text-lg font-light max-w-md mx-auto leading-relaxed"
          style={{ opacity: 0 }}
        >
          A selection of our recent work, across industries, built to perform.
        </p>

        {/* Scroll cue */}
        <div
          ref={scrollRef}
          className="mt-16 sm:mt-20 flex flex-col items-center gap-3"
          style={{ opacity: 0 }}
        >
          <span className="text-white/30 font-mono text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 sm:h-16 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </div>

      {/* Corner decorations */}
      <div className="hidden md:block absolute top-8 left-8 text-white/10 font-mono text-xs">
        portfolio.peerbros.com
      </div>
      <div className="hidden md:block absolute top-8 right-8 text-white/10 font-mono text-xs">
        {new Date().getFullYear()}
      </div>
      <div className="hidden md:block absolute bottom-8 left-8 text-white/10 font-mono text-xs">
        RECENT WORK
      </div>
    </section>
  );
};

export default WorkHero;
