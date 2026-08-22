const seo = {
  title: "Sandpaper Grit Selector — Sequence + FEPA/CAMI",
  metaDescription:
    "Builds your grit progression from surface condition to finish — max 1.65× particle-size steps — with FEPA-CAMI conversion, sheets and sanding time.",
  steps: [
    "Pick the Material, 'Condition it is in now' and 'What goes on afterwards' — the finish sets the stopping grit.",
    "Enter Area to sand (m²), 'Minutes per m², per grit' and how many m² one sheet or disc lasts.",
    "Get the P-grit sequence with CAMI equivalents and particle sizes in µm, plus total minutes and sheets, then press Copy result.",
  ],
  intro:
    "Generates the grit progression for a sanding job from the state of the surface to the finish going on top of it. The sequence is built from abrasive particle size rather than habit: each step drops the average particle diameter by no more than 1.65 times and skips at most one grade, which is what produces the familiar 80-120-180-220 run. It also converts between the FEPA (P-prefixed) and CAMI grit standards, which agree up to about 220 and diverge badly after it.",
  useCases: [
    "Refinishing a hardwood table for an oil finish and needing to know where to stop",
    "Preparing veneered board without going through a face ply that may be under 0.6 mm thick",
    "Working out whether an imported 400 grit sheet is the same thing as the P400 already in the workshop",
  ],
  benefits: [
    ["Derived, not copied", "Sequences come from particle sizes, so they hold for any start and stop point."],
    ["Stops at the right place", "The finish decides the final grit — paint needs a key, oil hides nothing."],
    ["Material floors enforced", "Veneer, clear coat and thin ply will not be sent a grit that cuts through them."],
  ],
  faqs: [
    [
      "What grit should I finish at before staining wood?",
      "P150 on softwood and P180 on hardwood. Going finer burnishes the surface and closes the pores, which makes the stain sit on top rather than soaking in, and any burnished patch shows as a pale blotch. For a clear film finish like polyurethane, P220 is the sensible stopping point.",
    ],
    [
      "Can I skip grits when sanding?",
      "One grade at most, and only where the particle sizes are close. The job of each grit is to remove the scratch pattern of the previous one, so if the jump is too large the finer paper only polishes the ridges and leaves the valleys. As a rule the particle size should not drop by more than about 1.65 times between steps.",
    ],
    [
      "Is 400 grit sandpaper the same as P400?",
      "No. CAMI 400 has an average particle size around 23.6 microns, while P400 is about 35 microns — CAMI 400 is closer to P800. The two standards track each other up to roughly 220 and separate above it, so a fine-grit sheet from a different market can behave quite differently from the number on the back.",
    ],
    [
      "What grit removes paint?",
      "Start at P60 for stripping paint or varnish, and P40 only for levelling genuine damage. Coarser than that gouges the substrate, and on anything painted before the late 1970s do not dry-sand at all — the paint may contain lead, which needs chemical stripping or professional removal instead.",
    ],
  ],
};

export default seo;
