import { useState } from 'react';

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
  const [recruitedGenerals, setRecruitedGenerals] = useState<string[]>([]);

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
    const goldCost = nextTier * 50000;
    const foodCost = nextTier * 30000;
    const newPopulationCapacity = nextTier * 100;
    
    if (spendGold(goldCost) && spendFood(foodCost)) {
      setCityTier(nextTier);
      setPopulationCapacity(newPopulationCapacity);
      return true;
    }
    return false;
  };

  // Recruit general
  const recruitGeneral = (heroName: string, cost: number): boolean => {
    if (spendGold(cost)) {
      setRecruitedGenerals(prev => [...prev, heroName]);
      return true;
    }
    return false;
  };

  // Remove general
  const removeGeneral = (heroName: string) => {
    setRecruitedGenerals(prev => prev.filter(name => name !== heroName));
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
    
    // Actions
    updateResources,
    addGold,
    spendGold,
    addFood,
    spendFood,
    upgradeCity,
    recruitGeneral,
    removeGeneral,
    changeScreen
  };
};
