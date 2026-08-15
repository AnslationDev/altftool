const seo = {
  title: "Tile Wastage Calculator by Laying Pattern & Boxes",
  metaDescription:
    "Work out extra tile from the laying pattern — grid 5% up to chevron 22% — plus room shape, tile size and installer, converted into whole boxes.",
  steps: [
    "Enter Room length and width in metres and Tile width and length in mm, then pick a Laying pattern from straight grid (+5%) to chevron (+22%).",
    "Set the Room outline, who is laying the tiles, cutouts, Tiles per box, Spare boxes to store and Price per box.",
    "Read the recommended wastage percentage and total boxes to order, with each factor's contribution listed — or click Copy result.",
  ],
  intro:
    "This tool works out how much extra tile to order by adding four separate allowances — laying pattern, room outline, tile format and installer skill — instead of applying a flat 10% to every job. A straight grid starts at 5%, a 45-degree diagonal at 15% and chevron at 22%, because those patterns cut more perimeter tiles at angles that leave unusable offcuts. The result is converted into tiles and sealed boxes so you can place an order against it.",
  useCases: [
    "Decide whether a herringbone bathroom floor needs 10% or nearer 20% extra before confirming the order.",
    "Check a contractor's box count for a 4 m × 3 m room in 600 × 600 mm tiles laid diagonally.",
    "See how many spare boxes to store from the same batch so a cracked tile can be replaced later.",
  ],
  benefits: [
    ["Pattern-aware, not a flat rule", "Separate base allowances for grid, brick, modular, diagonal, herringbone and chevron layouts."],
    ["Box maths included", "Converts the area into whole boxes and shows the real wastage once boxes are rounded up."],
    ["Shows its working", "Prints each factor and the percentage it contributed, so you can argue the number with a supplier."],
  ],
  faqs: [
    [
      "How much extra tile should I order for wastage?",
      "Around 5% for a straight grid in a simple rectangular room, 8% for a brick or offset bond, 15% for a 45-degree diagonal and 18–22% for herringbone or chevron. Add roughly 3% more for 600 mm and larger tiles and 2–5% for an L-shaped or irregular room.",
    ],
    [
      "Why does diagonal tiling waste more tiles?",
      "Every tile at the perimeter is cut across a diagonal, so the piece left over is a triangle that only fits the opposite corner of the room. In a grid layout the offcut from a straight cut is often the right size to start the next row, which is why grid layouts waste about a third as much.",
    ],
    [
      "Should I count the wastage on top of the room area or the tile count?",
      "Apply it to the floor area first, then divide by the area of one tile and round up — that avoids rounding twice. This calculator then rounds up again to whole boxes, which is why the delivered wastage is usually higher than the recommended percentage.",
    ],
    [
      "How many spare tiles should I keep after the job?",
      "Keep at least one full box, and two for large-format tiles. Tiles are produced in batches with a shade and calibre code printed on the carton, and a box bought later will rarely match exactly, so future repairs depend on stock kept from the original delivery.",
    ],
  ],
};

export default seo;
