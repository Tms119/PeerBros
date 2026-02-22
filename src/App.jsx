import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { CustomCursor } from './components/MicroInteractions';
import ScrollToTop from './components/ScrollToTop';

// Lazy load below-the-fold components
const Services = React.lazy(() => import('./components/Services'));
const AutomationPortfolio = React.lazy(() => import('./components/AutomationPortfolio'));
const Philosophy = React.lazy(() => import('./components/Philosophy'));
const Testimonials = React.lazy(() => import('./components/Testimonials'));
const Team = React.lazy(() => import('./components/Team'));
const Process = React.lazy(() => import('./components/Process'));
const Stats = React.lazy(() => import('./components/Stats'));
const Footer = React.lazy(() => import('./components/Footer'));

gsap.registerPlugin(ScrollTrigger);

function App() {
  const appRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis for buttery smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // CSS ease-out-expo
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false, // Keep native touch scroll for mobile
      touchMultiplier: 2,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Reveal animations globally
    const sections = gsap.utils.toArray('.reveal-section');
    sections.forEach((section) => {
      gsap.fromTo(section,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
          }
        }
      )
    });

    // Global interceptor for anchor links to use Lenis smooth scroll
    const handleHashClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.hash && target.hash.startsWith('#')) {
        e.preventDefault();
        lenis.scrollTo(target.hash, { offset: 0, duration: 1.5 });
      }
    };
    document.addEventListener('click', handleHashClick);

    return () => {
      document.removeEventListener('click', handleHashClick);
      ScrollTrigger.getAll().forEach(t => t.kill());
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  return (
    <div ref={appRef} className="relative min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-accent">
      <CustomCursor />
      <ScrollToTop />
      <div className="noise-overlay pointer-events-none z-[100]"></div>
      <Navbar />
      <main>
        <Hero />
        <React.Suspense fallback={<div className="h-[100svh] w-full bg-black flex items-center justify-center text-white/50 text-sm font-mono tracking-widest uppercase">Loading Modules...</div>}>
          <Services />
          <Process />
          <AutomationPortfolio />
          <Stats />
          <Philosophy />
          <Testimonials />
          <Team />
        </React.Suspense>
      </main>
      <React.Suspense fallback={<div className="h-48 w-full bg-black"></div>}>
        <Footer />
      </React.Suspense>
    </div>
  );
}

export default App;
