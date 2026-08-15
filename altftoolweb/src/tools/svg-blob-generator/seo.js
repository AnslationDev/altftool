const seo = {
  title: "SVG Blob Generator: Seeded Organic Shapes, One Path",
  metaDescription:
    "Set 3 to 12 points and 0-100% fluidity to build one closed quadratic-Bezier path in a 400x400 viewBox. The same seed always redraws the identical blob.",
  steps: [
    "Drag Complexity (Points) between 3 and 12 and Fluidity (Randomness) between 0 and 100% to shape the outline around the 130-unit base radius.",
    "Under Fill Scheme choose Linear Gradient or Solid Color, set the Stop 1 and Stop 2 colours, and press Mutate Shape until the seeded silhouette fits.",
    "Read the Generated SVG Code — a 400x400 viewBox holding a single path — then press Copy, or Download to save organic-blob-seed-<seed>.svg.",
  ],
  intro:
    "This generator builds organic blob shapes by scattering points around a circle and joining them with quadratic Bézier curves through their midpoints, producing a single closed SVG path you can copy or download. You control the number of points from 3 to 12, how far each point is pushed off the base radius (0–100% fluidity), and whether the shape is filled with a solid colour or a two-stop linear gradient. Every shape comes from a numeric seed, so the same seed and settings always redraw the identical blob.",
  useCases: [
    "You need a soft background shape behind a hero section and want one that is not the same blob every other site is using — mutate the seed until a silhouette fits, then paste the path straight into your JSX",
    "A slide deck or app onboarding screen needs three matching decorative shapes in your brand colours, so you set the two gradient stops once and export three seeds with the same point count",
    "You are testing how a shape behaves at different sizes and want a clean, single-path SVG with no editor cruft rather than something exported from a design tool",
  ],
  benefits: [
    ["Seeded, so shapes are reproducible", "The offsets come from a deterministic function of the seed number, so noting the seed is enough to recreate the exact blob later."],
    ["One path, no wrapper junk", "The output is a 400×400 viewBox with a single <path> and, for gradients, one <linearGradient> — nothing to clean up before shipping."],
    ["Shape and smoothness controlled separately", "Point count sets how many lobes the outline has; fluidity sets how far each lobe deviates, so you can get busy-but-gentle or simple-but-dramatic."],
  ],
  faqs: [
    [
      "How many points should I use?",
      "Three to five points gives a soft, pebble-like shape and eight to twelve gives a rippled, more complex outline; the slider runs from 3 to 12 and the default is 6. Because consecutive points are joined through their midpoints with quadratic curves, the outline stays smooth at every setting.",
    ],
    [
      "What does the fluidity slider actually change?",
      "It scales how far each point can move off the base radius. At 0% every point sits on the circle and you get a plain ellipse; at 100% a point can be pushed up to 70 units in or out of the 130-unit base radius, which is where the deep lobes come from.",
    ],
    [
      "Will I get the same blob again if I come back tomorrow?",
      "Yes, as long as you keep the seed number, the point count and the fluidity value. The point offsets are derived arithmetically from the seed rather than from a random number generator, so identical inputs always redraw the identical path — the filename of each download includes its seed for exactly this reason.",
    ],
    [
      "Can I recolour the blob after exporting it?",
      "Yes — the exported file is plain text. For a solid fill, change the hex value in the path's fill attribute; for a gradient, edit the two stop-color values inside the linearGradient, which runs corner to corner from top-left to bottom-right.",
    ],
  ],
};

export default seo;
