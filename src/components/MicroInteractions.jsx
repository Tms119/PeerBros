import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const auraRef = useRef(null);
    const rippleRef = useRef(null);
    const labelRef = useRef(null);
    const [cursorState, setCursorState] = useState('default'); // 'default' | 'hover' | 'text'

    useEffect(() => {
        document.body.style.cursor = 'none';

        const dot = dotRef.current;
        const ring = ringRef.current;
        const aura = auraRef.current;
        const label = labelRef.current;

        // Completely disable on touch devices
        const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 768;
        if (isTouchDevice || !dot || !ring || !aura) return;

        // Layer 1: Inner dot - instant snap
        const dotXTo = gsap.quickTo(dot, 'x', { duration: 0.05, ease: 'none' });
        const dotYTo = gsap.quickTo(dot, 'y', { duration: 0.05, ease: 'none' });

        // Layer 2: Outer ring - elastic lag
        const ringXTo = gsap.quickTo(ring, 'x', { duration: 0.25, ease: 'power3.out' });
        const ringYTo = gsap.quickTo(ring, 'y', { duration: 0.25, ease: 'power3.out' });

        // Layer 3: Aura blob - very sluggish
        const auraXTo = gsap.quickTo(aura, 'x', { duration: 0.7, ease: 'power2.out' });
        const auraYTo = gsap.quickTo(aura, 'y', { duration: 0.7, ease: 'power2.out' });

        const moveCursor = (e) => {
            dotXTo(e.clientX);
            dotYTo(e.clientY);
            ringXTo(e.clientX);
            ringYTo(e.clientY);
            auraXTo(e.clientX);
            auraYTo(e.clientY);
        };

        window.addEventListener('mousemove', moveCursor);

        // Click ripple burst
        const handleClick = (e) => {
            const ripple = rippleRef.current;
            if (!ripple) return;
            gsap.set(ripple, { x: e.clientX, y: e.clientY, scale: 0, opacity: 0.8 });
            gsap.to(ripple, {
                scale: 3.5,
                opacity: 0,
                duration: 0.55,
                ease: 'power2.out',
            });
        };
        window.addEventListener('click', handleClick);

        // Context-aware hover states
        const setHover = () => setCursorState('hover');
        const setDefault = () => setCursorState('default');

        const interactiveEls = document.querySelectorAll('a, button, .interactive-hover, [role="button"]');

        interactiveEls.forEach(el => {
            el.addEventListener('mouseenter', setHover);
            el.addEventListener('mouseleave', setDefault);
        });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('click', handleClick);
            interactiveEls.forEach(el => {
                el.removeEventListener('mouseenter', setHover);
                el.removeEventListener('mouseleave', setDefault);
            });
            document.body.style.cursor = 'auto';
        };
    }, []);

    // Animate ring based on state
    useEffect(() => {
        const ring = ringRef.current;
        const label = labelRef.current;
        if (!ring || !label) return;

        if (cursorState === 'hover') {
            gsap.to(ring, { width: 70, height: 70, borderColor: 'rgba(249,115,22,1)', opacity: 1, duration: 0.35, ease: 'power3.out' });
            gsap.to(dotRef.current, { scale: 0.5, background: 'rgba(249,115,22,1)', duration: 0.25 });
            gsap.to(label, { opacity: 1, scale: 1.2, duration: 0.3, ease: 'back.out(1.7)' });
        } else {
            gsap.to(ring, { width: 48, height: 48, borderRadius: 50, borderColor: 'rgba(249,115,22,0.6)', opacity: 0.8, duration: 0.35, ease: 'power3.out' });
            gsap.to(dotRef.current, { scale: 1, background: 'rgb(249,115,22)', duration: 0.25 });
            gsap.to(label, { opacity: 0, scale: 0.8, duration: 0.2 });
        }
    }, [cursorState]);

    return (
        <div className="hidden md:block pointer-events-none">
            {/* Layer 3: Aura blob — shrunk down */}
            <div
                ref={auraRef}
                className="fixed top-0 left-0 w-[40px] h-[40px] bg-accent/25 rounded-full blur-[12px] pointer-events-none z-[9990] -translate-x-1/2 -translate-y-1/2 transform-gpu mix-blend-screen will-change-transform"
            />

            {/* Layer 2: Outer ring */}
            <div
                ref={ringRef}
                className="fixed top-0 left-0 pointer-events-none z-[9996] -translate-x-1/2 -translate-y-1/2 transform-gpu will-change-transform flex items-center justify-center"
                style={{ width: 48, height: 48, borderRadius: '50%', border: '1.5px solid rgba(249,115,22,0.6)', opacity: 0.8 }}
            >
                {/* Hover label inside ring */}
                <span
                    ref={labelRef}
                    className="text-[6px] font-mono tracking-widest text-accent uppercase opacity-0 select-none scale-75"
                    style={{ whiteSpace: 'nowrap' }}
                >
                    VIEW
                </span>
            </div>

            {/* Layer 1: Inner dot — Massive bright dot (~3x original size) */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-[20px] h-[20px] pointer-events-none z-[9997] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform transform-gpu shadow-[inset_0_0_8px_rgba(255,255,255,0.6),0_0_15px_rgba(249,115,22,0.4)]"
                style={{ background: 'rgb(249,115,22)' }}
            />

            {/* Click ripple */}
            <div
                ref={rippleRef}
                className="fixed top-0 left-0 w-[28px] h-[28px] pointer-events-none z-[9995] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/70 will-change-transform"
                style={{ opacity: 0 }}
            />
        </div>
    );
};

export const MagneticButton = ({ children, className, onClick, href, ...props }) => {
    const buttonRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const xTo = gsap.quickTo(button, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
        const yTo = gsap.quickTo(button, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

        const txTo = gsap.quickTo(textRef.current, 'x', { duration: 1, ease: 'elastic.out(1, 0.3)' });
        const tyTo = gsap.quickTo(textRef.current, 'y', { duration: 1, ease: 'elastic.out(1, 0.3)' });

        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const { height, width, left, top } = button.getBoundingClientRect();

            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);

            xTo(x * 0.4);
            yTo(y * 0.4);
            txTo(x * 0.15);
            tyTo(y * 0.15);
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
            txTo(0);
            yTo(0);
        };

        button.addEventListener('mousemove', handleMouseMove);
        button.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            button.removeEventListener('mousemove', handleMouseMove);
            button.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const Tag = href ? 'a' : 'button';

    return (
        <Tag
            ref={buttonRef}
            className={className}
            onClick={onClick}
            href={href}
            {...props}
        >
            <span ref={textRef} className="block pointer-events-none">
                {children}
            </span>
        </Tag>
    );
};
