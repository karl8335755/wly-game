'use client';

import React from 'react';
import { Navigation } from './components/UI/Navigation';
import { CityScreen } from './components/City/CityScreen';
import { ArmyScreen } from './components/Army/ArmyScreen';
import { BattleScreen } from './components/Battle/BattleScreen';
import { ShopScreen } from './components/Shop/ShopScreen';
import { useGameState } from './components/hooks/useGameState';
import { useBattle } from './components/hooks/useBattle';
import { useInventory } from './components/hooks/useInventory';
import { getUniqueIdRegistryInfo } from './utils/uniqueId';

export default function Home() {
  // Global hero selection state
  const [selectedHero, setSelectedHero] = React.useState<string>('');

  // Game state management
  const {
    currentScreen,
    resources,
    cityTier,
    populationCapacity,
    recruitedGenerals,
    farmCount,
    addGold,
    addFood,
    upgradeCity,
    purchaseFarm,
    recruitGeneral,
    getCurrentPopulationUsed,
    changeScreen
  } = useGameState();

  // Inventory management
  const {
    heroEquippedGear,
    sellMessage,
    getAllItems,
    addItemToInventory,
    equipItem,
    sellItem,
    sellAllItems
  } = useInventory();

  // Battle management
  const {
    battleState,
    completedLevels,
    heroesInBattle,
    startBattle,
    nextLevel,
    changeToLevel,
    stopBattle,
    toggleSpeed,
    refreshHeroesInBattle
  } = useBattle(heroEquippedGear);

  // Handle loot drops from battle
  const handleLootDrop = (item: any) => {
    if (item && item.id) {
      // This is a new item being dropped
      // Use the uniqueId that was already generated in the battle hook
      const newItem = {
        ...item,
        originalOwner: item.owner || 'All Heroes'
      };
      const result = addItemToInventory(newItem);
      
      // If item was auto-sold, add the gold
      if (result && result.autoSold && result.value > 0) {
        addGold(result.value);
      }
    } else {
      // This is a request to get current items count
      const items = getAllItems();
      return items;
    }
  };

  // Handle selling all items
  const handleSellAllItems = () => {
    const totalValue = sellAllItems();
    addGold(totalValue);
  };

  // Handle city upgrade
  const handleUpgradeCity = () => {
    const success = upgradeCity();
    if (success) {
      // Update the sell message for city upgrade feedback
      // This would need to be handled differently since sellMessage is in inventory hook
    }
    return success;
  };

  // Handle hero recruitment
  const handleRecruitGeneral = (heroName: string, cost: number) => {
    return recruitGeneral(heroName, cost);
  };

  // Refresh heroes in battle when recruitedGenerals changes
  React.useEffect(() => {
    if (recruitedGenerals.length > 0) {
      refreshHeroesInBattle(recruitedGenerals);
    }
  }, [recruitedGenerals, refreshHeroesInBattle]);

  // Handle battle start
  const handleStartBattle = () => {
    startBattle(recruitedGenerals, handleLootDrop);
  };

  // Handle next level
  const handleNextLevel = () => {
    nextLevel(handleLootDrop, recruitedGenerals);
  };

  // Handle change to specific level
  const handleChangeToLevel = (level: number) => {
    changeToLevel(level, handleLootDrop, recruitedGenerals);
  };

  // Handle back to city
  const handleBackToCity = () => {
    stopBattle();
    changeScreen('city');
  };

  // Handle equip item
  const handleEquipItem = (item: any) => {
    if (selectedHero) {
      equipItem(item, selectedHero);
    }
  };

  // Handle sell item
  const handleSellItem = (item: any) => {
    const goldGained = sellItem(item);
    addGold(goldGained);
  };

  return (
    <div className="h-screen bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: 'url(/sgbg.jpg)' }}>
      {/* Navigation */}
      <Navigation currentScreen={currentScreen} onScreenChange={changeScreen} />

      {/* Main Content */}
      <div className="p-3 h-[calc(100vh-100px)] overflow-y-auto">
        {currentScreen === 'city' && (
          <CityScreen
            resources={resources}
            cityTier={cityTier}
            populationCapacity={populationCapacity}
            currentPopulationUsed={getCurrentPopulationUsed()}
            onUpgradeCity={handleUpgradeCity}
            farmCount={farmCount}
            onPurchaseFarm={purchaseFarm}
          />
        )}

        {currentScreen === 'army' && (
          <ArmyScreen
            recruitedGenerals={recruitedGenerals}
            onRecruitGeneral={handleRecruitGeneral}
            resources={resources}
          />
        )}

        {currentScreen === 'battle' && (
          <BattleScreen
            battleState={battleState}
            completedLevels={completedLevels}
            heroesInBattle={heroesInBattle}
            recruitedGenerals={recruitedGenerals}
            allItems={getAllItems()}
            selectedHero={selectedHero}
            onSelectHero={setSelectedHero}
            onStartBattle={handleStartBattle}
            onNextLevel={handleNextLevel}
            onChangeToLevel={handleChangeToLevel}
            onBackToCity={handleBackToCity}
            onEquipItem={handleEquipItem}
            onSellItem={handleSellItem}
            onSellAllItems={handleSellAllItems}
            onToggleSpeed={toggleSpeed}
            sellMessage={sellMessage}
            heroEquippedGear={heroEquippedGear}
          />
        )}

        {currentScreen === 'shop' && (
          <ShopScreen
            resources={resources}
            currentLevel={battleState.currentLevel}
            onAddGold={addGold}
            onAddFood={addFood}
            onPurchaseItem={(item) => {
              const price = item.rarity === 'uncommon' ? 500 :
                           item.rarity === 'rare' ? 1000 : 
                           item.rarity === 'epic' ? 2500 :
                           item.rarity === 'legendary' ? 5000 : 15000;
              if (resources.gold >= price) {
                addGold(-price); // Spend gold
                const newItem = {
                  ...item,
                  originalOwner: 'Shop Purchase',
                  uniqueId: `${item.id}_shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                };
                addItemToInventory(newItem);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
