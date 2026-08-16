const seo = {
  title: "DNA Double Helix: A-T & G-C Hydrogen Bonds",
  metaDescription:
    "Rotating 16-rung double helix with 2 hydrogen bonds drawn on every A-T pair and 3 on every G-C. Pause it, or run 0.2x to 3x.",
  steps: [
    "Choose one of the three buttons under 'Exploration View' — Structural 3D View, Base Pairing Rules or Semiconservative Replication.",
    "Drag the 'Rotation Velocity' slider anywhere from 0.2x to 3x, or press 'Pause Rotation' to hold the 16-rung helix still.",
    "Read the canvas under the 'Antiparallel Strands' label: two dots on every A-T rung and three on every G-C rung, matching the 2 H-Bonds and 3 H-Bonds legend; 'Reset' returns the speed to 1x.",
  ],
  intro:
    "The DNA Double Helix Explorer draws an animated Watson-Crick double helix on canvas, with 16 base-pair rungs between two antiparallel sugar-phosphate backbones and the hydrogen bonds drawn out as dots — two for every A-T pair and three for every G-C pair. Rotation can be paused or run from 0.2x to 3x speed, and separate views cover the 3D structure, the complementary base-pairing rules and semiconservative replication. It is a revision aid for biology students who need to see why the strands run 5' to 3' in opposite directions.",
  useCases: [
    "A GCSE or high-school student is memorising base-pairing rules and wants to see the two-bond A-T rung next to the three-bond G-C rung rather than reading them off a table.",
    "A teacher pauses the rotation mid-lesson to point at the backbone nodes and explain why the strands are described as antiparallel.",
    "Someone revising replication needs a visual for what semiconservative means — each daughter molecule keeping one original strand — before an exam question on it.",
  ],
  benefits: [
    [
      "Hydrogen bonds drawn, not just labelled",
      "Each rung renders the actual bond count, so the 2-bond and 3-bond difference between A-T and G-C is visible rather than something to memorise.",
    ],
    [
      "Rotation you control",
      "Pause the helix or slow it to 0.2x to study a single rung, then run it to 3x to see the full right-handed twist.",
    ],
    [
      "Depth cues on the backbone",
      "Backbone nodes change size and shade with their position front-to-back, which is what makes the flat drawing read as a three-dimensional spiral.",
    ],
  ],
  faqs: [
    [
      "Why does A pair with T and G with C?",
      "Because of hydrogen bonding geometry: adenine and thymine form two hydrogen bonds, guanine and cytosine form three, and each pairing joins one larger purine to one smaller pyrimidine so every rung is the same width. The model draws these bond counts on each rung.",
    ],
    [
      "How many hydrogen bonds are there between G and C?",
      "Three, compared with two between A and T. That extra bond is why DNA regions rich in G-C need more energy to separate and melt at a higher temperature than A-T rich regions.",
    ],
    [
      "What does antiparallel mean in DNA?",
      "The two strands run in opposite chemical directions — one 5' to 3' and the partner 3' to 5'. The model labels each backbone accordingly, which is also why replication is continuous on one strand and in fragments on the other.",
    ],
    [
      "What is semiconservative replication?",
      "Each new DNA molecule keeps one original parent strand and one newly built strand. The helix unwinds, each old strand acts as a template, and the base-pairing rules determine every new base — the replication view steps through this sequence.",
    ],
  ],
};

export default seo;
