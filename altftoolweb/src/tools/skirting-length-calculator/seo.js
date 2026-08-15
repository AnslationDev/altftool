const seo = {
  title: "Skirting Board Calculator — Pieces, Corners & Cost",
  metaDescription:
    "Room perimeter minus doorways, plus a cutting allowance, rounded to whole factory lengths — with corner counts, fixings at 400 mm centres and cost.",
  steps: [
    "Enter \"Room length (m)\" and \"Room width (m)\", the \"Number of doorways\" with each doorway's width, and any extra runs or skirting-free openings.",
    "Pick the \"Length of one piece\" — 2.4 m, 2.44 m (8 ft), 3 m or 3.66 m (12 ft) — plus \"Skirting height (mm)\", \"Cutting allowance (%)\" and the price per running metre.",
    "Read \"Skirting to buy\" in whole pieces with the net run in metres and running feet, corners to mitre, fixings at 400 mm centres and material cost; \"Copy result\" exports it.",
  ],
  intro:
    "This calculator turns a room's dimensions into the running length of skirting you have to buy: perimeter = 2 × (length + width), minus every doorway and floor-level opening, plus a cutting allowance for mitres, divided into whole factory lengths. It also reports the corner count, the fixings needed at 400 mm centres and the surface area to paint or polish. It suits homeowners checking a carpenter's quote and anyone ordering MDF, PVC or wooden skirting by the piece.",
  useCases: [
    "Check whether a quote for a 4 m × 3.5 m bedroom really needs the number of 8 ft lengths the carpenter listed.",
    "Convert a metre-based measurement into running feet, which is how most Indian carpentry quotes are priced.",
    "Work out the paintable skirting area before buying enamel or polish for the boards.",
  ],
  benefits: [
    ["Doorways deducted properly", "Subtracts each opening's width instead of charging you skirting across thresholds."],
    ["Whole pieces, not metres", "Rounds up to complete factory lengths and shows the offcut you will be left holding."],
    ["Fixings and corners counted", "Lists mitred corners, returned door ends and screws at standard 400 mm centres."],
  ],
  faqs: [
    [
      "How do I calculate skirting board length for a room?",
      "Add the four wall lengths — for a rectangle that is 2 × (length + width) — then subtract the width of every doorway. A 4 m × 3.5 m room with one 0.9 m door needs 15 − 0.9 = 14.1 running metres before any cutting allowance.",
    ],
    [
      "How much extra skirting should I order for cuts?",
      "About 5% over the net run covers ordinary mitres in a simple rectangular room. Allow 10% or more if the room has several corners, alcoves or an L-shape, because every mitre consumes a little board and short offcuts are rarely reusable.",
    ],
    [
      "What is the standard skirting height?",
      "100 mm and 150 mm are the usual heights in modern Indian and UK homes; 75 mm reads as minimal and 200–250 mm suits high ceilings. As a rough proportion, taller rooms carry taller skirting, and matching the door architrave depth keeps the junction clean.",
    ],
    [
      "How far apart should skirting be fixed to the wall?",
      "Trade practice is a screw, nail or adhesive dab every 300–450 mm, with an extra fixing within 50 mm of each end and either side of a joint. This calculator uses 400 mm centres, so a 14 m run needs 36 fixings.",
    ],
  ],
};

export default seo;
