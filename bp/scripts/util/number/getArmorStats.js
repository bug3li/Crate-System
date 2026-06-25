const ARMOR_STAT_REGISTRY = {
    "minecraft:netherite_helmet":     { armor: 3, toughness: 3, knockback: 1 },
    "minecraft:netherite_chestplate": { armor: 8, toughness: 3, knockback: 1 },
    "minecraft:netherite_leggings":   { armor: 6, toughness: 3, knockback: 1 },
    "minecraft:netherite_boots":      { armor: 3, toughness: 3, knockback: 1 },

    "minecraft:diamond_helmet":     { armor: 3, toughness: 2, knockback: 0.0 },
    "minecraft:diamond_chestplate": { armor: 8, toughness: 2, knockback: 0.0 },
    "minecraft:diamond_leggings":   { armor: 6, toughness: 2, knockback: 0.0 },
    "minecraft:diamond_boots":      { armor: 3, toughness: 2, knockback: 0.0 },

    "minecraft:iron_helmet":     { armor: 2, toughness: 0, knockback: 0.0 },
    "minecraft:iron_chestplate": { armor: 6, toughness: 0, knockback: 0.0 },
    "minecraft:iron_leggings":   { armor: 5, toughness: 0, knockback: 0.0 },
    "minecraft:iron_boots":      { armor: 2, toughness: 0, knockback: 0.0 },

    "minecraft:chainmail_helmet":     { armor: 2, toughness: 0, knockback: 0.0 },
    "minecraft:chainmail_chestplate": { armor: 5, toughness: 0, knockback: 0.0 },
    "minecraft:chainmail_leggings":   { armor: 4, toughness: 0, knockback: 0.0 },
    "minecraft:chainmail_boots":      { armor: 1, toughness: 0, knockback: 0.0 },

    "minecraft:golden_helmet":     { armor: 2, toughness: 0, knockback: 0.0 },
    "minecraft:golden_chestplate": { armor: 5, toughness: 0, knockback: 0.0 },
    "minecraft:golden_leggings":   { armor: 3, toughness: 0, knockback: 0.0 },
    "minecraft:golden_boots":      { armor: 1, toughness: 0, knockback: 0.0 },

    "minecraft:leather_helmet":     { armor: 1, toughness: 0, knockback: 0.0 },
    "minecraft:leather_chestplate": { armor: 3, toughness: 0, knockback: 0.0 },
    "minecraft:leather_leggings":   { armor: 2, toughness: 0, knockback: 0.0 },
    "minecraft:leather_boots":      { armor: 1, toughness: 0, knockback: 0.0 },
    
    "minecraft:turtle_helmet":      { armor: 2, toughness: 0, knockback: 0.0 }
};

export function getItemArmor(itemStack) {
    if (!itemStack) return 0;
    return ARMOR_STAT_REGISTRY[itemStack.typeId]?.armor ?? 0;
}

export function getItemToughness(itemStack) {
    if (!itemStack) return 0;
    return ARMOR_STAT_REGISTRY[itemStack.typeId]?.toughness ?? 0;
}

export function getItemKnockbackResistance(itemStack) {
    if (!itemStack) return 0;
    return ARMOR_STAT_REGISTRY[itemStack.typeId]?.knockback ?? 0.0;
}