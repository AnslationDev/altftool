const seo = {
  title: "Aquarium Running Cost: Heater, Filter, Light per Month",
  metaDescription:
    "Monthly electricity for filter, air pump, light and heater. The heater is costed from tank heat loss and temperature difference, not its rated watts.",
  steps: [
    "Describe the tank: 'Tank volume (litres)' starts at 100, 'Top cover' says how much of the surface is lidded, and 'Water temperature to hold (°C)' and 'Average room temperature (°C)' start at 26 and 22 — the gap between them is what the heater has to replace.",
    "Fill in the equipment: 'Heater rating (W)', 'Filter power (W)' and 'Filter hours a day', 'Air pump power (W)', 'Light power (W)' and 'Light hours a day', then 'Days per month' and 'Electricity tariff (₹ per unit)', which defaults to ₹8.",
    "Read 'Cost per month' at the top, then the breakdown — heat loss coefficient in watts per °C, heater duty cycle, suggested heater size and cost per year — and the 'Where the units go' table ranking each device by kWh a month. 'Copy result' takes the whole summary.",
  ],
  intro:
    "This calculator adds up an aquarium's monthly electricity from its four loads — filter, air pump, light and heater — and treats the heater properly. A heater does not draw its rated wattage continuously; it cycles to replace the heat the tank loses to the room, so its energy is set by heat loss (loss coefficient in watts per °C, scaled by tank surface area, times the temperature difference) rather than by the number on the box. That is why fitting a 300 W heater instead of a 100 W one in the same tank costs nothing extra to run.",
  useCases: [
    "You are setting up a 100-litre planted tank and want the running cost before you commit to the hobby.",
    "Your winter bill rose and you want to see how much of it is the aquarium heater fighting a colder room.",
    "You are deciding whether a glass lid is worth buying for an open-top tank.",
  ],
  benefits: [
    ["Heater modelled, not guessed", "Duty cycle comes from heat loss and the temperature difference, so the figure changes correctly with the season."],
    ["Heater sizing included", "You get the smallest standard heater that can hold your temperature with a sensible recovery margin."],
    ["Ranked by equipment", "Seeing filter, light and heater side by side shows where a change actually saves money."],
  ],
  faqs: [
    [
      "How much does it cost to run a 100 litre aquarium per month?",
      "Around ₹300 a month at ₹8 a unit for a covered 100-litre tank held at 26 °C in a 22 °C room, running a 12 W filter, a 4 W air pump and an 18 W light for eight hours. The heater is about 58% of that, at roughly 22 units a month.",
    ],
    [
      "Does a bigger aquarium heater use more electricity?",
      "No. The heater only replaces the heat the tank loses, so a 300 W and a 100 W heater in the same tank consume the same energy — the larger one simply switches on less often. Oversizing costs nothing in running terms but does raise the risk of cooking the tank if the thermostat sticks.",
    ],
    [
      "Does covering an aquarium save electricity?",
      "Yes, substantially. Most of an open tank's heat leaves as evaporation, and a glass lid can cut total heat loss by roughly 40%. On a 100-litre tank held 4 °C above room temperature that is around ₹140 a month, so a lid usually pays for itself in a season.",
    ],
    [
      "Which aquarium equipment uses the most power?",
      "The heater, in almost every tank kept above room temperature — it typically accounts for half to three-quarters of the bill. The filter is second because it runs 24 hours a day; the light is usually third despite its higher wattage, because it runs only eight hours.",
    ],
  ],
};

export default seo;
