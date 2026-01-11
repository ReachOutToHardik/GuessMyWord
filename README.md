# Guess My Word

> A real-time multiplayer word guessing game with a premium "Dark Glassmorphism" aesthetic.

**Guess My Word** (formerly *Mind Reader Duo*) is a 2-player interactive web game where players take turns being the "Picker" and the "Guesser". The Picker chooses a secret word, and the Guesser asks Yes/No questions to deduce it while the Picker answers live!

## ✨ Features
- **Real-Time Multiplayer**: Instant synchronization of game state, questions, and guesses using Socket.io.
- **Unified Chat History**: A seamless investigation log showing both questions and guesses in chronological order.
- **Premium UI/UX**: Responsive "Dark Glass" design with smooth animations and neon accents.
- **Role-Based Interfaces**: Distinct views for Pickers (answering/managing) and Guessers (investigating).
- **Mobile Optimized**: Sticky bottom controls for easy play on smaller screens.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/ReachOutToHardik/GuessMyWord.git
    cd guess-my-word
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Game Locally
To start the game in development mode:

```bash
npm run dev:all
```

-   **Frontend**: `http://localhost:5173`
-   **Backend**: `http://localhost:3001`

### 🌐 Deployment
This project is configured for one-click deployment to **Render** using the included `render.yaml`.

1.  Push your code to GitHub.
2.  Connect your repo to Render.
3.  Render will automatically detect the blueprint and set up your web service!

> **Note**: Open the frontend in two different browser tabs (or devices) to simulate two players!

## 🎨 Design System

The application uses **Tailwind CSS** (via CDN with custom config) to create a cohesive visual language.

### Color Palette
| Token | Hex | Usage |
| :--- | :--- | :--- |
| `game-bg` | `#0f172a` | Main application background (Deep Slate) |
| `game-surface` | `#1e293b` | Card and panel backgrounds |
| `game-primary` | `#8b5cf6` | Primary actions, gradients (Violet) |
| `game-secondary` | `#ec4899` | Secondary gradients (Pink) |
| `game-accent` | `#06b6d4` | Highlights and special indicators (Cyan) |
| `game-success` | `#10b981` | Correct answers, victory state (Emerald) |
| `game-error` | `#ef4444` | Incorrect guesses, errors (Red) |

### Typography
-   **Font Family**: `Plus Jakarta Sans`
-   **Weights**: Light (300) to ExtraBold (800)

### UI Components
-   **Glass Panels**: `bg-slate-900/60 backdrop-blur-xl border border-white/10 shadow-xl`
-   **Input Fields**: Dark themed (`bg-slate-900/50`) with white text for maximum readability.
-   **Action Buttons**: Gradient backgrounds (`from-game-primary to-game-secondary`) with hover scale effects.

## 🛠️ Technology Stack
-   **Frontend**: React 19, TypeScript, Vite
-   **Styling**: Tailwind CSS
-   **Backend**: Node.js, Express
-   **Real-time Communication**: Socket.io
-   **AI Integration**: Google Gemini API (experimental)

## 🔮 Future Roadmap
See `improvements.md` for a detailed list of planned features, including:
-   AI Picker Mode
-   Sound Effects
-   Spectator Mode

---
Developed with ❤️ by the **Guess My Word** Team.
