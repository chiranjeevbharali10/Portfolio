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
  const dragStartX = useRef<number | null>(null);
  
  // Calculate relative position to the currently focused canvas
  const diff = index - activeIndex;

  // ==========================================
  // 1. MANUAL POSITION TUNING (Tighter transitions)
  // ==========================================
  const defaultPos = useMemo(() => {
    if (diff === 0) return new THREE.Vector3(0, 0, 2);         // HERO (Centered)
    if (diff === 1) return new THREE.Vector3(3.5, 0.1, 0.5);   // NEXT (Right)
    if (diff === 2) return new THREE.Vector3(8.0, 0.2, -1.5);  // FAR NEXT (Pushed out of screen)
    if (diff === -1) return new THREE.Vector3(-3.5, 0.1, 0.5); // PREV (Left)
    if (diff === -2) return new THREE.Vector3(-8.0, 0.2, -1.5); // FAR PREV
    return new THREE.Vector3(0, 0, 0);
  }, [diff]);

  // ==========================================
  // 2. MANUAL ROTATION TUNING
  // ==========================================
  const defaultRot = useMemo(() => {
    if (diff === 0) return new THREE.Euler(0, 0, 0);
    if (diff === 1) return new THREE.Euler(0, 0.5, -0.05); // Tilt right side into the screen
    if (diff === 2) return new THREE.Euler(0, 0.8, -0.1);   // Tilt even more
    if (diff === -1) return new THREE.Euler(0, -0.5, 0.05); // Tilt left side into the screen
    if (diff === -2) return new THREE.Euler(0, -0.8, 0.1);
    return new THREE.Euler(0, 0, 0);
  }, [diff]);

  // ==========================================
  // 3. MANUAL SIZE/SCALE TUNING (Smaller cards)
  // ==========================================
  const defaultScale = useMemo(() => {
    if (diff === 0) return 0.9;  // Hero size (Made smaller)
    if (Math.abs(diff) === 1) return 0.6;   // Adjacent cards size
    if (Math.abs(diff) === 2) return 0.4;  // Far adjacent cards size
    return 0.1;
  }, [diff]);

  // ==========================================
  // 4. MANUAL OPACITY TUNING
  // ==========================================
  const defaultOpacity = useMemo(() => {
    if (diff === 0) return 1.0;    // Hero fully opaque
    if (Math.abs(diff) === 1) return 0.6;  // Adjacent semi-transparent
    if (Math.abs(diff) === 2) return 0.2;  // Far adjacent almost invisible
    return 0.0;
  }, [diff]);

  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useEffect(() => {
    document.body.style.cursor = hovered ? (isDragging ? 'grabbing' : 'pointer') : 'auto';
  }, [hovered, isDragging]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smoothly animate scale when focus changes (slower lerp for softer movement)
    meshRef.current.scale.lerp(new THREE.Vector3(defaultScale, defaultScale, defaultScale), 3.5 * delta);

    if (materialRef.current) {
       // Smoothly animate opacity
       materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, defaultOpacity, 3.5 * delta);
    }

    if (!isDragging) {
      // Spring back to default position dynamically (slower lerp for softer movement)
      meshRef.current.position.lerp(defaultPos, 3.5 * delta);
      
      // Extremely subtle ambient floating
      const t = state.clock.elapsedTime;
      const floatY = defaultPos.y + Math.sin(t * 1.5 + index * 2) * 0.08;
      const floatRotZ = defaultRot.z + Math.sin(t * 1.2 + index * 1.5) * 0.02;
      
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, floatY, 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, floatRotZ, 0.1);
      
      // Spring back rotation (slower lerp for softer movement)
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, defaultRot.x, 3.5 * delta);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, defaultRot.y, 3.5 * delta);
      
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
    dragStartX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    
    // Implement swipe-to-navigate logic
    if (dragStartX.current !== null) {
      const deltaX = e.clientX - dragStartX.current;
      const swipeThreshold = 40; // Pixels required to trigger a swipe
      const maxIndex = 2; // Hardcoded to 3 items max right now
      
      if (deltaX > swipeThreshold) {
        // Dragged right -> Go to Previous
        setActiveIndex(Math.max(activeIndex - 1, 0));
      } else if (deltaX < -swipeThreshold) {
        // Dragged left -> Go to Next
        setActiveIndex(Math.min(activeIndex + 1, maxIndex));
      } else if (Math.abs(deltaX) < 10) {
        // Just a normal click without significant drag -> Focus this item
        setActiveIndex(index);
      }
      
      dragStartX.current = null;
    }

    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
       (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
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
      position={defaultPos}
      rotation={defaultRot}
    >
      <planeGeometry args={[4, 4]} />
      <meshBasicMaterial 
        ref={materialRef} 
        color={placeholderColors[index]} 
        side={THREE.DoubleSide} 
        transparent={true} 
        opacity={defaultOpacity} 
      />
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
