import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

const TestBox = () => {
    return (
        <mesh>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial color="hotpink" />
        </mesh>
    );
};

export const Test3D = () => {
    return (
        <div style={{ width: '100vw', height: '100vh', background: 'blue', position: 'fixed', zIndex: 99999 }}>
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={1} />
                <Environment preset="city" />
                <TestBox />
            </Canvas>
        </div>
    );
};
