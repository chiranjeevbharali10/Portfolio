import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Text } from "@react-three/drei";
import { BufferGeometry, Color, Group, IcosahedronGeometry, MathUtils, Vector3 } from "three";
import { game, targets, world } from "./store";

const SPAWN_Z = -55;
const DESPAWN_Z = 9;
const BOLT_RADIUS = 0.25;
const MAX_ACTIVE = 3;
const Z_GAP = 16;

// Lumpy rock: displacement is a function of vertex position, so shared corners stay welded
const makeRock = (seed: number): BufferGeometry => {
  const geo = new IcosahedronGeometry(1, 1);
  const p = geo.attributes.position;
  const v = new Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i).normalize();
    const n =
      Math.sin(v.x * 3.1 + seed) * 0.12 +
      Math.sin(v.y * 4.3 + seed * 1.7) * 0.1 +
      Math.sin(v.z * 5.7 + seed * 2.3) * 0.08;
    v.multiplyScalar(1 + n);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
};

type Rock = {
  pos: Vector3;
  spin: Vector3;
  radius: number;
  active: boolean;
};

export const Asteroids = () => {
  const groups = useRef<(Group | null)[]>([]);
  const meshes = useRef<(Group | null)[]>([]);

  const rocks = useMemo(
    () =>
      targets.map((t, i) => ({
        target: t,
        geo: makeRock(i * 7.31),
        glow: new Color(t.color).multiplyScalar(2.2),
        state: {
          pos: new Vector3(),
          spin: new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5),
          radius: MathUtils.randFloat(0.6, 0.8),
          active: false,
        } as Rock,
      })),
    []
  );

  useFrame((state, dt) => {
    const s = game.get();
    const playing = s.status === "playing";
    const speed = playing ? 7 : s.status === "paused" ? 0 : 2.5;
    const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, 4]);
    const bx = vp.width / 2 - 1;
    const by = vp.height / 2 - 0.8;

    // Queue behind the furthest rock and pick the spot furthest from the others, so labels never stack
    const respawn = (r: Rock) => {
      const others = rocks.filter((o) => o.state.active && o.state !== r).map((o) => o.state.pos);
      const backZ = Math.min(SPAWN_Z, ...others.map((p) => p.z - Z_GAP));
      let best = { x: 0, y: 0, score: -1 };
      for (let k = 0; k < 12; k++) {
        const x = MathUtils.randFloat(-bx, bx);
        const y = MathUtils.randFloat(-by, by);
        const score = Math.min(Infinity, ...others.map((p) => Math.hypot(p.x - x, p.y - y)));
        if (score > best.score) best = { x, y, score };
      }
      r.pos.set(best.x, best.y, backZ - Math.random() * 4);
    };

    // Only the first few remaining skills of the current sector fly at once
    const queue = s.status === "won" ? [] : rocks.filter((o) => o.target.cat === s.wave && !s.destroyed.has(o.target.id));
    const flying = new Set(queue.filter((o) => o.state.active).slice(0, MAX_ACTIVE));
    for (const o of queue) {
      if (flying.size >= MAX_ACTIVE) break;
      flying.add(o);
    }
    rocks.forEach((o) => {
      if (!flying.has(o)) o.state.active = false;
    });

    rocks.forEach((o, i) => {
      const { target, state: r } = o;
      const g = groups.current[i];
      if (!g) return;
      const shouldBeActive = flying.has(o);
      if (shouldBeActive && !r.active) {
        respawn(r);
        r.active = true;
      }
      g.visible = r.active;
      if (!r.active) return;

      r.pos.z += speed * dt;
      if (r.pos.z > DESPAWN_Z) {
        r.active = false;
        respawn(r);
        r.active = true;
      }
      g.position.copy(r.pos);
      const m = meshes.current[i];
      if (m) {
        m.rotation.x += r.spin.x * dt;
        m.rotation.y += r.spin.y * dt;
        m.rotation.z += r.spin.z * dt;
      }

      if (!playing) return;
      for (const b of world.bolts) {
        if (b.active && b.pos.distanceTo(r.pos) < r.radius + BOLT_RADIUS) {
          b.active = false;
          world.explode(r.pos, target.color);
          world.shake = 0.35;
          game.hit(target);
          break;
        }
      }
    });
  });

  return (
    <>
      {rocks.map(({ target, geo, glow, state: r }, i) => (
        <group key={target.id} ref={(el) => { groups.current[i] = el; }} visible={false}>
          <group ref={(el) => { meshes.current[i] = el; }} scale={r.radius}>
            <mesh geometry={geo}>
              <meshStandardMaterial color="#2a2a2e" roughness={0.9} metalness={0.1} flatShading />
            </mesh>
            <mesh geometry={geo} scale={1.015}>
              <meshBasicMaterial color={glow} wireframe toneMapped={false} transparent opacity={0.55} />
            </mesh>
          </group>
          <Billboard position={[0, r.radius + 0.3, 0]}>
            <Text
              font="/fonts/Minecraft.ttf"
              fontSize={0.95}
              color={target.color}
              anchorY="bottom"
              outlineWidth={0.06}
              outlineColor="#050505"
            >
              {target.skill}
            </Text>
          </Billboard>
        </group>
      ))}
    </>
  );
};
