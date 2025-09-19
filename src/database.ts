import initSqlJs from 'sql.js';
import * as fs from 'fs';
import * as path from 'path';

export interface GameState {
  id: number;
  currentRoom: string;
  health: number;
  energy: number;
  maxEnergy: number;
  carryingWeight: number;
  turnNumber: number;
  gameCompleted: boolean;
  missionStarted: boolean;
  daysSinceIncident: number;
  bunkerFood: number;
  bunkerWater: number;
  bunkerEnergy: number;
  inCombat: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  discovered: boolean;
  exits: string; // JSON string of exits
  cleared: boolean;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  weight: number;
  type: string;
  value: number;
  energyCost: number;
  location: string;
}

export interface Mob {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  damage: string;
  damageType: string;
  location: string;
  isAlive: boolean;
  specialAbility: string;
  detectChance: number;
  combatStyle: string;
}

export interface CombatEffect {
  id: string;
  effectType: string;
  description: string;
  duration: number;
  value: number;
  createdAt: string;
}

export interface BunkerInventory {
  id: string;
  name: string;
  quantity: number;
  type: string; // 'food', 'fuel', 'medicine', 'technology', 'defense'
  description: string;
  survivalDays?: number;
}

export class Database {
  private db: any;
  private dbPath: string;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'game.db');
  }

  async initialize(): Promise<void> {
    const SQL = await initSqlJs();
    
    let buffer: Uint8Array | undefined;
    if (fs.existsSync(this.dbPath)) {
      buffer = fs.readFileSync(this.dbPath);
    }
    
    this.db = new SQL.Database(buffer);

    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS game_state (
        id INTEGER PRIMARY KEY,
        currentRoom TEXT NOT NULL,
        health INTEGER NOT NULL DEFAULT 100,
        energy INTEGER NOT NULL DEFAULT 100,
        maxEnergy INTEGER NOT NULL DEFAULT 100,
        carryingWeight REAL NOT NULL DEFAULT 0,
        turnNumber INTEGER NOT NULL DEFAULT 1,
        gameCompleted BOOLEAN NOT NULL DEFAULT FALSE,
        missionStarted BOOLEAN NOT NULL DEFAULT FALSE,
        daysSinceIncident INTEGER NOT NULL DEFAULT 12,
        bunkerFood INTEGER NOT NULL DEFAULT 7,
        bunkerWater INTEGER NOT NULL DEFAULT 10,
        bunkerEnergy INTEGER NOT NULL DEFAULT 15,
        inCombat BOOLEAN NOT NULL DEFAULT FALSE,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        discovered BOOLEAN NOT NULL DEFAULT FALSE,
        exits TEXT NOT NULL,
        cleared BOOLEAN NOT NULL DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        weight REAL NOT NULL,
        type TEXT NOT NULL,
        value INTEGER NOT NULL DEFAULT 0,
        energyCost INTEGER NOT NULL DEFAULT 0,
        location TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS mobs (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        health INTEGER NOT NULL,
        maxHealth INTEGER NOT NULL,
        damage TEXT NOT NULL,
        damageType TEXT NOT NULL,
        location TEXT NOT NULL,
        isAlive BOOLEAN NOT NULL DEFAULT TRUE,
        specialAbility TEXT
      );

      CREATE TABLE IF NOT EXISTS combat_effects (
        id TEXT PRIMARY KEY,
        effectType TEXT NOT NULL,
        description TEXT NOT NULL,
        duration INTEGER NOT NULL,
        value INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS bunker_inventory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        survivalDays INTEGER
      );
    `);

    // Initialize default game state if it doesn't exist
    const stmt = this.db.prepare('SELECT * FROM game_state WHERE id = 1');
    const existingState = stmt.step() ? stmt.getAsObject() : null;
    if (!existingState) {
      this.db.run(`
        INSERT INTO game_state (id, currentRoom, health, energy, maxEnergy, carryingWeight, turnNumber, gameCompleted, missionStarted, daysSinceIncident, bunkerFood, bunkerWater, bunkerEnergy) 
        VALUES (1, 'STORAGE_15', 100, 100, 100, 0, 1, 0, 0, 12, 7, 10, 15)
      `);
    }
    stmt.free();

    this.saveDatabase();
  }

  private saveDatabase(): void {
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, data);
  }

  async initializeBunkerSupplies(): Promise<void> {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM bunker_inventory');
    const count = stmt.step() ? stmt.get()[0] : 0;
    stmt.free();
    
    if (count === 0) {
      const supplies = [
        ['emergency_rations', 'Emergency Rations', 3, 'food', 'Military-grade survival food packets', 2],
        ['water_purification', 'Water Purification Tablets', 10, 'medicine', 'Chemical tablets for water sterilization', null],
        ['backup_generator', 'Backup Generator', 1, 'fuel', 'Emergency power supply for critical systems', null]
      ];

      for (const supply of supplies) {
        this.db.run(`
          INSERT INTO bunker_inventory (id, name, quantity, type, description, survivalDays)
          VALUES (?, ?, ?, ?, ?, ?)
        `, supply);
      }
      
      this.saveDatabase();
    }
  }

  async getGameState(): Promise<GameState | null> {
    const stmt = this.db.prepare('SELECT * FROM game_state WHERE id = 1');
    const result = stmt.step() ? stmt.getAsObject() as GameState : null;
    stmt.free();
    return result;
  }

  async updateGameState(updates: Partial<GameState>): Promise<void> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    this.db.run(`
      UPDATE game_state 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = 1
    `, values);
    
    this.saveDatabase();
  }

  async getRoom(id: string): Promise<Room | null> {
    const stmt = this.db.prepare('SELECT * FROM rooms WHERE id = ?');
    stmt.bind([id]);
    const result = stmt.step() ? stmt.getAsObject() as Room : null;
    stmt.free();
    return result;
  }

  async discoverRoom(id: string): Promise<void> {
    this.db.run('UPDATE rooms SET discovered = 1 WHERE id = ?', [id]);
    this.saveDatabase();
  }

  async clearRoom(id: string): Promise<void> {
    this.db.run('DELETE FROM mobs WHERE location = ?', [id]);
    this.db.run('UPDATE rooms SET cleared = 1 WHERE id = ?', [id]);
    this.saveDatabase();
  }

  async updateRoomExits(roomId: string, exits: string): Promise<void> {
    this.db.run('UPDATE rooms SET exits = ? WHERE id = ?', [exits, roomId]);
    this.saveDatabase();
  }

  async getItemsInLocation(location: string): Promise<Item[]> {
    const stmt = this.db.prepare('SELECT * FROM items WHERE location = ?');
    const results: Item[] = [];
    stmt.bind([location]);
    while (stmt.step()) {
      results.push(stmt.getAsObject() as Item);
    }
    stmt.free();
    return results;
  }

  async moveItem(itemId: string, newLocation: string): Promise<void> {
    this.db.run('UPDATE items SET location = ? WHERE id = ?', [newLocation, itemId]);
    this.saveDatabase();
  }

  async getMobsInLocation(location: string): Promise<Mob[]> {
    const stmt = this.db.prepare('SELECT * FROM mobs WHERE location = ? AND isAlive = 1');
    const results: Mob[] = [];
    stmt.bind([location]);
    while (stmt.step()) {
      results.push(stmt.getAsObject() as Mob);
    }
    stmt.free();
    return results;
  }

  async updateMobHealth(mobId: string, newHealth: number): Promise<void> {
    if (newHealth <= 0) {
      this.db.run('UPDATE mobs SET health = 0, isAlive = 0 WHERE id = ?', [mobId]);
    } else {
      this.db.run('UPDATE mobs SET health = ? WHERE id = ?', [newHealth, mobId]);
    }
    this.saveDatabase();
  }

  async getMob(mobId: string): Promise<Mob | null> {
    const stmt = this.db.prepare('SELECT * FROM mobs WHERE id = ?');
    stmt.bind([mobId]);
    const result = stmt.step() ? stmt.getAsObject() as Mob : null;
    stmt.free();
    return result;
  }

  async addCombatEffect(id: string, effectType: string, description: string, duration: number, value: number = 0): Promise<void> {
    this.db.run(`
      INSERT INTO combat_effects (id, effectType, description, duration, value) 
      VALUES (?, ?, ?, ?, ?)
    `, [id, effectType, description, duration, value]);
    this.saveDatabase();
  }

  async getCombatEffects(): Promise<CombatEffect[]> {
    const stmt = this.db.prepare('SELECT * FROM combat_effects WHERE duration > 0');
    const results: CombatEffect[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as CombatEffect);
    }
    stmt.free();
    return results;
  }

  async updateCombatEffectDuration(id: string, newDuration: number): Promise<void> {
    if (newDuration <= 0) {
      this.db.run('DELETE FROM combat_effects WHERE id = ?', [id]);
    } else {
      this.db.run('UPDATE combat_effects SET duration = ? WHERE id = ?', [newDuration, id]);
    }
    this.saveDatabase();
  }

  async getBunkerInventory(): Promise<BunkerInventory[]> {
    const stmt = this.db.prepare('SELECT * FROM bunker_inventory ORDER BY type, name');
    const results: BunkerInventory[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject() as BunkerInventory);
    }
    stmt.free();
    return results;
  }

  async addToBunkerInventory(id: string, name: string, quantity: number, type: string, description: string, survivalDays?: number): Promise<void> {
    const stmt = this.db.prepare('SELECT * FROM bunker_inventory WHERE name = ?');
    stmt.bind([name]);
    const existing = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();
    
    if (existing) {
      this.db.run('UPDATE bunker_inventory SET quantity = quantity + ? WHERE name = ?', [quantity, name]);
    } else {
      this.db.run(`
        INSERT INTO bunker_inventory (id, name, quantity, type, description, survivalDays)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [id, name, quantity, type, description, survivalDays === undefined ? null : survivalDays]);
    }
    this.saveDatabase();
  }

  async removeBunkerItem(itemId: string, quantity: number = 1): Promise<boolean> {
    const stmt = this.db.prepare('SELECT * FROM bunker_inventory WHERE id = ?');
    stmt.bind([itemId]);
    const existing = stmt.step() ? stmt.getAsObject() as BunkerInventory : null;
    stmt.free();
    
    if (!existing || existing.quantity < quantity) {
      return false; // Not enough items available
    }
    
    if (existing.quantity === quantity) {
      // Remove the item entirely if we're taking all of them
      this.db.run('DELETE FROM bunker_inventory WHERE id = ?', [itemId]);
    } else {
      // Just reduce the quantity
      this.db.run('UPDATE bunker_inventory SET quantity = quantity - ? WHERE id = ?', [quantity, itemId]);
    }
    
    this.saveDatabase();
    return true;
  }

  // Helper method for compatibility with existing code
  async runAsync(sql: string, params: any[] = []): Promise<any> {
    try {
      this.db.run(sql, params);
      this.saveDatabase();
      return { changes: 1 }; // Simplified return for compatibility
    } catch (error) {
      throw error;
    }
  }

  // Bunker resource management methods
  async advanceDay(daysToAdvance: number = 1): Promise<void> {
    const gameState = await this.getGameState();
    if (!gameState) throw new Error('Game state not found');

    const newDay = gameState.daysSinceIncident + daysToAdvance;
    const newFood = Math.max(0, gameState.bunkerFood - daysToAdvance);
    const newWater = Math.max(0, gameState.bunkerWater - daysToAdvance);
    const newEnergy = Math.max(0, gameState.bunkerEnergy - daysToAdvance);

    await this.updateGameState({
      daysSinceIncident: newDay,
      bunkerFood: newFood,
      bunkerWater: newWater,
      bunkerEnergy: newEnergy
    });
  }

  async addBunkerResource(resource: 'food' | 'water' | 'energy', amount: number): Promise<void> {
    const field = `bunker${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
    const gameState = await this.getGameState();
    if (!gameState) throw new Error('Game state not found');
    
    const currentValue = gameState[field as keyof GameState] as number;
    await this.updateGameState({
      [field]: currentValue + amount
    });
  }

  async getBunkerResources(): Promise<{food: number, water: number, energy: number, daysSinceIncident: number}> {
    const gameState = await this.getGameState();
    if (!gameState) throw new Error('Game state not found');
    
    return {
      food: gameState.bunkerFood,
      water: gameState.bunkerWater,
      energy: gameState.bunkerEnergy,
      daysSinceIncident: gameState.daysSinceIncident
    };
  }
}