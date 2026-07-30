const seo = {
  intro:
    "The Carpet / Floor Area Calculator multiplies a room's length by its width and returns the floor area in both square metres and square feet, plus the same figure with 10% added for wastage. Enter the two dimensions in metres or feet and it converts using the exact factors 1 sq ft = 0.092903 m2 and 1 m2 = 10.7639 sq ft. It is for anyone pricing carpet, laminate, tiles or vinyl who needs the order quantity, not just the bare area.",
  useCases: [
    "A flooring quote is priced per square metre but you measured the room in feet — enter feet and read the square-metre line straight off.",
    "You are buying laminate and the shop asks how many packs; the +10% line gives the offcut allowance so you are not one board short at the last row.",
    "Checking a landlord's or builder's stated carpet area against your own tape measurements of the room.",
  ],
  benefits: [
    [
      "Both units, every time",
      "Square metres and square feet are shown side by side from one measurement, so you can match whatever unit the supplier quotes in.",
    ],
    [
      "Wastage built into the answer",
      "A +10% figure sits next to the exact area, which is the allowance most fitters use for cuts, pattern match and trimming.",
    ],
    [
      "Exact conversion factors",
      "It converts with 0.092903 and 10.7639 rather than the rounded 10.76 or 0.09, so large rooms do not drift by half a metre.",
    ],
  ],
  faqs: [
    [
      "How do I calculate the floor area of a room?",
      "Multiply length by width — a 5 m by 4 m room is 20 m2. For an L-shaped or irregular room, split it into rectangles, calculate each separately and add the results.",
    ],
    [
      "How much extra flooring should I buy for wastage?",
      "The calculator adds 10%, which is the common allowance for straight-lay carpet, laminate and plain tiles. Diagonal or herringbone layouts and large-repeat patterns usually need 15% or more, so increase it if your fitter asks for it.",
    ],
    [
      "How many square feet is a square metre?",
      "One square metre is 10.7639 square feet, and one square foot is 0.092903 square metres. So 20 m2 is 215.28 sq ft.",
    ],
    [
      "Is carpet area the same as built-up area?",
      "No. Carpet area is the usable floor inside the walls — what this calculator measures. Built-up area adds the wall thickness and balcony, and super built-up adds a share of common spaces, so the same flat can be quoted with three different numbers.",
    ],
  ],
};

export default seo;
