const seo = {
  title: "Copyright Notice Generator: Symbol, Year, Owner",
  metaDescription:
    "Build a notice with the three elements in 17 U.S.C. §401(b) — symbol, year of first publication and owner — as plain text, HTML, meta tag or header.",
  steps: [
    "Type the Copyright owner and the Year of first publication, then choose \"What is it going on?\" — Website or app footer, Software / source code, Book or print publication, Sound recording / music release and five more.",
    "Pick a Symbol style of © (symbol), Copyright (word), Copyright © (both) or Copr. (abbreviation), a Rights phrase such as All rights reserved or Licensed CC BY 4.0, and tick the year-range box if the work is still being updated.",
    "Take the line you need from \"Copy for each place it goes\" — Plain text, HTML, HTML meta tag, Source-code header, and a Sound-recording line for ℗ media — each with its own Copy button; Reset restores the defaults.",
  ],
  intro:
    "This generator assembles a copyright notice from the three elements the law names: the © symbol (or the word Copyright, or Copr.), the year of first publication, and the name of the copyright owner — the form set out in 17 U.S.C. §401(b). It outputs the notice as plain text, escaped HTML, an HTML meta tag and a source-file header comment, and adds the separate ℗ line that sound recordings take under §402. Copyright already exists from the moment a work is fixed, so the notice is about putting the world on record, not about creating the right.",
  useCases: [
    "Set the footer line on a site that has been published continuously since an earlier year.",
    "Add a header comment to every source file plus a matching line in the repository LICENSE.",
    "Write the copyright page of a book or PDF with the correct year of first publication.",
    "Produce the ℗ recording line and the © artwork line for a music or podcast release.",
  ],
  benefits: [
    ["Statutory form", "Uses the three elements named in 17 U.S.C. §401(b) rather than an invented format."],
    ["Every output you need", "Plain text, HTML with escaped entities, a meta tag and a source-code header from one entry."],
    ["Explains the myths", "Says plainly what 'All rights reserved' does, and why a notice is not a licence."],
  ],
  faqs: [
    [
      "What should a copyright notice say?",
      "Three things: the symbol © (or the word Copyright, or Copr.), the year the work was first published, and the name of the copyright owner — for example © 2024 Northwind Studio. That is the form set out in 17 U.S.C. §401(b); anything else in the line is optional convention.",
    ],
    [
      "Do I legally need a copyright notice?",
      "No. Under the Berne Convention copyright arises automatically when a work is fixed in a tangible form, and no notice, registration or fee is needed for protection in any member state. A notice is still worth adding because in the US it removes an infringer's innocent-infringement plea in mitigation of damages under 17 U.S.C. §401(d).",
    ],
    [
      "Should the year be a range like 2019-2026?",
      "A range is a publishing convention for works updated continuously, not a legal requirement. The element the statute cares about is the year of first publication — the first number in the range — so an accurate single year is never wrong, and the end year should never be later than the current year.",
    ],
    [
      "Does 'All rights reserved' still mean anything?",
      "Not legally. The phrase came from the 1910 Buenos Aires Convention, whose requirement is long obsolete, and it survives as convention rather than obligation. Note also that a notice is not a licence: without an explicit licence grant, the default position is that nobody may copy or redistribute the work. This is informational only — consult a lawyer about ownership questions.",
    ],
  ],
};

export default seo;
