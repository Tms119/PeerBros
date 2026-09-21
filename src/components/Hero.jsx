import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

// --- 1. THE LOCOMOTIVE-STYLE SNAP PRELOADER ---
const Preloader = ({ onComplete }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        let ctx = gsap.context(() => {
            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.to(containerRef.current, {
                        yPercent: -100,
                        duration: 0.8,
                        ease: "power4.inOut",
                        onComplete
                    });
                }
            });

            tl.to(textRef.current, {
                opacity: 1,
                duration: 1.0,
                ease: "power3.inOut"
            })
                .to(textRef.current, {
                    opacity: 0,
                    duration: 0.8,
                    delay: 1.5,
                    ease: "power2.inOut"
                });
        }, containerRef);
        return () => ctx.revert();
    }, [onComplete]);

    return (
        <div ref={containerRef} className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center text-white origin-bottom">
            <div ref={textRef} className="opacity-0 flex flex-col items-center gap-4">
                <div className="text-3xl font-display font-medium tracking-tighter">PEERBROS®</div>
                <div className="w-12 h-[1px] bg-white/20"></div>
                <div className="font-mono text-[10px] tracking-[0.4em] text-white/40 uppercase">
                    Loading Experience
                </div>
            </div>
        </div>
    );
};

// --- 2. AMBIENT DEPTH ENGINE (Phase 14 Pure DOM Background) ---
const AmbientDepthEngine = () => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#020202]">
            {/* Core Deep Space Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#0a0a0a_0%,#020202_100%)] opacity-80" />

            {/* Massive Soft Light Bleed 1 (Top Right) */}
            <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-accent/5 rounded-full md:blur-[120px] md:mix-blend-screen md:animate-[pulse_8s_ease-in-out_infinite]" />

            {/* Massive Soft Light Bleed 2 (Bottom Left) */}
            <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] bg-white/5 rounded-full md:blur-[140px] md:mix-blend-screen md:animate-[pulse_12s_ease-in-out_infinite_reverse]" />

            {/* Extremely subtle, expensive film grain overlay to bind the lighting */}
            <div className="hidden md:block absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjIiIGhlaWdodD0iMiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjA1Ii8+Cjwvc3ZnPg==')] pointer-events-none md:mix-blend-overlay" />
        </div>
    );
};


// --- MAIN HERO CONTROLLER ---
const Hero = () => {
    const [loaded, setLoaded] = useState(false);
    const containerRef = useRef(null);
    const scrollCueRef = useRef(null);

    // Initial Load Animation (FOUC Eradicated)
    useEffect(() => {
        if (!loaded || !containerRef.current) return;
        let ctx = gsap.context(() => {
            const tl = gsap.timeline();

            // Focus-Pull sequence with cascading waterfall timing
            tl.to('.hero-tag', { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' })
                .to('.hero-focus-word', {
                    scale: 1,
                    opacity: 1,
                    filter: 'blur(0px)',
                    y: 0,
                    duration: 1.8,
                    stagger: 0.25, // Wider stagger for cinematic cascade
                    ease: "power4.out"
                }, "-=0.6")
                .to('.hero-sub', { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" }, "-=1.0")
                .to('.hero-badge', {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.2,
                    stagger: 0.3, // Sequential bounce-ins
                    ease: "back.out(2)" // Powerful bounce easing
                }, "-=0.5");
        }, containerRef);
        return () => ctx.revert();
    }, [loaded]);

    // --- SCROLL INDICATOR LOOP (animate SVG rect y attr) ---
    useEffect(() => {
        if (!loaded || !scrollCueRef.current) return;
        let ctx = gsap.context(() => {
            gsap.fromTo(scrollCueRef.current,
                { attr: { y: 6 } },
                { attr: { y: 21 }, duration: 1.5, ease: 'power2.inOut', repeat: -1, yoyo: false }
            );
        }, scrollCueRef);
        return () => ctx.revert();
    }, [loaded]);


    return (
        <>
            {!loaded && <Preloader onComplete={() => setLoaded(true)} />}

            {/* Standard 100svh Hero (No Scroll Scrubbing/Rig needed) */}
            <section id="home" ref={containerRef} className="relative h-[100svh] w-full bg-[#020202] overflow-hidden flex flex-col justify-center items-center perspective-[2000px] md:cursor-none">

                <AmbientDepthEngine />

                <div className="relative z-30 w-full max-w-[100rem] mx-auto px-6 md:px-12 flex flex-col items-center text-center">

                    <div className="hero-tag opacity-0 translate-y-10 inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl mb-12 md:shadow-2xl">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full md:animate-pulse md:shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                        <span className="text-white/80 uppercase tracking-[0.3em] text-[10px] md:text-xs font-mono font-medium">
                            Business Systems Engineering
                        </span>
                    </div>

                    <h1 className="flex flex-col items-center justify-center w-full uppercase drop-shadow-2xl relative z-40 transform-gpu">
                        {/* Top Line */}
                        <div className="flex flex-row flex-wrap items-center justify-center gap-x-3 md:gap-x-5 text-[clamp(2.5rem,5vw,6rem)] font-display font-medium tracking-tighter text-white leading-[1]">
                            <div className="hero-focus-word opacity-0 md:blur-2xl blur-xl scale-110 translate-y-10 will-change-transform inline-block">STOP</div>
                            <div className="hero-focus-word opacity-0 md:blur-2xl blur-xl scale-110 translate-y-10 text-white/30 italic font-light will-change-transform inline-block">HIRING</div>
                        </div>
                        {/* Bottom Line */}
                        <div className="flex flex-row flex-wrap items-center justify-center gap-x-3 md:gap-x-5 text-[clamp(3.5rem,8vw,11rem)] font-display font-medium tracking-tighter text-white leading-[0.9] mt-2 md:mt-0">
                            <div className="hero-focus-word opacity-0 md:blur-2xl blur-xl scale-110 translate-y-10 text-accent will-change-transform inline-block mix-blend-screen">HUMANS.</div>
                        </div>
                    </h1>

                    <p className="hero-sub opacity-0 translate-y-12 mt-6 md:mt-10 text-[10px] md:text-xs text-white/40 font-mono max-w-[280px] md:max-w-md text-center mx-auto tracking-[0.15em] uppercase leading-relaxed relative z-40 px-4">
                        Stop hiring around broken systems.<br className="hidden md:block" /> We build the systems that replace pointless work.
                    </p>

                    {/* --- BADGES (Stacked on mobile, floating on desktop) --- */}
                    <div className="flex flex-row flex-wrap justify-center items-center gap-3 mt-8 md:mt-0 w-full md:w-auto z-50">
                        {/* Badge 1: Top Left on Desktop */}
                        <div className="hero-badge opacity-0 translate-y-8 relative md:absolute md:top-[10%] md:left-[10%] px-3 md:px-4 py-2 md:py-2.5 rounded-2xl bg-[#0a0a0a]/90 md:bg-[#0a0a0a]/80 md:backdrop-blur-xl border border-white/[0.08] flex items-center gap-2 md:gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] md:animate-[floatBadge_6s_ease-in-out_infinite] w-[45%] md:w-auto">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent shrink-0">
                                <svg width="12" height="12" className="md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>
                            </div>
                            <div className="flex flex-col text-left overflow-hidden">
                                <span className="text-white font-medium text-xs md:text-sm leading-tight truncate">24/7 Output</span>
                                <span className="text-white/40 text-[8px] md:text-[10px] uppercase tracking-wider truncate">No Payroll or Sleep</span>
                            </div>
                        </div>

                        {/* Badge 2: Right Middle on Desktop */}
                        <div className="hero-badge opacity-0 translate-y-8 relative md:absolute md:top-[45%] lg:right-[8%] md:right-4 px-3 md:px-4 py-2 md:py-2.5 rounded-2xl bg-[#0a0a0a]/90 md:bg-[#0a0a0a]/80 md:backdrop-blur-xl border border-white/[0.08] flex items-center gap-2 md:gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] md:animate-[floatBadge_7s_ease-in-out_infinite_1s] w-[45%] md:w-auto">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30 text-green-400 shrink-0">
                                <svg width="12" height="12" className="md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                            </div>
                            <div className="flex flex-col text-left overflow-hidden">
                                <span className="text-white font-medium text-xs md:text-sm leading-tight truncate">100% Accurate</span>
                                <span className="text-white/40 text-[8px] md:text-[10px] uppercase tracking-wider truncate">Zero Human Error</span>
                            </div>
                        </div>

                        {/* Badge 3: Bottom Left on Desktop */}
                        <div className="hero-badge opacity-0 translate-y-8 relative md:absolute md:bottom-[20%] md:left-[15%] px-3 md:px-4 py-2 md:py-2.5 rounded-2xl bg-[#0a0a0a]/90 md:bg-[#0a0a0a]/80 md:backdrop-blur-xl border border-white/[0.08] flex items-center gap-2 md:gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] md:animate-[floatBadge_8s_ease-in-out_infinite_2s] w-full max-w-[200px] md:w-auto md:max-w-none">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30 text-blue-400 shrink-0">
                                <svg width="12" height="12" className="md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            </div>
                            <div className="flex flex-col text-left overflow-hidden">
                                <span className="text-white font-medium text-xs md:text-sm leading-tight truncate">Infinite Scale</span>
                                <span className="text-white/40 text-[8px] md:text-[10px] uppercase tracking-wider truncate">Without New Hires</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Premium Scroll Indicator — bottom-left, no overlap */}
                <button
                    onClick={() => {
                        const el = document.getElementById('services');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    aria-label="Scroll to next section"
                    className="absolute bottom-8 md:bottom-10 left-6 md:left-10 z-40 flex flex-row items-end gap-3 opacity-0 animate-[fadeIn_2s_ease-in_3s_forwards] group cursor-pointer pointer-events-auto"
                >
                    {/* Scroll-wheel SVG icon */}
                    <svg
                        width="18"
                        height="28"
                        viewBox="0 0 22 34"
                        fill="none"
                        className="text-white/25 group-hover:text-accent/60 transition-colors duration-300 flex-shrink-0"
                    >
                        <rect x="1" y="1" width="20" height="32" rx="10" stroke="currentColor" strokeWidth="1.5" />
                        <rect
                            ref={scrollCueRef}
                            x="9.5"
                            y="6"
                            width="3"
                            height="7"
                            rx="1.5"
                            fill="currentColor"
                        />
                    </svg>

                    {/* Rotated label */}
                    <span
                        className="text-[8px] font-mono tracking-[0.35em] text-white/25 uppercase group-hover:text-white/50 transition-colors duration-300"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                    >
                        Scroll to explore
                    </span>
                </button>

            </section>
        </>
    );
};

export default Hero;
