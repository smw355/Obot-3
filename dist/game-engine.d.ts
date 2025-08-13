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
    calculateAttackDamage(): Promise<number>;
}
//# sourceMappingURL=game-engine.d.ts.map