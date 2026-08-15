const seo = {
  title: "Electricity Disconnection SMS Scam: Paste and Score",
  metaDescription:
    "Why the power-cut-tonight SMS has no consumer number, and where the AnyDesk and UPI-PIN steps lead. Paste a message to score it on 13 markers locally.",
  steps: [
    "Paste the SMS, email or WhatsApp message into the scanner; defanged forms like bad[.]top and hxxp:// are read as written.",
    "Read the Risk score with Points from the wording and Points from the links.",
    "Check Markers matched and Strongest link problem, then press Copy result.",
  ],
  intro:
    "This explainer dissects the electricity disconnection scam — the evening SMS saying your power will be cut at a named hour because \"last month's bill was not updated\" — and shows why the missing consumer number is the giveaway. It follows the funnel to its real endgame: a call to a personal mobile, a screen-sharing app installed to \"update the bill\", and a small test payment that asks for your UPI PIN. A scanner scores anything you paste against 13 weighted markers and inspects each link's registrable domain.",
  useCases: [
    "Check an evening disconnection SMS before calling the number in it or paying anything.",
    "Show an older relative why no lineman needs AnyDesk or QuickSupport installed on their phone.",
    "Confirm whether a bill-payment link belongs to your distribution company or to a lookalike domain.",
    "Brief a housing society or shop owners' group on the version circulating in their area.",
  ],
  benefits: [
    [
      "Points at the missing detail",
      "The scanner flags a bill message that never quotes a consumer number, CA number or exact amount — the one thing a genuine discom message always has.",
    ],
    [
      "Weights the takeover step",
      "Screen-share requests and UPI-PIN prompts score highest, because those are the steps that move money rather than just collect data.",
    ],
    [
      "Runs locally",
      "Every rule executes in your browser, so a message you are unsure about is never uploaded.",
    ],
  ],
  faqs: [
    [
      "Is the electricity disconnection SMS real?",
      "No, when it arrives from a personal mobile number, quotes no consumer number and threatens a cut the same night. Genuine disconnection follows a printed notice with a due date, and discom messages always carry your consumer or CA number and the exact amount due.",
    ],
    [
      "What number should I call to check my electricity bill?",
      "The toll-free number printed on your own bill, or 1912, which reaches the electricity complaint line in most Indian states. Never call the number given inside the message — making you dial it is the entire purpose of the SMS.",
    ],
    [
      "Why does the caller want me to install AnyDesk or QuickSupport?",
      "Because those apps share your screen and let the caller watch incoming SMS in real time, including OTPs, while they talk you through opening your banking app. Nothing about a utility bill is ever fixed from inside your phone.",
    ],
    [
      "Is a Rs.10 test payment to verify the meter safe?",
      "No. A UPI PIN is only ever needed to send money, never to verify a meter or a connection, and the collect request you approve can carry any amount regardless of what the screen shows. Pay actual dues through your discom's own app or any BBPS-enabled app; this page is general security education, not legal or financial advice.",
    ],
  ],
};

export default seo;
