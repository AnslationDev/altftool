const seo = {
  title: "Interior Design AI Prompt Generator + Lumen",
  metaDescription:
    "Builds an AI render prompt from room type, style, palette and budget, plus lumen targets, rug size and walkway clearance from your real room dimensions.",
  steps: [
    "Pick a Room type, Design style, Colour palette, Budget feel and Light / time of day, then enter Room length (m), Room width (m) and Ceiling height (m), plus optional Must-have pieces.",
    "As you edit, the tool recomputes the spec rows from those dimensions: Floor area, Ambient light target in lumens and lux, Suggested rug size and Main walkway clearance.",
    "Read the Generated prompt and Negative prompt, then press Copy prompt to copy both together with the room-plan bullet list; Reset restores the Japandi living-room defaults.",
  ],
  intro:
    "This generator turns a room type, design style, palette and budget feel into a ready-to-paste AI image prompt, and computes the planning numbers behind it from your real room dimensions: floor area, an ambient lighting target in lumens (lux x area, using published residential illuminance guidance), a rug size that keeps the standard 50 cm exposed-floor border, and walkway clearance. It is for homeowners, renters and designers who want renders that could actually be built.",
  useCases: [
    "A homeowner visualising a 4.5 x 3.6 m living room in Japandi style before committing to furniture, with the 2,430-lumen lighting target as a shopping guide",
    "A renter comparing the same bedroom rendered in Scandinavian, bohemian and mid-century styles at a realistic mid-range budget feel",
    "An interior designer producing golden-hour concept renders for a client, with rug size and 90 cm walkway clearance already worked out",
  ],
  benefits: [
    ["Real dimensions in, real numbers out", "Lumens, rug size and clearances are computed from your room's length, width and ceiling height."],
    ["Nine styles, four budget tiers", "From strict minimalist to Art Deco, each with material-level detail and a matching budget vocabulary."],
    ["Render-safe negatives", "The negative prompt blocks warped furniture, impossible layouts, fisheye distortion and HDR oversaturation."],
  ],
  faqs: [
    [
      "How do I write an AI prompt for interior design?",
      "State the room and its approximate size, one named style, one palette, the furnishing level and the light, then finish with camera language like 'wide-angle at chest height, straight verticals'. One style per prompt matters most — mixing Japandi with Art Deco in a single prompt produces mush.",
    ],
    [
      "How many lumens does a living room need?",
      "Around 150 lux of ambient light, which is lux multiplied by floor area: a 16 m² living room needs roughly 2,400 lumens in total. Bedrooms need about 100 lux, while kitchens and desks need about 300 lux on task surfaces — and splitting the total across ceiling, wall and lamp layers looks far better than one bright fixture.",
    ],
    [
      "What size rug should I buy for my room?",
      "Subtract about 45-60 cm of exposed floor from each wall: a 4.5 x 3.6 m room takes roughly a 3.5 x 2.6 m rug. If that leaves less than about 1.2 m of rug on a side, the room is too small for a bordered area rug and an accent rug works better.",
    ],
    [
      "Can AI-generated interiors be used as real renovation plans?",
      "No — they are concept imagery, not construction documents. Image models routinely produce impossible layouts, wrong scales and furniture that does not exist, so use the renders to agree on a direction and have a designer or contractor translate it into measured drawings.",
    ],
  ],
};

export default seo;
