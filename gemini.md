# Global Context & Guidelines for Gemini

## Tech Stack

- **Vanilla Only**: Write strictly in Vanilla HTML/CSS/JS.
- **No External Libraries**: Do not use libraries like Phaser or Three.js unless explicitly requested.
- **Readability**: Code must be readable and suitable for beginners.

## Asset Management

- **Directory**: All graphics must be in the `/assets` folder.
- **Naming**: File names must be in English, lowercase, and kebab-case (e.g., `player-sprite.png`).
- **Assumption**: Assume required asset files exist.

## Mobile First

- **Touch Events**: Every game must include logic for Touch Events in addition to keyboard controls from the start.

## Error Handling & Logic

- **Math over Libraries**: If physics issues arise, implement a mathematical solution rather than importing heavy
  libraries.

## Nano Banana (Asset Placeholders)

- **Placeholders**: When a placeholder is needed, create a colored square.
- **Comment Requirement**: Add a comment in the code: `// TODO: Generate asset via Nano Banana: [Prompt description].`

## New Game Structure Standard

Every new game must be created in a dedicated subdirectory under `/games` (e.g., `/games/03-game-name`) and **MUST**
follow this exact structure:

- `/src`: Folder containing the compiled code (HTML, CSS, JS).
- `/assets`: Folder containing all game assets (generated images/sprites).
- `prompts_log.md`: A log file documenting the prompts used to generate the game.
- `README.md`: A specific readme file explaining the game and controls.
