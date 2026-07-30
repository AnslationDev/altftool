const seo = {
  intro:
    "The Battery Health and Lifespan Predictor estimates how much capacity a lithium battery has likely lost by starting at 100 percent and subtracting modelled penalties for age, heat, charging habits, depth of discharge and workload, then projecting that curve out 3, 6 and 12 months. It is for anyone deciding whether a phone, laptop, EV or power bank is worth keeping, and it also plots a second curve showing where the same device would land on gentler habits. This is a habit-based model, not a reading taken from the battery's own controller, so treat the number as a planning estimate rather than a diagnostic.",
  useCases: [
    "Your two-year-old phone dies by mid-afternoon and you want to know whether a battery replacement will actually fix it or whether the screen-on time was always going to be this short.",
    "You have kept a laptop permanently plugged in at a desk for three years and want to see how much that high state-of-charge habit alone is estimated to have cost you.",
    "You are buying a used EV and want a sense of what 40 km a day, weekly DC fast charging and charging to 100 percent typically imply for remaining pack capacity.",
  ],
  benefits: [
    ["A penalty breakdown, not just a score", "Every deduction is itemised — age, heat, cycles, charging depth, fast charging — so you can see which habit is doing the damage."],
    ["Two futures on the same chart", "Your current trajectory is plotted next to a best-practice version of the same device, so the payoff from changing habits is visible."],
    ["Device-specific cycle budgets", "Phones, laptops, EVs and power banks each carry their own expected cycle count and service life instead of one generic curve."],
  ],
  faqs: [
    [
      "How is the health percentage calculated?",
      "It starts at 100 percent and subtracts weighted penalties for the inputs you provide. For a phone that means roughly 0.12 points per month of age, a screen-time penalty scaled by battery capacity, up to 3 points for high heat, up to 3 for frequent fast charging, 2 for habitual full 0-100 cycles and 0.8 for routine overnight charging. The result is clamped to a 5-100 range.",
    ],
    [
      "What counts as a good, fair or poor battery here?",
      "80 percent or higher is reported as Good, 60 to 79 as Fair, and below 60 as Poor. The 80 percent line matters because it is the industry convention for a battery's rated end of useful life, and most manufacturer warranties are written around it.",
    ],
    [
      "How many charge cycles should my device last?",
      "The model uses 500 cycles for phones and tablets, 800 for laptops, 1,500 for EV cars, 1,000 for electric scooters, and 300 for UPS units and power banks, each measured as cycles to roughly 80 percent capacity. Estimated cycles used are subtracted from that budget to show what is left.",
    ],
    [
      "Is this as accurate as my device's own battery health readout?",
      "No. Your phone or laptop reports coulomb-counted data from the battery's own management chip; this tool infers wear from self-reported habits, so it is best used to compare scenarios and spot which habits cost the most. For a warranty claim or a repair decision, rely on the manufacturer's diagnostic instead.",
    ],
  ],
};

export default seo;
