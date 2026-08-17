import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import WorkHero from './WorkHero';
import WorkMarquee from './WorkMarquee';
import ProjectsGallery from './ProjectsGallery';
import WorkStats from './WorkStats';
import WorkCTA from './WorkCTA';
import WorkLoadingScreen from './WorkLoadingScreen';
import { CustomCursor } from '../MicroInteractions';
import Navbar from '../Navbar';
import Footer from '../Footer';
import ScrollToTop from '../ScrollToTop';

gsap.registerPlugin(ScrollTrigger);

const WorkPage = () => {
  const [loaded, setLoaded] = useState(false);
  const pageRef = useRef(null);
  const lenisRef = useRef(null);

  // Boot Lenis for this page independently
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

    // Reveal sections
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray('.reveal-section');
      sections.forEach((section) => {
        gsap.fromTo(
          section,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 85%' },
          }
        );
      });
    }, pageRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      lenis.destroy();
    };
  }, []);

  const handleLoadComplete = () => setLoaded(true);

  return (
    <div ref={pageRef} className="relative bg-background text-foreground overflow-x-hidden min-h-screen selection:bg-accent/30 selection:text-accent">
      <WorkLoadingScreen onComplete={handleLoadComplete} />
      <CustomCursor />
      <ScrollToTop />
      <div className="noise-overlay pointer-events-none z-[100]" />
      <Navbar />
      <main>
        <WorkHero />
        <WorkMarquee />
        <ProjectsGallery />
        <WorkStats />
        <WorkCTA />
      </main>
      <React.Suspense fallback={<div className="h-48 w-full bg-black" />}>
        <Footer />
      </React.Suspense>
    </div>
  );
};

export default WorkPage;
