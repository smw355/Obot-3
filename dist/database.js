"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const sqlite3 = __importStar(require("sqlite3"));
class Database {
    db;
    runAsync;
    getAsync;
    allAsync;
    constructor(filename = 'obot3.db') {
        this.db = new sqlite3.Database(filename);
        // Manually create promisified versions to avoid binding issues
        this.runAsync = (sql, params) => {
            return new Promise((resolve, reject) => {
                this.db.run(sql, params || [], function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(this);
                });
            });
        };
        this.getAsync = (sql, params) => {
            return new Promise((resolve, reject) => {
                this.db.get(sql, params || [], (err, row) => {
                    if (err)
                        reject(err);
                    else
                        resolve(row);
                });
            });
        };
        this.allAsync = (sql, params) => {
            return new Promise((resolve, reject) => {
                this.db.all(sql, params || [], (err, rows) => {
                    if (err)
                        reject(err);
                    else
                        resolve(rows || []);
                });
            });
        };
    }
    async initialize() {
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
    async createNewGame() {
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
    async getGameState() {
        return await this.getAsync('SELECT * FROM game_state WHERE id = 1');
    }
    async updateGameState(updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        await this.runAsync(`
      UPDATE game_state 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = 1
    `, values);
    }
    async getRoom(id) {
        return await this.getAsync('SELECT * FROM rooms WHERE id = ?', [id]);
    }
    async discoverRoom(id) {
        await this.runAsync('UPDATE rooms SET discovered = TRUE WHERE id = ?', [id]);
    }
    async clearRoom(id) {
        await this.runAsync('UPDATE rooms SET cleared = TRUE WHERE id = ?', [id]);
    }
    async updateRoomExits(id, exits) {
        await this.runAsync('UPDATE rooms SET exits = ? WHERE id = ?', [exits, id]);
    }
    async getItemsInLocation(location) {
        return await this.allAsync('SELECT * FROM items WHERE location = ?', [location]);
    }
    async moveItem(itemId, newLocation) {
        await this.runAsync('UPDATE items SET location = ? WHERE id = ?', [newLocation, itemId]);
    }
    async getMobsInLocation(location) {
        return await this.allAsync('SELECT * FROM mobs WHERE location = ? AND isAlive = TRUE', [location]);
    }
    async updateMobHealth(mobId, health) {
        const isAlive = health > 0;
        await this.runAsync('UPDATE mobs SET health = ?, isAlive = ? WHERE id = ?', [health, isAlive, mobId]);
    }
    async addCombatEffect(effect) {
        await this.runAsync(`
      INSERT INTO combat_effects (id, type, duration, damage, description)
      VALUES (?, ?, ?, ?, ?)
    `, [effect.id, effect.type, effect.duration, effect.damage, effect.description]);
    }
    async getCombatEffects() {
        return await this.allAsync('SELECT * FROM combat_effects WHERE duration > 0');
    }
    async updateCombatEffect(id, duration) {
        if (duration <= 0) {
            await this.runAsync('DELETE FROM combat_effects WHERE id = ?', [id]);
        }
        else {
            await this.runAsync('UPDATE combat_effects SET duration = ? WHERE id = ?', [duration, id]);
        }
    }
    async getBunkerInventory() {
        return await this.allAsync('SELECT * FROM bunker_inventory ORDER BY type, name');
    }
    async addToBunkerInventory(itemId, name, quantity, type, description, survivalDays) {
        await this.runAsync(`
      INSERT OR REPLACE INTO bunker_inventory (id, name, quantity, type, description, survivalDays)
      VALUES (?, ?, 
        COALESCE((SELECT quantity FROM bunker_inventory WHERE id = ?), 0) + ?, 
        ?, ?, ?)
    `, [itemId, name, itemId, quantity, type, description, survivalDays || null]);
    }
    async initializeBunkerSupplies() {
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
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map