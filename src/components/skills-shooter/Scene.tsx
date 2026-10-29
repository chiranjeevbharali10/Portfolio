import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { InstancedMesh, MathUtils, Object3D, Vector3 } from "three";
import { Ship } from "./Ship";
import { Lasers } from "./Lasers";
import { Asteroids } from "./Asteroids";
import { Explosions } from "./Explosions";
import { game, world } from "./store";

const STREAKS = 160;
const dummy = new Object3D();

// Thin streaks rushing past the camera to sell forward motion
const SpeedLines = () => {
  const ref = useRef<InstancedMesh>(null);
  const lines = useMemo(
    () =>
      Array.from({ length: STREAKS }, () => {
        const a = Math.random() * Math.PI * 2;
        const r = MathUtils.randFloat(6, 22);
        return new Vector3(Math.cos(a) * r, Math.sin(a) * r, MathUtils.randFloat(-80, 10));
      }),
    []
  );
  const speed = useRef(10);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const { status } = game.get();
    const target = status === "playing" ? 60 : status === "paused" ? 1 : 10;
    speed.current = MathUtils.lerp(speed.current, target, 1 - Math.exp(-2 * dt));
    const stretch = speed.current / 12;
    lines.forEach((p, i) => {
      p.z += speed.current * dt;
      if (p.z > 12) p.z -= 90;
      dummy.position.copy(p);
      dummy.scale.set(1, 1, stretch);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, STREAKS]} frustumCulled={false}>
      <boxGeometry args={[0.025, 0.025, 1]} />
      <meshBasicMaterial color="#9fb4ff" transparent opacity={0.35} />
    </instancedMesh>
  );
};

const CameraRig = () => {
  const base = useMemo(() => new Vector3(0, 1.2, 10), []);
  useFrame(({ camera }, dt) => {
    const s = world.shake;
    camera.position.set(
      base.x + world.ship.x * 0.18 + (Math.random() - 0.5) * s,
      base.y + world.ship.y * 0.12 + (Math.random() - 0.5) * s,
      base.z
    );
    camera.lookAt(world.ship.x * 0.1, 0, -10);
    world.shake = Math.max(0, s - dt * 1.2);
  });
  return null;
};

export const Scene = memo(({ mobile }: { mobile: boolean }) => (
  <>
    <color attach="background" args={["#050505"]} />
    <fog attach="fog" args={["#050505", 22, 62]} />
    <ambientLight intensity={0.35} />
    <directionalLight position={[5, 8, 6]} intensity={2.2} />
    <directionalLight position={[-6, -2, -4]} intensity={0.8} color="#8B35FF" />
    <Stars radius={90} depth={50} count={mobile ? 2000 : 5000} factor={4} saturation={0} fade speed={0.6} />
    <SpeedLines />
    <CameraRig />
    <Ship />
    <Lasers />
    <Asteroids />
    <Explosions />
    <EffectComposer>
      <Bloom luminanceThreshold={0.3} mipmapBlur intensity={mobile ? 0.7 : 1.1} radius={0.6} />
    </EffectComposer>
  </>
));
