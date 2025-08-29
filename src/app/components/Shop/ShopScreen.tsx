import React from 'react';

interface ShopScreenProps {
  resources: {
    gold: number;
    food: number;
  };
  onAddGold: (amount: number) => void;
  onAddFood: (amount: number) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  onAddGold,
  onAddFood
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800/90 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold text-white mb-3">Shop</h2>
        <p className="text-gray-300 text-sm">Purchase resources and items for your city.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gray-800/90 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">💰 Gold Exchange</h3>
          <p className="text-gray-300 text-sm mb-3">Convert food to gold</p>
          <button
            onClick={() => onAddGold(100)}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            Get 100 Gold (Free)
          </button>
        </div>

        <div className="bg-gray-800/90 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">🍖 Food Exchange</h3>
          <p className="text-gray-300 text-sm mb-3">Convert gold to food</p>
          <button
            onClick={() => onAddFood(50)}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            Get 50 Food (Free)
          </button>
        </div>

        <div className="bg-gray-800/90 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3">⚔️ Equipment</h3>
          <p className="text-gray-300 text-sm mb-3">Purchase weapons and armor</p>
          <div className="text-xs text-gray-400">
            <div>• Equipment available in battle</div>
            <div>• Defeat enemies to find loot</div>
            <div>• Higher levels = better drops</div>
          </div>
        </div>
      </div>
    </div>
  );
};
