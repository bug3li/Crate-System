function getWeightedRandom(chestBlock) {
    const container = chestBlock.getComponent("inventory").container;
    let items = [];
    let totalWeight = 0;

    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (!item) continue;

        const nameParts = item.nameTag ? item.nameTag.split('|') : [item.typeId, "1"];
        const weight = parseInt(nameParts[1]) || 1; 

        totalWeight += weight;
        items.push({ 
            slot: i, 
            weight: weight, 
            ItemStack: item,
            cleanName: nameParts[0] 
        });
    }

    let roll = Math.random() * totalWeight;
    for (const entry of items) {
        if (roll < entry.weight) {
            const chance = ((entry.weight / totalWeight) * 100).toFixed(2);
            entry.ItemStack.nameTag = `§r${entry.cleanName}`
            return { item: entry.ItemStack, chance: chance, name: entry.cleanName };
        }
        roll -= entry.weight;
    }
}

export { getWeightedRandom }