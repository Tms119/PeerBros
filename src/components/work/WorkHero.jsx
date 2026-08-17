import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Text scramble utility
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const old = this.el.innerText;
    const len = Math.max(old.length, newText.length);
    const promise = new Promise((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from = old[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 10);
      const end = start + Math.floor(Math.random() * 15);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span style="color:rgba(192,160,128,0.6)">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

const WorkHero = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const subRef = useRef(null);
  const scrollRef = useRef(null);
  const line1Ref = useRef(null);
  const line2Ref = useRef(null);
  const particlesRef = useRef(null);
  const scrambleRef = useRef(null);
  const velocityListenerRef = useRef(null);

  useEffect(() => {
    // Guard: ensure all critical refs are mounted
    if (
      !sectionRef.current ||
      !line1Ref.current ||
      !line2Ref.current ||
      !subRef.current ||
      !scrollRef.current
    )
      return;

    const ctx = gsap.context(() => {
      // ── Particle field ──────────────────────────────────────────
      if (particlesRef.current) {
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
      }

      // ── Staggered hero reveal (after loading screen) ─────────────
      const tl = gsap.timeline({ delay: 1.8 });
      tl.fromTo(
        line1Ref.current,
        { y: 80, opacity: 0, skewY: 4 },
        { y: 0, opacity: 1, skewY: 0, duration: 1, ease: 'power4.out' }
      )
        .fromTo(
          line2Ref.current,
          { y: 80, opacity: 0, skewY: 4 },
          { y: 0, opacity: 1, skewY: 0, duration: 1, ease: 'power4.out' },
          '-=0.7'
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.5'
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.3'
        )
        .call(() => {
          // Text scramble after reveal
          if (line1Ref.current) {
            const fx = new TextScramble(line1Ref.current);
            scrambleRef.current = fx;
            fx.setText('OUR WORK');
          }
        });

      // ── Scroll-out fade ──────────────────────────────────────────
      gsap.to(sectionRef.current, {
        opacity: 0,
        y: -60,
        ease: 'power2.in',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    // ── Scroll velocity warp (outside context so we can clean it up) ──
    let lastScrollY = window.scrollY;
    const velocitySkew = () => {
      const currentY = window.scrollY;
      const velocity = currentY - lastScrollY;
      lastScrollY = currentY;
      if (headlineRef.current) {
        gsap.to(headlineRef.current, {
          skewY: velocity * -0.04,
          scaleX: 1 + Math.abs(velocity) * 0.001,
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
      if (scrambleRef.current) {
        cancelAnimationFrame(scrambleRef.current.frameRequest);
      }
    };
  }, []);

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
      <div ref={particlesRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
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

        {/* Line 1 headline */}
        <div className="overflow-hidden mb-2 sm:mb-4">
          <h1
            ref={line1Ref}
            className="text-[15vw] sm:text-[12vw] md:text-[10vw] lg:text-[9vw] font-display font-black text-white tracking-tighter leading-none uppercase will-change-transform"
            style={{ opacity: 0 }}
          >
            OUR WORK
          </h1>
        </div>

        {/* Line 2 sub-headline */}
        <div className="overflow-hidden">
          <p
            ref={line2Ref}
            className="text-[7vw] sm:text-[5vw] md:text-[4vw] lg:text-[3.5vw] font-display font-light text-white/30 tracking-wider uppercase leading-none will-change-transform"
            style={{ opacity: 0 }}
          >
            Speaks for Itself
          </p>
        </div>

        {/* Subtitle */}
        <p
          ref={subRef}
          className="mt-8 sm:mt-12 text-white/50 text-sm sm:text-base md:text-lg font-light max-w-lg mx-auto leading-relaxed"
          style={{ opacity: 0 }}
        >
          6 projects. 6 different industries. All built to perform.
        </p>

        {/* Scroll cue */}
        <div
          ref={scrollRef}
          className="absolute -bottom-24 sm:-bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
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
        006 PROJECTS
      </div>
    </section>
  );
};

export default WorkHero;
