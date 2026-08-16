const seo = {
  title: "Bank Balance Certificate Request Letter for Visas",
  metaDescription:
    "Size visa funds as days of stay × the Article 21(5) per-day amount, work out the earliest date to ask your branch, and draft the request letter.",
  steps: [
    "Enter Trip start date, Trip end date, Visa appointment / submission date and the Reference amount per day.",
    "Set Accommodation situation, the exchange rate in ₹, Current balance (₹) and Certificate accepted if issued within (days).",
    "Funds to show gives the rupee figure and any Shortfall, Ask the bank on or after gives the date, and Copy letter takes the branch letter.",
  ],
  intro:
    "This generator does the two calculations a visa file needs before you walk into the branch: how much money the application should show, and whether the certificate will still be current on appointment day. Funds are sized as days of stay multiplied by the per-day reference amount that Schengen states publish under Article 21(5) of the Visa Code, plus a safety buffer, converted to rupees. It then drafts the request to the branch manager, listing the letterhead, stamp and signatory details that make a certificate acceptable rather than rejected.",
  useCases: [
    "A Schengen tourist visa applicant checking whether the account balance covers a 11-day trip at the published per-day amount before booking an appointment",
    "Someone whose appointment is six weeks away, working out the earliest date to ask the bank so the certificate is not stale on submission",
    "A student or business traveller who needs stamped statements for the last six months alongside the balance certificate",
  ],
  benefits: [
    ["Funds sized from a published rule", "Days of stay times the per-day reference amount, not a guess, with the accommodation basis changing the amount."],
    ["Catches a stale certificate early", "Works backwards from the appointment date to the earliest date the certificate may bear."],
    ["Asks for the right format", "The letter specifies letterhead, name as in the passport, balance in figures and words, IFSC, signatory code and branch stamp."],
  ],
  faqs: [
    [
      "How much bank balance is needed for a Schengen visa?",
      "There is no single figure — each Schengen state publishes its own reference amount per day of stay under Article 21(5) of the Visa Code, and the amount changes with whether accommodation is already paid for. France, for example, publishes EUR 120 per day where the traveller has no proof of accommodation, EUR 65 per day where the stay is prepaid, and EUR 32.50 per day for travellers holding an attestation d'accueil. Multiply the applicable amount by the days of stay and check the figure published by the consulate you are applying to.",
    ],
    [
      "How old can a bank balance certificate be for a visa application?",
      "Most consulates want one issued recently, with 30 days the usual outer limit at the time of submission, alongside statements covering the previous three or six months. Because the certificate is dated when the bank issues it, ask for it close to the appointment: this tool computes the earliest date the certificate may bear so it is still current on submission day.",
    ],
    [
      "What should a bank balance certificate contain?",
      "It should be on branch letterhead, addressed 'To Whomsoever It May Concern', and carry the account holder's name exactly as in the passport, the account number and type, the date the account was opened, the closing balance in figures and in words, the branch address with IFSC, and the signature, name, designation and employee code of the authorised signatory with the branch round stamp. Missing signatory details and an unstamped page are the two most common reasons a certificate is refused.",
    ],
    [
      "What if my balance is short of the required amount?",
      "You can top up before the certificate is issued, or rely on a sponsor. Where a sponsor is used, consulates normally want a sponsorship or affidavit of support, the sponsor's own balance certificate and statements, and proof of the relationship. Sudden large deposits shortly before the certificate is issued attract questions, so the statement history matters as much as the closing balance. This is informational only — check the requirement with the consulate.",
    ],
  ],
};

export default seo;
