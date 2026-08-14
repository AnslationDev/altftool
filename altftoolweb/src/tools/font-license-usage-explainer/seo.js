const seo = {
  title: "Font Licence Checker: Desktop vs Webfont vs App Use",
  metaDescription:
    "Check 14 uses — @font-face, logos, app embedding, EPUB, server rendering — against a desktop, webfont, app, server, OFL 1.1 or Apache 2.0 licence.",
  steps: [
    "Pick Licence you hold — Desktop licence, Webfont licence, App licence, ePub / eBook licence, Server licence, Broadcast / OTT licence, SIL Open Font Licence 1.1 or Apache License 2.0.",
    "Under What do you want to do with it? tick the uses that apply, such as Use @font-face on a public website or Embed it in a mobile or desktop app.",
    "Enter the units licensed and the units you actually need, then read the Use by use verdicts and Copy result.",
  ],
  intro:
    "The Font Licence Usage Explainer maps a set of intended uses against the licence family you actually bought — desktop, webfont, app, ePub, server, broadcast, SIL Open Font Licence 1.1 or Apache 2.0 — and marks each use as covered, dependent on the exact EULA wording, or needing a separate licence. Commercial type is licensed per channel, so a desktop seat that lets a designer set a poster does not let you serve the same file with @font-face or ship it inside an app binary. It is aimed at designers, marketers and developers who need to know what to buy before a font file leaves the design team.",
  useCases: [
    "You bought two desktop seats for a rebrand and now the developer wants to self-host the same family on the marketing site.",
    "A client asks you to convert the wordmark to outlines and file it as a trade mark, and you need to know whether your EULA allows a logo.",
    "Your product team wants to bundle a typeface inside an iOS app and a PDF-generation service, which are two different licences.",
    "You are replacing a paid family with an SIL Open Font Licence release and want to confirm you can subset, rename and redistribute it.",
  ],
  benefits: [
    [
      "Channel by channel",
      "Shows the desktop, web, app, ePub, server and broadcast split that commercial EULAs are built around.",
    ],
    [
      "Flags the grey areas",
      "Separates the clauses that genuinely vary between foundries from the ones no licence permits.",
    ],
    [
      "Counts your seats",
      "Compares the workstations, pageviews or titles you licensed against what the project actually needs.",
    ],
  ],
  faqs: [
    [
      "Does a desktop font licence cover using the font on my website?",
      "No. A desktop licence permits installing the font on a stated number of workstations for design work; serving it with @font-face needs a separate webfont licence, which foundries meter by monthly pageviews and tie to named domains. Using desktop files as webfonts is one of the most common licence breaches.",
    ],
    [
      "Can I make a logo with a licensed font?",
      "Usually yes — most desktop EULAs allow converting glyphs to outlines for a logo — but several foundries require an extended or logo licence once company turnover crosses a stated threshold, and a few exclude trade-mark registration entirely. Read the logo clause before filing.",
    ],
    [
      "What does the SIL Open Font Licence actually allow?",
      "The OFL 1.1 permits use, study, modification and redistribution for any purpose including commercial, on three conditions: the font cannot be sold on its own, a Reserved Font Name must be changed in any derivative, and derivatives stay under the OFL. Bundling an OFL font inside a paid product is fine.",
    ],
    [
      "Can I send the font file to my printer or a freelancer?",
      "Sending one copy to a service bureau purely to output your job is allowed by most EULAs, on condition the file is deleted afterwards. A freelancer who designs with the font is a user and needs a seat of their own; no licence lets you pass the file on generally. This is informational guidance, not legal advice — check your EULA or ask the foundry in writing.",
    ],
  ],
};

export default seo;
