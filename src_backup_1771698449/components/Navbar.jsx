import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const navRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(navRef.current,
            { y: -100, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power3.out', delay: 0.5 }
        );
    }, []);

    return (
        <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center mix-blend-difference">
            <a href="#home" className="text-2xl font-display font-bold tracking-tighter text-white hover:text-white/80 transition-colors">
                PEER<span className="text-accent">BROS</span>
            </a>

            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-white/70">
                <a href="#services" className="hover:text-accent transition-colors">Services</a>
                <a href="#automation" className="hover:text-accent transition-colors">Portfolio</a>
                <a href="#team" className="hover:text-accent transition-colors">Team</a>
                <button className="px-5 py-2.5 rounded-full bg-white text-black hover:bg-accent transition-colors font-semibold">
                    Book a Call
                </button>
            </div>

            <button className="md:hidden text-white">
                <Menu size={24} />
            </button>
        </nav>
    );
};

export default Navbar;
