const seo = {
  title: "Room Heater Running Cost: Watts, Hours and Tariff",
  metaDescription:
    "Season and daily heater cost from wattage, hours and ₹/unit, using each type's duty cycle — plus how a reverse-cycle AC compares per unit of heat.",
  steps: [
    "Pick a \"Heater type\" — Fan heater / blower, Oil-filled radiator (OFR), Halogen / quartz rod heater, Carbon / infrared panel, or Air conditioner in heat mode.",
    "Enter \"Rated wattage (W)\", \"Hours switched on per day\", \"Days used per month\", \"Months of heating season\" and your \"Electricity tariff (₹ per unit)\".",
    "Read \"Cost for the season\" with its per-day and per-month figures, then the \"Same warmth, different appliance\" table comparing Units/day, Per day and Season.",
  ],
  intro:
    "This calculator works out what a room heater adds to the winter electricity bill from its rated wattage, the hours it runs and how much of that time the thermostat actually keeps the element energised. It also makes the comparison most heater guides get wrong: a fan blower, an oil-filled radiator, a halogen rod and a carbon panel are all exactly 100% efficient, so per unit of heat they cost identically — only a reverse-cycle air conditioner, which moves heat instead of creating it at a coefficient of performance near 3, breaks that tie.",
  useCases: [
    "Your December bill triples and you want to know how much of it a single 2000 W blower running six hours a night accounts for.",
    "You are choosing between an oil-filled radiator and a fan heater and want the running-cost difference over a three-month season.",
    "You already own a split AC and want to see what switching to its heat mode would do to the bill compared with a rod heater.",
  ],
  benefits: [
    ["Duty cycle, not just wattage", "A 2000 W radiator whose thermostat cycles at 55% costs far less than a 2000 W blower that runs flat out for the same hours."],
    ["Load and current shown", "The connected load in kW and the approximate amps tell you whether the socket and circuit can take a second heater."],
    ["The heat-pump comparison", "Cost per kWh of heat delivered exposes the one genuine efficiency difference among heating appliances."],
  ],
  faqs: [
    [
      "How much does a 2000 W room heater cost per hour?",
      "About ₹16.00 an hour at ₹8 a unit if the element runs continuously, since 2000 W is 2 units an hour. A fan heater whose thermostat keeps the element on roughly 90% of the time works out a little less, near ₹14.40, while an oil-filled radiator cycling at about 55% costs closer to ₹8.80 an hour once the room is warm.",
    ],
    [
      "Which room heater consumes the least electricity?",
      "Per unit of heat, none of them — every resistive heater converts electricity to heat at 100%, so a halogen rod, a blower, an oil-filled radiator and a carbon panel all cost the same for the same warmth. What varies is the wattage you buy and how long the thermostat lets it run, so a 1000 W panel that keeps you comfortable costs half of a 2000 W blower.",
    ],
    [
      "Is running the AC in heat mode cheaper than a room heater?",
      "Yes, usually by a factor of about three. A heat pump moves heat from outdoors instead of generating it, delivering roughly 3 kWh of warmth per kWh drawn, so heat that costs ₹86 a day on a resistive heater costs about ₹29 on a reverse-cycle AC. The advantage shrinks as the outdoor temperature falls, and disappears in genuinely freezing conditions.",
    ],
    [
      "Can I run two room heaters on one circuit?",
      "Usually not safely. Two 2000 W heaters draw about 17 A at 230 V, which is at or above the rating of a typical 16 A domestic circuit and well above a 6 A lighting socket. Put high-wattage heaters on separate 16 A power circuits and never run one through an extension cord rated below its load.",
    ],
  ],
};

export default seo;
