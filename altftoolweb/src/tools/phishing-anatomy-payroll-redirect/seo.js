const seo = {
  title: "Payroll Bank-Change Request: Phishing Red Flags",
  metaDescription:
    "Score a salary bank-change email out of 100 on lookalike domains, Reply-To mismatch, no-call excuses and cut-off timing, and price one diverted cycle.",
  steps: [
    "Paste the From address, Reply-To address, your organisation's mail domain and the Message text of the bank-change request.",
    "Answer Things only you can check: a different account name, arrival by email rather than the HR self-service portal, a refused phone call, payroll cut-off timing.",
    "Read the Red-flag score out of 100 with its findings, enter Net pay per cycle for the exposure, then press Copy result for the verification steps.",
  ],
  intro:
    "Payroll redirect fraud is a business email compromise in which someone impersonating an employee asks HR or payroll to pay their salary into a different bank account. This page scores a request against the signals that define the pattern — a personal or lookalike sender domain, a Reply-To that points elsewhere, an excuse for avoiding a phone call, timing against the payroll cut-off, and an account in a name that is not the employee's — and estimates what one undetected cycle costs. It is a checking aid for payroll and HR teams, not a substitute for calling the employee on the number already in your records.",
  useCases: [
    "A payroll clerk receives a bank-change email days before the monthly run and needs a documented reason to hold it.",
    "HR wants a written rationale to send back to a manager who is pushing for the change to be processed today.",
    "Security awareness sessions for finance teams that need a real teardown of a salary-diversion email rather than generic advice.",
    "Writing or reviewing a payroll bank-change policy and deciding which controls are non-negotiable.",
  ],
  benefits: [
    ["Focuses on the one control that works", "Every excuse for avoiding a call to the stored number is treated as a red flag, because out-of-band voice verification is what defeats this fraud."],
    ["Covers the non-technical tells", "Account-name mismatch, cut-off timing and simultaneous contact-detail changes are scored alongside the header analysis."],
    ["Quantifies the exposure", "Shows what one cycle of diverted salary costs across the affected employees, which is usually what gets a control approved."],
  ],
  faqs: [
    [
      "What is payroll diversion fraud?",
      "It is a business email compromise where a fraudster poses as an employee and asks HR or payroll to change the bank account that salary is paid into. No malware is involved — the entire attack is a plausible email, and the loss is the salary itself, usually discovered only when the real employee reports the money never arrived.",
    ],
    [
      "How do I verify an employee's bank account change request?",
      "Call the employee on the phone number already held in the HR system, not any number in the email, and confirm the change verbally. Require the request to be submitted through the HR self-service portal where one exists, and send a change notification to the previously stored email and phone so the real employee hears about it.",
    ],
    [
      "The email came from the employee's real work address — is it safe?",
      "Not necessarily. A compromised mailbox sends genuinely internal mail that passes every authentication check, and attackers often set an inbox rule to hide the replies. Sender domain matching your own lowers the odds of a spoof but does not replace the voice check.",
    ],
    [
      "Can the money be recovered after payroll has paid the wrong account?",
      "Sometimes, if you act immediately. Tell your bank the same day and ask for a recall or an indemnity claim while the funds may still be sitting in the receiving account; once withdrawn or moved on, recovery becomes unlikely. Report it to your national fraud reporting body and your insurer as well — this is general information, not legal advice.",
    ],
  ],
};

export default seo;
