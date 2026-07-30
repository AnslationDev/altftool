const seo = {
  intro:
    "This calculator estimates a day's fluid target for humid heat by adding sweat losses to a body-weight baseline of 35 mL per kg per day (30 mL/kg from age 65), then scaling those sweat losses by the US National Weather Service heat index computed from your air temperature and relative humidity. It exists because humidity is the part ordinary hydration maths ignores: sweat only cools you when it evaporates, and as the air approaches saturation you sweat more for less cooling. It is for anyone training or working in muggy conditions who wants a planning number, plus a sodium estimate and a safe drinking ceiling — informational only, not medical advice.",
  useCases: [
    "You run at 7am in monsoon humidity and want to know roughly how much to carry when 32 C at 85% humidity feels far worse than 32 C dry",
    "You are playing an afternoon match in a coastal city and need a sense of whether plain water is enough or the session calls for electrolytes",
    "You work outdoors without air conditioning and want your fluid spread across waking hours rather than gulped at the end of the shift",
  ],
  benefits: [
    ["Humidity is in the maths, not the wording", "The full NWS Rothfusz heat index regression, including both published corrections, drives the sweat adjustment — so 80% humidity changes your number, not just the advice text."],
    ["Sodium as well as water", "Sweat sodium is estimated at 500, 900 or 1,500 mg per litre depending on whether you run light, typical or salty, which is what decides if water alone will do."],
    ["Flags over-drinking, not just under-drinking", "Because healthy kidneys clear only about 0.8–1.0 L of water per hour, the plan warns when your pace would exceed that, the scenario behind exercise-associated hyponatraemia."],
  ],
  faqs: [
    [
      "How much water should I drink in humid weather?",
      "Start from about 35 mL per kilogram of body weight per day — roughly 2.4 L for a 70 kg adult — and add your sweat losses on top. This calculator estimates those losses from training intensity and hours, hours spent outdoors, and a heat-index-based multiplier, so a hot humid training day lands well above the baseline while a mild indoor day stays near it.",
    ],
    [
      "Can you drink too much water?",
      "Yes, and it is the more dangerous error during long sweaty sessions. Healthy kidneys excrete a maximum of roughly 0.8 to 1.0 litres of water per hour; drinking faster than that, especially plain water, dilutes blood sodium and risks exercise-associated hyponatraemia. The plan flags any pace above 1.0 L/hour and any daily total above 10 litres.",
    ],
    [
      "When do I need electrolytes rather than plain water?",
      "Once estimated sweat losses reach about 1.5 litres in a day. Sweat carries roughly 460 to 1,840 mg of sodium per litre depending on the person, and for prolonged sweating the ACSM suggests a drink containing about 460 to 690 mg of sodium per litre. If you leave white salt marks on your kit, assume you are at the higher end.",
    ],
    [
      "Why does humidity increase how much I need to drink?",
      "Because sweat cools you only when it evaporates. In humid air evaporation slows, sweat drips off without carrying heat away, and the body compensates by sweating harder for less cooling — so fluid loss outruns what the thermometer suggests. The heat index captures exactly that combination, which is why it, rather than air temperature, drives the sweat multiplier here.",
    ],
  ],
};

export default seo;
