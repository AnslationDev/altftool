const seo = {
  intro:
    "Block Stacker is a falling-block puzzle game on the classic 10-column by 20-row well, where the seven tetromino shapes (I, O, T, S, Z, J, L) drop from a shuffled seven-bag so every shape appears once before any repeats. Clearing one, two, three or four rows at a time scores 100, 300, 500 or 800 points multiplied by your level, and the level rises every ten lines cleared, cutting the gravity interval by about 18% each time. It has a hold slot, a three-piece preview queue, a ghost outline showing where the piece will land, and wall kicks so rotations near the wall still work.",
  useCases: [
    "You have ten minutes before a meeting and want a game you can start and stop instantly without an account or a tutorial.",
    "You keep topping out around level 5 and want to practise the specific skill of setting up four-row clears, which pay 800 times level instead of 100.",
    "You are on a phone and want a stacker you can play one-handed — tap the board to rotate, swipe down to hard-drop — rather than one built only for a keyboard.",
  ],
  benefits: [
    ["Fair piece distribution", "Pieces come from a shuffled bag of all seven, so you can never be starved of an I-piece for long the way pure random generation allows."],
    ["Ghost outline and hold slot", "You see exactly where the piece lands before committing, and can park an awkward shape in hold until it is useful."],
    ["Rotations that do not get stuck", "Eight wall-kick offsets are tried in order when a rotation would collide, so turning against a wall or a stack usually still succeeds."],
  ],
  faqs: [
    [
      "How does scoring work?",
      "Clearing 1, 2, 3 or 4 lines at once awards 100, 300, 500 or 800 points, multiplied by your current level. Soft dropping adds 1 point per cell and hard dropping adds 2 per cell, so a four-line clear at level 5 is worth 4,000 points against 500 for four single clears.",
    ],
    [
      "How fast does it get?",
      "The level goes up every 10 lines cleared, and each level multiplies the gravity interval by 0.82 — starting near 900 ms per row at level 1 and bottoming out at 70 ms, which is reached around level 14.",
    ],
    [
      "What are the controls?",
      "Arrow keys or WASD to move and rotate, Space for a hard drop, C to hold a piece, and P to pause. On touch, the on-screen buttons work, tapping the board rotates, and a downward swipe of more than about 48 pixels hard-drops.",
    ],
    [
      "Is my high score saved?",
      "Yes, your best score is stored in the browser and also recorded if you leave mid-game, so an unfinished run still counts. It lives on that device and browser, so it will not follow you to another machine.",
    ],
  ],
};

export default seo;
