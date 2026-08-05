const seo = {
  title: "2048 Game Online — Play Free, No Download",
  h1: "2048 Game — Play the Classic Sliding Tile Puzzle",
  metaDescription:
    "Play 2048 free in your browser — a 4×4 sliding puzzle with arrow-key and on-screen controls, an untimed Classic mode and a 60-second Timed mode.",
  intro:
    "The 2048 Game is the classic sliding-tile puzzle running as client-side React: a 4×4 grid where every arrow press filters the empty cells out of each row or column, then merges equal neighbours in a single pass, so no tile can merge twice in the same move. Each merge adds the new tile's value to your score, and one fresh tile then drops into a random empty cell — a 2 with 90% probability, a 4 with 10%. Build a tile worth 2048 and you win, with the option to keep going past it. The whole game runs in your browser: no account, no download, and no network requests once the page has loaded.",
  useCases: [
    "Play a quick round of 2048 in a browser tab without installing an app or creating an account.",
    "Practise corner-stacking strategy against a clock by switching from Classic to the 60-second Timed mode.",
    "Push past the win screen with Keep Going and chase 4096 and 8192 tiles on the same board.",
  ],
  benefits: [
    [
      "Runs entirely in your browser",
      "The board, the merge logic and the scoring are all client-side JavaScript. There are no network calls, no sign-in and nothing to download.",
    ],
    [
      "Keyboard and touch controls",
      "The four arrow keys are bound at the window level with page scrolling suppressed, and a labelled on-screen arrow pad with 48 px buttons covers phones and tablets.",
    ],
    [
      "Classic and timed modes",
      "Classic runs with no clock at all. Timed gives you a 60-second countdown that ticks once a second and also costs you a second on every move you make.",
    ],
    [
      "Play on past 2048",
      "Hitting a 2048 tile shows the win overlay, but Keep Going resumes the same board — tile styling is defined all the way up to 8192.",
    ],
  ],
  faqs: [
    [
      "How do you play 2048?",
      "Slide the whole 4×4 board with the arrow keys or the on-screen arrow pad. Every tile shifts as far as it can in that direction, and two neighbouring tiles showing the same number merge into one tile of double the value. A new tile then appears in a random empty cell, and you repeat until you build a 2048.",
    ],
    [
      "How do you win 2048?",
      "You win the moment any tile reaches 2048 — the board runs that check after every move. A win overlay shows your score with two choices: New Game, or Keep Going, which clears the overlay and lets you carry on merging on the same board toward 4096 and beyond.",
    ],
    [
      "How is the score calculated in 2048?",
      "Your score is the sum of every tile you create by merging. Merging two 64s adds 128 points; merging two 8s adds 16. Tiles that only slide without merging score nothing, which is why a single well-timed chain of merges is worth more than a dozen shuffling moves.",
    ],
    [
      "When is the 2048 game over?",
      "When the grid is full and no two orthogonal neighbours share a value, so no direction would change anything. The board checks that after each move and shows a Game Over overlay with your final score and a Try Again button. In Timed mode the run also ends when the 60-second clock reaches zero.",
    ],
    [
      "Does this 2048 game save my high score?",
      "No. The Best figure is held in the page's memory for the current session only — there is no localStorage, cookie or account behind it — so it resets to zero when you reload or navigate away. It only compares runs made during this visit.",
    ],
    [
      "Is 2048 free to play online?",
      "Yes. It runs as client-side JavaScript in your own browser with no signup, no download and no purchases. The game itself makes no network requests, so nothing about your board or score is sent anywhere.",
    ],
    [
      "What are the chances of getting a 4 instead of a 2 in 2048?",
      "Each new tile is a 2 with 90% probability and a 4 with 10%, placed in a uniformly random empty cell. The board also opens with two tiles drawn the same way, so no two games start from an identical position.",
    ],
    [
      "Can you play 2048 on a phone?",
      "Yes. A three-column arrow pad sits below the board with up, down, left and right buttons, each 48 px tall and labelled for screen readers, and the square grid scales to the screen width up to 400 px. Note that there is no swipe gesture — use the on-screen buttons or a keyboard.",
    ],
  ],
  steps: [
    "The 4×4 board deals two tiles as soon as the page loads. Pick Classic, Timed or Challenge above the board to restart with a fresh grid; Classic is untimed, while Timed and Challenge display a 60-second countdown.",
    "Press the arrow keys, or tap the on-screen arrow pad, to slide every tile in that direction. Equal neighbours merge into one tile of double the value and add that value to your score.",
    "Keep merging until a 2048 tile raises the You Win! overlay, then choose Keep Going to play on or New Game to reset. If no moves remain, the Game Over! overlay offers Try Again.",
  ],
};

export default seo;
