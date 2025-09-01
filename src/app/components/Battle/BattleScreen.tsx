import React from 'react';
import { BattleControls } from './BattleControls';
import { BattleLog } from './BattleLog';
import { SoldiersDisplay } from './SoldiersDisplay';
import { HeroesDisplay } from './HeroesDisplay';
import { InventoryPanel } from '../Inventory/InventoryPanel';
import { BattleState, HeroInBattle } from '../hooks/useBattle';
import { InventoryItem } from '../hooks/useInventory';

interface BattleScreenProps {
  battleState: BattleState;
  completedLevels: Set<string>;
  heroesInBattle: HeroInBattle[];
  recruitedGenerals: string[];
  allItems: InventoryItem[];
  selectedHero: string;
  onSelectHero: (heroName: string) => void;
  onStartBattle: () => void;
  onNextLevel: () => void;
  onChangeToLevel: (level: number) => void;
  onBackToCity: () => void;
  onEquipItem: (item: InventoryItem) => void;
  onSellItem: (item: InventoryItem) => void;
  onSellAllItems: () => void;
  onToggleSpeed: () => void;
  sellMessage: string;
  heroEquippedGear: {
    [heroName: string]: {
      weapon: any | null;
      armor: any | null;
    };
  };
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  battleState,
  completedLevels,
  heroesInBattle,
  recruitedGenerals,
  allItems,
  selectedHero,
  onSelectHero,
  onStartBattle,
  onNextLevel,
  onChangeToLevel,
  onBackToCity,
  onEquipItem,
  onSellItem,
  onSellAllItems,
  onToggleSpeed,
  sellMessage,
  heroEquippedGear
}) => {
  return (
    <div className="max-w-7xl mx-auto">
      {/* Battle Controls */}
      <BattleControls
        battleState={battleState}
        completedLevels={completedLevels}
        recruitedGenerals={recruitedGenerals}
        onStartBattle={onStartBattle}
        onNextLevel={onNextLevel}
        onChangeToLevel={onChangeToLevel}
        onBackToCity={onBackToCity}
        onToggleSpeed={onToggleSpeed}
      />

      {/* Battle Layout */}
      <div className="flex flex-col gap-4 h-[calc(100vh-200px)]">
        {/* Row 1: Heroes and 黄巾军 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
          {/* Heroes Side */}
          <div>
            <HeroesDisplay 
              heroesInBattle={heroesInBattle}
              recruitedGenerals={recruitedGenerals}
              selectedHero={selectedHero}
              onSelectHero={onSelectHero}
              heroEquippedGear={heroEquippedGear}
            />
          </div>

          {/* Soldiers Side */}
          <div>
            <SoldiersDisplay 
              soldiers={battleState.soldiers}
              currentLevel={battleState.currentLevel}
            />
          </div>
        </div>

        {/* Row 3: Battle Log and Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
          {/* Battle Log */}
          <div>
            <BattleLog battleLog={battleState.battleLog} />
          </div>

          {/* Inventory */}
          <div>
            <InventoryPanel
              allItems={allItems}
              selectedHero={selectedHero}
              onEquipItem={onEquipItem}
              onSellItem={onSellItem}
              onSellAllItems={onSellAllItems}
              sellMessage={sellMessage}
              heroEquippedGear={heroEquippedGear}
            />

          </div>
        </div>
      </div>
    </div>
  );
};
