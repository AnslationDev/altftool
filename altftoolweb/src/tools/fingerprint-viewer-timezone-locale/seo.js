const seo = {
  title: "Timezone and Locale Fingerprint: What Sites See",
  metaDescription:
    "See the IANA timezone, live UTC offset, language list and number formats any page reads with no prompt, and whether a VPN contradicts them.",
  steps: [
    "Leave Signals to analyse on This browser (live), or switch to a Compare profile to model another location.",
    "Press Re-read to recompute today's UTC offset, the daylight-saving shift and the Timezone vs language region check.",
    "Look for the signal rows badged Distinctive rather than Common, then press Copy report.",
  ],
  intro:
    "Timezone and Locale Fingerprint Viewer shows the location and language signals a website reads with no permission prompt: your IANA timezone, the UTC offset on today's date, whether that zone observes daylight saving, your ordered language list, and the calendar, numbering system and separators your locale resolves to. Offsets are calculated by formatting one instant in the zone and differencing it against UTC, so the value is the real current offset rather than a stored table. It also compares the timezone's country against the region in your language tag, the disagreement that a VPN typically produces.",
  useCases: [
    "Check whether a VPN or proxy leaves your timezone and language pointing at a different country than your IP address.",
    "See how much a rare UTC offset such as +05:45 or +12:45 narrows down where you are.",
    "Confirm what Accept-Language actually sends before adjusting your browser's language list.",
    "Show a team or classroom which locale details leak from Intl.DateTimeFormat().resolvedOptions().",
  ],
  benefits: [
    [
      "Real offset, computed live",
      "The offset is derived from the zone on the current date, so daylight saving is reflected instead of assumed.",
    ],
    [
      "Consistency check",
      "Flags when the timezone's country and the language tag's region disagree — the classic VPN tell.",
    ],
    [
      "Formatting made concrete",
      "Shows the same date and number rendered by your own locale, including the decimal and grouping marks.",
    ],
  ],
  faqs: [
    [
      "Can a website detect my timezone without permission?",
      "Yes. Intl.DateTimeFormat().resolvedOptions().timeZone returns your IANA zone name, such as Asia/Kolkata, to any script with no prompt. Date.getTimezoneOffset() gives the numeric offset just as freely.",
    ],
    [
      "Does a VPN hide my timezone?",
      "No. A VPN changes the IP address a site sees, but the timezone, language list and locale formatting still come from your device, so the two can point at different countries. Some privacy browsers spoof the timezone to UTC to close that gap.",
    ],
    [
      "Why is a UTC+05:45 offset such a strong signal?",
      "Only three zones in the IANA database use a 45-minute offset — Nepal at +05:45, the Chatham Islands at +12:45 and Australia/Eucla at +08:45 — so the minute component alone places you in a very small group. Half-hour offsets like India's +05:30 narrow the field less sharply but still considerably.",
    ],
    [
      "Is my language list sent even if I block scripts?",
      "Yes. Browsers send the language list as the Accept-Language HTTP header on every request, so its content and order reach the server without any JavaScript running. Trimming the list in browser settings is what changes it.",
    ],
  ],
};

export default seo;
