const seo = {
  title: "Zoom Virtual Background Maker With a Face-Safe",
  metaDescription:
    "Builds a 1920x1080 16:9 Zoom background, marks the face-safe zone your head covers, scores WCAG text contrast and exports a PNG under Zoom's 15 MB cap.",
  steps: [
    "Fill in Name, Role or company and Handle or website, then set Export size to 1920 x 1080 (Zoom recommended) or 1280 x 720 (Zoom minimum).",
    "Choose a Theme, a Brand panel position such as Top left, Your camera framing (Close-up, Medium or Wide) and Where you sit, then toggle Show face-safe zone and Mirror preview (self view).",
    "The panel reports Brand panel covered by you as a percentage, the gallery-legible floor for a 320 px tile and Text contrast (WCAG 2.1); Download PNG saves a file named like priya-raman-zoom-background-1920x1080.png.",
  ],
  intro:
    "Zoom Virtual Background Maker builds a 16:9 branded background at Zoom's own specs — 1920x1080 recommended, 1280x720 minimum, under the 15 MB image cap — and marks the face-safe zone where your head and shoulders will cover the artwork. It measures how much of your name panel you would sit on top of, scores text contrast with the WCAG 2.1 formula, and sets a minimum type size that still reads when Zoom shrinks you into a gallery tile. Aimed at anyone who wants a name-and-role lower third on calls without hiring a designer.",
  useCases: [
    "Put your name, role and website on a call background for a webinar or client pitch without covering them with your own head.",
    "Give a whole team matching backgrounds by fixing the theme and panel position and changing only the name line.",
    "Check whether your job title is still readable when a 12-person call shrinks everyone to small gallery tiles.",
    "Move the brand panel to the opposite corner because you sit left of centre on your webcam.",
  ],
  benefits: [
    ["Face-safe zone is measured", "The panel's overlap with your typical head-and-shoulders footprint is reported as a percentage, not a guess."],
    ["Gallery-tile legibility floor", "Type is floored at the size that still reads when Zoom scales the frame down to a 320 px tile."],
    ["Spec-checked before upload", "Dimensions, 16:9 aspect and file weight are checked against Zoom's stated limits after export."],
  ],
  faqs: [
    [
      "What size should a Zoom virtual background be?",
      "Use 1920x1080 pixels at a 16:9 aspect ratio — that is the size Zoom recommends. The minimum accepted is 1280x720, and the uploaded image must stay under 15 MB in GIF, JPG or PNG.",
    ],
    [
      "Why does the text on my Zoom background look backwards?",
      "Zoom mirrors your self view by default, so you see the image flipped while everyone else sees it the right way round. Turn off mirroring in Video settings to confirm, or judge the layout using the unmirrored preview here.",
    ],
    [
      "Where should I put a logo or name on a virtual background?",
      "In a corner outside the central column your body occupies — typically the outer 25-30% of the frame width. At medium framing your head and shoulders cover roughly the middle 42% of the width from about 12% down to the bottom edge.",
    ],
    [
      "Do I need a green screen for a virtual background?",
      "Not on hardware Zoom supports for software segmentation, but a plain, evenly lit wall behind you gives far cleaner edges. A green screen still produces the sharpest keying, especially in low light or when you move quickly.",
    ],
  ],
};

export default seo;
