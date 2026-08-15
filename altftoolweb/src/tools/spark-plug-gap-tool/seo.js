const seo = {
  title: "Spark Plug Gap Tool: mm, Inch & Thou with Boost",
  metaDescription:
    "Converts a plug gap using the exact 25.4 mm inch, checks it against the range for your engine type, and closes it 0.05 mm per 0.5 bar of boost.",
  steps: [
    "Enter the 'Measured or desired gap' and pick Millimetres, Inches or 'Thou (thousandths of an inch)' under Unit.",
    "Choose the 'Engine type', fill in 'Peak boost pressure (bar, 0 if none)' and set the 'Electrode material'.",
    "Read the gap in mm, thou and inches alongside the 'Target range to aim for' and the 'Adjustment needed' row.",
  ],
  intro:
    "The Spark Plug Gap Tool converts a gap between millimetres, inches and thousandths of an inch using the exact definition of 1 inch = 25.4 mm, then checks the value against the range normally used for your class of engine. It also applies the standard forced-induction rule of thumb — close the gap by roughly 0.05 mm for every 0.5 bar of boost — because the voltage needed to strike an arc rises with both gap and cylinder pressure. It is aimed at anyone fitting plugs themselves and working from a spec sheet in the other unit system.",
  useCases: [
    "Reading a 0.044 in gap off an American parts listing and needing it in millimetres for an Indian feeler gauge",
    "Checking whether a set of used plugs has worn its gap open beyond the range for a naturally aspirated engine",
    "Working out the tighter gap to target after fitting a turbo kit running 0.8 bar of boost",
  ],
  benefits: [
    ["Exact conversion", "Uses the defined 25.4 mm inch, so 0.030 in reads as 0.762 mm rather than a rounded 0.75."],
    ["Engine-appropriate ranges", "Separate typical ranges for coil-on-plug, distributor, turbo, CNG and small engines."],
    ["Re-gap safety", "Flags that iridium fine-wire plugs come pre-gapped and tolerate very little adjustment."],
  ],
  faqs: [
    [
      "What is the correct spark plug gap?",
      "It is whatever the underbonnet sticker or owner's manual specifies for that engine. As a general pattern, modern naturally aspirated engines with coil-on-plug ignition run about 0.9 to 1.1 mm (35 to 43 thou), older distributor engines about 0.7 to 0.9 mm, and turbocharged engines about 0.6 to 0.8 mm.",
    ],
    [
      "How do I convert a spark plug gap from inches to mm?",
      "Multiply by 25.4, since an inch is defined as exactly 25.4 mm. A 0.035 in gap is 0.889 mm, and a 0.044 in gap is 1.118 mm. Gaps quoted in thou are thousandths of an inch, so multiply by 0.0254 instead: 30 thou is 0.762 mm.",
    ],
    [
      "Why do turbo engines use a smaller spark plug gap?",
      "Because the voltage needed to jump the gap rises with the pressure of the gas between the electrodes. Under boost, cylinder pressure at the moment of ignition is much higher, so a gap the coil could easily bridge off boost may blow out and misfire under load. Closing the gap keeps the demand within what the ignition system can supply.",
    ],
    [
      "Can I re-gap iridium spark plugs?",
      "Only very slightly, and it is better not to. Iridium plugs use a fine-wire centre electrode less than a millimetre across, and they are supplied pre-gapped for the application; levering against that tip snaps or chips it. If the gap is clearly wrong out of the box, adjust the ground strap by no more than about 0.05 mm using a proper gapping tool, never a feeler blade forced into the gap.",
    ],
  ],
};

export default seo;
