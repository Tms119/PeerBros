import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const navRef = useRef(null);
    const menuRef = useRef(null);
    const linkRefs = useRef([]);  // Direct refs — no DOM query
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Initial Navbar animation
    useEffect(() => {
        gsap.fromTo(navRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
        );
    }, []);

    // Mobile menu toggle animation
    useEffect(() => {
        if (!menuRef.current) return;

        if (isMenuOpen) {
            // Single timeline — links start only AFTER panel lands
            const tl = gsap.timeline();

            tl.to(menuRef.current, {
                x: '0%',
                duration: 0.45,          // Faster panel slide
                ease: 'power3.out',       // Ease-out feels snappier (no inOut cost)
            })
            .fromTo(linkRefs.current.filter(Boolean),
                { y: 30, opacity: 0 },   // Smaller y distance = less paint
                { y: 0, opacity: 1, duration: 0.35, stagger: 0.07, ease: 'power2.out' },
                '-=0.05'                  // Tiny overlap, not full parallel
            );

            document.body.style.overflow = 'hidden';
        } else {
            // Kill any running animation first to avoid conflict
            gsap.killTweensOf(menuRef.current);
            gsap.killTweensOf(linkRefs.current);

            // Reset links instantly, slide panel out
            gsap.set(linkRefs.current.filter(Boolean), { opacity: 0, y: 30 });
            gsap.to(menuRef.current, {
                x: '100%',
                duration: 0.35,
                ease: 'power3.in'
            });

            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const handleLinkClick = () => setIsMenuOpen(false);

    return (
        <>
            <nav ref={navRef} className="fixed top-0 left-0 right-0 z-[60] px-6 py-4 flex justify-between items-center md:mix-blend-difference bg-gradient-to-b from-black/80 to-transparent">
                <a href="#home" className="text-2xl font-display font-bold tracking-tighter text-white hover:text-white/80 transition-colors z-[70] relative">
                    PEER<span className="text-accent">BROS</span>
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/70">
                    <a href="#services" className="hover:text-accent transition-colors">Services</a>
                    <a href="#automation" className="hover:text-accent transition-colors">Portfolio</a>
                    <a href="#team" className="hover:text-accent transition-colors">Team</a>
                    <a href="mailto:peerbros.official@gmail.com" className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-accent transition-colors font-semibold">
                        Book a Call
                    </a>
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    className="md:hidden text-white z-[70] p-3 relative flex items-center justify-center rounded-full bg-black/80 border border-white/10"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={24} className="text-accent" /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay
                - will-change-transform: GPU layer promoted BEFORE animation
                - transform-gpu: forces hardware acceleration
                - No CSS transition-colors on links (conflicts with GSAP)
            */}
            <div
                ref={menuRef}
                className="fixed inset-0 bg-obsidian z-[50] flex flex-col items-center justify-center border-l border-white/10 will-change-transform transform-gpu"
                style={{ transform: 'translateX(100%)' }}
            >
                <div className="flex flex-col items-center gap-6 w-full px-8 max-w-sm">
                    <span className="text-accent font-mono uppercase tracking-[0.5em] text-xs mb-4">Navigation</span>

                    {/* Direct refs on each link — no global DOM query */}
                    <a
                        href="#services"
                        ref={el => linkRefs.current[0] = el}
                        onClick={handleLinkClick}
                        className="text-5xl font-display font-medium text-white w-full text-center py-6 border-b border-white/[0.05] opacity-0"
                    >Services</a>

                    <a
                        href="#automation"
                        ref={el => linkRefs.current[1] = el}
                        onClick={handleLinkClick}
                        className="text-5xl font-display font-medium text-white w-full text-center py-6 border-b border-white/[0.05] opacity-0"
                    >Portfolio</a>

                    <a
                        href="#team"
                        ref={el => linkRefs.current[2] = el}
                        onClick={handleLinkClick}
                        className="text-5xl font-display font-medium text-white w-full text-center py-6 mb-8 opacity-0"
                    >Team</a>

                    <div ref={el => linkRefs.current[3] = el} className="w-full opacity-0">
                        <a
                            href="mailto:peerbros.official@gmail.com"
                            className="block w-full py-5 rounded-full bg-white text-black font-bold text-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] text-center"
                            onClick={handleLinkClick}
                        >
                            Book a Call
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
