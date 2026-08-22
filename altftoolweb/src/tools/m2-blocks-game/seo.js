const seo = {
  title: "Merge Blocks: Column-Drop 2048 on a 6x8 Board",
  steps: [
    "Tap a column on the 6-column by 8-row board to launch the next numbered block; two touching blocks of the same value merge into their double.",
    "Reach the target beside LV — 32 on level 1, 64 on level 2 — before the moves left counter runs out, spending Undo, Shuffle or Hammer boosters if you stall.",
    "Clear the target to see your star rating, then press Next Level for the doubled target or Retry Level to replay the same one.",
  ],
  intro:
    "Merge Blocks is a column-drop puzzle game played on a 6-column by 8-row board, where you launch numbered blocks into a column and any two matching numbers that end up touching combine into their double, chaining upward as long as the new value keeps matching. Each level asks you to reach a target of 2 to the power of (4 + level) — 32 on level 1, 64 on level 2, 128 on level 3 and so on — within a move budget that starts at 21 and tightens by one per level down to a floor of 10. It is a short-session number puzzle for anyone who likes 2048 but wants a drop-and-stack board with a clear goal per round.",
  useCases: [
    "Wanting a five-minute puzzle on a phone during a commute where each round has a defined finish line rather than an endless board.",
    "Practising the merge-chain instinct from 2048 in a format where you choose the column instead of sliding the whole grid, so a single well-placed block can trigger a multi-step chain.",
    "Playing with a child who is learning doubling — 2, 4, 8, 16, 32 — and can see each pair combine into the next power of two as it lands.",
  ],
  benefits: [
    [
      "A target and a move budget every level",
      "You always know what number you are chasing and how many drops are left, so the round ends in a result rather than trailing off.",
    ],
    [
      "Chains resolve upward automatically",
      "A landing block keeps merging with the one beneath it for as long as the values match, and a chain of two or more merges is flagged as a combo.",
    ],
    [
      "Boosters instead of a dead board",
      "You start each run with 3 undos, 3 shuffles and 2 hammers, and the hammer clears the locked obstacle blocks that begin appearing from level 3.",
    ],
  ],
  faqs: [
    [
      "What number do I need to reach to clear a level?",
      "2 to the power of (4 + the level number): 32 on level 1, 64 on level 2, 128 on level 3, 256 on level 4 and doubling from there. The target is shown at the top of the board, and the level ends the moment your highest tile reaches it.",
    ],
    [
      "How many moves do I get?",
      "22 minus the level number, with a floor of 10 — so 21 moves on level 1, 20 on level 2, and 10 from level 12 onward. Finishing with at least half your moves unused earns 3 stars, at least a fifth earns 2, and anything less earns 1.",
    ],
    [
      "What are the grey locked blocks?",
      "They are obstacle blocks that never merge, and they start appearing from level 3 with a chance that rises by 2.5 percentage points per level up to a cap of 18 percent per drop. The hammer booster is the only way to remove one.",
    ],
    [
      "How is the score calculated?",
      "Every merge adds the value of the block it produces, so combining two 16s adds 32 and a chain adds each step separately. A three-step chain starting from 2+2 and climbing to 16 therefore scores 4 plus 8 plus 16, which is why chains are worth far more than isolated merges.",
    ],
  ],
};

export default seo;
