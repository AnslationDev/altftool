const seo = {
  title: "Dino Dash Runner: Free Endless Jump-and-Duck Game",
  metaDescription:
    "Endless browser runner: jump pillars, duck drones, hold duck mid-air for a 2.2x fast fall. Speed ramps 330 to 800 px/s; your best score is saved locally.",
  steps: [
    "Press Start run, or hit Space, W or the up arrow to begin — on touch devices the Jump and Duck buttons sit under the track.",
    "Jump the pillar clusters and duck under the drones with S or the down arrow; holding duck in mid-air multiplies gravity 2.2x for a fast fall, and P pauses.",
    "When you crash, the Run over card shows your Score and Best — the best score persists in this browser's local storage — and Restart begins a new run.",
  ],
  intro:
    "Dino Dash Runner is an endless runner where you jump pillar clusters and duck under hovering drones while the world accelerates from 330 to 800 pixels per second over your first 3,200 points. Holding the duck key in mid-air multiplies gravity by 2.2 for a fast fall, which is the move that saves you when a low drone appears right after a jump. The palette flips between day and night every 500 points, sound is off until you switch it on, and your best score is kept in this browser.",
  useCases: [
    "You want a five-minute reflex break that starts instantly on a keypress, with no download, sign-in or tutorial",
    "You are beating your own record and want the best score to still be there when you come back tomorrow",
    "You are on a phone and want the same jump-and-duck runner driven by two large touch buttons instead of a keyboard",
  ],
  benefits: [
    ["Fast-fall changes the game", "Holding duck while airborne accelerates the descent 2.2×, so a mistimed jump is recoverable instead of fatal."],
    ["Forgiving hitboxes", "Both the player and each obstacle are inset by several pixels before collision is tested, so near-misses read as near-misses rather than cheap deaths."],
    ["Your best score persists", "The record is stored locally per game, so it survives a reload — nothing is uploaded and no account is involved."],
  ],
  faqs: [
    [
      "What are the controls?",
      "Space, the up arrow or W jumps; the down arrow or S ducks on the ground and fast-falls in the air; P pauses. On touch devices the two buttons under the canvas do the same, and holding the duck button works exactly like holding the key.",
    ],
    [
      "When do the flying obstacles start?",
      "At 350 points, after which roughly a third of spawns are drones instead of ground pillars. They hover at two heights — the low one, 44 pixels above the ground, has to be ducked or cleared with a well-timed jump, while the high one at 96 pixels can be run straight under.",
    ],
    [
      "How fast does the game get?",
      "Speed ramps linearly from 330 pixels per second at the start to a maximum of 800 at 3,200 points, and stays there. The spacing between obstacles scales with speed too — the minimum gap is 250 pixels plus half the current speed — so the pressure is timing rather than an ever-shrinking window.",
    ],
    [
      "Is my best score saved between visits?",
      "Yes, in this browser's local storage under a key specific to this game, and only when a run beats the previous best. Clearing site data, private browsing or switching to another browser or device starts you back at no record.",
    ],
  ],
};

export default seo;
