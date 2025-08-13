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
    specialAbility?: string;
}
export interface CombatEffect {
    id: string;
    type: string;
    duration: number;
    damage: number;
    description: string;
}
export interface BunkerInventory {
    id: string;
    name: string;
    quantity: number;
    type: string;
    description: string;
    survivalDays?: number;
}
export declare class Database {
    private db;
    runAsync: (sql: string, params?: any[]) => Promise<any>;
    private getAsync;
    allAsync: (sql: string, params?: any[]) => Promise<any[]>;
    constructor(filename?: string);
    initialize(): Promise<void>;
    createNewGame(): Promise<void>;
    getGameState(): Promise<GameState | null>;
    updateGameState(updates: Partial<GameState>): Promise<void>;
    getRoom(id: string): Promise<Room | null>;
    discoverRoom(id: string): Promise<void>;
    clearRoom(id: string): Promise<void>;
    updateRoomExits(id: string, exits: string): Promise<void>;
    getItemsInLocation(location: string): Promise<Item[]>;
    moveItem(itemId: string, newLocation: string): Promise<void>;
    getMobsInLocation(location: string): Promise<Mob[]>;
    updateMobHealth(mobId: string, health: number): Promise<void>;
    addCombatEffect(effect: CombatEffect): Promise<void>;
    getCombatEffects(): Promise<CombatEffect[]>;
    updateCombatEffect(id: string, duration: number): Promise<void>;
    getBunkerInventory(): Promise<BunkerInventory[]>;
    addToBunkerInventory(itemId: string, name: string, quantity: number, type: string, description: string, survivalDays?: number): Promise<void>;
    initializeBunkerSupplies(): Promise<void>;
    close(): Promise<void>;
}
//# sourceMappingURL=database.d.ts.map