const seo = {
  title: "Conway's Game of Life: Draw, Step, Run to 30 gen/s",
  metaDescription:
    "Draw cells by dragging, single-step one generation, or run at 1-30 generations a second. Live generation and population counts; edges do not wrap.",
  intro:
    "Conway's Game of Life is a cellular automaton in which every cell on a grid lives or dies each generation by four rules: a live cell with two or three live neighbours survives, one with fewer than two dies of underpopulation, one with more than three dies of overcrowding, and a dead cell with exactly three live neighbours becomes alive. This simulator lets you draw cells directly on a 12-pixel grid, step one generation at a time or run continuously from 1 to 30 generations per second, and watch the generation count and live population update as it goes. It is for anyone learning emergence, teaching the automaton, or just wanting to watch a glider cross the screen.",
  useCases: [
    "You are teaching a class about emergent behaviour and want to draw a glider by hand, then step it one generation at a time to show it moving diagonally without anything telling it to.",
    "You want to test whether a shape you sketched is a still life, an oscillator or something that dies out, so you run it slowly and watch the population figure settle, cycle or fall to zero.",
    "You are demonstrating that simple rules produce complexity and need a random starting field that visibly churns for hundreds of generations before stabilising.",
  ],
  benefits: [
    ["Draw and erase by dragging", "Clicking a live cell sets the drag to erase and clicking a dead one sets it to draw, so you can sketch a whole pattern in one stroke instead of clicking cell by cell."],
    ["Single-step alongside continuous run", "Step advances exactly one generation with the simulation paused, which is the only way to actually verify a rule application rather than watch the result."],
    ["Generation and population shown live", "A stable population with a rising generation count tells you a still life has formed; a cycling one tells you an oscillator has, without you having to eyeball the grid."],
  ],
  faqs: [
    [
      "What are the rules of Conway's Game of Life?",
      "Four rules applied to all cells simultaneously: a live cell with fewer than 2 live neighbours dies, a live cell with 2 or 3 survives, a live cell with more than 3 dies, and a dead cell with exactly 3 live neighbours is born. Each cell has 8 neighbours, counting diagonals.",
    ],
    [
      "Does the grid wrap around at the edges?",
      "No. Anything beyond the visible board counts as dead, so a glider that reaches the boundary is disrupted rather than reappearing on the opposite side. If you want a pattern to run undisturbed, start it near the middle of the grid.",
    ],
    [
      "How fast can the simulation run?",
      "The speed slider goes from 1 to 30 generations per second, and the simulator waits 1000 divided by that value in milliseconds between generations. Low speeds are for watching a rule take effect; high speeds are for letting a random field settle.",
    ],
    [
      "What does the Random button fill in?",
      "It seeds each cell independently with roughly a 28 percent chance of being alive, which is dense enough to keep evolving for a long time without immediately dying out. It also pauses the simulation and resets the generation counter to zero.",
    ],
  ],
};

export default seo;
