import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import InteractiveCity from './InteractiveCity';

const Work3DCanvas = ({ ready }) => {
  const [dpr, setDpr] = useState(1);

  // Performance engineering: cap DPR on mobile
  useEffect(() => {
    const checkDpr = () => {
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      // Cap at 1 on mobile for performance, up to 1.5 on desktop
      setDpr(isMobile ? 1 : Math.min(1.5, window.devicePixelRatio));
    };
    checkDpr();
    window.addEventListener('resize', checkDpr);
    return () => window.removeEventListener('resize', checkDpr);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-[#050508] transition-opacity duration-1000" style={{ opacity: ready ? 1 : 0 }}>
      <Canvas
        camera={{ position: [0, 2, 10], fov: 60 }}
        dpr={dpr}
        gl={{ 
          powerPreference: 'high-performance',
          antialias: false, // Turn off for performance, we use post-processing or none on mobile
          stencil: false,
          depth: true
        }}
      >
        <Suspense fallback={null}>
          <InteractiveCity />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Work3DCanvas;
