import React, { useRef, useEffect } from 'react';
import { projects } from '../../data/projects';

const items = [...projects, ...projects]; // duplicate for seamless loop

const WorkMarquee = ({ reverse = false, speed = 30 }) => {
  const trackRef = useRef(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let pos = reverse ? -track.scrollWidth / 2 : 0;
    let animId;

    const animate = () => {
      if (!isPaused.current) {
        pos += reverse ? 0.6 : -0.6;
        const half = track.scrollWidth / 2;
        if (!reverse && pos <= -half) pos = 0;
        if (reverse && pos >= 0) pos = -half;
        track.style.transform = `translateX(${pos}px)`;
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [reverse]);

  const handleEnter = () => { isPaused.current = true; };
  const handleLeave = () => { isPaused.current = false; };

  return (
    <div
      className="overflow-hidden w-full py-5 relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Fade edges */}
      <div className="absolute left-0 top-0 w-20 sm:w-40 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 w-20 sm:w-40 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <div
        ref={trackRef}
        className="flex items-center gap-0 will-change-transform"
        style={{ whiteSpace: 'nowrap' }}
      >
        {items.map((project, i) => (
          <div
            key={`${project.id}-${i}`}
            className="flex items-center gap-4 sm:gap-8 px-4 sm:px-8 flex-shrink-0"
          >
            <span
              className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tighter transition-colors duration-300"
              style={{ color: `rgba(${project.accentRgb}, 0.25)` }}
            >
              {project.name}
            </span>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: `rgba(${project.accentRgb}, 0.4)` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkMarqueeSection = () => (
  <div className="w-full border-y border-white/[0.05] overflow-hidden bg-obsidian">
    <WorkMarquee />
    <div className="h-px w-full bg-white/[0.03]" />
    <WorkMarquee reverse speed={25} />
  </div>
);

export default WorkMarqueeSection;
