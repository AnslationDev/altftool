const seo = {
  intro:
    "The Fractal Generator draws five classic fractals in real time — the Mandelbrot set, a Julia set, the Sierpinski triangle, the Koch snowflake and the Barnsley fern — and shows the generating rule beside each one. It uses the method that actually defines each shape: escape-time iteration of z → z² + c for the Mandelbrot and Julia sets, the chaos game for Sierpinski, recursive middle-third replacement for Koch, and the four affine transformations of the Barnsley iterated function system. It is built for students and teachers who need to see how a single iteration depth changes the picture.",
  useCases: [
    "Explaining self-similarity in a maths lesson by sliding iteration depth from 20 upward and watching the Koch snowflake grow a new generation of spikes",
    "Showing that the Barnsley fern is not drawn leaf by leaf but plotted point by point from four weighted affine maps, one of which is picked only 1% of the time",
    "Getting a quick, correct picture of the Mandelbrot boundary for a slide or worksheet without installing plotting software",
  ],
  benefits: [
    ["The rule is shown with the picture", "Each fractal is labelled with its generating formula and a one-line description, so the image and the maths stay connected."],
    ["Two different families side by side", "Escape-time sets and iterated function systems are both included, which makes the difference between the two construction methods obvious."],
    ["One slider drives everything", "Iteration depth controls escape iterations, chaos-game point counts and recursion levels alike, so a single control shows convergence across all five."],
  ],
  faqs: [
    [
      "Which fractals can this generate?",
      "Five: the Mandelbrot set, a Julia set, the Sierpinski triangle, the Koch snowflake and the Barnsley fern. The Julia set uses the fixed constant C = -0.7 + 0.27015i, a value that sits just outside the Mandelbrot set and gives the familiar dendritic shape.",
    ],
    [
      "What does the iteration depth slider change?",
      "It runs from 20 to 150 and means something slightly different per fractal: for Mandelbrot and Julia it is the escape-iteration cap, for Sierpinski and the fern it multiplies the number of plotted points (150 and 200 points per unit respectively), and for Koch it sets the recursion level.",
    ],
    [
      "How is the Barnsley fern actually drawn?",
      "By repeatedly applying one of four affine transformations chosen at random with fixed probabilities — roughly 1% for the stem map, 85% for the main frond, and the remainder split between the two side leaflets. Each application produces one point, and the fern shape emerges from millions of them, never from a drawn outline.",
    ],
    [
      "Why does the Koch snowflake stop getting more detailed?",
      "Recursion is capped at a small number of levels so the render stays instant — past that point each extra generation quadruples the segment count for detail thinner than a pixel on the 480x360 canvas. Mathematically the boundary is infinite in length while enclosing a finite area.",
    ],
  ],
};

export default seo;
