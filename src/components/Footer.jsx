import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { MagneticButton } from './MicroInteractions';

const Footer = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo('.footer-reveal',
                { y: 100, opacity: 0 },
                {
                    y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: 'power4.out',
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: 'top 70%',
                    }
                }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <footer ref={containerRef} className="relative bg-black pt-32 pb-12 px-6 overflow-hidden min-h-[100svh] flex flex-col justify-between">
            {/* Massive Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-accent/20 blur-[40px] md:blur-[200px] rounded-full pointer-events-none opacity-50" />

            <div className="max-w-7xl mx-auto w-full relative z-10 flex-grow flex flex-col items-center justify-center text-center">

                <h2 className="text-5xl md:text-8xl lg:text-[10rem] font-display font-bold text-white tracking-tighter leading-[0.85] mb-8 md:mb-12 footer-reveal md:mix-blend-difference">
                    Stop <span className="italic font-light text-white/50">Losing</span> <br />
                    Time and Money.
                </h2>

                <p className="text-lg md:text-4xl text-white/60 max-w-sm md:max-w-4xl mx-auto mb-10 md:mb-16 font-light leading-relaxed footer-reveal px-4">
                    The market rewards fast, efficient businesses. We build the systems to get you there. Ready to grow?
                </p>

                <div className="footer-reveal">
                    <MagneticButton href="mailto:peerbros.official@gmail.com" className="px-8 py-5 md:px-12 md:py-6 rounded-full md:rounded-[2rem] bg-white text-black text-xl md:text-2xl font-bold hover:bg-accent hover:text-white transition-all duration-300 flex items-center gap-3 md:gap-4 group shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(192,160,128,0.3)]">
                        <span className="flex items-center gap-3 md:gap-4">
                            Contact Us
                            <ArrowUpRight size={24} className="md:w-7 md:h-7 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-300" />
                        </span>
                    </MagneticButton>
                </div>
            </div>

            <div className="w-full relative z-10 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-white/40 text-sm footer-reveal mt-auto max-w-7xl mx-auto gap-8 md:gap-0">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mb-2 md:mb-0 text-center md:text-left">
                    <span className="text-2xl font-display font-bold tracking-tighter text-white">PEER<span className="text-accent">BROS</span></span>
                    <span className="tracking-widest uppercase text-[10px] md:text-sm">&copy; {new Date().getFullYear()} Architected for Scale.</span>
                </div>


            </div>
        </footer>
    );
};

export default Footer;
