import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

export const CustomCursor = () => {
    const cursorRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        // Hide default cursor across body
        document.body.style.cursor = 'none';

        // Desktop only tracking
        let xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power3.out" });
        let yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power3.out" });

        const moveCursor = (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        };

        window.addEventListener("mousemove", moveCursor);

        // Hover state tracking
        const interactiveElements = document.querySelectorAll('a, button, .interactive-hover');

        const handleHoverIn = () => setIsHovering(true);
        const handleHoverOut = () => setIsHovering(false);

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', handleHoverIn);
            el.addEventListener('mouseleave', handleHoverOut);
        });

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            interactiveElements.forEach(el => {
                el.removeEventListener('mouseenter', handleHoverIn);
                el.removeEventListener('mouseleave', handleHoverOut);
            });
            document.body.style.cursor = 'auto';
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className={`fixed top-0 left-0 w-3 h-3 bg-white rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transform-gpu transition-all duration-300 ease-out mix-blend-difference hidden md:block
            ${isHovering ? 'scale-[4] bg-white opacity-100' : 'scale-100 opacity-60'}`}
        />
    );
};

export const MagneticButton = ({ children, className, onClick, ...props }) => {
    const buttonRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const button = buttonRef.current;
        if (!button) return;

        const xTo = gsap.quickTo(button, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(button, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        const txTo = gsap.quickTo(textRef.current, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const tyTo = gsap.quickTo(textRef.current, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

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
            tyTo(0);
        };

        button.addEventListener("mousemove", handleMouseMove);
        button.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            button.removeEventListener("mousemove", handleMouseMove);
            button.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <button
            ref={buttonRef}
            className={className}
            onClick={onClick}
            {...props}
        >
            <span ref={textRef} className="block pointer-events-none">
                {children}
            </span>
        </button>
    );
};
