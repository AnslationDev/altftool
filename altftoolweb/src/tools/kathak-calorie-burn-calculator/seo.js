const seo = {
  intro:
    "The Kathak Calorie Burn Calculator prices a riyaz segment by segment — abhinaya, tatkar at vilambit, madhya and drut laya, and chakkar sequences — instead of averaging the whole practice at one intensity. Each segment uses the closest published MET value from the Compendium of Physical Activities converted with kcal/min = MET x 3.5 x kg / 200, and footwork segments also account for the ghungroo on your ankles, since load carried on the feet costs several times more energy than the same load on the torso.",
  useCases: [
    "Log a 65-minute riyaz where only 20 minutes were fast tatkar and the rest was abhinaya and warm-up.",
    "See what switching from a 100-bell ghungroo set to a heavier 200-bell set adds to a footwork-heavy practice.",
    "Compare a chakkar-focused rehearsal week against an abhinaya-focused one before a performance.",
    "Work out whether daily riyaz alone meets your weekly moderate-to-vigorous activity target.",
  ],
  benefits: [
    ["Segment-level accuracy", "Abhinaya at 2.5 MET and chakkars at 7.8 MET are three times apart — averaging them hides that."],
    ["Ghungroo accounted for", "Ankle load is converted to a torso-equivalent so footwork segments carry the extra cost."],
    ["Isolates what the bells cost", "Shows the calories attributable to the ghungroo alone for the same practice."],
  ],
  faqs: [
    [
      "How many calories does one hour of Kathak burn?",
      "It depends heavily on what you practise: an hour of drut tatkar at 7.3 MET burns about 422 kcal for a 55 kg dancer without ghungroo and about 475 kcal wearing a 0.7 kg set on each ankle, while an hour of abhinaya at 2.5 MET is closer to 145 kcal. A mixed 65-minute riyaz typically lands around 320-360 kcal.",
    ],
    [
      "Does wearing ghungroo burn more calories?",
      "Yes, measurably. Weight carried on the feet costs roughly five times as much energy as the same weight on the torso, so a 0.7 kg set on each ankle behaves like about 7 kg of extra body mass during footwork — adding around 10% to a footwork-heavy practice.",
    ],
    [
      "Is Kathak a good cardio workout?",
      "Fast footwork and chakkar sequences reach 7.3-7.8 MET, above the 6 MET threshold for vigorous intensity, so those parts count toward the 75 minutes of vigorous activity per week in the WHO guidelines. Abhinaya and slow riyaz are light activity and do not count toward that target.",
    ],
    [
      "Why does Kathak not appear in MET tables?",
      "The Compendium of Physical Activities catalogues mostly Western and general dance forms and has no Kathak code, so this tool maps each segment to the nearest catalogued equivalent — slow ballroom for vilambit riyaz, general aerobic dance for drut tatkar, and fast folk dance for chakkars. The numbers are informed estimates, not measurements of Kathak specifically.",
    ],
  ],
};

export default seo;
