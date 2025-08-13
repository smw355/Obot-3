import { Database, GameState, Item, Mob, CombatEffect } from './database.js';

export class GameEngine {
  private db: Database;
  
  constructor(db: Database) {
    this.db = db;
  }

  // Dice rolling utility
  rollDice(diceNotation: string): number {
    const match = diceNotation.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    if (!match) return 0;
    
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
  async calculateCarryingWeight(): Promise<number> {
    const items = await this.db.getItemsInLocation('inventory');
    return items.reduce((total, item) => total + item.weight, 0);
  }

  async checkWeightLimits(gameState: GameState): Promise<string[]> {
    const weight = await this.calculateCarryingWeight();
    const messages: string[] = [];
    
    if (weight >= 30) {
      messages.push("🚨 CRITICAL: obot-3 becomes unstable and drops all items!");
      // Drop all items
      const items = await this.db.getItemsInLocation('inventory');
      for (const item of items) {
        await this.db.moveItem(item.id, gameState.currentRoom);
      }
      await this.db.updateGameState({ carryingWeight: 0 });
    } else if (weight >= 25) {
      // 50% chance to drop random item
      if (Math.random() < 0.5) {
        const items = await this.db.getItemsInLocation('inventory');
        if (items.length > 0) {
          const randomItem = items[Math.floor(Math.random() * items.length)];
          await this.db.moveItem(randomItem.id, gameState.currentRoom);
          messages.push(`⚠️  obot-3 struggles with the weight and drops ${randomItem.name}`);
        }
      }
    } else if (weight >= 20) {
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
  async processCombat(mobId: string, gameState: GameState): Promise<string[]> {
    const mob = await this.db.allAsync('SELECT * FROM mobs WHERE id = ? AND isAlive = TRUE', [mobId]);
    if (mob.length === 0) {
      return ["The threat has already been neutralized."];
    }

    const mobData = mob[0] as Mob;
    const messages: string[] = [];

    // Mob attacks obot-3
    const damage = this.rollDice(mobData.damage);
    const newHealth = Math.max(0, gameState.health - damage);
    
    messages.push(`${mobData.name} attacks obot-3 for ${damage} ${mobData.damageType} damage!`);

    // Apply special abilities
    if (mobData.specialAbility) {
      const effectMessage = await this.applySpecialAbility(mobData, gameState);
      if (effectMessage) messages.push(effectMessage);
    }

    await this.db.updateGameState({ health: newHealth });

    // Check if obot-3 is critically damaged
    if (newHealth <= 20) {
      messages.push("🔋 WARNING: obot-3 is critically damaged and attempting to flee!");
      // 75% chance to successfully flee
      if (Math.random() < 0.75) {
        await this.attemptFlee(gameState);
        messages.push("obot-3 successfully retreats to a safer location.");
      } else {
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

  private async applySpecialAbility(mob: Mob, gameState: GameState): Promise<string | null> {
    switch (mob.specialAbility) {
      case 'acid_burn':
        const burnEffect: CombatEffect = {
          id: `acid_burn_${Date.now()}`,
          type: 'acid_burn',
          duration: 3,
          damage: 1,
          description: 'Corrosive acid continues eating through obot-3\'s plating'
        };
        await this.db.addCombatEffect(burnEffect);
        return "🧪 Acid splashes across obot-3's chassis - ongoing corrosion detected!";
      
      case 'electrical_glitch':
        if (Math.random() < 0.25) {
          // Disable random tool for 2 turns - would need tool tracking
          return "⚡ Electrical surge causes system glitches - some tools temporarily offline!";
        }
        break;
      
      case 'attach_corrode':
        const attachEffect: CombatEffect = {
          id: `attached_${Date.now()}`,
          type: 'attached',
          duration: -1, // Must be manually removed
          damage: 1,
          description: 'Metallivorous bacteria attached to obot-3\'s frame'
        };
        await this.db.addCombatEffect(attachEffect);
        return "🦠 Bacteria swarm attaches to obot-3 - continuous metal corrosion detected!";
    }
    return null;
  }

  private async attemptFlee(gameState: GameState): Promise<void> {
    // Try to move to a random connected room
    const room = await this.db.getRoom(gameState.currentRoom);
    if (room?.exits) {
      const exits = JSON.parse(room.exits);
      const exitKeys = Object.keys(exits);
      if (exitKeys.length > 0) {
        const randomExit = exitKeys[Math.floor(Math.random() * exitKeys.length)];
        const newRoom = exits[randomExit];
        await this.db.updateGameState({ currentRoom: newRoom });
      }
    }
  }

  private async enterMaintenanceMode(gameState: GameState): Promise<void> {
    // Reduce max energy by 10%
    const newMaxEnergy = Math.floor(gameState.maxEnergy * 0.9);
    
    // Repair to 25% health and return to base
    await this.db.updateGameState({
      health: 25,
      energy: Math.floor(newMaxEnergy * 0.5),
      maxEnergy: newMaxEnergy,
      currentRoom: 'B01' // Return to starting room
    });

    // Clear all combat effects
    const effects = await this.db.getCombatEffects();
    for (const effect of effects) {
      await this.db.updateCombatEffect(effect.id, 0);
    }
  }

  // Process ongoing combat effects
  async processCombatEffects(gameState: GameState): Promise<string[]> {
    const effects = await this.db.getCombatEffects();
    const messages: string[] = [];
    
    for (const effect of effects) {
      if (effect.duration > 0) {
        const newHealth = Math.max(0, gameState.health - effect.damage);
        await this.db.updateGameState({ health: newHealth });
        await this.db.updateCombatEffect(effect.id, effect.duration - 1);
        
        messages.push(`💢 ${effect.description} - obot-3 takes ${effect.damage} damage`);
        
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
  async useItem(itemId: string, gameState: GameState): Promise<string[]> {
    const items = await this.db.getItemsInLocation('inventory');
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      return ["Item not found in inventory."];
    }

    const messages: string[] = [];

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

  // Calculate robot's attack damage including weapon bonuses
  async calculateAttackDamage(): Promise<number> {
    const baseAttack = this.rollDice('1d6+2'); // Base robot attack
    
    // Check for equipped weapons
    const items = await this.db.getItemsInLocation('inventory');
    const weapon = items.find(item => item.type === 'weapon');
    
    if (weapon) {
      return baseAttack + weapon.value; // Add weapon bonus damage
    }
    
    return baseAttack;
  }
}