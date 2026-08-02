const seo = {
  intro:
    "Matches hex key sizes across the metric and imperial systems and grades every swap by clearance, the number that decides whether a substitution works or destroys the fastener. A key that is nominally larger than the socket does not enter at all; among keys that do fit, one that leaves under 1% slack is the same tool with a different name, 1 to 3% turns a lightly torqued screw, and over 3% loads the corners of the socket instead of the flats and rounds it out. Fastener sizes come from the published standards — ISO 4762, 7380, 10642 and 4026, and ASME B18.3 for the imperial series.",
  useCases: [
    "Assembling flat-pack or bicycle parts with a mixed set of keys and needing to know if 5/16 inch will do for 8 mm",
    "Working on imperial machinery with a metric set and wanting to know which sizes are genuinely safe",
    "Identifying an unlabelled key by laying it against a printed true-scale gauge",
  ],
  benefits: [
    ["Graded by clearance", "Every pair is rated as interchangeable, usable with care, a socket-rounder, or simply too large to enter the socket at all."],
    ["Both directions", "A key safe in a metric socket is usually too wide for the nearest imperial one, and the tool says so."],
    ["Head style included", "Cap, button, countersunk and grub screws of the same thread take different keys."],
  ],
  faqs: [
    [
      "Is a 5/16 inch Allen key the same as 8 mm?",
      "Only in one direction. 5/16 inch is 7.9375 mm, so a 5/16 inch key drops into an 8 mm socket with just 0.0625 mm of play — under 1% clearance, effectively the same size. Going the other way is a different question: an 8 mm key is nominally 0.0625 mm wider than a 5/16 inch (7.9375 mm) socket, so treat it as the tighter fit and reach for the inch key when you have the choice. The same one-way relationship holds for 5/32 inch with 4 mm and 5/64 inch with 2 mm — the inch key is the safe one to put in the metric socket, not the reverse.",
    ],
    [
      "Can I use a 1/4 inch Allen key on a 6 mm socket?",
      "No, in that direction it will not even enter: 1/4 inch is 6.35 mm and the socket is 6. Going the other way is worse — a 6 mm key in a 1/4 inch socket leaves 5.5% clearance, which puts the load on the corners of the socket and rounds it. This is the single commonest way people wreck a socket screw.",
    ],
    [
      "What size Allen key does an M6 bolt need?",
      "It depends on the head. An M6 socket head cap screw to ISO 4762 takes a 5 mm key, an M6 button head to ISO 7380 takes 4 mm, and an M6 socket set screw to ISO 4026 takes 3 mm. Head style changes the socket, so the thread size alone does not tell you the key.",
    ],
    [
      "How do I identify an Allen key size without markings?",
      "Measure across the flats, not corner to corner, with a vernier caliper — that width is the size. Failing that, print a true-scale gauge and lay the short leg across each bar, or try keys in a known socket screw. Guessing by eye between 5 mm and 3/16 inch is exactly the mistake that rounds sockets.",
    ],
  ],
};

export default seo;
