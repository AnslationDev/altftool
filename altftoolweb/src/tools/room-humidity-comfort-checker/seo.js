const seo = {
  intro:
    "This checker turns a thermo-hygrometer reading into the numbers that actually matter: dew point from the WMO Magnus formula Td = 243.12γ / (17.62 − γ), absolute humidity from the ideal gas law, humidity ratio in grams per kilogram of dry air, and apparent temperature from the US National Weather Service heat index regression. It then compares the room against the ASHRAE 55 comfort band — roughly 23 to 26 °C and 30 to 60% relative humidity — and flags mould and condensation risk. For anyone trying to work out why a room feels clammy, why the window keeps misting, or where to set a dehumidifier.",
  useCases: [
    "Finding out whether 30 °C at 70% RH is why a monsoon bedroom feels unbearable even with the fan on",
    "Checking if a window at 24 °C will condense before the dew point drops overnight",
    "Estimating the litres of water a dehumidifier must pull from a 40 m³ room to bring it from 70% to 55%",
  ],
  benefits: [
    ["Standard psychrometrics", "Magnus dew point and the NWS heat index, not a rule of thumb."],
    ["Surface risk, not just air", "Compares the coldest surface against the dew point, which is where condensation and mould actually start."],
    ["A number for the dehumidifier", "Converts the humidity gap into litres of water for your room volume."],
  ],
  faqs: [
    [
      "What is a comfortable humidity level for a room?",
      "Between 30% and 60% relative humidity at 23 to 26 °C is the band most people find comfortable, following ASHRAE 55 for seated, lightly clothed occupants. Allergy guidance often narrows the upper end to about 50%, because house dust mites cannot maintain their water balance below that.",
    ],
    [
      "What does dew point tell you that humidity does not?",
      "Dew point is the actual amount of moisture in the air, so it does not move when the temperature changes — 70% at 30 °C is a dew point of 23.9 °C, which is the sticky, oppressive feeling people describe. Any surface colder than the dew point will collect condensation, which is why it is the number to watch for misting windows and damp walls.",
    ],
    [
      "At what humidity does mould grow indoors?",
      "Mould needs a relative humidity of about 80% at the surface it is growing on, not in the middle of the room. Because external walls and glass sit several degrees below room air, an air reading around 70% is already enough to push a cold corner past 80%, which is why damp appears behind wardrobes and along outside walls first.",
    ],
    [
      "How do I lower humidity in a room without a dehumidifier?",
      "Ventilate when the outdoor dew point is lower than indoors, cover pots while cooking, vent the bathroom during and after a shower, and dry washing outside rather than on an indoor rack. Warming the room lowers relative humidity without removing any water, which helps comfort and condensation but does nothing about the moisture itself.",
    ],
  ],
};

export default seo;
