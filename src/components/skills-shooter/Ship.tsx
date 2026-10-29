import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils, PointLight, Vector3 } from "three";
import { game, world } from "./store";

const SHIP_Z = 4;
const target = new Vector3(0, -1, SHIP_Z);
let usingKeys = false;
let lastPointer = { x: 0, y: 0 };

export const Ship = () => {
  const ref = useRef<Group>(null);
  const engine = useRef<PointLight>(null);

  useFrame((state, dt) => {
    const ship = ref.current;
    if (!ship) return;
    const { status } = game.get();
    const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, SHIP_Z]);
    const bx = vp.width / 2 - 0.9;
    const by = vp.height / 2 - 0.7;

    // Pointer moves take over from keys, and vice versa
    const { x: px, y: py } = state.pointer;
    if (px !== lastPointer.x || py !== lastPointer.y) usingKeys = false;
    lastPointer = { x: px, y: py };

    const k = world.keys;
    const kx = (k.has("ArrowRight") || k.has("KeyD") ? 1 : 0) - (k.has("ArrowLeft") || k.has("KeyA") ? 1 : 0);
    const ky = (k.has("ArrowUp") || k.has("KeyW") ? 1 : 0) - (k.has("ArrowDown") || k.has("KeyS") ? 1 : 0);
    if (kx || ky) usingKeys = true;

    if (status === "playing") {
      if (usingKeys) {
        target.x += kx * 9 * dt;
        target.y += ky * 7 * dt;
      } else {
        target.set(px * bx, py * by, SHIP_Z);
      }
    } else if (status === "idle") {
      // Idle: lazy hover that loosely follows the pointer
      const t = state.clock.elapsedTime;
      target.set(px * bx * 0.3, -1 + Math.sin(t * 1.2) * 0.25 + py * 0.4, SHIP_Z);
    }
    target.x = MathUtils.clamp(target.x, -bx, bx);
    target.y = MathUtils.clamp(target.y, -by, by);

    const prevX = ship.position.x;
    const prevY = ship.position.y;
    const a = 1 - Math.exp(-8 * dt);
    ship.position.lerp(target, a);
    const vx = (ship.position.x - prevX) / Math.max(dt, 1e-3);
    const vy = (ship.position.y - prevY) / Math.max(dt, 1e-3);
    ship.rotation.z = MathUtils.lerp(ship.rotation.z, MathUtils.clamp(-vx * 0.08, -0.7, 0.7), a);
    ship.rotation.x = MathUtils.lerp(ship.rotation.x, MathUtils.clamp(vy * 0.04, -0.35, 0.35), a);
    world.ship.copy(ship.position);

    if (engine.current) engine.current.intensity = 6 + Math.random() * 3;
  });

  return (
    <group ref={ref} position={[0, -1, SHIP_Z]}>
      {/* Hull: nose points down -Z */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.32, 1.7, 6]} />
        <meshStandardMaterial color="#d8d8d8" metalness={0.6} roughness={0.35} flatShading />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0, 0.16, -0.15]} scale={[1, 0.6, 1.6]}>
        <sphereGeometry args={[0.17, 12, 8]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, -0.05, 0.35]}>
        <boxGeometry args={[2, 0.05, 0.55]} />
        <meshStandardMaterial color="#bdbdbd" metalness={0.6} roughness={0.4} flatShading />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          {/* Wingtip cannons */}
          <mesh position={[s * 0.95, -0.05, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.9, 6]} />
            <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Neon wing stripe */}
          <mesh position={[s * 0.6, -0.02, 0.35]}>
            <boxGeometry args={[0.5, 0.06, 0.08]} />
            <meshBasicMaterial color={[0.6, 4, 1]} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* Tail fin */}
      <mesh position={[0, 0.25, 0.65]}>
        <boxGeometry args={[0.05, 0.45, 0.35]} />
        <meshStandardMaterial color="#bdbdbd" metalness={0.6} roughness={0.4} flatShading />
      </mesh>
      {/* Engine glow */}
      <mesh position={[0, 0, 0.88]}>
        <sphereGeometry args={[0.16, 12, 8]} />
        <meshBasicMaterial color={[0.6, 5, 1.2]} toneMapped={false} />
      </mesh>
      <pointLight ref={engine} position={[0, 0, 1.3]} color="#35fe5d" distance={4} />
    </group>
  );
};
