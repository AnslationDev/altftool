const seo = {
  title: "GDPR Blog Checklist, Scoped to Features You Use",
  metaDescription:
    "Shows only the GDPR duties your analytics, ads, newsletter or non-EU hosting trigger, names the article behind each, and counts critical items triple.",
  steps: [
    "Tick what your blog uses — Analytics, Advertising or affiliate tracking, Email newsletter sign-up, Hosting or vendors outside the EU/UK.",
    "Work down Your checklist, narrowing it with the Show filter to Critical only or Outstanding only, and tick what is already done.",
    "Read the weighted completion score, then press Copy to-do list for the outstanding items and the GDPR article behind each.",
  ],
  intro:
    "GDPR Compliance Checklist for Blogs turns a list of the features your blog actually uses — analytics, ads, a newsletter, comments, embeds, non-EU hosting — into the subset of obligations that follow from them, each labelled with the provision it comes from. It covers the GDPR duties most blogs meet in practice (Articles 5, 6, 7, 8, 12-17, 20, 21, 28, 30, 32, 33 and 44-46) plus the cookie consent rule that actually bites, Article 5(3) of the ePrivacy Directive. Items are weighted by severity so the score reflects whether the critical things are done, not just how many boxes are ticked.",
  useCases: [
    "Audit a hobby blog that runs Google Analytics and a Mailchimp sign-up before a first sponsorship deal.",
    "Work out which obligations disappear if you drop advertising and switch to a cookieless analytics tool.",
    "Produce a prioritised to-do list to hand a developer, with the article reference for each fix.",
    "Check whether your consent banner meets the reject-as-easily-as-accept requirement before a redesign.",
  ],
  benefits: [
    [
      "Scoped to your setup",
      "Items appear only when a feature you actually use triggers them, so the list stays short and honest.",
    ],
    [
      "Weighted, not counted",
      "Critical items count triple, so a high score genuinely means the risky gaps are closed.",
    ],
    [
      "Every item sourced",
      "Each line names its GDPR article or ePrivacy provision, so you can read the original before acting.",
    ],
  ],
  faqs: [
    [
      "Does GDPR apply to a personal blog?",
      "Yes, if you process personal data of people in the EU or EEA — and analytics identifiers, comment records, IP addresses in server logs and newsletter emails all count. There is no small-blog exemption; what is relaxed for organisations under 250 employees is only the formal record-of-processing obligation in Article 30(5), and even that has exceptions for regular processing.",
    ],
    [
      "Do I need a cookie banner for analytics?",
      "If the analytics tool stores or reads anything on the reader's device, yes — Article 5(3) of the ePrivacy Directive requires prior consent for anything not strictly necessary, which is why the requirement applies even to analytics you consider harmless. The script must stay blocked until consent is given, and rejecting must be as easy as accepting.",
    ],
    [
      "How quickly must I answer a data deletion request?",
      "Without undue delay, and in any event within one month of receiving the request under Article 12(3). That can be extended by a further two months for complex or numerous requests, but you have to tell the person about the extension within the first month, and the first copy of their data must be free.",
    ],
    [
      "What happens if a blog gets it wrong?",
      "In practice a small blog is far more likely to receive a complaint and an order to fix something than a fine. The theoretical ceiling under Article 83(5) is EUR 20 million or 4% of worldwide annual turnover, whichever is higher, but supervisory authorities weigh the nature, gravity and duration of the infringement and whether you cooperated.",
    ],
  ],
};

export default seo;
