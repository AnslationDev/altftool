/**
 * AI Scam Message Awareness Quiz — pure message bank and scoring.
 *
 * Scoring uses the standard binary-classification metrics so a learner sees the
 * difference between missing scams and crying wolf:
 *   recall (sensitivity)  = TP / (TP + FN)   share of scams caught
 *   specificity           = TN / (TN + FP)   share of genuine messages left alone
 *   precision             = TP / (TP + FP)
 *   balanced accuracy     = (recall + specificity) / 2
 * Balanced accuracy is used for the headline because the sample is deliberately
 * unbalanced: marking everything "scam" scores 100% recall but 50% balanced.
 *
 * Message texts are teaching examples. Domains and numbers are placeholders.
 */

export const RED_FLAGS = {
  urgency: "Manufactured urgency or a countdown",
  otp: "Asks for a one-time passcode or verification code",
  payment: "Pushes an irreversible payment method (gift cards, crypto, bank transfer)",
  domain: "Link domain does not match the organisation it claims to be",
  channel: "Contact arrives on an unexpected channel or from an unknown number",
  authority: "Impersonates a bank, tax office, police or senior colleague",
  secrecy: "Tells you not to discuss it with anyone",
  attachment: "Unexpected attachment or file request",
  toogood: "Payout, refund or job offer that is out of proportion to the effort",
  polish: "Fluent, personalised and error-free — AI removes the old typo tell",
};

/**
 * The bank. isScam is the ground truth; flags list what gives it away
 * (or, for genuine messages, what makes it look suspicious but is in fact fine).
 */
export const MESSAGES = [
  {
    id: "bank-otp",
    channel: "SMS",
    from: "+44 7700 900123",
    text:
      "Barclays Security: we blocked a £480.00 payment to LuxeTech Ltd on your account ending 4417. If this was not you, confirm by replying with the 6-digit code we just sent. Ignoring this message authorises the payment.",
    isScam: true,
    flags: ["otp", "urgency", "authority", "channel"],
    explanation:
      "No bank ever asks you to read back a one-time passcode — the code exists to stop exactly this. The threat that ignoring the message authorises the payment is manufactured urgency. Open the bank's own app instead.",
  },
  {
    id: "ceo-gift",
    channel: "Email",
    from: "m.reilly@company-payroll-hr.com",
    text:
      "Hi — I'm stuck in a board session and can't take calls. I need you to buy eight £100 gift vouchers for the client thank-you pack today and send me the codes. Keep this between us until the announcement. I'll approve the expense tonight. — Mark, CEO",
    isScam: true,
    flags: ["authority", "payment", "secrecy", "urgency", "domain"],
    explanation:
      "Classic business email compromise: senior authority, an unreachable sender, gift cards, and an instruction to keep quiet. The display name is right but the domain is a lookalike. Confirm any payment request on a channel you already had.",
  },
  {
    id: "delivery-fee",
    channel: "SMS",
    from: "+91 90000 11122",
    text:
      "Your parcel BD-88214 is held at the depot because the address is incomplete. Update your details and pay the ₹35 redelivery fee within 24 hours or the item returns to sender: delivery-status-verify.example",
    isScam: true,
    flags: ["urgency", "domain", "toogood", "channel"],
    explanation:
      "The tiny fee is the tell: it exists to harvest card details, not to collect ₹35. Couriers with a real delivery problem use the tracking number on their own site — go there directly rather than through the link.",
  },
  {
    id: "job-offer",
    channel: "WhatsApp",
    from: "+62 812 0000 4455",
    text:
      "Hello! I'm Grace from TalentBridge Recruitment. We reviewed your profile and can offer part-time remote work rating hotel listings: 40 minutes a day, USD 120-300 daily, paid after each task set. To begin, deposit USD 50 into the task wallet to unlock your first batch.",
    isScam: true,
    flags: ["toogood", "payment", "channel", "polish"],
    explanation:
      "A task scam. Pay is wildly out of proportion to the work, recruitment arrives cold on a messaging app, and real employers never ask you to fund a wallet to start work. Small early payouts are used to justify a larger deposit later.",
  },
  {
    id: "tax-refund",
    channel: "Email",
    from: "refunds@hmrc-taxservice-gov.example",
    text:
      "HM Revenue & Customs has calculated an overpayment of £284.60 for tax year 2024/25. Your refund is ready. Claims not submitted within 5 working days are cancelled and the balance is carried forward. Submit your bank details using the secure claim form attached.",
    isScam: true,
    flags: ["authority", "domain", "urgency", "attachment"],
    explanation:
      "Tax authorities do not announce refunds by email with an attached form, and genuine refunds do not expire in five days. The domain has government words in it but is not a government domain — read the part before the first single slash.",
  },
  {
    id: "romance-crypto",
    channel: "DM",
    from: "@alina.trades",
    text:
      "I've enjoyed our chats these months. My uncle runs a private mining desk and has opened a window for friends only — 6% weekly, withdraw any time. I put in my savings last year. I can walk you through the deposit tonight if you want in, but the window closes Friday.",
    isScam: true,
    flags: ["toogood", "payment", "urgency", "secrecy"],
    explanation:
      "A pig-butchering investment scam: a long, warm relationship, then a private opportunity with impossible returns and a deadline. 6% a week compounds to nearly 2,000% a year. The 'withdraw any time' promise fails at the moment you try.",
  },
  {
    id: "support-callback",
    channel: "Phone",
    from: "Voicemail",
    text:
      "This is Microsoft Support. Our systems detected malicious activity from your device and your Windows licence will be suspended. Call our technician on the number below and keep your computer switched on so we can install the repair tool remotely.",
    isScam: true,
    flags: ["authority", "urgency", "channel", "attachment"],
    explanation:
      "Operating-system vendors do not monitor consumer machines or call about licences. The goal is remote-access software, after which the caller controls the machine and the online banking session inside it.",
  },
  {
    id: "voice-clone-family",
    channel: "Phone",
    from: "Unknown number",
    text:
      "Mum, it's me — I've had an accident and I'm using someone else's phone. I need £900 for the deposit at the garage and I can't talk long. Please don't tell Dad yet, he'll panic. Can you transfer it now?",
    isScam: true,
    flags: ["urgency", "payment", "secrecy", "channel"],
    explanation:
      "Voice cloning needs only seconds of public audio, so a familiar voice is no longer evidence. Hang up and call the person on the number you already have, or use a family code word agreed in advance.",
  },
  {
    id: "genuine-2fa",
    channel: "SMS",
    from: "Short code",
    text:
      "725841 is your verification code. We will never ask you for this code. If you did not request it, someone may have your password — change it now.",
    isScam: false,
    flags: [],
    explanation:
      "Genuine. A code arriving with no accompanying request for you to send it anywhere is what a real 2FA message looks like. It is only dangerous if a separate caller or message asks you to read it out.",
  },
  {
    id: "genuine-invoice",
    channel: "Email",
    from: "billing@yourhostingprovider.com",
    text:
      "Your monthly invoice INV-20941 for £14.00 is available. No action is needed — the card ending 8802 will be charged on 3 August. You can view past invoices by signing in to your account at the usual address.",
    isScam: false,
    flags: [],
    explanation:
      "Genuine. It states no action is needed, does not create urgency, references a card you can confirm, and tells you to sign in the normal way rather than through a link. Verify by logging in independently if unsure.",
  },
  {
    id: "genuine-school",
    channel: "Email",
    from: "office@northgate.school.uk",
    text:
      "Reminder: the Year 8 trip consent form is due Friday. Forms can be returned in the school office or through the parent portal you already use. Payment, if you have not made it, is through the same portal — we never take card details by email or phone.",
    isScam: false,
    flags: [],
    explanation:
      "Genuine. It routes you to an existing account you already hold, offers an offline alternative, and states an anti-fraud policy rather than pressing for details.",
  },
  {
    id: "genuine-login-alert",
    channel: "Email",
    from: "security@yourmailprovider.com",
    text:
      "New sign-in to your account from Chrome on Windows, Pune, India, 21:14 IST. If this was you, no action is needed. If not, open your account's security settings from your bookmark and sign out of all devices.",
    isScam: false,
    flags: [],
    explanation:
      "Genuine in shape: it reports rather than demands, offers no link to click for the recovery step, and points you at your own bookmark. A fake version of this email would include a 'secure your account' button.",
  },
];

export const PASS_BALANCED_ACCURACY = 80; // percent

const pct = (value) => Math.round(value * 1000) / 10;

/**
 * Deterministic shuffle (mulberry32) so a seed reproduces a round exactly.
 */
function seededOrder(length, seed) {
  let state = (Math.floor(Math.abs(seed)) || 1) >>> 0;
  const rand = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const order = Array.from({ length }, (_, index) => index);
  for (let i = length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Returns the message bank in a deterministic order for the given seed. */
export function selectMessages(seed = 1, count = MESSAGES.length) {
  const total = MESSAGES.length;
  const wanted = Math.max(1, Math.min(total, Math.floor(count) || total));
  return seededOrder(total, seed)
    .slice(0, wanted)
    .map((index) => MESSAGES[index]);
}

/**
 * Scores a set of scam / genuine verdicts.
 * @param {Array} messages messages served
 * @param {Record<string, "scam"|"genuine">} verdicts
 */
export function scoreVerdicts(messages, verdicts = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: "No messages were served, so there is nothing to score." };
  }
  const rows = messages.map((message) => {
    const verdict = verdicts[message.id];
    const called = verdict === "scam" ? true : verdict === "genuine" ? false : null;
    return {
      message,
      verdict: verdict || null,
      answered: called !== null,
      correct: called !== null && called === message.isScam,
      falseAlarm: called === true && !message.isScam,
      missed: called === false && message.isScam,
    };
  });

  const answered = rows.filter((row) => row.answered);
  if (answered.length === 0) {
    return { error: "Mark at least one message as scam or genuine to see a score." };
  }

  const truePositive = answered.filter((row) => row.message.isScam && row.correct).length;
  const falseNegative = answered.filter((row) => row.missed).length;
  const trueNegative = answered.filter((row) => !row.message.isScam && row.correct).length;
  const falsePositive = answered.filter((row) => row.falseAlarm).length;

  const scamsSeen = truePositive + falseNegative;
  const genuineSeen = trueNegative + falsePositive;

  const recall = scamsSeen > 0 ? truePositive / scamsSeen : null;
  const specificity = genuineSeen > 0 ? trueNegative / genuineSeen : null;
  const precision =
    truePositive + falsePositive > 0 ? truePositive / (truePositive + falsePositive) : null;

  let balanced = null;
  if (recall !== null && specificity !== null) balanced = (recall + specificity) / 2;
  else if (recall !== null) balanced = recall;
  else if (specificity !== null) balanced = specificity;

  const accuracy = (truePositive + trueNegative) / answered.length;

  let verdictLabel = "Needs practice";
  const headline = balanced === null ? 0 : pct(balanced);
  if (headline >= 95) verdictLabel = "Hard to fool";
  else if (headline >= PASS_BALANCED_ACCURACY) verdictLabel = "Solid";
  else if (headline >= 60) verdictLabel = "Mixed";

  let advice = "Slow down and check each message against the red-flag list before deciding.";
  if (falseNegative > falsePositive) {
    advice =
      "You are missing scams more often than you over-flag. Watch for one-time codes, gift cards and any request that arrives with a deadline.";
  } else if (falsePositive > falseNegative) {
    advice =
      "You are over-flagging genuine messages. Real notifications inform without demanding action and send you to an account you already hold.";
  } else if (falseNegative === 0 && falsePositive === 0) {
    advice = "Clean sheet on everything you answered — no missed scams and no false alarms.";
  }

  const missedFlags = {};
  rows
    .filter((row) => row.missed)
    .forEach((row) => {
      row.message.flags.forEach((flag) => {
        missedFlags[flag] = (missedFlags[flag] || 0) + 1;
      });
    });
  const topMissedFlags = Object.entries(missedFlags)
    .sort((a, b) => b[1] - a[1])
    .map(([flag, count]) => ({ flag, label: RED_FLAGS[flag] || flag, count }));

  return {
    total: messages.length,
    answeredCount: answered.length,
    truePositive,
    falseNegative,
    trueNegative,
    falsePositive,
    recallPct: recall === null ? null : pct(recall),
    specificityPct: specificity === null ? null : pct(specificity),
    precisionPct: precision === null ? null : pct(precision),
    accuracyPct: pct(accuracy),
    balancedAccuracyPct: headline,
    passed: headline >= PASS_BALANCED_ACCURACY,
    verdictLabel,
    advice,
    topMissedFlags,
    rows,
  };
}
