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
        INSERT INTO game_state (id, currentRoom, health, energy, maxEnergy, carryingWeight, turnNumber, gameCompleted, missionStarted) 
        VALUES (1, 'B01', 100, 100, 100, 0, 1, 0, 0)
      `);
        }
        stmt.free();
        this.saveDatabase();
    }
    saveDatabase() {
        const data = this.db.export();
        fs.writeFileSync(this.dbPath, data);
    }
    async initializeBunkerSupplies() {
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
        this.db.run('DELETE FROM mobs WHERE location = ?', [id]);
        this.db.run('UPDATE rooms SET cleared = 1 WHERE id = ?', [id]);
        this.saveDatabase();
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
        this.saveDatabase();
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
}
exports.Database = Database;
//# sourceMappingURL=database.js.map