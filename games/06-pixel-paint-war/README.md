# Pixel Paint War

A fast-paced real-time multiplayer board game where players compete to paint a 4x4 grid. Capture as many tiles as
possible in 15 seconds!

## Structure (Under `src/`)

- `server.js`: Node.js, Express, and Socket.io backend managing rooms and synchronization.
- `public/index.html`: Main game structure and lobby interface.
- `public/style.css`: Premium aesthetics and responsive grid design.
- `public/script.js`: Client-side game logic and real-time Socket.io communication.

## How to Play

- **Launch the game**: Run `npm start` and open `http://localhost:3000`.
- **Create or Join**:
  - Click "Create New Game" to generate a unique 5-letter room code.
  - Share the code with a friend to have them "Join Game".
- **Battle**:
  - The game starts automatically when two players are in the room.
  - Player 1 is **Red**, Player 2 is **Blue**.
  - Click any tile to change it to your color.
  - You can "steal" tiles already owned by your opponent by clicking them.
- **Winning**:
  - A synchronized 15-second timer runs on the server.
  - When time hits zero, the tiles are counted.
  - The player with the most tiles of their color wins the match!
