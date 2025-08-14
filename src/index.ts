#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { Database } from './database.js';
import { GameEngine } from './game-engine.js';
import { BASEMENT_ROOMS, BASEMENT_ITEMS, BASEMENT_MOBS, BASEMENT_HAZARDS } from './world-data.js';

class Obot3Server {
  private server: Server;
  private db: Database;
  private engine: GameEngine;

  constructor() {
    this.server = new Server({
      name: 'obot-3-explorer',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
      },
    });

    this.db = new Database();
    this.engine = new GameEngine(this.db);
    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'start_mission',
            description: 'Begin the obot-3 exploration mission (use this first to get the story introduction)',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'explore',
            description: 'Look around the current location and get detailed information about the environment',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'move',
            description: 'Move obot-3 to a connected room',
            inputSchema: {
              type: 'object',
              properties: {
                direction: {
                  type: 'string',
                  description: 'Direction to move (north, south, east, west)',
                },
              },
              required: ['direction'],
            },
          },
          {
            name: 'interact',
            description: 'Examine or interact with objects, items, or creatures in the current location',
            inputSchema: {
              type: 'object',
              properties: {
                target: {
                  type: 'string',
                  description: 'Name of the object, item, or creature to interact with',
                },
                action: {
                  type: 'string',
                  description: 'Action to perform (examine, take, attack, use)',
                  enum: ['examine', 'take', 'attack', 'use'],
                },
              },
              required: ['target', 'action'],
            },
          },
          {
            name: 'inventory',
            description: 'Check obot-3\'s current inventory and carrying capacity',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'status',
            description: 'Get obot-3\'s current status including health, energy, and any active effects',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'rest',
            description: 'Have obot-3 rest to recover energy (costs time)',
            inputSchema: {
              type: 'object',
              properties: {
                duration: {
                  type: 'string',
                  description: 'How long to rest (short, long)',
                  enum: ['short', 'long'],
                },
              },
              required: ['duration'],
            },
          },
          {
            name: 'return_to_bunker',
            description: 'Return obot-3 to the bunker and transfer collected items to bunker storage',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'bunker_status',
            description: 'Check bunker inventory and survival status',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'use_plasma_torch',
            description: 'Use the plasma torch to cut through sealed barriers (specify "up" for main lobby or "down" for sub-basement)',
            inputSchema: {
              type: 'object',
              properties: {
                direction: {
                  type: 'string',
                  description: 'Direction to cut: "up" for main lobby, "down" for sub-basement tunnels',
                  enum: ['up', 'down'],
                },
              },
              required: ['direction'],
            },
          },
        ] as Tool[],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'start_mission':
            return await this.handleStartMission();
          case 'explore':
            return await this.handleExplore();
          case 'move':
            return await this.handleMove(args?.direction as string);
          case 'interact':
            return await this.handleInteract(args?.target as string, args?.action as string);
          case 'inventory':
            return await this.handleInventory();
          case 'status':
            return await this.handleStatus();
          case 'rest':
            return await this.handleRest(args?.duration as string);
          case 'return_to_bunker':
            return await this.handleReturnToBunker();
          case 'bunker_status':
            return await this.handleBunkerStatus();
          case 'use_plasma_torch':
            return await this.handleUsePlasmaTorch(args?.direction as string);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  private async handleStartMission() {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    // Check if mission already started
    if (gameState.missionStarted) {
      return {
        content: [{ 
          type: 'text', 
          text: `🤖 **OBOT-3 ONLINE** - Systems already active. Current location: ${gameState.currentRoom}\n\nCommander, I'm ready for orders. Use 'explore' to scan my surroundings or 'status' to check my operational status.` 
        }],
      };
    }

    // Mark mission as started
    await this.db.updateGameState({ missionStarted: true });

    const storyIntro = `🤖 **OBOT-3 ACTIVATION SEQUENCE INITIATED**

📅 **Day 12 After the Incident**
📍 **Current Location:** Storage Unit A (Basement Level)
⚠️  **Radiation Status:** LETHAL LEVELS DETECTED ON SURFACE

---

**OBOT-3 SYSTEM STATUS:**

🤖 Greetings, Commander. I am OBOT-3, your 4-foot reconnaissance unit.

My records indicate it has been 12 days since the Prometheus Antimatter Research Facility containment failure. The resulting explosion has rendered most of downtown LA lethally radioactive. While you remain safely in our shielded bunker command center, I can venture into the contaminated zones to gather supplies and intelligence.

**MY CURRENT SPECIFICATIONS:**
- Chassis: 4-foot frame optimized for debris navigation
- Health: 100/100 (self-repair systems functional but limited)
- Energy: 100/100 (rechargeable via power cells)
- Carrying Capacity: 30 lbs maximum (servo overload protection engaged)
- Sensors: Visual/audio detection, environmental analysis suite
- Manipulators: Dual articulated arms with precision grasping capability

**MISSION OBJECTIVES I'VE BEEN PROGRAMMED FOR:**
1. Explore this building's basement level for critical supplies
2. Locate food, medicine, tools, and energy sources
3. **Return all supplies to you via the bunker access** 
4. Acquire weapons and upgrades to improve my operational effectiveness
5. Locate the plasma torch to breach sealed barriers to upper levels

**SUPPLY LOGISTICS PROTOCOL:**
- I will use 'return_to_bunker' to deliver collected items to your storage
- Food extends your survival time (current emergency supplies: ~1 year)
- Weapons and tools will enhance my combat effectiveness
- Use 'bunker_status' to monitor our survival situation

**ITEM COMPATIBILITY MATRIX:**
- **Robot-compatible:** Energy cells, repair kits, weapons, armor plating
- **Human-compatible:** Food, water, medicine, survival gear (for your bunker storage)
- Note: I cannot consume organic matter, but I will deliver it to you

⚠️  **DANGER ASSESSMENT:** This basement contains hostile mutants, environmental hazards, and structural dangers. My systems can be damaged or destroyed - please manage my health carefully, Commander.

---

🤖 **OBOT-3 SYSTEMS: FULLY OPERATIONAL**
📡 **Command Uplink: ESTABLISHED**  
🔋 **All systems nominal - awaiting your orders**

**AVAILABLE COMMAND PROTOCOLS:**
- 'explore' - I will scan my current area for items, threats, and exits
- 'bunker_status' - I will report on your survival supplies and time remaining
- 'return_to_bunker' - I will return to deliver supplies and recharge

Commander, every supply I deliver could mean the difference between your survival and becoming another casualty of the Prometheus Incident. I await your orders.`;

    return {
      content: [{ type: 'text', text: storyIntro }],
    };
  }

  private async handleExplore() {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    if (!gameState.missionStarted) {
      return {
        content: [{ 
          type: 'text', 
          text: `🚫 Commander, my systems are not yet activated. Please use 'start_mission' first to initialize my exploration protocols.` 
        }],
      };
    }

    await this.db.discoverRoom(gameState.currentRoom);
    const room = await this.db.getRoom(gameState.currentRoom);
    const roomData = BASEMENT_ROOMS[gameState.currentRoom as keyof typeof BASEMENT_ROOMS];
    
    if (!room || !roomData) throw new Error('Invalid room');

    // Get items in the room
    const items = await this.db.getItemsInLocation(gameState.currentRoom);
    const mobs = await this.db.getMobsInLocation(gameState.currentRoom);

    // Check for environmental hazards
    let hazardMessage = '';
    const hazard = BASEMENT_HAZARDS[gameState.currentRoom as keyof typeof BASEMENT_HAZARDS];
    if (hazard && Math.random() < hazard.triggerChance) {
      const damage = this.engine.rollDice(hazard.damage);
      const newHealth = Math.max(0, gameState.health - damage);
      await this.db.updateGameState({ health: newHealth });
      hazardMessage = `\n⚠️  **HAZARD DETECTED:** ${hazard.name} - ${hazard.description} I've sustained ${damage} ${hazard.damageType} damage!`;
    }

    // Process ongoing combat effects
    const effectMessages = await this.engine.processCombatEffects(gameState);

    let description = `🤖 **SCANNING CURRENT AREA...**\n\n`;
    description += `📍 **My Current Location:** ${roomData.name}\n`;
    description += `🔍 **Visual Analysis:** ${roomData.description}\n\n`;

    if (Object.keys(roomData.exits).length > 0) {
      description += `🚪 **Exit Routes I Can Access:**\n`;
      for (const [direction, roomId] of Object.entries(roomData.exits)) {
        const exitRoom = BASEMENT_ROOMS[roomId as keyof typeof BASEMENT_ROOMS];
        const discovered = await this.db.getRoom(roomId);
        const roomName = discovered?.discovered ? exitRoom.name : 'Unexplored area';
        description += `  • ${direction}: ${roomName}\n`;
      }
      description += '\n';
    }

    if (items.length > 0) {
      description += `📦 **Items My Sensors Have Located:**\n`;
      items.forEach(item => {
        description += `  • ${item.name} (${item.weight}lbs) - ${item.description}\n`;
      });
      description += '\n';
    }

    if (mobs.length > 0) {
      description += `⚠️  **THREAT DETECTION ALERT:**\n`;
      mobs.forEach(mob => {
        description += `  • ${mob.name} (${mob.health}/${mob.maxHealth} HP) - ${mob.description}\n`;
      });
      description += '\n';
    }

    if (hazardMessage) {
      description += hazardMessage;
    }

    if (effectMessages.length > 0) {
      description += '\n' + effectMessages.join('\n');
    }

    await this.db.updateGameState({ turnNumber: gameState.turnNumber + 1 });

    return {
      content: [{ type: 'text', text: description }],
    };
  }

  private async handleMove(direction: string) {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    if (!gameState.missionStarted) {
      return {
        content: [{ type: 'text', text: `🚫 Mission not yet initiated. Use 'start_mission' first.` }],
      };
    }

    const roomData = BASEMENT_ROOMS[gameState.currentRoom as keyof typeof BASEMENT_ROOMS];
    if (!roomData) throw new Error('Invalid current room');

    const newRoomId = roomData.exits[direction as keyof typeof roomData.exits];
    if (!newRoomId) {
      return {
        content: [{ type: 'text', text: `No exit to the ${direction} from this location.` }],
      };
    }

    // Check for combat - if there are living mobs, obot-3 cannot leave
    const mobs = await this.db.getMobsInLocation(gameState.currentRoom);
    if (mobs.length > 0) {
      return {
        content: [{ type: 'text', text: `🚫 Cannot move - hostiles are blocking the way! You must deal with the threat first.` }],
      };
    }

    await this.db.updateGameState({ 
      currentRoom: newRoomId,
      turnNumber: gameState.turnNumber + 1 
    });

    // Check weight limits after movement
    const updatedGameState2 = await this.db.getGameState();
    const weightMessages = updatedGameState2 ? await this.engine.checkWeightLimits(updatedGameState2) : [];

    const newRoomData = BASEMENT_ROOMS[newRoomId as keyof typeof BASEMENT_ROOMS];
    let response = `🚶 obot-3 moves ${direction} to ${newRoomData.name}`;
    
    if (weightMessages.length > 0) {
      response += '\n\n' + weightMessages.join('\n');
    }

    return {
      content: [{ type: 'text', text: response }],
    };
  }

  private async handleInteract(target: string, action: string) {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    const messages: string[] = [];

    if (action === 'take') {
      const items = await this.db.getItemsInLocation(gameState.currentRoom);
      const item = items.find(i => i.name.toLowerCase().includes(target.toLowerCase()));
      
      if (!item) {
        return {
          content: [{ type: 'text', text: `Item "${target}" not found in this location.` }],
        };
      }

      // Check if adding this item would exceed weight limits
      const currentWeight = await this.engine.calculateCarryingWeight();
      if (currentWeight + item.weight > 30) {
        return {
          content: [{ type: 'text', text: `⚠️  Cannot take ${item.name} - would exceed obot-3's carrying capacity (${currentWeight + item.weight}lbs > 30lbs)` }],
        };
      }

      await this.db.moveItem(item.id, 'inventory');
      messages.push(`✅ obot-3 picks up ${item.name} (${item.weight}lbs)`);

      // Check weight limits after taking item
      const updatedGameState = await this.db.getGameState();
      if (updatedGameState) {
        const weightMessages = await this.engine.checkWeightLimits(updatedGameState);
        messages.push(...weightMessages);
      }

    } else if (action === 'attack') {
      const mobs = await this.db.getMobsInLocation(gameState.currentRoom);
      const mob = mobs.find(m => m.name.toLowerCase().includes(target.toLowerCase()));
      
      if (!mob) {
        return {
          content: [{ type: 'text', text: `Target "${target}" not found in this location.` }],
        };
      }

      // Player attacks first (with weapon bonuses)
      const playerDamage = await this.engine.calculateAttackDamage();
      const newMobHealth = Math.max(0, mob.health - playerDamage);
      await this.db.updateMobHealth(mob.id, newMobHealth);
      
      // Check for equipped weapon for attack message
      const items = await this.db.getItemsInLocation('inventory');
      const weapon = items.find(item => item.type === 'weapon');
      const weaponText = weapon ? ` with ${weapon.name}` : '';
      
      messages.push(`⚔️  obot-3 attacks ${mob.name}${weaponText} for ${playerDamage} damage!`);

      if (newMobHealth <= 0) {
        messages.push(`💀 ${mob.name} has been neutralized!`);
        
        // Check if this was the final boss (workshop)
        if (gameState.currentRoom === 'B15' && mob.id === 'rogue_bot_001') {
          messages.push('\n🎉 **LEVEL COMPLETE!** The workshop is now secure and the plasma torch is accessible!');
          await this.db.clearRoom(gameState.currentRoom);
        }
      } else {
        // Mob counter-attacks
        const updatedGameState = await this.db.getGameState();
        if (updatedGameState) {
          const combatMessages = await this.engine.processCombat(mob.id, updatedGameState);
          messages.push(...combatMessages);
        }
      }

    } else if (action === 'use') {
      const items = await this.db.getItemsInLocation('inventory');
      const item = items.find(i => i.name.toLowerCase().includes(target.toLowerCase()));
      
      if (!item) {
        return {
          content: [{ type: 'text', text: `Item "${target}" not found in inventory.` }],
        };
      }

      const useMessages = await this.engine.useItem(item.id, gameState);
      messages.push(...useMessages);

    } else if (action === 'examine') {
      // Examine items, mobs, or room features
      const roomItems = await this.db.getItemsInLocation(gameState.currentRoom);
      const inventoryItems = await this.db.getItemsInLocation('inventory');
      const mobs = await this.db.getMobsInLocation(gameState.currentRoom);
      
      const allItems = [...roomItems, ...inventoryItems];
      const item = allItems.find(i => i.name.toLowerCase().includes(target.toLowerCase()));
      const mob = mobs.find(m => m.name.toLowerCase().includes(target.toLowerCase()));
      
      if (item) {
        messages.push(`🔍 **${item.name}**\n${item.description}\nWeight: ${item.weight}lbs | Type: ${item.type}`);
        if (item.energyCost > 0) {
          messages.push(`Energy cost to use: ${item.energyCost}`);
        }
      } else if (mob) {
        messages.push(`🔍 **${mob.name}**\n${mob.description}\nHealth: ${mob.health}/${mob.maxHealth}`);
      } else {
        messages.push(`Cannot examine "${target}" - not found in this location.`);
      }
    }

    await this.db.updateGameState({ turnNumber: gameState.turnNumber + 1 });

    return {
      content: [{ type: 'text', text: messages.join('\n') }],
    };
  }

  private async handleInventory() {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    const items = await this.db.getItemsInLocation('inventory');
    const totalWeight = await this.engine.calculateCarryingWeight();

    let response = `🎒 **OBOT-3 INVENTORY**\n\n`;
    response += `⚖️  **Carrying Capacity:** ${totalWeight.toFixed(1)}/30.0 lbs\n\n`;

    if (items.length === 0) {
      response += `📦 Inventory is empty.\n`;
    } else {
      response += `📦 **Items:**\n`;
      items.forEach(item => {
        response += `  • ${item.name} (${item.weight}lbs) - ${item.description}\n`;
      });
    }

    // Weight warnings
    if (totalWeight >= 25) {
      response += `\n🚨 **WARNING:** Approaching critical weight - may drop items!`;
    } else if (totalWeight >= 20) {
      response += `\n⚠️  **CAUTION:** Heavy load - occasional drops possible`;
    }

    return {
      content: [{ type: 'text', text: response }],
    };
  }

  private async handleStatus() {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    const effects = await this.db.getCombatEffects();
    const totalWeight = await this.engine.calculateCarryingWeight();

    let response = `🤖 **OBOT-3 STATUS REPORT**\n\n`;
    response += `❤️  **Health:** ${gameState.health}/100\n`;
    response += `🔋 **Energy:** ${gameState.energy}/${gameState.maxEnergy}\n`;
    response += `⚖️  **Weight:** ${totalWeight.toFixed(1)}/30.0 lbs\n`;
    response += `⏰ **Turn:** ${gameState.turnNumber}\n\n`;

    if (effects.length > 0) {
      response += `⚠️  **Active Effects:**\n`;
      effects.forEach(effect => {
        response += `  • ${effect.description} (${effect.duration} turns remaining)\n`;
      });
      response += '\n';
    }

    // Status warnings
    if (gameState.health <= 20) {
      response += `🚨 **CRITICAL:** obot-3 is severely damaged and may attempt to flee from combat!\n`;
    } else if (gameState.health <= 50) {
      response += `⚠️  **WARNING:** obot-3 has sustained significant damage.\n`;
    }

    if (gameState.energy <= 20) {
      response += `🔋 **LOW POWER:** Energy reserves critically low!\n`;
    }

    return {
      content: [{ type: 'text', text: response }],
    };
  }

  private async handleRest(duration: string) {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    // Cannot rest if hostiles are present
    const mobs = await this.db.getMobsInLocation(gameState.currentRoom);
    if (mobs.length > 0) {
      return {
        content: [{ type: 'text', text: `🚫 Cannot rest - hostiles are present!` }],
      };
    }

    let energyRestored = 0;
    let turnsUsed = 0;

    if (duration === 'short') {
      energyRestored = Math.min(20, gameState.maxEnergy - gameState.energy);
      turnsUsed = 3;
    } else if (duration === 'long') {
      energyRestored = Math.min(gameState.maxEnergy, gameState.maxEnergy - gameState.energy);
      turnsUsed = 8;
    }

    await this.db.updateGameState({
      energy: gameState.energy + energyRestored,
      turnNumber: gameState.turnNumber + turnsUsed
    });

    return {
      content: [{ 
        type: 'text', 
        text: `😴 obot-3 enters power-saving mode and restores ${energyRestored} energy over ${turnsUsed} turns.` 
      }],
    };
  }

  private async handleReturnToBunker() {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    if (!gameState.missionStarted) {
      return {
        content: [{ type: 'text', text: `🚫 Mission not yet initiated. Use 'start_mission' first.` }],
      };
    }

    // Get all items in inventory
    const items = await this.db.getItemsInLocation('inventory');
    let transferredItems = 0;
    let totalSurvivalDays = 0;
    const messages: string[] = [];

    messages.push(`🏠 **RETURNING TO BUNKER**\n`);
    messages.push(`📡 obot-3 initiating return protocol...`);
    messages.push(`🚁 Uploading collected data to bunker systems...\n`);

    if (items.length === 0) {
      messages.push(`📦 No items to transfer from obot-3's inventory.\n`);
    } else {
      messages.push(`📦 **TRANSFERRING ITEMS TO BUNKER STORAGE:**\n`);
      
      for (const item of items) {
        // Move item back to bunker inventory based on type
        let bunkerType = 'material';
        let survivalValue = 0;
        
        switch (item.type) {
          case 'food':
            bunkerType = 'food';
            survivalValue = Math.floor(item.weight * 0.5); // 0.5 days per pound of food
            break;
          case 'energy':
            bunkerType = 'fuel';
            break;
          case 'human_medicine':
            bunkerType = 'medicine';
            break;
          case 'weapon':
          case 'tool':
            bunkerType = 'defense';
            break;
          default:
            bunkerType = 'technology';
        }

        await this.db.addToBunkerInventory(
          item.id,
          item.name,
          1,
          bunkerType,
          item.description,
          survivalValue || undefined
        );

        // Remove from robot inventory
        await this.db.runAsync('DELETE FROM items WHERE id = ?', [item.id]);
        
        transferredItems++;
        totalSurvivalDays += survivalValue;
        
        const survivalText = survivalValue > 0 ? ` (+${survivalValue} survival days)` : '';
        messages.push(`  ✅ ${item.name} → Bunker ${bunkerType} storage${survivalText}`);
      }
    }

    // Reset robot position to starting area
    await this.db.updateGameState({ 
      currentRoom: 'B01',
      carryingWeight: 0,
      turnNumber: gameState.turnNumber + 5 // Return trip takes time
    });

    messages.push(`\n🤖 obot-3 has returned safely to the bunker.`);
    if (totalSurvivalDays > 0) {
      messages.push(`📈 **Survival extended by ${totalSurvivalDays} days!**`);
    }
    messages.push(`\nUse 'bunker_status' to check supplies or 'start_mission' to deploy obot-3 again.`);

    return {
      content: [{ type: 'text', text: messages.join('\n') }],
    };
  }

  private async handleBunkerStatus() {
    const bunkerInventory = await this.db.getBunkerInventory();
    
    let response = `🏠 **BUNKER STATUS REPORT**\n\n`;
    
    // Calculate total survival time
    let totalSurvivalDays = 0;
    const foodItems = bunkerInventory.filter(item => item.type === 'food');
    foodItems.forEach(item => {
      if (item.survivalDays) {
        totalSurvivalDays += item.survivalDays * item.quantity;
      }
    });

    response += `⏱️  **Estimated Survival Time:** ${totalSurvivalDays} days\n\n`;

    // Group items by type
    const itemsByType: { [key: string]: any[] } = {};
    bunkerInventory.forEach(item => {
      if (!itemsByType[item.type]) itemsByType[item.type] = [];
      itemsByType[item.type].push(item);
    });

    // Display each category
    const typeNames: { [key: string]: string } = {
      'food': '🍞 **FOOD SUPPLIES**',
      'fuel': '⛽ **FUEL & ENERGY**', 
      'medicine': '💊 **MEDICAL SUPPLIES**',
      'defense': '🛡️  **DEFENSE & TOOLS**',
      'technology': '⚙️  **TECHNOLOGY**',
      'material': '📦 **RAW MATERIALS**'
    };

    Object.keys(itemsByType).forEach(type => {
      const typeName = typeNames[type] || `📋 **${type.toUpperCase()}**`;
      response += `${typeName}\n`;
      
      itemsByType[type].forEach(item => {
        const survivalText = item.survivalDays ? ` (${item.survivalDays} days each)` : '';
        response += `  • ${item.name} x${item.quantity}${survivalText}\n`;
      });
      response += '\n';
    });

    if (totalSurvivalDays < 7) {
      response += `🚨 **CRITICAL**: Food supplies critically low! Survival time less than one week.\n`;
    } else if (totalSurvivalDays < 14) {
      response += `⚠️  **WARNING**: Food supplies running low. Consider prioritizing food collection.\n`;
    } else {
      response += `✅ **STATUS**: Bunker supplies adequate for sustained survival.\n`;
    }

    return {
      content: [{ type: 'text', text: response }],
    };
  }

  private async handleUsePlasmaTorch(direction?: string) {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    if (!gameState.missionStarted) {
      return {
        content: [{ type: 'text', text: `🚫 Mission not yet initiated. Use 'start_mission' first.` }],
      };
    }

    // Check if in workshop
    if (gameState.currentRoom !== 'B15') {
      return {
        content: [{ type: 'text', text: `🚫 Can only use plasma torch in the Workshop. Current location: ${gameState.currentRoom}` }],
      };
    }

    // Check if has plasma torch
    const items = await this.db.getItemsInLocation('inventory');
    const plasmaTorch = items.find(item => item.id === 'plasma_torch_001');
    
    if (!plasmaTorch) {
      return {
        content: [{ type: 'text', text: `🚫 Plasma torch not found in inventory. You must collect it from the workshop first.` }],
      };
    }

    // Check direction parameter
    if (!direction || (direction !== 'up' && direction !== 'down')) {
      return {
        content: [{ type: 'text', text: `🚫 Must specify direction: use_plasma_torch with "up" (main lobby) or "down" (sub-basement tunnels)` }],
      };
    }

    // Check energy cost
    if (gameState.energy < 15) {
      return {
        content: [{ type: 'text', text: `🔋 Insufficient energy to operate plasma torch. Required: 15, Available: ${gameState.energy}` }],
      };
    }

    // Use plasma torch
    await this.db.updateGameState({
      energy: gameState.energy - 15,
      turnNumber: gameState.turnNumber + 3
    });

    let response: string;
    let workshopExits: any;

    if (direction === 'up') {
      // Cut through to main lobby
      workshopExits = { west: "B14", north: "B12", up: "LOBBY" };
      await this.db.updateRoomExits('B15', JSON.stringify(workshopExits));
      
      response = `🔥 **PLASMA TORCH ACTIVATED - CUTTING UPWARD**

⚡ High-energy plasma beam ignites with brilliant blue-white intensity...
🔨 Cutting through the warped steel door leading to the main lobby...
💨 Molten metal drips and hisses as barriers melt away...

🚪 **SUCCESS!** Path to the main lobby is clear!

🏢 **NEW AREA ACCESSIBLE:** Main Lobby
🆙 A stairway leading up to the building's main floor awaits.

✅ Use 'move up' to access the lobby and potentially escape the building
✅ Or use 'return_to_bunker' to deliver supplies before venturing to the surface

⚠️  **WARNING:** The lobby may be heavily contaminated with radiation!`;

    } else {
      // Cut through to sub-basement
      workshopExits = { west: "B14", north: "B12", down: "TUNNELS" };
      await this.db.updateRoomExits('B15', JSON.stringify(workshopExits));
      
      response = `🔥 **PLASMA TORCH ACTIVATED - CUTTING DOWNWARD**

⚡ High-energy plasma beam cuts through the heavy maintenance hatch...
🔨 Metal sparks fly as the sealed passage opens...
💨 Cool air rushes up from the depths below...

🚪 **SUCCESS!** Access to sub-basement tunnels secured!

🕳️ **NEW AREA ACCESSIBLE:** Sub-Basement Tunnel System
⬇️ Dark tunnels leading to adjacent buildings stretch into the distance.

✅ Use 'move down' to explore the tunnel network
✅ Or use 'return_to_bunker' to prepare for extended underground exploration

⚠️  **WARNING:** Unknown dangers lurk in the tunnel depths!`;
    }

    return {
      content: [{ type: 'text', text: response }],
    };
  }

  async initialize() {
    await this.db.initialize();
    await this.db.initializeBunkerSupplies();
    await this.initializeWorld();
  }

  private async initializeWorld() {
    // Initialize rooms
    for (const [id, roomData] of Object.entries(BASEMENT_ROOMS)) {
      const existingRoom = await this.db.getRoom(id);
      if (!existingRoom) {
        await this.db.runAsync(`
          INSERT OR REPLACE INTO rooms (id, name, description, exits) 
          VALUES (?, ?, ?, ?)
        `, [id, roomData.name, roomData.description, JSON.stringify(roomData.exits)]);
      }
    }

    // Initialize items (only if they don't exist)
    for (const item of BASEMENT_ITEMS) {
      await this.db.runAsync(`
        INSERT OR IGNORE INTO items (id, name, description, weight, type, value, energyCost, location)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [item.id, item.name, item.description, item.weight, item.type, item.value, item.energyCost, item.location]);
    }

    // Initialize mobs (only if they don't exist)
    for (const mob of BASEMENT_MOBS) {
      await this.db.runAsync(`
        INSERT OR IGNORE INTO mobs (id, name, description, health, maxHealth, damage, damageType, location, isAlive, specialAbility)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [mob.id, mob.name, mob.description, mob.health, mob.maxHealth, mob.damage, mob.damageType, mob.location, mob.isAlive, mob.specialAbility]);
    }

    // Make sure starting room is discovered
    await this.db.discoverRoom('B01');
  }

  async run() {
    await this.initialize();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

// Run the server
const server = new Obot3Server();
server.run().catch(console.error);