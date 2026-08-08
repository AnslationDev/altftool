const seo = {
  title: "Cost Per Support Ticket: AI vs Agent Break-Even",
  metaDescription:
    "Prices an AI queue against agents only using occupancy-adjusted cost per ticket, charges every AI attempt, and reports the break-even containment rate.",
  steps: [
    "Enter Tickets per month, Resolved by AI alone (%), Agent average handle time (minutes), Agent occupancy (%) and the fully loaded agent cost per hour.",
    "Under AI costs, set Model cost per attempt, Extra cost when it escalates and Fixed platform fee per month, in USD, EUR, GBP or INR.",
    "Read the blended cost per ticket against the agents-only figure, plus Break-even containment, then press Copy result.",
  ],
  intro:
    "The Cost Per Support Ticket AI Calculator compares an AI-assisted queue with an all-human one and reports a blended cost per ticket. Agent cost uses the standard contact-centre method — handle time divided by occupancy, multiplied by the fully loaded hourly rate — because an agent paid for an hour only handles tickets for the occupied part of it. Every ticket is charged for the AI attempt whether or not it is contained, reopened tickets are pulled back out of the containment figure, and the tool solves for the break-even containment rate at which the AI layer starts paying for itself.",
  useCases: [
    "Build the business case for a support assistant before committing to a platform contract.",
    "Check whether a 40% containment rate is actually enough to cover the model spend and licence fee.",
    "Show what a 5-point improvement in containment is worth per year at your ticket volume.",
    "Model the cost effect of a high reopen rate on tickets the assistant claimed to resolve.",
  ],
  benefits: [
    ["Occupancy-adjusted labour", "Uses the real cost per contact, not handle time times hourly rate, which understates agent cost."],
    ["Charges failed attempts", "Escalated tickets still pay for the AI attempt and the handoff, as they do on a real bill."],
    ["Break-even containment", "One percentage that tells you whether the deployment is above or below water."],
  ],
  faqs: [
    [
      "How do you calculate cost per support ticket?",
      "Divide average handle time by occupancy, then multiply by the fully loaded hourly cost. At 8 minutes handle time, 85% occupancy and 26 an hour, the agent cost per ticket is about 4.08 — noticeably more than the 3.47 you get if you ignore occupancy.",
    ],
    [
      "What containment rate does an AI support agent need to pay for itself?",
      "Far lower than most teams assume, because the model attempt costs cents while an agent ticket costs several currency units. In the worked example — 20,000 tickets, 0.06 per AI attempt, 0.02 handoff, a 500 monthly fee and 4.08 agent cost per ticket — break-even is about 2.6% containment, so the real question is quality, not whether the maths works.",
    ],
    [
      "Does an AI ticket that escalates still cost money?",
      "Yes, twice. You pay for the AI attempt, plus any summarisation or context handoff, and then the full agent handle time on top. That is why containment measured after reopens matters more than the headline deflection number a vendor quotes.",
    ],
    [
      "Do AI savings in support show up as real cash?",
      "Only if capacity is actually adjusted. Freed agent hours reduce spend when overtime, outsourced volume or hiring plans change; otherwise they show up as shorter queues and lower handle backlog, which are valuable but not a line in the budget. Say which of the two you are claiming when presenting the numbers.",
    ],
  ],
};

export default seo;
