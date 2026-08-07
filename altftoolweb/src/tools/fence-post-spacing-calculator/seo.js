const seo = {
  intro:
    "This calculator lays out a fence run: it divides the length into whole sections no longer than your maximum span, evens the spacing across them, then sizes the holes and the concrete. Post count is sections + 1 for a straight run and equals the section count for a closed enclosure, burial depth follows the standard rule of one third of the above-ground height subject to a 24 inch minimum, and hole diameter follows the three-times-post-width rule. Concrete per hole is the annulus between hole and post over the buried depth, converted into 80 lb, 60 lb, 50 lb or 25 kg bags at their published yields.",
  useCases: [
    "Planning a 100 ft wood privacy fence and finding the even spacing rather than leaving a short last panel",
    "Working out how many 80 lb concrete bags to buy for a whole run before hiring an auger for the day",
    "Checking the post length to order — an 8 ft post for a 6 ft fence, once a third is buried",
  ],
  benefits: [
    [
      "Even spacing, no orphan panel",
      "Rounds the section count up and redistributes, so every bay is the same width instead of leaving an awkward offcut at the end.",
    ],
    [
      "Concrete by the annulus",
      "Subtracts the post's own volume from the hole, which is what stops a whole-hole estimate over-ordering by a fifth.",
    ],
    [
      "Real timber sizes",
      "Uses actual dressed dimensions — a 4×4 is 3.5 inches — so the hole diameter and concrete figures are correct.",
    ],
  ],
  faqs: [
    [
      "How far apart should fence posts be?",
      "Six to eight feet on centre for most wood and vinyl fences, up to 10 feet for chain link and 12 for wire field fencing. Divide the run by the maximum span, round the section count up, then divide the run by that count — a 100 ft run at an 8 ft maximum becomes 13 sections at 7 ft 8 in each, needing 14 posts.",
    ],
    [
      "How deep should a fence post be set?",
      "One third of the post's above-ground height, with 24 inches as the practical minimum. A 6 ft fence needs 24 inches buried, so you buy 8 ft posts; an 8 ft fence needs 32 inches. The hole must also extend below your local frost line, which in cold regions can be deeper than the one-third rule requires.",
    ],
    [
      "How many bags of concrete do I need per fence post?",
      "About two 80 lb bags for a 4×4 post in a 10.5 inch hole buried 24 inches — the annulus works out at roughly 1.03 cubic feet and an 80 lb bag yields 0.60. A 6×6 post in a 16.5 inch hole needs about four and a quarter bags, so post size drives concrete cost far more than fence length does.",
    ],
    [
      "How wide should a post hole be?",
      "Three times the width of the post: about 10.5 inches for a 4×4 and 16.5 inches for a 6×6. A narrower hole does not leave enough concrete around the post to resist overturning, and a much wider one wastes concrete without adding useful strength. Add 4 to 6 inches of gravel below the post so water drains away from the end grain.",
    ],
  ],
};

export default seo;
