import React, { useState, useMemo } from 'react';
import { InventoryItem } from '../hooks/useInventory';

// Custom Tooltip Component
const ItemTooltip: React.FC<{ item: InventoryItem; equippedBy: string | null; isVisible: boolean }> = ({ 
  item, 
  equippedBy, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute z-50 bg-gray-900 border border-gray-600 rounded-lg p-3 shadow-xl text-white text-sm min-w-48 -top-2 left-full ml-2">
      <div className="font-bold text-lg mb-2">{item.name}</div>
      <div className="text-gray-300 mb-1">{item.rarity} {item.type}</div>
      {item.type === 'weapon' && (
        <div className="text-green-400 mb-2">+{item.attackBonus} ATK</div>
      )}
      {item.type === 'armor' && (
        <div className="text-blue-400 mb-2">+{item.healthBonus} HP</div>
      )}
      {item.specialEffect && (
        <div className="text-orange-400 mb-2">Special: {item.specialEffect}</div>
      )}
      {equippedBy && (
        <div className="text-yellow-400 font-semibold border-t border-gray-600 pt-2">
          Equipped by {equippedBy}
        </div>
      )}
    </div>
  );
};

interface InventoryPanelProps {
  allItems: InventoryItem[];
  selectedHero: string;
  onEquipItem: (item: InventoryItem) => void;
  onSellItem: (item: InventoryItem) => void;
  onSellAllItems: () => void;
  sellMessage: string;
  heroEquippedGear: {
    [heroName: string]: {
      weapon: InventoryItem | null;
      armor: InventoryItem | null;
    };
  };
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({
  allItems,
  selectedHero,
  onEquipItem,
  onSellItem,
  onSellAllItems,
  sellMessage,
  heroEquippedGear
}) => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const heroOptions = ['刘备', '关羽', '张飞', '诸葛亮'];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'text-purple-400 bg-purple-900/30';
      case 'legendary': return 'text-orange-400 bg-orange-900/30';
      case 'epic': return 'text-purple-400 bg-purple-900/30';
      case 'rare': return 'text-blue-400 bg-blue-900/30';
      case 'uncommon': return 'text-green-400 bg-green-900/30';
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
      case 'uncommon': return 'bg-gradient-to-r from-green-900/50 to-green-800/50 border-green-500/50';
      case 'common': return 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-500/50';
      default: return 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-500/50';
    }
  };

  const getEquippedRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'bg-gradient-to-br from-purple-900/80 to-purple-800/60 border-purple-400 scale-105 shadow-purple-500/30 hover:scale-110 hover:shadow-lg';
      case 'legendary': return 'bg-gradient-to-br from-orange-900/80 to-orange-800/60 border-orange-400 scale-105 shadow-orange-500/30 hover:scale-110 hover:shadow-lg';
      case 'epic': return 'bg-gradient-to-br from-purple-900/80 to-purple-800/60 border-purple-400 scale-105 shadow-purple-500/30 hover:scale-110 hover:shadow-lg';
      case 'rare': return 'bg-gradient-to-br from-blue-900/80 to-blue-800/60 border-blue-400 scale-105 shadow-blue-500/30 hover:scale-110 hover:shadow-lg';
      case 'uncommon': return 'bg-gradient-to-br from-green-900/80 to-green-800/60 border-green-400 scale-105 shadow-green-500/30 hover:scale-110 hover:shadow-lg';
      case 'common': return 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-400 scale-105 shadow-gray-500/30 hover:scale-110 hover:shadow-lg';
      default: return 'bg-gradient-to-br from-gray-900/80 to-gray-800/60 border-gray-400 scale-105 shadow-gray-500/30 hover:scale-110 hover:shadow-lg';
    }
  };

  const getEquippedRarityRingColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'ring-3 ring-purple-400 shadow-xl';
      case 'legendary': return 'ring-3 ring-orange-400 shadow-xl';
      case 'epic': return 'ring-3 ring-purple-400 shadow-xl';
      case 'rare': return 'ring-3 ring-blue-400 shadow-xl';
      case 'uncommon': return 'ring-3 ring-green-400 shadow-xl';
      case 'common': return 'ring-3 ring-gray-400 shadow-xl';
      default: return 'ring-3 ring-gray-400 shadow-xl';
    }
  };

  const getEquippedRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'text-purple-200 font-bold';
      case 'legendary': return 'text-orange-200 font-bold';
      case 'epic': return 'text-purple-200 font-bold';
      case 'rare': return 'text-blue-200 font-bold';
      case 'uncommon': return 'text-green-200 font-bold';
      case 'common': return 'text-gray-200 font-bold';
      default: return 'text-gray-200 font-bold';
    }
  };

  const getEquippedRarityStatsColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'text-purple-300 font-semibold';
      case 'legendary': return 'text-orange-300 font-semibold';
      case 'epic': return 'text-purple-300 font-semibold';
      case 'rare': return 'text-blue-300 font-semibold';
      case 'uncommon': return 'text-green-300 font-semibold';
      case 'common': return 'text-gray-300 font-semibold';
      default: return 'text-gray-300 font-semibold';
    }
  };

  const getEquippedRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'bg-gradient-to-r from-purple-600 to-purple-500 text-white border-purple-400';
      case 'legendary': return 'bg-gradient-to-r from-orange-600 to-orange-500 text-white border-orange-400';
      case 'epic': return 'bg-gradient-to-r from-purple-600 to-purple-500 text-white border-purple-400';
      case 'rare': return 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-400';
      case 'uncommon': return 'bg-gradient-to-r from-green-600 to-green-500 text-white border-green-400';
      case 'common': return 'bg-gradient-to-r from-gray-600 to-gray-500 text-white border-gray-400';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-500 text-white border-gray-400';
    }
  };

  const getEquippedBy = (item: InventoryItem): string | null => {
    // Check if this item is equipped by any hero
    if (!heroEquippedGear) {
      return null;
    }
    
    for (const [heroName, gear] of Object.entries(heroEquippedGear)) {
      if (gear.weapon?.uniqueId === item.uniqueId || gear.armor?.uniqueId === item.uniqueId) {
        return heroName;
      }
    }
    return null;
  };

  // Check if an item is an upgrade for the selected hero
  const isUpgrade = (item: InventoryItem): boolean => {
    if (!selectedHero || !heroEquippedGear || !heroEquippedGear[selectedHero]) {
      return false;
    }

    const equippedGear = heroEquippedGear[selectedHero];
    const equippedItem = equippedGear[item.type]; // weapon or armor

    if (!equippedItem) {
      // No item equipped of this type, so any item is an upgrade
      return true;
    }

    // Calculate total stats for comparison
    const itemTotalStats = item.attackBonus + item.healthBonus;
    const equippedTotalStats = equippedItem.attackBonus + equippedItem.healthBonus;

    // Check if the item has better stats
    if (itemTotalStats > equippedTotalStats) {
      return true;
    }

    // If stats are equal, check rarity (higher rarity is better)
    const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };
    const itemRarity = rarityOrder[item.rarity] || 1;
    const equippedRarity = rarityOrder[equippedItem.rarity] || 1;

    if (itemRarity > equippedRarity) {
      return true;
    }

    return false;
  };

  // Get upgrade suggestion text
  const getUpgradeSuggestion = (item: InventoryItem): string => {
    if (!selectedHero || !heroEquippedGear || !heroEquippedGear[selectedHero]) {
      return '';
    }

    const equippedGear = heroEquippedGear[selectedHero];
    const equippedItem = equippedGear[item.type];

    if (!equippedItem) {
      return 'Equip';
    }

    const itemTotalStats = item.attackBonus + item.healthBonus;
    const equippedTotalStats = equippedItem.attackBonus + equippedItem.healthBonus;
    const statDiff = itemTotalStats - equippedTotalStats;

    if (statDiff > 0) {
      return `+${statDiff} Stats`;
    } else if (statDiff === 0) {
      const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };
      const itemRarity = rarityOrder[item.rarity] || 1;
      const equippedRarity = rarityOrder[equippedItem.rarity] || 1;
      
      if (itemRarity > equippedRarity) {
        return 'Better Rarity';
      }
    }

    return '';
  };

    // Sort items by strength (always strongest first)
  const sortedItems = useMemo(() => {
    const sorted = [...allItems].sort((a, b) => {
      // Calculate total stats for each item
      const aTotalStats = a.attackBonus + a.healthBonus;
      const bTotalStats = b.attackBonus + b.healthBonus;
      
      // If stats are equal, sort by rarity
      if (aTotalStats === bTotalStats) {
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };
        const aRarity = rarityOrder[a.rarity] || 1;
        const bRarity = rarityOrder[b.rarity] || 1;
        
        return bRarity - aRarity; // Higher rarity first
      }
      
      // Sort by total stats (strongest first)
      return bTotalStats - aTotalStats; // Higher stats first
    });
    
    return sorted;
  }, [allItems]);

  return (
    <div className="bg-gray-800/90 rounded-lg p-4 h-64 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-white">Inventory</h2>
            {selectedHero && (
              <div className="text-xs text-blue-400">
                Selected: {selectedHero}
              </div>
            )}
          </div>
          {/* Sell Message - Next to title */}
          {sellMessage && (
            <div className="text-white text-sm font-semibold bg-gray-800/50 px-2 py-1 rounded border border-gray-600">
              {sellMessage}
            </div>
          )}
        </div>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {allItems.length === 0 ? (
          <div className="text-gray-400 text-center mt-8">
            Inventory Empty
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-1 max-h-40">
            {sortedItems.map((item, index) => {
              const rarityColor = getRarityColor(item.rarity);
              const rarityBgColor = getRarityBgColor(item.rarity);
              const equippedBy = getEquippedBy(item);
              // Use uniqueId as key, with fallback to index
              const itemKey = item.uniqueId || `fallback_${item.id}_${index}`;
              const isItemUpgrade = isUpgrade(item);
              const upgradeSuggestion = getUpgradeSuggestion(item);

              return (
                <div
                  key={itemKey}
                  className={`${equippedBy ? getEquippedRarityBgColor(item.rarity) : rarityBgColor} border rounded p-1 transition-all duration-200 aspect-square relative cursor-pointer ${
                    equippedBy 
                      ? getEquippedRarityRingColor(item.rarity)
                      : ''
                  } ${isItemUpgrade && !equippedBy ? 'ring-2 ring-green-400 shadow-lg' : ''}`}
                  onMouseEnter={equippedBy ? () => setHoveredItem(item.uniqueId || itemKey) : undefined}
                  onMouseLeave={equippedBy ? () => setHoveredItem(null) : undefined}
                >
                  {/* Rarity Badge */}
                  <div className="absolute top-0 left-0">
                    <span className={`text-xs font-bold px-1 py-0.5 rounded ${rarityColor}`}>
                      {item.rarity.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Equipped Indicator */}
                  {equippedBy && (
                    <div className="absolute top-0 right-0">
                      <div className={`${getEquippedRarityBadgeColor(item.rarity)} text-xs font-bold px-2 py-1 rounded-bl shadow-lg`}>
                        {equippedBy}
                      </div>
                    </div>
                  )}

                  {/* Custom Tooltip - Only for equipped items */}
                  {equippedBy && (
                    <ItemTooltip 
                      item={item} 
                      equippedBy={equippedBy} 
                      isVisible={hoveredItem === (item.uniqueId || itemKey)} 
                    />
                  )}
                  
                  {/* Item Name */}
                  <div className={`font-semibold text-xs text-center mt-4 truncate px-1 ${
                    equippedBy ? getEquippedRarityTextColor(item.rarity) : 'text-white'
                  }`}>
                    {item.name}
                  </div>
                  
                  {/* Stats */}
                  <div className={`text-xs text-center mt-1 ${
                    equippedBy ? getEquippedRarityStatsColor(item.rarity) : 'text-gray-300'
                  }`}>
                    {item.type === 'weapon' && (
                      <div>+{item.attackBonus} ATK</div>
                    )}
                    {item.type === 'armor' && (
                      <div>+{item.healthBonus} HP</div>
                    )}
                    {item.specialEffect && (
                      <div className="text-orange-400">AOE</div>
                    )}
                  </div>

                  {/* Upgrade Suggestion */}
                  {isItemUpgrade && upgradeSuggestion && (
                    <div className="absolute top-0 right-0 z-10">
                      <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-bl shadow-lg border border-green-300">
                        {upgradeSuggestion}
                      </div>
                    </div>
                  )}
                  
                  {/* Always Visible Equip and Sell Buttons */}
                  <div className="absolute bottom-1 right-1 flex gap-1">
                    {selectedHero ? (
                      equippedBy ? (
                        <button
                          onClick={() => onEquipItem(item)}
                          className="w-12 h-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-semibold rounded transition-all duration-200 flex items-center justify-center"
                        >
                          Unequip
                        </button>
                      ) : (
                        <button
                          onClick={() => onEquipItem(item)}
                          className="w-12 h-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs font-semibold rounded transition-all duration-200 flex items-center justify-center"
                        >
                          Equip
                        </button>
                      )
                    ) : (
                      <div className="w-12 h-6 bg-gray-600 text-gray-400 text-xs rounded flex items-center justify-center">
                        Select Hero
                      </div>
                    )}
                    <button
                      onClick={() => onSellItem(item)}
                      className="w-12 h-6 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white text-xs font-semibold rounded transition-all duration-200 flex items-center justify-center"
                    >
                      Sell
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
