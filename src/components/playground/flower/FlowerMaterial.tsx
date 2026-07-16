import React from 'react';

export const FlowerMaterial: React.FC<any> = (props) => {
  return (
    <meshPhysicalMaterial
      color="#ff00a0" // Bright pink base
      emissive="#ff00a0"
      emissiveIntensity={0.2} // Soft glow
      roughness={0.1} // Glossy finish
      metalness={0.2} 
      clearcoat={1.0} // White highlights
      clearcoatRoughness={0.1}
      iridescence={1.0} // Holographic thin-film interference
      iridescenceIOR={1.4}
      iridescenceThicknessRange={[400, 700]} // Targets green/cyan shifts on edges
      {...props}
    />
  );
};
