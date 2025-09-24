import { Database } from './database.js';
export interface NavigationPath {
    rooms: string[];
    directions: string[];
    totalDistance: number;
    energyCost: number;
}
export interface FastTravelLocation {
    id: string;
    name: string;
    description: string;
    energyCost: number;
}
export declare class NavigationSystem {
    private db;
    private fastTravelLocations;
    constructor(db: Database);
    /**
     * Find the shortest path between two rooms using Dijkstra's algorithm
     */
    findPath(fromRoom: string, toRoom: string): Promise<NavigationPath | null>;
    /**
     * Get all discovered rooms from database
     */
    private getDiscoveredRooms;
    /**
     * Build adjacency graph from discovered rooms, checking access requirements
     */
    private buildRoomGraph;
    /**
     * Check if a room is accessible based on current player inventory and game state
     */
    private isRoomAccessible;
    /**
     * Dijkstra's shortest path algorithm
     */
    private dijkstra;
    /**
     * Convert room path to movement directions
     */
    private convertPathToDirections;
    /**
     * Find room by partial name match
     */
    findRoomByName(searchName: string): string | null;
    /**
     * Get fast travel locations
     */
    getFastTravelLocations(): FastTravelLocation[];
    /**
     * Execute fast travel to a key location
     */
    executeFastTravel(locationId: string): Promise<{
        success: boolean;
        message: string;
        energyCost: number;
    }>;
    /**
     * Get navigation summary for current area
     */
    getNavigationSummary(currentRoom: string): string;
}
//# sourceMappingURL=navigation.d.ts.map