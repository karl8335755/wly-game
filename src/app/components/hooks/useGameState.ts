import { useState, useEffect } from 'react';

// Types
export interface Resources {
  gold: number;
  food: number;
  population: number;
}

export interface GameState {
  currentScreen: 'city' | 'army' | 'battle' | 'shop';
  resources: Resources;
  cityTier: number;
  populationCapacity: number;
  recruitedGenerals: string[];
  farmCount: number;
}

export const useGameState = () => {
  const [currentScreen, setCurrentScreen] = useState<'city' | 'army' | 'battle' | 'shop'>('city');
  const [resources, setResources] = useState<Resources>({
    gold: 2000,
    food: 1000,
    population: 0
  });

  const [cityTier, setCityTier] = useState(1);
  const [populationCapacity, setPopulationCapacity] = useState(100);
  const [recruitedGenerals, setRecruitedGenerals] = useState<string[]>(['刘备']);
  const [farmCount, setFarmCount] = useState(0);

  // Automatic resource generation
  useEffect(() => {
    const interval = setInterval(() => {
      setResources(prev => ({
        ...prev,
        gold: prev.gold + Math.floor(cityTier * 2), // 2 gold per second per city tier
        food: prev.food + Math.floor(cityTier * 1.5) + Math.floor(farmCount * 8.33) // 1.5 food per second per city tier + 500 food per minute per farm
      }));
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [cityTier, farmCount]);

  // Update resources
  const updateResources = (updates: Partial<Resources>) => {
    setResources(prev => ({ ...prev, ...updates }));
  };

  // Add gold
  const addGold = (amount: number) => {
    setResources(prev => ({ ...prev, gold: prev.gold + amount }));
  };

  // Spend gold
  const spendGold = (amount: number): boolean => {
    if (resources.gold >= amount) {
      setResources(prev => ({ ...prev, gold: prev.gold - amount }));
      return true;
    }
    return false;
  };

  // Add food
  const addFood = (amount: number) => {
    setResources(prev => ({ ...prev, food: prev.food + amount }));
  };

  // Spend food
  const spendFood = (amount: number): boolean => {
    if (resources.food >= amount) {
      setResources(prev => ({ ...prev, food: prev.food - amount }));
      return true;
    }
    return false;
  };

  // Upgrade city
  const upgradeCity = (): boolean => {
    const nextTier = cityTier + 1;
    const goldCost = nextTier * 5000;
    const foodCost = nextTier * 3000;
    const newPopulationCapacity = nextTier * 100;
    
    // Check if we have enough resources before spending them
    if (resources.gold >= goldCost && resources.food >= foodCost) {
      // Spend resources only if we have enough
      spendGold(goldCost);
      spendFood(foodCost);
      setCityTier(nextTier);
      setPopulationCapacity(newPopulationCapacity);
      return true;
    }
    return false;
  };

  // Purchase farm
  const purchaseFarm = (): boolean => {
    const farmCost = 50000; // 50k gold per farm
    
    // Check if we have enough gold before spending
    if (resources.gold >= farmCost) {
      spendGold(farmCost);
      setFarmCount(prev => prev + 1);
      return true;
    }
    return false;
  };

  // Recruit general
  const recruitGeneral = (heroName: string, cost: number): boolean => {
    // Hero population costs
    const heroPopulationCosts: { [key: string]: number } = {
      '刘备': 100,
      '关羽': 100,
      '张飞': 100,
      '诸葛亮': 100
    };
    
    const populationCost = heroPopulationCosts[heroName] || 20;
    const currentPopulationUsed = recruitedGenerals.reduce((total, general) => {
      return total + (heroPopulationCosts[general] || 20);
    }, 0);
    
    // Check if we have enough gold and population capacity before spending
    if (resources.gold >= cost && (currentPopulationUsed + populationCost <= populationCapacity)) {
      // Spend gold only if all checks pass
      spendGold(cost);
      setRecruitedGenerals(prev => [...prev, heroName]);
      return true;
    }
    return false;
  };

  // Remove general
  const removeGeneral = (heroName: string) => {
    setRecruitedGenerals(prev => prev.filter(name => name !== heroName));
  };

  // Get current population usage
  const getCurrentPopulationUsed = () => {
    const heroPopulationCosts: { [key: string]: number } = {
      '刘备': 100,
      '关羽': 100,
      '张飞': 100,
      '诸葛亮': 100
    };
    
    return recruitedGenerals.reduce((total, general) => {
      return total + (heroPopulationCosts[general] || 100);
    }, 0);
  };

  // Change screen
  const changeScreen = (screen: 'city' | 'army' | 'battle' | 'shop') => {
    setCurrentScreen(screen);
  };

  return {
    // State
    currentScreen,
    resources,
    cityTier,
    populationCapacity,
    recruitedGenerals,
    farmCount,
    
    // Actions
    updateResources,
    addGold,
    spendGold,
    addFood,
    spendFood,
    upgradeCity,
    purchaseFarm,
    recruitGeneral,
    removeGeneral,
    getCurrentPopulationUsed,
    changeScreen
  };
};
