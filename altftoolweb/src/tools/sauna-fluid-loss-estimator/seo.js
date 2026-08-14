const seo = {
  title: "Sauna Sweat Loss Calculator: Litres and Rehydration",
  metaDescription:
    "Sweat lost per sauna session from a before/after weigh-in or from room temperature and humidity, with the ACSM 125-150% amount to drink back.",
  steps: [
    "Choose \"Estimate from the room conditions\" or \"Measured from my weight change\" at the top of the form.",
    "In estimate mode fill Body weight (kg), Height (cm), Sauna type, Room temperature (°C) and Room humidity (%); in measured mode fill Weight before (kg), Weight after (kg), Fluid drunk during (ml) and Urine passed during (ml) — both modes need Minutes per round and Number of rounds.",
    "Sweat lost is reported in litres and ml alongside sweat rate per hour, body mass lost as a percentage, the \"Drink back afterwards (125-150%)\" range and sodium lost in mg; Copy result copies the summary and Reset restores the defaults.",
  ],
  intro:
    "The Sauna Fluid Loss Estimator calculates how much sweat a sauna session cost you and how much to drink back. In measured mode it uses the standard sweat-rate equation — sweat equals body-mass change plus fluid drunk minus urine passed, with one kilogram of body mass treated as one litre of water. In estimate mode it models sweat rate from how far the room sits above skin temperature and how much the humidity blocks evaporation. Replacement follows the ACSM guidance of drinking 125-150% of the deficit, because some of what you drink leaves again as urine before rehydration finishes.",
  useCases: [
    "Find out what three 15-minute rounds in an 85 °C Finnish sauna actually cost in fluid, without stepping on a scale.",
    "Convert a genuine before-and-after weigh-in into a sweat volume and a replacement target.",
    "Compare a steam room session against a dry sauna session of the same length before an evening out.",
  ],
  benefits: [
    [
      "Measurement beats modelling",
      "Weigh-in mode corrects for what you drank and passed, which is how sweat rate is measured in exercise physiology labs.",
    ],
    [
      "Flags the 2% threshold",
      "Warns when body-mass loss passes the point where thermoregulation and concentration measurably decline.",
    ],
    [
      "Sodium as well as water",
      "Estimates sweat sodium loss so heavy sessions are not replaced with plain water alone.",
    ],
  ],
  faqs: [
    [
      "How much water do you lose in a sauna?",
      "Commonly around 0.5 litres in a 15-20 minute round, and roughly 1.5-2 litres per hour of continuous exposure in an 80-90 °C Finnish sauna for an average adult. The exact figure scales with body surface area, room temperature and humidity — a large person in a hot room can exceed 2 litres per hour, while a 55 °C infrared cabin produces far less.",
    ],
    [
      "How do you measure sweat loss accurately?",
      "Weigh yourself naked and towelled dry immediately before and after, then add whatever you drank during the session and subtract any urine passed. Each kilogram of body-mass change equals about one litre of sweat. Weighing with wet hair or damp clothing is the usual source of error.",
    ],
    [
      "How much should you drink after a sauna?",
      "Aim for 125-150% of the fluid you lost — so 1.25 to 1.5 litres for every kilogram of body mass lost. The extra covers urine produced while you rehydrate. Drinking it over two to four hours works better than downing it at once, and adding sodium from food or an electrolyte drink helps you retain it.",
    ],
    [
      "Does sweating in a sauna help you lose weight?",
      "No — the weight drops on the scale because water left your body, and it comes straight back as soon as you rehydrate. There is no fat loss from sweating itself. Deliberately staying dehydrated to keep the number down raises the risk of heat illness, kidney strain and fainting. This tool is informational; talk to a doctor before using a sauna if you have heart disease, low blood pressure or are pregnant.",
    ],
  ],
};

export default seo;
