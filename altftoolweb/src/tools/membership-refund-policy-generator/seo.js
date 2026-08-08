const seo = {
  title: "Gym Membership Refund Policy Generator + Pro-Rata",
  metaDescription:
    "Price a cancellation from unused days over term days, with frozen days excluded and GST returned only on the refunded slice, then draft the policy.",
  steps: [
    "Under 'Price one cancellation', enter Plan fee excluding GST (INR), Joining fee excluding GST (INR), Membership starts, Membership ends, Cancellation effective from, Days already frozen, GST on membership (%) and a Reason for leaving.",
    "In 'Policy rules', set Lock-in (days, 0 for none), Notice period (days), Cancellation charge (% of refund) and 'Cap on that charge (INR, 0 = none)', alongside the gym or club name and the freeze and transfer rules.",
    "Read 'Refund due to the member' with its Pro-rata plan refund, Cancellation charge deducted, GST returned, Club retains and 'End date after freezes' rows, then press Copy policy to take the drafted wording.",
  ],
  intro:
    "The Membership Refund Policy Generator drafts the cancellation, freeze and transfer terms for a gym, studio or club, and prices a real cancellation using the pro-rata rule: plan fee multiplied by unused days divided by total days in the term. Days spent on a freeze are treated as suspended rather than consumed, so they never reduce the refund, and GST is returned only on the refunded slice in line with CBIC Circular No. 178/10/2022-GST. It is aimed at owners and front-desk teams who need one written answer that applies to every member.",
  useCases: [
    "Work out what a member owes back six months into a 12-month plan after a 30-day medical freeze.",
    "Decide whether a 90-day lock-in with a 10% exit charge is worth the disputes it will generate, and see the rupee effect before committing.",
    "Write the freeze rules down — allowance per year, minimum block, how the end date moves — so no two staff members answer differently.",
    "Set out how a doctor-certified medical exit or a branch closure is handled, where the exit charge should not apply at all.",
  ],
  benefits: [
    ["Pro-rata, not guesswork", "Refunds follow unused days over term days, the calculation a consumer forum will expect to see."],
    ["Freeze handled correctly", "Frozen days extend the end date and are excluded from used days, so members are not charged twice for the same pause."],
    ["Flags risky terms", "Lock-ins over six months and exit charges that consume the whole refund trigger a warning before you publish them."],
  ],
  faqs: [
    [
      "How is a pro-rata gym membership refund calculated?",
      "Multiply the plan fee by the unused days and divide by the total days in the term. On a Rs 36,500 annual plan running 1 January to 31 December, a cancellation on 1 July leaves 184 unused days of 365, so the pro-rata refund is Rs 18,400 before any cancellation charge.",
    ],
    [
      "Can a gym refuse a refund because of a lock-in period?",
      "A lock-in disclosed before payment is a contract term, but it is not unchallengeable. Section 2(46) of the Consumer Protection Act 2019 lets a consumer commission examine a term that imposes an unreasonable condition putting the consumer at a disadvantage, and a lock-in never protects a club that itself closes, relocates or withdraws the facility.",
    ],
    [
      "Is GST refunded when a membership is cancelled part way through?",
      "GST comes back only on the amount actually refunded. Fitness and health club services (SAC 999723) are generally taxed at 18%, and under CBIC Circular No. 178/10/2022-GST dated 3 August 2022 any cancellation charge the club keeps is itself taxed at that same rate, so that tax stays with the government.",
    ],
    [
      "Should frozen days count against the membership term?",
      "No. A freeze suspends the entitlement, so the end date should move forward by exactly the number of days frozen and those days should not be counted as used when a refund is worked out. Writing that rule into the policy, along with the yearly allowance and minimum freeze block, prevents most membership disputes. This is general information, not legal advice.",
    ],
  ],
};

export default seo;
