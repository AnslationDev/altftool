const seo = {
  title: "Probation Confirmation Date: Extensions, Unpaid Leave",
  metaDescription:
    "Turns a joining date and probation months into the last day of probation and the confirmation date, adjusted for extensions and unpaid leave days.",
  steps: [
    "Enter the Joining date, Today's date and Probation in the offer letter (months), or tap one of the 3, 6, 9 or 12 months presets.",
    "Add any Extension granted (months) and Leave without pay (days), plus Notice during probation (days) and Notice after confirmation (days).",
    "Read Confirmation effective from with Last day of probation, Originally due, Days served and the Review timeline, then press Copy result.",
  ],
  intro:
    "This calculator turns a joining date and a probation length into the exact last day of probation and the date confirmation takes effect, then adjusts both for any extension granted and for days of leave without pay. It uses the standard reading of a period stated in months — a six-month probation from 1 April runs to 30 September, with confirmation effective 1 October — and clamps month-end arithmetic so 31 January plus one month is 28 February. Built for HR teams writing confirmation letters and for employees who want to know exactly when the notice period changes.",
  useCases: [
    "Date a confirmation letter correctly when the employee took 12 days of unpaid leave during a six-month probation.",
    "Show a manager the 30-day window in which the confirm-or-extend decision has to be made.",
    "Work out which notice period applies today when someone resigns close to the end of probation.",
    "Recalculate the end date after a three-month extension has been issued in writing.",
  ],
  benefits: [
    ["Month-end safe", "31 January plus one month resolves to 28 or 29 February, never spilling into March."],
    ["Extensions and unpaid leave", "Shows both the original due date and the pushed-back date, with the gap in days."],
    ["Notice period switch", "Tells you whether the probation notice or the confirmed notice applies on any given date."],
  ],
  faqs: [
    [
      "Does leave without pay extend the probation period?",
      "In most Indian appointment letters, yes — probation is meant to be a period of actual service, so unpaid absence extends it day for day. It is a contractual term rather than a statutory rule, so check the exact wording: some employers only count absences beyond a stated threshold, and a few do not extend at all.",
    ],
    [
      "How long is a standard probation period in India?",
      "Three and six months are the common lengths. Schedule I-A of the Industrial Employment (Standing Orders) Central Rules, 1946 sets three months for a workman provisionally employed against a permanent vacancy; for most office roles the Shops and Commercial Establishments Act of the state leaves the length to the contract, and twelve months is not unusual for senior positions.",
    ],
    [
      "Am I automatically confirmed if the employer says nothing?",
      "It depends on the wording of your appointment letter. Where the letter says confirmation requires a written order, silence usually means probation continues; where it says the employee stands confirmed on completion, continuing to work past the end date is generally treated as confirmation. Indian courts have looked at conduct as well as the contract, so ask for written confirmation rather than relying on assumption.",
    ],
    [
      "Can an employer extend probation indefinitely?",
      "No. Extensions normally have to be in writing, before the original end date, and for a stated further period — most appointment letters cap the total at 12 months. An extension issued after probation has already expired is on weak ground, which is why the tool flags the date the decision window opens.",
    ],
  ],
};

export default seo;
