const seo = {
  intro:
    "This calculator counts the working days between two dates by walking the calendar one day at a time and keeping every Monday through Friday, discarding Saturday and Sunday. Both the start date and the end date are counted, so a Monday-to-Friday range returns 5 business days, not 4. Alongside the working-day figure it shows the total calendar days in the range and how many of those were weekend days.",
  useCases: [
    "A contract says payment is due within 30 business days of invoicing and you want the actual calendar date that lands on",
    "You are checking whether a two-week holiday will really cost you ten days of leave once the weekends inside it are removed",
    "A supplier quoted \"15 working days\" for delivery and you need to tell a customer the honest ship-by date rather than counting 15 days forward",
  ],
  benefits: [
    [
      "Counts both endpoints",
      "The start and end dates are both included, which matches how contracts, notice periods and delivery windows are normally written.",
    ],
    [
      "Shows the weekend breakdown",
      "You get total calendar days and weekend days beside the working-day count, so it is obvious where the difference came from.",
    ],
    [
      "Rejects backwards ranges instead of guessing",
      "If the end date falls before the start date, or either date is unreadable, it says so rather than returning a negative or zero count you might not notice.",
    ],
  ],
  faqs: [
    [
      "Does this include the start and end dates?",
      "Yes, both are counted if they fall on a weekday. That is why 1 June to 30 June is measured as 30 calendar days rather than 29, and why a single weekday selected as both start and end returns 1 business day.",
    ],
    [
      "Does it account for public holidays?",
      "No — it removes Saturdays and Sundays only. Public and bank holidays vary by country, state and even by employer, so if your deadline depends on them, subtract them yourself: a range covering two public holidays that both fall on weekdays gives you two fewer working days than shown here.",
    ],
    [
      "How many business days are in a year?",
      "A common year of 365 days contains 260 or 261 weekdays depending on which day of the week 1 January falls on, and a leap year contains 261 or 262. Subtract your own country's public holidays from that to get actual working days.",
    ],
    [
      "What counts as a business day here?",
      "Any Monday, Tuesday, Wednesday, Thursday or Friday in the range. Saturday and Sunday are excluded outright, so if your workweek runs Sunday to Thursday or includes Saturday, the count will not match your schedule.",
    ],
  ],
};

export default seo;
