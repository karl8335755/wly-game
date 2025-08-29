import React from 'react';

interface ResourcesPanelProps {
  resources: {
    gold: number;
    food: number;
    population: number;
  };
  populationCapacity: number;
}

export const ResourcesPanel: React.FC<ResourcesPanelProps> = ({ resources, populationCapacity }) => {
  return (
    <div className="bg-gray-800/90 rounded-lg p-4">
      <h2 className="text-lg font-bold text-white mb-3">Resources</h2>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-xl">💰</div>
          <div className="text-yellow-400 font-bold text-sm">{resources.gold}</div>
          <div className="text-gray-400 text-xs">Gold</div>
        </div>
        <div className="text-center">
          <div className="text-xl">🍖</div>
          <div className="text-green-400 font-bold text-sm">{resources.food}</div>
          <div className="text-gray-400 text-xs">Food</div>
        </div>
        <div className="text-center">
          <div className="text-xl">👥</div>
          <div className="text-blue-400 font-bold text-sm">{resources.population}/{populationCapacity}</div>
          <div className="text-gray-400 text-xs">Population</div>
        </div>
      </div>
    </div>
  );
};
