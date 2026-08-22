const seo = {
  title: "DSAR Request Tracker: Deadlines & Overdue Days",
  metaDescription:
    "Paste one DSAR per line as ID, received date, deadline days, status, owner — get each due date plus days left or days overdue at your review date.",
  steps: [
    "Paste your queue into the Requests box, one line per request as ID | received date | deadline days | status | owner.",
    "Set the Review date the countdown is measured from, or load the 'Example queue' preset to see the expected format.",
    "Read the ID, Received, Due, Status, Owner and Clock table, where every open row shows days left or days overdue.",
  ],
  intro:
    "DSAR Request Tracker takes a plain list of data subject access requests — one per line as ID, date received, deadline in days, status and owner — and calculates each due date and how many days are left or overdue against a review date you set. Requests marked completed or closed stop the clock; everything else is counted as open and, if the due date has passed, flagged as overdue with the number of days. Privacy teams get a queue view with the countdown already done instead of a spreadsheet of dates they have to subtract by hand.",
  useCases: [
    "You are preparing for a Monday privacy stand-up and need to know which of fifteen open access requests are already past their deadline before anyone asks.",
    "A request came in on a date you granted an extension for, so you change that line's deadline from 30 days to 90 and immediately see where it now falls.",
    "You are handing the DSAR queue over to a colleague and want a single table showing every request, its owner, its due date and its remaining days.",
  ],
  benefits: [
    [
      "Per-request deadlines, not one global rule",
      "The deadline days column is set per line, so requests under different regimes or with granted extensions sit in the same queue with correct due dates.",
    ],
    [
      "Overdue is counted, not just marked",
      "Late requests show the exact number of days past due, which is the number a regulator or an escalation will ask for.",
    ],
    [
      "Bad dates surface instead of silently passing",
      "A line with an unparseable received date is reported as an invalid date rather than being given a plausible-looking deadline.",
    ],
  ],
  faqs: [
    [
      "How long do I have to respond to a DSAR?",
      "Under GDPR and UK GDPR the response is due without undue delay and within one month of receipt, extendable by a further two months where the request is complex or numerous, provided you tell the person within the first month. Under California's CCPA/CPRA the deadline is 45 days, extendable once by another 45.",
    ],
    [
      "What deadline should I enter in the days column?",
      "Whatever applies to that request. The default is 30 days, which approximates the GDPR one-month clock; enter 90 for a GDPR request where you have granted the full two-month extension, or 45 for a CCPA request.",
    ],
    [
      "When does the clock start?",
      "From the date the request was received, which is the date you enter in the second column. Time spent verifying the requester's identity does not reset that clock under GDPR, although the response period can pause until you have the information you reasonably need to identify them.",
    ],
    [
      "Does this store or send my request data?",
      "No, the calculation runs in your browser on the text you paste and nothing is submitted. It is a deadline calculator rather than a compliance record, so keep the authoritative log in your own case system and check obligations with your DPO or privacy counsel.",
    ],
  ],
};

export default seo;
