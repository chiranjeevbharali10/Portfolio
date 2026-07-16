import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface OrbitRingProps {
  rotation: [number, number, number];
  radius?: number;
  tube?: number;
}

export const OrbitRing: React.FC<OrbitRingProps> = ({ 
  rotation, 
  radius = 1.4, 
  tube = 0.035
}) => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 4;
    const ctx = canvas.getContext('2d')!;
    
    // Green -> Cyan -> Magenta -> Green
    const gradient = ctx.createLinearGradient(0, 0, 1024, 0);
    gradient.addColorStop(0, '#00ff44'); // Neon Green
    gradient.addColorStop(0.33, '#00ffff'); // Cyan
    gradient.addColorStop(0.66, '#ff00ff'); // Magenta
    gradient.addColorStop(1, '#00ff44'); // Neon Green
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 4);
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  useFrame((_, delta) => {
    // Smoothly animate the gradient flow along the ring
    texture.offset.x -= delta * 0.15;
  });

  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, tube, 64, 256]} />
      <meshPhysicalMaterial 
        map={texture}
        emissiveMap={texture}
        emissive={new THREE.Color(0xffffff)}
        emissiveIntensity={1.2} // Subtle bloom trigger
        roughness={0.05} // Premium glossy finish
        metalness={0.3}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
      />
    </mesh>
  );
};
