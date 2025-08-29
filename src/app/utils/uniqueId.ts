// Global counter for unique IDs
let globalCounter = 0;

// Registry to track all used uniqueIds and prevent duplicates
const usedUniqueIds = new Set<string>();

export const generateUniqueId = (prefix: string = 'item'): string => {
  let uniqueId: string;
  let attempts = 0;
  const maxAttempts = 100; // Prevent infinite loops
  
  do {
    globalCounter++;
    uniqueId = `${prefix}_${globalCounter}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    attempts++;
    
    if (attempts >= maxAttempts) {
      console.error('Failed to generate unique ID after maximum attempts');
      uniqueId = `${prefix}_${globalCounter}_${Date.now()}_fallback_${Math.random().toString(36).substr(2, 9)}`;
      break;
    }
  } while (usedUniqueIds.has(uniqueId));
  
  // Add the new uniqueId to the registry
  usedUniqueIds.add(uniqueId);
  console.log(`Generated uniqueId: ${uniqueId} (counter: ${globalCounter}, attempts: ${attempts})`);
  console.log(`Total uniqueIds in registry: ${usedUniqueIds.size}`);
  console.log(`Registry contents:`, Array.from(usedUniqueIds));
  
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
    console.log(`Registered existing uniqueId: ${uniqueId}`);
    console.log(`Total uniqueIds in registry: ${usedUniqueIds.size}`);
  }
};

// Function to get registry info (for debugging)
export const getUniqueIdRegistryInfo = (): { size: number; ids: string[] } => {
  return {
    size: usedUniqueIds.size,
    ids: Array.from(usedUniqueIds)
  };
};
