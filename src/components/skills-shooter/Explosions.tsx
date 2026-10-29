import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, Object3D, PointsMaterial, Vector3 } from "three";
import { world } from "./store";

const POOL = 6;
const PARTICLES = 60;
const LIFE = 0.7;

type Burst = {
  geo: BufferGeometry;
  mat: PointsMaterial;
  vel: Float32Array;
  age: number;
};

export const Explosions = () => {
  const points = useRef<(Object3D | null)[]>([]);
  const next = useRef(0);

  const bursts = useMemo<Burst[]>(
    () =>
      Array.from({ length: POOL }, () => {
        const geo = new BufferGeometry();
        geo.setAttribute("position", new BufferAttribute(new Float32Array(PARTICLES * 3), 3));
        const mat = new PointsMaterial({
          size: 0.18,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: AdditiveBlending,
          toneMapped: false,
        });
        return { geo, mat, vel: new Float32Array(PARTICLES * 3), age: LIFE };
      }),
    []
  );

  useEffect(() => {
    world.explode = (pos: Vector3, color: string) => {
      const i = next.current;
      next.current = (i + 1) % POOL;
      const b = bursts[i];
      const p = b.geo.attributes.position.array as Float32Array;
      for (let j = 0; j < PARTICLES; j++) {
        // Random direction on a sphere, random speed
        const u = Math.random() * 2 - 1;
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(1 - u * u);
        const s = 3 + Math.random() * 7;
        b.vel.set([r * Math.cos(a) * s, r * Math.sin(a) * s, u * s], j * 3);
        p.set([pos.x, pos.y, pos.z], j * 3);
      }
      b.geo.attributes.position.needsUpdate = true;
      b.mat.color = new Color(color).multiplyScalar(3);
      b.age = 0;
    };
    return () => {
      world.explode = () => {};
    };
  }, [bursts]);

  useFrame((_, dt) => {
    bursts.forEach((b, i) => {
      const pt = points.current[i];
      if (!pt) return;
      pt.visible = b.age < LIFE;
      if (!pt.visible) return;
      b.age += dt;
      const p = b.geo.attributes.position.array as Float32Array;
      for (let j = 0; j < p.length; j++) {
        b.vel[j] *= 1 - 2.5 * dt;
        p[j] += b.vel[j] * dt;
      }
      b.geo.attributes.position.needsUpdate = true;
      b.mat.opacity = 1 - b.age / LIFE;
    });
  });

  return (
    <>
      {bursts.map((b, i) => (
        <points
          key={i}
          ref={(el) => { points.current[i] = el; }}
          geometry={b.geo}
          material={b.mat}
          frustumCulled={false}
          visible={false}
        />
      ))}
    </>
  );
};
