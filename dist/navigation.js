"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationSystem = void 0;
const world_data_js_1 = require("./world-data.js");
class NavigationSystem {
    db;
    // Key locations for fast travel
    fastTravelLocations = [
        { id: 'BUNKER', name: 'Command Bunker', description: 'Your secure command center', energyCost: 2 },
        { id: 'STORAGE_15', name: 'Starting Point', description: 'Storage Unit 15 - obot-3 base', energyCost: 1 },
        { id: 'STAIRS_UP', name: 'Exit Stairs', description: 'Stairs to lobby (if cleared)', energyCost: 3 },
        { id: 'HATCH_DOWN_SEALED_2', name: 'Tunnel Hatch', description: 'Access to sub-basement tunnels (if cleared)', energyCost: 3 },
        { id: 'LAUNDRY', name: 'Community Laundry', description: 'Central laundry facility', energyCost: 2 },
        { id: 'MECHANICAL_ROOM', name: 'Mechanical Room', description: 'Building systems control', energyCost: 2 }
    ];
    constructor(db) {
        this.db = db;
    }
    /**
     * Find the shortest path between two rooms using Dijkstra's algorithm
     */
    async findPath(fromRoom, toRoom) {
        // Get all discovered rooms
        const discoveredRooms = await this.getDiscoveredRooms();
        if (!discoveredRooms.has(toRoom)) {
            return null; // Cannot navigate to undiscovered room
        }
        // Build graph of discovered rooms only, checking access requirements
        const graph = await this.buildRoomGraph(discoveredRooms);
        // Run Dijkstra's algorithm
        const path = this.dijkstra(graph, fromRoom, toRoom);
        if (!path)
            return null;
        // Convert room path to directions
        const directions = this.convertPathToDirections(path);
        return {
            rooms: path,
            directions,
            totalDistance: path.length - 1,
            energyCost: path.length - 1 // 1 energy per room movement
        };
    }
    /**
     * Get all discovered rooms from database
     */
    async getDiscoveredRooms() {
        const discoveredRooms = new Set();
        // Query database for actually discovered rooms
        for (const roomId of Object.keys(world_data_js_1.BASEMENT_ROOMS)) {
            const room = await this.db.getRoom(roomId);
            if (room && room.discovered) {
                discoveredRooms.add(roomId);
            }
        }
        return discoveredRooms;
    }
    /**
     * Build adjacency graph from discovered rooms, checking access requirements
     */
    async buildRoomGraph(discoveredRooms) {
        const graph = new Map();
        for (const roomId of discoveredRooms) {
            const roomData = world_data_js_1.BASEMENT_ROOMS[roomId];
            if (!roomData)
                continue;
            const neighbors = [];
            for (const [direction, targetRoom] of Object.entries(roomData.exits)) {
                if (discoveredRooms.has(targetRoom)) {
                    // Check if target room is accessible (not blocked by unmet requirements)
                    const isAccessible = await this.isRoomAccessible(targetRoom);
                    if (isAccessible) {
                        neighbors.push(targetRoom);
                    }
                }
            }
            graph.set(roomId, neighbors);
        }
        return graph;
    }
    /**
     * Check if a room is accessible based on current player inventory and game state
     */
    async isRoomAccessible(roomId) {
        const roomData = world_data_js_1.BASEMENT_ROOMS[roomId];
        if (!roomData)
            return false;
        // Check maintenance keycard requirements
        if (roomData.requires_maintenance_keycard) {
            const items = await this.db.getItemsInLocation('inventory');
            const hasKeycard = items.some(item => item.id === 'maintenance_keycard_001');
            if (!hasKeycard) {
                return false;
            }
        }
        // Check physical maintenance keys requirements
        if (roomData.requires_maintenance_keys) {
            const items = await this.db.getItemsInLocation('inventory');
            const hasKeys = items.some(item => item.id === 'maintenance_keys_001');
            if (!hasKeys) {
                return false;
            }
        }
        // Check for plasma torch requirements
        if (roomData.requires_plasma_torch) {
            const items = await this.db.getItemsInLocation('inventory');
            const hasTorch = items.some(item => item.id === 'plasma_torch_001');
            if (!hasTorch) {
                return false;
            }
        }
        // Check for boxes blocking (can be cleared, so check if already cleared)
        if (roomData.blocked_by_boxes) {
            const boxesCleared = await this.db.hasDiscoveredContent('boxes_cleared_caretaker');
            if (!boxesCleared) {
                return false;
            }
        }
        // Check generic locked doors (without specific unlock methods)
        if (roomData.locked && !roomData.requires_maintenance_keycard && !roomData.requires_maintenance_keys) {
            return false;
        }
        return true;
    }
    /**
     * Dijkstra's shortest path algorithm
     */
    dijkstra(graph, start, end) {
        const distances = new Map();
        const previous = new Map();
        const unvisited = new Set();
        // Initialize distances
        for (const room of graph.keys()) {
            distances.set(room, room === start ? 0 : Infinity);
            previous.set(room, null);
            unvisited.add(room);
        }
        while (unvisited.size > 0) {
            // Find unvisited room with minimum distance
            let current = null;
            let minDistance = Infinity;
            for (const room of unvisited) {
                const distance = distances.get(room) || Infinity;
                if (distance < minDistance) {
                    minDistance = distance;
                    current = room;
                }
            }
            if (!current || minDistance === Infinity)
                break;
            if (current === end)
                break;
            unvisited.delete(current);
            // Check neighbors
            const neighbors = graph.get(current) || [];
            for (const neighbor of neighbors) {
                if (!unvisited.has(neighbor))
                    continue;
                const altDistance = (distances.get(current) || 0) + 1;
                if (altDistance < (distances.get(neighbor) || Infinity)) {
                    distances.set(neighbor, altDistance);
                    previous.set(neighbor, current);
                }
            }
        }
        // Reconstruct path
        if (!previous.has(end) || previous.get(end) === null)
            return null;
        const path = [];
        let current = end;
        while (current !== null) {
            path.unshift(current);
            current = previous.get(current) || null;
        }
        return path;
    }
    /**
     * Convert room path to movement directions
     */
    convertPathToDirections(rooms) {
        const directions = [];
        for (let i = 0; i < rooms.length - 1; i++) {
            const currentRoom = rooms[i];
            const nextRoom = rooms[i + 1];
            const roomData = world_data_js_1.BASEMENT_ROOMS[currentRoom];
            if (!roomData)
                continue;
            // Find which direction leads to next room
            for (const [direction, targetRoom] of Object.entries(roomData.exits)) {
                if (targetRoom === nextRoom) {
                    directions.push(direction);
                    break;
                }
            }
        }
        return directions;
    }
    /**
     * Find room by partial name match
     */
    findRoomByName(searchName) {
        const lowerSearch = searchName.toLowerCase();
        // First try exact match on room ID
        if (world_data_js_1.BASEMENT_ROOMS[searchName.toUpperCase()]) {
            return searchName.toUpperCase();
        }
        // Then try fuzzy matching on room names
        for (const [roomId, roomData] of Object.entries(world_data_js_1.BASEMENT_ROOMS)) {
            const roomName = roomData.name.toLowerCase();
            if (roomName.includes(lowerSearch) || lowerSearch.includes(roomName)) {
                return roomId;
            }
        }
        return null;
    }
    /**
     * Get fast travel locations
     */
    getFastTravelLocations() {
        return this.fastTravelLocations;
    }
    /**
     * Execute fast travel to a key location
     */
    async executeFastTravel(locationId) {
        const location = this.fastTravelLocations.find(loc => loc.id === locationId);
        if (!location) {
            return {
                success: false,
                message: `Fast travel location "${locationId}" not found.`,
                energyCost: 0
            };
        }
        // In a full implementation, we'd check if the location is accessible
        // and update the game state
        return {
            success: true,
            message: `🚀 **FAST TRAVEL INITIATED**\n\nTransporting obot-3 to ${location.name}...\n\n${location.description}\n\nNavigation systems engaged - arrival confirmed.`,
            energyCost: location.energyCost
        };
    }
    /**
     * Get navigation summary for current area
     */
    getNavigationSummary(currentRoom) {
        const roomData = world_data_js_1.BASEMENT_ROOMS[currentRoom];
        if (!roomData)
            return "Navigation data unavailable for current location.";
        const exits = Object.entries(roomData.exits);
        const exitList = exits.map(([dir, room]) => {
            const targetData = world_data_js_1.BASEMENT_ROOMS[room];
            return `  • ${dir}: ${targetData?.name || room}`;
        }).join('\n');
        return `🗺️ **NAVIGATION SUMMARY**\n**Current:** ${roomData.name}\n**Available Exits:**\n${exitList}`;
    }
}
exports.NavigationSystem = NavigationSystem;
//# sourceMappingURL=navigation.js.map