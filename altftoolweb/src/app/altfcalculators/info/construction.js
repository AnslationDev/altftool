const info = {
  "concrete-calculator": {
    intro: [
      "The concrete calculator estimates how much concrete you need to fill a slab, footing, footpath, column or any rectangular pour. You enter the length, width and thickness of the pour and it returns the volume in cubic metres, cubic feet and cubic yards.",
      "Knowing the volume up front lets you order the right amount of ready-mix or work out how many bags of dry mix to buy, so you avoid a half-finished pour or paying for concrete you cannot use.",
    ],
    formula: {
      expression: "Volume = Length × Width × Thickness   (all in the same unit)",
      where: [
        ["Length", "Length of the pour"],
        ["Width", "Width of the pour"],
        ["Thickness", "Slab depth / thickness"],
        ["Mass", "Volume (m³) × 2400 kg/m³ (density of wet concrete)"],
        ["Bags", "Mass ÷ 50 kg per bag"],
      ],
      note: "1 m³ ≈ 35.315 ft³ ≈ 1.308 yd³. Feet are converted to metres with ×0.3048 before multiplying. The bag figure reflects the total mix mass, not cement alone.",
    },
    howToUse: [
      "Pick your measurement units — feet or metres.",
      "Enter the length, width and thickness (depth) of the area to be poured.",
      "Read the volume in m³, ft³ and yd³, plus the approximate 50 kg bag count.",
      "Add 5–10% to your order to allow for spillage, uneven ground and over-excavation.",
    ],
    goodToKnow: [
      "Thickness is easiest entered in the same unit as length — e.g. a 100 mm slab is 0.1 m, and a 4-inch slab is about 0.33 ft.",
      "Wet concrete weighs roughly 2400 kg per cubic metre; the bag estimate is based on that total mass, so it is a guide for volume, not a cement-only count.",
      "Actual cement, sand and aggregate quantities depend on the mix ratio (for example 1:2:4 nominal mix or a graded mix such as M20).",
      "Ready-mix is usually ordered in whole cubic metres or cubic yards, so round your order up.",
    ],
    faqs: [
      {
        q: "Does the calculator tell me how many cement bags to buy?",
        a: "It shows how many 50 kg bags equal the total wet-concrete mass, which is a quick sizing guide. The real number of cement bags is smaller and depends on your mix ratio — in a 1:2:4 mix, cement is only about one part in seven of the mix.",
      },
      {
        q: "How thick should a concrete slab be?",
        a: "A typical residential floor or patio slab is 100 mm (4 inches) thick; driveways carrying vehicles are often 125–150 mm (5–6 inches). Always follow your local code or engineer's specification.",
      },
      {
        q: "Why should I order extra concrete?",
        a: "Ground is rarely perfectly level, forms flex, and some concrete is lost to spillage. Ordering 5–10% more than the calculated volume avoids running short mid-pour, which can create a weak cold joint.",
      },
      {
        q: "How do I convert my slab to cubic yards?",
        a: "The calculator does it for you: 1 cubic metre equals about 1.308 cubic yards. Suppliers in some regions price concrete per cubic yard, so this figure is handy when ordering.",
      },
    ],
  },

  "tile-calculator": {
    intro: [
      "The tile calculator works out how many tiles and boxes you need to cover a floor or wall. Enter the room size (as length × width or as a total area) and the size of a single tile, and it divides one into the other while adding a wastage allowance for cuts and breakage.",
      "It is useful for floor and wall tiling, backsplashes and outdoor paving — anywhere you want to buy the right quantity in one trip and avoid mismatched dye lots from a second order.",
    ],
    formula: {
      expression: "Tiles = ⌈ (Room area ÷ Tile area) × (1 + Wastage%) ⌉,   Boxes = ⌈ Tiles ÷ Tiles per box ⌉",
      where: [
        ["Room area", "Floor or wall area to be tiled"],
        ["Tile area", "Width × height of one tile"],
        ["Wastage%", "Extra allowance for cuts, breakage and spares"],
        ["⌈ ⌉", "Round up to the next whole tile / box"],
      ],
      note: "Areas are converted to a common unit before dividing. Tile dimensions in cm or inches are converted to the same unit as the room.",
    },
    howToUse: [
      "Choose whether to enter the room as length × width or as a total area, and set the units.",
      "Enter the tile width and height and choose centimetres or inches.",
      "Set a wastage percentage — 10% is a common starting point for straight layouts.",
      "Optionally enter the tiles per box to get the number of boxes to buy.",
    ],
    goodToKnow: [
      "Add more wastage for diagonal or herringbone layouts (often 15%) and for rooms with many cuts around fixtures.",
      "Buy all tiles from the same batch (shade/calibre) — different production runs can vary slightly in colour and size.",
      "Keep a few leftover tiles after the job for future repairs; matching a discontinued tile later is difficult.",
      "The result rounds up to whole tiles and whole boxes, because tiles are sold as whole units.",
    ],
    faqs: [
      {
        q: "How much wastage should I allow?",
        a: "About 10% for a standard straight-laid floor is typical. Use 15% or more for diagonal and herringbone patterns, large-format tiles, or rooms with lots of angles and obstacles that force extra cuts.",
      },
      {
        q: "Should I include doorways and fixed cabinets in the area?",
        a: "Measure the full floor area you intend to tile. You can subtract large permanent features such as a kitchen island footprint, but leaving them in simply adds to your spare tiles, which many tilers prefer.",
      },
      {
        q: "Do I count grout gaps?",
        a: "For estimating purposes the tile's nominal size (which effectively includes a small joint) is close enough. Wide grout lines slightly reduce the tile count, but the wastage allowance more than covers the difference.",
      },
      {
        q: "Why does it round up to whole boxes?",
        a: "Retailers sell tiles by the box, so you cannot buy a fraction of a box. The calculator rounds boxes up so you always have at least the tiles you need.",
      },
    ],
  },

  "roofing-calculator": {
    intro: [
      "The roofing calculator estimates the actual sloped surface area of a roof from its flat footprint and pitch, then converts that area into roofing 'squares' and shingle bundles. Because a pitched roof is larger than the ground it covers, you cannot order materials from the footprint alone.",
      "It gives a quick material estimate for gable-style roofs so you can price shingles, underlayment and labour, which are all commonly quoted per square (100 ft²).",
    ],
    formula: {
      expression: "Roof area = Footprint × √(rise² + 12²) ÷ 12,   Squares = Roof area ÷ 100",
      where: [
        ["Footprint", "Length × width of the building (plan area)"],
        ["rise", "Vertical rise per 12 units of horizontal run"],
        ["√(rise² + 12²) ÷ 12", "Pitch multiplier — the slope factor"],
        ["Squares", "Roofing unit equal to 100 ft² of roof surface"],
        ["Bundles", "Squares × 3 (≈ 3 bundles per square)"],
      ],
      note: "A 6/12 pitch has a multiplier of about 1.118, so it adds roughly 12% to the flat area. Steeper roofs add more.",
    },
    howToUse: [
      "Enter the building footprint length and width in feet.",
      "Select the roof pitch as rise per 12 of run (for example 6/12).",
      "Read the total roof surface area, the number of squares and the bundle count.",
      "Add about 10% for waste, starter strips, hips and ridge caps when ordering.",
    ],
    goodToKnow: [
      "A 'square' is 100 square feet of roof surface — the standard unit for pricing roofing.",
      "Standard three-tab and architectural shingles usually come three bundles to a square.",
      "This is a planning estimate for a simple roof plane; complex roofs with multiple hips, valleys and dormers need a detailed take-off.",
      "Pitch is expressed as rise-over-run: 4/12 is a gentle slope, 12/12 is a steep 45° roof.",
    ],
    faqs: [
      {
        q: "What is roof pitch and how do I find mine?",
        a: "Pitch is the vertical rise for every 12 units of horizontal run. To measure it, hold a level horizontally against the roof and measure the vertical drop 12 inches out along the level — that drop in inches is your rise, e.g. 6/12.",
      },
      {
        q: "Why is the roof area bigger than my building footprint?",
        a: "A sloped surface is longer than its horizontal projection. The pitch multiplier accounts for that: the steeper the roof, the larger the multiplier and the more material you need for the same footprint.",
      },
      {
        q: "How many shingle bundles are in a square?",
        a: "Most asphalt shingles are packaged three bundles to a square (100 ft²). Heavier or specialty shingles can be four or five bundles per square, so check the specific product before ordering.",
      },
      {
        q: "Should I add extra for waste?",
        a: "Yes. Add roughly 10% for a simple gable roof, and more for cut-up roofs with many valleys and hips, where off-cuts and starter/ridge courses increase consumption.",
      },
    ],
  },

  "square-footage-calculator": {
    intro: [
      "The square footage calculator finds the area of a rectangular space from its length and width, in whatever units you have — feet, metres, yards or inches — and reports the result in square feet and square metres.",
      "It is handy for flooring, paint, carpet, turf and any material sold by area. You can multiply by a number of identical rooms and apply a price per square foot to get an instant material cost.",
    ],
    formula: {
      expression: "Area (ft²) = Length(ft) × Width(ft) × Quantity,   Cost = Area × Price per ft²",
      where: [
        ["Length, Width", "Room dimensions, converted to feet"],
        ["Quantity", "Number of identical areas"],
        ["Price per ft²", "Unit rate of the material or work"],
      ],
      note: "Metres are converted with ×3.28084, yards with ×3 and inches with ÷12 before multiplying. 1 ft² = 0.092903 m².",
    },
    howToUse: [
      "Choose your unit — feet, metres, yards or inches.",
      "Enter the length and width of the space.",
      "Optionally set the number of identical areas to total several rooms at once.",
      "Optionally add a price per square foot to estimate the total cost.",
    ],
    goodToKnow: [
      "Square footage is length times width, so both dimensions must be in the same unit before multiplying — this tool handles the conversion for you.",
      "For L-shaped or irregular rooms, split the space into rectangles, calculate each, and add them together.",
      "1 square metre equals about 10.764 square feet; 1 square yard equals 9 square feet.",
      "When buying flooring or paint, add a waste allowance on top of the bare area for cuts and coverage.",
    ],
    faqs: [
      {
        q: "How do I calculate square footage for an irregular room?",
        a: "Break the floor plan into simple rectangles, work out the square footage of each with this calculator, and add the results. For triangular sections, use half of base × height.",
      },
      {
        q: "How do I convert square feet to square metres?",
        a: "Multiply square feet by 0.092903, or divide by 10.764. The calculator shows both figures automatically so you do not have to convert by hand.",
      },
      {
        q: "Can I estimate flooring cost with this?",
        a: "Yes. Enter a price per square foot and the tool multiplies it by the total area. For an ordering figure, add a waste percentage (commonly 5–10%) to the area first.",
      },
      {
        q: "What does the 'number of areas' field do?",
        a: "It multiplies the single-room area by that count, so you can total several identically sized rooms — for example four office cubicles — in one calculation.",
      },
    ],
  },
};

export default info;
