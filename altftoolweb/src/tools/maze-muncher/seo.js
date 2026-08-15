const seo = {
  title: "Maze Muncher — Maze Arcade Game with Four Smart Ghosts",
  metaDescription:
    "Clear a 19x21 maze while four ghosts with different chase styles hunt you. Pellets 10 pts, power pellets 50, frightened ghosts 200. Keys, WASD or swipe.",
  steps: [
    "Click 'Start game' or press Space — you begin with 3 lives on the 19x21 maze.",
    "Steer with the arrow keys, WASD, a swipe on the board or the on-screen pad; grab a power pellet to make the ghosts edible for 8 seconds at 200 points each.",
    "Clear every pellet to advance a level — Score, Best, Level and Lives show above the board, and your best score is saved in this browser.",
  ],
  intro:
    "Maze Muncher is a browser maze arcade game on a hand-designed 19x21 grid where you clear every pellet while four ghosts with different chase behaviours hunt you down. Pellets are worth 10 points, power pellets 50, and each ghost you catch during the 8-second frightened window is worth 200. You start with 3 lives, steer with arrow keys, WASD, a swipe or the on-screen pad, and both you and the ghosts get faster on every level you clear.",
  useCases: [
    "You want a five-minute arcade break at a desk without installing anything, and you want the score to still be there tomorrow rather than resetting every visit.",
    "You are showing a child a classic maze game and want to explain why the pink ghost keeps cutting you off — here it aims four tiles ahead of the direction you are facing, not at where you are.",
    "You are on a phone with no keyboard and want a maze game that actually steers properly, so you use swipe gestures or the on-screen D-pad instead of fighting with tiny arrow buttons.",
  ],
  benefits: [
    ["Four genuinely different ghosts", "The chaser targets your tile, the ambusher aims four tiles ahead of you, the patrol cycles the maze corners and the wanderer moves randomly."],
    ["Speeds ramp per level", "Your speed climbs from 5.5 tiles per second and ghost speed from 4.6, so later levels tighten the gap rather than just adding pellets."],
    ["Sound is synthesised, not downloaded", "Chomps, power-ups and level jingles are generated with short Web Audio oscillator envelopes, so nothing extra loads and muting simply skips them."],
  ],
  faqs: [
    [
      "How do you score points in Maze Muncher?",
      "A normal pellet is 10 points, a power pellet is 50, and eating a frightened ghost is 200 points each. Clearing every pellet in the maze advances you to the next level, where both you and the ghosts move faster.",
    ],
    [
      "How long do the ghosts stay edible after a power pellet?",
      "8 seconds. During that window the ghosts turn frightened, immediately reverse direction, and slow to about 3.1 tiles per second, which is slower than you, so you can run them down.",
    ],
    [
      "What are the controls?",
      "Arrow keys or WASD to steer, Space to start or pause, Enter to start, and P to pause. On touch devices you can swipe anywhere on the board or use the on-screen directional pad.",
    ],
    [
      "Is my best score saved?",
      "Yes, your highest score is kept in your own browser's local storage under a per-game key and only overwritten when you beat it. It is never uploaded, so clearing site data, switching devices or playing in a private window starts you from zero.",
    ],
  ],
};

export default seo;
