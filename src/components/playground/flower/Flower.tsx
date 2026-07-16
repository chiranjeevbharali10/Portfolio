import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ProceduralFlowerCurve } from './ProceduralFlowerGeometry';
import { FlowerMaterial } from './FlowerMaterial';

export const Flower: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    // Parameters: scale, number of petals, wave depth
    const curve = new ProceduralFlowerCurve(1.1, 12, 0.2);
    
    // Tube parameters: path, tubularSegments, radius, radialSegments, closed
    // 256 segments for perfectly smooth outer curves, 64 radial for perfect roundness
    return new THREE.TubeGeometry(curve, 256, 0.12, 64, true);
  }, []);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      // Flat circular rotation around the Z axis (facing the camera)
      meshRef.current.rotation.z -= delta * 0.3;
      
      // Ensure it stays perfectly flat
      meshRef.current.rotation.x = 0;
      meshRef.current.rotation.y = 0;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <FlowerMaterial />
    </mesh>
  );
};
