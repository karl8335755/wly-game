import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface SoldiersDisplayProps {
  soldiers: number[];
  currentLevel: number;
  currentChapter: number;
}

export const SoldiersDisplay: React.FC<SoldiersDisplayProps> = ({ soldiers, currentLevel, currentChapter }) => {
  const [attackingYellowTurbans, setAttackingYellowTurbans] = useState<Set<number>>(new Set());
  const [takingDamage, setTakingDamage] = useState<Set<number>>(new Set());

  // Helper function to get max HP for current level and chapter
  const getMaxHP = (level: number, chapter: number) => {
    // Chapter multiplier for HP scaling (same as in useBattle hook)
    const chapterMultiplier = Math.pow(1.5, chapter - 1);
    
    let baseHP: number;
    if (level < 6) {
      baseHP = 100; // Levels 1-5: 100 HP base
    } else if (level < 10) {
      baseHP = 100 * Math.pow(2, level - 5); // Levels 6-9: 200, 400, 800, 1600 base
    } else {
      baseHP = 5000; // Level 10: Boss with 5000 HP base
    }
    
    return Math.floor(baseHP * chapterMultiplier);
  };

  // Simulate attack animation when 黄巾军 are attacking
  useEffect(() => {
    const interval = setInterval(() => {
      setAttackingYellowTurbans(new Set());
      setTimeout(() => setAttackingYellowTurbans(new Set()), 500);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate damage animation when enemies take damage
  useEffect(() => {
    const interval = setInterval(() => {
      setTakingDamage(new Set());
      setTimeout(() => setTakingDamage(new Set()), 500);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800/90 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold text-white mb-3">
        {currentLevel === 10 ? 'BOSS' : '黄巾军'} (Level {currentLevel})
      </h2>
      <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto flex-1">
        {soldiers.map((health, index) => {
          const isAttacking = attackingYellowTurbans.has(index);
          const isTakingDamage = takingDamage.has(index);

          return (
            <div
              key={index}
              className={`relative bg-gray-700 rounded-lg p-2 text-center transition-all duration-200 ${
                health <= 0 ? 'opacity-50' : 'hover:bg-gray-600'
              } ${
                isAttacking ? 'animate-pulse bg-red-600/50' : ''
              } ${
                isTakingDamage ? 'animate-pulse bg-yellow-600/50' : ''
              }`}
            >
              {/* Attack indicator */}
              {isAttacking && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full animate-bounce">
                  ⚔️
                </div>
              )}
              
              {/* Damage indicator */}
              {isTakingDamage && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-1 rounded-full animate-bounce">
                  💥
                </div>
              )}

              <Image
                src={currentLevel === 10 ? "/boss.jpeg" : "/soldier.png"}
                alt={currentLevel === 10 ? "Boss" : "Soldier"}
                width={currentLevel === 10 ? 64 : 48}
                height={currentLevel === 10 ? 64 : 48}
                className={`mx-auto mb-1 transition-all duration-200 ${
                  health <= 0 ? 'grayscale' : ''
                } ${
                  isAttacking ? 'scale-110' : ''
                } ${
                  isTakingDamage ? 'scale-95' : ''
                }`}
              />
              <div className="text-xs text-gray-300">
                {currentLevel === 10 ? 'BOSS' : `黄巾军 ${index + 1}`}
              </div>
              
              {/* Health Bar */}
              <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-200 ${
                    health <= 0 ? 'bg-red-500' : 
                    health > (getMaxHP(currentLevel, currentChapter) * 0.5) ? 'bg-green-500' : 
                    health > (getMaxHP(currentLevel, currentChapter) * 0.25) ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${health > 0 ? (health / getMaxHP(currentLevel, currentChapter)) * 100 : 0}%` }}
                />
              </div>
              
              <div className={`text-xs font-bold mt-1 ${health <= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {health <= 0 ? 'DEFEATED' : `${health} HP`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
