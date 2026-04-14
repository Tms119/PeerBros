import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const testimonials = [
    {
        quote: "PeerBros didn't just redesign our logo; they completely re-engineered our operational identity. Our brand equity 10x'd in 6 months.",
        author: "CEO, TechFlow Logistics",
        metric: "+340% YoY Growth"
    },
    {
        quote: "The strategic clarity we gained from the brand consultation phase directly led to our Series A funding. They see what others miss.",
        author: "Founder, Apex Retail Solutions",
        metric: "$2.5M Raised"
    },
    {
        quote: "We were a commodity before PeerBros. Now, we're the category king. Their brand strategy is ruthless and effective.",
        author: "Director, Nova Health Clinics",
        metric: "4x Patient Acq."
    }
];

const Testimonials = () => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            let mm = gsap.matchMedia();

            // Desktop: GSAP horizontal scroll pinned
            mm.add("(min-width: 768px)", () => {
                const getScrollAmount = () => {
                    let trackWidth = trackRef.current.scrollWidth;
                    return -(trackWidth - window.innerWidth);
                };

                const tween = gsap.to(trackRef.current, {
                    x: getScrollAmount,
                    ease: "none"
                });

                ScrollTrigger.create({
                    trigger: containerRef.current,
                    start: "top top",
                    end: () => `+=${getScrollAmount() * -1}`,
                    pin: true,
                    animation: tween,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    normalizeScroll: true
                });
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <>
            {/* Desktop: GSAP pinned horizontal scroll */}
            <section ref={containerRef} className="hidden md:flex h-[100svh] w-full relative overflow-hidden bg-obsidian border-y border-white/5 flex-col justify-center">
                <div className="absolute top-24 left-24 z-50">
                    <h2 className="text-2xl font-mono text-white/30 uppercase tracking-[0.4em]">
                        The Proof
                    </h2>
                </div>

                <div ref={trackRef} className="flex flex-row items-center h-full w-max px-[10vw] gap-32 will-change-transform">
                    {testimonials.map((testy, index) => (
                        <div
                            key={index}
                            className="w-[60vw] lg:w-[50vw] shrink-0 glass-panel p-20 rounded-[2rem] relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -left-10 text-[20rem] font-serif leading-none opacity-5 text-accent pointer-events-none select-none">
                                "
                            </div>
                            <div className="relative z-10">
                                <div className="text-accent font-mono text-5xl tracking-tighter mb-12 pb-8 border-b border-white/10">
                                    {testy.metric}
                                </div>
                                <p className="text-5xl text-white font-display font-light leading-[1.2] mb-12 tracking-tight">
                                    "{testy.quote}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-[1px] bg-white/30" />
                                    <span className="uppercase tracking-widest text-sm text-white/60 font-semibold">{testy.author}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Mobile: native CSS horizontal scroll-snap — no GSAP pin, no jitter */}
            <section className="md:hidden w-full bg-obsidian border-y border-white/5 py-20 relative overflow-hidden">
                <div className="absolute top-6 left-6 z-50">
                    <h2 className="text-lg font-mono text-white/30 uppercase tracking-[0.4em]">
                        The Proof
                    </h2>
                </div>

                <div
                    className="flex flex-row overflow-x-auto gap-5 px-6 pt-14 pb-6 snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    {testimonials.map((testy, index) => (
                        <div
                            key={index}
                            className="w-[85vw] shrink-0 snap-center glass-panel-lite p-8 rounded-[2rem] relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -left-6 text-[12rem] font-serif leading-none opacity-5 text-accent pointer-events-none select-none">
                                "
                            </div>
                            <div className="relative z-10">
                                <div className="text-accent font-mono text-2xl tracking-tighter mb-8 pb-6 border-b border-white/10">
                                    {testy.metric}
                                </div>
                                <p className="text-2xl text-white font-display font-light leading-[1.2] mb-8 tracking-tight">
                                    "{testy.quote}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-[1px] bg-white/30" />
                                    <span className="uppercase tracking-widest text-xs text-white/60 font-semibold">{testy.author}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Swipe hint dots */}
                <div className="flex justify-center gap-2 mt-4">
                    {testimonials.map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-accent' : 'bg-white/20'}`} />
                    ))}
                </div>
            </section>
        </>
    );
};

export default Testimonials;
