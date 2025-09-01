import React from 'react';
import { ResourcesPanel } from './ResourcesPanel';
import { CityDevelopment } from './CityDevelopment';

interface CityScreenProps {
  resources: {
    gold: number;
    food: number;
    population: number;
  };
  cityTier: number;
  populationCapacity: number;
  currentPopulationUsed: number;
  onUpgradeCity: () => boolean;
  farmCount: number;
  onPurchaseFarm: () => boolean;
}

export const CityScreen: React.FC<CityScreenProps> = ({
  resources,
  cityTier,
  populationCapacity,
  currentPopulationUsed,
  onUpgradeCity,
  farmCount,
  onPurchaseFarm
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Resources and City Development */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ResourcesPanel resources={resources} populationCapacity={populationCapacity} currentPopulationUsed={currentPopulationUsed} />
        <CityDevelopment 
          cityTier={cityTier} 
          populationCapacity={populationCapacity}
          farmCount={farmCount}
          onUpgradeCity={onUpgradeCity}
          onPurchaseFarm={onPurchaseFarm}
        />
      </div>

      {/* City Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800/90 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">🏛️ City Hall</h3>
          <p className="text-gray-300 text-sm mb-3">Manage your city&apos;s development and resources.</p>
          <div className="text-xs text-gray-400">
            <div>• Upgrade city tier</div>
            <div>• Increase population capacity</div>
            <div>• Unlock new features</div>
          </div>
        </div>

        <div className="bg-gray-800/90 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">⚔️ Training Grounds</h3>
          <p className="text-gray-300 text-sm mb-3">Train your heroes and improve their skills.</p>
          <div className="text-xs text-gray-400">
            <div>• Level up heroes</div>
            <div>• Learn new abilities</div>
            <div>• Improve combat stats</div>
          </div>
        </div>

        <div className="bg-gray-800/90 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">🏪 Marketplace</h3>
          <p className="text-gray-300 text-sm mb-3">Trade resources and purchase items.</p>
          <div className="text-xs text-gray-400">
            <div>• Buy and sell items</div>
            <div>• Trade resources</div>
            <div>• Find rare equipment</div>
          </div>
        </div>
      </div>
    </div>
  );
};
