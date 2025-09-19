// World initialization data - realistic apartment basement layout based on Excel map
// Grid: A-J (columns) x 1-9 (rows)
// Hallways: Column B + Row 2 form main corridor network

export const BASEMENT_ROOMS = {
  // BUNKER - Safe command center (A9, accessed from Storage 15)
  "BUNKER": {
    name: "Command Bunker",
    description: "Your shielded underground command center built in the 1950s. Banks of monitors show radiation readings from the surface. Emergency supplies line the reinforced concrete walls. This fallout shelter was retrofitted into the basement when the Cold War fears peaked.",
    exits: { up: "STORAGE_15" },
    cleared: true
  },

  // STORAGE AREAS - Tenant storage lockers
  "STORAGE_15": {
    name: "Storage Unit 15 - Starting Point", 
    description: "Your storage unit where obot-3 is parked. Metal shelving lines the walls with various boxes and equipment. A heavy steel door marked 'FALLOUT SHELTER' leads down to the bunker. This is where you safely store and deploy your robot.",
    exits: { north: "HALLWAY_B8", down: "BUNKER" },
    cleared: true
  },
  "STORAGE_16": {
    name: "Storage Unit 16",
    description: "A locked storage unit with a heavy padlock. Through the chain-link door you can see furniture covered in tarps.",
    exits: { north: "HALLWAY_B8" },
    cleared: false,
    locked: true
  },
  "STORAGE_3": {
    name: "Storage Unit 3",
    description: "An unlocked storage unit filled with holiday decorations and sporting equipment. Boxes are neatly labeled and stacked.",
    exits: { south: "HALLWAY_B2" },
    cleared: false
  },
  "STORAGE_2": {
    name: "Storage Unit 2", 
    description: "A small storage unit with gardening supplies and tools. The air smells of fertilizer and old soil.",
    exits: { south: "HALLWAY_B2" },
    cleared: false
  },
  "STORAGE_1": {
    name: "Storage Unit 1",
    description: "A cramped storage unit packed with furniture and personal belongings. Items are stacked haphazardly to the ceiling.",
    exits: { south: "HALLWAY_B2" },
    cleared: false
  },
  "STORAGE_4": {
    name: "Storage Unit 4",
    description: "A locked tenant storage unit. The padlock looks old but sturdy.",
    exits: { east: "HALLWAY_B2" },
    cleared: false,
    locked: true
  },
  "STORAGE_5": {
    name: "Storage Unit 5",
    description: "A locked storage unit with boxes visible through the chain-link door.",
    exits: { east: "HALLWAY_B3" },
    cleared: false,
    locked: true
  },
  "STORAGE_6": {
    name: "Storage Unit 6",
    description: "A locked storage unit filled with what appears to be old electronics and appliances.", 
    exits: { east: "HALLWAY_B3" },
    cleared: false,
    locked: true
  },
  "STORAGE_7": {
    name: "Storage Unit 7",
    description: "An unlocked storage unit with miscellaneous household items and old books scattered on metal shelving.",
    exits: { east: "HALLWAY_B4" },
    cleared: false
  },
  "STORAGE_8": {
    name: "Storage Unit 8",
    description: "A medium-sized unlocked storage unit containing boxes of records, photo albums, and personal mementos.",
    exits: { east: "HALLWAY_B4" },
    cleared: false
  },
  "STORAGE_9": {
    name: "Storage Unit 9",
    description: "A locked storage unit with dusty furniture visible behind the chain-link door.",
    exits: { east: "HALLWAY_B5" },
    cleared: false,
    locked: true
  },
  "STORAGE_10": {
    name: "Storage Unit 10", 
    description: "A locked tenant storage unit. The lock appears recently replaced.",
    exits: { east: "HALLWAY_B5" },
    cleared: false,
    locked: true
  },
  "STORAGE_11": {
    name: "Storage Unit 11",
    description: "A locked storage unit filled with what looks like camping and outdoor equipment.",
    exits: { east: "HALLWAY_B6" },
    cleared: false,
    locked: true
  },
  "STORAGE_12": {
    name: "Storage Unit 12",
    description: "An unlocked storage unit with hunting and fishing gear. Gun cases and tackle boxes are organized on sturdy shelving.",
    exits: { east: "HALLWAY_B6" },
    cleared: false
  },
  "STORAGE_13": {
    name: "Storage Unit 13",
    description: "A locked storage unit with children's toys and furniture visible through the mesh door.",
    exits: { east: "HALLWAY_B7" },
    cleared: false,
    locked: true
  },
  "STORAGE_14": {
    name: "Storage Unit 14",
    description: "A locked storage unit containing what appears to be art supplies and canvases.",
    exits: { east: "HALLWAY_B7" },
    cleared: false,
    locked: true
  },

  // MAIN HALLWAY NETWORK - Column B and Row 2
  "HALLWAY_B2": {
    name: "Main Hallway - North Section",
    description: "The main east-west corridor running the length of the building. Fluorescent lights flicker overhead, and numbered doors line both sides. The concrete floor shows decades of wear from tenant foot traffic.",
    exits: { 
      north: "STORAGE_3", 
      south: "STORAGE_2", 
      east: "HALLWAY_C2",
      west: "STORAGE_4" 
    },
    cleared: false
  },
  "HALLWAY_C2": {
    name: "Main Hallway - Central North",
    description: "The main corridor continues eastward. Emergency lighting casts long shadows, and you can hear the hum of building systems beyond the walls.",
    exits: {
      north: "STORAGE_1",
      east: "HALLWAY_D2", 
      west: "HALLWAY_B2",
      south: "STAIRS_UP"
    },
    cleared: false
  },
  "HALLWAY_D2": {
    name: "Main Hallway - East Central",
    description: "The main corridor continues with doors to storage and common areas. The hallway shows signs of recent water damage from above.",
    exits: {
      east: "HALLWAY_E2",
      west: "HALLWAY_C2",
      south: "HATCH_DOWN_SEALED"
    },
    cleared: false
  },
  "HALLWAY_E2": {
    name: "Main Hallway - Wine Storage",
    description: "This section of the main corridor has a slightly cooler temperature. A door marked 'WINE STORAGE - RESIDENTS ONLY' leads north.",
    exits: {
      north: "WINE_CELLAR",
      east: "HALLWAY_F2", 
      west: "HALLWAY_D2"
    },
    cleared: false
  },
  "HALLWAY_F2": {
    name: "Main Hallway - Bike Area",
    description: "The corridor widens here near the bike storage area. Tire marks on the concrete floor show where residents wheel their bicycles.",
    exits: {
      north: "BIKE_DOOR",
      east: "HALLWAY_G2",
      west: "HALLWAY_E2"
    },
    cleared: false
  },
  "HALLWAY_G2": {
    name: "Main Hallway - Bike Storage",
    description: "This section of hallway provides access to the bike storage room. Metal bike tracks are embedded in the floor.",
    exits: {
      north: "BIKE_STORAGE",
      east: "HALLWAY_H2",
      west: "HALLWAY_F2"
    },
    cleared: false
  },
  "HALLWAY_H2": {
    name: "Main Hallway - Maintenance Door",
    description: "The main corridor ends at a heavy steel door marked 'AUTHORIZED PERSONNEL ONLY - MAINTENANCE SECTION'. A keycard reader blinks red beside the door handle.",
    exits: {
      west: "HALLWAY_G2",
      east: "MAINTENANCE_DOOR_LOCKED",
      south: "LAUNDRY"
    },
    cleared: false
  },
  
  // Vertical hallway connections (Column B)
  "HALLWAY_B3": {
    name: "North-South Hallway - Upper",
    description: "A perpendicular hallway connecting the main corridor to storage units. The concrete walls are painted institutional green.",
    exits: {
      north: "HALLWAY_B2",
      south: "HALLWAY_B4",
      west: "STORAGE_5",
      east: "STORAGE_6"
    },
    cleared: false
  },
  "HALLWAY_B4": {
    name: "North-South Hallway - Mid",
    description: "The vertical hallway continues southward, providing access to more storage units. Pipes run along the ceiling.",
    exits: {
      north: "HALLWAY_B3", 
      south: "HALLWAY_B5",
      west: "STORAGE_7",
      east: "STORAGE_8"
    },
    cleared: false
  },
  "HALLWAY_B5": {
    name: "North-South Hallway - Lower Mid",
    description: "This section of the north-south corridor shows more wear. Water stains on the walls suggest occasional flooding.",
    exits: {
      north: "HALLWAY_B4",
      south: "HALLWAY_B6", 
      west: "STORAGE_9",
      east: "STORAGE_10"
    },
    cleared: false
  },
  "HALLWAY_B6": {
    name: "North-South Hallway - Lower",
    description: "The vertical hallway continues toward the southern storage units. The lighting is dimmer here.",
    exits: {
      north: "HALLWAY_B5",
      south: "HALLWAY_B7",
      west: "STORAGE_11", 
      east: "STORAGE_12"
    },
    cleared: false
  },
  "HALLWAY_B7": {
    name: "North-South Hallway - South",
    description: "The southern end of the vertical corridor. The air is warmer here, suggesting proximity to the building's heating system.",
    exits: {
      north: "HALLWAY_B6",
      south: "HALLWAY_B8",
      west: "STORAGE_13",
      east: "STORAGE_14"
    },
    cleared: false
  },
  "HALLWAY_B8": {
    name: "North-South Hallway - Southern End", 
    description: "The end of the vertical corridor near the southern storage units and workshop access. The walls vibrate slightly from machinery below.",
    exits: {
      north: "HALLWAY_B7",
      west: "STORAGE_15",
      east: "STORAGE_16"
    },
    cleared: false
  },

  // COMMON AREAS
  "WINE_CELLAR": {
    name: "Community Wine Storage",
    description: "A temperature-controlled room with individual wine storage compartments for residents. Most racks are still full of aging bottles, suggesting the evacuation was sudden.",
    exits: { south: "HALLWAY_E2" },
    cleared: false
  },
  "BIKE_DOOR": {
    name: "Bike Storage Entrance",
    description: "A reinforced door leading to the bike storage area. Rubber matting protects the floor from wheel damage.",
    exits: { 
      south: "HALLWAY_F2",
      east: "BIKE_STORAGE"
    },
    cleared: false
  },
  "BIKE_STORAGE": {
    name: "Bicycle Storage Room", 
    description: "A large room with metal bike racks and repair tools. Dozens of bicycles are still locked in their assigned spaces. The air smells of tire rubber and chain oil.",
    exits: { 
      west: "BIKE_DOOR",
      south: "HALLWAY_G2"
    },
    cleared: false
  },
  "STAIRS_UP": {
    name: "Stairway to Lobby - BLOCKED",
    description: "A wide concrete staircase leading up to the building's main lobby. The steel fire door at the top has been bent and jammed shut, likely from the building collapse above. Debris blocks the upper portion of the stairs.",
    exits: { north: "HALLWAY_C2" },
    cleared: false,
    blocked: true,
    requires_plasma_torch: true
  },
  "HATCH_DOWN_SEALED": {
    name: "Sealed Access Hatch - LOCKED", 
    description: "A heavy maintenance hatch in the floor, sealed with industrial welding. This leads to the sub-basement tunnel system connecting to adjacent buildings. The seal looks professionally done.",
    exits: { north: "HALLWAY_D2" },
    cleared: false,
    sealed: true,
    requires_plasma_torch: true
  },

  // LAUNDRY COMPLEX
  "LAUNDRY": {
    name: "Community Laundry Room",
    description: "A large room filled with commercial washers and dryers. Most machines are still functional, though some show damage from the building's structural issues. Piles of abandoned laundry suggest hasty evacuation.",
    exits: {
      north: "HALLWAY_H2",
      south: "CARETAKER_HALLWAY_BLOCKED",
      west: "LAUNDRY_SUPPLY"
    },
    cleared: false
  },
  "LAUNDRY_SUPPLY": {
    name: "Laundry Supply Room",
    description: "A storage room for laundry supplies and maintenance equipment. Industrial detergents line the shelves. In the floor, a sealed maintenance hatch leads to the building's sub-basement.",
    exits: { 
      east: "LAUNDRY",
      down: "HATCH_DOWN_SEALED_2"
    },
    cleared: false
  },
  "HATCH_DOWN_SEALED_2": {
    name: "Sub-Basement Access Hatch - SEALED",
    description: "A maintenance hatch sealed with heavy welding, leading down to the sub-basement tunnel system. This appears to be the primary access point for the lower levels.",
    exits: { up: "LAUNDRY_SUPPLY" },
    cleared: false,
    sealed: true,
    requires_plasma_torch: true
  },

  // CARETAKER APARTMENT COMPLEX
  "CARETAKER_HALLWAY_BLOCKED": {
    name: "Caretaker Hallway - BLOCKED",
    description: "A narrow hallway leading to the building superintendent's apartment. The entrance is blocked by stacked boxes and furniture, but they look moveable with some effort.",
    exits: { 
      north: "LAUNDRY",
      south: "CARETAKER_HALLWAY" 
    },
    cleared: false,
    blocked_by_boxes: true
  },
  "CARETAKER_HALLWAY": {
    name: "Caretaker Private Hallway",
    description: "A narrow private hallway serving the building superintendent's basement apartment. Family photos line the walls, and a worn carpet runs down the center.",
    exits: {
      north: "CARETAKER_HALLWAY_BLOCKED",
      east: "CARETAKER_APARTMENT"
    },
    cleared: false
  },
  "CARETAKER_APARTMENT": {
    name: "Caretaker's Living Room",
    description: "The main living area of the building superintendent's basement apartment. Comfortable furniture surrounds a small TV. Personal belongings suggest the family left in a hurry during the evacuation.",
    exits: {
      west: "CARETAKER_HALLWAY",
      north: "CARETAKER_KITCHEN",
      east: "CARETAKER_BEDROOM",
      south: "CARETAKER_BATHROOM"
    },
    cleared: false
  },
  "CARETAKER_KITCHEN": {
    name: "Caretaker's Kitchen",
    description: "A small but functional kitchen with older appliances. Dishes are still in the sink, and the refrigerator hums quietly. A half-eaten meal sits on the table.",
    exits: { south: "CARETAKER_APARTMENT" },
    cleared: false
  },
  "CARETAKER_BEDROOM": {
    name: "Caretaker's Bedroom", 
    description: "A modest bedroom with a double bed and dresser. The bed is unmade, and clothes are scattered about. A nightstand beside the bed holds personal items and what appears to be a key ring.",
    exits: { west: "CARETAKER_APARTMENT" },
    cleared: false
  },
  "CARETAKER_BATHROOM": {
    name: "Caretaker's Bathroom",
    description: "A small bathroom with basic fixtures. Towels hang on hooks, and toiletries line the medicine cabinet. The mirror shows signs of recent use.",
    exits: { north: "CARETAKER_APARTMENT" },
    cleared: false
  },

  // MAINTENANCE SECTION (Locked behind maintenance door)
  "MAINTENANCE_DOOR_LOCKED": {
    name: "Maintenance Section Door - LOCKED",
    description: "A heavy steel door marked 'AUTHORIZED PERSONNEL ONLY'. A keycard reader beside the handle blinks red, but there's also a traditional keyhole below it.",
    exits: { 
      west: "HALLWAY_H2",
      east: "MAINTENANCE_HALLWAY"
    },
    cleared: false,
    locked: true,
    requires_maintenance_key: true
  },
  "MAINTENANCE_HALLWAY": {
    name: "Maintenance Section Hallway",
    description: "A narrow service corridor restricted to building staff. Pipes and electrical conduits run along the walls and ceiling. The air has a metallic smell from machinery and chemicals.",
    exits: {
      west: "MAINTENANCE_DOOR_LOCKED",
      north: "JANITOR_CLOSET",
      south: "MAINTENANCE_OFFICE",
      east: "BUILDING_STORAGE_1"
    },
    cleared: false
  },
  "JANITOR_CLOSET": {
    name: "Janitor's Supply Closet",
    description: "A cramped closet packed with cleaning supplies, mops, and industrial chemicals. Many containers have corroded or leaked, creating a hazardous mix of substances on the floor.",
    exits: { south: "MAINTENANCE_HALLWAY" },
    cleared: false
  },
  "MAINTENANCE_OFFICE": {
    name: "Building Maintenance Office",
    description: "A small office with a battered desk covered in work orders and building blueprints. Tool calendars from years past hang on the walls. A key rack holds various keys, though most slots are empty.",
    exits: { 
      north: "MAINTENANCE_HALLWAY",
      east: "ELECTRICAL_ROOM"
    },
    cleared: false
  },
  "ELECTRICAL_ROOM": {
    name: "Main Electrical Room",
    description: "The building's primary electrical systems room. Banks of breakers and transformers fill the space. Warning signs in multiple languages cover the walls. Sparks occasionally arc from damaged wiring, and the air crackles with electricity.",
    exits: { west: "MAINTENANCE_OFFICE" },
    cleared: false
  },

  // BUILDING STORAGE
  "BUILDING_STORAGE_1": {
    name: "Building Storage Room 1",
    description: "A large storage room for building maintenance supplies and equipment. Shelves hold everything from light bulbs to replacement parts for the building systems.",
    exits: { 
      west: "MAINTENANCE_HALLWAY",
      south: "BUILDING_STORAGE_2"
    },
    cleared: false
  },
  "BUILDING_STORAGE_2": {
    name: "Building Storage Room 2", 
    description: "Another building storage room with seasonal decorations and furniture for common areas. Holiday lights and lobby furniture are stored here.",
    exits: { 
      north: "BUILDING_STORAGE_1",
      south: "BUILDING_STORAGE_3"
    },
    cleared: false
  },
  "BUILDING_STORAGE_3": {
    name: "Building Storage Room 3",
    description: "The largest building storage room, containing emergency supplies and backup equipment for building operations.",
    exits: { 
      north: "BUILDING_STORAGE_2",
      west: "BOILER"
    },
    cleared: false
  },

  // BOILER AND WORKSHOP COMPLEX
  "BOILER": {
    name: "Boiler Room",
    description: "The heart of the building's heating system. A massive boiler dominates the center of the room, surrounded by a maze of pipes and valves. Steam occasionally hisses from various joints, creating a sweltering, humid environment.",
    exits: { 
      east: "BUILDING_STORAGE_3",
      west: "WORKSHOP"
    },
    cleared: false
  },
  "WORKSHOP": {
    name: "Building Workshop",
    description: "A large, well-equipped workshop spanning multiple rooms where the building's maintenance work is done. Workbenches line the walls with tools, spare parts, and ongoing projects. In the center of the main workbench, a plasma torch sits waiting - a high-powered cutting tool capable of slicing through steel barriers.",
    exits: { east: "BOILER" },
    cleared: false,
    has_plasma_torch: true
  }
};

// ITEMS - Distributed throughout the basement
export const BASEMENT_ITEMS = [
  // Storage Unit 15 (Starting area - unlocked)
  { 
    id: "funyuns_001", 
    name: "Bag of Funyuns", 
    description: "Individual bags of onion-flavored snacks - 4 day food supply", 
    weight: 1.2, 
    type: "food", 
    value: 0, 
    energyCost: 0, 
    location: "STORAGE_15",
    foodValue: 4 
  },
  { 
    id: "emergency_radio_001", 
    name: "Emergency Radio", 
    description: "A battery-powered emergency radio, still functional", 
    weight: 2.1, 
    type: "tool", 
    value: 0, 
    energyCost: 2, 
    location: "STORAGE_15" 
  },

  // Storage Unit 12 (Unlocked - has combat knife)
  {
    id: "combat_knife_001",
    name: "Tactical Combat Knife", 
    description: "A sharp, balanced fighting knife with a 6-inch blade - significantly improves combat effectiveness",
    weight: 1.8,
    type: "weapon",
    value: 12,
    energyCost: 2,
    location: "STORAGE_12"
  },
  {
    id: "fishing_gear_001",
    name: "Fishing Equipment",
    description: "Rods, reels, and tackle box with various lures", 
    weight: 8.5,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "STORAGE_12"
  },

  // Storage Unit 8 (Unlocked)
  {
    id: "photo_albums_001",
    name: "Family Photo Albums",
    description: "Water-damaged family photos and personal documents",
    weight: 3.2,
    type: "material", 
    value: 0,
    energyCost: 0,
    location: "STORAGE_8"
  },
  {
    id: "record_collection_001",
    name: "Vinyl Record Collection",
    description: "A box of vintage vinyl records, some still in good condition",
    weight: 15.8,
    type: "material",
    value: 0,
    energyCost: 0, 
    location: "STORAGE_8"
  },

  // Storage Unit 7 (Unlocked)
  {
    id: "old_books_001",
    name: "Box of Books",
    description: "A collection of old novels and reference books",
    weight: 12.4,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "STORAGE_7"
  },
  {
    id: "vintage_tools_001",
    name: "Vintage Hand Tools",
    description: "Old but well-maintained hand tools - hammer, screwdrivers, wrenches",
    weight: 6.7,
    type: "tool",
    value: 3,
    energyCost: 2,
    location: "STORAGE_7"
  },

  // Storage Unit 3 (Unlocked)
  {
    id: "holiday_decorations_001", 
    name: "Holiday Decorations",
    description: "Boxes of Christmas lights and ornaments",
    weight: 4.3,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "STORAGE_3"
  },
  {
    id: "sports_equipment_001",
    name: "Sports Equipment", 
    description: "Tennis rackets, golf clubs, and athletic gear",
    weight: 11.2,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "STORAGE_3"
  },

  // Storage Unit 2 (Unlocked)
  {
    id: "gardening_supplies_001",
    name: "Gardening Supplies",
    description: "Fertilizer, small tools, and seed packets",
    weight: 8.9,
    type: "material", 
    value: 0,
    energyCost: 0,
    location: "STORAGE_2"
  },
  {
    id: "plant_food_001",
    name: "Organic Plant Food",
    description: "Natural fertilizer that could supplement emergency food - 2 day supply if desperate",
    weight: 2.1,
    type: "food",
    value: 0,
    energyCost: 0,
    location: "STORAGE_2",
    foodValue: 2
  },

  // Wine Cellar
  {
    id: "wine_bottles_001",
    name: "Vintage Wine Collection",
    description: "Several bottles of aged wine in temperature-controlled storage",
    weight: 6.8,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "WINE_CELLAR"
  },
  {
    id: "wine_opener_001",
    name: "Professional Corkscrew",
    description: "A heavy-duty wine opener and bottle opener",
    weight: 0.8,
    type: "tool",
    value: 1,
    energyCost: 1,
    location: "WINE_CELLAR" 
  },

  // Bike Storage
  {
    id: "bike_tools_001",
    name: "Bicycle Repair Kit",
    description: "Wrenches, patches, and tools for bike maintenance",
    weight: 3.4,
    type: "tool",
    value: 2,
    energyCost: 1,
    location: "BIKE_STORAGE"
  },
  {
    id: "bike_chain_001",
    name: "Heavy Bike Chain",
    description: "A thick security chain that could serve as an improvised weapon",
    weight: 4.7,
    type: "weapon",
    value: 6,
    energyCost: 3,
    location: "BIKE_STORAGE"
  },

  // Laundry Room
  {
    id: "laundry_detergent_001",
    name: "Industrial Laundry Detergent",
    description: "Commercial-grade cleaning chemicals",
    weight: 5.2,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "LAUNDRY"
  },
  {
    id: "quarters_001",
    name: "Laundry Quarters",
    description: "A roll of quarters for the laundry machines",
    weight: 0.5,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "LAUNDRY"
  },

  // Laundry Supply
  {
    id: "cleaning_supplies_001",
    name: "Industrial Cleaning Supplies",
    description: "Professional-grade cleaning chemicals and equipment",
    weight: 7.8,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "LAUNDRY_SUPPLY"
  },

  // Caretaker Apartment
  {
    id: "maintenance_keys_001",
    name: "Building Maintenance Keys",
    description: "A key ring with keys to the maintenance section and other restricted areas",
    weight: 0.3,
    type: "key",
    value: 0,
    energyCost: 0,
    location: "CARETAKER_BEDROOM"
  },
  {
    id: "caretaker_tools_001", 
    name: "Caretaker's Tool Set",
    description: "Personal tools belonging to the building superintendent",
    weight: 4.9,
    type: "tool",
    value: 2,
    energyCost: 2,
    location: "CARETAKER_APARTMENT"
  },

  // Caretaker Kitchen
  {
    id: "canned_goods_001",
    name: "Canned Food Supply",
    description: "Various canned goods from the caretaker's pantry - 8 day food supply",
    weight: 6.4,
    type: "food", 
    value: 0,
    energyCost: 0,
    location: "CARETAKER_KITCHEN",
    foodValue: 8
  },

  // Janitor Closet  
  {
    id: "industrial_chemicals_001",
    name: "Industrial Cleaning Chemicals",
    description: "Powerful cleaning chemicals that have corroded their containers - handle carefully",
    weight: 8.7,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "JANITOR_CLOSET"
  },
  {
    id: "mop_bucket_001",
    name: "Commercial Mop and Bucket",
    description: "Heavy-duty cleaning equipment",
    weight: 6.1,
    type: "tool",
    value: 0,
    energyCost: 0,
    location: "JANITOR_CLOSET"
  },

  // Maintenance Office
  {
    id: "building_blueprints_001",
    name: "Building Blueprints",
    description: "Architectural drawings showing the building's layout and systems",
    weight: 1.2,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "MAINTENANCE_OFFICE"
  },
  {
    id: "work_orders_001",
    name: "Maintenance Work Orders",
    description: "Paperwork detailing recent building maintenance and repairs",
    weight: 0.8,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "MAINTENANCE_OFFICE"
  },

  // Electrical Room  
  {
    id: "electrical_parts_001",
    name: "Electrical Components",
    description: "Spare fuses, wiring, and electrical repair parts",
    weight: 4.3,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "ELECTRICAL_ROOM"
  },
  {
    id: "voltage_meter_001",
    name: "Digital Multimeter",
    description: "An electronic tool for measuring electrical current and voltage",
    weight: 1.9,
    type: "tool",
    value: 0,
    energyCost: 1,
    location: "ELECTRICAL_ROOM"
  },

  // Building Storage Areas
  {
    id: "emergency_supplies_001",
    name: "Emergency Supply Kit",
    description: "Building emergency supplies including flashlights and first aid - 3 day food supply",
    weight: 8.4,
    type: "food",
    value: 0,
    energyCost: 0,
    location: "BUILDING_STORAGE_3",
    foodValue: 3
  },
  {
    id: "building_parts_001",
    name: "Building Replacement Parts",
    description: "Spare parts for building systems and maintenance",
    weight: 12.7,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "BUILDING_STORAGE_1"
  },

  // Boiler Room
  {
    id: "boiler_tools_001",
    name: "Boiler Maintenance Tools", 
    description: "Specialized tools for boiler and heating system maintenance",
    weight: 7.2,
    type: "tool",
    value: 3,
    energyCost: 2,
    location: "BOILER"
  },
  {
    id: "pipe_wrench_001",
    name: "Large Pipe Wrench",
    description: "A heavy adjustable wrench for plumbing work - could serve as a weapon",
    weight: 3.8,
    type: "weapon",
    value: 8,
    energyCost: 3,
    location: "BOILER"
  },

  // Workshop - PLASMA TORCH
  {
    id: "plasma_torch_001",
    name: "Industrial Plasma Torch", 
    description: "A high-powered cutting tool capable of slicing through steel barriers. This is the key to accessing blocked areas of the building.",
    weight: 9.2,
    type: "tool",
    value: 50,
    energyCost: 15,
    location: "WORKSHOP"
  },
  {
    id: "welding_mask_001",
    name: "Welding Safety Mask",
    description: "Protective equipment for high-temperature metalwork",
    weight: 2.3,
    type: "tool",
    value: 0,
    energyCost: 0,
    location: "WORKSHOP"
  },
  {
    id: "metal_scraps_001",
    name: "Scrap Metal Collection",
    description: "Various pieces of metal, pipes, and workshop materials",
    weight: 18.4,
    type: "material",
    value: 0,
    energyCost: 0,
    location: "WORKSHOP"
  }
];

// ENEMIES - Distributed strategically throughout basement
export const BASEMENT_MOBS = [
  // Storage Area Threats - Scavenger creatures
  {
    id: "storage_rat_001",
    name: "Mutant Storage Rat", 
    description: "A large, aggressive rat that has made its nest in abandoned storage boxes",
    health: 12,
    maxHealth: 12,
    damage: "1d4+1",
    damageType: "bite",
    location: "STORAGE_8",
    isAlive: true,
    specialAbility: "disease_chance",
    detectChance: 0.6,
    combatStyle: "hit_and_run"
  },
  {
    id: "storage_rat_002",
    name: "Mutant Storage Rat",
    description: "Another large rat defending its territory among the stored belongings",
    health: 12,
    maxHealth: 12, 
    damage: "1d4+1",
    damageType: "bite",
    location: "STORAGE_7",
    isAlive: true,
    specialAbility: "disease_chance",
    detectChance: 0.6,
    combatStyle: "hit_and_run"
  },

  // Hallway Patrol - Feral survivors
  {
    id: "feral_survivor_001",
    name: "Contaminated Survivor",
    description: "A radiation-sick human wielding a makeshift weapon, wandering the halls in delirium",
    health: 28,
    maxHealth: 28,
    damage: "1d8+3",
    damageType: "physical", 
    location: "HALLWAY_B4",
    isAlive: true,
    specialAbility: "radiation_exposure",
    detectChance: 0.8,
    combatStyle: "aggressive"
  },

  // Laundry Room - Irradiated pet
  {
    id: "mutant_rottweiler_001",
    name: "Irradiated Rottweiler",
    description: "A large dog that was trapped in the building during the incident. Radiation exposure has made it aggressive and enlarged its muscle mass. Its eyes glow with an eerie green light, and patches of fur have fallen out revealing scarred, discolored skin.",
    health: 32,
    maxHealth: 32,
    damage: "2d6+3",
    damageType: "bite",
    location: "LAUNDRY", 
    isAlive: true,
    specialAbility: "radiation_bite",
    detectChance: 0.7,
    combatStyle: "aggressive"
  },

  // Electrical Room - Mutated reptile
  {
    id: "glowing_gila_monster_001", 
    name: "Glowing Gila Monster",
    description: "A Gila monster that has grown to enormous size due to radiation exposure. Its entire body pulses with a sickly yellow-green bioluminescence, and its venomous bite has become even more potent. It moves slowly but strikes with deadly precision.",
    health: 28,
    maxHealth: 28,
    damage: "1d8+4",
    damageType: "venomous_bite",
    location: "ELECTRICAL_ROOM",
    isAlive: true,
    specialAbility: "toxic_venom",
    detectChance: 0.6,
    combatStyle: "ambush"
  },

  // Boiler Room - Mutated small mammal pack
  {
    id: "mutant_chinchilla_001",
    name: "Radioactive Chinchilla Pack Leader", 
    description: "The leader of a pack of chinchillas that have mutated into aggressive, rat-sized creatures. Their fur bristles with static electricity, and their normally soft coats have become coarse and metallic. They attack in coordinated swarms.",
    health: 24,
    maxHealth: 24,
    damage: "1d6+2",
    damageType: "electrical_bite",
    location: "BOILER",
    isAlive: true,
    specialAbility: "pack_coordination",
    detectChance: 0.8,
    combatStyle: "swarm"
  },
  {
    id: "mutant_chinchilla_002",
    name: "Radioactive Chinchilla",
    description: "A smaller member of the mutated chinchilla pack. Its eyes have turned completely black, and sparks occasionally arc between its whiskers.",
    health: 15,
    maxHealth: 15,
    damage: "1d4+1",
    damageType: "electrical_bite",
    location: "BOILER",
    isAlive: true,
    specialAbility: "static_shock",
    detectChance: 0.8,
    combatStyle: "swarm"
  },
  {
    id: "mutant_chinchilla_003",
    name: "Radioactive Chinchilla",
    description: "Another pack member with patchy, electrified fur and an aggressive demeanor unlike the normally docile species.",
    health: 15,
    maxHealth: 15,
    damage: "1d4+1",
    damageType: "electrical_bite",
    location: "BOILER",
    isAlive: true,
    specialAbility: "static_shock",
    detectChance: 0.8,
    combatStyle: "swarm"
  },

  // Workshop - Final Boss - Corrupted Maintenance Bot
  {
    id: "maintenance_bot_corrupted_001",
    name: "Corrupted Maintenance Android",
    description: "A building maintenance robot that has malfunctioned and become hostile. Its hydraulic arms end in cutting tools, and sparks fly from its damaged circuits. Red warning lights flash as it guards the workshop's plasma torch.",
    health: 55,
    maxHealth: 55,
    damage: "2d8+4", 
    damageType: "crushing",
    location: "WORKSHOP",
    isAlive: true,
    specialAbility: "hydraulic_crush",
    detectChance: 0.8,
    combatStyle: "boss_fight"
  }
];

// Environmental hazards by room
export const BASEMENT_HAZARDS = {
  "ELECTRICAL_ROOM": {
    name: "High Voltage Hazard",
    description: "Exposed electrical systems pose severe electrocution risk",
    triggerChance: 0.2,
    damage: "2d4+2",
    damageType: "electrical"
  },
  "BOILER": {
    name: "Scalding Steam Burst",
    description: "High-pressure steam erupts from damaged valves",
    triggerChance: 0.15,
    damage: "1d8+3",
    damageType: "heat"
  },
  "JANITOR_CLOSET": {
    name: "Chemical Exposure",
    description: "Leaked industrial chemicals create toxic fumes",
    triggerChance: 0.12,
    damage: "1d6+1",
    damageType: "chemical"
  },
  "LAUNDRY": {
    name: "Structural Instability",
    description: "Heavy machinery shifts dangerously on weakened floor supports",
    triggerChance: 0.08,
    damage: "1d8+2", 
    damageType: "crushing"
  },
  "WORKSHOP": {
    name: "Sharp Metal Debris",
    description: "Scattered metal shards and broken tools create hazardous footing",
    triggerChance: 0.1,
    damage: "1d6+2",
    damageType: "piercing"
  }
};