import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const WorkLoadingScreen = ({ onComplete }) => {
  const overlayRef = useRef(null);
  const topRef = useRef(null);
  const bottomRef = useRef(null);
  const logoRef = useRef(null);
  const barFillRef = useRef(null);
  const counterRef = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.1 });

    // 1. Logo draws in
    tl.fromTo(
      logoRef.current,
      { opacity: 0, y: 20, letterSpacing: '0.5em' },
      { opacity: 1, y: 0, letterSpacing: '0.2em', duration: 0.6, ease: 'power3.out' }
    );

    // 2. Loading bar fills
    tl.to(barFillRef.current, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, '-=0.2');

    // 3. Counter counts to 100
    const obj = { val: 0 };
    tl.to(
      obj,
      {
        val: 100,
        duration: 0.9,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (counterRef.current) counterRef.current.textContent = `${Math.round(obj.val)}%`;
        },
      },
      '<'
    );

    // 4. Brief hold
    tl.to({}, { duration: 0.2 });

    // 5. Logo fades
    tl.to([logoRef.current, barFillRef.current, counterRef.current], {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });

    // 6. Screen splits — top slides up, bottom slides down
    tl.to(
      topRef.current,
      { yPercent: -100, duration: 0.7, ease: 'power4.inOut' },
      '-=0.1'
    );
    tl.to(
      bottomRef.current,
      { yPercent: 100, duration: 0.7, ease: 'power4.inOut' },
      '<'
    );

    // 7. Cleanup
    tl.call(() => {
      setVisible(false);
      if (onComplete) onComplete();
    });
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Top half */}
      <div
        ref={topRef}
        className="absolute top-0 left-0 w-full h-1/2 bg-[#050508] flex items-end justify-center pb-8 will-change-transform"
      />

      {/* Bottom half */}
      <div
        ref={bottomRef}
        className="absolute bottom-0 left-0 w-full h-1/2 bg-[#050508] flex items-start justify-center pt-8 will-change-transform"
      />

      {/* Centered overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10">
        {/* Logo */}
        <div
          ref={logoRef}
          className="font-display font-bold text-white text-2xl sm:text-3xl tracking-[0.2em] opacity-0 uppercase"
          style={{ letterSpacing: '0.2em' }}
        >
          PEER<span className="text-accent">BROS</span>
          <span className="text-white/30 font-mono font-light text-base ml-3 tracking-widest">/ WORK</span>
        </div>

        {/* Loading bar */}
        <div className="w-48 sm:w-64 h-px bg-white/10 relative overflow-hidden rounded-full">
          <div
            ref={barFillRef}
            className="absolute inset-0 bg-accent origin-left rounded-full"
            style={{ transform: 'scaleX(0)' }}
          />
        </div>

        {/* Counter */}
        <div
          ref={counterRef}
          className="font-mono text-white/40 text-xs tracking-widest"
        >
          0%
        </div>
      </div>
    </div>
  );
};

export default WorkLoadingScreen;
