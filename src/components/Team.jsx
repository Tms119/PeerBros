import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const roster = [
    {
        name: "The Architect",
        label: "7x Founder",
        description: "Built multiple local businesses from the ground up. The visionary who plans out the big picture for your digital strategy, ensuring every dollar spent brings a return on investment.",
        focus: "Strategic Vision"
    },
    {
        name: "Sys Admin",
        label: "3x Founder",
        description: "Top 10 marketing expert in Bangladesh. Solopreneur and Head of Technology architecting our most complex automation stacks and AI models.",
        focus: "Technology & AI"
    },
    {
        name: "The Narrative",
        label: "Marketing Head",
        description: "Worked for 7 major media companies. Controls the narrative and distribution algorithms. If you have a story, he scales it globally.",
        focus: "Media Strategy"
    },
    {
        name: "Visual Engineer",
        label: "2x Co-Founder",
        description: "Worked with top LinkedIn personal brands. A world-class designer who builds beautiful, easy-to-use websites designed to maximize your sales.",
        focus: "Design & UX"
    },
    {
        name: "Ground Command",
        label: "2x Co-Founder",
        description: "Built 2 local businesses to scale. The grounded operational executive tracking metrics, fulfillment, and systems integrity.",
        focus: "Operations"
    }
];

const Team = () => {
    const [activeIdx, setActiveIdx] = useState(0);
    const sectionRef = useRef(null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(sectionRef.current,
                { opacity: 0, fillOpacity: 0 },
                {
                    opacity: 1,
                    duration: 1.2,
                    ease: "power2.out",
                    willChange: "opacity",
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: "top 80%",
                    }
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section id="team" ref={sectionRef} className="min-h-[100svh] w-full bg-[#050505] flex flex-col md:flex-row relative z-10">

            {/* Left Menu (The Roster) */}
            <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-24 py-24 border-r border-white/10">
                <h2 className="text-sm uppercase tracking-widest text-accent mb-12 font-semibold">The Core Five</h2>

                <div className="flex flex-col gap-2">
                    {roster.map((member, idx) => (
                        <div
                            key={idx}
                            onMouseEnter={() => setActiveIdx(idx)}
                            onClick={() => setActiveIdx(idx)}
                            className="group cursor-pointer py-6 border-b border-white/5 transition-all duration-300 relative overflow-hidden"
                        >
                            {/* Background fill on hover */}
                            <div className={`absolute inset-0 bg-white/[0.03] transition-transform duration-500 origin-left ${activeIdx === idx ? 'scale-x-100' : 'scale-x-0'}`} />

                            <div className="relative z-10 flex items-center justify-between pointer-events-none pr-8 pl-4">
                                <div className="flex items-baseline gap-4 md:gap-6 focus-within:">
                                    <span className={`font-mono text-sm transition-colors ${activeIdx === idx ? 'text-accent' : 'text-white/20'}`}>0{idx + 1}</span>
                                    <h3 className={`text-3xl md:text-5xl lg:text-6xl font-display font-medium tracking-tighter transition-all duration-300 ${activeIdx === idx ? 'text-white translate-x-2 md:translate-x-4' : 'text-white/40'}`}>
                                        {member.name}
                                    </h3>
                                </div>
                                <div className={`text-accent transition-all duration-300 ${activeIdx === idx ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                                    <ArrowRight size={24} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Info Deep Dive */}
            <div className="w-full md:w-1/2 p-6 md:p-24 flex items-center justify-center relative overflow-hidden">
                {/* Dynamic Abstract Background representing data */}
                <div className="absolute inset-0 z-0 opacity-20">
                    <div className={`absolute inset-0 transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,rgba(192,160,128,0.3)_0%,transparent_100%)] ${activeIdx % 2 === 0 ? 'opacity-100' : 'opacity-0'}`} />
                    <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-white border border-white/10 rounded-full blur-[20px] md:blur-[100px] transition-transform duration-[2s] ${activeIdx % 2 !== 0 ? 'scale-150' : 'scale-50'}`} />
                </div>

                <div className="relative z-10 w-full max-w-md">
                    <div className="mb-12">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-black/80 md:bg-black/50 md:backdrop-blur-md text-accent font-mono text-xs uppercase tracking-widest mb-6">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                            {roster[activeIdx].label}
                        </div>

                        <h4 className="text-2xl font-mono text-white/40 uppercase tracking-widest mb-8 border-b border-white/10 pb-4">
                            Focus: {roster[activeIdx].focus}
                        </h4>

                        <p className="text-lg md:text-3xl text-white/80 font-light leading-relaxed">
                            "{roster[activeIdx].description}"
                        </p>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default Team;
