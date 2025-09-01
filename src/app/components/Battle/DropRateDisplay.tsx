import React from 'react';

interface DropRateDisplayProps {
  currentLevel: number;
}

export const DropRateDisplay: React.FC<DropRateDisplayProps> = ({ currentLevel }) => {
  // Get drop rates based on current level with progressive scaling
  const getDropRates = (level: number) => {
    let rates;
    if (level >= 15) {
      // Level 15+: Best rates
      rates = { common: 0.35, uncommon: 0.25, rare: 0.2, epic: 0.12, legendary: 0.05, mythic: 0.03 };
    } else if (level >= 12) {
      // Level 12-14: Very good rates
      rates = { common: 0.4, uncommon: 0.25, rare: 0.18, epic: 0.1, legendary: 0.04, mythic: 0.03 };
    } else if (level >= 10) {
      // Level 10-11: Good rates
      rates = { common: 0.45, uncommon: 0.25, rare: 0.16, epic: 0.08, legendary: 0.03, mythic: 0.03 };
    } else if (level >= 8) {
      // Level 8-9: Improved rates
      rates = { common: 0.48, uncommon: 0.25, rare: 0.15, epic: 0.07, legendary: 0.03, mythic: 0.02 };
    } else if (level >= 6) {
      // Level 6-7: Base high-level rates
      rates = { common: 0.5, uncommon: 0.25, rare: 0.15, epic: 0.07, legendary: 0.02, mythic: 0.01 };
    } else if (level >= 4) {
      rates = { common: 0.55, uncommon: 0.25, rare: 0.15, epic: 0.04, legendary: 0.01, mythic: 0 };
    } else if (level >= 2) {
      rates = { common: 0.6, uncommon: 0.25, rare: 0.12, epic: 0.03, legendary: 0, mythic: 0 };
    } else {
      rates = { common: 0.65, uncommon: 0.25, rare: 0.1, epic: 0, legendary: 0, mythic: 0 };
    }
    return rates;
  };

  const dropRates = getDropRates(currentLevel);

  const rarityColors = {
    common: 'text-gray-400',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400',
    mythic: 'text-red-400'
  };

  const rarityIcons = {
    common: '⚪',
    uncommon: '🟢',
    rare: '🔵',
    epic: '🟣',
    legendary: '🟡',
    mythic: '🔴'
  };

  return (
    <div className="bg-gray-900/95 rounded-lg p-2 border border-gray-600 shadow-2xl min-w-[220px]">
      <h3 className="text-white font-bold text-xs mb-1">
        Level {currentLevel} Drop Rates
      </h3>
      
      <div className="space-y-0.5">
        {Object.entries(dropRates).map(([rarity, rate]) => (
          <div key={rarity} className="flex items-center justify-between bg-gray-800/50 rounded px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-xs">{rarityIcons[rarity as keyof typeof rarityIcons]}</span>
              <span className={`text-xs font-semibold capitalize ${rarityColors[rarity as keyof typeof rarityColors]}`}>
                {rarity}
              </span>
            </div>
            <span className="text-white text-xs font-bold">
              {(rate * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
