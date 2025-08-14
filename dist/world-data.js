"use strict";
// World initialization data - basement level map and content
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASEMENT_HAZARDS = exports.BASEMENT_MOBS = exports.BASEMENT_ITEMS = exports.BASEMENT_ROOMS = void 0;
exports.BASEMENT_ROOMS = {
    "BUNKER": {
        name: "Command Bunker",
        description: "Your shielded underground command center. Banks of monitors show radiation readings from the surface. Emergency supplies line the reinforced walls. This is where you remain safe while controlling obot-3 remotely.",
        exits: { down: "B01" },
        cleared: true
    },
    "B01": {
        name: "Storage Unit A",
        description: "A cramped storage unit filled with dust-covered boxes and old furniture. The air smells of mildew and decay. Weak light filters through a grimy window near the ceiling. A reinforced door marked 'BUNKER ACCESS' leads up to your command center.",
        exits: { east: "B02", south: "B05", up: "BUNKER" },
        cleared: false
    },
    "B02": {
        name: "Main Corridor",
        description: "A long concrete corridor with flickering fluorescent lights. Water stains run down the walls, and loose tiles crunch underfoot. Multiple doors line both sides.",
        exits: { west: "B01", east: "B03", south: "B06", north: "B09" },
        cleared: false
    },
    "B03": {
        name: "Electrical Room",
        description: "A small room housing the building's electrical systems. Warning signs in multiple languages cover the walls. The hum of transformers fills the air, and sparks occasionally arc from damaged wiring.",
        exits: { west: "B02", south: "B07" },
        cleared: false
    },
    "B04": {
        name: "Storage Unit B",
        description: "Another storage unit, this one better organized with metal shelving. Holiday decorations and sporting equipment are neatly arranged, though everything is covered in a fine layer of dust.",
        exits: { east: "B05", south: "B08" },
        cleared: false
    },
    "B05": {
        name: "Utility Corridor",
        description: "A narrow service corridor lined with pipes and conduits. The floor is wet from a slow leak somewhere above. The sound of dripping echoes constantly.",
        exits: { north: "B01", west: "B04", east: "B06", south: "B08" },
        cleared: false
    },
    "B06": {
        name: "Laundry Room",
        description: "A large room with several coin-operated washers and dryers, most of which are broken. Piles of moldy laundry have been abandoned in corners. A strange scratching sound comes from behind the machines.",
        exits: { west: "B05", north: "B02", east: "B07", south: "B11" },
        cleared: false
    },
    "B07": {
        name: "Boiler Room",
        description: "The heart of the building's heating system. A massive boiler dominates the center of the room, surrounded by a maze of pipes and valves. Steam occasionally hisses from various joints, creating a sweltering environment.",
        exits: { west: "B06", north: "B03", south: "B12" },
        cleared: false
    },
    "B08": {
        name: "Storage Unit C",
        description: "This storage unit appears to have been ransacked. Boxes are torn open and contents scattered across the floor. Among the chaos, some items might still be salvageable.",
        exits: { north: "B05", east: "B11", south: "B13" },
        cleared: false
    },
    "B09": {
        name: "Maintenance Office",
        description: "A small office with a battered desk covered in work orders and building blueprints. Tool calendars from years past hang on the walls. A key rack holds various keys, though most slots are empty.",
        exits: { south: "B02", east: "B10" },
        cleared: false
    },
    "B10": {
        name: "Janitor's Closet",
        description: "A cramped closet packed with cleaning supplies, mops, and industrial chemicals. Many containers have corroded or leaked, creating a hazardous mix of substances on the floor.",
        exits: { west: "B09", south: "B11" },
        cleared: false
    },
    "B11": {
        name: "Wine Cellar",
        description: "A cool, dark room with stone walls lined with wine racks. Many bottles remain intact, though others have shattered on the floor. The air is heavy with the smell of fermented grape and cork.",
        exits: { west: "B08", north: "B06", east: "B12", south: "B14" },
        cleared: false
    },
    "B12": {
        name: "Mechanical Room",
        description: "A large room housing water pumps, HVAC equipment, and other building systems. The machinery appears to be running on backup power, creating an ominous red glow throughout the space.",
        exits: { west: "B11", north: "B07", south: "B15" },
        cleared: false
    },
    "B13": {
        name: "Storage Unit D",
        description: "The largest storage unit, filled with furniture covered by tarps and drop cloths. Shapes loom in the shadows, and the occasional creak suggests some items are not as stable as they appear.",
        exits: { north: "B08", east: "B14" },
        cleared: false
    },
    "B14": {
        name: "Sub-basement Access",
        description: "A narrow stairwell leading down to a lower level. The area is partially flooded, and the stairs disappear into dark water. Strange sounds echo from the depths below.",
        exits: { west: "B13", north: "B11", east: "B15" },
        cleared: false
    },
    "B15": {
        name: "Workshop",
        description: "A well-equipped workshop with workbenches, tool racks, and various pieces of machinery. This appears to be where the building's maintenance work was done. Two sealed barriers block your path: a warped steel door leading up to the main lobby, and a heavy maintenance hatch leading down to the sub-basement tunnel system. On the main workbench, a plasma torch sits waiting - the key to cutting through these barriers.",
        exits: { west: "B14", north: "B12" },
        cleared: false
    }
};
exports.BASEMENT_ITEMS = [
    // Storage Unit A (B01)
    { id: "flashlight_001", name: "Flashlight", description: "A heavy-duty flashlight with a cracked lens", weight: 1.2, type: "tool", value: 0, energyCost: 2, location: "B01" },
    { id: "canned_food_001", name: "Canned Beans", description: "A dented can of beans, still sealed", weight: 0.8, type: "food", value: 0, energyCost: 0, location: "B01" },
    { id: "blanket_001", name: "Wool Blanket", description: "A moth-eaten but warm wool blanket", weight: 2.5, type: "material", value: 0, energyCost: 0, location: "B01" },
    // Electrical Room (B03)
    { id: "wire_coil_001", name: "Copper Wire", description: "50 feet of copper electrical wire", weight: 3.0, type: "material", value: 0, energyCost: 0, location: "B03" },
    { id: "fuses_001", name: "Electrical Fuses", description: "A box of assorted electrical fuses", weight: 0.5, type: "material", value: 0, energyCost: 0, location: "B03" },
    { id: "battery_pack_001", name: "Emergency Battery", description: "A backup power cell, still holds charge", weight: 4.2, type: "energy", value: 25, energyCost: 0, location: "B03" },
    // Storage Unit B (B04)  
    { id: "tent_001", name: "Camping Tent", description: "A compact two-person tent in good condition", weight: 6.8, type: "material", value: 0, energyCost: 0, location: "B04" },
    { id: "sleeping_bag_001", name: "Sleeping Bag", description: "A down-filled sleeping bag", weight: 3.2, type: "material", value: 0, energyCost: 0, location: "B04" },
    { id: "first_aid_001", name: "Human First Aid Kit", description: "Medical supplies for treating human injuries", weight: 1.8, type: "human_medicine", value: 0, energyCost: 0, location: "B04" },
    { id: "energy_bars_001", name: "Protein Energy Bars", description: "High-calorie emergency food bars", weight: 0.8, type: "food", value: 0, energyCost: 0, location: "B04" },
    // Boiler Room (B07)
    { id: "fuel_can_001", name: "Fuel Canister", description: "A metal canister containing heating fuel", weight: 5.5, type: "energy", value: 40, energyCost: 0, location: "B07" },
    { id: "pipe_wrench_001", name: "Pipe Wrench", description: "A heavy adjustable wrench for plumbing work", weight: 2.8, type: "tool", value: 5, energyCost: 3, location: "B07" },
    { id: "metal_sheets_001", name: "Scrap Metal", description: "Various pieces of sheet metal and pipe", weight: 8.2, type: "material", value: 0, energyCost: 0, location: "B07" },
    // Storage Unit C (B08) - ransacked
    { id: "broken_radio_001", name: "Damaged Radio", description: "A radio with a smashed speaker, might be repairable", weight: 1.5, type: "material", value: 0, energyCost: 0, location: "B08" },
    { id: "photo_albums_001", name: "Photo Albums", description: "Water-damaged family photos", weight: 1.0, type: "material", value: 0, energyCost: 0, location: "B08" },
    // Maintenance Office (B09)
    { id: "building_keys_001", name: "Master Keys", description: "A ring of keys for various building areas", weight: 0.3, type: "tool", value: 0, energyCost: 0, location: "B09" },
    { id: "blueprints_001", name: "Building Plans", description: "Architectural drawings of the building", weight: 0.2, type: "material", value: 0, energyCost: 0, location: "B09" },
    { id: "stun_baton_001", name: "Security Stun Baton", description: "An electronic weapon that delivers incapacitating shocks", weight: 1.8, type: "weapon", value: 8, energyCost: 3, location: "B09" },
    // Janitor's Closet (B10)  
    { id: "cleaning_chems_001", name: "Industrial Cleaner", description: "Powerful cleaning chemicals in metal containers", weight: 3.6, type: "material", value: 0, energyCost: 0, location: "B10" },
    { id: "mop_bucket_001", name: "Mop and Bucket", description: "Heavy-duty cleaning equipment", weight: 4.1, type: "tool", value: 0, energyCost: 0, location: "B10" },
    // Wine Cellar (B11)
    { id: "wine_bottles_001", name: "Wine Bottles", description: "Several intact bottles of aged wine", weight: 4.5, type: "material", value: 0, energyCost: 0, location: "B11" },
    { id: "glass_shards_001", name: "Glass Fragments", description: "Sharp glass pieces from broken bottles", weight: 1.2, type: "material", value: 3, energyCost: 1, location: "B11" },
    // Mechanical Room (B12)
    { id: "power_cell_001", name: "Backup Power Cell", description: "A high-capacity emergency power source", weight: 7.8, type: "energy", value: 50, energyCost: 0, location: "B12" },
    { id: "repair_kit_001", name: "Robot Repair Kit", description: "Mechanical parts and tools for robot maintenance", weight: 5.2, type: "robot_medicine", value: 35, energyCost: 0, location: "B12" },
    { id: "armor_plating_001", name: "Steel Armor Plating", description: "Reinforced metal plates for protective upgrades", weight: 8.5, type: "robot_medicine", value: 15, energyCost: 0, location: "B12" },
    // Storage Unit D (B13)
    { id: "furniture_wood_001", name: "Wooden Planks", description: "Salvageable wood from broken furniture", weight: 6.5, type: "material", value: 0, energyCost: 0, location: "B13" },
    { id: "old_electronics_001", name: "Vintage Electronics", description: "Old TV and radio components, might contain useful parts", weight: 12.3, type: "material", value: 0, energyCost: 0, location: "B13" },
    // Workshop (B15) - Final room with plasma torch
    { id: "plasma_torch_001", name: "Plasma Torch", description: "A high-powered cutting tool capable of slicing through steel. This is the key to accessing the upper levels.", weight: 8.5, type: "tool", value: 50, energyCost: 15, location: "B15" },
    { id: "welding_mask_001", name: "Welding Mask", description: "Protective gear for working with cutting tools", weight: 1.8, type: "tool", value: 0, energyCost: 0, location: "B15" },
    { id: "metal_workbench_001", name: "Scrap Materials", description: "Various metal pieces and components from the workbench", weight: 15.2, type: "material", value: 0, energyCost: 0, location: "B15" }
];
exports.BASEMENT_MOBS = [
    // Wire Gnawers (mutant rats) - Laundry Room
    { id: "wire_gnawer_001", name: "Wire Gnawer", description: "A mutated rat with metallic teeth, constantly gnawing on electrical cables", health: 15, maxHealth: 15, damage: "1d4+1", damageType: "electrical", location: "B06", isAlive: true, specialAbility: "electrical_glitch" },
    { id: "wire_gnawer_002", name: "Wire Gnawer", description: "Another cable-chewing rodent with sparks flying from its bite", health: 15, maxHealth: 15, damage: "1d4+1", damageType: "electrical", location: "B06", isAlive: true, specialAbility: "electrical_glitch" },
    // Acid Spitter (mutant slug) - Janitor's Closet  
    { id: "acid_spitter_001", name: "Acid Spitter", description: "A bloated slug-like creature that secretes corrosive chemicals", health: 8, maxHealth: 8, damage: "1d6+2", damageType: "acid", location: "B10", isAlive: true, specialAbility: "acid_burn" },
    // Scrap Crawler (bacteria swarm) - Sub-basement Access
    { id: "scrap_crawler_001", name: "Scrap Crawler", description: "A writhing mass of metallivorous bacteria that consumes metal on contact", health: 12, maxHealth: 12, damage: "1d3", damageType: "corrosion", location: "B14", isAlive: true, specialAbility: "attach_corrode" },
    // Feral Survivor - Storage Unit C (ransacked area)
    { id: "feral_survivor_001", name: "Feral Survivor", description: "A contaminated human wielding a makeshift crowbar, eyes glowing with radiation sickness", health: 25, maxHealth: 25, damage: "1d8+3", damageType: "physical", location: "B08", isAlive: true, specialAbility: "" },
    // Rogue Maintenance Bot - Workshop (guarding the plasma torch)
    { id: "rogue_bot_001", name: "Rogue Maintenance Bot", description: "A malfunctioned cleaning unit with hydraulic crusher arms, sparks flying from damaged circuits", health: 45, maxHealth: 45, damage: "2d6+4", damageType: "crushing", location: "B15", isAlive: true, specialAbility: "grapple" }
];
// Environmental hazards by room
exports.BASEMENT_HAZARDS = {
    "B03": {
        name: "Electrical Hazard",
        description: "Damaged wiring poses electrocution risk",
        triggerChance: 0.15,
        damage: "1d6",
        damageType: "electrical"
    },
    "B07": {
        name: "Steam Burst",
        description: "High-pressure steam can cause severe damage",
        triggerChance: 0.10,
        damage: "1d8+2",
        damageType: "heat"
    },
    "B13": {
        name: "Unstable Furniture",
        description: "Heavy furniture may collapse when disturbed",
        triggerChance: 0.20,
        damage: "1d6+3",
        damageType: "crushing"
    },
    "B14": {
        name: "Flooding Risk",
        description: "Standing water may hide electrical hazards",
        triggerChance: 0.12,
        damage: "1d4+1",
        damageType: "electrical"
    }
};
//# sourceMappingURL=world-data.js.map