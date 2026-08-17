import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { value: 6, label: 'Projects Shipped', suffix: '+' },
  { value: 5, label: 'Industries', suffix: '+' },
  { value: 100, label: 'Client Satisfaction', suffix: '%' },
  { value: 3, label: 'Countries', suffix: '+' },
];

const WorkStats = () => {
  const sectionRef = useRef(null);
  const numberRefs = useRef([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      numberRefs.current.forEach((el, i) => {
        if (!el) return;
        const obj = { val: 0 };
        const target = stats[i].value;

        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            once: true,
          },
          onUpdate: () => {
            el.textContent = `${Math.round(obj.val)}${stats[i].suffix}`;
          },
        });
      });

      const items = sectionRef.current.querySelectorAll('.stat-item');
      if (items.length) {
        gsap.fromTo(
          items,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 sm:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden bg-obsidian"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-[0.03]"
          style={{ background: 'radial-gradient(ellipse at center, #c0a080 0%, transparent 70%)' }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center gap-3 mb-10 sm:mb-16 justify-center">
          <div className="h-px w-8 sm:w-12 bg-accent/50" />
          <span className="text-accent/70 font-mono text-xs tracking-[0.4em] uppercase">
            The Numbers
          </span>
          <div className="h-px w-8 sm:w-12 bg-accent/50" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="stat-item bg-background/80 px-6 sm:px-10 py-8 sm:py-12 flex flex-col items-center text-center gap-2 sm:gap-3 hover:bg-obsidian transition-colors duration-300"
            >
              <div
                ref={(el) => (numberRefs.current[i] = el)}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-black text-white tabular-nums"
              >
                0{stat.suffix}
              </div>
              <div className="text-white/40 font-light text-xs sm:text-sm leading-relaxed">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkStats;
