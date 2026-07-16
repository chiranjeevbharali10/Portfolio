import React from 'react';
import { Environment } from '@react-three/drei';

export const Lights: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      {/* Studio or city preset provides excellent glossy reflections */}
      <Environment preset="studio" />
    </>
  );
};
