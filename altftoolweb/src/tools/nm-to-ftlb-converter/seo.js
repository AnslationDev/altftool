const seo = {
  intro:
    "This converter restates a torque specification across newton metres, foot-pounds, inch-pounds and kilogram-force metres using exact definitions: 1 lbf-ft is 1.3558179483 N-m because pound-force is 4.4482216152605 N and the foot is 0.3048 m, while 1 kgf-m is 9.80665 N-m from standard gravity. It also solves the moment balance T_setting = T_target x L / (L + E) so a crowfoot or in-line adapter does not silently over-tighten a fastener. Aimed at anyone working from a manual written in one unit with a wrench calibrated in another.",
  useCases: [
    "Convert a 110 N-m wheel-nut spec into foot-pounds for an imperial click wrench.",
    "Read an older Japanese or Indian service manual quoting kgf-m against a modern N-m wrench.",
    "Work out the wrench setting when a crowfoot adapter adds 40 mm in line with the handle.",
  ],
  benefits: [
    ["Exact conversion factors", "1.3558179483 N-m per lbf-ft and 9.80665 N-m per kgf-m, not rounded 1.36 and 9.81."],
    ["Small-fastener units too", "Inch-pounds and ounce-inches for electronics, optics and interior trim work."],
    ["Adapter maths built in", "Shows both the corrected setting and how much torque the extension would have added."],
  ],
  faqs: [
    [
      "How many Nm is 1 ft-lb?",
      "1 foot-pound is 1.3558 newton metres, and 1 newton metre is 0.7376 foot-pounds. So a 100 N-m spec is 73.76 lbf-ft and an 80 lbf-ft spec is 108.5 N-m.",
    ],
    [
      "Is kgf-m the same as Nm?",
      "No. 1 kgf-m equals 9.80665 N-m because a kilogram-force is the weight of one kilogram under standard gravity. A manual quoting 10 kgf-m is asking for 98.07 N-m, or 72.33 lbf-ft.",
    ],
    [
      "Do I need to adjust the torque wrench when using an extension?",
      "Only when the adapter moves the socket further from the handle along the same line as the wrench. Then set the wrench to target x L / (L + E) — for a 450 mm wrench with a 100 mm crowfoot in line, a 100 N-m target needs the wrench set to 81.8 N-m. A vertical extension bar pointing down at the socket does not change the moment arm and needs no correction.",
    ],
    [
      "What is the difference between inch-pounds and foot-pounds?",
      "A foot-pound is twelve inch-pounds. Small fasteners are often specified in inch-pounds precisely so the number stays readable — 25 N-m is 18.4 lbf-ft but 221 lbf-in. Mistaking one for the other under-tightens or shears the fastener, so check the wrench scale before setting it.",
    ],
  ],
};

export default seo;
