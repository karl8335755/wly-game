import React from 'react';
import { BattleState } from '../hooks/useBattle';

interface BattleControlsProps {
  battleState: BattleState;
  completedLevels: Set<number>;
  recruitedGenerals: string[];
  onStartBattle: () => void;
  onNextLevel: () => void;
  onBackToCity: () => void;
}

export const BattleControls: React.FC<BattleControlsProps> = ({
  battleState,
  completedLevels,
  recruitedGenerals,
  onStartBattle,
  onNextLevel,
  onBackToCity
}) => {
  const canStartBattle = recruitedGenerals.length > 0;
  const canProceedToNextLevel = completedLevels.has(battleState.currentLevel);
  const nextLevel = battleState.currentLevel + 1;

  return (
    <div className="bg-gray-800/90 rounded-lg p-4 mb-4">
      {/* Debug: Show completed levels */}
      <div className="text-xs text-gray-400 mb-4">
        Completed: {Array.from(completedLevels).join(', ') || 'None'}
      </div>

      {/* Battle Control Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onStartBattle}
          disabled={!canStartBattle || battleState.isActive}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
            canStartBattle && !battleState.isActive
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {recruitedGenerals.length === 0
            ? 'Recruit Heroes First'
            : battleState.isActive
            ? 'Battle in Progress...'
            : completedLevels.has(battleState.currentLevel)
            ? 'Grind Level'
            : 'Start Battle'
          }
        </button>

        <button
          onClick={onNextLevel}
          disabled={!canProceedToNextLevel || battleState.isActive}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
            canProceedToNextLevel && !battleState.isActive
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {battleState.currentLevel === 1 && completedLevels.size === 0
            ? 'Start with Level 1'
            : !canProceedToNextLevel
            ? `Complete Level ${battleState.currentLevel} First`
            : `Next Level (${nextLevel})`
          }
        </button>

        <button
          onClick={onBackToCity}
          className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Back to City
        </button>
      </div>
    </div>
  );
};
