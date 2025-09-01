import React, { useState } from 'react';
import { BattleState } from '../hooks/useBattle';
import { DropRateDisplay } from './DropRateDisplay';

interface BattleControlsProps {
  battleState: BattleState;
  completedLevels: Set<string>;
  recruitedGenerals: string[];
  onStartBattle: () => void;
  onNextLevel: () => void;
  onChangeToLevel: (level: number) => void;
  onBackToCity: () => void;
  onToggleSpeed: () => void;
}

export const BattleControls: React.FC<BattleControlsProps> = ({
  battleState,
  completedLevels,
  recruitedGenerals,
  onStartBattle,
  onNextLevel,
  onChangeToLevel,
  onBackToCity,
  onToggleSpeed
}) => {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const canStartBattle = recruitedGenerals.length > 0;
  // You can proceed to next level if the current level is completed
  const currentLevelKey = `${battleState.currentChapter}-${battleState.currentLevel}`;
  const canProceedToNextLevel = completedLevels.has(currentLevelKey);
  const nextLevel = battleState.currentLevel + 1;

  return (
    <div className="bg-gray-800/90 rounded-lg p-4 mb-4">


      {/* Debug: Show completed levels */}
      <div className="text-xs text-gray-400 mb-4">
        Chapter: {battleState.currentChapter} | Completed: {Array.from(completedLevels).join(', ') || 'None'} | Current: {battleState.currentLevel} | Can Proceed: {canProceedToNextLevel ? 'Yes' : 'No'}
      </div>

      {/* Battle Control Buttons and Level Progress */}
      <div className="flex items-center justify-between">
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
              : 'Start Battle'
            }
          </button>

          <button
            onClick={onNextLevel}
            disabled={!canProceedToNextLevel}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
              canProceedToNextLevel
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

          {/* Speed Toggle Slider */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300 font-semibold">Speed:</span>
            <button
              onClick={onToggleSpeed}
              disabled={!battleState.isActive}
              className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                battleState.isActive
                  ? battleState.speed === 1 
                    ? 'bg-green-600' 
                    : 'bg-purple-600'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {/* Slider Knob */}
              <div 
                className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                  battleState.speed === 1 ? 'left-1' : 'left-9'
                }`}
              />
              {/* Speed Labels */}
              <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-bold text-white">
                <span>1x</span>
                <span>2x</span>
              </div>
            </button>
          </div>
        </div>

        {/* Level Progress Grid */}
        <div className="flex items-center gap-3 relative">
          <span className="text-sm text-gray-300 font-semibold">Chapter {battleState.currentChapter} - Level Progress:</span>
          <div className="flex gap-1">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => {
              const levelKey = `${battleState.currentChapter}-${level}`;
              const isCurrent = level === battleState.currentLevel;
              const isCompleted = completedLevels.has(levelKey);
              const isLocked = level > 1 && !completedLevels.has(`${battleState.currentChapter}-${level - 1}`);

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
                  onClick={() => {
                    // Only allow clicking on unlocked levels (completed or level 1)
                    const isUnlocked = level === 1 || completedLevels.has(`${battleState.currentChapter}-${level - 1}`);
                    if (isUnlocked && level !== battleState.currentLevel) {
                      onChangeToLevel(level);
                    }
                  }}
                  onMouseEnter={() => setHoveredLevel(level)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    level === 1 || completedLevels.has(`${battleState.currentChapter}-${level - 1}`) 
                      ? 'cursor-pointer hover:scale-110 hover:shadow-lg' 
                      : 'cursor-not-allowed'
                  } ${bgColor} ${textColor}`}
                  title={
                    level === 1 || completedLevels.has(`${battleState.currentChapter}-${level - 1}`)
                      ? level === battleState.currentLevel
                        ? `Currently on Chapter ${battleState.currentChapter} Level ${level}`
                        : `Click to switch to Chapter ${battleState.currentChapter} Level ${level}`
                      : `Complete Chapter ${battleState.currentChapter} Level ${level - 1} first to unlock Level ${level}`
                  }
                >
                  {level}
                </div>
              );
            })}
          </div>
          
          {/* Drop Rate Tooltip */}
          {hoveredLevel && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
              <DropRateDisplay currentLevel={hoveredLevel} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
