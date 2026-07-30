const seo = {
  title: "Reaction Diffusion — Free Gray-Scott Model",
  h1: "Reaction Diffusion Simulator (Gray-Scott Model)",
  metaDescription:
    "Free Gray-Scott reaction diffusion simulator with zebra, leopard, coral and maze presets. Adjust feed, kill and diffusion live; runs in your browser.",
  intro:
    "The Reaction Diffusion Simulator runs the Gray-Scott model directly in your browser: two virtual chemicals share a grid, A is replenished at the feed rate f, B is removed at rate k+f, and the reaction A + 2B to 3B converts one into the other. Each cell updates as A += Da·∇²A − AB² + f(1−A) and B += Db·∇²B + AB² − (k+f)B, with values clamped to 0–1 and the Laplacian taken from a 3×3 kernel weighted −1 at the centre, 0.2 orthogonally and 0.05 diagonally. The two chemical fields live in Float32Arrays and are written straight into a Canvas 2D ImageData buffer inside a requestAnimationFrame loop — no WebGL, no server call, and nothing leaves your device.",
  useCases: [
    "Show a class how Turing patterns form — stripes, spots and mazes emerging from two local rules rather than from a drawn template.",
    "Explore procedural texture ideas by parking the sliders on the boundary between stripes and spots and letting the coral or maze pattern grow.",
    "Sanity-check Gray-Scott parameters before porting them into your own shader or simulation code, using the exact feed and kill numbers the presets expose.",
  ],
  benefits: [
    [
      "Four calibrated presets",
      "Zebra Stripes, Leopard Spots, Coral Growth and Maze each load their own feed/kill pair plus a matching seed layout, so a recognisable pattern appears within seconds of pressing Start.",
    ],
    [
      "Parameters you can move mid-run",
      "Feed, kill, both diffusion rates and the steps-per-frame speed are live sliders — the solver picks up new values on the very next frame, so you can watch stripes break apart into spots as you drag.",
    ],
    [
      "Paint directly into the grid",
      "Clicking or dragging injects chemical B into a 9-cell radius disc, letting you seed a pattern by hand instead of only from the presets.",
    ],
    [
      "Local and free",
      "The solver and the canvas rendering both run on your own device; there is no upload, no account and no network request while the simulation runs.",
    ],
  ],
  faqs: [
    [
      "What is the Gray-Scott reaction diffusion model?",
      "It is a two-chemical Turing model: chemical A is fed into the grid at rate f, chemical B is removed at rate k+f, and wherever they meet the reaction A + 2B to 3B (the AB² term) converts A into B. Because B diffuses more slowly than A — 0.5 against 1.0 in the default preset — the pair settles into stable stripes, spots or mazes instead of mixing evenly.",
    ],
    [
      "What feed and kill values make zebra stripes?",
      "Feed 0.0367 and kill 0.0649, with diffusion A at 1 and diffusion B at 0.5 — exactly what the Zebra Stripes preset loads. For comparison, Leopard Spots uses feed 0.055 / kill 0.062, Coral Growth uses 0.0545 / 0.062 with a slower B diffusion of 0.45, and Maze uses 0.029 / 0.057.",
    ],
    [
      "Why does my reaction diffusion pattern fade to nothing?",
      "Because the feed and kill sliders moved outside the narrow band where the pattern survives: when kill + feed removes B faster than the AB² reaction creates it, B decays toward zero and the canvas goes flat. The sliders cover feed 0.010–0.080 and kill 0.030–0.075 in 0.0005 steps, and living patterns occupy only a thin diagonal strip of that space. Press Reset to return to the preset's values and seed.",
    ],
    [
      "Can I draw on the reaction diffusion canvas?",
      "Yes. Click or drag anywhere on the canvas and the tool injects chemical B into a disc of radius 9 cells, setting B to 1 and A to 0.2 there; the running simulation then grows new structure outward from your stroke. Input goes through pointer events, so touch and stylus work the same way.",
    ],
    [
      "Does this simulator run in my browser or on a server?",
      "Entirely in your browser. The two chemical fields are Float32Arrays stepped in JavaScript and drawn to a Canvas 2D ImageData buffer, with no upload, no signup and no server round-trip — the page never sends your parameters or the resulting pattern anywhere.",
    ],
    [
      "How do I make the simulation run faster?",
      "Raise the Speed slider, which sets how many solver steps run per animation frame — 1 to 12, with 5 as the default. Grid size also matters: one simulation cell is drawn as a 4-pixel block, so a smaller browser window means fewer cells and a quicker frame. The Resolution tile under the canvas shows the current grid dimensions.",
    ],
    [
      "What do the Diffusion A and Diffusion B sliders do?",
      "They set how fast each chemical spreads into neighbouring cells — A ranges 0.6–1.4 and B ranges 0.2–0.8. Turing patterns require B to spread more slowly than A, so keep Diffusion B near half of Diffusion A as the presets do; raising B blurs the pattern's edges, lowering it sharpens and fragments them.",
    ],
    [
      "How do I save the pattern as an image?",
      "There is no download button in this tool, so take a screenshot of the canvas to keep a pattern. Hit Pause first and the frame freezes, which gives a clean capture; the pattern is drawn in your current theme's primary and background colours, so switching between light and dark changes how it looks.",
    ],
  ],
  steps: [
    "Choose a pattern preset — Zebra Stripes, Leopard Spots, Coral Growth or Maze — from the dropdown; each loads its own feed, kill and diffusion values along with a matching seed layout.",
    "Press Start to run the solver, then move the Feed, Kill, Diffusion A, Diffusion B and Speed sliders while it runs to steer the pattern.",
    "Click or drag on the canvas to inject chemical B and reshape the result; the Live Pattern Stats row tracks coverage (the share of cells where B exceeds 0.18) and grid resolution, while Reset restores the preset seed and Random Seed reseeds with noise.",
  ],
};

export default seo;
