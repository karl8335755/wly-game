import { useState, useEffect } from 'react';
import { generateUniqueId, registerUniqueId } from '../../utils/uniqueId';

// Types
export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor';
  attackBonus: number;
  healthBonus: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
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

  const [heroEquippedGear, setHeroEquippedGear] = useState<HeroEquippedGear>({
    '刘备': {
      weapon: {
        id: 'legendary_sword_1',
        name: 'Excalibur',
        type: 'weapon',
        attackBonus: 50,
        healthBonus: 20,
        rarity: 'legendary',
        specialEffect: 'aoe',
        originalOwner: '刘备',
        uniqueId: 'test_excalibur_liubei'
      },
      armor: null
    }
  });
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
    
    // Remove any duplicates that might have slipped through
    const uniqueItems = allItems.filter((item, index, self) => 
      index === self.findIndex(t => t.uniqueId === item.uniqueId)
    );
    
    return uniqueItems.sort((a, b) => {
      // Sort by rarity first (mythic > legendary > epic > rare > uncommon > common)
      const rarityOrder = { mythic: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
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
    const allItems = getAllItems();
    if (allItems.length >= INVENTORY_SLOTS) {
      setSellMessage('Inventory full!');
      setTimeout(() => setSellMessage(''), 3000);
      return false;
    }

    // Check if this item already exists in inventory
    const existingItems = getAllItems();
    if (item.uniqueId && existingItems.some(existing => existing.uniqueId === item.uniqueId)) {
      return false;
    }
    
    // Double-check: also check if the item exists by its properties (in case uniqueId is missing)
    const duplicateByProperties = existingItems.some(existing => 
      existing.id === item.id && 
      existing.name === item.name && 
      existing.type === item.type &&
      existing.rarity === item.rarity &&
      existing.attackBonus === item.attackBonus &&
      existing.healthBonus === item.healthBonus
    );
    
    if (duplicateByProperties) {
      return false;
    }

    // Auto-sell logic: Check if item is worse than equipped gear
    const shouldAutoSell = shouldAutoSellItem(item);
    if (shouldAutoSell) {
      const rarityValues = { common: 150, uncommon: 300, rare: 600, epic: 1200, legendary: 3000, mythic: 7500 };
      const sellValue = rarityValues[item.rarity];
      setSellMessage(`Sold ${item.name} +${sellValue}g`);
      setTimeout(() => setSellMessage(''), 3000);
      return { autoSold: true, value: sellValue };
    }
    
    // Only generate uniqueId if it doesn't already exist
    let itemWithUniqueId = { ...item };
    
    if (!item.uniqueId) {
      itemWithUniqueId = {
        ...item,
        uniqueId: generateUniqueId(item.id)
      };
    } else {
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
      return updated;
    });

    return { autoSold: false, value: 0 };
  };

  // Check if item should be auto-sold
  const shouldAutoSellItem = (item: InventoryItem): boolean => {
    // If no heroes have equipped gear, don't auto-sell
    if (Object.keys(heroEquippedGear).length === 0) {
      return false;
    }

    // Check if item is worse than ALL heroes' equipped gear of the same type
    const itemType = item.type; // 'weapon' or 'armor'
    const itemTotalStats = item.attackBonus + item.healthBonus;
    const rarityOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6 };
    const itemRarity = rarityOrder[item.rarity] || 1;

    // Check each hero's equipped gear
    for (const [heroName, gear] of Object.entries(heroEquippedGear)) {
      const equippedItem = gear[itemType]; // weapon or armor
      
      if (equippedItem) {
        const equippedTotalStats = equippedItem.attackBonus + equippedItem.healthBonus;
        const equippedRarity = rarityOrder[equippedItem.rarity] || 1;

        // If equipped item has better stats AND rarity, auto-sell the new item
        if (equippedTotalStats > itemTotalStats && equippedRarity >= itemRarity) {
          return true;
        }
        
        // If stats are equal but equipped item has higher rarity, auto-sell
        if (equippedTotalStats === itemTotalStats && equippedRarity > itemRarity) {
          return true;
        }
      }
    }

    return false;
  };

  // Equip item to hero
  const equipItem = (item: InventoryItem, heroName: string) => {
    setHeroEquippedGear(prev => {
      const currentGear = prev[heroName] || { weapon: null, armor: null };
      const previouslyEquippedItem = currentGear[item.type];
      
      // Update equipped gear first
      const newEquippedGear = {
        ...prev,
        [heroName]: {
          ...currentGear,
          [item.type]: item
        }
      };
      
      // Then update inventory in a single operation to avoid duplicates
      setHeroInventories(invPrev => {
        const owner = item.originalOwner || 'All Heroes';
        const currentInventory = invPrev[owner] || [];
        
        // Remove the item being equipped
        const inventoryWithoutEquippedItem = currentInventory.filter(invItem => invItem.uniqueId !== item.uniqueId);
        
        // Add back the previously equipped item (if any)
        const finalInventory = previouslyEquippedItem 
          ? [...inventoryWithoutEquippedItem, previouslyEquippedItem]
          : inventoryWithoutEquippedItem;
        
        return {
          ...invPrev,
          [owner]: finalInventory
        };
      });
      
      return newEquippedGear;
    });

    setSellMessage(`Equipped ${item.name}`);
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
    const rarityValues = { common: 150, uncommon: 300, rare: 600, epic: 1200, legendary: 3000, mythic: 7500 };
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
    
    setSellMessage(`Sold ${itemToSell.name} +${itemValue}g`);
    setTimeout(() => setSellMessage(''), 3000);
    
    return itemValue;
  };

  // Sell all items
  const sellAllItems = () => {
    const allItems = getAllItems();
    if (allItems.length === 0) {
      setSellMessage('No items to sell');
      setTimeout(() => setSellMessage(''), 3000);
      return 0;
    }

    const totalValue = allItems.reduce((sum, item) => {
      const rarityValues = { common: 150, uncommon: 300, rare: 600, epic: 1200, legendary: 3000, mythic: 7500 };
      return sum + rarityValues[item.rarity];
    }, 0);

    // Clear all inventories
    setHeroInventories({});
    
    setSellMessage(`Sold all +${totalValue}g`);
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
    shouldAutoSellItem,
    INVENTORY_SLOTS
  };
};
