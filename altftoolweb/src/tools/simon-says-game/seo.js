const seo = {
  title: "Simon Says — Free Online Memory Sequence Game",
  h1: "Simon Says Game — Play the Classic Memory Game Online",
  metaDescription:
    "Play Simon Says free in your browser: 4 modes, 4 difficulties, Web Audio tones. No signup, and your scores stay in local storage on your device.",
  intro:
    "Simon Says Game is a browser build of the classic four-pad memory game. Every round appends one more randomly chosen color to the sequence — green, red, yellow or blue — and each pad plays its own note generated live by a Web Audio API oscillator: green E4 at 329.63 Hz, red C4 at 261.63 Hz, yellow G4 at 392 Hz and blue A4 at 440 Hz, each shaped by a gain envelope that decays over roughly 0.18 seconds. Four modes (Classic, Endless, Timed, Practice) and four difficulty levels change the flash speed, the input time limit and the score multiplier. Nothing is sent to a server: your all-time stats and the top-10 leaderboard are written to your browser's localStorage.",
  useCases: [
    "Working-memory drills where you want a hard number — the sequence grows by exactly one step per level, so Best Level tells you how long a sequence you can actually hold.",
    "Classroom and family play, using Practice mode: a wrong pad replays the pattern instead of ending the run, so nobody gets knocked out on step three.",
    "Reaction training on Hard and Expert, where pads flash for 350 ms or 200 ms and you get only 4 or 2.5 seconds to answer each step.",
  ],
  benefits: [
    [
      "Four modes and four difficulties",
      "Classic gives 3 lives and a win at level 20; Endless ends on the first mistake; Timed runs a per-level countdown; Practice never ends the run. Difficulty sets the flash speed (700 ms down to 200 ms), the input time limit and the score multiplier.",
    ],
    [
      "Tones are synthesized, not downloaded",
      "Each pad, plus the correct, wrong, level-up and game-over cues, is a Web Audio oscillator generated on the spot — sine waves for pads and hits, a sawtooth for mistakes. There are no audio files to load, and a mute button and volume slider (default 60%) sit above the board.",
    ],
    [
      "Your scores stay on your device",
      "Games played, win rate, best level, best score and average accuracy are saved to localStorage, along with a top-10 leaderboard tagged by mode, difficulty and date. Nothing is uploaded, and one Clear All Data button wipes both.",
    ],
    [
      "Free, no account, no install",
      "The whole game is client-side React. After the page loads, playing makes no network requests — no signup, no download, and it works the same on desktop and touch screens.",
    ],
  ],
  faqs: [
    [
      "How do you play the Simon Says game?",
      "Watch the four colored pads flash in order, then click or tap them back in the same order. Get the full sequence right and the game adds one more random color and replays it, so level 5 means a five-step pattern. Pick a mode and difficulty first, press Start Game, and use Pause or Restart at any time. The pads are real buttons, so you can also Tab to them and press Enter or Space.",
    ],
    [
      "Is this Simon Says game free to play online?",
      "Yes — it is free, needs no account or signup, and there is nothing to install. The game runs entirely in your browser; once the page has loaded, gameplay makes no network requests, and your stats and leaderboard are written only to your browser's local storage.",
    ],
    [
      "How many levels does the Simon Says game have?",
      "Classic mode ends at level 20 — reach it and you win, with a 100-point bonus added to your score. Endless, Timed and Practice have no level cap: the sequence keeps growing by one color each round until you run out of lives or, in Practice, for as long as you want to keep going.",
    ],
    [
      "What is the difference between Classic, Endless, Timed and Practice mode?",
      "Classic gives you 3 lives and a win condition at level 20. Endless has no spare lives — one wrong pad ends the run. Timed keeps 3 lives but adds a countdown per level: 10 seconds on Easy, 8 on Medium, 6 on Hard, 4 on Expert, growing by one second every 3 levels. Practice never ends the run; a mistake simply replays the current sequence so you can try again.",
    ],
    [
      "How fast are the pads on each difficulty?",
      "Expert is fastest: each pad lights for 200 ms with a 150 ms gap, and you get 2.5 seconds to respond. Hard is 350 ms with a 200 ms gap and a 4-second limit. Medium (500 ms / 300 ms) and Easy (700 ms / 400 ms) have no response time limit at all outside Timed mode.",
    ],
    [
      "How is the Simon Says score calculated?",
      "Score = level x difficulty multiplier x 10. The multipliers are Easy 1, Medium 2, Hard 3 and Expert 5, so clearing level 12 is 120 points on Easy but 600 on Expert. Finishing Classic mode at level 20 adds a flat 100-point bonus. Accuracy is tracked separately as correct pad presses divided by total presses, rounded to a whole percent.",
    ],
    [
      "Are my Simon Says high scores saved?",
      "Yes, but only on the device and browser you played on. All-time stats go to the localStorage key simon-says-stats and the top 10 runs go to simon-says-leaderboard, with the five best shown in the panel alongside mode, difficulty, level and date. They do not sync across devices, and Clear All Data (or clearing site data) removes them permanently.",
    ],
    [
      "Does playing Simon Says improve your memory?",
      "This tool does not make that claim — what it does is measure your performance on a short-term sequence-recall task. It records the longest sequence you reproduced (Best Level), your best score, your win rate and your average accuracy across games, so you can compare your own runs over time rather than rely on a general claim.",
    ],
  ],
  steps: [
    "Choose a Game Mode (Classic, Endless, Timed or Practice) and a Difficulty in the Game Config panel, then press Start Game — this also unlocks browser audio.",
    "Watch the pads flash and listen to each tone, then click or tap them back in the same order. Sequence length and lives are shown under the board.",
    "Clear the sequence to advance a level and add one more step. When the run ends, your level, score and accuracy are saved to your all-time stats and the local top-10 leaderboard.",
  ],
};

export default seo;
