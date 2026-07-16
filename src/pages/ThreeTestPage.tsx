import React from 'react';
import { Scene } from '../components/playground/globe/Scene';

export const ThreeTestPage: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Scene />
    </div>
  );
};
