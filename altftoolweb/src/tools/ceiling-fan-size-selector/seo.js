const seo = {
  title: "Ceiling Fan Size Selector: Sweep/Downrod/Airflow",
  metaDescription:
    "Enter room length, width and ceiling height to get the fan sweep in mm, how many fans, the downrod to order and air changes per minute.",
  steps: [
    "Enter Room length (m), Room width (m) and Floor to ceiling height (m) — the height field accepts 2 to 6 m in 0.05 m steps.",
    "The Recommended sweep panel recalculates as you type, giving the sweep in mm with its inch equivalent, the number of fans the floor area needs and the downrod length.",
    "Read the detail rows — Downrod to order, Blade height above floor, Air changes per minute — plus any red warning that the blades would sit too low or the room is too narrow for that sweep, then press Copy result.",
  ],
  intro:
    "This selector answers the two separate questions a ceiling fan poses: how wide the blades should be, chosen from floor area, and how far the fan should hang, chosen from ceiling height. Sweep follows the standard floor-area bands — 900 mm up to about 7 m², 1200 mm to 13.5 m², 1400 mm to 21 m² — and the downrod is sized so the blades land near 2.4 m above the floor with at least 450 mm of blade-to-wall clearance. It also reports the air changes per minute you get from the recommended fan's rated delivery.",
  useCases: [
    "Choose between a 1200 mm and a 1400 mm fan for a 4 m × 3.5 m bedroom before ordering online.",
    "Work out the downrod length to buy for a 3.2 m ceiling so the fan is not choked against the slab.",
    "Check whether a 20 m² hall needs one large fan or two, and how far apart to space them.",
  ],
  benefits: [
    ["Sweep and rod together", "Most guides cover only blade width; this also gives the downrod and the resulting blade height."],
    ["Airflow, not just size", "Converts the fan's rated m³/min into air changes per minute for your actual room volume."],
    ["Flags the awkward rooms", "Warns when the ceiling is too low, the rod too long, or the room too narrow for the sweep."],
  ],
  faqs: [
    [
      "What size ceiling fan do I need for my room?",
      "Go by floor area: 900 mm (36 inch) up to about 7 m², 1200 mm (48 inch) up to 13.5 m², 1400 mm (56 inch) up to 21 m², and two fans beyond roughly 26 m². A standard 10 ft × 12 ft Indian bedroom is 11 m², so a 1200 mm fan is the right call.",
    ],
    [
      "How high should a ceiling fan hang above the floor?",
      "Aim for the blades about 2.4 m above the floor and never below 2.1 m, which is why a 3 m ceiling needs roughly a 300 mm downrod and a 2.7 m ceiling needs none. Keep at least 300 mm between the blades and the ceiling too, or the fan starves for air and moves far less than its rating.",
    ],
    [
      "What is air delivery in a ceiling fan and how much do I need?",
      "Air delivery is the volume of air the fan moves, quoted in cubic metres per minute. IS 374 sets 210 m³/min as the minimum for a 1200 mm ceiling fan, and a fan delivering that into a 30 m³ bedroom turns the air over about seven times a minute — enough for the breeze to feel continuous.",
    ],
    [
      "Can I put a large ceiling fan in a small room?",
      "Not usefully. The blade tip needs at least 450 mm of clearance to the nearest wall, so a 1400 mm fan wants a room at least 2.3 m across on its shortest side. Closer than that and the blades work against the wall, which cuts airflow and makes the fan noisy.",
    ],
  ],
};

export default seo;
