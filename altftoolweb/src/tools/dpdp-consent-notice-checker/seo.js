const seo = {
  title: "DPDP Consent Notice Checker: 8-Point Scan",
  metaDescription:
    "Paste a consent notice to see which of eight DPDP signals - fiduciary, purpose, withdrawal, grievance - are missing. A drafting aid, not certification.",
  intro:
    "The DPDP Consent Notice Checker scans a pasted consent notice for the eight signals a notice under India's Digital Personal Data Protection Act is normally expected to carry — data fiduciary identity, the personal data described, the purpose, the consent action, a withdrawal route, a rights route, a grievance contact, and plain-language wording — and returns a coverage percentage plus a list of what is missing. Each check is a keyword match against your text, so the report tells you which sections a reviewer will look for and cannot find. It is a drafting and review aid for privacy and product teams, not a compliance certificate.",
  useCases: [
    "Your team has rewritten the signup consent screen and you want a fast structural read before it goes to counsel, so the lawyer's time goes on wording rather than on spotting an absent grievance contact.",
    "You are comparing a vendor's consent notice against your own and need an objective list of which required elements each one actually mentions.",
    "A product manager has drafted a notice from an old GDPR template and you need to see which India-specific pieces, like the grievance route, never made it in.",
  ],
  benefits: [
    [
      "Names the gap, not just a score",
      "Every missing signal is listed individually as a review item, so you get an edit list instead of a number you have to interpret.",
    ],
    [
      "Strict mode changes the verdict",
      "With strict review on, any missing signal is flagged as needing review rather than being averaged away into a passing percentage.",
    ],
    [
      "Nothing leaves the draft unpublished notice",
      "The notice text is matched in place and the tool makes no claim of legal certification, so it never overstates what a keyword scan can prove.",
    ],
  ],
  faqs: [
    [
      "What must a DPDP consent notice contain?",
      "Under the DPDP Act, 2023 a notice must tell the person what personal data is being processed and for what purpose, how to withdraw consent, how to exercise their rights, and how to complain to the Data Protection Board of India. The eight checks here map to those expectations; confirm the current rules and any sector-specific duties with qualified counsel before publishing.",
    ],
    [
      "Does the notice have to be in a language other than English?",
      "The Act requires that the person be given the option to access the notice in English or in any language listed in the Eighth Schedule to the Constitution of India, which covers 22 languages. Translation quality matters as much as availability, since the notice must remain in clear and plain language.",
    ],
    [
      "What score should I be aiming for?",
      "100% coverage of all eight signals, meaning nothing is listed as missing. A high score still only proves the required topics are mentioned somewhere in the text, not that the wording is legally adequate for your processing.",
    ],
    [
      "Is this a compliance audit?",
      "No. It is a checklist aid that pattern-matches your text against eight expected notice elements and does not assess legal sufficiency, your lawful basis, or your obligations as a data fiduciary. Treat the output as a drafting prompt and have a qualified privacy lawyer review the final notice.",
    ],
  ],
};

export default seo;
