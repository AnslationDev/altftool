const seo = {
  title: "Lens & Mirror Ray Diagram Simulator: v, m, Image",
  metaDescription:
    "Drag object distance, focal length and height for a convex or concave lens or mirror; the two principal rays redraw and v, m and the image type follow.",
  steps: [
    "Under \"Optical Element Setup\" pick the optic — Convex Lens, Concave Lens, Concave Mirror or Convex Mirror.",
    "Drag the three sliders — Object Distance (u) from 30 to 300 mm, Focal Length (f) from 30 to 150 mm and Object Height (h_o) from 20 to 100 mm — and the canvas redraws the axis, F and 2F points and the two rays: one parallel to the axis through the focus, one through the optical centre or pole.",
    "Read \"Image Character & Metrics\" for Image Distance (v) in mm, Magnification (m), Real Image or Virtual Image and Inverted or Upright, solved from 1/f = 1/v - 1/u for lenses and 1/f = 1/v + 1/u for mirrors; Reset returns the convex lens at u = 150 mm, f = 80 mm.",
  ],
  intro:
    "The Lens & Mirror Simulator draws a live principal-ray diagram for a convex lens, concave lens, convex mirror or concave mirror and solves the image position from the standard formulas — 1/f = 1/v − 1/u for lenses and 1/f = 1/v + 1/u for mirrors — under the Cartesian sign convention. Drag the object distance (30–300 mm), focal length (30–150 mm) and object height (20–100 mm) and the two construction rays redraw, one parallel to the axis and refracted or reflected through the focus, the other straight through the optical centre or pole. Alongside the diagram it reports the image distance, the magnification m = v/u, the image height, and whether the image is real or virtual and erect or inverted.",
  useCases: [
    "You are working through a Class 10 or Class 12 optics chapter and want to see why an object placed inside the focal length of a convex lens suddenly gives a virtual, magnified, erect image instead of a real one.",
    "You are teaching the topic and need to show the moment an image flips — sliding the object from beyond 2F towards F while the class watches the magnification cross −1 and then blow up.",
    "You are checking a homework answer and want to confirm the sign of v and m before trusting your own arithmetic on the mirror formula.",
  ],
  benefits: [
    ["Formula and diagram stay in sync", "The ray construction is drawn from the same solved value of v that is displayed, so the picture and the number never disagree."],
    ["Sign convention applied for you", "Object distance is taken as negative, focal length positive for a convex lens and concave mirror and negative for a concave lens and convex mirror — the step most textbook errors come from."],
    ["Every case reachable by sliding", "The four optic types and the full range of object distances cover all the standard image cases without needing a separate diagram for each."],
  ],
  faqs: [
    [
      "What is the lens formula and how does it differ from the mirror formula?",
      "The thin lens formula is 1/f = 1/v − 1/u and the mirror formula is 1/f = 1/v + 1/u, with u the object distance, v the image distance and f the focal length. The sign difference follows from light passing through a lens but reflecting back from a mirror, which is also why magnification is m = v/u for a lens and m = −v/u for a mirror.",
    ],
    [
      "When does a convex lens form a virtual image?",
      "When the object is closer to the lens than one focal length. Inside F the rays diverge after refraction and never actually meet, so the image is virtual, erect and magnified — this is the magnifying-glass case. At exactly F no image forms, and beyond F the image is real and inverted.",
    ],
    [
      "What does a negative magnification mean?",
      "That the image is inverted relative to the object. A magnitude greater than 1 means it is enlarged and less than 1 means it is diminished, so m = −2 is an inverted image twice the object's height and m = −0.5 an inverted image half its height. Positive magnification always corresponds to an erect, virtual image.",
    ],
    [
      "Why does a convex mirror always give the same kind of image?",
      "Because its focal length is negative in the Cartesian convention, the mirror formula gives a positive v for any real object — the image is always virtual, erect and smaller than the object, and always sits between the pole and the focus. That constant wide field of view is why convex mirrors are used as vehicle wing mirrors and blind-corner mirrors.",
    ],
  ],
};

export default seo;
