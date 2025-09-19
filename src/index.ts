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
            name: 'purify_water',
            description: 'Use purification tablets to convert raw water into drinkable water',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'rest_and_recharge',
            description: 'Rest overnight to fully recharge energy (only at bunker) - advances 1 day',
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
        let result: any;

        switch (name) {
          case 'start_mission':
            result = await this.handleStartMission();
            break;
          case 'explore':
            result = await this.handleExplore();
            break;
          case 'move':
            result = await this.handleMove(args?.direction as string);
            break;
          case 'interact':
            result = await this.handleInteract(args?.target as string, args?.action as string);
            break;
          case 'inventory':
            result = await this.handleInventory();
            break;
          case 'status':
            result = await this.handleStatus();
            break;
          case 'rest':
            result = await this.handleRest(args?.duration as string);
            break;
          case 'return_to_bunker':
            result = await this.handleReturnToBunker();
            break;
          case 'bunker_status':
            result = await this.handleBunkerStatus();
            break;
          case 'purify_water':
            result = await this.handlePurifyWater();
            break;
          case 'rest_and_recharge':
            result = await this.handleRestAndRecharge();
            break;
          case 'use_plasma_torch':
            result = await this.handleUsePlasmaTorch(args?.direction as string);
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        // Ensure we always return a valid response
        return result || {
          content: [{ type: 'text', text: 'Command completed successfully' }],
        };
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

**BUNKER LIFE SUPPORT STATUS:**
- Food: 7 days remaining (daily consumption: 1 unit)  
- Water: 10 days remaining (daily consumption: 1 unit)
- Energy: 15 days remaining (daily consumption: 1 unit, plus Obot-3 recharging)

**SUPPLY LOGISTICS PROTOCOL:**
- I will use 'return_to_bunker' to deliver collected items to your storage
- Food/water/energy items extend your survival time beyond current reserves
- Weapons and tools will enhance my combat effectiveness  
- Use 'bunker_status' to monitor critical resource levels and time remaining

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

    // Check if we have enough energy for exploration
    const exploreCost = 3;
    if (gameState.energy < exploreCost) {
      return await this.handleEnergyDepleted(gameState);
    }

    // Consume energy for exploration
    await this.db.updateGameState({ energy: gameState.energy - exploreCost });

    await this.db.discoverRoom(gameState.currentRoom);
    const room = await this.db.getRoom(gameState.currentRoom);
    const roomData = BASEMENT_ROOMS[gameState.currentRoom as keyof typeof BASEMENT_ROOMS];
    
    if (!room || !roomData) throw new Error('Invalid room');

    // Get items in the room
    const items = await this.db.getItemsInLocation(gameState.currentRoom);
    const mobs = await this.db.getMobsInLocation(gameState.currentRoom);
    
    // Check for enemy detection while exploring (only if not already in combat)
    if (mobs.length > 0 && !gameState.inCombat) {
      const detectionResult = await this.checkRoomDetection(mobs);
      if (detectionResult.detected) {
        // Combat triggered during exploration
        return detectionResult.combatResponse;
      }
    }

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
      description += `👁️ **STEALTH MODE - HOSTILE CONTACTS:**\n`;
      mobs.forEach(mob => {
        const alertLevel = mob.detectChance >= 0.8 ? 'HIGH ALERT' : mob.detectChance >= 0.6 ? 'ALERT' : 'LOW ALERT';
        description += `  • ${mob.name} (${mob.health}/${mob.maxHealth} HP) - Detection Risk: ${alertLevel}\n`;
        description += `    ${mob.description}\n`;
      });
      description += '\n🤖 **TACTICAL ADVISORY**: Hostiles haven\'t detected me yet. I can attempt stealth actions or prepare for combat.\n\n';
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

    // Check if we have enough energy for movement
    const moveCost = 2;
    if (gameState.energy < moveCost) {
      return await this.handleEnergyDepleted(gameState);
    }

    const roomData = BASEMENT_ROOMS[gameState.currentRoom as keyof typeof BASEMENT_ROOMS];
    if (!roomData) throw new Error('Invalid current room');

    const newRoomId = roomData.exits[direction as keyof typeof roomData.exits];
    if (!newRoomId) {
      return {
        content: [{ type: 'text', text: `No exit to the ${direction} from this location.` }],
      };
    }

    // Check for special room access requirements
    const newRoomData = BASEMENT_ROOMS[newRoomId as keyof typeof BASEMENT_ROOMS];
    if (newRoomData) {
      // Check for locked doors
      if ((newRoomData as any).locked) {
        return {
          content: [{ type: 'text', text: `🚫 The door is locked. You need to find a way to unlock it.` }],
        };
      }

      // Check for maintenance key requirement
      if ((newRoomData as any).requires_maintenance_key) {
        const items = await this.db.getItemsInLocation('inventory');
        const hasKey = items.some(item => item.id === 'maintenance_keys_001');
        if (!hasKey) {
          return {
            content: [{ type: 'text', text: `🔐 This door requires maintenance keys. The keycard reader blinks red, but there's a traditional keyhole below it.` }],
          };
        }
      }

      // Check for blocked by boxes
      if ((newRoomData as any).blocked_by_boxes) {
        return {
          content: [{ type: 'text', text: `📦 The entrance is blocked by stacked boxes and furniture. Use 'interact boxes move' to clear the way.` }],
        };
      }

      // Check for plasma torch requirements
      if ((newRoomData as any).requires_plasma_torch) {
        const items = await this.db.getItemsInLocation('inventory');
        const hasTorch = items.some(item => item.id === 'plasma_torch_001');
        if (!hasTorch) {
          if (newRoomData.name.includes('Stairway')) {
            return {
              content: [{ type: 'text', text: `🚫 The stairway is blocked by a bent steel door and debris. You need a plasma torch to cut through.` }],
            };
          } else {
            return {
              content: [{ type: 'text', text: `🚫 This hatch is sealed with heavy welding. You need a plasma torch to cut it open.` }],
            };
          }
        }
      }
    }

    // Check if player is in active combat (only block movement if detected)
    const currentRoomMobs = await this.db.getMobsInLocation(gameState.currentRoom);
    if (currentRoomMobs.length > 0) {
      // Check if any enemies have detected the player (simple combat state check)
      // For now, we'll allow movement if not explicitly in combat state
      // Future enhancement: track combat state explicitly
      const isInActiveCombat = gameState.inCombat || false;
      
      if (isInActiveCombat) {
        return {
          content: [{ type: 'text', text: `🚫 Cannot move - hostile contacts are actively engaged! You must deal with the threat first.` }],
        };
      }
      // If not in active combat, allow stealth movement but with risk
    }

    // Consume energy for movement
    await this.db.updateGameState({ energy: gameState.energy - moveCost });

    await this.db.updateGameState({ 
      currentRoom: newRoomId,
      turnNumber: gameState.turnNumber + 1 
    });

    // Check for enemies in the new room and roll for detection
    const newRoomMobs = await this.db.getMobsInLocation(newRoomId);
    if (newRoomMobs.length > 0) {
      try {
        const detectionResult = await this.checkRoomDetection(newRoomMobs);
        if (detectionResult.detected && detectionResult.combatResponse) {
          // Combat is triggered - all enemies are now alerted
          return detectionResult.combatResponse;
        }
      } catch (error) {
        console.error('Detection check failed:', error);
        // Fall through to continue with normal movement
      }
    }

    // Check weight limits after movement
    const updatedGameState2 = await this.db.getGameState();
    const weightMessages = updatedGameState2 ? await this.engine.checkWeightLimits(updatedGameState2) : [];

    const destinationRoom = BASEMENT_ROOMS[newRoomId as keyof typeof BASEMENT_ROOMS];
    let response = `🚶 obot-3 moves ${direction} to ${destinationRoom.name}`;
    
    if (weightMessages.length > 0) {
      response += '\n\n' + weightMessages.join('\n');
    }

    // If there are undetected enemies, mention stealth mode
    if (newRoomMobs.length > 0) {
      response += `\n\n👁️ **STEALTH MODE**: Hostile contacts detected but haven't noticed you yet. Use 'explore' carefully or prepare for combat.`;
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
      // Check energy cost for picking up items
      const pickupCost = 1;
      if (gameState.energy < pickupCost) {
        return await this.handleEnergyDepleted(gameState);
      }

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

      // Consume energy for pickup
      await this.db.updateGameState({ energy: gameState.energy - pickupCost });

      await this.db.moveItem(item.id, 'inventory');
      messages.push(`✅ obot-3 picks up ${item.name} (${item.weight}lbs)`);

      // Check weight limits after taking item
      const updatedGameState = await this.db.getGameState();
      if (updatedGameState) {
        const weightMessages = await this.engine.checkWeightLimits(updatedGameState);
        messages.push(...weightMessages);
      }

    } else if (action === 'attack') {
      // Check energy cost for combat
      const attackCost = 3;
      if (gameState.energy < attackCost) {
        return await this.handleEnergyDepleted(gameState);
      }

      const mobs = await this.db.getMobsInLocation(gameState.currentRoom);
      const mob = mobs.find(m => m.name.toLowerCase().includes(target.toLowerCase()));
      
      if (!mob) {
        return {
          content: [{ type: 'text', text: `Target "${target}" not found in this location.` }],
        };
      }

      // Consume energy for attack
      await this.db.updateGameState({ energy: gameState.energy - attackCost });

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
        
        // Check if all mobs in current room are defeated
        const remainingMobs = await this.db.getMobsInLocation(gameState.currentRoom);
        if (remainingMobs.length === 0) {
          // Clear combat state when all enemies are defeated
          await this.db.updateGameState({ inCombat: false });
          messages.push('🏆 **AREA SECURED** - All hostiles neutralized. obot-3 is no longer in combat.');
        }
        
        // Check if this was the final boss (workshop)
        if (gameState.currentRoom === 'WORKSHOP' && mob.id === 'maintenance_bot_corrupted_001') {
          messages.push('\n🎉 **WORKSHOP SECURED!** The corrupted maintenance android has been neutralized and the plasma torch is now accessible!');
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

    } else if (action === 'move' && target.toLowerCase().includes('box')) {
      // Handle moving boxes in CARETAKER_HALLWAY_BLOCKED
      if (gameState.currentRoom === 'CARETAKER_HALLWAY_BLOCKED') {
        // Remove the blocked_by_boxes property by updating the room data
        messages.push(`📦 obot-3 pushes aside the stacked boxes and furniture, clearing a path to the caretaker's apartment.`);
        messages.push(`✅ **Path cleared!** You can now move south to the caretaker's private hallway.`);
        
        // This would require a database update to permanently clear the blockage
        // For now, we'll give feedback that the boxes are moved
        return {
          content: [{ type: 'text', text: messages.join('\n') }],
        };
      } else {
        messages.push(`There are no boxes to move in this location.`);
      }

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
        // Check for special room features
        if (target.toLowerCase().includes('box') && gameState.currentRoom === 'CARETAKER_HALLWAY_BLOCKED') {
          messages.push(`🔍 **Stacked Boxes and Furniture**\nThe entrance to the caretaker's apartment is blocked by hastily stacked boxes and furniture. They appear moveable with some effort. Use 'interact boxes move' to clear them.`);
        } else {
          messages.push(`Cannot examine "${target}" - not found in this location.`);
        }
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
        // Process items based on type - add directly to bunker resources or storage
        let bunkerType = 'material';
        let survivalValue = 0;
        let directResource = false;
        
        switch (item.type) {
          case 'food':
            // Add directly to bunker food reserves using specific food values
            const foodUnits = (item as any).foodValue || 0;
            if (foodUnits > 0) {
              await this.db.addBunkerResource('food', foodUnits);
              messages.push(`  ✅ ${item.name} → ${foodUnits} days of food added to life support`);
              directResource = true;
            }
            break;
          case 'energy':
            // Add directly to bunker energy reserves using specific energy values
            const energyUnits = (item as any).energyValue || 0;
            if (energyUnits > 0) {
              await this.db.addBunkerResource('energy', energyUnits);
              messages.push(`  ✅ ${item.name} → ${energyUnits} days of energy added to life support`);
              directResource = true;
            } else {
              // Not compatible with bunker systems (like heating oil)
              bunkerType = 'material';
              survivalValue = item.value;
              messages.push(`  📦 ${item.name} → stored (not compatible with fuel cell generator)`);
            }
            break;
          case 'water':
            // Add directly to bunker water reserves using specific water values
            const waterUnits = (item as any).waterValue || 0;
            if (waterUnits > 0) {
              await this.db.addBunkerResource('water', waterUnits);
              messages.push(`  ✅ ${item.name} → ${waterUnits} days of water added to life support`);
              directResource = true;
            }
            break;
          case 'raw_water':
            // Raw water needs purification - store for later processing
            bunkerType = 'material';
            survivalValue = 0;
            messages.push(`  ⚠️  ${item.name} → stored (requires purification tablets before use)`);
            break;
          case 'water_purifier':
            // Water purification supplies
            bunkerType = 'material'; 
            survivalValue = 0;
            messages.push(`  🧪 ${item.name} → stored (can purify contaminated water)`);
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

        // Only add to storage inventory if not processed as direct resource
        if (!directResource) {
          await this.db.addToBunkerInventory(
            item.id,
            item.name,
            1,
            bunkerType,
            item.description,
            survivalValue || undefined
          );
          messages.push(`  ✅ ${item.name} → Bunker ${bunkerType} storage`);
        }

        // Remove from robot inventory
        await this.db.runAsync('DELETE FROM items WHERE id = ?', [item.id]);
        transferredItems++;
      }
    }

    // Reset robot position to starting area  
    await this.db.updateGameState({ 
      currentRoom: 'B01',
      carryingWeight: 0,
      turnNumber: gameState.turnNumber + 5 // Return trip takes time
    });

    const newResources = await this.db.getBunkerResources();
    
    messages.push(`\n🤖 I have returned safely to the bunker and delivered all supplies.`);
    messages.push(`⏰ **Time Advanced:** Now Day ${newResources.daysSinceIncident} After the Incident`);
    messages.push(`📊 **Life Support Status:** Food: ${newResources.food}d | Water: ${newResources.water}d | Energy: ${newResources.energy}d`);
    
    const minSurvival = Math.min(newResources.food, newResources.water, newResources.energy);
    if (minSurvival <= 2) {
      messages.push(`🚨 **WARNING:** Critical resources running low! Only ${minSurvival} days remaining.`);
    }
    
    messages.push(`\nCommander, use 'bunker_status' for detailed supplies or 'start_mission' to deploy me again.`);

    return {
      content: [{ type: 'text', text: messages.join('\n') }],
    };
  }

  private async handleBunkerStatus() {
    const bunkerInventory = await this.db.getBunkerInventory();
    const bunkerResources = await this.db.getBunkerResources();
    
    let response = `🏠 **BUNKER STATUS REPORT**\n\n`;
    
    // Core resource status
    response += `📅 **Day ${bunkerResources.daysSinceIncident} After the Incident**\n\n`;
    response += `**CRITICAL LIFE SUPPORT RESOURCES:**\n`;
    response += `🍞 Food: ${bunkerResources.food} days remaining\n`;
    response += `💧 Water: ${bunkerResources.water} days remaining\n`;
    response += `⚡ Energy: ${bunkerResources.energy} days remaining\n\n`;
    
    // Calculate minimum survival time from critical resources
    const minSurvival = Math.min(bunkerResources.food, bunkerResources.water, bunkerResources.energy);
    if (minSurvival <= 0) {
      response += `🚨 **CRITICAL FAILURE:** Life support systems offline! You must find resources immediately!\n\n`;
    } else if (minSurvival <= 2) {
      response += `🚨 **CRITICAL:** Only ${minSurvival} days of life support remaining!\n\n`;
    } else if (minSurvival <= 5) {
      response += `⚠️  **WARNING:** Only ${minSurvival} days until resource depletion.\n\n`;
    } else {
      response += `✅ **STATUS:** ${minSurvival} days of life support available.\n\n`;
    }

    // Calculate additional survival time from stored supplies
    let totalSurvivalDays = 0;
    const foodItems = bunkerInventory.filter(item => item.type === 'food');
    foodItems.forEach(item => {
      if (item.survivalDays) {
        totalSurvivalDays += item.survivalDays * item.quantity;
      }
    });

    if (totalSurvivalDays > 0) {
      response += `📦 **Additional Supplies:** ${totalSurvivalDays} days of stored food\n\n`;
    }

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

  private async checkRoomDetection(mobs: any[]) {
    // Roll detection for each mob - if any detect, all join combat
    let detected = false;
    let detectedBy = [];
    
    for (const mob of mobs) {
      const detectRoll = Math.random();
      if (detectRoll < (mob.detectChance || 0.5)) {
        detected = true;
        detectedBy.push(mob.name);
      }
    }
    
    if (!detected) {
      return { detected: false };
    }
    
    // Set combat state when enemies detect the player
    await this.db.updateGameState({ inCombat: true });
    
    // Create combat response for group encounter
    const enemyNames = mobs.map(mob => mob.name).join(', ');
    const detectedNames = detectedBy.join(' and ');
    
    const currentEnergy = await this.getCurrentEnergy();
    const combatResponse = {
      content: [{ 
        type: 'text', 
        text: `⚠️ **COMBAT INITIATED!**\n\n🚨 ${detectedNames} spotted you entering the area!\n\n**HOSTILE ALERT**: All enemies in the room are now engaged:\n• ${enemyNames}\n\n🤖 obot-3 is now in combat with ${mobs.length > 1 ? 'multiple hostiles' : 'a hostile'}. Use combat commands to defend yourself or attempt to retreat.\n\n**Energy Status**: ${currentEnergy}/100 - Combat actions cost energy!` 
      }],
    };
    
    return { detected: true, combatResponse };
  }

  private async getCurrentEnergy(): Promise<number> {
    const gameState = await this.db.getGameState();
    return gameState?.energy || 0;
  }

  private async handleEnergyDepleted(gameState: any) {
    // If energy is at 0 or below, trigger hibernation
    if (gameState.energy <= 0) {
      return await this.triggerHibernation();
    }
    
    // Low energy warning
    return {
      content: [{ 
        type: 'text', 
        text: `⚠️  **ENERGY CRITICAL** - Current Energy: ${gameState.energy}/100\n\n🤖 Commander, my power reserves are critically low. I cannot perform this action.\n\n**OPTIONS:**\n- Return to bunker for recharge (cost: varies by distance)\n- Wait for emergency hibernation if energy reaches 0\n\n**WARNING**: If I run out of energy in the field, I'll hibernate for 2 days (consuming 2 days of bunker resources) and only recover to 40 energy.` 
      }],
    };
  }

  private async triggerHibernation() {
    // Force hibernation - 2 day advancement, 40 energy recovery
    await this.db.advanceDay(2); // Consumes bunker resources for 2 days
    await this.db.updateGameState({ energy: 40 });
    
    const bunkerResources = await this.db.getBunkerResources();
    
    return {
      content: [{ 
        type: 'text', 
        text: `💤 **EMERGENCY HIBERNATION ACTIVATED**\n\n🤖 Commander, my energy reserves were completely depleted. I've entered emergency hibernation mode.\n\n**HIBERNATION REPORT:**\n- Duration: 2 days\n- Energy recovered: 40/100 (emergency power only)\n- Bunker resources consumed during hibernation:\n  • Food: 2 days (${bunkerResources.food} remaining)\n  • Water: 2 days (${bunkerResources.water} remaining)  \n  • Energy: 2 days (${bunkerResources.energy} remaining)\n\n⚠️  **ADVISORY**: Emergency hibernation is costly. Plan your energy usage more carefully to avoid future hibernations.\n\nI now have enough power to return to base for full recharging.` 
      }],
    };
  }

  private async handleRestAndRecharge() {
    const gameState = await this.db.getGameState();
    if (!gameState) throw new Error('Game not initialized');

    // Check if we're at the bunker (BUNKER or B01)
    if (gameState.currentRoom !== 'BUNKER' && gameState.currentRoom !== 'B01') {
      return {
        content: [{ 
          type: 'text', 
          text: `🚫 **Cannot rest here** - I can only rest and recharge at the bunker.\n\nCurrent location: ${gameState.currentRoom}\nI need to return to bunker (BUNKER or B01) to safely recharge overnight.` 
        }],
      };
    }

    // Check if already at full energy
    if (gameState.energy >= 100) {
      return {
        content: [{ 
          type: 'text', 
          text: `🔋 **Energy Already Full** - Current Energy: ${gameState.energy}/100\n\nCommander, my power reserves are already at maximum capacity. No recharging needed at this time.` 
        }],
      };
    }

    // Advance 1 day and fully recharge
    await this.db.advanceDay(1);
    await this.db.updateGameState({ energy: 100 });
    
    const bunkerResources = await this.db.getBunkerResources();
    
    // Check for critical resource warnings
    const minResource = Math.min(bunkerResources.food, bunkerResources.water, bunkerResources.energy);
    let warningMessage = '';
    
    if (minResource <= 2) {
      warningMessage = `\n🚨 **CRITICAL WARNING**: Bunker life support critically low! Only ${minResource} days remaining before system failure.`;
    } else if (minResource <= 5) {
      warningMessage = `\n⚠️  **WARNING**: Bunker resources running low. Consider prioritizing supply collection.`;
    }
    
    return {
      content: [{ 
        type: 'text', 
        text: `🛌 **OVERNIGHT RECHARGE COMPLETE**\n\n🤖 Commander, I have rested overnight and my systems are fully restored.\n\n**RECHARGE REPORT:**\n- Energy: ${gameState.energy} → 100/100 (fully recharged)\n- Time advanced: 1 day\n- Days since incident: ${bunkerResources.daysSinceIncident}\n\n**BUNKER LIFE SUPPORT STATUS:**\n- Food: ${bunkerResources.food} days remaining\n- Water: ${bunkerResources.water} days remaining\n- Energy: ${bunkerResources.energy} days remaining${warningMessage}\n\nI am now ready for another day of exploration, Commander.` 
      }],
    };
  }

  private async handlePurifyWater() {
    const bunkerInventory = await this.db.getBunkerInventory();
    
    // Find raw water and purification tablets
    const rawWaterItems = bunkerInventory.filter(item => 
      item.id?.includes('raw_water') || item.type === 'material' && item.name?.toLowerCase().includes('stagnant water')
    );
    
    const purifierItems = bunkerInventory.filter(item => 
      item.id?.includes('water_purifier') || item.name?.toLowerCase().includes('purification tablets')
    );

    if (rawWaterItems.length === 0) {
      return {
        content: [{ 
          type: 'text', 
          text: `🚫 **No raw water available for purification**\n\nCommander, I don't detect any contaminated water in bunker storage that needs purification. You'll need to collect some raw water first.` 
        }],
      };
    }

    if (purifierItems.length === 0) {
      return {
        content: [{ 
          type: 'text', 
          text: `🚫 **No purification tablets available**\n\nCommander, I don't have any water purification tablets in bunker storage. You'll need to find some purification supplies first.` 
        }],
      };
    }

    // Get the first raw water and purifier items
    const rawWater = rawWaterItems[0];
    const purifier = purifierItems[0];

    // Check if we have enough uses on the purifier
    if (purifier.quantity <= 0) {
      return {
        content: [{ 
          type: 'text', 
          text: `🚫 **Purification tablets exhausted**\n\nCommander, the ${purifier.name} has no uses remaining. You'll need to find more purification supplies.` 
        }],
      };
    }

    // Calculate water yield - assume raw water gives 6 days when purified
    const waterDays = 6; // Default value for raw water
    
    // Process the purification
    await this.db.addBunkerResource('water', waterDays);
    await this.db.removeBunkerItem(rawWater.id!, 1); // Remove 1 raw water
    await this.db.removeBunkerItem(purifier.id!, 1); // Use 1 purification tablet

    return {
      content: [{ 
        type: 'text', 
        text: `💧 **Water Purification Complete**\n\n✅ Used 1 ${purifier.name} to purify ${rawWater.name}\n\n🚰 **Result:** +${waterDays} days of clean drinking water added to life support\n\n📊 **Resources Used:**\n  • ${rawWater.name}: 1 unit (${rawWater.quantity - 1} remaining)\n  • ${purifier.name}: 1 tablet (${purifier.quantity - 1} remaining)\n\nCommander, the water has been successfully purified and added to your bunker's life support system.` 
      }],
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
    await this.db.discoverRoom('STORAGE_15');
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