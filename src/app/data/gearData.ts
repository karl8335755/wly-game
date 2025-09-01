export const gearData = [
  // Common Weapons
  { id: 'common_sword_1', name: 'Iron Sword', type: 'weapon' as const, attackBonus: 5, healthBonus: 0, rarity: 'common' as const },
  { id: 'common_sword_2', name: 'Steel Sword', type: 'weapon' as const, attackBonus: 8, healthBonus: 0, rarity: 'common' as const },
  { id: 'common_sword_3', name: 'Bronze Sword', type: 'weapon' as const, attackBonus: 6, healthBonus: 0, rarity: 'common' as const },
  { id: 'common_sword_4', name: 'Copper Sword', type: 'weapon' as const, attackBonus: 4, healthBonus: 0, rarity: 'common' as const },
  { id: 'common_sword_5', name: 'Stone Sword', type: 'weapon' as const, attackBonus: 3, healthBonus: 0, rarity: 'common' as const },

  // Common Armor
  { id: 'common_armor_1', name: 'Leather Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 10, rarity: 'common' as const },
  { id: 'common_armor_2', name: 'Cloth Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 8, rarity: 'common' as const },
  { id: 'common_armor_3', name: 'Wooden Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 12, rarity: 'common' as const },
  { id: 'common_armor_4', name: 'Bone Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 15, rarity: 'common' as const },
  { id: 'common_armor_5', name: 'Hide Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 9, rarity: 'common' as const },

  // Uncommon Weapons
  { id: 'uncommon_sword_1', name: 'Iron Greatsword', type: 'weapon' as const, attackBonus: 10, healthBonus: 0, rarity: 'uncommon' as const },
  { id: 'uncommon_sword_2', name: 'Steel Greatsword', type: 'weapon' as const, attackBonus: 13, healthBonus: 0, rarity: 'uncommon' as const },
  { id: 'uncommon_sword_3', name: 'Bronze Greatsword', type: 'weapon' as const, attackBonus: 11, healthBonus: 0, rarity: 'uncommon' as const },
  { id: 'uncommon_sword_4', name: 'Copper Greatsword', type: 'weapon' as const, attackBonus: 9, healthBonus: 0, rarity: 'uncommon' as const },
  { id: 'uncommon_sword_5', name: 'Stone Greatsword', type: 'weapon' as const, attackBonus: 8, healthBonus: 0, rarity: 'uncommon' as const },

  // Uncommon Armor
  { id: 'uncommon_armor_1', name: 'Reinforced Leather Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 20, rarity: 'uncommon' as const },
  { id: 'uncommon_armor_2', name: 'Reinforced Cloth Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 18, rarity: 'uncommon' as const },
  { id: 'uncommon_armor_3', name: 'Reinforced Wooden Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 22, rarity: 'uncommon' as const },
  { id: 'uncommon_armor_4', name: 'Reinforced Bone Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 25, rarity: 'uncommon' as const },
  { id: 'uncommon_armor_5', name: 'Reinforced Hide Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 19, rarity: 'uncommon' as const },

  // Rare Weapons (increased power)
  { id: 'rare_sword_1', name: 'Silver Sword', type: 'weapon' as const, attackBonus: 18, healthBonus: 0, rarity: 'rare' as const },
  { id: 'rare_sword_2', name: 'Gold Sword', type: 'weapon' as const, attackBonus: 22, healthBonus: 0, rarity: 'rare' as const },
  { id: 'rare_sword_3', name: 'Crystal Sword', type: 'weapon' as const, attackBonus: 25, healthBonus: 0, rarity: 'rare' as const },
  { id: 'rare_sword_4', name: 'Obsidian Sword', type: 'weapon' as const, attackBonus: 28, healthBonus: 0, rarity: 'rare' as const },
  { id: 'rare_sword_5', name: 'Diamond Sword', type: 'weapon' as const, attackBonus: 32, healthBonus: 0, rarity: 'rare' as const },

  // Rare Armor (increased power)
  { id: 'rare_armor_1', name: 'Chain Mail', type: 'armor' as const, attackBonus: 0, healthBonus: 40, rarity: 'rare' as const },
  { id: 'rare_armor_2', name: 'Scale Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 45, rarity: 'rare' as const },
  { id: 'rare_armor_3', name: 'Plate Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 50, rarity: 'rare' as const },
  { id: 'rare_armor_4', name: 'Mithril Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 55, rarity: 'rare' as const },
  { id: 'rare_armor_5', name: 'Adamantine Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 60, rarity: 'rare' as const },

  // Epic Weapons (increased power)
  { id: 'epic_sword_1', name: 'Thunder Sword', type: 'weapon' as const, attackBonus: 45, healthBonus: 0, rarity: 'epic' as const, specialEffect: 'aoe' as const },
  { id: 'epic_sword_2', name: 'Fire Sword', type: 'weapon' as const, attackBonus: 50, healthBonus: 0, rarity: 'epic' as const, specialEffect: 'aoe' as const },
  { id: 'epic_sword_3', name: 'Ice Sword', type: 'weapon' as const, attackBonus: 47, healthBonus: 0, rarity: 'epic' as const, specialEffect: 'aoe' as const },
  { id: 'epic_sword_4', name: 'Lightning Sword', type: 'weapon' as const, attackBonus: 53, healthBonus: 0, rarity: 'epic' as const, specialEffect: 'aoe' as const },
  { id: 'epic_sword_5', name: 'Shadow Sword', type: 'weapon' as const, attackBonus: 55, healthBonus: 0, rarity: 'epic' as const, specialEffect: 'aoe' as const },

  // Epic Armor (increased power)
  { id: 'epic_armor_1', name: 'Dragon Scale Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 80, rarity: 'epic' as const },
  { id: 'epic_armor_2', name: 'Phoenix Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 90, rarity: 'epic' as const },
  { id: 'epic_armor_3', name: 'Celestial Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 100, rarity: 'epic' as const },
  { id: 'epic_armor_4', name: 'Void Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 110, rarity: 'epic' as const },
  { id: 'epic_armor_5', name: 'Ethereal Armor', type: 'armor' as const, attackBonus: 0, healthBonus: 120, rarity: 'epic' as const },

  // Legendary Weapons (Level 4+)
  { id: 'legendary_sword_1', name: 'Excalibur', type: 'weapon' as const, attackBonus: 50, healthBonus: 20, rarity: 'legendary' as const, specialEffect: 'aoe' as const },
  { id: 'legendary_sword_2', name: 'Stormbringer', type: 'weapon' as const, attackBonus: 55, healthBonus: 15, rarity: 'legendary' as const, specialEffect: 'aoe' as const },
  { id: 'legendary_sword_3', name: 'Frostmourne', type: 'weapon' as const, attackBonus: 60, healthBonus: 10, rarity: 'legendary' as const, specialEffect: 'aoe' as const },
  { id: 'legendary_sword_4', name: 'Thunderfury', type: 'weapon' as const, attackBonus: 65, healthBonus: 25, rarity: 'legendary' as const, specialEffect: 'aoe' as const },
  { id: 'legendary_sword_5', name: 'Ashbringer', type: 'weapon' as const, attackBonus: 70, healthBonus: 30, rarity: 'legendary' as const, specialEffect: 'aoe' as const },

  // Legendary Armor (Level 4+)
  { id: 'legendary_armor_1', name: 'Aegis of the Titans', type: 'armor' as const, attackBonus: 10, healthBonus: 120, rarity: 'legendary' as const, specialEffect: 'aoe' as const },
  { id: 'legendary_armor_2', name: 'Crown of the Eternal', type: 'armor' as const, attackBonus: 15, healthBonus: 130, rarity: 'legendary' as const, specialEffect: 'aoe' as const },
  { id: 'legendary_armor_3', name: 'Shield of the Ancients', type: 'armor' as const, attackBonus: 20, healthBonus: 140, rarity: 'legendary' as const },
  { id: 'legendary_armor_4', name: 'Armor of the Gods', type: 'armor' as const, attackBonus: 25, healthBonus: 150, rarity: 'legendary' as const },
  { id: 'legendary_armor_5', name: 'Vestments of the Void', type: 'armor' as const, attackBonus: 30, healthBonus: 160, rarity: 'legendary' as const, specialEffect: 'aoe' as const },

  // Mythic Weapons (Level 6+)
  { id: 'mythic_sword_1', name: 'Blade of the Universe', type: 'weapon' as const, attackBonus: 100, healthBonus: 50, rarity: 'mythic' as const, specialEffect: 'aoe' as const },
  { id: 'mythic_sword_2', name: 'Sword of Creation', type: 'weapon' as const, attackBonus: 120, healthBonus: 60, rarity: 'mythic' as const, specialEffect: 'aoe' as const },
  { id: 'mythic_sword_3', name: 'Weapon of the Gods', type: 'weapon' as const, attackBonus: 150, healthBonus: 80, rarity: 'mythic' as const, specialEffect: 'aoe' as const },
  { id: 'mythic_sword_4', name: 'Blade of Eternity', type: 'weapon' as const, attackBonus: 200, healthBonus: 100, rarity: 'mythic' as const, specialEffect: 'aoe' as const },
  { id: 'mythic_sword_5', name: 'Ultimate Weapon', type: 'weapon' as const, attackBonus: 300, healthBonus: 150, rarity: 'mythic' as const, specialEffect: 'aoe' as const },

  // Mythic Armor (Level 6+)
  { id: 'mythic_armor_1', name: 'Armor of the Cosmos', type: 'armor' as const, attackBonus: 50, healthBonus: 300, rarity: 'mythic' as const, specialEffect: 'aoe' as const },
  { id: 'mythic_armor_2', name: 'Shield of Infinity', type: 'armor' as const, attackBonus: 60, healthBonus: 350, rarity: 'mythic' as const, specialEffect: 'aoe' as const },
  { id: 'mythic_armor_3', name: 'Crown of the Universe', type: 'armor' as const, attackBonus: 70, healthBonus: 400, rarity: 'mythic' as const },
  { id: 'mythic_armor_4', name: 'Vestments of Creation', type: 'armor' as const, attackBonus: 80, healthBonus: 450, rarity: 'mythic' as const, specialEffect: 'aoe' as const },
  { id: 'mythic_armor_5', name: 'Ultimate Armor', type: 'armor' as const, attackBonus: 100, healthBonus: 500, rarity: 'mythic' as const, specialEffect: 'aoe' as const }
];
