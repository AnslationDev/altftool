const seo = {
  title: "RC, Insurance & PUC Expiry Tracker: Days Remaining",
  metaDescription:
    "Paste RC, insurance, PUC and licence expiry dates as 'Document | date | reference' and read days remaining, overdue flags and a 30-day warning window.",
  steps: [
    "Type one document per line into the Vehicle documents box as 'Document | expiry date | reference' — for example RC | 2027-06-30 | MH01AB1234 — or press the 'Example vehicle' chip under Examples.",
    "Set the Review date the countdown runs from and the Warning window (days), which starts at 30 and marks anything inside it as 'renew soon'.",
    "Read the Item / Expiry / Reference / Status table: a past date reads '92d overdue', an unparseable one reads 'Invalid date', and the caption counts how many need attention; Copy or Download saves the list.",
  ],
  intro:
    "Vehicle Document Reminder takes a list of vehicle papers — RC, insurance, PUC, driving licence, permit, fitness — each written as 'Document | expiry date | reference', and returns days remaining against a review date you set, marking anything already past as overdue and anything inside your warning window as renew soon. The window defaults to 30 days, and the summary counts how many records need attention so one line tells you whether anything is due. It is for owners and small fleet operators who keep renewal dates in four different places and want them on one screen.",
  useCases: [
    "Before a long drive, checking in one pass whether the PUC certificate and insurance will still be valid on the day you return.",
    "A family with three vehicles wants every RC, policy and PUC date in one list instead of four glovebox folders and a WhatsApp reminder.",
    "A small fleet manager setting a 45-day window so renewal paperwork can start before anything actually lapses.",
  ],
  benefits: [
    [
      "Overdue and due-soon are separated",
      "A past date is reported as '92d overdue' rather than a negative number, and anything inside the window is flagged separately from what is simply upcoming.",
    ],
    [
      "The warning window is yours to set",
      "The 30-day default suits PUC renewals; raise it to 45 or 60 when a document needs an inspection appointment booked ahead of the expiry.",
    ],
    [
      "Bad dates are called out, not skipped",
      "A line whose date cannot be parsed is reported as 'Invalid date' and counted in the needs-attention total, so a typo does not silently drop a document from the list.",
    ],
  ],
  faqs: [
    [
      "Which vehicle documents should I be tracking?",
      "In India the usual set is the registration certificate (RC), a valid motor insurance policy, the PUC (Pollution Under Control) certificate, and the driver's licence — plus fitness certificate and permit for commercial vehicles. Enter each on its own line with its expiry date and a reference such as the policy or certificate number.",
    ],
    [
      "What happens if my PUC or insurance has expired?",
      "Driving without valid third-party insurance or a valid PUC certificate is an offence under the Motor Vehicles Act, and an expired policy can also leave a claim unpayable. Penalties and enforcement vary by state, so check your RTO or transport department for the current position — this tool only tracks the dates you enter.",
    ],
    [
      "How is 'days remaining' calculated?",
      "It is the expiry date minus the review date in whole days, rounded up. A result below zero is shown as overdue; a result at or below the warning window — 30 days by default — is marked renew soon; anything larger is shown as a plain day count.",
    ],
    [
      "Will it notify me when something is about to expire?",
      "No. It is a calculator, not a scheduler: it computes the status from the dates and review date you supply. What you type is saved locally in your own browser so your list is still there next time you open this page on the same device — nothing is synced to an account or sent to a server, and clearing your browser data removes it. Use it to work out the dates, then set the actual alerts in your own calendar.",
    ],
  ],
};

export default seo;
