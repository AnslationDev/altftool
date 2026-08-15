const seo = {
  title: "Email Breach Response Checklist: 16 Weighted",
  metaDescription:
    "Score your response to a leaked email address across 16 weighted steps grouped by window — 24 hours, a week, a month, ongoing — and see what has slipped.",
  steps: [
    "Set \"Date you learned about the exposure\" — it cannot be later than today — so every step is measured against its 24-hour, one-week, one-month or ongoing window.",
    "Tick the 16 weighted steps across the four groups: Confirm the exposure, Reset passwords everywhere, Lock accounts with 2FA, and Watch for breach-themed phishing.",
    "Read the Response score with Steps completed, Critical steps still open and Steps past their window, then press \"Copy result\" for the plan of what is left.",
  ],
  intro:
    "The Email Data Breach Response Checklist scores your response to a leaked email address across 16 weighted steps, grouped by the window each one belongs in — first 24 hours, first week, first month, and ongoing. An email address is not just a contact detail; it is the username, and often the recovery contact, for every account tied to it, so the score is weighted towards the two things that actually close off access: resetting the email account and any reused password first, then locking the accounts it protects with a second factor. Enter the date you found out and the tool flags which steps have already slipped past their window.",
  useCases: [
    "Your address turned up in a breach-lookup service search and you want an ordered plan instead of resetting accounts at random.",
    "A company emailed you a breach notification and you need to work out which of your other accounts are actually at risk.",
    "You reused the same password across several sites and a leak involving one of them means all of them need attention.",
    "You are helping a family member respond to a breach notice and want a checklist that explains why each step matters.",
  ],
  benefits: [
    [
      "Ordered by window",
      "Every step carries a 24-hour, one-week, one-month or ongoing deadline, and overdue items are surfaced separately.",
    ],
    [
      "Weighted, not a flat list",
      "Resetting the email account and any reused password score far higher than phishing awareness, so effort lands on the steps that actually close off account access.",
    ],
    [
      "Nothing leaves the browser",
      "The email address itself is never entered — you tick steps, and the tool stores no personal data at all.",
    ],
  ],
  faqs: [
    [
      "How do I check if my email address was in a data breach?",
      "Search it at a reputable breach-lookup service such as Have I Been Pwned. It lists which known breaches include the address and, where the service shows it, which data types were part of each one — that list decides how far the rest of the response needs to go.",
    ],
    [
      "Which password should I reset first after an email breach?",
      "The email account itself, before any other account. It can approve password resets for almost everything else you own, so leaving its old password in place undoes the value of resetting the accounts that come after it.",
    ],
    [
      "Is SMS two-factor authentication good enough after a breach?",
      "It is better than no second factor, but an authenticator app or a passkey is stronger. SMS codes can be intercepted through SIM-swap fraud, which becomes easier once an attacker already has your email and phone number from the same leak.",
    ],
    [
      "Why do breach notices attract more phishing afterward?",
      "Because a public breach gives scammers a real company name and date to cite, which makes a fake follow-up message far more convincing than generic phishing. Type the site's address in directly rather than clicking a link in any message that references the breach, and never read a one-time code to someone who calls you.",
    ],
  ],
};

export default seo;
