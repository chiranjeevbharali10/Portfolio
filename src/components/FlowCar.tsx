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
    
    // 3. Cinematic Camera Pan inside the small canvas
    // We gently rotate the camera opposite to the turn to show the side profile
    const cameraPan = -diff * 0.5;
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, cameraPan * 15, 2, delta);
    state.camera.lookAt(0, 0, 0);
  });
  
  return (
    <group ref={groupRef}>
      {/* 
        Adjusted scale to ensure it fits perfectly within the 300x300 HTML container.
        Since the container is small, the car is effectively "a point" that drives along the road. 
      */}
      <group scale={2.2} rotation={[0, 0, 0]}>
         <primitive object={clonedScene} />
      </group>
    </group>
  );
}

export const FlowCar = () => {
  return (
    <div className="w-full h-full pointer-events-none">
      <Canvas shadows camera={{ position: [0, 15, -10], fov: 40 }}>
        <ambientLight intensity={0.5} />
        
        {/* Soft Key Light */}
        <spotLight 
          position={[10, 20, 10]} 
          angle={0.5} 
          penumbra={1} 
          intensity={1.2} 
          castShadow 
          shadow-mapSize={1024} 
        />
        
        {/* Rim Light */}
        <directionalLight position={[-10, 5, -10]} intensity={0.8} color="#a6e3e9" />
        
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
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};
