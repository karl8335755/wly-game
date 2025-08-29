import React, { useState } from 'react';
import { InventoryItem } from '../hooks/useInventory';

interface InventoryPanelProps {
  allItems: InventoryItem[];
  onEquipItem: (item: InventoryItem, heroName: string) => void;
  onSellAllItems: () => void;
  sellMessage: string;
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  allItems,
  onEquipItem,
  onSellAllItems,
  sellMessage
}) => {
  const [selectedHero, setSelectedHero] = useState<string>('刘备');

  const heroOptions = ['刘备', '关羽', '张飞', '诸葛亮'];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'text-purple-400 bg-purple-900/30';
      case 'legendary': return 'text-orange-400 bg-orange-900/30';
      case 'epic': return 'text-purple-400 bg-purple-900/30';
      case 'rare': return 'text-blue-400 bg-blue-900/30';
      case 'common': return 'text-gray-400 bg-gray-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-500/50';
      case 'legendary': return 'bg-gradient-to-r from-orange-900/50 to-orange-800/50 border-orange-500/50';
      case 'epic': return 'bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-500/50';
      case 'rare': return 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-500/50';
      case 'common': return 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-500/50';
      default: return 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-500/50';
    }
  };

  const getEquippedBy = (): string | null => {
    // This would need to be implemented based on your equipped gear logic
    return null;
  };

  return (
    <div className="bg-gray-800/90 rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-white">Inventory</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">{allItems.length}/20</span>
          {allItems.length > 0 && (
            <button
              onClick={onSellAllItems}
              className="px-3 py-1 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white text-xs font-semibold rounded transition-all duration-200"
            >
              Sell All
            </button>
          )}
        </div>
      </div>

      {/* Sell Message */}
      {sellMessage && (
        <div className="mb-3 text-center text-green-400 text-sm font-semibold">
          {sellMessage}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {allItems.length === 0 ? (
          <div className="text-gray-400 text-center mt-8">
            Inventory Empty
          </div>
        ) : (
          <div className="space-y-2">
            {allItems.map((item, index) => {
              const rarityColor = getRarityColor(item.rarity);
              const rarityBgColor = getRarityBgColor(item.rarity);
              const equippedBy = getEquippedBy();

              return (
                <div
                  key={item.uniqueId || index}
                  className={`${rarityBgColor} border rounded-lg p-3 transition-all duration-200 ${
                    equippedBy ? 'ring-2 ring-green-500/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${rarityColor}`}>
                        {item.rarity.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">{item.type}</span>
                    </div>
                    {equippedBy && (
                      <span className="text-xs text-green-400 font-semibold">
                        Equipped by {equippedBy}
                      </span>
                    )}
                  </div>

                  <div className="text-white font-semibold text-sm mb-2">
                    {item.name}
                  </div>

                  <div className="text-xs text-gray-300 mb-2">
                    <div>Attack: +{item.attackBonus}</div>
                    <div>Health: +{item.healthBonus}</div>
                    <div>Owner: {item.originalOwner}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedHero}
                      onChange={(e) => setSelectedHero(e.target.value)}
                      className="flex-1 text-xs bg-gray-700 text-white rounded px-2 py-1 border border-gray-600"
                    >
                      {heroOptions.map(hero => (
                        <option key={hero} value={hero}>{hero}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => onEquipItem(item, selectedHero)}
                      className="px-3 py-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-semibold rounded transition-all duration-200"
                    >
                      Equip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
