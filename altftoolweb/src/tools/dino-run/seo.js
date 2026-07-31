const seo = {
  intro:
    "Dino Run is a canvas endless runner in the style of the offline dinosaur game: you jump cacti and duck under pterodactyls while the world scrolls faster the longer you survive. Speed starts at 480 pixels per second and rises by 28 for every 180 points, capping at 1,200 — two and a half times the opening pace — with obstacles spawning as often as every 0.52 seconds at high scores. Space or the up arrow jumps, the down arrow ducks, and on-screen buttons do the same on a phone.",
  useCases: [
    "Your connection drops mid-task and you want the offline-dino reflex game without having to be offline to get it",
    "You have four minutes between meetings and want something that starts on one keypress and needs no account or tutorial",
    "You are on a phone with no keyboard and still want the jump-and-duck runner, using the two touch buttons under the canvas",
  ],
  benefits: [
    ["Real difficulty curve, not a flat loop", "Scroll speed climbs in fixed steps with your score and the gap between obstacles shrinks, so the run changes character rather than just lasting longer."],
    ["Ducking actually matters", "Birds fly at three heights — 60, 110 and 140 pixels above the ground — so the lowest ones must be ducked, while the two higher tiers already clear a standing or ducking dino and only become a threat if you jump into their path."],
    ["Live speed and score readout", "Score, high score and the current speed multiplier are shown outside the canvas, so you can see exactly when the game stepped up."],
  ],
  faqs: [
    [
      "How do I play?",
      "Press space or the up arrow to jump and hold the down arrow to duck; on touch devices use the JUMP and DUCK buttons below the canvas. You cannot jump while ducking, and score accumulates continuously with distance rather than per obstacle.",
    ],
    [
      "When do the birds start appearing?",
      "Once the scroll speed passes 800 pixels per second, which happens at roughly 2,160 points. From then on each spawn has about a 28% chance of being a bird instead of a cactus.",
    ],
    [
      "How fast does it get?",
      "The speed is capped at 1,200 pixels per second, reached at about 4,680 points. Obstacle spacing keeps tightening separately, with a hard floor of 0.52 seconds between spawns, so the ceiling is reaction time rather than raw speed.",
    ],
    [
      "Is my high score saved?",
      "Only for the current session — the high score resets if you reload or close the tab, since nothing is written to storage or to an account. Nothing about your play is uploaded either; the whole game runs in the canvas on your device.",
    ],
  ],
};

export default seo;
