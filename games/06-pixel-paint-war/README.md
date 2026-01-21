# Pixel Paint War

A fast-paced real-time multiplayer board game where players compete to paint a 4x4 grid. Capture as many tiles as possible in 15 seconds!

## Structure (Under `games/06-pixel-paint-war/`)

- `/src`: Folder containing the game code.
  - `firebase-config.js`: Configuration for the Firebase Realtime Database.
  - `index.html`: Main game structure and lobby interface.
  - `style.css`: Professional aesthetics and responsive grid design.
  - `script.js`: Client-side game logic and Firebase synchronization.
- `/assets`: Folder for game assets (currently uses CSS placeholders).
- `prompts_log.md`: Log file documenting the deployment and development prompts.
- `README.md`: This file.

## How to Play

### 1. Launching the Game
- Open `index.html` in a web browser (or serve it locally).

### 2. Create or Join
- **Create**: Click "Create New Game" to generate a unique 5-letter room code.
- **Join**: Enter a 5-letter code shared by a friend and click "Join Game".

### 3. Controls
- **Desktop**: Click on any grid tile to paint it with your color.
- **Mobile**: Tap on any grid tile to paint it.

### 4. Gameplay
- Player 1 is **Red**, Player 2 is **Blue**.
- The game starts automatically once both players have joined.
- You can "steal" tiles already owned by your opponent.
- A 15-second timer counts down the battle.

### 5. Winning
- When the timer hits zero, the tiles of each color are counted.
- The player with the most tiles wins!

## Deployment Note
This game uses **Firebase Realtime Database** for multiplayer synchronization. When deploying to GitHub Pages, ensure secrets are managed via GitHub Actions to maintain security for your `firebase-config.js`.
