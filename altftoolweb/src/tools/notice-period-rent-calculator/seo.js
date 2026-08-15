const seo = {
  title: "Notice Period Rent Calculator with Lock-In",
  metaDescription:
    "Price the unserved days when you vacate early. Takes the later of notice end and lock-in end, then sets the shortfall against your deposit.",
  steps: [
    "Enter \"Monthly rent (INR)\", \"Notice period in the agreement (months)\", \"Date you served written notice\" and \"Date you hand over the keys\".",
    "Add \"Lock-in period (months)\" (leave it at 0 if there is no lock-in), \"Date the agreement started\" and \"Security deposit held (INR)\", and set \"Daily rent basis\" to \"30-day month\" or \"Actual days (x12 / 365)\".",
    "Read \"Rent still owed\" with the days-short line, then the \"Notice period ends\", \"Lock-in ends\", \"Rent runs to\", \"Adjusted against the deposit\", \"Deposit coming back\" and \"Balance still to pay\" rows; press \"Copy result\" or Reset.",
  ],
  intro:
    "This calculator works out the rent still payable when a tenant vacates before the notice period has run out, by counting the days between the handover date and the date the tenancy actually ends and pricing them at the daily rent. Where a lock-in is still running it takes the later of the lock-in end date and the notice end date, which is the point most people get wrong. It then applies the deposit and shows the balance to pay or the deposit coming back, so landlord and tenant can settle from one sheet.",
  useCases: [
    "Serving two months' notice on 1 August but needing to leave on 31 August, and pricing the 31 unserved days.",
    "Checking whether an 11-month lock-in still binds after notice has been properly served four months in.",
    "Setting off the shortfall against a Rs 60,000 deposit to see exactly what should be refunded on handover.",
  ],
  benefits: [
    ["Lock-in handled correctly", "Takes the later of the notice end and the lock-in end, instead of assuming notice always wins."],
    ["Exact day counting", "Uses real calendar dates with leap years and month-end clamping, not a rough month estimate."],
    ["Deposit settlement", "Shows the amount adjusted, the balance still payable and the deposit that should come back."],
  ],
  faqs: [
    [
      "Do I have to pay rent for the notice period if I move out early?",
      "Yes, in almost every agreement. Notice ends the tenancy on a fixed future date, so vacating earlier ends your occupation but not your rent liability for the unserved days. On Rs 30,000 rent and 31 unserved days at a 30-day month, that is Rs 31,000, which the landlord will normally adjust against the deposit.",
    ],
    [
      "What happens if I leave during the lock-in period?",
      "The lock-in overrides notice. Rent runs to the end of the lock-in even where notice was served correctly, so the liability ends on whichever date is later. That is why a lock-in of eleven months on an eleven-month agreement effectively removes the right to leave early.",
    ],
    [
      "How is pro-rata rent calculated for a part month?",
      "Either monthly rent divided by 30, which is the usual contractual shorthand, or monthly rent times 12 divided by 365, which is calendar-accurate. Rs 30,000 a month works out to Rs 1,000 a day on the first basis and Rs 986.30 on the second, so check which one your agreement specifies.",
    ],
    [
      "Can a landlord keep the whole deposit if I leave early?",
      "Only up to the rent and dues actually owed. The deposit secures the tenant's liabilities, so anything above the unserved rent, unpaid bills and damage beyond normal wear and tear must be refunded. If more is being held back, ask for an itemised statement in writing and take legal advice before conceding it.",
    ],
  ],
};

export default seo;
