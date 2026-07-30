const seo = {
  intro:
    "This estimator compares the annual running cost of a heat pump against a fuel furnace by dividing your yearly useful heat need by each system's efficiency — the seasonal COP for the heat pump, the seasonal efficiency percentage for the furnace — and pricing the resulting energy at your own electricity and fuel tariffs. It reports both annual bills, the gap between them, and the break-even COP at which the heat pump stops being cheaper. It is for homeowners and installers weighing a heating swap who want the arithmetic on their own numbers rather than a generic claim.",
  useCases: [
    "You have a quote for an air-source heat pump and want to know whether its rated seasonal COP beats your current gas bill at today's electricity price.",
    "Your electricity tariff is about to rise and you want to check how far the COP would have to climb for the heat pump to stay ahead.",
    "You are comparing a 90% furnace with a condensing model and want the fuel input difference on the same annual heat demand.",
  ],
  benefits: [
    ["Efficiency handled properly", "Heat delivered is divided by COP for the pump and by seasonal efficiency for the furnace, so you compare energy bought, not energy used."],
    ["Break-even COP, not just a winner", "It shows the exact COP at which the two systems cost the same, which is the number a quote should be judged against."],
    ["Standing charges included", "Separate annual fixed-cost fields for each system so connection or standing charges do not distort the comparison."],
  ],
  faqs: [
    [
      "How do I compare heat pump and furnace running costs?",
      "Divide your annual heat need by each system's efficiency, then multiply by its energy price. A 12,000 kWh heat demand at a seasonal COP of 3.2 needs 3,750 kWh of electricity; the same demand from a 90% efficient furnace needs 13,333 kWh of fuel input. Whichever product of energy and tariff is smaller wins, once any fixed annual charges are added.",
    ],
    [
      "What is COP and what is a realistic value?",
      "COP is coefficient of performance — the units of heat delivered per unit of electricity consumed, so a COP of 3.2 means 3.2 kWh of heat per 1 kWh of electricity. Use a seasonal figure rather than a lab rating: COP falls as outdoor temperature drops and during defrost cycles, so a system rated highly at mild conditions can average considerably less across a cold winter.",
    ],
    [
      "At what electricity-to-fuel price ratio does a heat pump win?",
      "Roughly, the heat pump is cheaper when the electricity price divided by the fuel price is less than the COP divided by the furnace efficiency. With a COP of 3.2 and a 90% furnace, that ratio is about 3.6, so electricity can cost up to about 3.6 times as much per kWh as fuel before the furnace becomes cheaper to run. The break-even COP row gives the same answer from the other direction.",
    ],
    [
      "Does this tell me whether a heat pump will heat my home?",
      "No — this is a running-cost comparison only. Sizing depends on a proper heat-loss calculation, design outdoor temperature, capacity at that temperature, defrost behaviour, whether your emitters and ducts suit lower flow temperatures, and any backup heat. Installation cost, maintenance, tariffs and emissions factors are also outside this estimate, so use a qualified installer's survey before committing.",
    ],
  ],
};

export default seo;
