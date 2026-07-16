import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Flower } from './Flower';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

export const FlowerScene: React.FC = () => {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace
      }}
      camera={{ position: [0, 0, 5.5], fov: 35 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#000000']} />
      
      {/* Lighting for the iridescent effect */}
      <ambientLight intensity={0.5} />
      <Environment preset="studio" />
      
      {/* 12-point procedural flower */}
      <Flower />

      {/* Subtle bloom to enhance the emissive base and highlights */}
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.9} 
          mipmapBlur 
          intensity={0.25} 
          radius={0.3} 
        />
      </EffectComposer>

      {/* Interactive Rotation (No panning/zooming) */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        makeDefault
      />
    </Canvas>
  );
};
