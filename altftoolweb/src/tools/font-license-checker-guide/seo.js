const seo = {
  intro:
    "This guide checks a project's intended font uses against the licence you actually hold, category by category: desktop, self-hosted webfont, app embedding, ePublication, server rendering, broadcast, logo use, modification and redistribution. It encodes how the three common licence shapes behave — a retail foundry EULA that covers desktop only and sells the rest as add-ons, the SIL Open Font License 1.1, and Apache License 2.0 — and tells you which uses are covered, which need a separate purchase and which are prohibited. Informational only; the licence file shipped with your font is the authority.",
  useCases: [
    "Confirming before launch whether the desktop licence on a designer's machine also covers the @font-face files on the marketing site",
    "Working out which add-on licences an app team needs before embedding a paid typeface in a shipping binary",
    "Checking whether a Google Fonts family under the OFL can be modified and re-released with a custom name",
  ],
  benefits: [
    ["Category by category", "Fourteen distinct use categories are judged separately, the way real EULAs are written."],
    ["Metering made explicit", "Shows the seat, pageview, title and server counts you will be asked for at checkout."],
    ["Flags the traps early", "Sharing files with a client and modifying outlines are surfaced as blockers, not footnotes."],
  ],
  faqs: [
    [
      "Does a desktop font licence cover using the font on my website?",
      "No. A retail desktop licence covers installing the font on workstations to create artwork; serving it with @font-face requires a separate webfont licence, which is almost always metered by monthly pageviews across every domain you serve.",
    ],
    [
      "Can I send font files to my client or a freelancer?",
      "Under a typical retail EULA, no — passing the files on is prohibited and the other party must hold their own seats. Send outlined vector artwork or a flattened PDF instead, or buy seats that cover them. Fonts under the OFL or Apache 2.0 can be shared, provided the licence text travels with the files.",
    ],
    [
      "What does the SIL Open Font License actually allow?",
      "The OFL 1.1 allows use, study, modification and redistribution for any purpose including commercial, in any medium, with no fee. The two real limits are that the font files may not be sold on their own, and any derivative must stay under the OFL and must not use a Reserved Font Name declared by the original author.",
    ],
    [
      "How are desktop font licences counted — per person or per computer?",
      "Per computer. Licences are sold in workstation seats, counting every machine the files are installed on, so a designer with a studio desktop and a laptop needs two. Base retail packages commonly cover somewhere between one and five workstations before you step up a tier.",
    ],
  ],
};

export default seo;
