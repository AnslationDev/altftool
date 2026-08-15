const seo = {
  title: "Picture Frame Miter Calculator: Angle, Long & Short Point",
  metaDescription:
    "Miter setting is 180 divided by sides: 45 for a square, 30 hexagon, 22.5 octagon. Long and short point per rail, plus moulding after kerf and waste.",
  steps: [
    "Choose the Frame shape and Units, then enter Artwork width and Artwork height for a rectangle, or Number of sides (3 to 24, with hexagon and octagon presets) and Opening side length for a polygon, plus the Moulding face width.",
    "Set Clearance added to the artwork, Blade kerf per cut, Waste allowance (%) and Stock stick length, then give Rabbet depth and the Glass + mat + art + backing thickness so the depth check can run.",
    "Miter saw setting gives the angle for that side count, the cutting list lists Qty, Long point and Short point for every rail, and the rows below report Moulding to buy, Sticks needed, Rabbet opening and Glass / backing size; Copy result copies the whole cutting list.",
  ],
  intro:
    "A picture frame miter calculator gives the saw angle and the exact cut lengths for a closed frame of any number of sides. The angle comes from the fact that a frame turns through 360° in total, so each corner turns 360/n and each end is cut 180/n away from square — 45° for a square, 30° for a hexagon, 22.5° for an octagon. Lengths follow from the geometry of a regular polygon: the outside of each rail is longer than the inside by 2 × moulding width × tan(180/n), which for a rectangle is the familiar rule of opening plus twice the moulding.",
  useCases: [
    "Cutting a 40 mm moulding for a 300 × 400 mm print and needing the long point of each rail rather than the opening size",
    "Setting up a hexagonal or octagonal mirror frame where 45° obviously will not close",
    "Checking whether one 2.4 m stick of moulding covers the whole frame once kerf and offcuts are counted",
  ],
  benefits: [
    ["Long and short point together", "Cutting lists go wrong when only one is given — both ends of every rail are listed."],
    ["Any side count from 3 to 24", "Triangles, pentagons, hexagons, octagons and more, with the same geometry as the rectangle case."],
    ["Kerf and stock counted", "Blade kerf is taken off at every cut and the result is turned into whole sticks of moulding."],
  ],
  faqs: [
    [
      "What angle do you cut for a picture frame?",
      "45° on a four-sided frame, because each of the eight ends must take half of the 90° corner. The general rule is 180 ÷ the number of sides, so a hexagon is cut at 30°, an octagon at 22.5° and an equilateral triangle at 60°.",
    ],
    [
      "How do I calculate the length of picture frame moulding?",
      "For a rectangle, each rail's long point equals the rabbet dimension plus twice the moulding width, so the total is 2 × (width + height) + 8 × moulding width. A 300 × 400 mm opening in 40 mm moulding needs 2 × 700 + 320 = 1720 mm before kerf and waste.",
    ],
    [
      "What is the difference between long point and short point on a miter?",
      "The long point is the outside edge of the rail and the short point is the inside edge at the rabbet; they differ by 2 × moulding width × tan(180/n) per rail. Frame shops normally measure to the long point, so always check which one a cutting list means before you cut.",
    ],
    [
      "How much bigger than the artwork should the frame opening be?",
      "About 3 mm (1/8\") larger in total across each dimension so the artwork and mat drop in without binding, and the glass is usually cut around 1.5 mm under the rabbet size for the same reason. Paper expands with humidity, so err towards the larger clearance for unmounted works on paper.",
    ],
  ],
};

export default seo;
