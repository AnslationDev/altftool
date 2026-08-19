const seo = {
  title: "Engine Displacement Calculator: Bore & Stroke",
  metaDescription:
    "Get cc, litres and cubic inches from bore, stroke and cylinder count, plus bore/stroke ratio and the clearance volume a compression ratio implies.",
  steps: [
    "Pick the Bore and stroke unit (millimetres or inches) and enter Bore — cylinder diameter, Stroke — piston travel and the Number of cylinders.",
    "Optionally add a Compression ratio (0 to skip) to solve clearance volume, or load a preset: 110 cc scooter, 350 cc single, 1.2 L 3-cyl petrol or 5.7 L V8 (in).",
    "Read Total displacement in cc with litres and cubic inches, the Bore / stroke ratio and character, and clearance volume per cylinder, then press Copy result.",
  ],
  intro:
    "Engine displacement is the total volume the pistons sweep in one full cycle, and this calculator derives it from the geometry: π ÷ 4 × bore² × stroke for one cylinder, multiplied by the number of cylinders. Enter bore and stroke in millimetres or inches and it returns cc, litres and cubic inches, along with the bore-to-stroke ratio that tells you whether the engine is oversquare or long-stroke. If you add a compression ratio it also solves the clearance volume from CR = (swept + clearance) ÷ clearance.",
  useCases: [
    "Check the cc a rebuild will end up at after boring the block oversize.",
    "Convert an American engine quoted in cubic inches into the cc figure an Indian RC book uses.",
    "Confirm which insurance capacity slab a motorcycle falls into before renewing third-party cover.",
  ],
  benefits: [
    ["Geometry, not lookup", "Calculates from real bore and stroke, so oversize pistons and custom builds are handled."],
    ["Metric and imperial", "Accepts millimetres or inches and reports cc, litres and cubic inches together."],
    ["Compression handled", "Solves clearance volume per cylinder from the compression ratio you enter."],
  ],
  faqs: [
    [
      "How do you calculate engine cc from bore and stroke?",
      "Multiply π ÷ 4 by the bore squared by the stroke to get one cylinder's swept volume, then multiply by the cylinder count. With bore and stroke in millimetres, divide the result by 1000 to get cc — a 73 mm bore, 89.5 mm stroke four-cylinder works out to 1498 cc.",
    ],
    [
      "How many cc is 350 cubic inches?",
      "5,735 cc, or 5.7 litres, because one cubic inch is exactly 16.387064 cc. The classic 4.00 in bore, 3.48 in stroke V8 that is sold as a '350' measures 349.8 cubic inches by this formula.",
    ],
    [
      "What does oversquare or undersquare mean?",
      "Oversquare means the bore is larger than the stroke (ratio above 1), which lets the engine rev higher because mean piston speed stays lower at a given rpm. Undersquare or long-stroke means the stroke is larger, which usually gives stronger low-rpm torque — most Indian commuter motorcycles are undersquare.",
    ],
    [
      "Does boring an engine oversize change its registered cc?",
      "Yes. Displacement rises with the square of the bore, so a 1 mm overbore on a 73 mm cylinder adds roughly 2.8% to the capacity. A change in engine capacity has to be reflected in the vehicle records, and it can move the vehicle into a different tax or insurance slab — check with your RTO before the work.",
    ],
  ],
};

export default seo;
