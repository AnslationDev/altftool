const seo = {
  title: "FTP Cycling Power Zones Calculator: 7 Coggan",
  metaDescription:
    "Turn your FTP into watts for all seven Coggan zones, estimate FTP from a 20-minute test at 95%, and split a training week 80/20.",
  steps: [
    "Enter your FTP in watts in the FTP (watts) field, and optionally Body mass (kg) for W/kg plus your Weekly riding hours.",
    "If you only have a test result, open Estimate FTP from a shorter test, choose the 20-minute test (95% of average) or 8-minute test (90% of average), and press Use this FTP.",
    "Read the wattage for all seven Coggan zones in the Full zone table and press Copy zones to paste them into a head unit or smart trainer.",
  ],
  intro:
    "FTP training zones divide cycling intensity into seven bands defined as percentages of functional threshold power, following the model published by Andrew Coggan: active recovery up to 55 percent, endurance 56-75, tempo 76-90, lactate threshold 91-105, VO2max 106-120, anaerobic capacity 121-150 and neuromuscular power above 150. This calculator converts your FTP into watts for each band, optionally adds W/kg, estimates FTP from a 20-minute or 8-minute test, and splits a training week using the 80/20 polarised model. The output is ready to enter into a head unit, a smart trainer or a training diary.",
  useCases: [
    "Set up power zones on a new bike computer or smart trainer straight after an FTP test.",
    "Convert a 20-minute test average of 300 W into an FTP of 285 W and read the zones off it.",
    "Check the exact wattage range for a 2 x 20 minute threshold session before starting it.",
    "Plan an eight-hour training week as roughly six and a half hours easy and one and a half hours hard.",
  ],
  benefits: [
    ["All seven Coggan zones", "Not a simplified three or five zone model — the full published set with percentages shown."],
    ["Test estimator built in", "Applies the standard 95 percent factor to a 20-minute test, or 90 percent to an 8-minute test."],
    ["W/kg per zone", "Add body mass and every boundary also appears in watts per kilogram."],
  ],
  faqs: [
    [
      "What are the seven cycling power zones?",
      "Zone 1 active recovery (up to 55 percent of FTP), zone 2 endurance (56-75), zone 3 tempo (76-90), zone 4 lactate threshold (91-105), zone 5 VO2max (106-120), zone 6 anaerobic capacity (121-150) and zone 7 neuromuscular power (above 150). The model comes from Andrew Coggan's work on training with a power meter.",
    ],
    [
      "How do you calculate FTP from a 20-minute test?",
      "Take the average power for the 20-minute maximal effort and multiply it by 0.95. A 300 W average therefore gives an FTP of 285 W. The 5 percent discount accounts for the fact that a 20-minute effort is harder than an effort you could hold for a full hour.",
    ],
    [
      "How often should I retest my FTP?",
      "Every six to eight weeks during structured training, or whenever sessions in zone 4 start feeling clearly too easy or impossible to complete. Zones set from an outdated FTP push work into the wrong band and blunt the effect of the session.",
    ],
    [
      "What is polarised 80/20 training?",
      "A distribution where about 80 percent of training time is genuinely easy in zones 1 and 2, and about 20 percent is genuinely hard in zone 4 and above, with little time in the tempo middle. It comes from research by Stephen Seiler on how endurance athletes actually distribute intensity.",
    ],
  ],
};

export default seo;
