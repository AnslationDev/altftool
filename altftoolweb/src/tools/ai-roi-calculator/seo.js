const seo = {
  title: "AI ROI Calculator — Hours Saved vs Subscription Cost",
  metaDescription:
    "Work out whether an AI tool pays for itself: active seats × hours saved × loaded rate vs cost, with break-even hours and monthly and annual net benefit.",
  steps: [
    "Enter Licensed seats, Cost per seat per month ($) and any Other monthly cost such as API usage or training.",
    "Set Hours saved per user per week, the Loaded hourly rate ($/hour) and the Adoption rate (% of seats actively using it).",
    "Read the monthly ROI percentage with annual net benefit and break-even hours per user per week, then click Copy result.",
  ],
  intro:
    "The AI ROI Calculator applies the standard return-on-investment formula — ROI = (value − cost) ÷ cost — to an AI tool subscription, where value is active seats × hours saved per user per week × 4.33 weeks per month × the loaded hourly rate. It also computes the break-even point: how many hours each active user must save per week just to cover the licence. It is built for team leads and finance reviewers deciding whether to buy, renew or expand an AI tool.",
  useCases: [
    "An engineering manager justifying 10 Copilot-style seats at $30 each by pricing 2 saved hours per developer per week against a $50 loaded rate",
    "A finance reviewer stress-testing a renewal by lowering the adoption rate to the share of seats that actually log in",
    "A founder comparing two tools by their break-even hours — the one that needs only 0.2 saved hours a week to pay off is the safer bet",
  ],
  benefits: [
    ["Adoption-adjusted", "Value is computed on active seats, not licensed seats, so shelfware does not inflate the return."],
    ["Break-even hours", "See the minimum weekly time saving per user that covers the cost — an easy number to sanity-check."],
    ["Monthly and annual views", "Net benefit is shown per month and per year using the 52/12 calendar average of 4.33 weeks per month."],
  ],
  faqs: [
    [
      "How do I calculate ROI for an AI tool?",
      "Use ROI = (value − cost) ÷ cost × 100, where value is the hours the tool saves multiplied by a loaded hourly rate. For a team: active seats × hours saved per user per week × 4.33 weeks per month × hourly rate gives the monthly value; subtract the total monthly cost and divide by that cost. This calculator does exactly that and also reports the break-even hours.",
    ],
    [
      "What is a loaded hourly rate and why use it instead of salary?",
      "A loaded rate includes benefits, payroll taxes and overhead on top of base pay — typically 1.25 to 1.4 times salary cost. Using bare salary understates what an employee-hour actually costs the business, which in turn understates the value of time saved.",
    ],
    [
      "Why does the adoption rate matter in an AI ROI calculation?",
      "Because only seats that are actually used save any time. If you license 20 seats but 8 people use the tool, computing value on 20 seats overstates the return by 2.5×. This calculator multiplies seats by your adoption percentage before valuing the hours.",
    ],
    [
      "Is time saved by AI the same as money saved?",
      "Not automatically. Saved time only becomes money when it is redeployed into billable or productive work, so treat the calculated ROI as an upper bound. Measured before/after task timings and output metrics are stronger evidence than self-reported savings; for budget decisions, validate with a small pilot first.",
    ],
  ],
};

export default seo;
