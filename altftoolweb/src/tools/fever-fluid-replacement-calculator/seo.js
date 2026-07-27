const seo = {
  intro:
    "The Fever Fluid Replacement Calculator estimates how much extra fluid a fever adds to normal daily needs, applying the clinical rule that maintenance requirement rises by about 10-12% for every 1 °C of body temperature above 37 °C. Baseline maintenance comes from the Holliday-Segar 100/50/20 ml per kg rule for children, 30 ml/kg/day for adults, and 25 ml/kg/day from age 65, and the surcharge is prorated by how many hours the temperature was actually raised. It is informational only — a way to see roughly how much more a sick person should be drinking, not a prescription.",
  useCases: [
    "Work out what a 70 kg adult running 39.5 °C all day should be aiming to drink — around 2,730 ml rather than the usual 2,100 ml.",
    "Set a realistic hourly sipping target for a feverish child so a carer knows what to offer between doses of paracetamol.",
    "Check the smaller surcharge that applies when a temperature only spiked for part of the day rather than all 24 hours.",
  ],
  benefits: [
    [
      "Age-appropriate baseline",
      "Uses the paediatric weight rule under 18 and the lower older-adult figure from 65, rather than one number for everyone.",
    ],
    [
      "Prorated, not exaggerated",
      "A six-hour spike adds a quarter of the surcharge, not the whole day's worth.",
    ],
    [
      "Knows when to stop",
      "Blocks results above 41 °C, flags any fever in a baby under three months, and lists the red flags that need care instead.",
    ],
  ],
  faqs: [
    [
      "How much more water should you drink when you have a fever?",
      "Roughly 10-12% more than your usual maintenance fluid for each 1 °C above 37 °C. For a 70 kg adult whose normal maintenance is about 2,100 ml a day, a temperature of 39.5 °C sustained for 24 hours adds around 630 ml, giving a target near 2,730 ml.",
    ],
    [
      "Why does fever increase fluid needs?",
      "Every degree of fever raises the basal metabolic rate by roughly 10-13%, and a faster metabolism means faster breathing and more heat to shed. Both routes lose water — the airway humidifies more air, and the skin loses more through insensible evaporation and sweating, particularly when the temperature breaks and drenching sweats begin.",
    ],
    [
      "What counts as a fever?",
      "A body temperature of 38 °C (100.4 °F) or above is the usual clinical threshold. Readings between 37 °C and 38 °C are a raised temperature rather than a fever. A temperature of 41 °C or above is hyperpyrexia and a medical emergency needing immediate care, not home management.",
    ],
    [
      "What should you drink when you have a fever?",
      "Water, oral rehydration solution, milk, soup, diluted juice and rice water all count, and ORS is the better choice if there is vomiting or diarrhoea alongside the fever. Small frequent sips stay down better than large glasses. Anyone on a prescribed fluid restriction for heart, kidney or liver disease must keep to that limit during illness and check with their doctor rather than following a general calculation.",
    ],
  ],
};

export default seo;
