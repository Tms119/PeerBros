import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Philosophy = () => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const bgRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            let mm = gsap.matchMedia();

            // Desktop: pinned parallax reveal
            mm.add("(min-width: 768px)", () => {
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: '+=80%',
                        scrub: true,
                        pin: true,
                        invalidateOnRefresh: true
                    }
                });

                tl.to(bgRef.current, { scale: 1.5, filter: 'blur(20px)', opacity: 0, duration: 1, willChange: 'transform, filter, opacity' }, 0)
                    .fromTo(textRef.current, { scale: 0.8, opacity: 0, y: 100 }, { scale: 1, opacity: 1, y: 0, duration: 0.8, willChange: 'transform, opacity' }, 0);
            });

            // Mobile: no pin — simple fade-in, no blur filter cost
            mm.add("(max-width: 767px)", () => {
                gsap.fromTo(bgRef.current,
                    { scale: 1, opacity: 1 },
                    {
                        scale: 1.2, opacity: 0, duration: 1, willChange: 'transform, opacity',
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: 'top 60%',
                            end: 'center center',
                            scrub: 1,
                        }
                    }
                );
                gsap.fromTo(textRef.current,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
                        scrollTrigger: {
                            trigger: textRef.current,
                            start: 'top 80%',
                            toggleActions: 'play none none reverse',
                        }
                    }
                );
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="h-[100svh] w-full relative overflow-hidden bg-black flex items-center justify-center z-20">
            {/* Massive Background Text — smaller on mobile to prevent overflow & reduce paint cost */}
            <h2
                ref={bgRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[6rem] md:text-[30rem] font-display font-bold text-white/[0.02] whitespace-nowrap pointer-events-none tracking-tighter"
            >
                THE STANDARD
            </h2>

            <div className="max-w-6xl mx-auto text-center relative z-10 px-6">
                <div className="inline-flex glass-panel-lite md:glass-panel rounded-full px-6 py-3 text-xs md:text-sm text-accent mb-8 md:mb-12 uppercase tracking-widest border-accent/20">
                    The Manifesto
                </div>

                <h3
                    ref={textRef}
                    className="text-4xl md:text-7xl lg:text-8xl font-display font-medium text-white leading-[1.1] tracking-tight"
                >
                    We don't build generic websites. <br />
                    We build <span className="text-accent italic font-light">engines</span> that generate <br />
                    revenue while you sleep.
                </h3>
            </div>
        </section>
    );
};

export default Philosophy;
