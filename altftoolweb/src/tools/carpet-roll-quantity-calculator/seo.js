const seo = {
  title: "Carpet Roll Calculator: Running Metres, Drops & Seams",
  steps: [
    "Enter \"Room length (m)\" and \"Room width (m)\", pick the carpet roll width from the dropdown — 2 m, 3.66 m (12 ft), 4 m or 5 m — and set any pattern repeat.",
    "Adjust the trim allowance per drop, total doorway width, and the carpet and underlay prices per m².",
    "Read \"Carpet to order\" in running metres with the best layout direction, drops, seams and offcut wastage percentage; \"Copy result\" exports the list.",
  ],
  intro:
    "This calculator converts a room's length and width into the running metres of broadloom carpet you have to buy off a fixed-width roll, along with the seam count and the offcut you will pay for. Because carpet is sold by the running metre from a roll of set width, the quantity depends on which way the drops run, so it evaluates both orientations and reports the cheaper one. It is built for anyone pricing a wall-to-wall installation before the roll gets cut, since cut lengths are not returnable.",
  useCases: [
    "Check a fitter's quote for a 6 m × 5 m bedroom against the running metres a 3.66 m roll actually needs.",
    "See how much extra a patterned carpet with a 0.5 m repeat costs compared with the same plain quality.",
    "Decide whether turning the drops 90 degrees removes a seam or saves two metres off the roll.",
  ],
  benefits: [
    ["Both directions compared", "Reports the layout with fewer running metres and shows what the other direction would have cost."],
    ["Offcut made visible", "Prints the square metres you buy but do not lay, and that waste as a percentage of floor area."],
    ["Underlay and gripper too", "Adds underlay at 5% over floor area and gripper rod at perimeter minus doorways."],
  ],
  faqs: [
    [
      "How do I calculate how much carpet I need for a room?",
      "Divide the room dimension that runs across the roll by the roll width and round up — that is the number of drops. Multiply the drops by the other room dimension plus a trim allowance of about 100 mm to get the running metres to order. A 6 m × 5 m room on a 3.66 m roll needs two drops of 5.1 m, so 10.2 running metres.",
    ],
    [
      "What width does carpet come in?",
      "Broadloom carpet is most commonly 3.66 m wide, the metric equivalent of the imperial 12 ft roll. Some mills also run 2 m, 4 m and 5 m widths, and a 4 m or 5 m roll can remove a seam in a wide room even if the price per square metre is higher.",
    ],
    [
      "How much carpet wastage should I allow?",
      "There is no fixed percentage — the waste is whatever the roll width leaves over after the drops are cut, which this calculator computes exactly. In a room only slightly wider than the roll it can exceed 40%, while a room close to a multiple of the roll width can be under 5%. Patterned carpet adds more because every drop is cut to a whole pattern repeat.",
    ],
    [
      "Do I need underlay and how much?",
      "Underlay goes under almost all stretch-fitted broadloom carpet; it cushions the pile, adds insulation and roughly doubles carpet life. Buy about 5% over the floor area so the sheets can be butted, taped and trimmed at the walls, and fit gripper rod round the perimeter except across doorways.",
    ],
  ],
};

export default seo;
