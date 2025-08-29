import React from 'react';
import Image from 'next/image';
import { HeroInBattle } from '../hooks/useBattle';

interface HeroesDisplayProps {
  heroesInBattle: HeroInBattle[];
  recruitedGenerals: string[];
}

export const HeroesDisplay: React.FC<HeroesDisplayProps> = ({ 
  heroesInBattle, 
  recruitedGenerals 
}) => {
  const heroData = [
    { name: '刘备', attackPower: 25, health: 120, image: '/liubei.png' },
    { name: '关羽', attackPower: 30, health: 100, image: '/guanyu.png' },
    { name: '张飞', attackPower: 28, health: 110, image: '/zhugeliang.png' },
    { name: '诸葛亮', attackPower: 22, health: 90, image: '/caocao.png' }
  ];

  return (
    <div className="bg-gray-800/90 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold text-white mb-3">Your Heroes</h2>
      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto flex-1">
        {recruitedGenerals.map((heroName) => {
          const hero = heroData.find(h => h.name === heroName);
          const battleHero = heroesInBattle.find(h => h.name === heroName);
          
          if (!hero) return null;

          const currentHealth = battleHero?.health || hero.health;
          const maxHealth = battleHero?.maxHealth || hero.health;
          const healthPercentage = (currentHealth / maxHealth) * 100;

          return (
            <div
              key={heroName}
              className={`relative bg-gray-700 rounded-lg p-2 text-center transition-all duration-200 ${
                currentHealth <= 0 ? 'opacity-50' : 'hover:bg-gray-600'
              }`}
            >
              <Image
                src={hero.image}
                alt={heroName}
                width={48}
                height={48}
                className={`mx-auto mb-1 ${currentHealth <= 0 ? 'grayscale' : ''}`}
              />
              <div className="text-xs text-gray-300">{heroName}</div>
              
              {/* Health Bar */}
              <div className="w-full bg-gray-600 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all duration-200 ${
                    healthPercentage > 50 ? 'bg-green-500' : 
                    healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthPercentage}%` }}
                />
              </div>
              
              <div className={`text-xs font-bold mt-1 ${
                currentHealth <= 0 ? 'text-red-400' : 'text-green-400'
              }`}>
                {currentHealth <= 0 ? 'DEFEATED' : `${currentHealth}/${maxHealth} HP`}
              </div>
              
              <div className="text-xs text-gray-400">
                Attack: {battleHero?.attackPower || hero.attackPower}
              </div>
            </div>
          );
        })}
      </div>
      
      {recruitedGenerals.length === 0 && (
        <div className="text-gray-400 text-center mt-8">
          No heroes recruited. Go to Army to recruit heroes!
        </div>
      )}
    </div>
  );
};
