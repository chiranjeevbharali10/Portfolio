import { useGLTF, Environment, AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { flowJourneyState } from './FlowJourney';

function CarScene() {
  const { scene } = useGLTF('/car.glb');
  const { camera } = useThree();
  
  const groupRef = useRef<THREE.Group>(null);
  
  // To avoid mutating original gltf
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  
  // Nodes
  const frontLeft = clonedScene.getObjectByName('wheel fl');
  const frontRight = clonedScene.getObjectByName('wheel fr');
  const backLeft = clonedScene.getObjectByName('wheel bl');
  const backRight = clonedScene.getObjectByName('wheel br');
  const carBody = clonedScene.getObjectByName('car body') || clonedScene;
  
  // Brake light materials / lights
  const brakeLightLeftRef = useRef<THREE.PointLight>(null);
  const brakeLightRightRef = useRef<THREE.PointLight>(null);

  // State
  const lastProgressRef = useRef(0);
  const lastDeltaRef = useRef(0);
  const currentAngleRef = useRef(0);
  const wheelSpinRef = useRef(0);

  // Raycaster for converting screen -> world
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  const getPlaneIntersection = (screenX: number, screenY: number): THREE.Vector3 => {
    const ndcX = (screenX / window.innerWidth) * 2 - 1;
    const ndcY = -(screenY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
    const distance = -camera.position.y / raycaster.ray.direction.y;
    return new THREE.Vector3().copy(camera.position).add(raycaster.ray.direction.multiplyScalar(distance));
  };

  useFrame((state, delta) => {
    const { progress, pathRef, svgRect } = flowJourneyState;
    if (!pathRef || !svgRect || !groupRef.current) return;
    
    const length = pathRef.getTotalLength();
    
    // 1. Current position
    const pt = pathRef.getPointAtLength(length * progress);
    const screenX = svgRect.left + (pt.x / 1000) * svgRect.width;
    const screenY = svgRect.top + (pt.y / 5000) * svgRect.height;
    const targetPos = getPlaneIntersection(screenX, screenY);
    
    // 2. Lookahead position
    const lookahead = Math.min(progress + 0.001, 1);
    const pt2 = pathRef.getPointAtLength(length * lookahead);
    const screenX2 = svgRect.left + (pt2.x / 1000) * svgRect.width;
    const screenY2 = svgRect.top + (pt2.y / 5000) * svgRect.height;
    const targetPos2 = getPlaneIntersection(screenX2, screenY2);
    
    // 3. Heading
    const dx = targetPos2.x - targetPos.x;
    const dz = targetPos2.z - targetPos.z;
    // atan2(x, z) gives angle from Z axis
    const targetAngle = Math.atan2(dx, dz);
    
    // Smooth angle interpolation
    const currentAngle = currentAngleRef.current;
    
    // Shortest path angle interpolation
    let diff = targetAngle - currentAngle;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    
    // Dampen body rotation slightly for inertia
    currentAngleRef.current += diff * 0.1;
    
    // Apply position & rotation
    groupRef.current.position.lerp(targetPos, 0.3);
    groupRef.current.rotation.y = currentAngleRef.current;
    
    // 4. Kinematics (Delta Progress)
    const deltaProgress = progress - lastProgressRef.current;
    const acceleration = deltaProgress - lastDeltaRef.current;
    lastProgressRef.current = progress;
    lastDeltaRef.current = deltaProgress;
    
    // Steering wheels
    // if diff is positive, steering right
    const steeringAngle = diff * 5; // amplify turn for visuals
    if (frontLeft) frontLeft.rotation.y = THREE.MathUtils.lerp(frontLeft.rotation.y, steeringAngle, 0.1);
    if (frontRight) frontRight.rotation.y = THREE.MathUtils.lerp(frontRight.rotation.y, steeringAngle, 0.1);
    
    // Body Roll (lean outward)
    // negative diff means left turn -> roll right (positive Z roll)
    const targetRoll = -diff * 2; 
    carBody.rotation.z = THREE.MathUtils.lerp(carBody.rotation.z, targetRoll, 0.1);
    
    // Braking / Acceleration Pitch
    // acceleration < 0 means braking (pitch forward, negative X)
    // acceleration > 0 means accelerating (pitch backward, positive X)
    const targetPitch = Math.min(Math.max(acceleration * 5000, -0.05), 0.05);
    carBody.rotation.x = THREE.MathUtils.lerp(carBody.rotation.x, targetPitch, 0.1);
    
    // Suspension Bounce
    // Bounce relative to total distance travelled
    const travelled = progress * length;
    carBody.position.y = Math.sin(travelled * 0.1) * 0.02; // slight vertical bounce
    
    // Wheel Spin
    wheelSpinRef.current += deltaProgress * 1000; // adjust multiplier for visual speed
    [frontLeft, frontRight, backLeft, backRight].forEach(wheel => {
       if (wheel) wheel.rotation.x = wheelSpinRef.current;
    });
    
    // Brake Lights (Turn on if decelerating sharply OR stopped at a checkpoint)
    const isStopping = (Math.abs(deltaProgress) < 0.00001 && progress > 0.01 && progress < 0.99) || acceleration < -0.0001;
    const targetIntensity = isStopping ? 5 : 0;
    if (brakeLightLeftRef.current) brakeLightLeftRef.current.intensity = THREE.MathUtils.lerp(brakeLightLeftRef.current.intensity, targetIntensity, 0.2);
    if (brakeLightRightRef.current) brakeLightRightRef.current.intensity = THREE.MathUtils.lerp(brakeLightRightRef.current.intensity, targetIntensity, 0.2);
    
    // 5. Camera Orientation
    // Subtle cinematic camera pan based on cornering
    // We rotate the camera slightly opposite to the turn to expose the side profile
    const cameraPan = -diff * 2;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, cameraPan * 10, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  
  return (
    <group ref={groupRef}>
      {/* We scale up the car to 8-12% of screen height as requested */}
      <group scale={3} rotation={[0, 0, 0]}>
         <primitive object={clonedScene} />
         
         {/* Brake Lights positioned near the rear */}
         <pointLight ref={brakeLightLeftRef} position={[-0.5, 0.5, -1.5]} color="red" intensity={0} distance={2} />
         <pointLight ref={brakeLightRightRef} position={[0.5, 0.5, -1.5]} color="red" intensity={0} distance={2} />
         
         {/* Subtle Headlights */}
         <spotLight position={[-0.5, 0.3, 1.5]} angle={0.3} penumbra={0.5} intensity={1} color="#e0f7fa" castShadow />
         <spotLight position={[0.5, 0.3, 1.5]} angle={0.3} penumbra={0.5} intensity={1} color="#e0f7fa" castShadow />
      </group>
    </group>
  );
}

export const FlowCar = () => {
  return (
    <div className="w-full h-full" style={{ pointerEvents: 'none' }}>
      {/* Camera is fixed in world space. We place it quite high, looking slightly down and forward */}
      <Canvas shadows camera={{ position: [0, 15, -10], fov: 40 }}>
        <ambientLight intensity={0.4} />
        
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
                scale={50}
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
