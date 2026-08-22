const seo = {
  title: "ADR Generator: Nygard & MADR 4.0 Templates",
  metaDescription:
    "Generate an architecture decision record in Nygard or MADR 4.0 markdown, named the adr-tools way (0007-short-title.md), with consequences included.",
  steps: [
    "Fill in the \"ADR number\", \"Title (a noun phrase, not a question)\" and \"Status\", and pick Nygard or MADR 4.0 under \"Record format\".",
    "Write the Context, \"Decision drivers (one per line)\", the one-sentence Decision and the positive and negative consequences, adding alternatives with \"Add option\" and marking \"This is the option we chose\".",
    "Check the generated file name in the 0012-slugified-title.md convention and click \"Copy ADR\" to grab the markdown.",
  ],
  intro:
    "An architecture decision record (ADR) is a short, numbered markdown file that captures one architecturally significant decision along with its context, the alternatives weighed, the choice made and the consequences accepted. This generator produces that file in either Michael Nygard's original 2011 template or MADR 4.0, and names it with the conventional `0007-short-title.md` pattern. It is for engineers who keep decisions in the repository next to the code they govern.",
  useCases: [
    "Record why a service moved from a key-value store to PostgreSQL, so the next team does not re-litigate it",
    "Document a rejected option — such as a build-versus-buy call — with the reasoning that made it a no",
    "Supersede an earlier record when a decision is reversed, keeping both files so the history stays readable",
  ],
  benefits: [
    ["Both standard templates", "Nygard's five-section record for speed, or MADR 4.0 when options need per-option pros and cons."],
    ["Correct file naming", "Four-digit numbering and a slugified title, matching the adr-tools convention."],
    ["Consequences are mandatory", "Positive and negative outcomes both get sections, so trade-offs are stated, not implied."],
  ],
  faqs: [
    [
      "What is an architecture decision record?",
      "It is a one-page document describing a single architecturally significant decision: the context that forced it, the options considered, the decision itself and the consequences. The practice comes from Michael Nygard's 2011 article, and records are stored in the repository (usually `docs/adr/`) so they version alongside the code.",
    ],
    [
      "What is the difference between the Nygard template and MADR?",
      "Nygard's template has five parts — Title, Status, Context, Decision, Consequences — and fits on half a page. MADR (Markdown Any Decision Records), currently at version 4.0, adds explicit Decision Drivers, a numbered Considered Options list and a pros-and-cons block per option, which suits decisions where the alternatives need to be defended.",
    ],
    [
      "Can you edit an ADR after it is accepted?",
      "Only for typos. The convention is that an accepted record is immutable: if the decision changes, write a new ADR and set the old one's status to Superseded with a link to the replacement. That preserves what the team knew and believed at the time, which is the whole point of the log.",
    ],
    [
      "Which decisions deserve an ADR?",
      "The ones that are expensive to reverse or that constrain future work — datastore choice, service boundaries, authentication model, a language or framework commitment, a public API contract. A useful test is whether a new joiner six months from now would ask why it was done this way.",
    ],
  ],
};

export default seo;
