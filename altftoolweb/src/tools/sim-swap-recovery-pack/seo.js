const seo = {
  title: "SIM Swap Recovery Checklist: 24 Actions, 5",
  metaDescription:
    "Orders 24 recovery actions across carrier, bank, email, sessions and evidence. No phone number, account name or secret is ever entered.",
  steps: [
    "Tick what you noticed under What did you observe? and the categories under Which account groups may be linked? - no phone number or account name is asked for.",
    "Work down Your prioritised recovery order, carrier and SIM control first, then bank, email and sessions, ticking off each of the 24 actions.",
    "Mark saved items under Evidence preserved outside this tool, then press Download counts for a sim-swap-recovery-counts-YYYY-MM-DD.txt file holding totals only.",
  ],
  intro:
    "The SIM Swap Recovery Pack turns what you are seeing — sudden loss of mobile service, an unrequested SIM or eSIM notice, sign-in codes that stopped arriving — into an ordered recovery checklist across five domains: carrier and SIM control first, then bank and payment, primary email, account sessions, with evidence preservation running throughout. You tick the symptoms you observed and the account types tied to that number, and it prioritises 24 recovery actions accordingly. It asks for no phone number, no account name and no secret of any kind, and the only file it produces is a counts-only summary.",
  useCases: [
    "Your phone drops to no service in a place it always works, and rather than guessing, you work through the carrier steps first because that is where control is actually lost.",
    "You get an email about a SIM replacement you never requested and need to know whether to call the bank or secure your inbox first — the checklist orders both against what you have selected.",
    "Someone helping a relative after a suspected swap wants a written record of what has and has not been done, without that file containing the relative's number or account details.",
  ],
  benefits: [
    ["An order, not a wall of advice", "Carrier control comes before banking, email before session review, because a recovery email sent while the attacker still controls the SIM lands with them."],
    ["Nothing identifying is ever entered", "There is no field for a phone number, account name, OTP or password, so nothing sensitive exists in the page to leak or be recovered."],
    ["The export carries counts only", "The downloadable summary records how many of the 24 actions and 7 evidence types you completed — never which symptoms you selected or what the evidence contained."],
  ],
  faqs: [
    [
      "What should I do first if I think my SIM has been swapped?",
      "Contact your mobile operator through a number or app you looked up yourself — never a number from the suspicious message — and ask whether a SIM, eSIM, replacement or port request was made on your connection. Until the connection is back under your control, every SMS-based reset works in the attacker's favour.",
    ],
    [
      "Does this tool check whether my SIM was actually swapped?",
      "No. It performs no lookup, contacts no operator, reads nothing from your device and cannot confirm or rule out a swap — only your operator can. It is an organiser for the steps you take yourself, covering 5 domains and 24 actions.",
    ],
    [
      "Why does it tell me to review active sessions if my SIM is already secured?",
      "Because messaging, social and cloud sessions already signed in on other devices can keep working after the SIM changes hands — a restored connection does not log them out. That is why session review is its own domain, done after the email account is secured.",
    ],
    [
      "Is any of this a legal or official report?",
      "No. This is general information and an organiser, not legal advice, proof of a SIM swap, or a submitted complaint. Reporting goes through your operator, your bank's own reporting process and your national cybercrime authority — and if money has moved, notify the bank promptly, since customer-protection rules generally turn on how quickly you report.",
    ],
  ],
};

export default seo;
