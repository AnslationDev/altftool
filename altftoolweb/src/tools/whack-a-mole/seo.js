const seo = {
  title: "Whack a Mole Game Online — Free, 30-Second Rounds",
  h1: "Whack a Mole Game",
  metaDescription:
    "Classic whack-a-mole: a mole pops up in one of 9 holes every 0.8s for 30 seconds. Hit it for +1, a bomb for -5. Free, no download, no signup.",
  intro:
    "Whack a Mole is a 30-second reflex game played on a 3×3 grid of nine holes. An 800 ms interval spawns a mole into a hole picked with Math.random(), and each mole stays visible for a randomised 600 to 1,100 ms before dropping back down. Catching the mole is +1; on roughly 30% of spawns a bomb also appears in a different hole, and hitting that subtracts 5, with the score floored at zero. The clock, the grid and both scores are plain React state — the game makes no network requests and writes nothing to storage, so nothing about your play leaves the browser.",
  useCases: [
    "Warm up hand-eye coordination and click accuracy in a single 30-second burst before a game or a timed task.",
    "Hand a child a one-tap game on a phone or tablet — nothing to read, nothing to install, no account.",
    "Fill a short desk break with a fixed-length round that ends on its own instead of an open-ended game.",
  ],
  benefits: [
    [
      "Fixed 30-second rounds",
      "A one-second interval counts down from 30 and ends the round at zero, so every game is exactly the same length and scores are directly comparable run to run.",
    ],
    [
      "Bombs punish spam-clicking",
      "A bomb appears on about 30% of spawns and costs 5 points, so tapping every hole indiscriminately scores worse than aiming. The score is clamped at zero, so it never goes negative.",
    ],
    [
      "Randomised timing, not a fixed rhythm",
      "Each mole's visible window is re-rolled between 600 and 1,100 ms, so you cannot memorise a cadence — the target hole is drawn fresh from all nine each spawn.",
    ],
    [
      "Nothing installed, nothing sent",
      "The whole game is one client-side React component: no download, no signup, no server call, and no local storage. Your score exists only in the open page.",
    ],
  ],
  faqs: [
    [
      "How do you play whack a mole?",
      "Press Start Game, then click or tap each mole the instant it pops out of one of the nine holes. A mole appears every 0.8 seconds and stays up for 0.6 to 1.1 seconds before dropping back down. Each mole you catch is +1. A bomb appears alongside the mole on about 30% of spawns — hit that and you lose 5 points.",
    ],
    [
      "How long is a round of whack a mole?",
      "30 seconds. A one-second interval counts the clock down from 30, and the round ends the moment it hits zero: the grid clears, your total appears under \"moles whacked\", and Play Again restarts a fresh 30 seconds.",
    ],
    [
      "What is a good score in whack a mole?",
      "Catching most of what appears is the realistic target, and the ceiling comes straight from the timing — a mole spawns every 800 ms in a 30-second round, so there are only about 37 chances to score. Once you are catching most moles, accuracy matters more than speed, because every bomb hit costs 5 of the points you already have.",
    ],
    [
      "Do you lose points for missing a mole?",
      "No. Clicking an empty hole, or letting a mole drop back down on its own, costs nothing. The only penalty is hitting the bomb, which subtracts 5. The score is floored at zero, so it can never go negative — but a few bomb hits can wipe out points you already earned.",
    ],
    [
      "Does my whack a mole high score get saved?",
      "No — the best score is held in the page's memory for the current session only. It updates in the \"Best\" card whenever you beat it, but refreshing the page or closing the tab clears it. Nothing is written to local storage and no score is sent to a server.",
    ],
    [
      "Is this whack a mole game free, and do I need to download anything?",
      "It is free with no download, no account and no signup. The grid, timer, scoring and randomisation all run as a single client-side React component in your browser, and the page makes no network requests while you play.",
    ],
    [
      "Can I play whack a mole on a phone?",
      "Yes. Each of the nine holes is a standard HTML button in a responsive 3×3 grid, so a tap behaves exactly like a click and the cells stay square on small screens. Because they are real buttons, they also respond to keyboard focus and Enter.",
    ],
    [
      "What does the bomb do in whack a mole?",
      "Hitting the bomb subtracts 5 points from your score. It is drawn as a red bomb icon and appears on roughly 30% of spawns, always in a different hole from the mole — if the random draw picks the mole's hole, the bomb is shifted to the next one. Ignoring a bomb is free; there is no penalty for leaving it alone.",
    ],
  ],
  steps: [
    "Press Start Game — the 30-second clock starts immediately and moles begin popping up on the 3×3 grid.",
    "Click or tap the mole the moment it appears. Each hit is +1, and you have between 0.6 and 1.1 seconds before it drops back down.",
    "Leave the red bomb alone — hitting it costs 5 points. When the clock reaches 0 your score and session best are shown, with Play Again to restart.",
  ],
};

export default seo;
