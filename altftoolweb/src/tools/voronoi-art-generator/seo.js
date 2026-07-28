const seo = {
  title: "Voronoi Diagram Generator — Free Online Art Maker",
  h1: "Voronoi Art Generator",
  metaDescription:
    "Free Voronoi diagram generator: set 5-200 seed points, choose from 12 palettes, run Lloyd relaxation, export PNG, JPG or WebP. Runs in your browser.",
  intro:
    "The Voronoi Art Generator builds a Voronoi diagram by brute force on an HTML5 canvas: for every pixel block (1-4 px) it measures the Euclidean distance to each of your 5-200 seed points and fills that block with the nearest seed's palette colour. Seed positions come from a seeded pseudo-random generator — the fractional part of sin(seed + i) x 10000 — so a given seed reproduces the same layout, and the Relax buttons run Lloyd's relaxation, resampling the canvas and moving each seed to the centroid of its own cell. All drawing happens locally through the Canvas 2D API; nothing is uploaded to a server.",
  useCases: [
    "Generating abstract geometric backgrounds for websites, app screens, slide decks, and social cards",
    "Producing cracked-mosaic and stained-glass textures for posters, album art, and game assets",
    "Demonstrating Voronoi tessellation and Lloyd's relaxation live for a class, tutorial, or portfolio piece",
  ],
  benefits: [
    [
      "Reproducible seeded layouts",
      "Point positions are derived from a seed value rather than raw randomness, so the same seed and point count regenerate the same diagram — you only get a new pattern when you ask for one.",
    ],
    [
      "Lloyd relaxation built in",
      "Relax x1 and Relax x3 move every seed to its cell centroid, turning a clumpy random scatter into evenly sized, honeycomb-like cells without redrawing from scratch.",
    ],
    [
      "Interactive seeds and symmetry",
      "Click the canvas to add a seed, drag one to move it, right-click to remove it — or switch on symmetry mode to mirror every seed across a vertical or horizontal axis for kaleidoscopic compositions.",
    ],
    [
      "Three export formats, free",
      "Save the canvas as PNG, JPG, or WebP (JPG and WebP at quality 0.95). No account, no watermark, and no upload — the file is generated from the canvas on your own device.",
    ],
  ],
  faqs: [
    [
      "What is a Voronoi diagram?",
      "A Voronoi diagram divides a plane into regions — one per seed point — where every position inside a region is closer to that seed than to any other. This tool computes exactly that: it walks the canvas in small blocks, measures the straight-line (Euclidean) distance from each block to every seed, and colours the block for whichever seed is nearest.",
    ],
    [
      "How do I make Voronoi art online for free?",
      "Set the point count, pick one of the 12 colour schemes, adjust borders and opacity, then hit an export button. The generator is free with no signup, no watermark, and no export limit, and it renders entirely in your browser.",
    ],
    [
      "Can I download the Voronoi pattern as PNG or SVG?",
      "PNG, JPG, and WebP — not SVG. The diagram is rasterised pixel-block by pixel-block on an HTML5 canvas, so exports come from canvas.toDataURL: lossless PNG, or JPG and WebP at quality 0.95. The saved image matches the on-screen canvas, which is capped at 600 px tall.",
    ],
    [
      "What does the Relax button do?",
      "It runs Lloyd's relaxation on your seed points. One pass samples the canvas on a coarse grid, assigns each sample to its nearest seed, then moves every seed to the average position of the samples it owns. Repeating it (Relax x3) pushes the layout toward a centroidal Voronoi tessellation, so cells become more uniform and organic instead of clumped.",
    ],
    [
      "How many points should I use for a Voronoi background?",
      "Roughly 20-60 for bold poster-scale shapes and 100-200 for fine mosaic texture; the default is 50 and the slider runs from 5 to 200. Rendering cost grows with point count because every pixel block is compared against every seed, so at high counts raise Pixel Size to 3 or 4 to keep drawing smooth.",
    ],
    [
      "Can I animate the Voronoi pattern?",
      "Yes — the Animation Speed slider (0 to 5) nudges each seed by a small random offset on every requestAnimationFrame tick, so the cells drift and breathe. Set it to 0 for a static image. Export captures a single frame; there is no GIF or video output.",
    ],
    [
      "What colour schemes and presets are included?",
      "Twelve palettes: rainbow, pastel, dark, neon, sunset, ocean, forest, candy, arctic, volcano, cyberpunk, and vintage. There are also four presets — Minimalist (20 points, dark, borderless), Vibrant (60, neon), Serene (40, ocean), and Dreamy (50, pastel) — plus an optional two-colour gradient background, cell opacity from 30% to 100%, and your own border and seed-point colours.",
    ],
    [
      "Does the Copy CSS button copy my generated pattern?",
      "No — it copies a short starter snippet (a linear-gradient background plus canvas sizing rules) for dropping a canvas element into a page, not the artwork you generated. To reuse the actual diagram on a site, export it as PNG or WebP and set that file as a background-image.",
    ],
  ],
  steps: [
    "Choose a preset or set the point count (5-200) and a colour scheme, then toggle cell borders, gradient background, and seed-point markers.",
    "Shape the layout: click the canvas to add seeds, drag to reposition them, right-click to delete, or press Relax x1 / x3 to even out the cells.",
    "Export the result as PNG, JPG, or WebP — the file downloads straight from the canvas, with no account required.",
  ],
};

export default seo;
