import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { InstancedMesh, Object3D } from "three";
import { BOLT_COUNT, game, world } from "./store";

const BOLT_SPEED = 75;
const FIRE_INTERVAL = 0.14;
const dummy = new Object3D();

export const Lasers = () => {
  const ref = useRef<InstancedMesh>(null);
  const cooldown = useRef(0);
  const side = useRef(1);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const playing = game.get().status === "playing";

    // Alternate wingtip cannons
    cooldown.current -= dt;
    if (playing && world.firing && cooldown.current <= 0) {
      const bolt = world.bolts.find((b) => !b.active);
      if (bolt) {
        bolt.active = true;
        bolt.pos.copy(world.ship).add({ x: side.current * 0.95, y: -0.05, z: -0.5 });
        side.current *= -1;
      }
      cooldown.current = FIRE_INTERVAL;
    }

    world.bolts.forEach((b, i) => {
      if (b.active) {
        b.pos.z -= BOLT_SPEED * dt;
        if (b.pos.z < -70) b.active = false;
      }
      dummy.position.copy(b.pos);
      dummy.scale.setScalar(b.active ? 1 : 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, BOLT_COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.06, 0.06, 1.1]} />
      <meshBasicMaterial color={[1, 6, 1.5]} toneMapped={false} />
    </instancedMesh>
  );
};
