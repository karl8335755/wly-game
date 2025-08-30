import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { HeroInBattle } from '../hooks/useBattle';

interface HeroesDisplayProps {
  heroesInBattle: HeroInBattle[];
  recruitedGenerals: string[];
  selectedHero: string;
  onSelectHero: (heroName: string) => void;
  heroEquippedGear?: {
    [heroName: string]: {
      weapon: any | null;
      armor: any | null;
    };
  };
}

export const HeroesDisplay: React.FC<HeroesDisplayProps> = ({ 
  heroesInBattle, 
  recruitedGenerals,
  selectedHero,
  onSelectHero,
  heroEquippedGear = {}
}) => {
  const [attackingHeroes, setAttackingHeroes] = useState<Set<string>>(new Set());
  const [takingDamage, setTakingDamage] = useState<Set<string>>(new Set());
  const [tooltipData, setTooltipData] = useState<{
    show: boolean;
    x: number;
    y: number;
    content: React.ReactNode;
  }>({ show: false, x: 0, y: 0, content: null });

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-500/50';
      case 'legendary': return 'bg-gradient-to-r from-orange-900/50 to-orange-800/50 border-orange-500/50';
      case 'epic': return 'bg-gradient-to-r from-purple-900/50 to-purple-800/50 border-purple-500/50';
      case 'rare': return 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-500/50';
      case 'common': return 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-500/50';
      default: return 'bg-gradient-to-r from-gray-900/50 to-gray-800/50 border-gray-500/50';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'mythic': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      case 'epic': return 'text-purple-400';
      case 'rare': return 'text-blue-400';
      case 'common': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const heroData = [
    { name: '刘备', attackPower: 25, health: 120, image: '/liubei.png' },
    { name: '关羽', attackPower: 30, health: 100, image: '/guanyu.png' },
    { name: '张飞', attackPower: 28, health: 110, image: '/zhugeliang.png' },
    { name: '诸葛亮', attackPower: 22, health: 90, image: '/caocao.png' }
  ];

  // Simulate attack animation when heroes are attacking
  useEffect(() => {
    const interval = setInterval(() => {
      setAttackingHeroes(new Set());
      setTimeout(() => setAttackingHeroes(new Set()), 500);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate damage animation when heroes take damage
  useEffect(() => {
    const interval = setInterval(() => {
      setTakingDamage(new Set());
      setTimeout(() => setTakingDamage(new Set()), 500);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Handle mouse events for tooltips
  const handleMouseEnter = (e: React.MouseEvent, gear: any, type: 'weapon' | 'armor') => {
    if (!gear) return;
    
    const x = e.clientX + 10; // Offset from cursor
    const y = e.clientY - 10; // Offset from cursor
    
    const content = (
      <div className="px-3 py-2 bg-gray-900 border border-gray-600 text-white text-xs rounded-lg shadow-xl min-w-32">
        <div className={`font-bold text-sm mb-1 ${getRarityTextColor(gear.rarity)}`}>{gear.name}</div>
        {type === 'weapon' ? (
          <>
            <div className="mb-1">
              ATK +{gear.attackBonus}
            </div>
            {gear.healthBonus > 0 && (
              <div className="mb-1">
                HP +{gear.healthBonus}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-1">
              HP +{gear.healthBonus}
            </div>
            {gear.attackBonus > 0 && (
              <div className="mb-1">
                ATK +{gear.attackBonus}
              </div>
            )}
          </>
        )}
        {gear.specialEffect && (
          <div className="mb-1">
            Special: {gear.specialEffect.toUpperCase()}
          </div>
        )}
        <div className="capitalize font-semibold border-t border-gray-600 pt-1">
          {gear.rarity} {type === 'weapon' ? 'Weapon' : 'Armor'}
        </div>
      </div>
    );
    
    setTooltipData({ show: true, x, y, content });
  };

  const handleMouseLeave = () => {
    setTooltipData({ show: false, x: 0, y: 0, content: null });
  };

  return (
    <div className="bg-gray-800/90 rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold text-white mb-3">Your Heroes</h2>
      <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto flex-1" style={{ minWidth: '600px' }}>
        {recruitedGenerals.map((heroName) => {
          const hero = heroData.find(h => h.name === heroName);
          const battleHero = heroesInBattle.find(h => h.name === heroName);
          
          if (!hero) return null;

          const currentHealth = battleHero?.health || hero.health;
          const maxHealth = battleHero?.maxHealth || hero.health;
          const healthPercentage = (currentHealth / maxHealth) * 100;
          const isAttacking = attackingHeroes.has(heroName);
          const isTakingDamage = takingDamage.has(heroName);

          const isSelected = selectedHero === heroName;
          
          return (
            <div
              key={heroName}
              onClick={() => onSelectHero(heroName)}
              className={`relative bg-gray-700 rounded-lg p-2 flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                currentHealth <= 0 ? 'opacity-50' : 'hover:bg-gray-600'
              } ${
                isAttacking ? 'animate-pulse bg-yellow-600/50' : ''
              } ${
                isTakingDamage ? 'animate-pulse bg-red-600/50' : ''
              } ${
                isSelected ? 'ring-2 ring-sky-200 bg-sky-400/5 border-2 border-sky-100' : ''
              }`}
            >
              {/* Attack indicator */}
              {isAttacking && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-1 rounded-full animate-bounce">
                  ⚔️
                </div>
              )}
              
              {/* Damage indicator */}
              {isTakingDamage && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full animate-bounce">
                  💥
                </div>
              )}

              {/* Left side - Avatar and Equipment */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <Image
                  src={hero.image}
                  alt={heroName}
                  width={48}
                  height={48}
                  className={`transition-all duration-200 ${
                    currentHealth <= 0 ? 'grayscale' : ''
                  } ${
                    isAttacking ? 'scale-110' : ''
                  } ${
                    isTakingDamage ? 'scale-95' : ''
                  }`}
                />
                
                {/* Equipped Gear */}
                <div className="mt-1 flex gap-1">
                  {/* Weapon Slot */}
                  <div 
                    className="relative group"
                    onMouseEnter={(e) => heroEquippedGear[heroName]?.weapon && handleMouseEnter(e, heroEquippedGear[heroName].weapon, 'weapon')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all duration-200 ${
                      heroEquippedGear[heroName]?.weapon 
                        ? getRarityBgColor(heroEquippedGear[heroName].weapon.rarity)
                        : 'bg-gray-600 border-gray-500'
                    } ${heroEquippedGear[heroName]?.weapon ? 'group-hover:scale-110 group-hover:shadow-lg' : ''}`}>
                      <span className="text-xs text-gray-400">⚔️</span>
                    </div>
                  </div>
                  
                  {/* Armor Slot */}
                  <div 
                    className="relative group"
                    onMouseEnter={(e) => heroEquippedGear[heroName]?.armor && handleMouseEnter(e, heroEquippedGear[heroName].armor, 'armor')}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all duration-200 ${
                      heroEquippedGear[heroName]?.armor 
                        ? getRarityBgColor(heroEquippedGear[heroName].armor.rarity)
                        : 'bg-gray-600 border-gray-500'
                    } ${heroEquippedGear[heroName]?.armor ? 'group-hover:scale-110 group-hover:shadow-lg' : ''}`}>
                      <span className="text-xs text-gray-400">🛡️</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Status */}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-300 mb-1">
                  {heroName} <span className="text-blue-400">Lv.{battleHero?.level || 1}</span>
                </div>
                
                <div className="text-xs text-gray-400 mb-1">
                  ATK: {battleHero?.attackPower || hero.attackPower}
                </div>
                
                {/* Health Bar */}
                <div className="w-full bg-gray-600 rounded-full h-1 mb-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-200 ${
                      healthPercentage > 50 ? 'bg-green-500' : 
                      healthPercentage > 25 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${healthPercentage}%` }}
                  />
                </div>
                
                <div className={`text-xs font-bold mb-1 ${
                  currentHealth <= 0 ? 'text-red-400' : 'text-green-400'
                }`} style={{ fontSize: '10px' }}>
                  {currentHealth <= 0 ? 'DEFEATED' : `${currentHealth}/${maxHealth} HP`}
                </div>
                
                {/* Experience Bar */}
                <div>
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-blue-500 transition-all duration-200"
                      style={{ 
                        width: `${((battleHero?.experience || 0) / (battleHero?.experienceToNextLevel || 10)) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5" style={{ fontSize: '10px' }}>
                    {battleHero?.experience || 0}/{battleHero?.experienceToNextLevel || 10} XP
                  </div>
                </div>
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
      
      {/* Cursor-following tooltip */}
      {tooltipData.show && (
        <div 
          className="fixed pointer-events-none z-[9999]"
          style={{ 
            left: tooltipData.x, 
            top: tooltipData.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {tooltipData.content}
        </div>
      )}
    </div>
  );
};
