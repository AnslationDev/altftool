const seo = {
  intro:
    "Scan Line Overlay Generator builds CRT-style stripe overlays — horizontal scan lines, a vertical aperture grille, an RGB shadow mask or interlaced field lines — and exports them as a transparent SVG, PNG or pure CSS. The pattern is described by a period (start of one line to the start of the next) and a thickness, so surface coverage is thickness ÷ period and the average light removed is coverage × opacity. It also matches real display standards: 486 active lines for NTSC, 576 for PAL, 480 for VGA and 200 for CGA.",
  useCases: [
    "Add a retro CRT texture over a game trailer thumbnail without dimming it more than 20%.",
    "Generate an aperture grille overlay sized to a 1080-pixel-tall canvas that matches PAL's 576 active lines.",
    "Export a transparent PNG to drop on a layer above artwork in Photoshop, Figma or a video editor.",
    "Get a CSS-only version so a web hero section gets the effect without loading an image.",
  ],
  benefits: [
    [
      "Tells you the cost",
      "Coverage, average alpha and the resulting brightness change are calculated, not guessed at by eye.",
    ],
    [
      "Real display standards",
      "One click sets the period to match NTSC, PAL, VGA or CGA active line counts at your output height.",
    ],
    [
      "Three export routes",
      "Transparent SVG, transparent PNG and a repeating-gradient CSS block, all from the same settings.",
    ],
  ],
  faqs: [
    [
      "How many scan lines should a CRT overlay have?",
      "Match the standard you are imitating: NTSC 525-line systems show 486 active lines, PAL and SECAM 625-line systems show 576, VGA shows 480 and CGA shows 200. On a 1080-pixel-tall canvas that works out to a period of roughly 2.2 px for NTSC; PAL's raw ratio is about 1.9 px, which falls under the tool's 2 px minimum period, so it is rounded up to 2 px — the smallest stripe the overlay can draw without failing validation.",
    ],
    [
      "Why do my scan lines shimmer or produce moiré?",
      "A stripe period under about 4 CSS pixels aliases against the display grid once the overlay is scaled or the browser zoom is not a whole number. Either increase the period, or export at exactly the display size so no resampling happens.",
    ],
    [
      "How much does a scan line overlay darken an image?",
      "Multiply coverage by opacity. A 2 px line on a 4 px period covers 50% of the surface, so at 0.35 opacity it removes about 17.5% of the light. Compensate by raising the underlying image's brightness before the overlay goes on.",
    ],
    [
      "What is the difference between an aperture grille and a shadow mask?",
      "An aperture grille (Trinitron-style) uses continuous vertical stripes, so the overlay is vertical lines. A shadow mask uses discrete red, green and blue phosphor triads, which reads as a tinted three-stripe repeat rather than a plain darkening.",
    ],
  ],
};

export default seo;
