const seo = {
  intro:
    "Wedding Website Privacy Cleanup scores a public wedding or event page against 19 commonly over-shared details — home address, honeymoon dates, RSVP fields, security-question trivia and search indexing — and returns a ranked cleanup plan. Each item carries a severity rank from 1 to 5, and the tool converts the ticked items into a percentage of the maximum possible exposure. It also checks your guest-record retention against the storage-limitation principle in Article 5(1)(e) of the GDPR, which says personal data should not be kept in identifiable form longer than the purpose requires.",
  useCases: [
    "Reviewing a wedding site your planner or a template builder set up before you email the link to 150 guests.",
    "Deciding whether the ceremony address and honeymoon dates should sit behind the RSVP step instead of on the public homepage.",
    "Working out which RSVP fields to delete after the event so you are not holding a spreadsheet of guests' home addresses for years.",
    "Checking that the 'how we met' story does not answer the same questions your bank uses to verify you.",
  ],
  benefits: [
    [
      "Ranked, not just listed",
      "Items are ordered by severity and by when to fix them, so the absence window goes before the guestbook spam.",
    ],
    [
      "Covers other people's data too",
      "Flags guest addresses, children's details and public RSVP replies — the data you hold on behalf of someone else.",
    ],
    [
      "Runs entirely in your browser",
      "Nothing is uploaded and no page is fetched; you tick what you can see and the scoring happens locally.",
    ],
  ],
  faqs: [
    [
      "Should my wedding website be password protected?",
      "Yes, if it carries the venue address, the schedule or any guest detail. A single shared passphrase printed on the invitation removes most of the exposure at once, because the risky facts stop being readable by anyone who finds the URL. Also switch on the builder's 'hide from search engines' option, which adds a noindex tag so the page does not become a permanent search result.",
    ],
    [
      "Is it safe to post honeymoon dates on a wedding website?",
      "No — published travel dates are effectively an announcement of when your home is empty, which is why they carry the top severity rank here alongside a public home address. Say you will be away without dates, and post the photos once you are back. The same applies to a public ceremony date paired with your home address.",
    ],
    [
      "What personal details should never go on a wedding page?",
      "Home address, full dates of birth, honeymoon dates, guests' addresses or phone numbers, children's names paired with a school, and 'first pet / first school / street you grew up on' trivia. That last group matters because those are the standard account-recovery questions, so publishing them hands over the answers.",
    ],
    [
      "How long should I keep RSVP data after the wedding?",
      "Delete guest contact records once thank-you notes and vendor reconciliation are done — this tool flags anything held beyond 30 days. Under the GDPR's storage-limitation principle, Article 5(1)(e), personal data must not be kept in identifiable form for longer than the purpose needs, and a completed one-day event is a finished purpose. This is general information, not legal advice; ask a data protection professional if you are unsure about your specific situation.",
    ],
  ],
};

export default seo;
