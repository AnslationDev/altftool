const seo = {
  title: "Kitchen Chimney Cleaning Schedule Calculator",
  metaDescription:
    "Sets your filter-cleaning interval from hours cooked, frying intensity and burners, dates the next cleans, and sizes suction by the 10-20 ACH rule.",
  steps: [
    "Pick your Filter type and Cooking style, then enter Cooking hours a day under the hood, Burners usually running and Filters last cleaned on.",
    "Add the kitchen's Length, Width and Ceiling height (ft) plus the Rated suction (m³/hr) so the required airflow is checked against your chimney.",
    "Read the Clean the filters every N days verdict with the next due date, charcoal/service/duct intervals and yearly DIY vs outsourced cost; Copy plan exports it.",
  ],
  intro:
    "The Chimney Cleaning Planner sets your kitchen chimney's filter-cleaning interval from the grease it actually collects rather than from a fixed calendar rule. It measures cooking load as hours a day multiplied by frying intensity and burners running under the hood, divides that into the filter's grease capacity, and schedules filter cleans, charcoal replacement, deep service and duct cleaning. It also sizes the required suction from your kitchen's volume using the 10–20 air-changes-per-hour rule.",
  useCases: [
    "Finding out that heavy daily frying on three burners means fortnightly baffle cleaning, not the monthly rule in the manual",
    "Deciding whether soaking filters at home is worth it, by comparing the yearly DIY and fully outsourced costs",
    "Checking before you buy whether an 850 m³/hr chimney is enough for a 12 × 10 ft kitchen with heavy cooking",
  ],
  benefits: [
    ["Interval from your cooking", "Two homes with the same chimney get different schedules because they fry different amounts."],
    ["Dated schedule", "Enter the last clean and get the next six dates you can put straight into a calendar."],
    ["Suction sanity check", "Kitchen volume, air changes and the manufacturer minimum are combined into one number to compare against the spec sheet."],
  ],
  faqs: [
    [
      "How often should kitchen chimney filters be cleaned?",
      "Baffle filters need cleaning roughly every 30 days at typical Indian cooking loads of about 1.5 hours a day on two burners, dropping to about 19 days with heavy frying at the same hours and burners. Aluminium mesh or cassette filters clog twice as fast, and a filterless model's oil collector cup needs emptying every 30–40 days.",
    ],
    [
      "How do I clean a baffle filter at home?",
      "Soak the plates for 20–30 minutes in very hot water with caustic soda, dishwasher powder or a strong degreaser, then brush along the channels and rinse. Switch the chimney off at the wall first, let the filters cool, wear gloves with caustic soda, and refit only when completely dry.",
    ],
    [
      "What suction power do I need for an Indian kitchen?",
      "Size it so the hood replaces the kitchen's air 10–20 times an hour depending on how much you fry, subject to a practical floor of about 800 m³/hr for regular Indian cooking and 1,000 m³/hr for heavy frying. For a 10 × 8 × 10 ft kitchen the air-change figure works out around 340 m³/hr, so the practical minimum governs.",
    ],
    [
      "How often do charcoal filters need replacing?",
      "About every six months at typical loads, and sooner with heavy frying. Charcoal filters only exist in ductless recirculating chimneys, where they absorb odour instead of exhausting it, and they cannot be washed and reused — a spent set simply stops removing smell.",
    ],
  ],
};

export default seo;
