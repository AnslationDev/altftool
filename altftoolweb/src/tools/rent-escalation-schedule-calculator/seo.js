const seo = {
  intro:
    "The Rent Escalation Schedule Calculator projects the rent payable in every year of a lease from a base rent and an escalation clause, using rent = base x (1 + p/100)^step for a percentage clause and rent = base + (amount x step) for a fixed-amount clause, where step counts how many escalation intervals have elapsed. It returns a year-by-year schedule, the total rent over the term, the average monthly rent and the effective compound annual rise, so a 'Rs 3,000 every two years' clause can be compared like for like with '5% every year'. Useful to tenants and landlords sanity-checking a draft lease before signing.",
  useCases: [
    "Check the total rent over a five-year commercial lease with 5% annual escalation before committing to the term.",
    "Compare a landlord's 15% every three years against your counter-offer of 5% every year, which compounds differently.",
    "Work out the cash value of a two-month rent-free fit-out period and where it sits in the year-one total.",
  ],
  benefits: [
    ["Compounding shown honestly", "Percentage escalations compound on the previous rent, so after eight annual 5% steps the rent sits 47.7% above the base, not 40%."],
    ["Partial years handled", "The schedule is built month by month, so a 30-month or 42-month term ends with a correct part-year row."],
    ["Like-for-like comparison", "Converts a flat-rupee step into an effective compound annual percentage so two clauses can be compared directly."],
  ],
  faqs: [
    [
      "How is rent escalation calculated in a lease?",
      "For a percentage clause, each step multiplies the previous rent: rent = base x (1 + p/100) raised to the number of completed escalation intervals. For a fixed-amount clause, the same rupee figure is added at each step. A 5% annual escalation on a base of Rs 50,000 gives Rs 52,500 in year two and Rs 55,125 in year three, because the second increase applies to the already-increased rent.",
    ],
    [
      "What is a typical rent escalation clause in India?",
      "Residential leases commonly step rent by 5% to 10% at each renewal, usually every 11 months, while commercial leases more often use 15% every three years or 5% a year. The figure is a matter of negotiation rather than statute, and rent-controlled premises in some states are subject to separate limits under the applicable Rent Control Act.",
    ],
    [
      "Is 5% every year the same as 15% every three years?",
      "No. Compounding 5% three times gives 15.76%, slightly more than a single 15% step, and the annual clause also raises the rent sooner, which increases total outgo further. By lease year nine — eight annual steps against two triennial steps — the 5% clause stands 47.7% above the base rent while 15% every three years stands 32.3% above it.",
    ],
    [
      "Does a rent-free period reduce the escalation?",
      "No. A rent-free fit-out period waives the rent for those months but does not change the escalation schedule, which continues to run from the lease commencement date. That means the base rent used for the first escalation is the contract rent, not the discounted average. This tool is for estimation only; the lease deed governs, so have it reviewed before signing.",
    ],
  ],
};

export default seo;
