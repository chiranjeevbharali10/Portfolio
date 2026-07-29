import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface VinylSleeveProps {
  index: number;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const VinylSleeve: React.FC<VinylSleeveProps> = ({ index, activeIndex, setActiveIndex }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  
  // Calculate relative position to the currently focused canvas
  const diff = index - activeIndex;

  // ==========================================
  // 1. MANUAL POSITION TUNING
  // Adjust x, y, z to move the cards around
  // ==========================================
  const defaultPos = useMemo(() => {
    if (diff === 0) return new THREE.Vector3(-0.5, 0, 2);   // HERO (Front)
    if (diff === 1) return new THREE.Vector3(3.2, 0.2, 0);  // NEXT (Right)
    if (diff === 2) return new THREE.Vector3(6.5, 0.4, -2); // FAR NEXT (Right)
    if (diff === -1) return new THREE.Vector3(-4.2, 0.2, 0); // PREV (Left)
    if (diff === -2) return new THREE.Vector3(-7.5, 0.4, -2); // FAR PREV (Left)
    return new THREE.Vector3(0, 0, 0);
  }, [diff]);

  // ==========================================
  // 2. MANUAL ROTATION TUNING
  // Adjust x, y, z (in radians) to tilt the cards
  // ==========================================
  const defaultRot = useMemo(() => {
    if (diff === 0) return new THREE.Euler(0, 0, 0);
    if (diff === 1) return new THREE.Euler(-0.05, -0.3, 0.05); // Tilt left
    if (diff === 2) return new THREE.Euler(-0.1, -0.5, 0.1);
    if (diff === -1) return new THREE.Euler(-0.05, 0.3, -0.05); // Tilt right
    if (diff === -2) return new THREE.Euler(-0.1, 0.5, -0.1);
    return new THREE.Euler(0, 0, 0);
  }, [diff]);

  // ==========================================
  // 3. MANUAL SIZE/SCALE TUNING
  // Change these numbers to make the cards bigger or smaller!
  // ==========================================
  const defaultScale = useMemo(() => {
    if (diff === 0) return 1.3;  // Hero size
    if (Math.abs(diff) === 1) return 0.9;  // Adjacent cards size
    if (Math.abs(diff) === 2) return 0.65; // Far adjacent cards size
    return 0.1;
  }, [diff]);

  useEffect(() => {
    document.body.style.cursor = hovered ? (isDragging ? 'grabbing' : 'pointer') : 'auto';
  }, [hovered, isDragging]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smoothly animate scale when focus changes
    meshRef.current.scale.lerp(new THREE.Vector3(defaultScale, defaultScale, defaultScale), 5 * delta);

    if (!isDragging) {
      // Spring back to default position dynamically
      meshRef.current.position.lerp(defaultPos, 6 * delta);
      
      // Extremely subtle ambient floating
      const t = state.clock.elapsedTime;
      const floatY = defaultPos.y + Math.sin(t * 1.5 + index * 2) * 0.08;
      const floatRotZ = defaultRot.z + Math.sin(t * 1.2 + index * 1.5) * 0.02;
      
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, floatY, 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, floatRotZ, 0.1);
      
      // Spring back rotation
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, defaultRot.x, 5 * delta);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, defaultRot.y, 5 * delta);
      
    } else {
      // Dragging logic: map pointer strictly to world space
      // We dampen it slightly so it feels like moving through thick water
      const targetX = (state.pointer.x * state.viewport.width) / 2;
      const targetY = (state.pointer.y * state.viewport.height) / 2;
      
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.2);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.2);
      
      // Add a dynamic 3D tilt based on where you are dragging it
      const targetRotX = (state.pointer.y * 0.5);
      const targetRotY = (state.pointer.x * 0.5);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotX, 10 * delta);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, 10 * delta);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
       (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setActiveIndex(index);
  };

  // Give them vibrant placeholder colors to mimic the reference image until textures arrive
  const placeholderColors = ["#89D84D", "#EBBF3D", "#C8B1C8"];

  return (
    <mesh 
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOut={(e) => { setHovered(false); handlePointerUp(e); }}
      onPointerOver={() => setHovered(true)}
      onClick={handleClick}
      position={defaultPos}
      rotation={defaultRot}
    >
      <planeGeometry args={[4, 4]} />
      <meshBasicMaterial color={placeholderColors[index]} side={THREE.DoubleSide} />
    </mesh>
  );
};

export const ArtworksCanvas: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 45 }}
        className="pointer-events-auto"
      >
        {/* Render exactly 3 items as requested */}
        {[0, 1, 2].map((i) => (
          <VinylSleeve 
            key={i} 
            index={i} 
            activeIndex={activeIndex}
            setActiveIndex={setActiveIndex}
          />
        ))}
      </Canvas>
    </div>
  );
};
