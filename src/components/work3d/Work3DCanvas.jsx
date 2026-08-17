import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PeerBrosEngine from './PeerBrosEngine';

gsap.registerPlugin(ScrollTrigger);

const SceneController = ({ containerRef }) => {
  const { camera, scene } = useThree();
  const engineRef = useRef(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    
    // Find the engine group in the scene
    const engine = scene.getObjectByName('peerbros-engine');
    if (!engine) return;

    // Get the shards
    const shards = [];
    for (let i = 0; i < 6; i++) {
      const shard = engine.getObjectByName(`shard-${i}`);
      if (shard) shards.push(shard);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1, // Smooth scrubbing
        }
      });

      // 0-15%: Explode the shards outward
      tl.to(shards.map(s => s.position), {
        x: (i) => shards[i].position.x * 2.5,
        y: (i) => shards[i].position.y * 2.5,
        z: (i) => shards[i].position.z * 2.5,
        duration: 1,
        ease: 'power2.inOut',
      }, 0);

      // 15-90%: Camera pan around the explosion
      // The timeline total duration is arbitrary, we map it to ScrollTrigger.
      tl.to(camera.position, {
        x: 10,
        z: -10,
        y: 2,
        duration: 2,
        ease: 'none',
      }, 1);

      tl.to(camera.position, {
        x: -10,
        z: -10,
        y: -2,
        duration: 2,
        ease: 'none',
      }, 3);

      tl.to(camera.position, {
        x: -10,
        z: 10,
        y: 2,
        duration: 2,
        ease: 'none',
      }, 5);

      // Make camera always look at the center
      tl.to({}, {
        duration: 7,
        onUpdate: () => {
          camera.lookAt(0, 0, 0);
        }
      }, 0);

    }, containerRef);

    return () => ctx.revert();
  }, [camera, scene, containerRef]);

  return <PeerBrosEngine />;
};

const Work3DCanvas = ({ containerRef }) => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none bg-background">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={Math.min(2, window.devicePixelRatio || 1)}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#050508']} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <SceneController containerRef={containerRef} />
        
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default Work3DCanvas;
