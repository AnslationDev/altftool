const seo = {
  title: "Proportionate Rent Calculator: Pro-Rata Part Months",
  metaDescription:
    "Pro-rate rent for a move-in or move-out part month by actual days, a 30-day month or a 365-day year, with a month-by-month breakdown.",
  steps: [
    "Enter 'Monthly rent (INR)' and 'Monthly maintenance (INR)', then set 'First day of occupation' and 'Last day of occupation' in the two date pickers.",
    "Choose the 'Apportionment method in the lease' — 'Actual days in the month', '30-day month' or '365-day year (366 in a leap year)' — and the formula for that convention appears under the select.",
    "Read 'Total payable' with 'Rent for the period', 'Average daily rent', 'Full months billed in full' and 'Part months apportioned', check the 'Month-by-month breakdown' table, then press 'Copy result'.",
  ],
  intro:
    "The Proportionate Rent Calculator apportions rent for a part month on move-in or move-out, using rent x days occupied / days in that calendar month, or a 30-day month, or a 365-day year, whichever convention the lease specifies. Whole calendar months always bill the full monthly rent, so only the first and last part months are apportioned. It shows the daily rate, a month-by-month breakdown and the same period priced by all three conventions, so a landlord and tenant can see exactly where a disputed figure comes from.",
  useCases: [
    "Work out the first month's rent when a tenancy starts on the 16th and the landlord bills from the move-in date.",
    "Settle the closing invoice when a tenant vacates mid-month, and check it against the security deposit adjustment.",
    "Compare what the lease's 30-day convention costs against actual days for a February move-in, where the gap is widest.",
  ],
  benefits: [
    ["All three conventions", "Prices the same dates by actual days, a 30-day month and a 365-day year so a disputed figure can be traced."],
    ["Full months stay whole", "A month occupied end to end bills one month's rent, avoiding the common spreadsheet error of billing 28/30ths for February."],
    ["Leap years handled", "February 2028 is treated as 29 days, and the 365-day method switches to 366 in a leap year."],
  ],
  faqs: [
    [
      "How do you calculate pro-rata rent for a partial month?",
      "The most common method multiplies the monthly rent by the number of days occupied and divides by the number of days in that calendar month. On a rent of Rs 30,000 with occupation from 16 to 31 January, that is 30,000 x 16 / 31 = Rs 15,483.87. Both the first and last day of occupation are normally counted.",
    ],
    [
      "Should a part month be divided by 30 days or by the actual days in the month?",
      "It depends on what the lease says, and the difference is real. For 16 days of occupation on a Rs 30,000 rent, a 30-day divisor gives Rs 16,000 while the 31 actual days of January give Rs 15,483.87 — about Rs 516 apart. Indian and UK tenancies usually use actual days; many US leases specify a 30-day month. Check the clause before arguing about the number.",
    ],
    [
      "Does a tenant pay full rent for February even though it is short?",
      "Yes, if they occupy the whole month. A calendar month occupied from the first day to the last bills one month's rent regardless of whether it has 28, 29, 30 or 31 days. Apportionment only applies to the part months at the start and end of the tenancy.",
    ],
    [
      "Can a landlord charge full month's rent for a mid-month move-out?",
      "Only if the tenancy agreement says so. Many leases require a full month's notice ending on a rent day, in which case rent runs to the end of the notice period rather than the move-out date, and that is a contractual matter rather than a calculation one. This tool computes the apportionment; the lease and any applicable rent control legislation determine which dates apply, so take advice if the amount is disputed.",
    ],
  ],
};

export default seo;
