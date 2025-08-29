import React from 'react';
import Image from 'next/image';

interface ArmyScreenProps {
  recruitedGenerals: string[];
  onRecruitGeneral: (heroName: string, cost: number) => boolean;
  onRemoveGeneral: (heroName: string) => void;
  resources: {
    gold: number;
  };
}

export const ArmyScreen: React.FC<ArmyScreenProps> = ({
  recruitedGenerals,
  onRecruitGeneral,
  onRemoveGeneral,
  resources
}) => {
  const heroData = [
    { name: '刘备', attackPower: 25, health: 120, image: '/liubei.png', cost: 500 },
    { name: '关羽', attackPower: 30, health: 100, image: '/guanyu.png', cost: 800 },
    { name: '张飞', attackPower: 28, health: 110, image: '/zhugeliang.png', cost: 700 },
    { name: '诸葛亮', attackPower: 22, health: 90, image: '/caocao.png', cost: 1000 }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800/90 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-bold text-white mb-3">Army Management</h2>
        <p className="text-gray-300 text-sm">Recruit heroes to join your army and fight in battles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {heroData.map((hero) => {
          const isRecruited = recruitedGenerals.includes(hero.name);
          const canAfford = resources.gold >= hero.cost;

          return (
            <div key={hero.name} className="bg-gray-800/90 rounded-lg p-4">
              <div className="text-center mb-3">
                <Image
                  src={hero.image}
                  alt={hero.name}
                  width={64}
                  height={64}
                  className="mx-auto mb-2 rounded-lg"
                />
                <h3 className="text-lg font-bold text-white">{hero.name}</h3>
              </div>

              <div className="text-sm text-gray-300 mb-3">
                <div>Attack: {hero.attackPower}</div>
                <div>Health: {hero.health}</div>
                <div>Cost: {hero.cost} gold</div>
              </div>

              {isRecruited ? (
                <button
                  onClick={() => onRemoveGeneral(hero.name)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={() => onRecruitGeneral(hero.name, hero.cost)}
                  disabled={!canAfford}
                  className={`w-full font-semibold py-2 px-4 rounded-lg transition-all duration-200 ${
                    canAfford
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'Recruit' : 'Not Enough Gold'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
