# Prompt 1

```
under games/ create a game "06-pixel-paint-war". I want to build a simple multiplayer web game called "Grid Grab" to use as a teaching project for a student. The stack should be Node.js, Express, and Socket.io for the backend, and vanilla HTML/CSS/JS for the frontend.

Please scaffold the project and write the code for the following files: `server.js`, `public/index.html`, `public/style.css`, and `public/script.js`.

Here are the specific game rules and requirements:

1. THE LOBBY SYSTEM (Room Logic):
- Screen 1: A landing page with two buttons: "Create Game" and "Join Game".
- "Create Game": The server generates a random unique 5-letter code (e.g., "ABCDE"), creates a room, and puts Player 1 in it.
- "Join Game": Player 2 enters a code into an input box. If the room exists, they join.
- Once two players are in the room, the game starts automatically.

2. THE GAMEPLAY:
- The Board: A 4x4 grid of white tiles (divs).
- The Teams: Player 1 is "Red", Player 2 is "Blue".
- The Action: When a player clicks a tile, it changes to their color immediately.
- Stealing: Players can click tiles already owned by the opponent to "steal" them back.
- Real-time Sync: Use Socket.io to ensure the grid state matches perfectly on both screens. If Player 1 clicks, Player 2 sees the change instantly.

3. THE GAME LOOP:
- The game lasts for exactly 15 seconds.
- Display a countdown timer on the screen (synced by the server).
- When time is up, the game freezes.
- The server counts how many tiles are Red vs. Blue and declares the winner with a "Game Over" message.

4. CODING STYLE FOR EDUCATION:
- Keep the code simple and readable. Avoid complex abstractions.
- Add comments explaining specifically *how* the client and server are talking to each other (e.g., // Client sends 'click' event -> Server updates array).
- Use a simple array of 16 numbers to represent the board state on the server (0=Empty, 1=Red, 2=Blue).

Please provide the full code for all files.
```

# Prompt 2

```
start the backend and frontend and verify that it works
```

# Prompt 3

```
Rename the game to "Pixel Paint War”
```

# Prompt 4

```
move the game files under src, then create README that follows 04-rock-paper-scissors/README.md but adapted to the game
```

# Prompt 5

```
update README.md with the new game
```
