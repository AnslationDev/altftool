/**
 * Genre taxonomy for the /games hub (puzzle / arcade / word / board / card /
 * casual). Slug-keyed so game tool.config.js files stay untouched; new games
 * without an entry fall back to a category-based guess.
 */
export const GAME_GENRES = [
  { key: "puzzle", label: "Puzzle", description: "Logic, matching, and brain teasers" },
  { key: "arcade", label: "Arcade", description: "Fast reflexes and high scores" },
  { key: "word", label: "Word & Typing", description: "Vocabulary, spelling, and speed" },
  { key: "board", label: "Board & Classic", description: "Timeless two-player and family games" },
  { key: "card", label: "Card", description: "Solitaire and card classics" },
  { key: "casual", label: "Casual & Fun", description: "Quick spins, rolls, and party picks" },
];

export const GAME_GENRE_BY_SLUG = {
  "2048-game": "puzzle",
  "candy-match-3": "puzzle",
  "color-match-game": "puzzle",
  "emoji-quiz": "puzzle",
  "memory-card-game": "puzzle",
  minesweeper: "puzzle",
  nonogram: "puzzle",
  "number-guessing-game": "puzzle",
  "sliding-puzzle": "puzzle",
  sudoku: "puzzle",
  "block-stacker": "puzzle",

  "aim-trainer": "arcade",
  "brick-breaker": "arcade",
  "dino-runner": "arcade",
  "fast-click-challenge": "arcade",
  "maze-muncher": "arcade",
  "paddle-ball": "arcade",
  "simon-says-game": "arcade",
  "snake-game": "arcade",
  "space-rocks": "arcade",
  "tap-glider": "arcade",
  "whack-a-mole": "arcade",

  "daily-word-game": "word",
  hangman: "word",
  "typing-speed-test": "word",
  "word-search": "word",

  "chess-multiplayer": "board",
  "four-in-a-row": "board",
  "ludo-multiplayer": "board",
  "rock-paper-scissors": "board",
  "snake-water-gun-game": "board",
  "tic-tac-toe-game": "board",

  "card-trick": "card",
  "klondike-solitaire": "card",

  "bingo-game": "casual",
  "coin-flip": "casual",
  "dice-roller": "casual",
  "dice-roller-3d": "casual",
  "insect-tracker": "casual",
  "secret-santa-pair-generator": "casual",
  "ultimate-wheel-spinner": "casual",
};

export function getGameGenreKey(slug) {
  return GAME_GENRE_BY_SLUG[slug] || "casual";
}

export function getGameGenreLabel(slug) {
  const key = getGameGenreKey(slug);
  return GAME_GENRES.find((genre) => genre.key === key)?.label || "Casual & Fun";
}
