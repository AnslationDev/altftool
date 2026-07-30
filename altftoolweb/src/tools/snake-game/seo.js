const seo = {
  intro:
    "This Snake game runs the classic grow-and-avoid-yourself arcade loop on an 18x18 grid, with four speed settings that also change what each piece of food is worth: Easy moves every 160ms for 5 points, Medium 120ms for 10, Hard 90ms for 15 and Extreme 60ms for 25. You start as a three-segment snake, gain a segment for every food eaten, and the run ends the moment the head leaves the grid or hits the body. Arrow keys, WASD and on-screen touch buttons all steer it, and the page tracks high score, games played, average score and longest survival across your session.",
  useCases: [
    "You have five minutes between meetings and want a short arcade round that needs no download, install or account.",
    "You are teaching a beginner how a game loop works and want a concrete example of a fixed tick interval, a collision check and a score counter.",
    "You want to see whether your score holds up when the tick drops from 120ms to 60ms, using the average-score stat rather than a single lucky run.",
  ],
  benefits: [
    ["Speed and scoring move together", "Higher difficulty shortens the tick and raises the points per food, so an Extreme run at 25 points a piece is genuinely worth more than an Easy one at 5."],
    ["Food never spawns under the snake", "Each new food is picked from the open cells only, so you never lose a run to an unreachable or already-occupied target."],
    ["Reversals are blocked, not fatal", "Pressing the direct opposite of your current heading is ignored rather than folding the snake into itself, so a fumbled key does not instantly end the game."],
  ],
  faqs: [
    [
      "How big is the board and how fast does it move?",
      "The board is 18 by 18 cells, or 324 squares in total, and the snake advances one cell per tick. The tick is 160ms on Easy, 120ms on Medium, 90ms on Hard and 60ms on Extreme, so Extreme moves just under three times as fast as Easy.",
    ],
    [
      "How many points is each food worth?",
      "It depends on difficulty: 5 points on Easy, 10 on Medium, 15 on Hard and 25 on Extreme. The snake also grows by exactly one segment per food, starting from a body of three.",
    ],
    [
      "Can I play it on a phone?",
      "Yes — an on-screen directional pad is provided alongside keyboard control, so the game is fully playable by touch. On a desktop keyboard both the arrow keys and WASD work.",
    ],
    [
      "Are my high score and stats saved?",
      "They are kept for the current session only — high score, games played, average score and longest survival all reset when you reload or leave the page. Note down a score you want to keep before closing the tab.",
    ],
  ],
};

export default seo;
