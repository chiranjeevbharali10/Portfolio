import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

export const RingGradientMaterial = shaderMaterial(
  {
    time: 0,
    color1: new THREE.Color('#00ff44'), // Neon Green
    color2: new THREE.Color('#00ffff'), // Cyan
    color3: new THREE.Color('#8a2be2'), // Purple
    fresnelColor: new THREE.Color('#ffffff'),
    fresnelBias: 0.1,
    fresnelScale: 1.0,
    fresnelPower: 2.5,
  },
  // vertex shader
  /*glsl*/`
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
  `,
  // fragment shader
  /*glsl*/`
  uniform float time;
  uniform vec3 color1;
  uniform vec3 color2;
  uniform vec3 color3;
  
  uniform vec3 fresnelColor;
  uniform float fresnelBias;
  uniform float fresnelScale;
  uniform float fresnelPower;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    // Gradient based on UV y (around the torus tube) and x (around the ring)
    // We animate it by adding time
    float t = fract(vUv.x * 2.0 + time * 0.2); 
    
    vec3 col;
    if(t < 0.33) {
      col = mix(color1, color2, smoothstep(0.0, 0.33, t));
    } else if(t < 0.66) {
      col = mix(color2, color3, smoothstep(0.33, 0.66, t));
    } else {
      col = mix(color3, color1, smoothstep(0.66, 1.0, t));
    }

    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnelTerm = fresnelBias + fresnelScale * pow(1.0 - max(dot(normal, viewDir), 0.0), fresnelPower);
    fresnelTerm = clamp(fresnelTerm, 0.0, 1.0);

    vec3 finalColor = col + (fresnelColor * fresnelTerm);

    gl_FragColor = vec4(finalColor, 1.0);
    
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
  `
);

extend({ RingGradientMaterial });

declare module '@react-three/fiber' {
  interface IntrinsicElements {
    ringGradientMaterial: any;
  }
}
