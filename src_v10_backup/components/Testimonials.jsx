import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
                invalidateOnRefresh: true
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="h-screen w-full relative overflow-hidden bg-obsidian border-y border-white/5 flex flex-col justify-center">
            <div className="absolute top-12 md:top-24 left-10 md:left-24 z-50">
                <h2 className="text-xl md:text-2xl font-mono text-white/30 uppercase tracking-[0.4em]">
                    The Proof
                </h2>
            </div>

            <div ref={trackRef} className="flex flex-row items-center h-full w-max px-[10vw] gap-12 md:gap-32">
                {testimonials.map((testy, index) => (
                    <div
                        key={index}
                        className="w-[85vw] md:w-[60vw] lg:w-[50vw] shrink-0 glass-panel p-10 md:p-20 rounded-[2rem] relative overflow-hidden"
                    >
                        {/* Massive Quote Mark background */}
                        <div className="absolute -top-10 -left-10 text-[20rem] font-serif leading-none opacity-5 text-accent pointer-events-none select-none">
                            "
                        </div>

                        <div className="relative z-10">
                            <div className="text-accent font-mono text-3xl md:text-5xl tracking-tighter mb-12 pb-8 border-b border-white/10">
                                {testy.metric}
                            </div>

                            <p className="text-3xl md:text-5xl text-white font-display font-light leading-[1.2] mb-12 tracking-tight">
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
    );
};

export default Testimonials;
