const seo = {
  intro:
    "This calculator sizes a bathroom or kitchen extractor fan using the air-change method — airflow equals room volume multiplied by the air changes per hour required for that room type — and then checks the answer against the Home Ventilating Institute rules and the ASHRAE 62.2 local-exhaust minimums of 50 CFM for a bathroom and 100 CFM for a vented range hood. It adds a duct-resistance allowance of about 2% per metre of run and 5% per 90-degree bend, then returns the fan rating, fan body size and round duct diameter at a 4.5 m/s design velocity. Useful for anyone specifying an extractor for a renovation and choosing between a 100 mm and a 150 mm unit.",
  useCases: [
    "Checking whether a 100 mm bathroom fan is actually big enough for a 2.4 × 1.8 m shower room with a 3 m duct run",
    "Sizing a kitchen extractor when the room is small enough that the ASHRAE 100 CFM minimum governs instead of the air-change figure",
    "Working out the duct diameter before cutting a wall, so the fan is not throttled by an undersized 100 mm outlet",
  ],
  benefits: [
    [
      "Two rules cross-checked",
      "Reports the air-change result and the HVI or code minimum side by side and tells you which one governs.",
    ],
    [
      "Duct losses included",
      "A long run with several bends can need 15-25% more fan than the bare room calculation suggests.",
    ],
    [
      "Both unit systems",
      "Enter metres or feet and read the answer in CFM and m³/h, with fan and duct sizes in mm and inches.",
    ],
  ],
  faqs: [
    [
      "What size exhaust fan do I need for my bathroom?",
      "Multiply the room volume by 8 air changes per hour, then take at least 50 CFM. A 2.4 × 1.8 × 2.7 m bathroom is 11.7 m³, which at 8 ACH is 93 m³/h or about 55 CFM — so a 50 CFM fan is marginal and a 100 mm unit with a short duct is the practical choice.",
    ],
    [
      "How do I convert CFM to m³/h for a fan?",
      "Multiply m³/h by 0.5886 to get CFM, or multiply CFM by 1.699 to get m³/h. A fan advertised at 100 CFM moves about 170 m³/h, which is why European and North American spec sheets for the same fan look so different.",
    ],
    [
      "Does duct length reduce exhaust fan performance?",
      "Yes, substantially. Allow roughly 2% of airflow per metre of straight duct and 5% for each 90-degree bend, so a 6 m run with three bends needs about 27% more rated airflow than the room calculation alone. Flexible duct is worse than rigid, and a crushed or sagging flex run can halve delivery.",
    ],
    [
      "How many air changes per hour does a kitchen need?",
      "About 15 ACH for a domestic kitchen, against 8 ACH for a bathroom and 6 ACH for a garage or general room. ASHRAE 62.2 also sets a floor of 100 CFM for an intermittently used vented range hood, which governs in small kitchens where 15 ACH alone would give a lower figure.",
    ],
  ],
};

export default seo;
