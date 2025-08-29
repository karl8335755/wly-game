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

export default function Home() {
  // Game state management
  const {
    currentScreen,
    resources,
    cityTier,
    populationCapacity,
    recruitedGenerals,
    addGold,
    addFood,
    upgradeCity,
    recruitGeneral,
    removeGeneral,
    changeScreen
  } = useGameState();

  // Inventory management
  const {
    sellMessage,
    getAllItems,
    addItemToInventory,
    equipItem,
    sellAllItems
  } = useInventory();

  // Battle management
  const {
    battleState,
    completedLevels,
    heroesInBattle,
    startBattle,
    nextLevel,
    stopBattle
  } = useBattle();

  // Handle loot drops from battle
  const handleLootDrop = (item: any) => {
    if (item && item.id) {
      // This is a new item being dropped
      const uniqueId = `${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newItem = {
        ...item,
        uniqueId,
        originalOwner: item.owner || 'All Heroes'
      };
      addItemToInventory(newItem);
    } else {
      // This is a request to get current items count
      return getAllItems();
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

  // Handle battle start
  const handleStartBattle = () => {
    startBattle(recruitedGenerals, handleLootDrop);
  };

  // Handle next level
  const handleNextLevel = () => {
    nextLevel(handleLootDrop);
  };

  // Handle back to city
  const handleBackToCity = () => {
    stopBattle();
    changeScreen('city');
  };

  // Handle equip item
  const handleEquipItem = (item: any, heroName: string) => {
    equipItem(item, heroName);
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
            onUpgradeCity={handleUpgradeCity}
            sellMessage={sellMessage}
          />
        )}

        {currentScreen === 'army' && (
          <ArmyScreen
            recruitedGenerals={recruitedGenerals}
            onRecruitGeneral={recruitGeneral}
            onRemoveGeneral={removeGeneral}
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
            onStartBattle={handleStartBattle}
            onNextLevel={handleNextLevel}
            onBackToCity={handleBackToCity}
            onEquipItem={handleEquipItem}
            onSellAllItems={handleSellAllItems}
            sellMessage={sellMessage}
          />
        )}

        {currentScreen === 'shop' && (
          <ShopScreen
            resources={resources}
            onAddGold={addGold}
            onAddFood={addFood}
          />
        )}
      </div>
    </div>
  );
}
