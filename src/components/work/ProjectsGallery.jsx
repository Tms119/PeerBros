import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '../../data/projects';
import { ExternalLink, ArrowUpRight, Zap, ShoppingCart, TrendingUp, Globe, Package, Lock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const IconMap = { Zap, ShoppingCart, TrendingUp, Globe, Package, Lock };

// Segment labels that sit on the connector line between each project
const SEGMENT_LABELS = [
  'SELECTED WORKS',
  'SAAS · MARKETPLACE',
  'FINTECH',
  'HOSTING & INFRA',
  'BRANDING & WEB',
  'SECURITY & IT',
];

/* ─── Minimal Project Card ─────────────────────────────────────────────── */
const PathwayCard = ({ project, side, isActive }) => {
  const [expanded, setExpanded] = useState(false);
  const Icon = IconMap[project.category_icon];

  return (
    <div
      className={`pathway-card group relative cursor-pointer transition-all duration-700 ${
        side === 'right' ? 'ml-auto' : 'mr-auto'
      }`}
      style={{ maxWidth: 480, width: '100%' }}
      onClick={() => setExpanded((v) => !v)}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ background: project.accent }}
      />

      {/* Card shell */}
      <div
        className="relative rounded-2xl border overflow-hidden transition-all duration-500"
        style={{
          background: 'rgba(12,12,14,0.95)',
          borderColor: `rgba(${project.accentRgb}, ${isActive ? 0.4 : 0.15})`,
          boxShadow: isActive
            ? `0 0 0 1px rgba(${project.accentRgb},0.1), 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(${project.accentRgb},0.08)`
            : '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {/* ── Collapsed header (always visible) ── */}
        <div className="flex items-center gap-4 px-5 py-4">
          {/* Icon circle */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: `rgba(${project.accentRgb}, 0.12)`,
              border: `1px solid rgba(${project.accentRgb}, 0.25)`,
            }}
          >
            {Icon && <Icon size={18} strokeWidth={1.5} style={{ color: project.accent }} />}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] font-mono tracking-[0.3em] uppercase mb-0.5"
              style={{ color: project.accent }}
            >
              {project.id} / {project.category}
            </div>
            <h3 className="text-lg font-display font-black text-white tracking-tight leading-none truncate">
              {project.name}
            </h3>
          </div>

          {/* Arrow indicator */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: expanded ? project.accent : 'rgba(255,255,255,0.04)',
              border: `1px solid rgba(${project.accentRgb}, 0.2)`,
            }}
          >
            <ArrowUpRight
              size={14}
              className="transition-transform duration-300"
              style={{
                color: expanded ? '#000' : project.accent,
                transform: expanded ? 'rotate(0deg)' : 'rotate(45deg)',
              }}
            />
          </div>
        </div>

        {/* ── Expanded details ── */}
        <div
          className="overflow-hidden transition-all duration-500"
          style={{ maxHeight: expanded ? 400 : 0 }}
        >
          <div
            className="mx-4 mb-4 rounded-xl p-4"
            style={{ background: `rgba(${project.accentRgb}, 0.05)`, border: `1px solid rgba(${project.accentRgb},0.08)` }}
          >
            {/* Tagline */}
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: project.accent }}
            >
              "{project.tagline}"
            </p>
            <p className="text-white/55 text-xs leading-relaxed mb-4">
              {project.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {project.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-white/60 py-1.5 px-2.5 rounded-lg"
                  style={{ background: `rgba(${project.accentRgb},0.06)` }}>
                  <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: project.accent }} />
                  {f}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                {project.tech.map((t, i) => (
                  <span
                    key={i}
                    className="font-mono text-[10px] px-2 py-0.5 rounded-full border"
                    style={{
                      color: `rgba(${project.accentRgb},0.8)`,
                      borderColor: `rgba(${project.accentRgb},0.2)`,
                      background: `rgba(${project.accentRgb},0.05)`,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-xs flex-shrink-0 transition-all duration-200 hover:scale-105"
                style={{
                  background: project.accent,
                  color: '#000',
                  boxShadow: `0 0 16px rgba(${project.accentRgb},0.35)`,
                }}
              >
                View Site <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Mobile Timeline Fallback ──────────────────────────────────────────── */
const MobileTimeline = () => (
  <div className="flex flex-col gap-0 px-4 sm:px-6">
    {projects.map((project, i) => {
      const Icon = IconMap[project.category_icon];
      return (
        <div key={project.id} className="project-card-wrap flex gap-4">
          {/* Timeline track */}
          <div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 z-10"
              style={{
                background: `rgba(${project.accentRgb},0.15)`,
                borderColor: project.accent,
              }}
            >
              {Icon && <Icon size={13} strokeWidth={2} style={{ color: project.accent }} />}
            </div>
            {i < projects.length - 1 && (
              <div className="flex-1 w-px mt-1" style={{ background: `rgba(${project.accentRgb},0.2)`, minHeight: 32 }} />
            )}
          </div>

          {/* Card */}
          <div className="flex-1 pb-8">
            <PathwayCard project={project} side="right" isActive={true} />
          </div>
        </div>
      );
    })}
  </div>
);

/* ─── Desktop SVG Pathway ───────────────────────────────────────────────── */
const DesktopPathway = () => {
  const sectionRef = useRef(null);
  const svgRef = useRef(null);
  const mainPathRef = useRef(null);
  const ghostPathRef = useRef(null);
  const pulseRef = useRef(null);
  const nodeRefs = useRef([]);
  const cardRefs = useRef([]);
  const labelRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Build the SVG path based on container size
  const buildPath = (W, H) => {
    // We place 6 nodes across the height.
    // Each node alternates sides. We build a snaking path.
    // Node x positions: right nodes at 55%, left nodes at 45%
    // The path goes: center-top → node0(right) → across → node1(left) → ... → center-bottom

    const cx = W / 2;
    const nodeSpacing = H / 7; // 7 gaps for 6 nodes

    // Compute node positions
    const nodes = projects.map((_, i) => {
      const y = nodeSpacing * (i + 1);
      const isRight = i % 2 === 0; // 0,2,4 = right; 1,3,5 = left
      const x = isRight ? cx + W * 0.18 : cx - W * 0.18;
      return { x, y, isRight };
    });

    // Build the SVG path with smooth curves
    let d = `M ${cx} 0`;

    nodes.forEach((node, i) => {
      const prev = i === 0 ? { x: cx, y: 0 } : nodes[i - 1];
      const midY = (prev.y + node.y) / 2;

      // Curve from previous to node
      d += ` C ${prev.x} ${midY}, ${node.x} ${midY}, ${node.x} ${node.y}`;
    });

    return { d, nodes };
  };

  useEffect(() => {
    const section = sectionRef.current;
    const svg = svgRef.current;
    if (!section || !svg) return;

    const ctx = gsap.context(() => {
      const W = section.offsetWidth;
      const H = section.offsetHeight;

      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      svg.setAttribute('width', W);
      svg.setAttribute('height', H);

      const { d, nodes } = buildPath(W, H);

      // Apply path data to both ghost and main
      ghostPathRef.current.setAttribute('d', d);
      mainPathRef.current.setAttribute('d', d);

      // Get total path length for dash animation
      const totalLen = mainPathRef.current.getTotalLength();
      mainPathRef.current.style.strokeDasharray = totalLen;
      mainPathRef.current.style.strokeDashoffset = totalLen;

      // Position node circles
      nodeRefs.current.forEach((nodeEl, i) => {
        if (!nodeEl || !nodes[i]) return;
        nodeEl.setAttribute('cx', nodes[i].x);
        nodeEl.setAttribute('cy', nodes[i].y);
        // Also position the outer glow ring
        const ring = nodeEl.nextSibling;
        if (ring) {
          ring.setAttribute('cx', nodes[i].x);
          ring.setAttribute('cy', nodes[i].y);
        }
      });

      // Position segment labels (midpoints between nodes)
      const allPoints = [{ x: W / 2, y: 0 }, ...nodes];
      labelRefs.current.forEach((labelEl, i) => {
        if (!labelEl || !allPoints[i] || !allPoints[i + 1]) return;
        const midY = (allPoints[i].y + allPoints[i + 1].y) / 2;
        const midX = W / 2;
        labelEl.style.top = `${midY}px`;
        labelEl.style.left = `${midX}px`;
        labelEl.style.transform = 'translate(-50%, -50%)';
      });

      // Position card wrappers
      cardRefs.current.forEach((cardEl, i) => {
        if (!cardEl || !nodes[i]) return;
        const { y, isRight } = nodes[i];
        cardEl.style.top = `${y}px`;
        cardEl.style.transform = 'translateY(-50%)';
        cardEl.style.left = isRight ? '56%' : '4%';
        cardEl.style.right = isRight ? '4%' : 'auto';
        cardEl.style.width = '38%';
      });

      // ── Main scroll animation: draw the path ──
      gsap.to(mainPathRef.current, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 60%',
          end: 'bottom 80%',
          scrub: 2,
          onUpdate: (self) => {
            const progress = self.progress;
            const drawnLen = totalLen * progress;

            // Move the pulse dot along the path
            if (pulseRef.current && mainPathRef.current) {
              try {
                const pt = mainPathRef.current.getPointAtLength(Math.min(drawnLen, totalLen - 1));
                pulseRef.current.setAttribute('cx', pt.x);
                pulseRef.current.setAttribute('cy', pt.y);
                pulseRef.current.style.opacity = progress > 0.01 && progress < 0.99 ? 1 : 0;
              } catch (_) {}
            }

            // Activate nodes as path reaches them
            nodes.forEach((node, i) => {
              const nodeProgress = (node.y / H) * 0.85 + 0.05;
              const isNowActive = progress >= nodeProgress;
              if (nodeRefs.current[i]) {
                const nodeEl = nodeRefs.current[i];
                const currentlyActive = nodeEl.getAttribute('data-active') === 'true';
                if (isNowActive && !currentlyActive) {
                  nodeEl.setAttribute('data-active', 'true');
                  setActiveIndex(i);
                  gsap.to(nodeEl, { r: 9, duration: 0.4, ease: 'back.out(2)' });
                  gsap.to(nodeEl, { attr: { fill: projects[i].accent }, duration: 0.4 });
                  // Animate card in
                  if (cardRefs.current[i]) {
                    const isRight = i % 2 === 0;
                    gsap.fromTo(
                      cardRefs.current[i],
                      { x: isRight ? 40 : -40, opacity: 0, scale: 0.95 },
                      { x: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }
                    );
                  }
                } else if (!isNowActive && currentlyActive) {
                  nodeEl.setAttribute('data-active', 'false');
                  gsap.to(nodeEl, { r: 5, duration: 0.3 });
                  gsap.to(nodeEl, { attr: { fill: 'transparent' }, duration: 0.3 });
                  if (cardRefs.current[i]) {
                    const isRight = i % 2 === 0;
                    gsap.to(cardRefs.current[i], { x: isRight ? 40 : -40, opacity: 0, scale: 0.95, duration: 0.4 });
                  }
                }
              }
            });
          },
        },
      });

      // Fade in labels as path reaches them
      labelRefs.current.forEach((labelEl, i) => {
        if (!labelEl || !nodes[i] || !allPoints[i]) return;
        const midY = (allPoints[i].y + (nodes[i]?.y ?? H)) / 2;
        const triggerProgress = midY / H;

        ScrollTrigger.create({
          trigger: section,
          start: `top+=${triggerProgress * H * 0.5} 60%`,
          onEnter: () => gsap.to(labelEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }),
          onLeaveBack: () => gsap.to(labelEl, { opacity: 0, y: 8, duration: 0.3 }),
        });
      });

      // Section header reveal
      gsap.fromTo(
        '#pathway-header',
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: '#pathway-header', start: 'top 85%' },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: `${projects.length * 340 + 200}px` }}>

      {/* SVG overlay — ghost + drawn line + nodes + pulse */}
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
        preserveAspectRatio="none"
      >
        {/* Ghost path (full route, faint) */}
        <path
          ref={ghostPathRef}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="2"
          strokeDasharray="6 6"
        />

        {/* Drawn path (animated) */}
        <path
          ref={mainPathRef}
          fill="none"
          stroke="rgba(192, 160, 128, 0.7)" // champagne accent color
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(192,160,128,0.4))' }}
        />

        {/* Node dots + outer rings */}
        {projects.map((project, i) => (
          <g key={project.id}>
            {/* Outer ring (glow) */}
            <circle
              r="18"
              fill="none"
              stroke={project.accent}
              strokeWidth="1"
              opacity="0"
              style={{ filter: `drop-shadow(0 0 8px ${project.accent})` }}
              ref={(el) => {
                // Store as "ring" alongside node — accessed via nodeRefs[i].nextSibling in effect
              }}
            />
            {/* Node dot */}
            <circle
              ref={(el) => (nodeRefs.current[i] = el)}
              r="5"
              fill="transparent"
              stroke={project.accent}
              strokeWidth="2"
              data-active="false"
              style={{
                filter: `drop-shadow(0 0 4px ${project.accent})`,
                transition: 'r 0.3s',
              }}
            />
          </g>
        ))}

        {/* Traveling pulse dot */}
        <circle
          ref={pulseRef}
          r="5"
          fill="rgba(192,160,128,1)"
          opacity="0"
          style={{ filter: 'drop-shadow(0 0 8px rgba(192,160,128,0.9))' }}
        />
      </svg>

      {/* Segment labels */}
      {SEGMENT_LABELS.map((label, i) => (
        <div
          key={i}
          ref={(el) => (labelRefs.current[i] = el)}
          className="absolute font-mono text-[10px] tracking-[0.35em] uppercase text-white/25 pointer-events-none select-none"
          style={{
            opacity: 0,
            transform: 'translate(-50%, -50%) translateY(8px)',
            zIndex: 2,
            letterSpacing: '0.35em',
            background: 'rgba(10,10,10,0.8)',
            padding: '3px 10px',
            borderRadius: 4,
          }}
        >
          {label}
        </div>
      ))}

      {/* Project cards */}
      {projects.map((project, i) => (
        <div
          key={project.id}
          ref={(el) => (cardRefs.current[i] = el)}
          className="absolute opacity-0"
          style={{ zIndex: 10 }}
        >
          <PathwayCard project={project} side={i % 2 === 0 ? 'right' : 'left'} isActive={activeIndex === i} />
        </div>
      ))}
    </div>
  );
};

/* ─── Main Export ───────────────────────────────────────────────────────── */
const ProjectsGallery = () => {
  return (
    <section id="projects" className="relative w-full bg-background py-16 sm:py-24 lg:py-32">
      {/* Top divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Section header */}
      <div id="pathway-header" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="h-px w-8 sm:w-12 bg-accent/60" />
              <span className="text-accent font-mono text-xs sm:text-sm tracking-[0.3em] uppercase">
                Recent Work
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-display font-black text-white tracking-tighter leading-none">
              Case Studies
            </h2>
          </div>
          <p className="text-white/40 text-sm sm:text-base max-w-xs leading-relaxed">
            Real clients. Real problems. Real results.
          </p>
        </div>
      </div>

      {/* Desktop pathway (lg+) */}
      <div className="hidden lg:block relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <DesktopPathway />
      </div>

      {/* Mobile timeline fallback */}
      <div className="lg:hidden max-w-xl mx-auto">
        <MobileTimeline />
      </div>
    </section>
  );
};

export default ProjectsGallery;
