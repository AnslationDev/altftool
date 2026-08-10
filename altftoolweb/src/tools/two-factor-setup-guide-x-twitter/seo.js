const seo = {
  title: "X (Twitter) 2FA Setup: Security Key, App or SMS",
  metaDescription:
    "Enable X two-factor authentication under Settings and privacy, Security and account access. SMS needs a paid plan; save the single backup code.",
  steps: [
    "Choose Security key, Authentication app or Text message (SMS), and tick the paid X subscription box — X has limited SMS 2FA to subscribers since 20 March 2023.",
    "Work down the Setup checklist, ticking each item; every step shows its Path, such as Settings and privacy, Security and account access, Security, plus a minute estimate.",
    "Watch the Account readiness score out of 100 as you save the single backup code, revoke connected apps and end old sessions, then press Copy result for what is still outstanding.",
  ],
  intro:
    "This guide takes you through switching on two-factor authentication for an X (formerly Twitter) account under Settings and privacy, Security and account access, Security, Two-factor authentication — and then scores what is still exposed. X offers three methods there: security key, authentication app and text message, with text message restricted to paid subscribers since March 2023. The checklist also covers the single backup code, password reset protect, old sessions and the connected apps that keep working after a password change.",
  useCases: [
    "Switch a free X account from no 2FA to an authentication app, since SMS is no longer offered without a subscription.",
    "Enrol a hardware security key on an account that posts on behalf of a brand or publication.",
    "Audit an account after a suspicious login alert: revoke connected apps, end unknown sessions and regenerate the backup code.",
    "Hand a contributor a plain checklist so they secure the shared account the same way every time.",
  ],
  benefits: [
    ["Reflects X's actual policy", "The text message option is gated behind a paid subscription, exactly as it is in the app."],
    ["Covers what 2FA misses", "Existing sessions and OAuth tokens from connected apps survive a password change — both are on the list."],
    ["Backup code front and centre", "X gives you one backup code, so the score stays capped until you have saved it."],
  ],
  faqs: [
    [
      "Why can't I use SMS two-factor authentication on X anymore?",
      "X limited text-message 2FA to paid subscribers from 20 March 2023. On a free account the toggle is unavailable and you must use the authentication app or a security key instead — both are free and both are stronger than SMS.",
    ],
    [
      "Where is two-factor authentication in X settings?",
      "Settings and privacy, then Security and account access, then Security, then Two-factor authentication. The same screen lists all three methods, and X lets you keep more than one enabled at the same time.",
    ],
    [
      "How many backup codes does X give you?",
      "One. X issues a single backup code, which you can regenerate from the Two-factor authentication screen whenever you want a fresh one. Store it in a password manager or on paper rather than as a screenshot on the phone that holds your authenticator app.",
    ],
    [
      "Does turning on 2FA log out people who already have access?",
      "No. Sessions that were already signed in stay signed in, and third-party apps keep working through their OAuth tokens. After enabling 2FA, go to Apps and sessions to log out of unknown devices and revoke connected apps you do not recognise. If you think the account was actually compromised, treat this as a starting point and contact X support.",
    ],
  ],
};

export default seo;
