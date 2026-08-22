const seo = {
  title: "Resignation Letter Generator: Last Working Day",
  metaDescription:
    "Enter your notice period, leave adjustment and buyout days to get your exact last working day, a dated handover plan and a ready resignation letter.",
  steps: [
    "In the Notice period card set \"Date you submit the resignation\" and \"Your working week\", enter \"Notice period in the contract\" with its Notice unit, then add \"Leave adjusted against notice (days)\" and \"Days you want bought out or waived\".",
    "Fill in Letter details — Your name, Employee ID, Designation, \"Addressed to (manager / HR)\", Company name and \"Reason stated in the letter\" — and the draft rewrites itself as you type; there is no submit button.",
    "Read \"Your last working day\" with its Notice starts / Full notice would end on / Notice actually served rows and the Phase, Dates, Focus handover table, then press \"Copy dates\" or \"Copy letter\".",
  ],
  intro:
    "This generator computes your last working day from the notice period your contract specifies, then writes the resignation letter around that date. Months are added as calendar months with end-of-month clamping, so a one-month notice given on 31 January ends on 28 February rather than a guessed thirty days later; leave adjusted against notice and any days you are asking to be bought out are then subtracted. The output includes a dated three-phase handover plan sized to the working days you actually have left.",
  useCases: [
    "You have a 60-day notice period and 14 days of accrued leave to set against it, and need the exact last working day before you accept an offer with a start date.",
    "You are resigning on the 31st of a month and want the notice end date computed correctly rather than assumed to be 30 days later.",
    "You want a letter that proposes an earlier release without sounding like a demand, stating that you will serve the full period if required.",
    "Your new employer needs a written last working day for the background check, and you want the same date in the letter and in the handover schedule.",
  ],
  benefits: [
    ["Correct calendar arithmetic", "Adds real months with end-of-month clamping instead of treating a month as thirty days."],
    ["Leave and buyout handled separately", "Shows the contractual end date and your proposed last day side by side, which is what HR needs to approve."],
    ["Handover plan with dates", "Splits the served notice into documentation, knowledge transfer and closure phases, each with a start and end date."],
  ],
  faqs: [
    [
      "How do I calculate my last working day from a notice period?",
      "Count the notice from the day after you submit the resignation: a one-month notice submitted on 5 August ends on 5 September, and a 60-day notice submitted on 5 August ends on 4 October. If leave is being adjusted against notice or days are being bought out, subtract those days from the contractual end date and state both dates in the letter.",
    ],
    [
      "Can leave be adjusted against the notice period?",
      "Only if your employer's policy allows it — many companies let accrued earned leave offset part of the notice, others insist notice be physically served and pay the leave out in the final settlement instead. Ask HR in writing before you commit to a shorter last working day, and put the request in the resignation letter rather than assuming it.",
    ],
    [
      "How much notice do I have to give when resigning in India?",
      "The length comes from your appointment letter; one month and three months are the common figures, with 90 days typical in senior and IT roles. State Shops and Establishments Acts also set a baseline notice for covered employees, so where the contract is silent the applicable state Act governs.",
    ],
    [
      "Should I give a reason in a resignation letter?",
      "No reason is legally required, and a short neutral line such as accepting another opportunity is enough. Keep grievances out of the resignation letter itself — it goes on your permanent file and is often what a future employer's verification team sees; raise concerns separately in the exit interview.",
    ],
  ],
};

export default seo;
