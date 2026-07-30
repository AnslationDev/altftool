const seo = {
  intro:
    "Design Compare puts two images side by side, behind a before/after slider, or stacked as a variable-opacity overlay so you can see exactly where they differ. It adds a difference blend mode that turns identical pixels black and leaves mismatches glowing, a 24-pixel alignment grid, synced zoom from 0.5x to 3x, and panning across both images at once. It is for designers and front-end developers settling the question of whether a build actually matches the mockup.",
  useCases: [
    "A designer says the implemented header is off; you drop the Figma export and a screenshot into the overlay, turn on difference mode, and see the padding gap light up instead of arguing about it.",
    "You are reviewing a redesign with a stakeholder and want a before/after slider they can drag across the old and new homepage rather than two screenshots in a deck.",
    "Two exports look identical at a glance, so you zoom both to 3x on the same region and step through the grid to find the one-pixel border difference.",
  ],
  benefits: [
    ["Difference blend, not eyeballing", "Overlaying with mix-blend difference makes matching pixels go black, so anything still visible is a real discrepancy."],
    ["Zoom and pan stay in sync", "Both images share one transform from 0.5x to 3x, so you are always comparing the same region rather than two drifting viewports."],
    ["Reads out the file facts", "Shows each image's pixel dimensions, format and file size alongside the comparison, which catches scale mismatches before you start hunting for design bugs."],
  ],
  faqs: [
    [
      "What image formats can I compare?",
      "PNG, JPEG, WebP and GIF. Anything else is rejected with a message rather than loaded, and each accepted image reports its natural width and height so you can spot a resolution mismatch immediately.",
    ],
    [
      "How do I find small differences between two screenshots?",
      "Switch to overlay mode and turn on the Diff toggle — it applies a difference blend so identical pixels render black and only the mismatches stay visible. Zoom in up to 3x and pan to inspect a specific region once something shows up.",
    ],
    [
      "What is the grid for?",
      "It lays a 24-pixel guide over the preview so you can check alignment, spacing and edge positions against a consistent rhythm rather than judging by eye.",
    ],
    [
      "Can I save the comparison?",
      "Yes — the download button exports the current comparison view as a standalone HTML file, capturing the mode, opacity, slider position and zoom you set. Images are read locally through object URLs and never uploaded anywhere.",
    ],
  ],
};

export default seo;
