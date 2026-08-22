const seo = {
  title: "Door Frame Timber Calculator: Running Feet & Cft",
  metaDescription:
    "Running length, cft, clear opening, shutter size, hinges and holdfasts from the opening size and frame section — 100x65 to 150x75 mm.",
  steps: [
    "Enter the Frame outer height (mm) and Frame outer width (mm) — they open at 2100 and 900 — then pick a Frame section from 100 × 65 mm through 150 × 75 mm, or choose Custom section and type your own Section width (mm) and Section thickness (mm).",
    "Set the Rebate depth (mm), Number of identical frames, Timber species and \"Cutting and planing wastage (%)\", tick \"Include a bottom sill (four-sided frame)\" for a four-member frame, and add the optional timber and shutter rates in INR.",
    "\"Timber to order\" gives the cft to buy, and the table below lists running length per frame in metres and feet, timber per frame, approximate weight, clear opening, shutter size and area, butt hinges (three up to a 2100 mm shutter and four above), holdfasts and architrave length before Copy result copies the take-off.",
  ],
  intro:
    "A door frame material calculator converts an opening size and a timber section into the running length of frame timber, its volume in cubic feet, the clear opening left inside and the shutter size once the rebate is allowed for. The running length is simply 2 × frame height + frame width for a three-sided frame, or plus a second width when a bottom sill is fitted; multiplying that by the section area gives the timber volume, and the clear opening is the outer size less one section width per side. It is written for carpenters, contractors and homeowners who need to order timber and hardware rather than guess.",
  useCases: [
    "Ordering sal timber for eight identical 2100 × 900 mm internal door frames in a 100 × 65 mm section",
    "Checking the shutter size a carpenter should cut once a 12 mm rebate is allowed for on a 900 mm frame",
    "Pricing a main door in a 150 × 75 mm section against an internal door in 100 × 65 mm before choosing",
  ],
  benefits: [
    ["Running feet and cft together", "Timber merchants quote in running feet and in cubic feet — both are produced from the same section."],
    ["Shutter size, not just frame size", "Clear opening and shutter size are worked out separately so the rebate is not forgotten."],
    ["Hardware counted", "Hinges scale with shutter height and holdfasts with the number of jambs, so the ironmongery list comes out too."],
  ],
  faqs: [
    [
      "How much timber does a standard door frame need?",
      "About 1.17 cubic feet for a 2100 × 900 mm frame in a 100 × 65 mm section. The running length is 2 × 2.1 + 0.9 = 5.1 m, and 5.1 × 0.100 × 0.065 = 0.0332 m³, which converts to 1.17 cft before any cutting wastage.",
    ],
    [
      "How do I calculate the running feet of a door frame?",
      "Add twice the frame height to the frame width for a three-sided frame, and add the width a second time if there is a bottom sill. A 2100 mm × 900 mm frame is 5.1 m of timber, which is 16.7 running feet.",
    ],
    [
      "What size shutter fits a 900 mm door frame?",
      "About 724 × 2012 mm for a 900 × 2100 mm frame in a 100 mm section with a 12 mm rebate. The clear opening is 900 − 2 × 100 = 700 mm wide and 2100 − 100 = 2000 mm tall, and the shutter overlaps the rebate by 12 mm on each jamb and at the head.",
    ],
    [
      "How many hinges does a door need?",
      "Three butt hinges for a shutter up to about 2100 mm tall, and four above that or for heavy solid-core and fire-rated leaves. Space them roughly 150–200 mm from the top and bottom with the third centred, or follow the hinge manufacturer's load table when the shutter is unusually heavy.",
    ],
  ],
};

export default seo;
