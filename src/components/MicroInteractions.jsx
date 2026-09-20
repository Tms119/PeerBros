import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor = () => {
    const dotRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        document.body.style.cursor = 'none';

        const dot = dotRef.current;

        // Completely disable on touch devices
        const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth < 768;
        if (isTouchDevice || !dot) return;

        // Ultra-fast instant snap, near-zero duration
        const dotXTo = gsap.quickTo(dot, 'x', { duration: 0.02, ease: 'none' });
        const dotYTo = gsap.quickTo(dot, 'y', { duration: 0.02, ease: 'none' });

        const moveCursor = (e) => {
            dotXTo(e.clientX);
            dotYTo(e.clientY);
        };

        window.addEventListener('mousemove', moveCursor);

        // Context-aware hover states
        const setHover = () => setIsHovering(true);
        const setDefault = () => setIsHovering(false);

        const interactiveEls = document.querySelectorAll('a, button, .interactive-hover, [role="button"]');

        interactiveEls.forEach(el => {
            el.addEventListener('mouseenter', setHover);
            el.addEventListener('mouseleave', setDefault);
        });

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            interactiveEls.forEach(el => {
                el.removeEventListener('mouseenter', setHover);
                el.removeEventListener('mouseleave', setDefault);
            });
            document.body.style.cursor = 'auto';
        };
    }, []);

    // Animate scale gently on hover
    useEffect(() => {
        if (!dotRef.current) return;
        if (isHovering) {
            gsap.to(dotRef.current, { scale: 2.5, opacity: 0.7, duration: 0.15, ease: 'power2.out' });
        } else {
            gsap.to(dotRef.current, { scale: 1, opacity: 1, duration: 0.15, ease: 'power2.out' });
        }
    }, [isHovering]);

    return (
        <div className="hidden md:block pointer-events-none">
            {/* Minimalist 4px Dot */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-1 h-1 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full will-change-transform transform-gpu"
                style={{ background: 'rgb(249,115,22)' }}
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
