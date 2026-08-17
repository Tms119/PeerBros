import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { MagneticButton } from '../MicroInteractions';

const ProjectCard = ({ project, index }) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const glowRef = useRef(null);
  const titleRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt effect on mouse move (desktop only)
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);

      gsap.to(card, {
        rotateX: -dy * 6,
        rotateY: dx * 6,
        duration: 0.5,
        ease: 'power3.out',
        transformPerspective: 1000,
      });

      if (imageRef.current) {
        gsap.to(imageRef.current, {
          x: dx * 8,
          y: dy * 8,
          duration: 0.5,
          ease: 'power3.out',
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)',
        transformPerspective: 1000,
      });
      if (imageRef.current) {
        gsap.to(imageRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
      }
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Hover accent glow
  useEffect(() => {
    if (!glowRef.current) return;
    gsap.to(glowRef.current, {
      opacity: isHovered ? 0.15 : 0,
      scale: isHovered ? 1 : 0.8,
      duration: 0.5,
      ease: 'power3.out',
    });
  }, [isHovered]);

  return (
    <div
      ref={cardRef}
      className="relative w-full will-change-transform reveal-section"
      style={{ transformStyle: 'preserve-3d' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Accent glow background */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-3xl blur-2xl pointer-events-none opacity-0 will-change-transform"
        style={{ background: project.accent, transform: 'scale(0.8)' }}
      />

      <div
        className="relative rounded-3xl border overflow-hidden"
        style={{
          background: 'rgba(10, 10, 10, 0.95)',
          borderColor: `rgba(${project.accentRgb}, 0.2)`,
          boxShadow: `0 0 0 1px rgba(${project.accentRgb}, 0.05), 0 40px 80px rgba(0,0,0,0.6)`,
        }}
      >
        {/* Top section with browser mockup */}
        <div
          className="relative w-full overflow-hidden"
          style={{ aspectRatio: '16/9', background: `rgba(${project.accentRgb}, 0.04)` }}
        >
          {/* Browser chrome */}
          <div
            className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-4 py-2.5 sm:py-3"
            style={{ background: 'rgba(0,0,0,0.8)', borderBottom: `1px solid rgba(${project.accentRgb}, 0.1)` }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div
              className="flex-1 text-center font-mono text-[10px] sm:text-xs truncate px-4"
              style={{ color: `rgba(${project.accentRgb}, 0.6)` }}
            >
              {project.url.replace('https://', '')}
            </div>
          </div>

          {/* Mockup content */}
          <div
            ref={imageRef}
            className="absolute inset-0 flex items-center justify-center will-change-transform pt-10"
            style={{ transform: 'scale(1.05)' }}
          >
            {/* Abstract website representation */}
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 sm:gap-4 px-6 sm:px-10 pt-4">
              {/* Hero bar */}
              <div
                className="w-full h-8 sm:h-12 rounded-lg opacity-70"
                style={{ background: `linear-gradient(135deg, rgba(${project.accentRgb}, 0.3), rgba(${project.accentRgb}, 0.05))` }}
              />
              {/* Content rows */}
              <div className="w-full grid grid-cols-3 gap-2 sm:gap-3">
                {[0.9, 0.6, 0.8].map((w, i) => (
                  <div
                    key={i}
                    className="h-12 sm:h-20 rounded-lg"
                    style={{ background: `rgba(${project.accentRgb}, 0.08)`, opacity: w }}
                  />
                ))}
              </div>
              <div className="w-full grid grid-cols-2 gap-2 sm:gap-3">
                {[1, 0.7].map((w, i) => (
                  <div
                    key={i}
                    className="h-8 sm:h-12 rounded-lg"
                    style={{ background: `rgba(${project.accentRgb}, 0.06)`, opacity: w }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Overlay gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, transparent 60%, rgba(${project.accentRgb}, 0.05) 100%)`,
            }}
          />
        </div>

        {/* Card content */}
        <div className="p-5 sm:p-8 lg:p-10">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-5 sm:mb-8">
            <div className="flex items-center gap-3">
              <div
                className="w-1 h-8 sm:h-10 rounded-full flex-shrink-0"
                style={{ background: project.accent }}
              />
              <div>
                <div
                  className="text-xs font-mono tracking-[0.3em] uppercase mb-1"
                  style={{ color: project.accent }}
                >
                  {project.id} — {project.category}
                </div>
                <h2
                  ref={titleRef}
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-display font-black text-white tracking-tighter leading-none"
                >
                  {project.name}
                </h2>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl flex-shrink-0">{project.category_icon}</div>
          </div>

          {/* Tagline */}
          <p className="text-base sm:text-xl text-white/60 font-light leading-relaxed mb-5 sm:mb-8">
            {project.description}
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6 sm:mb-8">
            {project.features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-xs sm:text-sm text-white/70 font-medium py-2 sm:py-3 px-3 sm:px-4 rounded-xl"
                style={{ background: `rgba(${project.accentRgb}, 0.07)`, border: `1px solid rgba(${project.accentRgb}, 0.12)` }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: project.accent }}
                />
                {f}
              </div>
            ))}
          </div>

          {/* Footer: tech + CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5 sm:pt-6 border-t border-white/[0.06]">
            {/* Tech stack */}
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t, i) => (
                <span
                  key={i}
                  className="font-mono text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full border"
                  style={{
                    color: `rgba(${project.accentRgb}, 0.8)`,
                    borderColor: `rgba(${project.accentRgb}, 0.2)`,
                    background: `rgba(${project.accentRgb}, 0.05)`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* CTA */}
            <MagneticButton
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm transition-all duration-300 interactive-hover flex-shrink-0"
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
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
