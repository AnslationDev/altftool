const seo = {
  title: "Instagram 2FA Setup Guide: 13-Step Hardening Checklist",
  metaDescription:
    "Work through 13 Instagram security controls: authenticator 2FA, backup codes, session cleanup, each with its exact menu path and a weighted score.",
  steps: [
    "Tick off the 13 controls you have completed, from 'Use a password that is unique to Instagram' to signing out old sessions; each card shows its exact path, such as Accounts Center -> Password and security.",
    "Watch the Hardening score: it stays capped at 69% until all four Critical controls (unique password, recovery contact details, authenticator-app 2FA, backup codes) are done.",
    "Work through the 'Next best actions' panel, which ranks the three highest-weight remaining controls, then press Copy result for a plain-text summary of your score.",
  ],
  intro:
    "This Instagram 2FA setup guide is a browser-side hardening checklist for accounts that need protection from password leaks, SIM swaps, phishing DMs, connected-app abuse and forgotten sessions. It scores the controls that matter most: unique password, current recovery details, authenticator-app 2FA, backup codes, SMS removal, login alerts, session cleanup and linked-account review.",
  useCases: [
    "Securing a creator, business or personal Instagram account before it grows valuable.",
    "Moving away from SMS-only login codes after a SIM-swap scare or phone-number change.",
    "Cleaning up old logged-in devices and connected giveaway or analytics apps.",
    "Helping a family member set up Instagram 2FA without asking them for their password or codes.",
  ],
  benefits: [
    [
      "No account connection",
      "The tool does not call Instagram or Meta APIs; it only tracks local checklist ticks in the browser.",
    ],
    [
      "Recovery-safe order",
      "It prioritises recovery contact details and backup codes before suggesting SMS removal or session cleanup.",
    ],
    [
      "Risk-weighted score",
      "Critical controls cap the score until completed, so privacy tweaks cannot hide an open takeover path.",
    ],
  ],
  faqs: [
    [
      "Is an authenticator app safer than SMS for Instagram?",
      "Yes. SMS can be weakened by SIM swap or number-port attacks, while authenticator app codes are generated on your own device.",
    ],
    [
      "Should I remove SMS from Instagram after enabling 2FA?",
      "Only after you have confirmed authenticator-app 2FA works and saved backup codes somewhere safe. Removing SMS too early can cause lockout.",
    ],
    [
      "Does Instagram offer passkeys everywhere?",
      "Availability can vary by account, region and device. If the passkey option appears in Accounts Center, adding one gives a stronger phishing-resistant login path.",
    ],
    [
      "Does this tool store my Instagram backup codes?",
      "No. Do not enter backup codes here. Store them in a password manager or offline safe place.",
    ],
  ],
};

export default seo;
