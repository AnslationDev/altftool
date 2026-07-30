const seo = {
  intro:
    "Fractal Explorer renders four escape-time fractals — Mandelbrot, Julia, Burning Ship and Tricorn — on a canvas you can click to zoom, drag to pan and export as a PNG. Every pixel is iterated under z → z² + c (with the sign flips that define Burning Ship and Tricorn) until it passes the escape radius or hits the iteration cap, and the escape count is mapped through a two-colour gradient with optional smooth log-log shading. It is aimed at anyone who wants a specific, reproducible fractal image rather than a random one: the centre coordinates, zoom, iteration count and Julia constant are all typed in and visible.",
  useCases: [
    "Producing a wallpaper or print at a known spot — set centre X to -0.7435 and centre Y to 0.1314, push iterations to 900, then export the PNG",
    "Showing a class why the Julia set changes shape by holding the view fixed and stepping the constant c through values around -0.8 + 0.156i",
    "Chasing detail in a deep zoom and finding out first-hand that the interior turns into a flat blob until you raise the iteration cap",
  ],
  benefits: [
    ["Four families, one set of controls", "Mandelbrot, Julia, Burning Ship and Tricorn all share the same centre, zoom, iteration and palette controls, so comparisons stay honest."],
    ["Coordinates you can write down", "Centre X, centre Y, zoom and iteration count are numeric fields, so a view you like can be recorded and recreated exactly."],
    ["Banding controls that actually help", "Smooth colouring uses the normalised iteration count with a log-log correction, and 2x or 3x supersampling cleans up the edges before export."],
  ],
  faqs: [
    [
      "What fractals can I draw?",
      "Four: the Mandelbrot set, Julia sets, the Burning Ship fractal and the Tricorn (also called the Mandelbar). Julia sets additionally expose the constant c as separate real and imaginary inputs, which is what changes the shape.",
    ],
    [
      "Why does the image look flat and blocky when I zoom in far?",
      "Because the iteration cap is too low for that depth — points near the boundary need more iterations to be told apart the further you zoom. Raise Max Iterations, which ranges from 50 up to 2000 here; the built-in deep presets sit at 900 to 950.",
    ],
    [
      "What does the escape radius do?",
      "It sets the modulus at which a point is declared escaped, adjustable from 2 to 20 with a default of 4. Anything above 2 is mathematically sufficient, but a larger radius gives smooth colouring more room and reduces banding in the outer rings.",
    ],
    [
      "How do I save the image I made?",
      "Use Export PNG, which writes the current canvas straight to a downloaded file. For a cleaner result, set supersampling to 2x or 3x first so the render is antialiased before it is saved.",
    ],
  ],
};

export default seo;
