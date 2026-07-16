import * as THREE from 'three';

export class ProceduralFlowerCurve extends THREE.Curve<THREE.Vector3> {
  scale: number;
  petals: number;
  depth: number;

  constructor(scale = 1, petals = 12, depth = 0.3) {
    super();
    this.scale = scale;
    this.petals = petals;
    this.depth = depth; // controls the depth of the petal indents
  }

  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    // t goes from 0 to 1 over the course of the curve
    const angle = t * Math.PI * 2;
    
    // Base radius + sine wave oscillation to create petals
    const radius = this.scale + Math.sin(this.petals * angle) * (this.scale * this.depth);
    
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    // The curve sits flat on the XY plane
    return optionalTarget.set(x, y, 0);
  }
}
