import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Globe } from './Globe';
import { Lights } from './Lights';
import { Effects } from './Effects';

export const Scene: React.FC = () => {
  return (
    <Canvas
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping, 
        outputColorSpace: THREE.SRGBColorSpace 
      }}
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]} // High DPR for retina displays
    >
      <color attach="background" args={['#000000']} />
      
      <Lights />
      <Globe />
      <Effects />

      {/* OrbitControls handles auto-rotation, pauses on drag, and resumes smoothly on release */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        makeDefault
      />
    </Canvas>
  );
};
