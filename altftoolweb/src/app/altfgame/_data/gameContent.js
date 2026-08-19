// Hand-written per-game guides for /altfgame/[slug].
//
// Every number, difficulty label, level name and storage key below comes from
// that game's own implementation in src/app/altfgame/<slug>/** or from
// games.json. Nothing is invented — no review counts, no player numbers, no
// awards. A game with no genuine detail to add simply has no entry here, and
// the page renders without the guide block rather than with padding.
//
// Shape: answer (self-contained sentence under the title), about (one
// paragraph), steps (the ordered how-to, also emitted as HowTo JSON-LD) and
// faqs (2-3 questions, also emitted as FAQPage JSON-LD).

export const GAME_CONTENT = {
  "2048": {
    answer:
      "2048 is a sliding-tile puzzle on a 4x4 grid: every move slides all the tiles one way, two tiles showing the same number merge into their sum, and the aim is to build a tile worth 2048 before the board fills up.",
    about:
      "A new tile appears after each move — a 2 nine times out of ten, otherwise a 4 — so free space is the real currency and the board fills steadily whether or not your merges land. Your best score is kept in your browser's local storage, which means it survives a reload but stays on that one device.",
    steps: [
      "Press an arrow key, or swipe, to slide every tile in that direction.",
      "Line two matching numbers up in the direction you are sliding so they merge into one tile of double the value.",
      "Keep your biggest tile pinned in a corner and feed it along one edge so the board does not fragment.",
      "Carry on merging until a 2048 tile appears, or until no move can change the board.",
    ],
    faqs: [
      {
        question: "Can you play 2048 on a phone?",
        answer:
          "Yes. The board responds to swipes as well as arrow keys, so the game works the same on a touch screen as it does with a keyboard.",
      },
      {
        question: "Does this version of 2048 save my high score?",
        answer:
          "Your best score is stored in your browser's local storage on the device you played on. It is not tied to an account, and clearing site data removes it.",
      },
    ],
  },
  "aim-trainer-pro": {
    answer:
      "Aim Trainer Pro is a 30-second mouse accuracy drill: targets appear one after another and you click them as fast as you can before the timer runs out.",
    about:
      "The round is fixed at 30 seconds and every target is the same size, so the only variable is you. Alongside the score, the game counts your clicks and your hits and works out an accuracy percentage from the two, which is what separates a fast run from a wild one. The clock turns red for the final five seconds.",
    steps: [
      "Start the round and watch the 30-second timer begin.",
      "Move the mouse onto each target as it appears.",
      "Click the target to score, then move straight to the next one.",
      "Stop firing at empty space — every miss is counted and drags your accuracy down.",
    ],
    faqs: [
      {
        question: "How long is a round of Aim Trainer Pro?",
        answer:
          "Every round lasts 30 seconds. The counter is shown on screen and turns red for the final five seconds.",
      },
      {
        question: "How is accuracy calculated?",
        answer:
          "The game divides your hits by your total clicks, so clicking where no target is lowers the percentage even when your score keeps climbing.",
      },
    ],
  },
  "air-shot": {
    answer:
      "Air Shot is a balloon-popping shooter: you aim with the pointer, fire arrows at balloons drifting across the sky, and work through five stages that each get faster and windier.",
    about:
      "The five stages — Forest, Valley, Mountain, Storm and Chaos — change gravity, spawn rate and balloon speed, so an arrow that lands cleanly in Forest needs to be led much further ahead by the time you reach Chaos. You start with five lives, and balloons that escape cost you.",
    steps: [
      "Aim with the mouse or by touching the screen.",
      "Fire an arrow and lead the balloon, allowing for the drop as the arrow travels.",
      "Pop enough balloons to clear the stage and move to the next one.",
      "Protect your five lives — every balloon that escapes brings the run closer to over.",
    ],
    faqs: [
      {
        question: "How many stages does Air Shot have?",
        answer:
          "Five: Forest, Valley, Mountain, Storm and Chaos. Each one raises gravity and balloon speed and spawns balloons more often than the last.",
      },
      {
        question: "How many lives do you get in Air Shot?",
        answer: "Five. The run ends when you lose all of them.",
      },
    ],
  },
  "arrows-out": {
    answer:
      "Arrows Out is a timed maze escape: you have 120 seconds to steer through a 15x15 neon grid and reach the exit before the clock runs out.",
    about:
      "The maze is a fixed-size 15x15 grid, so every run is the same shape of problem — the pressure comes from the two-minute limit rather than from growing complexity. Arrow keys drive the movement, and on-screen controls cover touch screens.",
    steps: [
      "Start the run and watch the 120-second countdown begin.",
      "Move with the arrow keys, or with the on-screen controls on a touch screen.",
      "Trace a route through the neon corridors toward the exit.",
      "Reach the exit before the timer reaches zero.",
    ],
    faqs: [
      {
        question: "How long do you get in Arrows Out?",
        answer: "Each attempt gives you 120 seconds to reach the exit of the 15x15 maze.",
      },
      {
        question: "Can Arrows Out be played without a keyboard?",
        answer:
          "Yes. On-screen direction controls sit alongside the arrow-key input, so the maze can be played on a phone or tablet.",
      },
    ],
  },
  breakout: {
    answer:
      "Breakout is the classic paddle-and-ball arcade game: bounce the ball off your paddle to smash every brick on screen, and keep it from falling past the bottom of the play area.",
    about:
      "You start with three lives, and the angle the ball leaves your paddle depends on where it strikes — hitting near an edge sends it out steeply, which is how you reach bricks tucked into the corners. Your best score is kept in the browser's local storage.",
    steps: [
      "Move the paddle with the arrow keys, the mouse, or by dragging on a touch screen.",
      "Serve the ball and keep it in play by catching it on the paddle.",
      "Aim rebounds at the bricks by changing where on the paddle the ball lands.",
      "Clear every brick before you lose your three lives.",
    ],
    faqs: [
      {
        question: "How many lives do you get in Breakout?",
        answer: "Three. Each ball that falls past the paddle costs one, and the game ends when they are gone.",
      },
      {
        question: "Does Breakout remember my high score?",
        answer:
          "Yes, in your browser's local storage on that device only. There is no account and no leaderboard behind it.",
      },
    ],
  },
  "bubble-shooter": {
    answer:
      "Bubble Shooter is a match-three aiming puzzle: you fire coloured bubbles up into a hanging cluster, and any group of three or more of the same colour pops and falls away.",
    about:
      "The playfield is a 10-column, 14-row grid, so there is enough width to bank shots off the side walls into gaps you cannot hit directly. Bubbles left hanging with nothing above them drop as well, which is where the large scores come from. Your best score is saved in the browser.",
    steps: [
      "Check the colour of the bubble loaded in the launcher.",
      "Aim with the pointer, using the side walls to reach awkward gaps.",
      "Fire so the bubble joins two or more of the same colour, and the group pops.",
      "Cut the supports under a cluster to drop everything hanging beneath it.",
    ],
    faqs: [
      {
        question: "How big is the Bubble Shooter board?",
        answer: "The grid is 10 columns wide and 14 rows deep.",
      },
      {
        question: "How do you score more than three bubbles at a time?",
        answer:
          "Pop the bubbles that hold a cluster up. Anything left unattached falls away with the pop and counts toward the same shot.",
      },
    ],
  },
  carrom: {
    answer:
      "Carrom is the flick-and-pocket board game played against a computer opponent: you position the striker on your baseline, pull back to set power, and release to knock your discs into the corner pockets.",
    about:
      "The board is simulated with real friction and wall bounces, so a disc keeps rolling and rebounds off the cushions the way it would on a physical board. An aim line previews the path the striker will take before you release, and the computer plays its turns with its own shot search.",
    steps: [
      "Drag the striker left or right along your baseline to line up the shot.",
      "Pull back from the striker to set the direction and the power.",
      "Watch the aim line to check the path, then release to shoot.",
      "Pocket your discs, and hand the board over when your shot misses.",
    ],
    faqs: [
      {
        question: "Do you play Carrom against the computer?",
        answer:
          "Yes. The opponent's turns are played by a built-in shot search that picks its own target and power each time.",
      },
      {
        question: "Can Carrom be played with a touch screen?",
        answer: "Yes. The striker is dragged and released, which works with a finger as well as a mouse.",
      },
    ],
  },
  chess: {
    answer:
      "This is full chess against a computer opponent with three strength settings — Novice, Master and Grandmaster — played by clicking a piece and then the square you want it to move to.",
    about:
      "The engine searches ahead with a minimax algorithm, and the difficulty you pick sets how deep it looks: two moves for Novice, three for Master and four for Grandmaster. Legal moves are highlighted when you select a piece, so you can see what is available before committing.",
    steps: [
      "Choose Novice, Master or Grandmaster before the game starts.",
      "Click or tap one of your pieces to select it and show its legal moves.",
      "Click a highlighted square to make the move.",
      "Keep developing and trading until you deliver checkmate — or the engine does.",
    ],
    faqs: [
      {
        question: "How strong is the chess computer?",
        answer:
          "It searches with minimax to a depth set by the difficulty: two plies on Novice, three on Master and four on Grandmaster. Higher settings see more of your threats before replying.",
      },
      {
        question: "Can I play chess against another person here?",
        answer:
          "No. This board is built for playing against the computer opponent, so every game is one player against the engine.",
      },
    ],
  },
  "connect-four": {
    answer:
      "Connect Four is the two-player disc-dropping game on a seven-column, six-row grid: players take turns on the same device and the first to line up four discs in a row wins.",
    about:
      "Discs fall to the lowest free slot in the column you pick, so every move also decides what your opponent can reach next. Lines count across, down and along both diagonals, and the grid fills to a draw if neither player connects four.",
    steps: [
      "Decide who plays red and who plays yellow.",
      "Click or tap a column to drop your disc into the lowest free slot.",
      "Pass the device — or the mouse — to the other player for their turn.",
      "Line up four of your discs across, down or diagonally to win.",
    ],
    faqs: [
      {
        question: "Is Connect Four played against the computer?",
        answer:
          "No. This version is pass-and-play: two people take alternating turns on the same screen, with no computer opponent.",
      },
      {
        question: "How big is the Connect Four grid?",
        answer: "Seven columns wide and six rows deep, the same as the physical game.",
      },
    ],
  },
  cricket: {
    answer:
      "Cricket here is a timing game: you bat by clicking, tapping or pressing space at the moment the ball reaches you, and an innings runs to a maximum of five overs or ten wickets.",
    about:
      "How close your press lands to the ball decides the shot — mistime it and you edge or miss, meet it cleanly and it races to the boundary. The innings ends at five overs or the fall of the tenth wicket, whichever comes first, so a chase has a hard limit on the balls available.",
    steps: [
      "Wait for the bowler to release the ball.",
      "Press space, click or tap at the moment the ball arrives in front of the bat.",
      "Build the score while keeping wickets in hand.",
      "Finish the innings within five overs, or before the tenth wicket falls.",
    ],
    faqs: [
      {
        question: "How long is an innings in this cricket game?",
        answer: "A maximum of five overs, or until ten wickets have fallen — whichever comes first.",
      },
      {
        question: "What controls the shot you play?",
        answer:
          "Timing alone. The moment you press relative to the ball's arrival decides whether you miss, nudge it or send it to the boundary.",
      },
    ],
  },
  crossword: {
    answer:
      "This crossword is a fixed 11x11 grid of twelve technology and puzzle themed answers, with numbered Across and Down clues you fill in by tapping a cell and typing.",
    about:
      "Because the puzzle is fixed rather than randomly generated, the crossing letters always work out, and a clue you cannot get can be unlocked by solving the word that crosses it. Selecting a cell switches the active clue between its Across and Down entries.",
    steps: [
      "Tap or click a cell in the grid to select it.",
      "Read the highlighted clue and type the answer letter by letter.",
      "Switch between the Across and Down clue for a cell when you get stuck.",
      "Use the letters from solved words to break open the ones crossing them.",
    ],
    faqs: [
      {
        question: "How many words are in this crossword?",
        answer: "Twelve answers, laid out Across and Down in an 11x11 grid.",
      },
      {
        question: "Is the crossword different every time?",
        answer:
          "No. It is one hand-built puzzle, so the grid and the clues stay the same each time you play it.",
      },
    ],
  },
  "dots-and-boxes": {
    answer:
      "Dots and Boxes is the pen-and-paper classic: players take turns drawing one line between two dots, and whoever draws the fourth side of a box claims it and immediately goes again.",
    about:
      "You can play it as two people on the same device or against the computer at easy, medium or hard. The easy computer plays at random; medium and hard avoid handing you a box whenever a safe line is available, which is what turns the endgame into a chain-counting exercise.",
    steps: [
      "Choose two-player mode or a computer opponent, and pick its difficulty.",
      "Click or tap an edge between two dots to draw your line.",
      "Complete the fourth side of a box to claim it — then take another turn straight away.",
      "Keep claiming until every box is taken; the larger share wins.",
    ],
    faqs: [
      {
        question: "Can Dots and Boxes be played against the computer?",
        answer:
          "Yes. A toggle switches between pass-and-play for two people and a computer opponent with easy, medium and hard settings.",
      },
      {
        question: "What is the difference between the difficulty levels?",
        answer:
          "Easy picks a legal line at random. Medium and hard prefer lines that do not give you a free box, so they avoid feeding you chains.",
      },
    ],
  },
  "escape-puzzle": {
    answer:
      "Escape Puzzle is a single-room escape game: you tap objects around the room to inspect them, collect the clues hidden in what you find, and use them to work out the keypad code that opens the door.",
    about:
      "Everything you need is in the room itself — a rug whose pattern points somewhere, objects that reveal a number when examined, and a keypad that only opens for the right combination. A clock counts upward while you search and your finishing time is shown when you escape, but it never runs out on you, so the puzzle stays a search-and-reason exercise rather than a reaction test.",
    steps: [
      "Tap or click each object in the room to inspect it.",
      "Note every number and pointer the objects reveal.",
      "Work out the order the clues suggest for the code.",
      "Enter the code on the door keypad to escape.",
    ],
    faqs: [
      {
        question: "Is Escape Puzzle timed?",
        answer:
          "A timer counts up so you can see how long the escape took, but there is no limit — the room never locks you out or ends the game.",
      },
      {
        question: "Where is the keypad code hidden?",
        answer:
          "It is spread across the objects in the room. Inspecting them reveals the digits, and other details in the scene tell you what order to enter them in.",
      },
    ],
  },
  "find-10": {
    answer:
      "Find 10 is a 60-second number puzzle on an 8x8 grid: select any two numbers that add up to exactly 10 to clear them, and keep pairing until the timer stops.",
    about:
      "The board holds 64 numbers and clearing a pair opens up new adjacencies, so the tempo depends on how quickly you can scan for complements — the 6 that needs a 4, the 3 that needs a 7. Reaching 220 points wins the round outright.",
    steps: [
      "Scan the 8x8 grid for two numbers that add up to 10.",
      "Select both numbers to clear them from the board.",
      "Keep pairing as fast as you can while the 60-second timer runs.",
      "Reach 220 points before time runs out to win the round.",
    ],
    faqs: [
      {
        question: "How long is a round of Find 10?",
        answer: "Sixty seconds on an 8x8 grid of numbers.",
      },
      {
        question: "What score do you need to win Find 10?",
        answer: "220 points inside the sixty seconds.",
      },
    ],
  },
  "flappy-bird": {
    answer:
      "Flappy Bird is a one-button arcade game: every click, tap or press of the space bar flaps the bird upward, and you thread the gaps between pipes for as long as you can.",
    about:
      "Gravity pulls constantly, so height is only ever borrowed — the run is a rhythm of small flaps rather than one big one. Touching a pipe or the ground ends it immediately, while the top of the screen simply stops the bird rather than killing it. Your best score is kept in the browser's local storage.",
    steps: [
      "Click, tap or press the space bar to start the bird flapping.",
      "Tap in a steady rhythm to hold your height between pipes.",
      "Line the bird up with each gap before you arrive at it.",
      "Keep clear of the pipes and the ground to extend the run.",
    ],
    faqs: [
      {
        question: "How is Flappy Bird controlled?",
        answer:
          "With a single input: a click, a tap or the space bar. Each one gives the bird an upward flap, and gravity does the rest.",
      },
      {
        question: "Is my best score saved?",
        answer:
          "Yes, in your browser's local storage on that device. It is not linked to an account and no score is uploaded.",
      },
    ],
  },
  hangman: {
    answer:
      "Hangman is the word-guessing classic: a hidden word is shown as blanks, you guess one letter at a time, and you have eight wrong guesses before the game is lost.",
    about:
      "Words are drawn from five categories — movies, animals, countries, sports and general knowledge — so knowing the category narrows the letters worth trying. Correct guesses fill every position that letter occupies, and wrong ones cost one of your eight attempts.",
    steps: [
      "Look at the number of blanks and the category to size up the word.",
      "Type a letter on the keyboard, or tap it on the on-screen letters.",
      "Correct letters fill in every position where they appear.",
      "Solve the word before eight wrong guesses are used up.",
    ],
    faqs: [
      {
        question: "How many wrong guesses do you get in Hangman?",
        answer: "Eight. The ninth wrong letter ends the game.",
      },
      {
        question: "What kinds of words appear?",
        answer:
          "They come from five categories: movies, animals, countries, sports and general knowledge.",
      },
    ],
  },
  "helix-jump": {
    answer:
      "Helix Jump is a falling-ball game: you rotate a spiral tower so the bouncing ball drops through the gaps in each platform, and hitting a red section ends the run.",
    about:
      "You never control the ball directly — only the tower — so the game is about turning the right gap into the ball's path before it lands. The level you reach and your best score are both saved in the browser, and the tower's colour scheme changes every five levels.",
    steps: [
      "Drag left or right, or use the arrow keys, to spin the tower.",
      "Line an open gap up underneath the bouncing ball.",
      "Let the ball fall through, then set up the next gap before it lands.",
      "Keep away from the red sections — touching one ends the run.",
    ],
    faqs: [
      {
        question: "Does Helix Jump remember my progress?",
        answer:
          "Yes. Your level and best score are stored in your browser's local storage, so returning to the page picks up where you left off on that device.",
      },
      {
        question: "Why does the tower keep changing colour?",
        answer: "The theme changes every five levels as you descend.",
      },
    ],
  },
  "knife-hit": {
    answer:
      "Knife Hit is a timing game: you throw knives into a spinning target, and every knife has to land in a free space — hitting a knife you already threw ends the level.",
    about:
      "Each level sets its own spin speed and its own number of knives, and the target carries fruit that scores extra when you strike it. The early levels turn slowly with eight knives to place; later ones spin faster and hand you more knives to fit into less space.",
    steps: [
      "Watch the target turn and find the gap between the knives already stuck in it.",
      "Click, tap or press space to throw.",
      "Aim for the fruit on the target for extra points.",
      "Place every knife for the level without striking one of your own.",
    ],
    faqs: [
      {
        question: "What ends a level in Knife Hit?",
        answer: "Hitting a knife that is already in the target. Landing every knife of the level clears it.",
      },
      {
        question: "Do the levels get harder?",
        answer:
          "Yes. Each level raises the spin speed and changes how many knives you have to place, so the free space shrinks as you go.",
      },
    ],
  },
  "level-devil": {
    answer:
      "Level Devil is a six-level trap platformer where the level cheats: floors vanish, spikes appear from nowhere and the controls reverse, and the only way through is to learn each trick by falling for it.",
    about:
      "The six levels are Baby Steps, Floor Is Lying, Ambush Alley, Backwards Day, The Devil's Bargain and Everything, Everywhere, At Once, and each one carries a tip that hints at the trap without giving it away. Every level ends at a door, and the run resets you at the start of the level rather than the game.",
    steps: [
      "Move with A and D or the arrow keys, and jump with W, Up or the space bar.",
      "Walk the level once to find out where it lies to you.",
      "Use what the trap taught you on the retry — hesitate at gaps, expect spikes.",
      "Reach the door to clear the level and move on to the next trick.",
    ],
    faqs: [
      {
        question: "How many levels does Level Devil have?",
        answer:
          "Six: Baby Steps, Floor Is Lying, Ambush Alley, Backwards Day, The Devil's Bargain, and Everything, Everywhere, At Once.",
      },
      {
        question: "Is Level Devil supposed to be unfair?",
        answer:
          "Yes — that is the design. Platforms crumble, spikes appear and the controls flip, so the intended way to play is to die once to each trap and beat it on the next attempt.",
      },
    ],
  },
  ludo: {
    answer:
      "Ludo is the four-player dice race: you roll to move your tokens out of the yard and around a 15x15 board, and the first player to bring all four tokens home wins.",
    about:
      "You take one colour and the remaining seats are filled by computer players, which the setup screen lets you configure before the game starts. Rolls decide everything: a token only leaves the yard on the right roll, and landing on an opponent sends their token back to the start.",
    steps: [
      "Choose how many players are in the game on the setup screen.",
      "Tap the dice to roll on your turn.",
      "Tap one of the highlighted tokens to move it by the number rolled.",
      "Send opponents home when you land on them, and race all four of your tokens to the centre.",
    ],
    faqs: [
      {
        question: "Do you play Ludo against the computer?",
        answer:
          "Yes. You control one colour and the other seats are played by computer opponents, set up before the game begins.",
      },
      {
        question: "How do you get a token out of the yard?",
        answer:
          "You have to roll the value that releases it. Until then the token stays in its corner and your other tokens do the moving.",
      },
    ],
  },
  "memory-match": {
    answer:
      "Memory Match is the card-pairing game: cards start face down, you flip two at a time, and matching pairs stay open until the whole board is cleared.",
    about:
      "Three board sizes are available: easy with 8 pairs on a 4x4 layout, medium with 10 pairs, and hard with 18 pairs on a 6x6 board. A timer and a move counter run while you play, so improving means clearing the same board in fewer flips rather than just finishing it.",
    steps: [
      "Pick easy, medium or hard to set the board size.",
      "Click or tap a card to turn it face up.",
      "Turn a second card — a match stays open, a miss flips both back.",
      "Remember where each symbol was and clear every pair.",
    ],
    faqs: [
      {
        question: "How many pairs are on each board?",
        answer: "Eight pairs on easy, ten on medium and eighteen on hard, the largest being a 6x6 layout.",
      },
      {
        question: "Is Memory Match suitable for young children?",
        answer:
          "The easy board is a 4x4 grid of eight pairs with no time pressure to start a game, which makes it the gentlest of the three settings.",
      },
    ],
  },
  minesweeper: {
    answer:
      "Minesweeper is the deduction classic: you uncover squares on a grid, each number tells you how many mines touch that square, and you have to clear every safe square without detonating one.",
    about:
      "Three board sizes follow the traditional presets — beginner is 9x9 with 10 mines, intermediate 16x16 with 40, and expert 16x30 with 99. The first square you open is always safe, because the mines are placed after that click, so no game is lost on the opening move.",
    steps: [
      "Choose beginner, intermediate or expert.",
      "Open any square to start — the first click is always safe.",
      "Read each number as the count of mines in the eight squares around it.",
      "Flag the squares you have proved are mined, then clear everything else to win.",
    ],
    faqs: [
      {
        question: "What are the board sizes in Minesweeper?",
        answer:
          "Beginner is 9x9 with 10 mines, intermediate is 16x16 with 40 mines, and expert is 16x30 with 99 mines.",
      },
      {
        question: "Can you lose on the first click?",
        answer:
          "No. The mines are planted after your first square is opened, and that square and its neighbours are kept clear.",
      },
    ],
  },
  "neon-racer": {
    answer:
      "Neon Racer is an endless traffic-dodging racer: you steer a car down a glowing track, weave past slower traffic, and pick up boosts to push your speed higher.",
    about:
      "Steering is on the arrow keys or A and D, with touch controls for phones, and speed is the difficulty curve — the faster you go, the less time you have to react to the car that pulls across in front of you. Boosts trade safety for score.",
    steps: [
      "Steer with the arrow keys, with A and D, or with the touch controls.",
      "Pick a lane early and move across before traffic closes the gap.",
      "Grab boosts when the road ahead is clear.",
      "Keep your run alive — contact with traffic ends it.",
    ],
    faqs: [
      {
        question: "Does Neon Racer have an end?",
        answer:
          "No. It is an endless run, so the score is how far and how fast you get before you hit something.",
      },
      {
        question: "Can Neon Racer be played on a phone?",
        answer: "Yes. Touch controls sit alongside the keyboard steering.",
      },
    ],
  },
  "number-guess": {
    answer:
      "Number Guess is higher-or-lower against a hidden number: you type a guess, the game tells you whether the target is higher or lower, and a live meter shows the range you have left.",
    about:
      "Three difficulties set the range and the budget: easy hides a number up to 50 and allows 8 guesses, medium goes to 100 with 10 guesses, and hard goes to 500 with 12. Your best result for each difficulty is stored separately in the browser, so easy and hard keep their own records.",
    steps: [
      "Pick easy, medium or hard to set the range and the number of guesses.",
      "Type a number near the middle of the range and submit it.",
      "Read the higher or lower reply and halve the range that remains.",
      "Repeat until you land on the number, before your guesses run out.",
    ],
    faqs: [
      {
        question: "What are the ranges and limits on each difficulty?",
        answer:
          "Easy is 1 to 50 in 8 guesses, medium is 1 to 100 in 10 guesses, and hard is 1 to 500 in 12 guesses.",
      },
      {
        question: "What is the fastest way to win?",
        answer:
          "Halve the remaining range every time. Guessing the midpoint means each answer removes half of what is left, which is enough to find any number within the guess limit.",
      },
    ],
  },
  "who-is": {
    answer:
      "Who Is? is a detective deduction game: you click glowing clue pins around a scene to reveal evidence, then accuse one of the suspects — and you have three lives across its eight cases.",
    about:
      "Each case gives you a scene, a set of suspects and a handful of clue pins hidden in the artwork. The clues narrow the field by detail rather than by luck, and a wrong accusation costs one of your three lives, so it pays to find every pin before you commit.",
    steps: [
      "Look over the scene and find the glowing clue pins.",
      "Click each pin to reveal the evidence it holds.",
      "Compare the clues against the suspect cards.",
      "Click the suspect who fits every clue to make your accusation.",
    ],
    faqs: [
      {
        question: "How many cases are there in Who Is?",
        answer: "Eight, each with its own scene, suspects and clues.",
      },
      {
        question: "What happens if you accuse the wrong suspect?",
        answer: "You lose one of your three lives. Run out and the game is over.",
      },
    ],
  },
};

export function getGameContent(slug) {
  return GAME_CONTENT[slug] || null;
}
