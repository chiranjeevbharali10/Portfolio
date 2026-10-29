import React from 'react';
import { IslandJourney5 } from '../components/IslandJourney5';
import { FlowJourney } from '../components/FlowJourney';
import { SkillsShooter } from '../components/skills-shooter/SkillsShooter';

export const IslandJourney5Page: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-black">
      <IslandJourney5 />
      <FlowJourney />
      <div id="skills">
        <SkillsShooter />
      </div>
    </div>
  );
};
