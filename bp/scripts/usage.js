import { world } from "@minecraft/server";
import { CratesManager } from "./main";

/**
 * Registry of all available crates on the server.
 * Each entry maps the interaction point to a physical loot source.
 */
const CRATE_DATA = [
    {
        // Coordinates where the player clicks to open the crate
        interaction_location: { x: 1389, y: 152, z: 967 },
        key: {
            // The item required to be in the player's inventory
            type_id: "minecraft:tripwire_hook",
        },
        // Name displayed in the UI and messages
        name: "§2Rare Crate",
        // Coordinates of the hidden chest containing the loot table
        chest_location: { x: 1372, y: 129, z: 1032 },
    },
];

// Initialize the controller with the crate configuration
const crates_controller = new CratesManager(CRATE_DATA);

/**
 * Event Subscriptions
 * These listen for world actions and pass them to the crates_controller.
 */

// Handles crate opening and previewing when a block is clicked
world.beforeEvents.playerInteractWithBlock.subscribe((data) => 
    crates_controller.PlayerInteractWithBlockBeforeEvent(data)
);

// Ensures crate states are reset if a player disconnects during an animation
world.beforeEvents.playerLeave.subscribe((data) => 
    crates_controller.PlayerLeaveBeforeEvent(data)
);

// Prevents players from picking up the cycling items during the crate animation
world.beforeEvents.entityItemPickup.subscribe((data) => 
    crates_controller.EntityItemPickupBeforeEvent(data)
);