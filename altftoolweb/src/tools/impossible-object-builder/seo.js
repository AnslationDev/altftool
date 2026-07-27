const seo = {
  intro:
    "This builder generates Penrose-style impossible objects — the tribar, a four-bar impossible rectangle and an endless staircase — out of unit cubes on a 3D lattice, then draws them with a general axonometric projection. They work for one precise reason: under a true isometric view (azimuth 45°, elevation asin(1/√3) ≈ 35.264°) the entire line of points t(1, 1, 1) collapses onto a single screen point, so a circuit of bars that travels n cells in x, n in y and n in z returns to exactly where it started in the picture while being nowhere near it in space. It is for designers, teachers and anyone who wants to see the illusion assembled and then deliberately broken.",
  useCases: [
    "Generate a clean SVG Penrose triangle at a chosen bar length for a poster or logo study.",
    "Show a geometry class why the illusion collapses the moment the camera leaves 45° / 35.26°.",
    "Prototype an endless staircase loop and read off the exact circuit that makes it close.",
  ],
  benefits: [
    ["Constructed, not traced", "Every figure is built from real lattice cells and painted back to front, so the geometry is inspectable."],
    ["Breaks on demand", "The azimuth and elevation sliders show the gap in pixels between the two ends of the circuit."],
    ["Clean SVG out", "Copy or download vector markup that scales to any size and inherits the surrounding text colour."],
  ],
  faqs: [
    [
      "Why does the Penrose triangle only work from one angle?",
      "Because it depends on the isometric view direction (1, 1, 1), where azimuth is 45° and elevation is asin(1/√3) ≈ 35.264°. Only along that direction does a displacement of (n, n, n) project to zero. Move the azimuth by even five degrees and the two ends of the bar separate on screen.",
    ],
    [
      "Can a Penrose triangle be built in real life?",
      "Not as a genuine closed triangle, but a sculpture with a real gap can be photographed from the one isometric viewpoint where the gap disappears — which is how the well-known Perth and Gotschuchen sculptures work. This tool generates the projection, not a manufacturable solid.",
    ],
    [
      "What makes an endless staircase close?",
      "The same (1, 1, 1) rule. A rectangular circuit p by q that rises one cell every k cells closes in projection when p(k − 2) = q(k + 2). With k = 4 that means p = 3q, giving a net displacement of (2q, 2q, 2q), which lands back on the starting point on screen.",
    ],
    [
      "Is this the same as an Escher drawing?",
      "It uses the same principle. Escher's Ascending and Descending is built on the Penrose stairs, which Roger and Lionel Penrose published in 1958 after seeing Escher's work, and both rely on parallel projection discarding depth. The difference is that these figures are generated from explicit lattice coordinates rather than drawn by hand.",
    ],
  ],
};

export default seo;
