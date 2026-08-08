const seo = {
  title: "Hot Yoga Hydration Calculator: Sweat Rate and Sips",
  metaDescription:
    "Before, during and after fluid plan built on ACSM targets: 5-7 mL/kg pre-class, under 2% body-mass loss, 125-150% of the deficit after.",
  steps: [
    "Choose \"Estimate it from the room\" or \"I weighed before and after\", then set the Class length (minutes); in estimate mode add Body weight (kg), Room temperature (C), Relative humidity (%) and a Class style of Gentle / hot yin / restorative, Hot vinyasa / Bikram sequence, or Power / sculpt with weights.",
    "In weigh-in mode enter Weight before class (kg), Weight after class (kg) and Fluid drunk during class (ml) instead, and tick \"Add the 2-hour top-up (urine dark or none passed since waking)\" if you started the day short.",
    "\"Carry into class\" gives the millilitres to take in and the sip size to drink every 15 minutes, while the list below splits before class, the 2-hour top-up, during, after and the total, alongside sweat rate, sweat lost, deficit percentage against the 2% threshold and sodium lost; Copy plan copies it as text.",
  ],
  intro:
    "This calculator turns a hot yoga class into a fluid plan: how much to drink in the hours before, how much to sip during, and how much to replace afterwards. It uses the sweat-rate equation from the ACSM Position Stand on Exercise and Fluid Replacement — sweat loss equals pre-class weight minus post-class weight plus anything drunk — and applies the same guideline's targets of 5-7 mL per kg beforehand, keeping body-mass loss under 2%, and replacing 125-150% of any remaining deficit. If you have not weighed yourself, it will model a sweat rate from room temperature, humidity, class style and body size instead.",
  useCases: [
    "Work out how many millilitres to carry into a 90-minute Bikram class in a 40 C room so you finish under a 2% body-mass loss.",
    "Convert a one-off weigh-in (70.0 kg before, 68.5 kg after, 500 mL drunk) into your personal sweat rate and reuse it every week.",
    "Decide whether a class costs you enough sodium to justify an electrolyte drink rather than plain water afterwards.",
  ],
  benefits: [
    ["Measured beats guessed", "Weigh-in mode gives your real sweat rate instead of a population average."],
    ["Split across the day", "Separates prehydration, in-class sips and post-class replacement so nothing is drunk all at once."],
    ["Sodium included", "Estimates sweat sodium at roughly 1,150 mg per litre so you know when water alone is not enough."],
  ],
  faqs: [
    [
      "How much water should I drink before hot yoga?",
      "About 5-7 mL per kilogram of body weight roughly four hours before class — that is 350-490 mL for a 70 kg person. If you produce no urine in that window or it is dark, the ACSM suggests a further 3-5 mL/kg about two hours before.",
    ],
    [
      "How much do you sweat in a hot yoga class?",
      "Commonly 1.0-1.5 litres in a 90-minute heated class, which is a sweat rate near 0.7-1.0 L per hour. It varies widely with room temperature, humidity, body size and fitness, so weighing yourself before and after is the only reliable way to know your own figure.",
    ],
    [
      "How do I calculate my sweat rate?",
      "Weigh yourself undressed before class and again afterwards towelled dry, then add whatever you drank: sweat loss in litres equals the weight drop in kilograms plus the fluid drunk in litres. Divide by class length in hours for a rate in litres per hour.",
    ],
    [
      "Do I need electrolytes after hot yoga or is water enough?",
      "Water is usually enough below about a litre of sweat loss. Past that you are also losing roughly 1,150 mg of sodium per litre, and replacing large volumes with plain water can dilute blood sodium — add salt through food or an electrolyte drink. This is general information; anyone with kidney, heart or blood-pressure conditions should ask their doctor.",
    ],
  ],
};

export default seo;
