# Platform of Things

A 3D interactive portfolio website built with Three.js. Explore different worlds to learn about my skills, projects, education, and more.

## Overview

Platform of Things is a first-person exploration experience where each section of a traditional portfolio is represented as a unique world with its own atmosphere, decorations, and interactive elements.

### Worlds

| World | Name | Section | Description |
|-------|------|---------|-------------|
| Home | Hearth | Welcome | Central hub with portals to all other worlds |
| Story | Chronicle | My Story | A cinema-style space showcasing my journey |
| Skills | Grove | Skills | Technology logos displayed as flower beds with aurora effects |
| Education | Haven | Education | Stage with qualifications and certifications |
| Articles | Inkwell | Articles | Library with interactive bookshelves |
| Projects | Workshop | Projects | Showcases what I build |

## Features

- First-person controls with WASD movement and mouse look
- Portal-based navigation between worlds
- Interactive elements (hologram terminal, bookshelves, credits sign)
- Dynamic atmospheric effects (fireflies, aurora, floating text constellations)
- Companion dog named Ivy that follows you around
- Ambient music and environmental decorations

## Controls

| Key | Action |
|-----|--------|
| W / Arrow Up | Move forward |
| S / Arrow Down | Move backward |
| A / Arrow Left | Strafe left |
| D / Arrow Right | Strafe right |
| Space | Jump |
| Shift | Sprint |
| E | Interact |
| Mouse | Look around |

## Tech Stack

- **Three.js** - 3D graphics library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/rexchoppers/platform-of-things.git

# Navigate to the project directory
cd platform-of-things

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The site will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

## Project Structure

```
src/
├── assets/          # Images, logos, and media files
├── config/          # Planet configurations
├── core/            # Core game logic (PlayerController)
├── environment/     # Terrain, Skybox
├── objects/         # 3D objects (Portal, Terminal, Decorations, Dog)
├── systems/         # Game systems (PlanetManager)
├── ui/              # UI management
├── Game.ts          # Main game class
├── main.ts          # Entry point
└── style.css        # Styles
```

## Live

Visit [rexchoppers.com](https://rexchoppers.com)

## Vibe Coded?

A lot of AI was used in order to build the assets, lighting etc.. Helped me learn Three.js fast. 3D games are not my strongest skill and the machines haven't replaced me (yet)

## License

MIT License - see [LICENSE](LICENSE) for details.

