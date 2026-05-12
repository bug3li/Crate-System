---

# 📦 Minecraft Bedrock Crate System

A robust, script-based loot crate system for Minecraft Bedrock Edition (Script API). This system features animated item cycling, weighted loot tables, and integrated UI previews.

## ✨ Features

* **Weighted Loot System:** Uses physical chests as loot tables—simply place items in a chest and assign weights via item nametags.
* **Animated Openings:** Visual "hologram" animation where items cycle above the crate before landing on the final reward.
* **Loot Preview:** Players can sneak-click a crate to open a custom UI showing all possible rewards and their percentage chances.
* **Anti-Glitch Measures:**
* Prevents concurrent openings (one player at a time).
* Prevents players from picking up the "cycling" items during the animation.
* Automatic cleanup if a player leaves the server mid-opening.


* **Knockback Feedback:** Provides physical feedback if a player attempts to open a crate without a key.

## 🚀 Installation

1. Clone this repository into your behavior pack's `scripts` folder.
2. Ensure your `manifest.json` has the required `@minecraft/server` and `@minecraft/server-ui` dependencies.
3. Configure your crate locations in the configuration file.

## 🛠 Configuration

Define your crates in the `CRATE_DATA` array. Each crate requires an interaction point (where the player clicks) and a chest location (where the loot is stored).

```javascript
const CRATE_DATA = [
    {
        interaction_location: { x: 1389, y: 152, z: 967 },
        key: {
            type_id: "minecraft:tripwire_hook",
        },
        name: "§2Rare Crate",
        chest_location: { x: 1372, y: 129, z: 1032 },
    },
];

```

## 💎 Creating Loot Tables

This system uses **physical chests** to determine loot.

1. Place a chest at the `chest_location` defined in your config.
2. Place the reward items inside.
3. **Set Weights:** Rename the items in the chest using the format: `Item Name|Weight`.
* *Example:* An item named `God Sword|10` has a weight of 10.
* The system calculates the percentage chance automatically based on the total weights of all items in the chest.



## 📂 Project Structure

* `main.js`: Entry point that handles event subscriptions and controller initialization.
* `CratesManager.js`: The core logic for animations, inventory management, and UI rendering.
* `util/`: Helper functions for weighted randomness, vector checks, and string formatting.

## ⚠️ Requirements

* **Minecraft Bedrock Edition**
* **Experimental Cameras & Scripting** enabled in world settings.
* **@minecraft/server** version compatible with your current game build.

---

### 📜 License

This project is open-source. Feel free to modify it for your own server or realm!
