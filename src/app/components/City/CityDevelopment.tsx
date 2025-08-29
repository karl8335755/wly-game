import React from 'react';

interface CityDevelopmentProps {
  cityTier: number;
  populationCapacity: number;
  onUpgradeCity: () => boolean;
  sellMessage: string;
}

export const CityDevelopment: React.FC<CityDevelopmentProps> = ({
  cityTier,
  populationCapacity,
  onUpgradeCity,
  sellMessage
}) => {
  const nextTier = cityTier + 1;
  const goldCost = nextTier * 50000;
  const foodCost = nextTier * 30000;

  const handleUpgrade = () => {
    const success = onUpgradeCity();
    if (!success) {
      alert(`Insufficient resources! Need ${goldCost} gold and ${foodCost} food to upgrade to Tier ${nextTier}.`);
    }
  };

  return (
    <div className="bg-gray-800/90 rounded-lg p-4">
      <h2 className="text-lg font-bold text-white mb-3">City Development</h2>
      <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
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
        {sellMessage && (
          <div className="mt-2 text-center text-green-400 text-sm font-semibold">
            {sellMessage}
          </div>
        )}
      </div>
    </div>
  );
};
