const seo = {
  intro:
    "The DOT Tire Identification Number moulded into a tyre's sidewall ends in a date code, and this decoder turns that code into a manufacture date and an exact age. Four digits mean week then two-digit year for anything built from 2000 onwards — 3624 is week 36 of 2024 — while a three-digit code marks a tyre made before 2000. From that date the tool derives the age in years and days, the point at which annual professional inspection is advised, and the ten-year mark most tyre manufacturers name as the limit.",
  useCases: [
    "Checking how long a 'brand new' tyre has actually been sitting in the retailer's rack before you pay for it.",
    "Auditing the spare wheel in a used car, which often carries the oldest tyre on the vehicle.",
    "Dating tyres on a caravan, trailer or seasonal vehicle that ages far faster than it wears.",
  ],
  benefits: [
    ["Reads the whole TIN", "Paste the full DOT number or just the last four digits — the date group is found either way."],
    ["Exact age, not a guess", "Age is returned in years, months and days from the production week, against any reference date you choose."],
    ["Both service milestones", "Shows the 6-year inspection point and the 10-year replacement limit as calendar dates."],
  ],
  faqs: [
    [
      "How do I read the DOT code on a tyre?",
      "Find the DOT number on the sidewall and read the last group of digits. Four digits are week then year: 3624 means week 36 of 2024, roughly the first week of September that year. Three digits mean the tyre was made before 2000 and the code alone cannot tell you the decade. The full code appears on only one sidewall, so check both sides.",
    ],
    [
      "How old is too old for a tyre?",
      "Many vehicle manufacturers ask for tyres over six years old to be inspected annually, and most tyre manufacturers name ten years from the date of manufacture as the absolute limit regardless of tread depth. Neither figure is a legal limit — the legal test in India, the EU and the UK is 1.6 mm minimum tread depth plus overall condition.",
    ],
    [
      "Should I refuse a new tyre with an old date code?",
      "A tyre stored properly does not start ageing meaningfully until it is fitted and loaded, so a code up to about two years old is common and generally accepted as new stock. Beyond that it is reasonable to ask for a fresher set or a discount, because the ten-year clock runs from manufacture, not from the day you bought it.",
    ],
    [
      "Does the spare tyre age too?",
      "Yes. An unused spare ages by the same calendar clock even with full tread, which is why the spare is often the oldest tyre on a used vehicle. Check its DOT code as well as the four on the road, and keep it inflated — a space-saver is normally placarded at 60 psi.",
    ],
  ],
};

export default seo;
