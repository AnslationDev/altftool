const seo = {
  title: "Paracetamol Dose Timer: Next Dose and 4000 mg Limit",
  metaDescription:
    "Enter your last dose time, doses taken and mg per dose to see the earliest next dose, doses left and which limit binds first. Not medical advice.",
  steps: [
    "Pick Who is this for — Adult or child 16 and over, or Child, dosed by weight, which adds a Child weight (kg) field dosed at 15 mg per kg.",
    "Enter Time of the last dose, Doses taken in the last 24 hours, Milligrams in each dose and Gap between doses (hours); the result recalculates as you type.",
    "Read Taken in the last 24 hours, 24-hour limit applied, Left in the allowance, Doses still available and Limited first by, then press Copy result to hand the summary to whoever takes over.",
  ],
  intro:
    "Paracetamol dosing is governed by two separate limits — a minimum gap between doses, usually 4 to 6 hours, and a 24-hour total of 4000 mg for adults (many labels use 3000 mg). This timer takes the time of your last dose, how many doses have been taken in the past 24 hours and the strength of each, then returns the earliest time for the next dose, how many doses remain and which limit you will reach first. Weight-based paediatric dosing at 15 mg/kg per dose is supported. It is informational arithmetic on the label limits, not medical advice.",
  useCases: [
    "You lost track of dosing overnight during a fever and need to know whether the next dose is due yet.",
    "Two people are looking after a sick child and want one shared count of doses given and time of the last one.",
    "You are alternating paracetamol with another medicine and want the paracetamol windows written out.",
    "You want to check that four 1000 mg doses is the whole day's allowance before reaching for a fifth.",
  ],
  benefits: [
    ["Both limits, not one", "Tracks the spacing rule and the 24-hour milligram total, and names whichever binds first."],
    ["Weight-based child mode", "Applies 15 mg/kg per dose and the 60 mg/kg daily ceiling, capped at the adult maximum."],
    ["Flags the hidden risk", "Reminds you that cold and flu remedies commonly contain paracetamol, which is how accidental overdoses happen."],
  ],
  faqs: [
    [
      "How many hours apart should paracetamol doses be?",
      "At least 4 hours, and 4 to 6 hours is the usual instruction on adult and children's labels. Even with a 4-hour gap, standard labelling still caps the day at 4 doses — spacing, dose count and the 24-hour milligram limit all apply, and you follow whichever is reached first.",
    ],
    [
      "What is the maximum paracetamol dose in 24 hours?",
      "4000 mg for most adults — for example four doses of 1000 mg, or eight 500 mg tablets. Many over-the-counter labels set a 3000 mg ceiling instead as an added safety margin, and lower limits apply with liver disease, low body weight, malnutrition or regular alcohol use.",
    ],
    [
      "How much paracetamol can a child have?",
      "The standard paediatric dose is 15 mg per kilogram of body weight, every 4 to 6 hours, with no more than 4 doses in 24 hours — about 60 mg/kg a day. A 20 kg child would therefore take roughly 300 mg per dose and no more than 1200 mg in a day. Always check the concentration on the bottle, and get dosing for infants from a doctor or pharmacist.",
    ],
    [
      "What should I do if I have taken too much paracetamol?",
      "Contact a doctor, emergency department or poisons service immediately, even if you feel completely well. Liver injury from paracetamol develops with few early symptoms, and the antidote works best when it is started within the first several hours.",
    ],
  ],
};

export default seo;
