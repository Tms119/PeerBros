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
        description: 'Beautiful, fast websites designed specifically to turn your visitors into paying customers.',
        metric: "Digital Real Estate"
    },
    {
        title: 'Custom Apps & CRM',
        description: 'Custom software built exactly for what your business needs. Simple, clean, and highly effective.',
        metric: "Systemizing Chaos"
    },
    {
        title: 'Business Automation',
        description: 'We use AI to automate your repetitive tasks, saving you thousands of hours so you can focus on growth.',
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
            let mm = gsap.matchMedia();

            // Desktop Animation (Complex 3D scale) — pinned scroll
            mm.add("(min-width: 768px)", () => {
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

                tl.to(titleRef.current, { opacity: 0, y: -50, duration: 0.5 }, 0);

                slidesRef.current.forEach((slide, i) => {
                    if (i === 0) {
                        gsap.set(slide, { opacity: 1, scale: 1, zIndex: services.length - i });
                        tl.to(slide, { opacity: 0, scale: 4, duration: 1, willChange: 'transform, opacity' }, 0);
                    } else if (i === services.length - 1) {
                        gsap.set(slide, { opacity: 0, scale: 0.5, zIndex: services.length - i });
                        tl.to(slide, { opacity: 1, scale: 1, duration: 1, willChange: 'transform, opacity' });
                    } else {
                        gsap.set(slide, { opacity: 0, scale: 0.5, zIndex: services.length - i });
                        tl.to(slide, { opacity: 1, scale: 1, duration: 1, willChange: 'transform, opacity' })
                            .to(slide, { opacity: 0, scale: 4, duration: 1, willChange: 'transform, opacity' }, "+=0.2");
                    }
                });
            });

            // Mobile: simple scroll-triggered fade-in per card — no pinning, no jitter
            mm.add("(max-width: 767px)", () => {
                slidesRef.current.forEach((slide) => {
                    gsap.fromTo(slide,
                        { opacity: 0, y: 40 },
                        {
                            opacity: 1,
                            y: 0,
                            duration: 0.7,
                            ease: 'power2.out',
                            scrollTrigger: {
                                trigger: slide,
                                start: 'top 80%',
                                toggleActions: 'play none none reverse',
                            }
                        }
                    );
                });
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <>
            {/* Desktop: pinned full-height section */}
            <section
                id="services"
                ref={containerRef}
                className="hidden md:flex h-[100svh] w-full bg-black relative overflow-hidden items-center justify-center pt-20"
            >
                <div ref={titleRef} className="absolute top-24 left-1/2 -translate-x-1/2 text-center w-full px-4 z-50">
                    <h2 className="text-2xl font-mono text-white/30 uppercase tracking-[0.4em] mix-blend-difference">
                        The Arsenal
                    </h2>
                </div>

                <div className="relative w-full h-full flex items-center justify-center mt-12">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            ref={el => slidesRef.current[index] = el}
                            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center"
                        >
                            <span className="text-accent text-xl font-mono uppercase tracking-[0.5em] mb-8 block">
                                Phase {index + 1} // {service.metric}
                            </span>
                            <h3 className="text-[7rem] lg:text-[9rem] xl:text-[11rem] font-display font-medium text-white leading-[0.85] tracking-tighter mb-8 max-w-[90vw] flex flex-wrap justify-center gap-x-6">
                                {service.title.split(' ').map((word, wIdx) => <span key={wIdx}>{word}</span>)}
                            </h3>
                            <p className="text-3xl text-white/60 max-w-3xl font-light leading-relaxed px-4">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-40" />
            </section>

            {/* Mobile: natural vertical scroll with CSS snap — no pin jitter */}
            <section
                id="services"
                className="md:hidden w-full bg-black relative pt-24 pb-12"
            >
                <div className="text-center w-full px-4 mb-12">
                    <h2 className="text-lg font-mono text-white/30 uppercase tracking-[0.4em]">
                        The Arsenal
                    </h2>
                </div>

                <div className="flex flex-col gap-0">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            ref={el => {
                                // Only assign to slidesRef if desktop hasn't claimed it
                                if (!slidesRef.current[index]) slidesRef.current[index] = el;
                            }}
                            className="flex flex-col items-center justify-center px-6 py-20 text-center border-b border-white/5 last:border-0"
                        >
                            <span className="text-accent text-xs font-mono uppercase tracking-[0.5em] mb-4 block">
                                Phase {index + 1} // {service.metric}
                            </span>
                            <h3 className="text-5xl font-display font-medium text-white leading-[0.85] tracking-tighter mb-6 max-w-[90vw]">
                                {service.title}
                            </h3>
                            <p className="text-lg text-white/60 max-w-sm font-light leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Services;
