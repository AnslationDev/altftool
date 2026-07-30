const seo = {
  intro:
    "This optimizer works out the cheapest way to split an EV charging session across time-of-use tariff windows: it converts the energy you need at the battery into grid energy by dividing by your charging efficiency, turns that into hours at your charger's kW rating, then fills the cheapest priced window first and spills into the next cheapest until the hours are used up. It is for anyone on a TOU or day/night electricity tariff who wants to know what a full charge actually costs and whether it fits inside the off-peak block.",
  useCases: [
    "You have a 7.2 kW home charger and an off-peak window from midnight to 6am, and need to know whether a 45 kWh top-up fits inside it or spills into peak rates",
    "Comparing a proposed TOU tariff against your current flat rate by entering both sets of windows and seeing the cost for a typical week's charging",
    "Setting the departure timer in a car or wallbox app and wanting to know which hours to schedule so the session stays on the cheap rate",
  ],
  benefits: [
    ["Charging losses are counted", "Energy is grossed up from the battery figure by your efficiency percentage, so the cost is based on the kWh the meter records, not the kWh the car receives."],
    ["Cheapest-window-first allocation", "Windows are sorted by price and filled in order, so the split shown is the lowest-cost arrangement of the hours you actually need."],
    ["Tells you when it does not fit", "If the session is longer than the windows you entered, the leftover hours are reported rather than quietly priced at the last rate."],
  ],
  faqs: [
    [
      "How do I work out the energy I need?",
      "Take the percentage of the pack you want to add and multiply by usable capacity — adding 60% to a 75 kWh pack is about 45 kWh at the battery. Enter that figure; the grid energy, which is what you pay for, is calculated from it using your efficiency setting.",
    ],
    [
      "What charging efficiency should I use?",
      "AC home charging typically lands between 85% and 92%, so 90% is a reasonable default; lower it in cold weather, when battery preconditioning and cabin heating draw extra power that never reaches the cells. At 90% efficiency, 45 kWh at the battery means 50 kWh through the meter.",
    ],
    [
      "How long does a full charge take on a 7 kW home charger?",
      "Divide grid energy by charger power: 50 kWh of grid energy at 7.2 kW is about 6.9 hours. Real sessions run a little longer because charging tapers near the top of the pack, and because the car may be limited by its onboard charger rather than by the wallbox.",
    ],
    [
      "Will this match my electricity bill exactly?",
      "Not exactly. It prices energy at the per-kWh rates you enter and assumes charging runs at full power for the whole session, so standing charges, taxes, demand charges, tapering above roughly 80% state of charge and any smart-charging pauses are not included. Check your supplier's tariff terms for the definitive rates and window times.",
    ],
  ],
};

export default seo;
