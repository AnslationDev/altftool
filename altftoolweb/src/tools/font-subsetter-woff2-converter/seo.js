const seo = {
  intro:
    "This tool plans a font subset: you load a font from your own machine, paste the exact characters your site needs, and it reports which of them the font can render and exports a JSON manifest recording the source file, the requested character set and the covered set. It deliberately does not fabricate a WOFF2 file — browsers have no native WOFF2 encoder, so the manifest is the honest output and the actual repackaging is done by a dedicated tool such as pyftsubset from fonttools. The font never leaves your browser, which matters when the licence forbids uploading it.",
  useCases: [
    "You are cutting a 400KB display font down to the twelve characters used in a logotype and need a defensible record of exactly which characters were requested",
    "Before running pyftsubset you want to confirm the source font actually covers every accented character in your copy, so the subset does not silently drop glyphs",
    "A licensed font cannot be uploaded to an online subsetter, so you need the character audit done locally and handed to whoever runs the build step",
  ],
  benefits: [
    ["Verifies coverage before you subset", "The requested characters are checked against the font first, so you find missing glyphs at planning time rather than after the subset ships."],
    ["Produces a portable manifest", "The JSON records source filename, requested characters and covered characters — a handover artefact for a build script or a colleague."],
    ["Says what it cannot do", "Rather than emitting a renamed file and calling it a WOFF2 subset, it states plainly that browser-native WOFF2 encoding is unavailable."],
  ],
  faqs: [
    [
      "Does this actually produce a WOFF2 file?",
      "No. It exports a JSON subset manifest and explicitly reports that no browser-native WOFF2 subset was fabricated. Browsers can decode WOFF2 but expose no encoder, so a genuine subset has to be built with a dedicated tool — pyftsubset from the fonttools package with --flavor=woff2 is the standard route.",
    ],
    [
      "How does it check character coverage?",
      "It registers your font under a temporary family through the FontFace API and asks the browser, for each unique character you entered, whether that family can render it at 24px. The result is a supported-of-requested count plus the list of characters that resolved.",
    ],
    [
      "Is my font file uploaded anywhere?",
      "No. The file is read locally and registered in your browser session only. That is the point of doing the audit here — many commercial font licences prohibit sending the file to a third-party service, even a conversion one.",
    ],
    [
      "Why is subsetting worth doing at all?",
      "Because a full Latin-plus font carries hundreds of glyphs a given page never draws, and the unused outlines are pure download weight. Cutting a face to only the characters a headline or a UI actually uses routinely removes the large majority of the file, which is why subsetting is standard practice for self-hosted web fonts.",
    ],
  ],
};

export default seo;
