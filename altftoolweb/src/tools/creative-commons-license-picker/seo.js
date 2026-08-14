const seo = {
  title: "Creative Commons License Picker: CC BY, SA, NC, ND",
  metaDescription:
    "Answer two questions — commercial use and adaptations — to get the right CC 4.0 license, what reusers may do, and attribution in plain text and HTML.",
  steps: [
    "Answer May others use the work commercially? and May others share adaptations of the work?, or tick the CC0 box to waive everything.",
    "Choose the kind of work — photograph, article, music, dataset or source code — and fill in the title, creator name and source link.",
    "Read the recommended licence and its Free Cultural Works status, then press Copy attribution or Copy HTML for the rel=\"license\" snippet.",
  ],
  intro:
    "The Creative Commons Licence Picker maps the two questions the licence suite is built on — may others use the work commercially, and may they share adaptations — onto the six Creative Commons 4.0 licences and the CC0 public domain dedication. Alongside the recommended licence it lists exactly what a reuser may and may not do, flags the traps that catch first-time licensors, and generates attribution in the Title-Author-Source-Licence pattern Creative Commons recommends, in both plain text and HTML. It is aimed at photographers, writers, educators, musicians and open data publishers deciding how to release their own work. It is informational only and is not legal advice.",
  useCases: [
    "Decide between CC BY and CC BY-SA before publishing a photo set that you want reused but credited.",
    "Generate the attribution line a reuser should paste under your illustration, with the source link already embedded.",
    "Check whether the licence you are about to choose is Approved for Free Cultural Works, which matters if you want Wikipedia to accept the file.",
    "Confirm that a Creative Commons licence is the wrong instrument for source code before you attach one.",
  ],
  benefits: [
    [
      "Two questions, one answer",
      "The chooser reproduces the actual licence logic, including that ND and SA cannot be combined.",
    ],
    [
      "Attribution written for you",
      "Both plain text and an HTML snippet with rel=\"license\", following the Title, Author, Source, Licence pattern.",
    ],
    [
      "Warns before you commit",
      "Irrevocability, the vagueness of NC, and the unsuitability of CC for software are all surfaced up front.",
    ],
  ],
  faqs: [
    [
      "Which Creative Commons licence should I use?",
      "If you simply want your work reused with credit, CC BY 4.0 is the standard choice. Add SA if you want adaptations to stay open under the same terms, add NC if you want to keep commercial uses for yourself to license separately, and add ND only if the work must never be published in altered form. CC0 waives everything, including the credit.",
    ],
    [
      "Can I change or cancel a Creative Commons licence later?",
      "You can stop offering the work under it, but you cannot take back licences already granted. CC licences are irrevocable, so anyone who received a copy while it was published keeps their rights permanently. You do keep the copyright and can license the same work to others on different terms in parallel.",
    ],
    [
      "What is the difference between CC BY-SA and CC BY-ND?",
      "ShareAlike allows adaptations but requires each one to carry the same licence, which keeps the derivative chain open. NoDerivatives goes the other way and forbids publishing adapted versions at all — no crops, no translations, no remixes. They are mutually exclusive, which is why no CC licence contains both.",
    ],
    [
      "Does NonCommercial mean nobody can make money from my work?",
      "It bars uses primarily intended for commercial advantage or monetary compensation, but Creative Commons deliberately left the boundary undefined. Whether a fee-charging school, a nonprofit, or an ad-supported blog counts is genuinely unsettled, and that uncertainty tends to stop cautious reusers rather than only the ones you had in mind.",
    ],
  ],
};

export default seo;
