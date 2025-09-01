import React from 'react';

interface CityDevelopmentProps {
  cityTier: number;
  populationCapacity: number;
  farmCount: number;
  onUpgradeCity: () => boolean;
  onPurchaseFarm: () => boolean;
}

export const CityDevelopment: React.FC<CityDevelopmentProps> = ({
  cityTier,
  populationCapacity,
  farmCount,
  onUpgradeCity,
  onPurchaseFarm
}) => {
  const nextTier = cityTier + 1;
  const goldCost = nextTier * 5000;
  const foodCost = nextTier * 3000;
  const farmCost = 50000;

  const handleUpgrade = () => {
    const success = onUpgradeCity();
    if (!success) {
      alert(`Insufficient resources! Need ${goldCost} gold and ${foodCost} food to upgrade to Tier ${nextTier}.`);
    }
  };

  const handlePurchaseFarm = () => {
    const success = onPurchaseFarm();
    if (!success) {
      alert(`Insufficient gold! Need ${farmCost} gold to purchase a farm.`);
    }
  };

  return (
    <div className="bg-gray-800/90 rounded-lg p-4">
      <h2 className="text-lg font-bold text-white mb-3">City Development</h2>
      
      {/* City Tier Upgrade */}
      <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-white">City Tier {cityTier}</h3>
            <p className="text-gray-400 text-xs">Capacity: {populationCapacity}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">
              <div>💰 {goldCost}</div>
              <div>🍖 {foodCost}</div>
            </div>
          </div>
        </div>
        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Upgrade to Tier {nextTier}
        </button>
      </div>

      {/* Farm Purchase */}
      <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-white">Farms</h3>
            <p className="text-gray-400 text-xs">Owned: {farmCount} | +{farmCount * 500} food/min</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">
              <div>💰 {farmCost}</div>
            </div>
          </div>
        </div>
        <button
          onClick={handlePurchaseFarm}
          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Purchase Farm (+500 food/min)
        </button>
      </div>
    </div>
  );
};
