import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface VinylSleeveProps {
  index: number;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

const ShineOverlay = ({ defaultOpacity }: { defaultOpacity: number }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.opacityMult.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.opacityMult.value,
        defaultOpacity,
        3.5 * delta
      );
    }
  });

  return (
    <mesh position={[0, 0, 0.01]}>
      <planeGeometry args={[4, 4]} />
      <shaderMaterial
        ref={materialRef}
        transparent={true}
        depthWrite={false}
        uniforms={{
          time: { value: 0 },
          opacityMult: { value: 0 }
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float time;
          uniform float opacityMult;
          varying vec2 vUv;
          void main() {
            // 8 second period
            float cycle = mod(time, 8.0) / 8.0; 
            
            // Sweep across from top-left to bottom-right
            float c = cycle * 3.0 - 0.5; 
            
            float dist = abs((vUv.x + vUv.y) - c);
            float shine = smoothstep(0.2, 0.0, dist); // width of the shine
            
            gl_FragColor = vec4(1.0, 1.0, 1.0, shine * 0.4 * opacityMult);
          }
        `}
      />
    </mesh>
  );
};

const VinylSleeve: React.FC<VinylSleeveProps> = ({ index, activeIndex, setActiveIndex }) => {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);
  const reflectionMatRef = useRef<THREE.MeshBasicMaterial>(null);
  
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);
  
  const diff = index - activeIndex;

  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (index === 0) {
      new THREE.TextureLoader().load('/frame1.png', (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      });
    }
  }, [index]);

  // ==========================================
  // 1. MANUAL POSITION TUNING
  // ==========================================
  const defaultPos = useMemo(() => {
    if (diff === 0) return new THREE.Vector3(0, 0, 2);         // HERO
    if (diff === 1) return new THREE.Vector3(3.5, 0.1, 0.5);   // NEXT
    if (diff === 2) return new THREE.Vector3(8.0, 0.2, -1.5);  // FAR NEXT
    if (diff >= 3) return new THREE.Vector3(12.0, 0.3, -3.0);  // OFF SCREEN NEXT
    if (diff === -1) return new THREE.Vector3(-3.5, 0.1, 0.5); // PREV
    if (diff === -2) return new THREE.Vector3(-8.0, 0.2, -1.5); // FAR PREV
    if (diff <= -3) return new THREE.Vector3(-12.0, 0.3, -3.0); // OFF SCREEN PREV
    return new THREE.Vector3(0, 0, 0);
  }, [diff]);

  // ==========================================
  // 2. MANUAL ROTATION TUNING
  // ==========================================
  const defaultRot = useMemo(() => {
    if (diff === 0) return new THREE.Euler(0, 0, 0);
    if (diff === 1) return new THREE.Euler(0, 0.5, -0.05);
    if (diff >= 2) return new THREE.Euler(0, 0.8, -0.1);
    if (diff === -1) return new THREE.Euler(0, -0.5, 0.05);
    if (diff <= -2) return new THREE.Euler(0, -0.8, 0.1);
    return new THREE.Euler(0, 0, 0);
  }, [diff]);

  // ==========================================
  // 3. MANUAL SIZE/SCALE TUNING
  // ==========================================
  const defaultScale = useMemo(() => {
    if (diff === 0) return 0.9;
    if (Math.abs(diff) === 1) return 0.6;
    if (Math.abs(diff) === 2) return 0.4;
    if (Math.abs(diff) >= 3) return 0.2;
    return 0.1;
  }, [diff]);

  // ==========================================
  // 4. MANUAL OPACITY TUNING
  // ==========================================
  const defaultOpacity = useMemo(() => {
    if (diff === 0) return 1.0;
    if (Math.abs(diff) === 1) return 0.6;
    if (Math.abs(diff) === 2) return 0.2;
    if (Math.abs(diff) >= 3) return 0.0;
    return 0.0;
  }, [diff]);

  useEffect(() => {
    document.body.style.cursor = hovered ? (isDragging ? 'grabbing' : 'pointer') : 'auto';
  }, [hovered, isDragging]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Smoothly animate scale when focus changes
    meshRef.current.scale.lerp(new THREE.Vector3(defaultScale, defaultScale, defaultScale), 3.5 * delta);

    if (materialRef.current) {
       materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, defaultOpacity, 3.5 * delta);
    }
    if (reflectionMatRef.current) {
       reflectionMatRef.current.opacity = THREE.MathUtils.lerp(reflectionMatRef.current.opacity, defaultOpacity * 0.15, 3.5 * delta);
    }

    if (!isDragging) {
      // Spring back to default position dynamically
      meshRef.current.position.lerp(defaultPos, 3.5 * delta);
      
      // Extremely subtle ambient floating
      const t = state.clock.elapsedTime;
      const floatY = defaultPos.y + Math.sin(t * 1.5 + index * 2) * 0.08;
      const floatRotZ = defaultRot.z + Math.sin(t * 1.2 + index * 1.5) * 0.02;
      
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, floatY, 0.1);
      meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, floatRotZ, 0.1);
      
      // Spring back rotation
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, defaultRot.x, 3.5 * delta);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, defaultRot.y, 3.5 * delta);
      
    } else {
      // Dragging logic
      const targetX = (state.pointer.x * state.viewport.width) / 2;
      const targetY = (state.pointer.y * state.viewport.height) / 2;
      
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.2);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.2);
      
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
    
    if (dragStartX.current !== null) {
      const deltaX = e.clientX - dragStartX.current;
      const swipeThreshold = 40;
      const maxIndex = 3; // Update to allow swiping to the 4th item
      
      if (deltaX > swipeThreshold) {
        setActiveIndex(Math.max(activeIndex - 1, 0));
      } else if (deltaX < -swipeThreshold) {
        setActiveIndex(Math.min(activeIndex + 1, maxIndex));
      } else if (Math.abs(deltaX) < 10) {
        setActiveIndex(index);
      }
      
      dragStartX.current = null;
    }

    if ((e.target as HTMLElement).hasPointerCapture(e.pointerId)) {
       (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const placeholderColors = ["#89D84D", "#EBBF3D", "#C8B1C8", "#51A3D8"]; // Added 4th color

  return (
    <group 
      ref={meshRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOut={(e) => { setHovered(false); handlePointerUp(e); }}
      onPointerOver={() => setHovered(true)}
      position={defaultPos}
      rotation={defaultRot}
    >
      {/* Main Artwork */}
      <mesh>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial 
          ref={materialRef} 
          map={index === 0 ? texture : null}
          color={index === 0 && texture ? "white" : placeholderColors[index]} 
          side={THREE.DoubleSide} 
          transparent={true} 
          opacity={defaultOpacity} 
        />
        {/* Shine Overlay */}
        <ShineOverlay defaultOpacity={defaultOpacity} />
      </mesh>

      {/* Water Reflection */}
      <mesh position={[0, -4.05, 0]} scale={[1, -1, 1]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial 
          ref={reflectionMatRef}
          map={index === 0 ? texture : null}
          color={index === 0 && texture ? "white" : placeholderColors[index]} 
          side={THREE.DoubleSide} 
          transparent={true} 
          opacity={defaultOpacity * 0.15} 
        />
        <ShineOverlay defaultOpacity={defaultOpacity * 0.15} />
      </mesh>
    </group>
  );
};

export const ArtworksCanvas: React.FC<{ activeIndex: number, setActiveIndex: (index: number) => void }> = ({ activeIndex, setActiveIndex }) => {
  return (
    <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
      <Canvas 
        camera={{ position: [0, 0, 10], fov: 45 }}
        className="pointer-events-auto"
      >
        {/* Render exactly 4 items now */}
        {[0, 1, 2, 3].map((i) => (
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
