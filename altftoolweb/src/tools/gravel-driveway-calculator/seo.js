const seo = {
  intro:
    "This calculator converts a driveway's area and finished depth into the cubic yards, tonnes and truck loads of aggregate you need to order. It multiplies area by depth to get the compacted volume, adds a compaction allowance of about 25% because crushed stone settles under a roller, then applies supplier bulk densities — 1.5 short tons per cubic yard for crusher run, 1.35 for #57 clean stone — to reach a weight. It handles both a single top-up layer and the standard three-course build-up of base stone, clean stone and crusher run used on a new driveway over soil.",
  useCases: [
    "Ordering stone for a 60 × 12 ft driveway resurfaced 4 inches deep in crusher run",
    "Pricing the full three-course build-up before laying a new driveway over bare soil",
    "Converting a supplier's cubic-yard quote into tonnes and the number of truck deliveries needed",
  ],
  benefits: [
    [
      "Compaction included",
      "Aggregate settles 20-30% when rolled, so ordering the finished volume alone leaves you a quarter short.",
    ],
    [
      "Layer by layer",
      "Shows depth, volume and tonnage for each course separately, since the three layers use different stone at different densities.",
    ],
    [
      "Tons and tonnes",
      "Reports short tons for US suppliers and metric tonnes and cubic metres alongside, so quotes in either system line up.",
    ],
  ],
  faqs: [
    [
      "How many tons of gravel do I need for a driveway?",
      "About 17 short tons for a 60 × 12 ft driveway at 4 inches of crusher run. The arithmetic is 720 ft² × 0.333 ft = 240 ft³, which is 8.9 cubic yards compacted, 11.1 cubic yards loose after a 25% compaction allowance, and 16.7 tons at 1.5 tons per cubic yard.",
    ],
    [
      "How deep should a gravel driveway be?",
      "Ten to twelve inches total over bare soil, built as three courses: about 4 inches of 2-3 inch base stone, 4 inches of #57 clean stone, and 4 inches of crusher run on top. Resurfacing an existing compacted base needs only 2 to 4 inches of crusher run.",
    ],
    [
      "How much does a cubic yard of gravel weigh?",
      "Roughly 1.35 to 1.5 short tons, or 1.2 to 1.4 metric tonnes. Crusher run is at the heavy end because its fines fill the voids between stones; clean single-sized stone such as #57 is lighter for the same volume. Wet material weighs more, which matters when you are buying by the ton.",
    ],
    [
      "What kind of gravel is best for a driveway surface?",
      "Crusher run, also sold as #411 or dense-grade aggregate — the mix of stone dust and 3/4 inch angular stone binds together and compacts into a firm surface. Avoid pea gravel and river rock as a driving layer: rounded stones cannot interlock, so they push aside under tyres and end up on the lawn.",
    ],
  ],
};

export default seo;
