"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const world_data_js_1 = require("./world-data.js");
class GameEngine {
    db;
    constructor(db) {
        this.db = db;
    }
    // Dice rolling utility
    rollDice(diceNotation) {
        const match = diceNotation.match(/(\d+)d(\d+)(?:\+(\d+))?/);
        if (!match)
            return 0;
        const numDice = parseInt(match[1]);
        const diceSides = parseInt(match[2]);
        const modifier = parseInt(match[3]) || 0;
        let total = 0;
        for (let i = 0; i < numDice; i++) {
            total += Math.floor(Math.random() * diceSides) + 1;
        }
        return total + modifier;
    }
    // Weight and carrying mechanics
    async calculateCarryingWeight() {
        const items = await this.db.getItemsInLocation('inventory');
        return items.reduce((total, item) => total + item.weight, 0);
    }
    async checkWeightLimits(gameState) {
        const weight = await this.calculateCarryingWeight();
        const messages = [];
        if (weight >= 30) {
            messages.push("🚨 CRITICAL: obot-3 becomes unstable and drops all items!");
            // Drop all items
            const items = await this.db.getItemsInLocation('inventory');
            for (const item of items) {
                await this.db.moveItem(item.id, gameState.currentRoom);
            }
            await this.db.updateGameState({ carryingWeight: 0 });
        }
        else if (weight >= 25) {
            // 50% chance to drop random item
            if (Math.random() < 0.5) {
                const items = await this.db.getItemsInLocation('inventory');
                if (items.length > 0) {
                    const randomItem = items[Math.floor(Math.random() * items.length)];
                    await this.db.moveItem(randomItem.id, gameState.currentRoom);
                    messages.push(`⚠️  obot-3 struggles with the weight and drops ${randomItem.name}`);
                }
            }
        }
        else if (weight >= 20) {
            // 15% chance to drop random item
            if (Math.random() < 0.15) {
                const items = await this.db.getItemsInLocation('inventory');
                if (items.length > 0) {
                    const randomItem = items[Math.floor(Math.random() * items.length)];
                    await this.db.moveItem(randomItem.id, gameState.currentRoom);
                    messages.push(`⚠️  obot-3's servos strain and accidentally drops ${randomItem.name}`);
                }
            }
        }
        await this.db.updateGameState({ carryingWeight: weight });
        return messages;
    }
    // Combat system
    async processCombat(mobId, gameState) {
        const mobData = await this.db.getMob(mobId);
        if (!mobData || !mobData.isAlive) {
            return ["The threat has already been neutralized."];
        }
        const messages = [];
        // Mob attacks obot-3
        const damage = this.rollDice(mobData.damage);
        const newHealth = Math.max(0, gameState.health - damage);
        messages.push(`${mobData.name} attacks obot-3 for ${damage} ${mobData.damageType} damage!`);
        // Apply special abilities
        if (mobData.specialAbility) {
            const effectMessage = await this.applySpecialAbility(mobData, gameState);
            if (effectMessage)
                messages.push(effectMessage);
        }
        await this.db.updateGameState({ health: newHealth });
        // Check for energy-based automatic retreat first
        if (gameState.energy <= 5) {
            messages.push("⚡ EMERGENCY ENERGY RETREAT: Power reserves critical - automatic withdrawal initiated!");
            await this.attemptEnergyRetreat(gameState);
            messages.push("🤖 obot-3 disengages from combat to preserve remaining power systems.");
            return messages;
        }
        // Check if obot-3 is critically damaged
        if (newHealth <= 20) {
            messages.push("🔋 WARNING: obot-3 is critically damaged and attempting to flee!");
            // 75% chance to successfully flee
            if (Math.random() < 0.75) {
                await this.attemptFlee(gameState);
                messages.push("obot-3 successfully retreats to a safer location.");
            }
            else {
                messages.push("obot-3 is unable to escape!");
            }
        }
        // Check if obot-3 is destroyed
        if (newHealth <= 0) {
            messages.push("💀 SYSTEM FAILURE: obot-3 has been destroyed!");
            await this.enterMaintenanceMode(gameState);
        }
        return messages;
    }
    async applySpecialAbility(mob, gameState) {
        switch (mob.specialAbility) {
            case 'acid_burn':
                await this.db.addCombatEffect(`acid_burn_${Date.now()}`, 'acid_burn', 'Corrosive acid continues eating through obot-3\'s plating', 3, 1);
                return "🧪 Acid splashes across obot-3's chassis - ongoing corrosion detected!";
            case 'electrical_glitch':
                if (Math.random() < 0.25) {
                    // Disable random tool for 2 turns - would need tool tracking
                    return "⚡ Electrical surge causes system glitches - some tools temporarily offline!";
                }
                break;
            case 'attach_corrode':
                await this.db.addCombatEffect(`attached_${Date.now()}`, 'attached', 'Metallivorous bacteria attached to obot-3\'s frame', -1, // Must be manually removed
                1);
                return "🦠 Bacteria swarm attaches to obot-3 - continuous metal corrosion detected!";
        }
        return null;
    }
    async attemptFlee(gameState) {
        // Try to move to a random connected room
        const room = await this.db.getRoom(gameState.currentRoom);
        if (room?.exits) {
            const exits = JSON.parse(room.exits);
            const exitKeys = Object.keys(exits);
            if (exitKeys.length > 0) {
                const randomExit = exitKeys[Math.floor(Math.random() * exitKeys.length)];
                const newRoom = exits[randomExit];
                await this.db.updateGameState({
                    currentRoom: newRoom,
                    inCombat: false // Clear combat state when fleeing
                });
            }
        }
    }
    async enterMaintenanceMode(gameState) {
        // Reduce max energy by 10%
        const newMaxEnergy = Math.floor(gameState.maxEnergy * 0.9);
        // Repair to 25% health and return to base
        await this.db.updateGameState({
            health: 25,
            energy: Math.floor(newMaxEnergy * 0.5),
            maxEnergy: newMaxEnergy,
            currentRoom: 'STORAGE_15' // Return to starting room
        });
        // Clear all combat effects
        const effects = await this.db.getCombatEffects();
        for (const effect of effects) {
            await this.db.updateCombatEffectDuration(effect.id, 0);
        }
    }
    // Process ongoing combat effects
    async processCombatEffects(gameState) {
        const effects = await this.db.getCombatEffects();
        const messages = [];
        for (const effect of effects) {
            if (effect.duration > 0) {
                const newHealth = Math.max(0, gameState.health - effect.value);
                await this.db.updateGameState({ health: newHealth });
                await this.db.updateCombatEffectDuration(effect.id, effect.duration - 1);
                messages.push(`💢 ${effect.description} - obot-3 takes ${effect.value} damage`);
                if (newHealth <= 0) {
                    await this.enterMaintenanceMode(gameState);
                    messages.push("💀 Ongoing damage causes system failure - entering maintenance mode!");
                    break;
                }
            }
        }
        return messages;
    }
    // Item usage
    async useItem(itemId, gameState) {
        const items = await this.db.getItemsInLocation('inventory');
        const item = items.find(i => i.id === itemId);
        if (!item) {
            return ["Item not found in inventory."];
        }
        const messages = [];
        // Check energy cost
        if (item.energyCost > gameState.energy) {
            return [`Insufficient energy to use ${item.name}. Required: ${item.energyCost}, Available: ${gameState.energy}`];
        }
        // Apply item effects
        let healthGain = 0;
        let energyGain = 0;
        let energyUsed = item.energyCost;
        switch (item.type) {
            case 'robot_medicine':
                healthGain = Math.min(item.value, 100 - gameState.health);
                messages.push(`🔧 obot-3 uses ${item.name} and repairs ${healthGain} damage`);
                break;
            case 'human_medicine':
                messages.push(`🤖 ${item.name} is designed for human use - obot-3 cannot benefit from this item`);
                return messages;
            case 'food':
                messages.push(`🤖 obot-3 cannot process organic matter, but this food could help human survivors`);
                return messages;
            case 'energy':
                energyGain = Math.min(item.value, gameState.maxEnergy - gameState.energy);
                messages.push(`🔋 obot-3 uses ${item.name} and gains ${energyGain} energy`);
                energyUsed = 0; // Energy items don't cost energy to use
                break;
            case 'weapon':
                messages.push(`⚔️  ${item.name} equipped as primary weapon (${item.value} bonus damage)`);
                // Weapons stay equipped, don't get consumed
                return messages;
            case 'key':
                messages.push(`🔑 ${item.name} added to inventory - can be used to unlock restricted areas`);
                // Keys don't get consumed on pickup, only when used
                return messages;
            case 'tool':
                if (item.name.includes('Plasma Torch')) {
                    messages.push(`🔥 ${item.name} acquired! This high-powered cutting tool can slice through steel barriers and sealed hatches. Use it near blocked exits to cut through.`);
                    return messages;
                }
                else {
                    messages.push(`🔧 ${item.name} equipped - provides utility functions (${item.value} effectiveness)`);
                    return messages;
                }
            case 'water':
                messages.push(`💧 ${item.name} - clean water supply ready for consumption by human survivors`);
                return messages;
            case 'water_purifier':
                messages.push(`💊 ${item.name} - can purify contaminated water for safe consumption`);
                return messages;
            case 'raw_water':
                messages.push(`🚰 ${item.name} - contaminated water that needs purification before use`);
                return messages;
            case 'material':
                return await this.handleMaterialItem(item, gameState);
        }
        // Update game state
        const newHealth = Math.min(100, gameState.health + healthGain);
        const newEnergy = Math.min(gameState.maxEnergy, gameState.energy + energyGain - energyUsed);
        await this.db.updateGameState({ health: newHealth, energy: newEnergy });
        // Remove consumable items
        if (['robot_medicine', 'energy'].includes(item.type)) {
            await this.db.runAsync('DELETE FROM items WHERE id = ?', [itemId]);
        }
        return messages;
    }
    async attemptEnergyRetreat(gameState) {
        // Energy retreat - try to move toward bunker or to a safer adjacent room
        const currentRoom = gameState.currentRoom;
        const roomData = world_data_js_1.BASEMENT_ROOMS[currentRoom];
        if (!roomData)
            return;
        // Prefer moving toward bunker (B01) or to BUNKER if available
        const exits = Object.entries(roomData.exits);
        let retreatRoom = null;
        // Priority: BUNKER > BUNKER_AIRLOCK > STORAGE_15 > any room closer to bunker > random room
        for (const [direction, roomId] of exits) {
            if (roomId === 'BUNKER' || roomId === 'BUNKER_AIRLOCK' || roomId === 'STORAGE_15') {
                retreatRoom = roomId;
                break;
            }
        }
        // If no direct path to bunker, pick first available exit
        if (!retreatRoom && exits.length > 0) {
            retreatRoom = exits[0][1];
        }
        if (retreatRoom) {
            await this.db.updateGameState({
                currentRoom: retreatRoom,
                turnNumber: gameState.turnNumber + 1,
                inCombat: false // Clear combat state when retreating
            });
        }
    }
    // Calculate robot's attack damage including weapon bonuses
    async calculateAttackDamage() {
        const baseAttack = this.rollDice('1d6+2'); // Base robot attack
        // Check for equipped weapons
        const items = await this.db.getItemsInLocation('inventory');
        const weapon = items.find(item => item.type === 'weapon');
        if (weapon) {
            return baseAttack + weapon.value; // Add weapon bonus damage
        }
        return baseAttack;
    }
    // Handle plasma torch cutting operations
    async usePlasmaTorch(gameState, target) {
        const items = await this.db.getItemsInLocation('inventory');
        const plasmaTorch = items.find(item => item.name.includes('Plasma Torch'));
        if (!plasmaTorch) {
            return ["🚫 Plasma torch not found in inventory."];
        }
        if (gameState.energy < plasmaTorch.energyCost) {
            return [`🚫 Insufficient energy to operate plasma torch. Required: ${plasmaTorch.energyCost}, Available: ${gameState.energy}`];
        }
        const messages = [];
        // Handle different cutting targets
        if (target.toLowerCase().includes('stair') || target.toLowerCase().includes('up')) {
            // Cutting through stairs to lobby
            messages.push("🔥 **PLASMA TORCH ACTIVATED - CUTTING UPWARD**");
            messages.push("The high-powered plasma beam slices through the bent steel door and debris blocking the stairway.");
            messages.push("Molten metal drips as the torch cuts a clean path through the obstacles.");
            messages.push("🎯 **STAIRS CLEARED!** The path to the lobby is now open.");
            messages.push("✅ Victory condition unlocked: 'move up' from the stairs to escape to the lobby");
            // Update stairs room to be accessible
            await this.db.updateRoomExits('STAIRS_UP', JSON.stringify({
                north: "HALLWAY_C2",
                up: "LOBBY"
            }));
        }
        else if (target.toLowerCase().includes('hatch') || target.toLowerCase().includes('down')) {
            // Cutting through hatch to sub-basement
            messages.push("🔥 **PLASMA TORCH ACTIVATED - CUTTING DOWNWARD**");
            messages.push("The plasma torch melts through the heavy welding sealing the maintenance hatch.");
            messages.push("Sparks fly as the industrial seal gives way to the cutting beam.");
            messages.push("🎯 **HATCH UNSEALED!** The sub-basement tunnel system is now accessible.");
            messages.push("✅ Victory condition unlocked: 'move down' from the hatch to escape via tunnels");
            // Update hatch room to be accessible
            await this.db.updateRoomExits('HATCH_DOWN_SEALED_2', JSON.stringify({
                up: "LAUNDRY_SUPPLY",
                down: "TUNNELS"
            }));
        }
        else {
            return [`🚫 Cannot use plasma torch on "${target}". Valid targets: stairs (up to lobby) or hatch (down to tunnels).`];
        }
        // Consume energy for plasma torch operation
        await this.db.updateGameState({
            energy: gameState.energy - plasmaTorch.energyCost
        });
        return messages;
    }
    // Handle water purification mechanics
    async purifyWater(gameState, rawWaterId, purifierId) {
        const items = await this.db.getItemsInLocation('inventory');
        const rawWater = items.find(item => item.id === rawWaterId);
        const purifier = items.find(item => item.id === purifierId);
        if (!rawWater || rawWater.type !== 'raw_water') {
            return ["🚫 Raw water not found in inventory."];
        }
        if (!purifier || purifier.type !== 'water_purifier') {
            return ["🚫 Water purification tablets not found in inventory."];
        }
        const messages = [];
        const rawWaterValue = rawWater.rawWaterValue || 0;
        const purifierUses = purifier.purifierUses || 0;
        if (purifierUses <= 0) {
            return ["🚫 Water purification tablets are exhausted."];
        }
        // Remove raw water and consume one purifier use
        await this.db.moveItem(rawWater.id, 'consumed');
        // Create clean water
        const cleanWaterId = `clean_water_${Date.now()}`;
        // Note: This would require adding the item to the database
        messages.push(`💧 **Water Purified!** ${rawWater.name} has been treated with purification tablets.`);
        messages.push(`✅ Created clean water supply (${rawWaterValue} day supply) safe for human consumption.`);
        messages.push(`💊 Purification tablets remaining: ${purifierUses - 1}`);
        return messages;
    }
    // Handle material items with robot-specific functionality
    async handleMaterialItem(item, gameState) {
        const messages = [];
        // Emergency Radio - Robot can scan for emergency broadcasts
        if (item.name.includes('Emergency Radio')) {
            messages.push(`📻 **ACTIVATING EMERGENCY RADIO**`);
            messages.push(`🔍 Scanning emergency frequencies...`);
            messages.push(`📡 **EMERGENCY BROADCAST DETECTED:**`);
            messages.push(`"This is Emergency Station Alpha-7... Day ${gameState.daysSinceIncident} since the incident..."`);
            messages.push(`"Radiation levels remain critical in downtown LA... Seek shelter immediately..."`);
            messages.push(`"Government evacuation zones are: Sectors 12, 15, and 18... Avoid all other areas..."`);
            messages.push(`"If you can hear this, stay underground. Do not venture to surface until all-clear signal."`);
            messages.push(`📻 Radio reception fades. Emergency broadcast information logged.`);
            // Save the full broadcast content
            const broadcastContent = `🔴 **EMERGENCY BROADCAST - STATION ALPHA-7**

📅 **Day ${gameState.daysSinceIncident} since the nuclear incident**
📍 **Location:** Los Angeles Emergency Command

⚠️  **CRITICAL ALERT:** Radiation levels remain at dangerous levels across downtown Los Angeles. All civilians must seek immediate underground shelter.

🚨 **EVACUATION ZONES - AUTHORIZED PERSONNEL ONLY:**
- Sector 12: Beverly Hills / West Hollywood corridor  
- Sector 15: Santa Monica / Venice evacuation route
- Sector 18: Burbank / Glendale safe passage

⛔ **AVOID ALL OTHER AREAS** - Contamination levels exceed survivable thresholds

🏠 **SHELTER PROTOCOL:** Remain underground until official all-clear signal broadcast. Surface exposure will result in fatal radiation poisoning.

📡 **Next broadcast in 6 hours. Stay strong, stay hidden.**

*[Signal degrades to static...]*`;
            // Check if we already discovered this to avoid duplicates
            const existingBroadcast = await this.db.hasDiscoveredContent('emergency_broadcast_alpha7');
            if (!existingBroadcast) {
                await this.db.addDiscoveredContent('emergency_broadcast_alpha7', 'broadcast', 'Emergency Station Alpha-7 Broadcast', broadcastContent, item.name);
                messages.push(`💾 **Emergency broadcast archived to obot-3 memory banks.**`);
            }
            return messages;
        }
        // Building Blueprints - Robot can analyze building layout
        if (item.name.includes('Building Blueprints')) {
            messages.push(`📐 **ANALYZING BUILDING BLUEPRINTS**`);
            messages.push(`🔍 Processing architectural data through visual recognition systems...`);
            messages.push(`📊 **BUILDING ANALYSIS COMPLETE:**`);
            messages.push(`- Emergency exits: 3 confirmed routes to surface level`);
            messages.push(`- Structural weak points: Northeast corner shows stress fractures`);
            messages.push(`- Hidden areas: Service tunnels connect to adjacent buildings`);
            messages.push(`- Power systems: Main electrical room controls all building power`);
            messages.push(`🤖 Navigation database updated with structural information.`);
            // Save the detailed blueprint analysis
            const blueprintContent = `🏗️ **ARCHITECTURAL ANALYSIS REPORT**
**Building:** 420 S. Grand Avenue Residential Complex
**Analysis Date:** Post-incident Day ${gameState.daysSinceIncident}

📐 **STRUCTURAL LAYOUT:**
- **Floors:** 12 residential floors + basement levels
- **Construction:** 1970s reinforced concrete with steel frame
- **Building Dimensions:** 180ft x 120ft footprint

🚪 **EMERGENCY EXITS (3 Routes):**
1. **Main Lobby Stairwell** (North side) - Access via basement stairs
   - Steel fire doors, may be blocked by debris
   - Direct route to Grand Avenue

2. **Service Elevator Shaft** (Center) - Emergency ladder system  
   - Manual override required, electrical systems compromised
   - Access to parking garage level

3. **Sub-basement Tunnel System** (South side)
   - Connects to adjacent buildings on Hope Street
   - Maintenance access, requires plasma torch for sealed hatches

⚠️  **STRUCTURAL VULNERABILITIES:**
- Northeast corner: Stress fractures in support columns (avoid heavy loads)
- Floors 8-12: Water damage from compromised roof systems
- Basement level: Minor flooding in electrical room area

🔌 **BUILDING SYSTEMS:**
- **Main Electrical:** Room B-12 controls all building power
- **Emergency Power:** Backup generators in sub-basement
- **Water Systems:** Main shutoff in mechanical room
- **HVAC:** Roof units compromised, basement systems functional

🗺️ **HIDDEN AREAS:**
- Service tunnels behind maintenance room (keycard access)
- Concealed storage behind false walls in basement
- Rooftop access through hidden stairwell (Floor 12)

🔧 **MAINTENANCE ACCESS:**
- Building superintendent apartment: Basement level, south wing
- Master key storage: Maintenance office
- Tool cache: Workshop area, plasma torch location confirmed

📊 **TACTICAL ASSESSMENT:**
- Best escape route: Sub-basement tunnels (safest from surface radiation)
- Backup route: Main lobby (fastest but highest exposure risk)
- Resource priority: Secure plasma torch for tunnel access`;
            const existingBlueprints = await this.db.hasDiscoveredContent('building_blueprints_analysis');
            if (!existingBlueprints) {
                await this.db.addDiscoveredContent('building_blueprints_analysis', 'blueprint', 'Building Architectural Analysis', blueprintContent, item.name);
                messages.push(`💾 **Architectural data archived to navigation database.**`);
            }
            return messages;
        }
        // Electrical Components - Robot can analyze for system repairs
        if (item.name.includes('Electrical Components')) {
            messages.push(`⚡ **ANALYZING ELECTRICAL COMPONENTS**`);
            messages.push(`🔧 Scanning components for compatibility with obot-3 systems...`);
            messages.push(`💡 **COMPONENT ANALYSIS:**`);
            messages.push(`- 12V power regulators: Compatible with charging systems`);
            messages.push(`- Circuit breakers: Could restore power to building sections`);
            messages.push(`- Wiring harnesses: Suitable for emergency repairs`);
            messages.push(`⚡ Components stored for potential system integration.`);
            return messages;
        }
        // Scrap Metal - Robot can assess for construction/repair potential
        if (item.name.includes('Scrap Metal')) {
            messages.push(`🔩 **ANALYZING SCRAP METAL COLLECTION**`);
            messages.push(`🤖 Evaluating materials for structural reinforcement potential...`);
            messages.push(`🔧 **MATERIAL ASSESSMENT:**`);
            messages.push(`- Steel pipes: Suitable for barrier construction`);
            messages.push(`- Metal plates: Could reinforce damaged doors`);
            messages.push(`- Wire mesh: Useful for air filtration systems`);
            messages.push(`🛠️ Materials catalogued for potential construction projects.`);
            return messages;
        }
        // Vinyl Records - Robot can play them for morale/information
        if (item.name.includes('Vinyl Record Collection')) {
            messages.push(`🎵 **ACCESSING VINYL RECORD COLLECTION**`);
            messages.push(`🔍 Scanning record labels through optical sensors...`);
            messages.push(`🎶 **COLLECTION CONTAINS:**`);
            messages.push(`- Classical music: Could provide psychological comfort to survivors`);
            messages.push(`- Jazz albums: High-quality recordings from the 1960s-70s`);
            messages.push(`- Radio dramas: Audio entertainment for extended shelter periods`);
            messages.push(`🎧 Audio files digitized and stored for survivor morale support.`);
            return messages;
        }
        // Family Photos - Robot can scan for identification/intelligence
        if (item.name.includes('Family Photo') || item.name.includes('Photo Albums')) {
            messages.push(`📸 **SCANNING FAMILY PHOTOGRAPHS**`);
            messages.push(`🔍 Processing images through facial recognition database...`);
            messages.push(`👥 **PHOTO ANALYSIS:**`);
            messages.push(`- Resident identification: Multiple building tenants documented`);
            messages.push(`- Time period: Photos span 1995-2024, showing building history`);
            messages.push(`- Social connections: Family networks and relationships mapped`);
            messages.push(`📊 Resident data logged for potential survivor location assistance.`);
            return messages;
        }
        // Books - Robot can scan for useful information
        if (item.name.includes('Box of Books')) {
            messages.push(`📚 **SCANNING BOOK COLLECTION**`);
            messages.push(`🔍 Using optical character recognition to process text content...`);
            messages.push(`📖 **USEFUL INFORMATION FOUND:**`);
            messages.push(`- Survival handbook: Techniques for water purification and shelter`);
            messages.push(`- Electronics manual: Procedures for equipment repair`);
            messages.push(`- Medical reference: First aid procedures for radiation exposure`);
            messages.push(`🧠 Knowledge database updated with practical survival information.`);
            return messages;
        }
        // Wine Collection - Robot can analyze for trade value/chemical properties
        if (item.name.includes('Wine Collection')) {
            messages.push(`🍷 **ANALYZING WINE COLLECTION**`);
            messages.push(`🔬 Scanning bottles for chemical composition and value assessment...`);
            messages.push(`📊 **COLLECTION ASSESSMENT:**`);
            messages.push(`- High-value vintages: Could be valuable for survivor trade`);
            messages.push(`- Alcohol content: 12-15% ethanol - potential antiseptic use`);
            messages.push(`- Preservation status: Most bottles remain sealed and viable`);
            messages.push(`💰 Trade value estimated at significant bartering potential.`);
            return messages;
        }
        // Default material item response
        messages.push(`🔍 ${item.name} analyzed. Robot sensors detect this as potentially useful material, but no specific robotic applications identified. Item catalogued for future reference.`);
        return messages;
    }
}
exports.GameEngine = GameEngine;
//# sourceMappingURL=game-engine.js.map