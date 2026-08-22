const seo = {
  title: "Wood Screw Selector: Gauge, Length, Pilot Hole",
  metaDescription:
    "Two board thicknesses give the screw gauge and length, pilot and clearance hole, countersink diameter and minimum end and edge distances.",
  steps: [
    "Enter Top board thickness (mm) and Base board thickness (mm), then pick Base material, Joint type and Load on the joint.",
    "Tick I will drill a pilot hole and The tip may break through the far face wherever either applies to the joint you are making.",
    "Read the gauge and length call-out with Pilot hole in the base board, Clearance hole in the top board and Countersink diameter, then press Copy result.",
  ],
  intro:
    "This selector turns two board thicknesses and a joint type into a specific screw call-out: gauge, length, pilot hole, clearance hole, countersink diameter and the minimum distance to keep from an end or edge. It applies the standard workshop rules — gauge from the thickness of the board being screwed into, length from the rule that a screw should bury about twice the top board's thickness while stopping 3 mm short of the far face, and pilot holes at roughly 60% of the screw's major diameter in softwood and 70% in hardwood. Those two pilot factors reproduce the published drill charts, so a #8 screw comes out at 2.5 mm in pine and 2.9 mm in oak.",
  useCases: [
    "Fixing an 18 mm plywood shelf through into a 44 mm softwood upright and needing the exact gauge, length and pilot drill",
    "Screwing into MDF or chipboard edges where the wrong pilot size splits the panel on the first screw",
    "Checking whether a 50 mm screw will punch through the back of a 25 mm rail before you drive it",
  ],
  benefits: [
    ["Two holes, not one", "Gives the clearance hole for the top board and the pilot hole for the base board separately — the pair that stops splitting and jacking."],
    ["Material aware", "Softwood, hardwood, plywood, MDF and particleboard each get their own pilot factor and their own warning about how well they hold."],
    ["Blocks the mistake", "Flags when the base board is too thin, when the tip will break through, and when the joint relies on weak end grain."],
  ],
  faqs: [
    [
      "How long should a wood screw be?",
      "Long enough to bury about twice the thickness of the board it passes through, so roughly three times that thickness in total — an 18 mm board wants around 50 mm of screw. On a blind joint the tip should still stop at least 3 mm short of the far face, so a thin base board caps the length.",
    ],
    [
      "What size pilot hole do I drill for a #8 wood screw?",
      "About 2.4 mm (3/32\") in softwood and 2.8 mm (7/64\") in hardwood, since a #8 screw has a 4.2 mm major diameter and the pilot runs at roughly 60% of that in soft species and 70% in dense ones. The clearance hole through the top board is larger, about 4.4 mm (11/64\"), so the screw pulls the boards together instead of jacking them apart.",
    ],
    [
      "Which screw gauge should I use for 18 mm plywood or 44 mm timber?",
      "#8 for stock around 15–21 mm and #12 for 28–40 mm, with #10 in between — the gauge is chosen from the board the thread bites into, not the board you drill through. Step one gauge up for heavily loaded joints and one down for trim and small mouldings.",
    ],
    [
      "Why do screws into end grain hold so poorly?",
      "Threads in end grain run parallel to the fibres and pull out between them instead of biting across them, so holding power is roughly half that of face grain. Increase embedment by about 50%, always predrill, and where the joint matters use dowels, a domino, a pocket-hole screw at an angle, or a mortise and tenon instead.",
    ],
  ],
};

export default seo;
