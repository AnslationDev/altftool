const seo = {
  title: "Floor Tile Calculator: Boxes, Adhesive & Grout Needed",
  metaDescription:
    "Turn room size in feet into tile boxes to order — wastage 0-40% built in — plus adhesive kg at 1.5 kg/sqm/mm and grout weight, priced per box in INR.",
  steps: [
    "Enter room length and width in feet plus any additional area in sqft, then set the tile size in mm or tap a preset like 600 x 600 mm.",
    "Set 'Tiles per box', 'Price per box (INR)' and the 'Wastage allowance (%)' — anywhere from 0 to 40% for cuts and breakage.",
    "Read 'Boxes to order' with adhesive in 20 kg bags and grout kilos, then click 'Copy result' for the full take-off.",
  ],
  intro:
    "This calculator converts a room's floor area into the number of tile boxes to order by dividing floor area by the area of a single tile, adding a wastage percentage for cuts and breakage, then rounding up to whole boxes. It also sizes the tile adhesive from the standard 1.5 kg per square metre per millimetre of bed thickness, and the grout from the joint-volume formula printed on grout packs. It is aimed at homeowners placing a tile order and at contractors preparing a material take-off.",
  useCases: [
    "Ordering 600 x 600 mm vitrified tiles for a 12 x 10 ft bedroom and needing the box count, not the tile count",
    "Checking a dealer's quote that claims 9 boxes cover a 120 sqft floor before paying the advance",
    "Working out adhesive bags and grout kilos so the whole material list goes on a single purchase order",
  ],
  benefits: [
    ["Answers in boxes", "Rounds tiles up to whole boxes, because dealers will not split a carton."],
    ["Wastage built in", "Adds a cutting and breakage allowance you can tune from 0% to 40%."],
    ["Full material list", "Adhesive kilos, bag count and grout weight come out alongside the tiles."],
  ],
  faqs: [
    [
      "How many 600 x 600 tiles do I need for 100 square feet?",
      "About 26 tiles for the bare area, or 29 tiles once a 10% wastage allowance is added. One 600 x 600 mm tile covers 0.36 square metres, which is 3.875 square feet, so 100 sqft divided by 3.875 gives 25.8 tiles before wastage.",
    ],
    [
      "How much wastage should I allow when buying floor tiles?",
      "Allow 5% to 10% for a plain square room laid straight, 10% to 15% for an irregular room with many cuts, and 15% to 20% for diagonal or herringbone layouts. Larger format tiles waste more per cut because the offcut is often too big to reuse elsewhere.",
    ],
    [
      "How many bags of tile adhesive do I need per 100 sqft?",
      "Roughly two and a half 20 kg bags for 100 sqft at a 3 mm bed. Cementitious tile adhesive spreads at about 1.5 kg per square metre per millimetre of bed, so 100 sqft (9.29 sqm) at 3 mm needs about 42 kg. Uneven substrates and large-format tiles need a thicker bed and more adhesive.",
    ],
    [
      "Should I buy all tile boxes at once?",
      "Yes. Ceramic and vitrified tiles are shade-sorted and calibrated per production batch, and boxes from a different batch can differ visibly in tone and by a fraction of a millimetre in size. Check that every carton carries the same batch or shade code before you accept delivery.",
    ],
  ],
};

export default seo;
