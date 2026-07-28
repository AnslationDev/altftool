const seo = {
  intro:
    "The Indoor Humidity Comfort Guide builds a target relative humidity band from the EPA and ASHRAE baseline of 30% to 50%, tightened by whatever applies in your room — dust mite allergy, a history of damp, dry skin, wooden instruments. It then runs the psychrometrics: dew point from the Magnus equation, absolute humidity in grams per cubic metre, and the relative humidity right at your coldest surface, which is where mould actually starts once it stays above 80%.",
  useCases: [
    "Work out why a bedroom at an apparently fine 55% still grows mould in the corner behind the wardrobe.",
    "Set a dehumidifier target that suppresses dust mites without drying the air enough to crack a wooden floor.",
    "Check whether winter condensation on the windows is a ventilation problem or a cold-glass problem.",
    "See how many grams of water a humidifier has to put into a 40 m³ bedroom to lift it from 25% to 40%.",
  ],
  benefits: [
    ["Surface, not just room", "Calculates humidity at the cold surface, which is what decides mould, rather than the room average."],
    ["Composable targets", "The band narrows as you tick the concerns that apply, each with the reason attached."],
    ["A number you can act on", "Converts the gap to target into grams of water to add or remove for your room volume."],
  ],
  faqs: [
    [
      "What is the ideal indoor humidity level?",
      "The US EPA and ASHRAE both point to 30% to 50% relative humidity, with 60% as an upper bound for controlling mould and dust mites. If anyone in the house has a dust mite allergy, keeping it under 45% is better, because mites cannot maintain their water balance below roughly 50%.",
    ],
    [
      "Why does mould grow when my hygrometer reads under 60%?",
      "Because mould responds to the humidity at the surface, not in the middle of the room. Air at 22 °C and 55% has a vapour pressure that corresponds to about 91% relative humidity against a 14 °C window reveal or cold external wall — comfortably past the 80% threshold used in EN ISO 13788 as the mould growth criterion.",
    ],
    [
      "What is dew point and why does it matter indoors?",
      "The dew point is the temperature at which the air becomes saturated and water condenses out. If any indoor surface is at or below the room's dew point, water will bead on it — so a dew point of 12.5 °C means single glazing at 10 °C will stream while the room reading still looks reasonable.",
    ],
    [
      "Is a humidifier or a dehumidifier better for dry winter air?",
      "Try heating less first. Warming outdoor air without adding water is what drives winter relative humidity down, so a degree less on the thermostat often lifts humidity by two or three points at no cost. If you still need a humidifier, keep the room under 50% and clean the unit — a dirty reservoir sprays contaminants into the room.",
    ],
  ],
};

export default seo;
