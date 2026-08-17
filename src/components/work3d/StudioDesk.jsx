import React from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';

export default function StudioDesk() {
  return (
    <mesh position={[0, -1.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={60}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#080808"
        metalness={0.5}
      />
    </mesh>
  );
}
