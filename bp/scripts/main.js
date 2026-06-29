import { system, world, Player, ItemStack, EnchantmentType } from "@minecraft/server";
import { ChestFormData } from "./util/extensions/forms";
import { capitalize } from "./util/string/capitalize";
import { toRoman } from "./util/string/toRoman";
import { locationCheck } from "./util/vector/locationCheck.js";
import { getAttackDamage } from "./util/number/getAttackDamage.js";
import { getItemArmor, getItemKnockbackResistance, getItemToughness } from "./util/number/getArmorStats.js";
import { typeIdtoName } from "./util/string/typeIdToName.js";

const crates_opening = new Map();

export class CratesManager {
    constructor(crates, animation = 2) {
        this.crates = crates
        this.animation = animation
    }

    view_loot(player, chest, crate) {
        const inventory = chest.getComponent("inventory").container;

        const form = new ChestFormData("small");
        form.title(crate.name);
        let totalchance = 0;
        const items = [];
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (!item) continue;
            const split = item.nameTag?.split("|");
            const nameTag = item.nameTag ? split[0] : typeIdtoName(item.typeId);
            const chance = item.nameTag ? parseInt(split[1]) : 0;
            items.push([item, chance, nameTag, i]);
            totalchance += parseInt(chance);
        }
        for (const [item, chance, nameTag, slot] of items) {
            let description = [];
            let enchanted = false;

            const enchantments = item.getComponent("enchantable")?.getEnchantments() ?? [];
            for (const enchantment of enchantments) {
                let level = toRoman(enchantment.level);
                let typeId = enchantment.type.id;

                let maxLevel = enchantment.type.maxLevel;
                if (maxLevel === 1) level = "";

                if (typeId.includes("_")) {
                    typeId = typeId.split("_").map(word => capitalize(word)).join(" ");
                } else {
                    typeId = capitalize(typeId);
                }
                description.push(`§7${capitalize(typeId)} ${level}`);
                enchanted = true;
            }

            if (enchanted) description.push("");

            const damage = getAttackDamage(item);
            if (damage !== 0) description.push(`§9+${Math.floor(damage)} Attack Damage`);

            description.push(
                ...[{ val: getItemArmor(item), txt: "Armor" },
                { val: getItemToughness(item), txt: "Armor Toughness" },
                { val: getItemKnockbackResistance(item), txt: "Knockback Resistance" }]
                    .filter(stat => stat.val !== 0)
                    .map(stat => `§9+${Math.floor(stat.val)} ${stat.txt}`)
            );

            description.push(`§9${((chance / totalchance) * 100).toFixed(1)}% Chance`);

            form.button(slot, nameTag, description, item.typeId, item.amount, 0, enchanted);
        }
        form.show(player);
    }

    PlayerInteractWithBlockBeforeEvent(data) {
        const crate = this.crates.find((c) => locationCheck(c.interaction_location, data.block.location));
        if (!crate) return;
        data.cancel = true;

        system.run(async () => {
            const player = data.player;
            const playerinventory = player.getComponent("inventory").container;

            if (crates_opening.has(crate.name) && this.animation == 1 || crates_opening.get(crate.name)?.playerId === player.id && this.animation == 2) return player.sendMessage("§cPlease wait till crate is not in use!");

            const chest = world.getDimension("overworld").getBlock(crate.chest_location);
            if (player.isSneaking) return this.view_loot(player, chest, crate);

            const playerinv = player.getComponent("inventory").container;
            if (playerinv.emptySlotsCount === 0) return player.sendMessage(`§cNeed 1 free slot`);

            let haskey = false;
            for (let i = 0; i < playerinv.size; i++) {
                const item = playerinv.getItem(i);
                if (!item) continue;
                if (item.typeId !== crate.key.typeId) continue;

                if (item.amount === 1) playerinv.setItem(i, undefined);
                else {
                    item.amount -= 1;
                    playerinv.setItem(i, item);
                }

                haskey = true;
                break;
            }

            if (!haskey) {
                const v = player.getViewDirection();
                player.applyKnockback({ x: -4 * v.x, z: -4 * v.z }, 0.8);
                player.playSound("note.bass", {
                    volume: 1.0,
                    pitch: 1,
                });
                return player.sendMessage("§cDont have a key in inventory");
            }

            player.sendMessage(`§aOpening ${crate.name}...`)

            crates_opening.set(crate.name, { playerId: player.id })
            const overworld = world.getDimension("overworld");
            const interaction_location = crate.interaction_location;
            let item_location = {
                x: interaction_location.x + 0.5,
                y: 0,
                z: interaction_location.z + 0.5,
            };
            item_location.y = this.animation == 1 ? interaction_location.y + 1.2 : interaction_location.y + 2

            let item = {};

            if (this.animation == 1) {
                let itemDisplay;

                try {
                    for (let i = 0; i < 40; i++) {
                        if (itemDisplay && itemDisplay.isValid) {
                            itemDisplay.remove();
                        }

                        const weightedResult = CratesManager.getWeightedRandom(chest);
                        itemDisplay = overworld.spawnItem(weightedResult.item, item_location);
                        itemDisplay.nameTag = "§c§r§a§t§e";

                        player.playSound("note.bell", {
                            volume: 1.0,
                            pitch: 0.5 + i / 40,
                        });

                        const delay = i > 35 ? 10 : 2;
                        await system.waitTicks(delay);
                    }

                    item = itemDisplay.getComponent("item").itemStack;

                    if (itemDisplay && itemDisplay.isValid) {
                        itemDisplay.remove();
                    }
                } catch (e) { } finally {
                    CratesManager.resetItems("overworld");
                }
            } else {
                const ItemDisplay = new TextPrimitive(item_location, "Placeholder");
                const colour = crate.name.includes("§") ? crate.name.slice(0, 2) : "";
                ItemDisplay.color = { red: 1, green: 1, blue: 1, alpha: 1 }
                ItemDisplay.scale = 2;
                ItemDisplay.backfaceVisible = true;
                ItemDisplay.textBackfaceVisible = true;
                ItemDisplay.visibleTo = [player];

                world.primitiveShapesManager.addText(ItemDisplay, player.dimension);

                crates_opening.set(crate.name, { playerId: player.id, TextDisplay: ItemDisplay })

                try {
                    for (let i = 0; i < 40; i++) {
                        const weightedResult = CratesManager.getWeightedRandom(chest);
                        item = weightedResult.item;
                        ItemDisplay.setText(`${colour}${weightedResult.name} §8x${colour}${weightedResult.item.amount}`)

                        player.playSound("note.bell", {
                            volume: 1.0,
                            pitch: 0.5 + i / 40,
                        });

                        const delay = i > 35 ? 10 : 2;
                        await system.waitTicks(delay);
                    }
                } catch (e) { } finally {
                    ItemDisplay.remove()
                }
            }

            crates_opening.delete(crate.name)

            try {
                player.playSound("random.orb", { location: player.location, volume: 100, pitch: 1 });
                player.sendMessage(`§aOpened ${crate.name}\n §aWon ${item.amount}§8x §a${item.nameTag}`);
                player.getComponent("inventory").container.addItem(item)
            } catch (e) { }
        });
    }

    PlayerLeaveBeforeEvent(data) {
        const playerId = data.player.id;
        for (const [crateName, obj] of crates_opening) {
            if (obj.playerId === playerId) {
                CratesManager.resetTexts();
                CratesManager.resetItems("overworld");
                crates_opening.set(crateName, false);
                return;
            }
        }
    }

    EntityItemPickupBeforeEvent(data) {
        if (data.item.nameTag !== "§c§r§a§t§e") return;
        data.cancel = true;
    }

    static resetTexts() {
        crates_opening.forEach((key, value) => {
            if (value?.TextDisplay) world.primitiveShapesManager.removeText(value?.TextDisplay);
        })
    }

    static resetItems(dimensionstr) {
        const dimension = world.getDimension(dimensionstr);
        dimension.getEntities({ type: "item" }).forEach((data) => {
            if (data.nameTag === "§c§r§a§t§e") system.run(() => data.remove());
        });
    }

    static getWeightedRandom(chest) {
        const container = chest.getComponent("inventory").container;
        let items = [];
        let totalWeight = 0;

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item) continue;

            const nameParts = item.nameTag ? item.nameTag.split('|') : [item.typeId, "1"];
            const cleanName = nameParts[0].includes("§") ? nameParts[0].slice(2) : nameParts[0];
            "".slice(2)
            const weight = parseInt(nameParts[1]) || 1;

            totalWeight += weight;
            items.push({
                slot: i,
                weight: weight,
                ItemStack: item,
                cleanName: cleanName
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
}