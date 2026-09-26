import React from 'react';
import { IslandJourney5 } from '../components/IslandJourney5';
import { FlowJourney } from '../components/FlowJourney';

export const IslandJourney5Page: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-black">
      <IslandJourney5 />
      <FlowJourney />
    </div>
  );
};
