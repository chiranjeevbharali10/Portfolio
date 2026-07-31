import React, { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function TempleModel({ templeGroupRef }: { templeGroupRef: React.RefObject<any> }) {
  // Load the GLTF model
  const { scene } = useGLTF('/3D_model/voxel temple 3d model.glb');
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
      <group ref={templeGroupRef}>
        <primitive
          object={scene}
          position={[0, 0, 0]}
        />
      </group>
    </Float>
  );
}

function CameraRig({ 
  containerRef,
  cameraRef,
  cameraGroupRef,
  templeGroupRef,
  dayAmbientRef,
  dayDir1Ref,
  dayDir2Ref,
  nightAmbientRef,
  nightDirRef,
  nightPointRef,
  fogRef
}: { 
  containerRef: React.RefObject<HTMLDivElement | null>;
  cameraRef: React.RefObject<any>;
  cameraGroupRef: React.RefObject<any>;
  templeGroupRef: React.RefObject<any>;
  dayAmbientRef: React.RefObject<any>;
  dayDir1Ref: React.RefObject<any>;
  dayDir2Ref: React.RefObject<any>;
  nightAmbientRef: React.RefObject<any>;
  nightDirRef: React.RefObject<any>;
  nightPointRef: React.RefObject<any>;
  fogRef: React.RefObject<any>;
}) {
  useGSAP(() => {
    if (!containerRef.current || !cameraRef.current || !cameraGroupRef.current || !templeGroupRef.current) return;

    const camera = cameraRef.current;
    const group = cameraGroupRef.current;
    const temple = templeGroupRef.current;
    
    // Set static positions/scales (First Frame values)
    group.position.set(6.2, -1.8, 0.2);
    temple.position.set(6.2, -1.8, 0.2);
    temple.scale.setScalar(6.3);

    // Explicitly set the initial state (Frame 1)
    const localCamX = 8.6 - 6.2;
    const localCamY = 5 - (-1.8);
    const localCamZ = 9.9 - 0.2;
    
    camera.position.set(localCamX, localCamY, localCamZ);
    group.rotation.set(0, 0, 0);
    temple.rotation.set(0.01, -0.2, 0.12);
    
    // CRITICAL: We must update the world matrix before calling lookAt, 
    // otherwise the camera calculates the angle using a stale (0,0,0) position!
    group.updateMatrixWorld(true);
    
    // Create a proxy object to smoothly transition the camera's focal point
    const lookAtTarget = new THREE.Vector3(0, 0, 0);
    camera.lookAt(lookAtTarget);
    camera.updateProjectionMatrix();

    // Cinematic Drone Orbit Timeline (Frame 1 to Frame 2)
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5, // Smooth interpolation
      }
    });

    // 1. Orbit to the exact specified end rotation
    tl.to(group.rotation, {
      y: -6.35,
      ease: 'power2.inOut',
    }, 0);

    // 2. Animate the camera's local position (zoom/height)
    tl.to(camera.position, {
      x: -1.9,
      y: 8,
      z: 12.4,
      ease: 'power2.inOut',
    }, 0);

    // 3. Animate the temple's rotation (Tilt/Lean)
    tl.to(temple.rotation, {
      x: -0.14,
      y: -0.39,
      z: 0.01,
      ease: 'power2.inOut',
    }, 0);

    // 4. Pan the camera's focus to exactly center the island on the screen
    tl.to(lookAtTarget, {
      x: 5,
      y: 2, 
      z: 1,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(lookAtTarget);
        camera.updateProjectionMatrix();
      }
    }, 0);
    
    // 5. Crossfade Lights
    tl.to([dayAmbientRef.current, dayDir1Ref.current, dayDir2Ref.current], { 
      intensity: 0, 
      ease: 'power2.inOut' 
    }, 0);
    
    tl.to(nightAmbientRef.current, { intensity: 0.35, ease: 'power2.inOut' }, 0);
    tl.to(nightDirRef.current, { intensity: 1.5, ease: 'power2.inOut' }, 0);
    tl.to(nightPointRef.current, { intensity: 4, ease: 'power2.inOut' }, 0);
    
    // 6. Bring in the fog
    if (fogRef.current) {
      tl.to(fogRef.current, { near: 20, far: 80, ease: 'power2.inOut' }, 0);
    }
    
  }, { dependencies: [containerRef, cameraRef, cameraGroupRef, templeGroupRef], scope: containerRef });

  return null;
}

// Preload the model
useGLTF.preload('/3D_model/voxel temple 3d model.glb');

export const Island6Page: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<any>(null);
  const cameraGroupRef = useRef<any>(null);
  const templeGroupRef = useRef<any>(null);

  const dayAmbientRef = useRef<any>(null);
  const dayDir1Ref = useRef<any>(null);
  const dayDir2Ref = useRef<any>(null);
  
  const nightAmbientRef = useRef<any>(null);
  const nightDirRef = useRef<any>(null);
  const nightPointRef = useRef<any>(null);
  const fogRef = useRef<any>(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    // Animate the custom CSS variables for the color grading out, and text to white
    gsap.fromTo(containerRef.current, {
      '--effect-opacity': 1,
      '--shadow-opacity': 0.35,
      '--hero-contrast': 1.15,
      '--hero-saturate': 1.2,
      '--hero-brightness': 1.05,
      '--model-saturate': 1.3,
      color: '#000000',
      backgroundColor: '#000000',
    }, {
      '--effect-opacity': 0,
      '--shadow-opacity': 0,
      '--hero-contrast': 1,
      '--hero-saturate': 1,
      '--hero-brightness': 1,
      '--model-saturate': 1,
      color: '#ffffff',
      backgroundColor: '#15102d',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      }
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full h-[500vh] bg-black font-kefir selection:bg-black selection:text-white">
      {/* Fixed Viewport Container */}
      <div className="fixed inset-0 w-full h-screen overflow-hidden island-overlay">
        
        {/* Background Image - Add mix-blend-screen to reveal bg color beneath black pixels */}
      <img
        src="/island_6/background image.png"
        alt="Island 6 Background"
        className="absolute inset-0 w-full h-full object-cover island-hero mix-blend-screen"
      />

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none island-bloom">
        <Canvas className="island-model">
          <fog ref={fogRef} attach="fog" args={["#16122f", 100, 200]} />
          
          {/* We wrap the camera in a group positioned exactly at the island's center.
              This way, rotating the group perfectly orbits the camera around the island! */}
          <group ref={cameraGroupRef}>
            <PerspectiveCamera 
              ref={cameraRef}
              makeDefault 
            />
          </group>
          
          {/* Daytime Lights */}
          <ambientLight ref={dayAmbientRef} intensity={1.5} />
          <directionalLight ref={dayDir1Ref} position={[10, 10, 5]} intensity={2} />
          <directionalLight ref={dayDir2Ref} position={[-10, 10, -5]} intensity={0.5} />

          {/* Nighttime Cinematic Lights (Initial intensity 0) */}
          <ambientLight ref={nightAmbientRef} intensity={0} color="#6d6cff" />
          <directionalLight ref={nightDirRef} position={[5,10,-5]} intensity={0} color="#b8c7ff" />
          <pointLight ref={nightPointRef} position={[0,3,0]} intensity={0} distance={15} color="#ffd27d" />

          <Suspense fallback={null}>
            <TempleModel templeGroupRef={templeGroupRef} />
            <Environment preset="city" />
            <CameraRig 
              containerRef={containerRef} 
              cameraRef={cameraRef} 
              cameraGroupRef={cameraGroupRef} 
              templeGroupRef={templeGroupRef}
              dayAmbientRef={dayAmbientRef}
              dayDir1Ref={dayDir1Ref}
              dayDir2Ref={dayDir2Ref}
              nightAmbientRef={nightAmbientRef}
              nightDirRef={nightDirRef}
              nightPointRef={nightPointRef}
              fogRef={fogRef}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between px-6 md:px-12 pb-6 md:pb-12 pt-0 z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center pointer-events-auto mt-1 md:mt-3 relative">
          <button className="px-6 py-2 rounded-full border border-black/20 hover:bg-black/5 transition-all text-[13px] font-medium flex items-center gap-2">
            Let's work <span className="text-lg leading-none mb-[2px]">+</span>
          </button>

          <div className="text-[15px] font-sans font-medium tracking-[0.25em] hidden md:block uppercase absolute left-1/2 -translate-x-1/2">
            CREATIVE <span className="text-lg">✦</span> DEVELOPER
          </div>

          <div className="flex gap-2 md:gap-3">
            <button className="px-6 py-2 rounded-full border border-black/20 hover:bg-black/5 transition-all text-[13px] font-medium">
              Menu
            </button>
            <button className="w-10 h-10 rounded-full border border-black/20 flex items-center justify-center hover:bg-black/5 transition-all">
              <ArrowLeft size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-3xl pointer-events-none flex flex-col justify-center h-full">
          <div className="flex items-center gap-2 -mb-3.4 pointer-events-auto">
            <span className="text-sm">✦</span>
            <span className="text-sm font-medium tracking-widest uppercase">Welcome to my world</span>
          </div>

          <h1 className="
            text-[46px]
            md:text-[60px]
            lg:text-[78px]
            xl:text-[96px]
            leading-[0.9]
            tracking-[0.08em]
            mb-8
            font-minecraft
            thicken-text
            pointer-events-auto
            w-fit
            glow-text
          ">
            <div className="w-fit">CREATIVE</div>
            <div className="w-fit mt-3">DEVELOPER</div>
          </h1>

          <p className="text-sm md:text-xl max-w-sm mb-10 opacity-80 font-medium leading-relaxed pointer-events-auto">
            I build experiences that merge creativity with code.
          </p>

          <button className="px-6 py-3 rounded-full border border-black/20 hover:bg-white/30 backdrop-blur-md transition-all text-sm font-medium flex items-center gap-2 w-fit pointer-events-auto">
            Let's work together <ArrowUpRight size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center pointer-events-auto text-[13px] font-medium opacity-80">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <a href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <span className="w-4 h-4 rounded-full bg-black flex items-center justify-center text-white text-[10px]">G</span> Github
            </a>
            <span className="w-1 h-1 rounded-full bg-black opacity-30" />
            <a href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <span className="w-4 h-4 rounded-full bg-black flex items-center justify-center text-white text-[10px]">T</span> Twitter
            </a>
            <span className="w-1 h-1 rounded-full bg-black opacity-30" />
            <a href="#" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
              <span className="w-4 h-4 rounded-full bg-black flex items-center justify-center text-white text-[10px]">in</span> LinkedIn
            </a>
          </div>

          <div className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer">
            <div className="w-4 h-6 border-2 border-black rounded-full flex justify-center p-1">
              <div className="w-1 h-1 bg-black rounded-full animate-bounce" />
            </div>
            Scroll to explore
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Available for work
          </div>
        </div>
      </div>
      
      </div>
    </div>
  );
};
