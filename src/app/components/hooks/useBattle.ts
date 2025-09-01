import { useState, useEffect, useRef, useCallback } from 'react';
import { gearData } from '../../data/gearData';
import { generateUniqueId } from '../../utils/uniqueId';

// Types
export interface BattleState {
  isActive: boolean;
  currentLevel: number;
  currentChapter: number;
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



export const useBattle = (heroEquippedGear: { [heroName: string]: { weapon: any; armor: any } }) => {
  // Helper function to calculate enemy configuration for a given level and chapter
  const getEnemyConfig = (level: number, chapter: number = 1) => {
    // Chapter multiplier for HP and damage scaling
    const chapterMultiplier = Math.pow(1.5, chapter - 1); // 1.5x per chapter
    
    if (level < 6) {
      // Levels 1-5: 100 HP base, enemy count = level
      return {
        count: level,
        hp: Math.floor(100 * chapterMultiplier)
      };
    } else if (level < 10) {
      // Levels 6-9: 5 enemies, HP doubles each level (200, 400, 800, 1600)
      return {
        count: 5,
        hp: Math.floor(100 * Math.pow(2, level - 5) * chapterMultiplier)
      };
    } else {
      // Level 10: Boss with huge HP and attack
      return {
        count: 1,
        hp: Math.floor(5000 * chapterMultiplier)
      };
    }
  };
  const [battleState, setBattleState] = useState<BattleState>({
    isActive: false,
    currentLevel: 1,
    currentChapter: 1,
    soldiers: Array(1).fill(100), // Level 1 starts with 1 soldier at 100 HP
    currentTurn: 0,
    battleLog: [],
    showLevelOptions: false,
    gameLoopId: null,
    speed: 1, // 1 = normal speed (2s), 2 = fast speed (1s)
    itemDroppedThisTurn: false
  });

  const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set()); // Format: "chapter-level"
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

    const currentState = battleStateRef.current;
    const newCurrentLevel = currentState.currentLevel;
    const newSoldiers = [...currentState.soldiers];
    // Get the current heroes from ref to ensure we have the latest state
    const newHeroes = [...heroesInBattleRef.current];
    const newBattleLog = [...currentState.battleLog];
    const newCurrentTurn = currentState.currentTurn + 1;

    // Check if all soldiers are defeated

    if (newSoldiers.every(health => health <= 0)) {
      const currentChapter = currentState.currentChapter;
      
      // Mark level as completed
      setCompletedLevels(prev => {
        const newSet = new Set([...prev, `${currentChapter}-${newCurrentLevel}`]);
        return newSet;
      });
      
      // Check if this was the boss level (level 10) - advance to next chapter
      if (newCurrentLevel === 10) {
        const nextChapter = currentChapter + 1;
        
        // Clear existing game loop
        if (currentState.gameLoopId) {
          clearInterval(currentState.gameLoopId);
        }
        
        // Heal all heroes to full HP when chapter is completed
        const healedHeroes = newHeroes.map(hero => ({
          ...hero,
          health: hero.maxHealth
        }));
        setHeroesInBattle(healedHeroes);
        heroesInBattleRef.current = healedHeroes;
        
        // Start new chapter at level 1
        const newEnemyConfig = getEnemyConfig(1, nextChapter);
        const freshSoldiers = Array(newEnemyConfig.count).fill(newEnemyConfig.hp);
        
        const newGameLoopId = setInterval(() => gameLoop(onLootDropRef.current!), 2000);
        
        const newBattleState = {
          ...currentState,
          currentLevel: 1,
          currentChapter: nextChapter,
          isActive: true,
          gameLoopId: newGameLoopId,
          soldiers: freshSoldiers,
          currentTurn: newCurrentTurn,
          battleLog: [
            ...newBattleLog,
            `Chapter ${currentChapter} completed!`,
            `Advancing to Chapter ${nextChapter}!`,
            `All heroes healed to full HP!`,
            `Starting Chapter ${nextChapter} Level 1...`
          ]
        };
        
        battleStateRef.current = newBattleState;
        setBattleState(newBattleState);
        return;
      }
      
      // Clear existing game loop and start new one for auto-grinding
      if (currentState.gameLoopId) {
        clearInterval(currentState.gameLoopId);
      }
      
      // Reset soldiers with fresh enemies for grinding (same level)
      const enemyConfig = getEnemyConfig(newCurrentLevel, currentChapter);
      const freshSoldiers = Array(enemyConfig.count).fill(enemyConfig.hp);
      
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
        const dropRates = getDropRates(newCurrentLevel, currentChapter);
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
        const aliveEnemies = newSoldiers.filter(health => health > 0);
                            if (aliveEnemies.length > 0) {
            // Debug logging for hero stats
            if (hero.name === '刘备') {
              console.log(`${hero.name} turn ${newCurrentTurn}: Level ${hero.level}, Attack ${hero.attackPower}, Health ${hero.health}/${hero.maxHealth}`);
            }
            
            // Check if hero has AOE weapon or armor equipped
            const heroGear = heroEquippedGear[hero.name] || {};
            const hasAOEWeapon = heroGear.weapon?.specialEffect === 'aoe';
            const hasAOEArmor = heroGear.armor?.specialEffect === 'aoe';
            
            // Check for mythic set bonus (100% crit)
            const hasMythicWeapon = heroGear.weapon?.rarity === 'mythic';
            const hasMythicArmor = heroGear.armor?.rarity === 'mythic';
            const hasMythicSetBonus = hasMythicWeapon && hasMythicArmor;
            
            // Calculate base damage
            let damage = Math.floor(hero.attackPower * (0.8 + Math.random() * 0.4));
            
            // Apply mythic set bonus (100% crit = double damage)
            if (hasMythicSetBonus) {
              damage = Math.floor(damage * 2);
            }
          
          // Calculate AOE targets: weapon = 3 targets, armor = 2 targets, both = 5 targets
          let aoeTargets = 0;
          if (hasAOEWeapon && hasAOEArmor) {
            aoeTargets = 5; // Both equipped = 5 targets
          } else if (hasAOEWeapon) {
            aoeTargets = 3; // Weapon only = 3 targets
          } else if (hasAOEArmor) {
            aoeTargets = 2; // Armor only = 2 targets
          }
          
          // Debug logging
          console.log(`Hero: ${hero.name}, Weapon:`, heroGear.weapon, `Armor:`, heroGear.armor, `AOE Targets:`, aoeTargets, `Mythic Set:`, hasMythicSetBonus);
          console.log('All equipped gear:', heroEquippedGear);
          
          if (aoeTargets > 0) {
            // AOE attack - targets based on equipped gear
            let totalDamage = 0;
            const enemyIndices = newSoldiers.map((health, index) => ({ health, index })).filter(enemy => enemy.health > 0);
            
            // Damage enemies based on AOE targets (or all available if less than target count)
            const targetsToHit = Math.min(aoeTargets, enemyIndices.length);
            console.log(`AOE Debug: ${hero.name} has ${aoeTargets} AOE targets, ${enemyIndices.length} enemies available, hitting ${targetsToHit} enemies`);
            for (let i = 0; i < targetsToHit; i++) {
              const enemy = enemyIndices[i];
              const previousHealth = enemy.health;
              newSoldiers[enemy.index] = Math.max(0, enemy.health - damage);
              totalDamage += Math.min(damage, previousHealth);
            }
            const critText = hasMythicSetBonus ? ' (CRITICAL!)' : '';
            newBattleLog.push(`${hero.name} uses AOE attack! Dealt ${totalDamage} damage to ${targetsToHit} enemies!${critText}`);
          } else {
            // Single target attack
            const targetIndex = newSoldiers.findIndex(health => health > 0);
            const previousHealth = newSoldiers[targetIndex];
            newSoldiers[targetIndex] = Math.max(0, newSoldiers[targetIndex] - damage);
            const critText = hasMythicSetBonus ? ' (CRITICAL!)' : '';
            newBattleLog.push(`${hero.name} attacks 黄巾军 ${targetIndex + 1} for ${damage} damage!${critText}`);
          }
          
          // Give experience for defeated enemies
          let totalExpGain = 0;
          newSoldiers.forEach((soldierHealth, soldierIndex) => {
            if (soldierHealth <= 0) {
              const expGain = Math.floor(5 + Math.random() * 5); // 5-10 XP per 黄巾军
              totalExpGain += expGain;
            }
          });
          
          if (totalExpGain > 0) {
            newHeroes[heroIndex].experience += totalExpGain;
            newBattleLog.push(`${hero.name} gained ${totalExpGain} experience!`);
            
            // Check for level up
            if (newHeroes[heroIndex].experience >= newHeroes[heroIndex].experienceToNextLevel) {
              const newLevel = newHeroes[heroIndex].level + 1;
              newHeroes[heroIndex].level = newLevel;
              newHeroes[heroIndex].experience -= newHeroes[heroIndex].experienceToNextLevel;
              newHeroes[heroIndex].experienceToNextLevel = Math.floor(newHeroes[heroIndex].experienceToNextLevel * 1.5);
              
              // Calculate stat increases based on level
              const attackIncrease = Math.floor(3 + (newLevel * 0.5)); // 3-8 attack per level
              const healthIncrease = Math.floor(15 + (newLevel * 2)); // 15-35 HP per level
              
              const oldAttack = newHeroes[heroIndex].attackPower;
              newHeroes[heroIndex].attackPower += attackIncrease;
              newHeroes[heroIndex].maxHealth += healthIncrease;
              newHeroes[heroIndex].health = newHeroes[heroIndex].maxHealth; // Full heal on level up
              newBattleLog.push(`${hero.name} reached level ${newLevel}! Attack +${attackIncrease}, HP +${healthIncrease}!`);
              
              // Debug logging for attack power changes
              console.log(`${hero.name} level up: ${oldAttack} -> ${newHeroes[heroIndex].attackPower} (base +${attackIncrease})`);
            }
          }
        }
      }
    });

    // Loot dropping logic - check for defeated enemies after all hero attacks
    if (!currentState.itemDroppedThisTurn) {
      const allCurrentItems = onLootDrop({}) as any[]; // Get current items count
      if (allCurrentItems && allCurrentItems.length >= 20) {
        newBattleLog.push('Inventory full! No more items can be collected.');
      } else {
        const dropRates = getDropRates(newCurrentLevel, currentChapter);
        const baseDropChance = 0.3; // 30% chance per defeated enemy
        
        // Check each defeated enemy for loot
        let itemDroppedThisTurn = false;
        newSoldiers.forEach((soldierHealth, soldierIndex) => {
          if (soldierHealth <= 0 && !itemDroppedThisTurn) {
            const random = Math.random();
            if (random < baseDropChance) {
              const rarity = selectRarity(dropRates);
              const droppedItem = generateItem(rarity, newCurrentLevel);
              const uniqueId = generateUniqueId(droppedItem.id);
              
              try {
                onLootDrop({
                  ...droppedItem,
                  uniqueId,
                  owner: 'All Heroes'
                });
                
                const enemyName = newCurrentLevel === 10 ? 'Boss' : `黄巾军 ${soldierIndex + 1}`;
                newBattleLog.push(`${enemyName} dropped ${droppedItem.name}!`);
                
                // Mark that an item was dropped this turn
                itemDroppedThisTurn = true;
                currentState.itemDroppedThisTurn = true;
              } catch (error) {
                console.error('Error in onLootDrop:', error);
              }
            }
          }
        });
      }
    }

    // 黄巾军 attacks
    newSoldiers.forEach((soldierHealth, soldierIndex) => {
      if (soldierHealth > 0) {
        const targetHero = newHeroes.find(hero => hero.health > 0);
        if (targetHero) {
          // Level 10 boss has much higher damage, scale with chapter
          const currentChapter = currentState.currentChapter;
          const chapterMultiplier = Math.pow(1.2, currentChapter - 1); // 1.2x damage per chapter
          const baseDamage = newCurrentLevel === 10 ? 100 : 15;
          const damage = Math.floor(baseDamage * chapterMultiplier * (0.8 + Math.random() * 0.4));
          const _heroIndex = newHeroes.findIndex(h => h.name === targetHero.name);
          if (_heroIndex !== -1) {
            newHeroes[_heroIndex].health = Math.max(0, newHeroes[_heroIndex].health - damage);
          }
          const enemyName = newCurrentLevel === 10 ? 'Boss' : `黄巾军 ${soldierIndex + 1}`;
          newBattleLog.push(`${enemyName} attacks ${targetHero.name} for ${damage} damage!`);
        }
      }
    });

    // Check if all heroes are defeated
    if (newHeroes.every(hero => hero.health <= 0)) {
      // Clear the game loop to stop combat
      if (currentState.gameLoopId) {
        clearInterval(currentState.gameLoopId);
      }
      
      newBattleLog.push('All heroes defeated! Resetting to level 1...');
      
      // Reset to level 1 and heal all heroes with gear bonuses
      const resetHeroes = newHeroes.map(hero => {
        const baseHero = heroData.find(h => h.name === hero.name);
        const heroGear = heroEquippedGear[hero.name] || {};
        
        // Calculate gear bonuses
        const weaponBonus = heroGear.weapon?.attackBonus || 0;
        const armorBonus = heroGear.armor?.healthBonus || 0;
        
        const baseHealth = baseHero?.health || 100;
        const baseAttack = baseHero?.attackPower || 20;
        
        return {
          ...hero,
          health: baseHealth + armorBonus,
          maxHealth: baseHealth + armorBonus,
          level: 1,
          experience: 0,
          experienceToNextLevel: 10,
          attackPower: baseAttack + weaponBonus
        };
      });
      
      setHeroesInBattle(resetHeroes);
      heroesInBattleRef.current = resetHeroes;
      
      // Reset battle state to level 1
      const resetBattleState = {
        ...currentState,
        currentLevel: 1,
        isActive: false,
        gameLoopId: null,
        soldiers: Array(1).fill(100), // Level 1 starts with 1 soldier
        currentTurn: 0,
        battleLog: [
          ...newBattleLog,
          'All heroes have been reset to level 1!',
          'Ready to start a new battle from level 1.'
        ]
      };
      
      battleStateRef.current = resetBattleState;
      setBattleState(resetBattleState);
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
    
    // Initialize heroes in battle with equipped gear bonuses
    const initialHeroes = recruitedGenerals.map(heroName => {
      const hero = heroData.find(h => h.name === heroName);
      const heroGear = heroEquippedGear[heroName] || {};
      
      // Calculate gear bonuses
      const weaponBonus = heroGear.weapon?.attackBonus || 0;
      const armorBonus = heroGear.armor?.healthBonus || 0;
      
      const baseHealth = hero?.health || 100;
      const baseAttack = hero?.attackPower || 20;
      
      return {
        name: heroName,
        health: baseHealth + armorBonus,
        maxHealth: baseHealth + armorBonus,
        attackPower: baseAttack + weaponBonus,
        level: 1,
        experience: 0,
        experienceToNextLevel: 10
      };
    });
    
    // Set heroes first, then start battle after a small delay to ensure state is updated
    setHeroesInBattle(initialHeroes);

    // Use current state from ref to avoid stale closure
    const currentState = battleStateRef.current;
    const enemyConfig = getEnemyConfig(currentState.currentLevel, currentState.currentChapter);

    // Start battle state first
    setBattleState(prev => ({
      ...prev,
      isActive: true,
      soldiers: Array(enemyConfig.count).fill(enemyConfig.hp),
      battleLog: [`Battle started! Chapter ${currentState.currentChapter} Level ${currentState.currentLevel}`, `${enemyConfig.count} enemies with ${enemyConfig.hp} HP each`],
      itemDroppedThisTurn: false
    }));

    // Start game loop after a small delay to ensure heroes are set
    setTimeout(() => {
      const interval = currentState.speed === 1 ? 2000 : 1000; // 1x = 2s, 2x = 1s
      const gameLoopId = setInterval(() => {
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
    const currentChapter = battleState.currentChapter;
    const currentLevelKey = `${currentChapter}-${battleState.currentLevel}`;
    if (!completedLevels.has(currentLevelKey)) {
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
      soldiers: Array(getEnemyConfig(nextLevel, prev.currentChapter).count).fill(getEnemyConfig(nextLevel, prev.currentChapter).hp),
      battleLog: [`Starting Chapter ${prev.currentChapter} Level ${nextLevel}!`],
      itemDroppedThisTurn: false
    }));
  }, [battleState.currentLevel, battleState.gameLoopId, gameLoop, completedLevels]);

  // Change to specific level function
  const changeToLevel = useCallback((targetLevel: number, onLootDrop: (item: any) => any[] | void) => {
    // Store the onLootDrop callback for use in toggleSpeed
    onLootDropRef.current = onLootDrop;
    
    // Check if the target level is unlocked (completed or level 1)
    const currentChapter = battleState.currentChapter;
    const levelKey = `${currentChapter}-${targetLevel}`;
    const isUnlocked = targetLevel === 1 || completedLevels.has(levelKey);
    if (!isUnlocked) {
      return;
    }
    
    // Stop current battle if active
    if (battleState.gameLoopId) {
      clearInterval(battleState.gameLoopId);
    }
    
    // Calculate soldier configuration for target level
    const enemyConfig = getEnemyConfig(targetLevel, currentChapter);
    
    // Start new battle immediately with the target level
    const interval = battleState.speed === 1 ? 2000 : 1000; // 1x = 2s, 2x = 1s
    const gameLoopId = setInterval(() => gameLoop(onLootDrop), interval);
    
    setBattleState(prev => ({
      ...prev,
      currentLevel: targetLevel,
      isActive: true, // Auto-start battle when changing levels
      gameLoopId,
      soldiers: Array(enemyConfig.count).fill(enemyConfig.hp),
      currentTurn: 0,
      battleLog: [`Switched to Chapter ${currentChapter} Level ${targetLevel}! Battle started!`],
      itemDroppedThisTurn: false
    }));
  }, [battleState.gameLoopId, battleState.speed, battleState.currentChapter, completedLevels, gameLoop]);

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
    changeToLevel,
    stopBattle,
    toggleSpeed,
    setBattleState
  };
};

// Helper functions
const getDropRates = (level: number, chapter: number = 1) => {
  let rates;
  if (level >= 15) {
    // Level 15+: Best rates
    rates = { common: 0.35, uncommon: 0.25, rare: 0.2, epic: 0.12, legendary: 0.05, mythic: 0.03 };
  } else if (level >= 12) {
    // Level 12-14: Very good rates
    rates = { common: 0.4, uncommon: 0.25, rare: 0.18, epic: 0.1, legendary: 0.04, mythic: 0.03 };
  } else if (level >= 10) {
    // Level 10-11: Good rates
    rates = { common: 0.45, uncommon: 0.25, rare: 0.16, epic: 0.08, legendary: 0.03, mythic: 0.03 };
  } else if (level >= 8) {
    // Level 8-9: Improved rates
    rates = { common: 0.48, uncommon: 0.25, rare: 0.15, epic: 0.07, legendary: 0.03, mythic: 0.02 };
  } else if (level >= 6) {
    // Level 6-7: Base high-level rates
    rates = { common: 0.5, uncommon: 0.25, rare: 0.15, epic: 0.07, legendary: 0.02, mythic: 0.01 };
  } else if (level >= 4) {
    rates = { common: 0.55, uncommon: 0.25, rare: 0.15, epic: 0.04, legendary: 0.01, mythic: 0 };
  } else if (level >= 2) {
    rates = { common: 0.6, uncommon: 0.25, rare: 0.12, epic: 0.03, legendary: 0, mythic: 0 };
  } else {
    rates = { common: 0.65, uncommon: 0.25, rare: 0.1, epic: 0, legendary: 0, mythic: 0 };
  }
  return rates;
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
