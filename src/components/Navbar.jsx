import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const navRef = useRef(null);
    const menuRef = useRef(null);
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
            // Open animation
            gsap.to(menuRef.current, {
                x: '0%',
                duration: 0.6,
                ease: 'power3.inOut'
            });
            // Staggered stagger in links
            gsap.fromTo('.mobile-link',
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
            );
            // Prevent scrolling on body when menu is open
            document.body.style.overflow = 'hidden';
        } else {
            // Close animation
            gsap.to(menuRef.current, {
                x: '100%',
                duration: 0.5,
                ease: 'power3.in'
            });
            // Re-enable scrolling
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const handleLinkClick = () => {
        setIsMenuOpen(false);
    };

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
                    <button className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-accent transition-colors font-semibold">
                        Book a Call
                    </button>
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

            {/* Mobile Menu Overlay */}
            <div
                ref={menuRef}
                className="fixed inset-0 bg-obsidian z-[50] flex flex-col items-center justify-center transform translate-x-full border-l border-white/10"
            >
                <div className="flex flex-col items-center gap-6 w-full px-8 max-w-sm">
                    <span className="text-accent font-mono uppercase tracking-[0.5em] text-xs mb-4">Navigation</span>
                    <a href="#services" onClick={handleLinkClick} className="mobile-link text-5xl font-display font-medium text-white hover:text-accent transition-colors w-full text-center py-6 border-b border-white/[0.05]">Services</a>
                    <a href="#automation" onClick={handleLinkClick} className="mobile-link text-5xl font-display font-medium text-white hover:text-accent transition-colors w-full text-center py-6 border-b border-white/[0.05]">Portfolio</a>
                    <a href="#team" onClick={handleLinkClick} className="mobile-link text-5xl font-display font-medium text-white hover:text-accent transition-colors w-full text-center py-6 mb-8">Team</a>
                    <div className="mobile-link w-full">
                        <button className="w-full py-5 rounded-full bg-white text-black font-bold text-xl hover:bg-accent hover:text-white transition-colors duration-300 shadow-[0_0_30px_rgba(255,255,255,0.1)]" onClick={handleLinkClick}>
                            Book a Call
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
