<img width="1920" height="1080" alt="Screenshot 2026-06-25 161506" src="https://github.com/user-attachments/assets/ab8c1803-6caa-418f-bb4f-eaf82d5e3026" />
<img width="1920" height="1009" alt="Screenshot 2026-05-13 161710" src="https://github.com/user-attachments/assets/920cbef1-b189-4c30-90fe-7deb53ad821e" />
<img width="1920" height="1009" alt="Screenshot 2026-05-13 161621" src="https://github.com/user-attachments/assets/f18860fa-cfe6-4f07-a213-db8e4f7b4e61" />
<img width="1920" height="1009" alt="Screenshot 2026-05-13 160908" src="https://github.com/user-attachments/assets/06b4051f-5340-48a0-ba63-541518b3f326" />

# 📦 Minecraft Bedrock Crate Engine

A high-performance, script-based loot crate framework for Minecraft Bedrock Edition using the native Scripting API. This engine transitions traditional unoptimized entity-based reward cycles into highly performant, client-isolated visuals.

## ✨ Features

* **Dual Animation Matrix:** Switch effortlessly between standard entity item drops and advanced client-side `TextPrimitive` shape rendering.
* **Per-Player Isolation:** Client-side animations run exclusively on the opening player's thread via `visibleTo`. Multiple players can roll different crates simultaneously without global lockouts or server-wide packet chokes.
* **Dynamic Weighted Loot Tables:** Uses physical container blocks as live loot tables—simply place items in a chest and assign weights directly via item nametags.
* **Reactive Loot Previews:** Players can sneak-click a crate to open a custom UI (via `ChestFormData`) showing real-time calculations of all rewards and their exact percentage chances.
* **Defensive Fail-Safe Architecture:** * Auto-cleans up rogue entities or floating primitive text shapes if a player hard-disconnects or crashes mid-roll.
  * Structural proxy protection handles inventory checking and empty slot validation before a key is consumed.
* **Knockback Feedback:** Provides physical vector knockback impulses and directional audio cues if an unauthorized player attempts to open a crate without the required key.

## 🚀 Installation

1. Copy the contents of this framework into your behavior pack's `scripts` directory.
2. Ensure your `manifest.json` includes the required `@minecraft/server` and target UI dependencies.
3. Register your crate spatial parameters in your entry script file.

## 🛠 Configuration

Define your crates array utilizing vector coordinates. Ensure your keys match the API's standard item schema definitions.

```javascript
const crates = [
    {
        interaction_location: { x: 1389, y: 152, z: 967 },
        key: {
            typeId: "ghost:rare_key",
        },
        name: "§2Rare Crate",
        chest_location: { x: 1372, y: 129, z: 1032 },
    }
];

// Initialize the controller (Animation modes: 1 = Entity Items, 2 = Client Primitives)
const cratesController = new CratesManager(crates, 2);

```

## 💎 Creating Loot Tables

This engine reads physical chests to evaluate loot distributions dynamically at runtime.

1. Place a chest at the designated `chest_location` coordinate.
2. Place your target reward items inside the slots.
3. **Set Probability Weights:** Format your item nametags using a pipe delimiter: `Display Name|Weight`.
* *Example:* An item named `§dLegendary Sword|15` gives it an integer weight value of 15.
* The parser automatically strips formatting, evaluates the cumulative total weight sum, and displays precise math to the client inside the preview UI.



## 📂 Project Structure

* `main.js`: The core engine module. Houses the `CratesManager` class framework which handles weighted loot calculations, inventory validation checks, dual-animation paths, and defensive memory cleanup.
* `usage.js`: The central environment registry and configuration layer. Defines your crate spatial locations, mapping coordinates to target item key requirements, instantiates the main controller, and binds global event triggers to the engine.
* `util/`: Organized auxiliary helper sub-directories split by processing domains:
  * `extensions/`: Contains client-side custom viewport elements, including the `ChestFormData` layout builder used for loot previews.
  * `number/`: Handles runtime game mechanics evaluations, such as checking item-specific attack damage attributes.
  * `string/`: Standard text sanitization routines covering naming capitalization and Roman Numeral conversions.
  * `vector/`: Dedicated spatial algorithms used to validate interaction points and player coordinate checks.

## ⚠️ Requirements

* **Minecraft Bedrock Edition**
* **Beta APIs** enabled in world settings.
* Compatible with modern `@minecraft/server` runtime implementations.

---

### 📜 License

This project is open-source. Feel free to fork, optimize, and scale it for your own competitive server or network infrastructure!
