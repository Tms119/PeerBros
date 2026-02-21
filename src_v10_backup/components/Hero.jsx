import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// $1B Premium Loader - Absolute Minimalism & Clarity
const Preloader = ({ onComplete }) => {
    const containerRef = useRef(null);
    const counterRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.to(containerRef.current, {
                        yPercent: -100,
                        duration: 1.2,
                        ease: "power4.inOut",
                        onComplete
                    });
                }
            });

            // Smooth luxury count-up
            tl.to(counterRef.current, {
                innerHTML: 100,
                duration: 2.5,
                snap: { innerHTML: 1 },
                ease: "power3.inOut",
                onUpdate: function () {
                    if (counterRef.current) {
                        counterRef.current.innerHTML = String(Math.round(this.targets()[0].innerHTML)).padStart(3, '0');
                    }
                }
            })
                .to('.loader-text', { opacity: 0, duration: 0.4, stagger: 0.1 }, "-=0.2");
        }, containerRef);
        return () => ctx.revert();
    }, [onComplete]);

    return (
        <div ref={containerRef} className="fixed inset-0 z-[999] bg-[#020202] flex flex-col items-center justify-center text-white">
            <div className="flex flex-col items-center justify-center">
                <div className="flex items-baseline overflow-hidden">
                    <div ref={counterRef} className="text-7xl md:text-9xl font-display font-light tracking-tighter mb-4 loader-text text-white">000</div>
                    <span className="text-2xl md:text-4xl font-light text-accent ml-1 loader-text">%</span>
                </div>
                {/* Single statement of immense authority */}
                <div className="loader-text font-mono text-[10px] md:text-xs tracking-[0.2em] text-white/40 uppercase mt-4">
                    Engineering Digital Excellence
                </div>
            </div>
        </div>
    );
};

// Technical Grid that reacts to cursor
const TechGrid = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute inset-[-50%] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] tech-grid-layer" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020202_80%)]" />
        </div>
    );
};

// Real-time HUD showing technical coordinates
const InteractiveHUD = () => {
    const coordsRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (coordsRef.current) {
                const x = (e.clientX / window.innerWidth).toFixed(3);
                const y = (e.clientY / window.innerHeight).toFixed(3);
                coordsRef.current.innerText = `[X: ${x} Y: ${y}]`;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="absolute top-10 right-10 z-50 pointer-events-none hidden md:flex flex-col items-end gap-1 opacity-50 font-mono text-[10px] uppercase tracking-widest text-accent">
            <span>System: Online</span>
            <span>Target: Digital Empires</span>
            <span ref={coordsRef}>[X: 0.000 Y: 0.000]</span>
        </div>
    );
};

const Hero = () => {
    const [loaded, setLoaded] = useState(false);
    const containerRef = useRef(null);
    const gridRef = useRef(null);
    const auraRef = useRef(null);
    const headlineRef = useRef(null);

    // Reveal Animation
    useEffect(() => {
        if (!loaded || !containerRef.current) return;
        let ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Slower, dramatic reveal
            tl.to('.hero-tag', { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' })
                .to('.hero-headline-word', { y: 0, opacity: 1, duration: 1.5, stagger: 0.1, ease: "power4.out" }, "-=0.8")
                .to('.hero-sub', { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, "-=1")
                .to(gridRef.current, { opacity: 1, duration: 2 }, "-=1.5");
        }, containerRef);
        return () => ctx.revert();
    }, [loaded]);

    // Complex Mouse Tracking (Flashlight, Grid Parallax, Type Tilt)
    useEffect(() => {
        if (!loaded || !containerRef.current) return;

        const xToAura = gsap.quickTo(auraRef.current, "x", { duration: 0.8, ease: "power3" });
        const yToAura = gsap.quickTo(auraRef.current, "y", { duration: 0.8, ease: "power3" });

        const xToGrid = gsap.quickTo(".tech-grid-layer", "x", { duration: 2, ease: "power3.out" });
        const yToGrid = gsap.quickTo(".tech-grid-layer", "y", { duration: 2, ease: "power3.out" });

        const xToText = gsap.quickTo(headlineRef.current, "rotationY", { duration: 1, ease: "power3.out" });
        const yToText = gsap.quickTo(headlineRef.current, "rotationX", { duration: 1, ease: "power3.out" });

        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const clientX = e.clientX;
            const clientY = e.clientY;

            // Move Aura directly
            xToAura(clientX - window.innerWidth / 2);
            yToAura(clientY - window.innerHeight / 2);

            // Parallax Grid opposite to mouse
            const xGridPos = (clientX / innerWidth - 0.5) * -50;
            const yGridPos = (clientY / innerHeight - 0.5) * -50;
            xToGrid(xGridPos);
            yToGrid(yGridPos);

            // Tilt Text slightly towards mouse
            const xTextPos = (clientX / innerWidth - 0.5) * 15;
            const yTextPos = -(clientY / innerHeight - 0.5) * 15;
            xToText(xTextPos);
            yToText(yTextPos);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [loaded]);

    return (
        <>
            {!loaded && <Preloader onComplete={() => setLoaded(true)} />}

            <section id="home" ref={containerRef} className="relative h-screen w-full bg-[#020202] overflow-hidden flex flex-col justify-center items-center perspective-[2000px] cursor-none">

                <div ref={gridRef} className="opacity-0 absolute inset-0 w-full h-full">
                    <TechGrid />
                </div>

                <InteractiveHUD />

                {/* The Flashlight Aura */}
                <div
                    ref={auraRef}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45vw] h-[45vw] bg-accent/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none z-10 will-change-transform"
                />

                <div className="relative z-30 w-full max-w-[90rem] mx-auto px-6 flex flex-col items-center text-center transform-gpu">

                    {/* The Hook */}
                    <div className="hero-tag opacity-0 translate-y-10 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md mb-12 shadow-2xl relative z-40">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                        <span className="text-white/80 uppercase tracking-[0.3em] text-[10px] md:text-xs font-mono font-medium">
                            Premium Digital Operations
                        </span>
                    </div>

                    {/* Highly legible, massive typography */}
                    <h1 ref={headlineRef} className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-x-[3vw] gap-y-1 md:gap-y-4 text-[13vw] md:text-[9vw] lg:text-[8vw] font-display font-medium tracking-tight text-white w-full leading-[0.9] transform-style-3d will-change-transform drop-shadow-2xl relative z-40">
                        <div className="hero-headline-word opacity-0 translate-y-[80px]">We</div>
                        <div className="hero-headline-word opacity-0 translate-y-[80px] text-white/40 italic font-light">Build</div>
                        <div className="hero-headline-word opacity-0 translate-y-[80px]">Digital</div>
                        <div className="hero-headline-word opacity-0 translate-y-[80px] text-accent">Businesses.</div>
                    </h1>

                    {/* The Proposition */}
                    <p className="hero-sub opacity-0 translate-y-12 mt-12 text-lg md:text-2xl text-white/60 font-light max-w-2xl text-center mx-auto tracking-wide leading-relaxed relative z-40">
                        We don't design templates. We engineer elite, automated digital infrastructures that drive absolute asymmetric growth.
                    </p>
                </div>

                {/* Scanline overlay for texture */}
                <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px]" />

            </section>
        </>
    );
};

export default Hero;
