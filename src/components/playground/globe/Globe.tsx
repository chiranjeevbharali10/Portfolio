import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitRing } from './OrbitRing';
import { CenterCrystal } from './CenterCrystal';

export interface GlobeProps {
  ringCount?: number; 
  bloomIntensity?: number;
  ringScale?: number;
  ringThickness?: number;
  centerScale?: [number, number, number];
  glowStrength?: number;
}

export const Globe: React.FC<GlobeProps> = ({
  ringScale = 1.3,
  ringThickness = 0.035,
  centerScale = [0.3, 0.3, 0.3]
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      // Extremely subtle floating motion
      groupRef.current.position.y = Math.sin(time) * 0.03;
      // Almost invisible rotational breathing to make it feel alive
      groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.02;
      groupRef.current.rotation.z = Math.cos(time * 0.3) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <CenterCrystal scale={centerScale} />
      
      {/* 4 Perfect Intersecting Rings forming a symmetrical globe structure */}
      <OrbitRing rotation={[0, 0, 0]} radius={ringScale} tube={ringThickness} />
      <OrbitRing rotation={[Math.PI / 2, 0, 0]} radius={ringScale} tube={ringThickness} />
      <OrbitRing rotation={[0, Math.PI / 4, 0]} radius={ringScale} tube={ringThickness} />
      <OrbitRing rotation={[0, -Math.PI / 4, 0]} radius={ringScale} tube={ringThickness} />
    </group>
  );
};
