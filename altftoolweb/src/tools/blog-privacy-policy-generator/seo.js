const seo = {
  intro:
    "A blog privacy policy is the notice required by GDPR Article 13 and comparable laws: it tells a reader what a site collects, why, on what lawful basis, who receives it and for how long it is kept. This generator builds one from what your blog actually runs — server logs, analytics, comments, a mailing list, ads or embeds — assigns a lawful basis to each purpose, decides whether Article 5(3) of the ePrivacy Directive requires a consent banner before those scripts load, and tests you against the three CCPA thresholds at Cal. Civ. Code section 1798.140.",
  useCases: [
    "Replace a copied template with a policy that names only the data your blog really collects, so a reader complaint does not expose a mismatch.",
    "Work out whether switching from cookie-based to cookieless analytics removes the need for a consent banner.",
    "Check whether the California Consumer Privacy Act applies to you before writing a California notice you may not need.",
    "Set explicit retention periods for logs, comments and unsubscribed addresses instead of keeping everything forever.",
  ],
  benefits: [
    [
      "Lawful basis per purpose",
      "Consent for analytics and the mailing list, legitimate interests for logs and moderation, each named against the GDPR article.",
    ],
    [
      "Consent decided by the rule",
      "The banner question is answered by whether anything is stored on the reader's device, not by guesswork.",
    ],
    [
      "Thresholds, not assumptions",
      "The CCPA check uses the real numbers: 25 million dollars revenue, 100,000 consumers, or 50% of revenue.",
    ],
  ],
  faqs: [
    [
      "Does a personal blog legally need a privacy policy?",
      "If the blog collects anything about identifiable readers — comment details, an email list, IP addresses in logs, analytics identifiers — then yes, GDPR Article 13 requires that readers be told at the point of collection, and comparable duties exist under the UK GDPR, India's Digital Personal Data Protection Act 2023 and several US state laws. A purely static page that collects nothing and sets no cookies is the rare exception.",
    ],
    [
      "Do I need a cookie banner if I only use Google Analytics?",
      "Yes for readers in the EU or UK. Article 5(3) of the ePrivacy Directive requires prior consent before storing or reading anything on a device that is not strictly necessary, and analytics cookies are not strictly necessary — that rule applies independently of which GDPR lawful basis you claim. Cookieless analytics that stores nothing on the device falls outside the rule, though you still need a lawful basis for any personal data.",
    ],
    [
      "Does the CCPA apply to a small blog?",
      "Usually not. The Act applies to a for-profit business that meets at least one of three thresholds: annual gross revenue over 25 million US dollars, buying, selling or sharing the personal information of 100,000 or more consumers or households in a year, or deriving 50% or more of annual revenue from selling or sharing personal information. A blog with display advertising can approach the second threshold faster than its owner expects, because sharing for behavioural advertising counts.",
    ],
    [
      "How long should a blog keep comments and analytics data?",
      "Long enough for the purpose and no longer, which is what GDPR Article 5(1)(e) requires rather than a fixed number. Common choices are 6 to 12 months for server logs, 14 months for analytics because that is the maximum standard retention option in Google Analytics 4, and comments for as long as the post is published. Write the period down and delete on schedule, because an unstated retention period is itself a gap in the notice.",
    ],
  ],
};

export default seo;
