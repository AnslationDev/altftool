const seo = {
  title: "Resignation Letter Generator: Exact Last Day",
  metaDescription:
    "Draft a resignation letter and get the exact last working day from a 15, 30, 60 or 90-day notice, plus a shortfall and buyout estimate for early release.",
  steps: [
    "Fill in 'Your name', 'Designation' and 'Employer name', set the 'Date you are resigning', and pick a 'Notice period' from 15 days to 90 days (3 months).",
    "Optionally set 'Last day you want (blank = full notice)', a Tone such as 'Requesting early release', a reason, and tick 'Notice counts working days only'.",
    "Read the computed 'Last working day', any shortfall with its 'Notice buyout estimate', and the finished text under 'Your letter' — then press 'Copy letter'.",
  ],
  intro:
    "Resignation Letter Generator drafts a formal resignation and calculates the last working day from the notice period in your appointment letter — 15, 30, 60 or 90 days, counted either as calendar days or working days only. Notice runs from the day after you submit, so 30 days given on 1 August ends on 31 August. If you propose an earlier last day, the tool shows the exact shortfall and estimates the buyout at daily rate multiplied by days short, using the salary component your contract names.",
  useCases: [
    "Work out the exact last working day for a 90-day notice period before you tell your manager a date.",
    "Draft a letter that names the handover, the documentation you will leave behind, and asks for the relieving letter and full and final settlement.",
    "See how many days short of notice an early release would be, and what a buyout at that shortfall would cost.",
    "Produce a short, neutral letter when you would rather not state a reason for leaving.",
  ],
  benefits: [
    ["Last working day computed", "Calendar or working-day notice, leap years and month boundaries handled, with a warning if the date lands on a weekend."],
    ["Shortfall made explicit", "The letter says how many days short you are and asks for a waiver rather than leaving it vague."],
    ["Nothing burned", "No tone option criticises the employer or colleagues — resignation letters end up in a permanent HR file."],
  ],
  faqs: [
    [
      "How do I calculate my last working day from a notice period?",
      "Notice runs from the day after the resignation is submitted, so a 30-day notice given on 1 August ends on 31 August, and a 90-day notice given the same day ends on 30 October. If your contract counts working days rather than calendar days, weekends do not count towards the total, which pushes the date roughly 40% later.",
    ],
    [
      "What should a resignation letter include?",
      "Four things: a clear statement that you are resigning, your designation and employer, the last working day as a date, and the handover arrangement. Requesting the relieving letter, experience certificate and full and final settlement in the same letter saves a follow-up email later.",
    ],
    [
      "Do I have to give a reason for resigning?",
      "No. A resignation letter is valid without one, and a single neutral line — or nothing at all — is common. If you do give a reason, keep it to one sentence and avoid criticism; the letter stays in your HR file permanently.",
    ],
    [
      "How is notice period buyout calculated?",
      "Typically as the daily rate of the salary component named in your appointment letter multiplied by the number of days short, with the monthly figure divided by 30. Which component applies — basic, gross or CTC — and whether buyout is allowed at all are contractual, so read the appointment letter rather than assuming.",
    ],
  ],
};

export default seo;
