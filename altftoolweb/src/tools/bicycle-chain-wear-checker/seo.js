const seo = {
  title: "Bicycle Chain Wear Checker: Ruler to % Elongation",
  metaDescription:
    "Turn a ruler reading over 24 rivet pitches into chain elongation percent, checked against the 0.5% and 0.75% replacement thresholds, plus projected life.",
  steps: [
    "Enter the ruler reading in 'Measured length' and choose Inches or Millimetres under 'Measurement unit' — 24 pitches measure 12.000 in on a new chain.",
    "Pick your 'Drivetrain' (each option shows its replace-at threshold) and optionally add 'Distance ridden on this chain (km, optional)'.",
    "Read the elongation percentage with its verdict — from 'Within spec' to 'Chain + cassette' — then click 'Copy result'.",
  ],
  intro:
    "Chain wear is the percentage a chain has grown longer than its factory 1/2-inch rivet pitch, and this checker converts a ruler reading into that percentage. Measure across 24 rivet pitches — exactly 12.000 inches on a new chain — enter the number, and you get the elongation figure plus whether your drivetrain has crossed the 0.5% or 0.75% replacement point published by Park Tool and Shimano. Riders who track their kilometres also get a projected chain life and how far they can ride before the swap.",
  useCases: [
    "Deciding whether a chain that has done 3,000 km needs replacing before a multi-day tour",
    "Checking a used bike before you buy it, so a worn cassette and chainrings do not become your problem",
    "Working out whether a skipping drivetrain needs just a chain or a chain plus cassette",
  ],
  benefits: [
    ["Reads in inches or millimetres", "Enter 12.06 in or 306.3 mm — the conversion is exact, not rounded."],
    ["Threshold matched to your drivetrain", "11- and 12-speed chains are retired at 0.5%, 10-speed and below at 0.75%."],
    ["Projects the next service", "Add the kilometres ridden and it estimates how far the chain has left."],
  ],
  faqs: [
    [
      "How much chain stretch is too much?",
      "0.5% elongation for 11- and 12-speed chains and 0.75% for 10-speed and below. Past 0.75% the cassette sprockets have usually worn to match the long chain, so a new chain alone will skip under load and you end up buying both.",
    ],
    [
      "How do I measure chain wear with a ruler?",
      "Line the zero mark of a steel rule up with the centre of one chain rivet and read the distance to the rivet 24 pitches along. A new chain measures exactly 12.000 inches over that span; 12.06 inches is 0.5% wear and 12.09 inches is 0.75%. Keep the chain on the large chainring so the top run is under tension.",
    ],
    [
      "Does a chain really stretch?",
      "No — the steel plates do not lengthen. What grows is the clearance between each rivet and its bushing as metal wears away, and across 24 pitches those tiny gaps add up to a measurable extra fraction of an inch. That is why the industry measures a percentage rather than a single worn part.",
    ],
    [
      "How many kilometres does a bicycle chain last?",
      "Anywhere from about 2,000 km to over 6,000 km depending on chain quality, lubricant, terrain and how much grit the chain sees. Distance alone is a poor guide, which is why measuring elongation and letting the tool project your own wear rate is more reliable than any generic interval.",
    ],
  ],
};

export default seo;
