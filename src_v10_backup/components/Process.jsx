import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
    {
        number: "01",
        title: "Discovery & Audit",
        metric: "Finding Friction",
        description: "We don't guess. We analyze your current state, identify operational bottlenecks, and map the exact friction points costing you revenue."
    },
    {
        number: "02",
        title: "Strategic Architecture",
        metric: "The Blueprint",
        description: "Designing the blueprint. From brand positioning to selecting the right tech stack (CRM, AI agents, CMS), everything is explicitly blueprinted."
    },
    {
        number: "03",
        title: "Relentless Execution",
        metric: "Building Engines",
        description: "Our engineers and designers build parallel systems. 10x output speed without sacrificing the pixel-perfect premium quality your brand demands."
    },
    {
        number: "04",
        title: "Deployment & Scaling",
        metric: "Infinite Leverage",
        description: "We launch the systems and train your agents. Once stable, we turn the dials to scale your autonomous revenue engines."
    }
];

const Process = () => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !trackRef.current) return;

        const ctx = gsap.context(() => {
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

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="h-screen w-full bg-obsidian overflow-hidden flex flex-col justify-center border-y border-white/5 relative">
            <div className="absolute top-12 md:top-24 left-10 md:left-24 z-50">
                <h2 className="text-xl md:text-2xl font-mono text-white/30 uppercase tracking-[0.4em]">
                    The Architecture
                </h2>
            </div>

            {/* Horizontal scrolling track */}
            <div ref={trackRef} className="flex flex-row items-center h-full w-max px-[10vw] gap-32">
                {steps.map((step, index) => (
                    <div key={index} className="flex flex-col justify-center w-[80vw] md:w-[60vw] max-w-4xl h-full shrink-0 relative">

                        {/* Background Number */}
                        <div className="absolute -top-20 -left-10 text-[15rem] md:text-[25rem] font-display font-medium text-white/5 pointer-events-none select-none z-0 tracking-tighter leading-none">
                            {step.number}
                        </div>

                        <div className="relative z-10 pl-10 md:pl-20 border-l border-accent/30 py-12">
                            <span className="text-accent font-mono uppercase tracking-[0.3em] text-sm md:text-base mb-6 block">
                                PHASE // {step.metric}
                            </span>
                            <h3 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-8 tracking-tighter leading-[0.9]">
                                {step.title}
                            </h3>
                            <p className="text-2xl md:text-4xl text-white/50 font-light leading-relaxed max-w-3xl">
                                {step.description}
                            </p>
                        </div>

                    </div>
                ))}
            </div>

            {/* Progress Line */}
            <div className="absolute bottom-12 md:bottom-24 left-10 right-10 h-[1px] bg-white/10 z-50 overflow-hidden">
                <div className="h-full bg-accent w-full origin-left scale-x-0" id="progress-line" />
            </div>
        </section>
    );
};

export default Process;
