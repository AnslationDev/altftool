const seo = {
  title: "Ambiguous Figure Viewer: 12 Optical Illusions",
  metaDescription:
    "Open the Necker cube, Rubin vase or duck-rabbit and switch between readings with Perceptual Focus hints, spotlight and blur. Mark solved, save as SVG.",
  intro:
    "An ambiguous figure is a single image with two mutually exclusive interpretations, and this viewer measures how long each one holds before your perception flips — the dominance duration used in psychophysics. Tap on every reversal you see in a Necker cube, Schröder stairs or Rubin's vase and it returns the mean, median, coefficient of variation and the gamma shape parameter k = mean² / variance. It is built for psychology students, teachers demonstrating bistable perception, and anyone curious how measurable their own perceptual switching is.",
  useCases: [
    "A psychology student records 20 Necker cube reversals and checks whether their gamma shape lands in the 3-6 band reported by Borsellino et al.",
    "A teacher demonstrates figure-ground reversal with Rubin's vase and shows the class that the two percepts never appear at the same time.",
    "Someone compares their alternation rate on the Necker cube against the Schröder stairs to see which figure flips faster for them.",
  ],
  benefits: [
    ["Real psychophysics measure", "Reports dominance duration, coefficient of variation and gamma shape, not a personality-style score."],
    ["Impossible taps rejected", "Two taps within 150 ms are refused, because perception cannot genuinely reverse that fast."],
    ["Runs offline", "Timing and statistics happen in the browser; nothing about your trial is uploaded."],
  ],
  faqs: [
    [
      "What is an ambiguous figure?",
      "A drawing that supports two equally valid interpretations, only one of which you can see at a time. The Necker cube (Louis Albert Necker, 1832) is the classic case: with no shading or occlusion cues, either square can read as the near face, and perception alternates between them without your choosing.",
    ],
    [
      "How long does one interpretation usually last?",
      "Between about 1 and 5 seconds for a static ambiguous figure in an untrained observer, with the mean typically near 2-3 seconds. Durations shorten with continued viewing and lengthen if you deliberately hold one interpretation, though you cannot stop reversals entirely.",
    ],
    [
      "Why are dominance durations described by a gamma distribution?",
      "Because the durations are right-skewed: many short holds and a thin tail of long ones. Borsellino and colleagues reported in Kybernetik (1972) that reversal times fit a gamma distribution with a shape parameter of roughly 3 to 4, which corresponds to a coefficient of variation near 0.5.",
    ],
    [
      "Can you train yourself to control the flips?",
      "Only partly. Fixating on a specific corner or edge biases which interpretation appears and can extend it, which is why this tool includes a hint option. Voluntary control changes the balance between the two percepts, but the alternation itself continues on its own.",
    ],
  ],
  steps: [
    "Find a figure in the gallery: type into Search optical illusions... or narrow the grid with the Category, Difficulty (Beginner, Intermediate, Advanced) and Status (Solved, Unsolved, Favorites) chip rows, watching the Showing X of Y figures counter. Click any card, or Open Featured Figure, to open it in the viewer.",
    "Inside the viewer, use Select Interpretation to switch between the figure's readings — each one prints its own Perceptual Focus hint, such as Look for the beak pointing to the left for the duck. The Viewing Tools panel gives In, Out, Reset, Blur, Spotlight and Invert (also +, -, r, b, s and i on the keyboard), and Perception Metrics reports the live Zoom Level, Active Mode, Difficulty and number of Interpretations.",
    "Mark Solved records the figure and the button switches to Solved!, the heart button adds it to Favorites, and both survive a reload because they are kept in this browser. Share copies the page link and flashes Link copied to clipboard!, Download Image saves the artwork as <figure-id>.svg, and Escape closes the viewer.",
  ],
};

export default seo;
