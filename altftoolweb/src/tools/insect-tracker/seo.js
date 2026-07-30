const seo = {
  intro:
    "Insect Tracker is a timed reflex arcade game where you tap butterflies, bees, ladybugs, dragonflies, fireflies, beetles and ants before they fly off the edge of the play area. Each type is worth a different score — 6 points for an ant up to 18 for a fast dragonfly — and catches within 2.5 seconds of each other build a combo multiplier that rises to 8x. Clearing 200, 500, 900 and 1,400 cumulative points moves you up through five levels, and every level makes insects 12% faster, spawns them more often and shortens how long they stay on screen.",
  useCases: [
    "You have five minutes between meetings and want a round that ends on its own — Easy gives you 75 seconds, Medium 60 and Hard 50, so the session length is decided before you start.",
    "Practising the tap-accuracy and target-tracking that mobile games and drawing tablets both demand, with difficulty that ramps automatically instead of staying flat.",
    "Trying to beat the high score you set yesterday: it is stored in your browser, so the number is still there next time you open the page.",
  ],
  benefits: [
    ["Difficulty escalates on a curve, not a cliff", "Each level shortens the spawn interval to 88% and insect lifetime to 90% of the previous one while adding another insect to the screen."],
    ["Combo rewards rhythm over speed alone", "The multiplier only survives if your next catch lands within 2.5 seconds, so a steady chain of ants can outscore scattered dragonfly hits."],
    ["Rarer insects are actually rarer", "Spawning is weighted per type, so the 18-point dragonfly appears less often than the 6-point ant and is worth chasing when it does."],
  ],
  faqs: [
    [
      "How do you score points in Insect Tracker?",
      "Tap an insect before it escapes and you get its base points multiplied by your current combo. Base values run from 6 for an ant to 18 for a dragonfly, and the combo multiplier caps at 8x, so a chained dragonfly catch is worth up to 144 points.",
    ],
    [
      "How many lives do you get?",
      "Five on Easy, four on Medium and three on Hard, plus one extra if you pick a favourite insect before starting. You lose one each time an insect escapes the play area, and the run ends when they reach zero or the timer runs out.",
    ],
    [
      "How many levels are there?",
      "Five. You reach them at 200, 500, 900 and 1,400 cumulative points, and each one raises insect speed by 12%, adds one more insect on screen up to a ceiling of 14, and cuts spawn interval and insect lifetime.",
    ],
    [
      "Is my high score saved?",
      "Yes, in your browser's local storage along with your sound and music preferences, so it persists between visits on the same device and browser. It is not tied to an account, so clearing site data or switching browsers starts you back at zero.",
    ],
  ],
};

export default seo;
