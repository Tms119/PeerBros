import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../../data/projects';
import ProjectCard from './ProjectCard';

gsap.registerPlugin(ScrollTrigger);

const ProjectsGallery = () => {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger the cards on mobile/desktop
      const cards = gsap.utils.toArray('.project-card-wrap');
      cards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
            },
          }
        );
      });

      // Header
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: headerRef.current, start: 'top 80%' },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="relative w-full bg-background py-16 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8"
    >
      {/* Ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Section header */}
      <div ref={headerRef} className="max-w-7xl mx-auto mb-12 sm:mb-16 lg:mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="h-px w-8 sm:w-12 bg-accent/60" />
              <span className="text-accent font-mono text-xs sm:text-sm tracking-[0.3em] uppercase">
                Selected Work
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-white tracking-tighter leading-none">
              Case Studies
            </h2>
          </div>
          <p className="text-white/40 text-sm sm:text-base max-w-xs leading-relaxed">
            Six industries. Six elite builds. Each one proof of what we're capable of.
          </p>
        </div>
      </div>

      {/* Project grid: 1 col on mobile, 2 col on desktop */}
      <div className="max-w-7xl mx-auto">
        {/* Mobile & tablet: stacked single column */}
        <div className="lg:hidden flex flex-col gap-6 sm:gap-10">
          {projects.map((project, i) => (
            <div key={project.id} className="project-card-wrap">
              <ProjectCard project={project} index={i} />
            </div>
          ))}
        </div>

        {/* Desktop: masonry 2-column with offset */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 xl:gap-12">
          {/* Left column: projects 1, 3, 5 */}
          <div className="flex flex-col gap-8 xl:gap-12 mt-0">
            {projects.filter((_, i) => i % 2 === 0).map((project, i) => (
              <div key={project.id} className="project-card-wrap">
                <ProjectCard project={project} index={i * 2} />
              </div>
            ))}
          </div>
          {/* Right column: projects 2, 4, 6 — offset down */}
          <div className="flex flex-col gap-8 xl:gap-12 mt-24 xl:mt-32">
            {projects.filter((_, i) => i % 2 === 1).map((project, i) => (
              <div key={project.id} className="project-card-wrap">
                <ProjectCard project={project} index={i * 2 + 1} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsGallery;
