import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import { CustomCursor } from './components/MicroInteractions';
import ScrollToTop from './components/ScrollToTop';

const Services = lazy(() => import('./components/Services'));
const AutomationPortfolio = lazy(() => import('./components/AutomationPortfolio'));
const Philosophy = lazy(() => import('./components/Philosophy'));
const Testimonials = lazy(() => import('./components/Testimonials'));
const Team = lazy(() => import('./components/Team'));
const Process = lazy(() => import('./components/Process'));
const Stats = lazy(() => import('./components/Stats'));
const Footer = lazy(() => import('./components/Footer'));
const WorkPage = lazy(() => import('./components/work/WorkPage'));

gsap.registerPlugin(ScrollTrigger);

const LoadingFallback = () => (
  <div className="h-[100svh] w-full bg-black flex items-center justify-center text-white/50 text-sm font-mono tracking-widest uppercase">
    Loading...
  </div>
);

// Homepage layout (existing site — untouched)
function HomePage() {
  const appRef = useRef(null);

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

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));

    const sections = gsap.utils.toArray('.reveal-section');
    sections.forEach((section) => {
      gsap.fromTo(section,
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
      <div className="noise-overlay pointer-events-none z-[100]" />
      <Navbar />
      <main>
        <Hero />
        <Suspense fallback={<LoadingFallback />}>
          <Services />
          <Process />
          <AutomationPortfolio />
          <Stats />
          <Philosophy />
          <Testimonials />
          <Team />
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-48 w-full bg-black" />}>
        <Footer />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/work"
          element={
            <Suspense fallback={<div className="fixed inset-0 bg-[#050508]" />}>
              <WorkPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
