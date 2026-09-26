import React, { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { init, effect, surface, frameLoop } from 'vgpu';

gsap.registerPlugin(ScrollTrigger);

const CRAZY_TRANSITION_SHADER = `
struct Params { 
  progress: f32, 
  time: f32, 
  texel: vec2f 
}
@group(0) @binding(0) var<uniform> params: Params;

// Simple pseudo-random function
fn hash(n: f32) -> f32 {
  return fract(sin(n) * 43758.5453123);
}

// 2D Noise
fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let n = i.x + i.y * 57.0;
  return mix(
    mix(hash(n + 0.0), hash(n + 1.0), f.x),
    mix(hash(n + 57.0), hash(n + 58.0), f.x),
    f.y
  );
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = params.progress;
  let t = params.time;
  
  // Center UV
  let cuv = uv - 0.5;
  
  // Distort UV based on noise and progress
  let distortion = noise(uv * 10.0 + t * 2.0) * p * 2.0;
  let warped_uv = cuv * (1.0 + distortion) + 0.5;
  
  // Cyber grid pattern that emerges and shatters
  let grid = sin(warped_uv.x * 50.0) * sin(warped_uv.y * 50.0);
  let gridGlow = smoothstep(0.8, 1.0, grid) * (1.0 - p);
  
  // A glowing green energy wave (tying into Grow with Flow)
  let wave = noise(cuv * 5.0 - t * 3.0);
  let energy = smoothstep(0.4, 0.6, wave) * p * (1.0 - p) * 4.0;
  
  // Color palette: transition from dark to bright green to black
  let baseColor = vec3f(0.05, 0.05, 0.05); // slightly visible background
  let cyberColor = vec3f(0.8, 0.2, 1.0) * gridGlow; // Pink/Magenta from the island
  let flowColor = vec3f(0.2, 1.0, 0.3) * energy; // Green from the flow journey
  
  // Mix it all together, fading to pure black at the end (p=1)
  let finalColor = mix(baseColor + cyberColor + flowColor, vec3f(0.0), pow(p, 2.0));
  
  // Alpha starts at 1, but we render on a black background anyway
  return vec4f(finalColor, 1.0);
}
`;

export const VgpuTransition: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);

  // Setup GSAP ScrollTrigger for progress
  useGSAP(() => {
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      }
    });
  }, { scope: containerRef });

  // Setup vgpu
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    let loop: any;
    let gpuInstance: any;

    const startGPU = async () => {
      try {
        const gpu = await init();
        if (disposed) return gpu.dispose();
        gpuInstance = gpu;

        const canvasSurface = surface(gpu, canvas, { dpr: [1, 2] });
        const transitionEffect = effect(gpu, CRAZY_TRANSITION_SHADER, {
          label: 'crazy-transition',
          set: { 
            params: { 
              progress: 0, 
              time: 0, 
              texel: canvasSurface.texelSize 
            } 
          }
        });

        canvasSurface.onResize(() => {
          transitionEffect.set({ params: { texel: canvasSurface.texelSize } });
        });

        const startTime = performance.now();

        loop = frameLoop(gpu, (frame) => {
          const time = (performance.now() - startTime) / 1000;
          transitionEffect.set({ 
            params: { 
              progress: progressRef.current,
              time: time 
            } 
          });
          frame.pass(canvasSurface, transitionEffect);
        });
      } catch (err) {
        console.error("VGPU initialization failed:", err);
      }
    };

    startGPU();

    return () => {
      disposed = true;
      if (loop) loop.stop();
      if (gpuInstance) gpuInstance.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[200vh] relative bg-black">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block" 
        />
      </div>
    </div>
  );
};
