import React from 'react';

export const CrystalMaterial: React.FC<any> = (props) => {
  return (
    <meshPhysicalMaterial
      color="#ff0088" // Bright pink
      emissive="#ff0055" // Magenta emission
      emissiveIntensity={0.8} // Soft glow
      roughness={0.05} // Premium glossy finish
      metalness={0.3}
      clearcoat={1.0} // Creates the soft white highlight requested
      clearcoatRoughness={0.05}
      {...props}
    />
  );
};
