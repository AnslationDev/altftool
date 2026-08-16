const seo = {
  title: "Name Change Tracker: Gazette, Aadhaar, PAN",
  metaDescription:
    "Sequences a name change by dependency — affidavit, newspaper ads, Gazette, Aadhaar, PAN — and shows what is ready to file today and what is blocked.",
  steps: [
    "Tick the optional groups that apply under \"Which of these apply to you\" — Banking and investments, Tax and employment, Property and utilities, Education certificates; the legal basis and core identity groups always apply.",
    "Work down \"Every record, in dependency order\" and tick each record you have already updated; anything whose prerequisite is still unticked stays labelled Blocked with the document it is waiting on named beside it.",
    "The panel reports the percentage of records updated, done out of total, how many are \"Ready to file now\" and how many rounds are still needed, above a ranked \"Do these next\" list; \"Copy list\" exports the outstanding records.",
  ],
  intro:
    "This tracker sequences a legal name change across every record that carries your name, treating them as a dependency graph rather than a flat list: affidavit, then newspaper advertisements, then the Gazette notification, then Aadhaar, then PAN, then everything that is verified against those two. It shows what is ready to file today, what is blocked and by which document, and how many rounds of applications are still ahead. It is aimed at anyone mid-way through a name change who has lost track of which office still has the old name.",
  useCases: [
    "Someone who has just received the Gazette notification and needs to know which applications can now be filed in parallel",
    "A person tracking bank, demat, insurance and EPFO updates months after the identity documents were changed",
    "Anyone preparing a name-change file and wanting the paperwork order right before spending on affidavits and advertisements",
  ],
  benefits: [
    ["Dependency-aware, not alphabetical", "A record only shows as ready once the documents its issuer verifies against have been updated."],
    ["Shows what unlocks the most", "Next actions are ranked by how many downstream records each one releases, so the queue clears fastest."],
    ["Scope you control", "Switch off investments, employment, property or education if they do not apply, and the progress percentage adjusts."],
  ],
  faqs: [
    [
      "In what order should I update documents after a legal name change?",
      "Affidavit first, then the newspaper advertisements, then the Gazette notification — those three are the legal basis everything else is built on. Then Aadhaar, because most authorities verify against it, then PAN so the two names match for PAN-Aadhaar linkage, and only then passport, driving licence, voter ID, bank KYC, and the investment, employment and property records that depend on them.",
    ],
    [
      "How many times can I change the name on my Aadhaar?",
      "UIDAI's update policy permits a name update in Aadhaar twice in a lifetime. Because that limit is tight and because Aadhaar is the document other authorities match against, get the spelling exactly as it appears on the Gazette notification before applying — a correction to fix a typo consumes one of the two updates.",
    ],
    [
      "Do I need a Gazette notification, or is an affidavit enough?",
      "An affidavit alone is enough for some private bodies, but most government authorities — passport, RTO, electoral roll, boards and universities — ask for the Gazette notification, published in Part IV of the Gazette of India by the Department of Publication. Two newspaper advertisements, one English and one in the regional language, are the standard accompaniment and are specifically asked for in passport and education-board applications.",
    ],
    [
      "Which record is most often forgotten in a name change?",
      "Insurance policies and nominee details, followed by education certificates. Neither is used day to day, so the mismatch surfaces years later — at a claim, or when a degree certificate does not match the passport during a visa or job verification. Both are in the list here, and education certificates are worth starting early because boards run their own windows and formats.",
    ],
  ],
};

export default seo;
