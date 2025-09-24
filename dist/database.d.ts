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
    exits: string;
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
    type: string;
    description: string;
    survivalDays?: number;
}
export interface DiscoveredContent {
    id: string;
    type: string;
    title: string;
    content: string;
    discoveredAt: string;
    itemSource: string;
}
export declare class Database {
    private db;
    private dbPath;
    constructor();
    initialize(): Promise<void>;
    private saveDatabase;
    private migrateDatabase;
    private updateExistingItemValues;
    initializeBunkerSupplies(): Promise<void>;
    getGameState(): Promise<GameState | null>;
    updateGameState(updates: Partial<GameState>): Promise<void>;
    getRoom(id: string): Promise<Room | null>;
    discoverRoom(id: string): Promise<void>;
    clearRoom(id: string): Promise<void>;
    updateRoomExits(roomId: string, exits: string): Promise<void>;
    getItemsInLocation(location: string): Promise<Item[]>;
    moveItem(itemId: string, newLocation: string): Promise<void>;
    getMobsInLocation(location: string): Promise<Mob[]>;
    updateMobHealth(mobId: string, newHealth: number): Promise<void>;
    getMob(mobId: string): Promise<Mob | null>;
    addCombatEffect(id: string, effectType: string, description: string, duration: number, value?: number): Promise<void>;
    getCombatEffects(): Promise<CombatEffect[]>;
    updateCombatEffectDuration(id: string, newDuration: number): Promise<void>;
    getBunkerInventory(): Promise<BunkerInventory[]>;
    addToBunkerInventory(id: string, name: string, quantity: number, type: string, description: string, survivalDays?: number): Promise<void>;
    removeBunkerItem(itemId: string, quantity?: number): Promise<boolean>;
    runAsync(sql: string, params?: any[]): Promise<any>;
    advanceDay(daysToAdvance?: number): Promise<void>;
    addBunkerResource(resource: 'food' | 'water' | 'energy', amount: number): Promise<void>;
    getBunkerResources(): Promise<{
        food: number;
        water: number;
        energy: number;
        daysSinceIncident: number;
    }>;
    addDiscoveredContent(id: string, type: string, title: string, content: string, itemSource: string): Promise<void>;
    getDiscoveredContent(): Promise<DiscoveredContent[]>;
    getDiscoveredContentByType(type: string): Promise<DiscoveredContent[]>;
    hasDiscoveredContent(id: string): Promise<boolean>;
    /**
     * Execute multiple database operations atomically within a transaction
     * If any operation fails, all changes are rolled back
     */
    executeTransaction(operations: Array<{
        sql: string;
        params?: any[];
    }>): Promise<void>;
    /**
     * Execute a callback function within a transaction context
     * Provides more flexibility for complex transaction logic
     */
    withTransaction<T>(callback: () => T | Promise<T>): Promise<T>;
}
//# sourceMappingURL=database.d.ts.map