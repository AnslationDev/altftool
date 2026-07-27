const seo = {
  intro:
    "Preset Pack Readme Generator produces the documentation file that ships inside a paid creative download: contents, requirements, the real install path for the host application, plain-language licence terms and a support section. Install steps follow each application's documented route — Lightroom Classic's Develop module, Photoshop's Actions panel, Capture One's Styles and Presets tool, the DaVinci Resolve LUT folder — rather than generic advice. Output is Markdown or plain text, ready to drop in the zip beside your files.",
  useCases: [
    "Ship a proper README with a Lightroom preset pack sold on Gumroad or Etsy.",
    "Give LUT buyers the exact Premiere Pro and DaVinci Resolve install routes so support requests drop.",
    "Set out a commercial versus personal-use licence in wording customers actually read.",
    "Document a Procreate brushset for buyers who have never installed one before.",
  ],
  benefits: [
    ["Application-specific steps", "Each product type has its own documented install path, not a generic 'import the files' line."],
    ["Licence tiers spelled out", "Personal, commercial and extended tiers each list what is and is not permitted, in plain English."],
    ["Catches gaps", "Warns when there is no support contact, no changelog, or a file count too large to install one by one."],
  ],
  faqs: [
    [
      "What should a preset pack README include?",
      "Five things: what is in the download, the app version required, numbered install steps, the licence, and how to get support. Buyers who cannot install a pack in two minutes ask for a refund, and a missing unzip step is the single most common cause.",
    ],
    [
      "How do I install Lightroom presets from an XMP file?",
      "In Lightroom Classic, open the Develop module, right-click in the Presets panel and choose Import Presets, then select the .xmp files or the zip. Lightroom moved to .xmp presets in version 7.3; older .lrtemplate files are converted on import.",
    ],
    [
      "Do I need a commercial licence to use presets on client work?",
      "That depends on the licence the creator granted. A personal-use licence usually excludes paid client work, advertising and any monetised content, while a commercial licence permits it but still forbids redistributing the preset files themselves.",
    ],
    [
      "Is the licence text this tool generates legally binding?",
      "It is a plain-language template, not legal advice, and enforceability depends on your jurisdiction and how the terms are presented at purchase. If the pack is a meaningful part of your income, have a lawyer draft or review the final wording.",
    ],
  ],
};

export default seo;
