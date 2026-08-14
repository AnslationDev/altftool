const seo = {
  title: "Wall Tile Calculator: Boxes, Courses & Cut Height",
  metaDescription:
    "Deducts every door and window, adds wastage and rounds up to whole boxes — plus tile courses up the wall, the cut course size, adhesive and grout.",
  steps: [
    "Enter \"Total wall run to tile (ft)\" and \"Tiling height (ft)\", or press \"Use all four walls of that room\" to fill the run from room length and width.",
    "Set door and window counts and sizes under \"Openings to deduct\", then tile width and height in mm, tiles per box and the wastage allowance (%).",
    "Read \"Boxes to order\" plus courses up the wall with the mm cut course, adhesive bags and grout kg; \"Copy result\" copies the whole take-off.",
  ],
  intro:
    "This calculator works out wall tile quantity as (wall run x tiling height) minus every door and window opening, then divides the net area by the area of one tile, adds a wastage percentage and rounds up to whole boxes. It also reports how many full tile courses stack up the wall and the size of the cut course left at the end, which is the detail that decides whether a bathroom wall looks deliberate or improvised. Written for anyone specifying a bathroom, kitchen or utility wall before ordering.",
  useCases: [
    "Tiling a 8 x 6 ft bathroom floor to ceiling and needing the box count after deducting the door and window",
    "Checking whether a 300 x 600 mm tile leaves an ugly sliver course at 9 ft ceiling height before committing to the size",
    "Pricing a kitchen wall in boxes rather than square feet so the quote matches the dealer's invoice",
  ],
  benefits: [
    ["Openings deducted properly", "Doors and windows come off at full size, the way a tiler measures."],
    ["Course layout preview", "Shows full courses plus the leftover cut so you can adjust the tile size or start height."],
    ["Adhesive and grout included", "Grout is sized from your tile dimensions and joint width; adhesive is estimated from net wall area at a standard 3mm bed."],
  ],
  faqs: [
    [
      "How do I calculate how many wall tiles I need?",
      "Multiply the wall run by the tiling height, subtract the full area of every door and window, then divide by the area of one tile and add 10% to 15% for cuts. For a 28 ft run tiled to 9 ft with one 3 x 7 ft door and one 4 x 3 ft window, that is 252 sqft gross minus 33 sqft of openings, so 219 sqft of tiling.",
    ],
    [
      "Are door and window openings deducted from tiling measurement?",
      "Yes, openings are deducted at full size in standard tiling measurement, though some contractors add back the reveal or jamb area if those faces are also tiled. Confirm in writing whether reveals are included, because a bathroom window with tiled reveals can add several square feet.",
    ],
    [
      "How much wastage should I allow for wall tiles?",
      "Allow 10% for a plain rectangular wall and 15% or more where there are many cuts around a shower mixer, geyser, switchboards or a niche. Wall tiles also break more easily than floor tiles during cutting, so an extra spare box is cheap insurance against a batch mismatch later.",
    ],
    [
      "What is the best tile size for a small bathroom?",
      "300 x 600 mm laid vertically is the most common choice for Indian bathrooms because it reduces the number of joints and suits a 7 to 9 ft tiling height. What matters more than the size is where the cut course lands: pick a tile height that divides the wall reasonably, or have the tiler shift the starting course so the cut sits at the floor.",
    ],
  ],
};

export default seo;
