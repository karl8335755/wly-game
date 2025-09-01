import React from 'react';
import { gearData } from '../../data/gearData';

interface ShopScreenProps {
  resources: {
    gold: number;
    food: number;
  };
  currentLevel: number;
  onAddGold: (amount: number) => void;
  onAddFood: (amount: number) => void;
  onPurchaseItem: (item: any) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  resources,
  currentLevel,
  onAddGold,
  onAddFood,
  onPurchaseItem
}) => {
  // Filter items to show only legendary and mythic items
  const availableItems = gearData.filter(item => 
    item.rarity === 'legendary' || item.rarity === 'mythic'
  );

  // Show all legendary and mythic items, but check unlock status for each
  const allItems = availableItems;

  // Item prices for premium items
  const getItemPrice = (item: any) => {
    if (item.rarity === 'legendary') {
      return 5000;
    } else if (item.rarity === 'mythic') {
      return 15000;
    }
    return 0;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Gold Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-right">
          <div className="text-yellow-400 font-bold text-2xl">{resources.gold} Gold</div>
          <div className="text-gray-400 text-sm">Available</div>
        </div>
      </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {allItems.map((item) => {
              const price = getItemPrice(item);
              const canAfford = resources.gold >= price;
              const isLegendary = item.rarity === 'legendary';
              const rarityColor = isLegendary ? 'text-yellow-400' : 'text-purple-400';
              const rarityBg = isLegendary ? 'from-yellow-900 to-orange-900 border-yellow-500' : 'from-purple-900 to-purple-800 border-purple-500';
              
              // Check if item is unlocked based on level
              const isUnlocked = (isLegendary && currentLevel >= 5) || (!isLegendary && currentLevel >= 8);
              const canPurchase = canAfford && isUnlocked;
              
              return (
                <div key={item.id} className={`bg-gradient-to-br ${rarityBg} rounded-lg p-3 border transition-all duration-300 hover:scale-105`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-bold ${rarityColor}`}>
                      {item.rarity.toUpperCase()}
                    </span>
                    {!isUnlocked && (
                      <span className="text-xs text-red-400">🔒</span>
                    )}
                  </div>
                  
                  <h4 className="text-white font-bold text-sm mb-2">{item.name}</h4>
                  
                  <div className="text-xs text-gray-300 mb-3">
                    {item.type === 'weapon' && (
                      <div className="text-green-400">+{item.attackBonus} ATK</div>
                    )}
                    {item.type === 'armor' && (
                      <div className="text-blue-400">+{item.healthBonus} HP</div>
                    )}
                    {item.specialEffect && (
                      <div className="text-orange-400">AOE Effect</div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-yellow-400 font-bold text-sm">{price.toLocaleString()}</div>
                    <button
                      onClick={() => onPurchaseItem(item)}
                      disabled={!canPurchase}
                      className={`px-3 py-1.5 rounded text-xs font-semibold ${
                        canPurchase
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {!isUnlocked 
                        ? (isLegendary ? 'L5+' : 'L8+')
                        : !canAfford 
                          ? 'Need Gold' 
                          : 'Buy'
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
    </div>
  );
};
