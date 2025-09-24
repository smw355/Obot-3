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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const sql_js_1 = __importDefault(require("sql.js"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class Database {
    db;
    dbPath;
    constructor() {
        this.dbPath = path.join(process.cwd(), 'game.db');
    }
    async initialize() {
        const SQL = await (0, sql_js_1.default)();
        let buffer;
        if (fs.existsSync(this.dbPath)) {
            buffer = fs.readFileSync(this.dbPath);
        }
        this.db = new SQL.Database(buffer);
        // Migrate existing databases to add new columns
        this.migrateDatabase();
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
        location TEXT NOT NULL,
        foodValue INTEGER DEFAULT 0,
        energyValue INTEGER DEFAULT 0,
        waterValue INTEGER DEFAULT 0
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

      CREATE TABLE IF NOT EXISTS discovered_content (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        discoveredAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        itemSource TEXT NOT NULL
      );
    `);
        // Initialize default game state if it doesn't exist - use INSERT OR IGNORE for atomicity
        this.db.run(`
      INSERT OR IGNORE INTO game_state (id, currentRoom, health, energy, maxEnergy, carryingWeight, turnNumber, gameCompleted, missionStarted, daysSinceIncident, bunkerFood, bunkerWater, bunkerEnergy)
      VALUES (1, 'STORAGE_15', 100, 150, 150, 0, 1, 0, 0, 12, 7, 10, 15)
    `);
        this.saveDatabase();
    }
    saveDatabase() {
        const data = this.db.export();
        fs.writeFileSync(this.dbPath, data);
    }
    migrateDatabase() {
        try {
            // Check if foodValue column exists in items table
            const stmt = this.db.prepare("PRAGMA table_info(items)");
            const columns = [];
            while (stmt.step()) {
                const row = stmt.getAsObject();
                columns.push(row.name);
            }
            stmt.free();
            // Add missing columns if they don't exist
            if (!columns.includes('foodValue')) {
                this.db.exec('ALTER TABLE items ADD COLUMN foodValue INTEGER DEFAULT 0');
            }
            if (!columns.includes('energyValue')) {
                this.db.exec('ALTER TABLE items ADD COLUMN energyValue INTEGER DEFAULT 0');
            }
            if (!columns.includes('waterValue')) {
                this.db.exec('ALTER TABLE items ADD COLUMN waterValue INTEGER DEFAULT 0');
            }
            // Update existing items with their proper values from world data
            this.updateExistingItemValues();
            this.saveDatabase();
        }
        catch (error) {
            // Migration failed, but continue - database might not exist yet
            console.log('Database migration skipped (new database)');
        }
    }
    updateExistingItemValues() {
        // Update specific items with their food/energy/water values
        const itemUpdates = [
            { id: 'bag_of_funyuns_001', foodValue: 4 },
            { id: 'organic_plant_food_001', foodValue: 2 },
            { id: 'caretaker_food_supply_001', foodValue: 8 }
        ];
        for (const update of itemUpdates) {
            this.db.run('UPDATE items SET foodValue = ? WHERE id = ?', [update.foodValue, update.id]);
        }
    }
    async initializeBunkerSupplies() {
        await this.withTransaction(() => {
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
            }
        });
    }
    async getGameState() {
        const stmt = this.db.prepare('SELECT * FROM game_state WHERE id = 1');
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return result;
    }
    async updateGameState(updates) {
        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        this.db.run(`
      UPDATE game_state 
      SET ${fields}, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = 1
    `, values);
        this.saveDatabase();
    }
    async getRoom(id) {
        const stmt = this.db.prepare('SELECT * FROM rooms WHERE id = ?');
        stmt.bind([id]);
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return result;
    }
    async discoverRoom(id) {
        this.db.run('UPDATE rooms SET discovered = 1 WHERE id = ?', [id]);
        this.saveDatabase();
    }
    async clearRoom(id) {
        await this.executeTransaction([
            { sql: 'DELETE FROM mobs WHERE location = ?', params: [id] },
            { sql: 'UPDATE rooms SET cleared = 1 WHERE id = ?', params: [id] }
        ]);
    }
    async updateRoomExits(roomId, exits) {
        this.db.run('UPDATE rooms SET exits = ? WHERE id = ?', [exits, roomId]);
        this.saveDatabase();
    }
    async getItemsInLocation(location) {
        const stmt = this.db.prepare('SELECT * FROM items WHERE location = ?');
        const results = [];
        stmt.bind([location]);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }
    async moveItem(itemId, newLocation) {
        this.db.run('UPDATE items SET location = ? WHERE id = ?', [newLocation, itemId]);
        this.saveDatabase();
    }
    async getMobsInLocation(location) {
        const stmt = this.db.prepare('SELECT * FROM mobs WHERE location = ? AND isAlive = 1');
        const results = [];
        stmt.bind([location]);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }
    async updateMobHealth(mobId, newHealth) {
        if (newHealth <= 0) {
            this.db.run('UPDATE mobs SET health = 0, isAlive = 0 WHERE id = ?', [mobId]);
        }
        else {
            this.db.run('UPDATE mobs SET health = ? WHERE id = ?', [newHealth, mobId]);
        }
        this.saveDatabase();
    }
    async getMob(mobId) {
        const stmt = this.db.prepare('SELECT * FROM mobs WHERE id = ?');
        stmt.bind([mobId]);
        const result = stmt.step() ? stmt.getAsObject() : null;
        stmt.free();
        return result;
    }
    async addCombatEffect(id, effectType, description, duration, value = 0) {
        this.db.run(`
      INSERT INTO combat_effects (id, effectType, description, duration, value) 
      VALUES (?, ?, ?, ?, ?)
    `, [id, effectType, description, duration, value]);
        this.saveDatabase();
    }
    async getCombatEffects() {
        const stmt = this.db.prepare('SELECT * FROM combat_effects WHERE duration > 0');
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }
    async updateCombatEffectDuration(id, newDuration) {
        if (newDuration <= 0) {
            this.db.run('DELETE FROM combat_effects WHERE id = ?', [id]);
        }
        else {
            this.db.run('UPDATE combat_effects SET duration = ? WHERE id = ?', [newDuration, id]);
        }
        this.saveDatabase();
    }
    async getBunkerInventory() {
        const stmt = this.db.prepare('SELECT * FROM bunker_inventory ORDER BY type, name');
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }
    async addToBunkerInventory(id, name, quantity, type, description, survivalDays) {
        await this.withTransaction(() => {
            const stmt = this.db.prepare('SELECT * FROM bunker_inventory WHERE name = ?');
            stmt.bind([name]);
            const existing = stmt.step() ? stmt.getAsObject() : null;
            stmt.free();
            if (existing) {
                this.db.run('UPDATE bunker_inventory SET quantity = quantity + ? WHERE name = ?', [quantity, name]);
            }
            else {
                this.db.run(`
          INSERT INTO bunker_inventory (id, name, quantity, type, description, survivalDays)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [id, name, quantity, type, description, survivalDays === undefined ? null : survivalDays]);
            }
        });
    }
    async removeBunkerItem(itemId, quantity = 1) {
        return await this.withTransaction(() => {
            const stmt = this.db.prepare('SELECT * FROM bunker_inventory WHERE id = ?');
            stmt.bind([itemId]);
            const existing = stmt.step() ? stmt.getAsObject() : null;
            stmt.free();
            if (!existing || existing.quantity < quantity) {
                return false; // Not enough items available
            }
            if (existing.quantity === quantity) {
                // Remove the item entirely if we're taking all of them
                this.db.run('DELETE FROM bunker_inventory WHERE id = ?', [itemId]);
            }
            else {
                // Just reduce the quantity
                this.db.run('UPDATE bunker_inventory SET quantity = quantity - ? WHERE id = ?', [quantity, itemId]);
            }
            return true;
        });
    }
    // Helper method for compatibility with existing code
    async runAsync(sql, params = []) {
        try {
            this.db.run(sql, params);
            this.saveDatabase();
            return { changes: 1 }; // Simplified return for compatibility
        }
        catch (error) {
            throw error;
        }
    }
    // Bunker resource management methods
    async advanceDay(daysToAdvance = 1) {
        const gameState = await this.getGameState();
        if (!gameState)
            throw new Error('Game state not found');
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
    async addBunkerResource(resource, amount) {
        const field = `bunker${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
        const gameState = await this.getGameState();
        if (!gameState)
            throw new Error('Game state not found');
        const currentValue = gameState[field];
        await this.updateGameState({
            [field]: currentValue + amount
        });
    }
    async getBunkerResources() {
        const gameState = await this.getGameState();
        if (!gameState)
            throw new Error('Game state not found');
        return {
            food: gameState.bunkerFood,
            water: gameState.bunkerWater,
            energy: gameState.bunkerEnergy,
            daysSinceIncident: gameState.daysSinceIncident
        };
    }
    // Discovered content management methods
    async addDiscoveredContent(id, type, title, content, itemSource) {
        this.db.run(`
      INSERT OR REPLACE INTO discovered_content (id, type, title, content, itemSource)
      VALUES (?, ?, ?, ?, ?)
    `, [id, type, title, content, itemSource]);
        this.saveDatabase();
    }
    async getDiscoveredContent() {
        const stmt = this.db.prepare('SELECT * FROM discovered_content ORDER BY discoveredAt ASC');
        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }
    async getDiscoveredContentByType(type) {
        const stmt = this.db.prepare('SELECT * FROM discovered_content WHERE type = ? ORDER BY discoveredAt ASC');
        const results = [];
        stmt.bind([type]);
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
    }
    async hasDiscoveredContent(id) {
        const stmt = this.db.prepare('SELECT COUNT(*) as count FROM discovered_content WHERE id = ?');
        stmt.bind([id]);
        const count = stmt.step() ? stmt.get()[0] : 0;
        stmt.free();
        return count > 0;
    }
    /**
     * Execute multiple database operations atomically within a transaction
     * If any operation fails, all changes are rolled back
     */
    async executeTransaction(operations) {
        try {
            // Begin transaction
            this.db.run('BEGIN TRANSACTION');
            // Execute all operations
            for (const operation of operations) {
                this.db.run(operation.sql, operation.params || []);
            }
            // Commit transaction
            this.db.run('COMMIT');
            // Save to disk after successful transaction
            this.saveDatabase();
        }
        catch (error) {
            // Rollback on any error
            try {
                this.db.run('ROLLBACK');
            }
            catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
            throw error;
        }
    }
    /**
     * Execute a callback function within a transaction context
     * Provides more flexibility for complex transaction logic
     */
    async withTransaction(callback) {
        try {
            this.db.run('BEGIN TRANSACTION');
            const result = await callback();
            this.db.run('COMMIT');
            this.saveDatabase();
            return result;
        }
        catch (error) {
            try {
                this.db.run('ROLLBACK');
            }
            catch (rollbackError) {
                console.error('Error during rollback:', rollbackError);
            }
            throw error;
        }
    }
}
exports.Database = Database;
//# sourceMappingURL=database.js.map