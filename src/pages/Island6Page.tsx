import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

function TempleModel() {
  // Load the GLTF model
  const { scene } = useGLTF('/3D_model/voxel temple 3d model.glb');
  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.1, 0.1]}>
      <primitive
        object={scene}
        position={[5, -1.7, 0.3]}
        scale={5.6}
        rotation={[0, -0.24, 0.13]} 
      />
    </Float>
  );
}

// Preload the model
useGLTF.preload('/3D_model/voxel temple 3d model.glb');

export const Island6Page: React.FC = () => {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden font-kefir selection:bg-black selection:text-white">

      {/* Background Image */}
      <img
        src="/island_6/background image.png"
        alt="Island 6 Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera 
            makeDefault 
            position={[8.4, 5.1, 10]} 
            fov={40} 
            onUpdate={c => c.lookAt(0, 0, 0)} 
          />
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <directionalLight position={[-10, 10, -5]} intensity={0.5} />

          <Suspense fallback={null}>
            <TempleModel />
            <Environment preset="city" />
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
            font-incompleeta-light
            thicken-text
            pointer-events-auto
            w-fit
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
  );
};
