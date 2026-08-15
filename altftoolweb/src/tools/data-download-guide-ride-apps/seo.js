const seo = {
  title: "Uber, Ola & Rapido Data Download Guide",
  metaDescription:
    "Plan a ride-app data request: count the GPS points held about you, size the archive, and cite the IT Rules 2021 24-hour/15-day or 30-day GDPR deadlines.",
  steps: [
    "Tick export categories under '1. Choose what to ask for' — Trip history, GPS route traces, Profile and saved places, Payments and receipts, Safety and incident records — or press 'Select all'.",
    "Enter 'Years using the app', 'Rides per month' and 'Average ride length (minutes)' under '2. Describe your riding'.",
    "Read 'Location points in the export' with the archive size, home-inference index and the Grievance Officer deadlines (24 h to acknowledge, 15 days to dispose), then press 'Copy plan'.",
  ],
  intro:
    "This guide plans a ride-hailing data request for Uber, Ola or Rapido and converts your riding habits into the thing that actually matters: how many individual location points the operator holds about you. It counts pickup and drop coordinates plus GPS breadcrumbs along each route, sizes the archive, and lists the rules to quote when a request is ignored — the IT Rules 2021 Grievance Officer duty of acknowledgement within 24 hours and disposal within 15 days, and the 30-day access deadline under GDPR.",
  useCases: [
    "See how many GPS points five years of daily commuting has produced before deciding whether to keep using a saved Home address.",
    "Request driver chat, ratings and safety records after an incident, so you have the operator's own record rather than your recollection.",
    "Draft a written access request to an Indian operator's Grievance Officer with the correct rule and deadline cited.",
    "Audit trip history and receipts for expense claims or a tax filing without downloading route traces you do not need.",
  ],
  benefits: [
    ["Counts location points", "Turns an abstract 'trip history' into a concrete number of coordinates held about you."],
    ["Cites the right deadline", "Separates the Indian Grievance Officer timeline from the GDPR one-month rule."],
    ["Category-level risk", "Rates each part of the export so you can leave route traces out when the trip list is enough."],
  ],
  faqs: [
    [
      "How do I download my Uber data?",
      "Use Uber's Privacy Center and choose the option to download your data. The archive is emailed as a time-limited link and typically covers trip history, receipts, ratings, communications and device information.",
    ],
    [
      "How do I get my data from Ola or Rapido?",
      "Indian operators generally handle access requests through in-app support and a published Grievance Officer rather than a self-service portal. Send the request from your registered phone number and email, and name the categories you want — trip history with coordinates, route traces, driver chat and safety records.",
    ],
    [
      "What is the deadline for an Indian app to respond to a data request?",
      "Under the IT Rules 2021, an intermediary's Grievance Officer must acknowledge a complaint within 24 hours and dispose of it within 15 days. The DPDP Act 2023 separately gives you a right to a summary of the personal data being processed, with timelines set in the rules made under the Act.",
    ],
    [
      "Can a ride app work out where I live from my trip history?",
      "Repeated origins cluster very quickly: a regular late-night drop point is effectively a home address after only a few dozen rides, and saved places state it outright. Setting location permission to 'While Using', removing saved Home and Work entries, and deleting old emergency contacts all reduce what is held. This page is informational and not legal advice.",
    ],
  ],
};

export default seo;
