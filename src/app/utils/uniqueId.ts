// Global counter for unique IDs
let globalCounter = 0;

// Registry to track all used uniqueIds and prevent duplicates
const usedUniqueIds = new Set<string>();

// Performance.now() provides higher resolution than Date.now()
let lastTimestamp = 0;

// Load existing registry from localStorage on module load
const loadRegistryFromStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      const storedCounter = localStorage.getItem('uniqueIdCounter');
      const storedIds = localStorage.getItem('uniqueIdRegistry');
      const storedTimestamp = localStorage.getItem('uniqueIdLastTimestamp');
      
      if (storedCounter) {
        globalCounter = parseInt(storedCounter, 10);
      }
      if (storedIds) {
        const ids = JSON.parse(storedIds);
        ids.forEach((id: string) => usedUniqueIds.add(id));
      }
      if (storedTimestamp) {
        lastTimestamp = parseFloat(storedTimestamp);
      }
      

    }
  } catch (error) {
    console.error('Error loading uniqueId registry from localStorage:', error);
  }
};

// Save registry to localStorage
const saveRegistryToStorage = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('uniqueIdCounter', globalCounter.toString());
      localStorage.setItem('uniqueIdRegistry', JSON.stringify(Array.from(usedUniqueIds)));
      localStorage.setItem('uniqueIdLastTimestamp', lastTimestamp.toString());
    }
  } catch (error) {
    console.error('Error saving uniqueId registry to localStorage:', error);
  }
};

// Initialize registry from storage
loadRegistryFromStorage();

export const generateUniqueId = (prefix: string = 'item'): string => {
  globalCounter++;
  
  // Use performance.now() for higher resolution timestamps
  const timestamp = performance.now();
  
  // Ensure timestamp is always increasing
  const adjustedTimestamp = Math.max(timestamp, lastTimestamp + 1);
  lastTimestamp = adjustedTimestamp;
  
  // Generate a more unique ID with multiple random components
  const random1 = Math.random().toString(36).substr(2, 9);
  const random2 = Math.random().toString(36).substr(2, 9);
  
  const uniqueId = `${prefix}_${globalCounter}_${adjustedTimestamp.toFixed(0)}_${random1}_${random2}`;
  
  // Check for collision (should be extremely rare with this approach)
  if (usedUniqueIds.has(uniqueId)) {
    // Add extra randomness to resolve collision
    const extraRandom = Math.random().toString(36).substr(2, 9);
    const collisionResolvedId = `${uniqueId}_${extraRandom}`;
    usedUniqueIds.add(collisionResolvedId);
    saveRegistryToStorage();
    return collisionResolvedId;
  }
  
  // Add the new uniqueId to the registry
  usedUniqueIds.add(uniqueId);
  saveRegistryToStorage();
  
  return uniqueId;
};

// Function to check if an ID is already used
export const isUniqueIdUsed = (uniqueId: string): boolean => {
  return usedUniqueIds.has(uniqueId);
};

// Function to manually add an ID to the registry (for existing items)
export const registerUniqueId = (uniqueId: string): void => {
  if (uniqueId && !usedUniqueIds.has(uniqueId)) {
    usedUniqueIds.add(uniqueId);
    saveRegistryToStorage();
  }
};

// Function to get registry info (for debugging)
export const getUniqueIdRegistryInfo = (): { size: number; ids: string[] } => {
  return {
    size: usedUniqueIds.size,
    ids: Array.from(usedUniqueIds)
  };
};

// Function to clear the registry (for debugging/testing)
export const clearUniqueIdRegistry = (): void => {
  usedUniqueIds.clear();
  globalCounter = 0;
  lastTimestamp = 0;
  saveRegistryToStorage();
};
