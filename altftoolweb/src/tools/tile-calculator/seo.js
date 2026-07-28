const seo = {
  intro:
    "A tile calculator converts a room or wall measurement into the number of tiles, the number of sealed boxes, and the grout and adhesive to buy with them. It counts the grout joint as part of each tile's covering module — (tile width + joint) × (tile height + joint) — which is why it gives a slightly lower tile count than a calculator that divides by the bare tile size. Grout uses the manufacturers' formula ((A + B) ÷ (A × B)) × joint × thickness × 1.6 kg per m², and adhesive the standard 1.5 kg per m² for every millimetre of bed depth.",
  useCases: [
    "Work out how many boxes of 600 × 600 mm porcelain a 4 m by 3 m floor needs at 10% wastage before calling the supplier.",
    "Check a contractor's material list, including whether five 20 kg bags of adhesive is right for the trowel size being used.",
    "Price a bathroom wall in feet and inches, deducting the door opening and the shower tray footprint.",
  ],
  benefits: [
    ["Joints counted properly", "The grout gap is part of the covering module, so the count matches what is actually laid."],
    ["Grout and adhesive too", "Real manufacturer formulas, not a flat guess, driven by tile size, joint width and trowel notch."],
    ["Boxes, not just tiles", "Rounds to sealed boxes and tells you the true wastage and the spares you will be left holding."],
  ],
  faqs: [
    [
      "How many 600 × 600 mm tiles do I need for a 12 m² floor?",
      "About 33 tiles bare, or 37 with a 10% wastage allowance. With a 3 mm grout joint each tile covers 603 × 603 mm = 0.3636 m², so 12 ÷ 0.3636 = 33.0 tiles. At four tiles per box that is 10 boxes, which delivers 40 tiles and leaves 6 spare.",
    ],
    [
      "How much grout do I need per square metre?",
      "For 600 × 600 mm tiles that are 9 mm thick with a 3 mm joint, about 0.14 kg per m². The formula is ((A + B) ÷ (A × B)) × joint width × tile thickness × 1.6, with every dimension in millimetres and 1.6 g/cm³ as the density of cementitious grout. Smaller tiles need far more — 100 mm mosaics use roughly six times as much.",
    ],
    [
      "How many bags of tile adhesive will I need?",
      "Thin-bed adhesive is consumed at about 1.5 kg per m² for each millimetre of bed depth, and the trowel sets the depth: a 6 mm notch leaves roughly a 3 mm bed (4.5 kg/m²) and a 10 mm notch about 5 mm (7.5 kg/m²). A 12 m² floor with a 10 mm notch therefore takes about 90 kg — five 20 kg bags.",
    ],
    [
      "How much wastage should I allow when ordering tiles?",
      "Around 5% for a straight grid in a rectangular room, 10% as a general default, and 15% or more for a 45-degree diagonal or a herringbone layout where every perimeter cut leaves an unusable offcut. Rounding up to sealed boxes usually pushes the delivered wastage higher still, which is shown separately here.",
    ],
  ],
};

export default seo;
