import React from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

export const Effects: React.FC = () => {
  return (
    <EffectComposer>
      <Bloom 
        luminanceThreshold={0.8} 
        mipmapBlur 
        intensity={0.6} 
        radius={0.4} 
      />
    </EffectComposer>
  );
};
