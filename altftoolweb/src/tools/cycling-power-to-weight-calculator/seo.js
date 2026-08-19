const seo = {
  title: "Cycling Power to Weight Calculator: W/kg and VAM",
  metaDescription:
    "Divide FTP by body mass for W/kg, place it on the Coggan rider bands, and get climb VAM plus the watts or kilos needed for a target.",
  steps: [
    "Enter FTP / threshold power (watts) and Body mass (kg), then set the Category table to Men's bands or Women's bands.",
    "Set Climb gradient (%), Climb height gain (m) and a Target power to weight (W/kg) — enter 0 to hide the target.",
    "Read your W/kg with its rider band and Next band up, plus the VAM and climb figures, then press Copy result.",
  ],
  intro:
    "Power to weight is functional threshold power in watts divided by body mass in kilograms, and it is the single number that predicts how fast a cyclist climbs. This calculator returns your W/kg, places it on the Coggan power-profile category bands from untrained through to world class, and converts it into vertical ascent metres per hour using the Ferrari VAM relation so you can estimate a real climb time. It also shows the two levers separately: the watts you would need at your current weight to reach a target, and the weight that would reach it at your current FTP.",
  useCases: [
    "Check where a 250 W FTP at 70 kg sits on the rider category bands before entering your first road race.",
    "Estimate how long a 500 metre climb at 8 percent will take at your current threshold power.",
    "Compare adding 20 watts against losing 3 kilograms to see which moves your W/kg further.",
    "Track W/kg through a training block where body mass is also changing, so raw FTP alone would mislead.",
  ],
  benefits: [
    ["Category context", "The raw number is placed on published rider bands for men and women, not left uninterpreted."],
    ["Climb time, not just a ratio", "VAM, road distance, climb duration and average speed for a gradient you choose."],
    ["Both levers side by side", "Watts needed versus kilograms needed for the same target W/kg."],
  ],
  faqs: [
    [
      "What is a good watts per kilogram for cycling?",
      "For men, roughly 3.1 to 3.7 W/kg at threshold is a keen recreational cyclist, 4.3 and above is a strong club racer, and above 5.7 approaches professional level. The equivalent women's bands sit lower at each level, by about 0.4 to 0.7 W/kg, with the gap narrowing at the lower bands.",
    ],
    [
      "How do you calculate power to weight ratio?",
      "Divide your functional threshold power in watts by your body mass in kilograms. A rider with a 250 W FTP weighing 70 kg has 250 divided by 70, which is 3.57 W/kg. Use body mass alone for comparisons, since that is how the published bands are defined.",
    ],
    [
      "What is VAM in cycling?",
      "VAM is vertical ascent metres per hour — how much height you gain in an hour of climbing. It relates to threshold W/kg by VAM equals W/kg multiplied by 100 and by (2 plus gradient divided by 10), so 3.57 W/kg on an 8 percent climb gives about 1,000 vertical metres per hour.",
    ],
    [
      "Is it better to gain watts or lose weight to improve W/kg?",
      "Gaining watts is usually the safer lever, because weight loss can cost power if it comes from muscle or from under-fuelling training. Use the comparison here to see the size of each option, and speak to a coach or a registered dietitian before making large changes to body weight.",
    ],
  ],
};

export default seo;
