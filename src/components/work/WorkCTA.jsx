import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MagneticButton } from '../MicroInteractions';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const WorkCTA = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
      });

      tl.fromTo(
        headlineRef.current,
        { y: 60, opacity: 0, skewY: 3 },
        { y: 0, opacity: 1, skewY: 0, duration: 1, ease: 'power4.out' }
      )
        .fromTo(
          subRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' },
          '-=0.5'
        )
        .fromTo(
          btnRef.current,
          { y: 20, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' },
          '-=0.4'
        );

      // Ambient pulse on the glow
      gsap.to('.cta-glow', {
        scale: 1.1,
        opacity: 0.08,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-32 lg:py-40 px-4 sm:px-6 bg-background overflow-hidden"
    >
      {/* Glow */}
      <div className="cta-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-accent rounded-full blur-[120px] opacity-[0.06] pointer-events-none will-change-transform" />

      {/* Top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-8 sm:mb-12">
          <div className="h-px w-8 sm:w-12 bg-accent/50" />
          <span className="text-accent/70 font-mono text-xs tracking-[0.4em] uppercase">
            Start a Project
          </span>
          <div className="h-px w-8 sm:w-12 bg-accent/50" />
        </div>

        {/* Headline */}
        <div className="overflow-hidden mb-4 sm:mb-6">
          <h2
            ref={headlineRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-black text-white tracking-tighter leading-none will-change-transform"
            style={{ opacity: 0 }}
          >
            Ready to Join<br />
            <span className="text-accent">Our Portfolio?</span>
          </h2>
        </div>

        <p
          ref={subRef}
          className="text-white/50 text-base sm:text-lg lg:text-xl max-w-xl mx-auto leading-relaxed mb-10 sm:mb-14"
          style={{ opacity: 0 }}
        >
          Let's build something elite. Whether it's a SaaS platform, marketplace, or full digital transformation — PeerBros engineers it to win.
        </p>

        <div ref={btnRef} className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ opacity: 0 }}>
          <MagneticButton
            href="mailto:peerbros.official@gmail.com"
            className="group flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-white text-black font-bold text-base sm:text-lg hover:bg-accent transition-colors duration-300 interactive-hover w-full sm:w-auto justify-center"
          >
            <span>Book a Discovery Call</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
          </MagneticButton>

          <MagneticButton
            href="/"
            className="flex items-center gap-2 px-8 sm:px-10 py-4 sm:py-5 rounded-full border border-white/20 text-white/70 font-medium text-base sm:text-lg hover:border-accent/60 hover:text-white transition-colors duration-300 interactive-hover w-full sm:w-auto justify-center"
          >
            Back to Home
          </MagneticButton>
        </div>
      </div>
    </section>
  );
};

export default WorkCTA;
