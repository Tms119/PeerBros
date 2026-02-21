import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const services = [
    {
        title: 'Brand Consultation',
        description: 'We dig deep to unearth your core identity. Over 10+ brands transformed through our strategic framework.',
        metric: "Architecting Identity"
    },
    {
        title: 'Website Building',
        description: 'Cinematic, high-conversion landing pages and scalable web architectures built for the modern internet.',
        metric: "Digital Real Estate"
    },
    {
        title: 'Custom Apps & CRM',
        description: 'Bespoke software tailored to your specific operational needs. No bloated templates, just pure utility.',
        metric: "Systemizing Chaos"
    },
    {
        title: 'Business Automation',
        description: 'Replacing repetitive tasks with deterministic systems. Save thousands of hours with custom AI workflows.',
        metric: "Infinite Leverage"
    }
];

const Services = () => {
    const containerRef = useRef(null);
    const titleRef = useRef(null);
    const slidesRef = useRef([]);

    useEffect(() => {
        if (!containerRef.current || slidesRef.current.length === 0) return;

        const ctx = gsap.context(() => {
            // Pin the entire section
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: `+=${services.length * 100}%`,
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                }
            });

            // Fade out the title immediately upon scrolling to prevent overlap
            tl.to(titleRef.current, { opacity: 0, y: -50, duration: 0.5 }, 0);

            // Fly-through Z-axis effect
            slidesRef.current.forEach((slide, i) => {
                if (i === 0) {
                    // First slide is visible initially (opacity 1) and just scales up and out
                    gsap.set(slide, { opacity: 1, scale: 1, zIndex: services.length - i });
                    tl.to(slide, { opacity: 0, scale: 4, duration: 1 }, 0);
                } else if (i === services.length - 1) {
                    // Last slide should scale in, and NOT fade out.
                    gsap.set(slide, { opacity: 0, scale: 0.5, zIndex: services.length - i });
                    tl.to(slide, { opacity: 1, scale: 1, duration: 1 });
                } else {
                    // Subsequent slides scale out of nothingness
                    gsap.set(slide, { opacity: 0, scale: 0.5, zIndex: services.length - i });
                    tl.to(slide, { opacity: 1, scale: 1, duration: 1 })
                        .to(slide, { opacity: 0, scale: 4, duration: 1 }, "+=0.2");
                }
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="services" ref={containerRef} className="h-screen w-full bg-black relative overflow-hidden flex items-center justify-center pt-20">
            {/* Absolute center text tracking */}
            <div ref={titleRef} className="absolute top-12 md:top-24 left-1/2 -translate-x-1/2 text-center w-full z-50">
                <h2 className="text-xl md:text-2xl font-mono text-white/30 uppercase tracking-[0.4em] mix-blend-difference">
                    The Arsenal
                </h2>
            </div>

            <div className="relative w-full h-full flex items-center justify-center mt-12">
                {services.map((service, index) => (
                    <div
                        key={index}
                        ref={el => slidesRef.current[index] = el}
                        className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center will-change-transform"
                    >
                        <span className="text-accent text-sm md:text-xl font-mono uppercase tracking-[0.5em] mb-8 block">
                            Phase {index + 1} // {service.metric}
                        </span>
                        {/* Break titles to avoid overflowing viewport horizontally if they are too long */}
                        <h3 className="text-5xl md:text-[7rem] lg:text-[9rem] xl:text-[11rem] font-display font-medium text-white leading-[0.85] tracking-tighter mb-8 max-w-[90vw] flex flex-wrap justify-center gap-x-6">
                            {service.title.split(' ').map((word, wIdx) => <span key={wIdx}>{word}</span>)}
                        </h3>
                        <p className="text-xl md:text-3xl text-white/60 max-w-3xl font-light leading-relaxed">
                            {service.description}
                        </p>
                    </div>
                ))}
            </div>

            {/* Cinematic vignette */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-40" />
        </section>
    );
};

export default Services;
