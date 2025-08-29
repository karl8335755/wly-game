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
  completedLevels: Set<number>;
  heroesInBattle: HeroInBattle[];
  recruitedGenerals: string[];
  allItems: InventoryItem[];
  onStartBattle: () => void;
  onNextLevel: () => void;
  onBackToCity: () => void;
  onEquipItem: (item: InventoryItem, heroName: string) => void;
  onSellAllItems: () => void;
  sellMessage: string;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  battleState,
  completedLevels,
  heroesInBattle,
  recruitedGenerals,
  allItems,
  onStartBattle,
  onNextLevel,
  onBackToCity,
  onEquipItem,
  onSellAllItems,
  sellMessage
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
        onBackToCity={onBackToCity}
      />

      {/* Battle Layout */}
      <div className="flex flex-col gap-4 h-[calc(100vh-200px)]">
        {/* Row 1: Level Grid */}
        <div className="flex-shrink-0">
          <div className="bg-gray-800/90 rounded-lg p-4">
            <h2 className="text-lg font-bold text-white mb-3">Level Progress</h2>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
                const isCurrent = level === battleState.currentLevel;
                const isCompleted = completedLevels.has(level);
                const isLocked = level > 1 && !completedLevels.has(level - 1);

                let bgColor = 'bg-gray-600';
                let textColor = 'text-gray-400';
                
                if (isCurrent) {
                  bgColor = 'bg-blue-600';
                  textColor = 'text-white';
                } else if (isCompleted) {
                  bgColor = 'bg-green-600';
                  textColor = 'text-white';
                } else if (isLocked) {
                  bgColor = 'bg-gray-700';
                  textColor = 'text-gray-500';
                }

                return (
                  <div
                    key={level}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${bgColor} ${textColor}`}
                  >
                    {level}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Heroes and Enemies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-shrink-0">
          {/* Heroes Side */}
          <div>
            <HeroesDisplay 
              heroesInBattle={heroesInBattle}
              recruitedGenerals={recruitedGenerals}
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
              onEquipItem={onEquipItem}
              onSellAllItems={onSellAllItems}
              sellMessage={sellMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
