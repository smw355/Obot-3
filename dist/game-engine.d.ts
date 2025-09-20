import { Database, GameState } from './database.js';
export declare class GameEngine {
    private db;
    constructor(db: Database);
    rollDice(diceNotation: string): number;
    calculateCarryingWeight(): Promise<number>;
    checkWeightLimits(gameState: GameState): Promise<string[]>;
    processCombat(mobId: string, gameState: GameState): Promise<string[]>;
    private applySpecialAbility;
    private attemptFlee;
    private enterMaintenanceMode;
    processCombatEffects(gameState: GameState): Promise<string[]>;
    useItem(itemId: string, gameState: GameState): Promise<string[]>;
    private attemptEnergyRetreat;
    calculateAttackDamage(): Promise<number>;
    usePlasmaTorch(gameState: GameState, target: string): Promise<string[]>;
    purifyWater(gameState: GameState, rawWaterId: string, purifierId: string): Promise<string[]>;
    private handleMaterialItem;
}
//# sourceMappingURL=game-engine.d.ts.map