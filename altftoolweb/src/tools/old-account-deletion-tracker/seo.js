const seo = {
  title: "Account Deletion Tracker: GDPR & CCPA Deadlines",
  metaDescription:
    "Track dormant accounts you are closing — one calendar month under GDPR, 45 days under CCPA — with overdue flags and a proof reference required.",
  steps: [
    "Set Today's date, press Add account, and for each row fill Service, 'Law that applies' (GDPR / UK GDPR, CCPA / CPRA, DPDP Act or 'No specific privacy law'), Data held and 'Request sent on'.",
    "Move Status from 'Found, not yet requested' through 'Deletion requested', 'Acknowledged by the company' or 'Refused or ignored' to 'Deletion confirmed', pasting the ticket into 'Proof note (ticket or reference from their reply)'.",
    "Read Deletions confirmed with 'Confirmed deleted with proof' and 'Past the response deadline', check the Reply due column in the Tracker table, then press Copy tracker.",
  ],
  intro:
    "The Old Account Deletion Tracker keeps an inventory of dormant accounts you are closing and calculates the reply deadline for each one from the date you sent the request: one calendar month under the GDPR (Article 12(3), extendable by two further months for complex requests) and 45 days under California's consumer privacy rules (extendable by another 45). Rows are sorted into overdue, escalate, waiting and to-send, and a row only counts as complete once you have recorded the confirmation reference the company gave you. Everything is calculated in your browser; nothing is uploaded.",
  useCases: [
    "Work through a password manager export and close the fifty accounts you have not signed into for years.",
    "See which requests are past their statutory reply window and are ready to escalate to a regulator.",
    "Keep the ticket numbers and reply references together so you can prove a deletion was confirmed.",
    "Prioritise the accounts holding ID documents or payment details before the ones holding only an email address.",
  ],
  benefits: [
    [
      "Real deadlines, calculated",
      "Calendar-month arithmetic for the GDPR and 45-day counts for CCPA, including the extension dates.",
    ],
    [
      "Proof or it is not done",
      "A row marked deleted without a reference stays flagged, because an unverified deletion is not evidence.",
    ],
    [
      "Ordered by what to do next",
      "Overdue and refused requests sort to the top, then requests you have not sent, weighted by sensitivity.",
    ],
  ],
  faqs: [
    [
      "How long does a company have to delete my data?",
      "Under the GDPR the controller must tell you what action it has taken without undue delay and within one calendar month of receiving the request, extendable by two further months for complex requests if it notifies you inside the first month. Under California's consumer privacy rules a business has 45 days to respond, extendable by a further 45 with notice.",
    ],
    [
      "What can I do if a company ignores my deletion request?",
      "Once the response window has passed, send a written follow-up referencing the original request date, then lodge a complaint with the relevant authority — a data protection supervisory authority in the EEA or UK, the California Privacy Protection Agency or Attorney General in California, or the Data Protection Board in India after the company's own grievance process. Keep copies of everything you sent, which is why recording dates and references matters.",
    ],
    [
      "Can a company refuse to delete my account?",
      "Yes, in defined situations — for example where it must keep records to meet a legal obligation such as tax or anti-money-laundering rules, or to establish or defend legal claims. It must tell you the reason, and it should still delete anything not covered by that obligation; if the explanation looks wrong, ask for it in writing before escalating.",
    ],
    [
      "Is deactivating an account the same as deleting it?",
      "No. Deactivation usually hides the profile while the underlying data stays on file and can be restored, whereas deletion should remove the personal data or render it anonymous. Ask explicitly for erasure, and record the confirmation reference — this tool treats a deletion without a written confirmation as unverified for exactly that reason.",
    ],
  ],
};

export default seo;
