const seo = {
  title: "Client Video Revision Tracker: Timecoded Feedback",
  metaDescription:
    "Log each client note with a timecode, round and status, then see the resolution rate, remaining edit time and the price of rounds beyond your contract.",
  steps: [
    "Set your Cut length, the revision rounds included in the contract, the fee per extra round (INR) and edit minutes budgeted per note.",
    "Click Add note for each piece of feedback and give it a Round, a Timecode (M:SS) and a status; notes past the end of the cut are refused.",
    "Read the Notes resolved percentage with outstanding and overage figures, then click Copy result for a list sorted by round and timecode.",
  ],
  intro:
    "The Client Video Revision Tracker turns scattered client feedback into a timecoded, status-tracked list grouped by revision round. Each note carries a timecode, a round number and one of four states — open, in progress, done or won't fix — and the tracker returns a resolution rate, the outstanding edit time at your own minutes-per-note estimate, and the value of any rounds beyond the allowance in your contract. Made for editors and studios who need one defensible list instead of three email threads.",
  useCases: [
    "Consolidating a client's WhatsApp voice note, an email and a spreadsheet into one timecoded list before starting round two.",
    "Showing a client that they are on round four of a two-round contract, with the overage priced.",
    "Estimating how many hours of edit time are left when 12 of 30 notes are still open.",
    "Sending a clean, round-by-round changelog back with a new cut so the client can tick off what changed.",
  ],
  benefits: [
    ["Timecodes are validated", "M:SS and H:MM:SS both parse, and a note past the end of the cut is refused rather than silently accepted."],
    ["Scope creep made visible", "Rounds beyond your contracted allowance are flagged and priced the moment they appear."],
    ["Copy-ready changelog", "The whole list exports as plain text, sorted by round then timecode, ready to paste into a reply."],
  ],
  faqs: [
    [
      "How many revision rounds should a video contract include?",
      "Two rounds is the most common allowance in a video statement of work, with a named fee for each additional round. Define what counts as a round — one consolidated set of notes from one approver, delivered by an agreed date — because undefined rounds are what turn into unpaid work.",
    ],
    [
      "What is the best way to collect client feedback on a video?",
      "Ask for one consolidated list per round, with a timecode against every note and one named decision-maker. Timecoded notes remove the guesswork about which shot is meant, and consolidating avoids contradictory instructions arriving from two people on the same day.",
    ],
    [
      "How do I charge for extra revision rounds?",
      "Agree the per-round fee in the contract before work starts, and raise the overage the moment the extra round is requested rather than on the final invoice. This tracker multiplies the rounds beyond your allowance by the fee you enter so you have the figure ready — the terms of your signed statement of work decide what you can actually bill.",
    ],
    [
      "What does a 'won't fix' status mean on a revision note?",
      "It marks a note that has been discussed and consciously closed without a change — usually because it conflicts with the brief, another note, or a technical limit. It counts as resolved in the completion rate, which is why closing notes explicitly matters more than quietly leaving them open.",
    ],
  ],
};

export default seo;
