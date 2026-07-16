import React from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

export const Effects: React.FC = () => {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.8}
        mipmapBlur
        intensity={0.2}
        radius={0.3}
      />
    </EffectComposer>
  );
};
