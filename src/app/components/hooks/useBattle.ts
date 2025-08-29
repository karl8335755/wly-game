import { useState, useEffect, useRef, useCallback } from 'react';
import { gearData } from '../../data/gearData';
import { generateUniqueId } from '../../utils/uniqueId';

// Types
export interface BattleState {
  isActive: boolean;
  currentLevel: number;
  soldiers: number[];
  currentTurn: number;
  battleLog: string[];
  showLevelOptions: boolean;
  gameLoopId: NodeJS.Timeout | null;
  speed: number; // 1 for normal speed (2s), 2 for fast speed (1s)
  itemDroppedThisTurn: boolean; // Track if an item was dropped this turn
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
    soldiers: Array(1).fill(100), // Level 1 starts with 1 soldier
    currentTurn: 0,
    battleLog: [],
    showLevelOptions: false,
    gameLoopId: null,
    speed: 1, // 1 = normal speed (2s), 2 = fast speed (1s)
    itemDroppedThisTurn: false
  });

  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [heroesInBattle, setHeroesInBattle] = useState<HeroInBattle[]>([]);
  const battleStateRef = useRef(battleState);
  const heroesInBattleRef = useRef<HeroInBattle[]>([]);
  const onLootDropRef = useRef<((item: any) => any[] | void) | null>(null);

  // Update ref when battleState changes
  useEffect(() => {
    battleStateRef.current = battleState;
  }, [battleState]);

  // Update heroes ref when heroesInBattle changes
  useEffect(() => {
    heroesInBattleRef.current = heroesInBattle;
  }, [heroesInBattle]);

  // Game loop function
  const gameLoop = useCallback((onLootDrop: (item: any) => any[] | void) => {
    console.log('Game loop running, turn:', battleStateRef.current.currentTurn + 1);
    const currentState = battleStateRef.current;
    const newCurrentLevel = currentState.currentLevel;
    const newSoldiers = [...currentState.soldiers];
    // Get the current heroes from ref to ensure we have the latest state
    const newHeroes = [...heroesInBattleRef.current];
    const newBattleLog = [...currentState.battleLog];
    const newCurrentTurn = currentState.currentTurn + 1;

    // Check if all soldiers are defeated
    console.log(`Game loop turn ${newCurrentTurn}: Soldiers health:`, newSoldiers);
    if (newSoldiers.every(health => health <= 0)) {
      // Mark level as completed
      console.log(`Level ${newCurrentLevel} completed! Adding to completedLevels`);
      setCompletedLevels(prev => {
        const newSet = new Set([...prev, newCurrentLevel]);
        console.log('Updated completedLevels:', Array.from(newSet));
        return newSet;
      });
      
      // Clear existing game loop and start new one for auto-grinding
      if (currentState.gameLoopId) {
        clearInterval(currentState.gameLoopId);
      }
      
      // Reset soldiers with fresh enemies for grinding (same level)
      const soldierCount = Math.min(newCurrentLevel, 10);
      const soldierHP = Math.max(50, 100 - (newCurrentLevel - 1) * 10);
      const freshSoldiers = Array(soldierCount).fill(soldierHP);
      
      // Heal all heroes to full HP when level is completed
      const healedHeroes = newHeroes.map(hero => ({
        ...hero,
        health: hero.maxHealth
      }));
      setHeroesInBattle(healedHeroes);
      
      // Update the ref immediately so next game loop uses healed heroes
      heroesInBattleRef.current = healedHeroes;
      
      const newGameLoopId = setInterval(() => gameLoop(onLootDropRef.current!), 2000);
      
      const newBattleState = {
        ...currentState,
        isActive: true,
        gameLoopId: newGameLoopId,
        soldiers: freshSoldiers,
        currentTurn: newCurrentTurn,
        battleLog: [
          ...newBattleLog,
          `Level ${newCurrentLevel} completed!`,
          `All heroes healed to full HP!`,
          `Continuing to grind level ${newCurrentLevel}...`
        ]
      };
      
      // Update the ref immediately so next game loop uses fresh soldiers
      battleStateRef.current = newBattleState;
      setBattleState(newBattleState);

      // Loot dropping logic
      const allCurrentItems = onLootDrop({}) as any[]; // Get current items count
      if (allCurrentItems && allCurrentItems.length >= 20) {
        newBattleLog.push('Inventory full! No more items can be collected.');
      } else {
        const dropRates = getDropRates(newCurrentLevel);
        const baseDropChance = 0.01; // 1% per enemy
        
        newSoldiers.forEach((soldierHealth, index) => {
          if (soldierHealth <= 0) {
            const random = Math.random();
            if (random < baseDropChance) {
              const rarity = selectRarity(dropRates);
              const droppedItem = generateItem(rarity, newCurrentLevel);
              const uniqueId = `${droppedItem.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}_${newCurrentTurn}`;
              
              onLootDrop({
                ...droppedItem,
                uniqueId,
                owner: 'All Heroes'
              });
              
              newBattleLog.push(`${soldierHealth <= 0 ? '黄巾军' : 'Soldier'} ${index + 1} dropped ${droppedItem.name}!`);
            }
          }
        });
      }
      
      return;
    }

    // Hero attacks
    newHeroes.forEach((hero, heroIndex) => {
      if (hero.health > 0) {
        const targetIndex = newSoldiers.findIndex(health => health > 0);
        if (targetIndex !== -1) {
          const damage = Math.floor(hero.attackPower * (0.8 + Math.random() * 0.4));
          const previousHealth = newSoldiers[targetIndex];
          newSoldiers[targetIndex] = Math.max(0, newSoldiers[targetIndex] - damage);
          newBattleLog.push(`${hero.name} attacks 黄巾军 ${targetIndex + 1} for ${damage} damage!`);
          
          // Give experience if 黄巾军 is defeated
          if (previousHealth > 0 && newSoldiers[targetIndex] <= 0) {
            const expGain = Math.floor(5 + Math.random() * 5); // 5-10 XP per 黄巾军
            newHeroes[heroIndex].experience += expGain;
            newBattleLog.push(`${hero.name} gained ${expGain} experience!`);
            
            // Check for level up
            if (newHeroes[heroIndex].experience >= newHeroes[heroIndex].experienceToNextLevel) {
              newHeroes[heroIndex].level += 1;
              newHeroes[heroIndex].experience -= newHeroes[heroIndex].experienceToNextLevel;
              newHeroes[heroIndex].experienceToNextLevel = Math.floor(newHeroes[heroIndex].experienceToNextLevel * 1.5);
              newHeroes[heroIndex].attackPower += 2;
              newHeroes[heroIndex].maxHealth += 10;
              newHeroes[heroIndex].health = newHeroes[heroIndex].maxHealth; // Full heal on level up
              newBattleLog.push(`${hero.name} reached level ${newHeroes[heroIndex].level}! Attack +2, HP +10!`);
            }
            
            // Loot dropping logic - only one item per turn
            if (!currentState.itemDroppedThisTurn) {
              console.log('Checking loot drop for defeated enemy...');
              const allCurrentItems = onLootDrop({}) as any[]; // Get current items count
              console.log('Current items count:', allCurrentItems?.length || 0);
              if (allCurrentItems && allCurrentItems.length >= 20) {
                newBattleLog.push('Inventory full! No more items can be collected.');
                console.log('Inventory full, skipping loot drop');
              } else {
                const dropRates = getDropRates(newCurrentLevel);
                const baseDropChance = 0.5; // 50% per enemy (temporarily increased for testing)
                
                const random = Math.random();
                console.log(`Loot check: random=${random.toFixed(3)}, threshold=${baseDropChance}, will drop: ${random < baseDropChance}`);
                if (random < baseDropChance) {
                  const rarity = selectRarity(dropRates);
                  console.log(`Dropping item: rarity=${rarity}, dropRates=`, dropRates);
                  const droppedItem = generateItem(rarity, newCurrentLevel);
                  console.log('Generated item:', droppedItem);
                  const uniqueId = generateUniqueId(droppedItem.id);
                  console.log(`Battle hook generated uniqueId: ${uniqueId} for item: ${droppedItem.name}`);
                  
                  try {
                    const result = onLootDrop({
                      ...droppedItem,
                      uniqueId,
                      owner: 'All Heroes'
                    });
                    console.log('onLootDrop result:', result);
                    
                    newBattleLog.push(`黄巾军 ${targetIndex + 1} dropped ${droppedItem.name}!`);
                    console.log(`Successfully dropped: ${droppedItem.name}`);
                    
                    // Mark that an item was dropped this turn
                    currentState.itemDroppedThisTurn = true;
                  } catch (error) {
                    console.error('Error in onLootDrop:', error);
                  }
                } else {
                  console.log('Loot drop failed - random check');
                }
              }
            } else {
              console.log('Item already dropped this turn, skipping loot drop');
            }
          }
        }
      }
    });

            // 黄巾军 attacks
    newSoldiers.forEach((soldierHealth, soldierIndex) => {
      if (soldierHealth > 0) {
        const targetHero = newHeroes.find(hero => hero.health > 0);
        if (targetHero) {
          const damage = Math.floor(15 * (0.8 + Math.random() * 0.4));
          const _heroIndex = newHeroes.findIndex(h => h.name === targetHero.name);
          if (_heroIndex !== -1) {
            newHeroes[_heroIndex].health = Math.max(0, newHeroes[_heroIndex].health - damage);
          }
          newBattleLog.push(`黄巾军 ${soldierIndex + 1} attacks ${targetHero.name} for ${damage} damage!`);
        }
      }
    });

    // Check if all heroes are defeated
    if (newHeroes.every(hero => hero.health <= 0)) {
      // Clear the game loop to stop combat
      if (currentState.gameLoopId) {
        clearInterval(currentState.gameLoopId);
      }
      
      newBattleLog.push('All heroes defeated! Battle lost!');
      setBattleState(prev => ({
        ...prev,
        isActive: false,
        gameLoopId: null,
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
      battleLog: newBattleLog.slice(-50), // Keep last 50 messages
      itemDroppedThisTurn: false // Reset item drop flag for next turn
    }));

    setHeroesInBattle(newHeroes);
  }, [heroesInBattle]);

  // Start battle function
  const startBattle = useCallback((recruitedGenerals: string[], onLootDrop: (item: any) => any[] | void) => {
    // Store the onLootDrop callback for use in toggleSpeed
    onLootDropRef.current = onLootDrop;
    console.log('startBattle called with onLootDrop:', onLootDrop);
    
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
    
    // Set heroes first, then start battle after a small delay to ensure state is updated
    console.log('Setting heroes in battle:', initialHeroes);
    setHeroesInBattle(initialHeroes);

    // Use current state from ref to avoid stale closure
    const currentState = battleStateRef.current;
    const soldierCount = Math.min(currentState.currentLevel, 10);
    const soldierHP = Math.max(50, 100 - (currentState.currentLevel - 1) * 10);
    console.log(`Starting battle: Level ${currentState.currentLevel}, ${soldierCount} soldiers with ${soldierHP} HP each`);

    // Start battle state first
    setBattleState(prev => ({
      ...prev,
      isActive: true,
      soldiers: Array(soldierCount).fill(soldierHP),
      battleLog: [`Battle started! Level ${currentState.currentLevel}`, `${soldierCount} 黄巾军 with ${soldierHP} HP each`],
      itemDroppedThisTurn: false
    }));

    // Start game loop after a small delay to ensure heroes are set
    setTimeout(() => {
      const interval = currentState.speed === 1 ? 2000 : 1000; // 1x = 2s, 2x = 1s
      console.log('Starting game loop with interval:', interval, 'ms');
      const gameLoopId = setInterval(() => {
        console.log('Game loop interval triggered');
        gameLoop(onLootDrop);
      }, interval);
      setBattleState(prev => ({
        ...prev,
        gameLoopId
      }));
    }, 100);
  }, [gameLoop]);

  // Next level function
  const nextLevel = useCallback((onLootDrop: (item: any) => any[] | void) => {
    // Store the onLootDrop callback for use in toggleSpeed
    onLootDropRef.current = onLootDrop;
    // Check if current level is completed before allowing progression
    console.log(`Attempting to go to next level. Current level: ${battleState.currentLevel}, Completed levels:`, Array.from(completedLevels));
    if (!completedLevels.has(battleState.currentLevel)) {
      console.log(`Cannot proceed to next level. Level ${battleState.currentLevel} not completed.`);
      return;
    }
    
    const nextLevel = battleState.currentLevel + 1;
    
    if (battleState.gameLoopId) {
      clearInterval(battleState.gameLoopId);
    }
    
    const interval = battleState.speed === 1 ? 2000 : 1000; // 1x = 2s, 2x = 1s
    const gameLoopId = setInterval(() => gameLoop(onLootDrop), interval);
    
    setBattleState(prev => ({
      ...prev,
      currentLevel: nextLevel,
      isActive: true,
      gameLoopId,
      soldiers: Array(Math.min(nextLevel, 10)).fill(Math.max(50, 100 - (nextLevel - 1) * 10)),
      battleLog: [`Starting Level ${nextLevel}!`],
      itemDroppedThisTurn: false
    }));
  }, [battleState.currentLevel, battleState.gameLoopId, gameLoop, completedLevels]);

  // Toggle speed function
  const toggleSpeed = useCallback(() => {
    const newSpeed = battleState.speed === 1 ? 2 : 1;
    const newInterval = newSpeed === 1 ? 2000 : 1000; // 1x = 2s, 2x = 1s
    
    // Clear existing interval
    if (battleState.gameLoopId) {
      clearInterval(battleState.gameLoopId);
    }
    
    // Start new interval with updated speed
    let newGameLoopId = null;
    if (battleState.isActive && onLootDropRef.current) {
      newGameLoopId = setInterval(() => gameLoop(onLootDropRef.current!), newInterval);
    }
    
    setBattleState(prev => ({
      ...prev,
      speed: newSpeed,
      gameLoopId: newGameLoopId
    }));
  }, [battleState.speed, battleState.gameLoopId, battleState.isActive, gameLoop]);

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
    toggleSpeed,
    setBattleState
  };
};

// Helper functions
const getDropRates = (level: number) => {
  let rates;
  if (level >= 6) {
    rates = { common: 0.6, rare: 0.25, epic: 0.1, legendary: 0.03, mythic: 0.02 };
  } else if (level >= 4) {
    rates = { common: 0.65, rare: 0.25, epic: 0.08, legendary: 0.02, mythic: 0 };
  } else {
    rates = { common: 0.7, rare: 0.25, epic: 0.05, legendary: 0, mythic: 0 };
  }
  console.log(`Drop rates for level ${level}:`, rates);
  return rates;
};

const selectRarity = (dropRates: any) => {
  const random = Math.random();
  let cumulative = 0;
  console.log('Selecting rarity with random:', random.toFixed(3), 'dropRates:', dropRates);
  for (const [rarity, rate] of Object.entries(dropRates)) {
    cumulative += rate as number;
    console.log(`Checking ${rarity}: cumulative=${cumulative.toFixed(3)}, will select: ${random <= cumulative}`);
    if (random <= cumulative) return rarity;
  }
  console.log('Falling back to common');
  return 'common';
};

const generateItem = (rarity: string, _level: number) => {
  const itemsOfRarity = gearData.filter(item => item.rarity === rarity);
  console.log(`Generating ${rarity} item. Found ${itemsOfRarity.length} items of this rarity`);
  
  if (itemsOfRarity.length === 0) {
    // Fallback to common if no items of that rarity
    const commonItems = gearData.filter(item => item.rarity === 'common');
    console.log('No items of rarity found, falling back to common. Found', commonItems.length, 'common items');
    return { ...commonItems[0], owner: 'All Heroes' };
  }
  
  const randomItem = itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)];
  console.log('Selected item:', randomItem.name, 'Type:', randomItem.type);
  return { ...randomItem, owner: 'All Heroes' };
};
