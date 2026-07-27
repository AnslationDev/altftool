const seo = {
  intro:
    "An EWS certificate requires two things at once: the family's gross annual income must be below ₹8 lakh, and the family must not own any of four listed properties — 5 acres of agricultural land, a 1,000 sq ft flat, a 100 sq yard plot in a notified municipality, or a 200 sq yard plot elsewhere. This checker applies both tests as they are written in the Department of Personnel and Training memorandum of 31 January 2019, including the rule that property in different cities is clubbed together first. Area fields accept acres, hectares, square feet, square yards or square metres.",
  useCases: [
    "A candidate applying under the 10% EWS quota checking whether a family plot in another district pushes them over the exclusion.",
    "A family adding up salary, agricultural and rental income to see how much room is left under the ₹8 lakh limit.",
    "Someone whose land papers are in hectares converting to acres before comparing against the 5-acre exclusion.",
  ],
  benefits: [
    ["Both tests, not just income", "Runs all four asset exclusions alongside the income limit, since any one of them disqualifies on its own."],
    ["Boundaries handled correctly", "The income limit is exclusive while the asset limits bite at the stated figure and above."],
    ["Unit conversion built in", "Hectares to acres and square metres to square yards, using exact conversion factors."],
  ],
  faqs: [
    [
      "What is the income limit for an EWS certificate?",
      "Family gross annual income must be below ₹8,00,000 for the financial year prior to the year of application, counting income from all sources including salary, agriculture, business and profession. The limit is exclusive, so a family income of exactly ₹8,00,000 does not qualify.",
    ],
    [
      "What property disqualifies you from EWS even if your income is low?",
      "Four holdings, each an absolute bar: 5 acres of agricultural land or more; a residential flat of 1,000 sq ft or more; a residential plot of 100 sq yards or more in a notified municipality; or a residential plot of 200 sq yards or more outside notified municipalities. Property held in different locations is added together before the test is applied.",
    ],
    [
      "Who counts as family for EWS?",
      "The person seeking the benefit, their parents, their siblings below 18, their spouse, and their children below 18. Siblings and children who are 18 or above are outside the definition, so their income and property do not count towards either test.",
    ],
    [
      "Can an OBC candidate get an EWS certificate?",
      "No. EWS reservation applies only to people who are not already covered by the reservation for Scheduled Castes, Scheduled Tribes or Other Backward Classes. A candidate who holds an OBC certificate must choose that route instead. If your category status is unclear, ask the competent authority in your state before applying.",
    ],
  ],
};

export default seo;
