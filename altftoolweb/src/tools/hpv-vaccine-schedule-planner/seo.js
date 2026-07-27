const seo = {
  intro:
    "The number of HPV vaccine doses depends on one thing: whether the series was started before the 15th birthday. Started earlier, it is a 2-dose schedule at 0 and 6-12 months with a minimum 5-month gap; started at 15 or later, or in anyone immunocompromised, it is a 3-dose schedule at 0, 1-2 and 6 months. This planner applies the ACIP interval rules to a date of birth and a first-dose date, and returns each appointment date alongside the earliest date that dose can validly be given.",
  useCases: [
    "Booking the second appointment for a 12-year-old who had dose one in July and needs it at least five months later",
    "Checking whether a 16-year-old starting the series now needs two doses or three",
    "Finding out whether a second dose given only three months after the first means a third dose is required",
  ],
  benefits: [
    ["Applies the age-15 rule", "Picks the 2-dose or 3-dose schedule automatically from the date of birth."],
    ["Minimum intervals shown", "Every dose lists its earliest valid date, not just the ideal one."],
    ["Catch-up aware", "Flags when an early second dose converts a 2-dose series into a 3-dose one."],
  ],
  faqs: [
    [
      "How many HPV vaccine doses do I need?",
      "Two if the first dose was given before your 15th birthday, three if it was given at 15 or older. Anyone with an immunocompromising condition, including HIV infection, gets three doses whatever their age at the first dose.",
    ],
    [
      "What is the gap between HPV vaccine doses?",
      "On the 2-dose schedule the second dose comes 6 to 12 months after the first, with a minimum interval of 5 months. On the 3-dose schedule the doses fall at 0, 1-2 and 6 months, with minimum intervals of 4 weeks between doses 1 and 2, 12 weeks between doses 2 and 3, and 5 months between doses 1 and 3.",
    ],
    [
      "What happens if I miss an HPV dose or the gap is too long?",
      "The series is resumed, not restarted — earlier doses still count no matter how long the delay. There is no maximum interval that invalidates a dose, so a second dose two years late still completes a 2-dose series.",
    ],
    [
      "Can adults get the HPV vaccine?",
      "Yes, it is licensed through age 45, but for adults aged 27 to 45 it is a shared clinical decision rather than a routine recommendation, because many people have already been exposed to the common HPV types by then. Discuss the likely benefit with your doctor.",
    ],
  ],
};

export default seo;
