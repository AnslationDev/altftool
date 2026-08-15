const seo = {
  title: "SVG Path Editor: Edit d Commands, True Bounding",
  metaDescription:
    "Parses all ten SVG path commands, converts absolute to relative, minifies, moves and scales, and solves Bezier extrema for a box that hugs the curve.",
  steps: [
    "Paste a d attribute into the 'Path data (d attribute)' textarea — every SVG 1.1 command, M L H V C S Q T A and Z, in absolute or relative form — and set the Precision slider anywhere from 0 to 8 decimals.",
    "Press 'To absolute' or 'To relative' to rewrite every command, Minify for the shortest legal form, or edit any single parameter in the command list; the Move X, Move Y and Scale fields shift the whole path without a transform attribute.",
    "The Bounding box panel reports width by height, Top-left, Bottom-right, Commands, Sub-paths and minified length alongside a live Preview with the on-path points marked; Copy result puts the path data on the clipboard and Reset restores the sample path.",
  ],
  intro:
    "An SVG path editor breaks a path's d attribute into its individual commands so you can read and change them one number at a time. This one follows SVG 1.1 §8.3 exactly — all ten commands (M, L, H, V, C, S, Q, T, A, Z), implicit command repetition, and the single-character arc flags that trip up most parsers — and it measures the true bounding box by solving each Bézier's derivative for its extrema rather than guessing from the control points. It is for icon designers cleaning up an export, developers hand-tuning an inline SVG, and anyone who needs to know how big a path really is.",
  useCases: [
    "Find the real bounding box of an icon path so you can set a viewBox that fits it with no dead space.",
    "Convert a path full of relative lowercase commands to absolute form so the coordinates make sense when you edit them by hand.",
    "Move and scale a path to fit a 24 × 24 icon grid without wrapping it in a transform attribute.",
  ],
  benefits: [
    ["A real bounding box, not the control-point hull", "Cubic and quadratic extrema are solved algebraically and arcs are converted to Béziers first, so the box is tight around the curve."],
    ["Correct arc parsing", "The large-arc and sweep flags are read as single characters, so compact paths like \"a1 1 0 011 1\" parse the way a browser parses them."],
    ["Edit numbers directly", "Every parameter of every command is an input box, and the preview and bounding box update as you type."],
  ],
  faqs: [
    [
      "What is the difference between uppercase and lowercase SVG path commands?",
      "Uppercase means absolute coordinates measured from the origin of the user coordinate system; lowercase means relative to the current point. So after M 10 10, the command L 20 20 draws to (20, 20) but l 20 20 draws to (30, 30). Relative form usually compresses better because the numbers are smaller.",
    ],
    [
      "What do the seven numbers in an A command mean?",
      "rx, ry, x-axis-rotation, large-arc-flag, sweep-flag, x, y. The first two are the ellipse radii, the third rotates the ellipse in degrees, the two flags each hold only 0 or 1 and pick which of the four possible arcs to draw, and the last two are the endpoint. If the radii are too small to reach the endpoint, SVG 1.1 Appendix F.6.6 says they are scaled up until they fit.",
    ],
    [
      "Why is the bounding box smaller than the coordinates in my path?",
      "Because a Bézier curve does not reach its control points. For M 0 0 C 0 100 100 100 100 0 the control points sit at y = 100, but the curve's highest point is y = 75, found by solving the derivative of the cubic for t in (0, 1). Tools that report the control-point hull will tell you 100, which is why a viewBox based on that leaves visible padding.",
    ],
    [
      "Can I shorten a path safely?",
      "Yes. Converting to relative form, rounding coordinates and dropping unnecessary separators are all lossless in the sense that the rendered shape stays the same to within the rounding you choose. At 3 decimals any point moves by at most 0.0005 user units. What is not safe is rounding a path drawn on a small viewBox to 0 decimals, which can visibly flatten curves.",
    ],
  ],
};

export default seo;
