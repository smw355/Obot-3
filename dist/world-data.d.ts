export declare const BASEMENT_ROOMS: {
    BUNKER: {
        name: string;
        description: string;
        exits: {
            down: string;
        };
        cleared: boolean;
    };
    B01: {
        name: string;
        description: string;
        exits: {
            east: string;
            south: string;
            up: string;
        };
        cleared: boolean;
    };
    B02: {
        name: string;
        description: string;
        exits: {
            west: string;
            east: string;
            south: string;
            north: string;
        };
        cleared: boolean;
    };
    B03: {
        name: string;
        description: string;
        exits: {
            west: string;
            south: string;
        };
        cleared: boolean;
    };
    B04: {
        name: string;
        description: string;
        exits: {
            east: string;
            south: string;
        };
        cleared: boolean;
    };
    B05: {
        name: string;
        description: string;
        exits: {
            north: string;
            west: string;
            east: string;
            south: string;
        };
        cleared: boolean;
    };
    B06: {
        name: string;
        description: string;
        exits: {
            west: string;
            north: string;
            east: string;
            south: string;
        };
        cleared: boolean;
    };
    B07: {
        name: string;
        description: string;
        exits: {
            west: string;
            north: string;
            south: string;
        };
        cleared: boolean;
    };
    B08: {
        name: string;
        description: string;
        exits: {
            north: string;
            east: string;
            south: string;
        };
        cleared: boolean;
    };
    B09: {
        name: string;
        description: string;
        exits: {
            south: string;
            east: string;
        };
        cleared: boolean;
    };
    B10: {
        name: string;
        description: string;
        exits: {
            west: string;
            south: string;
        };
        cleared: boolean;
    };
    B11: {
        name: string;
        description: string;
        exits: {
            west: string;
            north: string;
            east: string;
            south: string;
        };
        cleared: boolean;
    };
    B12: {
        name: string;
        description: string;
        exits: {
            west: string;
            north: string;
            south: string;
        };
        cleared: boolean;
    };
    B13: {
        name: string;
        description: string;
        exits: {
            north: string;
            east: string;
        };
        cleared: boolean;
    };
    B14: {
        name: string;
        description: string;
        exits: {
            west: string;
            north: string;
            east: string;
        };
        cleared: boolean;
    };
    B15: {
        name: string;
        description: string;
        exits: {
            west: string;
            north: string;
        };
        cleared: boolean;
    };
};
export declare const BASEMENT_ITEMS: {
    id: string;
    name: string;
    description: string;
    weight: number;
    type: string;
    value: number;
    energyCost: number;
    location: string;
}[];
export declare const BASEMENT_MOBS: {
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
}[];
export declare const BASEMENT_HAZARDS: {
    B03: {
        name: string;
        description: string;
        triggerChance: number;
        damage: string;
        damageType: string;
    };
    B07: {
        name: string;
        description: string;
        triggerChance: number;
        damage: string;
        damageType: string;
    };
    B13: {
        name: string;
        description: string;
        triggerChance: number;
        damage: string;
        damageType: string;
    };
    B14: {
        name: string;
        description: string;
        triggerChance: number;
        damage: string;
        damageType: string;
    };
};
//# sourceMappingURL=world-data.d.ts.map