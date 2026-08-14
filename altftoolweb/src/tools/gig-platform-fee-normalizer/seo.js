const seo = {
  title: "Gig Platform Fee Calculator: Real Pay Per Hour",
  metaDescription:
    "Compare gig offers on effective pay per hour after the platform fee %, travel and expenses, a tax reserve, and your unpaid admin hours.",
  steps: [
    "In the 'Gig offers' box put one offer per line as Platform | gross | fee % | travel/expenses | paid hours | unpaid admin hours — for example Platform A | 5000 | 15 | 300 | 6 | 2.",
    "Set 'Estimated withholding / tax reserve (%)', which defaults to 10, or press the 'Two platforms' example chip to load a worked pair of offers.",
    "Read the headline naming the platform with the highest effective rate, the reserve-assumption caption and the table columns Platform, Gross, Fee, Expenses, Total hours, Net after reserve and Effective/hour sorted best first; Download saves it as gig-platform-fee-normalizer.txt.",
  ],
  intro:
    "The Gig Platform Fee Normalizer compares competing gig offers on one honest number — effective pay per hour, calculated as (gross − platform fee % of gross − travel and expenses) × (1 − tax reserve), divided by paid hours plus unpaid admin hours. You enter one line per platform as Platform | gross | fee % | travel/expenses | paid hours | unpaid admin hours, and it ranks every offer from the highest effective rate down. It is for freelancers and gig workers choosing between marketplaces whose headline rates look similar until commission, travel and unpaid prep are counted.",
  useCases: [
    "Platform A offers 5,000 at a 15% commission with 300 of travel for 6 paid hours plus 2 hours of admin, Platform B offers 4,600 at 8% with 150 travel for 5 paid hours plus 1.5 admin — you want to know which one actually pays more per hour.",
    "You are deciding whether to keep accepting jobs from a marketplace that takes a fifth of every booking, or move clients to a lower-commission channel that involves more travel.",
    "You are setting your own direct rate and need to know what hourly figure a platform gig really nets you, so your quote does not undercut the work you already have.",
  ],
  benefits: [
    [
      "Counts the hours you are not paid for",
      "Total hours is paid hours plus unpaid admin hours, so messaging, quoting and paperwork drag the effective rate down the way they do in real life.",
    ],
    [
      "Commission modelled as a percentage of gross",
      "The platform fee is taken as a share of the gross amount, matching how marketplace take rates actually work, and it appears as its own column so you can see the cash value.",
    ],
    [
      "Ranks the offers for you",
      "Rows are sorted by effective rate per hour and the headline names the winner, so a lower-gross offer with light fees can visibly beat a bigger one.",
    ],
  ],
  faqs: [
    [
      "How does it work out effective hourly pay?",
      "It subtracts the platform fee (fee % × gross) and your travel and expenses from the gross, applies your tax reserve percentage to what is left, then divides by paid hours plus unpaid admin hours. The reserve defaults to 10% and is shown alongside the result so you know which assumption produced the ranking.",
    ],
    [
      "Why should unpaid admin hours be included?",
      "Because they are hours the gig consumes even though nobody pays for them, and leaving them out flatters high-friction platforms. A 5,000 job billed as 6 hours but needing 2 hours of quoting and follow-up is really a 8-hour job, which cuts the effective rate by a quarter before any fee is applied.",
    ],
    [
      "What line format do the offers use?",
      "One offer per line with pipe separators, in the order Platform | gross | fee % | travel/expenses | paid hours | unpaid admin hours — for example Platform A | 5000 | 15 | 300 | 6 | 2. Blank or non-numeric fields count as zero, and total hours are floored at 0.01 so an empty hours field cannot produce a nonsense rate.",
    ],
    [
      "Does the tax reserve figure tell me what I owe?",
      "No. It is a flat percentage you choose to hold back from after-fee earnings so offers are compared on spendable income; it is not a tax computation. Your real liability depends on total income, deductible expenses and local rules, so use this for comparison and confirm the actual number with a tax professional.",
    ],
  ],
};

export default seo;
