import { useState, useEffect } from 'react';
import { generateUniqueId, registerUniqueId } from '../../utils/uniqueId';

// Types
export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor';
  attackBonus: number;
  healthBonus: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  specialEffect?: 'aoe';
  originalOwner: string;
  uniqueId?: string;
}

export interface HeroEquippedGear {
  [heroName: string]: {
    weapon: InventoryItem | null;
    armor: InventoryItem | null;
  };
}



export const useInventory = () => {
  const [heroInventories, setHeroInventories] = useState<{
    [heroName: string]: InventoryItem[]
  }>({});

  const [heroEquippedGear, setHeroEquippedGear] = useState<HeroEquippedGear>({});
  const [sellMessage, setSellMessage] = useState<string>('');

  const INVENTORY_SLOTS = 20;

  // Get all items from all heroes for unified inventory view
  const getAllItems = (): InventoryItem[] => {
    const allItems: InventoryItem[] = [];
    
    Object.entries(heroInventories).forEach(([heroName, items]) => {
      items.forEach(item => {
        allItems.push({ ...item, originalOwner: item.originalOwner || heroName });
      });
    });
    
    // Register all existing uniqueIds to prevent duplicates
    allItems.forEach(item => {
      if (item.uniqueId) {
        registerUniqueId(item.uniqueId);
      }
    });
    
    return allItems.sort((a, b) => {
      // Sort by rarity first (mythic > legendary > epic > rare > common)
      const rarityOrder = { mythic: 5, legendary: 4, epic: 3, rare: 2, common: 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      
      // Then by type (weapons first)
      if (a.type !== b.type) return a.type === 'weapon' ? -1 : 1;
      
      // Then by total stats
      const aStats = a.attackBonus + a.healthBonus;
      const bStats = b.attackBonus + b.healthBonus;
      return bStats - aStats;
    });
  };



  // Add item to inventory
  const addItemToInventory = (item: InventoryItem) => {
    console.log('addItemToInventory called with:', item);
    console.log('Item uniqueId:', item.uniqueId);
    console.log('Item has uniqueId:', !!item.uniqueId);
    const allItems = getAllItems();
    console.log('Current inventory size:', allItems.length, 'Max slots:', INVENTORY_SLOTS);
    if (allItems.length >= INVENTORY_SLOTS) {
      setSellMessage('📦 Inventory full! Cannot collect more items.');
      setTimeout(() => setSellMessage(''), 3000);
      console.log('Inventory full, cannot add item');
      return false;
    }

    // Only generate uniqueId if it doesn't already exist
    let itemWithUniqueId = { ...item };
    
    if (!item.uniqueId) {
      itemWithUniqueId = {
        ...item,
        uniqueId: generateUniqueId(item.id)
      };
      console.log('Generated new uniqueId:', itemWithUniqueId.uniqueId);
    } else {
      console.log('Using existing uniqueId:', item.uniqueId);
      // Register the existing uniqueId to prevent future duplicates
      registerUniqueId(item.uniqueId);
      itemWithUniqueId = { ...item }; // Keep the existing uniqueId
    }

    setHeroInventories(prev => {
      const owner = itemWithUniqueId.originalOwner || 'All Heroes';
      const updated = {
        ...prev,
        [owner]: [...(prev[owner] || []), itemWithUniqueId]
      };
      console.log('Updated hero inventories:', updated);
      return updated;
    });

    console.log('Item added to inventory successfully with uniqueId:', itemWithUniqueId.uniqueId);
    return true;
  };

  // Equip item to hero
  const equipItem = (item: InventoryItem, heroName: string) => {
    setHeroEquippedGear(prev => {
      const currentGear = prev[heroName] || { weapon: null, armor: null };
      
      // Unequip existing item of same type
      if (currentGear[item.type]) {
        // Add back to inventory
        setHeroInventories(invPrev => {
          const owner = item.originalOwner || 'All Heroes';
          return {
            ...invPrev,
            [owner]: [...(invPrev[owner] || []), currentGear[item.type]!]
          };
        });
      }

      // Remove from inventory
      setHeroInventories(invPrev => {
        const owner = item.originalOwner || 'All Heroes';
        return {
          ...invPrev,
          [owner]: (invPrev[owner] || []).filter(invItem => invItem.uniqueId !== item.uniqueId)
        };
      });

      return {
        ...prev,
        [heroName]: {
          ...currentGear,
          [item.type]: item
        }
      };
    });

          // setSellMessage(`⚔️ ${item.name} equipped to ${heroName}!`);
    setTimeout(() => setSellMessage(''), 3000);
  };

  // Unequip item from hero
  const unequipItem = (heroName: string, itemType: 'weapon' | 'armor') => {
    setHeroEquippedGear(prev => {
      const currentGear = prev[heroName];
      if (!currentGear || !currentGear[itemType]) return prev;

      const item = currentGear[itemType]!;
      
      // Add back to inventory
      setHeroInventories(invPrev => {
        const owner = item.originalOwner || 'All Heroes';
        return {
          ...invPrev,
          [owner]: [...(invPrev[owner] || []), item]
        };
      });

      return {
        ...prev,
        [heroName]: {
          ...currentGear,
          [itemType]: null
        }
      };
    });
  };

  // Sell a single item
  const sellItem = (itemToSell: InventoryItem) => {
    const rarityValues = { common: 10, rare: 25, epic: 50, legendary: 100, mythic: 200 };
    const itemValue = rarityValues[itemToSell.rarity];
    
    // Remove item from inventory
    setHeroInventories(prev => {
      const newInventories = { ...prev };
      const owner = itemToSell.originalOwner || 'All Heroes';
      
      if (newInventories[owner]) {
        newInventories[owner] = newInventories[owner].filter(item => item.uniqueId !== itemToSell.uniqueId);
      }
      
      return newInventories;
    });
    
    setSellMessage(`💰 Sold ${itemToSell.name} for ${itemValue} gold!`);
    setTimeout(() => setSellMessage(''), 3000);
    
    return itemValue;
  };

  // Sell all items
  const sellAllItems = () => {
    const allItems = getAllItems();
    if (allItems.length === 0) {
      setSellMessage('📦 No items to sell!');
      setTimeout(() => setSellMessage(''), 3000);
      return 0;
    }

    const totalValue = allItems.reduce((sum, item) => {
      const rarityValues = { common: 10, rare: 25, epic: 50, legendary: 100, mythic: 200 };
      return sum + rarityValues[item.rarity];
    }, 0);

    // Clear all inventories
    setHeroInventories({});
    
    setSellMessage(`💰 Sold all items for ${totalValue} gold!`);
    setTimeout(() => setSellMessage(''), 4000);

    return totalValue;
  };

  // Check if item is equipped
  const isItemEquipped = (item: InventoryItem): boolean => {
    return Object.values(heroEquippedGear).some(gear => 
      gear.weapon?.uniqueId === item.uniqueId || gear.armor?.uniqueId === item.uniqueId
    );
  };

  // Get hero that has item equipped
  const getEquippedBy = (item: InventoryItem): string | null => {
    for (const [heroName, gear] of Object.entries(heroEquippedGear)) {
      if (gear.weapon?.uniqueId === item.uniqueId || gear.armor?.uniqueId === item.uniqueId) {
        return heroName;
      }
    }
    return null;
  };

  // Enforce inventory limit every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const allItems = getAllItems();
      if (allItems.length <= INVENTORY_SLOTS) return;

      // Remove oldest items to get down to capacity
      const itemsToKeep = allItems.slice(0, INVENTORY_SLOTS);
      
      // Rebuild hero inventories with only kept items
      const newHeroInventories: { [heroName: string]: InventoryItem[] } = {};
      
      itemsToKeep.forEach(item => {
        const owner = item.originalOwner;
        if (!newHeroInventories[owner]) {
          newHeroInventories[owner] = [];
        }
        newHeroInventories[owner].push(item);
      });
      
      setHeroInventories(newHeroInventories);
    }, 5000);
    return () => clearInterval(interval);
  }, [getAllItems, INVENTORY_SLOTS]);

  return {
    heroInventories,
    heroEquippedGear,
    sellMessage,
    getAllItems,
    addItemToInventory,
    equipItem,
    unequipItem,
    sellItem,
    sellAllItems,
    isItemEquipped,
    getEquippedBy,
    INVENTORY_SLOTS
  };
};
