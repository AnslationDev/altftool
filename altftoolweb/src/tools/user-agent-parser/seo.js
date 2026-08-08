const seo = {
  title: "User Agent Parser: Browser, OS, Engine and Device",
  metaDescription:
    "Break a User-Agent string into browser, engine, OS, device and CPU. Edge and Opera are matched before Chrome, and the frozen version tokens are flagged.",
  steps: [
    "Paste the header into the User-Agent string box, press Use my browser to fill in your own, or pick an entry from the Load a sample list.",
    "Matching runs most specific first, so Chromium forks such as Edg and OPR are identified before the Chrome token and Safari is tested last.",
    "Read the Detected browser panel and its rows — Rendering engine, OS version, Device type, CPU architecture, Automated client — then press Copy result.",
  ],
  intro:
    "The User Agent Parser splits a User-Agent header into its real components — browser and version, rendering engine, operating system, device class and CPU architecture. The User-Agent field is defined in RFC 9110 as a list of product tokens, but every browser copies fragments of every other browser's tokens for compatibility, so parsing has to be ordered from most specific to least: Chromium forks such as Edg and OPR are matched before Chrome, and Safari is matched last because almost everyone claims it. It is for developers reading analytics logs, debugging device-specific bugs, or checking what their own browser is announcing.",
  useCases: [
    "Work out why a server log entry containing both 'Chrome' and 'Safari' is actually Microsoft Edge.",
    "Confirm whether a suspicious request in an access log is Googlebot or something imitating it.",
    "Check the exact iOS version a bug report came from before trying to reproduce it.",
  ],
  benefits: [
    ["Ordered, not naive matching", "Edge, Opera, Samsung Internet and Vivaldi are identified before the Chrome token they all contain."],
    ["Flags the known lies", "Warns where Windows 11 reports as Windows 10 and where macOS is frozen at 10_15_7."],
    ["Bots and scripts detected", "Separates crawlers such as Googlebot and clients such as curl from real browsers."],
  ],
  faqs: [
    [
      "Why does every browser's User-Agent contain the word Mozilla?",
      "Because browsers copied Netscape's 'Mozilla/5.0' prefix in the 1990s to pass server-side capability checks, and removing it would break sites that still sniff for it. It carries no information today — every mainstream browser sends it.",
    ],
    [
      "Can a User-Agent string tell Windows 10 from Windows 11?",
      "No. Both send 'Windows NT 10.0', and Microsoft never bumped the token for Windows 11. Only the Sec-CH-UA-Platform-Version client hint, which reports 13.0.0 or higher for Windows 11, can distinguish them.",
    ],
    [
      "Why does the macOS version always show as 10.15.7?",
      "Chrome and Safari have frozen the macOS version reported in the User-Agent at 10_15_7 since 2021 as an anti-fingerprinting measure, so the string cannot tell you whether the machine runs Big Sur, Ventura or Sequoia.",
    ],
    [
      "Is the User-Agent string reliable for detecting a device?",
      "Only loosely. It is trivially editable, browsers deliberately freeze parts of it, and iPadOS 13 and later report as 'Macintosh' in desktop mode. Use feature detection for behaviour and treat the User-Agent as a hint for analytics rather than a fact.",
    ],
  ],
};

export default seo;
