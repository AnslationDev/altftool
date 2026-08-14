const seo = {
  title: "Price Your Revision Rounds and Draft the Clause",
  metaDescription:
    "Divides your fee by base hours plus rounds x hours per round to show the effective hourly rate, prices an extra round, and drafts the scope clause.",
  steps: [
    "Enter the Project fee, Base hours (before revisions), your Target hourly rate, Included revision rounds and Hours allowed per round in the Currency you bill in.",
    "Leave \"Extra round fee (blank = calculated)\" empty to price it as hours per round x rate, set Feedback due within (business days) and Deemed approval after (business days), and tick Include a cancellation clause.",
    "Effective hourly rate is shown against your target, the \"If the client asks for more rounds\" table compares the rate if billed with the rate if absorbed, and Copy clause takes the draft wording.",
  ],
  intro:
    "This helper prices a revision policy before it is written into a contract. It divides your fixed fee by the hours the project really takes when every included round is used — effective rate = fee / (base hours + rounds x hours per round) — so you can see what unlimited-feeling revisions cost you, then sets an extra-round fee from your hourly rate. It also drafts the scope language: what a round is, what counts as a revision rather than a change of brief, consolidated feedback, a feedback window and a deemed-approval date.",
  useCases: [
    "Check whether two included rounds still leave you at your target hourly rate before you quote.",
    "Set a defensible price for a third round instead of inventing a number under pressure.",
    "Add a deemed-approval clause so a project cannot sit unanswered for weeks and then reopen.",
    "Show a client, in their own currency, what the round they are asking for actually costs.",
  ],
  benefits: [
    ["The number that matters", "Effective hourly rate, not the headline fee, is what tells you if the deal works."],
    ["Extra rounds priced", "Sets the per-round fee from your hours and rate, rounded to a sensible billing increment."],
    ["Clause text included", "Definitions, consolidated feedback, feedback window, deemed approval and cancellation."],
  ],
  faqs: [
    [
      "How many revision rounds should a design contract include?",
      "Two or three, each tightly defined, works better than five loose ones. What matters more than the count is the definition: one round means one set of consolidated written comments from all stakeholders and the single set of amendments made in response.",
    ],
    [
      "How do I charge for extra revision rounds?",
      "Price a round the way you priced the project: hours allowed per round multiplied by your hourly rate, rounded to a clean billing increment. If four hours at your rate is what a round costs, that is the extra-round fee — extra work should never be cheaper per hour than the original scope.",
    ],
    [
      "What is the difference between a revision and a new request?",
      "A revision refines the direction that was already agreed: copy, colour, spacing, image swaps and layout tuning inside the approved structure. Changing the brief, the audience, the format or the creative direction is new work and should be quoted separately before it starts.",
    ],
    [
      "What is a deemed approval clause?",
      "It says that if no written feedback arrives within a set number of business days, the delivery is treated as approved and the project moves on. It protects your schedule from silent clients, and it makes later changes billable as additional rounds. This is drafting help rather than legal advice — have a lawyer check the wording for your jurisdiction.",
    ],
  ],
};

export default seo;
