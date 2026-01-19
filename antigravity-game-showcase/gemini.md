# Gemini Global Context & SOP

## Tech Stack

- **Framework**: Vanilla HTML, CSS, JavaScript ONLY.
- **Libraries**: Do NOT use external libraries (Phaser, Three.js, Lodash, etc.) unless explicitly requested.
- **Readability**: Code must be clean, commented, and readable for beginners.

## Asset Management

- **Directory**: All graphics must go to `./assets/`.
- **Naming**: English, lowercase, kebab-case (e.g., `snake-head.png`, `energy-battery.png`).
- **Assumption**: Assume generated assets exist at these paths.
- **Placeholders**: If generating placeholders, use colored rectangles and add a comment:
  `// TODO: Generate asset via Nano Banana: [Prompt description].`

## Mobile First

- **Touch Events**: Every game MUST include touch controls (touchstart, touchmove, touchend) in addition to
  keyboard/mouse event listeners.
- **Responsiveness**: Use CSS Grid/Flexbox to ensure the canvas fits different screen sizes.

## Error Handling

- **Physics/Logic**: If physics break, fix with better math functions, not heavy libraries.
- **No Popups**: NEVER use `alert()`, `prompt()`, or `confirm()`. Create custom HTML overlays for game over / pause
  screens.

## Nano Banana (Image Generation)

- **Constraint**: No free assets from the web. All assets must be AI-generated or CSS shapes.
- **Coherence**: Maintain a consistent art style (e.g., Pixel Art, Neon, Vector) within a single game.

## Workflow

- **No Manual Fixes**: If a bug is found, fix it via the Agent/Prompt, not by editing the file manually.
- **Golden Prompts**: Log successful prompts in `prompts_log.md` for each game.
