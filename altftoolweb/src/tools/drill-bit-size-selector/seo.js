const seo = {
  intro:
    "Works out the drill diameter for the four jobs people confuse: a pilot hole for a wood screw, a clearance hole for its shank, a tap drill for a metric thread and the hole for a wall plug. Pilot sizes follow the published charts — about 60% of the screw's outer diameter in softwood and 75% in hardwood — tap drills use the standard D minus pitch rule that leaves roughly 77% thread engagement, and clearance holes come from the ISO 273 series. Each answer is rounded to a bit you can actually buy, in millimetres and in inches.",
  useCases: [
    "Fixing a hardwood shelf without splitting the batten or shearing the screw head off",
    "Tapping an M8 thread in an aluminium bracket and needing the drill before the tap",
    "Buying the right masonry bit for the red plugs already in the drawer",
  ],
  benefits: [
    ["Four rules, one place", "Pilot, clearance, tap and plug sizes all derived rather than looked up in scattered charts."],
    ["Rounded to real bits", "Gives the nearest stocked metric size and the inch fraction, plus the sizes either side."],
    ["Depth included", "Screw length plus 3 mm, or plug length plus 10 mm so drilling dust does not stop the plug short."],
  ],
  faqs: [
    [
      "What size pilot hole do I need for a screw?",
      "About 60% of the screw's outer thread diameter in softwood and 75% in hardwood. A 4.2 mm screw therefore takes roughly a 2.5 mm pilot in pine and a 3.2 mm pilot in oak. The denser the timber the closer the pilot must be to the screw's root diameter, because dense fibres split instead of compressing around the thread.",
    ],
    [
      "What is the tap drill size for an M8 thread?",
      "6.8 mm. The rule for ISO metric coarse threads is drill diameter = nominal diameter minus pitch, and M8 coarse has a 1.25 mm pitch, so 8 − 1.25 = 6.75 mm, rounded to the 6.8 mm bit that tap drill sets supply. That leaves about 77% of a full thread, which carries nearly all the strength for a fraction of the tapping torque a 100% thread would need.",
    ],
    [
      "Why do I need a clearance hole as well as a pilot hole?",
      "Because a screw that grips the top piece cannot pull it down onto the bottom one. The clearance hole lets the shank pass freely through the top piece so all the thread engagement happens in the piece underneath, which is what actually closes the joint. Drill it at the screw's full outer diameter plus a little.",
    ],
    [
      "What drill bit size do I need for a 6 mm wall plug?",
      "A 6 mm masonry bit — the number on the plug is the drill size, not the screw size. Drill about 10 mm deeper than the plug is long so dust collecting at the bottom does not stop the plug seating flush, and use hammer action in solid brick or concrete but switch it off for tile and hollow block.",
    ],
  ],
};

export default seo;
