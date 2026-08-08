const seo = {
  title: "Endurance Protein Calculator: g/kg by Training Hours",
  metaDescription:
    "Place weekly training hours in the ACSM 1.2-2.0 g/kg range for a daily protein target, with the 0.3 g/kg post-session dose and a per-meal split.",
  steps: [
    "Enter Bodyweight (kg), Training hours per week, Sessions per week and Age (years).",
    "Set Protein meals per day, add Daily calories (optional), and tick Currently eating in a calorie deficit if that applies.",
    "Read the Daily protein target in grams and g/kg, the 0.3 g/kg post-session dose, protein per meal, and the share of stated calories against the 10-35% AMDR.",
  ],
  intro:
    "This calculator sets a daily protein target for endurance athletes by placing your weekly training hours inside the 1.2-2.0 g per kg bodyweight range published in the 2016 ACSM, Academy of Nutrition and Dietetics and Dietitians of Canada joint position stand on nutrition and athletic performance. It also gives the 0.3 g/kg post-session dose the same stand recommends, splits the daily total across your meals, and checks the result against the 10-35% AMDR for protein energy. It is built for runners, cyclists, swimmers and triathletes whose needs move with training block, not for a single fixed number.",
  useCases: [
    "You have gone from 6 to 14 hours a week in a marathon build and want to know how much extra protein that actually justifies.",
    "You are a 55-year-old cyclist wondering whether the standard recreational recommendation is too low for your age.",
    "You are cutting weight before a hilly race and need a protein figure that protects muscle without crowding out carbohydrate.",
  ],
  benefits: [
    ["Volume-scaled", "Five training-hour bands map onto the position-stand range instead of a single generic figure."],
    ["Session and meal doses", "Shows the 0.3 g/kg post-workout feed and whether each meal clears the 0.25 g/kg threshold."],
    ["Calorie sanity check", "Flags when the protein target would exceed 35% of the calories you say you eat."],
  ],
  faqs: [
    [
      "How much protein does an endurance athlete need per day?",
      "The ACSM joint position stand puts athletes at 1.2-2.0 g per kg of bodyweight daily, and endurance athletes typically sit in the lower-to-middle part of that band. A 68 kg runner training 12 hours a week lands around 1.6 g/kg, or roughly 110 g a day.",
    ],
    [
      "Do runners need less protein than lifters?",
      "Not dramatically. Endurance training raises amino acid oxidation and damages muscle too, so requirements land in the same 1.2-2.0 g/kg band. The practical difference is that endurance athletes must fit that protein around a much larger carbohydrate intake.",
    ],
    [
      "How much protein should I eat after a long run or ride?",
      "About 0.3 g per kg of bodyweight, which is roughly 20 g for a 68 kg athlete, taken with carbohydrate soon after the session. Repeating a similar dose every 3-5 hours through the rest of the day supports repair better than one large evening serving.",
    ],
    [
      "Should masters athletes eat more protein?",
      "Yes, older athletes respond less to small protein doses, so the PROT-AGE group recommends they avoid the bottom of the range. This calculator applies a 1.4 g/kg floor from age 50 upward, even at low training volumes. Individual needs vary, so discuss changes with a sports dietitian or your doctor.",
    ],
  ],
};

export default seo;
