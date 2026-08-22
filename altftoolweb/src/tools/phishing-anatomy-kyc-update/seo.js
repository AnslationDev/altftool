const seo = {
  title: "KYC Expiry Scam SMS: Anatomy & 13-Marker Scanner",
  metaDescription:
    "Line-by-line teardown of the KYC-expiry scam SMS, plus a scanner scoring anything you paste on 13 weighted markers and each link's registrable domain.",
  steps: [
    "Paste the SMS, email or WhatsApp message into the Scan a message box — defanged addresses such as bad[.]xyz and hxxp:// are read as written, and you should never paste your own Aadhaar, PAN, OTP or UPI PIN.",
    "The Risk score and its band update as you type, splitting Points from the wording and Points from the links across 13 weighted markers, with screen-sharing and UPI-PIN requests carrying the heaviest weights.",
    "Read What matched, and why it matters, The links in that message and The specimen, line by line, then press Copy result, or Reset to restore the specimen message.",
  ],
  intro:
    "This explainer dissects the KYC-expiry scam message — \"your KYC has expired as per RBI guidelines, the account will be blocked today\" — and names the pressure tactic in each line, including the two endings that actually take the money: a screen-sharing app installed for \"assisted KYC\", and a one-rupee verification approved with your UPI PIN. A scanner scores anything you paste against 13 weighted markers of the same family and inspects every link's registrable domain. Periodic KYC updation is a genuine RBI requirement, which is exactly why this pretext works.",
  useCases: [
    "Check a same-day KYC deadline message before installing anything or calling the number in it.",
    "Show a parent why the \"Rs.1 verification transaction\" that needs a UPI PIN is a payment instruction, not a check.",
    "Test whether a KYC form link belongs to your bank or to a lookalike domain or a public form service.",
    "Give branch or wallet support staff a concrete list of the markers customers report.",
  ],
  benefits: [
    [
      "Names the real rule",
      "Sets the scam against how periodic KYC updation actually works under the RBI Master Direction, so the pretext falls apart on its own terms.",
    ],
    [
      "Catches the takeover step",
      "Screen-sharing requests and UPI-PIN prompts carry the highest weights, because those are the steps that move money rather than just collect data.",
    ],
    [
      "Runs locally",
      "Every rule executes in your browser; a message you are unsure about is never uploaded.",
    ],
  ],
  faqs: [
    [
      "Does RBI send KYC update messages to customers?",
      "No. The Reserve Bank of India holds no individual accounts and never contacts customers about their KYC. Periodic updation is your own bank's obligation, and any message invoking RBI to demand action within hours is a scam.",
    ],
    [
      "How often does bank KYC actually need updating?",
      "Under the RBI Master Direction on KYC, periodic updation runs at least every two years for high-risk customers, every eight years for medium risk and every ten years for low risk. Where none of your details have changed, banks may accept a self-declaration of no change through registered email, registered mobile, ATM, net banking or the branch.",
    ],
    [
      "Why do KYC scammers ask you to install AnyDesk or QuickSupport?",
      "Because the nine-digit code those apps display is a session key. Once it is shared, the caller sees your screen and incoming SMS in real time and can operate your banking app while talking you through a form, which is why it is the most common ending of this scam.",
    ],
    [
      "Is a Rs.1 verification transaction safe?",
      "No. A UPI PIN is only ever required to send money — never to receive it or to verify an account — and the collect request you approve can carry any amount. Treat any request to enter a UPI PIN for a check, refund or verification as an attempt to take money, and confirm anything KYC-related with your bank directly.",
    ],
  ],
};

export default seo;
