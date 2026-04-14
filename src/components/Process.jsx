import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        number: "01",
        title: "Discovery & Audit",
        metric: "Finding Friction",
        description: "We don't guess. We analyze your current state, find out what's slowing you down, and fix the problems that are costing you money."
    },
    {
        number: "02",
        title: "Strategic Architecture",
        metric: "The Blueprint",
        description: "We plan everything out. From how your brand looks to what software you need (like CRM and AI systems), we design a clear path forward."
    },
    {
        number: "03",
        title: "Relentless Execution",
        metric: "Building Engines",
        description: "Our team works fast to build your systems and website, making sure everything looks perfect and works flawlessly."
    },
    {
        number: "04",
        title: "Deployment & Scaling",
        metric: "Infinite Leverage",
        description: "We launch your systems and show you how to use them. Once everything is running smoothly, we focus on scaling your business."
    }
];

const Process = () => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);
    const mobileStepsRef = useRef([]);

    useEffect(() => {
        if (!containerRef.current || !trackRef.current) return;

        const ctx = gsap.context(() => {
            let mm = gsap.matchMedia();

            // Desktop Animation
            mm.add("(min-width: 768px)", () => {
                const getScrollAmount = () => -(trackRef.current.scrollWidth - window.innerWidth);

                const tween = gsap.to(trackRef.current, {
                    x: getScrollAmount,
                    ease: "none"
                });

                ScrollTrigger.create({
                    trigger: containerRef.current,
                    start: "top top",
                    end: () => `+=${trackRef.current.scrollWidth - window.innerWidth}`,
                    pin: true,
                    animation: tween,
                    scrub: 1,
                    invalidateOnRefresh: true,
                });

                // Smooth progress line
                gsap.to("#progress-line", {
                    scaleX: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: () => `+=${trackRef.current.scrollWidth - window.innerWidth}`,
                        scrub: 1,
                        invalidateOnRefresh: true
                    }
                });
            });

            // Mobile Animation: Draw & Pop
            mm.add("(max-width: 767px)", () => {
                mobileStepsRef.current.forEach((stepEl) => {
                    if (!stepEl) return;
                    
                    const line = stepEl.querySelector(".mobile-connecting-line");
                    const dot = stepEl.querySelector(".mobile-connecting-dot");
                    const content = stepEl.querySelector(".mobile-content");

                    // Set initial states to ensure they exist before animation
                    gsap.set(line, { scaleY: 0 });
                    gsap.set(dot, { scale: 0, opacity: 0 });
                    gsap.set(content, { x: 30, opacity: 0 });

                    const tl = gsap.timeline({
                        scrollTrigger: {
                            trigger: stepEl,
                            start: "top 70%",
                            toggleActions: "play none none reverse"
                        }
                    });

                    tl.to(line, { scaleY: 1, duration: 0.5, ease: "power1.inOut", transformOrigin: "top" })
                      .to(dot, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }, "-=0.1")
                      .to(content, { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, "-=0.1");
                });
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="min-h-[100svh] md:h-[100svh] w-full bg-obsidian overflow-hidden flex flex-col justify-center border-y border-white/5 relative py-24 md:py-0">
            <div className="absolute top-8 md:top-24 left-6 md:left-24 z-50">
                <h2 className="text-lg md:text-2xl font-mono text-white/30 uppercase tracking-[0.4em]">
                    The Architecture
                </h2>
            </div>

            {/* Horizontal scrolling track on desktop, vertical stack on mobile */}
            <div ref={trackRef} className="flex flex-col md:flex-row items-start md:items-center md:h-full w-full md:w-max px-6 md:px-[10vw] gap-24 md:gap-32 mt-16 md:mt-0">
                {steps.map((step, index) => (
                    <div 
                        key={index}
                        ref={el => mobileStepsRef.current[index] = el}
                        className="flex flex-col justify-center w-full md:w-[60vw] max-w-4xl shrink-0 relative"
                    >
                        {/* Background Number */}
                        <div className="absolute -top-[10%] -left-4 md:-top-20 md:-left-10 text-[6rem] md:text-[25rem] font-display font-medium text-white/5 pointer-events-none select-none z-0 tracking-tighter leading-none">
                            {step.number}
                        </div>

                        <div className="relative z-10 pl-8 md:pl-20 md:border-l border-accent/30 py-8 md:py-12">
                            
                            {/* Mobile Line & Dot Elements */}
                            <div className="md:hidden absolute left-0 top-0 bottom-0 w-[2px] bg-white/5">
                                <div className="mobile-connecting-line w-full h-full bg-accent" />
                            </div>
                            <div className="mobile-connecting-dot md:hidden absolute left-[-3px] top-12 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_rgba(249,115,22,0.8)]" />

                            <div className="mobile-content flex flex-col justify-center opacity-100 md:opacity-100 md:translate-x-0">
                                <span className="text-accent font-mono uppercase tracking-[0.3em] text-xs md:text-base mb-4 md:mb-6 block">
                                    PHASE // {step.metric}
                                </span>
                                <h3 className="text-4xl md:text-6xl lg:text-8xl font-display font-bold text-white mb-6 md:mb-8 tracking-tighter leading-[0.9]">
                                    {step.title}
                                </h3>
                                <p className="text-lg md:text-2xl lg:text-3xl text-white/50 font-light leading-relaxed max-w-3xl">
                                    {step.description}
                                </p>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Progress Line (Desktop only) */}
            <div className="hidden md:block absolute bottom-8 md:bottom-24 left-6 md:left-10 right-6 md:right-10 h-[1px] bg-white/10 z-50 overflow-hidden">
                <div className="h-full bg-accent w-full origin-left scale-x-0" id="progress-line" />
            </div>
        </section>
    );
};

export default Process;
