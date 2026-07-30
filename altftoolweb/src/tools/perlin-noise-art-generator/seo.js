const seo = {
  title: "Perlin Noise Generator — Texture & Terrain",
  h1: "Perlin Noise Art Generator",
  metaDescription:
    "Free Perlin noise generator in your browser — tune octaves, lacunarity and seed, then export normal, height, roughness and AO maps up to 4096px.",
  intro:
    "The Perlin Noise Art Generator renders classic Ken Perlin gradient noise pixel by pixel into a Canvas 2D ImageData buffer, using Perlin's quintic fade curve (6t⁵ − 15t⁴ + 10t³) over a 256-entry permutation table that is doubled to 512 and shuffled by a Park–Miller generator (seed × 16807 mod 2³¹−1), so any integer seed reproduces the same field exactly. Detail comes from fractional Brownian motion — up to 8 octaves summed with your persistence and lacunarity — plus a ridged variant that accumulates (1 − |noise|)² per octave for sharp crests. Eight output transforms (clouds, terrain, water, smoke, lava, marble, wood, abstract) and ten palettes including viridis, plasma, inferno and ocean map the field to colour. Everything runs in your browser in plain JavaScript; no image and no parameter is sent to a server.",
  useCases: [
    "Generate a seeded heightmap for game terrain and export the matching normal, roughness and ambient occlusion maps as a single ZIP at up to 4096px.",
    "Build cloud, smoke or water textures for a shader or VFX pass without opening Substance Designer or Blender.",
    "Produce abstract generative art — marble, wood and ridged patterns through the viridis, plasma or sunset palettes — as a PNG or a 4-second WebM loop.",
  ],
  benefits: [
    [
      "Every map from one seed",
      "Export Map Pack ZIP re-renders base colour, normal, height, roughness and ambient occlusion at your export resolution (512–4096px in 512px steps) and adds a manifest.json holding the seed and every slider value.",
    ],
    [
      "Reproducible by seed",
      "The integer seed drives the permutation shuffle, so identical seed plus identical settings always redraw the same field. Your last 20 seeds and up to 30 favourites are kept in your browser's localStorage.",
    ],
    [
      "Real-time preview with adaptive quality",
      "Fast mode renders the preview at half resolution (256px minimum) so sliders respond instantly; switch to High for the full 256–2048px preview before you export.",
    ],
    [
      "Nothing leaves your device",
      "The noise loop, PNG encoding, ZIP packing via JSZip and WebM recording all run client-side. No account, no upload, no server round-trip.",
    ],
  ],
  faqs: [
    [
      "What do octaves, persistence and lacunarity do in Perlin noise?",
      "Octaves is how many copies of the noise are summed, persistence is how much quieter each copy gets, and lacunarity is how much finer it gets. This tool allows 1–8 octaves; at each one the amplitude is multiplied by persistence (0–1) and the frequency by lacunarity (1–4), then the total is divided by the summed amplitude so the range stays stable. Low persistence with high lacunarity gives soft shapes with fine grain; persistence near 1 makes every octave equally loud and the result reads as static.",
    ],
    [
      "What is the difference between Perlin, value, fBm and ridged noise?",
      "Perlin interpolates gradients at the lattice corners; value noise interpolates the corner values themselves, which is cheaper but visibly blockier. fBm here is the same Perlin field summed across your octaves. Ridged inverts each octave — it accumulates (1 − |perlin|)² — which turns the zero crossings into sharp creases, the standard approach for mountain ridges and vein-like patterns.",
    ],
    [
      "How do I export a normal map from Perlin noise?",
      "Use Export Map Pack ZIP. It re-renders the current settings five times — base colour, normal, height, roughness and ambient occlusion — at the Export Resolution you set (512 to 4096px in 512px steps) and zips them alongside a manifest.json recording seed, noise type, output type, palette and every slider. The normal map is built by sampling the height one pixel step away in X and Y, scaling the difference by 5, normalising the vector and encoding it into RGB.",
    ],
    [
      "Is this Perlin noise generator free, and does it upload anything?",
      "It is free with no account, and nothing is uploaded. The noise loop, the PNG encoding, the ZIP (JSZip) and the WebM recording all execute in your browser's JavaScript. The only data stored anywhere is your presets, seed history and favourite seeds, held in your own browser's localStorage under the keys perlin_user_presets, perlin_seed_history and perlin_seed_favorites.",
    ],
    [
      "How do I get the same noise pattern back later?",
      "Save the seed. The integer seed shuffles the 256-entry permutation table, so the same seed with the same scale, octaves, persistence, lacunarity and output type always redraws an identical field. The tool keeps your last 20 seeds plus up to 30 favourites, Save Preset stores the full parameter set, and the manifest.json inside the map pack ZIP records it too.",
    ],
    [
      "How do I make procedural terrain with Perlin noise?",
      "Choose the terrain output type. It quantises the noise into five bands rather than a smooth gradient, so the result reads as deep water, shallows, lowland, hills and peaks. Pair it with the earth or ocean palette, raise octaves to 5 or 6 for coastline detail, and use Export Map Pack ZIP to get the matching greyscale heightmap for a terrain shader or displacement modifier.",
    ],
    [
      "Can I make a seamless tiling texture?",
      "There is a Seamless toggle that remaps the X and Y sample coordinates through a cosine before the noise is evaluated, so the field wraps instead of cutting off at the edge. It behaves best at moderate scale values — tile a test export in your engine or image editor and check the seam before committing to a large batch.",
    ],
    [
      "How do I export an animation instead of a still image?",
      "Export Animation WebM switches on Auto Animate, captures the canvas at 30fps with canvas.captureStream() and MediaRecorder, and saves a fixed 4-second video/webm file. Animation Speed (0.001–0.1) sets how far the sample offset advances per frame. Chrome, Edge and Firefox record WebM natively; Safari's MediaRecorder support for video/webm is limited, so use a Chromium browser if the download does not appear.",
    ],
  ],
  steps: [
    "Pick a noise type — perlin, value, fbm or ridged — then an output mode such as clouds, terrain, water, lava, marble or wood, and one of the ten palettes.",
    "Tune scale (1–200), octaves (1–8), persistence, lacunarity (1–4), brightness, contrast and tiling X/Y until the live preview looks right, using Random Seed to jump to a fresh field and Save Preset to keep a look.",
    "Export: PNG saves the preview canvas, Export Map Pack ZIP writes base, normal, height, roughness and AO at up to 4096px with a manifest.json, and Export Animation WebM records a 4-second clip.",
  ],
};

export default seo;
