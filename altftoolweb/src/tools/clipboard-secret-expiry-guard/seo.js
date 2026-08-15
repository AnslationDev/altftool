const seo = {
  title: "Clipboard Auto-Clear Timer for OTPs & Temp",
  metaDescription:
    "Copy an OTP or temporary password with a 10-second to 1-hour countdown that blanks the clipboard only if that exact value is still the one copied.",
  intro:
    "Clipboard Secret Expiry Guard copies a temporary value — an OTP, a recovery code, a one-off password — and starts a countdown of between 10 seconds and one hour, after which it reads the clipboard back and blanks it only if the exact same value is still there. That last check is the point: if you have copied something else in the meantime, your newer clipboard item is left alone. Before you copy, it also scans the text locally for six kinds of sensitive pattern, including API keys, labelled passwords, OTP codes, email addresses, phone-like numbers and card-like digit runs.",
  useCases: [
    "You are reading a one-time passcode out to a colleague and want it off your clipboard within the minute, rather than discovering it later when you paste into a chat window.",
    "You are handing a temporary password to a new starter and want the value cleared on a timer instead of relying on remembering to copy something else afterwards.",
    "You paste a config block into a form and want to know whether it still contains a token or an AWS-style key before it goes anywhere — the scan counts the matches without the text leaving the page.",
  ],
  benefits: [
    [
      "Clears only what it copied",
      "At expiry it compares the live clipboard against the exact string it wrote and overwrites only on an exact match, so a value you copied since is never destroyed.",
    ],
    [
      "Tells you when it could not act",
      "If the browser denies clipboard read or write permission, it says the system clipboard was not verified rather than claiming a clear that did not happen.",
    ],
    [
      "Flags what kind of secret it is",
      "The pre-copy scan recognises sk-/gh_/AKIA/xox- style keys, 'password:' or 'token=' labels, OTP phrasing with a 4-8 digit code, emails, phone-shaped numbers and 13-19 digit card-like runs.",
    ],
  ],
  faqs: [
    [
      "How long can the expiry timer be?",
      "Between 10 seconds and 3600 seconds (one hour), defaulting to 60 seconds. Anything you type outside that range is clamped to the nearest limit, and the countdown displays as mm:ss.",
    ],
    [
      "What happens if I copy something else before the timer runs out?",
      "Your newer clipboard content is left untouched. At expiry the tool reads the clipboard and, finding a value that does not match what it wrote, reports that a newer item was detected and clears only its own in-tab copy.",
    ],
    [
      "Does closing the tab still clear my clipboard?",
      "No. The timer runs in the page, so the tab must stay open for the clear to be attempted. This is a best-effort convenience, not a guarantee — treat it as a reminder mechanism rather than a security control.",
    ],
    [
      "Is the text I paste analysed on a server?",
      "No. Pattern matching runs in the page on up to 100,000 characters of your input, and nothing is uploaded. For anything genuinely long-lived, such as a real account password, use a password manager rather than the clipboard.",
    ],
  ],
};

export default seo;
