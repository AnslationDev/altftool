const seo = {
  intro:
    "This tracker holds every policy — term life, health, motor, home — on one page and puts the premiums on a common annual footing, so a monthly term premium and an annual floater premium can be added together honestly. For each policy it dates the grace period (15 days for a monthly premium mode and 30 days for quarterly, half-yearly and annual modes under IRDAI's health insurance rules, and none at all for motor cover) and flags anything already lapsed. It also compares the life cover in force against the common ten-times-annual-income rule of thumb.",
  useCases: [
    "See the true annual cost of cover when one policy is paid monthly, another quarterly and a third annually.",
    "Catch a motor policy that expired twelve days ago, before the no-claim bonus window closes.",
    "Check whether a family's total term cover is anywhere near ten times household income.",
    "Work out the last date to move a health policy to another insurer under portability before renewal.",
  ],
  benefits: [
    ["Premiums made comparable", "Monthly, quarterly and half-yearly premiums are annualised, so the totals mean something."],
    ["Grace dates, not just renewal dates", "The date cover actually ends is shown alongside the renewal date."],
    ["Stays on your device", "Policy numbers and sums insured are never sent anywhere — the whole tracker runs in the browser."],
  ],
  faqs: [
    [
      "How long is the grace period on a health insurance policy?",
      "Under IRDAI's health insurance rules the grace period is 15 days where the premium is paid monthly and 30 days for quarterly, half-yearly and annual modes. Paying inside the grace period keeps waiting periods and the no-claim bonus intact, but a claim for an event during the break in cover is not payable.",
    ],
    [
      "Is there a grace period for car insurance?",
      "No. Motor cover ends at the expiry moment, and driving without at least third-party insurance is an offence under section 146 of the Motor Vehicles Act, 1988. Most insurers do allow the accumulated no-claim bonus to be carried over if the policy is renewed within 90 days of expiry, but a break usually triggers a fresh vehicle inspection.",
    ],
    [
      "How much term life cover do I actually need?",
      "Ten to fifteen times annual income is the common rule of thumb, and this tool uses ten times as a conservative benchmark. The honest answer depends on outstanding loans, the number of years your dependants need support, existing savings and any employer cover — a licensed adviser can work out a human life value figure properly rather than a multiple.",
    ],
    [
      "When can I port a health policy to a different insurer?",
      "The portability request has to reach the new insurer at least 30 days before the renewal date, and may be made up to 60 days before it, under IRDAI's portability rules. Port at renewal rather than mid-term, because accrued waiting periods and continuity benefits transfer only when the switch happens at renewal.",
    ],
  ],
};

export default seo;
