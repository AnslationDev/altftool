const seo = {
  intro:
    "Email Safe Font Checker resolves a CSS font-family stack the way a mail client does — first family that resolves wins — across twelve common client and platform combinations, and reports exactly which typeface each subscriber ends up seeing. Two things decide the outcome: whether the client honours @font-face at all (Gmail, Outlook on Windows, Outlook.com, Yahoo and AOL do not) and which families ship with the reader's operating system. It also flags stacks with no generic keyword at the end, the single most common cause of an email rendering in Times New Roman.",
  useCases: [
    "Check whether a brand webfont will actually reach anyone before designing a campaign around it.",
    "Work out what Gmail on Android will substitute for a Georgia headline.",
    "Fix a template where Segoe UI was used with no cross-platform fallback.",
    "Choose between Arial and Verdana for small body copy by seeing where each is installed.",
  ],
  benefits: [
    ["Client-level detail", "Resolution is shown per client and platform, not as a single vague support percentage."],
    ["Catches missing fallbacks", "Warns when a stack has no generic keyword, so nothing silently lands on the client's default."],
    ["Gives you a fix", "Suggests a replacement stack that keeps your first choice and adds wide-coverage fallbacks."],
  ],
  faqs: [
    [
      "Which fonts are safe to use in email?",
      "Arial, Helvetica, Georgia, Times New Roman, Verdana, Trebuchet MS and Courier New are installed on Windows, macOS and iOS. None of them ship on Android, which uses Roboto and Noto, so always finish the stack with sans-serif, serif or monospace.",
    ],
    [
      "Do webfonts work in email?",
      "Only in some clients. Apple Mail on macOS and iOS, Outlook for Mac, Samsung Email and Thunderbird render @font-face; Gmail on every platform, Outlook on Windows, Outlook.com, Yahoo Mail and AOL strip it. Plan the layout around the fallback family, not the webfont.",
    ],
    [
      "Why does my email show Times New Roman when I set a different font?",
      "The stack ran out of options. If none of the named families are installed and the stack does not end in a generic keyword, the client applies its own default, which is frequently a serif. Adding sans-serif to the end of the list fixes it.",
    ],
    [
      "How do I stop Outlook on Windows ignoring my font?",
      "Outlook 2016 through 365 on Windows renders with the Word engine, so it ignores @font-face and can drop unfamiliar families. Use an installed family, add an mso-font-alt style hint, and wrap Outlook-only overrides in a conditional comment.",
    ],
  ],
};

export default seo;
