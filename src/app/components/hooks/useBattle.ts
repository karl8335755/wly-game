import { useState, useEffect, useRef, useCallback } from 'react';

// Types
export interface BattleState {
  isActive: boolean;
  currentLevel: number;
  heroHealth: number;
  heroMaxHealth: number;
  heroLevel: number;
  heroExperience: number;
  experienceToNextLevel: number;
  heroAttackPower: number;
  selectedHero: string | null;
  soldiers: number[];
  currentTurn: number;
  battleLog: string[];
  showLevelOptions: boolean;
  gameLoopId: NodeJS.Timeout | null;
}

export interface HeroInBattle {
  name: string;
  health: number;
  maxHealth: number;
  attackPower: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

// Hero data
const heroData = [
  { name: '刘备', attackPower: 25, health: 120, image: '/liubei.png' },
  { name: '关羽', attackPower: 30, health: 100, image: '/guanyu.png' },
  { name: '张飞', attackPower: 28, health: 110, image: '/zhugeliang.png' },
  { name: '诸葛亮', attackPower: 22, health: 90, image: '/caocao.png' }
];

export const useBattle = () => {
  const [battleState, setBattleState] = useState<BattleState>({
    isActive: false,
    currentLevel: 1,
    heroHealth: 100,
    heroMaxHealth: 100,
    heroLevel: 1,
    heroExperience: 0,
    experienceToNextLevel: 10,
    heroAttackPower: 20,
    selectedHero: null,
    soldiers: Array(1).fill(100),
    currentTurn: 0,
    battleLog: [],
    showLevelOptions: false,
    gameLoopId: null
  });

  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [heroesInBattle, setHeroesInBattle] = useState<HeroInBattle[]>([]);
  const battleStateRef = useRef(battleState);

  // Update ref when battleState changes
  useEffect(() => {
    battleStateRef.current = battleState;
  }, [battleState]);

  // Game loop function
  const gameLoop = useCallback((onLootDrop: (item: any) => any[] | void) => {
    const currentState = battleStateRef.current;
    const newCurrentLevel = currentState.currentLevel;
    const newSoldiers = [...currentState.soldiers];
    const newHeroes = [...heroesInBattle];
    const newBattleLog = [...currentState.battleLog];
    const newCurrentTurn = currentState.currentTurn + 1;

    // Check if all soldiers are defeated
    if (newSoldiers.every(health => health <= 0)) {
      // Mark level as completed
      setCompletedLevels(prev => new Set([...prev, newCurrentLevel]));
      
      // Clear existing game loop and start new one for auto-grinding
      if (currentState.gameLoopId) {
        clearInterval(currentState.gameLoopId);
      }
      
      const newGameLoopId = setInterval(() => gameLoop(onLootDrop), 2000);
      
      setBattleState(prev => ({
        ...prev,
        isActive: true,
        gameLoopId: newGameLoopId,
        soldiers: newSoldiers,
        currentTurn: newCurrentTurn,
        battleLog: [
          ...newBattleLog,
          `🎉 Level ${newCurrentLevel} completed!`,
          `🔄 Auto-restarting level ${newCurrentLevel} for grinding...`
        ]
      }));

      // Loot dropping logic
      const allCurrentItems = onLootDrop({}) as any[]; // Get current items count
      if (allCurrentItems && allCurrentItems.length >= 20) {
        newBattleLog.push('📦 Inventory full! No more items can be collected.');
      } else {
        const dropRates = getDropRates(newCurrentLevel);
        const baseDropChance = 0.01; // 1% per enemy
        
        newSoldiers.forEach((soldierHealth, index) => {
          if (soldierHealth <= 0) {
            const random = Math.random();
            if (random < baseDropChance) {
              const rarity = selectRarity(dropRates);
              const droppedItem = generateItem(rarity, newCurrentLevel);
              const uniqueId = `${droppedItem.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              onLootDrop({
                ...droppedItem,
                uniqueId,
                owner: 'All Heroes'
              });
              
              newBattleLog.push(`🎁 ${soldierHealth <= 0 ? 'Enemy' : 'Soldier'} ${index + 1} dropped ${droppedItem.name}!`);
            }
          }
        });
      }
      
      return;
    }

    // Hero attacks
    newHeroes.forEach((hero, _heroIndex) => {
      if (hero.health > 0) {
        const targetIndex = newSoldiers.findIndex(health => health > 0);
        if (targetIndex !== -1) {
          const damage = Math.floor(hero.attackPower * (0.8 + Math.random() * 0.4));
          newSoldiers[targetIndex] = Math.max(0, newSoldiers[targetIndex] - damage);
          newBattleLog.push(`⚔️ ${hero.name} attacks Enemy ${targetIndex + 1} for ${damage} damage!`);
        }
      }
    });

    // Enemy attacks
    newSoldiers.forEach((soldierHealth, soldierIndex) => {
      if (soldierHealth > 0) {
        const targetHero = newHeroes.find(hero => hero.health > 0);
        if (targetHero) {
          const damage = Math.floor(15 * (0.8 + Math.random() * 0.4));
          const _heroIndex = newHeroes.findIndex(h => h.name === targetHero.name);
          if (_heroIndex !== -1) {
            newHeroes[_heroIndex].health = Math.max(0, newHeroes[_heroIndex].health - damage);
          }
          newBattleLog.push(`💥 Enemy ${soldierIndex + 1} attacks ${targetHero.name} for ${damage} damage!`);
        }
      }
    });

    // Check if all heroes are defeated
    if (newHeroes.every(hero => hero.health <= 0)) {
      newBattleLog.push('💀 All heroes defeated! Battle lost!');
      setBattleState(prev => ({
        ...prev,
        isActive: false,
        soldiers: newSoldiers,
        currentTurn: newCurrentTurn,
        battleLog: newBattleLog
      }));
      return;
    }

    setBattleState(prev => ({
      ...prev,
      soldiers: newSoldiers,
      currentTurn: newCurrentTurn,
      battleLog: newBattleLog.slice(-50) // Keep last 50 messages
    }));

    setHeroesInBattle(newHeroes);
  }, [heroesInBattle]);

  // Start battle function
  const startBattle = useCallback((recruitedGenerals: string[], onLootDrop: (item: any) => any[] | void) => {
    // Initialize heroes in battle
    const initialHeroes = recruitedGenerals.map(heroName => {
      const hero = heroData.find(h => h.name === heroName);
      return {
        name: heroName,
        health: hero?.health || 100,
        maxHealth: hero?.health || 100,
        attackPower: hero?.attackPower || 20,
        level: 1,
        experience: 0,
        experienceToNextLevel: 10
      };
    });
    
    setHeroesInBattle(initialHeroes);

    // Determine soldier count and HP based on level
    const soldierCount = Math.min(battleState.currentLevel + 2, 10);
    const soldierHP = Math.max(50, 100 - (battleState.currentLevel - 1) * 10);

    const gameLoopId = setInterval(() => gameLoop(onLootDrop), 2000);
    
    setBattleState(prev => ({
      ...prev,
      isActive: true,
      gameLoopId,
      soldiers: Array(soldierCount).fill(soldierHP),
      battleLog: [`🚀 Battle started! Level ${battleState.currentLevel}`, `👥 ${soldierCount} enemies with ${soldierHP} HP each`]
    }));
  }, [battleState.currentLevel, gameLoop]);

  // Next level function
  const nextLevel = useCallback((onLootDrop: (item: any) => any[] | void) => {
    const nextLevel = battleState.currentLevel + 1;
    
    if (battleState.gameLoopId) {
      clearInterval(battleState.gameLoopId);
    }
    
    const gameLoopId = setInterval(() => gameLoop(onLootDrop), 2000);
    
    setBattleState(prev => ({
      ...prev,
      currentLevel: nextLevel,
      isActive: true,
      gameLoopId,
      soldiers: Array(Math.min(nextLevel + 2, 10)).fill(Math.max(50, 100 - (nextLevel - 1) * 10)),
      battleLog: [`🚀 Starting Level ${nextLevel}!`]
    }));
  }, [battleState.currentLevel, battleState.gameLoopId, gameLoop]);

  // Stop battle function
  const stopBattle = useCallback(() => {
    if (battleState.gameLoopId) {
      clearInterval(battleState.gameLoopId);
    }
    setBattleState(prev => ({
      ...prev,
      isActive: false,
      gameLoopId: null
    }));
  }, [battleState.gameLoopId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (battleState.gameLoopId) {
        clearInterval(battleState.gameLoopId);
      }
    };
  }, [battleState.gameLoopId]);

  return {
    battleState,
    completedLevels,
    heroesInBattle,
    startBattle,
    nextLevel,
    stopBattle,
    setBattleState
  };
};

import { gearData } from '../../data/gearData';

// Helper functions
const getDropRates = (level: number) => {
  if (level >= 6) return { common: 0.6, rare: 0.25, epic: 0.1, legendary: 0.03, mythic: 0.02 };
  if (level >= 4) return { common: 0.65, rare: 0.25, epic: 0.08, legendary: 0.02, mythic: 0 };
  return { common: 0.7, rare: 0.25, epic: 0.05, legendary: 0, mythic: 0 };
};

const selectRarity = (dropRates: any) => {
  const random = Math.random();
  let cumulative = 0;
  for (const [rarity, rate] of Object.entries(dropRates)) {
    cumulative += rate as number;
    if (random <= cumulative) return rarity;
  }
  return 'common';
};

const generateItem = (rarity: string, _level: number) => {
  const itemsOfRarity = gearData.filter(item => item.rarity === rarity);
  if (itemsOfRarity.length === 0) {
    // Fallback to common if no items of that rarity
    const commonItems = gearData.filter(item => item.rarity === 'common');
    return { ...commonItems[0], owner: 'All Heroes' };
  }
  
  const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
  return { ...randomItem, owner: 'All Heroes' };
};
