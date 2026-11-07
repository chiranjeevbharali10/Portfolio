import { useGLTF, Environment, AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { flowJourneyState } from './FlowJourney';

function CarScene() {
  const { scene } = useGLTF('/car.glb');
  const groupRef = useRef<THREE.Group>(null);
  
  // Clone to avoid mutating
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  // Nodes
  const frontLeft = clonedScene.getObjectByName('wheel fl');
  const frontRight = clonedScene.getObjectByName('wheel fr');
  const backLeft = clonedScene.getObjectByName('wheel bl');
  const backRight = clonedScene.getObjectByName('wheel br');

  // State
  const lastProgressRef = useRef(0);
  const currentAngleRef = useRef(0);
  const wheelSpinRef = useRef(0);

  useFrame((state, delta) => {
    const { progress, angle } = flowJourneyState;
    if (!groupRef.current) return;
    
    // 1. Heading (Map 2D screen angle to 3D Y-rotation)
    // angle is from Math.atan2(dy, dx) in CSS screen space
    // 0 = right, PI/2 = down
    // In 3D (camera looking down -Z), rotation.y = 0 points towards +Z (down screen)
    const targetAngle = -angle - Math.PI / 2;
    
    // Smooth angle interpolation (Shortest path)
    let currentAngle = currentAngleRef.current;
    let diff = targetAngle - currentAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    
    // Dampen rotation slightly for a heavy feel
    currentAngleRef.current += diff * (delta * 5); 
    groupRef.current.rotation.y = currentAngleRef.current;
    // Share the smoothed on-screen heading (inverse of targetAngle mapping) for the headlight beam
    flowJourneyState.carScreenAngle = -currentAngleRef.current - Math.PI / 2;
    
    // 2. Wheel Spin & Steering
    const deltaProgress = progress - lastProgressRef.current;
    lastProgressRef.current = progress;
    
    // Steering based on turn rate (diff)
    const steeringAngle = diff * 2; 
    if (frontLeft) frontLeft.rotation.y = THREE.MathUtils.damp(frontLeft.rotation.y, steeringAngle, 5, delta);
    if (frontRight) frontRight.rotation.y = THREE.MathUtils.damp(frontRight.rotation.y, steeringAngle, 5, delta);
    
    // Wheel Spin
    wheelSpinRef.current += deltaProgress * 2000;
    [frontLeft, frontRight, backLeft, backRight].forEach(wheel => {
       if (wheel) wheel.rotation.x = wheelSpinRef.current;
    });
    
    // 3. Fixed Camera
    // Keep camera perfectly centered so the car never visually drifts off the SVG road
    state.camera.position.x = 0;
    state.camera.lookAt(0, 0, 0);
  });
  
  return (
    <group ref={groupRef}>
      {/* 
        Adjusted scale and lowered position to ensure it fits and tires touch the shadow plane.
      */}
      <group scale={2.2} rotation={[0, 0, 0]} position={[0, -0.15, 0]}>
         <primitive object={clonedScene} />
      </group>
    </group>
  );
}

// Light rig per time of day: [ambient color, ambient intensity, key color, key intensity, rim color, rim intensity, env intensity]
type Rig = [string, number, string, number, string, number, number];
const RIGS: Record<'base' | 'morning' | 'evening' | 'night', Rig> = {
  base: ['#ffffff', 0.5, '#ffffff', 1.2, '#a6e3e9', 0.8, 1],
  morning: ['#fff6e0', 0.7, '#fff0cc', 1.5, '#bfe6ff', 0.6, 1.1],
  evening: ['#ffc59a', 0.45, '#ff9a55', 1.3, '#b07cff', 0.8, 0.75],
  night: ['#8fa3ff', 0.22, '#9fb4ff', 0.55, '#4a6cff', 0.6, 0.3],
};

/** Car lighting that follows the morning -> evening -> night blend. */
function TimeOfDayLights() {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyRef = useRef<THREE.SpotLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const tmp = useMemo(() => ({ a: new THREE.Color(), k: new THREE.Color(), r: new THREE.Color(), c: new THREE.Color() }), []);

  useFrame(({ scene }) => {
    const w = flowJourneyState;
    const weights = [w.base, w.morning, w.evening, w.night];
    const rigs = [RIGS.base, RIGS.morning, RIGS.evening, RIGS.night];
    tmp.a.setRGB(0, 0, 0);
    tmp.k.setRGB(0, 0, 0);
    tmp.r.setRGB(0, 0, 0);
    let ai = 0, ki = 0, ri = 0, env = 0;
    rigs.forEach((rig, i) => {
      const k = weights[i];
      if (!k) return;
      tmp.a.add(tmp.c.set(rig[0]).multiplyScalar(k));
      tmp.k.add(tmp.c.set(rig[2]).multiplyScalar(k));
      tmp.r.add(tmp.c.set(rig[4]).multiplyScalar(k));
      ai += rig[1] * k;
      ki += rig[3] * k;
      ri += rig[5] * k;
      env += rig[6] * k;
    });
    if (ambientRef.current) {
      ambientRef.current.color.copy(tmp.a);
      ambientRef.current.intensity = ai;
    }
    if (keyRef.current) {
      keyRef.current.color.copy(tmp.k);
      keyRef.current.intensity = ki;
    }
    if (rimRef.current) {
      rimRef.current.color.copy(tmp.r);
      rimRef.current.intensity = ri;
    }
    scene.environmentIntensity = env;
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.5} />

      {/* Soft Key Light */}
      <spotLight
        ref={keyRef}
        position={[10, 20, 10]}
        angle={0.5}
        penumbra={1}
        intensity={1.2}
        castShadow
        shadow-mapSize={1024}
      />

      {/* Rim Light */}
      <directionalLight ref={rimRef} position={[-10, 5, -10]} intensity={0.8} color="#a6e3e9" />
    </>
  );
}

export const FlowCar = () => {
  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas shadows camera={{ position: [0, 15, -10], fov: 40 }}>
        <TimeOfDayLights />
        
        <Suspense fallback={null}>
          <CarScene />
          
          {/* Ground Plane with Accumulative Shadows */}
          <group position={[0, -0.05, 0]}>
             <AccumulativeShadows
                temporal
                frames={Infinity}
                blend={50}
                color="#000000"
                colorBlend={1}
                alphaTest={0.85}
                scale={10} // small scale since car doesn't move from [0,0,0]
             >
                <RandomizedLight amount={8} radius={4} ambient={0.5} intensity={1} position={[10, 20, 10]} />
             </AccumulativeShadows>
          </group>
          
          <Environment files="/hdri/city_256.hdr" />
        </Suspense>
      </Canvas>
    </div>
  );
};
