const seo = {
  intro:
    "This calculator estimates how many hours a home inverter will run a given load, using the energy balance backup hours = usable battery watt-hours divided by (load watts / inverter efficiency), then correcting it with Peukert's law t = H x (C / (I x H))^k. That second step matters because inverter batteries are rated at the 20-hour rate (C20) but a real household load drains them in three or four hours, where a lead-acid bank delivers materially less than its printed Ah. It is aimed at homeowners sizing a new inverter battery and anyone wondering why a 150 Ah battery does not give the runtime the box promised.",
  useCases: [
    "Checking whether one 150 Ah tubular battery will carry four fans and six LED lights through a three-hour evening cut",
    "Comparing a 12 V single-battery setup against a 24 V two-battery bank for the same 600 W load",
    "Working out the Ah rating needed to keep a router, laptop and two lights alive for a full eight-hour night",
  ],
  benefits: [
    ["Peukert correction", "Shows the realistic runtime, not just the optimistic Wh-divided-by-watts number."],
    ["Chemistry aware", "Applies the right depth of discharge and Peukert exponent for tubular, flat plate, SMF and LiFePO4."],
    ["Sizing in reverse", "Tells you the rated Ah needed to hit the backup duration you actually want."],
  ],
  faqs: [
    [
      "How long will a 150Ah inverter battery last?",
      "On a 12 V system with a 300 W load and an 80% efficient inverter, expect roughly 2 hours 50 minutes of real backup. The plain energy sum suggests 3 hours 50 minutes (1440 usable Wh divided by 375 W of DC draw), but the Peukert effect at a 31 A discharge cuts about a quarter of that away.",
    ],
    [
      "What is the formula for inverter backup time?",
      "Backup hours = (battery Ah x bank voltage x depth of discharge) / (load watts / inverter efficiency). For a 150 Ah 12 V tubular battery at 80% depth of discharge feeding a 300 W load through an 80% efficient inverter that is (150 x 12 x 0.8) / (300 / 0.8) = 3.84 hours before Peukert losses.",
    ],
    [
      "Why does my inverter give less backup than calculated?",
      "Three reasons stack up: the inverter itself wastes 10-25% of the energy as heat, lead-acid batteries should only be discharged to about 80% depth to protect cycle life, and Peukert's law means fast discharge yields fewer usable amp-hours than the 20-hour rating. An aged or sulphated battery loses more still.",
    ],
    [
      "Does adding batteries in series increase backup time?",
      "Yes, because two 12 V 150 Ah batteries in series make a 24 V 150 Ah bank holding twice the watt-hours, and the same load then draws half the current, which also softens the Peukert penalty. Your inverter must be rated for that bank voltage — never wire a 24 V bank to a 12 V inverter.",
    ],
  ],
};

export default seo;
