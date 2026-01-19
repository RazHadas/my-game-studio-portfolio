# Pong Game Prompts Log

## Prompt 1: Initial Creation

> Create a classic Pong game using HTML5 Canvas. Player paddle on the left (mouse controlled), Enemy paddle on the
> right (AI controlled).

## Implementation Details

- Used Vanilla JS and HTML5 Canvas.
- Implemented Mouse and Touch controls for mobile compatibility.
- Simple AI tracks ball Y position.
- Canvas drawing for all elements (no external assets yet).

## Prompt 2: Difficulty Adjustment

> The computer is too good. I can't make points.

**Changes:**

- Reduced AI speed from 5 to 4.
- AI now only moves when the ball is moving towards it (velocityX > 0).
