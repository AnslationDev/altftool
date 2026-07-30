const seo = {
  title: "Free Golden Ratio & Golden Spiral Generator",
  h1: "Golden Ratio & Golden Spiral Generator",
  metaDescription:
    "Generate a golden spiral, Fibonacci grid, phi grid or rule-of-thirds overlay, restyle the colours and rotation, then export it as a PNG. Free.",
  intro:
    "The Golden Ratio Visualizer generates phi-based composition guides on its own canvas and exports them as a PNG. Five overlays can be shown together or one at a time: a golden spiral drawn as quarter-circle arcs across nested Fibonacci rectangles, the Fibonacci rectangle grid itself, a phi grid whose lines fall at roughly 38.2% and 61.8% of the width and height (1/φ), a rule-of-thirds grid for comparison, and corner-to-corner diagonal guides. Everything about how they look is adjustable — canvas size from 480 to 1400 px square, 4 to 16 Fibonacci tiles, stroke colour and width, fill shading, a solid or two-stop gradient background, solid, dashed or dotted lines, rotation from -180° to +180°, a clockwise or counter-clockwise spiral, and an optional slow rotation animation. There is no photo upload: the guides are generated artwork you export and then place over your own image in a design or photo editor.",
  useCases: [
    "Producing a golden spiral or Fibonacci grid PNG to add as a guide layer above your own artwork in Photoshop, GIMP, Figma or Canva",
    "Putting the phi grid and the rule-of-thirds grid on the same canvas to decide which composition system you actually want to work to",
    "Generating a clean phi-proportioned graphic — spiral, grid, or both — for a slide, worksheet or lesson about the golden ratio",
  ],
  benefits: [
    [
      "Five overlays, each toggleable",
      "Golden spiral, Fibonacci rectangle grid, phi grid, rule of thirds and diagonal guides switch on and off independently, so you can stack them or compare them one at a time on the same canvas.",
    ],
    [
      "Styled to match the work it sits over",
      "Stroke colour and a 0.5–8 width slider, fill shading on the Fibonacci rectangles, solid, dashed or dotted lines, a solid or two-stop gradient background, and rotation anywhere from -180° to +180°.",
    ],
    [
      "Exports up to 1400 px square",
      "The canvas slider runs 480–1400 px and Export PNG saves exactly what is on screen, so the guide stays sharp when you scale it over a large image.",
    ],
    [
      "Presets, random styling and reset",
      "Classic Spiral, Photo Composition, Blueprint and Editorial Warm set the overlays and styling in one click; Random Style shuffles the colours, rotation and line style, and Reset Layout returns everything to defaults.",
    ],
  ],
  faqs: [
    [
      "Can I upload my own photo and put the golden spiral on top of it?",
      "Not in this tool — it draws the guides on its own canvas rather than on an uploaded image. Export the overlay as a PNG and add it as a layer above your photo in Photoshop, GIMP, Figma or Canva. Because the export keeps the background colour or gradient you chose, it is not transparent, so set that layer's blend mode to Screen or drop its opacity to see the picture through it.",
    ],
    [
      "What is the golden ratio, and how do I compose with it?",
      "It is the proportion φ = (1 + √5) / 2 ≈ 1.618: split a line so that the whole is to the longer part as the longer part is to the shorter, and you have divided it at about 61.8%. The phi grid here draws exactly those lines — near 38.2% and 61.8% of the frame's width and height — and the usual advice is to place a subject, horizon or focal point on one of them, or where two of them cross.",
    ],
    [
      "What is the difference between the golden spiral and the Fibonacci grid?",
      "The Fibonacci grid is the set of nested rectangles whose side lengths follow the Fibonacci sequence; the Tiles slider sets how many are drawn, from 4 to 16. The golden spiral is the curve traced through those same rectangles as a quarter-circle arc in each one. They are two views of the same construction, and each has its own checkbox, so you can show the spiral alone, the rectangles alone, or both together.",
    ],
    [
      "How is the phi grid different from the rule of thirds?",
      "Where the lines land. A rule-of-thirds grid divides the frame at 33.3% and 66.7%; the phi grid divides it at roughly 38.2% and 61.8%, so its lines sit closer to the centre. Both grids are separate checkboxes here, which is the quickest way to see how much difference that actually makes to a given composition.",
    ],
    [
      "What size and file format is the export?",
      "A PNG at whatever canvas size you set — anywhere from 480 to 1400 px square — downloaded as golden-ratio- followed by a timestamp. The background colour or gradient you chose is painted into the file, so the PNG is opaque rather than transparent.",
    ],
    [
      "Can I flip the spiral or turn the whole composition?",
      "Yes. Open Advanced Features: Spiral Direction switches between clockwise and counter-clockwise, and the Rotation slider turns the entire overlay from -180° to +180°, so the spiral's tightest point can end up in any corner. Animate Rotation turns that into a slow continuous spin with its own speed control, and Export PNG captures whatever frame is on screen at the time.",
    ],
    [
      "Is the golden ratio generator free?",
      "Yes — free, no signup, no watermark and no cap on exports. The whole canvas is drawn in your browser, so nothing you make is uploaded anywhere.",
    ],
  ],
  steps: [
    "Tick the overlays you want — Golden Spiral, Fibonacci Grid, Phi Grid, Rule of Thirds, Diagonal Guides — or load a preset such as Classic Spiral or Photo Composition.",
    "Set the canvas size and tile count, then style it: stroke colour and width, fill shading, background colour or gradient, and — under Advanced Features — line style, spiral direction and rotation.",
    "Click Export PNG, then place the downloaded file over your own image as a guide layer in your design or photo editor.",
  ],
};

export default seo;
