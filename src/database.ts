import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';

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
  type: string; // 'food', 'medicine', 'tool', 'weapon', 'energy', 'material'
  value: number; // healing/energy/damage value
  energyCost: number; // energy cost to use
  location: string; // room_id or 'inventory' or 'dropped'
}

export interface Mob {
  id: string;
  name: string;
  description: string;
  health: number;
  maxHealth: number;
  damage: string; // dice notation like "1d6+2"
  damageType: string;
  location: string; // room_id
  isAlive: boolean;
  specialAbility?: string;
}

export interface CombatEffect {
  id: string;
  type: string; // 'acid_burn', 'electrical_glitch', 'attached'
  duration: number;
  damage: number;
  description: string;
}

export interface BunkerInventory {
  id: string;
  name: string;
  quantity: number;
  type: string; // 'food', 'fuel', 'medicine', 'technology', 'defense'
  description: string;
  survivalDays?: number; // How many days this extends survival
}

export class Database {
  private db: sqlite3.Database;
  public runAsync: (sql: string, params?: any[]) => Promise<any>;
  private getAsync: (sql: string, params?: any[]) => Promise<any>;
  public allAsync: (sql: string, params?: any[]) => Promise<any[]>;

  constructor(filename: string = 'obot3.db') {
    this.db = new sqlite3.Database(filename);
    
    // Manually create promisified versions to avoid binding issues
    this.runAsync = (sql: string, params?: any[]) => {
      return new Promise((resolve, reject) => {
        this.db.run(sql, params || [], function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    };

    this.getAsync = (sql: string, params?: any[]) => {
      return new Promise((resolve, reject) => {
        this.db.get(sql, params || [], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    };

    this.allAsync = (sql: string, params?: any[]) => {
      return new Promise((resolve, reject) => {
        this.db.all(sql, params || [], (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    };
  }

  async initialize(): Promise<void> {
    await this.runAsync(`
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
        createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS rooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        discovered BOOLEAN NOT NULL DEFAULT FALSE,
        exits TEXT NOT NULL DEFAULT '{}',
        cleared BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);

    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        weight REAL NOT NULL DEFAULT 0,
        type TEXT NOT NULL,
        value INTEGER NOT NULL DEFAULT 0,
        energyCost INTEGER NOT NULL DEFAULT 0,
        location TEXT NOT NULL
      )
    `);

    await this.runAsync(`
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
      )
    `);

    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS combat_effects (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        duration INTEGER NOT NULL,
        damage INTEGER NOT NULL,
        description TEXT NOT NULL
      )
    `);

    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS bunker_inventory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        survivalDays INTEGER DEFAULT NULL
      )
    `);

    // Initialize default game state if none exists
    const gameState = await this.getGameState();
    if (!gameState) {
      await this.createNewGame();
    }
  }

  async createNewGame(): Promise<void> {
    // Clear existing game
    await this.runAsync('DELETE FROM game_state');
    await this.runAsync('DELETE FROM combat_effects');
    
    // Reset all rooms and items
    await this.runAsync('UPDATE rooms SET discovered = FALSE, cleared = FALSE');
    await this.runAsync('UPDATE items SET location = (SELECT location FROM items WHERE id = items.id LIMIT 1)'); // Reset to original locations
    await this.runAsync('UPDATE mobs SET health = maxHealth, isAlive = TRUE');

    // Create new game state
    await this.runAsync(`
      INSERT INTO game_state (id, currentRoom) 
      VALUES (1, 'B01')
    `);
  }

  async getGameState(): Promise<GameState | null> {
    return await this.getAsync('SELECT * FROM game_state WHERE id = 1');
  }

  async updateGameState(updates: Partial<GameState>): Promise<void> {
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates);
    
    await this.runAsync(`
      UPDATE game_state 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = 1
    `, values);
  }

  async getRoom(id: string): Promise<Room | null> {
    return await this.getAsync('SELECT * FROM rooms WHERE id = ?', [id]);
  }

  async discoverRoom(id: string): Promise<void> {
    await this.runAsync('UPDATE rooms SET discovered = TRUE WHERE id = ?', [id]);
  }

  async clearRoom(id: string): Promise<void> {
    await this.runAsync('UPDATE rooms SET cleared = TRUE WHERE id = ?', [id]);
  }

  async updateRoomExits(id: string, exits: string): Promise<void> {
    await this.runAsync('UPDATE rooms SET exits = ? WHERE id = ?', [exits, id]);
  }

  async getItemsInLocation(location: string): Promise<Item[]> {
    return await this.allAsync('SELECT * FROM items WHERE location = ?', [location]);
  }

  async moveItem(itemId: string, newLocation: string): Promise<void> {
    await this.runAsync('UPDATE items SET location = ? WHERE id = ?', [newLocation, itemId]);
  }

  async getMobsInLocation(location: string): Promise<Mob[]> {
    return await this.allAsync('SELECT * FROM mobs WHERE location = ? AND isAlive = TRUE', [location]);
  }

  async updateMobHealth(mobId: string, health: number): Promise<void> {
    const isAlive = health > 0;
    await this.runAsync(
      'UPDATE mobs SET health = ?, isAlive = ? WHERE id = ?',
      [health, isAlive, mobId]
    );
  }

  async addCombatEffect(effect: CombatEffect): Promise<void> {
    await this.runAsync(`
      INSERT INTO combat_effects (id, type, duration, damage, description)
      VALUES (?, ?, ?, ?, ?)
    `, [effect.id, effect.type, effect.duration, effect.damage, effect.description]);
  }

  async getCombatEffects(): Promise<CombatEffect[]> {
    return await this.allAsync('SELECT * FROM combat_effects WHERE duration > 0');
  }

  async updateCombatEffect(id: string, duration: number): Promise<void> {
    if (duration <= 0) {
      await this.runAsync('DELETE FROM combat_effects WHERE id = ?', [id]);
    } else {
      await this.runAsync('UPDATE combat_effects SET duration = ? WHERE id = ?', [duration, id]);
    }
  }

  async getBunkerInventory(): Promise<BunkerInventory[]> {
    return await this.allAsync('SELECT * FROM bunker_inventory ORDER BY type, name');
  }

  async addToBunkerInventory(itemId: string, name: string, quantity: number, type: string, description: string, survivalDays?: number): Promise<void> {
    await this.runAsync(`
      INSERT OR REPLACE INTO bunker_inventory (id, name, quantity, type, description, survivalDays)
      VALUES (?, ?, 
        COALESCE((SELECT quantity FROM bunker_inventory WHERE id = ?), 0) + ?, 
        ?, ?, ?)
    `, [itemId, name, itemId, quantity, type, description, survivalDays || null]);
  }

  async initializeBunkerSupplies(): Promise<void> {
    const existing = await this.allAsync('SELECT COUNT(*) as count FROM bunker_inventory');
    if (existing[0].count === 0) {
      // Initialize starting bunker supplies
      await this.addToBunkerInventory('emergency_rations', 'Emergency Rations', 12, 'food', 'Basic survival food supply', 3);
      await this.addToBunkerInventory('water_reserves', 'Water Reserves', 30, 'food', 'Clean water supply (days)', 10); 
      await this.addToBunkerInventory('backup_generator_fuel', 'Generator Fuel', 5, 'fuel', 'Diesel fuel for emergency generator');
      await this.addToBunkerInventory('medical_supplies', 'Medical Kit', 2, 'medicine', 'Basic medical supplies for treating injuries');
      await this.addToBunkerInventory('air_filters', 'Air Filtration Filters', 4, 'defense', 'HEPA filters for bunker air system');
    }
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}