const seo = {
  intro:
    "Canvas Wrap Bleed Calculator works out the full print size a gallery-wrapped canvas needs: print width equals face width plus twice the stretcher bar depth plus twice the back tuck, and the same again for height. It reports the bleed on every edge, the safe zone your subject must stay inside on the front face, how much of the image disappears around the sides, and the pixel count needed to hit 300 DPI at that print size. Aimed at photographers and print buyers sizing a file before it goes to a canvas lab.",
  useCases: [
    "Size a 40 × 50 cm canvas on 1.5 inch bars and find the 55.2 × 65.2 cm sheet you actually have to print.",
    "Check whether a subject's head or a signature will be lost around the side of a deep 2 inch gallery wrap.",
    "See how much extra canvas a wrap consumes compared with a flat print of the same visible size.",
    "Confirm a 6000 pixel wide file still clears 150 DPI once the bleed is added to the print dimensions.",
  ],
  benefits: [
    ["Exact sheet size", "Face size plus depth plus tuck on all four edges, in millimetres, centimetres or inches."],
    ["Safe zone drawn out", "Shows how far in from the sheet edge your important detail has to start."],
    ["Resolution check", "Compares your file width against the printed sheet and flags anything under 150 DPI."],
  ],
  faqs: [
    [
      "How much bleed does a gallery wrapped canvas need?",
      "Bleed per edge equals the stretcher bar depth plus the back tuck, so a standard 1.5 inch bar with a 1.5 inch tuck needs 3 inches (about 76 mm) on every side — 6 inches added to both the width and the height. Slim 0.75 inch bars with a 1.5 inch tuck need about 57 mm per edge.",
    ],
    [
      "What is the safe zone on a canvas print?",
      "The safe zone is the part of the front face where nothing gets bent over the corner fold, normally at least 0.5 inch (about 13 mm) inside the fold line. Faces, text and signatures should sit inside it; anything closer to the edge risks landing on the rounded corner or being pulled out of square during stretching.",
    ],
    [
      "Should I use an image wrap or a mirrored wrap?",
      "Use an image wrap when the photo has spare margin you are happy to lose around the sides, and a mirrored wrap when the composition reaches the edges — mirroring flips a strip of the image outward so the sides are filled without cropping the front. A solid colour wrap is the third option and loses nothing at all.",
    ],
    [
      "What resolution do canvas prints need?",
      "Most canvas labs ask for 150 DPI as a minimum and 300 DPI as the target, measured across the full printed sheet including bleed rather than just the visible face. Canvas texture hides softness better than photo paper, so 150 DPI usually looks acceptable on large pieces viewed from a normal distance.",
    ],
  ],
};

export default seo;
