import React from 'react';
import Image from 'next/image';

interface SoldiersDisplayProps {
  soldiers: number[];
  currentLevel: number;
}

export const SoldiersDisplay: React.FC<SoldiersDisplayProps> = ({ soldiers, currentLevel }) => {
  return (
    <div className="bg-gray-800/90 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold text-white mb-3">黄巾军 (Level {currentLevel})</h2>
      <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto flex-1">
        {soldiers.map((health, index) => (
          <div
            key={index}
            className={`relative bg-gray-700 rounded-lg p-2 text-center transition-all duration-200 ${
              health <= 0 ? 'opacity-50' : 'hover:bg-gray-600'
            }`}
          >
            <Image
              src="/soldier.png"
              alt="Soldier"
              width={48}
              height={48}
              className={`mx-auto mb-1 ${health <= 0 ? 'grayscale' : ''}`}
            />
            <div className="text-xs text-gray-300">Enemy {index + 1}</div>
            <div className={`text-xs font-bold ${health <= 0 ? 'text-red-400' : 'text-green-400'}`}>
              {health <= 0 ? 'DEFEATED' : `${health} HP`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
