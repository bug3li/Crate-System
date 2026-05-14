import { system, world, Player, ItemStack, EnchantmentType } from "@minecraft/server";
import { ChestFormData } from "./util/extensions/forms";
import { capitalize } from "./util/string/capitalize";
import { toRoman } from "./util/string/toRoman";
import { locationCheck } from "./util/vector/locationCheck.js";
import { Database } from "./util/cooldatabase.js";
import { getAttackDamage } from "./util/number/getAttackDamage.js";

const crates_opening = new Map();

export class CratesManager {
    constructor(crates) {
        this.crates = crates
    }

    view_loot(player, chest, crate) {
        const inventory = chest.getComponent("inventory").container;

        const form = new ChestFormData("small");
        form.title(crate.name);
        let totalchance = 0;
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (!item) continue;
            const nameTag = item.nameTag.split("|");
            const chance = parseInt(nameTag[1]) || 0;
            totalchance += parseInt(chance);
        }
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (!item) continue;

            const nameTag = item.nameTag.split("|");
            const chance = parseInt(nameTag[1]) || 0;

            let description = [];
            let enchanted = false;

            const enchantments = item.getComponent("enchantable")?.getEnchantments() ?? [];
            for (const enchantment of enchantments) {
                let level = toRoman(enchantment.level);
                let typeId = enchantment.type.id;

                let maxLevel = enchantment.type.maxLevel;
                if (maxLevel === 1) level = "";

                if (typeId.includes("_")) {
                    typeId = typeId.split("_");
                    let a = capitalize(typeId[0]);
                    let b = capitalize(typeId[1]);
                    typeId = a + " " + b;
                }
                description.push(`§7${capitalize(typeId)} ${level}`);
                enchanted = true;
            }

            description.push(`§9${((chance / totalchance) * 100).toFixed(1)}% Chance`);

            const damage = getAttackDamage(item);
            if (damage !== 0) description.push(`\n§9+${Math.floor(damage)} Attack Damage`);

            form.button(i, nameTag[0], description, item.typeId, item.amount, 0, enchanted);
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

            if (crates_opening.get(crate.name) !== false && crates_opening.has(crate.name)) return player.sendMessage("§cPlease wait till crate is not in use!");

            const chest = world.getDimension("overworld").getBlock(crate.chest_location);
            if (player.isSneaking) return this.view_loot(player, chest, crate);

            const playerinv = player.getComponent("inventory").container;
            if (playerinv.emptySlotsCount === 0) return player.sendMessage(`§cNeed 1 free slot`);

            player.sendMessage(`§aOpening ${crate.name}...`)

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
                return player.sendMessage("§cDont have a key in inventory");
            }

            crates_opening.set(crate.name, player.id)
            const overworld = world.getDimension("overworld");
            const interaction_location = crate.interaction_location;
            const item_location = {
                x: interaction_location.x + 0.5,
                y: interaction_location.y + 1.2,
                z: interaction_location.z + 0.5,
            };
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
                        location: player.location,
                        volume: 1.0,
                        pitch: 0.5 + i / 40,
                    });

                    const delay = i > 35 ? 10 : 2;
                    await system.waitTicks(delay);
                }

                const item = itemDisplay.getComponent("item").itemStack;

                if (itemDisplay && itemDisplay.isValid) {
                    itemDisplay.remove();
                }

                player.playSound("random.orb", { location: player.location, volume: 100, pitch: 1 });
                player.sendMessage(`§aOpened ${crate.name}\n §aWon ${item.amount}§8x §a${item.nameTag}`);
                player.getComponent("inventory").container.addItem(item);
            } catch (e) { } finally {
                CratesManager.resetItems("overworld");
                return crates_opening.set(crate.name, false)
            }
        });
    }

    PlayerLeaveBeforeEvent(data) {
        const playerId = data.player.id;
        for (const [crateName, openerId] of crates_opening) {
            if (openerId === playerId) {
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

    static resetItems(dimensionstr) {
        const dimension = world.getDimension(dimensionstr);
        dimension.getEntities({ type: "item" }).forEach((data) => {
            if (data.nameTag === "§c§r§a§t§e") data.remove();
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
}