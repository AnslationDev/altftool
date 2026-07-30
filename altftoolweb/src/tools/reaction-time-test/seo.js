const seo = {
  intro:
    "Reaction Time Test runs a fixed set of 5 rounds in which the screen turns green after a random 500 to 5000 ms wait, timing your click with the browser's high-resolution performance clock and reporting the result in milliseconds. Each round is graded on a seven-band scale — Inhuman under 150 ms, Excellent under 200, Good under 250, Average under 300, Below Average under 400, Slow under 500, Very Slow above that — and the game finishes with your 5-round average, a per-round bar chart and a CSV export. It is a simple visual-stimulus test for anyone curious how their reflexes compare to the typical 200-300 ms human range, not a clinical assessment.",
  useCases: [
    "You want a number you can actually defend in an argument about reflexes, so you run the full 5 rounds and quote the average and the CSV rather than one screenshot of a lucky 180 ms.",
    "You are testing whether a new mouse, a wired connection, or a higher refresh-rate monitor changes anything, and you export the CSV for each setup to compare round-by-round instead of eyeballing it.",
    "A coach or teacher is demonstrating simple reaction time to a group and needs a run that everyone completes identically — same 5 rounds, same random-wait rules, same grade bands — with downloadable results.",
  ],
  benefits: [
    [
      "Fixed 5-round protocol, not endless clicking",
      "Every run is the same length, so averages from different sessions or different people are directly comparable.",
    ],
    [
      "High-resolution timing",
      "Rounds are measured with performance.now() rather than whole-millisecond wall-clock time, and the random 500-5000 ms wait makes anticipation useless.",
    ],
    [
      "Exports the whole run",
      "The CSV includes every round with its grade plus average, best and worst, so results can go straight into a spreadsheet.",
    ],
  ],
  faqs: [
    [
      "What is the average human reaction time?",
      "Roughly 200-300 ms for a simple visual stimulus like this one, which is why 250-300 ms grades as Average here. Reaction to sound is typically faster, around 160 ms, and drivers responding to a road hazard are usually in the 300-400 ms range because that includes decision time as well as reaction.",
    ],
    [
      "How many rounds does one test take?",
      "Five. The round dots at the bottom of the panel fill in as you go, and after the fifth round the tool shows your 5-round average with its grade and offers Play Again.",
    ],
    [
      "What happens if I click before the screen turns green?",
      "The panel turns red with Too Early and no time is recorded for that round; clicking again drops you back to the start so the 5-round set begins fresh. That is deliberate, since a pre-emptive click would otherwise register as an impossibly fast score.",
    ],
    [
      "Can I use the keyboard instead of clicking?",
      "Yes. Space or Enter does exactly what a click does — start the test, register your reaction, and advance to the next round. Note that key and mouse input paths can differ by a few milliseconds, so pick one and stay with it when comparing runs.",
    ],
  ],
};

export default seo;
