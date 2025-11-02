# VibeScreen 🖥️✨

**AI Ambient Companion for Second Monitors**

*Kiroween Hackathon 2024 - Frankenstein Category*

---

## 🎯 Project Overview

VibeScreen is a Next.js ambient companion application designed for second monitors, featuring AI personality modes with Three.js backgrounds and animated characters. This project combines seemingly incompatible technologies (Next.js + Three.js + AI personalities + ambient computing) for the **Frankenstein** category of the Kiroween hackathon.

### 🎨 Visual Theme
- **Aesthetic**: Linux terminal/Matrix-inspired with Fallout-style terminal elements
- **Colors**: Dark green matrix colors (#00FF00, #008F11, #003300) on dark backgrounds
- **Layout**: Full-screen 3D backgrounds with characters in bottom-right corner
- **Typography**: Monospace fonts with retro terminal styling and phosphor glow effects

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/veryimportantpers0n/vibescreen.git
   cd vibescreen
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 🎮 How to Use

### Terminal Commands
VibeScreen uses a retro terminal interface for all interactions. Hover over the bottom-left corner to reveal the terminal, then use these commands:

```bash
!help                    # Show all available commands
!switch <Character>      # Change personality mode
!characters             # List all available characters
!pause                  # Pause automatic messages
!resume                 # Resume automatic messages
!test                   # Show test message immediately
```

### Available Personality Modes
- **Corporate AI** - Professional business assistant
- **Zen Monk** - Peaceful wisdom and mindfulness
- **Chaos** - Unpredictable and energetic
- **Emotional Damage** - Dramatic and intense responses
- **Therapist** - Supportive and understanding
- **Startup Founder** - Entrepreneurial and ambitious
- **Doomsday Prophet** - Apocalyptic warnings and predictions
- **Gamer Rage** - Intense gaming reactions
- **Influencer** - Social media focused personality
- **Wholesome Grandma** - Caring and nurturing
- **Spooky** - Halloween-themed bonus character

## 🏗️ Architecture

### Core Technologies
- **Next.js** - React framework with pages router
- **Three.js** - 3D graphics and animations
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for R3F

### Project Structure
```
/
├── .kiro/                    # Hackathon specs and steering docs
├── components/               # React components
├── modes/                    # Self-contained personality modes
├── data/                     # Configuration and message data
├── pages/                    # Next.js pages
├── styles/                   # CSS styling
└── public/                   # Static assets
```

### Mode System
Each personality mode is completely self-contained:
- `config.json` - Mode settings and preferences
- `messages.json` - Personality-appropriate text messages
- `scene.js` - Three.js background environment
- `character.js` - Animated 3D character

## 🎨 Design System

### Color Palette
```css
--matrix-green: #00FF00        /* Primary terminal green */
--matrix-green-dim: #008F11    /* Secondary text */
--matrix-green-dark: #003300   /* Background accents */
--terminal-black: #000000      /* Main background */
--phosphor-glow: #00FF0080     /* Glow effects */
```

### Typography
- **Font**: Monospace terminal fonts (Courier New, Monaco, Menlo)
- **Effects**: Phosphor glow, scan lines, cursor animations
- **Accessibility**: High contrast mode, reduced motion support

## 🛠️ Development

### Adding New Personality Modes

1. Create new folder in `/modes/your-mode-name/`
2. Add required files:
   ```
   config.json      # Mode configuration
   messages.json    # Message array
   scene.js         # Three.js background scene
   character.js     # Animated character
   ```

3. Follow the existing mode structure for consistency

### Customizing Themes
- Edit CSS custom properties in `styles/globals.css`
- Modify color schemes in `data/global-config.json`
- Add new terminal effects in `styles/terminal-effects.css`

### Testing
```bash
npm run build    # Test production build
npm run lint     # Check code quality
```

## 📱 Responsive Design

VibeScreen is optimized for:
- **Desktop**: Full second-monitor experience
- **Tablet**: Adapted layout with touch controls
- **Mobile**: Simplified interface for quick interactions

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Readers**: ARIA labels and semantic HTML
- **High Contrast**: Automatic adaptation for accessibility preferences
- **Reduced Motion**: Respects user motion preferences
- **Focus Management**: Clear focus indicators throughout

## 🎃 Hackathon Submission

### Kiroween Requirements
- **Category**: Frankenstein (stitching incompatible technologies)
- **Technologies**: Next.js + Three.js + AI personalities + ambient computing
- **Deadline**: December 5, 2025
- **Compliance**: `.kiro` directory preserved with all specs and documentation

### Frankenstein Concept
This project "stitches together" technologies that don't typically work well together:
- Server-side React framework (Next.js) with client-side 3D graphics (Three.js)
- Static site generation with dynamic 3D animations
- AI personality simulation with ambient computing principles
- Terminal aesthetics with modern web technologies

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Deploy to Vercel via GitHub integration
```

### Static Export
```bash
npm run build
npm run export
# Deploy static files from /out directory
```

## 🤝 Contributing

This is a hackathon project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Kiroween Hackathon** - For the amazing event and inspiration
- **Three.js Community** - For incredible 3D web graphics tools
- **Next.js Team** - For the excellent React framework
- **Matrix/Terminal Aesthetics** - For the nostalgic computing vibes

---

**Built with ❤️ for the Kiroween Hackathon 2024**

*"Bringing AI personalities to your second monitor, one terminal command at a time."*