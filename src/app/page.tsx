'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'city' | 'army' | 'battle' | 'shop'>('city');
  const [resources, setResources] = useState({
    gold: 2000,
    food: 1000,
    population: 0
  });

  const [cityTier, setCityTier] = useState(1);
  const [populationCapacity, setPopulationCapacity] = useState(100);
  const [recruitedGenerals, setRecruitedGenerals] = useState<string[]>([]);
  const [battleState, setBattleState] = useState({
    isActive: false,
    currentLevel: 1,
    heroHealth: 100,
    heroMaxHealth: 100,
    heroLevel: 1,
    heroExperience: 0,
    experienceToNextLevel: 10,
    heroAttackPower: 20,
    selectedHero: null as string | null,
    soldiers: Array(1).fill(100),
    currentTurn: 0,
    battleLog: [] as string[],
    showLevelOptions: false,
    gameLoopId: null as NodeJS.Timeout | null
  });

  // Per-hero inventory and gear system
  const [heroInventories, setHeroInventories] = useState<{
    [heroName: string]: Array<{
      id: string;
      name: string;
      type: 'weapon' | 'armor';
      attackBonus: number;
      healthBonus: number;
      rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
      specialEffect?: 'aoe';
    }>
  }>({});

  const [heroEquippedGear, setHeroEquippedGear] = useState<{
    [heroName: string]: {
      weapon: typeof gearData[0] | null;
      armor: typeof gearData[0] | null;
    }
  }>({});

  const [sellMessage, setSellMessage] = useState<string>('');
  const [showGearDetails, setShowGearDetails] = useState<{ gear: typeof gearData[0]; type: 'weapon' | 'armor' } | null>(null);
  
  // Track all heroes in battle with their health
  const [heroesInBattle, setHeroesInBattle] = useState<{
    [heroName: string]: {
      health: number;
      maxHealth: number;
      level: number;
      attackPower: number;
      experience: number;
      experienceToNextLevel: number;
    }
  }>({});

  // Persistent hero progress storage
  const [heroProgress, setHeroProgress] = useState<{
    [heroName: string]: {
      level: number;
      experience: number;
      experienceToNextLevel: number;
      maxHealth: number;
      attackPower: number;
    }
  }>({});

  // Ref to store current battle state for game loop
  const battleStateRef = useRef(battleState);
  battleStateRef.current = battleState;

  // Ref to store current heroes state for game loop
  const heroesInBattleRef = useRef(heroesInBattle);
  heroesInBattleRef.current = heroesInBattle;

  const generals = [
    { name: '刘备', cost: { gold: 1000, food: 500, population: 100 } },
    { name: '诸葛亮', cost: { gold: 1500, food: 300, population: 50 } },
    { name: '关羽', cost: { gold: 1200, food: 400, population: 80 } },
    { name: '张飞', cost: { gold: 1000, food: 450, population: 90 } }
  ];

  // Gear data
  const gearData: Array<{
    id: string;
    name: string;
    type: 'weapon' | 'armor';
    attackBonus: number;
    healthBonus: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
    specialEffect?: 'aoe';
  }> = [
    // Weapons
    { id: 'sword1', name: 'Iron Sword', type: 'weapon', attackBonus: 5, healthBonus: 0, rarity: 'common' },
    { id: 'sword2', name: 'Steel Sword', type: 'weapon', attackBonus: 10, healthBonus: 0, rarity: 'rare' },
    { id: 'sword3', name: 'Dragon Sword', type: 'weapon', attackBonus: 15, healthBonus: 0, rarity: 'epic' },
    { id: 'spear1', name: 'Iron Spear', type: 'weapon', attackBonus: 8, healthBonus: 0, rarity: 'common' },
    { id: 'spear2', name: 'Thunder Spear', type: 'weapon', attackBonus: 12, healthBonus: 0, rarity: 'rare' },
    
    // Legendary Weapons with AoE
    { id: 'legendary_sword', name: 'Celestial Blade', type: 'weapon', attackBonus: 25, healthBonus: 0, rarity: 'legendary', specialEffect: 'aoe' },
    { id: 'legendary_spear', name: 'Storm Lance', type: 'weapon', attackBonus: 20, healthBonus: 0, rarity: 'legendary', specialEffect: 'aoe' },
    
    // Armor
    { id: 'armor1', name: 'Leather Armor', type: 'armor', attackBonus: 0, healthBonus: 20, rarity: 'common' },
    { id: 'armor2', name: 'Iron Armor', type: 'armor', attackBonus: 0, healthBonus: 40, rarity: 'rare' },
    { id: 'armor3', name: 'Dragon Armor', type: 'armor', attackBonus: 0, healthBonus: 60, rarity: 'epic' },
    { id: 'helm1', name: 'Iron Helmet', type: 'armor', attackBonus: 0, healthBonus: 15, rarity: 'common' },
    { id: 'helm2', name: 'Magic Helmet', type: 'armor', attackBonus: 3, healthBonus: 25, rarity: 'rare' },
    
    // Legendary Armor
    { id: 'legendary_armor', name: 'Divine Plate', type: 'armor', attackBonus: 10, healthBonus: 100, rarity: 'legendary' },
    { id: 'legendary_helm', name: 'Crown of Kings', type: 'armor', attackBonus: 15, healthBonus: 50, rarity: 'legendary' },
    
    // Mythic Weapons
    { id: 'mythic_sword', name: 'Apocalypse Blade', type: 'weapon', attackBonus: 40, healthBonus: 0, rarity: 'mythic', specialEffect: 'aoe' },
    { id: 'mythic_staff', name: 'Eternal Scepter', type: 'weapon', attackBonus: 35, healthBonus: 0, rarity: 'mythic', specialEffect: 'aoe' },
    
    // Mythic Armor
    { id: 'mythic_armor', name: 'Celestial Aegis', type: 'armor', attackBonus: 20, healthBonus: 150, rarity: 'mythic' },
    { id: 'mythic_crown', name: 'Crown of Eternity', type: 'armor', attackBonus: 25, healthBonus: 100, rarity: 'mythic' },
  ];

  // Auto-increment resources every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => ({
        gold: prev.gold + 50,
        food: prev.food + 30,
        population: prev.population
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const recruitGeneral = (general: { name: string; cost: { gold: number; food: number; population: number } }) => {
    if (recruitedGenerals.includes(general.name)) {
      alert(`${general.name} is already recruited!`);
      return;
    }

    if (resources.gold >= general.cost.gold && 
        resources.food >= general.cost.food && 
        (resources.population + general.cost.population) <= populationCapacity) {
      
      setResources({
        gold: resources.gold - general.cost.gold,
        food: resources.food - general.cost.food,
        population: resources.population + general.cost.population
      });
      
      setRecruitedGenerals(prev => [...prev, general.name]);
      
      setHeroInventories(prev => ({
        ...prev,
        [general.name]: []
      }));
      
      setHeroEquippedGear(prev => ({
        ...prev,
        [general.name]: {
          weapon: null,
          armor: null
        }
      }));
      
      alert(`Successfully recruited ${general.name}!`);
    } else {
      alert('Insufficient resources or population capacity exceeded!');
    }
  };

  const getSoldierStats = (level: number) => {
    if (level <= 10) {
      return {
        count: level,
        hp: 100,
        attack: 10
      };
    } else {
      const levelMultiplier = Math.pow(2, level - 11);
      return {
        count: 10,
        hp: 100 * levelMultiplier,
        attack: 10 * levelMultiplier
      };
    }
  };

  const gameLoop = useCallback(() => {
    const currentState = battleStateRef.current;
    
    if (!currentState.isActive || currentState.showLevelOptions) {
      return;
    }

    const newSoldiers = [...currentState.soldiers];
    const newBattleLog = [...currentState.battleLog];
    const newCurrentLevel = currentState.currentLevel;
    
    const updatedHeroes = { ...heroesInBattleRef.current };
    
    if (Object.keys(updatedHeroes).length === 0 && recruitedGenerals.length > 0) {
      recruitedGenerals.forEach(heroName => {
        const existingHero = heroesInBattleRef.current[heroName];
        
        if (existingHero) {
          updatedHeroes[heroName] = {
            ...existingHero,
            health: existingHero.maxHealth
          };
        } else if (heroProgress[heroName]) {
          const progress = heroProgress[heroName];
          updatedHeroes[heroName] = {
            health: progress.maxHealth,
            maxHealth: progress.maxHealth,
            level: progress.level,
            attackPower: progress.attackPower,
            experience: progress.experience,
            experienceToNextLevel: progress.experienceToNextLevel
          };
        } else {
          let heroStats = { health: 100, maxHealth: 100, attackPower: 20 };
          
          switch (heroName) {
            case '刘备': heroStats = { health: 120, maxHealth: 120, attackPower: 25 }; break;
            case '诸葛亮': heroStats = { health: 80, maxHealth: 80, attackPower: 35 }; break;
            case '关羽': heroStats = { health: 150, maxHealth: 150, attackPower: 30 }; break;
            case '张飞': heroStats = { health: 140, maxHealth: 140, attackPower: 28 }; break;
          }
          
          updatedHeroes[heroName] = {
            health: heroStats.health,
            maxHealth: heroStats.maxHealth,
            level: 1,
            attackPower: heroStats.attackPower,
            experience: 0,
            experienceToNextLevel: 10
          };
        }
      });
    }

    const aliveHeroes = Object.entries(updatedHeroes).filter(([_, hero]) => hero.health > 0);
    
    if (aliveHeroes.length > 0) {
      aliveHeroes.forEach(([heroName, hero]) => {
        let damage = Math.floor(Math.random() * 10) + hero.attackPower;
        
        const heroEquipped = heroEquippedGear[heroName] || { weapon: null, armor: null };
        const heroHasMythicSet = heroEquipped.weapon?.rarity === 'mythic' && heroEquipped.armor?.rarity === 'mythic';
        const heroHasAoE = heroEquipped.weapon?.specialEffect === 'aoe';
        
        if (heroHasMythicSet) {
          damage = damage * 2;
          newBattleLog.push(`🔥 ${heroName} Mythic Set Bonus: Critical Hit!`);
        }
        
        if (heroHasAoE) {
          const aliveSoldiersBefore = newSoldiers.filter(health => health > 0).length;
          newSoldiers.forEach((health, index) => {
            if (health > 0) {
              const oldHealth = newSoldiers[index];
              newSoldiers[index] = Math.max(0, newSoldiers[index] - damage);
              newBattleLog.push(`${heroName} uses AoE attack! 黄巾军 ${index + 1}: ${oldHealth} → ${newSoldiers[index]} HP`);
            }
          });
          const aliveSoldiersAfter = newSoldiers.filter(health => health > 0).length;
          const soldiersKilled = aliveSoldiersBefore - aliveSoldiersAfter;
          if (soldiersKilled > 0) {
            newBattleLog.push(`${heroName}'s AoE attack killed ${soldiersKilled} 黄巾军!`);
          }
        } else {
          const aliveSoldiers = newSoldiers.map((health, index) => ({ health, index })).filter(s => s.health > 0);
          if (aliveSoldiers.length > 0) {
            const targetIndex = aliveSoldiers[Math.floor(Math.random() * aliveSoldiers.length)].index;
            const oldHealth = newSoldiers[targetIndex];
            newSoldiers[targetIndex] = Math.max(0, newSoldiers[targetIndex] - damage);
            newBattleLog.push(`${heroName} attacks 黄巾军 ${targetIndex + 1} for ${damage} damage! (${oldHealth} → ${newSoldiers[targetIndex]} HP)`);
          }
        }
      });
    }

    newSoldiers.forEach((health, index) => {
      if (health > 0) {
        const damage = Math.floor(Math.random() * 5) + 5;
        
        const aliveHeroes = Object.entries(updatedHeroes).filter(([_, hero]) => hero.health > 0);
        
        if (aliveHeroes.length > 0) {
          const randomHeroIndex = Math.floor(Math.random() * aliveHeroes.length);
          const [targetHeroName, targetHero] = aliveHeroes[randomHeroIndex];
          
          const newHeroHealth = Math.max(0, targetHero.health - damage);
          updatedHeroes[targetHeroName] = {
            ...updatedHeroes[targetHeroName],
            health: newHeroHealth
          };
          
          newBattleLog.push(`黄巾军 ${index + 1} attacks ${targetHeroName} for ${damage} damage! (${targetHero.health} → ${newHeroHealth} HP)`);
          
          if (newHeroHealth <= 0) {
            newBattleLog.push(`${targetHeroName} has fallen in battle!`);
            
            const allHeroesDead = Object.values(updatedHeroes).every(hero => hero.health <= 0);
            if (allHeroesDead) {
              if (battleStateRef.current.gameLoopId) {
                clearInterval(battleStateRef.current.gameLoopId);
              }
              
              const deadHeroes = Object.keys(updatedHeroes).filter(heroName => updatedHeroes[heroName].health <= 0);
              setRecruitedGenerals(prev => prev.filter(name => !deadHeroes.includes(name)));
              
              setBattleState(current => ({ 
                ...current, 
                isActive: false, 
                gameLoopId: null,
                battleLog: [...current.battleLog.slice(-3), `All heroes defeated! Game over at Level ${current.currentLevel}!`]
              }));
              
              alert(`All heroes defeated! Game over at Level ${battleStateRef.current.currentLevel}!`);
              return;
            }
          }
        }
      }
    });

    setHeroesInBattle(updatedHeroes);

    setBattleState(prev => {
      const updatedState = {
        ...prev,
        soldiers: newSoldiers,
        currentTurn: prev.currentTurn + 1,
        battleLog: newBattleLog.slice(-5)
      };

      if (newSoldiers.every(health => health <= 0)) {
        const experienceGained = newCurrentLevel;
        
        const updatedHeroesWithExp = { ...updatedHeroes };
        const levelUpMessages: string[] = [];
        
        Object.keys(updatedHeroesWithExp).forEach(heroName => {
          const hero = updatedHeroesWithExp[heroName];
          const newExperience = hero.experience + experienceGained;
          let newLevel = hero.level;
          let newMaxHealth = hero.maxHealth;
          let newAttackPower = hero.attackPower;
          let newExperienceToNextLevel = hero.experienceToNextLevel || 10;
          
          if (newExperience >= newExperienceToNextLevel) {
            newLevel = hero.level + 1;
            newMaxHealth = hero.maxHealth + 20;
            newAttackPower = hero.attackPower + 5;
            newExperienceToNextLevel = Math.floor(newExperienceToNextLevel * 1.5);
            levelUpMessages.push(`${heroName} leveled up to Level ${newLevel}!`);
          }
          
          updatedHeroesWithExp[heroName] = {
            ...hero,
            level: newLevel,
            maxHealth: newMaxHealth,
            attackPower: newAttackPower,
            health: newMaxHealth,
            experience: newExperience,
            experienceToNextLevel: newExperienceToNextLevel
          };
        });
        
        setHeroesInBattle(updatedHeroesWithExp);
        
        setHeroProgress(prev => {
          const newProgress = { ...prev };
          Object.keys(updatedHeroesWithExp).forEach(heroName => {
            const hero = updatedHeroesWithExp[heroName];
            newProgress[heroName] = {
              level: hero.level,
              experience: hero.experience,
              experienceToNextLevel: hero.experienceToNextLevel,
              maxHealth: hero.maxHealth,
              attackPower: hero.attackPower
            };
          });
          return newProgress;
        });
        
        const soldierCount = newCurrentLevel;
        
        setBattleState(prev => ({
          ...prev,
          soldiers: Array(soldierCount).fill(100),
          battleLog: [...prev.battleLog.slice(-3), `Gained ${experienceGained} EXP!`, ...levelUpMessages]
        }));
        
        return updatedState;
      }

      return updatedState;
    });
  }, []);

  const startBattle = () => {
    const updatedHeroes: { [heroName: string]: { health: number; maxHealth: number; level: number; attackPower: number; experience: number; experienceToNextLevel: number } } = {};
    
    recruitedGenerals.forEach(heroName => {
      const existingHero = heroesInBattle[heroName];
      
      if (existingHero) {
        updatedHeroes[heroName] = {
          ...existingHero,
          health: existingHero.maxHealth
        };
      } else if (heroProgress[heroName]) {
        const progress = heroProgress[heroName];
        updatedHeroes[heroName] = {
          health: progress.maxHealth,
          maxHealth: progress.maxHealth,
          level: progress.level,
          attackPower: progress.attackPower,
          experience: progress.experience,
          experienceToNextLevel: progress.experienceToNextLevel
        };
      } else {
        let heroStats = { health: 100, maxHealth: 100, attackPower: 20 };
        
        switch (heroName) {
          case '刘备': heroStats = { health: 120, maxHealth: 120, attackPower: 25 }; break;
          case '诸葛亮': heroStats = { health: 80, maxHealth: 80, attackPower: 35 }; break;
          case '关羽': heroStats = { health: 150, maxHealth: 150, attackPower: 30 }; break;
          case '张飞': heroStats = { health: 140, maxHealth: 140, attackPower: 28 }; break;
        }
        
        updatedHeroes[heroName] = {
          health: heroStats.health,
          maxHealth: heroStats.maxHealth,
          level: 1,
          attackPower: heroStats.attackPower,
          experience: 0,
          experienceToNextLevel: 10
        };
      }
    });
    
    setHeroesInBattle(updatedHeroes);
    
    const gameLoopId = setInterval(gameLoop, 2000);
    
    setBattleState(prev => ({
      ...prev,
      isActive: true,
      currentLevel: 1,
      heroHealth: prev.heroHealth || 100,
      heroMaxHealth: prev.heroMaxHealth || 100,
      heroLevel: prev.heroLevel || 1,
      heroExperience: prev.heroExperience || 0,
      experienceToNextLevel: prev.experienceToNextLevel || 10,
      heroAttackPower: prev.heroAttackPower || 20,
      soldiers: Array(1).fill(100),
      currentTurn: 0,
      battleLog: ['Battle started! Level 1: 1 黄巾军'],
      showLevelOptions: false,
      gameLoopId: gameLoopId
    }));
  };

  return (
    <div className="h-screen bg-cover bg-center bg-no-repeat overflow-hidden" style={{ backgroundImage: 'url(/sgbg.jpg)' }}>
      {/* Navigation */}
      <nav className="bg-gray-900/95 border-b border-gray-700 py-1 px-4 h-[100px]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center -mt-2 -ml-8">
              <img 
                src="/l.png" 
                alt="Logo"
                className="w-64 h-32 object-contain"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            {[
              { name: 'city', label: 'City' },
              { name: 'army', label: 'Army' },
              { name: 'battle', label: 'Battle' },
              { name: 'shop', label: 'Shop' }
            ].map((screen) => (
              <button
                key={screen.name}
                onClick={() => setCurrentScreen(screen.name as 'city' | 'army' | 'battle' | 'shop')}
                className={`w-20 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
                  currentScreen === screen.name
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/25 scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 border border-gray-600 hover:border-gray-500'
                }`}
              >
                {screen.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="p-3 h-[calc(100vh-100px)] overflow-y-auto">
        {currentScreen === 'city' && (
          <div className="max-w-7xl mx-auto">
            {/* Resources and City Development */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-800/90 rounded-lg p-4">
                <h2 className="text-lg font-bold text-white mb-3">Resources</h2>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xl">💰</div>
                    <div className="text-yellow-400 font-bold text-sm">{resources.gold}</div>
                    <div className="text-gray-400 text-xs">Gold</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl">🍖</div>
                    <div className="text-green-400 font-bold text-sm">{resources.food}</div>
                    <div className="text-gray-400 text-xs">Food</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl">👥</div>
                    <div className="text-blue-400 font-bold text-sm">{resources.population}/{populationCapacity}</div>
                    <div className="text-gray-400 text-xs">Population</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/90 rounded-lg p-4">
                <h2 className="text-lg font-bold text-white mb-3">City Development</h2>
                <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">City Tier {cityTier}</h3>
                      <p className="text-gray-400 text-xs">Capacity: {populationCapacity}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">
                        <div>💰 {cityTier * 50000}</div>
                        <div>🍖 {cityTier * 30000}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const nextTier = cityTier + 1;
                      const goldCost = nextTier * 50000;
                      const foodCost = nextTier * 30000;
                      const newPopulationCapacity = nextTier * 100;
                      
                      if (resources.gold >= goldCost && resources.food >= foodCost) {
                        setResources(prev => ({
                          ...prev,
                          gold: prev.gold - goldCost,
                          food: prev.food - foodCost
                        }));
                        setCityTier(nextTier);
                        setPopulationCapacity(newPopulationCapacity);
                        setSellMessage(`City upgraded to Tier ${nextTier}! Population capacity increased to ${newPopulationCapacity}!`);
                        setTimeout(() => setSellMessage(''), 4000);
                      } else {
                        alert(`Insufficient resources! Need ${goldCost} gold and ${foodCost} food to upgrade to Tier ${nextTier}.`);
                      }
                    }}
                    disabled={resources.gold < cityTier * 50000 || resources.food < cityTier * 30000}
                    className={`w-full py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                      resources.gold < cityTier * 50000 || resources.food < cityTier * 30000
                        ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    Upgrade to Tier {cityTier + 1}
                  </button>
                </div>
              </div>
            </div>

            {/* Generals */}
            <div className="bg-gray-800/90 rounded-lg p-4">
              <h2 className="text-lg font-bold text-white mb-3">Recruit Generals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {generals.map((general) => (
                  <div key={general.name} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                    <div className="text-center mb-2">
                      <div className="w-12 h-12 bg-gray-600 rounded-full mx-auto flex items-center justify-center text-lg mb-1 overflow-hidden">
                        {general.name === '刘备' ? (
                          <img 
                            src="/liubei.png" 
                            alt={general.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : general.name === '诸葛亮' ? (
                          <img 
                            src="/zhugeliang.png" 
                            alt={general.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : general.name === '关羽' ? (
                          <img 
                            src="/guanyu.png" 
                            alt={general.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : general.name === '张飞' ? (
                          <img 
                            src="/caocao.png" 
                            alt={general.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          '👤'
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white">{general.name}</h3>
                    </div>
                    <div className="text-xs text-gray-400 mb-2">
                      <div>💰 {general.cost.gold}</div>
                      <div>🍖 {general.cost.food}</div>
                      <div>👥 {general.cost.population}</div>
                    </div>
                    <button
                      onClick={() => recruitGeneral(general)}
                      disabled={recruitedGenerals.includes(general.name)}
                      className={`w-full py-1 px-2 rounded-md text-xs font-medium transition-colors ${
                        recruitedGenerals.includes(general.name)
                          ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {recruitedGenerals.includes(general.name) ? 'Recruited' : 'Recruit'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'battle' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-3">
              <h1 className="text-2xl font-bold text-white mb-2">Battleground</h1>
              {battleState.isActive && (
                <div className="flex justify-center items-center gap-3 mb-2">
                  <div className="text-white px-3 py-1 font-bold text-sm">
                    Level {battleState.currentLevel}
                  </div>
                  <div className="text-white px-3 py-1 font-bold text-sm">
                    Turn {battleState.currentTurn}
                  </div>
                </div>
              )}
            </div>

            {/* Battle Controls */}
            <div className="bg-gray-800/90 rounded-lg p-4 mb-3">
              <div className="flex justify-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startBattle}
                  disabled={battleState.isActive || recruitedGenerals.length === 0}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    battleState.isActive || recruitedGenerals.length === 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {recruitedGenerals.length === 0 ? 'Recruit Heroes First' : 
                   battleState.isActive ? 'Battle in Progress...' : 'Start Battle'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentScreen('city')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                >
                  Back to City
                </motion.button>
              </div>
            </div>

            {/* Battleground */}
            <div className="bg-gray-800/90 rounded-lg p-4 mb-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Heroes Side */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white mb-3">
                    Heroes in Battle ({Object.keys(heroesInBattle).length})
                  </h3>
                  <div className="flex flex-wrap justify-center items-center gap-3 mb-3">
                    {Object.entries(heroesInBattle).map(([heroName, hero]) => (
                      <div key={heroName} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600 min-w-[200px]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg overflow-hidden border-2 flex-shrink-0 ${
                            hero.health <= 0 ? 'border-red-500 opacity-50' : 'border-blue-500'
                          }`}>
                            {heroName === '刘备' ? (
                              <img 
                                src="/liubei.png" 
                                alt={heroName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : heroName === '诸葛亮' ? (
                              <img 
                                src="/zhugeliang.png" 
                                alt={heroName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : heroName === '关羽' ? (
                              <img 
                                src="/guanyu.png" 
                                alt={heroName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : heroName === '张飞' ? (
                              <img 
                                src="/caocao.png" 
                                alt={heroName}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-600 rounded-full flex items-center justify-center text-3xl">
                                ⚔️
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-sm">{heroName} Lv.{hero.level}</h4>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-yellow-400">⚔️ {hero.attackPower}</span>
                              <span className="text-white">|</span>
                              <span className="text-green-400">❤️ {hero.health}/{hero.maxHealth}</span>
                            </div>
                          </div>
                        </div>

                        {/* Health Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-gray-300">Health</span>
                            <span className="text-white">{hero.health}/{hero.maxHealth}</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-2">
                            <motion.div
                              initial={{ width: '100%' }}
                              animate={{ width: `${(hero.health / hero.maxHealth) * 100}%` }}
                              className={`h-2 rounded-full ${
                                hero.health <= 0 ? 'bg-red-500' : 
                                (hero.health / hero.maxHealth) <= 0.25 ? 'bg-red-500' :
                                (hero.health / hero.maxHealth) <= 0.5 ? 'bg-orange-500' :
                                'bg-green-500'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Experience Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-gray-300">Experience</span>
                            <span className="text-purple-400">{hero.experience || 0}/{hero.experienceToNextLevel || 10}</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-1">
                            <div 
                              className="bg-purple-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, ((hero.experience || 0) / (hero.experienceToNextLevel || 10)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Soldiers Side */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 text-center">
                    黄巾军 ({battleState.soldiers.length})
                  </h3>
                  <div className={`grid gap-2 ${
                    battleState.soldiers.length === 1 ? 'grid-cols-1' : 
                    battleState.soldiers.length === 3 ? 'grid-cols-3' : 'grid-cols-5'
                  }`}>
                    {battleState.soldiers.map((health, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          scale: health <= 0 ? 0.5 : 1,
                          opacity: health <= 0 ? 0.3 : 1,
                          y: battleState.isActive ? [0, -3, 0] : 0
                        }}
                        transition={{ 
                          duration: 1, 
                          repeat: battleState.isActive ? Infinity : 0,
                          delay: index * 0.2,
                          ease: "easeInOut"
                        }}
                        className="text-center"
                      >
                        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-sm mb-1 overflow-hidden">
                          <img 
                            src="/soldier.png" 
                            alt="Soldier"
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                        <div className="bg-gray-700 rounded-full h-2 mb-1">
                          <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${health}%` }}
                            className={`h-2 rounded-full ${
                              health <= 0 ? 'bg-red-500' : 
                              health <= 25 ? 'bg-red-500' :
                              health <= 50 ? 'bg-orange-500' :
                              'bg-green-500'
                            }`}
                          />
                        </div>
                        <p className="text-white text-xs">{health}/100</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Log */}
            <div className="bg-gray-800/90 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-3">Battle Log</h3>
              <div className="bg-gray-900 rounded-lg p-3 h-24 overflow-y-auto">
                <AnimatePresence>
                  {battleState.battleLog.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-gray-300 text-sm mb-1"
                    >
                      {log}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {currentScreen === 'shop' && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-2 text-center">Legendary & Mythic Shop</h1>
            <p className="text-gray-400 text-center mb-4 text-sm">Purchase powerful legendary and mythic equipment</p>
            
            {sellMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-600 text-white p-3 rounded-lg mb-4 text-center"
              >
                {sellMessage}
              </motion.div>
            )}
            
            <div className="text-center mt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentScreen('city')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                Back to City
              </motion.button>
            </div>
          </div>
        )}

        {currentScreen === 'army' && (
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Army Management</h1>
            <p className="text-gray-400 text-sm mb-4">Coming soon...</p>
            <button
              onClick={() => setCurrentScreen('city')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              Back to City
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
