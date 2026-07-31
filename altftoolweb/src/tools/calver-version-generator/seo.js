const seo = {
  intro:
    "This generator turns a release date into a Calendar Versioning (CalVer) number using the token scheme defined at calver.org — YYYY, YY, 0Y, MM, 0M, WW, 0W, DD, 0D plus MINOR, MICRO and MODIFIER — so YYYY.MM.MICRO on a July 2026 release yields 2026.7.0. It is built for release managers choosing or applying a date-based scheme, and previews what the next six monthly releases will be numbered. Presets cover well-known schemes such as Ubuntu's YY.0M (24.04 = April 2024) and JetBrains' YYYY.MINOR.",
  useCases: [
    "Picking between YYYY.MM.MICRO and YY.0M for a new internal platform and seeing a six-month release timeline for each",
    "Computing the correct Ubuntu-style version (YY.0M) for an April release without off-by-one padding mistakes",
    "Generating a week-numbered YYYY.WW build identifier for a product that ships weekly",
  ],
  benefits: [
    ["Full calver.org token set", "Handles padded and unpadded year, month, week and day tokens plus MINOR, MICRO and MODIFIER."],
    ["Timeline preview", "Shows the version each of the next six monthly releases would receive, rolling year boundaries correctly."],
    ["Real calendar validation", "Rejects impossible dates like 30 February and handles leap years when counting days and weeks."],
  ],
  faqs: [
    [
      "What is CalVer and how is it different from SemVer?",
      "CalVer (Calendar Versioning) encodes the release date into the version number — Ubuntu 24.04 means April 2024 — while SemVer encodes API compatibility (major.minor.patch). CalVer suits time-based release trains and products without a programmatic API; SemVer suits libraries whose consumers need to know whether an upgrade can break them.",
    ],
    [
      "What does YY mean in a CalVer scheme like YY.0M?",
      "YY is the short year: the full year minus 2000, without padding, so 2026 becomes 26 and 2106 becomes 106. 0Y is the same value zero-padded to two digits (06 for 2006). The month tokens work the same way: MM is unpadded (4) and 0M is padded (04), which is why Ubuntu's April 2024 release is 24.04.",
    ],
    [
      "What are MICRO and MODIFIER in CalVer?",
      "MICRO is a plain counter for releases within the same date period — the third fix released in July 2026 under YYYY.MM.MICRO is 2026.7.3 — and it conventionally resets to 0 when the date segment rolls over. MODIFIER is an optional trailing tag such as beta1 or rc2 for pre-releases.",
    ],
    [
      "Which projects use calendar versioning?",
      "Ubuntu (YY.0M, e.g. 24.04), JetBrains IDEs (YYYY.MINOR, e.g. 2026.1), and Python's pip and pytz have used CalVer-style schemes. It is popular for operating systems, SaaS platforms and data products where 'how old is this?' matters more than 'is this API-compatible?'.",
    ],
  ],
};

export default seo;
