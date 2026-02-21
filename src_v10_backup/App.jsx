import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Services from './components/Services';
import AutomationPortfolio from './components/AutomationPortfolio';
import Philosophy from './components/Philosophy';
import Testimonials from './components/Testimonials';
import Team from './components/Team';
import Process from './components/Process';
import Stats from './components/Stats';
import Footer from './components/Footer';
import { CustomCursor } from './components/MicroInteractions';

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
      <div className="noise-overlay pointer-events-none z-[100]"></div>
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Process />
        <AutomationPortfolio />
        <Stats />
        <Philosophy />
        <Testimonials />
        <Team />
      </main>
      <Footer />
    </div>
  );
}

export default App;
