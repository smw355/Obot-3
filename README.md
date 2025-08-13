# 🤖 OBOT-3 Explorer

[![npm version](https://badge.fury.io/js/obot-3-explorer.svg)](https://badge.fury.io/js/obot-3-explorer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A post-apocalyptic survival game via MCP (Model Context Protocol) server. Control **obot-3**, a 4-foot reconnaissance robot, from the safety of your underground bunker as it explores the contaminated ruins of downtown Los Angeles.

## 🎮 Game Overview

**The Prometheus Incident** has left downtown LA in a deadly radiation zone. You're trapped in an underground bunker with dwindling supplies. Your only hope is **obot-3** - a small robot that can venture into the contaminated areas to scavenge supplies and extend your survival.

### Key Features
- 🏠 **Bunker Management** - Monitor survival supplies and extend your life
- ⚔️ **Turn-based Combat** - Fight mutants with weapons and strategy  
- 📦 **Supply Chain** - Collect items and deliver them to your bunker
- 🗺️ **Exploration** - 15+ rooms with environmental hazards and secrets
- 🔧 **Robot Upgrades** - Find weapons, armor, and energy cells
- 📈 **Progression System** - Each successful run improves your situation

## 🚀 Quick Start

### Option 1: Install from GitHub (Recommended)
```bash
npm install github:smw355/Obot-3
npx obot-3-explorer
```
*No build step required - pre-compiled JavaScript included*

### Option 2: Run with npx (if published to npm)
```bash
npx obot-3-explorer
```

### Option 3: Global Installation from GitHub
```bash
npm install -g github:smw355/Obot-3
obot-3-explorer
```

### Option 4: MCP Client Integration
Add to your MCP client configuration:
```json
{
  "mcpServers": {
    "obot-3-explorer": {
      "command": "node",
      "args": ["path/to/node_modules/obot-3-explorer/dist/index.js"]
    }
  }
}
```

## 🎯 How to Play

### Essential Commands
```bash
start_mission     # Begin the game with story introduction
explore          # Scan current area for items, threats, exits
move <direction> # Navigate (north, south, east, west, up)
interact <target> <action>  # examine, take, attack, or use items
bunker_status    # Check survival supplies and time remaining  
return_to_bunker # Deliver collected supplies to extend survival
```

### The Gameplay Loop
1. **🚀 Deploy** - Use `start_mission` to send obot-3 into the danger zone
2. **🔍 Explore** - Navigate through 15 basement rooms, scanning for supplies
3. **⚔️ Combat** - Fight mutants and environmental hazards
4. **📦 Collect** - Gather food, weapons, energy cells, and technology
5. **🏠 Return** - Use `return_to_bunker` to deliver supplies safely
6. **📈 Progress** - Watch your survival time extend and robot improve
7. **🔁 Repeat** - Deploy again with better equipment for deeper exploration

### Robot Specifications
- **Health:** 100 HP (damaged by combat and hazards)
- **Energy:** 100 units (used by tools and weapons)  
- **Carrying Capacity:** 30 lbs (drops items when overloaded)
- **Upgrades:** Find weapons (+damage), armor (+health), energy cells (+capacity)

### Combat & Threats
- **🐀 Wire Gnawers** - Mutant rats that cause electrical glitches
- **🐌 Acid Spitters** - Creatures causing ongoing corrosive damage  
- **🦠 Scrap Crawlers** - Metal-eating bacteria that attach and corrode
- **👤 Feral Survivors** - Contaminated humans with makeshift weapons
- **🤖 Rogue Bots** - Malfunctioned maintenance units (45 HP boss fight)

### Item Types
- **🍞 Food** - Extends human survival (delivered to bunker)
- **🔋 Energy Cells** - Restore robot power and increase capacity
- **🔧 Robot Repair Kits** - Heal robot damage  
- **⚔️ Weapons** - Increase combat damage (Security Stun Baton +8 damage)
- **🛡️ Armor Plating** - Protective upgrades for robot

## 🏗️ Technical Details

### Requirements
- **Node.js** 18+ 
- **MCP Client** (Claude Desktop, Continue, or compatible)
- **Platform:** Cross-platform (Windows, macOS, Linux)

### MCP Integration
This game runs as an MCP server, providing tools that can be used by any MCP-compatible AI client:

- Works with Claude Desktop app
- Integrates with VS Code via Continue extension  
- Compatible with custom MCP clients
- Persistent SQLite database for save games

### Architecture
- **Backend:** TypeScript + SQLite for game state
- **Protocol:** MCP (Model Context Protocol) for AI integration  
- **Data:** JSON-based world configuration for easy modding
- **Distribution:** npm package for easy installation

## 🔧 Development & Modding

```bash
# Clone and setup
git clone https://github.com/smw355/Obot-3.git
cd Obot-3
npm install
npm run dev

# Build for distribution  
npm run build
```

### Adding Content
- **Rooms:** Edit `src/world-data.ts` - `BASEMENT_ROOMS`
- **Items:** Add entries to `BASEMENT_ITEMS` array
- **Enemies:** Extend `BASEMENT_MOBS` with new creatures
- **Levels:** Create new level data and update navigation

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality  
4. Submit a pull request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

**🎮 Ready to survive the wasteland? Try `npx obot-3-explorer` now!**