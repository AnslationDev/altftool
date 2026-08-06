const seo = {
  intro:
    "This generator turns a photographer, agency, collection and year into a credit line in the house style you need — wire (Jane Doe/Agency), magazine, caption prefix, parenthetical, social, museum or academic figure — and shows the same credit rendered in every style side by side. It also fills the four IPTC Photo Metadata fields that should travel inside the file: Creator, Credit Line, Source and Copyright Notice, each with a different value, because filling all four with the same string is the commonest metadata error in a picture desk.",
  useCases: [
    "Standardise credits across a publication so every article uses one slash-form wire style.",
    "Write the correct figure caption and permission statement for an image in a paper or thesis.",
    "Produce a museum wall-label credit that leads with the collection rather than the photographer.",
    "Fill the IPTC fields before an image goes into a shared asset library so the credit survives reuse.",
  ],
  benefits: [
    ["Every house style at once", "See the same credit in nine formats and copy whichever the outlet expects."],
    ["IPTC fields done properly", "Creator, Credit Line, Source and Copyright Notice each get their own correct value."],
    ["Catches the usual errors", "Flags a missing photographer, a duplicated Credit and Source, and editorial-only limits."],
  ],
  faqs: [
    [
      "What is the standard format for a photo credit?",
      "Wire and newspaper practice is Photographer/Agency with no spaces around the slash — for example Jane Doe/Reuters — sometimes prefixed with 'Photo:' or wrapped in parentheses at the end of a caption. Magazines usually spell it out as 'Photograph by Jane Doe / Agency'.",
    ],
    [
      "What is the difference between IPTC Credit Line and Source?",
      "Credit Line is who must be named when the image is published; Source is the original owner or archive the file came from. Creator is a third field naming the photographer, and Copyright Notice is a fourth carrying the rights statement — they are four separate fields and should rarely all hold the same text.",
    ],
    [
      "Where should the credit go — the caption or the metadata?",
      "Both. Captions get rewritten, truncated or dropped as an image is reused, while embedded IPTC metadata travels with the file into asset managers and CMSes. Writing the credit only into the caption is how attribution gets lost.",
    ],
    [
      "What does 'editorial use only' mean on an image credit?",
      "It means the licence covers news, commentary and other editorial contexts but not advertising, promotion, packaging or any commercial use. The restriction should be recorded in the IPTC Rights Usage Terms field, not just typed into one caption, so it is still visible when someone reuses the file months later. This is informational only, not legal advice.",
    ],
  ],
};

export default seo;
