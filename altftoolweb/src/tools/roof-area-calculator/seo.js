const seo = {
  title: "Roof Area Calculator — Pitch, Slope Factor and Rafters",
  metaDescription:
    "Convert a building footprint and pitch into the true sloped roof area via the slope factor, plus rafter, ridge, hip and gutter lengths and sheet count.",
  steps: [
    "Enter the footprint length and width in feet, the overhang beyond the wall on every side, and pick the roof type.",
    "Set the pitch as Rise in 12, Degrees or Percent, then choose a material preset or type the area one unit covers and a wastage allowance.",
    "Read the true roof area, common and hip rafter, ridge and gutter lengths, and the sheets, tiles or bundles to order, then click Copy result.",
  ],
  intro:
    "This calculator converts a building footprint into the true sloped roof area using the slope factor sqrt(run² + rise²) / run, which is sqrt(144 + rise²) / 12 when pitch is written the trade way as rise per 12 of run. It adds the eaves and rake overhang before applying the factor, then returns common rafter length, ridge, hip rafter, gutter run and the sheet or tile count with a wastage allowance. Built for anyone ordering roofing material who has measured the plan but not the slope.",
  useCases: [
    "Ordering GI sheets for a 40 x 30 ft shed roof once the 1.5 ft overhang and the 6-in-12 pitch are taken into account",
    "Checking a contractor's quote when the area billed looks suspiciously like the plain footprint",
    "Getting the common rafter and hip rafter lengths before cutting timber for a hip roof",
  ],
  benefits: [
    ["Slope factor, not guesswork", "Applies the exact geometric factor, so a 6-in-12 roof correctly comes out 11.8% larger than its footprint."],
    ["Overhang included", "Extends the plan on all four sides first, which is where most manual take-offs lose square feet."],
    ["Rafters and gutters too", "Returns ridge, hip and eaves lengths from the same geometry, ready for the timber and gutter order."],
  ],
  faqs: [
    [
      "How do I calculate roof area from the floor plan?",
      "Multiply the plan area, including the overhang on all sides, by the slope factor sqrt(144 + rise²) / 12. A 6-in-12 roof has a slope factor of 1.118, so a 43 x 33 ft plan of 1,419 sqft becomes about 1,586 sqft of actual roof surface.",
    ],
    [
      "How much bigger is a pitched roof than its footprint?",
      "About 3% at 3-in-12, 12% at 6-in-12, 25% at 9-in-12 and 41% at 12-in-12, which is 45 degrees. The increase depends only on the pitch, not on the size or shape of the building, because both slopes cover the same plan area.",
    ],
    [
      "What is the minimum roof pitch for metal sheets?",
      "Profiled metal sheeting is normally laid at 2-in-12 (about 9.5 degrees) or steeper, and manufacturers usually require longer end laps and sealed side laps below 4-in-12. Anything shallower should be treated as a flat roof with a membrane rather than lapped sheets, especially in heavy monsoon rainfall.",
    ],
    [
      "How much wastage should I allow for roofing?",
      "Allow around 10% for a simple rectangular gable, 12 to 15% for a hip roof because every hip creates an angled cut, and more again where there are dormers or valleys. Ridge caps, barge boards and flashings are measured separately by running length and are not covered by the area wastage.",
    ],
  ],
};

export default seo;
