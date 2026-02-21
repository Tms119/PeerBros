import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const statsData = [
    { value: 10, suffix: "+", label: "Brands Elevated" },
    { value: 50, suffix: "M+", label: "Client Revenue" },
    { value: 100, suffix: "k+", label: "Hours Automated" },
    { value: 5, suffix: "", label: "Elite Operators" },
];

const Stats = () => {
    const containerRef = useRef(null);
    const countersRef = useRef([]);

    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: 'top top',
                    end: '+=100%',
                    pin: true,
                    scrub: true,
                    invalidateOnRefresh: true,
                }
            });

            // Fade the entire grid out in the second half of the scroll
            tl.to('.stats-grid', { opacity: 0, scale: 1.2, duration: 1, ease: "power2.inOut" }, 0.5);

            // Independent counter animations chained to the scroll
            countersRef.current.forEach((counterDiv, index) => {
                const targetValue = statsData[index].value;
                const numberSpan = counterDiv.querySelector('.stat-number');

                gsap.to(numberSpan, {
                    innerHTML: targetValue,
                    ease: "none",
                    snap: { innerHTML: 1 },
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top top',
                        end: '+=50%',
                        scrub: true,
                    },
                    onUpdate: function () {
                        if (numberSpan) {
                            numberSpan.innerHTML = Math.round(this.targets()[0].innerHTML);
                        }
                    }
                });
            });

        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="h-[100svh] w-full border-y border-white/5 bg-black relative flex items-center justify-center z-30">
            <div className="absolute inset-0 bg-accent/5 opacity-30 pointer-events-none" />

            <div className="stats-grid max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x divide-white/5 relative z-10 px-6">
                {statsData.map((stat, index) => (
                    <div
                        key={index}
                        ref={el => countersRef.current[index] = el}
                        className="flex flex-col items-center justify-center text-center px-4"
                    >
                        <div className="text-4xl md:text-6xl lg:text-8xl font-display font-medium text-white mb-2 md:mb-4 flex items-baseline">
                            <span className="stat-number">0</span>
                            <span className="text-accent">{stat.suffix}</span>
                        </div>
                        <div className="text-xs md:text-lg text-white/50 uppercase tracking-widest font-semibold">
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Cinematic vignette for depth */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-0" />
        </section>
    );
};

export default Stats;
