const seo = {
  intro:
    "Blog terms and conditions do two jobs: state what a reader may do with your writing, and describe how the comment section is moderated. The second job carries the legal weight, because the shields that protect a site from what its commenters post — the DMCA safe harbour in 17 U.S.C. section 512, section 230 of the Communications Decency Act, and section 79 of India's Information Technology Act 2000 — are all conditional on published procedures and fixed deadlines. This generator assembles those clauses and computes the dates: the 10 to 14 business day restoration window after a DMCA counter-notice, the three-month statutory damages cut-off, and the 24-hour and 15-day grievance timelines.",
  useCases: [
    "Publish a moderation policy that satisfies Article 14 of the EU Digital Services Act instead of a paragraph saying comments may be removed at our discretion.",
    "Switch a blog from all rights reserved to Creative Commons and see the exact reuse wording that follows.",
    "Add a machine-readable reservation of rights against text and data mining, or expressly allow it.",
    "Work out when material must be restored after a counter-notice, so a takedown does not turn into a section 512(f) problem.",
  ],
  benefits: [
    [
      "Shields with their conditions",
      "Each liability protection is paired with the procedural step it depends on, not just asserted.",
    ],
    [
      "Deadlines calculated",
      "Restoration windows use real business-day counting and grievance clocks use hours, from your dates.",
    ],
    [
      "Licence in plain words",
      "Four content licences written out so a reader knows what they may republish without reading the deed.",
    ],
  ],
  faqs: [
    [
      "Does a blog need terms and conditions?",
      "A blog with no comments, no accounts and no downloads can survive without them, but any site that hosts what other people post benefits from them, because the DMCA safe harbour, section 230's good-faith moderation protection and India's intermediary safe harbour all assume published rules. In the EU, Article 14 of the Digital Services Act makes describing your moderation policy in the terms a legal requirement for hosting services, and a comment section is one.",
    ],
    [
      "How long after a DMCA counter-notice must content be restored?",
      "Not less than 10 and not more than 14 business days after the counter-notice is forwarded, under 17 U.S.C. section 512(g)(2)(C), unless the complainant tells you they have filed a court action seeking to restrain the activity. Restoring earlier or refusing to restore at all both step outside the safe harbour.",
    ],
    [
      "Do I need to register copyright to protect my blog posts?",
      "Protection is automatic on creation under the Berne Convention, so no registration is needed for the copyright to exist. For a US work, however, 17 U.S.C. section 411(a) requires registration before an infringement suit can be filed, and section 412 limits statutory damages and attorney fees to works registered before the infringement began or within three months of first publication — so registration decides what you can recover, not whether you own it.",
    ],
    [
      "Does moderating comments make me legally responsible for them?",
      "Not in the United States. Section 230(c)(1) of the Communications Decency Act means an interactive computer service is not treated as the publisher or speaker of information provided by someone else, and section 230(c)(2) specifically protects good-faith removal of objectionable material, so moderating does not convert you into the author of what you leave up. The position differs elsewhere — the EU and India condition their protections on acting on notices within stated timeframes.",
    ],
  ],
};

export default seo;
