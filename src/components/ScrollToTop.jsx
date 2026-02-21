import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const ScrollToTop = () => {
    const btnRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);

    // Track scroll progress
    useEffect(() => {
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docHeight > 0 ? scrollTop / docHeight : 0;
            setProgress(pct);
            setVisible(pct > 0.08); // show after 8% scroll
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Fade in/out animation
    useEffect(() => {
        const btn = btnRef.current;
        if (!btn) return;

        if (visible) {
            gsap.to(btn, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' });
        } else {
            gsap.to(btn, { autoAlpha: 0, scale: 0.6, duration: 0.3, ease: 'power3.in' });
        }
    }, [visible]);

    const handleClick = () => {
        // Use lenis if available, otherwise native
        const el = document.getElementById('home');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // SVG ring math
    const size = 52;
    const strokeWidth = 2.5;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <button
            ref={btnRef}
            onClick={handleClick}
            aria-label="Scroll to top"
            className="fixed bottom-8 right-8 z-[9980] group flex items-center justify-center"
            style={{ opacity: 0, transform: 'scale(0.6)', width: size, height: size }}
        >
            {/* Progress ring SVG */}
            <svg
                width={size}
                height={size}
                className="absolute inset-0 rotate-[-90deg] pointer-events-none"
                viewBox={`0 0 ${size} ${size}`}
            >
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress fill */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(249,115,22,0.9)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                />
            </svg>

            {/* Button background */}
            <div className="w-[38px] h-[38px] rounded-full bg-[#111] border border-white/10 group-hover:bg-accent group-hover:border-accent transition-all duration-300 flex flex-col items-center justify-center gap-0.5 shadow-[0_0_20px_rgba(249,115,22,0.15)] group-hover:shadow-[0_0_30px_rgba(249,115,22,0.35)]">
                {/* Arrow up */}
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="text-white/70 group-hover:text-white transition-colors">
                    <path d="M6 1L1 7.5M6 1L11 7.5M6 1V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[6px] font-mono tracking-[0.2em] text-white/40 group-hover:text-white/80 uppercase transition-colors leading-none">
                    TOP
                </span>
            </div>
        </button>
    );
};

export default ScrollToTop;
