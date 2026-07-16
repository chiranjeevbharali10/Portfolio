import React, { useMemo } from 'react';
import * as THREE from 'three';
import { CrystalMaterial } from './CrystalMaterial';

export interface CenterCrystalProps {
  scale?: [number, number, number];
}

export const CenterCrystal: React.FC<CenterCrystalProps> = ({ scale = [0.35, 0.35, 0.35] }) => {
  const geometry = useMemo(() => {
    // Start with a high-resolution sphere
    const geo = new THREE.SphereGeometry(1, 128, 128);
    const pos = geo.attributes.position;
    
    // Deform the sphere into a smooth 3D pinched star (Astroid-like surface)
    const p = 0.65; // Pinch factor (1.0 = Octahedron, 2.0 = Sphere, <1.0 = Pinched Star)
    
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      
      // Calculate the scale factor to map the point onto the |x|^p + |y|^p + |z|^p = 1 surface
      const sum = Math.pow(Math.abs(x), p) + Math.pow(Math.abs(y), p) + Math.pow(Math.abs(z), p);
      const S = Math.pow(1.0 / sum, 1.0 / p);
      
      // Mix slightly with the original sphere to keep it somewhat cushion-like and avoid infinitely sharp points
      const finalS = THREE.MathUtils.lerp(1.0, S, 0.9);
      
      pos.setXYZ(i, x * finalS, y * finalS, z * finalS);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} scale={scale}>
      <CrystalMaterial />
    </mesh>
  );
};
